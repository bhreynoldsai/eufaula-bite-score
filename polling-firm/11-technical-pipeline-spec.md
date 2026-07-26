# 11 — Technical Pipeline Spec (Build-Ready)

A build-ready design your senior quant / data engineer can execute from. Deepens
[04-technical-architecture.md](./04-technical-architecture.md) into concrete
schemas, module interfaces, the MRP model spec, and the dynamic-sampling
algorithm. Target: one poll goes **field close → weight → MRP → crosstabs →
dashboard** with minimal manual touch, and every interview permanently sharpens
the next model.

> Stack is open-source-first: **R** (`survey`, `anesrake`, Stan/`brms`/`mrpkit`),
> **Python** (glue, `xgboost`), a cloud **warehouse** (BigQuery/Snowflake), **dbt**
> + an orchestrator, and **Shiny/Streamlit** dashboards. AI assist per
> [09-ai-model-selection.md](./09-ai-model-selection.md).

---

## 1. Data model (the flywheel foundation — design Week 2)

Everything is keyed to a stable **`voter_id`** from the voter file. This is what
makes individual-level modeling and the compounding flywheel possible.

### Core tables

```
frame_voters            -- the sampling universe (from L2 → i360/DataTrust)
  voter_id            PK  (stable across refreshes)
  state, county, cd, sd, hd, precinct, dma
  age, gender, race_modeled, education_modeled
  party, turnout_score, partisanship_score
  phone_cell, phone_landline, email        (append; nullable)
  file_vendor, file_refresh_date

samples                 -- one row per poll's drawn sample
  sample_id           PK
  poll_id             FK
  voter_id            FK -> frame_voters
  stratum_id
  assigned_modes      (array: sms, ivr, panel, live)
  draw_ts

dispositions            -- contact attempts (feeds response-rate + dynamic sampling)
  disposition_id      PK
  sample_id           FK
  mode
  status              (sent, delivered, opened, started, completed, refused, bounce, opt_out)
  attempt_ts

responses               -- THE FLYWHEEL: every interview, forever
  response_id         PK
  voter_id            FK -> frame_voters   (individual-level linkage)
  poll_id             FK
  mode
  raw_answers         JSON (question_id -> value)
  field_ts
  quality_flags       (array: speeder, straightliner, dup_device, failed_attention)

polls                   -- metadata per poll
  poll_id             PK
  name, client, geography, field_start, field_end
  questionnaire_id, mode_plan, target_n

weights                 -- computed weights, versioned (reproducibility)
  response_id         FK
  weight_scheme_id
  weight_value
  computed_ts

estimates               -- MRP + topline outputs, versioned
  estimate_id         PK
  poll_id             FK
  geography_level     (national, state, cd, subgroup)
  geography_id
  quantity            (e.g., cand_support, issue_favor)
  point, ci_low, ci_high
  model_version, computed_ts
```

**Flywheel rule:** `responses` is append-only and never purged (subject to opt-out
honoring). Because Catalist is closed to Republicans and DataTrust/i360 are
party-gated, this accumulating, voter-id-keyed corpus is the firm's compounding
moat. Opt-outs are honored by flagging `voter_id`, not by deleting history.

---

## 2. Pipeline stages & module interfaces

Each stage is an idempotent, versioned job. Signatures are language-agnostic
(implement in R/Python).

### Stage A — `draw_sample(poll_id, mode_plan, strata) -> sample_id`
- Pulls a stratified PPS sample from `frame_voters`; writes `samples`.
- Emits the **poststratification target table** for this geography (age × race ×
  education × region × party × turnout) from the frame itself.

### Stage B — `field(sample_id) -> dispositions[]`
- Dispatches to RumbleUp (SMS), CallFire (IVR), Cint/Dynata (panel), keyed with
  `voter_id` in the survey URL. Writes `dispositions` and `responses`.
- Runs continuously; feeds Stage C.

### Stage C — `dynamic_sampler(poll_id)` (loop, every 30–60 min while fielding)
See §4 for the algorithm. Reads live `dispositions`/`responses`, compares to the
target frame, and reallocates SMS/ad/panel effort toward underfilled cells.

### Stage D — `weight(poll_id, scheme) -> weights[]`
- Rake (`anesrake`) to targets: **age, race, gender, region, education, recalled
  past vote, party**. Writes versioned `weights`.
- Emits diagnostics: max weight, design effect, effective N.

### Stage E — `likely_voter(poll_id) -> turnout_prob[]`
- Probabilistic turnout model (`ranger`/`xgboost`) on survey + voter-file features.
  Output is a per-response probability, used to weight (not a hard screen).

### Stage F — `mrp(poll_id, geography_level) -> estimates[]`
See §3 for the model. Fits the multilevel model, poststratifies against the
Stage-A frame table, writes versioned `estimates` with credible intervals.

### Stage G — `diagnostics_gate(poll_id) -> pass|fail`
Hard gate before any delivery (see §5). Fails the run if the sample is broken.

### Stage H — `deliver(poll_id) -> dashboard_url, methodology_sheet`
- Auto-crosstabs + Shiny/Streamlit dashboard; auto-generated methodology sheet for
  the transparency protocol.

### Orchestration
- **dbt** for warehouse transforms; **Airflow/Dagster** (or scheduled jobs) chains
  A→H. Stage C runs on its own timer during the field window.

---

## 3. MRP model spec

**Goal:** state/district/subgroup estimates from the pooled sample.

**Outcome:** candidate support / issue position (categorical or binary).

**Model (multilevel logistic; Stan via `brms`):**

```
y_i ~ Bernoulli(p_i)
logit(p_i) = α
           + β·(individual fixed effects: education, age band, gender)
           + u_state[state_i]           (varying intercept)
           + u_cd[cd_i]                  (varying intercept, nested in state)
           + u_race[race_i]
           + u_party[party_i]
           + γ·(geographic predictors: prior R two-party %, urbanicity, DMA)
u_* ~ Normal(0, σ_*)      (partial pooling shrinks noisy small cells)
```

**Poststratification:** predict `p` for every cell in the Stage-A target table
(built from the voter file), then aggregate weighted by cell population to the
requested geography.

**Covariate discipline:** MRP is only as good as its geographic predictors and
poststrat frame. Include validated prior-vote and urbanicity; document every
covariate. Where opinion varies more *within* than *across* geographies, flag
lower confidence.

**Uncertainty:** report posterior credible intervals; never a bare point estimate.

**Pooling of the flywheel:** for standing/tracking estimates, pool historical
`responses` into the model (down-weighted by recency) — this is the Blue Rose /
Change Research "continuous large sample" pattern that makes small districts
estimable.

---

## 4. Dynamic Sampling Engine algorithm

The Change-Research-style module that keeps the raw sample representative and cuts
fielding cost.

```
INPUT:  target frame cell proportions T[cell]   (from Stage A)
        live completed-response counts N[cell]  (from responses)
        remaining field budget B (sms segments / ad $ / panel quota)

LOOP every 30–60 min while field window open:
  1. current[cell] = N[cell] / sum(N)
  2. deficit[cell] = max(0, T[cell] - current[cell])
  3. if sum(deficit) < tolerance:  hold  (sample is balanced)
  4. else:
       allocate next tranche of B proportional to deficit[cell],
       preferring the cheapest mode that reaches that cell
       (SMS for young/cell-only; IVR for older/landline; panel for
        hard-to-reach)
  5. update targeting lists; dispatch via Stage B
  6. log allocation (for the methodology sheet + audit)

STOP when target_n reached AND max deficit < tolerance, or field window closes.
```

- **MVP:** the rules engine above.
- **v2 (post-launch):** replace step 4 with an optimizer that minimizes expected
  cost to close all deficits given per-mode per-cell response rates learned from
  the flywheel.

---

## 5. Diagnostics gate (hard stop before delivery)

`diagnostics_gate` fails the run — number does not ship — if any trip:

| Check | Fail condition (tune per poll) |
|---|---|
| Cell coverage | Any target cell below X% of its proportional expectation *before* weighting |
| Max weight | Any single weight above cap (e.g. > 5×) |
| Design effect / effective N | Effective N below floor (e.g. < 65% of raw N) |
| Fraud/attention | Opt-in online fraud/attention-fail rate above threshold |
| Speeder/straightliner | Above threshold after screening |
| Duplicate device | Detected duplicates above threshold |

**On fail:** the rule is *fix contact, not weights* — re-field the deficient cells
via the dynamic sampler rather than weighting over a skew. A model never rescues a
biased sample.

---

## 6. Reproducibility & audit

- Every `weights` and `estimates` row carries a `*_version` and `computed_ts`.
- Pipeline code is versioned; any published number is regenerable on demand from
  raw `responses` + the pinned model version — required by the transparency
  protocol ([03-house-methodology.md](./03-house-methodology.md) §8).
- The auto-generated methodology sheet records: modes, field dates, sample frame,
  weighting scheme, effective N, MoE/credible interval, and question wording.

---

## 7. AI-assist touchpoints (upstream only)

Per [09-ai-model-selection.md](./09-ai-model-selection.md):

| Touchpoint | Model | Notes |
|---|---|---|
| Questionnaire drafting / review | Opus 5 | Low volume, high judgment |
| Open-end / verbatim coding | Haiku 4.5 + **Batch API** | High volume — where spend concentrates |
| Report narrative first-draft | Sonnet 5 (Opus 5 for flagship public polls) | Human edits before release |
| Pipeline glue / codegen assist | Sonnet 5 | Dev-time only |

**Never** an AI model in Stages D–F output path. AI does not produce published
estimates.

---

## 8. Build order (maps to Week 3 of the launch plan)

1. Warehouse + schema (§1) — Week 2 foundation.
2. Stages A, D, F (draw → weight → MRP) + the diagnostics gate (§5).
3. Stage H dashboard template.
4. Stage C dynamic sampler MVP (§4 rules engine).
5. **End-to-end dry run** against a known recent election result; confirm the
   pipeline reproduces the actual outcome within expected error before launch.

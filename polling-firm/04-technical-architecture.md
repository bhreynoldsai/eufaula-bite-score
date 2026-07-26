# 04 — Technical Architecture

Build-ready system design for a low-headcount, high-automation polling firm. The
goal: a pipeline where a poll goes from **field close → weighting → MRP → crosstabs
→ client dashboard** with minimal manual touch, and where every interview
permanently sharpens the next model.

---

## System overview

```
                    ┌─────────────────────────────────────────────┐
                    │              VOTER FILE (frame)              │
                    │        L2 → i360 / DataTrust (append)        │
                    └───────────────┬─────────────────────────────┘
                                    │ sample draw + poststrat table
                                    ▼
   ┌──────────────┐        ┌─────────────────────┐        ┌────────────────────┐
   │  DYNAMIC     │◀──────▶│   FIELD / CONTACT    │        │   SURVEY ENGINE     │
   │  SAMPLING    │ steers │  P2P SMS (RumbleUp)  │───────▶│ Alchemer/Qualtrics  │
   │  ENGINE      │  spend │  IVR (CallFire)      │        │ (voter-ID embedded) │
   │ (fills cells │        │  Panel (Cint/Dynata) │        └─────────┬───────────┘
   │  in realtime)│        └─────────────────────┘                  │ responses
   └──────────────┘                                                 ▼
                                    ┌────────────────────────────────────────────┐
                                    │   DATA WAREHOUSE (BigQuery / Snowflake)      │
                                    │   raw responses • dispositions • sample      │
                                    │   ▶▶ THE DATA FLYWHEEL: every interview,     │
                                    │      forever, keyed to voter-file IDs        │
                                    └───────────────┬──────────────────────────────┘
                                                    │ dbt transforms
                                                    ▼
   ┌──────────────────────────────────────────────────────────────────────────────┐
   │  MODELING CORE (R + Python + Stan)                                             │
   │  • Weighting: survey / anesrake  (education, past-vote, party, geo)            │
   │  • Turnout & vote-choice: random forest / GBM (probabilistic LV)              │
   │  • MRP: brms / rstanarm / mrpkit → state / district / subgroup estimates       │
   │  • Diagnostics: design effect, effective N, cell coverage, fraud screens       │
   └───────────────┬──────────────────────────────────────────────────────────────┘
                    │ estimates + crosstabs
                    ▼
   ┌──────────────────────────────────────────────────────────────────────────────┐
   │  DELIVERY: R Shiny / Streamlit dashboards • auto crosstabs • methodology sheet │
   │  Client-facing "always-on tracking" apps (recurring revenue)                   │
   └──────────────────────────────────────────────────────────────────────────────┘

   Orchestration: dbt + Airflow / Dagster schedule the whole chain.
   AI assist (upstream only): questionnaire drafting, open-end coding, report text.
```

---

## Components

### 1. Frame & sample service
- **Voter file** licensed and loaded to the warehouse; nightly/weekly refresh.
- A **sample-draw module** pulls stratified samples and emits the target
  poststratification table (age × race × education × region × party × turnout) from
  the file itself.

### 2. Dynamic Sampling Engine (build — your Change Research analog)
- Service that reads live sample composition from the warehouse and compares to the
  target frame.
- Reallocates outbound SMS volume / digital-ad spend / panel quotas toward
  underrepresented cells until quotas fill.
- Runs on a schedule (e.g., every 30–60 min during fielding). MVP can be a simple
  rules engine; v2 adds an optimizer.

### 3. Field / contact layer
- **RumbleUp** (P2P SMS) — primary; 10DLC-registered; automated opt-out + litigator
  scrub. Links carry the voter ID as a URL parameter.
- **CallFire** (IVR) — landline/older coverage.
- **Cint / Dynata** — programmatic panel fill via API (automatable).

### 4. Survey engine
- **Alchemer** (budget-friendly, tiered) or **Qualtrics** (enterprise logic).
- Embed the voter-file ID via URL parameter so every response is keyed back to the
  frame — this is what makes individual-level modeling and the flywheel possible.

### 5. Data warehouse + the Data Flywheel (your answer to Catalist)
- **BigQuery or Snowflake.** Store raw responses, dispositions, and sample.
- **The flywheel:** every interview ever fielded is retained, keyed to voter-file
  IDs, and reused as training data and MRP input for future models. Because Catalist
  (the Democratic co-op) is closed to Republicans and DataTrust/i360 are
  party-gated, *this proprietary accumulating database is your compounding moat.*
- Schema designed in Week 2 so nothing is lost from Day 1.

### 6. Modeling core (R + Python + Stan)
- **Weighting:** R `survey` + `anesrake` (raking to education, past-vote, party,
  geography).
- **Turnout / vote-choice:** `ranger`/`xgboost` probabilistic models on survey +
  voter-file features.
- **MRP:** `brms` / `rstanarm` / `mrpkit` over Stan; poststratify against the frame
  table.
- **Diagnostics:** automated design-effect, effective-N, cell-coverage, and
  fraud/attention screens gate every run.

### 7. Delivery
- **R Shiny / Streamlit** apps for client dashboards and always-on tracking
  (recurring revenue, near-zero marginal cost, productizable).
- **Auto-crosstabs** + an auto-generated methodology sheet for every poll (feeds the
  transparency protocol).

### 8. Orchestration & automation
- **dbt** for transforms; **Airflow / Dagster** (or simple scheduled jobs) to run
  field → weight → MRP → crosstab → dashboard end to end.
- **AI assist, upstream only:** questionnaire drafting, open-end/verbatim coding,
  first-draft report narrative. **Never** for generating published estimates.

---

## Build order (maps to the 30-day plan)

1. **Week 2:** warehouse + response schema (flywheel foundation); voter-file load;
   field + survey stack wired with voter-ID passthrough.
2. **Week 3:** weighting pipeline → MRP core → diagnostics gate → dashboard;
   dynamic-sampling MVP (rules engine); **end-to-end dry run** validated against a
   known recent election result.
3. **Post-launch:** dynamic-sampling optimizer v2; message-testing library
   (see [08](./08-message-testing-product.md)); subscription tracking products.

## Minimum viable vs. mature

| Capability | MVP (Month 1) | Mature (later cycles) |
|---|---|---|
| Sampling | Static quotas + simple rules engine | Optimizer-driven dynamic engine |
| Modeling | Raking + one MRP model | Continuous pooled model + ML ensembles |
| Flywheel | Schema capturing every interview | Millions of interviews; auto-retraining |
| Delivery | One Shiny dashboard template | Productized subscription tracking suite |
| Message testing | — | Standing conservative library |

## Key technical principles
- **Everything keyed to voter-file IDs** — the enabler of individual-level modeling.
- **Reproducible, versioned pipelines** — every published number regenerable on
  demand (transparency + auditability).
- **Diagnostics gate before delivery** — the model never ships over a broken sample.
- **Open-source modeling stack** — R/Python/Stan are free; cost is data + field, not
  software.

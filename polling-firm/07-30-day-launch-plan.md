# 07 — 30-Day Launch Plan

Week-by-week to a launch-ready operation and a first publicly released, fully
disclosed benchmark poll — with the data flywheel capturing every interview from
Day 1.

> **What Day 30 delivers:** legal entity, data licenses, field + modeling stack, an
> automated pipeline, and one published multi-mode poll with full methodology
> disclosure. Not a finished reputation — the machine engineered to earn one.

---

## Week 1 — Entity, compliance, data

**Goal: legal + compliance spine in place; data-license negotiation open.**

- [ ] Form LLC; EIN; business banking; E&O / professional-liability insurance
- [ ] Engage TCPA + election-law counsel
- [ ] Register 10DLC brand + campaign (The Campaign Registry)
- [ ] Build the state robocall/text rules matrix
- [ ] Join AAPOR; apply to the **Transparency Initiative**
- [ ] Open **L2** license negotiation (start single-state or regional to control cost)
- [ ] Lock the firm name, brand, and data-science-forward positioning; register domain
- [ ] Decision: hire/contract the senior quant (the "Shor seat") — start recruiting now

## Week 2 — Data & field stack live

**Goal: can draw a sample, field it multi-mode, and capture every response.**

- [ ] Execute L2 license; pull first sample
- [ ] Stand up warehouse (BigQuery/Snowflake)
- [ ] **Design the response-warehouse schema so every interview feeds the flywheel**
      (keyed to voter-file IDs) — do this before any fielding
- [ ] Contract **RumbleUp** (P2P SMS) + **CallFire** (IVR); complete 10DLC;
      run deliverability tests
- [ ] Contract **Cint/Dynata** for panel fill (API access)
- [ ] Stand up survey platform (Alchemer/Qualtrics) with **embedded voter-ID passing**
- [ ] Build reusable questionnaire templates

## Week 3 — Modeling pipeline & flywheel (the moat)

**Goal: field → weight → MRP → crosstabs → dashboard runs end to end.**

- [ ] Build the R weighting pipeline (`survey`/`anesrake`): education + past-vote +
      party + geography targets from the voter file
- [ ] Stand up the **MRP/ML core** (`brms`/`mrpkit`) + poststrat table from the file
- [ ] Build probabilistic turnout / vote-choice models
- [ ] Build the **diagnostics gate** (design effect, effective N, cell coverage,
      fraud/attention screens)
- [ ] Build a v1 **Dynamic Sampling Engine** (rules engine that fills cells)
- [ ] Build the auto-crosstab + Shiny/Streamlit client dashboard + methodology sheet
- [ ] **Run an end-to-end dry-run poll and validate against a known recent result**

## Week 4 — Launch poll & go public

**Goal: first public poll out, brand live, BD started.**

- [ ] Field the first public multi-mode **benchmark poll** (a current race/issue)
- [ ] Run it through the full pipeline; pass the diagnostics gate
- [ ] **Publish with full methodology disclosure** — question wording, modes, dates,
      weighting, MoE. Make transparency the story.
- [ ] Submit to aggregators; archive with Roper
- [ ] Launch site + LinkedIn with the data-science-forward brand
- [ ] **Announce the message-testing product** as a second revenue line
      (see [08](./08-message-testing-product.md))
- [ ] Begin 2026-cycle business development to campaigns / PACs / advocacy groups

---

## Critical-path dependencies

```
Entity + counsel (W1) ──▶ 10DLC + L2 license (W1→W2) ──▶ Field stack + schema (W2)
        └────────────────────────────────────────────────▶ Pipeline + dry run (W3)
                                                                    └──▶ Launch (W4)
```

- **The senior quant hire is the biggest schedule risk.** Start Week 1. If it slips,
  a fractional/contract methodologist can carry the Week-3 build.
- **10DLC + deliverability testing** can take days-to-weeks with carriers — start
  immediately; it gates all texting.
- **L2 turnaround** gates the sample — open negotiation Day 1.

## Success criteria for "launched"

1. A published, fully-disclosed poll exists.
2. The pipeline can reproduce that poll's numbers on demand (auditability).
3. Every interview is captured in the flywheel database.
4. AAPOR Transparency Initiative application is in.
5. At least one BD conversation with a real prospective client is underway.

## Phase 5 (post-launch, next cycles)
Dynamic-sampling optimizer v2; the message-testing library; subscription tracking
dashboards; cycle-over-cycle flywheel growth; published accuracy post-mortems.

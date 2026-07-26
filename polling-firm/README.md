# Project: Republican Tech-First Polling Firm

A working repository for standing up a technology-heavy, low-headcount Republican
polling and voter-analytics firm engineered to become one of the most accurate in
the country. Built from a competitive teardown of the top Republican **and**
Democratic firms, with the best practices of each incorporated.

> **Reality frame.** "Launch-ready in ~30 days" is achievable (entity, data
> licenses, field + modeling stack, first published poll). "Best / most accurate
> in the world" is *earned over 2–3 cycles* of published, verifiable results. These
> documents build the machine designed to win that title — not a claim that it is
> won on Day 30.

---

## The one-line thesis

Be the Republican firm that combines all three things no incumbent has together —
**multi-mode contact (Cygnal), analytics depth (WPA), strategic judgment
(Fabrizio)** — *plus* **Blue Rose–grade individual-level modeling at scale** and
**radical transparency**. Attack the one unsolved problem (differential partisan
nonresponse) at the contact layer, extract maximum signal with a modeling
infrastructure the GOP side does not yet have, and compound a proprietary data
flywheel into a durable moat.

---

## Document index

| # | Document | What it is |
|---|----------|------------|
| 00 | [README.md](./README.md) | This file — overview, order of development |
| 01 | [01-strategy-blueprint.md](./01-strategy-blueprint.md) | The integrated strategy (thesis, methodology, moat, risks) |
| 02 | [02-competitive-analysis.md](./02-competitive-analysis.md) | Teardown of top GOP + Democratic firms: strengths, weaknesses, what to steal |
| 03 | [03-house-methodology.md](./03-house-methodology.md) | The polling methodology spec, engineered against known failure modes |
| 04 | [04-technical-architecture.md](./04-technical-architecture.md) | Build-ready system design: pipeline, dynamic sampling engine, data flywheel |
| 05 | [05-vendor-stack-and-costs.md](./05-vendor-stack-and-costs.md) | Procurement shopping list + cost model |
| 06 | [06-compliance.md](./06-compliance.md) | TCPA, AAPOR, FEC, state-law checklist |
| 07 | [07-30-day-launch-plan.md](./07-30-day-launch-plan.md) | Week-by-week launch checklist |
| 08 | [08-message-testing-product.md](./08-message-testing-product.md) | Productized persuasion / message-testing library spec |

---

## Order of development (phases)

- **Phase 0 — Foundation & decisions** *(this doc set)* — strategy, competitive
  analysis, methodology, architecture, procurement, compliance locked in writing.
- **Phase 1 — Legal / entity / compliance spine** *(Week 1)* — LLC, counsel,
  10DLC, AAPOR Transparency Initiative, open data-license negotiation.
- **Phase 2 — Data & field stack** *(Week 2)* — voter file, warehouse, SMS/IVR,
  survey platform; response-warehouse schema designed so every interview feeds the
  flywheel from Day 1.
- **Phase 3 — Modeling pipeline & flywheel** *(Week 3)* — weighting pipeline,
  MRP/ML core, dynamic-sampling logic, dashboards; end-to-end dry-run validated
  against a known result.
- **Phase 4 — Launch poll & go public** *(Week 4)* — first public multi-mode
  benchmark poll, full methodology disclosure, aggregator submission, brand launch.
- **Phase 5 — Products & scale** — message-testing library, always-on tracking
  dashboards, cycle-over-cycle flywheel growth and public post-mortems.

---

## Non-negotiables (guardrails)

1. **No LLM "synthetic respondents" for published estimates.** Undiagnosable error,
   collapsed variance, stereotype amplification. AI is for pipeline automation,
   questionnaire drafting, open-end coding, and reporting — never for producing
   published numbers.
2. **Never herd.** Report what the model says even when it is an outlier. Being
   right as the lonely outlier is what builds a reputation.
3. **Radical transparency.** AAPOR Transparency Initiative from day one; publish
   methodology, crosstabs, and a candid accuracy post-mortem every cycle.
4. **The model never excuses a biased sample.** Heavy modeling amplifies whatever
   bias is in the raw sample (the trap that caught the Democratic data machine in
   2020/2024). Contact-quality / anti-nonresponse work comes first.
5. **Compliance is existential.** TCPA/texting discipline + counsel are not
   optional; one careless autodial campaign is ruinous.

---

*Status: Phase 0 in progress. See individual docs for detail. All external facts
are cited with source URLs inside each document; self-reported vendor/firm claims
are flagged as such.*

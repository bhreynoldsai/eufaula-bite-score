# 03 — House Methodology

The polling methodology, designed deliberately so that each documented failure mode
of the last three cycles is engineered out. This is the product specification for
"how we produce a number."

---

## Design principle

Every methodological choice below maps to a specific, documented error. We are not
inventing exotic techniques; we are assembling the *known* best practices that
incumbents apply only partially, and adding individual-level modeling at scale.

| Documented failure | Our countermeasure |
|---|---|
| Education non-response (2016) | Weight on education — mandatory, never optional |
| Differential partisan non-response (2020, 2024) | Multi-mode contact + recalled-vote & party weighting + voter-file validation |
| Herding (2024) | Public no-herding promise; report the model even as an outlier |
| Opacity → aggregator discount | AAPOR Transparency Initiative; publish everything |
| Over-confident modeling on biased samples (Dem 2020/24) | Contact-quality gate before modeling; sample-diagnostics dashboard |
| Likely-voter model error | Probabilistic ML turnout scores + voter-file history, not a hard cutoff |

---

## 1. Sampling frame — voter-file based

- **Primary frame:** the voter file (start L2, non-partisan, ~$0.025/record; add
  i360 / DataTrust once conservative-client relationships allow). Sample *people we
  can identify*, with append: cell + landline, verified email, modeled demographics,
  turnout/partisanship scores.
- **Why:** lets us sample and weight on **individual-level validated vote history**
  (the Siena/NYT approach) rather than self-reported demographics, and lets us build
  the MRP poststratification table directly from the file.
- **Stratification:** draw proportionate-to-size, stratified by age, region, gender,
  party, race, and prior turnout, with selection adjusted for phone/contact coverage
  and modeled response propensity.

## 2. Modes — multi-mode contact to fight non-response

| Mode | Role | Vendor |
|---|---|---|
| **Text-to-web (P2P SMS)** | Workhorse; reaches low-propensity/young/cell-only voters | RumbleUp |
| **IVR** | Cheap landline/older coverage | CallFire |
| **Online panel** | Fill hard-to-reach cells | Cint / Dynata |
| **Live-caller** | Bought (not built) when a client needs gold-standard credibility | Gravis / Kaplan |

Multi-mode is the primary weapon against differential non-response: reaching the
same target sample through 3–4 channels captures voters any single mode misses.

## 3. The continuous large-sample engine (the paradigm shift)

Instead of episodic standalone polls, run an **always-on fielding stream** that
accumulates hundreds of thousands of interviews over time, feeding one master model
(the Blue Rose / Change Research paradigm). Benefits:
- Individual-level data, not a handful of pre-weighted toplines.
- Small subgroups and districts become estimable via modeling.
- Marginal cost per estimate collapses over time.
- Feeds the **data flywheel** (see [04](./04-technical-architecture.md)).

A **Dynamic Sampling Engine** monitors sample composition live and reallocates
SMS/ad spend toward underrepresented cells (the Change Research technique) — cheaper
and more representative than static quotas, with less manual labor.

## 4. Weighting — transparent and non-response-aware

- **Rake** (iterative proportional fitting; R `anesrake`) to population targets on:
  **age, race, gender, region/geography, education, recalled past presidential
  vote, party ID.**
- **Targets** built from the voter file + Census/ACS, not exit-poll guesses.
- **Recalled-vote discipline:** recall drifts toward the winner and inflates the
  victor's margin; anchor to **voter-file-validated** vote history where possible,
  and cap/monitor the recalled-vote adjustment. Document the choice every time.
- **Effective sample size:** report the design effect and effective N on every poll;
  aggressive weighting inflates variance — track it, don't hide it.

## 5. Likely-voter model

- **Probabilistic, not cutoff:** compute each respondent's turnout probability with
  logistic regression / random forest / gradient boosting on survey + voter-file
  features (validated vote history, registration recency, contact propensity).
- Weight by turnout probability rather than applying a hard "likely voter" screen —
  smoother and avoids threshold cliffs.

## 6. Estimation — individual-level MRP + ML

- **MRP** (multilevel regression with poststratification; Stan + `brms`/`rstanarm`/
  `mrpkit`) for state/district/subgroup estimates from the pooled sample,
  poststratified against the voter-file-derived frame.
- **ML vote-choice / persuadability models** (ensembles) for microtargeting and
  message-audience definition.
- **Uncertainty:** publish credible intervals and be explicit about model
  dependence; MRP is only as good as its covariates and poststrat frame.

## 7. Quality control & the contact-quality gate

Before any number ships, a **sample-diagnostics gate**:
- Response composition vs. frame (are we short on any cell *before* weighting?).
- Weight distribution / max weight / design effect within tolerance.
- Fraud & attention screening on opt-in online respondents (the cost of the online
  model — do not skip it).
- Straight-lining / speeder detection; duplicate-device checks.

**Rule:** if the raw sample is badly skewed on partisanship within cells, we fix
*contact*, not just weights. The model never rescues a biased sample.

## 8. Transparency protocol (per released poll)

Disclose, every time: sponsor/funder, who conducted it, exact question wording and
order, population and geography, sample frame and design, mode(s) and field dates,
sample size and MoE/credible interval, and the **full weighting and modeling
methodology**. Archive with Roper. Maintain AAPOR Transparency Initiative membership.

## 9. Anti-herding rule

We publish what our model produces, including outliers. We never adjust a result
toward the polling consensus to reduce outlier risk. Each release notes where we sit
relative to the aggregate and *why* — turning transparency about disagreement into a
credibility asset.

## 10. Post-mortem cadence

After every election we cross-check against verified results, publish a candid
accuracy autopsy (the GSG/Change move), and fold the learnings back into weighting
targets and models. This institutionalized feedback loop is how accuracy compounds.

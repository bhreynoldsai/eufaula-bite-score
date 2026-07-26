# 10 — Hiring the Senior Quant / Methodologist (the "Shor seat")

The single most important hire and the **biggest schedule risk** in the 30-day
plan. This person is the technical heart of the firm — the individual-level
modeling capability that is the whole competitive thesis. Start recruiting Week 1;
the Week-3 pipeline build depends on this seat (or a strong contract stand-in).

> Named the "Shor seat" internally after David Shor / Blue Rose — the role models
> the same MRP + ML + Bayesian, individual-level-at-scale capability, ported to
> the Republican side. See [02-competitive-analysis.md](./02-competitive-analysis.md).

---

## Why this hire gates everything

The firm's edge over every incumbent Republican pollster is *modeling at the
individual level, at scale* (MRP + ML), not just multi-mode fielding. That
capability lives in one person at launch. Get this hire right and a 2–4 person
firm punches above shops 10× its size; get it wrong and you are just another
multi-mode vendor.

---

## Role summary

**Title:** Chief Methodologist / Head of Data Science (title flexibility helps
recruiting — "Chief" and "Head" both attract senior candidates).

**Mission:** Own the statistical core — weighting, likely-voter modeling, MRP,
turnout/vote-choice ML, and the diagnostics that gate every released number.
Build the pipeline in Week 3, then own accuracy cycle over cycle.

**Reports to:** You (founder).

**Comp reality:** This is a premium hire. Expect to pay senior-quant/data-science
market rate plus equity; the whole company's accuracy reputation rides on it.
Underpaying here is the most expensive mistake available.

---

## Must-have qualifications

- **MRP in production, not just theory.** Has built and shipped multilevel
  regression + poststratification (Stan / `brms` / `rstanarm` / `lme4`), and can
  explain poststratification-frame construction and its failure modes.
- **Survey statistics depth.** Raking/IPF, design effects, effective sample size,
  propensity weighting, likely-voter modeling — knows the tradeoffs cold.
- **ML for turnout/vote-choice.** Random forests / gradient boosting on
  voter-file + survey data; understands overfitting and calibration.
- **R fluency** (`survey`, `anesrake`, `srvyr`, Stan ecosystem); Python for
  pipeline glue.
- **Understands the unsolved problem.** Can speak credibly about differential
  partisan nonresponse across 2016/2020/2024 and why demographic weighting alone
  doesn't fix it. This is the litmus test for real domain depth.
- **Reproducible, auditable work.** Version-controlled, regenerable pipelines —
  because the transparency protocol requires every published number be
  reproducible on demand.

## Strong-plus

- Prior political / campaign / electoral analytics experience.
- Data-engineering comfort (warehouse, dbt, orchestration) — lets the firm run
  even leaner before the dedicated engineer is hired.
- Published methodology work, AAPOR involvement, or a public track record.
- Comfort communicating uncertainty honestly (the anti-herding, anti-overconfidence
  posture the firm is built on).

## Explicitly NOT required

- Republican political background. **Hire for statistical rigor; the firm's
  partisanship is its business model, not a job requirement for this seat.** The
  best quant may be apolitical — that's fine, even good for calibration.
- Willingness to use "synthetic respondents" — in fact, a candidate who pushes LLM
  synthetic sampling for published estimates is a **red flag** against the firm's
  guardrails.

---

## Evaluation rubric (score each 1–5)

| Dimension | What "5" looks like | Weight |
|---|---|---|
| **MRP / Bayesian depth** | Has shipped MRP; can whiteboard the model + poststrat frame and its failure modes | ★★★ (highest) |
| **Survey-weighting rigor** | Explains raking, design effect, effective N, and the recalled-vote tradeoff without prompting | ★★★ |
| **Nonresponse understanding** | Articulates differential partisan nonresponse as the core unsolved problem; proposes contact-side fixes, not just weighting | ★★★ |
| **ML turnout/vote-choice** | Built calibrated probabilistic models; wary of overfitting | ★★ |
| **Reproducibility / engineering** | Versioned, auditable pipelines; comfortable with warehouse + orchestration | ★★ |
| **Judgment & honesty** | Communicates uncertainty plainly; won't herd; flags when a model is papering over a biased sample | ★★★ |
| **Communication** | Explains methods to a non-technical client (and to aggregators) clearly | ★ |

**Bar:** No hire below 4 on any ★★★ dimension. The nonresponse and
"won't-herd/won't-overtrust-the-model" answers are disqualifying if weak — they
are the firm's entire posture.

---

## Work-sample exercise (the real filter)

Give a take-home (paid) using **public** data — a recent election + a public
voter file extract or ACS table:

> "Here is a mixed-mode sample and a target frame. (1) Weight it, documenting your
> scheme and reporting the effective sample size and design effect. (2) Produce
> state-or-district-level estimates via MRP against the frame. (3) Write one page
> for a non-technical client on what the numbers say **and how confident we should
> be**, explicitly noting where the sample or model is weakest."

Score on: correctness, **transparency of documentation**, honest uncertainty
communication, and whether they caught the deliberately-planted sample skew rather
than weighting over it. The last point is the whole ballgame — it tests the
"model never rescues a biased sample" principle in practice.

---

## Interview questions that separate real from résumé

1. "Walk me through building an MRP estimate for a single congressional district
   from a national sample. Where does it break?"
2. "The 2020 and 2024 polls missed in the same direction *despite* education
   weighting. What happened, and what would you do differently?"
3. "Your model says the race is R+4; every public poll says it's tied. Ship it or
   hold it? Why?" *(Looking for: ship it with transparent methodology — the
   anti-herding answer.)*
4. "When is heavy modeling dangerous?" *(Looking for: it amplifies sample bias;
   fix contact first.)*
5. "How would you use LLMs in our pipeline?" *(Looking for: upstream only —
   drafting, open-end coding, automation; NOT synthetic respondents. Per
   [09-ai-model-selection.md](./09-ai-model-selection.md).)*

---

## Sourcing

- Academic survey-methodology and stats programs; political-science quant PhDs.
- Campaign-analytics alumni (both sides — hire the skill).
- AAPOR community; MRP/Stan open-source contributors (`mrpkit`, `brms` users).
- Data-science generalists with demonstrable Bayesian + survey chops.

## Contingency if the seat slips

The Week-3 pipeline build is the dependency. If the full-time hire isn't closed by
Week 2, bring in a **contract methodologist** (Stan/MRP consultant) to stand up
the v1 pipeline and validate the dry-run, then convert or hand off to the
permanent hire. Do not let an unfilled seat block launch — but do not ship
published numbers without a qualified methodologist signing off on the weighting
and diagnostics.

# 01 — Strategy Blueprint

The integrated strategy for a technology-heavy, low-headcount Republican polling
firm. This is the master narrative; the methodology, architecture, vendor, and
launch documents implement it.

---

## 1. The problem worth solving

Across three cycles (2016 → 2020 → 2024) the AAPOR post-mortems converge on one
finding: the persistent, unsolved error is **differential partisan nonresponse** —
Republican / low-trust voters participate at lower rates *even within demographic
cells*, so weighting on age/race/education/gender cannot fully fix it. Layered on
top are two industry pathologies:

- **Herding** — in 2024, pollsters clustered implausibly tightly around a tied race
  to avoid being the outlier. The *most accurate* firms were the ones who went out
  on a limb (AtlasIntel, OnMessage, Patriot).
- **Opacity** — partisan firms on both sides market black boxes ("emotive
  analysis," "Leonardo," "shy voter" secret sauce). Aggregators discount opacity,
  which caps a firm's ceiling.

**Strategy in one line:** be the Republican firm that attacks partisan nonresponse
at the *contact* layer, extracts maximum signal with *individual-level modeling at
scale*, refuses to herd, and wins credibility through *radical transparency* — the
opposite of every incumbent's instinct.

## 2. Positioning

Combine the three axes no incumbent unites — **multi-mode contact (Cygnal),
analytics depth (WPA), strategic judgment (Fabrizio)** — and add the two things the
Republican side lacks entirely, both borrowed from the Democratic frontier:

1. **Blue Rose–grade individual-level modeling at scale** (MRP + ML + Bayesian over
   a continuous large-sample stream).
2. **Radical transparency** (AAPOR Transparency Initiative, published methodology,
   candid post-mortems every cycle).

Brand identity: **PhD/data-science-led**, the way GSG and Blue Rose present — this
commands premium rates and aggregator credibility.

## 3. The methodology in brief

*(Full spec: [03-house-methodology.md](./03-house-methodology.md))*

1. **Voter-file frame** (L2 → i360/DataTrust) — sample and weight on individual
   vote history, not self-reported demographics; build the MRP poststrat table from
   the file itself.
2. **Multi-mode contact** to fight nonresponse — text-to-web (P2P SMS) workhorse +
   IVR for landline/older + online-panel fill + optional bought live-caller.
3. **A continuous, large-sample online engine** — always-on fielding accumulating
   hundreds of thousands of interviews feeding one master model (the Blue Rose /
   Change Research paradigm), with a **dynamic sampling engine** that auto-targets
   underrepresented cells in real time.
4. **Transparent, nonresponse-aware weighting** — rake on age/race/gender/region/
   **education**/**recalled past vote**/**party ID**; publish the exact scheme.
5. **Individual-level MRP + ML/Bayesian core** — state/district/subgroup estimates
   and ML turnout/vote-choice scores. The low-headcount multiplier.
6. **Message/persuasion-testing product line** — a standing conservative
   message-testing library (recurring revenue; no GOP equivalent exists).
7. **Anti-herding public promise + institutionalized post-mortems.**
8. **AAPOR Transparency Initiative + deliberate house-effect cross-validation.**

⚠️ **Hard "do not":** no LLM synthetic respondents for published estimates. AI is
for pipeline automation, questionnaire drafting, open-end coding, and reporting.

## 4. The moat — why this compounds into "the best"

1. **Publish a real volume of scoreable races** — you cannot be #1-rated without a
   track record to rate against.
2. **Never herd** — being right as the lonely outlier is what makes a reputation.
3. **Out-transparent everyone** — incumbents on both sides are opaque; free edge.
4. **Feed the data flywheel every cycle** — a proprietary, ever-growing
   interview/response database (your answer to Catalist, which is closed to
   Republicans) that sharpens each successive model. *This is the durable moat.*
5. **Grow the message-testing library** into the definitive conservative
   persuasion asset — recurring revenue + switching costs.

## 5. Business model

- **Core services:** benchmark & tracking polls, district/state MRP estimates,
  turnout/persuasion modeling, message testing, always-on tracking dashboards.
- **Clients:** GOP campaigns, party committees, PACs/super PACs, advocacy groups,
  and corporate/public-affairs research (smooths the election-cycle boom-bust).
- **Recurring revenue:** subscription tracking dashboards + message-testing library
  access.
- **Unit economics:** ~$5k–$20k per credible n≈600–800 statewide multi-mode poll;
  ~$30k–$80k/yr fixed to operate lean. *(Detail: [05-vendor-stack-and-costs.md](./05-vendor-stack-and-costs.md).)*

## 6. Org model — light on human capital

A **2–4 person core**:
- **You** — strategy, client relationships, electoral judgment (the Fabrizio-style
  asset; your 30-year edge).
- **1 senior quant / methodologist** (R / Stan / MRP / ML) — the "Shor seat"; the
  most important hire and the technical heart.
- **1 data engineer / ops** — pipeline, warehouse, dynamic sampling engine, data
  flywheel, dashboards, field ops (can start fractional/contract).
- **Contractors on tap** — questionnaire help, live-call vendor, legal
  (TCPA/FEC), design.

AI tooling covers drafting, open-end coding, and report generation. The automated
field→weight→MRP→crosstab→dashboard pipeline is what lets this few people do what
used to take a team — and it is the valuation story.

## 7. Risks

- **TCPA / texting compliance is existential** — counsel + strict P2P discipline
  non-negotiable. *(See [06-compliance.md](./06-compliance.md).)*
- **Model risk** — a sophisticated model must not paper over a biased sample (the
  trap that caught the Democratic machine in 2020/2024). Contact quality first.
- **Opt-in online sample fraud/quality** — invest in respondent validation and
  attention screening.
- **Accuracy variance is real** — even Selzer missed Iowa 2024 by 16 pts.
  Communicate uncertainty honestly; it builds long-run trust.
- **The GOP-lean discount** — beat it with transparency + calibration
  (Fabrizio's +0.3, not Trafalgar's +2).

## 8. What "up and running in ~30 days" actually delivers

A launch-ready operation: legal entity, data licenses, field + modeling stack, an
automated pipeline, and a first **publicly released, fully-disclosed** benchmark
poll — plus the data flywheel capturing every interview from Day 1. Not a finished
reputation; the engine that earns one. *(See [07-30-day-launch-plan.md](./07-30-day-launch-plan.md).)*

# 12 — Procurement Execution Plan

The concrete outreach sequence for standing up the vendor stack: who to contact,
in what order, what to ask for, and what to negotiate. Sequenced to the critical
path in [07-30-day-launch-plan.md](./07-30-day-launch-plan.md) — the voter file
and 10DLC gate everything, so they go first.

> Vendor shortlist and cost model live in
> [05-vendor-stack-and-costs.md](./05-vendor-stack-and-costs.md). This doc is the
> *action* layer: the calls to make and the terms to get.

---

## Critical-path ordering

```
Day 1   →  Counsel engaged + entity forming + L2 outreach + 10DLC started
Day 2-5 →  L2 license negotiated; RumbleUp + CallFire onboarding; warehouse
Week 2  →  Survey platform; panel API (Cint/Dynata); deliverability tests
Later   →  i360 / DataTrust once conservative-client relationships exist
```

**Two hard gates — start Day 1:**
1. **Voter file (L2)** — gates the sample; longest lead time.
2. **10DLC brand/campaign registration** — gates all texting; carrier approval can
   take days to weeks.

---

## 1. Voter file — L2 Political *(Day 1, highest priority)*

- **Why first:** non-partisan (no gatekeeping for a brand-new firm), transparent
  per-record pricing (~$0.025/record), strong cell append. It is the sampling
  frame the whole pipeline is built on.
- **Contact:** L2 sales / data-licensing team (l2-data.com). Ask for political
  data licensing, not the self-serve DIY product.
- **Ask for / negotiate:**
  - Start with a **single-state or regional license** to control initial cost;
    negotiate an expansion path to multi-state/national.
  - **Cell + landline phone append, verified email, modeled demographics
    (age/race/education), turnout & partisanship scores** included.
  - **Refresh cadence** (how often the file updates) and reprocessing terms.
  - **Permitted-use terms** — confirm survey/polling use and any resale limits;
    confirm you may retain response linkage (needed for the flywheel).
  - Volume discount tiers as you scale.
- **Secondary/neutral fallback:** Aristotle (aristotle.com) — quote in parallel as
  a backstop and price check.

## 2. P2P texting — RumbleUp *(Day 1–2)*

- **Why:** GOP-aligned, built-in 10DLC support, automated opt-out, **TCPA
  litigator scrubbing**, free landline scrub. The text-to-web workhorse.
- **Contact:** RumbleUp sales (rumbleup.com); flag **polling/survey use case**
  explicitly.
- **Ask for / negotiate:**
  - Help completing **10DLC brand + campaign registration** immediately (this is
    the gating item — do it first with them).
  - Usage-based per-segment / per-MMS pricing; confirm free incoming replies and
    free litigator/landline scrub.
  - Confirm **survey link with voter-id URL parameter** passthrough works (needed
    to key responses to the frame).
  - Deliverability support and sending-window controls per state.

## 3. IVR — CallFire *(Day 2)*

- **Why:** cheap landline/older-voter coverage for mixed-mode.
- **Contact:** CallFire (callfire.com), political/IVR-telesurvey product.
- **Ask for:** usage-based credits, IVR telesurvey capability, caller-ID and
  time-of-day compliance controls.

## 4. Survey platform *(Week 2)*

- **Budget path — Alchemer** (alchemer.com): transparent tiers, easiest to budget;
  confirm **URL-parameter passthrough of voter IDs** and quota logic.
- **Enterprise path — Qualtrics** (qualtrics.com): deeper logic, embedded data, API
  automation; five-figure/yr — choose only if the logic/automation justifies it.
- **Decision rule:** start on Alchemer unless the questionnaire complexity or
  automation needs clearly require Qualtrics.

## 5. Online panel fill — Cint / Dynata *(Week 2)*

- **Cint** (cint.com, absorbed Lucid Marketplace): programmatic **API** access —
  best for automation; ask for marketplace API credentials and per-complete
  pricing by incidence.
- **Dynata** as alternate/second source.
- **Ask for:** per-complete pricing at low-incidence (likely-voter-in-district)
  targets, and API access for automated launch/routing.

## 6. Warehouse + analytics *(Week 2, mostly self-serve)*

- **BigQuery or Snowflake** — usage-based; self-serve signup, no negotiation.
- **R / Python / Stan / Shiny / Streamlit** — open-source, free.
- **dbt** — free/low-cost.

## 7. Conservative-network data — i360 / DataTrust *(Later — relationship-gated)*

- **Do not block launch on these.** They are gated to vetted conservative clients
  and require relationships you build once operating.
- **i360** (i-360.com): daily-updated modeled scores; approach once you have
  conservative-client standing.
- **DataTrust / GOP Data Center**: RNC-side file; requires committee-aligned
  vetting.
- **Ask for (when the time comes):** daily modeled partisanship/turnout/issue
  scores to layer onto the L2 frame.

## 8. Compliance & professional services *(Day 1)*

- **TCPA + election-law counsel** — engage Day 1 (existential; see
  [06-compliance.md](./06-compliance.md)).
- **E&O / professional-liability insurance.**
- **AAPOR membership + Transparency Initiative application** (aapor.org).
- **Roper Center** archiving arrangement (for released polls).

---

## Negotiation principles (apply to every vendor)

1. **Start small, expand contractually.** Single-state L2, budget survey tier,
   usage-based texting — negotiate the *ramp*, not a big upfront commit.
2. **Protect the flywheel.** Confirm every data agreement lets you **retain
   response data keyed to voter IDs** — that accumulating asset is the moat.
3. **Confirm compliance tooling is included** (opt-out automation, litigator
   scrub, 10DLC support) rather than bolted on.
4. **Get per-unit pricing in writing** (per record, per segment, per complete) so
   the cost model in [05](./05-vendor-stack-and-costs.md) stays accurate.
5. **Avoid partisan lock-in early.** L2 + Aristotle (non-partisan) keep you
   unblocked; add i360/DataTrust later without becoming dependent on party
   gatekeeping to operate.

---

## Procurement checklist

- [ ] TCPA/election counsel engaged (Day 1)
- [ ] Entity formed; E&O insurance bound
- [ ] L2 license negotiated (single-state to start) — permitted use + flywheel
      retention confirmed
- [ ] 10DLC brand + campaign registered (via RumbleUp) — **gating item**
- [ ] RumbleUp contracted; voter-id URL passthrough + scrub confirmed
- [ ] CallFire IVR account live
- [ ] Survey platform (Alchemer/Qualtrics) with embedded voter-id passthrough
- [ ] Cint/Dynata panel API access
- [ ] Warehouse (BigQuery/Snowflake) provisioned
- [ ] AAPOR + Transparency Initiative application submitted
- [ ] Roper archiving arrangement
- [ ] (Later) i360/DataTrust relationship opened once conservative-client standing exists

# 06 — Compliance Checklist

Compliance is **existential** for a texting/calling-heavy polling firm. One careless
autodial campaign can produce ruinous class-action exposure. Engage TCPA/election
counsel in Week 1; this document is an operational checklist, **not legal advice**.

---

## 1. TCPA / robocall & robotext (federal)

- **Autodialed calls/texts and prerecorded (IVR/robocall) messages to wireless
  numbers require prior express consent.** Manually-dialed / true **P2P** texts (a
  human presses send; no autodialer) are the standard workaround — this is *why* P2P
  platforms exist and why RumbleUp is the primary field tool.
- **Do-Not-Call registry:** political/survey/polling outreach is **exempt** from the
  national DNC registry — **but the autodialer/prerecorded-voice restrictions still
  apply.** Exemption ≠ free rein.
- **One-to-one consent rule:** the FCC's stricter 1:1 consent rule was **vacated by
  the 11th Circuit (Jan 2025)** and formally eliminated by the FCC (final rule Sept
  2025). Net effect: less restrictive than feared; base TCPA consent rules stand.
- **Revocation of consent:** rules effective **April 11, 2025** — process opt-outs
  promptly across channels. Automate opt-out handling (RumbleUp/CallFire do much of
  this).
- **10DLC registration:** register brand + campaign with **The Campaign Registry**
  for A2P SMS deliverability; disclose the polling/survey use case.

## 2. State robocall / text laws
- Several states are stricter than federal (specific autodialer, time-of-day,
  caller-ID, and polling-call rules; e.g., FL, LA have specific treatment).
- **Maintain a state rules matrix**; enforce per-state calling/texting windows and
  content. Update each cycle.

## 3. AAPOR standards (published polls)
- **Disclosure Standards** (Code of Professional Ethics): on release, be prepared to
  disclose sponsor, sample source, mode, dates, sample size, MoE/credible interval,
  weighting, question wording, and population.
- **Join the Transparency Initiative** — increasingly a precondition for aggregators
  (Silver Bulletin, 538 successors, RCP) taking your polls seriously, and a core
  part of the firm's differentiation.
- **Archive** released polls (e.g., Roper Center) for auditability.

## 4. FEC / campaign-finance
- Polls **paid for by a campaign/PAC** are reportable expenditures.
- Polls **shared with a campaign** can be an **in-kind contribution**, valued under
  FEC poll-allocation rules (value depreciates over time after the poll is taken).
- Brief clients on the FEC poll-valuation / in-kind rules so they report correctly.
- Publicly released media polls generally don't trigger FEC reporting for the
  pollster, but the sponsor relationship can.

## 5. Data / privacy hygiene
- Respect voter-file license terms (permitted uses, resale limits).
- Secure PII in the warehouse (access controls, encryption at rest).
- Honor opt-outs across the flywheel database, not just the active campaign.

---

## Week-1 compliance setup checklist

- [ ] Engage TCPA + election-law counsel
- [ ] Form entity; E&O / professional-liability insurance
- [ ] Register 10DLC brand + campaign (The Campaign Registry)
- [ ] Stand up automated opt-out / consent-revocation handling
- [ ] Build the state robocall/text rules matrix
- [ ] Join AAPOR; apply to the Transparency Initiative
- [ ] Set up Roper (or equivalent) archiving workflow
- [ ] Document data-security controls for the warehouse / flywheel

---

## Sources
- [FCC — rules on political campaign calls & texts](https://www.fcc.gov/rules-political-campaign-calls-and-texts)
- [11th Circuit vacates 1:1 consent rule (Kelley Drye)](https://www.kelleydrye.com/viewpoints/blogs/ad-law-access/eleventh-circuit-vacates-tcpa-11-consent-rule)
- [FCC eliminates 1:1 consent — final rule (Goodwin)](https://www.goodwinlaw.com/en/insights/blogs/2025/09/the-fcc-issues-final-rule-formally-eliminating-the-one-to-one-consent-requirement)
- [Revocation-of-consent updates (McGuireWoods)](https://www.mcguirewoods.com/client-resources/alerts/2025/1/delayed-one-to-one-consent-rule-gives-companies-reprieve-plus-other-tcpa-updates/)
- [AAPOR Transparency Initiative](https://aapor.org/standards-and-ethics/transparency-initiative/)
- [AAPOR Disclosure Standards](https://aapor.org/standards-and-ethics/disclosure-standards/)

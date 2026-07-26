# 08 — Message-Testing Product

A productized persuasion / message-testing library — modeled on Blue Rose Research's
2,000+ item library, ported to the conservative side, where **no equivalent exists**.
This is a recurring-revenue product and a defensible data asset, not a one-off poll.

> **Why it matters:** the Democratic side has a standing, subgroup-explorable
> persuasion library that campaigns and advocacy groups pay to access. Republicans
> do not. First-mover on the right owns the category.

---

## What it is

A continuously-updated database of tested political messages — talking points, ad
scripts, issue framings — each scored for **persuasive effect** on candidate/issue
support, broken out by subgroup (age, race, gender, education, region, party,
ideology, turnout propensity). Clients explore "what moves whom" without
commissioning a bespoke study each time.

## How it works (method)

1. **Randomized message experiments** embedded in the always-on survey stream:
   respondents see randomly assigned messages/framings; effect is measured as the
   shift in support vs. control.
2. **Individual-level modeling** (the same MRP/ML core) estimates persuasive effect
   by subgroup — including subgroups too small to read in any single survey.
3. **Effect sizes + uncertainty** stored in the library, keyed to issue area and
   audience, and refreshed as new experiments run.
4. Results flow into the **data flywheel**, so the library compounds over time.

## Product tiers

| Tier | Who | What they get |
|---|---|---|
| **Self-serve library** | Campaigns, PACs, advocacy orgs | Subscription access to explore tested messages by subgroup |
| **Custom testing** | Individual campaigns | Bespoke message batteries run through the engine, delivered to their dashboard |
| **Always-on tracking + messaging** | Major campaigns / committees | Continuous tracking dashboard with live message-performance feeds |

## Why it's defensible
- **Compounding data:** every experiment enlarges the library; late entrants can't
  catch up to the accumulated corpus (the same dynamic that protects Blue Rose and
  Catalist).
- **Recurring revenue + switching costs:** subscribers build workflows around it.
- **Cross-sells** the core polling and modeling services.

## Build sequence (Phase 5, post-launch)
1. Add a **randomized-message module** to the survey templates.
2. Extend the MRP/ML core to estimate **treatment effects by subgroup**.
3. Build the **library UI** (Shiny/Streamlit) with subgroup filtering.
4. Seed with an initial battery of high-salience conservative issue messages.
5. Package tiers + pricing; announce alongside or shortly after launch.

## Guardrails
- Effect estimates carry **uncertainty intervals** — sell honest measurement, not
  false precision.
- Keep experiments **methodologically disclosed** (consistent with the transparency
  protocol) to the extent competitively possible.
- Never substitute **LLM synthetic respondents** for real experimental data —
  synthetic message-testing is exactly where collapsed-variance/stereotype
  amplification would most mislead.

## Reference
- [Blue Rose Message Testing Library](https://data.blueroseresearch.org/library) —
  the model to emulate (and out-transparent).

# 05 — Vendor Stack & Cost Model

A practical procurement map. Prices are ballpark/negotiated planning numbers unless
flagged; nearly every serious vendor quotes custom and vets political clients. Where
a public figure exists it is flagged; otherwise treat figures as directional.

---

## 1. Voter file / sample universe

| Vendor | Partisan access | Provides | Cost / access |
|---|---|---|---|
| **L2 Political** ✅ start here | **Non-partisan** — sells to all | ~200M+ voters, ~95M cells, phone/email append, modeled demographics, turnout/partisanship scores, LiveRamp onboarding | ~**$0.025/record** w/ volume discounts; state or national license; also via NationBuilder |
| **i360** | **Republican/conservative** (Koch-backed) | 300M+ profiles, ~1,800 data points, ML scores updated **daily** (partisanship, turnout, issue affinity), contact tools | Custom/contract; gated to conservative clients — add once relationships exist |
| **DataTrust / GOP Data Center** | **Republican only** (RNC list-share) | The party-side voter-file backbone; RNC-enriched scores + contact data | Vetted GOP/committee clients only; relationship-based |
| **Aristotle** | Non-partisan | 235M+ voter list, donor lists, append, districting | Custom; neutral fallback |
| *TargetSmart* | Dem-aligned (DNC file) | — | Not your vendor |
| *Catalist* | **Dem/progressive only** | N/A | **Closed to you** — build your own flywheel instead |

**Recommendation:** launch on **L2**; layer **i360** or **DataTrust** for
daily-updated modeled scores once you have conservative-client standing; keep
**Aristotle** as secondary neutral source.

## 2. Online sample / panel

| Vendor | Type | Notes |
|---|---|---|
| **Cint** (absorbed Lucid Marketplace) | Opt-in marketplace + **API** | Programmatic sourcing — ideal for automation |
| **Dynata** | Opt-in proprietary panel | Large first-party panel |
| **YouGov** | Actively-sampled online panel | Credible for public toplines; premium |
| **Prolific** | Curated, high-quality opt-in | Strong ID/attention controls; not voter-verified |
| *Probability panels* (AmeriSpeak, KnowledgePanel) | Gold-standard inference | Buy per-project only when a client needs it |

For a voter-modeled firm the powerful pattern is **text-to-web off your own
voter-file sample** (you own the frame) + marketplace panel for fill.

## 3. SMS / P2P texting

| Vendor | Fit | Notes |
|---|---|---|
| **RumbleUp** ✅ | **GOP go-to** | P2P + short-code (via Switchboard); usage-based; built-in **10DLC support, auto opt-out, TCPA litigator scrub**, free landline scrub |
| Tatango | Mass/broadcast, fundraising | Not P2P — list opt-in & re-contact |
| CallHub / Peerly | Non-partisan P2P alternates | Good for deliverability A/B |
| *Scale to Win* | **Progressive only** | Not available to you |

## 4. Survey platform / IVR

| Vendor | Role | Notes |
|---|---|---|
| **Alchemer** ✅ (budget) | Survey engine | Transparent tiers; easiest to budget |
| **Qualtrics** | Survey engine (enterprise) | Deep logic, embedded voter IDs, API automation; five-figures/yr |
| Forsta (Decipher) | Agency-grade scripting | For complex questionnaires |
| **CallFire** ✅ | IVR / telesurvey | Hosted automated phone polling; usage-based |
| Voicent / DialerAI | IVR alternates | TTS phone surveys |
| Gravis / Kaplan | Full-service IVR + live-call houses | **White-label** rather than build a call center |

## 5. Analysis / modeling stack (mostly free)

| Layer | Tool |
|---|---|
| Language | **R** (`survey`, `anesrake`, `srvyr`), **Python** (`pandas`, `xgboost`) |
| MRP / Bayesian | **Stan** + `brms` / `rstanarm` / `lme4` / `mrpkit` |
| Warehouse | **BigQuery** or **Snowflake** (usage-based) |
| Transform / orchestration | **dbt** + Airflow / Dagster |
| Dashboards | **R Shiny / Streamlit** (free, automatable) or Tableau / Power BI |

## 6. Compliance / legal
See [06-compliance.md](./06-compliance.md). Budget for TCPA/election counsel, AAPOR
membership + Transparency Initiative, and a state robocall/text rules matrix.

---

## 7. Cost model

### Fixed / startup (annual, lean MVP)

| Item | Ballpark |
|---|---|
| Voter file (L2, state or multi-state) | ~$0.025/record; multi-state license + refreshes → **low–mid five figures/yr**; single-state far less |
| Survey platform | Alchemer **~$0.5–2k/yr+**; Qualtrics/Forsta **five figures/yr** |
| P2P texting (RumbleUp) | Low/no base; **usage-based** |
| IVR (CallFire) | Usage-based credits; minimal base |
| Warehouse (BigQuery/Snowflake) | Usage-based; **hundreds–low thousands/yr** at MVP volume |
| Analytics (R/Python/Stan) | **Free**; dashboards Shiny/Streamlit free (Tableau/Power BI ~$15–75/user/mo) |
| AAPOR + legal/compliance setup | Low four figures + counsel |

**Realistic fixed base to operate: ~$30k–$80k/yr**, dominated by the voter-file
license (and an enterprise survey platform if chosen). A minimal single-state
launch can run well under $20k.

### Variable — per-complete by mode (planning benchmarks)

| Mode | ~Cost / complete | Notes |
|---|---|---|
| IVR / robocall | **$1–5** | Cheapest; landline-skewed (older); mixed-mode component |
| **Text-to-web (P2P off your file)** | **$3–10** | Best automation/cost balance for a lean shop |
| Online opt-in panel | **$3–15+** gen-pop; **$15–50+** low-incidence targets | Fast; needs quotas + weighting |
| Curated panel (YouGov/Prolific) | **$10–30+** | Cleaner data; premium |
| Live-caller phone | **$15–40+** | Highest cost + headcount; buy from vendor |
| Probability panel buy | Project-priced (**$20k–$60k+**) | Only when client demands gold standard |

**Whole-poll order of magnitude:** a credible n≈600–800 statewide poll runs
**~$5k–$20k** via text-to-web/online/IVR mixed-mode (the lean sweet spot), vs
**$20k–$50k+** live-caller, vs **$30k–$100k** full-service third-party.

---

## Recommended MVP stack (opinionated)

1. **Frame:** L2 → + i360/DataTrust later.
2. **Field:** RumbleUp (P2P) + CallFire (IVR) + Cint/Dynata (panel fill).
3. **Survey:** Alchemer (or Qualtrics for enterprise logic + embedded voter IDs).
4. **Warehouse/modeling:** BigQuery or Snowflake + R (`survey`/`anesrake`) +
   Stan/`brms`/`mrpkit`; Shiny/Streamlit dashboards.
5. **Compliance:** AAPOR + Transparency Initiative; automated opt-out/consent;
   state-law matrix; TCPA counsel.

*The core low-headcount moat = owning the voter-file frame + text-to-web + MRP +
the accumulating response flywheel — one or two analysts field and model
district-level polls without a call center.*

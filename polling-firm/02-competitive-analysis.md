# 02 — Competitive Analysis

A teardown of the leading Republican and Democratic polling/analytics firms: what
each does well (steal it), what each does poorly (beat it), and the lessons a new
tech-first Republican firm should incorporate.

> **Sourcing note.** Many firm sites (cygn.al, natesilver.net, 538, mediabiasfactcheck)
> block automated fetch (HTTP 403), so specifics below draw on search-result
> summaries, news coverage, and firm statements. Self-reported accuracy/ranking
> claims are flagged. Verify exact 538/Silver Bulletin star ratings against the
> live ratings pages before publishing any comparison.

---

## Part A — Republican / conservative firms

### Cygnal (Brent Buchanan, founded 2007)
- **Identity:** multi-mode / text-to-web tech + PR-forward public pollster.
  Acquired Harper Polling (2020) for congressional/advocacy depth.
- **Does well:** early, real commitment to **multi-mode + text-to-web**; built an
  **in-house P2P SMS platform**; strong issue-poll cadence keeps the brand visible;
  markets a proprietary "emotive analysis" sentiment layer (now "Heartbeat").
- **Does poorly:** **opaque weighting** (marketing language, not disclosed method);
  self-promotional "#1 private pollster, four cycles" is a *curated cut* of the
  data (restricts universe to private firms); 2.1★ (538, 2024, 46 polls) is
  good-not-elite; structurally in the group Silver flagged for herding.

### WPA Intelligence (founded 2004 as Wilson Perkins Allen)
- **Identity:** PhD-led data science / predictive analytics.
- **Does well:** genuine **analytics depth** — adaptive sampling, microtargeting,
  a "Leonardo" social-listening tool; **early adopter of education weighting**;
  strong award pedigree (multiple AAPC Pollies; Youngkin 2021 signature win).
- **Does poorly:** **governance implosion** — founder/CEO Chris Wilson fired
  Dec 2024 over alleged misuse of company funds, following a CFO embezzlement
  scandal; Cambridge Analytica / AggregateIQ association dogs the record;
  documented ~+0.7 GOP house lean (older 538 scale); key-person risk realized.

### Fabrizio, Lee & Associates (Tony Fabrizio + David Lee)
- **Identity:** elite strategist-pollster with unmatched top-tier access.
- **Does well:** **best strategic/electoral judgment** (the 2016 memo that sent
  Trump into MI/WI; the 2024 "Selzer is an outlier" call, vindicated); the actual
  **Trump 2016/2020/2024 + RNC + MAGA Inc.** pollster (David Lee ran $320M+ of
  MAGA Inc. IE in 2024); **best-calibrated GOP house effect (~+0.3)**; bipartisan
  WSJ poll pairing with Impact Research lends credibility.
- **Does poorly:** traditional/**phone-rooted** method, little public methodology
  disclosure; public "outlier" calls double as campaign spin; Trump-relationship
  volatility (billing disputes; the leaked "Epstein memo" episode); less
  methodological innovation than Cygnal or WPA.

### Trafalgar Group (Robert Cahaly)
- **Does well:** marketing genius around the **"shy Trump voter"** narrative;
  hyped 2016/2020 hits.
- **Does poorly:** **2022 was a disaster** — of ~2 dozen polls, only 5 landed
  within their own MoE; consistently overstates GOP by ~2 pts (538); **fully
  opaque** methodology, widely criticized by conventional pollsters.

### McLaughlin & Associates, Remington Research, co/efficient
- **Do well:** deep campaign books; cheap, fast turnaround (Remington's IVR model).
- **Do poorly:** middling independent ratings (Remington ~C on old 538 scale);
  IVR-heavy = older/landline skew; commodity positioning.

### The GOP-side pattern
Every incumbent is strong on **one** axis — tech (Cygnal), analytics (WPA), or
judgment/access (Fabrizio) — **none combines all three with transparency.** That
gap is the entry point. Note: the *most accurate* 2024 GOP-leaning pollsters were
the ones who **refused to herd** — AtlasIntel, OnMessage, Patriot Polling.

---

## Part B — Democratic / progressive firms

### Blue Rose Research (David Shor) ⭐ — the technical benchmark
- **Identity:** the most technically sophisticated shop in the industry. 100+
  clients; **tens of millions of interviews per year**.
- **Does well:** huge online samples fed into **MRP + machine learning + Bayesian**
  models — modeling at the **individual level**, not a few weighted toplines. Built
  a standing **2,000+ item message-testing library** as a product. "Popularism" =
  letting data drive strategy.
- **Does poorly:** **opaque** (methodology/weighting undisclosed; some findings
  can't be reconciled with public data); opt-in online sample; heavy modeling did
  **not** prevent misses (Shor's 2020 models were off). Modeling amplifies sample
  bias.

### Change Research ⭐ — the affordable-tech benchmark
- **Does well:** proprietary **Dynamic Online Sampling engine** — recruits fresh
  respondents via digital ads (no panel) and **auto-adjusts targeting in real time**
  to fill underrepresented cells; **900k+ surveys in 2020**, individual-level
  modeling without pre-aggregation; **cheap, fast, transparency-forward**;
  nonpartisan arm (Embold Research).
- **Does poorly:** online-only skews; opt-in fraud/quality risk; accuracy claims
  largely self-reported.

### Global Strategy Group
- **Does well:** **PhD-led data-science team**; multi-channel online approach;
  **institutionalized public post-mortems** (led the 2020 Democratic autopsy →
  measurably improved 2022/2024 horse-race accuracy).
- **Does poorly:** left-center house effect; B- predictive rating.

### Impact Research (ALG rebrand — John Anzalone, Molly Murphy)
- **Does well:** elite **strategic judgment + access** (Biden 2020 lead pollster;
  Murphy = 2019 AAPC Pollster of the Year); the **bipartisan WSJ poll** partner
  with Fabrizio (self-checks house effect).
- **Does poorly:** traditional method; partisan-actor framing; less tech innovation.

### GQR (Stan Greenberg), Garin-Hart-Yang, Benenson, Lake Research
- **Do well:** decades of **message/strategy craft** and presidential-campaign
  judgment.
- **Do poorly:** legacy phone-rooted; little methodological innovation.

### Catalist — the Democratic voter-file cooperative
- **Does well:** 263M+ records, 20+ years of history; the **"virtuous circle" data
  co-op** — clients return response data that continuously improves the shared file,
  a compounding data moat.
- **Relevance:** **closed to Republicans.** You cannot use it — which is exactly
  why you must build your own accumulating equivalent (see the Data Flywheel in
  [04-technical-architecture.md](./04-technical-architecture.md)).

---

## Part C — The 6 lessons to steal (from the Democratic side)

1. **Model at the individual level, at scale (Blue Rose).** A poll is not "600
   interviews weighted once"; it is a continuous stream of hundreds of thousands of
   interviews feeding one big MRP/ML model. This is the paradigm shift that makes a
   firm tech-heavy and headcount-light.
2. **Build a real-time adaptive sampling engine (Change Research).** Software that
   watches the sample fill and auto-targets underrepresented cells beats static
   quotas — cheaper, faster, more representative, less manual labor.
3. **Productize message/persuasion testing (Blue Rose library).** Recurring revenue
   and a defensible asset. Republicans have **no** equivalent — open white space.
4. **Build your own accumulating data flywheel (answer to Catalist).** Every
   interview ever fielded feeds a proprietary response database that sharpens the
   next model. The compounding asset is the real long-term moat.
5. **Institutionalize transparency + public post-mortems (GSG / Change).** The
   firms that published their failures got measurably better. Do it louder than
   anyone — the opposite of Trafalgar/Cygnal opacity.
6. **Cross-validate your house effect (Impact / WSJ pairing).** Deliberately check
   yourself against a neutral or opposing benchmark to stay honest and shrink the
   partisan discount.

**The guardrail (the Democratic cautionary tale):** heavy modeling is a
force-multiplier *and* a risk amplifier. Shor's models and the entire Democratic
data machine still missed 2020 and 2024 because **modeling amplifies whatever bias
is in the raw sample.** Great model + biased sample = confidently wrong. The
modeling layer never excuses the hard work of fighting nonresponse at contact.

---

## Sources
- Cygnal: [America's Most Accurate Private Pollster](https://www.cygn.al/news/cygnal-americas-most-accurate-private-pollster-four-cycles-running/) · [Yellowhammer/538 2024](https://yellowhammernews.com/fivethirtyeight-names-cygnal-most-accurate-private-polling-firm/)
- WPA: [Politico via Raw Story — Wilson firing](https://www.rawstory.com/chris-wilson/) · [WPAi leadership](https://theorg.com/org/wpai/teams/leadership-team)
- Fabrizio: [Wikipedia](https://en.wikipedia.org/wiki/Tony_Fabrizio) · [538/MBFC rating](https://mediabiasfactcheck.com/fabrizio-lee-associates-bias-and-credibility/) · [Axios 2024 memo](https://www.axios.com/2024/10/31/trump-2024-election-polls-memo)
- Trafalgar: [Newsweek — 2022 misses](https://www.newsweek.com/conservative-pollster-robert-cahaly-red-wave-predictions-failed-2022-midterm-election-1758789) · [Wikipedia](https://en.wikipedia.org/wiki/Trafalgar_Group)
- Blue Rose: [About](https://blueroseresearch.org/about/) · [2024 Retrospective (PDF)](https://data.blueroseresearch.org/hubfs/2024%20Blue%20Rose%20Research%20Retrospective.pdf) · [InfluenceWatch](https://www.influencewatch.org/for-profit/blue-rose-research/)
- Change Research: [Methodology & Accuracy](https://changeresearch.com/methodology-accuracy/) · [Embold](https://emboldresearch.com/methodology/)
- GSG: [Improving Polling Accuracy 2025 (PDF)](https://globalstrategygroup.com/wp-content/uploads/2025/07/GSG-Improving-Polling-Accuracy-in-2025-and-Beyond.pdf) · [MBFC](https://mediabiasfactcheck.com/global-strategy-group-bias-and-credibility/)
- Impact Research: [ALG → Impact](https://impactresearch.com/2022/01/21/alg-research-is-now-impact-research/)
- Catalist: [National Database](https://catalist.us/data/) · [Wikipedia](https://en.wikipedia.org/wiki/Catalist)
- Nate Silver 2024 review: [How did the polls do in 2024](https://www.natesilver.net/p/so-how-did-the-polls-do-in-2024-its)

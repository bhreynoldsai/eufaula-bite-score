# Active projects

_Last updated: 2026-08-01_

One block per project. Keep it to what an assistant needs to be useful on it:
what it is, where it stands, what's next, and what would derail it. Move
finished projects to the bottom under **Archive**, then delete them once they
stop being referenced.

---

## Eufaula Bite Score

- **What:** Single-page React app that pulls live weather, USGS gauge, and
  astronomical data and outputs a 0–100 fishing "Bite Score" for largemouth
  bass, crappie, and catfish on Lake Eufaula (Walter F. George Reservoir).
- **Repo:** `bhreynoldsai/eufaula-bite-score`
- **Stack:** React 18, Vite, Tailwind, Recharts, Vitest. No backend — all data
  sources are free and keyless (Open-Meteo, USGS 02343801, client-side
  astronomy).
- **Status:** Private beta behind a tester allowlist (`src/testers.js`).
- **Notable design points:** Water temp is *estimated* from a 72-hour rolling
  air-temp average, shown with a `~`. The catfish model is inverted — warm
  water, night hours, and dam generation raise the score. The "Ask the guide"
  panel streams from the Anthropic API and falls back to static guide text when
  CORS blocks the browser call.
- **Next:** TODO
- **Open questions:** TODO

---

## TODO — second project

- **What:**
- **Status:**
- **Next:**
- **Blocked on:**

---

## Archive

_Completed or abandoned. Keep one line each so the decision log has something
to point at._

- **Housing Grants & Programs Registry dashboard** — built inside the Bite
  Score repo, then extracted to its own repo (2026, PR #8).

# Eufaula Bite Score

A single-page React app that aggregates real-time environmental and astronomical
data, runs it through species-specific fishing behavior models, and outputs a
color-coded **Bite Score (0–100)** for three species on Lake Eufaula
(Walter F. George Reservoir), Alabama/Georgia:

- **Largemouth Bass** — Eufaula is the "Big Bass Capital of the World"
- **Crappie** — early spawner; the Feb–Apr creek-arm run drives the model
- **Catfish** — inverted model: warm water, night hours, and dam-generation
  current all *raise* the score

## Data sources (all free, no keys)

| Source | Use | Refresh |
|---|---|---|
| [Open-Meteo](https://open-meteo.com) | temp, wind, clouds, pressure, precip | 30 min |
| [USGS 02343801](https://waterdata.usgs.gov/monitoring-location/02343801/) | discharge below Walter F. George Dam (current/turbidity proxy) | 15 min |
| Client-side astronomy | sunrise/sunset, moon phase, solunar periods | computed |

Water temperature is estimated from a 72-hour rolling air-temp average
(shallow-lake model, ±4°F) — displayed with a `~` prefix.

The "Ask the guide" panel streams an explanation from the Anthropic API when
reachable and falls back to static guide-style text otherwise (the Anthropic
API blocks browser-origin CORS, so on a plain static host the fallback is
what renders — a small server-side proxy is needed for live streaming).

## Guide photo

Drop a photo at `public/guide.jpg` (square crop) and it appears in the header
and the explanation panel. See `public/PUT-GUIDE-PHOTO-HERE.md`.

## Run

```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # outputs dist/
```

## Deploy

- **GitHub Pages**: Settings → Pages → Source: *GitHub Actions*. The workflow
  in `.github/workflows/deploy.yml` builds and publishes on every push to main.
- **Vercel / Netlify**: import the repo — `vercel.json` / `netlify.toml` are
  already configured.
- Any static host: upload `dist/` with an SPA fallback to `index.html`.

---

## Capitol Trades — Congressional stock-trade tracker

A second, self-contained dashboard lives in this repo at **`/congress.html`**
(`npm run dev` → http://localhost:5173/congress.html). It tracks the stock
transactions members of the U.S. Congress must disclose under the **STOCK Act**
(periodic transaction reports), and renders:

- **KPIs** — trade count, estimated volume (sum of disclosure-bracket
  midpoints), unique members/tickers, buy-vs-sell split, and average
  disclosure lag (with a late-filing rate).
- **Charts** — volume over time (buys vs sells), most-traded tickers, party
  split, and buy/sell direction (Recharts).
- **Filters** — free-text search plus party, chamber, direction, ticker, and
  date-range.
- **Sortable transactions table** and a **most-active-traders leaderboard**;
  clicking any member opens a detail drawer with their full trade history.

### Data source

The dashboard ships with a **bundled sample dataset**
(`src/congress/data/seedTrades.json`) so it is fully functional offline — the
members and tickers are real, but the individual transactions are synthetic and
labelled *Sample data* in the UI. Regenerate it with:

```bash
node src/congress/data/generate.mjs
```

At runtime the app also attempts to fetch **live** disclosure feeds *in the
browser* (see `DEFAULT_SOURCES` in `src/congress/hooks/useCongressTrades.js`).
Any feed returning an array of periodic-transaction records — the House/Senate
"stock watcher" JSON shape is normalized automatically — works. Point it at a
reachable feed without rebuilding:

- add `?dataUrl=https://…/all_transactions.json` to the URL, or
- set `window.CONGRESS_DATA_URL = 'https://…'` before the app loads.

If no live feed is reachable, the dashboard falls back to the bundled sample
data and flags the source in the header.

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

### Data sources & methods

**How disclosure works.** Under the **STOCK Act (2012)**, members of Congress
must file a **Periodic Transaction Report (PTR)** within **45 days** of a
securities trade. Those filings are the raw material for every tracker.

#### Primary (official, free, no key)

| Source | What it gives you | Method | Trade-offs |
|---|---|---|---|
| **U.S. House Clerk** — `disclosures-clerk.house.gov` | Annual `‹YEAR›FD.zip` with an XML index of all filings; PTR PDFs at `/public_disc/ptr-pdfs/‹YEAR›/‹DocID›.pdf` | Download ZIP → parse `‹YEAR›FD.xml` → keep `FilingType = P` → fetch each PTR PDF | Authoritative & free, but transactions are in PDFs (newer are text, older are **scanned images needing OCR**) |
| **U.S. Senate eFD** — `efdsearch.senate.gov` | Senate PTRs; electronic filings are structured HTML | POST to accept the terms agreement (grabs a CSRF cookie), then query `/search/report/data/` | Requires the terms/cookie handshake; paper filings are PDFs |

A runnable implementation of the House-Clerk method ships at
[`src/congress/data/ingest-house-clerk.mjs`](src/congress/data/ingest-house-clerk.mjs)
(emits the PTR index; add a PDF/OCR step for line items). It needs outbound
network access to the Clerk host.

#### Structured third-party APIs (recommended for an app)

These parse the primary sources for you and return clean JSON (member, party,
chamber, ticker, type, amount range, dates). All require an API key and most
require a small CORS-adding proxy for browser use.

| Provider | Endpoint | Coverage / notes |
|---|---|---|
| **Quiver Quantitative** | `api.quiverquant.com/beta/bulk/congresstrading` (`Authorization: Bearer`) | **Best single feed** — both chambers, includes party, chamber & amount range |
| **Finnhub** | `finnhub.io/api/v1/stock/congressional-trading?symbol=…&token=…` | Generous free tier (60 req/min) but **symbol-scoped** — aggregate server-side |
| **Financial Modeling Prep** | `financialmodelingprep.com/stable/{house,senate}-latest?apikey=…` | Latest House/Senate disclosures |
| **EODHD** (beta) | single congressional-trades JSON endpoint | Adds parsed numeric bounds, days-to-disclosure & a late-filing flag |

> **Note on the old free feeds:** the community **House/Senate Stock Watcher**
> S3 datasets that many tutorials reference are **retired** — the buckets now
> return `403 AccessDenied` (last updated mid-2025). Don't build on them.

The normalizer (`src/congress/data/normalize.js`) already understands the
Quiver, Finnhub, FMP and stock-watcher field shapes, so any of the above works
once you supply a URL.

#### Wiring a live feed (no rebuild)

The recommended presets live in `SOURCE_PRESETS`
(`src/congress/hooks/useCongressTrades.js`). Point the app at your own
(proxied, key-injecting) endpoint at runtime via either:

- `?dataUrl=https://your-proxy.example/congress.json` in the address bar, or
- `window.CONGRESS_DATA_URL = 'https://your-proxy.example/congress.json'` before load.

A typical production setup is a tiny serverless function that calls Quiver or
Finnhub with the secret key, normalizes/caches the result, and serves CORS-open
JSON to the dashboard.

#### Bundled sample data (default)

Because no keyless, CORS-open feed exists anymore, the dashboard ships with a
**bundled sample dataset** (`src/congress/data/seedTrades.json`) and renders it
by default, flagged *Sample data* in the header. Members and tickers are real;
the individual transactions are synthetic. Regenerate it with:

```bash
node src/congress/data/generate.mjs
```

# Testing

Unit tests run on [Vitest](https://vitest.dev/).

```bash
npm test          # run once (CI)
npm run test:watch # watch mode
```

Tests live next to the code they cover as `*.test.js`.

## Current coverage

The suite focuses on the pure, dependency-free logic where a silent regression
would be hardest to notice — the scoring engine and the astronomy/solunar math.

| Area | File | What's covered |
| --- | --- | --- |
| Scoring orchestration | `src/engine/scoreEngine.test.js` | `classifyInflow`, `estimateWaterTemp` (window + clamp + null handling), `classifyBaro`, `buildConditions` (dawn/dusk/night windows, month), `scoreAll`, `projectHourly` (24h projection + guards) |
| Largemouth model | `src/engine/largemouthScore.test.js` | Water-temp / baro / time-of-day bands, spawn + upper-river-blowout modifiers, clamp, label/color/verdict bucketing, pill guard |
| Crappie model | `src/engine/crappieScore.test.js` | Water-temp / season / moon bands, spawn modifier, clamp + bucketing |
| Catfish model | `src/engine/catfishScore.test.js` | Warm-water + night bias, inflow switch (incl. default), falling-baro reward, summer-night modifier, bucketing |
| Solunar | `src/utils/solunar.test.js` | `classifySolunar` interval membership (inclusive bounds), `solunarPeriods` window durations + sort order |
| Astronomy | `src/utils/astronomy.test.js` | `moonPhase` (reference epoch, full-moon, all 8 phases, illumination bounds), `sunTimes`, `moonTimes` |

## Known issue pinned by a test

`src/utils/astronomy.test.js` contains one `it.fails` test documenting a real
bug: `sunTimes` stamps the computed sunset UT on the request's calendar day
without rolling forward when the UT crosses midnight. For Eufaula's western
longitude the summer sunset lands a full day early, so its timestamp is earlier
than sunrise. This skews `isDuskWindow` / `isNight` in `buildConditions`. The
`it.fails` test keeps the suite green while pinning the correct expectation for
whoever fixes it.

## Suggested next areas (not yet covered)

- **`streamExplanation`** (`src/services/anthropicService.js`) — SSE buffer
  splitting, partial-chunk carryover, `[DONE]` and malformed-JSON handling.
  Testable with a mocked `ReadableStream`, no network. `fallbackExplanation`
  bucket boundaries are also easy wins.
- **Hooks** (`src/hooks/useWeather.js`, `useGauge.js`, `useAstronomy.js`) —
  fetch mocking + `@testing-library/react`.
- **Components** — a smoke/integration test for `BiteScoreDashboard`.

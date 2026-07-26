# `pollcore` — tested reference implementation of the pipeline core

A working, exhaustively-tested Python implementation of the polling firm's
statistical core, validated against **known ground truth**. It builds a synthetic
electorate whose true result we know, injects the exact failure mode the firm
exists to solve (differential partisan nonresponse), and proves that the weighting
+ MRP pipeline recovers truth — while the diagnostics gate refuses to ship a number
on an unrecoverable sample.

This is the "build and test exhaustively first" foundation. No vendors, no hires,
no real PII — just the methodology, proven in code, ready to swap onto real data
(voter file + multi-mode field) later.

> Implements the design in
> [../11-technical-pipeline-spec.md](../11-technical-pipeline-spec.md) and
> [../03-house-methodology.md](../03-house-methodology.md). The production modeling
> engine is Bayesian MRP in Stan/`brms`; here it's a regularized (partial-pooling)
> logistic estimator with the identical API, so the pipeline shape is validated
> now and the engine is a drop-in later.

## What it demonstrates (empirically)

Running `python -m sim.validate` over 40 synthetic elections (n=1500 each):

| Estimator | Mean bias | MAE | RMSE |
|---|---|---|---|
| **Naive** (unweighted) | −5.1 pts | 5.1 pts | 5.3 pts |
| **Weighted** (raking) | ~0.0 pts | 0.9 pts | 1.1 pts |
| **MRP** (poststratified) | −0.1 pts | 0.9 pts | 1.1 pts |

**MRP cuts the naive error by ~83%.** And on an *unrecoverable* sample (extreme
partisan nonresponse that empties the Republican cells), the **diagnostics gate
FAILS** — encoding the guardrail that *a model never rescues a biased sample*.

## Modules (`pollcore/`)

| Module | What it does |
|---|---|
| `frame.py` | Synthetic electorate + known truth + frame margins + poststrat table |
| `sampling.py` | Differential-partisan-nonresponse sampler + `DynamicSampler` engine |
| `weighting.py` | Raking (IPF), Kish effective N / design effect, weight trimming |
| `turnout.py` | Probabilistic likely-voter model |
| `mrp.py` | Multilevel-style regression + poststratification estimator |
| `diagnostics.py` | The hard gate (cell coverage, max weight, effective N, fraud) |
| `flywheel.py` | Append-only, voter-id-keyed SQLite response store (opt-out honored) |
| `pipeline.py` | End-to-end run scored vs. truth |

## Tests (`tests/`) — 40 tests, all green

Coverage includes:
- Frame determinism, valid categories, truth self-consistency.
- Raking hits its targets exactly; effective-N/design-effect formulas verified on
  hand cases; weight trimming provably respects the cap.
- The sampler reproduces the intended partisan bias; `DynamicSampler` shrinks cell
  deficits and beats a naive draw on representativeness.
- Turnout model beats chance (AUC) and orders age correctly.
- **MRP beats raw subgroup means (Monte Carlo)** and recovers the top-line.
- The diagnostics gate passes normal samples and **fails the unrecoverable one**.
- The flywheel is append-only, persists to disk, and honors opt-outs without
  deleting history.
- **End-to-end (Monte Carlo):** weighting and MRP each cut the naive error by more
  than half; average MRP miss < 2 points.

## Run it

```bash
python3 -m venv .venv && . .venv/bin/activate
pip install -r requirements.txt

pytest                     # full suite (~25s)
python -m sim.validate     # accuracy report + guardrail demo
python -m sim.validate --reps 100 --pop 300000
```

## What is real vs. simulated

- **Real:** the statistical methods (raking, effective N, MRP/poststratification,
  probabilistic turnout, the diagnostics gate, the flywheel store) and the whole
  pipeline flow. These are the code that carries over to production.
- **Simulated:** the electorate and the responses, so we can score against a known
  truth. In production, `frame.py` is replaced by the licensed voter file and
  `sampling.py`'s draw by real multi-mode fielding (RumbleUp/CallFire/panel) — the
  downstream modules consume the same shapes unchanged.

## Guardrails honored in code

- **No AI in the estimate path.** These modules produce published numbers with
  statistics, not models-as-oracles. AI assist (per
  [../09-ai-model-selection.md](../09-ai-model-selection.md)) is upstream only.
- **The model never rescues a biased sample** — enforced by the diagnostics gate.
- **Reproducible:** every result is seeded and regenerable.

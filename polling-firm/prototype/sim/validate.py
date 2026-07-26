"""Runnable validation harness — the empirical case for the methodology.

Runs the full pipeline over many synthetic elections and prints a report comparing
naive vs. weighted vs. MRP accuracy against known truth, plus the diagnostics-gate
behavior on an unrecoverable sample.

Usage:
    python -m sim.validate            # default 40 replications
    python -m sim.validate --reps 100
"""
from __future__ import annotations

import argparse

import numpy as np

from pollcore import frame
from pollcore.pipeline import run_poll
from pollcore.sampling import draw_sample
from pollcore.diagnostics import diagnostics_gate
from pollcore.frame import frame_margins
from pollcore.weighting import rake, trim_weights


def main(reps: int = 40, pop_n: int = 200_000) -> None:
    print(f"Building synthetic electorate (n={pop_n:,})...")
    pop = frame.generate_population(n=pop_n, seed=7)
    truth = frame.true_topline(pop)
    print(f"True candidate support: {truth:.4f}\n")

    naive, weighted, mrp = [], [], []
    passed = 0
    for seed in range(reps):
        r = run_poll(pop, n_target=1500, seed=seed)
        naive.append(r.naive_error)
        weighted.append(r.weighted_error)
        mrp.append(r.mrp_error)
        passed += int(r.diagnostics.passed)

    def report(name, errs):
        errs = np.array(errs)
        print(
            f"  {name:9s}  mean bias {errs.mean():+.4f} | "
            f"MAE {np.abs(errs).mean():.4f} | "
            f"RMSE {np.sqrt((errs**2).mean()):.4f} | "
            f"max |err| {np.abs(errs).max():.4f}"
        )

    print(f"Accuracy over {reps} replications (n=1500 each):")
    report("naive", naive)
    report("weighted", weighted)
    report("mrp", mrp)

    naive_mae = np.abs(naive).mean()
    mrp_mae = np.abs(mrp).mean()
    print(
        f"\n  MRP cuts the naive error by "
        f"{(1 - mrp_mae / naive_mae) * 100:.0f}%."
    )
    print(f"  Diagnostics gate passed {passed}/{reps} normal runs.\n")

    # Guardrail demonstration: unrecoverable sample.
    print("Guardrail — extreme partisan nonresponse (party_penalty=-6.0):")
    margins = frame_margins(pop)
    s = draw_sample(pop, n_target=1500, seed=1, party_penalty=-6.0)
    w = trim_weights(rake(s, margins))
    diag = diagnostics_gate(s, w, margins)
    print("  " + diag.summary().replace("\n", "\n  "))
    print(
        "\n  => The gate refuses to ship a number on a broken sample "
        "(a model never rescues biased data)."
    )


if __name__ == "__main__":
    ap = argparse.ArgumentParser()
    ap.add_argument("--reps", type=int, default=40)
    ap.add_argument("--pop", type=int, default=200_000)
    args = ap.parse_args()
    main(reps=args.reps, pop_n=args.pop)

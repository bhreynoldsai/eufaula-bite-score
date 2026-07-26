"""The diagnostics gate — the hard stop before any number ships.

Encodes the firm's rule: a model never rescues a biased sample. If cells are
empty/under-covered, weights are extreme, or effective N collapses, the run FAILS
and the fix is to re-field (dynamic sampler), not to weight over the skew.
"""
from __future__ import annotations

from dataclasses import dataclass, field

import numpy as np
import pandas as pd

from .frame import CATEGORICAL, CATEGORIES
from .weighting import effective_n, weight_summary


@dataclass
class Check:
    name: str
    passed: bool
    detail: str


@dataclass
class DiagnosticsResult:
    passed: bool
    checks: list[Check] = field(default_factory=list)

    def failures(self) -> list[Check]:
        return [c for c in self.checks if not c.passed]

    def summary(self) -> str:
        status = "PASS" if self.passed else "FAIL"
        lines = [f"Diagnostics gate: {status}"]
        for c in self.checks:
            mark = "ok" if c.passed else "XX"
            lines.append(f"  [{mark}] {c.name}: {c.detail}")
        return "\n".join(lines)


DEFAULT_CONFIG = {
    "min_cell_coverage": 0.30,   # each category must reach >=30% of its expected share
    "max_weight_ratio": 5.0,     # no weight above 5x mean
    "min_effective_n_ratio": 0.50,  # effective N must be >=50% of raw N
    "max_fraud_rate": 0.15,      # opt-in quality-flag rate ceiling
}


def diagnostics_gate(
    sample: pd.DataFrame,
    weights: np.ndarray,
    frame_margins: dict[str, dict[str, float]],
    config: dict | None = None,
) -> DiagnosticsResult:
    cfg = {**DEFAULT_CONFIG, **(config or {})}
    checks: list[Check] = []
    n = len(sample)

    # 1. Cell coverage: every category present at a reasonable share PRE-weight.
    worst_var, worst_ratio = None, float("inf")
    for var, tgt in frame_margins.items():
        obs = sample[var].value_counts(normalize=True)
        for cat, target_prop in tgt.items():
            if target_prop <= 0:
                continue
            ratio = obs.get(cat, 0.0) / target_prop
            if ratio < worst_ratio:
                worst_ratio, worst_var = ratio, f"{var}={cat}"
    cov_ok = worst_ratio >= cfg["min_cell_coverage"]
    checks.append(Check(
        "cell_coverage", cov_ok,
        f"worst cell {worst_var} at {worst_ratio:.2f}x expected "
        f"(floor {cfg['min_cell_coverage']:.2f})",
    ))

    # 2. Max weight ratio.
    ws = weight_summary(weights)
    mw_ok = ws["max_weight_ratio"] <= cfg["max_weight_ratio"]
    checks.append(Check(
        "max_weight_ratio", mw_ok,
        f"{ws['max_weight_ratio']:.2f}x (cap {cfg['max_weight_ratio']:.2f})",
    ))

    # 3. Effective N ratio.
    eff_ratio = (ws["effective_n"] / n) if n else 0.0
    en_ok = eff_ratio >= cfg["min_effective_n_ratio"]
    checks.append(Check(
        "effective_n_ratio", en_ok,
        f"{eff_ratio:.2f} ({ws['effective_n']:.0f}/{n}, floor "
        f"{cfg['min_effective_n_ratio']:.2f})",
    ))

    # 4. Fraud / attention (uses quality_flags if present, else 0).
    if "quality_flags" in sample.columns:
        flagged = sample["quality_flags"].apply(lambda x: bool(x)).mean()
    else:
        flagged = 0.0
    fr_ok = flagged <= cfg["max_fraud_rate"]
    checks.append(Check(
        "fraud_rate", fr_ok,
        f"{flagged:.2%} (cap {cfg['max_fraud_rate']:.0%})",
    ))

    passed = all(c.passed for c in checks)
    return DiagnosticsResult(passed=passed, checks=checks)

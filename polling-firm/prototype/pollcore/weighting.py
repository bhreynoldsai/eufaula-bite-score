"""Survey weighting: raking (iterative proportional fitting) + design diagnostics.

Implements raking from scratch (well-understood, fully testable) plus the Kish
effective-sample-size and design-effect measures the firm reports on every poll,
and weight trimming to protect effective N.
"""
from __future__ import annotations

import numpy as np
import pandas as pd


def rake(
    sample: pd.DataFrame,
    targets: dict[str, dict[str, float]],
    max_iter: int = 100,
    tol: float = 1e-7,
) -> np.ndarray:
    """Rake sample weights to marginal ``targets`` via IPF.

    ``targets`` maps a categorical column to {category: target_proportion}. Returns
    a weight per row, normalized to sum to ``len(sample)``.
    """
    n = len(sample)
    if n == 0:
        return np.zeros(0)
    w = np.ones(n, dtype=float)
    cols = {var: sample[var].to_numpy() for var in targets}

    for _ in range(max_iter):
        max_change = 0.0
        for var, tgt in targets.items():
            col = cols[var]
            total = w.sum()
            for cat, target_prop in tgt.items():
                mask = col == cat
                cur = w[mask].sum()
                if cur <= 0:
                    # No respondents in this cell: cannot rake to it. Skip; the
                    # diagnostics gate is responsible for catching empty cells.
                    continue
                desired = target_prop * total
                factor = desired / cur
                w[mask] *= factor
                max_change = max(max_change, abs(factor - 1.0))
        if max_change < tol:
            break

    # Normalize to sum to n (weights average 1.0)
    w *= n / w.sum()
    return w


def effective_n(weights: np.ndarray) -> float:
    """Kish effective sample size: (Σw)^2 / Σ(w^2)."""
    weights = np.asarray(weights, dtype=float)
    if weights.size == 0 or np.all(weights == 0):
        return 0.0
    return float(weights.sum() ** 2 / np.square(weights).sum())


def design_effect(weights: np.ndarray) -> float:
    """Kish design effect: n / n_eff = 1 + CV(w)^2."""
    weights = np.asarray(weights, dtype=float)
    neff = effective_n(weights)
    if neff == 0:
        return float("inf")
    return float(len(weights) / neff)


def trim_weights(weights: np.ndarray, cap_ratio: float = 5.0) -> np.ndarray:
    """Cap weights at ``cap_ratio`` * mean while preserving the mean (=1).

    Normalizes to mean 1, then caps any weight above ``cap_ratio`` and
    redistributes the trimmed excess proportionally across the under-cap weights so
    the mean stays exactly 1. Iterates to a fixed point, guaranteeing
    ``max(w)/mean(w) <= cap_ratio``.
    """
    w = np.asarray(weights, dtype=float).copy()
    n = len(w)
    if n == 0:
        return w
    w *= n / w.sum()  # mean 1 (sum n)
    cap = cap_ratio   # mean is 1, so the cap is cap_ratio in absolute terms
    for _ in range(1000):
        over = w > cap
        if not over.any():
            break
        excess = float((w[over] - cap).sum())
        w[over] = cap
        under = ~over
        under_sum = w[under].sum()
        if under_sum <= 0:
            break
        w[under] += excess * (w[under] / under_sum)
    return w


def weighted_mean(values: np.ndarray, weights: np.ndarray) -> float:
    values = np.asarray(values, dtype=float)
    weights = np.asarray(weights, dtype=float)
    tot = weights.sum()
    if tot == 0:
        return float("nan")
    return float((values * weights).sum() / tot)


def weight_summary(weights: np.ndarray) -> dict[str, float]:
    w = np.asarray(weights, dtype=float)
    mean = w.mean() if w.size else 0.0
    return {
        "n": int(w.size),
        "effective_n": effective_n(w),
        "design_effect": design_effect(w),
        "max_weight_ratio": float(w.max() / mean) if w.size and mean else float("inf"),
        "min_weight_ratio": float(w.min() / mean) if w.size and mean else 0.0,
    }

"""Sampling with differential partisan nonresponse + the dynamic sampling engine.

``draw_sample`` reproduces the exact failure mode the firm exists to solve:
Republican / low-trust voters respond at lower rates, so the raw sample is
politically skewed *within* demographic cells. ``DynamicSampler`` implements the
Change-Research-style engine that reallocates fielding effort toward
underrepresented cells in real time.
"""
from __future__ import annotations

import numpy as np
import pandas as pd

from .frame import CATEGORICAL, CATEGORIES

# Response-propensity logit: Republicans and younger/non-college respond less.
_RESPONSE = {
    "intercept": -0.20,
    "party": {"R": -0.60, "D": 0.20, "I": 0.00},
    "education": {"noncollege": -0.10, "college": 0.30},
    "age_band": {"18-34": -0.30, "35-49": 0.00, "50-64": 0.10, "65+": 0.30},
}


def _sigmoid(x):
    return 1.0 / (1.0 + np.exp(-x))


def response_propensity(pop: pd.DataFrame, party_penalty: float | None = None) -> np.ndarray:
    """Probability each voter responds if contacted.

    ``party_penalty`` overrides the R party effect to simulate mild vs. extreme
    nonresponse (used by the diagnostics-gate 'unrecoverable sample' test).
    """
    logit = np.full(len(pop), _RESPONSE["intercept"], dtype=float)
    party_eff = dict(_RESPONSE["party"])
    if party_penalty is not None:
        party_eff["R"] = party_penalty
    logit += pop["party"].map(party_eff).to_numpy()
    logit += pop["education"].map(_RESPONSE["education"]).to_numpy()
    logit += pop["age_band"].map(_RESPONSE["age_band"]).to_numpy()
    return _sigmoid(logit)


def draw_sample(
    pop: pd.DataFrame,
    n_target: int = 1500,
    seed: int = 0,
    party_penalty: float | None = None,
) -> pd.DataFrame:
    """Draw a biased respondent sample (probability proportional to propensity).

    Returns the sampled rows with their observed ``support`` — i.e. what the firm
    actually collects before weighting.
    """
    rng = np.random.default_rng(seed)
    prop = response_propensity(pop, party_penalty=party_penalty)
    p = prop / prop.sum()
    n_target = min(n_target, len(pop))
    idx = rng.choice(len(pop), size=n_target, replace=False, p=p)
    sample = pop.iloc[idx].copy().reset_index(drop=True)
    sample["response_propensity"] = prop[idx]
    return sample


def cell_counts(df: pd.DataFrame, by: list[str]) -> pd.Series:
    return df.groupby(by, observed=True).size()


class DynamicSampler:
    """Real-time adaptive sampler: fill underrepresented cells first.

    Given target cell proportions (from the frame) and the respondents collected so
    far, each ``step`` draws the next batch preferentially from the cells that are
    most under target — the software analog of retargeting SMS/ad spend.
    """

    def __init__(self, pop: pd.DataFrame, by: list[str] | None = None, seed: int = 0):
        self.pop = pop
        self.by = by or ["party", "age_band"]
        self.rng = np.random.default_rng(seed)
        self.base_prop = response_propensity(pop)
        # Target proportions per cell, from the frame. Normalize index to tuples
        # so single- and multi-column `by` both key consistently.
        tgt = pop.groupby(self.by, observed=True).size()
        tgt.index = [k if isinstance(k, tuple) else (k,) for k in tgt.index]
        self.target = (tgt / tgt.sum()).to_dict()
        # Precompute row -> cell key.
        self._cell_key = list(
            zip(*[pop[c].to_numpy() for c in self.by])
        )
        self._cell_key = np.array(self._cell_key, dtype=object)
        self.collected_idx: list[int] = []

    def _current_counts(self) -> dict:
        if not self.collected_idx:
            return {k: 0 for k in self.target}
        keys = [tuple(self._cell_key[i]) for i in self.collected_idx]
        s = pd.Series(keys).value_counts().to_dict()
        return {k: int(s.get(k, 0)) for k in self.target}

    def max_deficit(self) -> float:
        """Largest positive (target_share - current_share) across cells."""
        n = len(self.collected_idx)
        counts = self._current_counts()
        if n == 0:
            return max(self.target.values())
        worst = 0.0
        for k, tprop in self.target.items():
            cur = counts.get(k, 0) / n
            worst = max(worst, tprop - cur)
        return worst

    def step(self, batch: int = 200) -> None:
        """Collect ``batch`` more respondents, biased toward deficit cells."""
        n = len(self.collected_idx)
        counts = self._current_counts()
        # Per-cell deficit weight (>=0), plus a small floor so nothing is starved.
        deficit = {}
        for k, tprop in self.target.items():
            cur = (counts.get(k, 0) / n) if n else 0.0
            deficit[k] = max(0.0, tprop - cur) + 0.05 * tprop

        already = set(self.collected_idx)
        # Row score = base response propensity * its cell's deficit weight.
        keys = [tuple(row) for row in self._cell_key]
        score = self.base_prop * np.array([deficit[k] for k in keys])
        score[list(already)] = 0.0
        total = score.sum()
        if total <= 0:
            return
        p = score / total
        take = min(batch, int((score > 0).sum()))
        idx = self.rng.choice(len(self.pop), size=take, replace=False, p=p)
        self.collected_idx.extend(int(i) for i in idx)

    def collected(self) -> pd.DataFrame:
        return self.pop.iloc[self.collected_idx].copy().reset_index(drop=True)

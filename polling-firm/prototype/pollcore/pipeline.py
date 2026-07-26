"""End-to-end pipeline: draw -> weight -> gate -> MRP, scored vs known truth.

Ties the modules together and returns everything needed to judge the run against
the synthetic electorate's ground truth: the naive (unweighted) estimate, the
raked-weighted estimate, the MRP estimate, the diagnostics gate result, and the
errors of each versus truth.
"""
from __future__ import annotations

from dataclasses import dataclass

import numpy as np
import pandas as pd

from . import frame as frame_mod
from .diagnostics import DiagnosticsResult, diagnostics_gate
from .mrp import MRPEstimator
from .sampling import draw_sample
from .weighting import rake, trim_weights, weighted_mean, weight_summary


@dataclass
class PollResult:
    truth: float
    naive: float
    weighted: float
    mrp: float
    diagnostics: DiagnosticsResult
    weight_summary: dict

    @property
    def naive_error(self) -> float:
        return self.naive - self.truth

    @property
    def weighted_error(self) -> float:
        return self.weighted - self.truth

    @property
    def mrp_error(self) -> float:
        return self.mrp - self.truth


def run_poll(
    pop: pd.DataFrame,
    n_target: int = 1500,
    seed: int = 0,
    party_penalty: float | None = None,
    among_voters: bool = False,
    mrp_C: float = 0.5,
) -> PollResult:
    truth = frame_mod.true_topline(pop, among_voters=among_voters)
    margins = frame_mod.frame_margins(pop)
    poststrat = frame_mod.poststrat_table(pop)

    sample = draw_sample(pop, n_target=n_target, seed=seed, party_penalty=party_penalty)

    # Naive: unweighted respondent mean (what a lazy shop reports).
    naive = float(sample["support"].mean())

    # Raked + trimmed weights.
    w = rake(sample, margins)
    w = trim_weights(w, cap_ratio=5.0)
    weighted = weighted_mean(sample["support"].to_numpy(), w)

    # Diagnostics gate.
    diag = diagnostics_gate(sample, w, margins)

    # MRP (poststratified; optionally to the modeled electorate).
    est = MRPEstimator(C=mrp_C).fit(sample)
    mrp = est.estimate(poststrat, use_turnout=among_voters)

    return PollResult(
        truth=truth,
        naive=naive,
        weighted=weighted,
        mrp=mrp,
        diagnostics=diag,
        weight_summary=weight_summary(w),
    )

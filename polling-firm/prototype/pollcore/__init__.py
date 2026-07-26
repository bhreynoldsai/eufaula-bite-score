"""pollcore — tested reference implementation of the polling firm's pipeline core.

Modules:
    frame       synthetic electorate + known ground truth + frame margins / poststrat
    sampling    differential-partisan-nonresponse sampler + dynamic sampling engine
    weighting   raking (IPF), Kish effective N / design effect, trimming
    turnout     probabilistic likely-voter model
    mrp         multilevel-style regression + poststratification estimator
    diagnostics the hard gate that fails on an unrecoverable sample
    flywheel    append-only, voter-id-keyed SQLite response store
    pipeline    end-to-end run scored vs. truth
"""
from . import (  # noqa: F401
    diagnostics,
    flywheel,
    frame,
    mrp,
    pipeline,
    sampling,
    turnout,
    weighting,
)

__all__ = [
    "frame",
    "sampling",
    "weighting",
    "turnout",
    "mrp",
    "diagnostics",
    "flywheel",
    "pipeline",
]

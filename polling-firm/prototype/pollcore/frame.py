"""Synthetic electorate + voter-file frame with KNOWN ground truth.

This module is the test bench for the whole pipeline. It builds a large synthetic
population whose true candidate support is generated from a known logit model, so
every downstream estimate (weighting, MRP) can be scored against a real
finite-population truth. It also exposes the frame's marginal proportions (raking
targets) and a poststratification table (cell populations) — mirroring what a real
voter file (L2 -> i360/DataTrust) provides in production.

Categories and the truth model are fixed and documented so tests are deterministic
given a seed.
"""
from __future__ import annotations

import numpy as np
import pandas as pd

# --- Fixed category vocabularies (shared across the whole package) ---
AGE_BANDS = ["18-34", "35-49", "50-64", "65+"]
RACE = ["white", "black", "hispanic", "other"]
EDU = ["noncollege", "college"]
REGION = ["R1", "R2", "R3", "R4", "R5"]
PARTY = ["R", "D", "I"]

CATEGORICAL = ["age_band", "race", "education", "region", "party"]
CATEGORIES = {
    "age_band": AGE_BANDS,
    "race": RACE,
    "education": EDU,
    "region": REGION,
    "party": PARTY,
}

# --- True marginal distributions of the electorate ---
_MARGINS = {
    "age_band": [0.30, 0.25, 0.25, 0.20],
    "race": [0.62, 0.13, 0.17, 0.08],
    "education": [0.60, 0.40],
    "region": [0.25, 0.22, 0.20, 0.18, 0.15],
    "party": [0.36, 0.36, 0.28],
}

# --- Known truth: logit coefficients for candidate SUPPORT ---
_SUPPORT = {
    "intercept": -0.10,
    "age_band": {"18-34": -0.20, "35-49": 0.00, "50-64": 0.10, "65+": 0.20},
    "race": {"white": 0.30, "black": -0.90, "hispanic": -0.30, "other": -0.10},
    "education": {"noncollege": 0.25, "college": -0.25},
    "party": {"R": 1.60, "D": -1.60, "I": 0.00},
    "region": {"R1": 0.10, "R2": -0.10, "R3": 0.20, "R4": -0.20, "R5": 0.00},
    "cell_noise_sd": 0.15,
}

# --- Known truth: logit coefficients for TURNOUT (voted) ---
_TURNOUT = {
    "intercept": 0.20,
    "age_band": {"18-34": -0.30, "35-49": 0.00, "50-64": 0.30, "65+": 0.60},
    "education": {"noncollege": -0.20, "college": 0.40},
    "party": {"R": 0.15, "D": 0.15, "I": -0.30},
    "region": {"R1": 0.05, "R2": -0.05, "R3": 0.00, "R4": 0.05, "R5": -0.05},
}


def _sigmoid(x: np.ndarray) -> np.ndarray:
    return 1.0 / (1.0 + np.exp(-x))


def region_prior() -> dict[str, float]:
    """Region-level numeric covariate (the geographic predictor MRP leans on)."""
    return dict(_SUPPORT["region"])


def generate_population(n: int = 150_000, seed: int = 0) -> pd.DataFrame:
    """Build the synthetic electorate.

    Returns a DataFrame with categorical attributes, a numeric region covariate,
    a latent true support probability ``p_support``, a realized binary ``support``,
    a latent turnout probability ``p_turnout`` and realized binary ``voted``.
    The population is large so realized means closely track the latent truth.
    """
    rng = np.random.default_rng(seed)
    cols = {}
    for var in CATEGORICAL:
        cols[var] = rng.choice(CATEGORIES[var], size=n, p=_MARGINS[var])
    pop = pd.DataFrame(cols)

    # Cell-level noise keyed to the full cross of categories (partial-pool target).
    cell_key = pop[CATEGORICAL].agg("|".join, axis=1)
    uniq = cell_key.unique()
    noise_map = {
        k: rng.normal(0.0, _SUPPORT["cell_noise_sd"]) for k in uniq
    }
    cell_noise = cell_key.map(noise_map).to_numpy()

    # Support logit
    logit = np.full(n, _SUPPORT["intercept"], dtype=float)
    for var in ["age_band", "race", "education", "party", "region"]:
        logit += pop[var].map(_SUPPORT[var]).to_numpy()
    logit += cell_noise
    pop["p_support"] = _sigmoid(logit)
    pop["support"] = (rng.random(n) < pop["p_support"]).astype(int)

    # Turnout logit
    tlogit = np.full(n, _TURNOUT["intercept"], dtype=float)
    for var in ["age_band", "education", "party", "region"]:
        tlogit += pop[var].map(_TURNOUT[var]).to_numpy()
    tlogit += rng.normal(0.0, 0.2, size=n)
    pop["p_turnout"] = _sigmoid(tlogit)
    pop["voted"] = (rng.random(n) < pop["p_turnout"]).astype(int)

    # Numeric geographic covariate for MRP
    rp = region_prior()
    pop["region_prior"] = pop["region"].map(rp).to_numpy()

    # Stable voter id (the flywheel key)
    pop.insert(0, "voter_id", np.arange(n, dtype=np.int64))
    return pop


def true_topline(pop: pd.DataFrame, among_voters: bool = False) -> float:
    """The election result we are trying to recover."""
    if among_voters:
        v = pop[pop["voted"] == 1]
        return float(v["support"].mean())
    return float(pop["support"].mean())


def true_subgroup(pop: pd.DataFrame, by: list[str], among_voters: bool = False) -> pd.Series:
    """True support by subgroup — the target MRP subgroup estimates are scored on."""
    df = pop[pop["voted"] == 1] if among_voters else pop
    return df.groupby(by)["support"].mean()


def frame_margins(pop: pd.DataFrame) -> dict[str, dict[str, float]]:
    """Raking targets: the frame's true marginal proportions per variable."""
    out: dict[str, dict[str, float]] = {}
    for var in CATEGORICAL:
        counts = pop[var].value_counts(normalize=True)
        out[var] = {cat: float(counts.get(cat, 0.0)) for cat in CATEGORIES[var]}
    return out


def poststrat_table(pop: pd.DataFrame) -> pd.DataFrame:
    """Cell populations for poststratification (from the frame).

    One row per occupied cell of the full categorical cross, with the cell
    population count, mean turnout probability, and (for validation only) the true
    cell support mean. Production builds this from the voter file; here it carries
    the truth so tests can score MRP per cell.
    """
    grp = pop.groupby(CATEGORICAL, observed=True)
    tbl = grp.agg(
        n_pop=("voter_id", "size"),
        p_turnout=("p_turnout", "mean"),
        true_support=("support", "mean"),
    ).reset_index()
    rp = region_prior()
    tbl["region_prior"] = tbl["region"].map(rp).to_numpy()
    return tbl

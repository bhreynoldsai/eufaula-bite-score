"""MRP: multilevel-style regression + poststratification.

Fits a regularized logistic model of candidate support on individual + geographic
predictors, then poststratifies the fitted cell probabilities against the frame's
cell populations. L2 regularization on the one-hot cell dummies is used as a
partial-pooling approximation: it shrinks noisy small-cell estimates toward the
population mean, which is the core benefit MRP delivers over raw subgroup means.

(In production this is a Bayesian multilevel model in Stan/brms. The estimator API
here is identical; only the fitting engine differs. See 11-technical-pipeline-spec.md.)
"""
from __future__ import annotations

import numpy as np
import pandas as pd
from sklearn.linear_model import LogisticRegression

from .frame import CATEGORICAL

_FEATURES = ["age_band", "race", "education", "party", "region"]


class MRPEstimator:
    """Fit on respondents, predict per poststrat cell, aggregate to any geography."""

    def __init__(self, C: float = 0.5):
        # Lower C => stronger L2 => more shrinkage (partial pooling).
        self.C = C
        self.model = LogisticRegression(max_iter=2000, C=C)
        self._columns: list[str] | None = None

    def _design(self, df: pd.DataFrame) -> pd.DataFrame:
        X = pd.get_dummies(df[_FEATURES].astype("category"), drop_first=False)
        X["region_prior"] = df["region_prior"].to_numpy()
        if self._columns is None:
            self._columns = list(X.columns)
        else:
            X = X.reindex(columns=self._columns, fill_value=0)
        return X

    def fit(self, sample: pd.DataFrame) -> "MRPEstimator":
        X = self._design(sample)
        y = sample["support"].to_numpy()
        self.model.fit(X, y)
        return self

    def predict_cells(self, poststrat: pd.DataFrame) -> np.ndarray:
        """Predicted support probability for every poststratification cell."""
        X = self._design(poststrat)
        return self.model.predict_proba(X)[:, 1]

    def estimate(
        self,
        poststrat: pd.DataFrame,
        use_turnout: bool = False,
        subgroup: list[str] | None = None,
    ):
        """Poststratified estimate(s).

        Weight each cell by its population (optionally * mean turnout probability
        for a likely-voter estimate). Returns a float top-line, or a Series indexed
        by ``subgroup`` when provided.
        """
        p = self.predict_cells(poststrat)
        w = poststrat["n_pop"].to_numpy(dtype=float)
        if use_turnout:
            w = w * poststrat["p_turnout"].to_numpy(dtype=float)

        if subgroup is None:
            return float((p * w).sum() / w.sum())

        df = poststrat[subgroup].copy()
        df["_num"] = p * w
        df["_den"] = w
        agg = df.groupby(subgroup, observed=True)[["_num", "_den"]].sum()
        return (agg["_num"] / agg["_den"]).rename("mrp_support")

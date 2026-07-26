"""Probabilistic likely-voter model.

A calibrated turnout-probability model (logistic on voter-file + survey features)
used to weight respondents by likelihood to vote — the firm's probabilistic LV
approach, not a hard cutoff screen.
"""
from __future__ import annotations

import numpy as np
import pandas as pd
from sklearn.linear_model import LogisticRegression

from .frame import CATEGORICAL

_FEATURES = ["age_band", "education", "party", "region"]


class TurnoutModel:
    """Predicts P(voted) from voter attributes."""

    def __init__(self, C: float = 1.0):
        self.C = C
        self.model = LogisticRegression(max_iter=1000, C=C)
        self._columns: list[str] | None = None

    def _design(self, df: pd.DataFrame) -> pd.DataFrame:
        X = pd.get_dummies(df[_FEATURES].astype("category"), drop_first=False)
        if self._columns is None:
            self._columns = list(X.columns)
        else:
            X = X.reindex(columns=self._columns, fill_value=0)
        return X

    def fit(self, sample: pd.DataFrame) -> "TurnoutModel":
        X = self._design(sample)
        y = sample["voted"].to_numpy()
        self.model.fit(X, y)
        return self

    def predict_proba(self, df: pd.DataFrame) -> np.ndarray:
        X = self._design(df)
        return self.model.predict_proba(X)[:, 1]

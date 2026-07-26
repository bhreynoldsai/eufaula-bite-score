import numpy as np
import pandas as pd
import pytest

from pollcore import weighting


def _toy_sample():
    # 100 rows, party skewed 70/30 R/D; frame target is 50/50.
    parties = ["R"] * 70 + ["D"] * 30
    ages = (["18-34", "65+"] * 50)
    return pd.DataFrame({"party": parties, "age_band": ages})


def test_rake_hits_targets():
    df = _toy_sample()
    targets = {
        "party": {"R": 0.5, "D": 0.5},
        "age_band": {"18-34": 0.5, "65+": 0.5},
    }
    w = weighting.rake(df, targets)
    # Weighted party proportions should now match the 50/50 target.
    for cat in ("R", "D"):
        mask = (df["party"] == cat).to_numpy()
        assert w[mask].sum() / w.sum() == pytest.approx(0.5, abs=1e-4)
    # Weights average to 1.
    assert w.mean() == pytest.approx(1.0, abs=1e-9)


def test_rake_empty_sample():
    df = pd.DataFrame({"party": []})
    w = weighting.rake(df, {"party": {"R": 0.5, "D": 0.5}})
    assert w.shape == (0,)


def test_effective_n_equal_weights():
    w = np.ones(500)
    assert weighting.effective_n(w) == pytest.approx(500.0)
    assert weighting.design_effect(w) == pytest.approx(1.0)


def test_effective_n_unequal_weights():
    # Known case: half weight 2, half weight 0.5, n=100.
    w = np.array([2.0] * 50 + [0.5] * 50)
    neff = weighting.effective_n(w)
    # (sum)^2 / sum(sq) = 125^2 / (200+12.5) = 15625/212.5
    assert neff == pytest.approx(15625 / 212.5, rel=1e-9)
    assert neff < 100  # unequal weights lose effective sample size


def test_trim_caps_extreme_weights():
    w = np.array([100.0] + [1.0] * 99)
    trimmed = weighting.trim_weights(w, cap_ratio=5.0)
    assert trimmed.max() / trimmed.mean() <= 5.0 + 1e-6
    assert trimmed.mean() == pytest.approx(1.0, abs=1e-9)


def test_weighted_mean_matches_numpy():
    vals = np.array([0.0, 1.0, 1.0, 0.0])
    w = np.array([1.0, 3.0, 1.0, 1.0])
    assert weighting.weighted_mean(vals, w) == pytest.approx(np.average(vals, weights=w))


def test_weight_summary_keys():
    w = np.random.default_rng(0).uniform(0.5, 2.0, size=200)
    s = weighting.weight_summary(w)
    assert {"n", "effective_n", "design_effect", "max_weight_ratio"} <= set(s)
    assert s["n"] == 200

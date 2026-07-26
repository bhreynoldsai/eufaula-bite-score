import numpy as np
import pandas as pd

from pollcore import frame


def test_population_shape_and_determinism():
    a = frame.generate_population(n=5000, seed=3)
    b = frame.generate_population(n=5000, seed=3)
    assert len(a) == 5000
    pd.testing.assert_frame_equal(a, b)  # same seed -> identical
    c = frame.generate_population(n=5000, seed=4)
    assert not a["support"].equals(c["support"])  # different seed -> different


def test_categories_valid(pop):
    for var, cats in frame.CATEGORIES.items():
        assert set(pop[var].unique()).issubset(set(cats))


def test_voter_id_unique(pop):
    assert pop["voter_id"].is_unique


def test_probabilities_in_range(pop):
    assert pop["p_support"].between(0, 1).all()
    assert pop["p_turnout"].between(0, 1).all()
    assert set(pop["support"].unique()).issubset({0, 1})
    assert set(pop["voted"].unique()).issubset({0, 1})


def test_frame_margins_sum_to_one(pop):
    m = frame.frame_margins(pop)
    for var, tgt in m.items():
        assert abs(sum(tgt.values()) - 1.0) < 1e-9


def test_poststrat_covers_population(pop):
    tbl = frame.poststrat_table(pop)
    assert tbl["n_pop"].sum() == len(pop)
    # Poststrat true topline (pop-weighted) matches the raw topline.
    ps_topline = float((tbl["true_support"] * tbl["n_pop"]).sum() / tbl["n_pop"].sum())
    assert abs(ps_topline - frame.true_topline(pop)) < 1e-9


def test_party_is_strong_support_driver(pop):
    means = pop.groupby("party")["support"].mean()
    # By construction R supports the candidate far more than D.
    assert means["R"] - means["D"] > 0.4


def test_true_subgroup_matches_manual(pop):
    s = frame.true_subgroup(pop, ["party"])
    manual = pop.groupby("party")["support"].mean()
    assert np.allclose(s.values, manual.reindex(s.index).values)

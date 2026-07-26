import numpy as np

from pollcore import sampling
from pollcore.frame import frame_margins


def test_sample_is_partisan_biased(pop):
    """The core failure mode: R under-represented in the raw sample."""
    frame_r = (pop["party"] == "R").mean()
    s = sampling.draw_sample(pop, n_target=3000, seed=5)
    sample_r = (s["party"] == "R").mean()
    assert sample_r < frame_r - 0.02  # Republicans meaningfully under-sampled


def test_sample_underestimates_support(pop):
    """Because R (pro-candidate) under-respond, naive support is biased low."""
    truth = pop["support"].mean()
    s = sampling.draw_sample(pop, n_target=3000, seed=5)
    assert s["support"].mean() < truth - 0.01


def test_sample_determinism(pop):
    a = sampling.draw_sample(pop, n_target=1000, seed=9)
    b = sampling.draw_sample(pop, n_target=1000, seed=9)
    assert a["voter_id"].tolist() == b["voter_id"].tolist()


def test_sample_no_duplicates(pop):
    s = sampling.draw_sample(pop, n_target=2000, seed=1)
    assert s["voter_id"].is_unique


def test_party_penalty_worsens_bias(pop):
    mild = sampling.draw_sample(pop, n_target=3000, seed=2)
    extreme = sampling.draw_sample(pop, n_target=3000, seed=2, party_penalty=-4.0)
    assert (extreme["party"] == "R").mean() < (mild["party"] == "R").mean()


def test_dynamic_sampler_reduces_deficit(pop):
    ds = sampling.DynamicSampler(pop, by=["party", "age_band"], seed=3)
    ds.step(batch=300)
    d0 = ds.max_deficit()
    for _ in range(6):
        ds.step(batch=300)
    d1 = ds.max_deficit()
    assert d1 < d0  # adaptive fielding shrinks the worst cell deficit
    assert len(ds.collected()) > 300


def test_dynamic_sampler_beats_naive_representativeness(pop):
    """Dynamic sample should track frame party mix better than a naive draw."""
    n = 1800
    frame_r = (pop["party"] == "R").mean()

    naive = sampling.draw_sample(pop, n_target=n, seed=4)
    naive_gap = abs((naive["party"] == "R").mean() - frame_r)

    ds = sampling.DynamicSampler(pop, by=["party"], seed=4)
    while len(ds.collected_idx) < n:
        ds.step(batch=300)
    dyn = ds.collected()
    dyn_gap = abs((dyn["party"] == "R").mean() - frame_r)

    assert dyn_gap < naive_gap

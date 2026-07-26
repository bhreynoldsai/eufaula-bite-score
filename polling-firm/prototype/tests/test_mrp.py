import numpy as np

from pollcore import frame, sampling
from pollcore.mrp import MRPEstimator


def test_mrp_topline_recovers_truth(big_pop):
    truth = frame.true_topline(big_pop)
    ps = frame.poststrat_table(big_pop)
    s = sampling.draw_sample(big_pop, n_target=2000, seed=1)
    mrp = MRPEstimator().fit(s).estimate(ps)
    assert abs(mrp - truth) < 0.03  # within 3 points despite biased sample


def test_mrp_beats_naive_topline(big_pop):
    truth = frame.true_topline(big_pop)
    ps = frame.poststrat_table(big_pop)
    s = sampling.draw_sample(big_pop, n_target=2000, seed=2)
    naive = s["support"].mean()
    mrp = MRPEstimator().fit(s).estimate(ps)
    assert abs(mrp - truth) < abs(naive - truth)


def test_mrp_beats_raw_subgroup_means_montecarlo(big_pop):
    """The central MRP claim: lower subgroup error than raw sample means.

    Averaged over many replications and many small subgroups (party x age x edu),
    MRP's poststratified subgroup estimates should have lower RMSE than the raw
    weighted-sample subgroup means, because partial pooling stabilizes small cells.
    """
    subgroup = ["party", "age_band", "education"]
    ps = big_pop.groupby(subgroup, observed=True)
    truth = ps["support"].mean()

    poststrat = frame.poststrat_table(big_pop)
    mrp_sq, raw_sq = [], []
    for seed in range(12):
        s = sampling.draw_sample(big_pop, n_target=1500, seed=seed)
        est = MRPEstimator().fit(s)
        mrp_sub = est.estimate(poststrat, subgroup=subgroup)
        raw_sub = s.groupby(subgroup, observed=True)["support"].mean()
        for key, t in truth.items():
            m = mrp_sub.get(key, np.nan)
            r = raw_sub.get(key, np.nan)
            if not np.isnan(m):
                mrp_sq.append((m - t) ** 2)
            if not np.isnan(r):
                raw_sq.append((r - t) ** 2)

    mrp_rmse = np.sqrt(np.mean(mrp_sq))
    raw_rmse = np.sqrt(np.mean(raw_sq))
    assert mrp_rmse < raw_rmse


def test_mrp_deterministic(big_pop):
    ps = frame.poststrat_table(big_pop)
    s = sampling.draw_sample(big_pop, n_target=1500, seed=3)
    a = MRPEstimator().fit(s).estimate(ps)
    b = MRPEstimator().fit(s).estimate(ps)
    assert a == b

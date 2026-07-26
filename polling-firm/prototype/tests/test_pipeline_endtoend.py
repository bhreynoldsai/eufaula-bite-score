"""End-to-end validation: the whole point of the prototype.

Proves, against known ground truth and averaged over many replications, that:
  1. The naive (unweighted) estimate is materially biased by partisan nonresponse.
  2. Weighting and MRP both cut that bias by a large factor.
  3. The pipeline is close enough to truth to be trustworthy.
"""
import numpy as np

from pollcore import frame
from pollcore.pipeline import run_poll


def test_pipeline_recovers_truth_single_run(big_pop):
    r = run_poll(big_pop, n_target=1500, seed=1)
    assert abs(r.weighted_error) < 0.03
    assert abs(r.mrp_error) < 0.03
    assert r.diagnostics.passed


def test_weighting_and_mrp_beat_naive_montecarlo(big_pop):
    naive_err, weighted_err, mrp_err = [], [], []
    for seed in range(20):
        r = run_poll(big_pop, n_target=1500, seed=seed)
        naive_err.append(abs(r.naive_error))
        weighted_err.append(abs(r.weighted_error))
        mrp_err.append(abs(r.mrp_error))

    mean_naive = np.mean(naive_err)
    mean_weighted = np.mean(weighted_err)
    mean_mrp = np.mean(mrp_err)

    # Naive is badly biased (several points); both corrections roughly halve it
    # or better. These are stable across the 20 replications.
    assert mean_naive > 0.03
    assert mean_weighted < mean_naive * 0.5
    assert mean_mrp < mean_naive * 0.5


def test_pipeline_mean_absolute_error_small(big_pop):
    errs = [abs(run_poll(big_pop, n_target=1500, seed=s).mrp_error) for s in range(20)]
    assert np.mean(errs) < 0.02  # avg MRP miss under 2 points

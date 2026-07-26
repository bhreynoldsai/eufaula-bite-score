import numpy as np
from sklearn.metrics import roc_auc_score

from pollcore import sampling
from pollcore.turnout import TurnoutModel


def test_turnout_model_predicts_better_than_chance(pop):
    train = sampling.draw_sample(pop, n_target=6000, seed=1)
    test = sampling.draw_sample(pop, n_target=6000, seed=2)
    m = TurnoutModel().fit(train)
    proba = m.predict_proba(test)
    auc = roc_auc_score(test["voted"], proba)
    assert auc > 0.60  # meaningfully better than 0.5


def test_turnout_probabilities_in_range(pop):
    s = sampling.draw_sample(pop, n_target=2000, seed=3)
    m = TurnoutModel().fit(s)
    p = m.predict_proba(s)
    assert np.all((p >= 0) & (p <= 1))


def test_turnout_ordering_by_age(pop):
    """Older voters should get higher predicted turnout (truth has that structure)."""
    s = sampling.draw_sample(pop, n_target=8000, seed=4)
    m = TurnoutModel().fit(s)
    s = s.copy()
    s["p"] = m.predict_proba(s)
    by_age = s.groupby("age_band")["p"].mean()
    assert by_age["65+"] > by_age["18-34"]

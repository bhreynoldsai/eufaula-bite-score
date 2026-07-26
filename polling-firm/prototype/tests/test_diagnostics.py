from pollcore import sampling
from pollcore.diagnostics import diagnostics_gate
from pollcore.frame import frame_margins
from pollcore.weighting import rake, trim_weights


def test_gate_passes_normal_sample(pop):
    margins = frame_margins(pop)
    s = sampling.draw_sample(pop, n_target=1500, seed=1)
    w = trim_weights(rake(s, margins))
    result = diagnostics_gate(s, w, margins)
    assert result.passed
    assert result.failures() == []


def test_gate_fails_unrecoverable_sample(pop):
    """Extreme partisan nonresponse empties/starves R cells -> gate FAILS.

    This encodes the guardrail 'a model never rescues a biased sample': when a
    category collapses below the coverage floor, we refuse to ship a number.
    """
    margins = frame_margins(pop)
    s = sampling.draw_sample(pop, n_target=1500, seed=1, party_penalty=-6.0)
    w = trim_weights(rake(s, margins))
    result = diagnostics_gate(s, w, margins)
    assert not result.passed
    names = {c.name for c in result.failures()}
    assert "cell_coverage" in names


def test_gate_flags_extreme_weights(pop):
    margins = frame_margins(pop)
    s = sampling.draw_sample(pop, n_target=1500, seed=1)
    w = rake(s, margins)  # NOT trimmed
    # Force one extreme weight to trip the cap.
    w = w.copy()
    w[0] = 50.0
    result = diagnostics_gate(s, w, margins, config={"max_weight_ratio": 5.0})
    assert not result.passed
    assert "max_weight_ratio" in {c.name for c in result.failures()}


def test_gate_summary_renders(pop):
    margins = frame_margins(pop)
    s = sampling.draw_sample(pop, n_target=1500, seed=1)
    w = trim_weights(rake(s, margins))
    text = diagnostics_gate(s, w, margins).summary()
    assert "Diagnostics gate:" in text
    assert "cell_coverage" in text

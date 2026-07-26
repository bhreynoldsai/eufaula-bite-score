import pytest

from pollcore import frame


@pytest.fixture(scope="session")
def pop():
    """A shared moderately-large synthetic electorate (fast, deterministic)."""
    return frame.generate_population(n=120_000, seed=1)


@pytest.fixture(scope="session")
def big_pop():
    """Larger electorate for lower Monte Carlo noise in accuracy tests."""
    return frame.generate_population(n=200_000, seed=7)

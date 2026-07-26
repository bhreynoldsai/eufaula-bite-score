from pollcore import sampling
from pollcore.flywheel import FlywheelStore


def test_append_and_count(pop):
    store = FlywheelStore()
    s = sampling.draw_sample(pop, n_target=500, seed=1)
    n = store.add_responses(s, poll_id="poll_a")
    assert n == 500
    assert store.total_responses() == 500
    store.close()


def test_flywheel_is_append_only_across_polls(pop):
    store = FlywheelStore()
    store.add_responses(sampling.draw_sample(pop, n_target=300, seed=1), "poll_a")
    store.add_responses(sampling.draw_sample(pop, n_target=400, seed=2), "poll_b")
    assert store.total_responses() == 700  # accumulates, never overwrites
    assert len(store.get_responses(poll_id="poll_a")) == 300
    store.close()


def test_opt_out_excludes_but_retains_history(pop):
    store = FlywheelStore()
    s = sampling.draw_sample(pop, n_target=200, seed=1)
    store.add_responses(s, "poll_a")
    vid = int(s["voter_id"].iloc[0])
    store.opt_out(vid)
    # Honored in reads...
    assert store.total_responses() < 200
    assert vid not in store.get_responses()["voter_id"].tolist()
    # ...but history is retained, not deleted.
    assert store.total_responses(include_opted_out=True) == 200
    store.close()


def test_persistence_to_disk(tmp_path, pop):
    db = tmp_path / "flywheel.db"
    store = FlywheelStore(db)
    store.add_responses(sampling.draw_sample(pop, n_target=250, seed=1), "poll_a")
    store.close()
    reopened = FlywheelStore(db)
    assert reopened.total_responses() == 250
    reopened.close()

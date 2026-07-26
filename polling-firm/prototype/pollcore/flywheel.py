"""The data flywheel — an append-only, voter-id-keyed response store (SQLite).

Every interview ever fielded is retained and keyed to the voter file, so each
successive model can pool historical responses. This is the proprietary
accumulating asset that is the firm's answer to Catalist (closed to Republicans).
Opt-outs are honored by flagging the voter_id, never by deleting history.
"""
from __future__ import annotations

import json
import sqlite3
from pathlib import Path

import pandas as pd

from .frame import CATEGORICAL


class FlywheelStore:
    def __init__(self, path: str | Path = ":memory:"):
        self.conn = sqlite3.connect(str(path))
        self._init_schema()

    def _init_schema(self) -> None:
        cur = self.conn.cursor()
        cur.execute(
            """
            CREATE TABLE IF NOT EXISTS responses (
                response_id INTEGER PRIMARY KEY AUTOINCREMENT,
                voter_id    INTEGER NOT NULL,
                poll_id     TEXT NOT NULL,
                mode        TEXT,
                age_band    TEXT, race TEXT, education TEXT,
                region      TEXT, party TEXT,
                support     INTEGER,
                field_ts    TEXT,
                raw_answers TEXT
            )
            """
        )
        cur.execute(
            "CREATE TABLE IF NOT EXISTS opt_outs (voter_id INTEGER PRIMARY KEY)"
        )
        cur.execute(
            "CREATE INDEX IF NOT EXISTS idx_resp_voter ON responses(voter_id)"
        )
        self.conn.commit()

    def add_responses(
        self, sample: pd.DataFrame, poll_id: str, mode: str = "sms", field_ts: str = "2026-01-01"
    ) -> int:
        rows = []
        for _, r in sample.iterrows():
            raw = {"support": int(r.get("support", 0))}
            rows.append((
                int(r["voter_id"]), poll_id, mode,
                r["age_band"], r["race"], r["education"], r["region"], r["party"],
                int(r.get("support", 0)), field_ts, json.dumps(raw),
            ))
        self.conn.executemany(
            """INSERT INTO responses
               (voter_id, poll_id, mode, age_band, race, education, region, party,
                support, field_ts, raw_answers)
               VALUES (?,?,?,?,?,?,?,?,?,?,?)""",
            rows,
        )
        self.conn.commit()
        return len(rows)

    def opt_out(self, voter_id: int) -> None:
        self.conn.execute(
            "INSERT OR IGNORE INTO opt_outs(voter_id) VALUES (?)", (int(voter_id),)
        )
        self.conn.commit()

    def total_responses(self, include_opted_out: bool = False) -> int:
        if include_opted_out:
            cur = self.conn.execute("SELECT COUNT(*) FROM responses")
        else:
            cur = self.conn.execute(
                "SELECT COUNT(*) FROM responses r "
                "WHERE r.voter_id NOT IN (SELECT voter_id FROM opt_outs)"
            )
        return int(cur.fetchone()[0])

    def get_responses(self, poll_id: str | None = None) -> pd.DataFrame:
        """Return responses honoring opt-outs (opted-out voters excluded)."""
        q = (
            "SELECT * FROM responses r "
            "WHERE r.voter_id NOT IN (SELECT voter_id FROM opt_outs)"
        )
        params: tuple = ()
        if poll_id is not None:
            q += " AND r.poll_id = ?"
            params = (poll_id,)
        return pd.read_sql_query(q, self.conn, params=params)

    def close(self) -> None:
        self.conn.close()

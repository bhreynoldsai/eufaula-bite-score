import { useCallback, useEffect, useRef, useState } from 'react';
import seed from '../data/seedTrades.json';
import { normalizeMany } from '../data/normalize.js';

// Live data is fetched in the *user's browser* at runtime, so it is not subject
// to any build-time egress policy. Point these at any reachable feed that
// returns an array of periodic-transaction records (the House/Senate
// "stock watcher" JSON shape is normalized automatically). Override without a
// rebuild via `?dataUrl=<url>` in the address bar or `window.CONGRESS_DATA_URL`.
export const DEFAULT_SOURCES = [
  {
    url: 'https://house-stock-watcher-data.s3-us-west-2.amazonaws.com/data/all_transactions.json',
    chamber: 'House',
  },
  {
    url: 'https://senate-stock-watcher-data.s3-us-west-2.amazonaws.com/aggregate/all_transactions.json',
    chamber: 'Senate',
  },
];

function overrideSources() {
  try {
    const q = new URLSearchParams(window.location.search).get('dataUrl');
    if (q) return [{ url: q, chamber: undefined }];
    if (window.CONGRESS_DATA_URL) {
      return [].concat(window.CONGRESS_DATA_URL).map((url) => ({ url, chamber: undefined }));
    }
  } catch {
    /* SSR / no window */
  }
  return null;
}

async function fetchSource(src, signal) {
  const res = await fetch(src.url, { signal });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const json = await res.json();
  const list = Array.isArray(json) ? json : json.transactions || json.data || [];
  return normalizeMany(list, src.chamber);
}

const SEED_TRADES = normalizeMany(seed.transactions);

/**
 * Loads congressional trades. The bundled seed dataset renders instantly; a
 * live fetch (when a reachable feed is configured) upgrades it in place.
 */
export function useCongressTrades({ live = true } = {}) {
  const [trades, setTrades] = useState(SEED_TRADES);
  const [source, setSource] = useState('seed'); // 'seed' | 'live' | 'partial'
  const [loading, setLoading] = useState(live);
  const [error, setError] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);
  const inflight = useRef(null);

  const load = useCallback(async () => {
    const sources = overrideSources() || DEFAULT_SOURCES;
    if (inflight.current) inflight.current.abort();
    const ctrl = new AbortController();
    inflight.current = ctrl;
    const timeout = setTimeout(() => ctrl.abort(), 15000);
    setLoading(true);
    try {
      const results = await Promise.allSettled(sources.map((s) => fetchSource(s, ctrl.signal)));
      const ok = results.filter((r) => r.status === 'fulfilled').flatMap((r) => r.value);
      const failed = results.filter((r) => r.status === 'rejected');
      if (ok.length) {
        setTrades(ok);
        setSource(failed.length ? 'partial' : 'live');
        setError(failed.length ? `${failed.length} source(s) unavailable` : null);
        setLastUpdated(new Date());
      } else {
        // Nothing reachable — keep the seed dataset already on screen.
        setSource('seed');
        setError(failed[0]?.reason?.message || 'Live feeds unreachable');
      }
    } catch (e) {
      if (e.name !== 'AbortError') setError(e.message);
    } finally {
      clearTimeout(timeout);
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!live) return;
    load();
    return () => inflight.current?.abort();
  }, [live, load]);

  return { trades, source, loading, error, lastUpdated, refresh: load, meta: seed.meta };
}

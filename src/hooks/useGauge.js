import { useEffect, useRef, useState, useCallback } from 'react';

// USGS 02343801 — Chattahoochee River below Walter F. George Dam near
// Fort Gaines, GA. Discharge doubles as a generation/current/turbidity proxy
// for the lake. Verify the site is still active at waterdata.usgs.gov if
// values stop arriving.
const URL = 'https://waterservices.usgs.gov/nwis/iv/'
  + '?format=json&sites=02343801&parameterCd=00060,00065&siteStatus=active';

const REFRESH_MS = 15 * 60 * 1000;

export function useGauge() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);
  const inflight = useRef(null);

  const fetchGauge = useCallback(async () => {
    if (inflight.current) inflight.current.abort();
    const ctrl = new AbortController();
    inflight.current = ctrl;
    const timeout = setTimeout(() => ctrl.abort(), 10000);

    setLoading(true);
    try {
      const res = await fetch(URL, { signal: ctrl.signal });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json = await res.json();
      const series = json?.value?.timeSeries || [];
      const out = { discharge: null, height: null };
      for (const s of series) {
        const code = s.variable.variableCode?.[0]?.value;
        const value = parseFloat(s.values?.[0]?.value?.[0]?.value);
        if (Number.isNaN(value) || value < 0) continue;
        if (code === '00060') out.discharge = value;
        else if (code === '00065') out.height = value;
      }
      setData(out);
      setError(null);
      setLastUpdated(new Date());
    } catch (e) {
      if (e.name !== 'AbortError') {
        console.error('[gauge]', URL, e.message);
        setError(e.message);
      }
    } finally {
      clearTimeout(timeout);
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchGauge();
    const id = setInterval(fetchGauge, REFRESH_MS);
    return () => clearInterval(id);
  }, [fetchGauge]);

  return { data, loading, error, lastUpdated, refresh: fetchGauge };
}

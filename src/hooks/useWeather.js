import { useEffect, useRef, useState, useCallback } from 'react';

// Lake Eufaula mid-lake, near Eufaula AL. The Alabama shore is Central time.
const URL = 'https://api.open-meteo.com/v1/forecast'
  + '?latitude=31.8950&longitude=-85.1200'
  + '&hourly=temperature_2m,precipitation,windspeed_10m,winddirection_10m,cloudcover,surface_pressure'
  + '&temperature_unit=fahrenheit&windspeed_unit=mph'
  + '&timezone=America/Chicago&forecast_days=2&past_days=3';

const REFRESH_MS = 30 * 60 * 1000;

export function useWeather() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);
  const inflight = useRef(null);

  const fetchWeather = useCallback(async () => {
    if (inflight.current) inflight.current.abort();
    const ctrl = new AbortController();
    inflight.current = ctrl;
    const timeout = setTimeout(() => ctrl.abort(), 10000);

    setLoading(true);
    try {
      const res = await fetch(URL, { signal: ctrl.signal });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json = await res.json();
      setData(json);
      setError(null);
      setLastUpdated(new Date());
    } catch (e) {
      if (e.name !== 'AbortError') {
        console.error('[weather]', URL, e.message);
        setError(e.message);
      }
    } finally {
      clearTimeout(timeout);
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchWeather();
    const id = setInterval(fetchWeather, REFRESH_MS);
    return () => clearInterval(id);
  }, [fetchWeather]);

  return { data, loading, error, lastUpdated, refresh: fetchWeather };
}

// Returns the index in the hourly arrays that matches the current local hour.
export function currentHourIndex(data) {
  if (!data || !data.hourly) return -1;
  const now = new Date();
  const target = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}T${pad(now.getHours())}:00`;
  const idx = data.hourly.time.indexOf(target);
  if (idx !== -1) return idx;
  // Fallback: closest preceding hour
  for (let i = data.hourly.time.length - 1; i >= 0; i--) {
    if (data.hourly.time[i] <= target) return i;
  }
  return 0;
}

function pad(n) { return String(n).padStart(2, '0'); }

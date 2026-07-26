import { describe, it, expect } from 'vitest';
import {
  classifyInflow,
  estimateWaterTemp,
  classifyBaro,
  buildConditions,
  scoreAll,
  projectHourly,
} from './scoreEngine.js';

describe('classifyInflow', () => {
  it('falls back to Normal for null/NaN', () => {
    expect(classifyInflow(null)).toBe('Normal');
    expect(classifyInflow(undefined)).toBe('Normal');
    expect(classifyInflow(NaN)).toBe('Normal');
  });

  it('classifies across the discharge thresholds', () => {
    expect(classifyInflow(0)).toBe('Very Low');
    expect(classifyInflow(2999)).toBe('Very Low');
    expect(classifyInflow(3000)).toBe('Normal');
    expect(classifyInflow(14999)).toBe('Normal');
    expect(classifyInflow(15000)).toBe('High');
    expect(classifyInflow(29999)).toBe('High');
    expect(classifyInflow(30000)).toBe('Flood/Turbid');
    expect(classifyInflow(50000)).toBe('Flood/Turbid');
  });
});

describe('estimateWaterTemp', () => {
  it('returns neutral fallback for empty/missing input', () => {
    expect(estimateWaterTemp(null, 0)).toBe(68);
    expect(estimateWaterTemp([], 0)).toBe(68);
  });

  it('returns fallback when the window contains only nulls', () => {
    expect(estimateWaterTemp([null, null, null], 2)).toBe(68);
  });

  it('averages the trailing 72-hour window and applies the -3 lag', () => {
    const air = new Array(100).fill(70);
    // avg 70 - 3 lag = 67
    expect(estimateWaterTemp(air, 99)).toBe(67);
  });

  it('only averages the 72-hour window, not the whole history', () => {
    const air = new Array(200).fill(50);
    // last 73 samples are 80 -> avg 80 - 3 = 77
    for (let i = 128; i < 200; i++) air[i] = 80;
    expect(estimateWaterTemp(air, 199)).toBe(77);
  });

  it('clamps to the 42-92 range', () => {
    expect(estimateWaterTemp(new Array(80).fill(120), 79)).toBe(92);
    expect(estimateWaterTemp(new Array(80).fill(10), 79)).toBe(42);
  });

  it('ignores null entries inside the window', () => {
    const air = [null, 60, null, 60, 60];
    // non-null values all 60 -> 60 - 3 = 57
    expect(estimateWaterTemp(air, 4)).toBe(57);
  });
});

describe('classifyBaro', () => {
  it('returns stable/zero when inputs are missing', () => {
    expect(classifyBaro(null, 1010)).toEqual({ trend: 'stable', rate: 0 });
    expect(classifyBaro(1010, null)).toEqual({ trend: 'stable', rate: 0 });
  });

  it('classifies rising above +0.5 mb/hr', () => {
    // (1013 - 1010) / 3 = 1 mb/hr
    expect(classifyBaro(1013, 1010).trend).toBe('rising');
  });

  it('classifies falling below -0.5 mb/hr', () => {
    // (1007 - 1010) / 3 = -1 mb/hr
    expect(classifyBaro(1007, 1010).trend).toBe('falling');
  });

  it('classifies stable inside the +/-0.5 band', () => {
    // (1011 - 1010) / 3 = 0.33 mb/hr
    expect(classifyBaro(1011, 1010).trend).toBe('stable');
  });

  it('reports the signed rate in mb/hr', () => {
    expect(classifyBaro(1013, 1010).rate).toBeCloseTo(1);
    expect(classifyBaro(1004, 1010).rate).toBeCloseTo(-2);
  });
});

describe('buildConditions', () => {
  const sunrise = new Date(2024, 3, 15, 6, 0);
  const sunset = new Date(2024, 3, 15, 19, 0);

  function base(overrides = {}) {
    return buildConditions({
      at: new Date(2024, 3, 15, 12, 0),
      zone: 'mid',
      waterTemp: 68,
      airTemp: 72,
      pressure: 1013,
      pressure3hAgo: 1013,
      wind: 8,
      windDir: 'S',
      clouds: 50,
      precip: 0,
      sunrise,
      sunset,
      moonPhase: 'Full Moon',
      moonIllumination: 100,
      solunarPeriods: [],
      inflowClass: 'Normal',
      ...overrides,
    });
  }

  it('flags the dawn window within -1..+2h of sunrise', () => {
    const c = base({ at: new Date(2024, 3, 15, 7, 0) });
    expect(c.isDawnWindow).toBe(true);
    expect(c.isDuskWindow).toBe(false);
  });

  it('flags the dusk window within -1..+2h of sunset', () => {
    const c = base({ at: new Date(2024, 3, 15, 18, 30) });
    expect(c.isDuskWindow).toBe(true);
  });

  it('flags night more than an hour outside sun times', () => {
    const c = base({ at: new Date(2024, 3, 15, 23, 0) });
    expect(c.isNight).toBe(true);
  });

  it('midday is neither dawn, dusk, nor night', () => {
    const c = base({ at: new Date(2024, 3, 15, 13, 0) });
    expect(c.isDawnWindow).toBe(false);
    expect(c.isDuskWindow).toBe(false);
    expect(c.isNight).toBe(false);
  });

  it('derives 0-indexed month from the timestamp', () => {
    expect(base().month).toBe(3); // April
  });

  it('passes the barometric trend through from classifyBaro', () => {
    const c = base({ pressure: 1013, pressure3hAgo: 1003 });
    expect(c.baroTrend).toBe('rising');
  });
});

describe('scoreAll', () => {
  it('returns a score object for all three species', () => {
    const c = buildConditions({
      at: new Date(2024, 3, 15, 7, 0),
      zone: 'mid',
      waterTemp: 66,
      airTemp: 70,
      pressure: 1013,
      pressure3hAgo: 1013,
      wind: 8,
      windDir: 'S',
      clouds: 80,
      precip: 0,
      sunrise: new Date(2024, 3, 15, 6, 0),
      sunset: new Date(2024, 3, 15, 19, 0),
      moonPhase: 'Full Moon',
      moonIllumination: 100,
      solunarPeriods: [],
      inflowClass: 'Normal',
    });
    const s = scoreAll(c);
    expect(s).toHaveProperty('largemouth');
    expect(s).toHaveProperty('crappie');
    expect(s).toHaveProperty('catfish');
    for (const fish of Object.values(s)) {
      expect(fish.score).toBeGreaterThanOrEqual(0);
      expect(fish.score).toBeLessThanOrEqual(100);
    }
  });
});

describe('projectHourly', () => {
  it('returns empty arrays when weather is missing', () => {
    expect(projectHourly({ weather: null })).toEqual({
      largemouth: [],
      crappie: [],
      catfish: [],
    });
  });

  it('returns empty arrays when today midnight is not in the series', () => {
    const weather = {
      hourly: { time: ['1999-01-01T00:00'], temperature_2m: [70] },
    };
    expect(projectHourly({ weather, zone: 'mid' })).toEqual({
      largemouth: [],
      crappie: [],
      catfish: [],
    });
  });

  it('produces a 24-hour projection for each species', () => {
    const today = new Date();
    const pad = (n) => String(n).padStart(2, '0');
    const time = [];
    const n = 48;
    // Build hourly timestamps starting at today's midnight local.
    const midnight = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 0, 0);
    for (let i = 0; i < n; i++) {
      const d = new Date(midnight.getTime() + i * 3600000);
      time.push(`${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:00`);
    }
    const weather = {
      hourly: {
        time,
        temperature_2m: new Array(n).fill(70),
        surface_pressure: new Array(n).fill(1013),
        windspeed_10m: new Array(n).fill(8),
        cloudcover: new Array(n).fill(50),
        precipitation: new Array(n).fill(0),
      },
    };
    const out = projectHourly({
      weather,
      zone: 'mid',
      sunrise: new Date(today.getFullYear(), today.getMonth(), today.getDate(), 6, 0),
      sunset: new Date(today.getFullYear(), today.getMonth(), today.getDate(), 19, 0),
      moonPhase: 'Full Moon',
      moonIllumination: 100,
      solunarPeriods: [],
      inflowClass: 'Normal',
    });
    expect(out.largemouth).toHaveLength(24);
    expect(out.crappie).toHaveLength(24);
    expect(out.catfish).toHaveLength(24);
    for (const v of out.largemouth) {
      expect(typeof v).toBe('number');
    }
  });
});

import { describe, it, expect } from 'vitest';
import { scoreLargemouth } from './largemouthScore.js';

// Neutral-ish baseline; individual tests override single fields to isolate a factor.
function cond(overrides = {}) {
  return {
    waterTemp: 68,
    baroTrend: 'stable',
    baroRate: 0,
    isDawnWindow: false,
    isDuskWindow: false,
    isNight: false,
    solunar: 'none',
    clouds: 50,
    wind: 8,
    moonPhase: 'Waxing Gibbous',
    month: 5, // June — outside spawn window
    zone: 'mid',
    inflowClass: 'Normal',
    ...overrides,
  };
}

function factor(result, name) {
  return result.factors.find((f) => f.name === name);
}

describe('scoreLargemouth water temp', () => {
  it('awards full points in the 62-75 prime band', () => {
    expect(factor(scoreLargemouth(cond({ waterTemp: 62 })), 'Water Temp').pts).toBe(20);
    expect(factor(scoreLargemouth(cond({ waterTemp: 75 })), 'Water Temp').pts).toBe(20);
  });
  it('steps down through the cooler and warmer bands', () => {
    expect(factor(scoreLargemouth(cond({ waterTemp: 55 })), 'Water Temp').pts).toBe(14);
    expect(factor(scoreLargemouth(cond({ waterTemp: 80 })), 'Water Temp').pts).toBe(10);
    expect(factor(scoreLargemouth(cond({ waterTemp: 85 })), 'Water Temp').pts).toBe(4);
  });
  it('gives the cold-water floor below 55', () => {
    expect(factor(scoreLargemouth(cond({ waterTemp: 48 })), 'Water Temp').pts).toBe(5);
  });
});

describe('scoreLargemouth barometric trend', () => {
  it('rewards stable pressure most', () => {
    expect(factor(scoreLargemouth(cond({ baroTrend: 'stable' })), 'Baro Trend').pts).toBe(18);
  });
  it('penalizes fast-falling pressure hardest', () => {
    expect(
      factor(scoreLargemouth(cond({ baroTrend: 'falling', baroRate: -1.5 })), 'Baro Trend').pts,
    ).toBe(4);
  });
  it('treats a gentle pre-front fall as workable', () => {
    expect(
      factor(scoreLargemouth(cond({ baroTrend: 'falling', baroRate: -0.6 })), 'Baro Trend').pts,
    ).toBe(10);
  });
});

describe('scoreLargemouth spawn modifier', () => {
  it('adds the spawn window bonus at 62-68F in Mar/Apr', () => {
    const r = scoreLargemouth(cond({ waterTemp: 65, month: 2 }));
    expect(factor(r, 'Spawn window')).toBeDefined();
  });
  it('does not apply the bonus outside the spawn months', () => {
    const r = scoreLargemouth(cond({ waterTemp: 65, month: 6 }));
    expect(factor(r, 'Spawn window')).toBeUndefined();
  });
});

describe('scoreLargemouth zone blowout modifier', () => {
  it('subtracts 10 for an upper-river flood blowout', () => {
    const normal = scoreLargemouth(cond({ zone: 'mid', inflowClass: 'Normal' }));
    const blown = scoreLargemouth(cond({ zone: 'upper', inflowClass: 'Flood/Turbid' }));
    expect(factor(blown, 'Upper-river blowout')).toBeDefined();
    expect(blown.score).toBeLessThan(normal.score);
  });
});

describe('scoreLargemouth output shape', () => {
  it('clamps the score into 0-100', () => {
    const r = scoreLargemouth(cond());
    expect(r.score).toBeGreaterThanOrEqual(0);
    expect(r.score).toBeLessThanOrEqual(100);
  });

  it('buckets label and color by score', () => {
    // Stack every favorable factor -> Excellent.
    const excellent = scoreLargemouth(
      cond({
        waterTemp: 66,
        baroTrend: 'stable',
        isDawnWindow: true,
        solunar: 'major',
        clouds: 90,
        wind: 8,
        moonPhase: 'Full Moon',
      }),
    );
    expect(excellent.label).toBe('Excellent');
    expect(excellent.color).toBe('#22c55e');
    expect(excellent.score).toBeGreaterThanOrEqual(76);

    // Strip everything favorable -> Tough.
    const tough = scoreLargemouth(
      cond({
        waterTemp: 48,
        baroTrend: 'falling',
        baroRate: -2,
        solunar: 'none',
        clouds: 10,
        wind: 25,
        moonPhase: 'Waxing Gibbous',
      }),
    );
    expect(tough.label).toBe('Tough');
    expect(tough.color).toBe('#ef4444');
    expect(tough.score).toBeLessThanOrEqual(30);
  });

  it('returns a non-empty verdict string', () => {
    expect(typeof scoreLargemouth(cond()).verdict).toBe('string');
    expect(scoreLargemouth(cond()).verdict.length).toBeGreaterThan(0);
  });

  it('marks a negative-points factor Unfavorable via the max===0 guard', () => {
    const r = scoreLargemouth(cond({ zone: 'upper', inflowClass: 'Flood/Turbid' }));
    expect(factor(r, 'Upper-river blowout').pill).toBe('Unfavorable');
  });
});

import { describe, it, expect } from 'vitest';
import { scoreCatfish } from './catfishScore.js';

function cond(overrides = {}) {
  return {
    waterTemp: 72,
    baroTrend: 'stable',
    baroRate: 0,
    isDawnWindow: false,
    isDuskWindow: false,
    isNight: false,
    solunar: 'none',
    wind: 8,
    moonPhase: 'Waxing Gibbous',
    month: 6, // July
    inflowClass: 'Normal',
    ...overrides,
  };
}

function factor(result, name) {
  return result.factors.find((f) => f.name === name);
}

describe('scoreCatfish water temp (warm bias)', () => {
  it('peaks in warm water above 75F', () => {
    expect(factor(scoreCatfish(cond({ waterTemp: 80 })), 'Water Temp').pts).toBe(20);
  });
  it('steps down as water cools', () => {
    expect(factor(scoreCatfish(cond({ waterTemp: 70 })), 'Water Temp').pts).toBe(16);
    expect(factor(scoreCatfish(cond({ waterTemp: 62 })), 'Water Temp').pts).toBe(10);
    expect(factor(scoreCatfish(cond({ waterTemp: 55 })), 'Water Temp').pts).toBe(6);
    expect(factor(scoreCatfish(cond({ waterTemp: 45 })), 'Water Temp').pts).toBe(3);
  });
});

describe('scoreCatfish time of day (night bias)', () => {
  it('favors night over dusk over dawn over midday', () => {
    expect(factor(scoreCatfish(cond({ isNight: true })), 'Time of Day').pts).toBe(18);
    expect(factor(scoreCatfish(cond({ isDuskWindow: true })), 'Time of Day').pts).toBe(15);
    expect(factor(scoreCatfish(cond({ isDawnWindow: true })), 'Time of Day').pts).toBe(12);
    expect(factor(scoreCatfish(cond()), 'Time of Day').pts).toBe(6);
  });
});

describe('scoreCatfish inflow/current', () => {
  it('rewards high generation flow and covers every class incl. default', () => {
    expect(factor(scoreCatfish(cond({ inflowClass: 'High' })), 'Inflow/Current').pts).toBe(15);
    expect(factor(scoreCatfish(cond({ inflowClass: 'Flood/Turbid' })), 'Inflow/Current').pts).toBe(12);
    expect(factor(scoreCatfish(cond({ inflowClass: 'Normal' })), 'Inflow/Current').pts).toBe(9);
    expect(factor(scoreCatfish(cond({ inflowClass: 'Very Low' })), 'Inflow/Current').pts).toBe(4);
    // Unknown class falls through to the default branch.
    expect(factor(scoreCatfish(cond({ inflowClass: 'Bogus' })), 'Inflow/Current').pts).toBe(9);
  });
});

describe('scoreCatfish barometric trend (falling is prime)', () => {
  it('rewards a gentle pre-front fall most', () => {
    expect(factor(scoreCatfish(cond({ baroTrend: 'falling', baroRate: -0.5 })), 'Baro Trend').pts).toBe(12);
  });
  it('ranks stable, fast-fall, then rising below it', () => {
    expect(factor(scoreCatfish(cond({ baroTrend: 'stable' })), 'Baro Trend').pts).toBe(9);
    expect(factor(scoreCatfish(cond({ baroTrend: 'falling', baroRate: -2 })), 'Baro Trend').pts).toBe(8);
    expect(factor(scoreCatfish(cond({ baroTrend: 'rising' })), 'Baro Trend').pts).toBe(5);
  });
});

describe('scoreCatfish summer-night modifier', () => {
  it('adds the bonus on hot-month nights (Jun-Aug)', () => {
    expect(factor(scoreCatfish(cond({ isNight: true, month: 6 })), 'Summer night bonus')).toBeDefined();
  });
  it('does not apply during the day', () => {
    expect(factor(scoreCatfish(cond({ isNight: false, month: 6 })), 'Summer night bonus')).toBeUndefined();
  });
  it('does not apply outside the hot months', () => {
    expect(factor(scoreCatfish(cond({ isNight: true, month: 10 })), 'Summer night bonus')).toBeUndefined();
  });
});

describe('scoreCatfish output shape', () => {
  it('clamps the score and buckets label/color', () => {
    const excellent = scoreCatfish(
      cond({ waterTemp: 82, isNight: true, month: 6, inflowClass: 'High', solunar: 'major', baroTrend: 'falling', baroRate: -0.5, moonPhase: 'Full Moon' }),
    );
    expect(excellent.score).toBeLessThanOrEqual(100);
    expect(excellent.label).toBe('Excellent');
    expect(excellent.color).toBe('#22c55e');

    const tough = scoreCatfish(
      cond({ waterTemp: 45, isNight: false, month: 0, inflowClass: 'Very Low', solunar: 'none', baroTrend: 'rising', moonPhase: 'Waxing Gibbous', wind: 25 }),
    );
    expect(tough.score).toBeGreaterThanOrEqual(0);
    expect(tough.label).toBe('Tough');
    expect(tough.color).toBe('#ef4444');
  });
});

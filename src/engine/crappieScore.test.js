import { describe, it, expect } from 'vitest';
import { scoreCrappie } from './crappieScore.js';

function cond(overrides = {}) {
  return {
    waterTemp: 64,
    baroTrend: 'stable',
    baroRate: 0,
    isDawnWindow: false,
    isDuskWindow: false,
    isNight: false,
    solunar: 'none',
    clouds: 50,
    moonPhase: 'Waxing Gibbous',
    month: 6, // July — off-peak season, no spawn
    ...overrides,
  };
}

function factor(result, name) {
  return result.factors.find((f) => f.name === name);
}

describe('scoreCrappie water temp', () => {
  it('awards full points in the 58-70 prime band', () => {
    expect(factor(scoreCrappie(cond({ waterTemp: 58 })), 'Water Temp').pts).toBe(22);
    expect(factor(scoreCrappie(cond({ waterTemp: 70 })), 'Water Temp').pts).toBe(22);
  });
  it('steps down across the surrounding bands', () => {
    expect(factor(scoreCrappie(cond({ waterTemp: 52 })), 'Water Temp').pts).toBe(14);
    expect(factor(scoreCrappie(cond({ waterTemp: 73 })), 'Water Temp').pts).toBe(12);
    expect(factor(scoreCrappie(cond({ waterTemp: 80 })), 'Water Temp').pts).toBe(6);
    expect(factor(scoreCrappie(cond({ waterTemp: 45 })), 'Water Temp').pts).toBe(4);
  });
});

describe('scoreCrappie season', () => {
  it('peaks during the Feb-Apr spawn push', () => {
    expect(factor(scoreCrappie(cond({ month: 1 })), 'Season').pts).toBe(18);
    expect(factor(scoreCrappie(cond({ month: 3 })), 'Season').pts).toBe(18);
  });
  it('rewards the fall bite', () => {
    expect(factor(scoreCrappie(cond({ month: 9 })), 'Season').pts).toBe(14);
  });
  it('gives the winter and summer floors', () => {
    expect(factor(scoreCrappie(cond({ month: 11 })), 'Season').pts).toBe(10);
    expect(factor(scoreCrappie(cond({ month: 6 })), 'Season').pts).toBe(7);
  });
});

describe('scoreCrappie moon phase', () => {
  it('ranks full over new over quarter over other', () => {
    expect(factor(scoreCrappie(cond({ moonPhase: 'Full Moon' })), 'Moon Phase').pts).toBe(10);
    expect(factor(scoreCrappie(cond({ moonPhase: 'New Moon' })), 'Moon Phase').pts).toBe(8);
    expect(factor(scoreCrappie(cond({ moonPhase: 'First Quarter' })), 'Moon Phase').pts).toBe(5);
    expect(factor(scoreCrappie(cond({ moonPhase: 'Waning Crescent' })), 'Moon Phase').pts).toBe(3);
  });
});

describe('scoreCrappie spawn modifier', () => {
  it('adds the bonus at 58-64F in Feb-Apr', () => {
    expect(factor(scoreCrappie(cond({ waterTemp: 60, month: 2 })), 'Spawn window')).toBeDefined();
  });
  it('does not apply above 64F', () => {
    expect(factor(scoreCrappie(cond({ waterTemp: 68, month: 2 })), 'Spawn window')).toBeUndefined();
  });
  it('does not apply outside Feb-Apr', () => {
    expect(factor(scoreCrappie(cond({ waterTemp: 60, month: 6 })), 'Spawn window')).toBeUndefined();
  });
});

describe('scoreCrappie output shape', () => {
  it('clamps the score into 0-100 and buckets label/color', () => {
    const excellent = scoreCrappie(
      cond({ waterTemp: 62, month: 2, isDawnWindow: true, solunar: 'major', moonPhase: 'Full Moon', clouds: 90 }),
    );
    expect(excellent.score).toBeLessThanOrEqual(100);
    expect(excellent.label).toBe('Excellent');
    expect(excellent.color).toBe('#22c55e');

    const tough = scoreCrappie(
      cond({ waterTemp: 45, baroTrend: 'falling', baroRate: -2, month: 6, solunar: 'none', clouds: 10, moonPhase: 'Waxing Gibbous' }),
    );
    expect(tough.score).toBeGreaterThanOrEqual(0);
    expect(tough.label).toBe('Tough');
    expect(tough.color).toBe('#ef4444');
  });
});

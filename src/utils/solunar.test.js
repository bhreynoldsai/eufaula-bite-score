import { describe, it, expect } from 'vitest';
import { classifySolunar, solunarPeriods } from './solunar.js';

describe('classifySolunar', () => {
  const periods = [
    {
      type: 'major',
      start: new Date('2024-04-15T10:00:00Z'),
      end: new Date('2024-04-15T12:00:00Z'),
    },
    {
      type: 'minor',
      start: new Date('2024-04-15T18:00:00Z'),
      end: new Date('2024-04-15T19:00:00Z'),
    },
  ];

  it('returns the period type when inside a window', () => {
    expect(classifySolunar(new Date('2024-04-15T11:00:00Z'), periods)).toBe('major');
    expect(classifySolunar(new Date('2024-04-15T18:30:00Z'), periods)).toBe('minor');
  });

  it('is inclusive of the window boundaries', () => {
    expect(classifySolunar(new Date('2024-04-15T10:00:00Z'), periods)).toBe('major');
    expect(classifySolunar(new Date('2024-04-15T12:00:00Z'), periods)).toBe('major');
  });

  it('returns none outside every window', () => {
    expect(classifySolunar(new Date('2024-04-15T15:00:00Z'), periods)).toBe('none');
  });

  it('returns none for an empty period list', () => {
    expect(classifySolunar(new Date('2024-04-15T11:00:00Z'), [])).toBe('none');
  });
});

describe('solunarPeriods', () => {
  it('builds sorted major/minor windows from moon events', () => {
    const periods = solunarPeriods(new Date(2024, 3, 15, 12, 0));
    expect(Array.isArray(periods)).toBe(true);
    expect(periods.length).toBeGreaterThan(0);

    // Sorted ascending by start time.
    for (let i = 1; i < periods.length; i++) {
      expect(periods[i].start.getTime()).toBeGreaterThanOrEqual(periods[i - 1].start.getTime());
    }

    for (const p of periods) {
      expect(['major', 'minor']).toContain(p.type);
      // Window duration: majors are 2h, minors are 1h.
      const durationMin = (p.end - p.start) / 60000;
      expect(durationMin).toBeCloseTo(p.type === 'major' ? 120 : 60, 5);
      // The anchor sits inside its window.
      expect(p.anchor.getTime()).toBeGreaterThanOrEqual(p.start.getTime());
      expect(p.anchor.getTime()).toBeLessThanOrEqual(p.end.getTime());
    }
  });
});

import { describe, it, expect } from 'vitest';
import { ACHIEVEMENTS } from '../data/achievements';
import type { DailyLog } from '../types';

describe('achievements.ts database conditions', () => {
  const findAchievement = (id: string) => ACHIEVEMENTS.find((a) => a.id === id)!;

  describe('first-log condition', () => {
    const ach = findAchievement('first-log');

    it('returns false if no logs exist or logs have no entries', () => {
      expect(ach.condition([])).toBe(false);
      expect(ach.condition([{ date: '2026-06-14', totalCo2e: 0, entries: [] }])).toBe(false);
    });

    it('returns true if at least one entry exists', () => {
      const logs: DailyLog[] = [
        {
          date: '2026-06-14',
          totalCo2e: 5,
          entries: [{ id: '1', category: 'food', subcategory: 'vegan', value: 1, co2e: 5, unit: 'meal', date: '2026-06-14' }],
        },
      ];
      expect(ach.condition(logs)).toBe(true);
    });
  });

  describe('week-streak condition', () => {
    const ach = findAchievement('week-streak');

    it('returns false if logs count is less than 7', () => {
      expect(ach.condition([])).toBe(false);
    });

    it('returns false if logs count is >= 7 but consecutive days streak is less than 7', () => {
      const logs: DailyLog[] = Array.from({ length: 7 }, (_, i) => ({
        date: `2026-06-${(i === 6 ? 10 : i + 1).toString().padStart(2, '0')}`,
        totalCo2e: 1,
        entries: [{ id: `1`, category: 'food', subcategory: 'vegan', value: 1, co2e: 1, unit: 'meal', date: '' }],
      }));
      expect(ach.condition(logs)).toBe(false);
    });

    it('returns true if streak is 7 or more consecutive days', () => {
      const logs: DailyLog[] = Array.from({ length: 7 }, (_, i) => ({
        date: `2026-06-${(i + 1).toString().padStart(2, '0')}`,
        totalCo2e: 1,
        entries: [{ id: `1`, category: 'food', subcategory: 'vegan', value: 1, co2e: 1, unit: 'meal', date: '' }],
      }));
      expect(ach.condition(logs)).toBe(true);
    });
  });

  describe('green-day condition', () => {
    const ach = findAchievement('green-day');

    it('returns false if no daily logs have 0 < totalCo2e < 5', () => {
      expect(ach.condition([])).toBe(false);
      expect(ach.condition([{ date: '2026-06-14', totalCo2e: 0, entries: [] }])).toBe(false);
      expect(ach.condition([{ date: '2026-06-14', totalCo2e: 5.5, entries: [] }])).toBe(false);
    });

    it('returns true if at least one day has 0 < totalCo2e < 5', () => {
      expect(ach.condition([{ date: '2026-06-14', totalCo2e: 3.5, entries: [] }])).toBe(true);
    });
  });

  describe('carbon-conscious condition', () => {
    const ach = findAchievement('carbon-conscious');

    it('returns false if total entries is less than 10', () => {
      expect(ach.condition([])).toBe(false);
    });

    it('returns true if total entries is 10 or more', () => {
      const logs: DailyLog[] = [
        {
          date: '2026-06-14',
          totalCo2e: 10,
          entries: Array.from({ length: 10 }, (_, i) => ({
            id: `id-${i}`, category: 'food', subcategory: 'vegan', value: 1, co2e: 1, unit: 'meal', date: '2026-06-14',
          })),
        },
      ];
      expect(ach.condition(logs)).toBe(true);
    });
  });

  describe('eco-warrior condition', () => {
    const ach = findAchievement('eco-warrior');

    it('returns false if total monthly emissions is 0 or >= 167', () => {
      const thisMonth = new Date().toISOString().slice(0, 7);
      expect(ach.condition([])).toBe(false);
      expect(ach.condition([{ date: `${thisMonth}-01`, totalCo2e: 170, entries: [] }])).toBe(false);
    });

    it('returns true if total monthly emissions is > 0 and < 167', () => {
      const thisMonth = new Date().toISOString().slice(0, 7);
      expect(ach.condition([{ date: `${thisMonth}-01`, totalCo2e: 100, entries: [] }])).toBe(true);
    });
  });

  describe('transport-hero condition', () => {
    const ach = findAchievement('transport-hero');

    it('returns false if zero transport emission days count is less than 3', () => {
      expect(ach.condition([])).toBe(false);
    });

    it('returns true if zero transport emission days count is 3 or more', () => {
      const logs: DailyLog[] = [
        {
          date: '2026-06-10',
          totalCo2e: 10,
          entries: [{ id: '1', category: 'food', subcategory: 'vegan', value: 1, co2e: 10, unit: 'meal', date: '2026-06-10' }],
        },
        {
          date: '2026-06-11',
          totalCo2e: 10,
          entries: [{ id: '2', category: 'food', subcategory: 'vegan', value: 1, co2e: 10, unit: 'meal', date: '2026-06-11' }],
        },
        {
          date: '2026-06-12',
          totalCo2e: 10,
          entries: [{ id: '3', category: 'food', subcategory: 'vegan', value: 1, co2e: 10, unit: 'meal', date: '2026-06-12' }],
        },
      ];
      expect(ach.condition(logs)).toBe(true);
    });
  });

  describe('data-champion condition', () => {
    const ach = findAchievement('data-champion');

    it('returns false if logs with entries count is less than 30', () => {
      expect(ach.condition([])).toBe(false);
    });

    it('returns true if logs with entries count is 30 or more', () => {
      const logs: DailyLog[] = Array.from({ length: 30 }, (_, i) => ({
        date: `2026-06-${(i + 1).toString().padStart(2, '0')}`,
        totalCo2e: 1,
        entries: [{ id: `id-${i}`, category: 'food', subcategory: 'vegan', value: 1, co2e: 1, unit: 'meal', date: '' }],
      }));
      expect(ach.condition(logs)).toBe(true);
    });
  });
});

import { describe, it, expect } from 'vitest';
import {
  calculateCo2e,
  sumEntriesCo2e,
  getMonthTotal,
  getCategoryBreakdown,
  benchmarkPercent,
  calculateStreak,
  getTrend,
} from '../utils/calculations';
import type { DailyLog, ActivityEntry } from '../types';

describe('calculations.ts utilities', () => {
  describe('calculateCo2e', () => {
    it('returns 0 if subcategory is not found', () => {
      expect(calculateCo2e('invalid-subcategory', 10)).toBe(0);
    });

    it('returns 0 if quantity is zero or negative', () => {
      expect(calculateCo2e('car_petrol', 0)).toBe(0);
      expect(calculateCo2e('car_petrol', -10)).toBe(0);
    });

    it('calculates correct CO2e value for a valid subcategory and quantity', () => {
      // car_petrol has factor 0.192
      expect(calculateCo2e('car_petrol', 100)).toBe(19.2);
    });
  });

  describe('sumEntriesCo2e', () => {
    it('returns 0 for empty entries list', () => {
      expect(sumEntriesCo2e([])).toBe(0);
    });

    it('sums list of entries correctly', () => {
      const entries: ActivityEntry[] = [
        { id: '1', category: 'transport', subcategory: 'car_petrol', value: 10, co2e: 1.92, unit: 'km', date: '2026-06-14' },
        { id: '2', category: 'energy', subcategory: 'electricity_grid', value: 20, co2e: 8.24, unit: 'kWh', date: '2026-06-14' },
      ];
      expect(sumEntriesCo2e(entries)).toBe(10.16);
    });
  });

  describe('getMonthTotal', () => {
    it('returns 0 if no logs match the given month', () => {
      const logs: DailyLog[] = [
        { date: '2026-05-01', totalCo2e: 10, entries: [] },
      ];
      expect(getMonthTotal(logs, '2026-06')).toBe(0);
    });

    it('returns the sum of totalCo2e for logs matching the month', () => {
      const logs: DailyLog[] = [
        { date: '2026-06-01', totalCo2e: 10, entries: [] },
        { date: '2026-06-02', totalCo2e: 25.5, entries: [] },
        { date: '2026-07-01', totalCo2e: 30, entries: [] },
      ];
      expect(getMonthTotal(logs, '2026-06')).toBe(35.5);
    });
  });

  describe('getCategoryBreakdown', () => {
    it('returns zero breakdown for empty logs or no matches', () => {
      const breakdown = getCategoryBreakdown([], '2026-06');
      expect(breakdown).toEqual({
        transport: 0,
        energy: 0,
        food: 0,
        shopping: 0,
        waste: 0,
      });
    });

    it('correctly aggregates categories for the specified month', () => {
      const logs: DailyLog[] = [
        {
          date: '2026-06-10',
          totalCo2e: 15,
          entries: [
            { id: '1', category: 'transport', subcategory: 'car_petrol', value: 10, co2e: 10, unit: 'km', date: '2026-06-10' },
            { id: '2', category: 'food', subcategory: 'beef', value: 1, co2e: 5, unit: 'kg', date: '2026-06-10' },
          ],
        },
        {
          date: '2026-06-11',
          totalCo2e: 8,
          entries: [
            { id: '3', category: 'transport', subcategory: 'bus', value: 5, co2e: 3, unit: 'km', date: '2026-06-11' },
            { id: '4', category: 'energy', subcategory: 'electricity_grid', value: 10, co2e: 5, unit: 'kWh', date: '2026-06-11' },
          ],
        },
        {
          date: '2026-07-10',
          totalCo2e: 20,
          entries: [
            { id: '5', category: 'transport', subcategory: 'car_petrol', value: 20, co2e: 20, unit: 'km', date: '2026-07-10' },
          ],
        },
      ];

      const breakdown = getCategoryBreakdown(logs, '2026-06');
      expect(breakdown).toEqual({
        transport: 13,
        energy: 5,
        food: 5,
        shopping: 0,
        waste: 0,
      });
    });
  });

  describe('benchmarkPercent', () => {
    it('returns 0 if benchmark is zero', () => {
      expect(benchmarkPercent(100, 0)).toBe(0);
    });

    it('calculates correct percentage rounded to 1 decimal place', () => {
      expect(benchmarkPercent(50, 200)).toBe(25);
      expect(benchmarkPercent(1, 3)).toBe(33.3);
    });
  });

  describe('calculateStreak', () => {
    it('returns 0 for empty logs list', () => {
      expect(calculateStreak([])).toBe(0);
    });

    it('calculates correct streak for consecutive days', () => {
      const today = new Date().toISOString().slice(0, 10);
      const yesterday = new Date(Date.now() - 86400000).toISOString().slice(0, 10);
      const twoDaysAgo = new Date(Date.now() - 2 * 86400000).toISOString().slice(0, 10);
      const fourDaysAgo = new Date(Date.now() - 4 * 86400000).toISOString().slice(0, 10);

      const logs: DailyLog[] = [
        {
          date: today,
          totalCo2e: 10,
          entries: [{ id: '1', category: 'food', subcategory: 'legumes', value: 1, co2e: 0.5, unit: 'kg', date: today }],
        },
        {
          date: yesterday,
          totalCo2e: 5,
          entries: [{ id: '2', category: 'food', subcategory: 'legumes', value: 1, co2e: 0.5, unit: 'kg', date: yesterday }],
        },
        {
          date: twoDaysAgo,
          totalCo2e: 8,
          entries: [{ id: '3', category: 'food', subcategory: 'legumes', value: 1, co2e: 0.5, unit: 'kg', date: twoDaysAgo }],
        },
        {
          date: fourDaysAgo,
          totalCo2e: 8,
          entries: [{ id: '4', category: 'food', subcategory: 'legumes', value: 1, co2e: 0.5, unit: 'kg', date: fourDaysAgo }],
        },
      ];

      expect(calculateStreak(logs)).toBe(3); // streak of 3 since fourDaysAgo has a gap
    });
  });

  describe('getTrend', () => {
    it('returns stable if previous is 0', () => {
      expect(getTrend(10, 0)).toBe('stable');
    });

    it('returns up if percentage increase is > 5%', () => {
      expect(getTrend(106, 100)).toBe('up');
    });

    it('returns down if percentage decrease is < -5%', () => {
      expect(getTrend(94, 100)).toBe('down');
    });

    it('returns stable if percentage change is within [-5%, 5%]', () => {
      expect(getTrend(102, 100)).toBe('stable');
      expect(getTrend(98, 100)).toBe('stable');
    });
  });
});

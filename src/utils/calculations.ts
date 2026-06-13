// ============================================================
// EcoTrack – Carbon Calculation Utilities
// Pure functions for testability
// ============================================================

import { EMISSION_FACTORS } from '../data/emissionFactors';
import type { ActivityEntry, DailyLog, Category } from '../types';
import { round } from './formatters';

/**
 * Calculates CO₂e for a given activity.
 * @param subcategory - Emission factor subcategory key
 * @param quantity    - Amount of the activity
 * @returns kg CO₂e, or 0 if factor not found
 */
export function calculateCo2e(subcategory: string, quantity: number): number {
  const factor = EMISSION_FACTORS.find((f) => f.subcategory === subcategory);
  if (!factor || quantity <= 0) return 0;
  return round(factor.kgCo2ePerUnit * quantity, 4);
}

/**
 * Sums total CO₂e from an array of activity entries.
 */
export function sumEntriesCo2e(entries: ActivityEntry[]): number {
  return round(entries.reduce((sum, e) => sum + e.co2e, 0), 4);
}

/**
 * Returns total CO₂e for a given month (YYYY-MM) from logs.
 */
export function getMonthTotal(logs: DailyLog[], yearMonth: string): number {
  return round(
    logs
      .filter((l) => l.date.startsWith(yearMonth))
      .reduce((s, l) => s + l.totalCo2e, 0),
    2
  );
}

/**
 * Returns CO₂e breakdown by category for a given month.
 */
export function getCategoryBreakdown(
  logs: DailyLog[],
  yearMonth: string
): Record<Category, number> {
  const base: Record<Category, number> = {
    transport: 0,
    energy: 0,
    food: 0,
    shopping: 0,
    waste: 0,
  };
  logs
    .filter((l) => l.date.startsWith(yearMonth))
    .forEach((l) =>
      l.entries.forEach((e) => {
        base[e.category] = round((base[e.category] ?? 0) + e.co2e, 2);
      })
    );
  return base;
}

/**
 * Returns the percentage of a value against a benchmark.
 */
export function benchmarkPercent(actual: number, benchmark: number): number {
  if (benchmark === 0) return 0;
  return round((actual / benchmark) * 100, 1);
}

/**
 * Calculates the current logging streak in days.
 */
export function calculateStreak(logs: DailyLog[]): number {
  const sorted = [...logs]
    .filter((l) => l.entries.length > 0)
    .sort((a, b) => b.date.localeCompare(a.date));

  if (!sorted.length) return 0;

  let streak = 0;
  let prev = new Date();
  prev.setHours(0, 0, 0, 0);

  for (const log of sorted) {
    const d = new Date(log.date + 'T00:00:00');
    d.setHours(0, 0, 0, 0);
    const diff = (prev.getTime() - d.getTime()) / 86400000;
    if (diff <= 1) {
      streak++;
      prev = d;
    } else {
      break;
    }
  }

  return streak;
}

/**
 * Compares two monthly totals and returns trend direction.
 */
export function getTrend(current: number, previous: number): 'up' | 'down' | 'stable' {
  if (previous === 0) return 'stable';
  const change = ((current - previous) / previous) * 100;
  if (change > 5) return 'up';
  if (change < -5) return 'down';
  return 'stable';
}

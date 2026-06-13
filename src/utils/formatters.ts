// ============================================================
// EcoTrack – Formatting Utilities
// ============================================================

/**
 * Formats a CO₂e value with appropriate units and precision.
 * @param kg - Value in kilograms
 * @param precision - Decimal places (default 1)
 */
export function formatCo2e(kg: number, precision = 1): string {
  if (kg >= 1000) {
    return `${(kg / 1000).toFixed(precision)} t CO₂e`;
  }
  return `${kg.toFixed(precision)} kg CO₂e`;
}

/**
 * Returns a human-readable label for a date string (YYYY-MM-DD).
 */
export function formatDate(dateStr: string): string {
  const d = new Date(dateStr + 'T00:00:00');
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const yesterday = new Date(today);
  yesterday.setDate(today.getDate() - 1);

  if (d.getTime() === today.getTime()) return 'Today';
  if (d.getTime() === yesterday.getTime()) return 'Yesterday';
  return d.toLocaleDateString('en', { weekday: 'short', month: 'short', day: 'numeric' });
}

/**
 * Formats a month string (YYYY-MM) to a readable label.
 */
export function formatMonth(yearMonth: string): string {
  return new Date(yearMonth + '-01').toLocaleDateString('en', {
    month: 'long',
    year: 'numeric',
  });
}

/**
 * Returns a percentage string.
 */
export function formatPercent(value: number, total: number): string {
  if (total === 0) return '0%';
  return `${Math.round((value / total) * 100)}%`;
}

/**
 * Clamps a number between min and max.
 */
export function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

/**
 * Generates a unique ID string.
 */
export function generateId(prefix = 'id'): string {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
}

/**
 * Rounds a number to a given number of decimal places.
 */
export function round(value: number, decimals = 2): number {
  const factor = Math.pow(10, decimals);
  return Math.round(value * factor) / factor;
}

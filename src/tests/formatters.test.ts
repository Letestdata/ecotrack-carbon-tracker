import { describe, it, expect } from 'vitest';
import {
  formatCo2e,
  formatDate,
  formatMonth,
  formatPercent,
  clamp,
  generateId,
  round,
} from '../utils/formatters';

describe('formatters.ts utilities', () => {
  describe('formatCo2e', () => {
    it('formats values >= 1000 kg as tonnes', () => {
      expect(formatCo2e(1000)).toBe('1.0 t CO₂e');
      expect(formatCo2e(1500, 2)).toBe('1.50 t CO₂e');
    });

    it('formats values < 1000 kg as kg', () => {
      expect(formatCo2e(500)).toBe('500.0 kg CO₂e');
      expect(formatCo2e(250.45, 2)).toBe('250.45 kg CO₂e');
    });
  });

  describe('formatDate', () => {
    it('returns Today for today\'s date', () => {
      const todayStr = new Date().toISOString().slice(0, 10);
      expect(formatDate(todayStr)).toBe('Today');
    });

    it('returns Yesterday for yesterday\'s date', () => {
      const yesterday = new Date(Date.now() - 86400000);
      const yesterdayStr = yesterday.toISOString().slice(0, 10);
      expect(formatDate(yesterdayStr)).toBe('Yesterday');
    });

    it('returns formatted date for other dates', () => {
      expect(formatDate('2026-01-15')).toContain('Jan 15');
    });
  });

  describe('formatMonth', () => {
    it('formats YYYY-MM to readable month and year', () => {
      expect(formatMonth('2026-06')).toBe('June 2026');
      expect(formatMonth('2026-12')).toBe('December 2026');
    });
  });

  describe('formatPercent', () => {
    it('returns 0% if total is 0', () => {
      expect(formatPercent(50, 0)).toBe('0%');
    });

    it('returns correct rounded percentage string', () => {
      expect(formatPercent(50, 200)).toBe('25%');
      expect(formatPercent(1, 3)).toBe('33%');
    });
  });

  describe('clamp', () => {
    it('returns value if within bounds', () => {
      expect(clamp(5, 1, 10)).toBe(5);
    });

    it('clamps to min value if value < min', () => {
      expect(clamp(0, 1, 10)).toBe(1);
    });

    it('clamps to max value if value > max', () => {
      expect(clamp(15, 1, 10)).toBe(10);
    });
  });

  describe('generateId', () => {
    it('generates an ID starting with the default prefix', () => {
      const id = generateId();
      expect(id.startsWith('id_')).toBe(true);
    });

    it('generates an ID starting with a custom prefix', () => {
      const id = generateId('test');
      expect(id.startsWith('test_')).toBe(true);
    });
  });

  describe('round', () => {
    it('rounds to 2 decimal places by default', () => {
      expect(round(1.234)).toBe(1.23);
      expect(round(1.236)).toBe(1.24);
    });

    it('rounds to custom decimal places', () => {
      expect(round(1.23456, 4)).toBe(1.2346);
      expect(round(1.2, 0)).toBe(1);
    });
  });
});

// ============================================================
// EcoTrack – Achievements / Badges
// ============================================================

import type { Achievement } from '../types';

export const ACHIEVEMENTS: Achievement[] = [
  {
    id: 'first-log',
    title: 'First Step',
    description: 'Logged your first carbon activity',
    icon: '🌱',
    condition: (logs) => logs.some((l) => l.entries.length > 0),
  },
  {
    id: 'week-streak',
    title: '7-Day Streak',
    description: 'Logged activities 7 days in a row',
    icon: '🔥',
    condition: (logs) => {
      if (logs.length < 7) return false;
      const sorted = [...logs].sort((a, b) => a.date.localeCompare(b.date));
      let streak = 1;
      for (let i = sorted.length - 1; i > 0; i--) {
        const curr = new Date(sorted[i].date);
        const prev = new Date(sorted[i - 1].date);
        const diff = (curr.getTime() - prev.getTime()) / 86400000;
        if (diff === 1) streak++;
        else break;
      }
      return streak >= 7;
    },
  },
  {
    id: 'green-day',
    title: 'Green Day',
    description: 'Kept daily CO₂e under 5 kg',
    icon: '🍃',
    condition: (logs) => logs.some((l) => l.totalCo2e > 0 && l.totalCo2e < 5),
  },
  {
    id: 'carbon-conscious',
    title: 'Carbon Conscious',
    description: 'Logged 10 or more activities',
    icon: '📊',
    condition: (logs) => logs.reduce((sum, l) => sum + l.entries.length, 0) >= 10,
  },
  {
    id: 'eco-warrior',
    title: 'Eco Warrior',
    description: 'Kept monthly CO₂e under the Paris Agreement target (< 167 kg)',
    icon: '🌍',
    condition: (logs) => {
      const thisMonth = new Date().toISOString().slice(0, 7);
      const monthLogs = logs.filter((l) => l.date.startsWith(thisMonth));
      const total = monthLogs.reduce((s, l) => s + l.totalCo2e, 0);
      return total > 0 && total < 167;
    },
  },
  {
    id: 'transport-hero',
    title: 'Transport Hero',
    description: 'Logged zero transport emissions for 3 days',
    icon: '🚲',
    condition: (logs) => {
      const zeroDays = logs.filter(
        (l) => l.entries.every((e) => e.category !== 'transport' || e.co2e === 0)
      );
      return zeroDays.length >= 3;
    },
  },
  {
    id: 'data-champion',
    title: 'Data Champion',
    description: 'Logged data for 30 days',
    icon: '🏆',
    condition: (logs) => logs.filter((l) => l.entries.length > 0).length >= 30,
  },
];

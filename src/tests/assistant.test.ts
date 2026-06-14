import { describe, it, expect } from 'vitest';
import { generateAssistantResponse } from '../services/assistant';
import type { DailyLog, UserProfile } from '../types';

describe('assistant.ts NLP service', () => {
  const profile: UserProfile = {
    name: 'Alice Smith',
    location: 'US',
    householdSize: 2,
    monthlyBudgetGoal: 200,
    joinedAt: '2026-01-01T00:00:00.000Z',
  };

  const getActiveMonthLogs = (co2e: number): DailyLog[] => {
    const todayStr = new Date().toISOString().slice(0, 10);
    return [
      {
        date: todayStr,
        totalCo2e: co2e,
        entries: [
          {
            id: '1',
            category: 'transport',
            subcategory: 'car_petrol',
            value: co2e / 0.192,
            co2e: co2e,
            unit: 'km',
            date: todayStr,
          },
        ],
      },
    ];
  };

  const getMultiCategoryLogs = (): DailyLog[] => {
    const todayStr = new Date().toISOString().slice(0, 10);
    return [
      {
        date: todayStr,
        totalCo2e: 150,
        entries: [
          {
            id: '1',
            category: 'transport',
            subcategory: 'car_petrol',
            value: 100,
            co2e: 100,
            unit: 'km',
            date: todayStr,
          },
          {
            id: '2',
            category: 'food',
            subcategory: 'beef',
            value: 1,
            co2e: 50,
            unit: 'kg',
            date: todayStr,
          },
        ],
      },
    ];
  };

  it('handles greeting intent', () => {
    const res = generateAssistantResponse('Hello EcoBot!', [], profile, []);
    expect(res.role).toBe('assistant');
    expect(res.content).toContain('Alice!');
    expect(res.content).toContain('your personal carbon footprint assistant');
  });

  it('handles how_are_you intent', () => {
    const res = generateAssistantResponse('How are you?', [], profile, []);
    expect(res.content).toContain('running on green energy');
  });

  it('handles help intent', () => {
    const res = generateAssistantResponse('help', [], profile, []);
    expect(res.content).toContain('Here\'s what I can help you with');
  });

  describe('carbon_overview intent', () => {
    it('shows overview with empty logs', () => {
      const res = generateAssistantResponse('my carbon footprint', [], profile, []);
      expect(res.content).toContain('Start logging activities to see your personal breakdown');
    });

    it('shows overview with valid logs and top category', () => {
      const logs = getActiveMonthLogs(50);
      const res = generateAssistantResponse('my carbon footprint', logs, profile, []);
      expect(res.content).toContain('Your biggest source is **transport**');
    });
  });

  it('handles transport_tips intent', () => {
    const res = generateAssistantResponse('transport tips', [], profile, []);
    expect(res.content).toContain('Transport accounts for ~30%');
  });

  it('handles energy_tips intent', () => {
    const res = generateAssistantResponse('energy', [], profile, []);
    expect(res.content).toContain('Home energy is typically 20-25%');
  });

  it('handles food_tips intent', () => {
    const res = generateAssistantResponse('diet', [], profile, []);
    expect(res.content).toContain('Food contributes ~25%');
  });

  it('handles shopping_tips intent', () => {
    const res = generateAssistantResponse('shopping tips', [], profile, []);
    expect(res.content).toContain('Consumer goods account for ~15%');
  });

  it('handles waste_tips intent', () => {
    const res = generateAssistantResponse('waste tips', [], profile, []);
    expect(res.content).toContain('Waste management can reduce your footprint');
  });

  describe('compare_average intent', () => {
    it('compares with low monthly emissions', () => {
      const res = generateAssistantResponse('compare with average', [], profile, []);
      expect(res.content).toContain('below the global average');
    });

    it('compares with high monthly emissions', () => {
      const logs = getActiveMonthLogs(500);
      const res = generateAssistantResponse('compare with average', logs, profile, []);
      expect(res.content).toContain('above the global average');
    });
  });

  describe('paris_target intent', () => {
    it('compares under Paris target', () => {
      const logs = getActiveMonthLogs(50);
      const res = generateAssistantResponse('paris target', logs, profile, []);
      expect(res.content).toContain('within the Paris target');
    });

    it('compares between Paris target and global average', () => {
      const logs = getActiveMonthLogs(300);
      const res = generateAssistantResponse('paris target', logs, profile, []);
      expect(res.content).toContain('below the global average but');
    });

    it('compares above global average', () => {
      const logs = getActiveMonthLogs(500);
      const res = generateAssistantResponse('paris target', logs, profile, []);
      expect(res.content).toContain('above the Paris target');
    });
  });

  describe('monthly_summary intent', () => {
    it('returns empty summary if no logs logged', () => {
      const res = generateAssistantResponse('monthly summary', [], profile, []);
      expect(res.content).toContain('No activities logged yet this month');
    });

    it('returns summary with logs within goal', () => {
      const logs = getActiveMonthLogs(100);
      const res = generateAssistantResponse('monthly summary', logs, profile, []);
      expect(res.content).toContain('on track to meet your personal goal');
    });

    it('returns summary with logs within goal and multiple categories sorted', () => {
      const logs = getMultiCategoryLogs();
      const res = generateAssistantResponse('monthly summary', logs, profile, []);
      expect(res.content).toContain('on track to meet your personal goal');
      expect(res.content).toContain('Transport');
      expect(res.content).toContain('Food');
    });

    it('returns summary with logs exceeding goal', () => {
      const logs = getActiveMonthLogs(300);
      const res = generateAssistantResponse('monthly summary', logs, profile, []);
      expect(res.content).toContain('exceeded your goal by');
    });

    it('returns summary with logs exceeding goal but no actual categories (edge case)', () => {
      const negativeGoalProfile = { ...profile, monthlyBudgetGoal: -10 };
      const res = generateAssistantResponse('monthly summary', [], negativeGoalProfile, []);
      expect(res.content).toContain('exceeded your goal by');
      expect(res.content).toContain('Focus on your top category!');
    });
  });

  describe('achievements intent', () => {
    it('handles no achievements earned', () => {
      const res = generateAssistantResponse('achievements', [], profile, []);
      expect(res.content).toContain('No achievements unlocked yet');
    });

    it('handles achievements earned', () => {
      const res = generateAssistantResponse('achievements', [], profile, ['first-log']);
      expect(res.content).toContain('earned **1 achievement(s)**');
    });
  });

  it('handles daily_tip intent', () => {
    const res = generateAssistantResponse('daily tip', [], profile, []);
    expect(res.content).toContain('Today\'s Eco Tip');
  });

  it('handles what_is_co2 intent', () => {
    const res = generateAssistantResponse('what is co2', [], profile, []);
    expect(res.content).toContain('What is CO₂e (Carbon Dioxide Equivalent)?');
  });

  describe('reduce_footprint intent', () => {
    it('shows roadmap without logs', () => {
      const res = generateAssistantResponse('how to reduce', [], profile, []);
      expect(res.content).toContain('personalised reduction roadmap');
      expect(res.content).not.toContain('Your biggest source is');
    });

    it('shows roadmap with logs', () => {
      const logs = getActiveMonthLogs(100);
      const res = generateAssistantResponse('how to reduce', logs, profile, []);
      expect(res.content).toContain('Your biggest source is **transport**');
    });
  });

  describe('category_breakdown intent', () => {
    it('shows breakdown with no emissions', () => {
      const res = generateAssistantResponse('category breakdown', [], profile, []);
      expect(res.content).toContain('haven\'t logged any activities yet');
    });

    it('shows breakdown with emissions', () => {
      const logs = getActiveMonthLogs(100);
      const res = generateAssistantResponse('category breakdown', logs, profile, []);
      expect(res.content).toContain('Your emissions this month by category');
      expect(res.content).toContain('Transport');
    });
  });

  it('handles unknown intent', () => {
    const res = generateAssistantResponse('random text query', [], profile, []);
    expect(res.content).toContain('didn\'t quite catch that');
  });
});

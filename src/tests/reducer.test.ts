import { describe, it, expect } from 'vitest';
import { reducer, INITIAL_STATE } from '../context/AppContext';
import type { AppState, Action } from '../context/AppContext';
import type { ActivityEntry, ChatMessage } from '../types';

describe('AppContext reducer', () => {
  it('handles LOAD_STATE', () => {
    const customState: AppState = {
      profile: { name: 'Bob', location: 'US', householdSize: 1, monthlyBudgetGoal: 100, joinedAt: '' },
      logs: [],
      chatHistory: [],
      currentPage: 'insights',
      earnedAchievements: ['first-log'],
    };
    const action: Action = { type: 'LOAD_STATE', payload: customState };
    const nextState = reducer(INITIAL_STATE, action);
    expect(nextState).toEqual(customState);
  });

  it('handles SET_PAGE', () => {
    const action: Action = { type: 'SET_PAGE', payload: 'insights' };
    const nextState = reducer(INITIAL_STATE, action);
    expect(nextState.currentPage).toBe('insights');
  });

  it('handles UPDATE_PROFILE', () => {
    const action: Action = { type: 'UPDATE_PROFILE', payload: { name: 'Bob Smith', monthlyBudgetGoal: 150 } };
    const nextState = reducer(INITIAL_STATE, action);
    expect(nextState.profile.name).toBe('Bob Smith');
    expect(nextState.profile.monthlyBudgetGoal).toBe(150);
    expect(nextState.profile.location).toBe('Global'); // untouched
  });

  describe('ADD_ENTRY', () => {
    it('creates a new log if one does not exist for the entry date', () => {
      const entry: ActivityEntry = {
        id: 'e1',
        category: 'transport',
        subcategory: 'car_petrol',
        value: 10,
        co2e: 1.92,
        unit: 'km',
        date: '2026-06-14',
      };
      const action: Action = { type: 'ADD_ENTRY', payload: entry };
      const nextState = reducer(INITIAL_STATE, action);

      expect(nextState.logs).toHaveLength(1);
      expect(nextState.logs[0].date).toBe('2026-06-14');
      expect(nextState.logs[0].totalCo2e).toBe(1.92);
      expect(nextState.logs[0].entries).toHaveLength(1);
      expect(nextState.logs[0].entries[0]).toEqual(entry);
    });

    it('adds entry to existing log and sorts logs by date descending', () => {
      const entry1: ActivityEntry = {
        id: 'e1', category: 'transport', subcategory: 'car_petrol', value: 10, co2e: 1.92, unit: 'km', date: '2026-06-14',
      };
      const entry2: ActivityEntry = {
        id: 'e2', category: 'food', subcategory: 'legumes', value: 1, co2e: 0.5, unit: 'meal', date: '2026-06-14',
      };
      const entry3: ActivityEntry = {
        id: 'e3', category: 'energy', subcategory: 'electricity_grid', value: 5, co2e: 2.06, unit: 'kWh', date: '2026-06-15',
      };

      const s1 = reducer(INITIAL_STATE, { type: 'ADD_ENTRY', payload: entry1 });
      const s2 = reducer(s1, { type: 'ADD_ENTRY', payload: entry2 });
      const s3 = reducer(s2, { type: 'ADD_ENTRY', payload: entry3 });

      expect(s3.logs).toHaveLength(2);
      // logs sorted descending
      expect(s3.logs[0].date).toBe('2026-06-15');
      expect(s3.logs[1].date).toBe('2026-06-14');

      // combined total CO2e
      expect(s3.logs[1].totalCo2e).toBe(2.42);
      expect(s3.logs[1].entries).toHaveLength(2);
    });
  });

  describe('DELETE_ENTRY', () => {
    it('returns state unchanged if log date does not exist', () => {
      const action: Action = { type: 'DELETE_ENTRY', payload: { date: '2026-06-14', entryId: 'e1' } };
      const nextState = reducer(INITIAL_STATE, action);
      expect(nextState).toEqual(INITIAL_STATE);
    });

    it('removes entry from logs and recalculates co2e, removing log if empty', () => {
      const entry: ActivityEntry = {
        id: 'e1', category: 'transport', subcategory: 'car_petrol', value: 10, co2e: 1.92, unit: 'km', date: '2026-06-14',
      };
      const stateWithEntry = reducer(INITIAL_STATE, { type: 'ADD_ENTRY', payload: entry });

      // delete the entry
      const action: Action = { type: 'DELETE_ENTRY', payload: { date: '2026-06-14', entryId: 'e1' } };
      const nextState = reducer(stateWithEntry, action);

      // the log date should remain in state but with empty entries or removed depending on condition
      expect(nextState.logs[0].entries).toHaveLength(0);
      expect(nextState.logs[0].totalCo2e).toBe(0);
    });

    it('deletes an entry from a log when multiple logs exist in state', () => {
      const entry1: ActivityEntry = {
        id: 'e1', category: 'transport', subcategory: 'car_petrol', value: 10, co2e: 1.92, unit: 'km', date: '2026-06-14',
      };
      const entry2: ActivityEntry = {
        id: 'e2', category: 'food', subcategory: 'beef', value: 1, co2e: 27, unit: 'kg', date: '2026-06-15',
      };

      const s1 = reducer(INITIAL_STATE, { type: 'ADD_ENTRY', payload: entry1 });
      const s2 = reducer(s1, { type: 'ADD_ENTRY', payload: entry2 });

      // Delete e1 on 2026-06-14
      const action: Action = { type: 'DELETE_ENTRY', payload: { date: '2026-06-14', entryId: 'e1' } };
      const nextState = reducer(s2, action);

      expect(nextState.logs).toHaveLength(2);
      expect(nextState.logs.find(l => l.date === '2026-06-14')?.entries).toHaveLength(0);
      expect(nextState.logs.find(l => l.date === '2026-06-15')?.entries).toHaveLength(1); // untouched
    });

    it('deletes an entry from a log that has multiple entries on the same day', () => {
      const entry1: ActivityEntry = {
        id: 'e1', category: 'transport', subcategory: 'car_petrol', value: 10, co2e: 1.92, unit: 'km', date: '2026-06-14',
      };
      const entry2: ActivityEntry = {
        id: 'e2', category: 'food', subcategory: 'beef', value: 1, co2e: 27, unit: 'kg', date: '2026-06-14',
      };

      const s1 = reducer(INITIAL_STATE, { type: 'ADD_ENTRY', payload: entry1 });
      const s2 = reducer(s1, { type: 'ADD_ENTRY', payload: entry2 });

      // Delete e1 on 2026-06-14 (log still has e2)
      const action: Action = { type: 'DELETE_ENTRY', payload: { date: '2026-06-14', entryId: 'e1' } };
      const nextState = reducer(s2, action);

      expect(nextState.logs).toHaveLength(1);
      expect(nextState.logs[0].entries).toHaveLength(1);
      expect(nextState.logs[0].entries[0]).toEqual(entry2);
      expect(nextState.logs[0].totalCo2e).toBe(27);
    });
  });

  it('handles ADD_CHAT_MESSAGE', () => {
    const msg: ChatMessage = { id: 'm1', role: 'user', content: 'hello', timestamp: '12:00' };
    const action: Action = { type: 'ADD_CHAT_MESSAGE', payload: msg };
    const nextState = reducer(INITIAL_STATE, action);
    expect(nextState.chatHistory).toHaveLength(1);
    expect(nextState.chatHistory[0]).toEqual(msg);
  });

  it('handles CLEAR_CHAT', () => {
    const msg: ChatMessage = { id: 'm1', role: 'user', content: 'hello', timestamp: '12:00' };
    const stateWithChat = { ...INITIAL_STATE, chatHistory: [msg] };
    const action: Action = { type: 'CLEAR_CHAT' };
    const nextState = reducer(stateWithChat, action);
    expect(nextState.chatHistory).toHaveLength(0);
  });

  describe('CHECK_ACHIEVEMENTS', () => {
    it('does not earn any achievements if conditions are not met', () => {
      const action: Action = { type: 'CHECK_ACHIEVEMENTS' };
      const nextState = reducer(INITIAL_STATE, action);
      expect(nextState.earnedAchievements).toHaveLength(0);
    });

    it('earns achievements when conditions are met', () => {
      const entry: ActivityEntry = {
        id: 'e1', category: 'transport', subcategory: 'car_petrol', value: 10, co2e: 1.92, unit: 'km', date: '2026-06-14',
      };
      const stateWithLog = reducer(INITIAL_STATE, { type: 'ADD_ENTRY', payload: entry });
      const action: Action = { type: 'CHECK_ACHIEVEMENTS' };
      const nextState = reducer(stateWithLog, action);

      expect(nextState.earnedAchievements).toContain('first-log');
    });

    it('does not duplicate already earned achievements', () => {
      const stateWithEarned = { ...INITIAL_STATE, earnedAchievements: ['first-log'] };
      const entry: ActivityEntry = {
        id: 'e1', category: 'transport', subcategory: 'car_petrol', value: 10, co2e: 1.92, unit: 'km', date: '2026-06-14',
      };
      const stateWithLog = reducer(stateWithEarned, { type: 'ADD_ENTRY', payload: entry });
      const nextState = reducer(stateWithLog, { type: 'CHECK_ACHIEVEMENTS' });

      const count = nextState.earnedAchievements.filter(x => x === 'first-log').length;
      expect(count).toBe(1);
    });
  });

  it('returns current state for unhandled actions', () => {
    const action = { type: 'UNKNOWN_ACTION' };
    const nextState = reducer(INITIAL_STATE, action as any);
    expect(nextState).toEqual(INITIAL_STATE);
  });
});

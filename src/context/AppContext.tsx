// ============================================================
// EcoTrack – Global App Context (localStorage persistence)
// ============================================================

import React, {
  createContext,
  useContext,
  useReducer,
  useEffect,
  useCallback,
  useMemo,
} from 'react';
import type {
  ActivityEntry,
  UserProfile,
  DailyLog,
  ChatMessage,
  NavPage,
  Category,
} from '../types';
import { ACHIEVEMENTS } from '../data/achievements';

// ── State ────────────────────────────────────────────────────

export interface AppState {
  profile: UserProfile;
  logs: DailyLog[];
  chatHistory: ChatMessage[];
  currentPage: NavPage;
  earnedAchievements: string[];
}

// ── Actions ──────────────────────────────────────────────────

export type Action =
  | { type: 'SET_PAGE'; payload: NavPage }
  | { type: 'UPDATE_PROFILE'; payload: Partial<UserProfile> }
  | { type: 'ADD_ENTRY'; payload: ActivityEntry }
  | { type: 'DELETE_ENTRY'; payload: { date: string; entryId: string } }
  | { type: 'ADD_CHAT_MESSAGE'; payload: ChatMessage }
  | { type: 'CLEAR_CHAT' }
  | { type: 'CHECK_ACHIEVEMENTS' }
  | { type: 'LOAD_STATE'; payload: AppState };

// ── Initial State ────────────────────────────────────────────

const DEFAULT_PROFILE: UserProfile = {
  name: 'Eco User',
  location: 'Global',
  householdSize: 2,
  monthlyBudgetGoal: 200,
  joinedAt: new Date().toISOString(),
};

export const INITIAL_STATE: AppState = {
  profile: DEFAULT_PROFILE,
  logs: [],
  chatHistory: [],
  currentPage: 'dashboard',
  earnedAchievements: [],
};

// ── Reducer ──────────────────────────────────────────────────

function findOrCreateLog(logs: DailyLog[], date: string): DailyLog {
  return logs.find((l) => l.date === date) ?? { date, totalCo2e: 0, entries: [] };
}

export function reducer(state: AppState, action: Action): AppState {
  switch (action.type) {
    case 'LOAD_STATE':
      return action.payload;

    case 'SET_PAGE':
      return { ...state, currentPage: action.payload };

    case 'UPDATE_PROFILE':
      return { ...state, profile: { ...state.profile, ...action.payload } };

    case 'ADD_ENTRY': {
      const entry = action.payload;
      const existingLog = findOrCreateLog(state.logs, entry.date);
      const updatedLog: DailyLog = {
        ...existingLog,
        entries: [...existingLog.entries, entry],
        totalCo2e: existingLog.totalCo2e + entry.co2e,
      };
      const otherLogs = state.logs.filter((l) => l.date !== entry.date);
      return { ...state, logs: [...otherLogs, updatedLog].sort((a, b) => b.date.localeCompare(a.date)) };
    }

    case 'DELETE_ENTRY': {
      const { date, entryId } = action.payload;
      const log = state.logs.find((l) => l.date === date);
      if (!log) return state;
      const updatedEntries = log.entries.filter((e) => e.id !== entryId);
      const updatedCo2e = updatedEntries.reduce((s, e) => s + e.co2e, 0);
      const updatedLog: DailyLog = { ...log, entries: updatedEntries, totalCo2e: updatedCo2e };
      return {
        ...state,
        logs: state.logs
          .map((l) => (l.date === date ? updatedLog : l))
          .filter((l) => l.entries.length > 0 || l.date === date),
      };
    }

    case 'ADD_CHAT_MESSAGE':
      return { ...state, chatHistory: [...state.chatHistory, action.payload] };

    case 'CLEAR_CHAT':
      return { ...state, chatHistory: [] };

    case 'CHECK_ACHIEVEMENTS': {
      const newEarned = ACHIEVEMENTS.filter(
        (a) => !state.earnedAchievements.includes(a.id) && a.condition(state.logs)
      ).map((a) => a.id);
      if (newEarned.length === 0) return state;
      return { ...state, earnedAchievements: [...state.earnedAchievements, ...newEarned] };
    }

    default:
      return state;
  }
}

// ── Context ──────────────────────────────────────────────────

interface AppContextValue {
  state: AppState;
  navigate: (page: NavPage) => void;
  updateProfile: (update: Partial<UserProfile>) => void;
  addEntry: (entry: ActivityEntry) => void;
  deleteEntry: (date: string, entryId: string) => void;
  addChatMessage: (msg: ChatMessage) => void;
  clearChat: () => void;
  // Computed helpers
  totalMonthCo2e: number;
  todayCo2e: number;
  categoryBreakdown: Record<Category, number>;
}

const AppContext = createContext<AppContextValue | null>(null);

const STORAGE_KEY = 'ecotrack_state_v2';

// ── Provider ─────────────────────────────────────────────────

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(reducer, INITIAL_STATE);

  // Load persisted state on mount
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed: AppState = JSON.parse(raw);
        dispatch({ type: 'LOAD_STATE', payload: { ...INITIAL_STATE, ...parsed } });
      }
    } catch {
      // Silently ignore parse errors – start fresh
    }
  }, []);

  // Persist state on every change
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch {
      // Silently ignore storage quota errors
    }
  }, [state]);

  // Check achievements whenever logs change
  useEffect(() => {
    dispatch({ type: 'CHECK_ACHIEVEMENTS' });
  }, [state.logs]);

  // ── Actions ────────────────────────────────────────────────

  const navigate = useCallback((page: NavPage) => {
    dispatch({ type: 'SET_PAGE', payload: page });
  }, []);

  const updateProfile = useCallback((update: Partial<UserProfile>) => {
    dispatch({ type: 'UPDATE_PROFILE', payload: update });
  }, []);

  const addEntry = useCallback((entry: ActivityEntry) => {
    dispatch({ type: 'ADD_ENTRY', payload: entry });
  }, []);

  const deleteEntry = useCallback((date: string, entryId: string) => {
    dispatch({ type: 'DELETE_ENTRY', payload: { date, entryId } });
  }, []);

  const addChatMessage = useCallback((msg: ChatMessage) => {
    dispatch({ type: 'ADD_CHAT_MESSAGE', payload: msg });
  }, []);

  const clearChat = useCallback(() => {
    dispatch({ type: 'CLEAR_CHAT' });
  }, []);

  // ── Computed ───────────────────────────────────────────────

  const totalMonthCo2e = useMemo(() => {
    const month = new Date().toISOString().slice(0, 7);
    return state.logs
      .filter((l) => l.date.startsWith(month))
      .reduce((s, l) => s + l.totalCo2e, 0);
  }, [state.logs]);

  const todayCo2e = useMemo(() => {
    const today = new Date().toISOString().slice(0, 10);
    return state.logs.find((l) => l.date === today)?.totalCo2e ?? 0;
  }, [state.logs]);

  const categoryBreakdown = useMemo<Record<Category, number>>(() => {
    const month = new Date().toISOString().slice(0, 7);
    const base: Record<Category, number> = { transport: 0, energy: 0, food: 0, shopping: 0, waste: 0 };
    state.logs
      .filter((l) => l.date.startsWith(month))
      .forEach((log) =>
        log.entries.forEach((e) => {
          base[e.category] = base[e.category] + e.co2e;
        })
      );
    return base;
  }, [state.logs]);

  const value = useMemo<AppContextValue>(
    () => ({
      state,
      navigate,
      updateProfile,
      addEntry,
      deleteEntry,
      addChatMessage,
      clearChat,
      totalMonthCo2e,
      todayCo2e,
      categoryBreakdown,
    }),
    [
      state,
      navigate,
      updateProfile,
      addEntry,
      deleteEntry,
      addChatMessage,
      clearChat,
      totalMonthCo2e,
      todayCo2e,
      categoryBreakdown,
    ]
  );

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

// ── Hook ─────────────────────────────────────────────────────

export function useApp(): AppContextValue {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used inside <AppProvider>');
  return ctx;
}

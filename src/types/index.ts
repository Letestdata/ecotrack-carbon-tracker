// ============================================================
// EcoTrack – Type Definitions
// ============================================================

export type Category = 'transport' | 'energy' | 'food' | 'shopping' | 'waste';

export interface ActivityEntry {
  id: string;
  category: Category;
  subcategory: string;
  value: number;
  unit: string;
  co2e: number; // kg CO2 equivalent
  date: string; // ISO date string
  note?: string;
}

export interface UserProfile {
  name: string;
  location: string;
  householdSize: number;
  monthlyBudgetGoal: number; // kg CO2e per month target
  joinedAt: string;
}

export interface DailyLog {
  date: string; // YYYY-MM-DD
  totalCo2e: number;
  entries: ActivityEntry[];
}

export interface WeeklyInsight {
  week: string; // YYYY-WW
  totalCo2e: number;
  breakdown: Record<Category, number>;
  topCategory: Category;
  trend: 'up' | 'down' | 'stable';
  trendPercentage: number;
}

export interface Tip {
  id: string;
  category: Category;
  title: string;
  description: string;
  potentialSaving: number; // kg CO2e per month
  difficulty: 'easy' | 'medium' | 'hard';
  icon: string;
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  earnedAt?: string;
  condition: (logs: DailyLog[]) => boolean;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}

export interface EmissionFactor {
  label: string;
  unit: string;
  kgCo2ePerUnit: number;
  category: Category;
  subcategory: string;
}

export type NavPage = 'dashboard' | 'log' | 'insights' | 'tips' | 'assistant' | 'profile';

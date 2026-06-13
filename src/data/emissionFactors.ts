// ============================================================
// EcoTrack – Emission Factors (IPCC / EPA / DEFRA 2023 data)
// All values in kg CO2 equivalent per unit
// ============================================================

import type { EmissionFactor } from '../types';

export const EMISSION_FACTORS: EmissionFactor[] = [
  // ── Transport ──────────────────────────────────────────────
  { label: 'Car (petrol/gasoline)', unit: 'km', kgCo2ePerUnit: 0.192, category: 'transport', subcategory: 'car_petrol' },
  { label: 'Car (diesel)', unit: 'km', kgCo2ePerUnit: 0.171, category: 'transport', subcategory: 'car_diesel' },
  { label: 'Car (electric)', unit: 'km', kgCo2ePerUnit: 0.053, category: 'transport', subcategory: 'car_electric' },
  { label: 'Car (hybrid)', unit: 'km', kgCo2ePerUnit: 0.109, category: 'transport', subcategory: 'car_hybrid' },
  { label: 'Bus', unit: 'km', kgCo2ePerUnit: 0.089, category: 'transport', subcategory: 'bus' },
  { label: 'Train / Metro', unit: 'km', kgCo2ePerUnit: 0.041, category: 'transport', subcategory: 'train' },
  { label: 'Domestic flight', unit: 'km', kgCo2ePerUnit: 0.255, category: 'transport', subcategory: 'flight_domestic' },
  { label: 'International flight (economy)', unit: 'km', kgCo2ePerUnit: 0.195, category: 'transport', subcategory: 'flight_international' },
  { label: 'Motorcycle / Scooter', unit: 'km', kgCo2ePerUnit: 0.114, category: 'transport', subcategory: 'motorcycle' },
  { label: 'Bicycle / Walking', unit: 'km', kgCo2ePerUnit: 0.0, category: 'transport', subcategory: 'bicycle' },

  // ── Energy ────────────────────────────────────────────────
  { label: 'Electricity (grid average)', unit: 'kWh', kgCo2ePerUnit: 0.233, category: 'energy', subcategory: 'electricity_grid' },
  { label: 'Electricity (renewable)', unit: 'kWh', kgCo2ePerUnit: 0.015, category: 'energy', subcategory: 'electricity_renewable' },
  { label: 'Natural gas', unit: 'kWh', kgCo2ePerUnit: 0.203, category: 'energy', subcategory: 'gas_natural' },
  { label: 'Heating oil', unit: 'litre', kgCo2ePerUnit: 2.96, category: 'energy', subcategory: 'heating_oil' },
  { label: 'LPG', unit: 'litre', kgCo2ePerUnit: 1.56, category: 'energy', subcategory: 'lpg' },
  { label: 'Wood / Biomass', unit: 'kg', kgCo2ePerUnit: 0.018, category: 'energy', subcategory: 'wood' },

  // ── Food ──────────────────────────────────────────────────
  { label: 'Beef', unit: 'kg', kgCo2ePerUnit: 27.0, category: 'food', subcategory: 'beef' },
  { label: 'Lamb / Mutton', unit: 'kg', kgCo2ePerUnit: 26.0, category: 'food', subcategory: 'lamb' },
  { label: 'Pork', unit: 'kg', kgCo2ePerUnit: 12.1, category: 'food', subcategory: 'pork' },
  { label: 'Chicken', unit: 'kg', kgCo2ePerUnit: 6.9, category: 'food', subcategory: 'chicken' },
  { label: 'Fish (average)', unit: 'kg', kgCo2ePerUnit: 6.1, category: 'food', subcategory: 'fish' },
  { label: 'Dairy (milk, cheese)', unit: 'kg', kgCo2ePerUnit: 3.2, category: 'food', subcategory: 'dairy' },
  { label: 'Eggs', unit: 'kg', kgCo2ePerUnit: 4.5, category: 'food', subcategory: 'eggs' },
  { label: 'Vegetables (local)', unit: 'kg', kgCo2ePerUnit: 0.4, category: 'food', subcategory: 'vegetables_local' },
  { label: 'Vegetables (imported)', unit: 'kg', kgCo2ePerUnit: 1.5, category: 'food', subcategory: 'vegetables_imported' },
  { label: 'Fruits (local)', unit: 'kg', kgCo2ePerUnit: 0.5, category: 'food', subcategory: 'fruits_local' },
  { label: 'Legumes / Lentils', unit: 'kg', kgCo2ePerUnit: 0.9, category: 'food', subcategory: 'legumes' },
  { label: 'Coffee', unit: 'kg', kgCo2ePerUnit: 28.5, category: 'food', subcategory: 'coffee' },

  // ── Shopping ──────────────────────────────────────────────
  { label: 'New clothing (average)', unit: 'item', kgCo2ePerUnit: 7.0, category: 'shopping', subcategory: 'clothing_new' },
  { label: 'Second-hand clothing', unit: 'item', kgCo2ePerUnit: 0.9, category: 'shopping', subcategory: 'clothing_secondhand' },
  { label: 'Electronics (smartphone)', unit: 'item', kgCo2ePerUnit: 70.0, category: 'shopping', subcategory: 'electronics_phone' },
  { label: 'Electronics (laptop)', unit: 'item', kgCo2ePerUnit: 350.0, category: 'shopping', subcategory: 'electronics_laptop' },
  { label: 'Furniture (average piece)', unit: 'item', kgCo2ePerUnit: 50.0, category: 'shopping', subcategory: 'furniture' },
  { label: 'Online package delivery', unit: 'package', kgCo2ePerUnit: 0.8, category: 'shopping', subcategory: 'delivery' },
  { label: 'Streaming / digital services', unit: 'hour', kgCo2ePerUnit: 0.036, category: 'shopping', subcategory: 'streaming' },

  // ── Waste ─────────────────────────────────────────────────
  { label: 'Landfill waste', unit: 'kg', kgCo2ePerUnit: 0.587, category: 'waste', subcategory: 'waste_landfill' },
  { label: 'Recycling (mixed)', unit: 'kg', kgCo2ePerUnit: 0.021, category: 'waste', subcategory: 'waste_recycling' },
  { label: 'Composting', unit: 'kg', kgCo2ePerUnit: 0.01, category: 'waste', subcategory: 'waste_composting' },
];

export const CATEGORY_COLORS: Record<string, string> = {
  transport: '#3b82f6',
  energy:    '#f59e0b',
  food:      '#10b981',
  shopping:  '#8b5cf6',
  waste:     '#ef4444',
};

export const CATEGORY_LABELS: Record<string, string> = {
  transport: 'Transport',
  energy:    'Energy',
  food:      'Food',
  shopping:  'Shopping',
  waste:     'Waste',
};

export const GLOBAL_AVERAGE_MONTHLY_KG = 416.67; // ~5 tonnes / year
export const PARIS_TARGET_MONTHLY_KG   = 166.67; // ~2 tonnes / year

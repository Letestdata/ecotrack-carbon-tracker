// ============================================================
// EcoTrack – Log Activity Page
// ============================================================

import { useState, useMemo, useId } from 'react';
import { useApp } from '../context/AppContext';
import { Card, CardHeader } from '../components/ui/Card';
import { Button } from '../components/ui/Button';

import { EMISSION_FACTORS, CATEGORY_COLORS, CATEGORY_LABELS } from '../data/emissionFactors';
import type { Category, ActivityEntry } from '../types';

const CATEGORIES: Category[] = ['transport', 'energy', 'food', 'shopping', 'waste'];

const CATEGORY_ICONS: Record<Category, string> = {
  transport: '🚗',
  energy:    '⚡',
  food:      '🥗',
  shopping:  '🛍️',
  waste:     '♻️',
};

function generateId(): string {
  return `entry_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
}

// ── Recent entry item ─────────────────────────────────────────

interface RecentEntryProps {
  entry: ActivityEntry;
  onDelete: () => void;
}

function RecentEntryItem({ entry, onDelete }: RecentEntryProps) {
  const factor = EMISSION_FACTORS.find((f) => f.subcategory === entry.subcategory);
  return (
    <li className="flex items-center justify-between gap-3 py-3 border-b border-gray-50 last:border-0">
      <div className="flex items-center gap-3 min-w-0">
        <span
          className="w-8 h-8 rounded-lg flex items-center justify-center text-base shrink-0"
          style={{ backgroundColor: CATEGORY_COLORS[entry.category] + '22' }}
          aria-hidden="true"
        >
          {CATEGORY_ICONS[entry.category]}
        </span>
        <div className="min-w-0">
          <p className="text-sm font-medium text-gray-800 truncate">
            {factor?.label ?? entry.subcategory}
          </p>
          <p className="text-xs text-gray-500">
            {entry.value} {entry.unit} · {entry.date}
          </p>
        </div>
      </div>
      <div className="flex items-center gap-2 shrink-0">
        <span className="text-sm font-semibold text-gray-700">
          {entry.co2e.toFixed(2)} kg
        </span>
        <button
          onClick={onDelete}
          aria-label={`Delete entry: ${factor?.label ?? entry.subcategory}`}
          className="text-red-400 hover:text-red-600 p-1 rounded-lg focus:outline-none focus-visible:ring-2 focus-visible:ring-red-500 transition-colors"
        >
          ✕
        </button>
      </div>
    </li>
  );
}

// ── Main component ────────────────────────────────────────────

export function LogActivity() {
  const { addEntry, deleteEntry, state } = useApp();
  const { logs } = state;

  const [selectedCategory, setSelectedCategory] = useState<Category>('transport');
  const [selectedFactor, setSelectedFactor] = useState('');
  const [value, setValue] = useState('');
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [note, setNote] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');

  const factorId = useId();
  const valueId = useId();
  const dateId = useId();
  const noteId = useId();

  const factorsForCategory = useMemo(
    () => EMISSION_FACTORS.filter((f) => f.category === selectedCategory),
    [selectedCategory]
  );

  const selectedFactorData = useMemo(
    () => EMISSION_FACTORS.find((f) => f.subcategory === selectedFactor),
    [selectedFactor]
  );

  const estimatedCo2e = useMemo(() => {
    if (!selectedFactorData || !value) return 0;
    return parseFloat(value) * selectedFactorData.kgCo2ePerUnit;
  }, [selectedFactorData, value]);

  // Recent entries (last 20, sorted by date)
  const recentEntries = useMemo(() => {
    return [...logs]
      .sort((a, b) => b.date.localeCompare(a.date))
      .flatMap((l) => l.entries.map((e) => ({ ...e, logDate: l.date })))
      .slice(0, 15);
  }, [logs]);

  function handleCategoryChange(cat: Category) {
    setSelectedCategory(cat);
    setSelectedFactor('');
    setValue('');
    setError('');
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');

    if (!selectedFactor) {
      setError('Please select an activity type.');
      return;
    }
    if (!value || isNaN(parseFloat(value)) || parseFloat(value) <= 0) {
      setError('Please enter a valid positive amount.');
      return;
    }
    if (!date) {
      setError('Please select a date.');
      return;
    }

    const entry: ActivityEntry = {
      id: generateId(),
      category: selectedCategory,
      subcategory: selectedFactor,
      value: parseFloat(parseFloat(value).toFixed(4)),
      unit: selectedFactorData!.unit,
      co2e: parseFloat(estimatedCo2e.toFixed(4)),
      date,
      note: note.trim() || undefined,
    };

    addEntry(entry);
    setSubmitted(true);
    setValue('');
    setNote('');
    setTimeout(() => setSubmitted(false), 3000);
  }

  return (
    <main id="main-content" className="space-y-6 pb-24 md:pb-6" aria-label="Log Activity">
      <h1 className="text-xl font-bold text-gray-900">Log Activity</h1>

      {/* ── Success toast ─── */}
      {submitted && (
        <div
          role="alert"
          aria-live="polite"
          className="bg-green-50 border border-green-200 rounded-xl p-4 flex items-center gap-3"
        >
          <span className="text-green-600 text-xl" aria-hidden="true">✅</span>
          <p className="text-green-800 text-sm font-medium">
            Activity logged! Your carbon data has been updated.
          </p>
        </div>
      )}

      {/* ── Log form ─── */}
      <section aria-labelledby="log-form-heading">
        <Card>
          <CardHeader
            titleId="log-form-heading"
            title="Add New Activity"
            icon="✏️"
            subtitle="Record an activity to calculate its CO₂ impact"
          />

          <form onSubmit={handleSubmit} noValidate className="space-y-5">
            {/* Category selector */}
            <fieldset>
              <legend className="text-sm font-medium text-gray-700 mb-2">
                Category <span aria-hidden="true" className="text-red-500">*</span>
              </legend>
              <div className="flex flex-wrap gap-2" role="group" aria-label="Select category">
                {CATEGORIES.map((cat) => (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => handleCategoryChange(cat)}
                    aria-pressed={selectedCategory === cat}
                    aria-label={`Select ${CATEGORY_LABELS[cat]} category`}
                    className={`flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium border-2 transition-all duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-green-500 focus-visible:ring-offset-1 ${
                      selectedCategory === cat
                        ? 'border-green-500 bg-green-50 text-green-700'
                        : 'border-gray-200 bg-white text-gray-600 hover:border-gray-300'
                    }`}
                  >
                    <span aria-hidden="true">{CATEGORY_ICONS[cat]}</span>
                    {CATEGORY_LABELS[cat]}
                  </button>
                ))}
              </div>
            </fieldset>

            {/* Activity type */}
            <div>
              <label htmlFor={factorId} className="block text-sm font-medium text-gray-700 mb-1">
                Activity Type <span aria-hidden="true" className="text-red-500">*</span>
              </label>
              <select
                id={factorId}
                value={selectedFactor}
                onChange={(e) => { setSelectedFactor(e.target.value); setError(''); }}
                required
                aria-required="true"
                aria-describedby={error ? `${factorId}-error` : undefined}
                className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
              >
                <option value="">— Select activity —</option>
                {factorsForCategory.map((f) => (
                  <option key={f.subcategory} value={f.subcategory}>
                    {f.label} (per {f.unit})
                  </option>
                ))}
              </select>
            </div>

            {/* Amount */}
            <div>
              <label htmlFor={valueId} className="block text-sm font-medium text-gray-700 mb-1">
                Amount
                {selectedFactorData && (
                  <span className="text-gray-400 font-normal ml-1">
                    ({selectedFactorData.unit})
                  </span>
                )}
                <span aria-hidden="true" className="text-red-500 ml-0.5">*</span>
              </label>
              <input
                id={valueId}
                type="number"
                min="0.01"
                step="any"
                value={value}
                onChange={(e) => { setValue(e.target.value); setError(''); }}
                placeholder={`Enter ${selectedFactorData?.unit ?? 'amount'}`}
                required
                aria-required="true"
                className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
            </div>

            {/* Date */}
            <div>
              <label htmlFor={dateId} className="block text-sm font-medium text-gray-700 mb-1">
                Date <span aria-hidden="true" className="text-red-500">*</span>
              </label>
              <input
                id={dateId}
                type="date"
                value={date}
                max={new Date().toISOString().slice(0, 10)}
                onChange={(e) => setDate(e.target.value)}
                required
                aria-required="true"
                className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
            </div>

            {/* Optional note */}
            <div>
              <label htmlFor={noteId} className="block text-sm font-medium text-gray-700 mb-1">
                Note <span className="text-gray-400 font-normal">(optional)</span>
              </label>
              <input
                id={noteId}
                type="text"
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="e.g. commute to work"
                maxLength={120}
                className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
            </div>

            {/* CO2 preview */}
            {estimatedCo2e > 0 && (
              <div
                className="bg-green-50 border border-green-100 rounded-xl p-4 flex items-center gap-3"
                aria-live="polite"
                aria-label={`Estimated CO2 emission: ${estimatedCo2e.toFixed(3)} kg`}
              >
                <span className="text-2xl" aria-hidden="true">🌿</span>
                <div>
                  <p className="text-sm font-semibold text-green-800">
                    Estimated: {estimatedCo2e.toFixed(3)} kg CO₂e
                  </p>
                  <p className="text-xs text-green-600">
                    = {(estimatedCo2e * 1000 / 192).toFixed(1)} km driven in a petrol car
                  </p>
                </div>
              </div>
            )}

            {/* Error */}
            {error && (
              <p id={`${factorId}-error`} role="alert" className="text-sm text-red-600">
                {error}
              </p>
            )}

            <Button type="submit" className="w-full" size="lg" aria-label="Save this carbon activity">
              💾 Save Activity
            </Button>
          </form>
        </Card>
      </section>

      {/* ── Recent entries ─── */}
      <section aria-labelledby="recent-heading">
        <Card>
          <CardHeader
            titleId="recent-heading"
            title="Recent Entries"
            icon="📋"
            subtitle={`${recentEntries.length} activities logged`}
          />
          {recentEntries.length === 0 ? (
            <p className="text-center text-gray-400 text-sm py-6">
              No activities yet. Log your first one above!
            </p>
          ) : (
            <ul className="divide-y divide-gray-50" role="list" aria-label="Recent activity log">
              {recentEntries.map((entry) => (
                <RecentEntryItem
                  key={entry.id}
                  entry={entry}
                  onDelete={() => deleteEntry(entry.date, entry.id)}
                />
              ))}
            </ul>
          )}
        </Card>
      </section>
    </main>
  );
}

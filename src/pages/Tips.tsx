// ============================================================
// EcoTrack – Eco Tips Page
// ============================================================

import { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { ECO_TIPS } from '../data/tips';
import { CATEGORY_LABELS } from '../data/emissionFactors';
import type { Category } from '../types';

const ALL_CATEGORIES: Array<'all' | Category> = ['all', 'transport', 'energy', 'food', 'shopping', 'waste'];

const DIFFICULTY_COLOR = {
  easy:   'green',
  medium: 'amber',
  hard:   'red',
} as const;

const CATEGORY_ICONS: Record<Category, string> = {
  transport: '🚗',
  energy:    '⚡',
  food:      '🥗',
  shopping:  '🛍️',
  waste:     '♻️',
};

export function Tips() {
  const { categoryBreakdown } = useApp();
  const [activeFilter, setActiveFilter] = useState<'all' | Category>('all');
  const [difficultyFilter, setDifficultyFilter] = useState<'all' | 'easy' | 'medium' | 'hard'>('all');
  const [savedTips, setSavedTips] = useState<Set<string>>(new Set());

  // Sort tips: prioritise the user's heaviest category
  const topCategory = useMemo(() => {
    const entries = Object.entries(categoryBreakdown) as [Category, number][];
    return entries.sort((a, b) => b[1] - a[1])[0]?.[0] ?? null;
  }, [categoryBreakdown]);

  const filteredTips = useMemo(() => {
    let tips = [...ECO_TIPS];
    if (activeFilter !== 'all') {
      tips = tips.filter((t) => t.category === activeFilter);
    }
    if (difficultyFilter !== 'all') {
      tips = tips.filter((t) => t.difficulty === difficultyFilter);
    }
    // Sort: saved first, then by potential saving desc
    tips.sort((a, b) => {
      const aSaved = savedTips.has(a.id) ? 1 : 0;
      const bSaved = savedTips.has(b.id) ? 1 : 0;
      if (bSaved !== aSaved) return bSaved - aSaved;
      // Prioritise top category
      if (topCategory) {
        if (a.category === topCategory && b.category !== topCategory) return -1;
        if (b.category === topCategory && a.category !== topCategory) return 1;
      }
      return b.potentialSaving - a.potentialSaving;
    });
    return tips;
  }, [activeFilter, difficultyFilter, savedTips, topCategory]);

  const totalPotentialSaving = useMemo(
    () => filteredTips.filter((t) => savedTips.has(t.id)).reduce((s, t) => s + t.potentialSaving, 0),
    [filteredTips, savedTips]
  );

  function toggleSave(id: string) {
    setSavedTips((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  return (
    <main id="main-content" className="space-y-6 pb-24 md:pb-6" aria-label="Eco Tips">
      <div>
        <h1 className="text-xl font-bold text-gray-900">Eco Tips</h1>
        <p className="text-sm text-gray-500 mt-1">
          Personalised actions to reduce your carbon footprint
        </p>
      </div>

      {/* ── Saved potential ─── */}
      {savedTips.size > 0 && (
        <div
          className="bg-green-600 text-white rounded-2xl p-5"
          role="status"
          aria-live="polite"
        >
          <p className="text-sm font-medium text-green-100">Your saved tips could save:</p>
          <p className="text-3xl font-bold mt-1">
            {totalPotentialSaving} kg
            <span className="text-lg font-normal ml-1">CO₂e / month</span>
          </p>
          <p className="text-xs text-green-200 mt-1">
            {savedTips.size} tip{savedTips.size > 1 ? 's' : ''} saved
          </p>
        </div>
      )}

      {/* ── Personalised banner ─── */}
      {topCategory && categoryBreakdown[topCategory] > 0 && (
        <div className="bg-amber-50 border border-amber-100 rounded-2xl p-4 flex items-start gap-3">
          <span className="text-2xl mt-0.5" aria-hidden="true">💡</span>
          <div>
            <p className="text-sm font-semibold text-amber-800">
              Your biggest source: {CATEGORY_LABELS[topCategory]}
            </p>
            <p className="text-xs text-amber-700 mt-0.5">
              {categoryBreakdown[topCategory].toFixed(1)} kg CO₂e this month.
              Tips for this category are highlighted first.
            </p>
          </div>
        </div>
      )}

      {/* ── Filters ─── */}
      <section aria-label="Filter tips">
        <div className="space-y-3">
          {/* Category filter */}
          <div>
            <p className="text-xs font-medium text-gray-500 mb-2 uppercase tracking-wide">Category</p>
            <div className="flex flex-wrap gap-2" role="group" aria-label="Filter by category">
              {ALL_CATEGORIES.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setActiveFilter(cat)}
                  aria-pressed={activeFilter === cat}
                  aria-label={`Filter by ${cat === 'all' ? 'all categories' : CATEGORY_LABELS[cat]}`}
                  className={`px-3 py-1.5 rounded-xl text-sm font-medium border transition-all duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-green-500 ${
                    activeFilter === cat
                      ? 'bg-green-600 text-white border-green-600'
                      : 'bg-white text-gray-600 border-gray-200 hover:border-gray-300'
                  }`}
                >
                  {cat === 'all' ? '🌿 All' : `${CATEGORY_ICONS[cat as Category]} ${CATEGORY_LABELS[cat as Category]}`}
                </button>
              ))}
            </div>
          </div>

          {/* Difficulty filter */}
          <div>
            <p className="text-xs font-medium text-gray-500 mb-2 uppercase tracking-wide">Difficulty</p>
            <div className="flex gap-2" role="group" aria-label="Filter by difficulty">
              {(['all', 'easy', 'medium', 'hard'] as const).map((d) => (
                <button
                  key={d}
                  onClick={() => setDifficultyFilter(d)}
                  aria-pressed={difficultyFilter === d}
                  aria-label={`Filter by ${d} difficulty`}
                  className={`px-3 py-1.5 rounded-xl text-sm font-medium border transition-all duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-green-500 capitalize ${
                    difficultyFilter === d
                      ? 'bg-gray-800 text-white border-gray-800'
                      : 'bg-white text-gray-600 border-gray-200 hover:border-gray-300'
                  }`}
                >
                  {d === 'all' ? 'All levels' : d}
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── Tip count ─── */}
      <p className="text-sm text-gray-500" aria-live="polite">
        Showing {filteredTips.length} tip{filteredTips.length !== 1 ? 's' : ''}
      </p>

      {/* ── Tips grid ─── */}
      <section aria-label="Eco tips list">
        <ul className="space-y-4" role="list">
          {filteredTips.map((tip) => {
            const isSaved = savedTips.has(tip.id);
            const isTopCat = topCategory && tip.category === topCategory;
            return (
              <li key={tip.id}>
                <Card
                  className={`transition-all duration-200 ${isTopCat ? 'border-amber-200 bg-amber-50/40' : ''}`}
                  role="article"
                  aria-label={`Tip: ${tip.title}`}
                >
                  <div className="flex items-start gap-4">
                    <span className="text-3xl shrink-0 mt-0.5" aria-hidden="true">
                      {tip.icon}
                    </span>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2 flex-wrap">
                        <h3 className="text-sm font-semibold text-gray-900">{tip.title}</h3>
                        <div className="flex items-center gap-1.5 flex-wrap">
                          {isTopCat && (
                            <Badge variant="amber">⭐ Priority</Badge>
                          )}
                          <Badge variant={DIFFICULTY_COLOR[tip.difficulty]}>
                            {tip.difficulty}
                          </Badge>
                          <Badge variant="green">
                            {CATEGORY_LABELS[tip.category]}
                          </Badge>
                        </div>
                      </div>

                      <p className="text-sm text-gray-600 mt-1.5 leading-relaxed">
                        {tip.description}
                      </p>

                      <div className="mt-3 flex items-center justify-between flex-wrap gap-2">
                        <span className="text-xs text-green-700 font-medium bg-green-50 px-2.5 py-1 rounded-full">
                          💚 Saves ~{tip.potentialSaving} kg CO₂e/month
                        </span>
                        <button
                          onClick={() => toggleSave(tip.id)}
                          aria-pressed={isSaved}
                          aria-label={isSaved ? `Remove "${tip.title}" from saved tips` : `Save "${tip.title}"`}
                          className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-green-500 ${
                            isSaved
                              ? 'bg-green-600 text-white'
                              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                          }`}
                        >
                          {isSaved ? '✓ Saved' : '+ Save'}
                        </button>
                      </div>
                    </div>
                  </div>
                </Card>
              </li>
            );
          })}
        </ul>

        {filteredTips.length === 0 && (
          <div className="text-center py-10 text-gray-400">
            <div className="text-4xl mb-2" aria-hidden="true">🔍</div>
            <p>No tips match your filters. Try a different combination.</p>
          </div>
        )}
      </section>
    </main>
  );
}

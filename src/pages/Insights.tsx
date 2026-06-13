// ============================================================
// EcoTrack – Insights Page
// ============================================================

import { useMemo } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend, CartesianGrid,
} from 'recharts';
import { useApp } from '../context/AppContext';
import { Card, CardHeader } from '../components/ui/Card';
import {
  CATEGORY_COLORS, CATEGORY_LABELS,
  GLOBAL_AVERAGE_MONTHLY_KG, PARIS_TARGET_MONTHLY_KG,
} from '../data/emissionFactors';
import type { Category } from '../types';

// ── Benchmark data ────────────────────────────────────────────

const BENCHMARKS = [
  { name: 'You',         fill: '#16a34a' },
  { name: 'Paris 1.5°C', fill: '#6366f1' },
  { name: 'Global Avg',  fill: '#f59e0b' },
];

// ── Main component ────────────────────────────────────────────

export function Insights() {
  const { state, totalMonthCo2e, categoryBreakdown } = useApp();
  const { logs } = state;

  // Monthly totals (last 6 months)
  const monthlyData = useMemo(() => {
    const months: Record<string, number> = {};
    logs.forEach((l) => {
      const m = l.date.slice(0, 7);
      months[m] = (months[m] ?? 0) + l.totalCo2e;
    });
    return Object.entries(months)
      .sort((a, b) => a[0].localeCompare(b[0]))
      .slice(-6)
      .map(([month, total]) => ({
        month: new Date(month + '-01').toLocaleDateString('en', { month: 'short', year: '2-digit' }),
        total: parseFloat(total.toFixed(2)),
      }));
  }, [logs]);

  // Category pie data
  const pieData = useMemo(() => {
    return (Object.entries(categoryBreakdown) as [Category, number][])
      .filter(([, v]) => v > 0)
      .map(([cat, v]) => ({
        name: CATEGORY_LABELS[cat],
        value: parseFloat(v.toFixed(2)),
        fill: CATEGORY_COLORS[cat],
      }));
  }, [categoryBreakdown]);

  // Benchmark comparison
  const benchmarkData = [
    { name: 'Monthly kg CO₂e', You: parseFloat(totalMonthCo2e.toFixed(2)), 'Paris 1.5°C': PARIS_TARGET_MONTHLY_KG, 'Global Avg': GLOBAL_AVERAGE_MONTHLY_KG },
  ];

  // Top emitting activities this month
  const topActivities = useMemo(() => {
    const month = new Date().toISOString().slice(0, 7);
    const entries = logs
      .filter((l) => l.date.startsWith(month))
      .flatMap((l) => l.entries);
    const grouped: Record<string, { label: string; co2e: number; category: Category }> = {};
    entries.forEach((e) => {
      if (!grouped[e.subcategory]) {
        grouped[e.subcategory] = { label: e.subcategory, co2e: 0, category: e.category };
      }
      grouped[e.subcategory].co2e += e.co2e;
    });
    return Object.values(grouped)
      .sort((a, b) => b.co2e - a.co2e)
      .slice(0, 5);
  }, [logs]);

  // Streak calculation
  const currentStreak = useMemo(() => {
    const sorted = [...logs]
      .filter((l) => l.entries.length > 0)
      .sort((a, b) => b.date.localeCompare(a.date));
    if (!sorted.length) return 0;
    let streak = 0;
    let prev = new Date();
    prev.setHours(0, 0, 0, 0);
    for (const log of sorted) {
      const d = new Date(log.date);
      d.setHours(0, 0, 0, 0);
      const diff = (prev.getTime() - d.getTime()) / 86400000;
      if (diff <= 1) {
        streak++;
        prev = d;
      } else break;
    }
    return streak;
  }, [logs]);

  const totalEntries = logs.reduce((s, l) => s + l.entries.length, 0);

  const vsGlobalSaving = GLOBAL_AVERAGE_MONTHLY_KG - totalMonthCo2e;
  const vsGlobalLabel =
    vsGlobalSaving > 0
      ? `${vsGlobalSaving.toFixed(1)} kg below global average ✅`
      : `${Math.abs(vsGlobalSaving).toFixed(1)} kg above global average ⚠️`;

  return (
    <main id="main-content" className="space-y-6 pb-24 md:pb-6" aria-label="Insights">
      <h1 className="text-xl font-bold text-gray-900">Insights</h1>

      {/* ── Summary stats ─── */}
      <section aria-labelledby="summary-heading">
        <h2 id="summary-heading" className="sr-only">Summary Statistics</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { label: 'This Month', value: `${totalMonthCo2e.toFixed(1)} kg`, sub: 'CO₂e', icon: '📅', bg: 'bg-green-50' },
            { label: 'Total Logged', value: `${totalEntries}`, sub: 'activities', icon: '📝', bg: 'bg-blue-50' },
            { label: 'Logging Streak', value: `${currentStreak}`, sub: 'days', icon: '🔥', bg: 'bg-orange-50' },
            { label: 'vs Global Avg', value: `${Math.abs(vsGlobalSaving).toFixed(0)} kg`, sub: vsGlobalSaving >= 0 ? 'saved' : 'over', icon: '🌐', bg: 'bg-purple-50' },
          ].map((s) => (
            <div key={s.label} className={`${s.bg} rounded-2xl p-4`}>
              <span className="text-2xl" aria-hidden="true">{s.icon}</span>
              <p className="text-xl font-bold text-gray-900 mt-1">{s.value}</p>
              <p className="text-xs text-gray-500">{s.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Benchmark comparison ─── */}
      <section aria-labelledby="benchmark-heading">
        <Card>
          <CardHeader
            titleId="benchmark-heading"
            title="Benchmark Comparison"
            icon="🎯"
            subtitle={vsGlobalLabel}
          />
          <div role="img" aria-label="Bar chart comparing your monthly emissions against Paris target and global average">
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={benchmarkData} margin={{ top: 5, right: 5, left: -10, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} unit=" kg" />
                <Tooltip
                  formatter={(v) => [`${Number(v).toFixed(1)} kg CO₂e`]}
                  contentStyle={{ borderRadius: 12, fontSize: 12 }}
                />
                {BENCHMARKS.map((b) => (
                  <Bar key={b.name} dataKey={b.name} fill={b.fill} radius={[6, 6, 0, 0]} />
                ))}
                <Legend iconType="circle" wrapperStyle={{ fontSize: 12 }} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Comparison rows */}
          <div className="mt-4 space-y-2">
            {[
              { label: 'Paris 1.5°C target', value: PARIS_TARGET_MONTHLY_KG, color: '#6366f1' },
              { label: 'Global average', value: GLOBAL_AVERAGE_MONTHLY_KG, color: '#f59e0b' },
            ].map(({ label, value, color }) => {
              const diff = totalMonthCo2e - value;
              return (
                <div key={label} className="flex items-center justify-between text-sm">
                  <span className="flex items-center gap-2 text-gray-600">
                    <span className="w-3 h-3 rounded-full inline-block" style={{ backgroundColor: color }} aria-hidden="true" />
                    {label}
                  </span>
                  <span className={diff <= 0 ? 'text-green-600 font-medium' : 'text-red-500 font-medium'}>
                    {diff <= 0 ? `${Math.abs(diff).toFixed(1)} kg below ✅` : `${diff.toFixed(1)} kg above ⚠️`}
                  </span>
                </div>
              );
            })}
          </div>
        </Card>
      </section>

      {/* ── Monthly trend ─── */}
      {monthlyData.length > 1 && (
        <section aria-labelledby="trend-heading">
          <Card>
            <CardHeader
              titleId="trend-heading"
              title="Monthly Trend"
              icon="📈"
              subtitle="CO₂e emissions over time"
            />
            <div role="img" aria-label="Bar chart showing monthly CO₂e emissions">
              <ResponsiveContainer width="100%" height={180}>
                <BarChart data={monthlyData} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} />
                  <Tooltip
                    formatter={(v) => [`${Number(v).toFixed(2)} kg CO₂e`, 'Emissions']}
                    contentStyle={{ borderRadius: 12, fontSize: 12 }}
                  />
                  <Bar dataKey="total" fill="#16a34a" radius={[6, 6, 0, 0]} name="Monthly CO₂e" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </section>
      )}

      {/* ── Category pie chart ─── */}
      {pieData.length > 0 && (
        <section aria-labelledby="category-pie-heading">
          <Card>
            <CardHeader
              titleId="category-pie-heading"
              title="Emissions by Category"
              icon="🏷️"
              subtitle="This month's breakdown"
            />
            <div role="img" aria-label="Pie chart showing emissions broken down by category">
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={90}
                    paddingAngle={3}
                    dataKey="value"
                    label={({ name, percent }) =>
                      `${name} ${((percent ?? 0) * 100).toFixed(0)}%`
                    }
                    labelLine={false}
                  >
                    {pieData.map((entry) => (
                      <Cell key={entry.name} fill={entry.fill} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(v) => [`${Number(v).toFixed(2)} kg CO₂e`]}
                    contentStyle={{ borderRadius: 12, fontSize: 12 }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>

            {/* Legend list */}
            <ul className="grid grid-cols-2 gap-2 mt-2" role="list">
              {pieData.map((d) => (
                <li key={d.name} className="flex items-center gap-2 text-sm text-gray-600">
                  <span className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: d.fill }} aria-hidden="true" />
                  <span>{d.name}: <strong>{d.value} kg</strong></span>
                </li>
              ))}
            </ul>
          </Card>
        </section>
      )}

      {/* ── Top activities ─── */}
      {topActivities.length > 0 && (
        <section aria-labelledby="top-activities-heading">
          <Card>
            <CardHeader
              titleId="top-activities-heading"
              title="Top Emitting Activities"
              icon="🔝"
              subtitle="This month"
            />
            <ul className="space-y-3" role="list">
              {topActivities.map((act, i) => (
                <li key={act.label} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-lg font-bold text-gray-300 w-5" aria-hidden="true">
                      {i + 1}
                    </span>
                    <div>
                      <p className="text-sm font-medium text-gray-800 capitalize">
                        {act.label.replace(/_/g, ' ')}
                      </p>
                      <p className="text-xs text-gray-500">{CATEGORY_LABELS[act.category]}</p>
                    </div>
                  </div>
                  <span className="text-sm font-semibold text-gray-700">
                    {act.co2e.toFixed(2)} kg
                  </span>
                </li>
              ))}
            </ul>
          </Card>
        </section>
      )}

      {/* ── Empty state ─── */}
      {logs.length === 0 && (
        <div className="text-center py-12 text-gray-400">
          <div className="text-5xl mb-3" aria-hidden="true">📊</div>
          <p className="font-medium text-gray-600">No data yet</p>
          <p className="text-sm mt-1">Log activities to see your insights here.</p>
        </div>
      )}
    </main>
  );
}

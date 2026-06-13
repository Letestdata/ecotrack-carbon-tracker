// ============================================================
// EcoTrack – Dashboard Page
// ============================================================

import { useMemo } from 'react';
import {
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
} from 'recharts';
import { useApp } from '../context/AppContext';
import { Card, CardHeader } from '../components/ui/Card';
import { ProgressBar } from '../components/ui/ProgressBar';
import { Button } from '../components/ui/Button';
import { GLOBAL_AVERAGE_MONTHLY_KG, PARIS_TARGET_MONTHLY_KG, CATEGORY_COLORS, CATEGORY_LABELS } from '../data/emissionFactors';
import { ACHIEVEMENTS } from '../data/achievements';
import type { Category } from '../types';

// ── Stat card ────────────────────────────────────────────────

interface StatCardProps {
  label: string;
  value: string;
  sub?: string;
  icon: string;
  color: string;
  bgColor: string;
}

function StatCard({ label, value, sub, icon, color, bgColor }: StatCardProps) {
  return (
    <div className={`rounded-2xl p-5 ${bgColor} flex items-start gap-4`}>
      <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-2xl ${color} shrink-0`}>
        {icon}
      </div>
      <div className="min-w-0">
        <p className="text-sm text-gray-600 font-medium truncate">{label}</p>
        <p className="text-2xl font-bold text-gray-900 mt-0.5">{value}</p>
        {sub && <p className="text-xs text-gray-500 mt-0.5">{sub}</p>}
      </div>
    </div>
  );
}

// ── Main component ────────────────────────────────────────────

export function Dashboard() {
  const { state, navigate, totalMonthCo2e, todayCo2e, categoryBreakdown } = useApp();
  const { profile, logs, earnedAchievements } = state;

  // Last 7 days chart data
  const chartData = useMemo(() => {
    const days: { day: string; date: string; co2e: number }[] = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().slice(0, 10);
      const log = logs.find((l) => l.date === dateStr);
      days.push({
        day: d.toLocaleDateString('en', { weekday: 'short' }),
        date: dateStr,
        co2e: parseFloat((log?.totalCo2e ?? 0).toFixed(2)),
      });
    }
    return days;
  }, [logs]);

  // Category breakdown (top 3)
  const topCategories = useMemo(() => {
    return (Object.entries(categoryBreakdown) as [Category, number][])
      .filter(([, v]) => v > 0)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5);
  }, [categoryBreakdown]);

  const maxCatValue = useMemo(
    () => Math.max(...topCategories.map(([, v]) => v), 1),
    [topCategories]
  );

  // Goal progress
  const goalPct = Math.min((totalMonthCo2e / profile.monthlyBudgetGoal) * 100, 100);
  const goalColor =
    goalPct < 70 ? 'bg-green-500' : goalPct < 90 ? 'bg-amber-500' : 'bg-red-500';

  // vs global average
  const vsAverage = ((totalMonthCo2e / GLOBAL_AVERAGE_MONTHLY_KG) * 100).toFixed(0);

  // Recent achievements
  const recentAchievements = ACHIEVEMENTS.filter((a) =>
    earnedAchievements.includes(a.id)
  ).slice(0, 3);

  return (
    <main
      id="main-content"
      className="space-y-6 pb-24 md:pb-6"
      aria-label="Dashboard"
    >
      {/* ── Welcome header ─── */}
      <section aria-labelledby="welcome-heading">
        <div className="bg-gradient-to-r from-green-600 to-emerald-500 rounded-2xl p-6 text-white">
          <h1 id="welcome-heading" className="text-xl font-bold">
            Welcome back, {profile.name.split(' ')[0]}! 🌍
          </h1>
          <p className="text-green-100 text-sm mt-1">
            {new Date().toLocaleDateString('en', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
          </p>

          {/* Paris comparison */}
          <div className="mt-4 bg-white/20 rounded-xl p-4 backdrop-blur-sm">
            <p className="text-sm font-medium text-white/90">Monthly Emissions</p>
            <p className="text-3xl font-bold mt-1">
              {totalMonthCo2e.toFixed(1)}
              <span className="text-lg font-normal ml-1">kg CO₂e</span>
            </p>
            <div className="mt-2 flex items-center gap-2 text-xs text-white/80">
              <span>Paris target: {PARIS_TARGET_MONTHLY_KG.toFixed(0)} kg</span>
              <span>·</span>
              <span>Global avg: {GLOBAL_AVERAGE_MONTHLY_KG.toFixed(0)} kg</span>
            </div>
          </div>
        </div>
      </section>

      {/* ── Stats grid ─── */}
      <section aria-labelledby="stats-heading">
        <h2 id="stats-heading" className="sr-only">Key Statistics</h2>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <StatCard
            label="Today"
            value={`${todayCo2e.toFixed(1)} kg`}
            sub="CO₂e today"
            icon="📅"
            color="bg-blue-100"
            bgColor="bg-blue-50"
          />
          <StatCard
            label="This Month"
            value={`${totalMonthCo2e.toFixed(0)} kg`}
            sub={`Goal: ${profile.monthlyBudgetGoal} kg`}
            icon="📊"
            color="bg-green-100"
            bgColor="bg-green-50"
          />
          <StatCard
            label="vs Average"
            value={`${vsAverage}%`}
            sub="of global average"
            icon="🌐"
            color="bg-amber-100"
            bgColor="bg-amber-50"
          />
          <StatCard
            label="Badges"
            value={`${earnedAchievements.length}`}
            sub={`of ${ACHIEVEMENTS.length} earned`}
            icon="🏆"
            color="bg-purple-100"
            bgColor="bg-purple-50"
          />
        </div>
      </section>

      {/* ── Goal progress ─── */}
      <section aria-labelledby="goal-heading">
        <Card>
          <CardHeader
            titleId="goal-heading"
            title="Monthly Goal Progress"
            icon="🎯"
            subtitle={`${totalMonthCo2e.toFixed(1)} of ${profile.monthlyBudgetGoal} kg CO₂e`}
          />
          <ProgressBar
            value={totalMonthCo2e}
            max={profile.monthlyBudgetGoal}
            label={`${goalPct.toFixed(0)}% of monthly goal used`}
            color={goalColor}
            showLabel
          />
          <p className="text-xs text-gray-500 mt-2">
            {totalMonthCo2e <= profile.monthlyBudgetGoal
              ? `✅ On track! ${(profile.monthlyBudgetGoal - totalMonthCo2e).toFixed(1)} kg remaining`
              : `⚠️ Exceeded goal by ${(totalMonthCo2e - profile.monthlyBudgetGoal).toFixed(1)} kg`}
          </p>
        </Card>
      </section>

      {/* ── 7-day chart ─── */}
      <section aria-labelledby="chart-heading">
        <Card>
          <CardHeader
            titleId="chart-heading"
            title="Last 7 Days"
            icon="📈"
            subtitle="Daily CO₂e emissions"
          />
          <div role="img" aria-label="Area chart showing CO₂e emissions for the past 7 days">
            <ResponsiveContainer width="100%" height={180}>
              <AreaChart data={chartData} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="greenGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#16a34a" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#16a34a" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="day" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip
                  formatter={(v) => [`${Number(v).toFixed(2)} kg CO₂e`, 'Emissions']}
                  contentStyle={{ borderRadius: 12, border: '1px solid #e5e7eb', fontSize: 12 }}
                />
                <Area
                  type="monotone"
                  dataKey="co2e"
                  stroke="#16a34a"
                  strokeWidth={2.5}
                  fill="url(#greenGrad)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </section>

      {/* ── Category breakdown ─── */}
      {topCategories.length > 0 && (
        <section aria-labelledby="categories-heading">
          <Card>
            <CardHeader
              titleId="categories-heading"
              title="This Month by Category"
              icon="🏷️"
            />
            <ul className="space-y-3" role="list">
              {topCategories.map(([cat, val]) => (
                <li key={cat}>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="font-medium text-gray-700">
                      {CATEGORY_LABELS[cat]}
                    </span>
                    <span className="text-gray-500">{val.toFixed(1)} kg</span>
                  </div>
                  <div
                    className="h-2 rounded-full bg-gray-100 overflow-hidden"
                    role="progressbar"
                    aria-valuenow={val}
                    aria-valuemin={0}
                    aria-valuemax={maxCatValue}
                    aria-label={`${CATEGORY_LABELS[cat]}: ${val.toFixed(1)} kg CO₂e`}
                  >
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{
                        width: `${(val / maxCatValue) * 100}%`,
                        backgroundColor: CATEGORY_COLORS[cat],
                      }}
                    />
                  </div>
                </li>
              ))}
            </ul>
          </Card>
        </section>
      )}

      {/* ── Quick actions ─── */}
      <section aria-labelledby="actions-heading">
        <Card>
          <CardHeader titleId="actions-heading" title="Quick Actions" icon="⚡" />
          <div className="grid grid-cols-2 gap-3">
            <Button
              variant="primary"
              onClick={() => navigate('log')}
              aria-label="Log a new carbon activity"
            >
              ✏️ Log Activity
            </Button>
            <Button
              variant="secondary"
              onClick={() => navigate('assistant')}
              aria-label="Open AI assistant for personalised tips"
            >
              🤖 Ask EcoBot
            </Button>
            <Button
              variant="secondary"
              onClick={() => navigate('insights')}
              aria-label="View detailed insights"
            >
              📊 View Insights
            </Button>
            <Button
              variant="secondary"
              onClick={() => navigate('tips')}
              aria-label="Browse eco-friendly tips"
            >
              💡 Eco Tips
            </Button>
          </div>
        </Card>
      </section>

      {/* ── Recent achievements ─── */}
      {recentAchievements.length > 0 && (
        <section aria-labelledby="achievements-heading">
          <Card>
            <CardHeader
              titleId="achievements-heading"
              title="Recent Achievements"
              icon="🏅"
            />
            <ul className="flex gap-4 flex-wrap" role="list">
              {recentAchievements.map((a) => (
                <li
                  key={a.id}
                  className="flex items-center gap-2 bg-amber-50 rounded-xl px-3 py-2"
                >
                  <span className="text-2xl" aria-hidden="true">{a.icon}</span>
                  <div>
                    <p className="text-sm font-semibold text-gray-800">{a.title}</p>
                    <p className="text-xs text-gray-500">{a.description}</p>
                  </div>
                </li>
              ))}
            </ul>
          </Card>
        </section>
      )}

      {/* ── Empty state ─── */}
      {logs.length === 0 && (
        <div className="text-center py-8">
          <div className="text-5xl mb-4" aria-hidden="true">🌱</div>
          <h2 className="text-lg font-semibold text-gray-800">Start Your Eco Journey</h2>
          <p className="text-gray-500 text-sm mt-1 max-w-xs mx-auto">
            Log your first activity to see your personal carbon footprint and get tailored insights.
          </p>
          <Button className="mt-4" onClick={() => navigate('log')} aria-label="Log your first activity">
            Log My First Activity
          </Button>
        </div>
      )}
    </main>
  );
}

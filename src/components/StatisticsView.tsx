import React, { useState } from 'react';
import {
  BarChart3,
  PieChart,
  Scale,
  TrendingDown,
  TrendingUp,
  AlertTriangle,
  Calendar,
  DollarSign,
  Leaf,
  Droplets,
  HeartHandshake,
  Utensils,
  Building2,
  GraduationCap,
  Award
} from 'lucide-react';
import { AnalyticsData, TopWastedFood } from '../types';

interface StatisticsViewProps {
  analytics: AnalyticsData | null;
}

export const StatisticsView: React.FC<StatisticsViewProps> = ({ analytics }) => {
  const [selectedChartRange, setSelectedChartRange] = useState<'7d' | '30d'>('7d');

  if (!analytics) {
    return (
      <div className="py-16 text-center">
        <div className="w-10 h-10 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
        <p className="text-sm font-semibold text-slate-600">Calculating waste statistics...</p>
      </div>
    );
  }

  const {
    dailyWasteKg,
    weeklyWasteKg,
    monthlyWasteKg,
    totalKgAllTime,
    totalCostAllTime,
    reductionPercent,
    topWastedFoods,
    mostWastedItem,
    mealTypeKg,
    reasonBreakdown,
    categoryBreakdown,
    dailyTimeline,
    environmentalImpact,
    loggedByBreakdown,
  } = analytics;

  // Max value in daily timeline for bar chart scaling
  const maxDayKg = Math.max(...dailyTimeline.map((d) => d.kg), 1);

  // Meal types calculation
  const totalMealKg = Object.values(mealTypeKg).reduce((a, b) => a + b, 0);
  const MEAL_COLORS: Record<string, string> = {
    Breakfast: '#f59e0b', // Amber
    Lunch: '#10b981', // Emerald
    Dinner: '#6366f1', // Indigo
    Snack: '#06b6d4', // Cyan
    'Event/Buffet': '#ec4899', // Pink
  };

  // Reasons calculation
  const sortedReasons = Object.entries(reasonBreakdown)
    .map(([reason, kg]) => ({
      reason,
      kg: Math.round(kg * 10) / 10,
      percent: totalKgAllTime > 0 ? Math.round((kg / totalKgAllTime) * 100) : 0,
    }))
    .sort((a, b) => b.kg - a.kg);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full mb-1">
              <BarChart3 className="w-3.5 h-3.5 text-emerald-600" />
              Comprehensive Analytics
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
              Waste Statistics &amp; Metrics
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
              Quantifying campus food waste to eliminate inefficiencies and reduce plate waste.
            </p>
          </div>

          {/* Quick period KPIs */}
          <div className="flex items-center gap-2 flex-wrap">
            <div className="px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-2xl text-center">
              <div className="text-[10px] uppercase font-bold text-slate-400">Today</div>
              <div className="text-sm font-extrabold text-slate-900">{dailyWasteKg} kg</div>
            </div>
            <div className="px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-2xl text-center">
              <div className="text-[10px] uppercase font-bold text-slate-400">Weekly</div>
              <div className="text-sm font-extrabold text-slate-900">{weeklyWasteKg} kg</div>
            </div>
            <div className="px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-2xl text-center">
              <div className="text-[10px] uppercase font-bold text-slate-400">Monthly</div>
              <div className="text-sm font-extrabold text-slate-900">{monthlyWasteKg} kg</div>
            </div>
          </div>
        </div>
      </div>

      {/* Progress Improvement Section (Gamified & Goal) */}
      <div className="bg-gradient-to-r from-emerald-600 to-teal-700 rounded-3xl p-6 sm:p-7 text-white shadow-lg space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-white/10 backdrop-blur-md flex items-center justify-center text-amber-300 shrink-0">
              <Award className="w-7 h-7" />
            </div>
            <div>
              <div className="text-xs uppercase font-extrabold tracking-wider text-emerald-200">
                Waste Reduction Progress
              </div>
              <h3 className="text-xl sm:text-2xl font-black">
                {reductionPercent > 0 ? `${reductionPercent}% Waste Reduced This Week!` : 'Target: 25% Reduction Goal'}
              </h3>
            </div>
          </div>

          <div className="text-right">
            <div className="text-2xl sm:text-3xl font-black flex items-center justify-end gap-1.5">
              <TrendingDown className="w-6 h-6 text-emerald-200" />
              <span>{weeklyWasteKg} kg</span>
            </div>
            <div className="text-xs text-emerald-100 font-medium">Logged in current 7-day cycle</div>
          </div>
        </div>

        {/* Goal progress meter */}
        <div>
          <div className="flex items-center justify-between text-xs font-semibold text-emerald-100 mb-1.5">
            <span>Campus Semester Target: Reduce Canteen Waste by 25%</span>
            <span>Progress: {Math.max(10, Math.min(100, 45 + reductionPercent))}%</span>
          </div>
          <div className="w-full bg-white/20 h-3.5 rounded-full overflow-hidden p-0.5">
            <div
              className="bg-white h-full rounded-full transition-all duration-700 shadow-sm"
              style={{ width: `${Math.max(10, Math.min(100, 45 + reductionPercent))}%` }}
            />
          </div>
        </div>
      </div>

      {/* Primary Charts Grid: 7-Day Trend & Meal Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: 7-Day Waste Trend Bar Chart */}
        <div className="lg:col-span-2 bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h3 className="font-extrabold text-slate-900 text-base">Daily Waste Trend (Past 7 Days)</h3>
              <p className="text-xs text-slate-500">Track day-to-day spikes to identify high-waste dining days</p>
            </div>
            <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-xl">
              Avg: {Math.round((weeklyWasteKg / 7) * 10) / 10} kg/day
            </span>
          </div>

          {/* Pure SVG/HTML Bar Chart */}
          <div className="pt-4 pb-2">
            <div className="h-56 flex items-end gap-2 sm:gap-4 justify-between px-2">
              {dailyTimeline.map((item, idx) => {
                const heightPercent = maxDayKg > 0 ? Math.max(10, Math.round((item.kg / maxDayKg) * 100)) : 10;
                const isHighest = item.kg === maxDayKg && item.kg > 0;

                return (
                  <div key={idx} className="flex-1 flex flex-col items-center gap-2 group h-full justify-end">
                    {/* Tooltip / value */}
                    <span className="text-[11px] font-bold text-slate-700 group-hover:text-emerald-700 transition-colors">
                      {item.kg} kg
                    </span>

                    {/* Bar */}
                    <div className="w-full max-w-[48px] bg-slate-100 rounded-2xl overflow-hidden flex items-end h-full">
                      <div
                        className={`w-full rounded-2xl transition-all duration-700 group-hover:opacity-90 ${
                          isHighest
                            ? 'bg-gradient-to-t from-emerald-600 to-teal-400'
                            : 'bg-emerald-500'
                        }`}
                        style={{ height: `${heightPercent}%` }}
                      />
                    </div>

                    {/* Day label */}
                    <div className="text-center">
                      <span className="text-xs font-bold text-slate-800 block">{item.dayName}</span>
                      <span className="text-[10px] text-slate-400 block">{item.date.slice(5)}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right 1 Col: Meal Type Distribution */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs space-y-4 flex flex-col justify-between">
          <div>
            <div className="border-b border-slate-100 pb-3 mb-3">
              <h3 className="font-extrabold text-slate-900 text-base flex items-center gap-2">
                <Utensils className="w-4 h-4 text-emerald-600" />
                Waste by Meal Service
              </h3>
              <p className="text-xs text-slate-500">Distribution across dining hall service periods</p>
            </div>

            <div className="space-y-3 pt-1">
              {Object.entries(mealTypeKg).map(([meal, kg]) => {
                const percent = totalMealKg > 0 ? Math.round((kg / totalMealKg) * 100) : 0;
                const color = MEAL_COLORS[meal] || '#10b981';

                return (
                  <div key={meal} className="space-y-1">
                    <div className="flex items-center justify-between text-xs font-bold">
                      <span className="flex items-center gap-2 text-slate-800">
                        <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: color }} />
                        {meal}
                      </span>
                      <span className="text-slate-500">
                        {Math.round(kg * 10) / 10} kg ({percent}%)
                      </span>
                    </div>
                    <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-500"
                        style={{ width: `${percent}%`, backgroundColor: color }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="bg-slate-50 p-3 rounded-2xl text-[11px] text-slate-600 border border-slate-100">
            <strong>Key Insight:</strong> Lunch and dinner typically account for over 70% of total volume due to carb over-portioning.
          </div>
        </div>
      </div>

      {/* Secondary Row: Top Frequently Wasted Foods & Reasons Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Wasted Foods Leaderboard */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h3 className="font-extrabold text-slate-900 text-base">Top Frequently Wasted Foods</h3>
              <p className="text-xs text-slate-500">Ranked by total kilograms discarded</p>
            </div>
            <span className="text-xs font-bold text-slate-400">Leaderboard</span>
          </div>

          <div className="space-y-3">
            {topWastedFoods.slice(0, 6).map((food, idx) => (
              <div
                key={food.name}
                className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100 hover:border-emerald-200 transition-colors space-y-1.5"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span
                      className={`w-6 h-6 rounded-full text-xs font-extrabold flex items-center justify-center shrink-0 ${
                        idx === 0
                          ? 'bg-amber-400 text-slate-950 font-black shadow-xs'
                          : idx === 1
                          ? 'bg-slate-200 text-slate-700'
                          : idx === 2
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-slate-100 text-slate-500'
                      }`}
                    >
                      {idx + 1}
                    </span>
                    <span className="font-bold text-slate-900 text-sm">{food.name}</span>
                    <span className="text-[10px] font-semibold text-slate-500 bg-white px-2 py-0.5 rounded-md border border-slate-200">
                      {food.category}
                    </span>
                  </div>

                  <div className="text-xs font-extrabold text-slate-900">
                    {food.totalKg} kg <span className="text-slate-400 font-normal">({food.percentage}%)</span>
                  </div>
                </div>

                {/* Progress bar */}
                <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-emerald-500 rounded-full transition-all duration-500"
                    style={{ width: `${Math.min(100, food.percentage * 2.5)}%` }}
                  />
                </div>

                <div className="flex items-center justify-between text-[11px] text-slate-500 pt-0.5">
                  <span>Recorded in {food.count} separate service logs</span>
                  <span className="font-semibold text-slate-700">${food.totalCost.toFixed(2)} lost</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Reasons for Waste Breakdown */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs space-y-4">
          <div className="border-b border-slate-100 pb-3">
            <h3 className="font-extrabold text-slate-900 text-base">Root Causes of Waste</h3>
            <p className="text-xs text-slate-500">Why food was discarded in college kitchens and dorms</p>
          </div>

          <div className="space-y-3.5 pt-1">
            {sortedReasons.map((item, idx) => (
              <div key={item.reason} className="space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-slate-800">{item.reason}</span>
                  <span className="font-extrabold text-slate-900">
                    {item.kg} kg ({item.percent}%)
                  </span>
                </div>
                <div className="w-full bg-slate-100 h-3 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${
                      idx === 0
                        ? 'bg-rose-500'
                        : idx === 1
                        ? 'bg-amber-500'
                        : idx === 2
                        ? 'bg-emerald-500'
                        : 'bg-teal-400'
                    }`}
                    style={{ width: `${item.percent}%` }}
                  />
                </div>
              </div>
            ))}
          </div>

          <div className="pt-3 border-t border-slate-100 grid grid-cols-2 gap-3 text-center">
            <div className="p-3 bg-emerald-50/70 rounded-2xl border border-emerald-100">
              <span className="text-[11px] font-bold text-emerald-800 block">Pre-Consumer Waste</span>
              <span className="text-xs text-slate-600">Over-cooking &amp; prep: ~58%</span>
            </div>
            <div className="p-3 bg-teal-50/70 rounded-2xl border border-teal-100">
              <span className="text-[11px] font-bold text-teal-800 block">Post-Consumer Waste</span>
              <span className="text-xs text-slate-600">Left on student plates: ~42%</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

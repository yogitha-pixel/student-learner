import React from 'react';
import {
  TrendingDown,
  TrendingUp,
  AlertTriangle,
  Scale,
  Calendar,
  DollarSign,
  PlusCircle,
  Sparkles,
  ArrowRight,
  Leaf,
  Droplets,
  HeartHandshake,
  Utensils,
  Building2,
  GraduationCap
} from 'lucide-react';
import { AnalyticsData, FoodWasteRecord } from '../types';

interface DashboardProps {
  analytics: AnalyticsData | null;
  recentRecords: FoodWasteRecord[];
  onNavigate: (tab: 'dashboard' | 'add' | 'history' | 'stats' | 'ai' | 'instructions') => void;
}

export const Dashboard: React.FC<DashboardProps> = ({
  analytics,
  recentRecords,
  onNavigate,
}) => {
  if (!analytics) {
    return (
      <div className="py-16 text-center">
        <div className="w-10 h-10 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
        <p className="text-sm font-semibold text-slate-600">Loading campus waste metrics...</p>
      </div>
    );
  }

  const {
    dailyWasteKg,
    weeklyWasteKg,
    monthlyWasteKg,
    reductionPercent,
    mostWastedItem,
    totalCostAllTime,
    environmentalImpact,
    loggedByBreakdown,
  } = analytics;

  const canteenKg = loggedByBreakdown['College Canteen'] || 0;
  const studentKg = loggedByBreakdown['Student'] || 0;
  const totalLoggedKg = canteenKg + studentKg;
  const canteenPercent = totalLoggedKg > 0 ? Math.round((canteenKg / totalLoggedKg) * 100) : 50;
  const studentPercent = 100 - canteenPercent;

  return (
    <div className="space-y-6">
      {/* Hero Welcome Banner */}
      <div className="bg-gradient-to-r from-emerald-800 via-teal-800 to-slate-900 rounded-3xl p-6 sm:p-8 text-white relative overflow-hidden shadow-xl">
        <div className="absolute top-0 right-0 -mt-8 -mr-8 w-64 h-64 bg-emerald-400/20 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/10 backdrop-blur-md rounded-full text-emerald-200 text-xs font-semibold mb-3">
            <Leaf className="w-3.5 h-3.5 text-emerald-300" />
            Campus Sustainability Initiative
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white mb-2">
            Track Every Plate. Prevent Food Waste.
          </h1>
          <p className="text-emerald-100/90 text-sm sm:text-base leading-relaxed mb-6">
            FoodWise empowers college students and dining hall staff to record discarded food, pinpoint root causes like over-preparation and plate waste, and take data-driven action to cut food waste on campus.
          </p>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => onNavigate('add')}
              className="px-5 py-3 bg-emerald-500 hover:bg-emerald-400 text-white font-bold rounded-2xl shadow-lg shadow-emerald-900/30 flex items-center gap-2 transition-all hover:scale-[1.02] active:scale-[0.98] text-sm"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Record Food Waste</span>
            </button>

            <button
              onClick={() => onNavigate('ai')}
              className="px-5 py-3 bg-white/10 hover:bg-white/20 text-white rounded-2xl text-sm font-semibold transition-colors flex items-center gap-2 backdrop-blur-sm border border-white/10"
            >
              <Sparkles className="w-4 h-4 text-amber-300" />
              <span>View AI Recommendations</span>
            </button>
          </div>
        </div>
      </div>

      {/* 4 Primary Metric Cards: Daily, Weekly, Monthly, Progress */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Daily Waste */}
        <div className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-xs hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Today&apos;s Waste</span>
            <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <Calendar className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-slate-900">
            {dailyWasteKg} <span className="text-sm font-semibold text-slate-400">kg</span>
          </div>
          <p className="text-xs text-slate-500 mt-1">Logged across dining halls today</p>
        </div>

        {/* Weekly Waste */}
        <div className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-xs hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Weekly Waste</span>
            <div className="w-8 h-8 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center">
              <Scale className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-slate-900">
            {weeklyWasteKg} <span className="text-sm font-semibold text-slate-400">kg</span>
          </div>
          <p className="text-xs text-slate-500 mt-1">Last 7 days total volume</p>
        </div>

        {/* Monthly Waste */}
        <div className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-xs hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Monthly Waste</span>
            <div className="w-8 h-8 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <Utensils className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-slate-900">
            {monthlyWasteKg} <span className="text-sm font-semibold text-slate-400">kg</span>
          </div>
          <p className="text-xs text-slate-500 mt-1">Last 30 days cumulative</p>
        </div>

        {/* Waste Reduction Progress */}
        <div className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-xs hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Reduction Progress</span>
            <div
              className={`w-8 h-8 rounded-xl flex items-center justify-center ${
                reductionPercent >= 0 ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'
              }`}
            >
              {reductionPercent >= 0 ? (
                <TrendingDown className="w-4 h-4" />
              ) : (
                <TrendingUp className="w-4 h-4" />
              )}
            </div>
          </div>
          <div
            className={`text-2xl sm:text-3xl font-extrabold ${
              reductionPercent >= 0 ? 'text-emerald-600' : 'text-rose-600'
            }`}
          >
            {reductionPercent > 0 ? `-${reductionPercent}%` : `${reductionPercent}%`}
          </div>
          <p className="text-xs text-slate-500 mt-1">vs previous period target</p>
        </div>
      </div>

      {/* Spotlight Row: Top Wasted Food & Environmental Footprint */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Most Frequently Wasted Food Spotlight (Left 1 col) */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-500" />
                <h3 className="font-extrabold text-slate-900 text-sm">Most Wasted Food</h3>
              </div>
              <span className="text-[11px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-md">
                Priority Item
              </span>
            </div>

            {mostWastedItem ? (
              <div className="space-y-4">
                <div>
                  <h4 className="text-xl font-black text-slate-900">{mostWastedItem.name}</h4>
                  <p className="text-xs text-slate-500 mt-0.5">Category: {mostWastedItem.category}</p>
                </div>

                <div className="grid grid-cols-2 gap-3 bg-amber-50/50 p-3.5 rounded-2xl border border-amber-100/80">
                  <div>
                    <span className="text-[11px] font-semibold text-amber-900">Total Wasted</span>
                    <div className="text-lg font-extrabold text-amber-950">{mostWastedItem.totalKg} kg</div>
                  </div>
                  <div>
                    <span className="text-[11px] font-semibold text-amber-900">Estimated Loss</span>
                    <div className="text-lg font-extrabold text-amber-950">${mostWastedItem.totalCost.toFixed(2)}</div>
                  </div>
                </div>

                <div className="bg-slate-50 p-3 rounded-2xl text-xs text-slate-700 border border-slate-100">
                  <strong className="text-slate-900 block mb-1">💡 Quick Solution:</strong>
                  {mostWastedItem.name.toLowerCase().includes('rice') || mostWastedItem.name.toLowerCase().includes('pasta')
                    ? 'Switch from full-batch morning boiling to two-stage cooking at 11:30 AM and 12:45 PM.'
                    : 'Reduce buffet display batch sizes by 25% and offer free fresh refills upon request.'}
                </div>
              </div>
            ) : (
              <p className="text-xs text-slate-400">No waste logged yet.</p>
            )}
          </div>

          <button
            onClick={() => onNavigate('stats')}
            className="mt-4 pt-3 border-t border-slate-100 text-xs font-bold text-emerald-700 hover:text-emerald-800 flex items-center justify-between w-full"
          >
            <span>View Full Waste Leaderboard</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        {/* Environmental & Financial Impact Card (Right 2 cols) */}
        <div className="lg:col-span-2 bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs space-y-4">
          <div className="border-b border-slate-100 pb-3 flex items-center justify-between">
            <div>
              <h3 className="font-extrabold text-slate-900 text-base flex items-center gap-2">
                <Leaf className="w-4 h-4 text-emerald-600" />
                Ecological &amp; Financial Impact
              </h3>
              <p className="text-xs text-slate-500">Resource footprints generated by logged food waste</p>
            </div>
            <span className="text-xs font-bold text-slate-500">
              Total Value Lost: <strong className="text-slate-900">${totalCostAllTime.toFixed(2)}</strong>
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
            {/* CO2 Emissions */}
            <div className="p-4 rounded-2xl bg-emerald-50/60 border border-emerald-100 space-y-1">
              <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-800">
                <Leaf className="w-4 h-4 text-emerald-600" />
                <span>CO₂e Emissions</span>
              </div>
              <div className="text-2xl font-black text-emerald-950">
                {environmentalImpact.co2eKg} <span className="text-xs font-normal">kg CO₂e</span>
              </div>
              <p className="text-[11px] text-emerald-800/80 leading-snug">
                Equal to driving ~{Math.round(environmentalImpact.co2eKg * 4.2)} miles in an average car.
              </p>
            </div>

            {/* Virtual Water Lost */}
            <div className="p-4 rounded-2xl bg-sky-50/60 border border-sky-100 space-y-1">
              <div className="flex items-center gap-1.5 text-xs font-bold text-sky-800">
                <Droplets className="w-4 h-4 text-sky-600" />
                <span>Virtual Water Wasted</span>
              </div>
              <div className="text-2xl font-black text-sky-950">
                {environmentalImpact.waterLiters.toLocaleString()} <span className="text-xs font-normal">Liters</span>
              </div>
              <p className="text-[11px] text-sky-800/80 leading-snug">
                Equal to ~{Math.round(environmentalImpact.waterLiters / 65)} average 8-minute showers.
              </p>
            </div>

            {/* Equivalent Meals */}
            <div className="p-4 rounded-2xl bg-violet-50/60 border border-violet-100 space-y-1">
              <div className="flex items-center gap-1.5 text-xs font-bold text-violet-800">
                <HeartHandshake className="w-4 h-4 text-violet-600" />
                <span>Meals Equivalent</span>
              </div>
              <div className="text-2xl font-black text-violet-950">
                ~{environmentalImpact.mealsEquivalent} <span className="text-xs font-normal">meals</span>
              </div>
              <p className="text-[11px] text-violet-800/80 leading-snug">
                Could have provided wholesome sustenance to food-insecure peers.
              </p>
            </div>
          </div>

          {/* Student vs Canteen Proportion */}
          <div className="pt-2">
            <div className="flex items-center justify-between text-xs font-semibold text-slate-700 mb-1.5">
              <span className="flex items-center gap-1">
                <Building2 className="w-3.5 h-3.5 text-emerald-600" /> College Canteen: {canteenPercent}% ({canteenKg} kg)
              </span>
              <span className="flex items-center gap-1">
                <GraduationCap className="w-3.5 h-3.5 text-teal-600" /> Student Plate Waste: {studentPercent}% ({studentKg} kg)
              </span>
            </div>
            <div className="w-full bg-slate-100 h-3 rounded-full overflow-hidden flex">
              <div
                className="bg-emerald-600 h-full transition-all duration-500"
                style={{ width: `${canteenPercent}%` }}
                title={`Canteen Waste: ${canteenPercent}%`}
              />
              <div
                className="bg-teal-400 h-full transition-all duration-500"
                style={{ width: `${studentPercent}%` }}
                title={`Student Waste: ${studentPercent}%`}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Recent Records Quick View */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div>
            <h3 className="font-extrabold text-slate-900 text-base">Recent Food Waste Logs</h3>
            <p className="text-xs text-slate-500">Latest entries recorded by campus dining and students</p>
          </div>
          <button
            onClick={() => onNavigate('history')}
            className="text-xs font-bold text-emerald-700 hover:text-emerald-800 flex items-center gap-1"
          >
            <span>View All Records</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {recentRecords.length === 0 ? (
          <div className="text-center py-8 text-slate-400 text-xs">
            No records logged yet. Click &quot;Record Food Waste&quot; to get started.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="text-slate-400 border-b border-slate-100 pb-2">
                  <th className="pb-2 font-semibold">Food Item</th>
                  <th className="pb-2 font-semibold">Quantity</th>
                  <th className="pb-2 font-semibold">Meal</th>
                  <th className="pb-2 font-semibold">Reason for Waste</th>
                  <th className="pb-2 font-semibold">Logged By</th>
                  <th className="pb-2 font-semibold">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {recentRecords.slice(0, 5).map((rec) => (
                  <tr key={rec.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3 font-bold text-slate-900">
                      {rec.foodName}
                      <span className="text-[10px] text-slate-400 font-normal block">{rec.category}</span>
                    </td>
                    <td className="py-3 font-semibold">
                      {rec.quantity} {rec.unit}
                      <span className="text-[10px] text-slate-400 block">${rec.estimatedCost.toFixed(2)}</span>
                    </td>
                    <td className="py-3">
                      <span className="px-2 py-0.5 rounded-md bg-slate-100 font-medium text-slate-700">
                        {rec.mealType}
                      </span>
                    </td>
                    <td className="py-3 max-w-[200px] truncate" title={rec.reason}>
                      {rec.reason}
                    </td>
                    <td className="py-3">
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          rec.loggedBy === 'College Canteen'
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : 'bg-teal-50 text-teal-700 border border-teal-200'
                        }`}
                      >
                        {rec.loggedBy}
                      </span>
                    </td>
                    <td className="py-3 text-slate-500">{rec.date}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

import React from 'react';
import {
  UtensilsCrossed,
  LayoutDashboard,
  PlusCircle,
  History,
  BarChart3,
  Sparkles,
  TrendingDown,
  RotateCcw,
  BookOpen
} from 'lucide-react';

interface NavbarProps {
  activeTab: 'dashboard' | 'add' | 'history' | 'stats' | 'ai' | 'instructions';
  setActiveTab: (tab: 'dashboard' | 'add' | 'history' | 'stats' | 'ai' | 'instructions') => void;
  onResetSample: () => void;
  reductionPercent: number;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  onResetSample,
  reductionPercent,
}) => {
  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-emerald-100 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Brand */}
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => setActiveTab('dashboard')}>
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-500 flex items-center justify-center text-white shadow-md shadow-emerald-200">
              <UtensilsCrossed className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-xl text-slate-900 tracking-tight">FoodWise</span>
                <span className="text-[11px] font-bold bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded-full border border-emerald-200/80">
                  Campus Tracker
                </span>
              </div>
              <p className="text-[11px] text-slate-500 hidden sm:block">Students &amp; College Canteens Food Waste Reduction</p>
            </div>
          </div>

          {/* Center Navigation Links */}
          <nav className="hidden md:flex items-center gap-1 bg-slate-100/90 p-1.5 rounded-2xl text-xs font-semibold text-slate-600">
            <button
              onClick={() => setActiveTab('dashboard')}
              className={`px-3 py-1.5 rounded-xl transition-all flex items-center gap-1.5 ${
                activeTab === 'dashboard'
                  ? 'bg-white text-emerald-700 shadow-sm font-bold'
                  : 'hover:text-slate-900'
              }`}
            >
              <LayoutDashboard className="w-3.5 h-3.5" />
              <span>Dashboard</span>
            </button>

            <button
              onClick={() => setActiveTab('add')}
              className={`px-3 py-1.5 rounded-xl transition-all flex items-center gap-1.5 ${
                activeTab === 'add'
                  ? 'bg-emerald-600 text-white shadow-sm font-bold'
                  : 'hover:text-slate-900'
              }`}
            >
              <PlusCircle className="w-3.5 h-3.5" />
              <span>Add Waste</span>
            </button>

            <button
              onClick={() => setActiveTab('history')}
              className={`px-3 py-1.5 rounded-xl transition-all flex items-center gap-1.5 ${
                activeTab === 'history'
                  ? 'bg-white text-emerald-700 shadow-sm font-bold'
                  : 'hover:text-slate-900'
              }`}
            >
              <History className="w-3.5 h-3.5" />
              <span>Waste History</span>
            </button>

            <button
              onClick={() => setActiveTab('stats')}
              className={`px-3 py-1.5 rounded-xl transition-all flex items-center gap-1.5 ${
                activeTab === 'stats'
                  ? 'bg-white text-emerald-700 shadow-sm font-bold'
                  : 'hover:text-slate-900'
              }`}
            >
              <BarChart3 className="w-3.5 h-3.5" />
              <span>Statistics</span>
            </button>

            <button
              onClick={() => setActiveTab('ai')}
              className={`px-3 py-1.5 rounded-xl transition-all flex items-center gap-1.5 ${
                activeTab === 'ai'
                  ? 'bg-white text-emerald-700 shadow-sm font-bold'
                  : 'hover:text-slate-900'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              <span>AI Suggestions</span>
            </button>
          </nav>

          {/* Right Action buttons */}
          <div className="flex items-center gap-2">
            {/* Reduction improvement pill */}
            <div
              className={`hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold border ${
                reductionPercent >= 0
                  ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                  : 'bg-rose-50 text-rose-800 border-rose-200'
              }`}
              title="Week-over-week food waste reduction progress"
            >
              <TrendingDown className="w-3.5 h-3.5 text-emerald-600" />
              <span>{reductionPercent > 0 ? `-${reductionPercent}% Waste` : 'Tracking'}</span>
            </div>

            {/* Run Guide / Instructions */}
            <button
              onClick={() => setActiveTab('instructions')}
              className="text-xs font-semibold px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl transition-colors flex items-center gap-1"
              title="View instructions on how to run and configure this project"
            >
              <BookOpen className="w-3.5 h-3.5 text-slate-600" />
              <span className="hidden lg:inline">How to Run</span>
            </button>

            {/* Reset Sample Button */}
            <button
              onClick={onResetSample}
              className="text-xs font-semibold px-2.5 py-1.5 bg-amber-50 hover:bg-amber-100 text-amber-800 rounded-xl border border-amber-200/80 transition-colors flex items-center gap-1"
              title="Reload sample campus data for easy testing"
            >
              <RotateCcw className="w-3.5 h-3.5 text-amber-600" />
              <span className="hidden sm:inline">Reset Demo Data</span>
            </button>
          </div>
        </div>

        {/* Mobile Navigation bar */}
        <div className="flex md:hidden items-center justify-between py-2 border-t border-slate-100 text-xs font-semibold overflow-x-auto gap-1">
          <button
            onClick={() => setActiveTab('dashboard')}
            className={`px-2.5 py-1 rounded-lg ${activeTab === 'dashboard' ? 'bg-emerald-100 text-emerald-800' : 'text-slate-600'}`}
          >
            Dashboard
          </button>
          <button
            onClick={() => setActiveTab('add')}
            className={`px-2.5 py-1 rounded-lg ${activeTab === 'add' ? 'bg-emerald-600 text-white' : 'text-slate-600'}`}
          >
            + Add Log
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={`px-2.5 py-1 rounded-lg ${activeTab === 'history' ? 'bg-emerald-100 text-emerald-800' : 'text-slate-600'}`}
          >
            History
          </button>
          <button
            onClick={() => setActiveTab('stats')}
            className={`px-2.5 py-1 rounded-lg ${activeTab === 'stats' ? 'bg-emerald-100 text-emerald-800' : 'text-slate-600'}`}
          >
            Statistics
          </button>
          <button
            onClick={() => setActiveTab('ai')}
            className={`px-2.5 py-1 rounded-lg ${activeTab === 'ai' ? 'bg-emerald-100 text-emerald-800' : 'text-slate-600'}`}
          >
            AI Advice
          </button>
        </div>
      </div>
    </header>
  );
};

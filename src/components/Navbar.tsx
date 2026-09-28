import React from 'react';
import { BookOpen, Flame, Bell, Sparkles, Timer, RefreshCw } from 'lucide-react';
import { StudyStreak } from '../types';

interface NavbarProps {
  streak: StudyStreak;
  onOpenTimer: () => void;
  onOpenReminders: () => void;
  unreadRemindersCount: number;
  onSelectPreset: (key: string) => void;
  isGenerating: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({
  streak,
  onOpenTimer,
  onOpenReminders,
  unreadRemindersCount,
  onSelectPreset,
  isGenerating,
}) => {
  return (
    <header className="sticky top-0 z-30 bg-white/90 backdrop-blur-md border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-violet-500 flex items-center justify-center text-white shadow-md shadow-indigo-100">
            <BookOpen className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-lg text-slate-900 tracking-tight">StudyPulse</span>
              <span className="text-[11px] font-semibold bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded-full border border-indigo-200/60 flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-indigo-600" /> AI Powered
              </span>
            </div>
            <p className="text-xs text-slate-500 hidden sm:block">AI Study Planner &amp; Assignment Helper</p>
          </div>
        </div>

        {/* Center / Quick Presets for Demo */}
        <div className="hidden md:flex items-center gap-1.5 bg-slate-100/80 p-1 rounded-xl text-xs">
          <span className="px-2 text-slate-500 font-medium">Quick Presets:</span>
          <button
            onClick={() => onSelectPreset('cs')}
            className="px-2.5 py-1 rounded-lg text-slate-700 hover:bg-white hover:text-indigo-600 hover:shadow-sm transition-all font-medium"
          >
            💻 CS Major
          </button>
          <button
            onClick={() => onSelectPreset('premed')}
            className="px-2.5 py-1 rounded-lg text-slate-700 hover:bg-white hover:text-rose-600 hover:shadow-sm transition-all font-medium"
          >
            🩺 Pre-Med
          </button>
          <button
            onClick={() => onSelectPreset('business')}
            className="px-2.5 py-1 rounded-lg text-slate-700 hover:bg-white hover:text-amber-600 hover:shadow-sm transition-all font-medium"
          >
            📊 Business
          </button>
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-2.5">
          {/* Streak indicator */}
          <div
            title={`${streak.totalSessionsCompleted} sessions completed so far!`}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-50 border border-amber-200/80 rounded-xl text-amber-900 text-xs font-semibold"
          >
            <Flame className="w-4 h-4 text-amber-500 fill-amber-500 animate-pulse" />
            <span>{streak.currentStreak} Day{streak.currentStreak === 1 ? '' : 's'}</span>
          </div>

          {/* Quick Focus Timer */}
          <button
            onClick={onOpenTimer}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-medium transition-colors"
            title="Open Pomodoro / Study Timer"
          >
            <Timer className="w-4 h-4 text-indigo-600" />
            <span className="hidden sm:inline">Focus Timer</span>
          </button>

          {/* Reminders / Alerts */}
          <button
            onClick={onOpenReminders}
            className="relative p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition-colors"
            title="Exam countdowns and session reminders"
          >
            <Bell className="w-5 h-5" />
            {unreadRemindersCount > 0 && (
              <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-rose-500 rounded-full ring-2 ring-white animate-pulse" />
            )}
          </button>
        </div>
      </div>
    </header>
  );
};

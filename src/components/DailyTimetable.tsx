import React, { useState } from 'react';
import {
  CheckCircle2,
  Circle,
  Clock,
  Sparkles,
  Timer,
  BookOpen,
  Calendar,
  AlertCircle,
  Lightbulb,
  Download,
  Share2,
  ChevronLeft,
  ChevronRight,
  Plus,
  ArrowRight,
  HelpCircle,
  RotateCcw
} from 'lucide-react';
import { StudyPlan, StudySession, SessionStatus } from '../types';
import { downloadCalendarICS, exportPlanJSON } from '../utils/calendar';
import { playChimeSound, playTickSound } from '../utils/audio';

interface DailyTimetableProps {
  plan: StudyPlan;
  onUpdateSessionStatus: (sessionId: string, newStatus: SessionStatus, notes?: string) => void;
  onStartSessionTimer: (session: StudySession) => void;
  onGetTopicTips: (session: StudySession) => void;
  onRebalanceSchedule: () => void;
  isRebalancing: boolean;
}

export const DailyTimetable: React.FC<DailyTimetableProps> = ({
  plan,
  onUpdateSessionStatus,
  onStartSessionTimer,
  onGetTopicTips,
  onRebalanceSchedule,
  isRebalancing,
}) => {
  const [selectedDayIndex, setSelectedDayIndex] = useState(0);
  const [filterDifficulty, setFilterDifficulty] = useState<string>('all');

  const currentDay = plan.days[selectedDayIndex] || plan.days[0];

  if (!currentDay) {
    return null;
  }

  // Calculate day completion stats
  const totalDaySessions = currentDay.sessions.length;
  const completedDaySessions = currentDay.sessions.filter((s) => s.status === 'completed').length;
  const dayPercent = totalDaySessions > 0 ? Math.round((completedDaySessions / totalDaySessions) * 100) : 0;

  // Filtered sessions
  const visibleSessions = currentDay.sessions.filter((s) => {
    if (filterDifficulty === 'all') return true;
    return s.difficulty.toLowerCase() === filterDifficulty.toLowerCase();
  });

  const handleToggleComplete = (session: StudySession) => {
    if (session.status === 'completed') {
      playTickSound();
      onUpdateSessionStatus(session.id, 'pending');
    } else {
      playChimeSound();
      onUpdateSessionStatus(session.id, 'completed');
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header & Strategy Summary */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-5">
          <div>
            <div className="inline-flex items-center gap-2 text-xs font-bold text-indigo-600 bg-indigo-50 px-3 py-1 rounded-full mb-1">
              <Sparkles className="w-3.5 h-3.5" />
              AI Timetable Active
            </div>
            <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
              Daily Study Timetable
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
              Check off sessions as you study to keep your progress and streak updated.
            </p>
          </div>

          {/* Export & Rebalance buttons */}
          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={onRebalanceSchedule}
              disabled={isRebalancing}
              className="text-xs font-semibold px-3 py-2 bg-amber-50 text-amber-900 border border-amber-200/80 hover:bg-amber-100 rounded-xl transition-colors flex items-center gap-1.5"
              title="Catch up missed or incomplete sessions across upcoming days"
            >
              <RotateCcw className={`w-3.5 h-3.5 text-amber-600 ${isRebalancing ? 'animate-spin' : ''}`} />
              <span>{isRebalancing ? 'Rebalancing...' : 'Smart Rebalance'}</span>
            </button>

            <button
              onClick={() => downloadCalendarICS(plan)}
              className="text-xs font-semibold px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl transition-colors flex items-center gap-1.5"
              title="Download calendar file for Google Calendar or Apple Calendar"
            >
              <Download className="w-3.5 h-3.5 text-slate-600" />
              <span>Export .ICS</span>
            </button>
          </div>
        </div>

        {/* AI Strategy Overview Box */}
        {plan.summary && (
          <div className="mt-4 p-4 rounded-2xl bg-gradient-to-r from-indigo-50/70 via-sky-50/50 to-purple-50/40 border border-indigo-100 flex items-start gap-3">
            <div className="w-8 h-8 rounded-xl bg-indigo-600 text-white flex items-center justify-center shrink-0 shadow-sm mt-0.5">
              <Lightbulb className="w-4 h-4" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-indigo-950 uppercase tracking-wider">
                AI Prioritization Strategy
              </h4>
              <p className="text-xs sm:text-sm text-slate-700 mt-1 leading-relaxed">
                {plan.summary}
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Day Selector Navigation Pills */}
      <div className="bg-white rounded-2xl p-2 border border-slate-200 shadow-sm">
        <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0 scrollbar-thin">
          {plan.days.map((day, idx) => {
            const dayCompleted = day.sessions.filter((s) => s.status === 'completed').length;
            const isAllDone = day.sessions.length > 0 && dayCompleted === day.sessions.length;
            const isSelected = idx === selectedDayIndex;

            return (
              <button
                key={day.date}
                onClick={() => setSelectedDayIndex(idx)}
                className={`flex-shrink-0 px-4 py-2.5 rounded-xl text-left transition-all ${
                  isSelected
                    ? 'bg-indigo-600 text-white shadow-md shadow-indigo-200 font-semibold'
                    : 'bg-slate-50 hover:bg-slate-100 text-slate-700 font-medium'
                }`}
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="text-xs font-bold tracking-tight">
                    {day.dayOfWeek.slice(0, 3)} {day.date.slice(5)}
                  </span>
                  {isAllDone && (
                    <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${isSelected ? 'bg-indigo-500 text-white' : 'bg-emerald-100 text-emerald-800'}`}>
                      ✓ Done
                    </span>
                  )}
                </div>
                <div className="text-[11px] opacity-80 mt-0.5">
                  {dayCompleted}/{day.sessions.length} sessions ({Math.round((day.totalMinutes || 0) / 60)}h)
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Current Day Focus Banner */}
      <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-sm space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-bold text-slate-900">
                {currentDay.dayOfWeek}, {currentDay.date}
              </span>
              <span className="text-xs bg-indigo-50 text-indigo-700 font-semibold px-2 py-0.5 rounded-md">
                {totalDaySessions} sessions ({Math.round(currentDay.totalMinutes / 60 * 10) / 10} study hours)
              </span>
            </div>
            <p className="text-xs text-slate-600 font-medium mt-1 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-indigo-500 animate-ping" />
              Theme: <span className="text-slate-800 font-semibold">{currentDay.focusTheme}</span>
            </p>
          </div>

          {/* Day Progress Meter */}
          <div className="sm:text-right">
            <div className="text-xs text-slate-500 font-semibold mb-1">
              Day Progress: {completedDaySessions} / {totalDaySessions} ({dayPercent}%)
            </div>
            <div className="w-full sm:w-44 bg-slate-100 h-2.5 rounded-full overflow-hidden">
              <div
                className="bg-emerald-500 h-full transition-all duration-500 rounded-full"
                style={{ width: `${dayPercent}%` }}
              />
            </div>
          </div>
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-2 pt-2 border-t border-slate-100 text-xs">
          <span className="text-slate-400 font-medium">Filter:</span>
          {['all', 'hard', 'medium', 'easy'].map((diff) => (
            <button
              key={diff}
              onClick={() => setFilterDifficulty(diff)}
              className={`px-2.5 py-1 rounded-lg capitalize font-medium transition-colors ${
                filterDifficulty === diff
                  ? 'bg-slate-900 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {diff}
            </button>
          ))}
        </div>
      </div>

      {/* Session Cards List */}
      <div className="space-y-3">
        {visibleSessions.length === 0 ? (
          <div className="bg-white rounded-2xl p-8 text-center border border-slate-200">
            <p className="text-sm text-slate-500">No sessions match this filter for this day.</p>
          </div>
        ) : (
          visibleSessions.map((session, index) => {
            const isCompleted = session.status === 'completed';
            const isHard = session.difficulty === 'Hard';

            return (
              <div
                key={session.id}
                className={`bg-white rounded-2xl p-4 sm:p-5 border transition-all ${
                  isCompleted
                    ? 'border-emerald-200 bg-emerald-50/20 opacity-85'
                    : isHard
                    ? 'border-rose-200 shadow-sm hover:shadow-md'
                    : 'border-slate-200 shadow-sm hover:shadow-md'
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  {/* Left: Checkbox + Session Details */}
                  <div className="flex items-start gap-3.5 flex-1">
                    <button
                      onClick={() => handleToggleComplete(session)}
                      className="mt-0.5 text-slate-400 hover:text-emerald-600 transition-colors focus:outline-none shrink-0"
                      title={isCompleted ? 'Mark as incomplete' : 'Mark as completed'}
                    >
                      {isCompleted ? (
                        <CheckCircle2 className="w-6 h-6 text-emerald-500 fill-emerald-100" />
                      ) : (
                        <Circle className="w-6 h-6 hover:text-slate-600" />
                      )}
                    </button>

                    <div className="space-y-1 flex-1">
                      {/* Subject + Tags */}
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-bold text-slate-900 text-sm sm:text-base">
                          {session.subjectName}
                        </span>

                        <span
                          className={`text-[11px] font-bold px-2 py-0.5 rounded-md ${
                            session.difficulty === 'Hard'
                              ? 'bg-rose-100 text-rose-800'
                              : session.difficulty === 'Medium'
                              ? 'bg-amber-100 text-amber-800'
                              : 'bg-emerald-100 text-emerald-800'
                          }`}
                        >
                          {session.difficulty} Difficulty
                        </span>

                        {session.priority === 'high' && (
                          <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-red-50 text-red-700 border border-red-200">
                            ★ High Priority
                          </span>
                        )}
                      </div>

                      {/* Topic Title */}
                      <h4
                        className={`text-sm sm:text-base font-semibold leading-snug ${
                          isCompleted ? 'line-through text-slate-400' : 'text-slate-800'
                        }`}
                      >
                        {session.topic}
                      </h4>

                      {/* Active Learning Technique Pill */}
                      <div className="flex items-center gap-3 pt-1 text-xs text-slate-500 flex-wrap">
                        <span className="flex items-center gap-1 font-medium bg-slate-100 px-2 py-0.5 rounded-md text-slate-700">
                          <BookOpen className="w-3 h-3 text-indigo-600" />
                          {session.technique}
                        </span>

                        <span className="flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5 text-slate-400" />
                          {session.startTime} • {session.durationMinutes} mins
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Right Actions: Timer + AI Topic Tips */}
                  <div className="flex flex-col sm:flex-row items-end sm:items-center gap-2 shrink-0">
                    <button
                      onClick={() => onGetTopicTips(session)}
                      className="text-xs font-semibold px-2.5 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-xl transition-colors flex items-center gap-1"
                      title="Get 3 quick high-yield flash tips for this topic"
                    >
                      <Lightbulb className="w-3.5 h-3.5 text-indigo-600" />
                      <span className="hidden sm:inline">AI Study Tips</span>
                    </button>

                    <button
                      onClick={() => onStartSessionTimer(session)}
                      className={`text-xs font-bold px-3 py-1.5 rounded-xl transition-all flex items-center gap-1.5 shadow-sm ${
                        isCompleted
                          ? 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                          : 'bg-indigo-600 hover:bg-indigo-500 text-white'
                      }`}
                      title="Start Pomodoro Focus Timer for this session"
                    >
                      <Timer className="w-3.5 h-3.5" />
                      <span>{isCompleted ? 'Review Timer' : 'Start Focus'}</span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Motivational High-Yield Tips Section from Gemini */}
      {plan.highYieldTips && plan.highYieldTips.length > 0 && (
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm">
          <div className="flex items-center gap-2 mb-3">
            <Sparkles className="w-4 h-4 text-amber-500" />
            <h3 className="font-bold text-slate-900 text-sm">
              College High-Yield Exam Advice for Your Course Load
            </h3>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {plan.highYieldTips.map((tip, idx) => (
              <div
                key={idx}
                className="bg-slate-50 p-3 rounded-2xl border border-slate-100 flex items-start gap-2.5 text-xs text-slate-700"
              >
                <div className="w-5 h-5 rounded-full bg-indigo-100 text-indigo-700 font-bold flex items-center justify-center shrink-0 text-[10px] mt-0.5">
                  {idx + 1}
                </div>
                <p className="leading-relaxed font-medium">{tip}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

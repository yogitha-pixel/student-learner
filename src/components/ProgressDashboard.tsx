import React from 'react';
import {
  Trophy,
  Flame,
  CheckCircle2,
  Clock,
  Calendar,
  AlertTriangle,
  TrendingUp,
  BarChart3,
  Award
} from 'lucide-react';
import { StudyPlan, Subject, StudyStreak } from '../types';

interface ProgressDashboardProps {
  plan: StudyPlan | null;
  subjects: Subject[];
  streak: StudyStreak;
}

export const ProgressDashboard: React.FC<ProgressDashboardProps> = ({
  plan,
  subjects,
  streak,
}) => {
  if (!plan) {
    return (
      <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-sm text-center">
        <Trophy className="w-12 h-12 text-slate-300 mx-auto mb-3" />
        <h3 className="font-bold text-slate-800 text-base">No Timetable Generated Yet</h3>
        <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1">
          Add your subjects and click &quot;Generate AI Daily Timetable&quot; to track your progress and exam countdowns.
        </p>
      </div>
    );
  }

  // Calculate statistics
  let totalSessions = 0;
  let completedSessions = 0;
  let totalMinutesScheduled = 0;
  let completedMinutes = 0;

  // Track per-subject stats
  const subjectStats: Record<string, { total: number; completed: number; minutes: number }> = {};
  subjects.forEach((s) => {
    subjectStats[s.id] = { total: 0, completed: 0, minutes: 0 };
  });

  plan.days.forEach((day) => {
    day.sessions.forEach((s) => {
      totalSessions++;
      totalMinutesScheduled += s.durationMinutes || 45;

      if (!subjectStats[s.subjectId]) {
        subjectStats[s.subjectId] = { total: 0, completed: 0, minutes: 0 };
      }
      subjectStats[s.subjectId].total++;

      if (s.status === 'completed') {
        completedSessions++;
        completedMinutes += s.durationMinutes || 45;
        subjectStats[s.subjectId].completed++;
        subjectStats[s.subjectId].minutes += s.durationMinutes || 45;
      }
    });
  });

  const overallPercent = totalSessions > 0 ? Math.round((completedSessions / totalSessions) * 100) : 0;
  const totalHoursCompleted = Math.round((completedMinutes / 60) * 10) / 10;
  const totalHoursGoal = Math.round((totalMinutesScheduled / 60) * 10) / 10;

  // Get days until exam helper
  const getDaysUntilExam = (examDateStr: string) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const examDate = new Date(examDateStr);
    examDate.setHours(0, 0, 0, 0);
    return Math.ceil((examDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
  };

  // Sort subjects by nearest exam
  const sortedSubjectsByExam = [...subjects].sort((a, b) => {
    return getDaysUntilExam(a.examDate) - getDaysUntilExam(b.examDate);
  });

  return (
    <div className="space-y-6">
      {/* Overview Stat Tiles */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Overall Completion */}
        <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 shrink-0">
            <TrendingUp className="w-6 h-6" />
          </div>
          <div>
            <div className="text-2xl font-extrabold text-slate-900">{overallPercent}%</div>
            <div className="text-xs text-slate-500 font-medium">Curriculum Progress</div>
          </div>
        </div>

        {/* Hours Studied */}
        <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600 shrink-0">
            <Clock className="w-6 h-6" />
          </div>
          <div>
            <div className="text-2xl font-extrabold text-slate-900">
              {totalHoursCompleted} <span className="text-xs text-slate-400 font-normal">/ {totalHoursGoal}h</span>
            </div>
            <div className="text-xs text-slate-500 font-medium">Study Hours Logged</div>
          </div>
        </div>

        {/* Sessions Completed */}
        <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-sky-50 border border-sky-100 flex items-center justify-center text-sky-600 shrink-0">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <div>
            <div className="text-2xl font-extrabold text-slate-900">
              {completedSessions} <span className="text-xs text-slate-400 font-normal">/ {totalSessions}</span>
            </div>
            <div className="text-xs text-slate-500 font-medium">Sessions Mastered</div>
          </div>
        </div>

        {/* Current Study Streak */}
        <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-amber-50 border border-amber-100 flex items-center justify-center text-amber-500 shrink-0">
            <Flame className="w-6 h-6 fill-amber-500" />
          </div>
          <div>
            <div className="text-2xl font-extrabold text-slate-900">{streak.currentStreak} Days</div>
            <div className="text-xs text-slate-500 font-medium">Consistency Streak</div>
          </div>
        </div>
      </div>

      {/* Main Grid: Subject Mastery Progress & Exam Proximity Watchlist */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Subject Progress Breakdown */}
        <div className="lg:col-span-2 bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-5">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
                <BarChart3 className="w-4 h-4 text-indigo-600" />
                Subject Mastery & Completion
              </h3>
              <p className="text-xs text-slate-500">Track how much of each course you have reviewed</p>
            </div>
          </div>

          <div className="space-y-4">
            {subjects.map((sub) => {
              const stats = subjectStats[sub.id] || { total: 0, completed: 0, minutes: 0 };
              const percent = stats.total > 0 ? Math.round((stats.completed / stats.total) * 100) : 0;
              const hoursStudied = Math.round((stats.minutes / 60) * 10) / 10;

              return (
                <div key={sub.id} className="p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span
                        className="w-3 h-3 rounded-full shrink-0"
                        style={{ backgroundColor: sub.color || '#6366f1' }}
                      />
                      <span className="font-bold text-slate-800 text-sm">{sub.name}</span>
                      <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-white text-slate-600 border border-slate-200">
                        {sub.difficulty}
                      </span>
                    </div>

                    <div className="text-xs font-semibold text-slate-700">
                      {stats.completed} / {stats.total} sessions ({percent}%)
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div className="w-full bg-slate-200/80 h-2.5 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{
                        width: `${percent}%`,
                        backgroundColor: sub.color || '#6366f1',
                      }}
                    />
                  </div>

                  <div className="flex items-center justify-between text-[11px] text-slate-500 pt-0.5">
                    <span>{hoursStudied} hours logged</span>
                    <span>Target: {sub.targetHours || 10} hours</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Col: Urgent Exam Proximity Watchlist */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4">
          <div className="border-b border-slate-100 pb-3">
            <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
              <Calendar className="w-4 h-4 text-rose-500" />
              Exam Proximity Watchlist
            </h3>
            <p className="text-xs text-slate-500">Urgency countdowns for all registered exams</p>
          </div>

          <div className="space-y-3">
            {sortedSubjectsByExam.map((sub) => {
              const daysLeft = getDaysUntilExam(sub.examDate);
              const isCritical = daysLeft >= 0 && daysLeft <= 4;
              const isPast = daysLeft < 0;

              return (
                <div
                  key={sub.id}
                  className={`p-3.5 rounded-2xl border transition-all ${
                    isCritical
                      ? 'border-rose-300 bg-rose-50/50'
                      : 'border-slate-200 bg-white'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h4 className="font-bold text-slate-900 text-xs sm:text-sm">{sub.name}</h4>
                      <p className="text-[11px] text-slate-500 mt-0.5">Exam: {sub.examDate}</p>
                    </div>

                    <div className="text-right shrink-0">
                      <span
                        className={`text-xs font-bold px-2 py-0.5 rounded-md inline-flex items-center gap-1 ${
                          isCritical
                            ? 'bg-rose-100 text-rose-800 animate-pulse'
                            : isPast
                            ? 'bg-slate-100 text-slate-500'
                            : 'bg-indigo-50 text-indigo-700'
                        }`}
                      >
                        {isCritical && <AlertTriangle className="w-3 h-3 text-rose-600" />}
                        {isPast ? 'Passed' : daysLeft === 0 ? 'Today!' : `${daysLeft} days`}
                      </span>
                    </div>
                  </div>

                  {isCritical && (
                    <p className="text-[10px] text-rose-700 font-semibold mt-2 pt-1 border-t border-rose-200/50">
                      ⚡ High Urgency: Recommended to focus heavily on practice problems today.
                    </p>
                  )}
                </div>
              );
            })}
          </div>

          {/* Gamified Motivation Card */}
          <div className="bg-gradient-to-tr from-amber-500 to-amber-600 text-white rounded-2xl p-4 shadow-sm">
            <div className="flex items-center gap-2 mb-1">
              <Award className="w-5 h-5 text-amber-200" />
              <span className="font-bold text-xs uppercase tracking-wide text-amber-100">
                Study Habit Milestone
              </span>
            </div>
            <p className="text-xs text-amber-50 font-medium leading-relaxed">
              Studying consistently for {streak.currentStreak} day{streak.currentStreak === 1 ? '' : 's'} boosts long-term recall by up to 200% compared to last-night cramming. Keep going!
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

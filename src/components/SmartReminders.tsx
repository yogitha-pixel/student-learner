import React from 'react';
import {
  X,
  Bell,
  Calendar,
  AlertTriangle,
  Clock,
  CheckCircle,
  Sparkles,
  RotateCcw,
  Volume2
} from 'lucide-react';
import { StudyPlan, Subject, ReminderNotification } from '../types';

interface SmartRemindersProps {
  isOpen: boolean;
  onClose: () => void;
  subjects: Subject[];
  plan: StudyPlan | null;
  onStartSession: (sessionId: string) => void;
  onRebalanceSchedule: () => void;
  isRebalancing: boolean;
}

export const SmartReminders: React.FC<SmartRemindersProps> = ({
  isOpen,
  onClose,
  subjects,
  plan,
  onStartSession,
  onRebalanceSchedule,
  isRebalancing,
}) => {
  if (!isOpen) return null;

  // Build real-time reminders
  const reminders: ReminderNotification[] = [];
  const todayStr = new Date().toISOString().split('T')[0];

  // 1. Exam proximity alerts
  subjects.forEach((sub) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const examDate = new Date(sub.examDate);
    examDate.setHours(0, 0, 0, 0);
    const diffDays = Math.ceil((examDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

    if (diffDays >= 0 && diffDays <= 5) {
      reminders.push({
        id: `rem-exam-${sub.id}`,
        title: diffDays === 0 ? `🚨 ${sub.name} EXAM IS TODAY!` : `⚠️ ${sub.name} Exam in ${diffDays} day${diffDays === 1 ? '' : 's'}!`,
        message: `Make sure to review summary formulas, active recall flashcards, and solve at least 3 practice questions.`,
        type: 'urgent_exam',
        timestamp: 'Urgent',
        read: false,
      });
    }
  });

  // 2. Today's sessions reminder
  if (plan && plan.days.length > 0) {
    const todayDay = plan.days.find((d) => d.date === todayStr) || plan.days[0];
    const pendingToday = todayDay.sessions.filter((s) => s.status === 'pending');

    if (pendingToday.length > 0) {
      const nextSession = pendingToday[0];
      reminders.push({
        id: `rem-next-${nextSession.id}`,
        title: `Upcoming Session: ${nextSession.subjectName} (${nextSession.startTime})`,
        message: `Topic: "${nextSession.topic}" (${nextSession.durationMinutes} mins). Technique: ${nextSession.technique}.`,
        type: 'session_upcoming',
        timestamp: nextSession.startTime,
        read: false,
        actionText: 'Start Focus',
      });
    }

    // Missed sessions check
    const missedSessions = plan.days
      .filter((d) => d.date < todayStr)
      .flatMap((d) => d.sessions.filter((s) => s.status === 'pending'));

    if (missedSessions.length > 0) {
      reminders.push({
        id: 'rem-missed',
        title: `You have ${missedSessions.length} incomplete session${missedSessions.length === 1 ? '' : 's'}`,
        message: `Don't stress! Click "Smart Rebalance" and AI will redistribute them evenly without causing burnout.`,
        type: 'rebalance_hint',
        timestamp: 'Action recommended',
        read: false,
        actionText: 'Rebalance Now',
      });
    }
  }

  // Request browser notification permission
  const handleEnableBrowserNotifications = async () => {
    if ('Notification' in window) {
      const perm = await Notification.requestPermission();
      if (perm === 'granted') {
        new Notification('StudyPulse Reminders Active!', {
          body: 'You will receive timely alerts for your college study blocks and upcoming exams.',
        });
      }
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-7 shadow-2xl border border-slate-100 relative">
        <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <Bell className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-slate-900 text-base">Study Reminders & Alerts</h3>
              <p className="text-xs text-slate-500">Live notifications for upcoming exams and sessions</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Reminders List */}
        <div className="space-y-3 max-h-[60vh] overflow-y-auto pr-1">
          {reminders.length === 0 ? (
            <div className="py-8 text-center text-slate-500">
              <CheckCircle className="w-10 h-10 text-emerald-500 mx-auto mb-2" />
              <p className="text-sm font-semibold text-slate-800">All caught up!</p>
              <p className="text-xs text-slate-400 mt-0.5">
                No urgent exam alerts or overdue sessions at this time.
              </p>
            </div>
          ) : (
            reminders.map((rem) => {
              const isUrgent = rem.type === 'urgent_exam';
              const isRebalance = rem.type === 'rebalance_hint';

              return (
                <div
                  key={rem.id}
                  className={`p-4 rounded-2xl border transition-all ${
                    isUrgent
                      ? 'border-rose-200 bg-rose-50/60'
                      : isRebalance
                      ? 'border-amber-200 bg-amber-50/60'
                      : 'border-slate-200 bg-slate-50/60'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-start gap-2.5">
                      {isUrgent ? (
                        <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                      ) : isRebalance ? (
                        <RotateCcw className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                      ) : (
                        <Clock className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
                      )}
                      <div>
                        <h4 className="text-xs sm:text-sm font-bold text-slate-900 leading-snug">
                          {rem.title}
                        </h4>
                        <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                          {rem.message}
                        </p>
                      </div>
                    </div>

                    <span className="text-[10px] font-bold text-slate-400 shrink-0">
                      {rem.timestamp}
                    </span>
                  </div>

                  {/* Optional Action Button */}
                  {rem.actionText && (
                    <div className="mt-3 pt-2 border-t border-slate-200/50 flex justify-end">
                      {isRebalance ? (
                        <button
                          onClick={() => {
                            onRebalanceSchedule();
                            onClose();
                          }}
                          disabled={isRebalancing}
                          className="px-3 py-1.5 bg-amber-600 hover:bg-amber-500 text-white rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5"
                        >
                          <Sparkles className="w-3.5 h-3.5" />
                          <span>{isRebalancing ? 'Rebalancing...' : 'Smart Rebalance'}</span>
                        </button>
                      ) : (
                        <button
                          onClick={() => {
                            onStartSession(rem.id.replace('rem-next-', ''));
                            onClose();
                          }}
                          className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold transition-colors"
                        >
                          {rem.actionText} →
                        </button>
                      )}
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>

        {/* Browser Notifications Footer Banner */}
        <div className="mt-4 pt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-600">
          <span className="text-[11px] text-slate-500">Want alerts when a session starts?</span>
          <button
            onClick={handleEnableBrowserNotifications}
            className="font-bold text-indigo-600 hover:text-indigo-700 bg-indigo-50 hover:bg-indigo-100 px-3 py-1.5 rounded-xl transition-colors"
          >
            Enable Browser Alerts
          </button>
        </div>
      </div>
    </div>
  );
};

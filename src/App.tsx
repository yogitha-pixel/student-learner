import React, { useState, useEffect } from 'react';
import {
  Calendar as CalendarIcon,
  BookOpen,
  TrendingUp,
  Sparkles,
  AlertCircle,
  RotateCcw,
  CheckCircle2,
  Timer as TimerIcon,
  Flame,
  ArrowRight
} from 'lucide-react';
import { Subject, StudentPreferences, StudyPlan, StudySession, SessionStatus, StudyStreak } from './types';
import {
  loadSavedSubjects,
  saveSubjects,
  loadSavedPreferences,
  savePreferences,
  loadSavedPlan,
  savePlan,
  loadStreak,
  saveStreak,
  SAMPLE_PRESETS,
} from './utils/storage';
import { Navbar } from './components/Navbar';
import { SubjectManager } from './components/SubjectManager';
import { DailyTimetable } from './components/DailyTimetable';
import { ProgressDashboard } from './components/ProgressDashboard';
import { StudyTimerModal } from './components/StudyTimerModal';
import { SmartReminders } from './components/SmartReminders';
import { TopicTipsModal } from './components/TopicTipsModal';
import { AssignmentHelper } from './components/AssignmentHelper';

export default function App() {
  const [activeTab, setActiveTab] = useState<'assignment' | 'timetable' | 'subjects' | 'progress'>('assignment');

  // Core state
  const [subjects, setSubjects] = useState<Subject[]>(loadSavedSubjects);
  const [preferences, setPreferences] = useState<StudentPreferences>(loadSavedPreferences);
  const [studyPlan, setStudyPlan] = useState<StudyPlan | null>(loadSavedPlan);
  const [streak, setStreak] = useState<StudyStreak>(loadStreak);

  // Loading & Modals
  const [isGenerating, setIsGenerating] = useState(false);
  const [isRebalancing, setIsRebalancing] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Timer modal state
  const [activeTimerSession, setActiveTimerSession] = useState<StudySession | null>(null);
  const [isTimerOpen, setIsTimerOpen] = useState(false);

  // Topic tips modal
  const [activeTipsSession, setActiveTipsSession] = useState<StudySession | null>(null);
  const [isTipsOpen, setIsTipsOpen] = useState(false);

  // Reminders modal
  const [isRemindersOpen, setIsRemindersOpen] = useState(false);

  // Save changes to localStorage
  useEffect(() => {
    saveSubjects(subjects);
  }, [subjects]);

  useEffect(() => {
    savePreferences(preferences);
  }, [preferences]);

  useEffect(() => {
    savePlan(studyPlan);
  }, [studyPlan]);

  useEffect(() => {
    saveStreak(streak);
  }, [streak]);

  // If no plan exists on initial load, auto-generate from current subjects
  useEffect(() => {
    if (!studyPlan && subjects.length > 0) {
      handleGeneratePlan();
    }
  }, []);

  // Preset Selector handler
  const handleSelectPreset = (key: string) => {
    const preset = SAMPLE_PRESETS[key];
    if (preset) {
      setSubjects(preset.subjects);
      setActiveTab('subjects');
      // Trigger new generation
      handleGeneratePlanWithSubjects(preset.subjects);
    }
  };

  // Generate Study Plan via Server API
  const handleGeneratePlan = async () => {
    handleGeneratePlanWithSubjects(subjects);
  };

  const handleGeneratePlanWithSubjects = async (subsToUse: Subject[]) => {
    if (subsToUse.length === 0) {
      setErrorMsg('Please add at least one subject before generating a timetable.');
      return;
    }

    setIsGenerating(true);
    setErrorMsg(null);

    try {
      const response = await fetch('/api/generate-plan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          subjects: subsToUse,
          preferences,
        }),
      });

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new Error(errData.error || `Server responded with ${response.status}`);
      }

      const planData = await response.json();
      const newPlan: StudyPlan = {
        id: `plan-${Date.now()}`,
        createdAt: new Date().toISOString(),
        summary: planData.summary || 'Prioritized study timetable focused on tough subjects and upcoming deadlines.',
        highYieldTips: planData.highYieldTips || [],
        days: planData.days || [],
      };

      setStudyPlan(newPlan);
      setActiveTab('timetable');
    } catch (err: any) {
      console.error('Plan generation failed:', err);
      setErrorMsg(err.message || 'Could not generate plan. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  // Update session status (e.g. checkbox clicked or completed from timer)
  const handleUpdateSessionStatus = (sessionId: string, newStatus: SessionStatus, notes?: string) => {
    if (!studyPlan) return;

    let justCompleted = false;
    let sessionMins = 45;

    const updatedDays = studyPlan.days.map((day) => {
      const updatedSessions = day.sessions.map((sess) => {
        if (sess.id === sessionId) {
          if (newStatus === 'completed' && sess.status !== 'completed') {
            justCompleted = true;
            sessionMins = sess.durationMinutes || 45;
          }
          return {
            ...sess,
            status: newStatus,
            notes: notes !== undefined ? notes : sess.notes,
            completedAt: newStatus === 'completed' ? new Date().toISOString() : undefined,
          };
        }
        return sess;
      });
      return { ...day, sessions: updatedSessions };
    });

    setStudyPlan({ ...studyPlan, days: updatedDays });

    // Update streak if just completed
    if (justCompleted) {
      const todayStr = new Date().toISOString().split('T')[0];
      const isNewDay = streak.lastCompletedDate !== todayStr;
      const updatedStreakCount = isNewDay ? streak.currentStreak + 1 : streak.currentStreak;

      setStreak({
        currentStreak: updatedStreakCount,
        bestStreak: Math.max(streak.bestStreak, updatedStreakCount),
        lastCompletedDate: todayStr,
        totalSessionsCompleted: streak.totalSessionsCompleted + 1,
        totalMinutesStudied: streak.totalMinutesStudied + sessionMins,
      });
    }
  };

  // Smart Rebalance Schedule handler
  const handleRebalanceSchedule = async () => {
    if (!studyPlan) return;
    setIsRebalancing(true);

    try {
      const todayStr = new Date().toISOString().split('T')[0];
      const incompleteSessions = studyPlan.days.flatMap((d) =>
        d.sessions.filter((s) => s.status === 'pending' && s.date <= todayStr)
      );

      const futureDays = studyPlan.days.filter((d) => d.date >= todayStr);

      const response = await fetch('/api/rebalance-plan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          incompleteSessions,
          remainingDays: futureDays.map((d) => d.date),
          subjects,
        }),
      });

      const data = await response.json();
      if (data.redistributedSessions && Array.isArray(data.redistributedSessions)) {
        // Apply redistribution
        const redMap = new Map(data.redistributedSessions.map((r: any) => [r.sessionId, r]));

        const updatedDays = studyPlan.days.map((day) => {
          const sessions = day.sessions.map((sess) => {
            const rebalanceInfo = redMap.get(sess.id) as any;
            if (rebalanceInfo) {
              return {
                ...sess,
                date: rebalanceInfo.newDate,
                startTime: rebalanceInfo.newTime || sess.startTime,
              };
            }
            return sess;
          });
          return { ...day, sessions };
        });

        setStudyPlan({
          ...studyPlan,
          days: updatedDays,
          summary: `${data.advice || 'Missed sessions redistributed across your upcoming study days.'} ${studyPlan.summary}`,
        });
      }
    } catch (err) {
      console.error('Rebalance failed:', err);
    } finally {
      setIsRebalancing(false);
    }
  };

  // Launch focus timer for a specific session
  const handleStartSessionTimer = (session: StudySession) => {
    setActiveTimerSession(session);
    setIsTimerOpen(true);
  };

  // Launch AI topic tips
  const handleGetTopicTips = (session: StudySession) => {
    setActiveTipsSession(session);
    setIsTipsOpen(true);
  };

  // Count unread reminders for badge
  const unreadRemindersCount = (() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return subjects.filter((s) => {
      const ex = new Date(s.examDate);
      ex.setHours(0, 0, 0, 0);
      const diff = Math.ceil((ex.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
      return diff >= 0 && diff <= 5;
    }).length;
  })();

  // Add topic to study plan from Assignment Helper
  const handleAddTopicToStudyPlan = (topicTitle: string, assignmentType: string) => {
    const todayStr = new Date().toISOString().split('T')[0];

    // Find or create Coursework subject
    let subject = subjects.find(
      (s) => s.name.toLowerCase().includes('assignment') || s.name.toLowerCase().includes('coursework')
    );
    if (!subject) {
      subject = {
        id: `sub-asg-${Date.now()}`,
        name: 'Assignments & Projects',
        examDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        difficulty: 'Hard',
        topics: [topicTitle],
        color: '#8b5cf6',
        targetHours: 8,
      };
      setSubjects((prev) => [...prev, subject!]);
    }

    const newSession: StudySession = {
      id: `sess-asg-${Date.now()}`,
      date: todayStr,
      startTime: '03:30 PM',
      subjectId: subject.id,
      subjectName: subject.name,
      topic: `${assignmentType}: ${topicTitle}`,
      durationMinutes: 45,
      difficulty: 'Hard',
      priority: 'high',
      technique: 'Structured Drafting & Problem Solving',
      status: 'pending',
    };

    if (studyPlan) {
      const dayExists = studyPlan.days.find((d) => d.date === todayStr);
      let updatedDays;
      if (dayExists) {
        updatedDays = studyPlan.days.map((d) => {
          if (d.date === todayStr) {
            return {
              ...d,
              totalMinutes: d.totalMinutes + 45,
              sessions: [...d.sessions, newSession],
            };
          }
          return d;
        });
      } else {
        updatedDays = [
          {
            date: todayStr,
            dayOfWeek: new Date().toLocaleDateString('en-US', { weekday: 'long' }),
            totalMinutes: 45,
            focusTheme: `Focus on ${topicTitle}`,
            sessions: [newSession],
          },
          ...studyPlan.days,
        ];
      }
      setStudyPlan({ ...studyPlan, days: updatedDays });
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans selection:bg-indigo-500 selection:text-white">
      {/* Top Navbar */}
      <Navbar
        streak={streak}
        onOpenTimer={() => {
          setActiveTimerSession(null);
          setIsTimerOpen(true);
        }}
        onOpenReminders={() => setIsRemindersOpen(true)}
        unreadRemindersCount={unreadRemindersCount}
        onSelectPreset={handleSelectPreset}
        isGenerating={isGenerating}
      />

      {/* Main Container */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {/* Error notification banner if any */}
        {errorMsg && (
          <div className="bg-rose-50 border border-rose-200 p-4 rounded-2xl flex items-center justify-between text-xs text-rose-800">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>{errorMsg}</span>
            </div>
            <button
              onClick={() => setErrorMsg(null)}
              className="font-bold hover:underline"
            >
              Dismiss
            </button>
          </div>
        )}

        {/* Tab Navigation */}
        <div className="flex items-center justify-between flex-wrap gap-3 border-b border-slate-200 pb-2">
          <div className="flex items-center gap-1.5 bg-slate-200/70 p-1 rounded-2xl">
            <button
              onClick={() => setActiveTab('assignment')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all ${
                activeTab === 'assignment'
                  ? 'bg-white text-indigo-700 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Sparkles className="w-4 h-4 text-amber-500" />
              <span>AI Assignment Helper</span>
            </button>

            <button
              onClick={() => setActiveTab('timetable')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all ${
                activeTab === 'timetable'
                  ? 'bg-white text-indigo-700 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <CalendarIcon className="w-4 h-4" />
              <span>Daily Timetable</span>
            </button>

            <button
              onClick={() => setActiveTab('subjects')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all ${
                activeTab === 'subjects'
                  ? 'bg-white text-indigo-700 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <BookOpen className="w-4 h-4" />
              <span>Subjects &amp; Hours</span>
              <span className="text-[10px] bg-slate-100 text-slate-600 px-1.5 py-0.2 rounded-full font-bold">
                {subjects.length}
              </span>
            </button>

            <button
              onClick={() => setActiveTab('progress')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all ${
                activeTab === 'progress'
                  ? 'bg-white text-indigo-700 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <TrendingUp className="w-4 h-4" />
              <span>Progress &amp; Exams</span>
            </button>
          </div>

          {/* Quick Regenerate / Status */}
          <div className="flex items-center gap-2">
            <button
              onClick={handleGeneratePlan}
              disabled={isGenerating || subjects.length === 0}
              className="text-xs font-semibold px-3.5 py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-xl transition-colors flex items-center gap-1.5"
              title="Regenerate timetable based on current subjects and study hours"
            >
              <Sparkles className={`w-3.5 h-3.5 text-indigo-600 ${isGenerating ? 'animate-spin' : ''}`} />
              <span>{isGenerating ? 'AI Building Plan...' : 'Re-Generate Timetable'}</span>
            </button>
          </div>
        </div>

        {/* Tab Content */}
        {activeTab === 'assignment' && (
          <AssignmentHelper onAddTopicToStudyPlan={handleAddTopicToStudyPlan} />
        )}

        {/* Tab Content */}
        {activeTab === 'timetable' && (
          studyPlan ? (
            <DailyTimetable
              plan={studyPlan}
              onUpdateSessionStatus={handleUpdateSessionStatus}
              onStartSessionTimer={handleStartSessionTimer}
              onGetTopicTips={handleGetTopicTips}
              onRebalanceSchedule={handleRebalanceSchedule}
              isRebalancing={isRebalancing}
            />
          ) : (
            <div className="bg-white rounded-3xl p-10 border border-slate-200 shadow-sm text-center max-w-xl mx-auto my-8">
              <Sparkles className="w-12 h-12 text-indigo-500 mx-auto mb-3" />
              <h2 className="text-xl font-bold text-slate-900">Your AI Timetable is Ready to Build</h2>
              <p className="text-xs sm:text-sm text-slate-500 mt-1 mb-6">
                Click below to generate your personalized college timetable prioritizing high-difficulty subjects and upcoming exam deadlines.
              </p>
              <button
                onClick={handleGeneratePlan}
                disabled={isGenerating}
                className="px-6 py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-2xl font-bold text-sm shadow-lg shadow-indigo-200 transition-all flex items-center gap-2 mx-auto"
              >
                <Sparkles className="w-4 h-4 text-amber-300" />
                <span>{isGenerating ? 'Generating...' : 'Generate Daily Timetable Now'}</span>
              </button>
            </div>
          )
        )}

        {activeTab === 'subjects' && (
          <SubjectManager
            subjects={subjects}
            preferences={preferences}
            onUpdateSubjects={setSubjects}
            onUpdatePreferences={setPreferences}
            onGeneratePlan={handleGeneratePlan}
            isGenerating={isGenerating}
          />
        )}

        {activeTab === 'progress' && (
          <ProgressDashboard
            plan={studyPlan}
            subjects={subjects}
            streak={streak}
          />
        )}
      </main>

      {/* Focus Timer Modal */}
      <StudyTimerModal
        session={activeTimerSession}
        isOpen={isTimerOpen}
        onClose={() => setIsTimerOpen(false)}
        onSessionCompleted={(id) => handleUpdateSessionStatus(id, 'completed')}
      />

      {/* Topic Tips Modal */}
      <TopicTipsModal
        session={activeTipsSession}
        isOpen={isTipsOpen}
        onClose={() => setIsTipsOpen(false)}
      />

      {/* Smart Reminders Drawer */}
      <SmartReminders
        isOpen={isRemindersOpen}
        onClose={() => setIsRemindersOpen(false)}
        subjects={subjects}
        plan={studyPlan}
        onStartSession={(sessionId) => {
          if (!studyPlan) return;
          for (const day of studyPlan.days) {
            const found = day.sessions.find((s) => s.id === sessionId);
            if (found) {
              handleStartSessionTimer(found);
              break;
            }
          }
        }}
        onRebalanceSchedule={handleRebalanceSchedule}
        isRebalancing={isRebalancing}
      />
    </div>
  );
}

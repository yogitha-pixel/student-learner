import React, { useState } from 'react';
import { Plus, Trash2, Calendar, Clock, AlertTriangle, Sparkles, BookOpen, Layers, Info, Check } from 'lucide-react';
import { Subject, StudentPreferences, DifficultyLevel, StudyTimeOfDay } from '../types';

interface SubjectManagerProps {
  subjects: Subject[];
  preferences: StudentPreferences;
  onUpdateSubjects: (subjects: Subject[]) => void;
  onUpdatePreferences: (prefs: StudentPreferences) => void;
  onGeneratePlan: () => void;
  isGenerating: boolean;
}

const DIFFICULTY_CONFIG: Record<DifficultyLevel, { label: string; color: string; bg: string; text: string; desc: string }> = {
  Hard: {
    label: 'Hard',
    color: 'border-rose-300',
    bg: 'bg-rose-50',
    text: 'text-rose-700',
    desc: 'High priority: scheduled during prime focus hours with extra spaced review',
  },
  Medium: {
    label: 'Medium',
    color: 'border-amber-300',
    bg: 'bg-amber-50',
    text: 'text-amber-800',
    desc: 'Balanced priority: consistent practice and concept reinforcement',
  },
  Easy: {
    label: 'Easy',
    color: 'border-emerald-300',
    bg: 'bg-emerald-50',
    text: 'text-emerald-700',
    desc: 'Low priority: efficient high-yield review sessions closer to exam',
  },
};

const SUBJECT_COLORS = [
  '#6366f1', // Indigo
  '#ec4899', // Pink
  '#06b6d4', // Cyan
  '#10b981', // Emerald
  '#f59e0b', // Amber
  '#8b5cf6', // Violet
  '#f43f5e', // Rose
];

export const SubjectManager: React.FC<SubjectManagerProps> = ({
  subjects,
  preferences,
  onUpdateSubjects,
  onUpdatePreferences,
  onGeneratePlan,
  isGenerating,
}) => {
  const [showAddModal, setShowAddModal] = useState(false);
  const [newSubName, setNewSubName] = useState('');
  const [newSubDate, setNewSubDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 7);
    return d.toISOString().split('T')[0];
  });
  const [newSubDifficulty, setNewSubDifficulty] = useState<DifficultyLevel>('Hard');
  const [newSubTopics, setNewSubTopics] = useState('');
  const [newSubColor, setNewSubColor] = useState(SUBJECT_COLORS[0]);

  // Handle adding new subject
  const handleAddSubject = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSubName.trim()) return;

    const topicsArray = newSubTopics
      .split(',')
      .map((t) => t.trim())
      .filter((t) => t.length > 0);

    const newSubject: Subject = {
      id: `sub-${Date.now()}`,
      name: newSubName.trim(),
      examDate: newSubDate,
      difficulty: newSubDifficulty,
      topics: topicsArray.length > 0 ? topicsArray : ['Core Concepts & Review'],
      color: newSubColor,
      targetHours: newSubDifficulty === 'Hard' ? 12 : newSubDifficulty === 'Medium' ? 8 : 4,
    };

    onUpdateSubjects([...subjects, newSubject]);
    setNewSubName('');
    setNewSubTopics('');
    setShowAddModal(false);
  };

  const handleDeleteSubject = (id: string) => {
    onUpdateSubjects(subjects.filter((s) => s.id !== id));
  };

  const getDaysUntilExam = (examDateStr: string) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const examDate = new Date(examDateStr);
    examDate.setHours(0, 0, 0, 0);
    const diffTime = examDate.getTime() - today.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  return (
    <div className="space-y-6">
      {/* Top Banner / Introduction */}
      <div className="bg-gradient-to-r from-indigo-900 via-indigo-800 to-slate-900 rounded-3xl p-6 sm:p-8 text-white relative overflow-hidden shadow-xl">
        <div className="absolute top-0 right-0 -mt-10 -mr-10 w-64 h-64 bg-indigo-500/20 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/10 backdrop-blur-md rounded-full text-indigo-200 text-xs font-medium mb-3">
            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
            AI Study Architect
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white mb-2">
            Plan smarter, not harder. Ace your college exams.
          </h1>
          <p className="text-indigo-100/90 text-sm sm:text-base leading-relaxed mb-6">
            Enter your courses, test dates, and daily study availability. Gemini AI generates a custom, burnout-free timetable that automatically prioritizes tough concepts first.
          </p>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={onGeneratePlan}
              disabled={isGenerating || subjects.length === 0}
              className="px-6 py-3.5 bg-indigo-500 hover:bg-indigo-400 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold rounded-2xl shadow-lg shadow-indigo-500/30 flex items-center gap-2 transition-all hover:scale-[1.02] active:scale-[0.98]"
            >
              {isGenerating ? (
                <>
                  <div className="w-5 h-5 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                  <span>Generating Your Timetable...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-5 h-5 text-amber-300" />
                  <span>Generate AI Daily Timetable</span>
                </>
              )}
            </button>

            <button
              onClick={() => setShowAddModal(true)}
              className="px-5 py-3.5 bg-white/10 hover:bg-white/20 text-white rounded-2xl text-sm font-medium transition-colors flex items-center gap-2 backdrop-blur-sm border border-white/10"
            >
              <Plus className="w-4 h-4" />
              <span>Add Subject</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Grid: Subjects List + Availability Settings */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Subjects & Exam Countdown Cards (2 cols) */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-bold text-slate-900">Your College Subjects</h2>
              <span className="text-xs bg-slate-200/80 text-slate-700 font-semibold px-2 py-0.5 rounded-full">
                {subjects.length} course{subjects.length === 1 ? '' : 's'}
              </span>
            </div>
            <button
              onClick={() => setShowAddModal(true)}
              className="text-xs font-semibold text-indigo-600 hover:text-indigo-700 bg-indigo-50 hover:bg-indigo-100 px-3 py-1.5 rounded-xl transition-colors flex items-center gap-1"
            >
              <Plus className="w-3.5 h-3.5" /> Add Subject
            </button>
          </div>

          {subjects.length === 0 ? (
            <div className="bg-slate-50 border-2 border-dashed border-slate-200 rounded-2xl p-8 text-center">
              <BookOpen className="w-10 h-10 text-slate-400 mx-auto mb-3" />
              <h3 className="font-semibold text-slate-800 text-sm">No subjects entered yet</h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1 mb-4">
                Add your upcoming courses or pick one of the quick presets in the top header.
              </p>
              <button
                onClick={() => setShowAddModal(true)}
                className="px-4 py-2 bg-indigo-600 text-white rounded-xl text-xs font-semibold hover:bg-indigo-500 shadow-sm"
              >
                + Add First Subject
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              {subjects.map((sub) => {
                const daysLeft = getDaysUntilExam(sub.examDate);
                const isUrgent = daysLeft >= 0 && daysLeft <= 5;
                const diffMeta = DIFFICULTY_CONFIG[sub.difficulty];

                return (
                  <div
                    key={sub.id}
                    className="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden flex flex-col justify-between"
                  >
                    {/* Top Color strip */}
                    <div
                      className="absolute top-0 left-0 right-0 h-1.5"
                      style={{ backgroundColor: sub.color || '#6366f1' }}
                    />

                    <div>
                      {/* Header with Title and Delete */}
                      <div className="flex items-start justify-between gap-2 mb-2 pt-1">
                        <div>
                          <h3 className="font-bold text-slate-900 text-base leading-snug line-clamp-1">
                            {sub.name}
                          </h3>
                          <div className="flex items-center gap-2 mt-1">
                            <span
                              className={`text-[11px] font-bold px-2 py-0.5 rounded-md border ${diffMeta.bg} ${diffMeta.text} ${diffMeta.color}`}
                            >
                              {diffMeta.label} Difficulty
                            </span>
                            {isUrgent && (
                              <span className="text-[11px] font-bold px-2 py-0.5 rounded-md bg-rose-100 text-rose-800 flex items-center gap-1 animate-pulse">
                                <AlertTriangle className="w-3 h-3 text-rose-600" />
                                {daysLeft === 0 ? 'Exam Today!' : `${daysLeft}d to Exam!`}
                              </span>
                            )}
                          </div>
                        </div>

                        <button
                          onClick={() => handleDeleteSubject(sub.id)}
                          className="text-slate-400 hover:text-rose-600 p-1 rounded-lg hover:bg-rose-50 transition-colors"
                          title="Remove subject"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>

                      {/* Exam Date countdown */}
                      <div className="flex items-center gap-2 text-xs text-slate-600 mt-2 bg-slate-50 p-2 rounded-xl">
                        <Calendar className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                        <span>Exam: <strong className="text-slate-800">{sub.examDate}</strong></span>
                        <span className="text-slate-400">•</span>
                        <span className={`font-semibold ${daysLeft < 3 ? 'text-rose-600' : 'text-slate-700'}`}>
                          {daysLeft < 0 ? 'Exam passed' : `${daysLeft} days away`}
                        </span>
                      </div>

                      {/* Topics */}
                      {sub.topics && sub.topics.length > 0 && (
                        <div className="mt-2.5">
                          <p className="text-[11px] font-semibold text-slate-500 mb-1 flex items-center gap-1">
                            <Layers className="w-3 h-3 text-slate-400" /> Focus Topics:
                          </p>
                          <div className="flex flex-wrap gap-1">
                            {sub.topics.slice(0, 3).map((top, idx) => (
                              <span
                                key={idx}
                                className="text-[11px] bg-slate-100 text-slate-700 px-2 py-0.5 rounded-md truncate max-w-[170px]"
                                title={top}
                              >
                                {top}
                              </span>
                            ))}
                            {sub.topics.length > 3 && (
                              <span className="text-[11px] bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded-md">
                                +{sub.topics.length - 3} more
                              </span>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Right Column: Study Availability Preferences */}
        <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-sm space-y-4">
          <div className="border-b border-slate-100 pb-3">
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Clock className="w-4 h-4 text-indigo-600" />
              Available Study Hours
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">Customize your daily capacity to prevent burnout</p>
          </div>

          {/* Weekday Hours */}
          <div>
            <div className="flex items-center justify-between text-xs mb-1.5">
              <span className="font-semibold text-slate-700">Mon - Fri (Weekdays)</span>
              <span className="font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-md">
                {preferences.dailyHoursWeekday} hrs/day
              </span>
            </div>
            <input
              type="range"
              min="1"
              max="8"
              step="0.5"
              value={preferences.dailyHoursWeekday}
              onChange={(e) =>
                onUpdatePreferences({ ...preferences, dailyHoursWeekday: parseFloat(e.target.value) })
              }
              className="w-full accent-indigo-600 cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-slate-400 mt-0.5">
              <span>1 hr</span>
              <span>4 hrs</span>
              <span>8 hrs</span>
            </div>
          </div>

          {/* Weekend Hours */}
          <div>
            <div className="flex items-center justify-between text-xs mb-1.5">
              <span className="font-semibold text-slate-700">Sat - Sun (Weekends)</span>
              <span className="font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-md">
                {preferences.dailyHoursWeekend} hrs/day
              </span>
            </div>
            <input
              type="range"
              min="1"
              max="10"
              step="0.5"
              value={preferences.dailyHoursWeekend}
              onChange={(e) =>
                onUpdatePreferences({ ...preferences, dailyHoursWeekend: parseFloat(e.target.value) })
              }
              className="w-full accent-indigo-600 cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-slate-400 mt-0.5">
              <span>1 hr</span>
              <span>5 hrs</span>
              <span>10 hrs</span>
            </div>
          </div>

          {/* Preferred Study Time */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-2">
              Preferred Study Time
            </label>
            <div className="grid grid-cols-2 gap-2 text-xs">
              {[
                { id: 'morning', label: '🌅 Morning', sub: '8 AM - 12 PM' },
                { id: 'afternoon', label: '☀️ Afternoon', sub: '1 PM - 5 PM' },
                { id: 'evening', label: '🌆 Evening', sub: '5 PM - 9 PM' },
                { id: 'night_owl', label: '🌙 Night Owl', sub: '8 PM - 12 AM' },
              ].map((time) => (
                <button
                  key={time.id}
                  type="button"
                  onClick={() =>
                    onUpdatePreferences({ ...preferences, preferredTime: time.id as StudyTimeOfDay })
                  }
                  className={`p-2 rounded-xl text-left border transition-all ${
                    preferences.preferredTime === time.id
                      ? 'border-indigo-600 bg-indigo-50/70 text-indigo-950 font-semibold shadow-xs'
                      : 'border-slate-200 text-slate-600 hover:border-slate-300'
                  }`}
                >
                  <div className="font-medium text-xs">{time.label}</div>
                  <div className="text-[10px] text-slate-400">{time.sub}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Session Length & Break */}
          <div className="grid grid-cols-2 gap-3 pt-1">
            <div>
              <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                Session Block
              </label>
              <select
                value={preferences.sessionDurationMinutes}
                onChange={(e) =>
                  onUpdatePreferences({
                    ...preferences,
                    sessionDurationMinutes: parseInt(e.target.value, 10),
                  })
                }
                className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl p-2 font-medium text-slate-800 focus:outline-indigo-500"
              >
                <option value="25">25 mins (Pomodoro)</option>
                <option value="45">45 mins (Balanced)</option>
                <option value="60">60 mins (Deep Work)</option>
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                Rest Break
              </label>
              <select
                value={preferences.breakDurationMinutes}
                onChange={(e) =>
                  onUpdatePreferences({
                    ...preferences,
                    breakDurationMinutes: parseInt(e.target.value, 10),
                  })
                }
                className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl p-2 font-medium text-slate-800 focus:outline-indigo-500"
              >
                <option value="5">5 mins</option>
                <option value="10">10 mins</option>
                <option value="15">15 mins</option>
              </select>
            </div>
          </div>

          {/* Planning Horizon */}
          <div>
            <label className="block text-[11px] font-semibold text-slate-700 mb-1">
              Days to Plan
            </label>
            <div className="flex gap-2">
              {[7, 14].map((days) => (
                <button
                  key={days}
                  type="button"
                  onClick={() => onUpdatePreferences({ ...preferences, daysToPlan: days })}
                  className={`flex-1 py-1.5 text-xs rounded-xl border font-medium ${
                    preferences.daysToPlan === days
                      ? 'border-indigo-600 bg-indigo-50 text-indigo-700 font-bold'
                      : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  {days} Days Ahead
                </button>
              ))}
            </div>
          </div>

          {/* Quick Notice */}
          <div className="bg-indigo-50/70 p-3 rounded-2xl flex items-start gap-2.5 text-xs text-indigo-900 border border-indigo-100">
            <Info className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
            <p className="text-[11px] leading-relaxed">
              <strong>Priority Algorithm:</strong> Hard subjects with upcoming exams receive highest weight, scheduled first with active recall techniques.
            </p>
          </div>
        </div>
      </div>

      {/* Add Subject Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl border border-slate-100 relative">
            <h3 className="text-lg font-bold text-slate-900 mb-1">Add College Subject</h3>
            <p className="text-xs text-slate-500 mb-4">Enter course details and upcoming exam date</p>

            <form onSubmit={handleAddSubject} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Subject Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Organic Chemistry, Calculus II, Macroeconomics"
                  value={newSubName}
                  onChange={(e) => setNewSubName(e.target.value)}
                  className="w-full px-3.5 py-2 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Exam Date *
                  </label>
                  <input
                    type="date"
                    required
                    value={newSubDate}
                    onChange={(e) => setNewSubDate(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Difficulty Level *
                  </label>
                  <select
                    value={newSubDifficulty}
                    onChange={(e) => setNewSubDifficulty(e.target.value as DifficultyLevel)}
                    className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 font-semibold"
                  >
                    <option value="Hard">🔥 Hard (High Priority)</option>
                    <option value="Medium">⚡ Medium (Balanced)</option>
                    <option value="Easy">🌱 Easy (Low Priority)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Key Topics or Chapters (Comma-separated)
                </label>
                <input
                  type="text"
                  placeholder="e.g. Carbonyls, Reactions, NMR Spectroscopy"
                  value={newSubTopics}
                  onChange={(e) => setNewSubTopics(e.target.value)}
                  className="w-full px-3.5 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
                <span className="text-[10px] text-slate-400 mt-1 block">
                  AI will assign these specific topics to your daily sessions.
                </span>
              </div>

              {/* Color Tag */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Subject Color
                </label>
                <div className="flex items-center gap-2">
                  {SUBJECT_COLORS.map((col) => (
                    <button
                      key={col}
                      type="button"
                      onClick={() => setNewSubColor(col)}
                      className={`w-7 h-7 rounded-full border-2 transition-transform ${
                        newSubColor === col ? 'scale-110 border-slate-900' : 'border-transparent'
                      }`}
                      style={{ backgroundColor: col }}
                    />
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 rounded-xl shadow-sm"
                >
                  Save Subject
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

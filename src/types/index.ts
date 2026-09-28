export type DifficultyLevel = 'Hard' | 'Medium' | 'Easy';
export type PriorityLevel = 'high' | 'medium' | 'low';
export type SessionStatus = 'pending' | 'in_progress' | 'completed' | 'skipped';
export type StudyTimeOfDay = 'morning' | 'afternoon' | 'evening' | 'night_owl';

export interface Subject {
  id: string;
  name: string;
  examDate: string; // YYYY-MM-DD
  difficulty: DifficultyLevel;
  topics: string[];
  color: string;
  targetHours?: number;
}

export interface StudentPreferences {
  dailyHoursWeekday: number;
  dailyHoursWeekend: number;
  preferredTime: StudyTimeOfDay;
  sessionDurationMinutes: number;
  breakDurationMinutes: number;
  startDate: string;
  daysToPlan: number;
}

export interface StudySession {
  id: string;
  date: string; // YYYY-MM-DD
  startTime: string; // e.g. "09:00 AM"
  endTime?: string;
  subjectId: string;
  subjectName: string;
  topic: string;
  durationMinutes: number;
  difficulty: DifficultyLevel;
  priority: PriorityLevel;
  technique: string;
  status: SessionStatus;
  notes?: string;
  completedAt?: string;
}

export interface DailyPlan {
  date: string;
  dayOfWeek: string;
  totalMinutes: number;
  focusTheme: string;
  sessions: StudySession[];
}

export interface StudyPlan {
  id: string;
  createdAt: string;
  summary: string;
  highYieldTips: string[];
  days: DailyPlan[];
}

export interface StudyStreak {
  currentStreak: number;
  bestStreak: number;
  lastCompletedDate: string;
  totalSessionsCompleted: number;
  totalMinutesStudied: number;
}

export interface ReminderNotification {
  id: string;
  title: string;
  message: string;
  type: 'urgent_exam' | 'session_upcoming' | 'streak_milestone' | 'rebalance_hint';
  timestamp: string;
  read: boolean;
  actionText?: string;
}

export interface AssignmentKeyPoint {
  point: string;
  detail: string;
}

export interface AssignmentExample {
  title: string;
  scenario: string;
  takeaway: string;
}

export interface OutlineSection {
  sectionTitle: string;
  purpose: string;
  suggestedLength: string;
  bulletPoints: string[];
  guidingQuestions: string[];
}

export interface AssignmentGuide {
  id: string;
  createdAt: string;
  topic: string;
  title: string;
  academicLevel: string;
  assignmentType: string;
  simpleExplanation: string;
  keyPoints: AssignmentKeyPoint[];
  examples: AssignmentExample[];
  structuredOutline: OutlineSection[];
  commonMistakes: string[];
  recommendedNextSteps: string[];
  suggestedSearchTerms: string[];
}


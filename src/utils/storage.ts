import { Subject, StudentPreferences, StudyPlan, StudyStreak } from '../types';

export const STORAGE_KEYS = {
  SUBJECTS: 'studypulse_subjects_v1',
  PREFERENCES: 'studypulse_preferences_v1',
  STUDY_PLAN: 'studypulse_plan_v1',
  STREAK: 'studypulse_streak_v1',
};

// Realistic college sample presets
export const SAMPLE_PRESETS: Record<string, { label: string; icon: string; subjects: Subject[] }> = {
  cs: {
    label: 'Computer Science Major',
    icon: '💻',
    subjects: [
      {
        id: 'sub-cs-1',
        name: 'Data Structures & Algorithms',
        examDate: getFutureDate(5),
        difficulty: 'Hard',
        topics: ['Binary Search Trees', 'Graph Traversal (BFS/DFS)', 'Dynamic Programming', 'Dijkstra Algorithm'],
        color: '#6366f1', // Indigo
        targetHours: 14,
      },
      {
        id: 'sub-cs-2',
        name: 'Operating Systems',
        examDate: getFutureDate(9),
        difficulty: 'Hard',
        topics: ['Process Scheduling', 'Virtual Memory & Paging', 'Deadlocks & Semaphores', 'File Systems'],
        color: '#ec4899', // Pink
        targetHours: 12,
      },
      {
        id: 'sub-cs-3',
        name: 'Linear Algebra',
        examDate: getFutureDate(13),
        difficulty: 'Medium',
        topics: ['Eigenvalues & Eigenvectors', 'Matrix Diagonalization', 'Vector Spaces', 'Inner Products'],
        color: '#06b6d4', // Cyan
        targetHours: 8,
      },
      {
        id: 'sub-cs-4',
        name: 'Technical Writing',
        examDate: getFutureDate(18),
        difficulty: 'Easy',
        topics: ['Research Paper Abstract', 'Documentation Standards', 'Peer Review Revisions'],
        color: '#10b981', // Emerald
        targetHours: 4,
      },
    ],
  },
  premed: {
    label: 'Pre-Med / Health Sciences',
    icon: '🩺',
    subjects: [
      {
        id: 'sub-med-1',
        name: 'Organic Chemistry II',
        examDate: getFutureDate(4),
        difficulty: 'Hard',
        topics: ['Electrophilic Aromatic Substitution', 'Carbonyl Mechanisms', 'NMR Spectroscopy', 'Stereochemistry'],
        color: '#f43f5e', // Rose
        targetHours: 16,
      },
      {
        id: 'sub-med-2',
        name: 'Human Physiology',
        examDate: getFutureDate(8),
        difficulty: 'Hard',
        topics: ['Renal Regulation', 'Action Potentials & Synapses', 'Cardiac Cycle', 'Endocrine Feedback'],
        color: '#8b5cf6', // Violet
        targetHours: 12,
      },
      {
        id: 'sub-med-3',
        name: 'Cell Biology',
        examDate: getFutureDate(12),
        difficulty: 'Medium',
        topics: ['Mitochondrial Respiration', 'Membrane Transport', 'Cell Cycle Checkpoints'],
        color: '#3b82f6', // Blue
        targetHours: 8,
      },
      {
        id: 'sub-med-4',
        name: 'Biostatistics',
        examDate: getFutureDate(16),
        difficulty: 'Easy',
        topics: ['Hypothesis Testing (t-tests)', 'p-values & Confidence Intervals', 'Chi-Square Analysis'],
        color: '#14b8a6', // Teal
        targetHours: 6,
      },
    ],
  },
  business: {
    label: 'Business & Finance',
    icon: '📊',
    subjects: [
      {
        id: 'sub-biz-1',
        name: 'Corporate Finance',
        examDate: getFutureDate(6),
        difficulty: 'Hard',
        topics: ['DCF Valuation Models', 'Cost of Capital (WACC)', 'Capital Budgeting', 'Risk & Return CAPM'],
        color: '#eab308', // Amber
        targetHours: 14,
      },
      {
        id: 'sub-biz-2',
        name: 'Financial Accounting',
        examDate: getFutureDate(10),
        difficulty: 'Medium',
        topics: ['Cash Flow Statements', 'Inventory Valuations (FIFO/LIFO)', 'Balance Sheet Adjustments'],
        color: '#3b82f6', // Blue
        targetHours: 10,
      },
      {
        id: 'sub-biz-3',
        name: 'Microeconomics',
        examDate: getFutureDate(14),
        difficulty: 'Medium',
        topics: ['Monopoly vs Oligopoly', 'Elasticity of Demand', 'Game Theory & Nash Equilibrium'],
        color: '#10b981', // Emerald
        targetHours: 8,
      },
      {
        id: 'sub-biz-4',
        name: 'Marketing Principles',
        examDate: getFutureDate(20),
        difficulty: 'Easy',
        topics: ['Market Segmentation', 'Consumer Psychology', 'Digital Ad Strategies'],
        color: '#a855f7', // Purple
        targetHours: 5,
      },
    ],
  },
};

function getFutureDate(daysAhead: number): string {
  const d = new Date();
  d.setDate(d.getDate() + daysAhead);
  return d.toISOString().split('T')[0];
}

export const DEFAULT_PREFERENCES: StudentPreferences = {
  dailyHoursWeekday: 3.5,
  dailyHoursWeekend: 5.0,
  preferredTime: 'afternoon',
  sessionDurationMinutes: 45,
  breakDurationMinutes: 10,
  startDate: new Date().toISOString().split('T')[0],
  daysToPlan: 7,
};

export function loadSavedSubjects(): Subject[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.SUBJECTS);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.error('Failed reading subjects from localStorage', e);
  }
  // Default to Computer Science sample so beginner student instantly sees a working UI
  return SAMPLE_PRESETS.cs.subjects;
}

export function saveSubjects(subjects: Subject[]): void {
  try {
    localStorage.setItem(STORAGE_KEYS.SUBJECTS, JSON.stringify(subjects));
  } catch (e) {
    console.error('Failed saving subjects', e);
  }
}

export function loadSavedPreferences(): StudentPreferences {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.PREFERENCES);
    if (raw) return { ...DEFAULT_PREFERENCES, ...JSON.parse(raw) };
  } catch (e) {
    console.error('Failed reading preferences', e);
  }
  return DEFAULT_PREFERENCES;
}

export function savePreferences(prefs: StudentPreferences): void {
  try {
    localStorage.setItem(STORAGE_KEYS.PREFERENCES, JSON.stringify(prefs));
  } catch (e) {
    console.error('Failed saving preferences', e);
  }
}

export function loadSavedPlan(): StudyPlan | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.STUDY_PLAN);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.error('Failed reading plan', e);
  }
  return null;
}

export function savePlan(plan: StudyPlan | null): void {
  try {
    if (!plan) {
      localStorage.removeItem(STORAGE_KEYS.STUDY_PLAN);
    } else {
      localStorage.setItem(STORAGE_KEYS.STUDY_PLAN, JSON.stringify(plan));
    }
  } catch (e) {
    console.error('Failed saving plan', e);
  }
}

export function loadStreak(): StudyStreak {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.STREAK);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.error('Failed reading streak', e);
  }
  return {
    currentStreak: 1,
    bestStreak: 3,
    lastCompletedDate: new Date().toISOString().split('T')[0],
    totalSessionsCompleted: 0,
    totalMinutesStudied: 0,
  };
}

export function saveStreak(streak: StudyStreak): void {
  try {
    localStorage.setItem(STORAGE_KEYS.STREAK, JSON.stringify(streak));
  } catch (e) {
    console.error('Failed saving streak', e);
  }
}

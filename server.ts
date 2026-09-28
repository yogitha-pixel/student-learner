import express, { Request, Response } from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI, Type } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

// Initialize Gemini Client with User-Agent as required by Gemini skill
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    },
  },
});

interface SubjectInput {
  id: string;
  name: string;
  examDate: string;
  difficulty: 'Hard' | 'Medium' | 'Easy';
  topics?: string[];
  color?: string;
}

interface PreferencesInput {
  dailyHoursWeekday: number;
  dailyHoursWeekend: number;
  preferredTime: 'morning' | 'afternoon' | 'evening' | 'night_owl';
  sessionDurationMinutes: number;
  breakDurationMinutes: number;
  startDate?: string;
  daysToPlan?: number;
}

// Algorithmic fallback planner in case Gemini key is missing or encounters rate limit
function generateFallbackSchedule(subjects: SubjectInput[], preferences: PreferencesInput) {
  const startDate = preferences.startDate ? new Date(preferences.startDate) : new Date();
  const daysCount = preferences.daysToPlan || 7;
  const days = [];

  // Sort subjects by priority: Hard & closer exam dates first
  const scoredSubjects = subjects.map((sub) => {
    const examDate = new Date(sub.examDate);
    const diffDays = Math.max(1, Math.ceil((examDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)));
    const diffWeight = sub.difficulty === 'Hard' ? 3 : sub.difficulty === 'Medium' ? 2 : 1;
    // Lower score means higher priority
    const priorityScore = diffDays / diffWeight;
    return { ...sub, diffDays, diffWeight, priorityScore };
  }).sort((a, b) => a.priorityScore - b.priorityScore);

  const timeSlots = {
    morning: ['08:30 AM', '09:30 AM', '10:45 AM', '11:45 AM', '02:00 PM', '03:15 PM'],
    afternoon: ['01:00 PM', '02:00 PM', '03:15 PM', '04:15 PM', '05:30 PM', '06:30 PM'],
    evening: ['05:00 PM', '06:00 PM', '07:15 PM', '08:15 PM', '09:30 PM', '10:30 PM'],
    night_owl: ['08:00 PM', '09:00 PM', '10:15 PM', '11:15 PM', '12:30 AM', '01:30 AM'],
  }[preferences.preferredTime || 'afternoon'];

  const techniques = [
    'Active Recall with Flashcards',
    'Practice Problems & Past Exam Questions',
    'Feynman Technique (Teach the Concept)',
    'Summary Cheat-Sheet & Formula Sheet',
    'High-Yield Concept Mapping',
  ];

  for (let i = 0; i < daysCount; i++) {
    const curDate = new Date(startDate);
    curDate.setDate(curDate.getDate() + i);
    const dateStr = curDate.toISOString().split('T')[0];
    const isWeekend = curDate.getDay() === 0 || curDate.getDay() === 6;
    const availableHours = isWeekend ? (preferences.dailyHoursWeekend || 4) : (preferences.dailyHoursWeekday || 3);
    const sessionMins = preferences.sessionDurationMinutes || 45;
    const maxSessions = Math.max(1, Math.floor((availableHours * 60) / (sessionMins + (preferences.breakDurationMinutes || 10))));

    const daySessions = [];
    for (let s = 0; s < maxSessions; s++) {
      const subject = scoredSubjects[(i * 2 + s) % scoredSubjects.length];
      const slotTime = timeSlots[s % timeSlots.length];
      const topic = subject.topics && subject.topics.length > 0
        ? subject.topics[s % subject.topics.length]
        : `Key Exam Focus & Core Problem Solving #${s + 1}`;

      daySessions.push({
        id: `sess-${dateStr}-${s + 1}`,
        date: dateStr,
        startTime: slotTime,
        subjectId: subject.id,
        subjectName: subject.name,
        topic,
        durationMinutes: sessionMins,
        difficulty: subject.difficulty,
        priority: subject.difficulty === 'Hard' ? 'high' : subject.difficulty === 'Medium' ? 'medium' : 'low',
        technique: techniques[(i + s) % techniques.length],
        status: 'pending',
      });
    }

    const dayName = curDate.toLocaleDateString('en-US', { weekday: 'long' });
    days.push({
      date: dateStr,
      dayOfWeek: dayName,
      totalMinutes: daySessions.length * sessionMins,
      focusTheme: `Prioritize ${scoredSubjects[0]?.name || 'Core Subjects'} & active revision`,
      sessions: daySessions,
    });
  }

  return {
    summary: `Structured ${daysCount}-day schedule balancing ${subjects.length} subjects with heavy emphasis on highest-difficulty and imminent exam deadlines. Includes structured breaks and active recall sessions.`,
    highYieldTips: [
      'Tackle your hardest subject first during peak cognitive energy slots.',
      'Use 25-50 minute uninterrupted focus blocks with 5-10 minute rest periods.',
      'Review previous day key formulas for 10 minutes before diving into new topics.',
      'Prioritize practice test problems over passive re-reading of textbooks.'
    ],
    days,
  };
}

// Generate AI Study Plan Route
app.post('/api/generate-plan', async (req: Request, res: Response) => {
  try {
    const { subjects, preferences } = req.body as {
      subjects: SubjectInput[];
      preferences: PreferencesInput;
    };

    if (!subjects || subjects.length === 0) {
      return res.status(400).json({ error: 'Please provide at least one subject.' });
    }

    const startDateStr = preferences.startDate || new Date().toISOString().split('T')[0];
    const daysToPlan = preferences.daysToPlan || 7;

    // Check if GEMINI_API_KEY is available
    if (!process.env.GEMINI_API_KEY) {
      console.log('No GEMINI_API_KEY provided; utilizing smart algorithmic fallback planner.');
      const fallback = generateFallbackSchedule(subjects, preferences);
      return res.json(fallback);
    }

    const prompt = `
You are an expert college academic advisor and study planner.
Generate a structured, beginner-friendly, realistic daily study timetable for a college student.

Start Date: ${startDateStr}
Number of Days to Plan: ${daysToPlan} days
Preferred Daily Study Hours:
- Weekday: ${preferences.dailyHoursWeekday || 3} hours/day
- Weekend: ${preferences.dailyHoursWeekend || 4.5} hours/day
Preferred Study Time of Day: ${preferences.preferredTime || 'afternoon'}
Session Duration: ${preferences.sessionDurationMinutes || 45} minutes per session
Break Duration: ${preferences.breakDurationMinutes || 10} minutes

Student's Subjects:
${JSON.stringify(subjects, null, 2)}

Requirements:
1. Prioritize Hard difficulty subjects and subjects with imminent exam dates (closer to Start Date).
2. Distribute study sessions realistically. Do NOT overload the student (respect daily available hours).
3. Include specific, concrete topics to study for each session, not vague advice.
4. Recommend effective study techniques for each session (e.g. "Active Recall & Flashcards", "Practice Exam Questions", "Feynman Technique", "Derivations & Practice Problems").
5. Assign priority ('high', 'medium', 'low') to each session.
6. Provide a concise, motivating summary of the strategy and 4 practical high-yield study tips.

Generate JSON output conforming to the response schema.
`;

    try {
      const response = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              summary: {
                type: Type.STRING,
                description: 'Overall strategic summary of the study plan and how difficult subjects/urgent exams are prioritized',
              },
              highYieldTips: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
                description: '4 actionable, motivating study tips tailored to these specific subjects',
              },
              days: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    date: { type: Type.STRING, description: 'YYYY-MM-DD' },
                    dayOfWeek: { type: Type.STRING, description: 'e.g. Monday' },
                    totalMinutes: { type: Type.INTEGER, description: 'Total study minutes planned for this day' },
                    focusTheme: { type: Type.STRING, description: 'Theme or primary goal for this day' },
                    sessions: {
                      type: Type.ARRAY,
                      items: {
                        type: Type.OBJECT,
                        properties: {
                          id: { type: Type.STRING },
                          startTime: { type: Type.STRING, description: 'e.g. 09:00 AM' },
                          subjectId: { type: Type.STRING },
                          subjectName: { type: Type.STRING },
                          topic: { type: Type.STRING, description: 'Specific focus topic or practice exercise' },
                          durationMinutes: { type: Type.INTEGER },
                          difficulty: { type: Type.STRING, description: 'Hard, Medium, or Easy' },
                          priority: { type: Type.STRING, description: 'high, medium, or low' },
                          technique: { type: Type.STRING, description: 'Recommended study technique' },
                        },
                        required: ['id', 'startTime', 'subjectId', 'subjectName', 'topic', 'durationMinutes', 'difficulty', 'priority', 'technique'],
                      },
                    },
                  },
                  required: ['date', 'dayOfWeek', 'totalMinutes', 'focusTheme', 'sessions'],
                },
              },
            },
            required: ['summary', 'highYieldTips', 'days'],
          },
        },
      });

      const text = response.text;
      if (text) {
        const parsed = JSON.parse(text);
        // Ensure status property on sessions
        if (parsed.days && Array.isArray(parsed.days)) {
          parsed.days.forEach((day: any) => {
            if (day.sessions && Array.isArray(day.sessions)) {
              day.sessions.forEach((s: any) => {
                s.date = day.date;
                s.status = s.status || 'pending';
              });
            }
          });
        }
        return res.json(parsed);
      }
      throw new Error('Empty response from AI model');
    } catch (aiErr) {
      console.error('Gemini generation failed, falling back to algorithmic plan:', aiErr);
      const fallback = generateFallbackSchedule(subjects, preferences);
      return res.json(fallback);
    }
  } catch (error: any) {
    console.error('API Error in /api/generate-plan:', error);
    return res.status(500).json({ error: error.message || 'Failed to generate study plan' });
  }
});

// Rebalance Study Plan Route (when student missed or skipped sessions)
app.post('/api/rebalance-plan', async (req: Request, res: Response) => {
  try {
    const { incompleteSessions, remainingDays, subjects } = req.body;
    
    if (!process.env.GEMINI_API_KEY) {
      return res.json({
        rebalanced: false,
        message: 'Rebalancing requires active AI connection. Remaining sessions have been queued.',
      });
    }

    const prompt = `
A college student needs to rebalance their study timetable because some sessions were missed or marked pending.
Remaining Incomplete Sessions: ${JSON.stringify(incompleteSessions)}
Upcoming Days Remaining: ${JSON.stringify(remainingDays)}
Subjects & Exams: ${JSON.stringify(subjects)}

Suggest how to redistribute these incomplete sessions without causing student burnout.
Respond with JSON containing:
- advice: string (brief supportive advice)
- redistributedSessionIds: array of { sessionId: string, newDate: string, newTime: string }
`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            advice: { type: Type.STRING },
            redistributedSessions: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  sessionId: { type: Type.STRING },
                  newDate: { type: Type.STRING },
                  newTime: { type: Type.STRING },
                  reason: { type: Type.STRING },
                },
                required: ['sessionId', 'newDate', 'newTime'],
              },
            },
          },
          required: ['advice', 'redistributedSessions'],
        },
      },
    });

    const text = response.text;
    if (text) {
      return res.json(JSON.parse(text));
    }
    return res.json({ advice: 'Spread your hardest missed topics over the weekend.' });
  } catch (err: any) {
    console.error('Rebalance error:', err);
    return res.status(500).json({ error: 'Failed to rebalance schedule' });
  }
});

// Quick Study Tips for a specific subject/topic
app.post('/api/subject-tips', async (req: Request, res: Response) => {
  try {
    const { subjectName, topic, difficulty } = req.body;

    if (!process.env.GEMINI_API_KEY) {
      return res.json({
        tips: [
          'Create 5 flashcards of the core definitions right away.',
          'Solve at least 2 practice exam problems without checking notes.',
          'Explain the concept out loud in 60 seconds using everyday language.',
        ],
      });
    }

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: `Provide 3 immediate, high-yield, actionable study steps for a college student studying: Subject: ${subjectName}, Topic: ${topic}, Difficulty: ${difficulty}. Keep each tip to 1-2 punchy sentences.`,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            tips: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
            },
          },
          required: ['tips'],
        },
      },
    });

    const parsed = JSON.parse(response.text || '{}');
    return res.json(parsed);
  } catch (err) {
    return res.json({
      tips: [
        'Review core definitions and test yourself with closed notes.',
        'Work through sample questions from previous quizzes.',
        'Summarize key formulas or theories on a single page.',
      ],
    });
  }
});

// AI Assignment Helper Route
app.post('/api/assignment-help', async (req: Request, res: Response) => {
  try {
    const { topic, academicLevel = 'College / Undergraduate', assignmentType = 'Essay / Paper', details = '' } = req.body;

    if (!topic || typeof topic !== 'string' || !topic.trim()) {
      return res.status(400).json({ error: 'Please enter a topic or question.' });
    }

    const cleanTopic = topic.trim();

    // Check if GEMINI_API_KEY is available
    if (!process.env.GEMINI_API_KEY) {
      console.log('No GEMINI_API_KEY provided; returning structured fallback assignment guide.');
      return res.json({
        title: cleanTopic,
        simpleExplanation: `At its core, ${cleanTopic} is about understanding the fundamental mechanisms, relationships, and cause-and-effect principles that govern this subject. Think of it like a puzzle where each component influences the final outcome.`,
        keyPoints: [
          {
            point: 'Foundational Concept & Definition',
            detail: `Define ${cleanTopic} precisely using standard academic terminology, explaining its origin and significance in the discipline.`
          },
          {
            point: 'Primary Mechanisms / Core Components',
            detail: 'Break down the system or argument into its active parts, showing how each interacts with the others.'
          },
          {
            point: 'Real-World Significance & Applications',
            detail: 'Connect theoretical principles to observable outcomes, practical industry applications, or historical precedents.'
          },
          {
            point: 'Critical Analysis & Counter-perspectives',
            detail: 'Evaluate the strengths, limitations, edge cases, or competing viewpoints surrounding this topic.'
          }
        ],
        examples: [
          {
            title: `Practical Demonstration of ${cleanTopic}`,
            scenario: `Consider a real-world scenario where ${cleanTopic} directly influences decision-making, natural processes, or systematic design.`,
            takeaway: 'Notice how applying the core rule produces a predictable, measurable result.'
          },
          {
            title: 'Comparative Case Study',
            scenario: 'Examine what happens when one variable is altered or constrained compared to a control state.',
            takeaway: 'Isolating variables clarifies the true impact of the main concept.'
          }
        ],
        structuredOutline: [
          {
            sectionTitle: '1. Introduction & Context',
            purpose: 'Hook the reader, introduce the central topic, and state your thesis or research focus.',
            suggestedLength: '1 paragraph (10-15% of total work)',
            bulletPoints: [
              'Engaging hook or background context on why this matters',
              'Clear, concise definitions of key terms',
              'Thesis statement or primary thesis question guiding the assignment'
            ],
            guidingQuestions: [
              'Why is this topic significant today?',
              'What specific stance or finding will my assignment demonstrate?'
            ]
          },
          {
            sectionTitle: '2. Foundational Principles & Background',
            purpose: 'Establish the core theory, historical background, or baseline definitions.',
            suggestedLength: '1-2 paragraphs',
            bulletPoints: [
              'Overview of prevailing models or theories',
              'Key assumptions and boundary conditions',
              'Clarification of prerequisite concepts'
            ],
            guidingQuestions: [
              'What baseline knowledge does my audience need before diving deeper?',
              'What are the consensus viewpoints in this field?'
            ]
          },
          {
            sectionTitle: '3. Deep-Dive Analysis & Supporting Evidence',
            purpose: 'Present your primary analysis, mathematical steps, empirical data, or textual arguments.',
            suggestedLength: '2-3 paragraphs or worked steps',
            bulletPoints: [
              'Detailed examination of primary evidence, data, or formulas',
              'Interpretation of cause-and-effect relationships',
              'Integration of specific examples or case studies'
            ],
            guidingQuestions: [
              'How does this evidence prove my central thesis?',
              'What patterns or calculations support this conclusion?'
            ]
          },
          {
            sectionTitle: '4. Critical Evaluation & Limitations',
            purpose: 'Demonstrate academic maturity by addressing counter-arguments, outliers, or limitations.',
            suggestedLength: '1 paragraph',
            bulletPoints: [
              'Acknowledgment of alternative interpretations or variables',
              'Discussion of constraints, ethical implications, or scope limits',
              'Response to the strongest counter-argument'
            ],
            guidingQuestions: [
              'What are the strongest criticisms or alternative explanations?',
              'Why does my main argument still hold despite these limitations?'
            ]
          },
          {
            sectionTitle: '5. Conclusion & Synthesis',
            purpose: 'Restate the thesis in a new light, synthesize findings, and state broader implications.',
            suggestedLength: '1 paragraph',
            bulletPoints: [
              'Restatement of thesis backed by summarized evidence',
              'Synthesis of the most crucial takeaway',
              'Call for future research or broader disciplinary takeaway'
            ],
            guidingQuestions: [
              'What is the lasting takeaway for the reader?',
              'How does this work contribute to a wider understanding?'
            ]
          }
        ],
        commonMistakes: [
          'Over-relying on superficial summaries rather than critically analyzing "why" and "how".',
          'Neglecting to define discipline-specific terminology clearly at the outset.',
          'Presenting arguments or claims without citing concrete empirical evidence or examples.'
        ],
        recommendedNextSteps: [
          'Review this outline and draft an initial thesis statement in your own words.',
          'Find 2-3 credible scholarly sources or lecture references to back up each outline section.',
          'Write a rough first draft focusing on flow before polishing grammar and formatting.'
        ],
        suggestedSearchTerms: [
          `${cleanTopic} peer-reviewed research`,
          `${cleanTopic} academic review paper`,
          `${cleanTopic} empirical analysis case study`
        ]
      });
    }

    const prompt = `
You are an expert college academic tutor and educational mentor dedicated to helping students understand concepts deeply so they can complete their own assignments with confidence and academic integrity.

Topic / Question / Prompt:
"${cleanTopic}"

Academic Level: ${academicLevel}
Assignment Type: ${assignmentType}
Additional Instructions / Rubric Details: "${details || 'None provided'}"

Provide a beginner-friendly, structured educational guide with:
1. "simpleExplanation": A warm, lucid, jargon-free explanation that makes the concept instantly understandable (use an intuitive analogy if fitting).
2. "keyPoints": 3 to 5 core concepts or essential takeaways that every student must grasp. Each point should have a concise name ("point") and explanation ("detail").
3. "examples": 2 to 3 concrete real-world examples, worked scenarios, or case studies showing the concept in action.
4. "structuredOutline": A clear, section-by-section outline tailored to this specific assignment type and topic that the student can follow to research and write their own assignment. For each section include:
   - "sectionTitle": e.g. "1. Introduction & Theoretical Context"
   - "purpose": concise explanation of what this section accomplishes
   - "suggestedLength": e.g. "1-2 paragraphs (~200 words)"
   - "bulletPoints": concrete points and elements the student should cover
   - "guidingQuestions": 2-3 thought-provoking questions the student should answer in their own words
5. "commonMistakes": 3 frequent mistakes or pitfalls students make on this topic and how to avoid them.
6. "recommendedNextSteps": 3 actionable step-by-step drafting advice for the student.
7. "suggestedSearchTerms": 3-4 scholarly keyword phrases for researching this topic in academic databases (Google Scholar, JSTOR, etc.).

Return valid JSON according to the schema.
`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING },
            simpleExplanation: { type: Type.STRING },
            keyPoints: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  point: { type: Type.STRING },
                  detail: { type: Type.STRING },
                },
                required: ['point', 'detail'],
              },
            },
            examples: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  title: { type: Type.STRING },
                  scenario: { type: Type.STRING },
                  takeaway: { type: Type.STRING },
                },
                required: ['title', 'scenario', 'takeaway'],
              },
            },
            structuredOutline: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  sectionTitle: { type: Type.STRING },
                  purpose: { type: Type.STRING },
                  suggestedLength: { type: Type.STRING },
                  bulletPoints: {
                    type: Type.ARRAY,
                    items: { type: Type.STRING },
                  },
                  guidingQuestions: {
                    type: Type.ARRAY,
                    items: { type: Type.STRING },
                  },
                },
                required: ['sectionTitle', 'purpose', 'suggestedLength', 'bulletPoints', 'guidingQuestions'],
              },
            },
            commonMistakes: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
            },
            recommendedNextSteps: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
            },
            suggestedSearchTerms: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
            },
          },
          required: ['title', 'simpleExplanation', 'keyPoints', 'examples', 'structuredOutline', 'commonMistakes', 'recommendedNextSteps', 'suggestedSearchTerms'],
        },
      },
    });

    const parsed = JSON.parse(response.text || '{}');
    return res.json(parsed);
  } catch (error: any) {
    console.error('API Error in /api/assignment-help:', error);
    return res.status(500).json({ error: error.message || 'Failed to generate assignment guide' });
  }
});

// Vite Middleware for development or static serving for production
async function startServer() {
  const isProduction = process.env.NODE_ENV === 'production';

  if (!isProduction) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(distPath, 'index.html'));
    });
  }

  app.listen(PORT, () => {
    console.log(`StudyPulse server running on http://localhost:${PORT}`);
  });
}

startServer();

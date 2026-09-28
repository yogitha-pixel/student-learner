import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  BookOpen,
  HelpCircle,
  Lightbulb,
  CheckCircle2,
  Circle,
  Copy,
  Check,
  Download,
  CalendarPlus,
  AlertTriangle,
  Search,
  ExternalLink,
  GraduationCap,
  Layers,
  ArrowRight,
  FileText,
  RotateCcw,
  Edit3,
  BookmarkPlus,
  Volume2,
  VolumeX
} from 'lucide-react';
import { AssignmentGuide, OutlineSection } from '../types';

interface AssignmentHelperProps {
  onAddTopicToStudyPlan?: (topic: string, subjectName: string) => void;
}

const STARTER_TOPICS = [
  {
    category: 'STEM / Biology',
    title: 'Photosynthesis & The Calvin Cycle',
    type: 'STEM Concept / Problem',
  },
  {
    category: 'Economics / Business',
    title: 'Fiscal Policy vs Monetary Policy during Inflation',
    type: 'Case Study',
  },
  {
    category: 'Computer Science',
    title: 'Dijkstra Algorithm & Shortest Path in Graphs',
    type: 'STEM Concept / Problem',
  },
  {
    category: 'Literature / Humanities',
    title: 'The Role of Fate vs Free Will in Greek Tragedy',
    type: 'Essay / Paper',
  },
  {
    category: 'History / Social Sciences',
    title: 'Causes and Economic Consequences of the Industrial Revolution',
    type: 'Essay / Paper',
  },
  {
    category: 'Psychology',
    title: 'Cognitive Behavioral Therapy for Anxiety Disorders',
    type: 'Case Study',
  },
];

const STORAGE_SAVED_ASSIGNMENTS = 'studypulse_saved_assignments_v1';
const STORAGE_SCRATCHPAD_PREFIX = 'studypulse_scratchpad_';

export const AssignmentHelper: React.FC<AssignmentHelperProps> = ({
  onAddTopicToStudyPlan,
}) => {
  const [topicInput, setTopicInput] = useState('');
  const [academicLevel, setAcademicLevel] = useState('College / Undergraduate');
  const [assignmentType, setAssignmentType] = useState('Essay / Paper');
  const [detailsInput, setDetailsInput] = useState('');
  const [showAdvanced, setShowAdvanced] = useState(false);

  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [guide, setGuide] = useState<AssignmentGuide | null>(null);

  // Checked outline items for interactive progress
  const [checkedOutlineItems, setCheckedOutlineItems] = useState<Record<string, boolean>>({});

  // Student Scratchpad note for this assignment
  const [studentNotes, setStudentNotes] = useState('');
  const [copiedAll, setCopiedAll] = useState(false);
  const [copiedExpl, setCopiedExpl] = useState(false);
  const [addedToPlan, setAddedToPlan] = useState(false);

  // Text-to-speech for explanation
  const [isSpeaking, setIsSpeaking] = useState(false);

  // Recent history
  const [savedHistory, setSavedHistory] = useState<AssignmentGuide[]>(() => {
    try {
      const raw = localStorage.getItem(STORAGE_SAVED_ASSIGNMENTS);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  });

  // Load scratchpad notes when guide changes
  useEffect(() => {
    if (guide) {
      const savedNote = localStorage.getItem(STORAGE_SCRATCHPAD_PREFIX + guide.id);
      setStudentNotes(savedNote || '');
      setCheckedOutlineItems({});
      setAddedToPlan(false);
    }
  }, [guide]);

  // Save scratchpad notes
  const handleNoteChange = (text: string) => {
    setStudentNotes(text);
    if (guide) {
      localStorage.setItem(STORAGE_SCRATCHPAD_PREFIX + guide.id, text);
    }
  };

  const handleGenerate = async (queryTopic?: string, queryType?: string) => {
    const finalTopic = queryTopic || topicInput;
    const finalType = queryType || assignmentType;

    if (!finalTopic.trim()) {
      setErrorMsg('Please enter an assignment topic, prompt, or question.');
      return;
    }

    setIsLoading(true);
    setErrorMsg(null);
    if (queryTopic) setTopicInput(queryTopic);
    if (queryType) setAssignmentType(queryType);

    try {
      const res = await fetch('/api/assignment-help', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          topic: finalTopic,
          academicLevel,
          assignmentType: finalType,
          details: detailsInput,
        }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || `Server responded with ${res.status}`);
      }

      const data = await res.json();
      const newGuide: AssignmentGuide = {
        id: `asg-${Date.now()}`,
        createdAt: new Date().toISOString(),
        topic: finalTopic,
        title: data.title || finalTopic,
        academicLevel,
        assignmentType: finalType,
        simpleExplanation: data.simpleExplanation || '',
        keyPoints: data.keyPoints || [],
        examples: data.examples || [],
        structuredOutline: data.structuredOutline || [],
        commonMistakes: data.commonMistakes || [],
        recommendedNextSteps: data.recommendedNextSteps || [],
        suggestedSearchTerms: data.suggestedSearchTerms || [],
      };

      setGuide(newGuide);

      // Save to recent history (keep max 10)
      const updatedHistory = [newGuide, ...savedHistory.filter((h) => h.topic.toLowerCase() !== finalTopic.toLowerCase())].slice(0, 10);
      setSavedHistory(updatedHistory);
      localStorage.setItem(STORAGE_SAVED_ASSIGNMENTS, JSON.stringify(updatedHistory));
    } catch (err: any) {
      console.error('Assignment Helper Error:', err);
      setErrorMsg(err.message || 'Failed to generate assignment helper. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const toggleCheckItem = (key: string) => {
    setCheckedOutlineItems((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  // Copy full Markdown guide
  const handleCopyFullGuide = () => {
    if (!guide) return;
    let md = `# Assignment Guide: ${guide.title}\n\n`;
    md += `Academic Level: ${guide.academicLevel} | Format: ${guide.assignmentType}\n\n`;
    md += `## 💡 Simple Explanation\n${guide.simpleExplanation}\n\n`;

    md += `## 🔑 Key Points\n`;
    guide.keyPoints.forEach((kp, idx) => {
      md += `${idx + 1}. **${kp.point}**: ${kp.detail}\n`;
    });
    md += `\n`;

    md += `## 🌟 Real-World Examples\n`;
    guide.examples.forEach((ex, idx) => {
      md += `### Example ${idx + 1}: ${ex.title}\n`;
      md += `${ex.scenario}\n`;
      md += `*Takeaway:* ${ex.takeaway}\n\n`;
    });

    md += `## 📝 Structured Assignment Outline\n`;
    guide.structuredOutline.forEach((sec) => {
      md += `### ${sec.sectionTitle} (${sec.suggestedLength})\n`;
      md += `*Purpose:* ${sec.purpose}\n`;
      md += `Points to cover:\n`;
      sec.bulletPoints.forEach((bp) => {
        md += `- [ ] ${bp}\n`;
      });
      md += `Guiding Questions to Answer:\n`;
      sec.guidingQuestions.forEach((gq) => {
        md += `  - ${gq}\n`;
      });
      md += `\n`;
    });

    md += `## ⚠️ Common Pitfalls to Avoid\n`;
    guide.commonMistakes.forEach((cm) => {
      md += `- ${cm}\n`;
    });
    md += `\n`;

    md += `## 🔍 Scholarly Search Keywords\n`;
    guide.suggestedSearchTerms.forEach((term) => {
      md += `- ${term}\n`;
    });

    navigator.clipboard.writeText(md);
    setCopiedAll(true);
    setTimeout(() => setCopiedAll(false), 2500);
  };

  // Copy simple explanation
  const handleCopyExplanation = () => {
    if (!guide) return;
    navigator.clipboard.writeText(guide.simpleExplanation);
    setCopiedExpl(true);
    setTimeout(() => setCopiedExpl(false), 2000);
  };

  // Text to Speech
  const toggleSpeech = () => {
    if (!guide) return;
    if ('speechSynthesis' in window) {
      if (isSpeaking) {
        window.speechSynthesis.cancel();
        setIsSpeaking(false);
      } else {
        const utterance = new SpeechSynthesisUtterance(guide.simpleExplanation);
        utterance.rate = 1.0;
        utterance.pitch = 1.0;
        utterance.onend = () => setIsSpeaking(false);
        utterance.onerror = () => setIsSpeaking(false);
        window.speechSynthesis.speak(utterance);
        setIsSpeaking(true);
      }
    }
  };

  const handleAddTopicToSchedule = () => {
    if (!guide || !onAddTopicToStudyPlan) return;
    onAddTopicToStudyPlan(guide.title, guide.assignmentType);
    setAddedToPlan(true);
    setTimeout(() => setAddedToPlan(false), 3000);
  };

  return (
    <div className="space-y-6">
      {/* Hero Search Box */}
      <div className="bg-gradient-to-br from-indigo-900 via-indigo-800 to-slate-900 rounded-3xl p-6 sm:p-8 text-white relative overflow-hidden shadow-xl">
        <div className="absolute top-0 right-0 -mt-10 -mr-10 w-72 h-72 bg-violet-500/20 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/10 backdrop-blur-md rounded-full text-indigo-200 text-xs font-medium mb-3">
            <GraduationCap className="w-3.5 h-3.5 text-amber-300" />
            Beginner-Friendly Assignment Mentor
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white mb-2">
            Understand Any Assignment &amp; Build Your Own Work
          </h1>
          <p className="text-indigo-100/90 text-sm sm:text-base leading-relaxed mb-6">
            Enter your homework prompt, research topic, or exam question. Get a simple plain-English breakdown, key concepts, illustrative examples, and a step-by-step outline to write your assignment with confidence.
          </p>

          {/* Main Input Form */}
          <div className="bg-white rounded-2xl p-2.5 shadow-2xl text-slate-900 space-y-2">
            <div className="flex items-center gap-2 px-2">
              <Search className="w-5 h-5 text-indigo-500 shrink-0" />
              <input
                type="text"
                placeholder="Enter assignment topic, question, or prompt (e.g. Calvin Cycle, Keynesian Policy, Dijkstra algorithm)..."
                value={topicInput}
                onChange={(e) => setTopicInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleGenerate();
                }}
                className="w-full text-sm sm:text-base font-medium py-2 text-slate-800 placeholder-slate-400 focus:outline-none"
              />
              <button
                onClick={() => handleGenerate()}
                disabled={isLoading || !topicInput.trim()}
                className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold rounded-xl text-xs sm:text-sm shadow-md transition-all shrink-0 flex items-center gap-2"
              >
                {isLoading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                    <span>Analyzing...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 text-amber-300" />
                    <span>Explain &amp; Outline</span>
                  </>
                )}
              </button>
            </div>

            {/* Config Badges / Dropdowns */}
            <div className="flex items-center justify-between flex-wrap gap-2 pt-2 border-t border-slate-100 px-2 text-xs">
              <div className="flex items-center gap-2 flex-wrap">
                <div className="flex items-center gap-1">
                  <span className="text-slate-400 font-medium">Level:</span>
                  <select
                    value={academicLevel}
                    onChange={(e) => setAcademicLevel(e.target.value)}
                    className="bg-slate-100 border-none rounded-lg px-2 py-1 font-semibold text-slate-700 text-xs focus:ring-1 focus:ring-indigo-500"
                  >
                    <option value="High School">High School</option>
                    <option value="College / Undergraduate">College / Undergraduate</option>
                    <option value="Graduate">Graduate</option>
                  </select>
                </div>

                <div className="flex items-center gap-1">
                  <span className="text-slate-400 font-medium">Format:</span>
                  <select
                    value={assignmentType}
                    onChange={(e) => setAssignmentType(e.target.value)}
                    className="bg-slate-100 border-none rounded-lg px-2 py-1 font-semibold text-slate-700 text-xs focus:ring-1 focus:ring-indigo-500"
                  >
                    <option value="Essay / Paper">Essay / Paper</option>
                    <option value="STEM Concept / Problem">STEM Concept / Problem</option>
                    <option value="Case Study">Case Study</option>
                    <option value="Lab Report">Lab Report</option>
                    <option value="Presentation / Speech">Presentation / Speech</option>
                    <option value="Short Answer">Short Answer</option>
                  </select>
                </div>

                <button
                  type="button"
                  onClick={() => setShowAdvanced(!showAdvanced)}
                  className="text-indigo-600 hover:text-indigo-700 font-semibold px-2 py-1 rounded-lg hover:bg-indigo-50 transition-colors"
                >
                  {showAdvanced ? '- Hide Details' : '+ Add Rubric / Details'}
                </button>
              </div>

              <span className="text-[11px] text-slate-400 italic hidden sm:inline">
                Academic Integrity: Guides understanding so you write your own work.
              </span>
            </div>

            {/* Optional Rubric / Specific Questions Drawer */}
            {showAdvanced && (
              <div className="pt-2 px-2 border-t border-slate-100 animate-in fade-in">
                <textarea
                  rows={2}
                  placeholder="Paste specific rubric requirements, word count target, or teacher questions here (optional)..."
                  value={detailsInput}
                  onChange={(e) => setDetailsInput(e.target.value)}
                  className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-indigo-500 text-slate-800"
                />
              </div>
            )}
          </div>

          {/* Quick Starter Topics */}
          <div className="mt-4 flex items-center gap-1.5 flex-wrap">
            <span className="text-xs text-indigo-200 font-semibold">Try a sample topic:</span>
            {STARTER_TOPICS.map((st, idx) => (
              <button
                key={idx}
                onClick={() => handleGenerate(st.title, st.type)}
                className="text-xs px-2.5 py-1 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-colors border border-white/10"
              >
                {st.title}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Error Banner */}
      {errorMsg && (
        <div className="bg-rose-50 border border-rose-200 p-4 rounded-2xl flex items-center justify-between text-xs text-rose-800">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
            <span>{errorMsg}</span>
          </div>
          <button onClick={() => setErrorMsg(null)} className="font-bold hover:underline">
            Dismiss
          </button>
        </div>
      )}

      {/* Loading State Animation */}
      {isLoading && (
        <div className="bg-white rounded-3xl p-12 border border-slate-200 text-center max-w-lg mx-auto shadow-sm space-y-4">
          <div className="w-12 h-12 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 mx-auto animate-bounce">
            <Sparkles className="w-6 h-6 text-indigo-600" />
          </div>
          <h3 className="font-extrabold text-slate-900 text-lg">
            Analyzing Assignment &amp; Building Guide...
          </h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Breaking down complex concepts into simple analogies, key principles, concrete examples, and a structured thesis outline.
          </p>
        </div>
      )}

      {/* Active Guide Content */}
      {guide && !isLoading && (
        <div className="space-y-6">
          {/* Header Action Bar */}
          <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 flex-wrap mb-1">
                <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200">
                  {guide.assignmentType}
                </span>
                <span className="text-[11px] font-semibold text-slate-500">
                  {guide.academicLevel}
                </span>
              </div>
              <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
                {guide.title}
              </h2>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-2 flex-wrap">
              <button
                onClick={handleCopyFullGuide}
                className="text-xs font-semibold px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl transition-colors flex items-center gap-1.5"
                title="Copy full assignment guide to clipboard in Markdown format"
              >
                {copiedAll ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedAll ? 'Copied Guide!' : 'Copy Full Guide'}</span>
              </button>

              {onAddTopicToStudyPlan && (
                <button
                  onClick={handleAddTopicToSchedule}
                  className="text-xs font-semibold px-3 py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-xl transition-colors flex items-center gap-1.5"
                  title="Add this topic as a study block in your timetable"
                >
                  <CalendarPlus className="w-3.5 h-3.5 text-indigo-600" />
                  <span>{addedToPlan ? 'Added to Timetable!' : 'Add to Study Plan'}</span>
                </button>
              )}
            </div>
          </div>

          {/* Section 1: Simple Explanation (Plain English) */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm relative overflow-hidden">
            <div className="flex items-center justify-between gap-2 mb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold">
                  💡
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-slate-900">
                    Simple Explanation (In Plain English)
                  </h3>
                  <p className="text-xs text-slate-500">The intuitive concept breakdown before diving into technical details</p>
                </div>
              </div>

              <div className="flex items-center gap-1.5">
                <button
                  onClick={toggleSpeech}
                  className={`p-2 rounded-xl text-xs transition-colors ${
                    isSpeaking
                      ? 'bg-indigo-600 text-white animate-pulse'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                  title={isSpeaking ? 'Stop Audio' : 'Listen to explanation'}
                >
                  {isSpeaking ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                </button>
                <button
                  onClick={handleCopyExplanation}
                  className="p-2 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl text-xs transition-colors"
                  title="Copy explanation"
                >
                  {copiedExpl ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-amber-50/50 border border-amber-200/60 text-slate-800 text-sm sm:text-base leading-relaxed">
              {guide.simpleExplanation}
            </div>
          </div>

          {/* Section 2: Key Points & Core Principles */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold">
                🔑
              </div>
              <div>
                <h3 className="text-base font-extrabold text-slate-900">
                  Key Points &amp; Core Concepts
                </h3>
                <p className="text-xs text-slate-500">Foundational principles you must understand to write an authoritative response</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
              {guide.keyPoints.map((kp, idx) => (
                <div
                  key={idx}
                  className="p-4 rounded-2xl bg-slate-50 border border-slate-100 hover:border-indigo-100 transition-colors space-y-1.5"
                >
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full bg-indigo-600 text-white font-bold text-xs flex items-center justify-center shrink-0">
                      {idx + 1}
                    </span>
                    <h4 className="font-bold text-slate-900 text-sm">{kp.point}</h4>
                  </div>
                  <p className="text-xs sm:text-sm text-slate-600 leading-relaxed pl-8">
                    {kp.detail}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Section 3: Real-World Examples & Case Studies */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
                🌟
              </div>
              <div>
                <h3 className="text-base font-extrabold text-slate-900">
                  Real-World Examples &amp; Case Studies
                </h3>
                <p className="text-xs text-slate-500">Concrete applications you can reference or build upon in your paper</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {guide.examples.map((ex, idx) => (
                <div
                  key={idx}
                  className="p-4 sm:p-5 rounded-2xl bg-gradient-to-br from-emerald-50/50 via-white to-slate-50 border border-emerald-100/80 space-y-2.5"
                >
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold px-2 py-0.5 rounded bg-emerald-100 text-emerald-800">
                      Example {idx + 1}
                    </span>
                    <h4 className="font-bold text-slate-900 text-sm">{ex.title}</h4>
                  </div>
                  <p className="text-xs sm:text-sm text-slate-700 leading-relaxed">
                    {ex.scenario}
                  </p>
                  <div className="pt-2 border-t border-emerald-100/60 text-xs text-emerald-900 font-semibold flex items-start gap-1.5">
                    <span className="shrink-0">🎯 Takeaway:</span>
                    <span>{ex.takeaway}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Section 4: Interactive Step-by-Step Assignment Outline & Student Scratchpad */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left 2 Cols: Step-by-Step Outline */}
            <div className="lg:col-span-2 bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-violet-50 text-violet-600 flex items-center justify-center font-bold">
                    📝
                  </div>
                  <div>
                    <h3 className="text-base font-extrabold text-slate-900">
                      Structured Assignment Outline
                    </h3>
                    <p className="text-xs text-slate-500">Check off sections and answer the guiding questions in your draft</p>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                {guide.structuredOutline.map((sec, sIdx) => {
                  const isAllChecked = sec.bulletPoints.every(
                    (bp, bIdx) => checkedOutlineItems[`${sIdx}-${bIdx}`]
                  );

                  return (
                    <div
                      key={sIdx}
                      className={`p-4 sm:p-5 rounded-2xl border transition-all ${
                        isAllChecked
                          ? 'border-emerald-200 bg-emerald-50/20'
                          : 'border-slate-200 bg-white hover:border-slate-300'
                      }`}
                    >
                      {/* Section Title & Target Length */}
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <div>
                          <h4 className="font-extrabold text-slate-900 text-sm sm:text-base">
                            {sec.sectionTitle}
                          </h4>
                          <p className="text-xs text-indigo-600 font-medium mt-0.5">
                            Purpose: {sec.purpose}
                          </p>
                        </div>
                        <span className="text-[11px] font-bold px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 shrink-0">
                          {sec.suggestedLength}
                        </span>
                      </div>

                      {/* Checklist of elements to write */}
                      <div className="mt-3 space-y-1.5">
                        <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                          Points to address in your work:
                        </p>
                        {sec.bulletPoints.map((bp, bIdx) => {
                          const itemKey = `${sIdx}-${bIdx}`;
                          const isChecked = !!checkedOutlineItems[itemKey];

                          return (
                            <button
                              key={bIdx}
                              onClick={() => toggleCheckItem(itemKey)}
                              className="w-full flex items-start gap-2.5 text-left p-1.5 rounded-lg hover:bg-slate-50 transition-colors"
                            >
                              <div className="mt-0.5 shrink-0">
                                {isChecked ? (
                                  <CheckCircle2 className="w-4 h-4 text-emerald-500 fill-emerald-100" />
                                ) : (
                                  <Circle className="w-4 h-4 text-slate-300" />
                                )}
                              </div>
                              <span
                                className={`text-xs sm:text-sm leading-snug ${
                                  isChecked ? 'line-through text-slate-400' : 'text-slate-700'
                                }`}
                              >
                                {bp}
                              </span>
                            </button>
                          );
                        })}
                      </div>

                      {/* Guiding Questions */}
                      {sec.guidingQuestions && sec.guidingQuestions.length > 0 && (
                        <div className="mt-3 pt-3 border-t border-slate-100 bg-slate-50/60 p-3 rounded-xl">
                          <p className="text-[11px] font-bold text-slate-600 mb-1 flex items-center gap-1">
                            <HelpCircle className="w-3 h-3 text-indigo-500" /> Guiding Questions to Answer:
                          </p>
                          <ul className="list-disc list-inside text-xs text-slate-600 space-y-1">
                            {sec.guidingQuestions.map((gq, gIdx) => (
                              <li key={gIdx} className="leading-relaxed">
                                {gq}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Right Col: Student Drafting Scratchpad & Mistakes to Avoid */}
            <div className="space-y-6">
              {/* Scratchpad */}
              <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-sm space-y-3">
                <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                  <div className="flex items-center gap-2">
                    <Edit3 className="w-4 h-4 text-indigo-600" />
                    <h3 className="font-bold text-slate-900 text-sm">Your Drafting Scratchpad</h3>
                  </div>
                  <span className="text-[10px] text-slate-400">Auto-saved</span>
                </div>
                <p className="text-xs text-slate-500">
                  Jot down your thesis, outline notes, or rough sentences here side-by-side with the AI breakdown:
                </p>
                <textarea
                  rows={8}
                  placeholder="Draft your thoughts, thesis statement, or outline notes here..."
                  value={studentNotes}
                  onChange={(e) => handleNoteChange(e.target.value)}
                  className="w-full text-xs p-3 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-800 leading-relaxed font-sans"
                />
              </div>

              {/* Common Pitfalls */}
              <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-sm space-y-3">
                <div className="flex items-center gap-2 border-b border-slate-100 pb-2 text-rose-700">
                  <AlertTriangle className="w-4 h-4" />
                  <h3 className="font-bold text-sm">Common Pitfalls to Avoid</h3>
                </div>
                <div className="space-y-2">
                  {guide.commonMistakes.map((mistake, idx) => (
                    <div
                      key={idx}
                      className="p-2.5 rounded-xl bg-rose-50/50 border border-rose-100 text-xs text-rose-900 leading-relaxed flex items-start gap-2"
                    >
                      <span className="text-rose-500 font-bold shrink-0">✕</span>
                      <span>{mistake}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Recommended Next Steps */}
              <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-sm space-y-3">
                <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-indigo-600" /> Recommended Next Steps
                </h3>
                <ol className="space-y-2 text-xs text-slate-700">
                  {guide.recommendedNextSteps.map((step, idx) => (
                    <li key={idx} className="flex items-start gap-2 bg-slate-50 p-2.5 rounded-xl">
                      <span className="w-4 h-4 rounded-full bg-indigo-100 text-indigo-800 font-bold flex items-center justify-center shrink-0 text-[10px]">
                        {idx + 1}
                      </span>
                      <span className="leading-snug">{step}</span>
                    </li>
                  ))}
                </ol>
              </div>

              {/* Academic Search Terms */}
              {guide.suggestedSearchTerms && guide.suggestedSearchTerms.length > 0 && (
                <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-sm space-y-3">
                  <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                    <Search className="w-4 h-4 text-indigo-600" /> Scholarly Search Terms
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    Click to search scholarly sources in Google Scholar:
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {guide.suggestedSearchTerms.map((term, idx) => (
                      <a
                        key={idx}
                        href={`https://scholar.google.com/scholar?q=${encodeURIComponent(term)}`}
                        target="_blank"
                        rel="noreferrer"
                        className="text-xs font-medium bg-slate-100 hover:bg-indigo-50 hover:text-indigo-700 text-slate-700 px-2.5 py-1 rounded-lg border border-slate-200/80 transition-colors flex items-center gap-1"
                      >
                        <span>{term}</span>
                        <ExternalLink className="w-3 h-3 text-slate-400" />
                      </a>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* History of Saved Topics */}
      {savedHistory.length > 0 && (
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
              <BookmarkPlus className="w-4 h-4 text-indigo-600" />
              Recent Assignment Topics
            </h3>
            <button
              onClick={() => {
                setSavedHistory([]);
                localStorage.removeItem(STORAGE_SAVED_ASSIGNMENTS);
              }}
              className="text-xs text-slate-400 hover:text-rose-600 transition-colors"
            >
              Clear History
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5">
            {savedHistory.map((item) => (
              <button
                key={item.id}
                onClick={() => setGuide(item)}
                className="text-left p-3 rounded-2xl bg-slate-50 hover:bg-indigo-50/60 border border-slate-100 hover:border-indigo-200 transition-all group"
              >
                <div className="text-[10px] font-bold text-indigo-600 uppercase tracking-wider mb-0.5">
                  {item.assignmentType}
                </div>
                <div className="font-bold text-slate-800 text-xs line-clamp-1 group-hover:text-indigo-900">
                  {item.title}
                </div>
                <div className="text-[11px] text-slate-400 mt-1 line-clamp-1">
                  {item.simpleExplanation}
                </div>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

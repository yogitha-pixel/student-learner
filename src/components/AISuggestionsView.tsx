import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  Bot,
  Lightbulb,
  Building2,
  GraduationCap,
  CheckCircle2,
  Send,
  MessageSquare,
  HelpCircle,
  RefreshCw,
  Flame,
  ArrowRight,
  ChefHat
} from 'lucide-react';
import { AISuggestionsResponse } from '../types';

interface AISuggestionsViewProps {
  onNavigateAdd: () => void;
}

const SAMPLE_AI_QUESTIONS = [
  'How can our canteen prevent 8kg of cooked rice surplus every lunch?',
  'What are creative ways students can rescue stale bread or overripe bananas in dorms?',
  'How do we set up a safe campus food rescue donation program?',
  'What portioning strategies cut plate waste in self-serve dining halls?',
];

export const AISuggestionsView: React.FC<AISuggestionsViewProps> = ({ onNavigateAdd }) => {
  const [suggestions, setSuggestions] = useState<AISuggestionsResponse | null>(null);
  const [isLoadingSuggestions, setIsLoadingSuggestions] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Chat Assistant State
  const [chatQuestion, setChatQuestion] = useState('');
  const [chatRole, setChatRole] = useState<'Student' | 'College Canteen'>('College Canteen');
  const [isAskingChat, setIsAskingChat] = useState(false);
  const [chatHistory, setChatHistory] = useState<Array<{ role: 'user' | 'assistant'; text: string }>>([
    {
      role: 'assistant',
      text: 'Hello! I am your FoodWise AI Advisor. Ask me anything about batch-cooking adjustments, leftover recipe transformations, dorm storage, or setting up a campus food rescue program!',
    },
  ]);

  // Load initial AI suggestions on mount
  useEffect(() => {
    fetchSuggestions();
  }, []);

  const fetchSuggestions = async () => {
    setIsLoadingSuggestions(true);
    setErrorMsg(null);
    try {
      const res = await fetch('/api/ai-suggestions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });
      if (!res.ok) throw new Error('Failed to fetch AI suggestions');
      const data = await res.json();
      setSuggestions(data);
    } catch (err: any) {
      console.error('Error fetching suggestions:', err);
      setErrorMsg('Could not fetch AI suggestions. Please try again.');
    } finally {
      setIsLoadingSuggestions(false);
    }
  };

  const handleAskQuestion = async (customPrompt?: string) => {
    const q = customPrompt || chatQuestion;
    if (!q.trim()) return;

    const userMessage = q.trim();
    setChatHistory((prev) => [...prev, { role: 'user', text: userMessage }]);
    if (!customPrompt) setChatQuestion('');
    setIsAskingChat(true);

    try {
      const res = await fetch('/api/ai-chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question: userMessage, userRole: chatRole }),
      });
      const data = await res.json();
      setChatHistory((prev) => [
        ...prev,
        { role: 'assistant', text: data.answer || 'Keep measuring portions and cooking in smaller batches!' },
      ]);
    } catch (err) {
      setChatHistory((prev) => [
        ...prev,
        { role: 'assistant', text: 'Sorry, I could not connect right now. Check your internet connection or server logs.' },
      ]);
    } finally {
      setIsAskingChat(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-teal-800 via-emerald-800 to-slate-900 rounded-3xl p-6 sm:p-8 text-white relative overflow-hidden shadow-xl">
        <div className="absolute top-0 right-0 -mt-10 -mr-10 w-72 h-72 bg-emerald-400/20 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/10 backdrop-blur-md rounded-full text-emerald-200 text-xs font-semibold mb-3">
            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
            Gemini-Powered Waste Intelligence
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white mb-2">
            AI-Driven Food Waste Reduction Insights
          </h1>
          <p className="text-emerald-100/90 text-sm sm:text-base leading-relaxed mb-4">
            Our AI analyzes your campus&apos;s real waste logs to identify over-preparation trends and generate tailored operational solutions for dining halls and students.
          </p>

          <button
            onClick={fetchSuggestions}
            disabled={isLoadingSuggestions}
            className="px-5 py-2.5 bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 text-white font-bold rounded-2xl shadow-md text-xs sm:text-sm flex items-center gap-2 transition-all"
          >
            <RefreshCw className={`w-4 h-4 ${isLoadingSuggestions ? 'animate-spin' : ''}`} />
            <span>{isLoadingSuggestions ? 'Analyzing Recent Logs...' : 'Re-Analyze Current Data'}</span>
          </button>
        </div>
      </div>

      {/* Diagnostic Summary Card */}
      {suggestions && (
        <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs space-y-4">
          <div className="flex items-center gap-2 text-xs font-bold text-emerald-800 uppercase tracking-wider">
            <Lightbulb className="w-4 h-4 text-emerald-600" />
            AI Diagnostic Summary
          </div>
          <div className="p-4 rounded-2xl bg-emerald-50/70 border border-emerald-100 text-slate-800 text-sm sm:text-base leading-relaxed font-medium">
            {suggestions.summary}
          </div>
        </div>
      )}

      {/* Main Grid: Canteen Recommendations & Student Tips */}
      {suggestions && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Canteen Staff Recommendations */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs space-y-4">
            <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
              <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                <Building2 className="w-4 h-4" />
              </div>
              <div>
                <h3 className="font-extrabold text-slate-900 text-base">College Canteen Recommendations</h3>
                <p className="text-xs text-slate-500">Operational adjustments for kitchen and serving lines</p>
              </div>
            </div>

            <div className="space-y-3.5">
              {suggestions.canteenSuggestions.map((item, idx) => (
                <div
                  key={idx}
                  className="p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-1.5 hover:border-emerald-200 transition-colors"
                >
                  <div className="flex items-start justify-between gap-2">
                    <h4 className="font-bold text-slate-900 text-sm leading-snug">{item.title}</h4>
                    <span className="text-[10px] font-extrabold text-emerald-800 bg-emerald-100/80 px-2 py-0.5 rounded-full shrink-0">
                      {item.impact}
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed">{item.explanation}</p>
                  <span className="inline-block text-[10px] font-semibold text-slate-400 bg-white px-2 py-0.5 rounded border border-slate-200">
                    {item.category}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Student & Dorm Recommendations */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs space-y-4">
            <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
              <div className="w-8 h-8 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center">
                <GraduationCap className="w-4 h-4" />
              </div>
              <div>
                <h3 className="font-extrabold text-slate-900 text-base">Student Plate &amp; Dorm Habits</h3>
                <p className="text-xs text-slate-500">Personal tips to prevent leftovers and grocery waste</p>
              </div>
            </div>

            <div className="space-y-3.5">
              {suggestions.studentSuggestions.map((item, idx) => (
                <div
                  key={idx}
                  className="p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-1.5 hover:border-teal-200 transition-colors"
                >
                  <div className="flex items-start justify-between gap-2">
                    <h4 className="font-bold text-slate-900 text-sm leading-snug">{item.title}</h4>
                    <span className="text-[10px] font-extrabold text-teal-800 bg-teal-100/80 px-2 py-0.5 rounded-full shrink-0">
                      {item.impact}
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed">{item.explanation}</p>
                  <span className="inline-block text-[10px] font-semibold text-slate-400 bg-white px-2 py-0.5 rounded border border-slate-200">
                    {item.category}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 3-Step Campus Action Plan */}
      {suggestions && suggestions.actionPlan && (
        <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs space-y-3">
          <div className="flex items-center gap-2 text-slate-900 font-extrabold text-base">
            <CheckCircle2 className="w-5 h-5 text-emerald-600" />
            <span>3-Step Campus Implementation Roadmap</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-1">
            {suggestions.actionPlan.map((step, idx) => (
              <div
                key={idx}
                className="p-4 rounded-2xl bg-emerald-50/50 border border-emerald-100 flex items-start gap-3"
              >
                <div className="w-6 h-6 rounded-full bg-emerald-600 text-white font-black text-xs flex items-center justify-center shrink-0 mt-0.5 shadow-xs">
                  {idx + 1}
                </div>
                <p className="text-xs font-semibold text-slate-800 leading-relaxed">{step}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Interactive AI Chat Assistant */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-amber-500 to-amber-600 text-white flex items-center justify-center shadow-md shadow-amber-200">
              <ChefHat className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-slate-900 text-base">Ask Chef FoodWise AI</h3>
              <p className="text-xs text-slate-500">
                Ask specific questions about recipes, leftovers, portioning, or campus sustainability
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 text-xs">
            <span className="text-slate-400 font-semibold">I am asking as:</span>
            <div className="inline-flex p-1 bg-slate-100 rounded-xl">
              <button
                type="button"
                onClick={() => setChatRole('College Canteen')}
                className={`px-3 py-1 rounded-lg font-bold transition-all ${
                  chatRole === 'College Canteen' ? 'bg-white text-emerald-700 shadow-xs' : 'text-slate-600'
                }`}
              >
                Canteen Staff
              </button>
              <button
                type="button"
                onClick={() => setChatRole('Student')}
                className={`px-3 py-1 rounded-lg font-bold transition-all ${
                  chatRole === 'Student' ? 'bg-white text-teal-700 shadow-xs' : 'text-slate-600'
                }`}
              >
                Student
              </button>
            </div>
          </div>
        </div>

        {/* Chat Messages Log */}
        <div className="space-y-3 max-h-96 overflow-y-auto pr-1">
          {chatHistory.map((msg, idx) => (
            <div
              key={idx}
              className={`flex items-start gap-3 p-3.5 rounded-2xl text-xs leading-relaxed ${
                msg.role === 'assistant'
                  ? 'bg-emerald-50/70 border border-emerald-100 text-slate-800'
                  : 'bg-slate-100 text-slate-900 ml-6 sm:ml-12 font-medium'
              }`}
            >
              <div
                className={`w-6 h-6 rounded-full flex items-center justify-center text-xs shrink-0 mt-0.5 ${
                  msg.role === 'assistant' ? 'bg-emerald-600 text-white' : 'bg-slate-800 text-white'
                }`}
              >
                {msg.role === 'assistant' ? <Bot className="w-3.5 h-3.5" /> : 'You'}
              </div>
              <div className="whitespace-pre-line flex-1">{msg.text}</div>
            </div>
          ))}

          {isAskingChat && (
            <div className="flex items-center gap-2 p-3 bg-slate-50 rounded-2xl text-xs text-slate-500 animate-pulse">
              <Bot className="w-4 h-4 text-emerald-600 animate-spin" />
              <span>Chef FoodWise is drafting practical recommendations...</span>
            </div>
          )}
        </div>

        {/* Suggested Quick Questions */}
        <div className="flex items-center gap-1.5 flex-wrap pt-2">
          <span className="text-[11px] text-slate-400 font-semibold">Suggested questions:</span>
          {SAMPLE_AI_QUESTIONS.map((q, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => handleAskQuestion(q)}
              className="text-[11px] bg-slate-100 hover:bg-emerald-50 hover:text-emerald-700 text-slate-600 px-2.5 py-1 rounded-lg border border-slate-200/60 transition-colors"
            >
              {q}
            </button>
          ))}
        </div>

        {/* Input bar */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleAskQuestion();
          }}
          className="flex items-center gap-2 pt-2"
        >
          <input
            type="text"
            placeholder="Ask Chef FoodWise a question (e.g. How to use surplus cooked rice, or how to reduce bread waste?)..."
            value={chatQuestion}
            onChange={(e) => setChatQuestion(e.target.value)}
            disabled={isAskingChat}
            className="flex-1 px-4 py-3 text-xs sm:text-sm border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-emerald-500 text-slate-900"
          />
          <button
            type="submit"
            disabled={isAskingChat || !chatQuestion.trim()}
            className="px-5 py-3 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-bold rounded-2xl text-xs sm:text-sm shadow-xs transition-colors flex items-center gap-1.5"
          >
            <Send className="w-4 h-4" />
            <span className="hidden sm:inline">Ask</span>
          </button>
        </form>
      </div>
    </div>
  );
};

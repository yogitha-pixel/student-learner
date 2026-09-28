import React, { useState, useEffect } from 'react';
import { X, Sparkles, Lightbulb, BookOpen, Check, Copy } from 'lucide-react';
import { StudySession } from '../types';

interface TopicTipsModalProps {
  session: StudySession | null;
  isOpen: boolean;
  onClose: () => void;
}

export const TopicTipsModal: React.FC<TopicTipsModalProps> = ({
  session,
  isOpen,
  onClose,
}) => {
  const [tips, setTips] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (session && isOpen) {
      setLoading(true);
      fetch('/api/subject-tips', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          subjectName: session.subjectName,
          topic: session.topic,
          difficulty: session.difficulty,
        }),
      })
        .then((res) => res.json())
        .then((data) => {
          if (data.tips && Array.isArray(data.tips)) {
            setTips(data.tips);
          } else {
            setTips([
              'Draft a single-page concept summary map without looking at your notes.',
              'Solve at least 2 practice exam problems targeting this exact topic.',
              'Teach the core concept out loud in 60 seconds as if explaining to a beginner.',
            ]);
          }
        })
        .catch(() => {
          setTips([
            'Draft a single-page concept summary map without looking at your notes.',
            'Solve at least 2 practice exam problems targeting this exact topic.',
            'Teach the core concept out loud in 60 seconds as if explaining to a beginner.',
          ]);
        })
        .finally(() => setLoading(false));
    }
  }, [session, isOpen]);

  if (!isOpen || !session) return null;

  const handleCopyTips = () => {
    const text = tips.map((t, idx) => `${idx + 1}. ${t}`).join('\n');
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-100 relative">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-2 mb-3">
          <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
            <Lightbulb className="w-4 h-4" />
          </div>
          <div>
            <span className="text-[11px] font-bold text-amber-800 bg-amber-100/60 px-2 py-0.5 rounded-full">
              High-Yield AI Tips
            </span>
          </div>
        </div>

        <h3 className="font-extrabold text-slate-900 text-lg leading-snug">
          {session.subjectName}
        </h3>
        <p className="text-xs text-indigo-600 font-semibold mt-0.5">
          Topic: {session.topic}
        </p>

        <div className="mt-4 space-y-3">
          {loading ? (
            <div className="py-8 text-center">
              <div className="w-6 h-6 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
              <p className="text-xs text-slate-500 font-medium">Generating topic-tailored study tips...</p>
            </div>
          ) : (
            tips.map((tip, idx) => (
              <div
                key={idx}
                className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100 flex items-start gap-3"
              >
                <div className="w-6 h-6 rounded-full bg-indigo-600 text-white font-bold flex items-center justify-center text-xs shrink-0 mt-0.5 shadow-sm">
                  {idx + 1}
                </div>
                <p className="text-xs sm:text-sm text-slate-700 leading-relaxed font-medium">
                  {tip}
                </p>
              </div>
            ))
          )}
        </div>

        <div className="mt-5 pt-4 border-t border-slate-100 flex items-center justify-between">
          <button
            onClick={handleCopyTips}
            className="text-xs font-semibold text-slate-600 hover:text-slate-900 flex items-center gap-1.5"
          >
            {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
            <span>{copied ? 'Copied to clipboard!' : 'Copy tips'}</span>
          </button>

          <button
            onClick={onClose}
            className="px-4 py-2 bg-indigo-600 text-white rounded-xl text-xs font-bold hover:bg-indigo-500 transition-colors"
          >
            Got it, Let&apos;s Study
          </button>
        </div>
      </div>
    </div>
  );
};

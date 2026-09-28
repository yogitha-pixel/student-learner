import React, { useState, useEffect, useRef } from 'react';
import {
  X,
  Play,
  Pause,
  RotateCcw,
  CheckCircle,
  Volume2,
  VolumeX,
  Sparkles,
  BookOpen,
  Coffee,
  Brain
} from 'lucide-react';
import { StudySession } from '../types';
import { playChimeSound, playTickSound, startAmbientNoise, stopAmbientNoise } from '../utils/audio';

interface StudyTimerModalProps {
  session: StudySession | null;
  isOpen: boolean;
  onClose: () => void;
  onSessionCompleted?: (sessionId: string) => void;
}

export const StudyTimerModal: React.FC<StudyTimerModalProps> = ({
  session,
  isOpen,
  onClose,
  onSessionCompleted,
}) => {
  const defaultDuration = (session?.durationMinutes || 25) * 60;
  const [mode, setMode] = useState<'work' | 'break'>('work');
  const [timeLeft, setTimeLeft] = useState(defaultDuration);
  const [isRunning, setIsRunning] = useState(false);
  const [ambientAudio, setAmbientAudio] = useState(false);
  const intervalRef = useRef<number | null>(null);

  // Sync session duration when opened
  useEffect(() => {
    if (session) {
      const secs = (session.durationMinutes || 25) * 60;
      setTimeLeft(secs);
      setMode('work');
      setIsRunning(false);
    }
  }, [session, isOpen]);

  // Timer loop
  useEffect(() => {
    if (isRunning) {
      intervalRef.current = window.setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            // Finished!
            playChimeSound();
            setIsRunning(false);
            if (ambientAudio) {
              stopAmbientNoise();
              setAmbientAudio(false);
            }
            if (mode === 'work' && session && onSessionCompleted) {
              onSessionCompleted(session.id);
            }
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    }

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isRunning, mode, session, onSessionCompleted, ambientAudio]);

  // Clean up ambient audio on unmount or close
  useEffect(() => {
    if (!isOpen && ambientAudio) {
      stopAmbientNoise();
      setAmbientAudio(false);
    }
  }, [isOpen, ambientAudio]);

  if (!isOpen) return null;

  const toggleTimer = () => {
    playTickSound();
    setIsRunning(!isRunning);
  };

  const resetTimer = () => {
    playTickSound();
    setIsRunning(false);
    const totalSecs = mode === 'work' ? (session?.durationMinutes || 25) * 60 : 5 * 60;
    setTimeLeft(totalSecs);
  };

  const toggleAmbientAudio = () => {
    if (ambientAudio) {
      stopAmbientNoise();
      setAmbientAudio(false);
    } else {
      startAmbientNoise(0.08);
      setAmbientAudio(true);
    }
  };

  const handleCompleteEarly = () => {
    playChimeSound();
    setIsRunning(false);
    if (ambientAudio) {
      stopAmbientNoise();
      setAmbientAudio(false);
    }
    if (session && onSessionCompleted) {
      onSessionCompleted(session.id);
    }
    onClose();
  };

  const totalTimeForMode = mode === 'work' ? (session?.durationMinutes || 25) * 60 : 5 * 60;
  const progressPercent = Math.min(100, Math.max(0, ((totalTimeForMode - timeLeft) / totalTimeForMode) * 100));

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  const formattedTime = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-slate-100 relative text-center">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Mode Selector */}
        <div className="inline-flex p-1 bg-slate-100 rounded-2xl mb-6">
          <button
            onClick={() => {
              setMode('work');
              setIsRunning(false);
              setTimeLeft((session?.durationMinutes || 25) * 60);
            }}
            className={`px-4 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
              mode === 'work' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Brain className="w-3.5 h-3.5" />
            Focus Session
          </button>
          <button
            onClick={() => {
              setMode('break');
              setIsRunning(false);
              setTimeLeft(5 * 60);
            }}
            className={`px-4 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
              mode === 'break' ? 'bg-emerald-600 text-white shadow-sm' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Coffee className="w-3.5 h-3.5" />
            Short Break (5m)
          </button>
        </div>

        {/* Session details */}
        {session && mode === 'work' ? (
          <div className="mb-4">
            <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200">
              {session.subjectName} • {session.difficulty} Difficulty
            </span>
            <h3 className="font-extrabold text-slate-900 text-lg sm:text-xl mt-2 line-clamp-1">
              {session.topic}
            </h3>
            <p className="text-xs text-slate-500 mt-1 flex items-center justify-center gap-1">
              <BookOpen className="w-3.5 h-3.5 text-indigo-500" />
              Technique: <strong>{session.technique}</strong>
            </p>
          </div>
        ) : (
          <div className="mb-4">
            <h3 className="font-extrabold text-slate-900 text-xl">
              {mode === 'break' ? 'Rest & Recharge ☕' : 'General Focus Block'}
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              {mode === 'break' ? 'Stand up, stretch, and hydrate before the next sprint.' : 'Eliminate phone distractions.'}
            </p>
          </div>
        )}

        {/* Circular / Large Timer Display */}
        <div className="my-6 relative flex flex-col items-center justify-center">
          <div className="w-56 h-56 rounded-full border-8 border-slate-100 flex flex-col items-center justify-center relative shadow-inner">
            {/* SVG Ring */}
            <svg className="absolute inset-0 w-full h-full -rotate-90">
              <circle
                cx="112"
                cy="112"
                r="104"
                stroke="currentColor"
                strokeWidth="8"
                fill="transparent"
                className={mode === 'work' ? 'text-indigo-600' : 'text-emerald-500'}
                strokeDasharray={2 * Math.PI * 104}
                strokeDashoffset={2 * Math.PI * 104 * (1 - progressPercent / 100)}
                strokeLinecap="round"
                style={{ transition: 'stroke-dashoffset 0.5s ease-in-out' }}
              />
            </svg>

            <span className="text-5xl font-black text-slate-900 tracking-tight font-mono">
              {formattedTime}
            </span>
            <span className="text-[11px] font-semibold text-slate-400 mt-1 uppercase tracking-wider">
              {isRunning ? 'Session Active' : 'Paused'}
            </span>
          </div>
        </div>

        {/* Timer Action Controls */}
        <div className="flex items-center justify-center gap-3 mb-6">
          <button
            onClick={resetTimer}
            className="p-3 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-2xl transition-colors"
            title="Reset timer"
          >
            <RotateCcw className="w-5 h-5" />
          </button>

          <button
            onClick={toggleTimer}
            className={`px-8 py-3.5 rounded-2xl font-bold text-white shadow-lg flex items-center gap-2 transition-transform hover:scale-105 active:scale-95 ${
              mode === 'work' ? 'bg-indigo-600 hover:bg-indigo-500 shadow-indigo-200' : 'bg-emerald-600 hover:bg-emerald-500 shadow-emerald-200'
            }`}
          >
            {isRunning ? (
              <>
                <Pause className="w-5 h-5" />
                <span>Pause</span>
              </>
            ) : (
              <>
                <Play className="w-5 h-5 fill-white" />
                <span>{timeLeft === totalTimeForMode ? 'Start Focus' : 'Resume'}</span>
              </>
            )}
          </button>

          {session && (
            <button
              onClick={handleCompleteEarly}
              className="p-3 text-emerald-600 hover:bg-emerald-50 rounded-2xl transition-colors border border-emerald-200/60"
              title="Mark session as completed now"
            >
              <CheckCircle className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Ambient Sound & Pro Tip footer */}
        <div className="flex items-center justify-between pt-4 border-t border-slate-100 text-xs text-slate-500">
          <button
            onClick={toggleAmbientAudio}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border font-medium transition-colors ${
              ambientAudio
                ? 'border-indigo-300 bg-indigo-50 text-indigo-700'
                : 'border-slate-200 hover:bg-slate-50 text-slate-600'
            }`}
          >
            {ambientAudio ? <Volume2 className="w-4 h-4 text-indigo-600 animate-pulse" /> : <VolumeX className="w-4 h-4" />}
            <span>{ambientAudio ? 'Ambient Rain (On)' : 'Soft Ambient Rain'}</span>
          </button>

          <div className="flex items-center gap-1 text-[11px] text-slate-400">
            <Sparkles className="w-3 h-3 text-amber-400" />
            <span>Chime rings when done</span>
          </div>
        </div>
      </div>
    </div>
  );
};

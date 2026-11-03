import React, { useState, useEffect } from 'react';
import { 
  X, 
  Clock, 
  Play, 
  Pause, 
  RotateCcw, 
  Sparkles, 
  Coffee, 
  Award,
  CheckCircle2,
  BookOpen
} from 'lucide-react';
import { Subject, StudySessionLog } from '../types';
import { playChime } from '../utils/audio';

interface FocusTimerModalProps {
  subjects: Subject[];
  isOpen: boolean;
  onClose: () => void;
  onLogStudySession: (session: StudySessionLog) => void;
  isRunning: boolean;
  setIsRunning: (running: boolean) => void;
  secondsRemaining: number;
  setSecondsRemaining: React.Dispatch<React.SetStateAction<number>>;
  totalDuration: number;
  setTotalDuration: (duration: number) => void;
}

export const FocusTimerModal: React.FC<FocusTimerModalProps> = ({
  subjects,
  isOpen,
  onClose,
  onLogStudySession,
  isRunning,
  setIsRunning,
  secondsRemaining,
  setSecondsRemaining,
  totalDuration,
  setTotalDuration,
}) => {
  const [selectedSubjectId, setSelectedSubjectId] = useState<string>(subjects[0]?.id || '');
  const [activeMode, setActiveMode] = useState<'pomodoro' | 'short_break' | 'section' | 'full_exam'>('pomodoro');

  const modes = [
    { id: 'pomodoro', name: '25m Focus', minutes: 25, type: 'pomodoro' as const },
    { id: 'short_break', name: '5m Break', minutes: 5, type: 'pomodoro' as const },
    { id: 'section', name: '45m Section Test', minutes: 45, type: 'revision' as const },
    { id: 'full_exam', name: '3h Mock Exam', minutes: 180, type: 'mock_exam' as const },
  ];

  const handleSelectMode = (mode: typeof modes[0]) => {
    setIsRunning(false);
    setActiveMode(mode.id as any);
    const secs = mode.minutes * 60;
    setTotalDuration(secs);
    setSecondsRemaining(secs);
  };

  const handleToggleTimer = () => {
    setIsRunning(!isRunning);
  };

  const handleResetTimer = () => {
    setIsRunning(false);
    setSecondsRemaining(totalDuration);
  };

  const handleFinishEarly = () => {
    const elapsedMinutes = Math.max(1, Math.round((totalDuration - secondsRemaining) / 60));
    const sub = subjects.find(s => s.id === selectedSubjectId) || subjects[0];
    
    onLogStudySession({
      id: `session-${Date.now()}`,
      subjectId: sub?.id || 'general',
      subjectName: sub?.name || 'Study Focus',
      minutes: elapsedMinutes,
      timestamp: new Date().toISOString(),
      type: activeMode === 'full_exam' ? 'mock_exam' : 'pomodoro',
    });

    playChime('complete');
    setIsRunning(false);
    setSecondsRemaining(totalDuration);
    onClose();
  };

  if (!isOpen) return null;

  const minutes = Math.floor(secondsRemaining / 60);
  const seconds = secondsRemaining % 60;
  const progressPct = totalDuration > 0 ? Math.round(((totalDuration - secondsRemaining) / totalDuration) * 100) : 0;

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/80 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
      <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl border border-slate-200 overflow-hidden text-center space-y-6 p-6 sm:p-8">
        
        {/* Modal Top */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <Clock className="w-4 h-4" />
            </div>
            <h2 className="text-base font-extrabold text-slate-900">Exam Study Focus Timer</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-700"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Mode Selector */}
        <div className="grid grid-cols-4 gap-1.5 bg-slate-100 p-1.5 rounded-2xl text-xs font-bold">
          {modes.map((m) => (
            <button
              key={m.id}
              onClick={() => handleSelectMode(m)}
              className={`py-2 rounded-xl transition-all ${
                activeMode === m.id
                  ? 'bg-white text-indigo-700 shadow-2xs font-extrabold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {m.name}
            </button>
          ))}
        </div>

        {/* Subject dropdown */}
        <div className="text-left space-y-1">
          <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wider">Subject you are studying:</label>
          <select
            value={selectedSubjectId}
            onChange={(e) => setSelectedSubjectId(e.target.value)}
            className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs sm:text-sm font-semibold focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
          >
            {subjects.map(s => (
              <option key={s.id} value={s.id}>{s.code}: {s.name}</option>
            ))}
          </select>
        </div>

        {/* Big Circular Clock Display */}
        <div className="relative w-56 h-56 mx-auto flex items-center justify-center">
          <svg className="w-full h-full transform -rotate-90">
            <circle
              cx="112"
              cy="112"
              r="96"
              stroke="#e2e8f0"
              strokeWidth="10"
              fill="transparent"
            />
            <circle
              cx="112"
              cy="112"
              r="96"
              stroke="#4f46e5"
              strokeWidth="10"
              strokeDasharray={2 * Math.PI * 96}
              strokeDashoffset={2 * Math.PI * 96 * (1 - progressPct / 100)}
              strokeLinecap="round"
              fill="transparent"
              className="transition-all duration-300"
            />
          </svg>

          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-4xl sm:text-5xl font-black font-mono text-slate-900 tracking-tight">
              {minutes}:{seconds < 10 ? '0' : ''}{seconds}
            </span>
            <span className="text-xs font-bold text-slate-700 mt-1 uppercase tracking-wider">
              {isRunning ? 'Session Active' : 'Paused'}
            </span>
          </div>
        </div>

        {/* Controls */}
        <div className="flex items-center justify-center gap-3">
          <button
            onClick={handleResetTimer}
            className="p-3 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors"
            title="Reset timer"
          >
            <RotateCcw className="w-5 h-5" />
          </button>

          <button
            onClick={handleToggleTimer}
            className="px-8 py-3.5 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-extrabold text-sm sm:text-base shadow-lg shadow-indigo-600/30 flex items-center gap-2 transition-all hover:scale-105"
          >
            {isRunning ? (
              <>
                <Pause className="w-5 h-5 fill-white" />
                <span>Pause</span>
              </>
            ) : (
              <>
                <Play className="w-5 h-5 fill-white" />
                <span>Start Focus</span>
              </>
            )}
          </button>

          <button
            onClick={handleFinishEarly}
            className="p-3 rounded-2xl bg-emerald-50 hover:bg-emerald-100 text-emerald-700 transition-colors"
            title="Complete & Log Session"
          >
            <CheckCircle2 className="w-5 h-5" />
          </button>
        </div>

        <p className="text-[11px] text-slate-700">
          Tip: Studying in 25-minute sprints improves long-term recall for technical definitions.
        </p>

      </div>
    </div>
  );
};

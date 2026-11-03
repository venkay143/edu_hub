import React, { useState, useEffect } from 'react';
import { 
  X, 
  Clock, 
  Printer, 
  Eye, 
  EyeOff, 
  CheckCircle2, 
  Award, 
  Play, 
  Pause, 
  RotateCcw,
  Sparkles,
  BookOpen,
  HelpCircle,
  FileText
} from 'lucide-react';
import { ModelPaper, Subject } from '../types';
import { playChime } from '../utils/audio';

interface PaperViewerModalProps {
  paper: ModelPaper;
  subject: Subject;
  isOpen: boolean;
  initialPracticeMode?: boolean;
  onClose: () => void;
  onSavePracticeScore: (paperId: string, score: number) => void;
}

export const PaperViewerModal: React.FC<PaperViewerModalProps> = ({
  paper,
  subject,
  isOpen,
  initialPracticeMode = false,
  onClose,
  onSavePracticeScore,
}) => {
  const [showAnswers, setShowAnswers] = useState(false);
  const [practiceActive, setPracticeActive] = useState(initialPracticeMode);
  const [secondsLeft, setSecondsLeft] = useState(paper.durationMinutes * 60);
  const [isTimerRunning, setIsTimerRunning] = useState(initialPracticeMode);
  const [scoreInput, setScoreInput] = useState(paper.practicedScore?.toString() || '');
  const [showScoreModal, setShowScoreModal] = useState(false);

  useEffect(() => {
    setPracticeActive(initialPracticeMode);
    setIsTimerRunning(initialPracticeMode);
    setSecondsLeft(paper.durationMinutes * 60);
  }, [initialPracticeMode, paper]);

  // Timer loop
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (isTimerRunning && secondsLeft > 0) {
      interval = setInterval(() => {
        setSecondsLeft(prev => {
          if (prev <= 1) {
            setIsTimerRunning(false);
            playChime('complete');
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isTimerRunning, secondsLeft]);

  if (!isOpen) return null;

  const formatTime = (totalSecs: number) => {
    const hours = Math.floor(totalSecs / 3600);
    const mins = Math.floor((totalSecs % 3600) / 60);
    const secs = totalSecs % 60;
    return `${hours > 0 ? `${hours}:` : ''}${mins < 10 ? '0' : ''}${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  const handlePrint = () => {
    window.print();
  };

  const handleScoreSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const num = parseInt(scoreInput, 10);
    if (!isNaN(num) && num >= 0 && num <= paper.totalMarks) {
      onSavePracticeScore(paper.id, num);
      setShowScoreModal(false);
      playChime('success');
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/80 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4 overflow-y-auto">
      <div className="relative bg-white w-full max-w-4xl rounded-3xl shadow-2xl border border-slate-200 overflow-hidden my-6 flex flex-col max-h-[92vh]">
        
        {/* Modal Top Bar */}
        <div className="p-4 sm:p-5 border-b border-slate-200 bg-slate-900 text-white flex items-center justify-between flex-wrap gap-3">
          <div className="space-y-0.5">
            <div className="flex items-center gap-2">
              <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-sm bg-indigo-500/20 text-indigo-300 border border-indigo-400/30">
                {paper.type === 'previous_year' ? 'Previous Examination Paper' : 'Model Examination Paper'}
              </span>
              <span className="text-xs font-mono text-slate-400">{paper.year}</span>
            </div>
            <h2 className="text-base sm:text-lg font-bold text-white line-clamp-1">
              {subject.code}: {paper.title}
            </h2>
          </div>

          <div className="flex items-center gap-2">
            {/* Practice Mode Timer Bar */}
            {practiceActive && (
              <div className="flex items-center gap-2 bg-slate-800 px-3 py-1.5 rounded-xl border border-slate-700">
                <Clock className="w-4 h-4 text-amber-400" />
                <span className="font-mono font-bold text-sm text-white">
                  {formatTime(secondsLeft)}
                </span>
                <button
                  onClick={() => setIsTimerRunning(!isTimerRunning)}
                  className="p-1 rounded-sm text-slate-300 hover:text-white"
                  title={isTimerRunning ? 'Pause timer' : 'Resume timer'}
                >
                  {isTimerRunning ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                </button>
                <button
                  onClick={() => {
                    setIsTimerRunning(false);
                    setSecondsLeft(paper.durationMinutes * 60);
                  }}
                  className="p-1 rounded-sm text-slate-300 hover:text-white"
                  title="Reset timer"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                </button>
              </div>
            )}

            <button
              onClick={() => setShowAnswers(!showAnswers)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold transition-colors"
              title="Show or hide solution hints and key formulas"
            >
              {showAnswers ? <EyeOff className="w-3.5 h-3.5 text-indigo-400" /> : <Eye className="w-3.5 h-3.5 text-indigo-400" />}
              <span className="hidden sm:inline">{showAnswers ? 'Hide Answers' : 'Show Answers'}</span>
            </button>

            <button
              onClick={handlePrint}
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 transition-colors"
              title="Print Question Paper"
            >
              <Printer className="w-4 h-4" />
            </button>

            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-slate-800 hover:bg-rose-900/60 text-slate-300 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Paper Content Body (Scrollable & Printable) */}
        <div className="flex-1 overflow-y-auto p-6 sm:p-8 space-y-6 print:p-0 print:overflow-visible">
          
          {/* University Style Paper Header */}
          <div className="text-center border-b-2 border-slate-900 pb-5 space-y-1">
            <h1 className="text-base sm:text-xl font-black uppercase tracking-wider text-slate-900">
              State Technical University End-Semester Examination
            </h1>
            <p className="text-xs sm:text-sm font-bold text-slate-700">
              {subject.name} ({subject.code})
            </p>
            <div className="flex items-center justify-between text-xs font-bold text-slate-800 pt-3 border-t border-slate-200 mt-2">
              <span>Time: 3 Hours</span>
              <span>Total Marks: {paper.totalMarks} Marks</span>
            </div>
            <p className="text-[11px] text-slate-500 italic pt-1">
              Instructions: Answer all questions in Part A. Answer any 5 questions in Part B. Diagrams must be neatly drawn.
            </p>
          </div>

          {/* Sections */}
          <div className="space-y-8">
            {paper.sections.map((section, sIdx) => (
              <div key={sIdx} className="space-y-4">
                <div className="bg-slate-100 p-3 rounded-xl border border-slate-200 flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-extrabold text-slate-900 uppercase tracking-wide">
                      {section.name}
                    </h3>
                    <p className="text-xs text-slate-600 font-medium">
                      {section.instruction}
                    </p>
                  </div>
                  <span className="text-xs font-bold font-mono px-2 py-1 rounded-md bg-white border border-slate-200 text-slate-800">
                    {section.totalMarks} Marks
                  </span>
                </div>

                <div className="space-y-4">
                  {section.questions.map((q, qIdx) => (
                    <div 
                      key={qIdx}
                      className="p-4 rounded-xl border border-slate-200/90 bg-white space-y-2 hover:border-slate-300 transition-colors"
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex items-start gap-2.5">
                          <span className="font-bold text-slate-900 text-sm font-mono shrink-0">
                            {q.questionNumber}.
                          </span>
                          <p className="text-sm font-semibold text-slate-800 leading-relaxed">
                            {q.text}
                          </p>
                        </div>
                        <div className="text-right shrink-0">
                          <span className="text-xs font-bold font-mono text-slate-700 bg-slate-100 px-2 py-0.5 rounded-md">
                            [{q.marks}M]
                          </span>
                          <span className="block text-[10px] text-slate-600 mt-0.5">
                            {q.unit}
                          </span>
                        </div>
                      </div>

                      {/* Optional Diagram Hint */}
                      {q.diagramHint && (
                        <div className="text-xs text-indigo-700 bg-indigo-50/70 p-2 rounded-lg border border-indigo-100">
                          ✏️ <span className="font-bold">Diagram Hint:</span> {q.diagramHint}
                        </div>
                      )}

                      {/* Optional Answer Key / Solution Hint */}
                      {showAnswers && q.answerKey && (
                        <div className="text-xs text-slate-700 bg-emerald-50/80 p-3 rounded-xl border border-emerald-200 space-y-1">
                          <span className="font-bold text-emerald-900 flex items-center gap-1">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                            Model Solution & Key Points:
                          </span>
                          <p className="font-mono text-[11px] leading-relaxed">
                            {q.answerKey}
                          </p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Self Scoring Button */}
          <div className="pt-4 border-t border-slate-200 flex items-center justify-between flex-wrap gap-3">
            <div className="text-xs text-slate-500">
              Completed practicing this paper? Log your test score to track exam readiness.
            </div>
            <button
              onClick={() => setShowScoreModal(true)}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md shadow-emerald-600/20"
            >
              <Award className="w-4 h-4" />
              <span>Record Practice Score</span>
            </button>
          </div>
        </div>

        {/* Self Score Recorder Modal Popup */}
        {showScoreModal && (
          <div className="absolute inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl p-6 max-w-sm w-full space-y-4 border border-slate-200 shadow-2xl">
              <h3 className="font-extrabold text-slate-900 text-base">Record Exam Practice Score</h3>
              <p className="text-xs text-slate-600">Enter your self-evaluated marks out of {paper.totalMarks}:</p>
              
              <form onSubmit={handleScoreSubmit} className="space-y-4">
                <div>
                  <input
                    type="number"
                    min="0"
                    max={paper.totalMarks}
                    value={scoreInput}
                    onChange={(e) => setScoreInput(e.target.value)}
                    placeholder="e.g. 84"
                    className="w-full text-center text-3xl font-black text-indigo-600 py-3 rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-indigo-500 font-mono"
                    autoFocus
                  />
                  <span className="text-[11px] text-slate-600 block text-center mt-1">out of {paper.totalMarks} total marks</span>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setShowScoreModal(false)}
                    className="px-3 py-2 rounded-xl bg-slate-100 text-slate-700 text-xs font-bold hover:bg-slate-200"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-3 py-2 rounded-xl bg-indigo-600 text-white text-xs font-bold hover:bg-indigo-700"
                  >
                    Save Score
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

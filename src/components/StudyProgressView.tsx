import React from 'react';
import { 
  ArrowLeft, 
  Award, 
  CheckCircle2, 
  Clock, 
  TrendingUp, 
  BookOpen, 
  FileCheck, 
  Calendar,
  Sparkles,
  Zap,
  BarChart2
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { Subject, CourseInfo, StudySessionLog } from '../types';

interface StudyProgressViewProps {
  courseInfo: CourseInfo;
  subjects: Subject[];
  studySessions: StudySessionLog[];
  onBackToDashboard: () => void;
  onSelectSubject: (subjectId: string, tab?: 'syllabus' | 'papers') => void;
}

export const StudyProgressView: React.FC<StudyProgressViewProps> = ({
  courseInfo,
  subjects,
  studySessions,
  onBackToDashboard,
  onSelectSubject,
}) => {
  // Aggregate stats
  const totalTopics = subjects.reduce((acc, sub) => acc + sub.units.reduce((uAcc, u) => uAcc + u.topics.length, 0), 0);
  const completedTopics = subjects.reduce((acc, sub) => acc + sub.units.reduce((uAcc, u) => uAcc + u.topics.filter(t => t.completed).length, 0), 0);
  const overallPercentage = totalTopics > 0 ? Math.round((completedTopics / totalTopics) * 100) : 0;

  const totalUnits = subjects.reduce((acc, sub) => acc + sub.units.length, 0);
  const completedUnits = subjects.reduce((acc, sub) => acc + sub.units.filter(u => u.topics.every(t => t.completed)).length, 0);

  // Practiced papers
  const practicedPapersList = subjects.flatMap(s => 
    s.papers.filter(p => p.isPracticed).map(p => ({
      ...p,
      subjectName: s.name,
      subjectCode: s.code,
      subjectId: s.id,
    }))
  );

  const totalStudyMinutes = studySessions.reduce((acc, s) => acc + s.minutes, 0);

  const triggerConfetti = () => {
    confetti({
      particleCount: 80,
      spread: 70,
      origin: { y: 0.6 },
    });
  };

  return (
    <div className="space-y-6 pb-16">
      {/* Top Header */}
      <div className="bg-white rounded-3xl border border-slate-200/90 p-5 sm:p-7 shadow-xs space-y-4">
        <button
          onClick={onBackToDashboard}
          className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-bold text-slate-600 hover:text-indigo-600 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Dashboard</span>
        </button>

        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold px-2.5 py-0.5 rounded-md bg-indigo-50 text-indigo-700">
                Performance & Analytics
              </span>
              <span className="text-xs text-slate-700 font-medium">Saved in LocalStorage</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight mt-1">
              Examination Preparation Tracker
            </h1>
            <p className="text-xs sm:text-sm text-slate-700">
              Real-time progress analytics across your syllabus units, mock exam scores, and focus revision sessions.
            </p>
          </div>

          <button
            onClick={triggerConfetti}
            className="px-4 py-2 rounded-xl bg-linear-to-r from-amber-400 to-orange-500 text-slate-950 font-extrabold text-xs shadow-md shadow-amber-400/20 flex items-center gap-1.5 hover:scale-105 active:scale-95 transition-all"
          >
            <Sparkles className="w-4 h-4" />
            <span>Celebrate Progress 🎉</span>
          </button>
        </div>
      </div>

      {/* 4 Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">Overall Readiness</span>
            <Award className="w-4 h-4 text-indigo-600" />
          </div>
          <p className="text-3xl font-black text-slate-900 mt-2">{overallPercentage}%</p>
          <p className="text-xs text-emerald-600 font-semibold mt-1">
            {completedTopics} of {totalTopics} topics
          </p>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">Units Mastered</span>
            <CheckCircle2 className="w-4 h-4 text-teal-600" />
          </div>
          <p className="text-3xl font-black text-slate-900 mt-2">{completedUnits} / {totalUnits}</p>
          <p className="text-xs text-slate-700 mt-1">100% completed units</p>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">Papers Practiced</span>
            <FileCheck className="w-4 h-4 text-amber-600" />
          </div>
          <p className="text-3xl font-black text-slate-900 mt-2">{practicedPapersList.length}</p>
          <p className="text-xs text-slate-700 mt-1">Full 3-hour mock exams</p>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">Focus Study Time</span>
            <Clock className="w-4 h-4 text-rose-600" />
          </div>
          <p className="text-3xl font-black text-slate-900 mt-2">{Math.round(totalStudyMinutes / 60)} hrs</p>
          <p className="text-xs text-slate-700 mt-1">{totalStudyMinutes} logged minutes</p>
        </div>
      </div>

      {/* Subject-Wise Syllabus Breakdown */}
      <div className="bg-white rounded-2xl border border-slate-200/90 p-5 sm:p-6 shadow-xs space-y-4">
        <h3 className="font-extrabold text-slate-900 text-base">5 Subjects Syllabus Preparation Breakdown</h3>

        <div className="space-y-4">
          {subjects.map((sub) => {
            const subTopics = sub.units.reduce((a, u) => a + u.topics.length, 0);
            const subCompleted = sub.units.reduce((a, u) => a + u.topics.filter(t => t.completed).length, 0);
            const pct = subTopics > 0 ? Math.round((subCompleted / subTopics) * 100) : 0;

            return (
              <div key={sub.id} className="p-4 rounded-xl border border-slate-200/80 bg-slate-50/50 space-y-3">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono font-bold px-2 py-0.5 rounded-md bg-slate-900 text-white">
                      {sub.code}
                    </span>
                    <h4 className="font-bold text-slate-900 text-sm sm:text-base">{sub.name}</h4>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="text-xs font-extrabold text-indigo-700 bg-indigo-50 px-2.5 py-1 rounded-md">
                      {pct}% Ready
                    </span>
                    <button
                      onClick={() => onSelectSubject(sub.id, 'syllabus')}
                      className="text-xs font-bold text-indigo-600 hover:text-indigo-800"
                    >
                      View Syllabus →
                    </button>
                  </div>
                </div>

                <div className="w-full h-2 rounded-full bg-slate-200 overflow-hidden">
                  <div 
                    className={`h-full rounded-full transition-all duration-500 ${
                      pct >= 75 ? 'bg-emerald-500' : pct >= 40 ? 'bg-indigo-500' : 'bg-amber-500'
                    }`}
                    style={{ width: `${pct}%` }}
                  />
                </div>

                {/* Individual 5 Units pills */}
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 pt-1">
                  {sub.units.map(unit => {
                    const uDone = unit.topics.every(t => t.completed);
                    const uCompCount = unit.topics.filter(t => t.completed).length;

                    return (
                      <div
                        key={unit.id}
                        className={`p-2 rounded-lg border text-center text-xs ${
                          uDone ? 'bg-emerald-50 border-emerald-300 text-emerald-800 font-bold' : 'bg-white border-slate-200 text-slate-700'
                        }`}
                      >
                        <span className="block font-semibold">Unit {unit.unitNumber}</span>
                        <span className="text-[10px] text-slate-700">{uCompCount}/{unit.topics.length} topics</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Practiced Question Papers Log */}
      <div className="bg-white rounded-2xl border border-slate-200/90 p-5 sm:p-6 shadow-xs space-y-4">
        <h3 className="font-extrabold text-slate-900 text-base">Practiced Examination Papers Log</h3>
        
        {practicedPapersList.length === 0 ? (
          <div className="text-center py-8 text-slate-500 space-y-2">
            <FileCheck className="w-8 h-8 text-slate-400 mx-auto" />
            <p className="text-sm font-semibold">No model papers recorded yet</p>
            <p className="text-xs text-slate-600">Open any subject, click on "Model Papers", and launch Practice Mode to simulate exam conditions.</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {practicedPapersList.map((paper) => (
              <div key={paper.id} className="py-3.5 flex items-center justify-between flex-wrap gap-2">
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono font-bold text-slate-700">{paper.subjectCode}</span>
                    <span className="text-sm font-bold text-slate-900">{paper.title}</span>
                  </div>
                  <p className="text-xs text-slate-700">Practiced on: {paper.practicedDate || 'Recent'} • 3 Hours Exam Simulation</p>
                </div>

                <div className="flex items-center gap-3">
                  <span className="text-sm font-mono font-black text-emerald-700 bg-emerald-50 border border-emerald-200 px-3 py-1 rounded-xl">
                    Score: {paper.practicedScore} / {paper.totalMarks}
                  </span>
                  <button
                    onClick={() => onSelectSubject(paper.subjectId, 'papers')}
                    className="text-xs font-bold text-indigo-600 hover:text-indigo-800"
                  >
                    Review Paper →
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
};

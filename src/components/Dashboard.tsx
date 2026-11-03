import React from 'react';
import { 
  BookOpen, 
  FileText, 
  BarChart3, 
  FolderDown, 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  Sparkles, 
  ArrowRight, 
  Plus, 
  Trash2, 
  Upload, 
  Target,
  FileCheck,
  ChevronRight,
  TrendingUp,
  BrainCircuit,
  Award
} from 'lucide-react';
import { Subject, CourseInfo, DailyGoal } from '../types';

interface DashboardProps {
  courseInfo: CourseInfo;
  subjects: Subject[];
  dailyGoals: DailyGoal[];
  onSelectSubject: (subjectId: string, initialTab?: 'syllabus' | 'papers' | 'analysis' | 'materials') => void;
  onToggleGoal: (goalId: string) => void;
  onAddGoal: (text: string) => void;
  onDeleteGoal: (goalId: string) => void;
  onOpenUploadModal: () => void;
  onOpenTimer: () => void;
}

export const Dashboard: React.FC<DashboardProps> = ({
  courseInfo,
  subjects,
  dailyGoals,
  onSelectSubject,
  onToggleGoal,
  onAddGoal,
  onDeleteGoal,
  onOpenUploadModal,
  onOpenTimer,
}) => {
  const [newGoalText, setNewGoalText] = React.useState('');

  // Overall statistics calculation
  const totalUnits = subjects.reduce((acc, sub) => acc + sub.units.length, 0);
  const totalTopics = subjects.reduce((acc, sub) => acc + sub.units.reduce((uAcc, u) => uAcc + u.topics.length, 0), 0);
  const completedTopics = subjects.reduce((acc, sub) => acc + sub.units.reduce((uAcc, u) => uAcc + u.topics.filter(t => t.completed).length, 0), 0);
  const completedUnits = subjects.reduce((acc, sub) => acc + sub.units.filter(u => u.topics.every(t => t.completed)).length, 0);
  
  const overallPercentage = totalTopics > 0 ? Math.round((completedTopics / totalTopics) * 100) : 0;
  
  const totalPapers = subjects.reduce((acc, sub) => acc + sub.papers.length, 0);
  const practicedPapers = subjects.reduce((acc, sub) => acc + sub.papers.filter(p => p.isPracticed).length, 0);

  // Calculate days left
  const examDate = new Date(courseInfo.examStartDate).getTime();
  const now = new Date().getTime();
  const daysLeft = Math.max(0, Math.ceil((examDate - now) / (1000 * 60 * 60 * 24)));

  const handleCreateGoal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newGoalText.trim()) return;
    onAddGoal(newGoalText.trim());
    setNewGoalText('');
  };

  return (
    <div className="space-y-8 pb-12">
      {/* Top Banner / Hero */}
      <section className="relative overflow-hidden rounded-3xl bg-linear-to-br from-slate-900 via-indigo-950 to-slate-900 text-white p-6 sm:p-8 lg:p-10 shadow-xl border border-slate-800">
        <div className="absolute top-0 right-0 -mt-12 -mr-12 w-96 h-96 bg-indigo-500/20 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute bottom-0 left-1/3 -mb-12 w-64 h-64 bg-teal-500/15 rounded-full blur-2xl pointer-events-none"></div>

        <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          <div className="lg:col-span-8 space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/20 border border-indigo-400/30 text-indigo-300 text-xs font-semibold">
              <Sparkles className="w-3.5 h-3.5" />
              <span>{courseInfo.universityName} • {courseInfo.semester}</span>
            </div>

            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight text-white">
              Smart Education Hub <span className="text-indigo-400">Exam Portal</span>
            </h1>

            <p className="text-slate-300 text-sm sm:text-base max-w-2xl leading-relaxed">
              Your centralized offline-ready preparation workspace. Master all 5 subjects with structured unit checklists, model question paper analysis, verified faculty notes, and targeted high-yield revision.
            </p>

            {/* Quick Action buttons */}
            <div className="flex flex-wrap items-center gap-3 pt-2">
              <button
                onClick={onOpenUploadModal}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs sm:text-sm shadow-lg shadow-indigo-600/30 transition-all hover:scale-[1.02] active:scale-[0.98]"
              >
                <Upload className="w-4 h-4" />
                <span>Upload Notes / Question Paper</span>
              </button>

              <button
                onClick={onOpenTimer}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-200 border border-slate-700 font-semibold text-xs sm:text-sm transition-all"
              >
                <Clock className="w-4 h-4 text-amber-400" />
                <span>Start Focus Exam Timer</span>
              </button>
            </div>
          </div>

          {/* Right Hero Widget: Exam Countdown & Readiness */}
          <div className="lg:col-span-4 bg-slate-800/60 backdrop-blur-md rounded-2xl p-5 border border-slate-700/60 text-center space-y-4">
            <div>
              <p className="text-xs uppercase tracking-wider text-slate-400 font-bold">Examination Countdown</p>
              <div className="flex items-baseline justify-center gap-2 mt-1">
                <span className="text-4xl sm:text-5xl font-black text-amber-400 font-mono tracking-tight">{daysLeft}</span>
                <span className="text-slate-300 font-bold text-sm">Days Left</span>
              </div>
              <p className="text-xs text-slate-400 mt-1">
                Exam starts: <span className="text-slate-200 font-semibold">{courseInfo.examStartDate}</span>
              </p>
            </div>

            <div className="pt-3 border-t border-slate-700/60 text-left">
              <div className="flex items-center justify-between text-xs mb-1.5 font-bold">
                <span className="text-slate-300 flex items-center gap-1.5">
                  <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />
                  Syllabus Mastery
                </span>
                <span className="text-emerald-400">{overallPercentage}%</span>
              </div>
              <div className="w-full h-2.5 rounded-full bg-slate-700 overflow-hidden">
                <div 
                  className="h-full bg-linear-to-r from-teal-400 to-indigo-400 rounded-full transition-all duration-700"
                  style={{ width: `${overallPercentage}%` }}
                />
              </div>
              <p className="text-[11px] text-slate-400 mt-2 text-center">
                {completedTopics} of {totalTopics} syllabus topics completed
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Key Metric Cards */}
      <section className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/80 shadow-xs hover:border-slate-300 transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Readiness Score</span>
            <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <Award className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-extrabold text-slate-900">{overallPercentage}%</span>
            <span className="text-xs text-emerald-600 font-semibold">Active Prep</span>
          </div>
          <p className="text-xs text-slate-700 mt-1">Across 5 subjects</p>
        </div>

        <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/80 shadow-xs hover:border-slate-300 transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Units Mastered</span>
            <div className="w-8 h-8 rounded-lg bg-teal-50 text-teal-600 flex items-center justify-center">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-extrabold text-slate-900">{completedUnits}</span>
            <span className="text-xs text-slate-700 font-medium">/ {totalUnits} Units</span>
          </div>
          <p className="text-xs text-slate-700 mt-1">Complete unit checklists</p>
        </div>

        <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/80 shadow-xs hover:border-slate-300 transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Model Papers</span>
            <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
              <FileCheck className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-extrabold text-slate-900">{practicedPapers}</span>
            <span className="text-xs text-slate-700 font-medium">/ {totalPapers} Practiced</span>
          </div>
          <p className="text-xs text-slate-700 mt-1">Previous years + models</p>
        </div>

        <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/80 shadow-xs hover:border-slate-300 transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">High-Yield Questions</span>
            <div className="w-8 h-8 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center">
              <Target className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-extrabold text-slate-900">22</span>
            <span className="text-xs text-rose-600 font-semibold">Priority</span>
          </div>
          <p className="text-xs text-slate-700 mt-1">Appeared in 4+ exams</p>
        </div>
      </section>

      {/* Five Subjects Section */}
      <section className="space-y-4">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div>
            <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
              Semester Examination Subjects
            </h2>
            <p className="text-xs sm:text-sm text-slate-700">
              Select any of your 5 subjects to access complete syllabuses, papers, question frequency analytics, and faculty notes.
            </p>
          </div>
          <span className="text-xs font-bold px-3 py-1 bg-indigo-50 text-indigo-700 rounded-full border border-indigo-200">
            5 Dedicated Subjects
          </span>
        </div>

        {/* 5 Subject Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {subjects.map((sub, idx) => {
            const subTopics = sub.units.reduce((acc, u) => acc + u.topics.length, 0);
            const subCompleted = sub.units.reduce((acc, u) => acc + u.topics.filter(t => t.completed).length, 0);
            const pct = subTopics > 0 ? Math.round((subCompleted / subTopics) * 100) : 0;
            const subPracticed = sub.papers.filter(p => p.isPracticed).length;

            return (
              <div 
                key={sub.id} 
                className="group bg-white rounded-2xl border border-slate-200/90 hover:border-indigo-300 shadow-xs hover:shadow-md transition-all duration-200 flex flex-col justify-between overflow-hidden"
              >
                {/* Subject Header */}
                <div className="p-5 space-y-3">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-2.5">
                      <div className="w-9 h-9 rounded-xl bg-slate-900 text-white font-black text-sm flex items-center justify-center shrink-0">
                        {idx + 1}
                      </div>
                      <div>
                        <span className="text-[11px] font-bold font-mono px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 border border-slate-200">
                          {sub.code}
                        </span>
                        <span className="text-[11px] text-slate-700 ml-2 font-medium">
                          {sub.credits} Credits
                        </span>
                      </div>
                    </div>
                    <span className={`text-xs font-extrabold px-2 py-1 rounded-lg ${
                      pct >= 70 ? 'bg-emerald-50 text-emerald-700' : pct >= 30 ? 'bg-amber-50 text-amber-700' : 'bg-slate-100 text-slate-600'
                    }`}>
                      {pct}% Ready
                    </span>
                  </div>

                  <div>
                    <h3 
                      onClick={() => onSelectSubject(sub.id)}
                      className="text-base sm:text-lg font-bold text-slate-900 group-hover:text-indigo-600 transition-colors cursor-pointer leading-snug line-clamp-1"
                    >
                      {sub.name}
                    </h3>
                    <p className="text-xs text-slate-700 line-clamp-1 mt-0.5 font-medium">
                      {sub.facultyName}
                    </p>
                  </div>

                  {/* Progress Bar */}
                  <div className="space-y-1 pt-1">
                    <div className="flex justify-between text-xs text-slate-700 font-medium">
                      <span>Syllabus Covered</span>
                      <span>{subCompleted} / {subTopics} topics</span>
                    </div>
                    <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden">
                      <div 
                        className={`h-full rounded-full transition-all duration-500 ${
                          pct >= 75 ? 'bg-emerald-500' : pct >= 40 ? 'bg-indigo-500' : 'bg-amber-500'
                        }`}
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>

                  {/* Quick Summary Pill */}
                  <div className="pt-2 flex items-center gap-2 text-xs text-slate-600 font-medium">
                    <span className="inline-flex items-center gap-1">
                      <FileText className="w-3.5 h-3.5 text-slate-400" />
                      {sub.papers.length} Papers ({subPracticed} done)
                    </span>
                    <span>•</span>
                    <span className="inline-flex items-center gap-1">
                      <FolderDown className="w-3.5 h-3.5 text-slate-400" />
                      {sub.materials.length} Notes
                    </span>
                  </div>
                </div>

                {/* Card Sub-Navigation Footer Buttons */}
                <div className="grid grid-cols-4 border-t border-slate-100 bg-slate-50/70 text-xs font-semibold text-slate-600 divide-x divide-slate-100">
                  <button
                    onClick={() => onSelectSubject(sub.id, 'syllabus')}
                    className="py-2.5 px-1 hover:bg-indigo-50 hover:text-indigo-600 transition-colors flex flex-col items-center gap-0.5"
                    title="View Syllabus & Units"
                  >
                    <BookOpen className="w-3.5 h-3.5" />
                    <span className="text-[10px]">Syllabus</span>
                  </button>
                  <button
                    onClick={() => onSelectSubject(sub.id, 'papers')}
                    className="py-2.5 px-1 hover:bg-indigo-50 hover:text-indigo-600 transition-colors flex flex-col items-center gap-0.5"
                    title="Model & Previous Papers"
                  >
                    <FileText className="w-3.5 h-3.5" />
                    <span className="text-[10px]">Papers</span>
                  </button>
                  <button
                    onClick={() => onSelectSubject(sub.id, 'analysis')}
                    className="py-2.5 px-1 hover:bg-indigo-50 hover:text-indigo-600 transition-colors flex flex-col items-center gap-0.5"
                    title="Repeated Questions Analysis"
                  >
                    <BarChart3 className="w-3.5 h-3.5" />
                    <span className="text-[10px]">Analysis</span>
                  </button>
                  <button
                    onClick={() => onSelectSubject(sub.id, 'materials')}
                    className="py-2.5 px-1 hover:bg-indigo-50 hover:text-indigo-600 transition-colors flex flex-col items-center gap-0.5"
                    title="Faculty Materials & PDFs"
                  >
                    <FolderDown className="w-3.5 h-3.5" />
                    <span className="text-[10px]">Notes</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Two-Column Lower Section: High-Yield Revision Hotlist & Daily Study Planner */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left (7 cols): High-Yield Priority Revision Hotlist */}
        <div className="lg:col-span-7 bg-white rounded-2xl border border-slate-200/90 p-5 sm:p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center">
                <BrainCircuit className="w-4 h-4" />
              </div>
              <div>
                <h3 className="font-extrabold text-slate-900 text-base">High-Yield Exam Focus Hotlist</h3>
                <p className="text-xs text-slate-700">Top repeated 16-mark essay questions identified across university papers</p>
              </div>
            </div>
            <span className="hidden sm:inline-block text-[11px] font-bold text-rose-600 bg-rose-50 px-2 py-0.5 rounded-md border border-rose-200">
              Exam Priority 1
            </span>
          </div>

          <div className="space-y-3">
            {subjects.flatMap(s => s.analysis.frequentlyRepeatedQuestions.slice(0, 1).map(q => ({ ...q, subjectName: s.name, subjectId: s.id }))).slice(0, 4).map((q) => (
              <div 
                key={q.id}
                onClick={() => onSelectSubject(q.subjectId, 'analysis')}
                className="group p-3.5 rounded-xl border border-slate-200 hover:border-indigo-300 hover:bg-slate-50/70 transition-all cursor-pointer flex items-start justify-between gap-3"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-[11px] font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-md">
                      {q.subjectName}
                    </span>
                    <span className="text-[11px] font-semibold text-slate-700">
                      {q.unitTitle.split(':')[0]}
                    </span>
                    <span className="text-[10px] font-bold text-amber-900 bg-amber-50 px-1.5 py-0.5 rounded-sm border border-amber-200">
                      Repeated {q.timesRepeated}x ({q.years.slice(0, 3).join(', ')})
                    </span>
                  </div>
                  <p className="text-sm font-semibold text-slate-800 group-hover:text-indigo-600 transition-colors line-clamp-1">
                    {q.text}
                  </p>
                  <p className="text-xs text-slate-700 line-clamp-1">
                    💡 {q.answerSummary}
                  </p>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-indigo-600 group-hover:translate-x-0.5 transition-all shrink-0 mt-2" />
              </div>
            ))}
          </div>
        </div>

        {/* Right (5 cols): Today's Study Targets / Planner */}
        <div className="lg:col-span-5 bg-white rounded-2xl border border-slate-200/90 p-5 sm:p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-teal-50 text-teal-600 flex items-center justify-center">
                <Target className="w-4 h-4" />
              </div>
              <div>
                <h3 className="font-extrabold text-slate-900 text-base">Today's Study Targets</h3>
                <p className="text-xs text-slate-700">Keep your revision streak consistent</p>
              </div>
            </div>
            <span className="text-xs font-bold text-teal-700 bg-teal-50 px-2 py-0.5 rounded-md">
              {dailyGoals.filter(g => g.completed).length} / {dailyGoals.length} Done
            </span>
          </div>

          {/* Add Goal Input */}
          <form onSubmit={handleCreateGoal} className="flex gap-2">
            <input
              type="text"
              value={newGoalText}
              onChange={(e) => setNewGoalText(e.target.value)}
              placeholder="Add revision task (e.g. Dijkstra proof)..."
              className="flex-1 text-xs sm:text-sm px-3 py-2 rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            />
            <button
              type="submit"
              className="px-3 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold shrink-0 transition-colors flex items-center gap-1"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add</span>
            </button>
          </form>

          {/* Goals Checklist */}
          <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
            {dailyGoals.length === 0 ? (
              <p className="text-xs text-slate-700 text-center py-6">No active targets. Add a target to stay focused!</p>
            ) : (
              dailyGoals.map((goal) => (
                <div
                  key={goal.id}
                  className={`flex items-center justify-between gap-2 p-2.5 rounded-xl border transition-all ${
                    goal.completed
                      ? 'bg-emerald-50/60 border-emerald-200 text-slate-500'
                      : 'bg-slate-50 border-slate-200 text-slate-800'
                  }`}
                >
                  <label className="flex items-center gap-2.5 flex-1 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={goal.completed}
                      onChange={() => onToggleGoal(goal.id)}
                      className="w-4 h-4 rounded-sm text-indigo-600 focus:ring-indigo-500 border-slate-300"
                    />
                    <span className={`text-xs font-medium ${goal.completed ? 'line-through text-slate-600' : ''}`}>
                      {goal.text}
                    </span>
                  </label>
                  <button
                    onClick={() => onDeleteGoal(goal.id)}
                    className="text-slate-400 hover:text-rose-500 p-1 rounded-sm transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))
            )}
          </div>
        </div>

      </section>
    </div>
  );
};

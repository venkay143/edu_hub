import React, { useState } from 'react';
import { 
  BookOpen, 
  FileText, 
  BarChart3, 
  FolderDown, 
  CheckCircle2, 
  Clock, 
  Upload, 
  Target, 
  FileCheck, 
  ChevronRight, 
  Award, 
  ExternalLink, 
  Plus, 
  Trash2,
  Calendar
} from 'lucide-react';
import { Subject, CourseInfo, DailyGoal, StudentUser } from '../types';

interface DashboardProps {
  courseInfo: CourseInfo;
  subjects: Subject[];
  dailyGoals: DailyGoal[];
  currentStudent?: StudentUser | null;
  onSelectSubject: (subjectId: string, initialTab?: 'syllabus' | 'papers' | 'analysis' | 'materials') => void;
  onToggleGoal: (goalId: string) => void;
  onAddGoal: (text: string) => void;
  onDeleteGoal: (goalId: string) => void;
  onOpenUploadModal: () => void;
  onOpenTimer: () => void;
  onOpenOfficialPdf: () => void;
}

export const Dashboard: React.FC<DashboardProps> = ({
  courseInfo,
  subjects,
  dailyGoals,
  currentStudent,
  onSelectSubject,
  onToggleGoal,
  onAddGoal,
  onDeleteGoal,
  onOpenUploadModal,
  onOpenTimer,
  onOpenOfficialPdf,
}) => {
  const [newGoalText, setNewGoalText] = useState('');
  const [subjectCategoryFilter, setSubjectCategoryFilter] = useState<'core' | 'all' | 'elective' | 'skill'>('core');

  // Overall statistics
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

  const filteredSubjects = subjects.filter(sub => {
    if (subjectCategoryFilter === 'all') return true;
    if (subjectCategoryFilter === 'core') return sub.category === 'theory' || sub.id === 'csm3105';
    if (subjectCategoryFilter === 'elective') return sub.category === 'elective';
    if (subjectCategoryFilter === 'skill') return sub.category === 'skill' || sub.category === 'honors';
    return true;
  });

  return (
    <div className="space-y-6 pb-16 text-slate-800">
      
      {/* 1. Clean Academic Header Card */}
      <section className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-7 shadow-xs">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-xs font-semibold text-slate-700 flex-wrap">
              <span>Gayatri Vidya Parishad College (Autonomous)</span>
              <span>•</span>
              <span className="text-indigo-600 font-bold">R-22 Regulation</span>
              <span>•</span>
              <span>III Year – I Semester</span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
              B.Tech CSE (AI & ML) Semester Examination Hub
            </h1>

            <p className="text-xs sm:text-sm text-slate-700 max-w-2xl leading-relaxed">
              Complete semester syllabus (Pages 81–114), model question papers, repeated question analysis, and faculty notes.
            </p>

            {currentStudent && (
              <div className="pt-1 flex items-center gap-2 text-xs text-slate-700">
                <span className="font-semibold text-slate-700">Active Student:</span>
                <span className="font-bold text-slate-900 font-mono">{currentStudent.rollNumber}</span>
                <span>({currentStudent.name} • {currentStudent.section})</span>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center gap-2.5 shrink-0">
            <button
              onClick={onOpenOfficialPdf}
              className="px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs transition-colors flex items-center gap-2 shadow-xs cursor-pointer"
            >
              <FileText className="w-4 h-4" />
              <span>Official Syllabus PDF (p.81–114)</span>
            </button>

            <button
              onClick={onOpenTimer}
              className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs transition-colors flex items-center gap-2 cursor-pointer"
            >
              <Clock className="w-4 h-4 text-indigo-600" />
              <span>Study Focus Timer</span>
            </button>

            <button
              onClick={onOpenUploadModal}
              className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs transition-colors flex items-center gap-2 cursor-pointer"
            >
              <Upload className="w-4 h-4 text-slate-600" />
              <span>Upload Notes</span>
            </button>
          </div>
        </div>
      </section>

      {/* 2. Key Metrics Summary Grid */}
      <section className="grid grid-cols-2 md:grid-cols-4 gap-3.5 sm:gap-4">
        <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-xs text-slate-700">
            <span className="font-medium">Syllabus Covered</span>
            <Award className="w-4 h-4 text-indigo-600" />
          </div>
          <div className="mt-1 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-slate-900">{overallPercentage}%</span>
            <span className="text-xs text-slate-700">completed</span>
          </div>
          <div className="w-full h-1.5 rounded-full bg-slate-100 mt-2 overflow-hidden">
            <div 
              className="h-full bg-indigo-600 rounded-full transition-all duration-300"
              style={{ width: `${overallPercentage}%` }}
            />
          </div>
        </div>

        <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-xs text-slate-700">
            <span className="font-medium">Topics Revised</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="mt-1 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-slate-900">{completedTopics}</span>
            <span className="text-xs text-slate-700">/ {totalTopics} total</span>
          </div>
          <p className="text-[11px] text-slate-700 mt-2">
            {completedUnits} of {totalUnits} units 100% complete
          </p>
        </div>

        <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-xs text-slate-700">
            <span className="font-medium">Model Question Papers</span>
            <FileCheck className="w-4 h-4 text-amber-600" />
          </div>
          <div className="mt-1 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-slate-900">{practicedPapers}</span>
            <span className="text-xs text-slate-700">/ {totalPapers} practiced</span>
          </div>
          <p className="text-[11px] text-slate-700 mt-2">
            Autonomous 70-mark format
          </p>
        </div>

        <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-xs text-slate-700">
            <span className="font-medium">Examination Target</span>
            <Calendar className="w-4 h-4 text-rose-600" />
          </div>
          <div className="mt-1 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-slate-900">{daysLeft}</span>
            <span className="text-xs text-slate-700">days left</span>
          </div>
          <p className="text-[11px] text-slate-700 mt-2">
            Target: {courseInfo.examStartDate}
          </p>
        </div>
      </section>

      {/* 3. Subjects Section */}
      <section className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 pb-3">
          <div>
            <h2 className="text-lg sm:text-xl font-bold text-slate-900">
              Semester Examination Courses
            </h2>
            <p className="text-xs text-slate-700">
              Select a subject to view its 5 units, model papers, high-yield questions, or notes.
            </p>
          </div>

          {/* Simple Segmented Category Filter */}
          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl text-xs font-semibold">
            <button
              onClick={() => setSubjectCategoryFilter('core')}
              className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
                subjectCategoryFilter === 'core' 
                  ? 'bg-white text-indigo-700 shadow-xs font-bold' 
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              5 Core Theory
            </button>
            <button
              onClick={() => setSubjectCategoryFilter('elective')}
              className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
                subjectCategoryFilter === 'elective' 
                  ? 'bg-white text-indigo-700 shadow-xs font-bold' 
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Elective Tracks
            </button>
            <button
              onClick={() => setSubjectCategoryFilter('skill')}
              className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
                subjectCategoryFilter === 'skill' 
                  ? 'bg-white text-indigo-700 shadow-xs font-bold' 
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Labs & Skills
            </button>
            <button
              onClick={() => setSubjectCategoryFilter('all')}
              className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
                subjectCategoryFilter === 'all' 
                  ? 'bg-white text-indigo-700 shadow-xs font-bold' 
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              All ({subjects.length})
            </button>
          </div>
        </div>

        {/* Subjects Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredSubjects.map((sub) => {
            const subTopics = sub.units.reduce((acc, u) => acc + u.topics.length, 0);
            const subCompleted = sub.units.reduce((acc, u) => acc + u.topics.filter(t => t.completed).length, 0);
            const pct = subTopics > 0 ? Math.round((subCompleted / subTopics) * 100) : 0;
            const subPracticed = sub.papers.filter(p => p.isPracticed).length;

            return (
              <div 
                key={sub.id} 
                className="bg-white rounded-2xl border border-slate-200 hover:border-slate-300 transition-all shadow-xs flex flex-col justify-between overflow-hidden"
              >
                <div className="p-5 space-y-3">
                  {/* Subject Header */}
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-xs px-2 py-0.5 rounded-md bg-slate-100 text-slate-800">
                          {sub.code}
                        </span>
                        <span className="text-xs text-slate-700 font-medium">
                          {sub.credits} Credits • 5 Units
                        </span>
                      </div>
                      {sub.pdfPages && (
                        <span className="text-[11px] text-indigo-700 font-medium block mt-1">
                          PDF {sub.pdfPages}
                        </span>
                      )}
                    </div>

                    <span className={`text-xs font-bold px-2 py-0.5 rounded-md ${
                      pct >= 70 ? 'bg-emerald-50 text-emerald-800' : pct >= 30 ? 'bg-amber-50 text-amber-800' : 'bg-slate-100 text-slate-700'
                    }`}>
                      {pct}% Ready
                    </span>
                  </div>

                  {/* Subject Name */}
                  <div>
                    <h3 
                      onClick={() => onSelectSubject(sub.id)}
                      className="text-base font-bold text-slate-900 hover:text-indigo-600 transition-colors cursor-pointer leading-snug"
                    >
                      {sub.name}
                    </h3>
                    <p className="text-xs text-slate-700 mt-0.5">
                      {sub.facultyName}
                    </p>
                  </div>

                  {/* Progress Bar */}
                  <div className="space-y-1 pt-1">
                    <div className="flex justify-between text-xs text-slate-700">
                      <span>Syllabus Progress</span>
                      <span>{subCompleted} / {subTopics} topics</span>
                    </div>
                    <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden">
                      <div 
                        className={`h-full rounded-full transition-all duration-300 ${
                          pct >= 75 ? 'bg-emerald-500' : pct >= 40 ? 'bg-indigo-600' : 'bg-amber-500'
                        }`}
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>

                  {/* Summary info */}
                  <div className="text-xs text-slate-700 flex items-center gap-2 pt-1">
                    <span>{sub.papers.length} Papers ({subPracticed} practiced)</span>
                    <span>•</span>
                    <span>{sub.materials.length} Faculty Notes</span>
                  </div>
                </div>

                {/* 4 Clean Button Actions */}
                <div className="grid grid-cols-4 border-t border-slate-100 bg-slate-50 text-xs font-semibold text-slate-700 divide-x divide-slate-100">
                  <button
                    onClick={() => onSelectSubject(sub.id, 'syllabus')}
                    className="py-2.5 px-1 hover:bg-white hover:text-indigo-700 transition-colors flex flex-col items-center gap-0.5 cursor-pointer"
                    title="View 5 Units & Syllabus"
                  >
                    <BookOpen className="w-3.5 h-3.5 text-indigo-600" />
                    <span className="text-[11px]">Syllabus</span>
                  </button>
                  <button
                    onClick={() => onSelectSubject(sub.id, 'papers')}
                    className="py-2.5 px-1 hover:bg-white hover:text-indigo-700 transition-colors flex flex-col items-center gap-0.5 cursor-pointer"
                    title="View Model Question Papers"
                  >
                    <FileText className="w-3.5 h-3.5 text-indigo-600" />
                    <span className="text-[11px]">Papers</span>
                  </button>
                  <button
                    onClick={() => onSelectSubject(sub.id, 'analysis')}
                    className="py-2.5 px-1 hover:bg-white hover:text-indigo-700 transition-colors flex flex-col items-center gap-0.5 cursor-pointer"
                    title="Repeated Exam Questions"
                  >
                    <BarChart3 className="w-3.5 h-3.5 text-indigo-600" />
                    <span className="text-[11px]">Analysis</span>
                  </button>
                  <button
                    onClick={() => onSelectSubject(sub.id, 'materials')}
                    className="py-2.5 px-1 hover:bg-white hover:text-indigo-700 transition-colors flex flex-col items-center gap-0.5 cursor-pointer"
                    title="Faculty Lecture Notes & PDFs"
                  >
                    <FolderDown className="w-3.5 h-3.5 text-indigo-600" />
                    <span className="text-[11px]">Notes</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* 4. Lower Section: High-Yield Questions Hotlist & Daily Targets */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left: Repeated Questions Hotlist */}
        <div className="lg:col-span-7 bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-slate-900 text-base">Frequently Repeated Exam Questions</h3>
              <p className="text-xs text-slate-700">Top high-yield questions appearing across previous examinations</p>
            </div>
            <span className="text-xs font-semibold text-rose-800 bg-rose-50 px-2 py-0.5 rounded-md border border-rose-200">
              Exam Priority
            </span>
          </div>

          <div className="space-y-2.5">
            {subjects.flatMap(s => s.analysis.frequentlyRepeatedQuestions.slice(0, 1).map(q => ({ ...q, subjectName: s.name, subjectId: s.id }))).slice(0, 4).map((q) => (
              <div 
                key={q.id}
                onClick={() => onSelectSubject(q.subjectId, 'analysis')}
                className="p-3.5 rounded-xl border border-slate-200 hover:border-indigo-300 hover:bg-indigo-50/20 transition-all cursor-pointer flex items-start justify-between gap-3 group"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-[11px] font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-md">
                      {q.subjectName}
                    </span>
                    <span className="text-[11px] text-slate-700">
                      {q.unitTitle.split(':')[0]}
                    </span>
                    <span className="text-[10px] font-bold text-amber-900 bg-amber-50 px-1.5 py-0.5 rounded-sm border border-amber-200">
                      Repeated {q.timesRepeated}x ({q.years.slice(0, 3).join(', ')})
                    </span>
                  </div>
                  <p className="text-xs sm:text-sm font-semibold text-slate-800 group-hover:text-indigo-600 transition-colors">
                    {q.text}
                  </p>
                  <p className="text-xs text-slate-700">
                    Key Answer: {q.answerSummary}
                  </p>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-indigo-600 shrink-0 mt-2" />
              </div>
            ))}
          </div>
        </div>

        {/* Right: Daily Targets Planner */}
        <div className="lg:col-span-5 bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-slate-900 text-base">Daily Study Targets</h3>
              <p className="text-xs text-slate-700">Track your daily syllabus goals</p>
            </div>
            <span className="text-xs font-semibold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
              {dailyGoals.filter(g => g.completed).length} / {dailyGoals.length} Done
            </span>
          </div>

          {/* Add Goal Input */}
          <form onSubmit={handleCreateGoal} className="flex gap-2">
            <input
              type="text"
              value={newGoalText}
              onChange={(e) => setNewGoalText(e.target.value)}
              placeholder="e.g. Apriori algorithm numericals..."
              className="flex-1 text-xs sm:text-sm px-3 py-2 rounded-xl border border-slate-300 text-slate-900 placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-indigo-600"
            />
            <button
              type="submit"
              className="px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold shrink-0 transition-colors cursor-pointer flex items-center gap-1"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add</span>
            </button>
          </form>

          {/* Goals Checklist */}
          <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
            {dailyGoals.length === 0 ? (
              <p className="text-xs text-slate-700 text-center py-6">No targets added yet. Add a study goal above!</p>
            ) : (
              dailyGoals.map((goal) => (
                <div
                  key={goal.id}
                  className={`flex items-center justify-between gap-2 p-2.5 rounded-xl border transition-all ${
                    goal.completed
                      ? 'bg-slate-50 border-slate-200 text-slate-600'
                      : 'bg-white border-slate-200 text-slate-800'
                  }`}
                >
                  <label className="flex items-center gap-2.5 flex-1 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={goal.completed}
                      onChange={() => onToggleGoal(goal.id)}
                      className="w-4 h-4 rounded-sm text-indigo-600 focus:ring-indigo-600 border-slate-300"
                    />
                    <span className={`text-xs ${goal.completed ? 'line-through text-slate-600' : 'font-medium'}`}>
                      {goal.text}
                    </span>
                  </label>
                  <button
                    onClick={() => onDeleteGoal(goal.id)}
                    className="text-slate-400 hover:text-rose-600 p-1 rounded-sm transition-colors cursor-pointer"
                    title="Remove goal"
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

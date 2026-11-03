import React, { useState } from 'react';
import { 
  ArrowLeft, 
  BookOpen, 
  Book,
  GraduationCap,
  FileText, 
  BarChart3, 
  FolderDown, 
  CheckCircle2, 
  Circle, 
  Star, 
  Clock, 
  ChevronDown, 
  ChevronUp, 
  Edit3, 
  Eye, 
  Play, 
  Upload, 
  Sparkles, 
  Award, 
  AlertTriangle,
  Lightbulb,
  FileCheck2,
  ExternalLink,
  Save,
  Check,
  Copy,
  ListChecks,
  Layers
} from 'lucide-react';
import { Subject, Unit, Topic, ModelPaper, FacultyMaterial, AnalysisQuestion } from '../types';

interface SubjectDetailProps {
  subject: Subject;
  initialTab?: 'syllabus' | 'papers' | 'analysis' | 'materials';
  onBackToDashboard: () => void;
  onUpdateSubject: (updated: Subject) => void;
  onOpenPaperViewer: (paper: ModelPaper, practiceMode?: boolean) => void;
  onOpenDocumentViewer: (material: FacultyMaterial) => void;
  onOpenUploadModal: (subjectId: string) => void;
  onOpenOfficialPdfAtPage?: (page: number) => void;
}

export const SubjectDetail: React.FC<SubjectDetailProps> = ({
  subject,
  initialTab = 'syllabus',
  onBackToDashboard,
  onUpdateSubject,
  onOpenPaperViewer,
  onOpenDocumentViewer,
  onOpenUploadModal,
  onOpenOfficialPdfAtPage,
}) => {
  const [activeTab, setActiveTab] = useState<'syllabus' | 'papers' | 'analysis' | 'materials'>(initialTab);
  
  // Accordion state for syllabus units (unit-1 default open)
  const [expandedUnits, setExpandedUnits] = useState<Record<string, boolean>>({
    [subject.units[0]?.id || '']: true,
  });

  // State for official curriculum overview panel & copy feedback
  const [showCurriculumOverview, setShowCurriculumOverview] = useState<boolean>(true);
  const [copiedUnitId, setCopiedUnitId] = useState<string | null>(null);

  // State for active personal note editing
  const [editingTopicId, setEditingTopicId] = useState<string | null>(null);
  const [topicNoteText, setTopicNoteText] = useState<string>('');

  // Paper filter
  const [paperFilter, setPaperFilter] = useState<'all' | 'model' | 'previous_year'>('all');

  // Material filter
  const [materialFilter, setMaterialFilter] = useState<string>('all');

  // Calculate subject progress
  const totalTopics = subject.units.reduce((acc, u) => acc + u.topics.length, 0);
  const completedTopics = subject.units.reduce((acc, u) => acc + u.topics.filter(t => t.completed).length, 0);
  const subjectProgressPct = totalTopics > 0 ? Math.round((completedTopics / totalTopics) * 100) : 0;

  const toggleUnit = (unitId: string) => {
    setExpandedUnits(prev => ({ ...prev, [unitId]: !prev[unitId] }));
  };

  const toggleAllUnits = (expand: boolean) => {
    const next: Record<string, boolean> = {};
    subject.units.forEach(u => {
      next[u.id] = expand;
    });
    setExpandedUnits(next);
  };

  const handleToggleTopic = (unitId: string, topicId: string) => {
    const updatedUnits = subject.units.map(unit => {
      if (unit.id !== unitId) return unit;
      return {
        ...unit,
        topics: unit.topics.map(t => {
          if (t.id !== topicId) return t;
          return { ...t, completed: !t.completed };
        }),
      };
    });
    onUpdateSubject({ ...subject, units: updatedUnits });
  };

  const handleSaveTopicNote = (unitId: string, topicId: string) => {
    const updatedUnits = subject.units.map(unit => {
      if (unit.id !== unitId) return unit;
      return {
        ...unit,
        topics: unit.topics.map(t => {
          if (t.id !== topicId) return t;
          return { ...t, personalNotes: topicNoteText };
        }),
      };
    });
    onUpdateSubject({ ...subject, units: updatedUnits });
    setEditingTopicId(null);
  };

  const filteredPapers = subject.papers.filter(p => {
    if (paperFilter === 'all') return true;
    return p.type === paperFilter;
  });

  const filteredMaterials = subject.materials.filter(m => {
    if (materialFilter === 'all') return true;
    return m.type === materialFilter;
  });

  return (
    <div className="space-y-6 pb-16">
      {/* Subject Header */}
      <div className="bg-white rounded-3xl border border-slate-200/90 p-5 sm:p-7 shadow-xs space-y-5">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <button
            onClick={onBackToDashboard}
            className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-bold text-slate-600 hover:text-indigo-600 transition-colors group"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            <span>Back to Dashboard</span>
          </button>

          <div className="flex items-center gap-2 flex-wrap">
            {subject.pdfPages && onOpenOfficialPdfAtPage && (
              <button
                onClick={() => {
                  const match = subject.pdfPages?.match(/\d+/);
                  const pageNum = match ? parseInt(match[0], 10) : 87;
                  onOpenOfficialPdfAtPage(pageNum);
                }}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200 font-bold text-xs transition-colors"
                title="View this subject in the official PDF document"
              >
                <FileText className="w-3.5 h-3.5" />
                <span>View in Official PDF ({subject.pdfPages})</span>
              </button>
            )}

            <button
              onClick={() => onOpenUploadModal(subject.id)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-50 text-indigo-700 hover:bg-indigo-100 font-bold text-xs transition-colors"
            >
              <Upload className="w-3.5 h-3.5" />
              <span>Upload Subject Notes</span>
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
          <div className="md:col-span-8 space-y-2">
            <div className="flex items-center gap-2.5 flex-wrap">
              <span className="text-xs font-mono font-bold px-2.5 py-0.5 rounded-md bg-slate-900 text-white">
                {subject.code}
              </span>
              <span className="text-xs font-semibold px-2 py-0.5 rounded-md bg-slate-100 text-slate-700">
                {subject.credits} Academic Credits
              </span>
              <span className="text-xs font-semibold px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200">
                5 Standard Units
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              {subject.name}
            </h1>

            <p className="text-xs sm:text-sm text-slate-700 font-medium">
              Faculty Instructor: <span className="text-slate-800 font-semibold">{subject.facultyName}</span>
            </p>
          </div>

          {/* Right Progress Capsule */}
          <div className="md:col-span-4 bg-slate-50 rounded-2xl p-4 border border-slate-200/80 space-y-2 text-right">
            <div className="flex items-center justify-between text-xs font-bold">
              <span className="text-slate-600">Syllabus Readiness</span>
              <span className="text-indigo-600 text-sm font-black">{subjectProgressPct}%</span>
            </div>
            <div className="w-full h-2.5 rounded-full bg-slate-200 overflow-hidden">
              <div
                className="h-full bg-linear-to-r from-indigo-500 to-teal-500 rounded-full transition-all duration-500"
                style={{ width: `${subjectProgressPct}%` }}
              />
            </div>
            <p className="text-[11px] text-slate-700 text-left">
              {completedTopics} of {totalTopics} topics revised
            </p>
          </div>
        </div>

        {/* Sub-Navigation Tabs */}
        <div className="flex items-center gap-2 border-t border-slate-100 pt-4 overflow-x-auto no-scrollbar">
          <button
            onClick={() => setActiveTab('syllabus')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all shrink-0 ${
              activeTab === 'syllabus'
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <BookOpen className="w-4 h-4" />
            <span>1. Syllabus Viewer</span>
            <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${
              activeTab === 'syllabus' ? 'bg-indigo-700 text-indigo-100' : 'bg-slate-200 text-slate-700'
            }`}>
              5 Units
            </span>
          </button>

          <button
            onClick={() => setActiveTab('papers')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all shrink-0 ${
              activeTab === 'papers'
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <FileText className="w-4 h-4" />
            <span>2. Model Papers</span>
            <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${
              activeTab === 'papers' ? 'bg-indigo-700 text-indigo-100' : 'bg-slate-200 text-slate-700'
            }`}>
              {subject.papers.length} Papers
            </span>
          </button>

          <button
            onClick={() => setActiveTab('analysis')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all shrink-0 ${
              activeTab === 'analysis'
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <BarChart3 className="w-4 h-4" />
            <span>3. Paper Analysis</span>
            <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${
              activeTab === 'analysis' ? 'bg-indigo-700 text-indigo-100' : 'bg-rose-100 text-rose-700 font-bold'
            }`}>
              High Yield
            </span>
          </button>

          <button
            onClick={() => setActiveTab('materials')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all shrink-0 ${
              activeTab === 'materials'
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <FolderDown className="w-4 h-4" />
            <span>4. Faculty Materials & PDFs</span>
            <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${
              activeTab === 'materials' ? 'bg-indigo-700 text-indigo-100' : 'bg-slate-200 text-slate-700'
            }`}>
              {subject.materials.length} Notes
            </span>
          </button>
        </div>
      </div>

      {/* TAB 1: SYLLABUS VIEWER */}
      {activeTab === 'syllabus' && (
        <div className="space-y-5">
          {/* Official Course Curriculum & Prescribed Books Panel */}
          {(subject.courseObjectives?.length || subject.courseOutcomes?.length || subject.textBooks?.length) && (
            <div className="bg-white rounded-3xl border border-slate-200/90 overflow-hidden shadow-xs">
              <div 
                onClick={() => setShowCurriculumOverview(prev => !prev)}
                className="p-4 sm:p-5 flex items-center justify-between gap-4 cursor-pointer hover:bg-slate-50/80 transition-colors select-none"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 shrink-0">
                    <GraduationCap className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="font-extrabold text-slate-900 text-sm sm:text-base">
                        Official Course Curriculum & Prescribed Books
                      </h3>
                      <span className="text-[11px] font-bold px-2 py-0.5 rounded-md bg-indigo-50 text-indigo-700 border border-indigo-200">
                        GVPCDPGC(A) R-22 Autonomous
                      </span>
                      {subject.pdfPages && (
                        <span className="text-[11px] font-bold px-2 py-0.5 rounded-md bg-rose-50 text-rose-700 border border-rose-200">
                          {subject.pdfPages}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-600 mt-0.5">
                      Course Objectives, Learning Outcomes (CO1–CO5), Prescribed Textbooks & Reference Books
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <span className="text-xs font-bold text-indigo-600 hidden sm:inline">
                    {showCurriculumOverview ? 'Collapse Details' : 'Expand Details'}
                  </span>
                  {showCurriculumOverview ? (
                    <ChevronUp className="w-5 h-5 text-slate-400" />
                  ) : (
                    <ChevronDown className="w-5 h-5 text-slate-400" />
                  )}
                </div>
              </div>

              {showCurriculumOverview && (
                <div className="border-t border-slate-100 p-4 sm:p-6 space-y-5 bg-slate-50/40">
                  {/* Course Objectives */}
                  {subject.courseObjectives && subject.courseObjectives.length > 0 && (
                    <div className="space-y-2.5">
                      <h4 className="text-xs font-extrabold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                        <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                        <span>Course Objectives (Prescribed by Board of Studies)</span>
                      </h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
                        {subject.courseObjectives.map((obj, i) => (
                          <div key={i} className="p-3 bg-white rounded-xl border border-slate-200/80 text-xs text-slate-700 leading-relaxed flex items-start gap-2.5 shadow-2xs">
                            <span className="w-5 h-5 rounded-md bg-indigo-50 text-indigo-700 font-extrabold text-[11px] flex items-center justify-center shrink-0 mt-0.5 border border-indigo-100">
                              {i + 1}
                            </span>
                            <span className="flex-1 font-medium">{obj.replace(/^\d+[:.]\s*/, '')}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Course Outcomes (CO1-CO5) */}
                  {subject.courseOutcomes && subject.courseOutcomes.length > 0 && (
                    <div className="space-y-2.5">
                      <h4 className="text-xs font-extrabold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                        <Award className="w-3.5 h-3.5 text-emerald-600" />
                        <span>Course Outcomes (CO1 to CO5)</span>
                      </h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
                        {subject.courseOutcomes.map((co, i) => {
                          const coMatch = co.match(/^(CO\s*\d+):?\s*(.*)$/i);
                          const coTag = coMatch ? coMatch[1] : `CO${i + 1}`;
                          const coText = coMatch ? coMatch[2] : co;
                          return (
                            <div key={i} className="p-3 bg-white rounded-xl border border-slate-200/80 text-xs text-slate-700 leading-relaxed flex items-start gap-2.5 shadow-2xs">
                              <span className="px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-800 font-extrabold text-[11px] shrink-0 mt-0.5 border border-emerald-200">
                                {coTag.toUpperCase()}
                              </span>
                              <span className="flex-1 font-medium">{coText}</span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* Textbooks & Reference Books */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
                    {/* Prescribed Textbooks */}
                    {subject.textBooks && subject.textBooks.length > 0 && (
                      <div className="bg-white p-4 rounded-xl border border-indigo-100 shadow-2xs space-y-2">
                        <h5 className="text-xs font-extrabold text-indigo-950 uppercase tracking-wider flex items-center gap-1.5">
                          <BookOpen className="w-4 h-4 text-indigo-600" />
                          <span>Prescribed Textbooks</span>
                        </h5>
                        <ul className="space-y-2 text-xs text-slate-700">
                          {subject.textBooks.map((tb, i) => (
                            <li key={i} className="pl-3 border-l-2 border-indigo-500 leading-relaxed font-medium">
                              {tb}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* Reference Books */}
                    {subject.referenceBooks && subject.referenceBooks.length > 0 && (
                      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs space-y-2">
                        <h5 className="text-xs font-extrabold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                          <Book className="w-4 h-4 text-slate-500" />
                          <span>Reference Books</span>
                        </h5>
                        <ul className="space-y-2 text-xs text-slate-600">
                          {subject.referenceBooks.map((rb, i) => (
                            <li key={i} className="pl-3 border-l-2 border-slate-300 leading-relaxed">
                              {rb}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>

                  {/* Prescribed Case Studies (e.g. for OOSE) */}
                  {subject.caseStudies && subject.caseStudies.length > 0 && (
                    <div className="bg-amber-50/80 border border-amber-200/90 rounded-xl p-4 space-y-2">
                      <h5 className="text-xs font-extrabold text-amber-950 uppercase tracking-wider flex items-center gap-1.5">
                        <Layers className="w-4 h-4 text-amber-700" />
                        <span>Official Prescribed Case Studies (Mandatory for Examination)</span>
                      </h5>
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2">
                        {subject.caseStudies.map((cs, i) => (
                          <div key={i} className="p-2.5 bg-white rounded-lg border border-amber-200 text-xs font-bold text-amber-900 shadow-2xs">
                            {cs}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Web References if present */}
                  {subject.webReferences && subject.webReferences.length > 0 && (
                    <div className="bg-slate-100 rounded-xl p-3 flex items-center justify-between flex-wrap gap-2 text-xs text-slate-700">
                      <span className="font-semibold">NPTEL / Online References:</span>
                      <div className="flex items-center gap-2">
                        {subject.webReferences.map((ref, i) => (
                          <a
                            key={i}
                            href={ref}
                            target="_blank"
                            rel="noreferrer"
                            className="text-indigo-600 hover:text-indigo-800 underline font-semibold flex items-center gap-1"
                          >
                            <span>{ref}</span>
                            <ExternalLink className="w-3 h-3" />
                          </a>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Quick Unit Tools Bar */}
          <div className="bg-indigo-50/70 border border-indigo-200/80 rounded-2xl p-4 flex items-center justify-between flex-wrap gap-3">
            <div className="flex items-center gap-2.5">
              <Sparkles className="w-5 h-5 text-indigo-600 shrink-0" />
              <div>
                <h4 className="text-sm font-bold text-indigo-950">Interactive Syllabus & Unit Checklist</h4>
                <p className="text-xs text-indigo-800">
                  Click any unit to expand the complete official syllabus details and topic-wise revision checklist.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => toggleAllUnits(true)}
                className="px-2.5 py-1 rounded-lg bg-white border border-indigo-200 text-indigo-700 hover:bg-indigo-100 text-xs font-bold transition-colors shadow-2xs"
              >
                Expand All Units
              </button>
              <button
                onClick={() => toggleAllUnits(false)}
                className="px-2.5 py-1 rounded-lg bg-white border border-slate-200 text-slate-600 hover:bg-slate-100 text-xs font-bold transition-colors"
              >
                Collapse All
              </button>
            </div>
          </div>

          {/* Units Accordion List */}
          <div className="space-y-4">
            {subject.units.map((unit) => {
              const isExpanded = !!expandedUnits[unit.id];
              const completedCount = unit.topics.filter(t => t.completed).length;
              const unitPct = Math.round((completedCount / unit.topics.length) * 100);
              const isUnitDone = completedCount === unit.topics.length;

              return (
                <div 
                  key={unit.id}
                  className={`bg-white rounded-2xl border transition-all duration-200 overflow-hidden ${
                    isUnitDone ? 'border-emerald-300 shadow-xs' : 'border-slate-200 hover:border-slate-300'
                  }`}
                >
                  {/* Unit Accordion Header */}
                  <div 
                    onClick={() => toggleUnit(unit.id)}
                    className="p-4 sm:p-5 flex items-center justify-between gap-4 cursor-pointer hover:bg-slate-50/70 select-none"
                  >
                    <div className="flex items-start sm:items-center gap-3 flex-1 min-w-0">
                      <div className={`w-9 h-9 rounded-xl font-extrabold text-xs flex items-center justify-center shrink-0 mt-0.5 sm:mt-0 ${
                        isUnitDone ? 'bg-emerald-500 text-white' : 'bg-slate-100 text-slate-700'
                      }`}>
                        U{unit.unitNumber}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h3 className="font-extrabold text-slate-900 text-sm sm:text-base">
                            Unit {unit.unitNumber}: {unit.title}
                          </h3>
                          <span className="text-[11px] font-bold px-2 py-0.5 rounded-md bg-amber-50 text-amber-800 border border-amber-200">
                            ~{unit.weightageMarks} Marks in Exam
                          </span>
                          {isUnitDone && (
                            <span className="text-[11px] font-bold px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1">
                              <CheckCircle2 className="w-3 h-3" />
                              <span>Mastered</span>
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-slate-600 mt-1 font-normal line-clamp-2 sm:line-clamp-1 leading-relaxed">
                          {unit.description}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 shrink-0">
                      <div className="hidden sm:block text-right">
                        <span className="text-xs font-bold text-slate-700">
                          {completedCount}/{unit.topics.length} topics
                        </span>
                        <div className="w-20 h-1.5 rounded-full bg-slate-200 mt-1 overflow-hidden">
                          <div 
                            className="h-full bg-emerald-500 rounded-full"
                            style={{ width: `${unitPct}%` }}
                          />
                        </div>
                      </div>

                      {isExpanded ? (
                        <ChevronUp className="w-5 h-5 text-slate-400" />
                      ) : (
                        <ChevronDown className="w-5 h-5 text-slate-400" />
                      )}
                    </div>
                  </div>

                  {/* Unit Content & Topics Breakdown (Expanded) */}
                  {isExpanded && (
                    <div className="border-t border-slate-100 px-4 sm:px-6 py-5 bg-slate-50/50 space-y-4">
                      {/* Verbatim Official Syllabus Box */}
                      <div className="bg-slate-900 text-slate-100 rounded-2xl p-4 sm:p-5 space-y-3 shadow-sm border border-slate-800">
                        <div className="flex items-center justify-between flex-wrap gap-2">
                          <div className="flex items-center gap-2 font-bold text-xs uppercase tracking-wider text-indigo-300">
                            <BookOpen className="w-4 h-4 text-indigo-400" />
                            <span>Official Prescribed Syllabus (Verbatim GVPCDPGC R-22 Curriculum)</span>
                          </div>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              navigator.clipboard.writeText(`Unit ${unit.unitNumber}: ${unit.title}\n\nPrescribed Syllabus:\n${unit.description}`);
                              setCopiedUnitId(unit.id);
                              setTimeout(() => setCopiedUnitId(null), 2000);
                            }}
                            className="inline-flex items-center gap-1.5 text-[11px] font-bold text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 border border-slate-700 px-3 py-1 rounded-lg transition-colors cursor-pointer"
                            title="Copy unit syllabus text"
                          >
                            {copiedUnitId === unit.id ? (
                              <>
                                <Check className="w-3.5 h-3.5 text-emerald-400" />
                                <span className="text-emerald-400 font-extrabold">Copied to Clipboard!</span>
                              </>
                            ) : (
                              <>
                                <Copy className="w-3.5 h-3.5 text-slate-400" />
                                <span>Copy Full Syllabus Text</span>
                              </>
                            )}
                          </button>
                        </div>
                        <p className="text-xs sm:text-sm text-slate-200 leading-relaxed font-normal whitespace-pre-line bg-slate-800/90 p-4 rounded-xl border border-slate-700/80">
                          {unit.description}
                        </p>
                      </div>

                      {/* Subtopic Revision Checklist */}
                      <div className="space-y-3 pt-1">
                        <div className="flex items-center justify-between flex-wrap gap-2">
                          <span className="text-xs font-extrabold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                            <ListChecks className="w-4 h-4 text-indigo-600" />
                            <span>Detailed Topic-by-Topic Revision Checklist ({completedCount}/{unit.topics.length} Revised)</span>
                          </span>
                          <span className="text-[11px] text-slate-500 font-medium">Click checkbox to mark revised • Click 📝 to add note</span>
                        </div>

                        <div className="space-y-2">
                          {unit.topics.map((topic) => {
                            const isEditing = editingTopicId === topic.id;

                            return (
                              <div 
                                key={topic.id}
                                className={`p-3 sm:p-3.5 rounded-xl border transition-all ${
                                  topic.completed 
                                    ? 'bg-white border-emerald-200/90 shadow-2xs' 
                                    : 'bg-white border-slate-200'
                                }`}
                              >
                                <div className="flex items-start justify-between gap-3">
                                  <label className="flex items-start gap-3 flex-1 cursor-pointer select-none">
                                    <input
                                      type="checkbox"
                                      checked={topic.completed}
                                      onChange={() => handleToggleTopic(unit.id, topic.id)}
                                      className="w-4 h-4 mt-0.5 rounded-sm text-indigo-600 focus:ring-indigo-500 border-slate-300"
                                    />
                                    <div>
                                      <div className="flex items-center gap-2 flex-wrap">
                                        <span className={`text-xs sm:text-sm font-semibold ${
                                          topic.completed ? 'text-slate-500 line-through' : 'text-slate-800'
                                        }`}>
                                          {topic.title}
                                        </span>
                                        {topic.highYield && (
                                          <span className="inline-flex items-center gap-1 text-[10px] font-extrabold text-rose-700 bg-rose-50 px-1.5 py-0.2 rounded-sm border border-rose-200">
                                            <Star className="w-2.5 h-2.5 fill-rose-500 text-rose-500" />
                                            High-Yield
                                          </span>
                                        )}
                                        {topic.hoursRequired && (
                                          <span className="text-[10px] text-slate-700 flex items-center gap-0.5">
                                            <Clock className="w-3 h-3" />
                                            {topic.hoursRequired}h prep
                                          </span>
                                        )}
                                      </div>

                                      {topic.personalNotes && !isEditing && (
                                        <div className="mt-2 text-xs bg-amber-50/80 border border-amber-200/60 text-amber-900 rounded-lg p-2 font-mono">
                                          📝 {topic.personalNotes}
                                        </div>
                                      )}
                                    </div>
                                  </label>

                                  <button
                                    onClick={() => {
                                      if (isEditing) {
                                        setEditingTopicId(null);
                                      } else {
                                        setEditingTopicId(topic.id);
                                        setTopicNoteText(topic.personalNotes || '');
                                      }
                                    }}
                                    className="text-slate-400 hover:text-indigo-600 p-1 rounded-sm text-xs transition-colors shrink-0"
                                    title="Add or edit study notes"
                                  >
                                    <Edit3 className="w-3.5 h-3.5" />
                                  </button>
                                </div>

                                {/* Topic Note Editor */}
                                {isEditing && (
                                  <div className="mt-3 pt-2 border-t border-slate-100 flex gap-2">
                                    <input
                                      type="text"
                                      value={topicNoteText}
                                      onChange={(e) => setTopicNoteText(e.target.value)}
                                      placeholder="Add quick formula, trick, or faculty reminder..."
                                      className="flex-1 text-xs px-3 py-1.5 rounded-lg border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                                      autoFocus
                                    />
                                    <button
                                      onClick={() => handleSaveTopicNote(unit.id, topic.id)}
                                      className="px-3 py-1.5 rounded-lg bg-indigo-600 text-white text-xs font-bold hover:bg-indigo-700 flex items-center gap-1"
                                    >
                                      <Save className="w-3 h-3" />
                                      <span>Save</span>
                                    </button>
                                  </div>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB 2: MODEL PAPERS & PREVIOUS PAPERS */}
      {activeTab === 'papers' && (
        <div className="space-y-4">
          {/* Filter Bar */}
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-xl text-xs font-bold">
              <button
                onClick={() => setPaperFilter('all')}
                className={`px-3 py-1.5 rounded-lg transition-colors ${
                  paperFilter === 'all' ? 'bg-white text-indigo-600 shadow-2xs' : 'text-slate-600'
                }`}
              >
                All Papers ({subject.papers.length})
              </button>
              <button
                onClick={() => setPaperFilter('previous_year')}
                className={`px-3 py-1.5 rounded-lg transition-colors ${
                  paperFilter === 'previous_year' ? 'bg-white text-indigo-600 shadow-2xs' : 'text-slate-600'
                }`}
              >
                Previous Year Papers
              </button>
              <button
                onClick={() => setPaperFilter('model')}
                className={`px-3 py-1.5 rounded-lg transition-colors ${
                  paperFilter === 'model' ? 'bg-white text-indigo-600 shadow-2xs' : 'text-slate-600'
                }`}
              >
                Faculty Model Papers
              </button>
            </div>

            <button
              onClick={() => onOpenUploadModal(subject.id)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 text-white text-xs font-bold hover:bg-slate-800"
            >
              <Upload className="w-3.5 h-3.5" />
              <span>Add Model Paper PDF</span>
            </button>
          </div>

          {/* Papers Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredPapers.map((paper) => (
              <div 
                key={paper.id}
                className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-xs hover:border-indigo-300 transition-all flex flex-col justify-between space-y-4"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className={`text-[11px] font-extrabold px-2.5 py-0.5 rounded-md ${
                      paper.type === 'previous_year'
                        ? 'bg-blue-50 text-blue-700 border border-blue-200'
                        : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                    }`}>
                      {paper.type === 'previous_year' ? 'University Exam Paper' : 'Model Exam Paper'}
                    </span>
                    <span className="text-xs text-slate-700 font-mono font-bold">
                      {paper.year}
                    </span>
                  </div>

                  <div>
                    <h3 className="font-extrabold text-slate-900 text-base">
                      {paper.title}
                    </h3>
                    <div className="flex items-center gap-3 text-xs text-slate-700 mt-1 font-medium">
                      <span>{paper.totalMarks} Marks</span>
                      <span>•</span>
                      <span>{paper.durationMinutes} Minutes (3h)</span>
                      <span>•</span>
                      <span className="font-bold text-slate-700">{paper.difficulty}</span>
                    </div>
                  </div>

                  {/* Practice status */}
                  {paper.isPracticed ? (
                    <div className="flex items-center gap-2 p-2 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span>Practiced on {paper.practicedDate} • Score: {paper.practicedScore}/{paper.totalMarks}</span>
                    </div>
                  ) : (
                    <div className="text-xs text-slate-700 flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5" />
                      <span>Not practiced yet. Recommended before finals.</span>
                    </div>
                  )}

                  <div className="text-xs text-slate-700 bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                    <span className="font-semibold text-slate-700">Format: </span>
                    {paper.sections.map(s => s.name.split('(')[0]).join(' + ')} ({paper.sections.reduce((a, s) => a + s.questions.length, 0)} total questions)
                  </div>
                </div>

                {/* Actions */}
                <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-100">
                  <button
                    onClick={() => onOpenPaperViewer(paper, false)}
                    className="px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold flex items-center justify-center gap-1.5 transition-colors"
                  >
                    <Eye className="w-3.5 h-3.5 text-indigo-600" />
                    <span>View & Solutions</span>
                  </button>

                  <button
                    onClick={() => onOpenPaperViewer(paper, true)}
                    className="px-3 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold flex items-center justify-center gap-1.5 shadow-xs transition-colors"
                  >
                    <Play className="w-3.5 h-3.5 fill-white" />
                    <span>Practice (Timer)</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 3: MODEL PAPER ANALYSIS */}
      {activeTab === 'analysis' && (
        <div className="space-y-6">
          {/* Strategy Tip Banner */}
          <div className="bg-linear-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-2xl p-5 space-y-2">
            <div className="flex items-center gap-2">
              <Lightbulb className="w-5 h-5 text-amber-600" />
              <h3 className="font-extrabold text-amber-900 text-sm sm:text-base">
                Examination Strategy & Scoring Formula
              </h3>
            </div>
            <p className="text-xs sm:text-sm text-amber-900 leading-relaxed font-medium">
              {subject.analysis.examStrategyTip}
            </p>
            <div className="pt-1 text-xs font-bold text-amber-800">
              💡 Passing / High Scoring Cutoff: {subject.analysis.predictedCutoffOrPassTip}
            </div>
          </div>

          {/* Unit Marks & Question Distribution Bar Chart */}
          <div className="bg-white rounded-2xl border border-slate-200/90 p-5 sm:p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-extrabold text-slate-900 text-base">Unit Marks Weightage & Question Frequency</h3>
                <p className="text-xs text-slate-700">Average marks contribution per unit across the past 5 examination papers</p>
              </div>
              <span className="text-xs font-bold px-2.5 py-1 rounded-md bg-slate-100 text-slate-700">
                100 Marks Total
              </span>
            </div>

            <div className="space-y-3 pt-2">
              {subject.analysis.unitDistribution.map((u) => (
                <div key={u.unitNumber} className="space-y-1">
                  <div className="flex items-center justify-between text-xs font-bold">
                    <span className="text-slate-800">Unit {u.unitNumber}: {u.unitTitle}</span>
                    <span className="text-indigo-600">~{u.avgMarks} Marks ({u.questionPercentage}%)</span>
                  </div>
                  <div className="w-full h-3 rounded-full bg-slate-100 overflow-hidden">
                    <div 
                      className="h-full rounded-full transition-all duration-700"
                      style={{ 
                        width: `${u.questionPercentage * 3}%`,
                        backgroundColor: u.color 
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Frequently Repeated Questions */}
          <div className="bg-white rounded-2xl border border-slate-200/90 p-5 sm:p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div>
                <h3 className="font-extrabold text-slate-900 text-base">Frequently Repeated Questions</h3>
                <p className="text-xs text-slate-700">High-probability questions identified from previous 5 university examinations</p>
              </div>
              <span className="text-xs font-bold px-2.5 py-1 rounded-md bg-rose-50 text-rose-700 border border-rose-200">
                ⭐ Starred Priorities
              </span>
            </div>

            <div className="space-y-3">
              {subject.analysis.frequentlyRepeatedQuestions.map((q) => (
                <div 
                  key={q.id}
                  className="p-4 rounded-xl border border-slate-200 hover:border-slate-300 transition-colors space-y-2 bg-slate-50/40"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-xs font-bold text-slate-800">
                          {q.unitTitle}
                        </span>
                        <span className="text-xs font-mono font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-md">
                          {q.marks} Marks
                        </span>
                        <span className="text-xs font-extrabold text-rose-700 bg-rose-50 px-2 py-0.5 rounded-md border border-rose-200">
                          Appeared in {q.timesRepeated} Papers ({q.years.join(', ')})
                        </span>
                      </div>
                      <h4 className="text-sm font-bold text-slate-900 pt-0.5">
                        {q.text}
                      </h4>
                    </div>
                  </div>

                  {/* Model Answer Hint */}
                  <div className="mt-2 text-xs bg-white p-3 rounded-lg border border-slate-200 text-slate-700 leading-relaxed">
                    <span className="font-bold text-indigo-900 block mb-1">Key Revision Takeaway / Answer Outline:</span>
                    {q.answerSummary}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* High-Yield Topics Priority List */}
          <div className="bg-white rounded-2xl border border-slate-200/90 p-5 sm:p-6 shadow-xs space-y-4">
            <h3 className="font-extrabold text-slate-900 text-base">Priority Revision Tier List</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {subject.analysis.highYieldTopics.map((item, idx) => (
                <div key={idx} className="p-4 rounded-xl border border-slate-200 bg-linear-to-br from-slate-50 to-white space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-indigo-700">Unit {item.unit}</span>
                    <span className="text-xs font-black text-rose-600 bg-rose-50 px-2 py-0.5 rounded-md border border-rose-200">
                      {item.probability}
                    </span>
                  </div>
                  <h4 className="font-bold text-sm text-slate-900">{item.topic}</h4>
                  <p className="text-xs text-slate-700 font-medium">{item.recommendation}</p>
                  <div className="flex gap-1.5 flex-wrap pt-1">
                    {item.tags.map((t, tIdx) => (
                      <span key={tIdx} className="text-[10px] font-semibold px-2 py-0.5 bg-slate-100 text-slate-600 rounded-md">
                        {t}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: FACULTY MATERIALS & NOTES */}
      {activeTab === 'materials' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-xl text-xs font-bold">
              <button
                onClick={() => setMaterialFilter('all')}
                className={`px-3 py-1.5 rounded-lg transition-colors ${
                  materialFilter === 'all' ? 'bg-white text-indigo-600 shadow-2xs' : 'text-slate-600'
                }`}
              >
                All Materials ({subject.materials.length})
              </button>
              <button
                onClick={() => setMaterialFilter('lecture_notes')}
                className={`px-3 py-1.5 rounded-lg transition-colors ${
                  materialFilter === 'lecture_notes' ? 'bg-white text-indigo-600 shadow-2xs' : 'text-slate-600'
                }`}
              >
                Lecture Handouts
              </button>
              <button
                onClick={() => setMaterialFilter('cheat_sheet')}
                className={`px-3 py-1.5 rounded-lg transition-colors ${
                  materialFilter === 'cheat_sheet' ? 'bg-white text-indigo-600 shadow-2xs' : 'text-slate-600'
                }`}
              >
                Formula & Cheat Sheets
              </button>
            </div>

            <button
              onClick={() => onOpenUploadModal(subject.id)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 text-white text-xs font-bold hover:bg-slate-800"
            >
              <Upload className="w-3.5 h-3.5" />
              <span>Upload Faculty Notes / PDF</span>
            </button>
          </div>

          {/* Materials List */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredMaterials.map((mat) => (
              <div
                key={mat.id}
                className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-xs hover:border-indigo-300 transition-all flex flex-col justify-between space-y-3"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold px-2 py-0.5 rounded-md bg-indigo-50 text-indigo-700">
                      {mat.type === 'lecture_notes' ? 'Lecture Notes' : mat.type === 'cheat_sheet' ? 'Quick Cheat Sheet' : 'Viva Prep'}
                    </span>
                    {mat.pages && (
                      <span className="text-xs text-slate-700 font-mono">
                        {mat.pages} Pages
                      </span>
                    )}
                  </div>

                  <h3 className="font-bold text-slate-900 text-sm line-clamp-2">
                    {mat.title}
                  </h3>

                  <p className="text-xs text-slate-700">
                    By {mat.author} • Added {mat.dateAdded}
                  </p>

                  <p className="text-xs text-slate-700 line-clamp-2">
                    {mat.contentSummary}
                  </p>

                  {mat.keyPoints && mat.keyPoints.length > 0 && (
                    <div className="pt-1 space-y-1">
                      <span className="text-[10px] uppercase font-bold text-slate-700">Key Focus Points:</span>
                      <ul className="text-[11px] text-slate-600 list-disc list-inside space-y-0.5">
                        {mat.keyPoints.slice(0, 3).map((kp, kIdx) => (
                          <li key={kIdx} className="truncate">{kp}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>

                <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                  <button
                    onClick={() => onOpenDocumentViewer(mat)}
                    className="w-full py-2 px-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold flex items-center justify-center gap-1.5 transition-colors"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>Open & Read Document</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

import React, { useState, useEffect, useMemo } from 'react';
import { 
  Search, 
  X, 
  BookOpen, 
  FileText, 
  BarChart3, 
  FolderDown, 
  ChevronRight,
  Sparkles,
  Target
} from 'lucide-react';
import { Subject } from '../types';

interface GlobalSearchModalProps {
  subjects: Subject[];
  isOpen: boolean;
  onClose: () => void;
  onNavigateTo: (subjectId: string, tab: 'syllabus' | 'papers' | 'analysis' | 'materials') => void;
}

interface SearchResult {
  id: string;
  type: 'syllabus' | 'papers' | 'analysis' | 'materials';
  title: string;
  subtitle: string;
  subjectId: string;
  subjectName: string;
  subjectCode: string;
  badge?: string;
}

export const GlobalSearchModal: React.FC<GlobalSearchModalProps> = ({
  subjects,
  isOpen,
  onClose,
  onNavigateTo,
}) => {
  const [query, setQuery] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'syllabus' | 'papers' | 'analysis' | 'materials'>('all');

  // Build searchable index from all 5 subjects
  const allItems: SearchResult[] = useMemo(() => {
    const list: SearchResult[] = [];

    subjects.forEach(sub => {
      // 1. Units & Topics
      sub.units.forEach(u => {
        list.push({
          id: `u-${u.id}`,
          type: 'syllabus',
          title: `Unit ${u.unitNumber}: ${u.title}`,
          subtitle: u.description,
          subjectId: sub.id,
          subjectName: sub.name,
          subjectCode: sub.code,
          badge: `${u.weightageMarks}M in Exam`,
        });

        u.topics.forEach(t => {
          list.push({
            id: `t-${t.id}`,
            type: 'syllabus',
            title: t.title,
            subtitle: `Unit ${u.unitNumber} • ${sub.name}`,
            subjectId: sub.id,
            subjectName: sub.name,
            subjectCode: sub.code,
            badge: t.highYield ? 'High Yield' : undefined,
          });
        });
      });

      // 2. Papers
      sub.papers.forEach(p => {
        list.push({
          id: `p-${p.id}`,
          type: 'papers',
          title: p.title,
          subtitle: `${p.year} • ${p.totalMarks} Marks • ${p.difficulty} difficulty`,
          subjectId: sub.id,
          subjectName: sub.name,
          subjectCode: sub.code,
          badge: p.type === 'previous_year' ? 'Exam Paper' : 'Model Paper',
        });

        // Questions inside paper
        p.sections.forEach(sec => {
          sec.questions.forEach(q => {
            list.push({
              id: `pq-${p.id}-${q.questionNumber}`,
              type: 'papers',
              title: `${q.questionNumber}: ${q.text}`,
              subtitle: `In ${p.title} • ${q.unit}`,
              subjectId: sub.id,
              subjectName: sub.name,
              subjectCode: sub.code,
              badge: `${q.marks} Marks`,
            });
          });
        });
      });

      // 3. Repeated Questions
      sub.analysis.frequentlyRepeatedQuestions.forEach(rq => {
        list.push({
          id: `rq-${rq.id}`,
          type: 'analysis',
          title: rq.text,
          subtitle: `Repeated in ${rq.timesRepeated} Papers (${rq.years.join(', ')})`,
          subjectId: sub.id,
          subjectName: sub.name,
          subjectCode: sub.code,
          badge: 'Repeated Question',
        });
      });

      // 4. Faculty Materials
      sub.materials.forEach(m => {
        list.push({
          id: `m-${m.id}`,
          type: 'materials',
          title: m.title,
          subtitle: `${m.author} • ${m.contentSummary.slice(0, 90)}...`,
          subjectId: sub.id,
          subjectName: sub.name,
          subjectCode: sub.code,
          badge: m.type === 'lecture_notes' ? 'Notes' : 'Cheat Sheet',
        });
      });

      // 5. Prescribed Textbooks
      sub.textBooks?.forEach((tb, i) => {
        list.push({
          id: `tb-${sub.id}-${i}`,
          type: 'syllabus',
          title: `Textbook: ${tb}`,
          subtitle: `Prescribed book for ${sub.name} (${sub.code})`,
          subjectId: sub.id,
          subjectName: sub.name,
          subjectCode: sub.code,
          badge: 'Prescribed Book',
        });
      });
    });

    return list;
  }, [subjects]);

  const results = useMemo(() => {
    if (!query.trim()) return [];
    const q = query.toLowerCase();
    return allItems
      .filter(item => {
        if (filterType !== 'all' && item.type !== filterType) return false;
        return (
          item.title.toLowerCase().includes(q) ||
          item.subtitle.toLowerCase().includes(q) ||
          item.subjectName.toLowerCase().includes(q) ||
          item.subjectCode.toLowerCase().includes(q)
        );
      })
      .slice(0, 20); // Top 20 results
  }, [allItems, query, filterType]);

  // Keyboard shortcut listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        // Handled by parent or toggled
      }
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/80 backdrop-blur-xs flex items-start justify-center p-3 sm:p-6 pt-12 sm:pt-20">
      <div className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl border border-slate-200 overflow-hidden space-y-0">
        
        {/* Search Input Bar */}
        <div className="p-4 sm:p-5 border-b border-slate-200 flex items-center gap-3">
          <Search className="w-5 h-5 text-indigo-600 shrink-0" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search all 5 subjects, topics, 16-mark questions, notes..."
            className="w-full text-base sm:text-lg font-medium text-slate-900 placeholder:text-slate-400 focus:outline-hidden"
            autoFocus
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              className="p-1 rounded-sm text-slate-400 hover:text-slate-600"
            >
              <X className="w-4 h-4" />
            </button>
          )}
          <button
            onClick={onClose}
            className="text-xs font-bold text-slate-500 hover:text-slate-800 px-2 py-1 bg-slate-100 rounded-md"
          >
            ESC
          </button>
        </div>

        {/* Filter Chips */}
        <div className="flex items-center gap-1.5 px-4 sm:px-5 py-2.5 bg-slate-50 border-b border-slate-200 text-xs font-bold overflow-x-auto no-scrollbar">
          <button
            onClick={() => setFilterType('all')}
            className={`px-2.5 py-1 rounded-lg transition-colors ${
              filterType === 'all' ? 'bg-indigo-600 text-white' : 'text-slate-600 hover:bg-slate-200'
            }`}
          >
            All Results
          </button>
          <button
            onClick={() => setFilterType('syllabus')}
            className={`px-2.5 py-1 rounded-lg transition-colors ${
              filterType === 'syllabus' ? 'bg-indigo-600 text-white' : 'text-slate-600 hover:bg-slate-200'
            }`}
          >
            Syllabus & Topics
          </button>
          <button
            onClick={() => setFilterType('analysis')}
            className={`px-2.5 py-1 rounded-lg transition-colors ${
              filterType === 'analysis' ? 'bg-indigo-600 text-white' : 'text-slate-600 hover:bg-slate-200'
            }`}
          >
            Repeated Questions
          </button>
          <button
            onClick={() => setFilterType('papers')}
            className={`px-2.5 py-1 rounded-lg transition-colors ${
              filterType === 'papers' ? 'bg-indigo-600 text-white' : 'text-slate-600 hover:bg-slate-200'
            }`}
          >
            Model Papers
          </button>
          <button
            onClick={() => setFilterType('materials')}
            className={`px-2.5 py-1 rounded-lg transition-colors ${
              filterType === 'materials' ? 'bg-indigo-600 text-white' : 'text-slate-600 hover:bg-slate-200'
            }`}
          >
            Faculty Notes
          </button>
        </div>

        {/* Results List */}
        <div className="max-h-96 overflow-y-auto p-3 space-y-1">
          {query.trim().length === 0 ? (
            <div className="p-8 text-center space-y-2 text-slate-500">
              <Sparkles className="w-6 h-6 text-indigo-400 mx-auto" />
              <p className="text-sm font-semibold text-slate-700">Type any keyword to search across the hub</p>
              <p className="text-xs text-slate-600">
                Examples: "Knapsack", "Normalization", "Banker's algorithm", "CRC", "Cyclomatic", "Unit 3"
              </p>
            </div>
          ) : results.length === 0 ? (
            <div className="p-8 text-center text-slate-500 text-sm font-medium">
              No matching topics, questions, or notes found for "{query}".
            </div>
          ) : (
            results.map((res) => (
              <div
                key={res.id}
                onClick={() => {
                  onNavigateTo(res.subjectId, res.type);
                  onClose();
                }}
                className="group p-3 rounded-xl hover:bg-indigo-50/70 border border-transparent hover:border-indigo-200 transition-all cursor-pointer flex items-center justify-between gap-3"
              >
                <div className="space-y-0.5 flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded-sm bg-slate-100 text-slate-700">
                      {res.subjectCode}
                    </span>
                    <span className="text-[10px] font-semibold text-slate-600">
                      {res.subjectName}
                    </span>
                    {res.badge && (
                      <span className="text-[10px] font-extrabold px-1.5 py-0.5 rounded-sm bg-indigo-50 text-indigo-700">
                        {res.badge}
                      </span>
                    )}
                  </div>
                  <h4 className="text-sm font-bold text-slate-900 group-hover:text-indigo-600 transition-colors truncate">
                    {res.title}
                  </h4>
                  <p className="text-xs text-slate-600 truncate">
                    {res.subtitle}
                  </p>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-indigo-600 group-hover:translate-x-0.5 transition-all shrink-0" />
              </div>
            ))
          )}
        </div>

      </div>
    </div>
  );
};

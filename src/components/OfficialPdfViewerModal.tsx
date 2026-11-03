import React, { useState } from 'react';
import { 
  X, 
  Download, 
  ExternalLink, 
  FileText, 
  ChevronRight, 
  Sparkles,
  BookOpen
} from 'lucide-react';

interface OfficialPdfViewerModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialPage?: number;
}

export const OfficialPdfViewerModal: React.FC<OfficialPdfViewerModalProps> = ({
  isOpen,
  onClose,
  initialPage = 87,
}) => {
  const [currentPage, setCurrentPage] = useState<number>(initialPage);

  if (!isOpen) return null;

  const quickNav = [
    { page: 87, label: 'Page 87: III-I Curriculum Structure' },
    { page: 88, label: 'Page 88: CSM3101 Data Warehousing & Mining' },
    { page: 90, label: 'Page 90: CSM3102 OO Software Engineering' },
    { page: 93, label: 'Page 93: CSM3103 Computer Networks' },
    { page: 95, label: 'Page 95: CSM3104 Introduction to AI' },
    { page: 97, label: 'Page 97: CSM3105 Introduction to Data Science' },
    { page: 99, label: 'Page 99: CSM3105 Expert Systems' },
    { page: 101, label: 'Page 101: CSM3105 Pattern Recognition' },
    { page: 103, label: 'Page 103: CSM3106 CN Lab' },
    { page: 105, label: 'Page 105: CSM3107 SE & Mini Project Lab' },
    { page: 108, label: 'Page 108: CSM3108 Web Technologies' },
    { page: 110, label: 'Page 110: CSM3109 Soft Skills' },
    { page: 112, label: 'Page 112: Honors Recommender Systems' },
    { page: 81, label: 'Page 81: CSM2208 Design Thinking' },
  ];

  const pdfUrl = `/assets/aistudio/R22_CSM_syllabus_d8f73cb4.pdf#page=${currentPage}`;

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/85 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4 overflow-y-auto">
      <div className="bg-white w-full max-w-6xl rounded-3xl shadow-2xl border border-slate-200 overflow-hidden my-4 flex flex-col h-[94vh]">
        
        {/* Top Header */}
        <div className="p-4 sm:p-5 border-b border-slate-200 bg-slate-900 text-white flex items-center justify-between flex-wrap gap-3">
          <div className="space-y-0.5">
            <div className="flex items-center gap-2">
              <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-sm bg-indigo-500/20 text-indigo-300 border border-indigo-400/30">
                Official University Document
              </span>
              <span className="text-xs text-slate-400">Pages 81–114: Semester V (III-I)</span>
            </div>
            <h2 className="text-base sm:text-lg font-bold text-white">
              Gayatri Vidya Parishad College (Autonomous) • R-22 CSM Syllabus
            </h2>
          </div>

          <div className="flex items-center gap-2">
            <a
              href="/assets/aistudio/R22_CSM_syllabus_d8f73cb4.pdf"
              download="R22_CSM_syllabus_d8f73cb4.pdf"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold transition-colors"
            >
              <Download className="w-3.5 h-3.5 text-indigo-400" />
              <span className="hidden sm:inline">Download PDF</span>
            </a>

            <a
              href="/assets/aistudio/R22_CSM_syllabus_d8f73cb4.pdf"
              target="_blank"
              rel="noreferrer"
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 transition-colors"
              title="Open PDF in new browser tab"
            >
              <ExternalLink className="w-4 h-4" />
            </a>

            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-slate-800 hover:bg-rose-900/60 text-slate-300 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Quick Page Navigator Buttons Bar */}
        <div className="bg-slate-100 border-b border-slate-200 px-4 py-2.5 flex items-center gap-2 overflow-x-auto no-scrollbar text-xs">
          <span className="font-bold text-slate-500 shrink-0 text-[11px] uppercase tracking-wide">Jump to:</span>
          {quickNav.map(nav => (
            <button
              key={nav.page}
              onClick={() => setCurrentPage(nav.page)}
              className={`px-2.5 py-1 rounded-lg shrink-0 font-medium transition-colors ${
                currentPage === nav.page
                  ? 'bg-indigo-600 text-white font-bold'
                  : 'bg-white text-slate-700 hover:bg-slate-200 border border-slate-200'
              }`}
            >
              {nav.label.split(':')[1]?.trim() || `Page ${nav.page}`}
            </button>
          ))}
        </div>

        {/* PDF Frame */}
        <div className="flex-1 bg-slate-100 p-2 sm:p-4 overflow-hidden">
          <iframe
            key={currentPage}
            src={pdfUrl}
            title="Official R22 CSM Syllabus PDF"
            className="w-full h-full rounded-2xl border border-slate-300 bg-white shadow-xs"
          />
        </div>

        {/* Footer */}
        <div className="p-3 bg-white border-t border-slate-200 flex items-center justify-between text-xs text-slate-600 px-5">
          <span>Gayatri Vidya Parishad College for Degree and PG Courses (Autonomous) • Dept. of CSE (AI&ML)</span>
          <span className="font-mono font-bold text-indigo-700">Currently viewing Page {currentPage}</span>
        </div>

      </div>
    </div>
  );
};

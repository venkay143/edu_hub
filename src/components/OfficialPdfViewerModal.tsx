import React, { useState, useEffect, useRef } from 'react';
import { 
  X, 
  Download, 
  ExternalLink, 
  ChevronLeft, 
  ChevronRight, 
  ZoomIn, 
  ZoomOut, 
  RotateCcw, 
  FileText, 
  Sparkles,
  AlertCircle,
  Loader2,
  BookOpen
} from 'lucide-react';
import * as pdfjsLib from 'pdfjs-dist';

// Configure PDF.js worker
pdfjsLib.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjsLib.version}/build/pdf.worker.min.mjs`;

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
  const [totalPages, setTotalPages] = useState<number>(143);
  const [scale, setScale] = useState<number>(1.4);
  const [loading, setLoading] = useState<boolean>(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const pdfDocRef = useRef<pdfjsLib.PDFDocumentProxy | null>(null);
  const renderTaskRef = useRef<any>(null);

  const quickNav = [
    { page: 87, label: 'p.87: III-I Structure' },
    { page: 88, label: 'p.88: CSM3101 DWDM' },
    { page: 90, label: 'p.90: CSM3102 OOSE' },
    { page: 93, label: 'p.93: CSM3103 Networks' },
    { page: 95, label: 'p.95: CSM3104 AI' },
    { page: 97, label: 'p.97: CSM3105 Data Science' },
    { page: 99, label: 'p.99: CSM3105 Expert Systems' },
    { page: 101, label: 'p.101: CSM3105 Pattern Rec' },
    { page: 103, label: 'p.103: CSM3106 CN Lab' },
    { page: 105, label: 'p.105: CSM3107 SE Lab' },
    { page: 108, label: 'p.108: CSM3108 Web Tech' },
    { page: 110, label: 'p.110: CSM3109 Soft Skills' },
    { page: 112, label: 'p.112: Honors Recommender' },
    { page: 81, label: 'p.81: CSM2208 Design Thinking' },
  ];

  const pdfPath = '/assets/aistudio/R22_CSM_syllabus_d8f73cb4.pdf';

  useEffect(() => {
    setCurrentPage(initialPage);
  }, [initialPage]);

  // Load the PDF document
  useEffect(() => {
    let isCancelled = false;
    const loadDocument = async () => {
      try {
        setLoading(true);
        setErrorMessage(null);
        const loadingTask = pdfjsLib.getDocument({
          url: pdfPath,
          cMapUrl: 'https://unpkg.com/pdfjs-dist/cmaps/',
          cMapPacked: true,
        });
        const doc = await loadingTask.promise;
        if (!isCancelled) {
          pdfDocRef.current = doc;
          setTotalPages(doc.numPages);
          setLoading(false);
        }
      } catch (err: any) {
        console.error('Error loading PDF:', err);
        if (!isCancelled) {
          setErrorMessage('Could not load PDF directly in canvas. You can open in a new tab or download.');
          setLoading(false);
        }
      }
    };

    if (isOpen) {
      loadDocument();
    }

    return () => {
      isCancelled = true;
    };
  }, [isOpen]);

  // Render the current page to Canvas
  useEffect(() => {
    if (!isOpen || !pdfDocRef.current || loading) return;

    let isCancelled = false;

    const renderPage = async () => {
      try {
        if (renderTaskRef.current) {
          renderTaskRef.current.cancel();
        }

        const page = await pdfDocRef.current!.getPage(currentPage);
        if (isCancelled) return;

        const canvas = canvasRef.current;
        if (!canvas) return;

        const context = canvas.getContext('2d');
        if (!context) return;

        const viewport = page.getViewport({ scale });
        const outputScale = window.devicePixelRatio || 1;

        canvas.width = Math.floor(viewport.width * outputScale);
        canvas.height = Math.floor(viewport.height * outputScale);
        canvas.style.width = `${Math.floor(viewport.width)}px`;
        canvas.style.height = `${Math.floor(viewport.height)}px`;

        const transform = outputScale !== 1 ? [outputScale, 0, 0, outputScale, 0, 0] : undefined;

        const renderContext = {
          canvasContext: context,
          viewport,
          transform,
          canvas,
        };

        const task = page.render(renderContext);
        renderTaskRef.current = task;
        await task.promise;
      } catch (err: any) {
        if (err?.name !== 'RenderingCancelledException') {
          console.error('Page render error:', err);
        }
      }
    };

    renderPage();

    return () => {
      isCancelled = true;
      if (renderTaskRef.current) {
        renderTaskRef.current.cancel();
      }
    };
  }, [isOpen, currentPage, scale, loading]);

  if (!isOpen) return null;

  const handlePrevPage = () => {
    if (currentPage > 1) setCurrentPage(currentPage - 1);
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) setCurrentPage(currentPage + 1);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/85 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4 overflow-y-auto">
      <div className="bg-white w-full max-w-5xl rounded-3xl shadow-2xl border border-slate-200 overflow-hidden my-4 flex flex-col h-[94vh]">
        
        {/* Top Control Bar */}
        <div className="p-4 sm:p-5 border-b border-slate-200 bg-slate-900 text-white flex items-center justify-between flex-wrap gap-3 shrink-0">
          <div className="space-y-0.5">
            <div className="flex items-center gap-2">
              <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-sm bg-indigo-500/20 text-indigo-300 border border-indigo-400/30">
                Official R-22 Syllabus (GVPCDPGC-A)
              </span>
              <span className="text-xs text-slate-400">Pages 81–114</span>
            </div>
            <h2 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
              <FileText className="w-5 h-5 text-indigo-400" />
              <span>Canvas PDF Viewer (No Chrome Block)</span>
            </h2>
          </div>

          <div className="flex items-center gap-2">
            {/* Direct Open in new tab link */}
            <a
              href={pdfPath}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition-colors shadow-xs"
              title="Open full PDF file in a new browser tab"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span>Open in New Tab</span>
            </a>

            {/* Download link */}
            <a
              href={pdfPath}
              download="R22_CSM_syllabus_GVP.pdf"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold transition-colors"
              title="Download syllabus file to your device"
            >
              <Download className="w-3.5 h-3.5 text-indigo-400" />
              <span className="hidden sm:inline">Download</span>
            </a>

            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-slate-800 hover:bg-rose-900/60 text-slate-300 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Secondary Navigation & Page Controls */}
        <div className="bg-slate-100 border-b border-slate-200 px-4 py-2.5 flex items-center justify-between flex-wrap gap-2 text-xs shrink-0">
          
          {/* Page Selector & Prev/Next */}
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrevPage}
              disabled={currentPage <= 1}
              className="p-1.5 rounded-lg bg-white border border-slate-200 hover:bg-slate-50 disabled:opacity-40 transition-colors"
              title="Previous Page"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            <div className="flex items-center gap-1 font-mono font-bold bg-white px-3 py-1 rounded-lg border border-slate-200 text-slate-800">
              <span>Page</span>
              <input
                type="number"
                min={1}
                max={totalPages}
                value={currentPage}
                onChange={(e) => {
                  const val = parseInt(e.target.value, 10);
                  if (!isNaN(val) && val >= 1 && val <= totalPages) {
                    setCurrentPage(val);
                  }
                }}
                className="w-12 text-center border-b border-slate-300 focus:outline-hidden font-bold text-indigo-600"
              />
              <span className="text-slate-500">/ {totalPages}</span>
            </div>

            <button
              onClick={handleNextPage}
              disabled={currentPage >= totalPages}
              className="p-1.5 rounded-lg bg-white border border-slate-200 hover:bg-slate-50 disabled:opacity-40 transition-colors"
              title="Next Page"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          {/* Zoom controls */}
          <div className="flex items-center gap-1 bg-white p-1 rounded-lg border border-slate-200 text-slate-700">
            <button
              onClick={() => setScale(Math.max(0.8, scale - 0.2))}
              className="p-1 hover:bg-slate-100 rounded-sm"
              title="Zoom Out"
            >
              <ZoomOut className="w-3.5 h-3.5" />
            </button>
            <span className="font-mono text-[11px] px-1 font-bold">{Math.round(scale * 100)}%</span>
            <button
              onClick={() => setScale(Math.min(2.5, scale + 0.2))}
              className="p-1 hover:bg-slate-100 rounded-sm"
              title="Zoom In"
            >
              <ZoomIn className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setScale(1.4)}
              className="p-1 hover:bg-slate-100 rounded-sm text-slate-400 hover:text-slate-700"
              title="Reset Zoom"
            >
              <RotateCcw className="w-3 h-3" />
            </button>
          </div>

          {/* Direct browser notice */}
          <div className="text-[11px] text-slate-600 hidden md:block">
            Rendered in HTML5 Canvas • Immune to Chrome embedding blocks
          </div>
        </div>

        {/* Quick Subject Jump Bar */}
        <div className="bg-slate-50 border-b border-slate-200 px-4 py-2 flex items-center gap-1.5 overflow-x-auto no-scrollbar text-xs shrink-0">
          <span className="font-bold text-slate-500 shrink-0 text-[10px] uppercase tracking-wider">Semester Topics:</span>
          {quickNav.map(nav => (
            <button
              key={nav.page}
              onClick={() => setCurrentPage(nav.page)}
              className={`px-2.5 py-1 rounded-lg shrink-0 font-medium transition-all text-xs ${
                currentPage === nav.page
                  ? 'bg-indigo-600 text-white font-bold shadow-xs'
                  : 'bg-white text-slate-700 hover:bg-slate-200 border border-slate-200'
              }`}
            >
              {nav.label}
            </button>
          ))}
        </div>

        {/* Canvas Display Viewport */}
        <div className="flex-1 bg-slate-200/60 overflow-auto p-4 sm:p-6 flex flex-col items-center justify-start min-h-0">
          {loading && (
            <div className="my-auto flex flex-col items-center gap-3 p-8 text-slate-600">
              <Loader2 className="w-8 h-8 text-indigo-600 animate-spin" />
              <p className="text-sm font-semibold">Loading Official Syllabus PDF into Canvas...</p>
            </div>
          )}

          {errorMessage && (
            <div className="my-auto max-w-md p-6 bg-white rounded-2xl border border-rose-200 shadow-md text-center space-y-3">
              <AlertCircle className="w-8 h-8 text-rose-600 mx-auto" />
              <h3 className="font-bold text-slate-900">PDF Notice</h3>
              <p className="text-xs text-slate-600">{errorMessage}</p>
              <div className="flex justify-center gap-2 pt-2">
                <a
                  href={pdfPath}
                  target="_blank"
                  rel="noreferrer"
                  className="px-4 py-2 bg-indigo-600 text-white rounded-xl text-xs font-bold"
                >
                  Open PDF in New Window
                </a>
              </div>
            </div>
          )}

          <div className="my-auto shadow-2xl rounded-sm overflow-hidden bg-white border border-slate-300">
            <canvas ref={canvasRef} className="block max-w-full h-auto" />
          </div>
        </div>

        {/* Footer */}
        <div className="p-3 bg-white border-t border-slate-200 flex items-center justify-between text-xs text-slate-600 px-5 shrink-0">
          <span className="truncate">Gayatri Vidya Parishad College for Degree and PG Courses (Autonomous)</span>
          <span className="font-mono font-bold text-indigo-700 shrink-0">Page {currentPage} of {totalPages}</span>
        </div>

      </div>
    </div>
  );
};

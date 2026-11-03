import React, { useState, useEffect } from 'react';
import { 
  X, 
  Download, 
  Printer, 
  ZoomIn, 
  ZoomOut, 
  RotateCcw, 
  BookOpen, 
  FileText, 
  CheckCircle2, 
  ExternalLink,
  Layers
} from 'lucide-react';
import { FacultyMaterial, Subject } from '../types';
import { getFileBlob } from '../utils/storage';

interface DocumentViewerModalProps {
  material: FacultyMaterial;
  subject?: Subject;
  isOpen: boolean;
  onClose: () => void;
}

export const DocumentViewerModal: React.FC<DocumentViewerModalProps> = ({
  material,
  subject,
  isOpen,
  onClose,
}) => {
  const [zoomLevel, setZoomLevel] = useState<number>(100);
  const [blobUrl, setBlobUrl] = useState<string | null>(null);

  // If this material has an uploaded file in IndexedDB
  useEffect(() => {
    let activeUrl: string | null = null;
    const loadBlob = async () => {
      if (material.fileDataUrl && material.fileDataUrl.startsWith('blob:')) {
        setBlobUrl(material.fileDataUrl);
      } else {
        const file = await getFileBlob(material.id);
        if (file) {
          activeUrl = URL.createObjectURL(file);
          setBlobUrl(activeUrl);
        } else {
          setBlobUrl(null);
        }
      }
    };
    if (isOpen) {
      loadBlob();
    }
    return () => {
      if (activeUrl) {
        URL.revokeObjectURL(activeUrl);
      }
    };
  }, [material, isOpen]);

  if (!isOpen) return null;

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadText = () => {
    const textContent = `SMART EDUCATION HUB - FACULTY MATERIAL
Title: ${material.title}
Subject: ${subject?.name || ''} (${subject?.code || ''})
Author: ${material.author}
Date: ${material.dateAdded}

SUMMARY:
${material.contentSummary}

KEY FOCUS POINTS:
${(material.keyPoints || []).map((kp, i) => `${i + 1}. ${kp}`).join('\n')}
`;
    const blob = new Blob([textContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${material.title.replace(/\s+/g, '_')}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/80 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4 overflow-y-auto">
      <div className="bg-white w-full max-w-4xl rounded-3xl shadow-2xl border border-slate-200 overflow-hidden my-6 flex flex-col max-h-[92vh]">
        
        {/* Top Control Bar */}
        <div className="p-4 sm:p-5 border-b border-slate-200 bg-slate-900 text-white flex items-center justify-between flex-wrap gap-3">
          <div className="space-y-0.5">
            <div className="flex items-center gap-2">
              <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-sm bg-indigo-500/20 text-indigo-300 border border-indigo-400/30">
                {material.type === 'lecture_notes' ? 'Faculty Lecture Notes' : material.type === 'cheat_sheet' ? 'Formula Cheat Sheet' : 'Study Document'}
              </span>
              {material.pages && <span className="text-xs text-slate-400">{material.pages} Pages</span>}
            </div>
            <h2 className="text-base sm:text-lg font-bold text-white line-clamp-1">
              {material.title}
            </h2>
          </div>

          <div className="flex items-center gap-2">
            {/* Zoom Controls */}
            <div className="hidden sm:flex items-center gap-1 bg-slate-800 p-1 rounded-xl text-slate-300 text-xs">
              <button
                onClick={() => setZoomLevel(Math.max(80, zoomLevel - 15))}
                className="p-1 hover:text-white rounded-sm"
                title="Zoom Out"
              >
                <ZoomOut className="w-3.5 h-3.5" />
              </button>
              <span className="font-mono px-1">{zoomLevel}%</span>
              <button
                onClick={() => setZoomLevel(Math.min(150, zoomLevel + 15))}
                className="p-1 hover:text-white rounded-sm"
                title="Zoom In"
              >
                <ZoomIn className="w-3.5 h-3.5" />
              </button>
            </div>

            <button
              onClick={handlePrint}
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 transition-colors"
              title="Print Document"
            >
              <Printer className="w-4 h-4" />
            </button>

            <button
              onClick={handleDownloadText}
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 transition-colors"
              title="Download Document"
            >
              <Download className="w-4 h-4" />
            </button>

            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-slate-800 hover:bg-rose-900/60 text-slate-300 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content Viewport */}
        <div className="flex-1 overflow-y-auto p-6 sm:p-8 space-y-6 print:p-0 bg-slate-50/50">
          
          {/* If uploaded PDF blob URL is available */}
          {blobUrl ? (
            <div className="space-y-3">
              <div className="flex items-center justify-between bg-white p-3 rounded-xl border border-slate-200">
                <span className="text-xs text-slate-600 font-medium">
                  Viewing uploaded document. If Chrome blocks the inline preview, open it in a new window:
                </span>
                <a
                  href={blobUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span>Open in New Tab</span>
                </a>
              </div>
              <div className="w-full h-[65vh] rounded-2xl overflow-hidden border border-slate-200 bg-white shadow-xs">
                <iframe
                  src={blobUrl}
                  title={material.title}
                  className="w-full h-full border-none"
                />
              </div>
            </div>
          ) : (
            /* Document Reader Template */
            <div 
              className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-6 transition-all"
              style={{ fontSize: `${zoomLevel}%` }}
            >
              {/* Document Metadata Banner */}
              <div className="border-b border-slate-200 pb-5 space-y-2">
                <div className="flex items-center justify-between text-xs text-slate-700">
                  <span className="font-bold text-indigo-600">{subject?.name} ({subject?.code})</span>
                  <span>Published: {material.dateAdded}</span>
                </div>
                <h1 className="text-xl sm:text-2xl font-black text-slate-900">
                  {material.title}
                </h1>
                <p className="text-xs sm:text-sm text-slate-600">
                  Authored by: <span className="font-semibold text-slate-800">{material.author}</span>
                </p>
              </div>

              {/* Document Overview */}
              <div className="space-y-2">
                <h3 className="text-xs uppercase font-extrabold tracking-wider text-slate-700">
                  Summary & Core Scope
                </h3>
                <p className="text-sm text-slate-700 leading-relaxed bg-slate-50 p-4 rounded-xl border border-slate-200 font-sans">
                  {material.contentSummary}
                </p>
              </div>

              {/* Key Takeaways & Exam Tips */}
              {material.keyPoints && material.keyPoints.length > 0 && (
                <div className="space-y-3">
                  <h3 className="text-xs uppercase font-extrabold tracking-wider text-indigo-700 flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-indigo-600" />
                    High-Yield Revision Points & Key Formulas
                  </h3>
                  <div className="space-y-2">
                    {material.keyPoints.map((point, idx) => (
                      <div 
                        key={idx}
                        className="p-3.5 rounded-xl border border-slate-200 bg-linear-to-r from-indigo-50/40 to-white flex items-start gap-3"
                      >
                        <span className="w-5 h-5 rounded-full bg-indigo-100 text-indigo-700 font-bold text-xs flex items-center justify-center shrink-0 mt-0.5">
                          {idx + 1}
                        </span>
                        <div className="font-mono text-xs sm:text-sm text-slate-800 leading-relaxed font-semibold">
                          {point}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Helpful Student Revision Note */}
              <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs space-y-1">
                <span className="font-bold block">💡 Faculty Advice for Semester Exams:</span>
                <p>Review these notes alongside the 2024 and 2023 previous examination papers. Always memorize standard terminology and write step-by-step proofs for full marks.</p>
              </div>
            </div>
          )}

        </div>

        {/* Modal Bottom Footer */}
        <div className="p-3.5 border-t border-slate-200 bg-white flex items-center justify-between text-xs text-slate-700">
          <span>Smart Education Hub • Semester Examination Portal</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl bg-slate-900 text-white font-bold hover:bg-slate-800"
          >
            Close Viewer
          </button>
        </div>

      </div>
    </div>
  );
};

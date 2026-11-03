import React, { useState } from 'react';
import { 
  X, 
  Upload, 
  FileText, 
  CheckCircle2, 
  AlertCircle,
  FileUp,
  Sparkles
} from 'lucide-react';
import { Subject, FacultyMaterial } from '../types';
import { storeFileBlob } from '../utils/storage';
import { playChime } from '../utils/audio';

interface UploadMaterialModalProps {
  subjects: Subject[];
  initialSubjectId?: string;
  isOpen: boolean;
  onClose: () => void;
  onAddMaterial: (subjectId: string, newMaterial: FacultyMaterial) => void;
}

export const UploadMaterialModal: React.FC<UploadMaterialModalProps> = ({
  subjects,
  initialSubjectId,
  isOpen,
  onClose,
  onAddMaterial,
}) => {
  const [selectedSubjectId, setSelectedSubjectId] = useState<string>(initialSubjectId || subjects[0]?.id || '');
  const [title, setTitle] = useState('');
  const [materialType, setMaterialType] = useState<'lecture_notes' | 'cheat_sheet' | 'viva' | 'custom_pdf'>('lecture_notes');
  const [unitId, setUnitId] = useState<string>('');
  const [author, setAuthor] = useState('Faculty Member');
  const [summary, setSummary] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [keyPointsInput, setKeyPointsInput] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const currentSubject = subjects.find(s => s.id === selectedSubjectId) || subjects[0];

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selected = e.target.files[0];
      setFile(selected);
      if (!title) {
        setTitle(selected.name.replace(/\.[^/.]+$/, ''));
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !selectedSubjectId) return;

    setIsSubmitting(true);
    const materialId = `custom-mat-${Date.now()}`;

    let fileUrl: string | undefined = undefined;
    if (file) {
      // Store in IndexedDB
      await storeFileBlob(materialId, file);
      fileUrl = URL.createObjectURL(file);
    }

    const keyPoints = keyPointsInput
      .split('\n')
      .map(k => k.trim())
      .filter(k => k.length > 0);

    const newMaterial: FacultyMaterial = {
      id: materialId,
      title: title.trim(),
      unitId: unitId || undefined,
      type: materialType,
      author: author.trim() || 'Subject Faculty',
      pages: file ? Math.max(1, Math.round(file.size / 45000)) : 1,
      contentSummary: summary.trim() || `Material uploaded for examination preparation in ${currentSubject?.name}.`,
      keyPoints: keyPoints.length > 0 ? keyPoints : undefined,
      fileName: file?.name,
      fileDataUrl: fileUrl,
      dateAdded: new Date().toISOString().split('T')[0],
      isImportant: true,
    };

    onAddMaterial(selectedSubjectId, newMaterial);
    playChime('success');
    setIsSubmitting(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/80 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="bg-white w-full max-w-xl rounded-3xl shadow-2xl border border-slate-200 overflow-hidden my-6">
        
        {/* Header */}
        <div className="p-5 border-b border-slate-200 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-indigo-600 flex items-center justify-center text-white">
              <Upload className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">Upload Faculty Material or Paper</h2>
              <p className="text-xs text-slate-400">Stores directly inside your browser database (No server needed)</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs sm:text-sm">
          
          {/* Target Subject */}
          <div>
            <label className="block font-bold text-slate-700 mb-1">Select Subject</label>
            <select
              value={selectedSubjectId}
              onChange={(e) => {
                setSelectedSubjectId(e.target.value);
                setUnitId('');
              }}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-indigo-500 font-medium"
            >
              {subjects.map(sub => (
                <option key={sub.id} value={sub.id}>
                  {sub.code}: {sub.name}
                </option>
              ))}
            </select>
          </div>

          {/* Material Category & Unit */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Material Type</label>
              <select
                value={materialType}
                onChange={(e) => setMaterialType(e.target.value as any)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-indigo-500 font-medium"
              >
                <option value="lecture_notes">Faculty Lecture Notes</option>
                <option value="cheat_sheet">Formula / Cheat Sheet</option>
                <option value="viva">Viva / 2-Mark Guide</option>
                <option value="custom_pdf">Model Question Paper / PDF</option>
              </select>
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Associated Unit (Optional)</label>
              <select
                value={unitId}
                onChange={(e) => setUnitId(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-indigo-500 font-medium"
              >
                <option value="">All Units / General</option>
                {currentSubject?.units.map(u => (
                  <option key={u.id} value={u.id}>
                    Unit {u.unitNumber}: {u.title}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Title & Author */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Document / Paper Title *</label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Unit 3 Dynamic Programming Notes"
                className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Faculty / Author</label>
              <input
                type="text"
                value={author}
                onChange={(e) => setAuthor(e.target.value)}
                placeholder="e.g. Dr. K. Ramanathan"
                className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>

          {/* File Picker */}
          <div>
            <label className="block font-bold text-slate-700 mb-1">Attach PDF or Document File</label>
            <div className="border-2 border-dashed border-slate-200 hover:border-indigo-400 rounded-2xl p-4 text-center cursor-pointer transition-colors bg-slate-50/50">
              <input
                type="file"
                accept=".pdf,.doc,.docx,.txt"
                onChange={handleFileChange}
                className="hidden"
                id="file-upload"
              />
              <label htmlFor="file-upload" className="cursor-pointer block space-y-1">
                <FileUp className="w-8 h-8 text-indigo-600 mx-auto" />
                <p className="text-xs font-bold text-slate-800">
                  {file ? file.name : 'Click to select PDF or Lecture Document'}
                </p>
                <p className="text-[11px] text-slate-600">
                  {file ? `${(file.size / 1024 / 1024).toFixed(2)} MB • Ready to save` : 'Supports PDF, Word, and Text documents'}
                </p>
              </label>
            </div>
          </div>

          {/* Summary */}
          <div>
            <label className="block font-bold text-slate-700 mb-1">Summary / Key Topics Covered</label>
            <textarea
              rows={2}
              value={summary}
              onChange={(e) => setSummary(e.target.value)}
              placeholder="Brief summary of what this document covers..."
              className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          {/* Key Bullet Points */}
          <div>
            <label className="block font-bold text-slate-700 mb-1">Key Formulas / Revision Takeaways (One per line)</label>
            <textarea
              rows={2}
              value={keyPointsInput}
              onChange={(e) => setKeyPointsInput(e.target.value)}
              placeholder="e.g. Master Theorem Case 2: T(n) = Θ(n log n)&#10;LCS table arrow directions"
              className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-indigo-500 font-mono text-xs"
            />
          </div>

          {/* Submit buttons */}
          <div className="pt-2 flex items-center justify-end gap-2 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold shadow-md shadow-indigo-600/20 disabled:opacity-50"
            >
              {isSubmitting ? 'Saving...' : 'Add to Subject Hub'}
            </button>
          </div>
        </form>

      </div>
    </div>
  );
};

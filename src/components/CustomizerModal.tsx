import React, { useState } from 'react';
import { 
  X, 
  Settings, 
  Save, 
  RotateCcw, 
  GraduationCap, 
  Calendar, 
  BookOpen,
  Sparkles
} from 'lucide-react';
import { CourseInfo, Subject } from '../types';
import { playChime } from '../utils/audio';

interface CustomizerModalProps {
  courseInfo: CourseInfo;
  subjects: Subject[];
  isOpen: boolean;
  onClose: () => void;
  onSave: (newCourseInfo: CourseInfo, updatedSubjects: Subject[]) => void;
}

export const CustomizerModal: React.FC<CustomizerModalProps> = ({
  courseInfo,
  subjects,
  isOpen,
  onClose,
  onSave,
}) => {
  const [course, setCourse] = useState(courseInfo.course);
  const [branch, setBranch] = useState(courseInfo.branch);
  const [semester, setSemester] = useState(courseInfo.semester);
  const [universityName, setUniversityName] = useState(courseInfo.universityName);
  const [examStartDate, setExamStartDate] = useState(courseInfo.examStartDate);

  // Editable subject details
  const [subjectNames, setSubjectNames] = useState(
    subjects.map(s => ({ id: s.id, name: s.name, code: s.code, facultyName: s.facultyName }))
  );

  if (!isOpen) return null;

  const handleSubjectChange = (id: string, field: 'name' | 'code' | 'facultyName', val: string) => {
    setSubjectNames(prev =>
      prev.map(item => item.id === id ? { ...item, [field]: val } : item)
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const updatedCourseInfo: CourseInfo = {
      ...courseInfo,
      course,
      branch,
      semester,
      universityName,
      examStartDate,
    };

    const updatedSubjects: Subject[] = subjects.map(sub => {
      const match = subjectNames.find(sn => sn.id === sub.id);
      if (match) {
        return {
          ...sub,
          name: match.name,
          code: match.code,
          facultyName: match.facultyName,
        };
      }
      return sub;
    });

    onSave(updatedCourseInfo, updatedSubjects);
    playChime('success');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/80 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl border border-slate-200 overflow-hidden my-6">
        
        {/* Header */}
        <div className="p-5 border-b border-slate-200 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-indigo-600 flex items-center justify-center text-white">
              <Settings className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">Hub & Subject Customizer</h2>
              <p className="text-xs text-slate-400">Match your college course, semester, exam date, and 5 subjects</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Customization Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6 text-xs sm:text-sm max-h-[75vh] overflow-y-auto">
          
          {/* Course & College Details */}
          <div className="space-y-3">
            <h3 className="font-extrabold text-slate-900 text-sm flex items-center gap-2 border-b border-slate-100 pb-2">
              <GraduationCap className="w-4 h-4 text-indigo-600" />
              <span>Step 1: Course & Examination Details</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block font-bold text-slate-700 mb-1">University / College Name</label>
                <input
                  type="text"
                  required
                  value={universityName}
                  onChange={(e) => setUniversityName(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-indigo-500 font-medium"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Course Name</label>
                <input
                  type="text"
                  required
                  value={course}
                  onChange={(e) => setCourse(e.target.value)}
                  placeholder="e.g. B.Tech / BCA / MCA"
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-indigo-500 font-medium"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Branch / Department</label>
                <input
                  type="text"
                  required
                  value={branch}
                  onChange={(e) => setBranch(e.target.value)}
                  placeholder="e.g. Computer Science & Engineering"
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-indigo-500 font-medium"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Semester</label>
                <input
                  type="text"
                  required
                  value={semester}
                  onChange={(e) => setSemester(e.target.value)}
                  placeholder="e.g. Semester V (Odd Semester)"
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-indigo-500 font-medium"
                />
              </div>
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Semester Examination Start Date (For Countdown)</label>
              <input
                type="date"
                required
                value={examStartDate}
                onChange={(e) => setExamStartDate(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-indigo-500 font-medium"
              />
            </div>
          </div>

          {/* 5 Subjects Details */}
          <div className="space-y-3 pt-2">
            <h3 className="font-extrabold text-slate-900 text-sm flex items-center gap-2 border-b border-slate-100 pb-2">
              <BookOpen className="w-4 h-4 text-indigo-600" />
              <span>Step 2: Customize Your Five Subjects</span>
            </h3>

            <div className="space-y-3">
              {subjectNames.map((sn, idx) => (
                <div key={sn.id} className="p-3.5 rounded-2xl border border-slate-200 bg-slate-50/50 space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded-lg bg-indigo-100 text-indigo-700 font-black text-xs flex items-center justify-center">
                      {idx + 1}
                    </span>
                    <span className="font-extrabold text-slate-800 text-xs uppercase tracking-wide">
                      Subject {idx + 1}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-12 gap-2">
                    <div className="sm:col-span-3">
                      <input
                        type="text"
                        value={sn.code}
                        onChange={(e) => handleSubjectChange(sn.id, 'code', e.target.value)}
                        placeholder="Code (e.g. CS501)"
                        className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 font-mono text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
                      />
                    </div>
                    <div className="sm:col-span-5">
                      <input
                        type="text"
                        value={sn.name}
                        onChange={(e) => handleSubjectChange(sn.id, 'name', e.target.value)}
                        placeholder="Subject Name"
                        className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 text-xs font-semibold focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
                      />
                    </div>
                    <div className="sm:col-span-4">
                      <input
                        type="text"
                        value={sn.facultyName}
                        onChange={(e) => handleSubjectChange(sn.id, 'facultyName', e.target.value)}
                        placeholder="Faculty / Instructor"
                        className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Action buttons */}
          <div className="pt-4 border-t border-slate-200 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold shadow-md shadow-indigo-600/20 flex items-center gap-1.5"
            >
              <Save className="w-4 h-4" />
              <span>Save & Update Hub</span>
            </button>
          </div>
        </form>

      </div>
    </div>
  );
};

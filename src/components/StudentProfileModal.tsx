import React, { useState } from 'react';
import { 
  X, 
  User, 
  Lock, 
  GraduationCap, 
  Save, 
  LogOut, 
  KeyRound, 
  CheckCircle2, 
  Award, 
  Clock, 
  Sparkles,
  ArrowRightLeft
} from 'lucide-react';
import { StudentUser } from '../types';
import { updateStudentProfile } from '../utils/studentAuth';

interface StudentProfileModalProps {
  student: StudentUser;
  isOpen: boolean;
  onClose: () => void;
  onUpdateStudent: (updated: StudentUser) => void;
  onLogout: () => void;
  readinessPct?: number;
  completedTopicsCount?: number;
}

export const StudentProfileModal: React.FC<StudentProfileModalProps> = ({
  student,
  isOpen,
  onClose,
  onUpdateStudent,
  onLogout,
  readinessPct = 0,
  completedTopicsCount = 0,
}) => {
  const [name, setName] = useState<string>(student.name);
  const [oldPassword, setOldPassword] = useState<string>('');
  const [newPassword, setNewPassword] = useState<string>('');
  const [confirmPassword, setConfirmPassword] = useState<string>('');
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  if (!isOpen) return null;

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    setFeedback(null);

    // If attempting to change password
    if (newPassword || oldPassword) {
      const currentPass = student.customPassword || student.rollNumber;
      if (oldPassword !== currentPass) {
        setFeedback({ type: 'error', message: 'Current password does not match.' });
        return;
      }
      if (newPassword.length < 4) {
        setFeedback({ type: 'error', message: 'New password must be at least 4 characters.' });
        return;
      }
      if (newPassword !== confirmPassword) {
        setFeedback({ type: 'error', message: 'New password and confirm password do not match.' });
        return;
      }
    }

    const updated = updateStudentProfile(
      student.rollNumber, 
      name, 
      newPassword || undefined
    );

    if (updated) {
      onUpdateStudent(updated);
      setFeedback({ type: 'success', message: 'Profile details saved successfully!' });
      setOldPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setTimeout(() => {
        setFeedback(null);
      }, 3000);
    }
  };

  const rollNumberInt = parseInt(student.rollNumber, 10);
  const classSerial = rollNumberInt - 5241412000;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in duration-200">
      <div 
        className="bg-white rounded-3xl border border-slate-200 w-full max-w-lg shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-linear-to-r from-slate-900 to-indigo-950 text-white p-5 sm:p-6 relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white rounded-xl hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-indigo-600 text-white font-extrabold text-xl flex items-center justify-center shadow-lg shadow-indigo-600/30">
              #{student.rollNumber.slice(-2)}
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="text-xl font-extrabold text-white">
                  {student.name}
                </h3>
                <span className="text-xs font-mono font-bold px-2 py-0.5 rounded-md bg-indigo-500/20 text-indigo-300 border border-indigo-400/30">
                  {student.rollNumber}
                </span>
              </div>
              <p className="text-xs text-slate-300 mt-1">
                Seat #{classSerial} of 70 • {student.section} • CSE (AI & ML)
              </p>
            </div>
          </div>

          {/* Quick Stats Pill */}
          <div className="mt-4 pt-3 border-t border-white/10 grid grid-cols-2 gap-3 text-center">
            <div className="bg-white/5 rounded-xl p-2">
              <span className="text-xs text-slate-400 block">Exam Readiness</span>
              <span className="text-lg font-black text-emerald-400">{readinessPct}%</span>
            </div>
            <div className="bg-white/5 rounded-xl p-2">
              <span className="text-xs text-slate-400 block">Topics Mastered</span>
              <span className="text-lg font-black text-indigo-300">{completedTopicsCount} topics</span>
            </div>
          </div>
        </div>

        {/* Body Content */}
        <form onSubmit={handleSaveProfile} className="p-5 sm:p-6 space-y-5">
          {feedback && (
            <div className={`p-3 rounded-xl text-xs font-medium flex items-center gap-2 ${
              feedback.type === 'success' 
                ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' 
                : 'bg-rose-50 text-rose-800 border border-rose-200'
            }`}>
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>{feedback.message}</span>
            </div>
          )}

          {/* Name Editor */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
              <User className="w-3.5 h-3.5 text-indigo-600" />
              <span>Student Display Name</span>
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter your full name"
              className="w-full text-sm px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-indigo-500 text-slate-900"
              required
            />
          </div>

          {/* Change Password (Optional) */}
          <div className="space-y-3 pt-2 border-t border-slate-100">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                <KeyRound className="w-3.5 h-3.5 text-indigo-600" />
                <span>Change Password (Optional)</span>
              </span>
              <span className="text-[11px] text-slate-500">
                Default: {student.rollNumber}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <input
                  type="password"
                  value={oldPassword}
                  onChange={(e) => setOldPassword(e.target.value)}
                  placeholder="Current Password"
                  className="w-full text-xs px-3 py-2 rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              <div>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="New Password"
                  className="w-full text-xs px-3 py-2 rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>
            {newPassword && (
              <div>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Confirm New Password"
                  className="w-full text-xs px-3 py-2 rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-3">
            <button
              type="button"
              onClick={onLogout}
              className="px-4 py-2.5 rounded-xl border border-rose-200 bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-bold transition-colors flex items-center gap-1.5"
            >
              <LogOut className="w-4 h-4" />
              <span>Sign Out / Switch</span>
            </button>

            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-extrabold transition-colors flex items-center gap-1.5 shadow-md shadow-indigo-600/20"
            >
              <Save className="w-4 h-4" />
              <span>Save Changes</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

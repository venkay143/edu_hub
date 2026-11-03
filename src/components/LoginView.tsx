import React, { useState } from 'react';
import { 
  GraduationCap, 
  Lock, 
  User, 
  Eye, 
  EyeOff, 
  ArrowRight, 
  Search, 
  CheckCircle2, 
  Users, 
  AlertCircle
} from 'lucide-react';
import { StudentUser } from '../types';
import { 
  MIN_ROLL, 
  MAX_ROLL, 
  TOTAL_STUDENTS, 
  loadClassStudents, 
  authenticateStudent 
} from '../utils/studentAuth';

interface LoginViewProps {
  onLoginSuccess: (student: StudentUser) => void;
}

export const LoginView: React.FC<LoginViewProps> = ({ onLoginSuccess }) => {
  const [loginId, setLoginId] = useState<string>('5241412001');
  const [password, setPassword] = useState<string>('5241412001');
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [showRosterModal, setShowRosterModal] = useState<boolean>(false);
  const [rosterSearch, setRosterSearch] = useState<string>('');

  const allStudents = loadClassStudents();

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const result = authenticateStudent(loginId, password);
    if (result.success && result.student) {
      onLoginSuccess(result.student);
    } else {
      setError(result.error || 'Login failed. Please check your roll number and password.');
    }
  };

  const handleSelectStudentFromList = (student: StudentUser) => {
    setLoginId(student.rollNumber);
    setPassword(student.customPassword || student.rollNumber);
    setError(null);
    setShowRosterModal(false);
  };

  const handleInstantLogin = (student: StudentUser) => {
    const result = authenticateStudent(student.rollNumber, student.customPassword || student.rollNumber);
    if (result.success && result.student) {
      onLoginSuccess(result.student);
    }
  };

  const filteredStudents = allStudents.filter(s => {
    if (!rosterSearch.trim()) return true;
    const q = rosterSearch.toLowerCase().trim();
    return (
      s.rollNumber.includes(q) || 
      s.name.toLowerCase().includes(q) ||
      s.rollNumber.slice(-2).includes(q)
    );
  });

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col justify-between text-slate-800">
      {/* Top Simple Brand Bar */}
      <header className="bg-white border-b border-slate-200 px-4 sm:px-8 py-3.5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-indigo-600 text-white flex items-center justify-center font-bold">
            <GraduationCap className="w-5 h-5" />
          </div>
          <div>
            <h1 className="font-bold text-slate-900 text-sm sm:text-base leading-tight">
              Gayatri Vidya Parishad College for Degree and PG Courses (Autonomous)
            </h1>
            <p className="text-xs text-slate-700">
              B.Tech CSE (AI & ML) • R-22 Regulation • Semester V Examination Portal
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setShowRosterModal(true)}
          className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-indigo-200 bg-indigo-50/60 hover:bg-indigo-100/60 transition-colors"
        >
          <Users className="w-4 h-4" />
          <span className="hidden sm:inline">Browse Class Members (01–70)</span>
          <span className="sm:hidden">Class 01–70</span>
        </button>
      </header>

      {/* Main Login Card */}
      <main className="flex-1 flex items-center justify-center p-4 sm:p-6">
        <div className="w-full max-w-md bg-white border border-slate-200 rounded-2xl shadow-sm p-6 sm:p-8 space-y-6">
          <div className="text-center space-y-1.5">
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
              Student Sign In
            </h2>
            <p className="text-xs sm:text-sm text-slate-700">
              Enter your Roll Number to access syllabuses, model papers, and your study checklist.
            </p>
          </div>

          {error && (
            <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-600 mt-0.5" />
              <span className="leading-relaxed font-medium">{error}</span>
            </div>
          )}

          <form onSubmit={handleLoginSubmit} className="space-y-4">
            {/* Roll Number Input */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label htmlFor="rollNumberInput" className="text-xs font-bold text-slate-700">
                  Roll Number / Login ID
                </label>
                <span className="text-[11px] text-slate-700 font-mono">
                  Range: 5241412001 - 5241412070
                </span>
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <User className="w-4 h-4" />
                </div>
                <input
                  id="rollNumberInput"
                  type="text"
                  value={loginId}
                  onChange={(e) => setLoginId(e.target.value)}
                  placeholder="e.g. 5241412001 or 01"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-300 text-slate-900 placeholder-slate-400 text-sm focus:outline-hidden focus:ring-2 focus:ring-indigo-600 focus:border-indigo-600 font-mono"
                  required
                />
              </div>
            </div>

            {/* Password Input */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label htmlFor="passwordInput" className="text-xs font-bold text-slate-700">
                  Password
                </label>
                <span className="text-[11px] text-slate-700">
                  Default = Your 10-digit Roll Number
                </span>
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  id="passwordInput"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter password"
                  className="w-full pl-10 pr-10 py-2.5 rounded-xl border border-slate-300 text-slate-900 placeholder-slate-400 text-sm focus:outline-hidden focus:ring-2 focus:ring-indigo-600 focus:border-indigo-600 font-mono"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600"
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              className="w-full py-2.5 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm shadow-xs flex items-center justify-center gap-2 transition-colors cursor-pointer"
            >
              <span>Sign In to Examination Portal</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          {/* Quick Select Buttons */}
          <div className="pt-3 border-t border-slate-100 space-y-2">
            <div className="flex items-center justify-between text-xs text-slate-700">
              <span>Quick Test Logins:</span>
              <button
                type="button"
                onClick={() => setShowRosterModal(true)}
                className="text-indigo-600 hover:underline font-semibold"
              >
                View all 70 students →
              </button>
            </div>
            <div className="flex items-center gap-1.5 flex-wrap">
              {['5241412001', '5241412015', '5241412035', '5241412050', '5241412070'].map((sampleRoll) => (
                <button
                  key={sampleRoll}
                  type="button"
                  onClick={() => {
                    setLoginId(sampleRoll);
                    setPassword(sampleRoll);
                    setError(null);
                  }}
                  className="text-xs font-mono px-2 py-1 rounded-md bg-slate-100 hover:bg-indigo-50 text-slate-700 hover:text-indigo-700 border border-slate-200 transition-colors"
                >
                  #{sampleRoll.slice(-2)}
                </button>
              ))}
            </div>
          </div>
        </div>
      </main>

      {/* Class Roster Modal */}
      {showRosterModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
          <div 
            className="bg-white rounded-2xl border border-slate-200 max-w-2xl w-full max-h-[85vh] flex flex-col shadow-xl overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="p-4 sm:p-5 border-b border-slate-200 flex items-center justify-between gap-3">
              <div>
                <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
                  <Users className="w-4 h-4 text-indigo-600" />
                  <span>Class Members Directory ({TOTAL_STUDENTS} Students)</span>
                </h3>
                <p className="text-xs text-slate-700">
                  Select your roll number to sign in. Password defaults to your roll number.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowRosterModal(false)}
                className="text-slate-400 hover:text-slate-600 text-sm font-bold px-2 py-1 rounded-md hover:bg-slate-100"
              >
                ✕ Close
              </button>
            </div>

            {/* Modal Search */}
            <div className="p-3 border-b border-slate-100 bg-slate-50">
              <div className="relative">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  value={rosterSearch}
                  onChange={(e) => setRosterSearch(e.target.value)}
                  placeholder="Search by roll number or name (e.g. 01, 15, 70)..."
                  className="w-full pl-9 pr-3 py-1.5 text-xs rounded-lg border border-slate-300 bg-white text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-indigo-600"
                  autoFocus
                />
              </div>
            </div>

            {/* Modal Grid */}
            <div className="p-4 overflow-y-auto flex-1 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2.5">
              {filteredStudents.map((student) => {
                const rollLastTwo = student.rollNumber.slice(-2);
                return (
                  <div
                    key={student.rollNumber}
                    className="p-2.5 rounded-xl border border-slate-200 hover:border-indigo-400 hover:bg-indigo-50/50 transition-all text-left group flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-bold text-xs text-slate-900 font-mono">
                          #{rollLastTwo}
                        </span>
                        <span className="text-[10px] text-slate-700">
                          {student.section}
                        </span>
                      </div>
                      <div className="text-xs font-mono text-slate-700 font-semibold truncate">
                        {student.rollNumber}
                      </div>
                      <div className="text-[11px] text-slate-700 truncate">
                        {student.name}
                      </div>
                    </div>

                    <div className="mt-2.5 pt-2 border-t border-slate-100 flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => handleSelectStudentFromList(student)}
                        className="flex-1 py-1 rounded-md text-[11px] font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 text-center"
                      >
                        Fill Form
                      </button>
                      <button
                        type="button"
                        onClick={() => handleInstantLogin(student)}
                        className="flex-1 py-1 rounded-md text-[11px] font-semibold text-white bg-indigo-600 hover:bg-indigo-700 text-center"
                      >
                        Login →
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="p-3 border-t border-slate-100 bg-slate-50 flex items-center justify-between text-xs text-slate-700">
              <span>Showing {filteredStudents.length} of {TOTAL_STUDENTS} students</span>
              <span>All 70 members pre-registered</span>
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 py-3 text-center text-xs text-slate-700">
        Gayatri Vidya Parishad College for Degree and PG Courses (Autonomous) • R-22 Autonomous Curriculum
      </footer>
    </div>
  );
};

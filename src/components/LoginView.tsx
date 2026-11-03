import React, { useState } from 'react';
import { 
  GraduationCap, 
  Lock, 
  User, 
  Eye, 
  EyeOff, 
  ArrowRight, 
  Sparkles, 
  Search, 
  CheckCircle2, 
  ShieldCheck, 
  Users, 
  BookOpen, 
  KeyRound,
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
  const [rememberMe, setRememberMe] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [rosterSearch, setRosterSearch] = useState<string>('');
  const [activeTab, setActiveTab] = useState<'login' | 'roster'>('login');

  const allStudents = loadClassStudents();

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const result = authenticateStudent(loginId, password);
    if (result.success && result.student) {
      onLoginSuccess(result.student);
    } else {
      setError(result.error || 'Login failed. Please verify your roll number and password.');
    }
  };

  const handleQuickSelectStudent = (student: StudentUser, autoSubmit: boolean = false) => {
    setLoginId(student.rollNumber);
    setPassword(student.customPassword || student.rollNumber);
    setError(null);
    if (autoSubmit) {
      const result = authenticateStudent(student.rollNumber, student.customPassword || student.rollNumber);
      if (result.success && result.student) {
        onLoginSuccess(result.student);
      }
    } else {
      setActiveTab('login');
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
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between relative overflow-hidden select-none">
      {/* Background Ambient Glows */}
      <div className="absolute top-0 left-1/4 -mt-20 w-96 h-96 bg-indigo-600/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 right-1/4 -mb-20 w-96 h-96 bg-teal-500/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-1/2 right-10 w-72 h-72 bg-rose-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Header Banner */}
      <header className="relative z-10 border-b border-slate-800/80 bg-slate-900/60 backdrop-blur-md px-4 sm:px-8 py-3.5 flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-linear-to-br from-indigo-500 to-indigo-700 flex items-center justify-center text-white shadow-md shadow-indigo-500/30">
            <GraduationCap className="w-5 h-5" />
          </div>
          <div>
            <h1 className="font-extrabold text-sm sm:text-base text-white tracking-tight">
              Gayatri Vidya Parishad College for Degree and PG Courses (Autonomous)
            </h1>
            <p className="text-xs text-indigo-300 font-medium">
              B.Tech CSE (AI & ML) • R-22 Regulation • Class Examination Portal
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-[11px] font-bold px-3 py-1 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>70 Class Accounts Activated</span>
          </span>
        </div>
      </header>

      {/* Main Login / Roster Container */}
      <main className="relative z-10 max-w-4xl w-full mx-auto px-4 py-8 sm:py-12 flex-1 flex flex-col justify-center">
        {/* Toggle between Login Form and Class Directory */}
        <div className="flex justify-center mb-6">
          <div className="bg-slate-900/90 border border-slate-800 p-1 rounded-2xl flex items-center gap-1 shadow-lg">
            <button
              type="button"
              onClick={() => setActiveTab('login')}
              className={`flex items-center gap-2 px-5 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all ${
                activeTab === 'login'
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <Lock className="w-4 h-4" />
              <span>Student Login</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('roster')}
              className={`flex items-center gap-2 px-5 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all ${
                activeTab === 'roster'
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <Users className="w-4 h-4" />
              <span>Class Roster (70 Members)</span>
              <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-slate-800 text-slate-300">
                01–70
              </span>
            </button>
          </div>
        </div>

        {activeTab === 'login' ? (
          <div className="bg-slate-900/90 border border-slate-800/90 rounded-3xl p-6 sm:p-10 shadow-2xl backdrop-blur-xl max-w-md mx-auto w-full space-y-6">
            <div className="text-center space-y-2">
              <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-indigo-500/10 border border-indigo-500/30 text-indigo-400 mb-1">
                <ShieldCheck className="w-7 h-7" />
              </div>
              <h2 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight">
                Class Member Sign In
              </h2>
              <p className="text-xs text-slate-400">
                Enter your 10-digit roll number (5241412001 to 5241412070).
              </p>
            </div>

            {error && (
              <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-start gap-2.5 animate-in fade-in duration-200">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-400" />
                <span className="leading-relaxed font-medium">{error}</span>
              </div>
            )}

            <form onSubmit={handleLoginSubmit} className="space-y-4">
              {/* Login ID Input */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-xs font-semibold text-slate-300">
                  <label htmlFor="loginId">Roll Number / Login ID</label>
                  <span className="text-[11px] text-indigo-400 font-mono">
                    Range: 5241412001 - 5241412070
                  </span>
                </div>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                    <User className="w-4 h-4" />
                  </div>
                  <input
                    id="loginId"
                    type="text"
                    value={loginId}
                    onChange={(e) => setLoginId(e.target.value)}
                    placeholder="e.g. 5241412001 or 01"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-950/80 border border-slate-700/80 text-white placeholder-slate-500 text-sm focus:outline-hidden focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 font-mono tracking-wide"
                    required
                    autoFocus
                  />
                </div>
              </div>

              {/* Password Input */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-xs font-semibold text-slate-300">
                  <label htmlFor="password">Password</label>
                  <span className="text-[11px] text-slate-400">
                    Default = Roll Number
                  </span>
                </div>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                    <Lock className="w-4 h-4" />
                  </div>
                  <input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter password"
                    className="w-full pl-10 pr-10 py-2.5 rounded-xl bg-slate-950/80 border border-slate-700/80 text-white placeholder-slate-500 text-sm focus:outline-hidden focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 font-mono tracking-wide"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-200 cursor-pointer"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Remember checkbox & default info */}
              <div className="flex items-center justify-between text-xs text-slate-400 pt-1">
                <label className="flex items-center gap-2 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="w-4 h-4 rounded-sm text-indigo-600 bg-slate-950 border-slate-700 focus:ring-indigo-500"
                  />
                  <span>Keep me signed in</span>
                </label>
                <button
                  type="button"
                  onClick={() => setActiveTab('roster')}
                  className="text-indigo-400 hover:text-indigo-300 font-medium cursor-pointer"
                >
                  Find my roll number
                </button>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                className="w-full py-3 px-4 rounded-xl bg-linear-to-r from-indigo-600 to-indigo-700 hover:from-indigo-500 hover:to-indigo-600 text-white font-extrabold text-sm shadow-lg shadow-indigo-600/30 flex items-center justify-center gap-2 transition-all cursor-pointer active:scale-[0.99]"
              >
                <span>Sign In to Semester Hub</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>

            {/* Quick Demo Roll Pill Shortcuts */}
            <div className="pt-2 border-t border-slate-800 space-y-2">
              <span className="text-[11px] font-bold text-slate-400 block text-center uppercase tracking-wider">
                Quick Test Shortcuts
              </span>
              <div className="flex items-center justify-center gap-2 flex-wrap">
                {['5241412001', '5241412015', '5241412035', '5241412050', '5241412070'].map((sampleRoll) => (
                  <button
                    key={sampleRoll}
                    type="button"
                    onClick={() => {
                      setLoginId(sampleRoll);
                      setPassword(sampleRoll);
                      setError(null);
                    }}
                    className="text-[11px] font-mono px-2 py-1 rounded-lg bg-slate-800 hover:bg-indigo-600/40 text-slate-300 hover:text-white border border-slate-700/80 transition-colors cursor-pointer"
                  >
                    #{sampleRoll.slice(-2)} ({sampleRoll})
                  </button>
                ))}
              </div>
            </div>
          </div>
        ) : (
          /* Class Roster (70 Members) Grid */
          <div className="bg-slate-900/90 border border-slate-800/90 rounded-3xl p-6 sm:p-8 shadow-2xl backdrop-blur-xl w-full space-y-5">
            <div className="flex items-center justify-between flex-wrap gap-4 border-b border-slate-800 pb-4">
              <div>
                <h2 className="text-xl font-extrabold text-white flex items-center gap-2">
                  <Users className="w-5 h-5 text-indigo-400" />
                  <span>Class of 70 • Student Directory</span>
                </h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  Click any roll number to instantly sign in or auto-fill credentials.
                </p>
              </div>

              {/* Roster Search input */}
              <div className="relative min-w-[240px]">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                <input
                  type="text"
                  value={rosterSearch}
                  onChange={(e) => setRosterSearch(e.target.value)}
                  placeholder="Search roll (e.g. 01, 15, 70)..."
                  className="w-full pl-9 pr-3 py-1.5 text-xs rounded-xl bg-slate-950 border border-slate-700 text-white placeholder-slate-500 focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>

            {/* Students Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 lg:grid-cols-7 gap-2.5 max-h-[460px] overflow-y-auto pr-1">
              {filteredStudents.map((student) => {
                const rollLastTwo = student.rollNumber.slice(-2);
                return (
                  <div
                    key={student.rollNumber}
                    onClick={() => handleQuickSelectStudent(student, true)}
                    className="p-3 rounded-xl bg-slate-950/70 hover:bg-indigo-600/20 border border-slate-800 hover:border-indigo-500/50 transition-all cursor-pointer group text-center space-y-1"
                    title={`Click to login as ${student.rollNumber}`}
                  >
                    <div className="w-8 h-8 rounded-lg bg-indigo-500/10 text-indigo-400 font-extrabold text-xs flex items-center justify-center mx-auto border border-indigo-500/20 group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                      {rollLastTwo}
                    </div>
                    <div className="text-[11px] font-mono font-bold text-slate-200 group-hover:text-white truncate">
                      {student.rollNumber}
                    </div>
                    <div className="text-[10px] text-slate-400 truncate">
                      {student.name}
                    </div>
                    <span className="text-[9px] px-1.5 py-0.5 rounded-sm bg-slate-800 text-slate-400 font-medium block">
                      {student.section}
                    </span>
                  </div>
                );
              })}
            </div>

            <div className="pt-3 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
              <span>Showing {filteredStudents.length} of {TOTAL_STUDENTS} students</span>
              <button
                type="button"
                onClick={() => setActiveTab('login')}
                className="text-indigo-400 hover:text-indigo-300 font-bold"
              >
                Back to Login Form →
              </button>
            </div>
          </div>
        )}
      </main>

      {/* Footer Info */}
      <footer className="relative z-10 border-t border-slate-800/80 bg-slate-900/60 backdrop-blur-md px-4 py-3 text-center text-xs text-slate-500">
        <p>
          B.Tech Computer Science & Engineering (AI & ML) • R-22 Autonomous Curriculum • III-I Semester Examination Hub
        </p>
      </footer>
    </div>
  );
};

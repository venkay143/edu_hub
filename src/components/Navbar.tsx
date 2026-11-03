import React, { useState } from 'react';
import { 
  GraduationCap, 
  Search, 
  Clock, 
  Settings, 
  Download, 
  Upload, 
  RotateCcw, 
  Calendar, 
  BookOpen, 
  ChevronDown, 
  Sparkles,
  Menu,
  X,
  FileText,
  User,
  LogOut
} from 'lucide-react';
import { CourseInfo, Subject, StudentUser } from '../types';

interface NavbarProps {
  courseInfo: CourseInfo;
  activeView: 'dashboard' | 'progress' | string; // string is subject id
  subjects: Subject[];
  currentStudent?: StudentUser | null;
  onSelectView: (view: 'dashboard' | 'progress' | string) => void;
  onOpenSearch: () => void;
  onOpenTimer: () => void;
  onOpenCustomizer: () => void;
  onOpenOfficialPdf: () => void;
  onOpenProfile?: () => void;
  onLogout?: () => void;
  onExportData: () => void;
  onImportData: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onResetData: () => void;
  isTimerRunning?: boolean;
  timerSecondsRemaining?: number;
}

export const Navbar: React.FC<NavbarProps> = ({
  courseInfo,
  activeView,
  subjects,
  currentStudent,
  onSelectView,
  onOpenSearch,
  onOpenTimer,
  onOpenCustomizer,
  onOpenOfficialPdf,
  onOpenProfile,
  onLogout,
  onExportData,
  onImportData,
  onResetData,
  isTimerRunning = false,
  timerSecondsRemaining = 0,
}) => {
  const [dataDropdownOpen, setDataDropdownOpen] = useState(false);
  const [subjectsDropdownOpen, setSubjectsDropdownOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Calculate days remaining
  const calculateDaysLeft = () => {
    try {
      const examDate = new Date(courseInfo.examStartDate).getTime();
      const now = new Date().getTime();
      const diff = Math.ceil((examDate - now) / (1000 * 60 * 60 * 24));
      return diff > 0 ? diff : 0;
    } catch {
      return 18;
    }
  };

  const daysLeft = calculateDaysLeft();

  const formatTimerTime = (totalSeconds: number) => {
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* Left: Brand & Course info */}
          <div className="flex items-center gap-3">
            <button 
              onClick={() => onSelectView('dashboard')}
              className="flex items-center gap-2.5 text-left group focus:outline-hidden"
            >
              <div className="w-10 h-10 rounded-xl bg-linear-to-tr from-indigo-600 via-indigo-700 to-sky-600 flex items-center justify-center text-white shadow-md shadow-indigo-200 group-hover:scale-105 transition-transform">
                <GraduationCap className="w-6 h-6" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-extrabold text-slate-900 tracking-tight text-base sm:text-lg">
                    GVP<span className="text-indigo-600">EduHub</span>
                  </span>
                  <span className="hidden sm:inline-flex px-2 py-0.5 text-xs font-bold rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200">
                    R-22 Regulation
                  </span>
                </div>
                <p className="text-xs text-slate-700 font-medium hidden sm:block truncate max-w-xs">
                  B.Tech CSE (AI&ML) • III Year - I Sem
                </p>
              </div>
            </button>
          </div>

          {/* Navigation Links (Desktop) */}
          <nav className="hidden lg:flex items-center gap-1">
            <button
              onClick={() => onSelectView('dashboard')}
              className={`px-3 py-1.5 rounded-lg text-sm font-semibold transition-colors ${
                activeView === 'dashboard'
                  ? 'bg-indigo-50 text-indigo-700'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              Dashboard
            </button>

            {/* Official Syllabus PDF Trigger */}
            <button
              onClick={onOpenOfficialPdf}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-bold text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 transition-colors"
              title="Open Official GVPCDPGC R-22 Syllabus PDF (Pages 81-114)"
            >
              <FileText className="w-3.5 h-3.5" />
              <span>Official Syllabus PDF</span>
              <span className="text-[10px] bg-rose-200 text-rose-900 px-1 rounded-sm">p.81-114</span>
            </button>

            {/* Subjects Dropdown */}
            <div className="relative">
              <button
                onClick={() => setSubjectsDropdownOpen(!subjectsDropdownOpen)}
                onBlur={() => setTimeout(() => setSubjectsDropdownOpen(false), 200)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-semibold transition-colors ${
                  activeView !== 'dashboard' && activeView !== 'progress'
                    ? 'bg-indigo-50 text-indigo-700'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                <BookOpen className="w-4 h-4" />
                <span>Semester Subjects</span>
                <ChevronDown className="w-3.5 h-3.5 opacity-60" />
              </button>

              {subjectsDropdownOpen && (
                <div className="absolute left-0 mt-2 w-80 rounded-2xl bg-white border border-slate-200 shadow-xl py-2 z-50 max-h-96 overflow-y-auto">
                  <div className="px-3 py-1.5 text-xs font-bold uppercase tracking-wider text-slate-700 border-b border-slate-100">
                    III-I Semester Subjects (R-22)
                  </div>
                  {subjects.map((sub, idx) => (
                    <button
                      key={sub.id}
                      onClick={() => {
                        onSelectView(sub.id);
                        setSubjectsDropdownOpen(false);
                      }}
                      className="w-full text-left px-3 py-2 flex items-center justify-between hover:bg-slate-50 transition-colors text-sm"
                    >
                      <div className="flex items-center gap-2 truncate pr-2">
                        <span className="w-5 h-5 rounded-md bg-slate-100 text-slate-700 font-bold text-xs flex items-center justify-center shrink-0">
                          {idx + 1}
                        </span>
                        <div className="truncate">
                          <p className="font-semibold text-slate-800 truncate text-xs sm:text-sm">{sub.name}</p>
                          <div className="flex items-center gap-1.5">
                            <span className="text-[10px] text-slate-700 font-mono">{sub.code}</span>
                            {sub.pdfPages && (
                              <span className="text-[10px] text-indigo-600 bg-indigo-50 px-1 rounded-sm">
                                {sub.pdfPages}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                      <span className="text-xs font-bold px-1.5 py-0.5 rounded-sm bg-slate-100 text-slate-600 shrink-0">
                        {sub.units.filter(u => u.topics.every(t => t.completed)).length}/{sub.units.length} U
                      </span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            <button
              onClick={() => onSelectView('progress')}
              className={`px-3 py-1.5 rounded-lg text-sm font-semibold transition-colors ${
                activeView === 'progress'
                  ? 'bg-indigo-50 text-indigo-700'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              Study Analytics
            </button>
          </nav>

          {/* Right Action Tools */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Exam Countdown Pill */}
            <div 
              onClick={onOpenCustomizer}
              title="Click to change target examination date"
              className="cursor-pointer flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-linear-to-r from-amber-50 to-orange-50 border border-amber-200 text-amber-900 text-xs font-bold hover:shadow-xs transition-shadow"
            >
              <Calendar className="w-3.5 h-3.5 text-amber-600 shrink-0" />
              <span>{daysLeft}d to Finals</span>
            </div>

            {/* Focus Study Timer Button */}
            <button
              onClick={onOpenTimer}
              className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
                isTimerRunning
                  ? 'bg-rose-50 text-rose-700 border border-rose-300 animate-pulse'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
              title="Pomodoro & Mock Exam Focus Timer"
            >
              <Clock className="w-3.5 h-3.5 text-indigo-600" />
              <span className="hidden sm:inline">
                {isTimerRunning ? `Focus: ${formatTimerTime(timerSecondsRemaining)}` : 'Focus Timer'}
              </span>
            </button>

            {/* Universal Search Trigger */}
            <button
              onClick={onOpenSearch}
              className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-slate-900 text-xs font-medium transition-colors border border-slate-200"
              title="Search subjects, units, questions, and notes (Ctrl+K)"
            >
              <Search className="w-3.5 h-3.5 text-slate-500" />
              <span className="hidden md:inline">Quick Search...</span>
              <kbd className="hidden md:inline-block px-1.5 py-0.5 text-[10px] bg-white border border-slate-200 rounded-sm text-slate-700 font-mono">
                ⌘K
              </kbd>
            </button>

            {/* Customizer / Settings */}
            <button
              onClick={onOpenCustomizer}
              className="p-1.5 rounded-lg text-slate-600 hover:text-indigo-600 hover:bg-indigo-50 transition-colors"
              title="Customize course, subjects, and exam dates"
            >
              <Settings className="w-4 h-4" />
            </button>

            {/* Data Management Dropdown */}
            <div className="relative">
              <button
                onClick={() => setDataDropdownOpen(!dataDropdownOpen)}
                onBlur={() => setTimeout(() => setDataDropdownOpen(false), 200)}
                className="p-1.5 rounded-lg text-slate-600 hover:text-indigo-600 hover:bg-indigo-50 transition-colors"
                title="Backup and Restore Data"
              >
                <Download className="w-4 h-4" />
              </button>

              {dataDropdownOpen && (
                <div className="absolute right-0 mt-2 w-56 rounded-xl bg-white border border-slate-200 shadow-xl py-2 z-50 text-xs">
                  <div className="px-3 py-1 text-slate-700 font-bold uppercase tracking-wider text-[10px]">
                    Local Data & Backup
                  </div>
                  <button
                    onClick={() => {
                      onExportData();
                      setDataDropdownOpen(false);
                    }}
                    className="w-full text-left px-3 py-2 flex items-center gap-2 hover:bg-slate-50 text-slate-700 font-medium"
                  >
                    <Download className="w-3.5 h-3.5 text-indigo-600" />
                    <span>Export Progress (JSON)</span>
                  </button>
                  <label className="w-full text-left px-3 py-2 flex items-center gap-2 hover:bg-slate-50 text-slate-700 font-medium cursor-pointer">
                    <Upload className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Import Backup File</span>
                    <input
                      type="file"
                      accept=".json"
                      onChange={(e) => {
                        onImportData(e);
                        setDataDropdownOpen(false);
                      }}
                      className="hidden"
                    />
                  </label>
                  <div className="border-t border-slate-100 my-1"></div>
                  <button
                    onClick={() => {
                      if (window.confirm('Reset all progress and return to default GVP R-22 subjects data?')) {
                        onResetData();
                      }
                      setDataDropdownOpen(false);
                    }}
                    className="w-full text-left px-3 py-2 flex items-center gap-2 hover:bg-rose-50 text-rose-600 font-medium"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>Reset to Defaults</span>
                  </button>
                </div>
              )}
            </div>

            {/* Student Account Badge & Profile Trigger */}
            {currentStudent && onOpenProfile && (
              <button
                onClick={onOpenProfile}
                className="flex items-center gap-2 pl-2 pr-2.5 py-1 rounded-xl bg-slate-900 hover:bg-slate-800 text-white transition-all shadow-xs cursor-pointer group"
                title={`Logged in as ${currentStudent.name} (${currentStudent.rollNumber}). Click to view profile.`}
              >
                <div className="w-6 h-6 rounded-lg bg-indigo-600 text-white font-extrabold text-[11px] flex items-center justify-center shrink-0">
                  {currentStudent.rollNumber.slice(-2)}
                </div>
                <div className="text-left hidden sm:block">
                  <span className="text-[11px] font-mono font-bold block leading-none text-indigo-300">
                    {currentStudent.rollNumber}
                  </span>
                  <span className="text-[10px] text-slate-300 block truncate max-w-[90px] leading-tight">
                    {currentStudent.name}
                  </span>
                </div>
              </button>
            )}

            {/* Mobile Menu Toggle */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-1.5 rounded-lg text-slate-600 hover:bg-slate-100"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-slate-200 bg-white px-4 py-3 space-y-2">
          {/* Mobile Student Profile Bar */}
          {currentStudent && (
            <div className="bg-slate-900 text-white p-3 rounded-xl flex items-center justify-between mb-2">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-indigo-600 text-white font-extrabold text-xs flex items-center justify-center">
                  #{currentStudent.rollNumber.slice(-2)}
                </div>
                <div>
                  <div className="text-xs font-bold">{currentStudent.name}</div>
                  <div className="text-[11px] font-mono text-indigo-300">{currentStudent.rollNumber} • {currentStudent.section}</div>
                </div>
              </div>
              <div className="flex items-center gap-1.5">
                {onOpenProfile && (
                  <button
                    onClick={() => {
                      onOpenProfile();
                      setMobileMenuOpen(false);
                    }}
                    className="px-2.5 py-1 rounded-lg bg-white/10 hover:bg-white/20 text-xs font-semibold text-white"
                  >
                    Profile
                  </button>
                )}
                {onLogout && (
                  <button
                    onClick={() => {
                      onLogout();
                      setMobileMenuOpen(false);
                    }}
                    className="p-1.5 rounded-lg bg-rose-500/20 text-rose-300 hover:bg-rose-500/30 text-xs font-semibold"
                    title="Sign Out"
                  >
                    <LogOut className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          )}

          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <span className="text-xs font-bold text-slate-700">R-22 Regulation</span>
            <span className="text-xs text-indigo-600 font-semibold">{courseInfo.semester}</span>
          </div>

          <div className="grid grid-cols-2 gap-2 pt-1">
            <button
              onClick={() => {
                onSelectView('dashboard');
                setMobileMenuOpen(false);
              }}
              className={`p-2 rounded-lg text-xs font-semibold text-center ${
                activeView === 'dashboard' ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-700'
              }`}
            >
              Dashboard
            </button>
            <button
              onClick={() => {
                onSelectView('progress');
                setMobileMenuOpen(false);
              }}
              className={`p-2 rounded-lg text-xs font-semibold text-center ${
                activeView === 'progress' ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-700'
              }`}
            >
              Study Progress
            </button>
          </div>

          <button
            onClick={() => {
              onOpenOfficialPdf();
              setMobileMenuOpen(false);
            }}
            className="w-full py-2 px-3 rounded-lg bg-rose-50 text-rose-700 font-bold text-xs flex items-center justify-center gap-2 border border-rose-200"
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Open Official Syllabus PDF (p. 81-114)</span>
          </button>

          <div className="pt-2">
            <p className="text-[11px] font-bold uppercase tracking-wider text-slate-700 mb-1.5">Semester Subjects</p>
            <div className="space-y-1">
              {subjects.map((sub) => (
                <button
                  key={sub.id}
                  onClick={() => {
                    onSelectView(sub.id);
                    setMobileMenuOpen(false);
                  }}
                  className="w-full text-left px-2.5 py-1.5 rounded-md hover:bg-slate-50 flex items-center justify-between text-xs"
                >
                  <span className="font-semibold text-slate-800 truncate">{sub.name}</span>
                  <span className="text-[10px] font-mono text-slate-700">{sub.code}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </header>
  );
};

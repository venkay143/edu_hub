/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import { 
  loadCourseInfo, 
  saveCourseInfo, 
  loadSubjects, 
  saveSubjects, 
  loadDailyGoals, 
  saveDailyGoals, 
  loadStudySessions, 
  saveStudySessions, 
  exportDataBackup, 
  resetToDefaultData 
} from './utils/storage';
import { CourseInfo, Subject, DailyGoal, StudySessionLog, ModelPaper, FacultyMaterial, StudentUser } from './types';
import { Navbar } from './components/Navbar';
import { Dashboard } from './components/Dashboard';
import { SubjectDetail } from './components/SubjectDetail';
import { StudyProgressView } from './components/StudyProgressView';
import { PaperViewerModal } from './components/PaperViewerModal';
import { DocumentViewerModal } from './components/DocumentViewerModal';
import { UploadMaterialModal } from './components/UploadMaterialModal';
import { FocusTimerModal } from './components/FocusTimerModal';
import { GlobalSearchModal } from './components/GlobalSearchModal';
import { CustomizerModal } from './components/CustomizerModal';
import { OfficialPdfViewerModal } from './components/OfficialPdfViewerModal';
import { LoginView } from './components/LoginView';
import { StudentProfileModal } from './components/StudentProfileModal';
import { getActiveStudent, setActiveStudent } from './utils/studentAuth';
import { playChime } from './utils/audio';

export default function App() {
  // Current authenticated class member (5241412001 - 5241412070)
  const [currentStudent, setCurrentStudent] = useState<StudentUser | null>(getActiveStudent);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);

  // Core persistent data (keyed per-student when logged in)
  const [courseInfo, setCourseInfo] = useState<CourseInfo>(loadCourseInfo);
  const [subjects, setSubjects] = useState<Subject[]>(() => {
    const active = getActiveStudent();
    return loadSubjects(active?.rollNumber);
  });
  const [dailyGoals, setDailyGoals] = useState<DailyGoal[]>(() => {
    const active = getActiveStudent();
    return loadDailyGoals(active?.rollNumber);
  });
  const [studySessions, setStudySessions] = useState<StudySessionLog[]>(() => {
    const active = getActiveStudent();
    return loadStudySessions(active?.rollNumber);
  });

  // Active view routing
  const [activeView, setActiveView] = useState<'dashboard' | 'progress' | string>('dashboard');
  const [activeSubjectTab, setActiveSubjectTab] = useState<'syllabus' | 'papers' | 'analysis' | 'materials'>('syllabus');

  // Modals state
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isTimerOpen, setIsTimerOpen] = useState(false);
  const [isCustomizerOpen, setIsCustomizerOpen] = useState(false);
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [uploadSubjectId, setUploadSubjectId] = useState<string>('');

  const [isOfficialPdfOpen, setIsOfficialPdfOpen] = useState(false);
  const [pdfInitialPage, setPdfInitialPage] = useState<number>(87);

  const [viewingPaper, setViewingPaper] = useState<ModelPaper | null>(null);
  const [paperPracticeMode, setPaperPracticeMode] = useState(false);
  const [viewingDocument, setViewingDocument] = useState<FacultyMaterial | null>(null);

  // Background focus timer state
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [timerSecondsRemaining, setTimerSecondsRemaining] = useState(25 * 60);
  const [timerTotalDuration, setTimerTotalDuration] = useState(25 * 60);

  // Sync to LocalStorage on updates (stored per student)
  useEffect(() => {
    saveCourseInfo(courseInfo);
  }, [courseInfo]);

  useEffect(() => {
    saveSubjects(subjects, currentStudent?.rollNumber);
  }, [subjects, currentStudent]);

  useEffect(() => {
    saveDailyGoals(dailyGoals, currentStudent?.rollNumber);
  }, [dailyGoals, currentStudent]);

  useEffect(() => {
    saveStudySessions(studySessions, currentStudent?.rollNumber);
  }, [studySessions, currentStudent]);

  // Global background timer countdown
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (isTimerRunning && timerSecondsRemaining > 0) {
      interval = setInterval(() => {
        setTimerSecondsRemaining(prev => {
          if (prev <= 1) {
            setIsTimerRunning(false);
            playChime('complete');
            confetti({ particleCount: 60, spread: 60 });
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isTimerRunning, timerSecondsRemaining]);

  // Global keyboard shortcuts (Ctrl+K or Cmd+K for search)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setIsSearchOpen(prev => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Handlers for subjects & syllabus updates
  const handleUpdateSubject = (updated: Subject) => {
    setSubjects(prev => prev.map(s => s.id === updated.id ? updated : s));
  };

  const handleSelectSubject = (subjectId: string, initialTab: 'syllabus' | 'papers' | 'analysis' | 'materials' = 'syllabus') => {
    setActiveSubjectTab(initialTab);
    setActiveView(subjectId);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Handlers for goals
  const handleToggleGoal = (goalId: string) => {
    setDailyGoals(prev => prev.map(g => {
      if (g.id !== goalId) return g;
      const next = !g.completed;
      if (next) playChime('success');
      return { ...g, completed: next };
    }));
  };

  const handleAddGoal = (text: string) => {
    const newGoal: DailyGoal = {
      id: `goal-${Date.now()}`,
      text,
      completed: false,
      date: new Date().toISOString().split('T')[0],
    };
    setDailyGoals(prev => [newGoal, ...prev]);
    playChime('success');
  };

  const handleDeleteGoal = (goalId: string) => {
    setDailyGoals(prev => prev.filter(g => g.id !== goalId));
  };

  // Handlers for paper practice scoring
  const handleSavePracticeScore = (paperId: string, score: number) => {
    setSubjects(prev => prev.map(sub => ({
      ...sub,
      papers: sub.papers.map(p => {
        if (p.id !== paperId) return p;
        return {
          ...p,
          isPracticed: true,
          practicedScore: score,
          practicedDate: new Date().toISOString().split('T')[0],
        };
      }),
    })));
  };

  // Handler for adding uploaded faculty material
  const handleAddMaterial = (subjectId: string, newMat: FacultyMaterial) => {
    setSubjects(prev => prev.map(sub => {
      if (sub.id !== subjectId) return sub;
      return {
        ...sub,
        materials: [newMat, ...sub.materials],
      };
    }));
  };

  // Handlers for study session log
  const handleLogStudySession = (session: StudySessionLog) => {
    setStudySessions(prev => [session, ...prev]);
  };

  // Backup export / import
  const handleExportData = () => {
    exportDataBackup(courseInfo, subjects, dailyGoals);
    playChime('success');
  };

  const handleImportData = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target?.result as string);
        if (parsed.course && parsed.subjects) {
          setCourseInfo(parsed.course);
          setSubjects(parsed.subjects);
          if (parsed.goals) setDailyGoals(parsed.goals);
          playChime('complete');
          alert('Study Hub data imported successfully!');
        } else {
          alert('Invalid backup file format.');
        }
      } catch (err) {
        alert('Could not parse the backup JSON file.');
      }
    };
    reader.readAsText(file);
  };

  const handleResetData = () => {
    resetToDefaultData();
    window.location.reload();
  };

  const handleOpenOfficialPdfAtPage = (page = 87) => {
    setPdfInitialPage(page);
    setIsOfficialPdfOpen(true);
  };

  // Student Authentication Handlers
  const handleLoginSuccess = (student: StudentUser) => {
    setCurrentStudent(student);
    setSubjects(loadSubjects(student.rollNumber));
    setDailyGoals(loadDailyGoals(student.rollNumber));
    setStudySessions(loadStudySessions(student.rollNumber));
    playChime('complete');
    confetti({ particleCount: 70, spread: 70 });
  };

  const handleLogout = () => {
    setActiveStudent(null);
    setCurrentStudent(null);
    setIsProfileModalOpen(false);
  };

  const handleUpdateStudent = (updated: StudentUser) => {
    setCurrentStudent(updated);
  };

  // Login Gate: If no student is signed in, show the 70-member Login View
  if (!currentStudent) {
    return <LoginView onLoginSuccess={handleLoginSuccess} />;
  }

  // Find currently active subject if viewing a subject
  const currentSubject = subjects.find(s => s.id === activeView);

  // Student progress metrics
  const totalTopicsCount = subjects.reduce((acc, sub) => acc + sub.units.reduce((uacc, u) => uacc + u.topics.length, 0), 0);
  const completedTopicsCount = subjects.reduce((acc, sub) => acc + sub.units.reduce((uacc, u) => uacc + u.topics.filter(t => t.completed).length, 0), 0);
  const overallProgressPct = totalTopicsCount > 0 ? Math.round((completedTopicsCount / totalTopicsCount) * 100) : 0;

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col text-slate-800">
      
      {/* Top Universal Navbar */}
      <Navbar
        courseInfo={courseInfo}
        activeView={activeView}
        subjects={subjects}
        currentStudent={currentStudent}
        onSelectView={(v) => {
          setActiveView(v);
          setActiveSubjectTab('syllabus');
        }}
        onOpenSearch={() => setIsSearchOpen(true)}
        onOpenTimer={() => setIsTimerOpen(true)}
        onOpenCustomizer={() => setIsCustomizerOpen(true)}
        onOpenOfficialPdf={() => handleOpenOfficialPdfAtPage(87)}
        onOpenProfile={() => setIsProfileModalOpen(true)}
        onLogout={handleLogout}
        onExportData={handleExportData}
        onImportData={handleImportData}
        onResetData={handleResetData}
        isTimerRunning={isTimerRunning}
        timerSecondsRemaining={timerSecondsRemaining}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pt-6">
        {activeView === 'dashboard' && (
          <Dashboard
            courseInfo={courseInfo}
            subjects={subjects}
            dailyGoals={dailyGoals}
            currentStudent={currentStudent}
            onSelectSubject={handleSelectSubject}
            onToggleGoal={handleToggleGoal}
            onAddGoal={handleAddGoal}
            onDeleteGoal={handleDeleteGoal}
            onOpenUploadModal={() => {
              setUploadSubjectId(subjects[0]?.id || '');
              setIsUploadOpen(true);
            }}
            onOpenTimer={() => setIsTimerOpen(true)}
            onOpenOfficialPdf={() => handleOpenOfficialPdfAtPage(87)}
          />
        )}

        {activeView === 'progress' && (
          <StudyProgressView
            courseInfo={courseInfo}
            subjects={subjects}
            studySessions={studySessions}
            onBackToDashboard={() => setActiveView('dashboard')}
            onSelectSubject={handleSelectSubject}
          />
        )}

        {currentSubject && (
          <SubjectDetail
            key={currentSubject.id}
            subject={currentSubject}
            initialTab={activeSubjectTab}
            onBackToDashboard={() => setActiveView('dashboard')}
            onUpdateSubject={handleUpdateSubject}
            onOpenPaperViewer={(paper, practice) => {
              setViewingPaper(paper);
              setPaperPracticeMode(!!practice);
            }}
            onOpenDocumentViewer={(mat) => {
              setViewingDocument(mat);
            }}
            onOpenUploadModal={(subId) => {
              setUploadSubjectId(subId);
              setIsUploadOpen(true);
            }}
            onOpenOfficialPdfAtPage={handleOpenOfficialPdfAtPage}
          />
        )}
      </main>

      {/* Official Syllabus PDF Modal (Pages 81-114) */}
      <OfficialPdfViewerModal
        isOpen={isOfficialPdfOpen}
        initialPage={pdfInitialPage}
        onClose={() => setIsOfficialPdfOpen(false)}
      />

      {/* Interactive Modals */}
      {viewingPaper && currentSubject && (
        <PaperViewerModal
          isOpen={!!viewingPaper}
          paper={viewingPaper}
          subject={currentSubject}
          initialPracticeMode={paperPracticeMode}
          onClose={() => setViewingPaper(null)}
          onSavePracticeScore={handleSavePracticeScore}
        />
      )}

      {viewingDocument && (
        <DocumentViewerModal
          isOpen={!!viewingDocument}
          material={viewingDocument}
          subject={currentSubject || subjects[0]}
          onClose={() => setViewingDocument(null)}
        />
      )}

      {isUploadOpen && (
        <UploadMaterialModal
          isOpen={isUploadOpen}
          subjects={subjects}
          initialSubjectId={uploadSubjectId}
          onClose={() => setIsUploadOpen(false)}
          onAddMaterial={handleAddMaterial}
        />
      )}

      {isTimerOpen && (
        <FocusTimerModal
          isOpen={isTimerOpen}
          subjects={subjects}
          onClose={() => setIsTimerOpen(false)}
          onLogStudySession={handleLogStudySession}
          isRunning={isTimerRunning}
          setIsRunning={setIsTimerRunning}
          secondsRemaining={timerSecondsRemaining}
          setSecondsRemaining={setTimerSecondsRemaining}
          totalDuration={timerTotalDuration}
          setTotalDuration={setTimerTotalDuration}
        />
      )}

      {isSearchOpen && (
        <GlobalSearchModal
          isOpen={isSearchOpen}
          subjects={subjects}
          onClose={() => setIsSearchOpen(false)}
          onNavigateTo={(subjectId, tab) => {
            handleSelectSubject(subjectId, tab);
          }}
        />
      )}

      {isCustomizerOpen && (
        <CustomizerModal
          isOpen={isCustomizerOpen}
          courseInfo={courseInfo}
          subjects={subjects}
          onClose={() => setIsCustomizerOpen(false)}
          onSave={(newInfo, newSubs) => {
            setCourseInfo(newInfo);
            setSubjects(newSubs);
          }}
        />
      )}

      {/* Student Profile & Password Modal */}
      {currentStudent && (
        <StudentProfileModal
          student={currentStudent}
          isOpen={isProfileModalOpen}
          onClose={() => setIsProfileModalOpen(false)}
          onUpdateStudent={handleUpdateStudent}
          onLogout={handleLogout}
          readinessPct={overallProgressPct}
          completedTopicsCount={completedTopicsCount}
        />
      )}

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-white py-6 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-700">
          <div className="flex items-center gap-2">
            <span className="font-extrabold text-slate-900">Gayatri Vidya Parishad College for Degree and PG Courses (Autonomous)</span>
            <span>•</span>
            <span>R-22 Regulation B.Tech CSE (AI & ML)</span>
          </div>
          <div className="flex items-center gap-4">
            <button
              onClick={() => handleOpenOfficialPdfAtPage(87)}
              className="text-rose-600 hover:underline font-bold"
            >
              Official Syllabus PDF (Pages 81–114)
            </button>
            <span>•</span>
            <span>Local Storage & IndexedDB</span>
          </div>
        </div>
      </footer>

    </div>
  );
}

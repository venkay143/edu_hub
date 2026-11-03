import { Subject, CourseInfo, DailyGoal, StudySessionLog, FacultyMaterial } from '../types';
import { initialCourseInfo, initialSubjects } from '../data/initialSubjects';

const SYLLABUS_VERSION = 'r22_csm_v4_complete';
const VERSION_KEY = 'smart_edu_version';
const COURSE_KEY = 'smart_edu_course_info_r22';
const SUBJECTS_KEY = 'smart_edu_subjects_r22';
const GOALS_KEY = 'smart_edu_daily_goals_r22';
const SESSIONS_KEY = 'smart_edu_study_sessions_r22';

export const loadCourseInfo = (): CourseInfo => {
  try {
    const ver = localStorage.getItem(VERSION_KEY);
    if (ver !== SYLLABUS_VERSION) {
      localStorage.setItem(VERSION_KEY, SYLLABUS_VERSION);
      saveCourseInfo(initialCourseInfo);
      return initialCourseInfo;
    }
    const raw = localStorage.getItem(COURSE_KEY);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.warn('Failed to load course info from localStorage', e);
  }
  return initialCourseInfo;
};

export const saveCourseInfo = (info: CourseInfo): void => {
  try {
    localStorage.setItem(COURSE_KEY, JSON.stringify(info));
  } catch (e) {
    console.error('Failed to save course info', e);
  }
};

export const loadSubjects = (): Subject[] => {
  try {
    const ver = localStorage.getItem(VERSION_KEY);
    const raw = localStorage.getItem(SUBJECTS_KEY);
    
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        // Build a map of saved topic completions and notes
        const savedTopics = new Map<string, { completed: boolean; personalNotes?: string }>();
        const practicedPapers = new Set<string>();

        parsed.forEach((sub: Subject) => {
          sub.units?.forEach(u => {
            u.topics?.forEach(t => {
              savedTopics.set(t.id, { completed: t.completed, personalNotes: t.personalNotes });
            });
          });
          sub.papers?.forEach(p => {
            if (p.isPracticed) practicedPapers.add(p.id);
          });
        });

        // Merge saved progress into the fresh, official initialSubjects
        const mergedSubjects: Subject[] = initialSubjects.map(sub => {
          return {
            ...sub,
            papers: sub.papers.map(p => ({
              ...p,
              isPracticed: practicedPapers.has(p.id) || p.isPracticed,
            })),
            units: sub.units.map(u => ({
              ...u,
              topics: u.topics.map(t => {
                const saved = savedTopics.get(t.id);
                return saved
                  ? { ...t, completed: saved.completed, personalNotes: saved.personalNotes || t.personalNotes }
                  : t;
              }),
            })),
          };
        });

        if (ver !== SYLLABUS_VERSION) {
          localStorage.setItem(VERSION_KEY, SYLLABUS_VERSION);
          saveSubjects(mergedSubjects);
        }
        return mergedSubjects;
      }
    }

    localStorage.setItem(VERSION_KEY, SYLLABUS_VERSION);
    saveSubjects(initialSubjects);
    return initialSubjects;
  } catch (e) {
    console.warn('Failed to load subjects from localStorage', e);
  }
  return initialSubjects;
};

export const saveSubjects = (subjects: Subject[]): void => {
  try {
    localStorage.setItem(SUBJECTS_KEY, JSON.stringify(subjects));
  } catch (e) {
    console.error('Failed to save subjects', e);
  }
};

export const loadDailyGoals = (): DailyGoal[] => {
  try {
    const raw = localStorage.getItem(GOALS_KEY);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.warn('Failed to load daily goals', e);
  }
  return [
    { id: 'goal-1', text: 'Solve Apriori candidate generation & pruning (CSM3101 DWDM)', completed: true, date: new Date().toISOString().split('T')[0] },
    { id: 'goal-2', text: 'Draw Control Flow Graph & Calculate Cyclomatic Complexity V(G) (CSM3102 OOSE)', completed: false, date: new Date().toISOString().split('T')[0] },
    { id: 'goal-3', text: 'Practice CRC Polynomial Division & VLSM Subnetting (CSM3103 CN)', completed: false, date: new Date().toISOString().split('T')[0] },
    { id: 'goal-4', text: 'Trace Water Jug State Space rules & A* heuristic (CSM3104 AI)', completed: false, date: new Date().toISOString().split('T')[0] },
    { id: 'goal-5', text: 'Revise Confusion Matrix, Precision, Recall, F1 formulas (CSM3105 Data Science)', completed: false, date: new Date().toISOString().split('T')[0] },
  ];
};

export const saveDailyGoals = (goals: DailyGoal[]): void => {
  try {
    localStorage.setItem(GOALS_KEY, JSON.stringify(goals));
  } catch (e) {
    console.error('Failed to save goals', e);
  }
};

export const loadStudySessions = (): StudySessionLog[] => {
  try {
    const raw = localStorage.getItem(SESSIONS_KEY);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.warn('Failed to load sessions', e);
  }
  return [
    { id: 's1', subjectId: 'csm3101', subjectName: 'Data Warehousing and Data Mining', minutes: 45, timestamp: new Date(Date.now() - 3600000 * 5).toISOString(), type: 'pomodoro' },
    { id: 's2', subjectId: 'csm3102', subjectName: 'Object-Oriented Software Engineering', minutes: 60, timestamp: new Date(Date.now() - 3600000 * 24).toISOString(), type: 'revision' },
    { id: 's3', subjectId: 'csm3103', subjectName: 'Computer Networks', minutes: 180, timestamp: new Date(Date.now() - 3600000 * 48).toISOString(), type: 'mock_exam' },
  ];
};

export const saveStudySessions = (sessions: StudySessionLog[]): void => {
  try {
    localStorage.setItem(SESSIONS_KEY, JSON.stringify(sessions));
  } catch (e) {
    console.error('Failed to save sessions', e);
  }
};

// IndexedDB for storing uploaded PDF blobs
const DB_NAME = 'SmartEduHubFilesDB';
const DB_VERSION = 1;
const STORE_NAME = 'uploadedFiles';

const openDB = (): Promise<IDBDatabase> => {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: 'id' });
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
};

export const storeFileBlob = async (id: string, file: File): Promise<void> => {
  try {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readwrite');
      const store = tx.objectStore(STORE_NAME);
      const req = store.put({ id, file, name: file.name, type: file.type, lastModified: file.lastModified });
      req.onsuccess = () => resolve();
      req.onerror = () => reject(req.error);
    });
  } catch (e) {
    console.warn('IndexedDB write failed', e);
  }
};

export const getFileBlob = async (id: string): Promise<Blob | null> => {
  try {
    const db = await openDB();
    return new Promise((resolve) => {
      const tx = db.transaction(STORE_NAME, 'readonly');
      const store = tx.objectStore(STORE_NAME);
      const req = store.get(id);
      req.onsuccess = () => {
        if (req.result && req.result.file) {
          resolve(req.result.file);
        } else {
          resolve(null);
        }
      };
      req.onerror = () => resolve(null);
    });
  } catch (e) {
    console.warn('IndexedDB read failed', e);
    return null;
  }
};

// Export & Import backup
export const exportDataBackup = (course: CourseInfo, subjects: Subject[], goals: DailyGoal[]) => {
  const data = {
    course,
    subjects,
    goals,
    exportedAt: new Date().toISOString(),
    version: SYLLABUS_VERSION,
  };
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `gvp-r22-csm-study-hub-backup-${new Date().toISOString().split('T')[0]}.json`;
  a.click();
  URL.revokeObjectURL(url);
};

export const resetToDefaultData = (): void => {
  localStorage.removeItem(VERSION_KEY);
  localStorage.removeItem(COURSE_KEY);
  localStorage.removeItem(SUBJECTS_KEY);
  localStorage.removeItem(GOALS_KEY);
  localStorage.removeItem(SESSIONS_KEY);
  localStorage.removeItem('smart_edu_course_info');
  localStorage.removeItem('smart_edu_subjects');
};

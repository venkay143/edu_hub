import { Subject, CourseInfo, DailyGoal, StudySessionLog, FacultyMaterial } from '../types';
import { initialCourseInfo, initialSubjects } from '../data/initialSubjects';

const COURSE_KEY = 'smart_edu_course_info';
const SUBJECTS_KEY = 'smart_edu_subjects';
const GOALS_KEY = 'smart_edu_daily_goals';
const SESSIONS_KEY = 'smart_edu_study_sessions';

export const loadCourseInfo = (): CourseInfo => {
  try {
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
    const raw = localStorage.getItem(SUBJECTS_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
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
    { id: 'goal-1', text: 'Solve 0/1 Knapsack DP table problem (CS501)', completed: true, date: new Date().toISOString().split('T')[0] },
    { id: 'goal-2', text: 'Revise Normalization 1NF to BCNF rules (CS502)', completed: false, date: new Date().toISOString().split('T')[0] },
    { id: 'goal-3', text: 'Practice Banker’s Algorithm safety state numerical (CS503)', completed: false, date: new Date().toISOString().split('T')[0] },
    { id: 'goal-4', text: 'Review Subnetting VLSM CIDR IP ranges (CS504)', completed: false, date: new Date().toISOString().split('T')[0] },
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
    { id: 's1', subjectId: 'subject-1', subjectName: 'Design & Analysis of Algorithms', minutes: 45, timestamp: new Date(Date.now() - 3600000 * 5).toISOString(), type: 'pomodoro' },
    { id: 's2', subjectId: 'subject-2', subjectName: 'Database Management Systems', minutes: 60, timestamp: new Date(Date.now() - 3600000 * 24).toISOString(), type: 'revision' },
    { id: 's3', subjectId: 'subject-1', subjectName: 'Design & Analysis of Algorithms', minutes: 180, timestamp: new Date(Date.now() - 3600000 * 48).toISOString(), type: 'mock_exam' },
  ];
};

export const saveStudySessions = (sessions: StudySessionLog[]): void => {
  try {
    localStorage.setItem(SESSIONS_KEY, JSON.stringify(sessions));
  } catch (e) {
    console.error('Failed to save sessions', e);
  }
};

// IndexedDB for storing larger uploaded PDF blobs reliably in browser
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
    version: '1.0',
  };
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `smart-education-hub-backup-${new Date().toISOString().split('T')[0]}.json`;
  a.click();
  URL.revokeObjectURL(url);
};

export const resetToDefaultData = (): void => {
  localStorage.removeItem(COURSE_KEY);
  localStorage.removeItem(SUBJECTS_KEY);
  localStorage.removeItem(GOALS_KEY);
  localStorage.removeItem(SESSIONS_KEY);
};

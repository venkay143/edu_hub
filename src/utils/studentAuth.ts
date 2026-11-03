import { StudentUser } from '../types';

const CLASS_STUDENTS_KEY = 'smart_edu_class_students_r22';
const ACTIVE_STUDENT_KEY = 'smart_edu_active_student_r22';

export const MIN_ROLL = 5241412001;
export const MAX_ROLL = 5241412070;
export const TOTAL_STUDENTS = 70;

// Generate default 70 students
export const generateDefaultStudents = (): StudentUser[] => {
  const students: StudentUser[] = [];
  const colorPalette = [
    'indigo', 'teal', 'rose', 'emerald', 'amber', 
    'violet', 'cyan', 'blue', 'fuchsia', 'sky'
  ];

  for (let i = MIN_ROLL; i <= MAX_ROLL; i++) {
    const rollStr = i.toString();
    const studentNum = (i - MIN_ROLL + 1);
    const paddedNum = studentNum.toString().padStart(2, '0');
    const color = colorPalette[(studentNum - 1) % colorPalette.length];

    students.push({
      rollNumber: rollStr,
      name: `Student ${paddedNum}`,
      branch: 'B.Tech CSE (AI & ML) - R-22',
      semester: 'III Year – I Semester',
      section: studentNum <= 35 ? 'Section A' : 'Section B',
      avatarColor: color,
    });
  }

  return students;
};

// Load all students with any saved customizations
export const loadClassStudents = (): StudentUser[] => {
  try {
    const raw = localStorage.getItem(CLASS_STUDENTS_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length === TOTAL_STUDENTS) {
        return parsed;
      }
    }
  } catch (e) {
    console.warn('Failed to load class students from storage', e);
  }

  const defaultList = generateDefaultStudents();
  saveClassStudents(defaultList);
  return defaultList;
};

// Save class students list
export const saveClassStudents = (students: StudentUser[]): void => {
  try {
    localStorage.setItem(CLASS_STUDENTS_KEY, JSON.stringify(students));
  } catch (e) {
    console.error('Failed to save class students', e);
  }
};

// Get the currently logged-in student
export const getActiveStudent = (): StudentUser | null => {
  try {
    const raw = localStorage.getItem(ACTIVE_STUDENT_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed && parsed.rollNumber) {
        const rollNum = parseInt(parsed.rollNumber, 10);
        if (rollNum >= MIN_ROLL && rollNum <= MAX_ROLL) {
          // Re-fetch from latest list to get up-to-date name/password
          const all = loadClassStudents();
          const found = all.find(s => s.rollNumber === parsed.rollNumber);
          return found || parsed;
        }
      }
    }
  } catch (e) {
    console.warn('Failed to load active student', e);
  }
  return null;
};

// Set active student session
export const setActiveStudent = (student: StudentUser | null): void => {
  try {
    if (student) {
      localStorage.setItem(ACTIVE_STUDENT_KEY, JSON.stringify(student));
    } else {
      localStorage.removeItem(ACTIVE_STUDENT_KEY);
    }
  } catch (e) {
    console.error('Failed to set active student', e);
  }
};

// Authenticate student by roll number and password
export const authenticateStudent = (
  loginIdInput: string, 
  passwordInput: string
): { success: boolean; student?: StudentUser; error?: string } => {
  const trimmedId = loginIdInput.trim();
  const trimmedPass = passwordInput.trim();

  if (!trimmedId) {
    return { success: false, error: 'Please enter your Roll Number (e.g. 5241412001)' };
  }

  // Handle shorthand input like "1" or "01" -> 5241412001
  let normalizedRoll = trimmedId;
  if (/^\d{1,2}$/.test(trimmedId)) {
    const num = parseInt(trimmedId, 10);
    if (num >= 1 && num <= 70) {
      normalizedRoll = (MIN_ROLL + num - 1).toString();
    }
  }

  const rollNumberInt = parseInt(normalizedRoll, 10);
  if (isNaN(rollNumberInt) || rollNumberInt < MIN_ROLL || rollNumberInt > MAX_ROLL) {
    return { 
      success: false, 
      error: `Invalid Roll Number. Authorized range is ${MIN_ROLL} to ${MAX_ROLL} (Class members 1 to 70).` 
    };
  }

  const all = loadClassStudents();
  const student = all.find(s => s.rollNumber === normalizedRoll);

  if (!student) {
    return { success: false, error: 'Student record not found in class database.' };
  }

  // Expected password is customPassword (if set), otherwise defaults to their rollNumber
  const expectedPassword = student.customPassword || student.rollNumber;

  if (trimmedPass !== expectedPassword) {
    return { 
      success: false, 
      error: 'Incorrect password. Default password is your 10-digit roll number.' 
    };
  }

  // Update last login timestamp
  const updatedStudent: StudentUser = {
    ...student,
    lastLogin: new Date().toISOString(),
  };

  const updatedAll = all.map(s => s.rollNumber === student.rollNumber ? updatedStudent : s);
  saveClassStudents(updatedAll);
  setActiveStudent(updatedStudent);

  return { success: true, student: updatedStudent };
};

// Update student profile name or password
export const updateStudentProfile = (
  rollNumber: string, 
  newName: string, 
  newPassword?: string
): StudentUser | null => {
  const all = loadClassStudents();
  let updatedUser: StudentUser | null = null;

  const nextList = all.map(s => {
    if (s.rollNumber === rollNumber) {
      updatedUser = {
        ...s,
        name: newName.trim() || s.name,
        customPassword: newPassword && newPassword.trim() ? newPassword.trim() : s.customPassword,
      };
      return updatedUser;
    }
    return s;
  });

  if (updatedUser) {
    saveClassStudents(nextList);
    setActiveStudent(updatedUser);
  }

  return updatedUser;
};

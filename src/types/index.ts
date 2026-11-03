export interface CourseInfo {
  universityName: string;
  course: string;
  branch: string;
  semester: string;
  examStartDate: string;
  academicYear: string;
}

export interface Topic {
  id: string;
  title: string;
  completed: boolean;
  highYield?: boolean;
  hoursRequired?: number;
  personalNotes?: string;
}

export interface Unit {
  id: string;
  unitNumber: number;
  title: string;
  description: string;
  weightageMarks: number;
  topics: Topic[];
}

export interface PaperQuestion {
  questionNumber: string;
  text: string;
  marks: number;
  unit: string;
  repeatedCount?: number;
  answerKey?: string;
  diagramHint?: string;
}

export interface PaperSection {
  name: string;
  instruction: string;
  marksPerQuestion: number;
  totalMarks: number;
  questions: PaperQuestion[];
}

export interface ModelPaper {
  id: string;
  title: string;
  type: 'model' | 'previous_year' | 'mid_term';
  year?: string;
  totalMarks: number;
  durationMinutes: number;
  difficulty: 'Easy' | 'Moderate' | 'Challenging';
  sections: PaperSection[];
  isPracticed?: boolean;
  practicedScore?: number;
  practicedDate?: string;
  fileName?: string;
  customFileUrl?: string;
}

export interface AnalysisQuestion {
  id: string;
  text: string;
  marks: number;
  unitId: string;
  unitTitle: string;
  timesRepeated: number;
  years: string[];
  importance: 'Must Revise' | 'Frequently Asked' | 'Expected';
  answerSummary: string;
}

export interface HighYieldTopic {
  topic: string;
  unit: number;
  probability: '95% Certain' | '85% High' | '75% Frequent';
  tags: string[];
  recommendation: string;
}

export interface SubjectAnalysis {
  unitDistribution: {
    unitNumber: number;
    unitTitle: string;
    avgMarks: number;
    questionPercentage: number;
    color: string;
  }[];
  frequentlyRepeatedQuestions: AnalysisQuestion[];
  highYieldTopics: HighYieldTopic[];
  examStrategyTip: string;
  predictedCutoffOrPassTip: string;
}

export interface FacultyMaterial {
  id: string;
  title: string;
  unitId?: string;
  type: 'lecture_notes' | 'slides' | 'cheat_sheet' | 'viva' | 'custom_pdf';
  author: string;
  pages?: number;
  contentSummary: string;
  keyPoints?: string[];
  fileName?: string;
  fileDataUrl?: string; // base64 or object URL for uploaded PDFs
  dateAdded: string;
  isImportant?: boolean;
}

export interface Subject {
  id: string;
  code: string;
  name: string;
  icon: string;
  color: string;
  bgGradient: string;
  credits: number;
  facultyName: string;
  category?: 'theory' | 'elective' | 'lab' | 'skill' | 'honors';
  pdfPages?: string; // e.g. "Page 88-89"
  units: Unit[];
  papers: ModelPaper[];
  analysis: SubjectAnalysis;
  materials: FacultyMaterial[];
}

export interface DailyGoal {
  id: string;
  text: string;
  subjectId?: string;
  completed: boolean;
  date: string;
}

export interface StudySessionLog {
  id: string;
  subjectId: string;
  subjectName: string;
  minutes: number;
  timestamp: string;
  type: 'pomodoro' | 'mock_exam' | 'revision';
}

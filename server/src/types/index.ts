export type QuestionType = 'mcq' | 'short_answer' | 'long_answer' | 'true_false';
export type Difficulty = 'easy' | 'medium' | 'hard';
export type AssignmentStatus = 'pending' | 'processing' | 'completed' | 'failed';

export interface Question {
  questionNumber: number;
  text: string;
  type: QuestionType;
  difficulty: Difficulty;
  marks: number;
  options?: string[]; // for MCQ
}

export interface Section {
  title: string;       // 'Section A', 'Section B', etc.
  instruction: string; // 'Attempt all questions'
  questions: Question[];
}

export interface GeneratedPaper {
  sections: Section[];
  metadata: {
    totalMarks: number;
    totalQuestions: number;
    generatedAt: Date;
  };
}

export interface AssignmentData {
  title: string;
  subject: string;
  grade: string;
  dueDate: Date;
  duration: number;
  totalMarks: number;
  questionTypes: QuestionType[];
  numberOfQuestions: number;
  difficultyDistribution: { easy: number; medium: number; hard: number };
  additionalInstructions?: string;
  uploadedContent?: string;
  status: AssignmentStatus;
  generatedPaper?: GeneratedPaper;
  jobId?: string;
}

export interface AssignmentDocument extends AssignmentData {
  _id: string;
  createdAt: Date;
  updatedAt: Date;
}

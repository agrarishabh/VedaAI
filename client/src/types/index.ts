export type QuestionType = 'mcq' | 'short_answer' | 'long_answer' | 'true_false';
export type Difficulty = 'easy' | 'medium' | 'hard';
export type AssignmentStatus = 'pending' | 'processing' | 'completed' | 'failed';

export interface Question {
  questionNumber: number;
  text: string;
  type: QuestionType;
  difficulty: Difficulty;
  marks: number;
  options?: string[];
}

export interface Section {
  title: string;
  instruction: string;
  questions: Question[];
}

export interface GeneratedPaper {
  sections: Section[];
  metadata: {
    totalMarks: number;
    totalQuestions: number;
    generatedAt: string;
  };
}

export interface Assignment {
  _id: string;
  title: string;
  subject: string;
  grade: string;
  dueDate: string;
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
  createdAt: string;
  updatedAt: string;
}

export interface AssignmentFormData {
  title: string;
  subject: string;
  grade: string;
  dueDate: string;
  duration: number;
  totalMarks: number;
  questionTypes: QuestionType[];
  numberOfQuestions: number;
  difficultyDistribution: { easy: number; medium: number; hard: number };
  additionalInstructions: string;
  uploadedContent: string;
}

export type GenerationStatus = 'idle' | 'submitting' | 'queued' | 'processing' | 'completed' | 'failed';

export interface GenerationProgress {
  step: string;
  progress: number;
  message: string;
}

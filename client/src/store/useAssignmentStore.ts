import { create } from 'zustand';
import type {
  Assignment,
  AssignmentFormData,
  GeneratedPaper,
  GenerationStatus,
  QuestionType,
} from '@/types';
import { createAssignment, getAllAssignments, getAssignment } from '@/lib/api';

const initialFormData: AssignmentFormData = {
  title: '',
  subject: '',
  grade: '',
  dueDate: '',
  duration: 60,
  totalMarks: 100,
  questionTypes: [],
  numberOfQuestions: 10,
  difficultyDistribution: { easy: 30, medium: 50, hard: 20 },
  additionalInstructions: '',
  uploadedContent: '',
};

interface AssignmentState {
  formData: AssignmentFormData;
  generationStatus: GenerationStatus;
  generatedPaper: GeneratedPaper | null;
  currentAssignment: Assignment | null;
  assignments: Assignment[];
  error: string | null;
  generationProgress: number;
  generationMessage: string;

  setFormField: <K extends keyof AssignmentFormData>(field: K, value: AssignmentFormData[K]) => void;
  setFormData: (data: Partial<AssignmentFormData>) => void;
  toggleQuestionType: (type: QuestionType) => void;
  setDifficulty: (key: 'easy' | 'medium' | 'hard', value: number) => void;
  setGenerationStatus: (status: GenerationStatus) => void;
  setGenerationProgress: (progress: number, message: string) => void;
  setGeneratedPaper: (paper: GeneratedPaper | null) => void;
  setCurrentAssignment: (assignment: Assignment | null) => void;
  setError: (error: string | null) => void;

  submitAssignment: () => Promise<Assignment | null>;
  fetchAssignments: () => Promise<void>;
  fetchAssignment: (id: string) => Promise<void>;
  resetForm: () => void;
}

export const useAssignmentStore = create<AssignmentState>((set, get) => ({
  formData: { ...initialFormData },
  generationStatus: 'idle',
  generatedPaper: null,
  currentAssignment: null,
  assignments: [],
  error: null,
  generationProgress: 0,
  generationMessage: '',

  setFormField: (field, value) =>
    set((state) => ({
      formData: { ...state.formData, [field]: value },
    })),

  setFormData: (data) =>
    set((state) => ({
      formData: { ...state.formData, ...data },
    })),

  toggleQuestionType: (type) =>
    set((state) => {
      const types = state.formData.questionTypes;
      const newTypes = types.includes(type)
        ? types.filter((t) => t !== type)
        : [...types, type];
      return {
        formData: { ...state.formData, questionTypes: newTypes },
      };
    }),

  setDifficulty: (key, value) =>
    set((state) => ({
      formData: {
        ...state.formData,
        difficultyDistribution: {
          ...state.formData.difficultyDistribution,
          [key]: value,
        },
      },
    })),

  setGenerationStatus: (status) => set({ generationStatus: status }),

  setGenerationProgress: (progress, message) =>
    set({ generationProgress: progress, generationMessage: message }),

  setGeneratedPaper: (paper) => set({ generatedPaper: paper }),

  setCurrentAssignment: (assignment) => set({ currentAssignment: assignment }),

  setError: (error) => set({ error }),

  submitAssignment: async () => {
    const { formData } = get();
    set({ generationStatus: 'submitting', error: null });
    try {
      const assignment = await createAssignment(formData);
      set({
        generationStatus: 'queued',
        currentAssignment: assignment,
      });
      return assignment;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to create assignment';
      set({ generationStatus: 'failed', error: message });
      return null;
    }
  },

  fetchAssignments: async () => {
    try {
      const assignments = await getAllAssignments();
      set({ assignments });
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to fetch assignments';
      set({ error: message });
    }
  },

  fetchAssignment: async (id: string) => {
    try {
      const assignment = await getAssignment(id);
      set({
        currentAssignment: assignment,
        generatedPaper: assignment.generatedPaper || null,
      });
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to fetch assignment';
      set({ error: message });
    }
  },

  resetForm: () =>
    set({
      formData: { ...initialFormData },
      generationStatus: 'idle',
      generatedPaper: null,
      error: null,
      generationProgress: 0,
      generationMessage: '',
    }),
}));

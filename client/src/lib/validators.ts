import { z } from 'zod';

export const assignmentSchema = z.object({
  title: z
    .string()
    .min(1, 'Title is required')
    .max(200, 'Title must be less than 200 characters'),
  subject: z
    .string()
    .min(1, 'Subject is required')
    .max(100, 'Subject must be less than 100 characters'),
  grade: z
    .string()
    .min(1, 'Grade/Class is required'),
  dueDate: z
    .string()
    .min(1, 'Due date is required')
    .refine((val) => {
      const date = new Date(val);
      const now = new Date();
      now.setHours(0, 0, 0, 0);
      return date >= now;
    }, 'Due date must be today or in the future'),
  duration: z
    .number({ invalid_type_error: 'Duration must be a number' })
    .min(1, 'Duration must be at least 1 minute')
    .max(480, 'Duration cannot exceed 480 minutes'),
  totalMarks: z
    .number({ invalid_type_error: 'Total marks must be a number' })
    .min(1, 'Total marks must be at least 1')
    .max(500, 'Total marks cannot exceed 500'),
  questionTypes: z
    .array(z.enum(['mcq', 'short_answer', 'long_answer', 'true_false']))
    .min(1, 'Select at least one question type'),
  numberOfQuestions: z
    .number({ invalid_type_error: 'Number of questions must be a number' })
    .min(1, 'Must have at least 1 question')
    .max(100, 'Cannot exceed 100 questions'),
  difficultyDistribution: z
    .object({
      easy: z.number().min(0, 'Cannot be negative').max(100),
      medium: z.number().min(0, 'Cannot be negative').max(100),
      hard: z.number().min(0, 'Cannot be negative').max(100),
    })
    .refine(
      (dist) => dist.easy + dist.medium + dist.hard === 100,
      'Difficulty distribution must sum to 100%'
    ),
  additionalInstructions: z
    .string()
    .max(2000, 'Additional instructions must be less than 2000 characters'),
  uploadedContent: z.string(),
});

export type AssignmentFormValues = z.infer<typeof assignmentSchema>;

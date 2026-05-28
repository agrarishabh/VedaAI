import mongoose, { Schema, Document } from 'mongoose';
import type { AssignmentData } from '../types/index.js';

export interface IAssignment extends Omit<AssignmentData, '_id'>, Document {
  createdAt: Date;
  updatedAt: Date;
}

const QuestionSchema = new Schema(
  {
    questionNumber: { type: Number, required: true },
    text: { type: String, required: true },
    type: {
      type: String,
      enum: ['mcq', 'short_answer', 'long_answer', 'true_false'],
      required: true,
    },
    difficulty: {
      type: String,
      enum: ['easy', 'medium', 'hard'],
      required: true,
    },
    marks: { type: Number, required: true },
    options: { type: [String], default: undefined },
  },
  { _id: false }
);

const SectionSchema = new Schema(
  {
    title: { type: String, required: true },
    instruction: { type: String, required: true },
    questions: { type: [QuestionSchema], required: true },
  },
  { _id: false }
);

const GeneratedPaperSchema = new Schema(
  {
    sections: { type: [SectionSchema], required: true },
    metadata: {
      totalMarks: { type: Number, required: true },
      totalQuestions: { type: Number, required: true },
      generatedAt: { type: Date, required: true, default: Date.now },
    },
  },
  { _id: false }
);

const AssignmentSchema = new Schema<IAssignment>(
  {
    title: { type: String, required: true, trim: true },
    subject: { type: String, required: true, trim: true },
    grade: { type: String, required: true, trim: true },
    dueDate: { type: Date, required: true },
    duration: { type: Number, required: true, min: 1 },
    totalMarks: { type: Number, required: true, min: 1 },
    questionTypes: {
      type: [String],
      enum: ['mcq', 'short_answer', 'long_answer', 'true_false'],
      required: true,
    },
    numberOfQuestions: { type: Number, required: true, min: 1 },
    difficultyDistribution: {
      easy: { type: Number, required: true, min: 0 },
      medium: { type: Number, required: true, min: 0 },
      hard: { type: Number, required: true, min: 0 },
    },
    additionalInstructions: { type: String, default: undefined },
    uploadedContent: { type: String, default: undefined },
    status: {
      type: String,
      enum: ['pending', 'processing', 'completed', 'failed'],
      default: 'pending',
      required: true,
    },
    generatedPaper: { type: GeneratedPaperSchema, default: undefined },
    jobId: { type: String, default: undefined },
  },
  {
    timestamps: true,
  }
);

AssignmentSchema.index({ status: 1 });
AssignmentSchema.index({ createdAt: -1 });

export const Assignment = mongoose.model<IAssignment>('Assignment', AssignmentSchema);

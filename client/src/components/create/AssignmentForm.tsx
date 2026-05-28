'use client';

import React, { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Send } from 'lucide-react';
import Input from '@/components/ui/Input';
import Select from '@/components/ui/Select';
import TextArea from '@/components/ui/TextArea';
import FileUpload from '@/components/ui/FileUpload';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import QuestionTypeSelector from './QuestionTypeSelector';
import MarksConfig from './MarksConfig';
import { useAssignmentStore } from '@/store/useAssignmentStore';
import { useSocketStore } from '@/store/useSocketStore';
import { assignmentSchema } from '@/lib/validators';
import type { QuestionType } from '@/types';

const gradeOptions = [
  { value: '6', label: 'Class 6' },
  { value: '7', label: 'Class 7' },
  { value: '8', label: 'Class 8' },
  { value: '9', label: 'Class 9' },
  { value: '10', label: 'Class 10' },
  { value: '11', label: 'Class 11' },
  { value: '12', label: 'Class 12' },
  { value: 'UG', label: 'Undergraduate' },
  { value: 'PG', label: 'Postgraduate' },
];

export default function AssignmentForm() {
  const router = useRouter();
  const {
    formData,
    setFormField,
    toggleQuestionType,
    setDifficulty,
    submitAssignment,
    generationStatus,
    setGenerationStatus,
    setGenerationProgress,
    setGeneratedPaper,
  } = useAssignmentStore();

  const { connect, joinAssignment } = useSocketStore();
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      setErrors({});

      // Validate
      const result = assignmentSchema.safeParse(formData);
      if (!result.success) {
        const fieldErrors: Record<string, string> = {};
        result.error.errors.forEach((err) => {
          const path = err.path.join('.');
          fieldErrors[path] = err.message;
        });
        setErrors(fieldErrors);
        return;
      }

      // Submit
      const assignment = await submitAssignment();
      if (!assignment) return;

      // Connect WebSocket and listen for updates
      connect();
      
      // Give socket time to connect before joining the room
      setTimeout(() => {
        joinAssignment(assignment._id, {
          onProgress: (data) => {
            console.log('[Form] Generation progress:', data);
            setGenerationStatus('processing');
            setGenerationProgress(data.progress, data.message);
          },
          onComplete: (data) => {
            console.log('[Form] Generation complete!', data);
            setGenerationStatus('completed');
            setGeneratedPaper(data.paper);
            setGenerationProgress(100, 'Complete!');
            setTimeout(() => {
              router.push(`/assessment/${assignment._id}`);
            }, 800);
          },
          onFailed: (data) => {
            console.error('[Form] Generation failed:', data);
            setGenerationStatus('failed');
            setGenerationProgress(0, data.error);
          },
        });
      }, 100);
    },
    [formData, submitAssignment, connect, joinAssignment, setGenerationStatus, setGenerationProgress, setGeneratedPaper, router]
  );

  return (
    <form onSubmit={handleSubmit}>
      <Card padding="lg" style={{ maxWidth: '780px', margin: '0 auto' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          {/* Title & Subject */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <Input
              label="Assessment Title"
              placeholder="e.g., Midterm Examination"
              value={formData.title}
              onChange={(e) => setFormField('title', e.target.value)}
              error={errors.title}
              required
            />
            <Input
              label="Subject"
              placeholder="e.g., Mathematics"
              value={formData.subject}
              onChange={(e) => setFormField('subject', e.target.value)}
              error={errors.subject}
              required
            />
          </div>

          {/* Grade & Due Date */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <Select
              label="Grade / Class"
              options={gradeOptions}
              value={formData.grade}
              onChange={(e) => setFormField('grade', e.target.value)}
              placeholder="Select grade"
              error={errors.grade}
              required
            />
            <Input
              label="Due Date"
              type="date"
              value={formData.dueDate}
              onChange={(e) => setFormField('dueDate', e.target.value)}
              error={errors.dueDate}
              required
            />
          </div>

          {/* Duration */}
          <Input
            label="Duration (minutes)"
            type="number"
            min={1}
            max={480}
            value={formData.duration}
            onChange={(e) => setFormField('duration', parseInt(e.target.value) || 0)}
            error={errors.duration}
            helperText="Maximum exam time in minutes"
            required
          />

          {/* Question Types */}
          <QuestionTypeSelector
            selected={formData.questionTypes}
            onToggle={(type: QuestionType) => toggleQuestionType(type)}
            error={errors.questionTypes}
          />

          {/* Marks & Difficulty */}
          <MarksConfig
            numberOfQuestions={formData.numberOfQuestions}
            totalMarks={formData.totalMarks}
            difficultyDistribution={formData.difficultyDistribution}
            onQuestionsChange={(v) => setFormField('numberOfQuestions', v)}
            onMarksChange={(v) => setFormField('totalMarks', v)}
            onDifficultyChange={(key, value) => setDifficulty(key, value)}
            errors={{
              numberOfQuestions: errors.numberOfQuestions,
              totalMarks: errors.totalMarks,
              difficultyDistribution: errors.difficultyDistribution || errors['difficultyDistribution'],
            }}
          />

          {/* Additional Instructions */}
          <TextArea
            label="Additional Instructions"
            placeholder="Any specific topics, constraints, or notes for the AI..."
            value={formData.additionalInstructions}
            onChange={(e) => setFormField('additionalInstructions', e.target.value)}
            maxLength={2000}
            showCharCount
            error={errors.additionalInstructions}
          />

          {/* File Upload */}
          <FileUpload
            label="Upload Reference Material (Optional)"
            onFileSelect={(content) => setFormField('uploadedContent', content)}
            onFileClear={() => setFormField('uploadedContent', '')}
            error={errors.uploadedContent}
          />

          {/* Submit */}
          <Button
            type="submit"
            variant="primary"
            size="lg"
            fullWidth
            loading={generationStatus === 'submitting'}
            icon={<Send size={18} />}
          >
            Generate Assessment
          </Button>
        </div>
      </Card>
    </form>
  );
}

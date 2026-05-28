'use client';

import React from 'react';
import Input from '@/components/ui/Input';

interface MarksConfigProps {
  numberOfQuestions: number;
  totalMarks: number;
  difficultyDistribution: { easy: number; medium: number; hard: number };
  onQuestionsChange: (v: number) => void;
  onMarksChange: (v: number) => void;
  onDifficultyChange: (key: 'easy' | 'medium' | 'hard', value: number) => void;
  errors?: {
    numberOfQuestions?: string;
    totalMarks?: string;
    difficultyDistribution?: string;
  };
}

export default function MarksConfig({
  numberOfQuestions,
  totalMarks,
  difficultyDistribution,
  onQuestionsChange,
  onMarksChange,
  onDifficultyChange,
  errors = {},
}: MarksConfigProps) {
  const sum = difficultyDistribution.easy + difficultyDistribution.medium + difficultyDistribution.hard;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
        <Input
          label="Number of Questions"
          type="number"
          min={1}
          max={100}
          value={numberOfQuestions}
          onChange={(e) => onQuestionsChange(parseInt(e.target.value) || 0)}
          error={errors.numberOfQuestions}
          required
        />
        <Input
          label="Total Marks"
          type="number"
          min={1}
          max={500}
          value={totalMarks}
          onChange={(e) => onMarksChange(parseInt(e.target.value) || 0)}
          error={errors.totalMarks}
          required
        />
      </div>

      <div className="form-group">
        <label className="form-label form-label-required">
          Difficulty Distribution
          <span style={{ marginLeft: 'auto', fontSize: '0.75rem', color: sum === 100 ? 'var(--success)' : 'var(--danger)', fontWeight: 600 }}>
            Total: {sum}%
          </span>
        </label>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {/* Easy */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <span className="badge badge-easy" style={{ width: '70px', justifyContent: 'center' }}>Easy</span>
            <input
              type="range"
              min={0}
              max={100}
              value={difficultyDistribution.easy}
              onChange={(e) => onDifficultyChange('easy', parseInt(e.target.value))}
              style={{ flex: 1, accentColor: 'var(--success)' }}
            />
            <span style={{ width: '40px', textAlign: 'right', fontSize: '0.875rem', fontWeight: 600, color: 'var(--success)' }}>
              {difficultyDistribution.easy}%
            </span>
          </div>

          {/* Medium */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <span className="badge badge-medium" style={{ width: '70px', justifyContent: 'center' }}>Medium</span>
            <input
              type="range"
              min={0}
              max={100}
              value={difficultyDistribution.medium}
              onChange={(e) => onDifficultyChange('medium', parseInt(e.target.value))}
              style={{ flex: 1, accentColor: 'var(--warning)' }}
            />
            <span style={{ width: '40px', textAlign: 'right', fontSize: '0.875rem', fontWeight: 600, color: 'var(--warning)' }}>
              {difficultyDistribution.medium}%
            </span>
          </div>

          {/* Hard */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <span className="badge badge-hard" style={{ width: '70px', justifyContent: 'center' }}>Hard</span>
            <input
              type="range"
              min={0}
              max={100}
              value={difficultyDistribution.hard}
              onChange={(e) => onDifficultyChange('hard', parseInt(e.target.value))}
              style={{ flex: 1, accentColor: 'var(--danger)' }}
            />
            <span style={{ width: '40px', textAlign: 'right', fontSize: '0.875rem', fontWeight: 600, color: 'var(--danger)' }}>
              {difficultyDistribution.hard}%
            </span>
          </div>
        </div>

        {errors.difficultyDistribution && (
          <span className="form-error">{errors.difficultyDistribution}</span>
        )}
      </div>
    </div>
  );
}

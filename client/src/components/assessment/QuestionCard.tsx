'use client';

import React from 'react';
import DifficultyBadge from './DifficultyBadge';
import type { Question } from '@/types';

interface QuestionCardProps {
  question: Question;
}

export default function QuestionCard({ question }: QuestionCardProps) {
  return (
    <div
      style={{
        padding: '14px 0',
        borderBottom: '1px solid #eee',
        display: 'flex',
        flexDirection: 'column',
        gap: '8px',
      }}
    >
      {/* Header row */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '12px' }}>
        <div style={{ flex: 1 }}>
          <span style={{ fontWeight: 600, fontSize: '0.9375rem', color: '#1a1a2e' }}>
            Q{question.questionNumber}.{' '}
          </span>
          <span style={{ fontSize: '0.9375rem', color: '#1a1a2e', lineHeight: 1.6 }}>
            {question.text}
          </span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexShrink: 0 }}>
          <DifficultyBadge difficulty={question.difficulty} />
          <span
            style={{
              fontSize: '0.75rem',
              fontWeight: 700,
              color: '#6366f1',
              background: 'rgba(99, 102, 241, 0.08)',
              padding: '2px 8px',
              borderRadius: '6px',
              border: '1px solid rgba(99, 102, 241, 0.15)',
              whiteSpace: 'nowrap',
            }}
          >
            [{question.marks} {question.marks === 1 ? 'Mark' : 'Marks'}]
          </span>
        </div>
      </div>

      {/* MCQ options */}
      {question.type === 'mcq' && question.options && question.options.length > 0 && (
        <div style={{ paddingLeft: '24px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
          {question.options.map((opt, idx) => (
            <div
              key={idx}
              style={{
                fontSize: '0.875rem',
                color: '#374151',
                padding: '4px 0',
                display: 'flex',
                gap: '8px',
              }}
            >
              <span style={{ fontWeight: 600, color: '#6B7280', minWidth: '20px' }}>
                {String.fromCharCode(97 + idx)})
              </span>
              <span>{opt}</span>
            </div>
          ))}
        </div>
      )}

      {/* Answer space indicator for non-MCQ */}
      {question.type === 'long_answer' && (
        <div style={{ paddingLeft: '24px', paddingTop: '4px' }}>
          <p style={{ fontSize: '0.75rem', color: '#9CA3AF', fontStyle: 'italic' }}>
            (Answer in detail)
          </p>
        </div>
      )}
    </div>
  );
}

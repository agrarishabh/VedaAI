'use client';

import React from 'react';
import QuestionCard from './QuestionCard';
import type { Section } from '@/types';

interface QuestionSectionProps {
  section: Section;
  index: number;
}

export default function QuestionSection({ section, index }: QuestionSectionProps) {
  const totalMarks = section.questions.reduce((sum, q) => sum + q.marks, 0);

  return (
    <div style={{ marginBottom: '28px' }}>
      {/* Section header */}
      <div
        style={{
          background: 'linear-gradient(135deg, #f8f7ff 0%, #f0edff 100%)',
          border: '1px solid rgba(124, 58, 237, 0.12)',
          borderRadius: '10px',
          padding: '14px 20px',
          marginBottom: '12px',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#1a1a2e', letterSpacing: '-0.01em' }}>
            {section.title}
          </h3>
          <span style={{ fontSize: '0.8125rem', fontWeight: 600, color: '#7C3AED' }}>
            {totalMarks} Marks
          </span>
        </div>
        {section.instruction && (
          <p style={{ fontSize: '0.8125rem', color: '#6B7280', marginTop: '4px', fontStyle: 'italic' }}>
            {section.instruction}
          </p>
        )}
      </div>

      {/* Questions */}
      <div style={{ paddingLeft: '4px' }}>
        {section.questions.map((question, qIdx) => (
          <QuestionCard key={qIdx} question={question} />
        ))}
      </div>
    </div>
  );
}

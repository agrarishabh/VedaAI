'use client';

import React, { forwardRef } from 'react';
import StudentInfoSection from './StudentInfoSection';
import QuestionSection from './QuestionSection';
import type { Assignment } from '@/types';

interface QuestionPaperProps {
  assignment: Assignment;
}

const QuestionPaper = forwardRef<HTMLDivElement, QuestionPaperProps>(({ assignment }, ref) => {
  const paper = assignment.generatedPaper;
  if (!paper) return null;

  return (
    <div
      ref={ref}
      id="question-paper"
      style={{
        background: '#ffffff',
        color: '#1a1a2e',
        borderRadius: '16px',
        boxShadow: '0 4px 24px rgba(0,0,0,0.12)',
        overflow: 'hidden',
        fontFamily: "'Inter', 'Segoe UI', sans-serif",
      }}
    >
      {/* Paper header */}
      <div
        style={{
          background: 'linear-gradient(135deg, #7C3AED 0%, #A855F7 50%, #C084FC 100%)',
          padding: '32px 40px',
          color: 'white',
          textAlign: 'center',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* Decorative elements */}
        <div
          style={{
            position: 'absolute',
            top: '-20px',
            right: '-20px',
            width: '120px',
            height: '120px',
            borderRadius: '50%',
            background: 'rgba(255,255,255,0.08)',
          }}
        />
        <div
          style={{
            position: 'absolute',
            bottom: '-30px',
            left: '-10px',
            width: '80px',
            height: '80px',
            borderRadius: '50%',
            background: 'rgba(255,255,255,0.05)',
          }}
        />

        <h1
          style={{
            fontSize: '1.5rem',
            fontWeight: 800,
            letterSpacing: '-0.02em',
            marginBottom: '6px',
            position: 'relative',
          }}
        >
          {assignment.title}
        </h1>
        <p style={{ fontSize: '1rem', opacity: 0.9, fontWeight: 500, position: 'relative' }}>
          {assignment.subject} — Class {assignment.grade}
        </p>

        {/* Meta strip */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'center',
            gap: '32px',
            marginTop: '16px',
            paddingTop: '14px',
            borderTop: '1px solid rgba(255,255,255,0.2)',
            position: 'relative',
          }}
        >
          <div>
            <span style={{ fontSize: '0.6875rem', opacity: 0.7, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
              Total Marks
            </span>
            <p style={{ fontSize: '1.125rem', fontWeight: 800 }}>{assignment.totalMarks}</p>
          </div>
          <div>
            <span style={{ fontSize: '0.6875rem', opacity: 0.7, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
              Duration
            </span>
            <p style={{ fontSize: '1.125rem', fontWeight: 800 }}>{assignment.duration} min</p>
          </div>
          <div>
            <span style={{ fontSize: '0.6875rem', opacity: 0.7, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
              Questions
            </span>
            <p style={{ fontSize: '1.125rem', fontWeight: 800 }}>{paper.metadata.totalQuestions}</p>
          </div>
        </div>
      </div>

      {/* Paper body */}
      <div style={{ padding: '32px 40px' }}>
        {/* Student info */}
        <StudentInfoSection />

        {/* General instructions */}
        <div
          style={{
            background: '#fefce8',
            border: '1px solid #fde68a',
            borderRadius: '8px',
            padding: '12px 16px',
            marginBottom: '28px',
          }}
        >
          <p style={{ fontSize: '0.8125rem', fontWeight: 600, color: '#92400e', marginBottom: '6px' }}>
            General Instructions:
          </p>
          <ul style={{ fontSize: '0.8125rem', color: '#78350f', paddingLeft: '18px', listStyle: 'disc', lineHeight: 1.7 }}>
            <li>All questions are compulsory unless stated otherwise.</li>
            <li>Read each question carefully before attempting.</li>
            <li>Marks for each question are indicated on the right.</li>
            {assignment.additionalInstructions && (
              <li>{assignment.additionalInstructions}</li>
            )}
          </ul>
        </div>

        {/* Sections */}
        {paper.sections.map((section, idx) => (
          <QuestionSection key={idx} section={section} index={idx} />
        ))}

        {/* Footer */}
        <div
          style={{
            textAlign: 'center',
            paddingTop: '24px',
            marginTop: '16px',
            borderTop: '2px solid #e5e7eb',
          }}
        >
          <p style={{ fontSize: '0.8125rem', color: '#9CA3AF', fontStyle: 'italic' }}>
            — End of Question Paper —
          </p>
          <p style={{ fontSize: '0.6875rem', color: '#d1d5db', marginTop: '8px' }}>
            Generated by VedaAI Assessment Creator
          </p>
        </div>
      </div>
    </div>
  );
});

QuestionPaper.displayName = 'QuestionPaper';
export default QuestionPaper;

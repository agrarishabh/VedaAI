'use client';

import React from 'react';
import { ListChecks, AlignLeft, FileText, ToggleLeft } from 'lucide-react';
import type { QuestionType } from '@/types';

interface QuestionTypeSelectorProps {
  selected: QuestionType[];
  onToggle: (type: QuestionType) => void;
  error?: string;
}

const questionTypes: { type: QuestionType; label: string; icon: React.ReactNode; description: string }[] = [
  { type: 'mcq', label: 'MCQ', icon: <ListChecks size={20} />, description: 'Multiple choice' },
  { type: 'short_answer', label: 'Short Answer', icon: <AlignLeft size={20} />, description: 'Brief responses' },
  { type: 'long_answer', label: 'Long Answer', icon: <FileText size={20} />, description: 'Detailed answers' },
  { type: 'true_false', label: 'True / False', icon: <ToggleLeft size={20} />, description: 'Binary choice' },
];

export default function QuestionTypeSelector({ selected, onToggle, error }: QuestionTypeSelectorProps) {
  return (
    <div className="form-group">
      <label className="form-label form-label-required">Question Types</label>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '10px' }}>
        {questionTypes.map(({ type, label, icon, description }) => {
          const isSelected = selected.includes(type);
          return (
            <button
              key={type}
              type="button"
              onClick={() => onToggle(type)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                padding: '12px 16px',
                borderRadius: 'var(--radius-md)',
                border: `1.5px solid ${isSelected ? 'var(--accent-primary)' : 'var(--border)'}`,
                background: isSelected ? 'rgba(124, 58, 237, 0.08)' : 'var(--bg-tertiary)',
                color: isSelected ? 'var(--text-primary)' : 'var(--text-secondary)',
                cursor: 'pointer',
                transition: 'all var(--transition-fast)',
                textAlign: 'left',
              }}
              onMouseEnter={(e) => {
                if (!isSelected) {
                  e.currentTarget.style.borderColor = 'var(--border-hover)';
                  e.currentTarget.style.background = 'var(--bg-elevated)';
                }
              }}
              onMouseLeave={(e) => {
                if (!isSelected) {
                  e.currentTarget.style.borderColor = 'var(--border)';
                  e.currentTarget.style.background = 'var(--bg-tertiary)';
                }
              }}
            >
              <div
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: 'var(--radius-sm)',
                  background: isSelected ? 'rgba(124, 58, 237, 0.15)' : 'rgba(255,255,255,0.04)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: isSelected ? 'var(--accent-primary)' : 'var(--text-muted)',
                  flexShrink: 0,
                }}
              >
                {icon}
              </div>
              <div>
                <div style={{ fontSize: '0.875rem', fontWeight: 600 }}>{label}</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{description}</div>
              </div>
            </button>
          );
        })}
      </div>
      {error && <span className="form-error">{error}</span>}
    </div>
  );
}

'use client';

import React from 'react';
import type { Difficulty } from '@/types';

interface DifficultyBadgeProps {
  difficulty: Difficulty;
}

const config: Record<Difficulty, { label: string; bg: string; color: string; border: string }> = {
  easy: {
    label: 'Easy',
    bg: 'rgba(16, 185, 129, 0.12)',
    color: '#10B981',
    border: 'rgba(16, 185, 129, 0.25)',
  },
  medium: {
    label: 'Medium',
    bg: 'rgba(245, 158, 11, 0.12)',
    color: '#F59E0B',
    border: 'rgba(245, 158, 11, 0.25)',
  },
  hard: {
    label: 'Hard',
    bg: 'rgba(239, 68, 68, 0.12)',
    color: '#EF4444',
    border: 'rgba(239, 68, 68, 0.25)',
  },
};

export default function DifficultyBadge({ difficulty }: DifficultyBadgeProps) {
  const c = config[difficulty] || config.medium;

  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        padding: '2px 10px',
        fontSize: '0.6875rem',
        fontWeight: 700,
        borderRadius: '9999px',
        textTransform: 'uppercase',
        letterSpacing: '0.04em',
        background: c.bg,
        color: c.color,
        border: `1px solid ${c.border}`,
        whiteSpace: 'nowrap',
      }}
    >
      {c.label}
    </span>
  );
}

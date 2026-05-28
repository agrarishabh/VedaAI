'use client';

import React from 'react';

interface BadgeProps {
  variant: 'easy' | 'medium' | 'hard' | 'pending' | 'processing' | 'completed' | 'failed';
  children?: React.ReactNode;
  className?: string;
}

const variantLabels: Record<string, string> = {
  easy: 'Easy',
  medium: 'Medium',
  hard: 'Hard',
  pending: 'Pending',
  processing: 'Processing',
  completed: 'Completed',
  failed: 'Failed',
};

export default function Badge({ variant, children, className = '' }: BadgeProps) {
  const isStatus = ['pending', 'processing', 'completed', 'failed'].includes(variant);

  return (
    <span className={`badge badge-${variant} ${isStatus ? 'badge-status' : ''} ${className}`}>
      {children || variantLabels[variant]}
    </span>
  );
}

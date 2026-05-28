'use client';

import React from 'react';

interface ProgressBarProps {
  progress: number;
  label?: string;
  showValue?: boolean;
}

export default function ProgressBar({ progress, label, showValue = true }: ProgressBarProps) {
  const clamped = Math.min(100, Math.max(0, progress));

  return (
    <div className="progress-bar-container">
      {(label || showValue) && (
        <div className="progress-bar-header">
          {label && <span className="progress-bar-label">{label}</span>}
          {showValue && <span className="progress-bar-value">{Math.round(clamped)}%</span>}
        </div>
      )}
      <div className="progress-bar-track">
        <div className="progress-bar-fill" style={{ width: `${clamped}%` }} />
      </div>
    </div>
  );
}

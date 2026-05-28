'use client';

import React from 'react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  hoverable?: boolean;
  padding?: 'sm' | 'md' | 'lg';
  accent?: boolean;
  style?: React.CSSProperties;
}

export default function Card({
  children,
  className = '',
  hoverable = false,
  padding = 'md',
  accent = false,
  style,
}: CardProps) {
  const padClass = padding === 'sm' ? 'card-sm' : padding === 'lg' ? 'card-lg' : '';
  const classes = [
    'card',
    padClass,
    hoverable ? 'card-hoverable' : '',
    accent ? 'card-accent' : '',
    className,
  ].filter(Boolean).join(' ');

  return (
    <div className={classes} style={style}>
      {children}
    </div>
  );
}

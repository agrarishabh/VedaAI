'use client';

import React from 'react';

interface SpinnerProps {
  size?: 'sm' | 'md' | 'lg';
}

const sizes = { sm: 16, md: 24, lg: 40 };
const borders = { sm: 2, md: 3, lg: 4 };

export default function Spinner({ size = 'md' }: SpinnerProps) {
  return (
    <div
      className="spinner"
      style={{
        width: sizes[size],
        height: sizes[size],
        borderWidth: borders[size],
      }}
    />
  );
}

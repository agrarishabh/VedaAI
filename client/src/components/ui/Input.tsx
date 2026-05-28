'use client';

import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
  icon?: React.ReactNode;
  required?: boolean;
}

export default function Input({
  label,
  error,
  helperText,
  icon,
  required,
  className = '',
  id,
  ...props
}: InputProps) {
  const inputId = id || label?.toLowerCase().replace(/\s+/g, '-');

  return (
    <div className="form-group">
      {label && (
        <label htmlFor={inputId} className={`form-label ${required ? 'form-label-required' : ''}`}>
          {label}
        </label>
      )}
      <div className={icon ? 'form-input-icon' : ''}>
        {icon && <span className="form-input-icon-element">{icon}</span>}
        <input
          id={inputId}
          className={`form-input ${error ? 'form-input-error' : ''} ${className}`}
          {...props}
        />
      </div>
      {error && <span className="form-error">{error}</span>}
      {helperText && !error && <span className="form-helper">{helperText}</span>}
    </div>
  );
}

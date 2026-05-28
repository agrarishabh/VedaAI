'use client';

import React from 'react';

interface TextAreaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  showCharCount?: boolean;
  required?: boolean;
}

export default function TextArea({
  label,
  error,
  showCharCount = false,
  maxLength,
  value,
  required,
  className = '',
  id,
  ...props
}: TextAreaProps) {
  const textareaId = id || label?.toLowerCase().replace(/\s+/g, '-');
  const charCount = typeof value === 'string' ? value.length : 0;

  return (
    <div className="form-group">
      {label && (
        <label htmlFor={textareaId} className={`form-label ${required ? 'form-label-required' : ''}`}>
          {label}
        </label>
      )}
      <textarea
        id={textareaId}
        className={`form-textarea ${error ? 'form-input-error' : ''} ${className}`}
        maxLength={maxLength}
        value={value}
        {...props}
      />
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        {error && <span className="form-error">{error}</span>}
        {showCharCount && maxLength && (
          <span className="form-char-count" style={{ marginLeft: 'auto' }}>
            {charCount}/{maxLength}
          </span>
        )}
      </div>
    </div>
  );
}

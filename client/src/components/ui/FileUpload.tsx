'use client';

import React, { useCallback, useState, useRef } from 'react';
import { Upload, FileText, X } from 'lucide-react';

interface FileUploadProps {
  label?: string;
  error?: string;
  accept?: string;
  onFileSelect: (content: string, filename: string) => void;
  onFileClear?: () => void;
}

export default function FileUpload({
  label,
  error,
  accept = '.pdf,.txt,.doc,.docx',
  onFileSelect,
  onFileClear,
}: FileUploadProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [fileName, setFileName] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFile = useCallback(
    async (file: File) => {
      setFileName(file.name);
      const text = await file.text();
      onFileSelect(text, file.name);
    },
    [onFileSelect]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
      const file = e.dataTransfer.files[0];
      if (file) handleFile(file);
    },
    [handleFile]
  );

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback(() => {
    setIsDragging(false);
  }, []);

  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) handleFile(file);
    },
    [handleFile]
  );

  const handleClear = useCallback(() => {
    setFileName(null);
    if (inputRef.current) inputRef.current.value = '';
    onFileClear?.();
  }, [onFileClear]);

  return (
    <div className="form-group">
      {label && <label className="form-label">{label}</label>}
      {fileName ? (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            padding: '14px 16px',
            background: 'var(--bg-tertiary)',
            border: '1px solid var(--border)',
            borderRadius: 'var(--radius-md)',
          }}
        >
          <FileText size={20} color="var(--accent-primary)" />
          <span style={{ flex: 1, fontSize: '0.875rem', color: 'var(--text-primary)' }}>
            {fileName}
          </span>
          <button
            onClick={handleClear}
            style={{
              display: 'flex',
              padding: '4px',
              borderRadius: '4px',
              color: 'var(--text-muted)',
              transition: 'all 150ms',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--danger)')}
            onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--text-muted)')}
          >
            <X size={16} />
          </button>
        </div>
      ) : (
        <div
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onClick={() => inputRef.current?.click()}
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            padding: '28px 16px',
            border: `2px dashed ${isDragging ? 'var(--accent-primary)' : 'var(--border)'}`,
            borderRadius: 'var(--radius-md)',
            background: isDragging ? 'rgba(124, 58, 237, 0.05)' : 'var(--bg-tertiary)',
            cursor: 'pointer',
            transition: 'all 250ms',
          }}
        >
          <Upload
            size={24}
            color={isDragging ? 'var(--accent-primary)' : 'var(--text-muted)'}
          />
          <span style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
            Drag & drop or <span style={{ color: 'var(--accent-primary)', fontWeight: 600 }}>browse</span>
          </span>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
            PDF, TXT, DOC (optional)
          </span>
        </div>
      )}
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        onChange={handleInputChange}
        style={{ display: 'none' }}
      />
      {error && <span className="form-error">{error}</span>}
    </div>
  );
}

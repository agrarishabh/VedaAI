'use client';

import React from 'react';
import { Check, Loader2, Sparkles, Brain, FileCheck, Wand2 } from 'lucide-react';
import Spinner from '@/components/ui/Spinner';
import type { GenerationStatus } from '@/types';

interface GeneratingOverlayProps {
  status: GenerationStatus;
  progress: number;
  message: string;
  error?: string | null;
}

const steps = [
  { key: 'analyzing', label: 'Analyzing requirements', icon: Brain },
  { key: 'generating', label: 'Generating questions with AI', icon: Sparkles },
  { key: 'structuring', label: 'Structuring question paper', icon: Wand2 },
  { key: 'finalizing', label: 'Finalizing assessment', icon: FileCheck },
];

function getActiveStep(progress: number): number {
  if (progress < 25) return 0;
  if (progress < 50) return 1;
  if (progress < 75) return 2;
  return 3;
}

export default function GeneratingOverlay({ status, progress, message, error }: GeneratingOverlayProps) {
  if (status === 'idle' || status === 'completed') return null;

  const activeStep = getActiveStep(progress);

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(0, 0, 0, 0.75)',
        backdropFilter: 'blur(8px)',
        WebkitBackdropFilter: 'blur(8px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 9999,
        animation: 'fadeIn 300ms ease',
      }}
    >
      <div
        style={{
          background: 'var(--bg-secondary)',
          border: '1px solid var(--glass-border)',
          borderRadius: 'var(--radius-xl)',
          padding: '40px',
          maxWidth: '480px',
          width: '90%',
          textAlign: 'center',
          animation: 'scaleIn 400ms cubic-bezier(0.34, 1.56, 0.64, 1)',
        }}
      >
        {status === 'failed' ? (
          <>
            <div
              style={{
                width: 64,
                height: 64,
                borderRadius: '50%',
                background: 'var(--danger-bg)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 20px',
              }}
            >
              <span style={{ fontSize: '1.5rem' }}>✕</span>
            </div>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '8px' }}>
              Generation Failed
            </h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
              {error || 'An unexpected error occurred. Please try again.'}
            </p>
          </>
        ) : (
          <>
            {/* Animated logo */}
            <div
              style={{
                width: 72,
                height: 72,
                borderRadius: 'var(--radius-lg)',
                background: 'var(--accent-gradient)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 24px',
                animation: 'glow 2s ease-in-out infinite, float 3s ease-in-out infinite',
              }}
            >
              <Sparkles size={32} color="white" />
            </div>

            <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '4px' }}>
              Creating Your Assessment
            </h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.8125rem', marginBottom: '28px' }}>
              {message || 'AI is generating your question paper...'}
            </p>

            {/* Steps */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', textAlign: 'left' }}>
              {steps.map((step, idx) => {
                const Icon = step.icon;
                const isDone = idx < activeStep;
                const isActive = idx === activeStep;

                return (
                  <div
                    key={step.key}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '12px',
                      padding: '10px 14px',
                      borderRadius: 'var(--radius-md)',
                      background: isActive ? 'rgba(124, 58, 237, 0.08)' : 'transparent',
                      border: isActive ? '1px solid rgba(124, 58, 237, 0.2)' : '1px solid transparent',
                      transition: 'all 300ms ease',
                    }}
                  >
                    <div
                      style={{
                        width: 28,
                        height: 28,
                        borderRadius: '50%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0,
                        background: isDone
                          ? 'var(--success)'
                          : isActive
                          ? 'var(--accent-primary)'
                          : 'var(--bg-tertiary)',
                        transition: 'all 300ms ease',
                      }}
                    >
                      {isDone ? (
                        <Check size={14} color="white" />
                      ) : isActive ? (
                        <Spinner size="sm" />
                      ) : (
                        <Icon size={14} color="var(--text-muted)" />
                      )}
                    </div>
                    <span
                      style={{
                        fontSize: '0.8125rem',
                        fontWeight: isActive ? 600 : 400,
                        color: isDone
                          ? 'var(--success)'
                          : isActive
                          ? 'var(--text-primary)'
                          : 'var(--text-muted)',
                      }}
                    >
                      {step.label}
                    </span>
                  </div>
                );
              })}
            </div>

            {/* Progress bar */}
            <div style={{ marginTop: '24px' }}>
              <div
                style={{
                  width: '100%',
                  height: '4px',
                  background: 'var(--bg-tertiary)',
                  borderRadius: 'var(--radius-full)',
                  overflow: 'hidden',
                }}
              >
                <div
                  style={{
                    height: '100%',
                    background: 'var(--accent-gradient)',
                    borderRadius: 'var(--radius-full)',
                    width: `${progress}%`,
                    transition: 'width 600ms cubic-bezier(0.34, 1.56, 0.64, 1)',
                  }}
                />
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

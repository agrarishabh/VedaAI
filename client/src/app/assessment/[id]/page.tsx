'use client';

import React, { useEffect, useRef, useState, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Header from '@/components/layout/Header';
import QuestionPaper from '@/components/assessment/QuestionPaper';
import ActionBar from '@/components/assessment/ActionBar';
import Spinner from '@/components/ui/Spinner';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import { useAssignmentStore } from '@/store/useAssignmentStore';
import { useSocketStore } from '@/store/useSocketStore';
import { regenerateAssignment } from '@/lib/api';
import { AlertCircle, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function AssessmentPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const { currentAssignment, fetchAssignment, error, setGenerationStatus, setGenerationProgress, setGeneratedPaper } =
    useAssignmentStore();
  const { connect, joinAssignment } = useSocketStore();

  const [loading, setLoading] = useState(true);
  const [regenerating, setRegenerating] = useState(false);
  const paperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (id) {
      fetchAssignment(id).finally(() => setLoading(false));
    }
  }, [id, fetchAssignment]);

  const handleRegenerate = useCallback(async () => {
    if (!id) return;
    setRegenerating(true);
    try {
      await regenerateAssignment(id);
      // Listen for WebSocket updates
      connect();
      joinAssignment(id, {
        onProgress: (data) => {
          setGenerationStatus('processing');
          setGenerationProgress(data.progress, data.message);
        },
        onComplete: () => {
          setRegenerating(false);
          fetchAssignment(id);
        },
        onFailed: () => {
          setRegenerating(false);
        },
      });
    } catch (err) {
      setRegenerating(false);
      console.error('Regenerate failed:', err);
    }
  }, [id, connect, joinAssignment, fetchAssignment, setGenerationStatus, setGenerationProgress]);

  if (loading) {
    return (
      <>
        <Header title="Assessment" subtitle="Loading..." onMenuToggle={() => {}} />
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '100px 0' }}>
          <Spinner size="lg" />
        </div>
      </>
    );
  }

  if (error || !currentAssignment) {
    return (
      <>
        <Header title="Assessment" subtitle="Error" onMenuToggle={() => {}} />
        <div style={{ padding: '60px 32px', display: 'flex', justifyContent: 'center' }}>
          <Card padding="lg" style={{ textAlign: 'center', maxWidth: '420px' }}>
            <div
              style={{
                width: 56,
                height: 56,
                borderRadius: '50%',
                background: 'var(--danger-bg)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 16px',
              }}
            >
              <AlertCircle size={24} color="var(--danger)" />
            </div>
            <h3 style={{ fontSize: '1.125rem', fontWeight: 700, marginBottom: '8px' }}>
              Assessment Not Found
            </h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', marginBottom: '20px' }}>
              {error || 'The requested assessment could not be loaded.'}
            </p>
            <Link href="/">
              <Button variant="secondary" icon={<ArrowLeft size={16} />}>
                Back to Dashboard
              </Button>
            </Link>
          </Card>
        </div>
      </>
    );
  }

  if (currentAssignment.status === 'processing' || currentAssignment.status === 'pending') {
    return (
      <>
        <Header title={currentAssignment.title} subtitle="Generating..." onMenuToggle={() => {}} />
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '80px 32px', gap: '16px' }}>
          <Spinner size="lg" />
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9375rem' }}>
            Your assessment is being generated. Please wait...
          </p>
        </div>
      </>
    );
  }

  if (currentAssignment.status === 'failed') {
    return (
      <>
        <Header title={currentAssignment.title} subtitle="Failed" onMenuToggle={() => {}} />
        <div style={{ padding: '60px 32px', display: 'flex', justifyContent: 'center' }}>
          <Card padding="lg" style={{ textAlign: 'center', maxWidth: '420px' }}>
            <div
              style={{
                width: 56,
                height: 56,
                borderRadius: '50%',
                background: 'var(--danger-bg)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 16px',
              }}
            >
              <AlertCircle size={24} color="var(--danger)" />
            </div>
            <h3 style={{ fontSize: '1.125rem', fontWeight: 700, marginBottom: '8px' }}>
              Generation Failed
            </h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', marginBottom: '20px' }}>
              Something went wrong while generating the question paper.
            </p>
            <Button variant="primary" onClick={handleRegenerate} loading={regenerating}>
              Try Again
            </Button>
          </Card>
        </div>
      </>
    );
  }

  return (
    <>
      <Header
        title={currentAssignment.title}
        subtitle={`${currentAssignment.subject} — Class ${currentAssignment.grade}`}
        onMenuToggle={() => {}}
        actions={
          <Link href="/">
            <Button variant="ghost" size="sm" icon={<ArrowLeft size={15} />}>
              Back
            </Button>
          </Link>
        }
      />

      <div style={{ padding: '28px 32px 100px', maxWidth: '900px', margin: '0 auto', animation: 'fadeInUp 400ms ease' }}>
        <QuestionPaper ref={paperRef} assignment={currentAssignment} />
      </div>

      <ActionBar
        onRegenerate={handleRegenerate}
        regenerating={regenerating}
        paperRef={paperRef}
      />
    </>
  );
}

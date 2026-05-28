'use client';

import React from 'react';
import Header from '@/components/layout/Header';
import AssignmentForm from '@/components/create/AssignmentForm';
import GeneratingOverlay from '@/components/create/GeneratingOverlay';
import { useAssignmentStore } from '@/store/useAssignmentStore';

export default function CreatePage() {
  const { generationStatus, generationProgress, generationMessage, error } =
    useAssignmentStore();

  return (
    <>
      <Header
        title="Create Assessment"
        subtitle="Configure your question paper and let AI generate it."
        onMenuToggle={() => {}}
      />

      <div style={{ padding: '28px 32px', animation: 'fadeInUp 400ms ease' }}>
        <AssignmentForm />
      </div>

      <GeneratingOverlay
        status={generationStatus}
        progress={generationProgress}
        message={generationMessage}
        error={error}
      />
    </>
  );
}

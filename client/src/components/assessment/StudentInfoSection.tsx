'use client';

import React from 'react';

export default function StudentInfoSection() {
  return (
    <div style={{ marginBottom: '24px', padding: '16px 0', borderBottom: '1px solid #ddd' }}>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '20px' }}>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px' }}>
          <span style={{ fontWeight: 600, fontSize: '0.875rem', whiteSpace: 'nowrap' }}>Name:</span>
          <div style={{ flex: 1, borderBottom: '1.5px dotted #999', minHeight: '20px' }} />
        </div>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px' }}>
          <span style={{ fontWeight: 600, fontSize: '0.875rem', whiteSpace: 'nowrap' }}>Roll No:</span>
          <div style={{ flex: 1, borderBottom: '1.5px dotted #999', minHeight: '20px' }} />
        </div>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px' }}>
          <span style={{ fontWeight: 600, fontSize: '0.875rem', whiteSpace: 'nowrap' }}>Section:</span>
          <div style={{ flex: 1, borderBottom: '1.5px dotted #999', minHeight: '20px' }} />
        </div>
      </div>
    </div>
  );
}

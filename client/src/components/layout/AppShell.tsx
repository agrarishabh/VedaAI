'use client';

import React, { useState } from 'react';
import Sidebar from './Sidebar';

interface AppShellProps {
  children: React.ReactNode;
}

export default function AppShell({ children }: AppShellProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div style={{ display: 'flex', minHeight: '100vh', position: 'relative', zIndex: 1 }}>
      <Sidebar isOpen={sidebarOpen} onToggle={() => setSidebarOpen(!sidebarOpen)} />
      <main
        style={{
          flex: 1,
          marginLeft: 'var(--sidebar-width)',
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          transition: 'margin-left var(--transition-base)',
        }}
        className="app-main"
      >
        {children}
      </main>

      <style jsx>{`
        @media (max-width: 768px) {
          .app-main {
            margin-left: 0 !important;
          }
        }
      `}</style>
    </div>
  );
}

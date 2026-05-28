'use client';

import React from 'react';
import { Menu } from 'lucide-react';

interface HeaderProps {
  title: string;
  subtitle?: string;
  onMenuToggle: () => void;
  actions?: React.ReactNode;
}

export default function Header({ title, subtitle, onMenuToggle, actions }: HeaderProps) {
  return (
    <header
      style={{
        height: 'var(--header-height)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 32px',
        borderBottom: '1px solid var(--border)',
        background: 'rgba(15, 15, 19, 0.8)',
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
        position: 'sticky',
        top: 0,
        zIndex: 100,
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
        <button
          onClick={onMenuToggle}
          className="mobile-menu-btn"
          style={{
            display: 'none',
            padding: '8px',
            borderRadius: 'var(--radius-sm)',
            color: 'var(--text-secondary)',
            transition: 'all var(--transition-fast)',
          }}
        >
          <Menu size={20} />
        </button>
        <div>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 700, letterSpacing: '-0.01em' }}>
            {title}
          </h2>
          {subtitle && (
            <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', marginTop: '2px' }}>
              {subtitle}
            </p>
          )}
        </div>
      </div>
      {actions && <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>{actions}</div>}

      <style jsx>{`
        @media (max-width: 768px) {
          .mobile-menu-btn {
            display: flex !important;
          }
        }
      `}</style>
    </header>
  );
}

'use client';

import React, { useEffect } from 'react';
import Link from 'next/link';
import { Plus, FileText, Clock, CheckCircle2, AlertCircle, ArrowRight } from 'lucide-react';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import Spinner from '@/components/ui/Spinner';
import Header from '@/components/layout/Header';
import { useAssignmentStore } from '@/store/useAssignmentStore';
import { format } from 'date-fns';

export default function DashboardPage() {
  const { assignments, fetchAssignments } = useAssignmentStore();
  const [loading, setLoading] = React.useState(true);

  useEffect(() => {
    fetchAssignments().finally(() => setLoading(false));
  }, [fetchAssignments]);

  const stats = {
    total: assignments.length,
    processing: assignments.filter((a) => a.status === 'processing' || a.status === 'pending').length,
    completed: assignments.filter((a) => a.status === 'completed').length,
    failed: assignments.filter((a) => a.status === 'failed').length,
  };

  const statCards = [
    { label: 'Total Assessments', value: stats.total, icon: FileText, color: 'var(--accent-primary)', bg: 'rgba(124,58,237,0.1)' },
    { label: 'In Progress', value: stats.processing, icon: Clock, color: 'var(--warning)', bg: 'rgba(245,158,11,0.1)' },
    { label: 'Completed', value: stats.completed, icon: CheckCircle2, color: 'var(--success)', bg: 'rgba(16,185,129,0.1)' },
    { label: 'Failed', value: stats.failed, icon: AlertCircle, color: 'var(--danger)', bg: 'rgba(239,68,68,0.1)' },
  ];

  return (
    <>
      <Header title="Dashboard" subtitle="Welcome back! Manage your AI assessments." onMenuToggle={() => {}} />

      <div style={{ padding: '28px 32px', maxWidth: '1200px' }}>
        {/* Stats grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginBottom: '32px' }} className="stats-grid">
          {statCards.map((stat, idx) => {
            const Icon = stat.icon;
            return (
              <Card key={idx} padding="md" style={{ animation: `fadeInUp 400ms ease ${idx * 80}ms both` }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                  <div
                    style={{
                      width: 44,
                      height: 44,
                      borderRadius: 'var(--radius-md)',
                      background: stat.bg,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                    }}
                  >
                    <Icon size={20} color={stat.color} />
                  </div>
                  <div>
                    <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 500 }}>{stat.label}</p>
                    <p style={{ fontSize: '1.5rem', fontWeight: 800, letterSpacing: '-0.02em' }}>{stat.value}</p>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>

        {/* CTA + Recent */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <h3 style={{ fontSize: '1.125rem', fontWeight: 700 }}>Recent Assessments</h3>
          <Link href="/create">
            <Button variant="primary" size="md" icon={<Plus size={16} />}>
              Create New
            </Button>
          </Link>
        </div>

        {/* Assessments list */}
        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: '60px 0' }}>
            <Spinner size="lg" />
          </div>
        ) : assignments.length === 0 ? (
          <Card padding="lg" style={{ textAlign: 'center' }}>
            <div style={{ animation: 'fadeInUp 400ms ease' }}>
              <div
                style={{
                  width: 64,
                  height: 64,
                  borderRadius: 'var(--radius-lg)',
                  background: 'rgba(124,58,237,0.1)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 16px',
                }}
              >
                <FileText size={28} color="var(--accent-primary)" />
              </div>
              <h3 style={{ fontSize: '1.125rem', fontWeight: 700, marginBottom: '8px' }}>No assessments yet</h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', marginBottom: '20px' }}>
                Create your first AI-powered question paper in minutes.
              </p>
              <Link href="/create">
                <Button variant="primary" icon={<Plus size={16} />}>
                  Create Assessment
                </Button>
              </Link>
            </div>
          </Card>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {assignments.map((a, idx) => (
              <Link key={a._id} href={a.status === 'completed' ? `/assessment/${a._id}` : '#'}>
                <Card
                  hoverable={a.status === 'completed'}
                  padding="md"
                  style={{ animation: `fadeInUp 400ms ease ${idx * 60}ms both` }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                      <div
                        style={{
                          width: 40,
                          height: 40,
                          borderRadius: 'var(--radius-md)',
                          background: 'rgba(124,58,237,0.1)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          flexShrink: 0,
                        }}
                      >
                        <FileText size={18} color="var(--accent-primary)" />
                      </div>
                      <div>
                        <h4 style={{ fontSize: '0.9375rem', fontWeight: 600 }}>{a.title}</h4>
                        <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>
                          {a.subject} — Class {a.grade} • {a.totalMarks} marks • {a.numberOfQuestions} questions
                        </p>
                      </div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <Badge variant={a.status} />
                      {a.status === 'completed' && <ArrowRight size={16} color="var(--text-muted)" />}
                    </div>
                  </div>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </div>

      <style jsx>{`
        @media (max-width: 768px) {
          .stats-grid {
            grid-template-columns: repeat(2, 1fr) !important;
          }
        }
        @media (max-width: 480px) {
          .stats-grid {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </>
  );
}

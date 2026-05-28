'use client';

import React, { useCallback, useState } from 'react';
import { RefreshCw, Download, Link2, Check } from 'lucide-react';
import Button from '@/components/ui/Button';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

interface ActionBarProps {
  onRegenerate: () => void;
  regenerating?: boolean;
  paperRef: React.RefObject<HTMLDivElement | null>;
}

export default function ActionBar({ onRegenerate, regenerating = false, paperRef }: ActionBarProps) {
  const [downloading, setDownloading] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleDownloadPDF = useCallback(async () => {
    const el = paperRef.current;
    if (!el) return;

    setDownloading(true);
    try {
      const canvas = await html2canvas(el, {
        scale: 2,
        useCORS: true,
        backgroundColor: '#ffffff',
        logging: false,
      });

      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      const imgWidth = pageWidth - 20; // 10mm margins
      const imgHeight = (canvas.height * imgWidth) / canvas.width;

      let heightLeft = imgHeight;
      let position = 10;

      pdf.addImage(imgData, 'PNG', 10, position, imgWidth, imgHeight);
      heightLeft -= pageHeight - 20;

      while (heightLeft > 0) {
        position = heightLeft - imgHeight + 10;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 10, position, imgWidth, imgHeight);
        heightLeft -= pageHeight - 20;
      }

      pdf.save('assessment.pdf');
    } catch (err) {
      console.error('PDF generation failed:', err);
    } finally {
      setDownloading(false);
    }
  }, [paperRef]);

  const handleCopyLink = useCallback(() => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, []);

  return (
    <div
      style={{
        position: 'fixed',
        bottom: '24px',
        left: '50%',
        transform: 'translateX(-50%)',
        display: 'flex',
        alignItems: 'center',
        gap: '10px',
        padding: '12px 20px',
        background: 'rgba(26, 26, 36, 0.85)',
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        borderRadius: '16px',
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.4), 0 0 0 1px rgba(255,255,255,0.05)',
        zIndex: 1000,
        animation: 'slideUp 500ms cubic-bezier(0.34, 1.56, 0.64, 1)',
      }}
    >
      <Button
        variant="secondary"
        size="sm"
        onClick={onRegenerate}
        loading={regenerating}
        icon={<RefreshCw size={15} />}
      >
        Regenerate
      </Button>

      <Button
        variant="primary"
        size="sm"
        onClick={handleDownloadPDF}
        loading={downloading}
        icon={<Download size={15} />}
      >
        Download PDF
      </Button>

      <Button
        variant="ghost"
        size="sm"
        onClick={handleCopyLink}
        icon={copied ? <Check size={15} color="var(--success)" /> : <Link2 size={15} />}
      >
        {copied ? 'Copied!' : 'Share'}
      </Button>
    </div>
  );
}

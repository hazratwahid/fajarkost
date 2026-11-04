import React, { useState } from 'react';
import { PRISMA_SCHEMA, POSTGRES_DDL } from '../lib/databaseSchema';
import { Database, Copy, Check, Download, Layers } from 'lucide-react';

interface DatabaseSchemaModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const DatabaseSchemaModal: React.FC<DatabaseSchemaModalProps> = ({
  isOpen,
  onClose,
}) => {
  const [activeSchemaTab, setActiveSchemaTab] = useState<'prisma' | 'sql'>('prisma');
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const currentContent = activeSchemaTab === 'prisma' ? PRISMA_SCHEMA : POSTGRES_DDL;

  const handleCopy = () => {
    navigator.clipboard.writeText(currentContent);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const filename = activeSchemaTab === 'prisma' ? 'schema.prisma' : 'schema.sql';
    const blob = new Blob([currentContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl max-w-4xl w-full p-6 space-y-4 max-h-[92vh] flex flex-col shadow-2xl">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 rounded-lg">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white">
                Skema Database Produksi & Model Relasi (Prisma & PostgreSQL)
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Relasi 1:N & 1:1 antara Kamar, Penyewa, Tagihan, Meteran KWh, dan Tiket Perbaikan
              </p>
            </div>
          </div>

          <button 
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 text-sm font-semibold"
          >
            ✕
          </button>
        </div>

        {/* Tab Controls & Action Buttons */}
        <div className="flex items-center justify-between gap-3 shrink-0 text-xs">
          <div className="flex items-center gap-1 p-1 bg-slate-100 dark:bg-slate-800 rounded-lg">
            <button
              onClick={() => setActiveSchemaTab('prisma')}
              className={`px-3 py-1.5 font-medium rounded-md transition-colors ${
                activeSchemaTab === 'prisma'
                  ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs font-semibold'
                  : 'text-slate-600 dark:text-slate-400'
              }`}
            >
              Prisma ORM Schema (.prisma)
            </button>
            <button
              onClick={() => setActiveSchemaTab('sql')}
              className={`px-3 py-1.5 font-medium rounded-md transition-colors ${
                activeSchemaTab === 'sql'
                  ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs font-semibold'
                  : 'text-slate-600 dark:text-slate-400'
              }`}
            >
              PostgreSQL DDL (.sql)
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleCopy}
              className="px-3 py-1.5 font-medium text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 rounded-md flex items-center gap-1.5 transition-colors"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
              {copied ? 'Tersalin' : 'Salin Kode'}
            </button>
            <button
              onClick={handleDownload}
              className="px-3 py-1.5 font-medium text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/60 hover:bg-emerald-100 rounded-md flex items-center gap-1.5 transition-colors"
            >
              <Download className="w-3.5 h-3.5" />
              Unduh File
            </button>
          </div>
        </div>

        {/* Code Preview Box */}
        <div className="flex-1 overflow-y-auto rounded-lg bg-slate-950 border border-slate-800 p-4 font-mono text-xs text-slate-200 leading-relaxed scrollbar-thin">
          <pre className="whitespace-pre-wrap">{currentContent}</pre>
        </div>

        {/* Footer info */}
        <div className="pt-2 text-xs text-slate-500 dark:text-slate-400 flex items-center justify-between shrink-0">
          <span>Kompatibel dengan PostgreSQL 15+, Supabase, dan Cloud SQL.</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-slate-900 dark:bg-slate-800 text-white font-medium rounded-md"
          >
            Tutup
          </button>
        </div>

      </div>
    </div>
  );
};

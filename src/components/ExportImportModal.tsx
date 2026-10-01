import React, { useState, useRef } from 'react';
import {
  X,
  Download,
  Upload,
  FileSpreadsheet,
  FileCode,
  AlertTriangle,
  CheckCircle2,
  RefreshCw,
  Printer,
} from 'lucide-react';
import { db } from '../utils/db';
import { syncService } from '../utils/syncService';
import { Project } from '../types';

interface ExportImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  activeProject: Project;
  onDataRestored: () => void;
}

export const ExportImportModal: React.FC<ExportImportModalProps> = ({
  isOpen,
  onClose,
  activeProject,
  onDataRestored,
}) => {
  const [importMode, setImportMode] = useState<'merge' | 'replace'>('merge');
  const [importStatus, setImportStatus] = useState<{
    loading: boolean;
    error: string | null;
    success: string | null;
  }>({ loading: false, error: null, success: null });

  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  // 1. Export CSV for current project
  const handleExportCSV = async () => {
    try {
      const csv = await db.exportProjectToCSV(activeProject.id);
      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      const sanitizedName = activeProject.name.replace(/[^a-z0-9_-]/gi, '_').toLowerCase();
      link.download = `constructpro_${sanitizedName}_${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (err: any) {
      alert('Failed to generate CSV: ' + err.message);
    }
  };

  // 2. Export Full Database JSON
  const handleExportJSON = async () => {
    try {
      const json = await db.exportFullDatabase();
      const blob = new Blob([json], { type: 'application/json;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `constructpro_full_backup_${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (err: any) {
      alert('Failed to export JSON backup: ' + err.message);
    }
  };

  // 3. Import JSON Backup
  const handleFileSelected = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setImportStatus({ loading: true, error: null, success: null });
    const reader = new FileReader();

    reader.onload = async () => {
      try {
        const text = reader.result as string;
        const parsed = JSON.parse(text);
        const result = await db.importFullDatabase(text, importMode);
        
        // Broadcast to all connected crew devices
        if (parsed.projects && parsed.tasks) {
          syncService.restoreFullDatabase(parsed.projects, parsed.tasks, parsed.teamMembers || [], importMode);
        }

        setImportStatus({
          loading: false,
          error: null,
          success: `Successfully imported ${result.projectsCount} project(s) and ${result.tasksCount} task(s)!`,
        });
        onDataRestored();
      } catch (err: any) {
        setImportStatus({
          loading: false,
          error: err.message || 'Invalid backup file',
          success: null,
        });
      }
    };

    reader.onerror = () => {
      setImportStatus({
        loading: false,
        error: 'Failed to read backup file.',
        success: null,
      });
    };

    reader.readAsText(file);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in duration-100">
      <div className="w-full max-w-lg rounded-2xl bg-white border border-slate-200 shadow-2xl p-5 sm:p-6 text-slate-800">
        <div className="flex items-center justify-between pb-3 border-b border-slate-200">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-amber-100 text-amber-700">
              <Download className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">Data Export & Backup</h3>
              <p className="text-xs text-slate-500">Migrate tasks between devices or export for spreadsheets</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="mt-5 space-y-5">
          {/* Section 1: Export Options */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
              Export Options
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {/* CSV Export */}
              <button
                type="button"
                onClick={handleExportCSV}
                className="flex items-start gap-3 p-3 rounded-xl bg-slate-50 border border-slate-200 hover:border-emerald-500 hover:bg-emerald-50/40 transition text-left group"
              >
                <div className="p-2 rounded-lg bg-emerald-100 text-emerald-700 group-hover:scale-105 transition">
                  <FileSpreadsheet className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-xs font-bold text-slate-900 group-hover:text-emerald-800">
                    Export Project CSV
                  </div>
                  <div className="text-[11px] text-slate-500 mt-0.5 line-clamp-1">
                    "{activeProject.name}" formatted for Excel
                  </div>
                </div>
              </button>

              {/* JSON Full Backup */}
              <button
                type="button"
                onClick={handleExportJSON}
                className="flex items-start gap-3 p-3 rounded-xl bg-slate-50 border border-slate-200 hover:border-amber-500 hover:bg-amber-50/40 transition text-left group"
              >
                <div className="p-2 rounded-lg bg-amber-100 text-amber-700 group-hover:scale-105 transition">
                  <FileCode className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-xs font-bold text-slate-900 group-hover:text-amber-800">
                    Full JSON Backup
                  </div>
                  <div className="text-[11px] text-slate-500 mt-0.5">
                    All sites, tasks, attachments & team
                  </div>
                </div>
              </button>
            </div>

            <div className="mt-2.5 flex justify-end">
              <button
                type="button"
                onClick={handlePrint}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition"
              >
                <Printer className="w-3.5 h-3.5" />
                Print / Save PDF Report
              </button>
            </div>
          </div>

          {/* Section 2: Import Backup */}
          <div className="pt-4 border-t border-slate-200">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
              Import & Restore Data
            </h4>

            {/* Mode Selector */}
            <div className="flex items-center gap-3 mb-3 text-xs">
              <label className="flex items-center gap-1.5 cursor-pointer text-slate-700">
                <input
                  type="radio"
                  name="importMode"
                  checked={importMode === 'merge'}
                  onChange={() => setImportMode('merge')}
                  className="accent-amber-500"
                />
                <span>Merge with existing</span>
              </label>
              <label className="flex items-center gap-1.5 cursor-pointer text-slate-700">
                <input
                  type="radio"
                  name="importMode"
                  checked={importMode === 'replace'}
                  onChange={() => setImportMode('replace')}
                  className="accent-amber-500"
                />
                <span className="text-amber-700 font-medium">Replace all local data</span>
              </label>
            </div>

            {/* Hidden Input & Trigger */}
            <input
              type="file"
              ref={fileInputRef}
              accept=".json"
              onChange={handleFileSelected}
              className="hidden"
            />

            <button
              type="button"
              disabled={importStatus.loading}
              onClick={() => fileInputRef.current?.click()}
              className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl border-2 border-dashed border-slate-300 hover:border-amber-500 bg-slate-50 hover:bg-amber-50/20 text-xs font-semibold text-slate-700 transition"
            >
              {importStatus.loading ? (
                <RefreshCw className="w-4 h-4 animate-spin text-amber-600" />
              ) : (
                <Upload className="w-4 h-4 text-amber-600" />
              )}
              <span>Select JSON Backup File to Restore</span>
            </button>

            {/* Feedback Messages */}
            {importStatus.success && (
              <div className="mt-3 p-2.5 rounded-lg bg-emerald-50 border border-emerald-300 text-emerald-800 text-xs flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
                <span>{importStatus.success}</span>
              </div>
            )}

            {importStatus.error && (
              <div className="mt-3 p-2.5 rounded-lg bg-red-50 border border-red-300 text-red-800 text-xs flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 shrink-0 text-red-600" />
                <span>{importStatus.error}</span>
              </div>
            )}
          </div>
        </div>

        <div className="mt-6 flex justify-end pt-3 border-t border-slate-200">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-xs font-semibold text-slate-700 transition"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

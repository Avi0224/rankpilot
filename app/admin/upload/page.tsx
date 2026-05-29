'use client';

import { useState, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Upload, FileText, CheckCircle2, AlertTriangle, X,
  ChevronDown, FileSpreadsheet, Loader2, Eye, Trash2,
  Play, Pause, History, Download
} from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { useSearchParams } from 'next/navigation';
import type { UploadProgress, ImportPreview, CounsellingSystem } from '@/lib/ingestion/types';
import {
  parseCSV, generatePreview, calculateValidationScore, detectColumnMapping
} from '@/lib/ingestion/parsers';

const COUNSELLING_SYSTEMS = [
  { id: 'josaa', name: 'JoSAA', fullName: 'Joint Seat Allocation Authority', type: 'National', years: [2024, 2023, 2022, 2021] },
  { id: 'csab', name: 'CSAB', fullName: 'Central Seat Allocation Board', type: 'National', years: [2024, 2023] },
  { id: 'jac-delhi', name: 'JAC Delhi', fullName: 'Joint Admission Counselling Delhi', type: 'National', years: [2024, 2023] },
  { id: 'comedk', name: 'COMEDK', fullName: 'COMEDK', type: 'State', years: [2024, 2023] },
  { id: 'mht-cet', name: 'MHT CET', fullName: 'Maharashtra CET', type: 'State', years: [2024] },
  { id: 'uptac', name: 'UPTAC', fullName: 'Uttar Pradesh TAC', type: 'State', years: [2024] },
  { id: 'wbjee', name: 'WBJEE', fullName: 'West Bengal JEE', type: 'State', years: [2024] },
  { id: 'kcet', name: 'KCET', fullName: 'Karnataka CET', type: 'State', years: [2024] },
];

const ACCEPTED_TYPES = ['.csv', '.xlsx', '.xls'];

export default function UploadDatasetPage() {
  const searchParams = useSearchParams();
  const initialSystem = searchParams.get('system') || 'josaa';

  const [system, setSystem] = useState<CounsellingSystem>(initialSystem as CounsellingSystem);
  const [year, setYear] = useState(2024);
  const [round, setRound] = useState(6);
  const [files, setFiles] = useState<File[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [progress, setProgress] = useState<UploadProgress>({ stage: 'idle', progress: 0, message: '' });
  const [preview, setPreview] = useState<ImportPreview | null>(null);
  const [parsedData, setParsedData] = useState<Record<string, unknown>[]>([]);
  const [currentPage, setCurrentPage] = useState(0);

  const selectedSystemInfo = COUNSELLING_SYSTEMS.find((s) => s.id === system);

  // Handle file selection
  const handleFiles = useCallback((newFiles: FileList | null) => {
    if (!newFiles) return;

    const validFiles = Array.from(newFiles).filter((file) => {
      const ext = file.name.split('.').pop()?.toLowerCase();
      return ACCEPTED_TYPES.some((t) => t.replace('.', '') === ext);
    });

    if (validFiles.length > 0) {
      setFiles(validFiles);
      setPreview(null);
      setProgress({ stage: 'idle', progress: 0, message: '' });
    }
  }, []);

  // Drag handlers
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    handleFiles(e.dataTransfer.files);
  };

  // Parse file
  const parseFile = async () => {
    if (files.length === 0) return;

    const file = files[0];
    setProgress({ stage: 'parsing', progress: 20, message: 'Reading file...' });

    try {
      const content = await file.text();
      setProgress({ stage: 'parsing', progress: 40, message: 'Parsing CSV data...' });

      const { headers, rows } = parseCSV(content);
      setParsedData(rows);

      setProgress({ stage: 'validating', progress: 60, message: 'Validating data...' });

      await new Promise((r) => setTimeout(r, 500)); // Simulate processing

      const prev = generatePreview(rows, system, year, round);
      setPreview(prev);

      setProgress({ stage: 'previewing', progress: 100, message: 'Preview ready' });
    } catch (err) {
      setProgress({ stage: 'error', progress: 0, message: 'Failed to parse file', details: String(err) });
    }
  };

  // Start import
  const handleImport = async () => {
    if (!preview) return;

    setProgress({ stage: 'importing', progress: 0, message: 'Starting import...' });

    for (let i = 0; i <= 100; i += 10) {
      await new Promise((r) => setTimeout(r, 200));
      setProgress({ stage: 'importing', progress: i, message: `Importing row ${i * preview.totalRows / 100}/${preview.totalRows}` });
    }

    setProgress({ stage: 'completed', progress: 100, message: 'Import completed successfully!' });
  };

  // Reset
  const handleReset = () => {
    setFiles([]);
    setPreview(null);
    setParsedData([]);
    setProgress({ stage: 'idle', progress: 0, message: '' });
  };

  // Auto-parse when file changes
  useEffect(() => {
    if (files.length > 0 && progress.stage === 'idle') {
      parseFile();
    }
  }, [files]);

  const score = preview ? calculateValidationScore(preview) : 0;
  const previewRows = preview?.sampleData?.slice(currentPage * 10, (currentPage + 1) * 10) || [];

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-white">Upload Dataset</h1>
        <p className="text-slate-500 text-sm mt-1">Import counselling cutoff data from CSV or Excel files.</p>
      </div>

      {/* Dataset Configuration */}
      <div className="glass-card rounded-2xl p-6 border border-blue-500/10">
        <h3 className="text-white font-semibold text-sm mb-4">Dataset Configuration</h3>
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
          <div>
            <label className="text-xs text-slate-500 font-medium mb-1.5 block uppercase tracking-wider">Counselling System</label>
            <div className="relative">
              <select
                value={system}
                onChange={(e) => setSystem(e.target.value as CounsellingSystem)}
                className="w-full bg-[#0B1120] border border-blue-900/30 rounded-xl px-3 py-2.5 text-sm text-white appearance-none focus:outline-none focus:border-blue-500/50"
              >
                {COUNSELLING_SYSTEMS.map((s) => (
                  <option key={s.id} value={s.id}>{s.name} — {s.fullName}</option>
                ))}
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 pointer-events-none" />
            </div>
          </div>

          <div>
            <label className="text-xs text-slate-500 font-medium mb-1.5 block uppercase tracking-wider">Year</label>
            <div className="relative">
              <select
                value={year}
                onChange={(e) => setYear(Number(e.target.value))}
                className="w-full bg-[#0B1120] border border-blue-900/30 rounded-xl px-3 py-2.5 text-sm text-white appearance-none focus:outline-none focus:border-blue-500/50"
              >
                {(selectedSystemInfo?.years || [2024]).map((y) => (
                  <option key={y} value={y}>{y}</option>
                ))}
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 pointer-events-none" />
            </div>
          </div>

          <div>
            <label className="text-xs text-slate-500 font-medium mb-1.5 block uppercase tracking-wider">Round</label>
            <div className="relative">
              <select
                value={round}
                onChange={(e) => setRound(Number(e.target.value))}
                className="w-full bg-[#0B1120] border border-blue-900/30 rounded-xl px-3 py-2.5 text-sm text-white appearance-none focus:outline-none focus:border-blue-500/50"
              >
                {Array.from({ length: 10 }, (_, i) => i + 1).map((r) => (
                  <option key={r} value={r}>Round {r}</option>
                ))}
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 pointer-events-none" />
            </div>
          </div>

          <div>
            <label className="text-xs text-slate-500 font-medium mb-1.5 block uppercase tracking-wider">File Type</label>
            <div className="flex items-center h-10 px-3 bg-[#0B1120] border border-blue-900/30 rounded-xl text-slate-400 text-sm">
              CSV / XLSX
            </div>
          </div>
        </div>
      </div>

      {/* Upload Area */}
      <div className="glass-card rounded-2xl border border-blue-500/10 overflow-hidden">
        {progress.stage === 'idle' || progress.stage === 'parsing' || progress.stage === 'validating' ? (
          <div className="p-8">
            {/* Drop zone */}
            <div
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              className={`relative border-2 border-dashed rounded-2xl p-12 text-center transition-all ${
                isDragging
                  ? 'border-blue-500 bg-blue-500/5'
                  : 'border-blue-500/20 hover:border-blue-500/40'
              }`}
            >
              <div className="w-20 h-20 rounded-2xl bg-blue-600/10 border border-blue-500/20 flex items-center justify-center mx-auto mb-6">
                <Upload className={`w-10 h-10 ${isDragging ? 'text-blue-400' : 'text-blue-400/40'} transition-colors`} />
              </div>

              {files.length === 0 ? (
                <>
                  <h3 className="text-white font-semibold mb-2">Drop your dataset file here</h3>
                  <p className="text-slate-500 text-sm mb-4">or click to browse your computer</p>
                  <input
                    type="file"
                    accept={ACCEPTED_TYPES.join(',')}
                    onChange={(e) => handleFiles(e.target.files)}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  />
                  <div className="flex items-center justify-center gap-2 text-xs text-slate-600">
                    <FileSpreadsheet className="w-4 h-4" />
                    Supports CSV, XLSX, XLS — Max 50MB
                  </div>
                </>
              ) : (
                <div className="flex items-center justify-center gap-3">
                  <div className="flex items-center gap-2 px-4 py-2 bg-[#0B1120] rounded-xl">
                    <FileText className="w-4 h-4 text-blue-400" />
                    <span className="text-white text-sm font-medium">{files[0].name}</span>
                    <button onClick={handleReset} className="text-slate-500 hover:text-red-400 ml-2">
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Progress indicator */}
            {progress.stage !== 'idle' && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-6 p-4 bg-[#0B1120] rounded-xl border border-blue-900/30"
              >
                <div className="flex items-center gap-3">
                  <Loader2 className="w-5 h-5 text-blue-400 animate-spin" />
                  <div>
                    <div className="text-white text-sm">{progress.message}</div>
                    <div className="text-slate-500 text-xs">{progress.progress}% complete</div>
                  </div>
                </div>
                <div className="mt-3 h-1.5 bg-blue-900/30 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${progress.progress}%` }}
                    className="h-full bg-blue-500 rounded-full"
                  />
                </div>
              </motion.div>
            )}
          </div>
        ) : (
          <div className="p-6">
            {/* Preview Header */}
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-white font-semibold text-lg">Import Preview</h3>
                <p className="text-slate-500 text-sm mt-1">
                  {preview?.totalRows.toLocaleString()} rows parsed from {files[0]?.name}
                </p>
              </div>

              {/* Validation Score */}
              <div className="flex items-center gap-4">
                <div className="text-right">
                  <div className="text-slate-500 text-xs">Validation Score</div>
                  <div className={`text-2xl font-bold ${score >= 90 ? 'text-emerald-400' : score >= 70 ? 'text-amber-400' : 'text-red-400'}`}>
                    {score.toFixed(0)}%
                  </div>
                </div>
                <div className="w-16 h-16 rounded-xl flex items-center justify-center relative">
                  <svg viewBox="0 0 36 36" className="w-14 h-14 -rotate-90">
                    <circle cx="18" cy="18" r="15.5" fill="none" stroke="#1e293b" strokeWidth="3" />
                    <circle
                      cx="18" cy="18" r="15.5"
                      fill="none"
                      stroke={score >= 90 ? '#10B981' : score >= 70 ? '#F59E0B' : '#EF4444'}
                      strokeWidth="3"
                      strokeDasharray={`${score} 100`}
                      strokeLinecap="round"
                    />
                  </svg>
                </div>
              </div>
            </div>

            {/* Summary Stats */}
            <div className="grid grid-cols-5 gap-3 mb-6">
              {[
                { label: 'Total Rows', value: preview?.totalRows || 0, color: 'text-white' },
                { label: 'Valid', value: preview?.validRows || 0, color: 'text-emerald-400' },
                { label: 'Invalid', value: preview?.invalidRows || 0, color: 'text-red-400' },
                { label: 'Duplicates', value: preview?.duplicates || 0, color: 'text-amber-400' },
                { label: 'Warnings', value: preview?.warnings || 0, color: 'text-yellow-400' },
              ].map((stat) => (
                <div key={stat.label} className="bg-[#080f1e] rounded-xl p-3 border border-blue-900/20 text-center">
                  <div className={`text-xl font-bold ${stat.color}`}>{Number(stat.value).toLocaleString()}</div>
                  <div className="text-slate-500 text-[10px] uppercase tracking-wider">{stat.label}</div>
                </div>
              ))}
            </div>

            {/* Column Mapping */}
            <div className="mb-6">
              <div className="text-slate-400 text-xs font-medium mb-2 uppercase tracking-wider">Detected Column Mapping</div>
              <div className="flex flex-wrap gap-2">
                {Object.entries(preview?.columnMapping || {}).map(([target, source]) => (
                  <div key={target} className="flex items-center gap-2 px-3 py-1.5 bg-[#0B1120] rounded-lg border border-blue-900/30">
                    <span className="text-slate-500 text-xs">{source}</span>
                    <span className="text-slate-600">→</span>
                    <span className="text-blue-400 text-xs font-medium">{target}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Error Summary */}
            {preview && preview.errors.length > 0 && (
              <div className="mb-6 p-4 bg-red-900/10 rounded-xl border border-red-500/20">
                <div className="flex items-center gap-2 mb-3">
                  <AlertTriangle className="w-4 h-4 text-red-400" />
                  <span className="text-red-400 text-sm font-medium">{preview.errors.length} Issues Found</span>
                </div>
                <div className="max-h-32 overflow-y-auto space-y-1">
                  {preview.errors.slice(0, 5).map((err, i) => (
                    <div key={i} className="text-xs text-slate-400">
                      Row {err.rowNumber}: {err.error}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Preview Table */}
            <div className="overflow-hidden rounded-xl border border-blue-900/30">
              <div className="overflow-x-auto">
                <table className="w-full min-w-[800px]">
                  <thead className="bg-[#070d1a]">
                    <tr>
                      <th className="px-3 py-2.5 text-left text-xs text-slate-500 font-medium w-12">#</th>
                      {['Institute', 'Branch', 'Category', 'Quota', 'Gender', 'OR', 'CR'].map((h) => (
                        <th key={h} className="px-3 py-2.5 text-left text-xs text-slate-500 font-medium">{h}</th>
                      ))}
                      <th className="px-3 py-2.5 text-center text-xs text-slate-500 font-medium">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-blue-900/15 bg-[#080e1d]">
                    {previewRows.map((row) => (
                      <tr key={row.rowNumber} className={`hover:bg-blue-950/20 transition-colors ${!row.isValid ? 'bg-red-900/5' : ''}`}>
                        <td className="px-3 py-2.5 text-slate-600 text-xs">{row.rowNumber}</td>
                        <td className="px-3 py-2.5 text-slate-300 text-xs truncate max-w-48">{row.mapped?.institute as string}</td>
                        <td className="px-3 py-2.5 text-cyan-300 text-xs">{row.mapped?.branch as string}</td>
                        <td className="px-3 py-2.5 text-amber-300 text-xs">{row.mapped?.category as string}</td>
                        <td className="px-3 py-2.5 text-slate-400 text-xs">{row.mapped?.quota as string}</td>
                        <td className="px-3 py-2.5 text-slate-400 text-xs">{row.mapped?.gender as string}</td>
                        <td className="px-3 py-2.5 text-slate-400 text-xs">{row.mapped?.opening_rank as number}</td>
                        <td className="px-3 py-2.5 text-emerald-400 text-xs font-semibold">{row.mapped?.closing_rank as number}</td>
                        <td className="px-3 py-2.5 text-center">
                          {row.isValid ? (
                            <CheckCircle2 className="w-4 h-4 text-emerald-400 inline" />
                          ) : (
                            <AlertTriangle className="w-4 h-4 text-red-400 inline" />
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-between mt-6 pt-6 border-t border-blue-900/20">
              <button
                onClick={handleReset}
                className="flex items-center gap-2 text-slate-500 hover:text-slate-300 text-sm transition-colors"
              >
                <Trash2 className="w-4 h-4" />
                Discard & Upload New
              </button>

              <div className="flex gap-3">
                {progress.stage === 'completed' ? (
                  <div className="flex items-center gap-2 px-6 py-3 bg-emerald-600/20 border border-emerald-500/30 rounded-xl text-emerald-400">
                    <CheckCircle2 className="w-5 h-5" />
                    Import Complete — {preview?.successfulRows || 0} rows imported
                  </div>
                ) : (
                  <>
                    <Link href="/admin/history">
                      <Button variant="ghost" className="text-slate-400 border border-blue-500/20">
                        <History className="w-4 h-4 mr-2" />
                        View History
                      </Button>
                    </Link>
                    <Button
                      onClick={handleImport}
                      disabled={progress.stage === 'importing'}
                      className="bg-blue-600 hover:bg-blue-500 text-white px-8 disabled:opacity-50"
                    >
                      {progress.stage === 'importing' ? (
                        <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Importing...</>
                      ) : (
                        <><Play className="w-4 h-4 mr-2" />Start Import</>
                      )}
                    </Button>
                  </>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Upload Instructions */}
      <div className="glass-card rounded-2xl p-6 border border-blue-500/10">
        <h3 className="text-white font-semibold text-sm mb-3">File Requirements</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs text-slate-400">
          <div>
            <p className="font-medium text-slate-300 mb-2">Expected Columns:</p>
            <ul className="space-y-1">
              {['Institute / Institute Name', 'Academic Program / Branch', 'Category', 'Quota (optional)', 'Gender (optional)', 'Opening Rank', 'Closing Rank'].map((col) => (
                <li key={col} className="flex items-center gap-1.5"><span className="w-1 h-1 rounded-full bg-blue-400" />{col}</li>
              ))}
            </ul>
          </div>
          <div>
            <p className="font-medium text-slate-300 mb-2">File Guidelines:</p>
            <ul className="space-y-1">
              {['First row must be column headers', 'File size limit: 50MB', 'UTF-8 encoding preferred', 'No merged cells in Excel files'].map((g) => (
                <li key={g} className="flex items-center gap-1.5"><span className="w-1 h-1 rounded-full bg-emerald-400" />{g}</li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

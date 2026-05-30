'use client';

export const dynamic = 'force-dynamic';

import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  FileText, Search, Filter, RefreshCw, Download,
  AlertTriangle, Info, CheckCircle2, Clock
} from 'lucide-react';

const logTypes = ['info', 'warning', 'error', 'success'] as const;
type LogType = typeof logTypes[number];

interface LogEntry {
  id: string;
  timestamp: string;
  type: LogType;
  message: string;
  details: string;
  importId: string | null;
}

const logs: LogEntry[] = [
  { id: '1', timestamp: '2025-05-29 10:45:22', type: 'success', message: 'Import completed successfully', details: 'josaa_2024_round6.csv - 2840 rows imported', importId: '1' },
  { id: '2', timestamp: '2025-05-29 10:45:15', type: 'info', message: 'Starting import process', details: 'System: josaa, Year: 2024, Round: 6', importId: '1' },
  { id: '3', timestamp: '2025-05-29 10:44:58', type: 'success', message: 'Validation passed', details: '2840 valid rows, 0 errors', importId: '1' },
  { id: '4', timestamp: '2025-05-29 10:44:45', type: 'info', message: 'Parsing CSV file', details: 'Found 2841 rows including header', importId: '1' },
  { id: '5', timestamp: '2025-05-29 10:44:30', type: 'info', message: 'File uploaded', details: 'josaa_2024_round6.csv (245 KB)', importId: '1' },
  { id: '6', timestamp: '2025-05-28 14:20:10', type: 'warning', message: 'Duplicate entries detected', details: '12 duplicate rows found in josaa_2024_round1.csv', importId: '4' },
  { id: '7', timestamp: '2025-05-28 14:19:55', type: 'error', message: 'Import failed', details: '120 rows failed validation - invalid category values', importId: '4' },
  { id: '8', timestamp: '2025-05-27 09:12:30', type: 'success', message: 'Normalization rules updated', details: 'Added 5 new branch mapping rules', importId: null },
];

const typeConfig: Record<LogType, { icon: typeof CheckCircle2; color: string; bg: string }> = {
  success: { icon: CheckCircle2, color: 'text-emerald-400', bg: 'bg-emerald-400/10' },
  error: { icon: AlertTriangle, color: 'text-red-400', bg: 'bg-red-400/10' },
  warning: { icon: AlertTriangle, color: 'text-amber-400', bg: 'bg-amber-400/10' },
  info: { icon: Info, color: 'text-blue-400', bg: 'bg-blue-400/10' },
};

export default function LogsPage() {
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');

  const filteredLogs = logs.filter((log) => {
    if (typeFilter !== 'all' && log.type !== typeFilter) return false;
    if (search && !log.message.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Import Logs</h1>
          <p className="text-slate-500 text-sm mt-1">System logs for data imports and processing.</p>
        </div>
        <div className="flex gap-3">
          <button className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#0B1120] border border-blue-900/30 text-slate-400 hover:text-white transition-colors text-sm">
            <RefreshCw className="w-4 h-4" />
            Refresh
          </button>
          <button className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#0B1120] border border-blue-900/30 text-slate-400 hover:text-white transition-colors text-sm">
            <Download className="w-4 h-4" />
            Export
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4">
        {[
          { label: 'Logs Today', value: 5, color: 'text-white' },
          { label: 'Errors', value: logs.filter((l) => l.type === 'error').length, color: 'text-red-400' },
          { label: 'Warnings', value: logs.filter((l) => l.type === 'warning').length, color: 'text-amber-400' },
          { label: 'Success', value: logs.filter((l) => l.type === 'success').length, color: 'text-emerald-400' },
        ].map((stat) => (
          <div key={stat.label} className="glass-card rounded-xl p-4 border border-blue-500/10">
            <div className={`text-xl font-bold ${stat.color}`}>{stat.value}</div>
            <div className="text-slate-500 text-xs">{stat.label}</div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex gap-3">
        <div className="relative flex-1 max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search logs..."
            className="w-full bg-[#0B1120] border border-blue-900/30 rounded-xl pl-9 pr-4 py-2 text-sm text-white placeholder:text-slate-600 focus:outline-none focus:border-blue-500/50"
          />
        </div>

        <div className="flex gap-1 p-1 bg-[#0B1120] rounded-xl border border-blue-900/30">
          {['all', 'info', 'success', 'warning', 'error'].map((t) => (
            <button
              key={t}
              onClick={() => setTypeFilter(t)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium capitalize transition-all ${
                typeFilter === t ? 'bg-blue-600/25 border border-blue-500/40 text-blue-300' : 'text-slate-500 hover:text-slate-300'
              }`}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      {/* Logs List */}
      <div className="glass-card rounded-2xl border border-blue-500/10 overflow-hidden">
        <div className="divide-y divide-blue-900/15">
          {filteredLogs.map((log, i) => {
            const config = typeConfig[log.type];
            const Icon = config.icon;
            return (
              <motion.div
                key={log.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.03 }}
                className="flex items-start gap-4 p-4 hover:bg-blue-950/20 transition-colors"
              >
                <div className={`w-8 h-8 rounded-lg ${config.bg} border border-blue-500/15 flex items-center justify-center flex-shrink-0 mt-0.5`}>
                  <Icon className={`w-4 h-4 ${config.color}`} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 mb-1">
                    <span className={`text-xs font-semibold uppercase tracking-wider ${config.color}`}>{log.type}</span>
                    <span className="text-white text-sm font-medium">{log.message}</span>
                  </div>
                  <div className="text-slate-500 text-xs">{log.details}</div>
                </div>
                <div className="flex items-center gap-2 text-xs text-slate-500 flex-shrink-0">
                  <Clock className="w-3.5 h-3.5" />
                  {log.timestamp}
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
}


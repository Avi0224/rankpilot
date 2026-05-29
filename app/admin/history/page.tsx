'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  History, Download, Trash2, RotateCcw, Eye, FileText,
  CheckCircle2, AlertTriangle, Clock, Filter, Search,
  ChevronDown, ChevronRight, Archive
} from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

const importHistory = [
  { id: '1', file: 'josaa_2024_round6.csv', system: 'JoSAA', year: 2024, round: 6, rows: 2840, successful: 2840, failed: 0, status: 'completed', time: '2 hours ago', duration: '12.4s', warnings: 0, duplicates: 0 },
  { id: '2', file: 'colleges_master.csv', system: 'Internal', year: 2024, round: null, rows: 12, successful: 12, failed: 0, status: 'completed', time: '1 day ago', duration: '0.8s', warnings: 0, duplicates: 0 },
  { id: '3', file: 'branches_mapping.xlsx', system: 'Internal', year: 2024, round: null, rows: 22, successful: 22, failed: 0, status: 'completed', time: '2 days ago', duration: '1.2s', warnings: 0, duplicates: 0 },
  { id: '4', file: 'josaa_2024_round1.csv', system: 'JoSAA', year: 2024, round: 1, rows: 3520, successful: 3400, failed: 120, status: 'completed', time: '1 week ago', duration: '18.2s', warnings: 45, duplicates: 12 },
  { id: '5', file: 'josaa_2023_round6.csv', system: 'JoSAA', year: 2023, round: 6, rows: 2680, successful: 2680, failed: 0, status: 'completed', time: '11 months ago', duration: '10.1s', warnings: 0, duplicates: 0 },
];

const statusColors: Record<string, string> = {
  completed: 'text-emerald-400 bg-emerald-400/10 border-emerald-400/25',
  failed: 'text-red-400 bg-red-400/10 border-red-400/25',
  pending: 'text-amber-400 bg-amber-400/10 border-amber-400/25',
  processing: 'text-blue-400 bg-blue-400/10 border-blue-400/25',
  rolled_back: 'text-slate-400 bg-slate-400/10 border-slate-400/25',
};

export default function ImportHistoryPage() {
  const [expanded, setExpanded] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState('all');
  const [search, setSearch] = useState('');

  const filteredHistory = importHistory.filter((h) => {
    if (statusFilter !== 'all' && h.status !== statusFilter) return false;
    if (search && !h.file.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Import History</h1>
          <p className="text-slate-500 text-sm mt-1">View and manage past dataset imports.</p>
        </div>
        <Link href="/admin/upload">
          <Button className="bg-blue-600 hover:bg-blue-500 text-white gap-2 text-sm">
            <Download className="w-4 h-4" />
            New Upload
          </Button>
        </Link>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <div className="relative flex-1 max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search files..."
            className="w-full bg-[#0B1120] border border-blue-900/30 rounded-xl pl-9 pr-4 py-2 text-sm text-white placeholder:text-slate-600 focus:outline-none focus:border-blue-500/50"
          />
        </div>

        <div className="flex gap-1 p-1 bg-[#0B1120] rounded-xl border border-blue-900/30">
          {['all', 'completed', 'failed', 'rolled_back'].map((s) => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium capitalize transition-all ${
                statusFilter === s ? 'bg-blue-600/25 border border-blue-500/40 text-blue-300' : 'text-slate-500 hover:text-slate-300'
              }`}
            >
              {s.replace('_', ' ')}
            </button>
          ))}
        </div>
      </div>

      {/* Stats Summary */}
      <div className="grid grid-cols-4 gap-4">
        {[
          { label: 'Total Imports', value: importHistory.length, color: 'text-white' },
          { label: 'Successful', value: importHistory.filter((h) => h.status === 'completed').length, color: 'text-emerald-400' },
          { label: 'Failed', value: importHistory.filter((h) => h.status === 'failed').length, color: 'text-red-400' },
          { label: 'Rollbacks', value: importHistory.filter((h) => h.status === 'rolled_back').length, color: 'text-slate-400' },
        ].map((stat) => (
          <div key={stat.label} className="glass-card rounded-xl p-4 border border-blue-500/10">
            <div className={`text-2xl font-bold ${stat.color}`}>{stat.value}</div>
            <div className="text-slate-500 text-xs">{stat.label}</div>
          </div>
        ))}
      </div>

      {/* Import List */}
      <div className="glass-card rounded-2xl border border-blue-500/10 overflow-hidden">
        <table className="w-full">
          <thead className="bg-[#070d1a]">
            <tr className="text-left">
              <th className="px-4 py-3"></th>
              <th className="px-4 py-3 text-xs text-slate-500 font-medium">File</th>
              <th className="px-4 py-3 text-xs text-slate-500 font-medium">System</th>
              <th className="px-4 py-3 text-xs text-slate-500 font-medium">Rows</th>
              <th className="px-4 py-3 text-xs text-slate-500 font-medium">Status</th>
              <th className="px-4 py-3 text-xs text-slate-500 font-medium">Time</th>
              <th className="px-4 py-3 text-xs text-slate-500 font-medium text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-blue-900/15">
            {filteredHistory.map((imp) => (
              <>
                <motion.tr
                  key={imp.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="hover:bg-blue-950/20 transition-colors cursor-pointer"
                  onClick={() => setExpanded(expanded === imp.id ? null : imp.id)}
                >
                  <td className="px-4 py-3 w-8">
                    <ChevronRight className={`w-4 h-4 text-slate-500 transition-transform ${expanded === imp.id ? 'rotate-90' : ''}`} />
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <FileText className="w-4 h-4 text-blue-400/60" />
                      <span className="text-white text-sm font-medium">{imp.file}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-slate-400 text-sm">{imp.system}</td>
                  <td className="px-4 py-3">
                    <div>
                      <span className="text-white text-sm font-medium">{imp.successful.toLocaleString()}</span>
                      {imp.failed > 0 && <span className="text-red-400 text-xs ml-1">({imp.failed} failed)</span>}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`text-xs px-2 py-0.5 rounded-full border ${statusColors[imp.status]}`}>
                      {imp.status.replace('_', ' ')}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-slate-400 text-xs">{imp.time}</td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button className="w-7 h-7 rounded-lg bg-[#0B1120] border border-blue-900/30 flex items-center justify-center text-slate-500 hover:text-white transition-colors">
                        <Eye className="w-3.5 h-3.5" />
                      </button>
                      {imp.status === 'completed' && (
                        <button className="w-7 h-7 rounded-lg bg-[#0B1120] border border-blue-900/30 flex items-center justify-center text-slate-500 hover:text-red-400 transition-colors">
                          <RotateCcw className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </td>
                </motion.tr>

                {/* Expanded Details */}
                {expanded === imp.id && (
                  <tr key={`${imp.id}-details`}>
                    <td colSpan={7} className="px-6 py-4 bg-[#080f1e] border-t border-blue-900/20">
                      <div className="grid grid-cols-4 sm:grid-cols-6 gap-6 text-xs">
                        <div>
                          <div className="text-slate-500 mb-1">Year</div>
                          <div className="text-white">{imp.year}</div>
                        </div>
                        {imp.round && (
                          <div>
                            <div className="text-slate-500 mb-1">Round</div>
                            <div className="text-white">{imp.round}</div>
                          </div>
                        )}
                        <div>
                          <div className="text-slate-500 mb-1">Duration</div>
                          <div className="text-white">{imp.duration}</div>
                        </div>
                        <div>
                          <div className="text-slate-500 mb-1">Duplicates</div>
                          <div className={imp.duplicates > 0 ? 'text-amber-400' : 'text-white'}>{imp.duplicates}</div>
                        </div>
                        <div>
                          <div className="text-slate-500 mb-1">Warnings</div>
                          <div className={imp.warnings > 0 ? 'text-amber-400' : 'text-white'}>{imp.warnings}</div>
                        </div>
                        <div>
                          <div className="text-slate-500 mb-1">Success Rate</div>
                          <div className="text-emerald-400">{((imp.successful / imp.rows) * 100).toFixed(1)}%</div>
                        </div>
                      </div>
                    </td>
                  </tr>
                )}
              </>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

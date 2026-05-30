'use client';

export const dynamic = 'force-dynamic';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { motion } from 'framer-motion';
import {
  BarChart3, Search, Filter, Download, ChevronDown,
  Database, Eye, Trash2, RefreshCw
} from 'lucide-react';
import { Button } from '@/components/ui/button';

const cutoffs = [
  { id: '1', college: 'NIT Trichy', branch: 'CSE', year: 2024, round: 6, category: 'OPEN', quota: 'AI', gender: 'Gender-Neutral', or: 2130, cr: 4850 },
  { id: '2', college: 'NIT Trichy', branch: 'ECE', year: 2024, round: 6, category: 'OPEN', quota: 'AI', gender: 'Gender-Neutral', or: 6200, cr: 12800 },
  { id: '3', college: 'DTU', branch: 'CSE', year: 2024, round: 6, category: 'OPEN', quota: 'AI', gender: 'Gender-Neutral', or: 980, cr: 3200 },
  { id: '4', college: 'DTU', branch: 'ECE', year: 2024, round: 6, category: 'OPEN', quota: 'AI', gender: 'Gender-Neutral', or: 3500, cr: 8200 },
  { id: '5', college: 'NIT Warangal', branch: 'CSE', year: 2024, round: 6, category: 'OPEN', quota: 'AI', gender: 'Gender-Neutral', or: 3500, cr: 7200 },
  { id: '6', college: 'NIT Warangal', branch: 'ECE', year: 2024, round: 6, category: 'OPEN', quota: 'AI', gender: 'Gender-Neutral', or: 7800, cr: 15000 },
  { id: '7', college: 'IIIT Allahabad', branch: 'IT', year: 2024, round: 6, category: 'OPEN', quota: 'AI', gender: 'Gender-Neutral', or: 4100, cr: 9800 },
  { id: '8', college: 'NIT Surathkal', branch: 'CSE', year: 2024, round: 6, category: 'OPEN', quota: 'AI', gender: 'Gender-Neutral', or: 3800, cr: 7900 },
];

const categoryColors: Record<string, string> = {
  OPEN: 'text-slate-300 bg-slate-500/10 border-slate-500/25',
  'OBC-NCL': 'text-amber-400 bg-amber-400/10 border-amber-400/25',
  SC: 'text-emerald-400 bg-emerald-400/10 border-emerald-400/25',
  ST: 'text-cyan-400 bg-cyan-400/10 border-cyan-400/25',
  EWS: 'text-blue-400 bg-blue-400/10 border-blue-400/25',
};

export default function CutoffRecordsPage() {
  const [search, setSearch] = useState('');
  const [yearFilter, setYearFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');

  const filteredCutoffs = cutoffs.filter((c) => {
    if (yearFilter !== 'all' && c.year !== Number(yearFilter)) return false;
    if (categoryFilter !== 'all' && c.category !== categoryFilter) return false;
    if (search && !c.college.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Cutoff Records</h1>
          <p className="text-slate-500 text-sm mt-1">Browse and manage imported JEE cutoff data.</p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" className="gap-2 text-slate-300 border-blue-500/30">
            <Download className="w-4 h-4" />
            Export CSV
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4">
        {[
          { label: 'Total Records', value: cutoffs.length * 5, color: 'text-white' },
          { label: 'Unique Colleges', value: cutoffs.map((c) => c.college).filter((v, i, a) => a.indexOf(v) === i).length, color: 'text-blue-400' },
          { label: 'Unique Branches', value: cutoffs.map((c) => c.branch).filter((v, i, a) => a.indexOf(v) === i).length, color: 'text-cyan-400' },
          { label: 'Systems', value: 'JoSAA', color: 'text-amber-400' },
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
            placeholder="Search colleges..."
            className="w-full bg-[#0B1120] border border-blue-900/30 rounded-xl pl-9 pr-4 py-2 text-sm text-white placeholder:text-slate-600 focus:outline-none focus:border-blue-500/50"
          />
        </div>

        <div className="relative">
          <select
            value={yearFilter}
            onChange={(e) => setYearFilter(e.target.value)}
            className="bg-[#0B1120] border border-blue-900/30 rounded-xl px-3 py-2 text-sm text-white appearance-none pr-8 focus:outline-none focus:border-blue-500/50"
          >
            <option value="all">All Years</option>
            {[2024, 2023, 2022, 2021].map((y) => (
              <option key={y} value={y}>{y}</option>
            ))}
          </select>
          <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 pointer-events-none" />
        </div>

        <div className="relative">
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="bg-[#0B1120] border border-blue-900/30 rounded-xl px-3 py-2 text-sm text-white appearance-none pr-8 focus:outline-none focus:border-blue-500/50"
          >
            <option value="all">All Categories</option>
            {['OPEN', 'OBC-NCL', 'SC', 'ST', 'EWS'].map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
          <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 pointer-events-none" />
        </div>
      </div>

      {/* Table */}
      <div className="glass-card rounded-2xl border border-blue-500/10 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[900px]">
            <thead className="bg-[#070d1a]">
              <tr>
                <th className="px-4 py-3 text-left text-xs text-slate-500 font-medium">College</th>
                <th className="px-4 py-3 text-left text-xs text-slate-500 font-medium">Branch</th>
                <th className="px-4 py-3 text-left text-xs text-slate-500 font-medium">Year</th>
                <th className="px-4 py-3 text-left text-xs text-slate-500 font-medium">Round</th>
                <th className="px-4 py-3 text-left text-xs text-slate-500 font-medium">Category</th>
                <th className="px-4 py-3 text-left text-xs text-slate-500 font-medium">Quota</th>
                <th className="px-4 py-3 text-left text-xs text-slate-500 font-medium">Gender</th>
                <th className="px-4 py-3 text-right text-xs text-slate-500 font-medium">OR</th>
                <th className="px-4 py-3 text-right text-xs text-slate-500 font-medium">CR</th>
                <th className="px-4 py-3 text-center text-xs text-slate-500 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-blue-900/15 bg-[#080e1d]">
              {filteredCutoffs.map((cutoff, i) => (
                <motion.tr
                  key={cutoff.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.02 }}
                  className="hover:bg-blue-950/20 transition-colors"
                >
                  <td className="px-4 py-3 text-white text-sm font-medium">{cutoff.college}</td>
                  <td className="px-4 py-3 text-cyan-300 text-sm">{cutoff.branch}</td>
                  <td className="px-4 py-3 text-slate-400 text-sm">{cutoff.year}</td>
                  <td className="px-4 py-3 text-slate-400 text-sm">R{cutoff.round}</td>
                  <td className="px-4 py-3">
                    <span className={`text-xs px-2 py-0.5 rounded-full border ${categoryColors[cutoff.category] || 'text-slate-400'}`}>
                      {cutoff.category}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-slate-400 text-sm">{cutoff.quota}</td>
                  <td className="px-4 py-3 text-slate-400 text-xs">{cutoff.gender}</td>
                  <td className="px-4 py-3 text-right text-slate-300 text-sm">{cutoff.or.toLocaleString()}</td>
                  <td className="px-4 py-3 text-right text-emerald-400 text-sm font-semibold">{cutoff.cr.toLocaleString()}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-center gap-2">
                      <button className="w-7 h-7 rounded-lg bg-[#0B1120] border border-blue-900/30 flex items-center justify-center text-slate-500 hover:text-white transition-colors">
                        <Eye className="w-3.5 h-3.5" />
                      </button>
                      <button className="w-7 h-7 rounded-lg bg-[#0B1120] border border-blue-900/30 flex items-center justify-center text-slate-500 hover:text-red-400 transition-colors">
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between text-sm text-slate-500">
        <div>Showing {filteredCutoffs.length} of {cutoffs.length} records</div>
        <div className="flex gap-2">
          <button className="px-3 py-1.5 rounded-lg bg-[#0B1120] border border-blue-900/30 hover:border-blue-500/30 transition-colors">Previous</button>
          <button className="px-3 py-1.5 rounded-lg bg-blue-600/20 border border-blue-500/30 text-blue-300">1</button>
          <button className="px-3 py-1.5 rounded-lg bg-[#0B1120] border border-blue-900/30 hover:border-blue-500/30 transition-colors">2</button>
          <button className="px-3 py-1.5 rounded-lg bg-[#0B1120] border border-blue-900/30 hover:border-blue-500/30 transition-colors">Next</button>
        </div>
      </div>
    </div>
  );
}


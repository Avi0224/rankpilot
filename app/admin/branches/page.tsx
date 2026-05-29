'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  GitBranch, Search, Plus, Edit, Trash2, CheckCircle2,
  AlertTriangle, ArrowRight, RefreshCw, Filter
} from 'lucide-react';
import { Button } from '@/components/ui/button';

const normalizationRules = [
  { id: '1', original: 'Computer Science and Engineering', normalized: 'CSE', type: 'branch', isAuto: false, usageCount: 12 },
  { id: '2', original: 'Computer Science Engg.', normalized: 'CSE', type: 'branch', isAuto: false, usageCount: 8 },
  { id: '3', original: 'CSE', normalized: 'CSE', type: 'branch', isAuto: false, usageCount: 45 },
  { id: '4', original: 'Electronics and Communication Engineering', normalized: 'ECE', type: 'branch', isAuto: false, usageCount: 10 },
  { id: '5', original: 'Electronics & Comm.', normalized: 'ECE', type: 'branch', isAuto: false, usageCount: 6 },
  { id: '6', original: 'ECE', normalized: 'ECE', type: 'branch', isAuto: false, usageCount: 32 },
  { id: '7', original: 'Information Technology', normalized: 'IT', type: 'branch', isAuto: false, usageCount: 8 },
  { id: '8', original: 'GEN-EWS', normalized: 'EWS', type: 'category', isAuto: false, usageCount: 15 },
  { id: '9', original: 'OBC-NCL', normalized: 'OBC-NCL', type: 'category', isAuto: false, usageCount: 28 },
  { id: '10', original: 'OPEN', normalized: 'OPEN', type: 'category', isAuto: false, usageCount: 65 },
  { id: '11', original: 'Home State', normalized: 'HS', type: 'quota', isAuto: false, usageCount: 22 },
  { id: '12', original: 'All India', normalized: 'AI', type: 'quota', isAuto: false, usageCount: 45 },
  { id: '13', original: 'Gender-Neutral', normalized: 'Gender-Neutral', type: 'gender', isAuto: false, usageCount: 80 },
  { id: '14', original: 'Female-only', normalized: 'Female-only', type: 'gender', isAuto: false, usageCount: 80 },
];

const typeColors: Record<string, string> = {
  branch: 'text-blue-400 bg-blue-400/10 border-blue-400/25',
  category: 'text-amber-400 bg-amber-400/10 border-amber-400/25',
  quota: 'text-cyan-400 bg-cyan-400/10 border-cyan-400/25',
  gender: 'text-emerald-400 bg-emerald-400/10 border-emerald-400/25',
};

const standardBranches = ['CSE', 'ECE', 'IT', 'EE', 'ME', 'CE', 'ChemE', 'DS', 'AIML', 'Arch'];

export default function BranchMappingPage() {
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');

  const filteredRules = normalizationRules.filter((r) => {
    if (typeFilter !== 'all' && r.type !== typeFilter) return false;
    if (search && !r.original.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const stats = {
    total: normalizationRules.length,
    branches: normalizationRules.filter((r) => r.type === 'branch').length,
    categories: normalizationRules.filter((r) => r.type === 'category').length,
    quotas: normalizationRules.filter((r) => r.type === 'quota').length,
    gender: normalizationRules.filter((r) => r.type === 'gender').length,
  };

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Branch Mapping & Normalization</h1>
          <p className="text-slate-500 text-sm mt-1">Define normalization rules for branches, categories, quotas, and gender.</p>
        </div>
        <Button className="bg-blue-600 hover:bg-blue-500 text-white gap-2 text-sm">
          <Plus className="w-4 h-4" />
          Add Rule
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-5 gap-4">
        {[
          { label: 'Total Rules', value: stats.total, color: 'text-white' },
          { label: 'Branch', value: stats.branches, color: 'text-blue-400' },
          { label: 'Category', value: stats.categories, color: 'text-amber-400' },
          { label: 'Quota', value: stats.quotas, color: 'text-cyan-400' },
          { label: 'Gender', value: stats.gender, color: 'text-emerald-400' },
        ].map((stat) => (
          <div key={stat.label} className="glass-card rounded-xl p-4 border border-blue-500/10">
            <div className={`text-xl font-bold ${stat.color}`}>{stat.value}</div>
            <div className="text-slate-500 text-xs">{stat.label}</div>
          </div>
        ))}
      </div>

      {/* Standard Branches */}
      <div className="glass-card rounded-2xl p-5 border border-blue-500/10">
        <h3 className="text-white font-semibold text-sm mb-3">Standardized Branch Codes</h3>
        <div className="flex flex-wrap gap-2">
          {standardBranches.map((b) => (
            <span key={b} className="px-3 py-1.5 bg-blue-600/15 border border-blue-500/25 rounded-lg text-blue-300 text-xs font-semibold">{b}</span>
          ))}
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-3">
        <div className="relative flex-1 max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search rules..."
            className="w-full bg-[#0B1120] border border-blue-900/30 rounded-xl pl-9 pr-4 py-2 text-sm text-white placeholder:text-slate-600 focus:outline-none focus:border-blue-500/50"
          />
        </div>

        <div className="flex gap-1 p-1 bg-[#0B1120] rounded-xl border border-blue-900/30">
          {['all', 'branch', 'category', 'quota', 'gender'].map((t) => (
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

      {/* Rules Table */}
      <div className="glass-card rounded-2xl border border-blue-500/10 overflow-hidden">
        <table className="w-full">
          <thead className="bg-[#070d1a]">
            <tr>
              <th className="px-5 py-3 text-left text-xs text-slate-500 font-medium">Original Value</th>
              <th className="px-5 py-3 text-left text-xs text-slate-500 font-medium"></th>
              <th className="px-5 py-3 text-left text-xs text-slate-500 font-medium">Normalized</th>
              <th className="px-5 py-3 text-left text-xs text-slate-500 font-medium">Type</th>
              <th className="px-5 py-3 text-left text-xs text-slate-500 font-medium">Usage</th>
              <th className="px-5 py-3 text-left text-xs text-slate-500 font-medium">Auto</th>
              <th className="px-5 py-3 text-center text-xs text-slate-500 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-blue-900/15 bg-[#080e1d]">
            {filteredRules.map((rule) => (
              <motion.tr
                key={rule.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="hover:bg-blue-950/20 transition-colors"
              >
                <td className="px-5 py-3 text-slate-300 text-sm font-medium">{rule.original}</td>
                <td className="px-5 py-3 w-12">
                  <ArrowRight className="w-4 h-4 text-blue-500/50" />
                </td>
                <td className="px-5 py-3">
                  <span className="px-2 py-1 bg-blue-600/20 border border-blue-500/30 rounded-lg text-blue-300 text-sm font-semibold">
                    {rule.normalized}
                  </span>
                </td>
                <td className="px-5 py-3">
                  <span className={`text-xs px-2 py-0.5 rounded-full border capitalize ${typeColors[rule.type]}`}>{rule.type}</span>
                </td>
                <td className="px-5 py-3 text-slate-400 text-sm">{rule.usageCount}</td>
                <td className="px-5 py-3">
                  {rule.isAuto ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  ) : (
                    <span className="text-slate-600 text-xs">Manual</span>
                  )}
                </td>
                <td className="px-5 py-3">
                  <div className="flex items-center justify-center gap-2">
                    <button className="w-7 h-7 rounded-lg bg-[#0B1120] border border-blue-900/30 flex items-center justify-center text-slate-500 hover:text-white transition-colors">
                      <Edit className="w-3.5 h-3.5" />
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

      {/* Help text */}
      <div className="glass-card rounded-xl p-4 border border-blue-500/10 text-xs text-slate-500">
        <strong className="text-slate-300">How normalization works:</strong> When importing data, the system automatically maps original values to their normalized form using these rules. Add custom rules for new variations found in imported datasets.
      </div>
    </div>
  );
}

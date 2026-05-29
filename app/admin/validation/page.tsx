'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  CheckCircle2, AlertTriangle, Search, Filter, Download,
  RefreshCw, Database, FileCheck, AlertCircle, X
} from 'lucide-react';
import { Button } from '@/components/ui/button';

const validationRules = [
  { id: '1', rule: 'Missing Institute Name', type: 'missing_value', severity: 'error', count: 0, status: 'active' },
  { id: '2', rule: 'Invalid Branch Name', type: 'invalid_format', severity: 'warning', count: 3, status: 'active' },
  { id: '3', rule: 'Duplicate Cutoff Entry', type: 'duplicate', severity: 'warning', count: 12, status: 'active' },
  { id: '4', rule: 'Missing Category', type: 'missing_value', severity: 'error', count: 0, status: 'active' },
  { id: '5', rule: 'Opening > Closing Rank', type: 'constraint_violation', severity: 'error', count: 2, status: 'active' },
  { id: '6', rule: 'Negative Rank Value', type: 'invalid_rank', severity: 'error', count: 0, status: 'active' },
  { id: '7', rule: 'Unknown Category Value', type: 'normalization_failed', severity: 'warning', count: 5, status: 'active' },
  { id: '8', rule: 'Missing Closing Rank', type: 'missing_value', severity: 'error', count: 0, status: 'active' },
];

const validationStats = {
  totalRecords: 40,
  validRecords: 18,
  warningRecords: 20,
  errorRecords: 2,
  validationScore: 95.0,
};

export default function DataValidationPage() {
  const [filterType, setFilterType] = useState('all');
  const [search, setSearch] = useState('');

  const filteredRules = validationRules.filter((r) => {
    if (filterType !== 'all' && r.type !== filterType) return false;
    if (search && !r.rule.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const issuesByType = validationRules.filter((r) => r.count > 0);

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Data Validation</h1>
          <p className="text-slate-500 text-sm mt-1">Monitor data quality and identify issues in imported datasets.</p>
        </div>
        <Button className="gap-2 text-sm" variant="outline">
          <RefreshCw className="w-4 h-4" />
          Revalidate All
        </Button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        {[
          { label: 'Total Records', value: validationStats.totalRecords, icon: Database, color: 'text-white' },
          { label: 'Valid', value: validationStats.validRecords, icon: CheckCircle2, color: 'text-emerald-400' },
          { label: 'Warnings', value: validationStats.warningRecords, icon: AlertTriangle, color: 'text-amber-400' },
          { label: 'Errors', value: validationStats.errorRecords, icon: X, color: 'text-red-400' },
          { label: 'Score', value: `${validationStats.validationScore}%`, icon: FileCheck, color: 'text-blue-400' },
        ].map((stat) => {
          const Icon = stat.icon;
          return (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              className="glass-card rounded-xl p-4 border border-blue-500/10"
            >
              <Icon className={`w-4 h-4 ${stat.color} mb-2`} />
              <div className="text-white font-bold text-lg">{stat.value}</div>
              <div className="text-slate-500 text-xs">{stat.label}</div>
            </motion.div>
          );
        })}
      </div>

      {/* Active Issues */}
      {issuesByType.length > 0 && (
        <div className="glass-card rounded-2xl p-6 border border-amber-500/15">
          <div className="flex items-center gap-2 mb-4">
            <AlertTriangle className="w-5 h-5 text-amber-400" />
            <h3 className="text-white font-semibold">Active Issues ({issuesByType.reduce((sum, r) => sum + r.count, 0)})</h3>
          </div>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            {issuesByType.map((issue) => (
              <div key={issue.id} className="flex items-center gap-2 px-3 py-2 bg-[#0B1120] rounded-lg border border-blue-900/30">
                <AlertCircle className={`w-4 h-4 ${issue.severity === 'error' ? 'text-red-400' : 'text-amber-400'}`} />
                <div className="flex-1 min-w-0">
                  <div className="text-white text-xs font-medium truncate">{issue.rule}</div>
                </div>
                <span className={`text-xs font-semibold ${issue.count > 0 ? 'text-amber-400' : 'text-emerald-400'}`}>
                  {issue.count}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Validation Rules Table */}
      <div className="glass-card rounded-2xl border border-blue-500/10 overflow-hidden">
        <div className="px-5 py-4 border-b border-blue-900/30 flex items-center justify-between">
          <h3 className="text-white font-semibold text-sm">Validation Rules</h3>
          <div className="flex gap-2">
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-500" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search rules..."
                className="bg-[#0B1120] border border-blue-900/30 rounded-lg pl-8 pr-3 py-1.5 text-xs text-white placeholder:text-slate-600 w-40"
              />
            </div>
            <div className="flex gap-1 p-0.5 bg-[#0B1120] rounded-lg border border-blue-900/30">
              {['all', 'missing_value', 'duplicate', 'invalid_format'].map((t) => (
                <button
                  key={t}
                  onClick={() => setFilterType(t)}
                  className={`px-2 py-1 rounded text-[10px] font-medium transition-all ${
                    filterType === t ? 'bg-blue-600/20 text-blue-300' : 'text-slate-500 hover:text-slate-300'
                  }`}
                >
                  {t.replace('_', ' ').slice(0, 8)}
                </button>
              ))}
            </div>
          </div>
        </div>

        <table className="w-full">
          <thead className="bg-[#070d1a]">
            <tr>
              <th className="px-5 py-3 text-left text-xs text-slate-500 font-medium">Rule</th>
              <th className="px-5 py-3 text-left text-xs text-slate-500 font-medium">Type</th>
              <th className="px-5 py-3 text-left text-xs text-slate-500 font-medium">Severity</th>
              <th className="px-5 py-3 text-left text-xs text-slate-500 font-medium">Count</th>
              <th className="px-5 py-3 text-left text-xs text-slate-500 font-medium">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-blue-900/15 bg-[#080e1d]">
            {filteredRules.map((rule) => (
              <tr key={rule.id} className="hover:bg-blue-950/20">
                <td className="px-5 py-3 text-white text-sm">{rule.rule}</td>
                <td className="px-5 py-3 text-slate-400 text-xs capitalize">{rule.type.replace('_', ' ')}</td>
                <td className="px-5 py-3">
                  <span className={`text-xs px-2 py-0.5 rounded-full ${
                    rule.severity === 'error'
                      ? 'text-red-400 bg-red-400/10 border border-red-400/20'
                      : 'text-amber-400 bg-amber-400/10 border border-amber-400/20'
                  }`}>
                    {rule.severity}
                  </span>
                </td>
                <td className="px-5 py-3">
                  <span className={`text-sm font-semibold ${
                    rule.count === 0 ? 'text-emerald-400' : rule.severity === 'error' ? 'text-red-400' : 'text-amber-400'
                  }`}>
                    {rule.count}
                  </span>
                </td>
                <td className="px-5 py-3">
                  <span className="text-xs px-2 py-0.5 rounded-full text-emerald-400 bg-emerald-400/10 border border-emerald-400/20">
                    active
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Validation Rules Description */}
      <div className="glass-card rounded-2xl p-6 border border-blue-500/10">
        <h3 className="text-white font-semibold text-sm mb-4">Validation Types</h3>
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 text-xs text-slate-400">
          {[
            { name: 'Missing Value', desc: 'Required field is empty or null' },
            { name: 'Invalid Format', desc: 'Value does not match expected format' },
            { name: 'Duplicate Entry', desc: 'Same record exists multiple times' },
            { name: 'Normalization Failed', desc: 'Cannot map value to standard form' },
            { name: 'Constraint Violation', desc: 'Data violates logical constraints' },
            { name: 'Invalid Rank', desc: 'Rank value is invalid or out of range' },
          ].map((type) => (
            <div key={type.name}>
              <span className="text-slate-300 font-medium">{type.name}</span>
              <p className="mt-0.5">{type.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

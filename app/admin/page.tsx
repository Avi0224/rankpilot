'use client';

import { motion } from 'framer-motion';
import {
  Building2, GitBranch, BarChart3, Upload, History,
  CheckCircle2, AlertTriangle, Activity, TrendingUp,
  FileText, Clock, RefreshCw, Database, Layers,
  ChevronRight, ArrowUpRight, Archive
} from 'lucide-react';
import Link from 'next/link';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  AreaChart, Area, BarChart, Bar
} from 'recharts';

const stats = [
  { label: 'Total Colleges', value: 12, change: '+2', icon: Building2, color: 'text-blue-400', bg: 'bg-blue-400/10' },
  { label: 'Total Branches', value: 22, change: '+5', icon: GitBranch, color: 'text-cyan-400', bg: 'bg-cyan-400/10' },
  { label: 'Cutoff Records', value: '40', change: '+40', icon: BarChart3, color: 'text-emerald-400', bg: 'bg-emerald-400/10' },
  { label: 'Import Sessions', value: 3, change: 'New', icon: Upload, color: 'text-amber-400', bg: 'bg-amber-400/10' },
];

const systems = [
  { id: 'josaa', name: 'JoSAA', records: 2840, lastImport: '2 hours ago', status: 'active' },
  { id: 'csab', name: 'CSAB', records: 0, lastImport: null, status: 'pending' },
  { id: 'jac-delhi', name: 'JAC Delhi', records: 0, lastImport: null, status: 'pending' },
  { id: 'comedk', name: 'COMEDK', records: 0, lastImport: null, status: 'pending' },
  { id: 'mht-cet', name: 'MHT CET', records: 0, lastImport: null, status: 'pending' },
  { id: 'uptac', name: 'UPTAC', records: 0, lastImport: null, status: 'pending' },
];

const recentImports = [
  { id: '1', file: 'josaa_2024_round6.csv', system: 'JoSAA', rows: 2840, status: 'completed', time: '2 hours ago', errors: 0 },
  { id: '2', file: 'colleges_master.csv', system: 'Internal', rows: 12, status: 'completed', time: '1 day ago', errors: 0 },
  { id: '3', file: 'branches_mapping.xlsx', system: 'Internal', rows: 22, status: 'completed', time: '2 days ago', errors: 0 },
];

const importTrend = [
  { month: 'Jan', imports: 0, rows: 0 },
  { month: 'Feb', imports: 0, rows: 0 },
  { month: 'Mar', imports: 0, rows: 0 },
  { month: 'Apr', imports: 0, rows: 0 },
  { month: 'May', imports: 2, rows: 2852 },
  { month: 'Jun', imports: 1, rows: 2840 },
];

const recordsBySystem = [
  { name: 'JoSAA', records: 2840, color: '#3B82F6' },
  { name: 'CSAB', records: 0, color: '#06B6D4' },
  { name: 'JAC Delhi', records: 0, color: '#10B981' },
  { name: 'COMEDK', records: 0, color: '#F59E0B' },
];

export default function AdminDashboardPage() {
  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-2">
        <div>
          <h1 className="text-2xl font-bold text-white">Data Management Dashboard</h1>
          <p className="text-slate-500 text-sm mt-1">Overview of data imports, validation status, and system health.</p>
        </div>
        <Link href="/admin/upload">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-semibold text-sm glow-blue-sm transition-colors"
          >
            <Upload className="w-4 h-4" />
            Upload Dataset
          </motion.button>
        </Link>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, i) => {
          const Icon = stat.icon;
          return (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              whileHover={{ y: -4 }}
              className="glass-card rounded-2xl p-5 border border-blue-500/10 hover:border-blue-500/25 cursor-default"
            >
              <div className="flex items-start justify-between mb-3">
                <div className={`w-10 h-10 rounded-xl ${stat.bg} border border-blue-500/15 flex items-center justify-center`}>
                  <Icon className={`w-5 h-5 ${stat.color}`} />
                </div>
                <span className={`text-xs px-2 py-0.5 rounded-full ${stat.change.startsWith('+') ? 'bg-emerald-400/10 text-emerald-400' : 'bg-blue-400/10 text-blue-400'}`}>
                  {stat.change}
                </span>
              </div>
              <div className="text-white text-2xl font-bold">{stat.value}</div>
              <div className="text-slate-500 text-xs mt-1">{stat.label}</div>
            </motion.div>
          );
        })}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Import Activity */}
        <div className="lg:col-span-2 glass-card rounded-2xl p-6 border border-blue-500/10">
          <h3 className="text-white font-semibold text-sm mb-4 flex items-center gap-2">
            <Activity className="w-4 h-4 text-blue-400" />
            Import Activity (Last 6 Months)
          </h3>
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={importTrend}>
                <defs>
                  <linearGradient id="colorRows" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#3B82F6" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="month" stroke="#475569" tick={{ fill: '#64748b', fontSize: 11 }} />
                <YAxis stroke="#475569" tick={{ fill: '#64748b', fontSize: 11 }} />
                <Tooltip contentStyle={{ background: '#0B1120', border: '1px solid #1e3a5f', borderRadius: 8, color: '#e2e8f0', fontSize: 12 }} />
                <Area type="monotone" dataKey="rows" stroke="#3B82F6" strokeWidth={2} fillOpacity={1} fill="url(#colorRows)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Records by System */}
        <div className="glass-card rounded-2xl p-6 border border-blue-500/10">
          <h3 className="text-white font-semibold text-sm mb-4 flex items-center gap-2">
            <Layers className="w-4 h-4 text-cyan-400" />
            Records by Counselling System
          </h3>
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={recordsBySystem} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" horizontal={false} />
                <XAxis type="number" stroke="#475569" tick={{ fill: '#64748b', fontSize: 11 }} />
                <YAxis type="category" dataKey="name" width={75} stroke="#475569" tick={{ fill: '#94a3b8', fontSize: 11 }} />
                <Tooltip contentStyle={{ background: '#0B1120', border: '1px solid #1e3a5f', borderRadius: 8, color: '#e2e8f0', fontSize: 12 }} />
                <Bar dataKey="records" fill="#3B82F6" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Systems & Recent Imports */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Counselling Systems */}
        <div className="glass-card rounded-2xl border border-blue-500/10 overflow-hidden">
          <div className="px-5 py-4 border-b border-blue-900/30 flex items-center justify-between">
            <h3 className="text-white font-semibold text-sm flex items-center gap-2">
              <Database className="w-4 h-4 text-emerald-400" />
              Counselling Systems
            </h3>
            <Link href="/admin/settings" className="text-slate-500 hover:text-slate-300 text-xs transition-colors">
              Manage
            </Link>
          </div>
          <div className="divide-y divide-blue-900/20">
            {systems.map((system) => (
              <div key={system.id} className="flex items-center justify-between px-5 py-3.5 hover:bg-blue-950/20 transition-colors">
                <div className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${system.status === 'active' ? 'bg-emerald-400/10 text-emerald-400' : 'bg-slate-700/30 text-slate-500'}`}>
                    {system.status === 'active' ? <CheckCircle2 className="w-4 h-4" /> : <AlertTriangle className="w-4 h-4" />}
                  </div>
                  <div>
                    <div className="text-white text-sm font-medium">{system.name}</div>
                    <div className="text-slate-500 text-xs">
                      {system.records.toLocaleString()} records
                      {system.lastImport && <span> · Last: {system.lastImport}</span>}
                    </div>
                  </div>
                </div>
                <Link href={`/admin/upload?system=${system.id}`}>
                  <button className="px-3 py-1 rounded-lg bg-blue-600/10 border border-blue-500/20 text-blue-400 text-xs font-medium hover:bg-blue-600/20 hover:border-blue-500/30 transition-all">
                    Import
                  </button>
                </Link>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Imports */}
        <div className="glass-card rounded-2xl border border-blue-500/10 overflow-hidden">
          <div className="px-5 py-4 border-b border-blue-900/30 flex items-center justify-between">
            <h3 className="text-white font-semibold text-sm flex items-center gap-2">
              <History className="w-4 h-4 text-amber-400" />
              Recent Imports
            </h3>
            <Link href="/admin/history" className="text-slate-500 hover:text-slate-300 text-xs transition-colors flex items-center gap-1">
              View All <ChevronRight className="w-3 h-3" />
            </Link>
          </div>
          <div className="divide-y divide-blue-900/20">
            {recentImports.map((imp) => (
              <div key={imp.id} className="flex items-center justify-between px-5 py-3.5 hover:bg-blue-950/20 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-blue-600/10 border border-blue-500/20 flex items-center justify-center">
                    <FileText className="w-4 h-4 text-blue-400" />
                  </div>
                  <div>
                    <div className="text-white text-sm font-medium">{imp.file}</div>
                    <div className="text-slate-500 text-xs">
                      {imp.system} · {imp.rows.toLocaleString()} rows · {imp.time}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${
                    imp.status === 'completed'
                      ? 'text-emerald-400 bg-emerald-400/10 border-emerald-400/25'
                      : 'text-amber-400 bg-amber-400/10 border-amber-400/25'
                  }`}>
                    {imp.status}
                  </span>
                  <button className="w-7 h-7 rounded-lg bg-[#0B1120] border border-blue-900/30 flex items-center justify-center text-slate-500 hover:text-white transition-colors">
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="glass-card rounded-2xl p-5 border border-blue-500/10">
        <h3 className="text-white font-semibold text-sm mb-4">Quick Actions</h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { label: 'Upload Dataset', icon: Upload, href: '/admin/upload', color: 'text-blue-400 bg-blue-400/10' },
            { label: 'Validate Data', icon: CheckCircle2, href: '/admin/validation', color: 'text-emerald-400 bg-emerald-400/10' },
            { label: 'Manage Colleges', icon: Building2, href: '/admin/colleges', color: 'text-cyan-400 bg-cyan-400/10' },
            { label: 'Branch Mapping', icon: GitBranch, href: '/admin/branches', color: 'text-amber-400 bg-amber-400/10' },
          ].map((action) => {
            const Icon = action.icon;
            return (
              <Link key={action.label} href={action.href}>
                <motion.div
                  whileHover={{ y: -2 }}
                  className="flex items-center gap-3 px-4 py-3 rounded-xl bg-[#0B1120] border border-blue-900/30 hover:border-blue-500/30 transition-all cursor-pointer"
                >
                  <div className={`w-9 h-9 rounded-lg ${action.color} border border-blue-500/15 flex items-center justify-center`}>
                    <Icon className="w-4 h-4" />
                  </div>
                  <span className="text-white text-sm font-medium">{action.label}</span>
                </motion.div>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}

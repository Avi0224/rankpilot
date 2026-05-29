'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import Navbar from '@/components/landing/Navbar';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  ScatterChart, Scatter, LineChart, Line, Legend
} from 'recharts';
import { TrendingUp, DollarSign, BarChart3, Filter } from 'lucide-react';

const roiData = [
  { name: 'NIT Trichy', roi: 8.7, fees: 1.45, avgPkg: 12.5, type: 'NIT' },
  { name: 'DTU', roi: 8.4, fees: 1.70, avgPkg: 11.0, type: 'State' },
  { name: 'NIT Warangal', roi: 8.6, fees: 1.48, avgPkg: 11.5, type: 'NIT' },
  { name: 'NIT Surathkal', roi: 8.5, fees: 1.51, avgPkg: 11.8, type: 'NIT' },
  { name: 'NIT Calicut', roi: 8.4, fees: 1.48, avgPkg: 11.0, type: 'NIT' },
  { name: 'IIIT Allahabad', roi: 7.8, fees: 2.20, avgPkg: 10.5, type: 'IIIT' },
  { name: 'NIT Rourkela', roi: 8.3, fees: 1.42, avgPkg: 10.5, type: 'NIT' },
  { name: 'IIIT Hyderabad', roi: 7.5, fees: 3.20, avgPkg: 14.0, type: 'IIIT' },
  { name: 'BITS Pilani', roi: 6.8, fees: 5.20, avgPkg: 18.0, type: 'GFTIs' },
  { name: 'MANIT Bhopal', roi: 7.9, fees: 1.40, avgPkg: 9.2, type: 'NIT' },
  { name: 'VNIT Nagpur', roi: 8.0, fees: 1.43, avgPkg: 9.5, type: 'NIT' },
  { name: 'NSUT Delhi', roi: 8.0, fees: 1.60, avgPkg: 9.8, type: 'State' },
];

const branchSalary = [
  { branch: 'CS/IT', salary: 18.5, growth: 12 },
  { branch: 'Data Science', salary: 16.2, growth: 18 },
  { branch: 'ECE', salary: 11.8, growth: 8 },
  { branch: 'EE', salary: 9.5, growth: 6 },
  { branch: 'Mech', salary: 8.2, growth: 5 },
  { branch: 'Civil', salary: 7.0, growth: 4 },
  { branch: 'Chemical', salary: 9.2, growth: 7 },
  { branch: 'Aerospace', salary: 8.8, growth: 6 },
];

const affordability = [
  { college: 'NIT Rourkela', total4yr: 9.28, medianPkg: 7.5, ratio: 0.81 },
  { college: 'NIT Warangal', total4yr: 9.20, medianPkg: 8.0, ratio: 0.87 },
  { college: 'NIT Trichy', total4yr: 9.20, medianPkg: 8.5, ratio: 0.92 },
  { college: 'NIT Surathkal', total4yr: 9.56, medianPkg: 8.2, ratio: 0.86 },
  { college: 'DTU', total4yr: 9.68, medianPkg: 7.8, ratio: 0.81 },
  { college: 'IIIT Allahabad', total4yr: 12.4, medianPkg: 7.5, ratio: 0.60 },
  { college: 'IIIT Hyderabad', total4yr: 17.2, medianPkg: 11.0, ratio: 0.64 },
  { college: 'BITS Pilani', total4yr: 26.0, medianPkg: 14.0, ratio: 0.54 },
];

const customTooltipStyle = {
  contentStyle: { background: '#0B1120', border: '1px solid #1e3a5f', borderRadius: 8, color: '#e2e8f0', fontSize: 12 },
};

export default function ROIPage() {
  const [typeFilter, setTypeFilter] = useState<string>('All');
  const types = ['All', 'NIT', 'IIIT', 'State', 'GFTIs'];

  const filtered = typeFilter === 'All' ? roiData : roiData.filter((d) => d.type === typeFilter);

  return (
    <div className="min-h-screen bg-[#050816]">
      <Navbar />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-16">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-white mb-2">ROI Analytics</h1>
            <p className="text-slate-500">Compare return on investment across colleges — fees vs. placements vs. career outcomes.</p>
          </div>

          {/* Summary cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            {[
              { label: 'Best ROI College', value: 'NIT Trichy', sub: 'Score: 8.7/10', icon: TrendingUp, color: 'text-emerald-400' },
              { label: 'Best Value (Fees)', value: 'NIT Rourkela', sub: '₹1.42L/yr', icon: DollarSign, color: 'text-blue-400' },
              { label: 'Highest Placement', value: 'IIIT Hyderabad', sub: '95.5% placed', icon: BarChart3, color: 'text-cyan-400' },
              { label: 'Best CSE Package', value: 'BITS Pilani', sub: '₹18L avg', icon: TrendingUp, color: 'text-amber-400' },
            ].map((card) => {
              const Icon = card.icon;
              return (
                <div key={card.label} className="glass-card rounded-xl p-4 border border-blue-500/10">
                  <Icon className={`w-4 h-4 ${card.color} mb-2`} />
                  <div className="text-white font-bold text-sm">{card.value}</div>
                  <div className="text-slate-500 text-xs">{card.label}</div>
                  <div className={`text-xs font-medium mt-0.5 ${card.color}`}>{card.sub}</div>
                </div>
              );
            })}
          </div>

          {/* Filter */}
          <div className="flex items-center gap-2 mb-6">
            <Filter className="w-4 h-4 text-slate-500" />
            {types.map((t) => (
              <button
                key={t}
                onClick={() => setTypeFilter(t)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${
                  typeFilter === t
                    ? 'bg-blue-600/25 border-blue-500/40 text-blue-300'
                    : 'bg-[#0B1120] border-blue-900/30 text-slate-500 hover:text-slate-300'
                }`}
              >
                {t}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            {/* ROI Score */}
            <div className="glass-card rounded-2xl p-6 border border-blue-500/10">
              <h3 className="text-white font-semibold mb-4 text-sm">ROI Score by College</h3>
              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={filtered} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" horizontal={false} />
                    <XAxis type="number" domain={[0, 10]} stroke="#475569" tick={{ fill: '#64748b', fontSize: 11 }} />
                    <YAxis type="category" dataKey="name" width={110} stroke="#475569" tick={{ fill: '#94a3b8', fontSize: 11 }} />
                    <Tooltip {...customTooltipStyle} />
                    <Bar dataKey="roi" fill="#3B82F6" radius={[0, 4, 4, 0]} name="ROI Score" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Fees vs Package scatter */}
            <div className="glass-card rounded-2xl p-6 border border-blue-500/10">
              <h3 className="text-white font-semibold mb-4 text-sm">Fees vs. Avg Package (LPA)</h3>
              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <ScatterChart>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                    <XAxis dataKey="fees" name="Annual Fees (L)" stroke="#475569" tick={{ fill: '#64748b', fontSize: 11 }} label={{ value: 'Fees (L/yr)', position: 'insideBottom', offset: -4, fill: '#64748b', fontSize: 11 }} />
                    <YAxis dataKey="avgPkg" name="Avg Package" stroke="#475569" tick={{ fill: '#64748b', fontSize: 11 }} label={{ value: 'Avg Pkg (LPA)', angle: -90, position: 'insideLeft', fill: '#64748b', fontSize: 11 }} />
                    <Tooltip cursor={{ strokeDasharray: '3 3' }} {...customTooltipStyle} />
                    <Scatter data={filtered} fill="#3B82F6" />
                  </ScatterChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Branch salary */}
            <div className="glass-card rounded-2xl p-6 border border-blue-500/10">
              <h3 className="text-white font-semibold mb-4 text-sm">Avg Starting Salary by Branch (LPA)</h3>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={branchSalary}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                    <XAxis dataKey="branch" stroke="#475569" tick={{ fill: '#64748b', fontSize: 10 }} />
                    <YAxis stroke="#475569" tick={{ fill: '#64748b', fontSize: 11 }} />
                    <Tooltip {...customTooltipStyle} />
                    <Bar dataKey="salary" fill="#06B6D4" radius={[4, 4, 0, 0]} name="Avg Salary (LPA)" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Affordability table */}
            <div className="glass-card rounded-2xl p-6 border border-blue-500/10">
              <h3 className="text-white font-semibold mb-4 text-sm">Affordability Index (Median Pkg / 4yr Cost)</h3>
              <div className="space-y-3">
                {affordability.sort((a, b) => b.ratio - a.ratio).map((item) => (
                  <div key={item.college} className="flex items-center gap-3">
                    <span className="text-slate-400 text-xs w-32 flex-shrink-0">{item.college}</span>
                    <div className="flex-1 h-2 bg-blue-900/30 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-blue-600 to-cyan-500"
                        style={{ width: `${(item.ratio / 1.0) * 100}%` }}
                      />
                    </div>
                    <span className="text-white text-xs font-semibold w-10 text-right">{item.ratio.toFixed(2)}x</span>
                  </div>
                ))}
              </div>
              <p className="text-slate-600 text-xs mt-3">Higher = better value per rupee invested</p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

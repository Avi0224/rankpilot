'use client';

import { motion } from 'framer-motion';
import { GitCompare, Check, TrendingUp, DollarSign, Award } from 'lucide-react';

const mockColleges = [
  {
    name: 'NIT Trichy',
    type: 'NIT',
    rank: 9,
    pkg: '12.5 LPA',
    fees: '1.8L',
    isBest: true,
  },
  {
    name: 'NIT Surathkal',
    type: 'NIT',
    rank: 12,
    pkg: '11.8 LPA',
    fees: '1.9L',
    isBest: false,
  },
  {
    name: 'NIT Warangal',
    type: 'NIT',
    rank: 21,
    pkg: '11.5 LPA',
    fees: '1.8L',
    isBest: false,
  }
];

export default function ComparisonPreview() {
  return (
    <section className="py-24 bg-[#050816] relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-6 relative z-10">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-bold uppercase tracking-widest mb-6"
          >
            <GitCompare className="w-3.5 h-3.5" />
            Comparison Engine
          </motion.div>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-4xl md:text-5xl font-black text-white mb-6 tracking-tight"
          >
            Make Informed <span className="gradient-text">Decisions</span>
          </motion.h2>
          <p className="text-slate-400 text-lg leading-relaxed">
            Compare colleges side-by-side on metrics that matter most. From placements to ROI, see the full picture before you choose.
          </p>
        </div>

        <div className="relative">
          {/* Decorative background glow */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-blue-600/5 blur-[120px] rounded-full pointer-events-none" />
          
          <div className="overflow-x-auto pb-8 scrollbar-none">
            <div className="min-w-[800px] glass-card rounded-[2.5rem] border border-blue-500/15 overflow-hidden shadow-2xl">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-blue-500/10">
                    <th className="px-8 py-10 text-left">
                      <div className="text-xs font-bold text-blue-500 uppercase tracking-[0.2em]">Metric</div>
                    </th>
                    {mockColleges.map((col, i) => (
                      <th key={i} className="px-8 py-10 text-center border-l border-blue-500/10">
                        <div className="text-white font-bold text-lg mb-1">{col.name}</div>
                        <div className="text-slate-500 text-xs uppercase tracking-widest font-bold">{col.type}</div>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-blue-500/5">
                  {[
                    { label: 'NIRF Ranking', key: 'rank', icon: Award, format: (v: any) => `#${v}` },
                    { label: 'Avg Placement', key: 'pkg', icon: TrendingUp, format: (v: any) => v },
                    { label: 'Yearly Fees', key: 'fees', icon: DollarSign, format: (v: any) => v },
                  ].map((metric, i) => (
                    <tr key={i} className="hover:bg-blue-500/5 transition-colors group">
                      <td className="px-8 py-6">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center">
                            <metric.icon className="w-4 h-4 text-blue-400" />
                          </div>
                          <span className="text-slate-300 font-bold text-sm">{metric.label}</span>
                        </div>
                      </td>
                      {mockColleges.map((col, j) => (
                        <td key={j} className="px-8 py-6 text-center border-l border-blue-500/5">
                          <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl transition-all ${col.isBest && i === 1 ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'text-slate-400'}`}>
                            {col.isBest && i === 1 && <Check className="w-3.5 h-3.5" />}
                            <span className="font-bold text-sm">{(col as any)[metric.key]}</span>
                          </div>
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

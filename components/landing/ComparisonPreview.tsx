'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowUpDown, ExternalLink } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

const colleges = [
  {
    name: 'NIT Trichy',
    type: 'NIT',
    nirfRank: 9,
    avgPackage: '12.5 LPA',
    medianPackage: '8.5 LPA',
    closingRank: '4,850',
    fees: '1.45 L/yr',
    hostelFees: '85K/yr',
    roiScore: 8.7,
    placement: '94.5%',
  },
  {
    name: 'DTU Delhi',
    type: 'State',
    nirfRank: 36,
    avgPackage: '11.0 LPA',
    medianPackage: '7.8 LPA',
    closingRank: '3,200',
    fees: '1.70 L/yr',
    hostelFees: '72K/yr',
    roiScore: 8.4,
    placement: '92.0%',
  },
  {
    name: 'IIIT Allahabad',
    type: 'IIIT',
    nirfRank: 52,
    avgPackage: '10.5 LPA',
    medianPackage: '7.5 LPA',
    closingRank: '9,800',
    fees: '2.20 L/yr',
    hostelFees: '90K/yr',
    roiScore: 7.8,
    placement: '91.0%',
  },
  {
    name: 'NIT Surathkal',
    type: 'NIT',
    nirfRank: 16,
    avgPackage: '11.8 LPA',
    medianPackage: '8.2 LPA',
    closingRank: '7,900',
    fees: '1.51 L/yr',
    hostelFees: '88K/yr',
    roiScore: 8.5,
    placement: '93.5%',
  },
];

const metrics = [
  { key: 'nirfRank', label: 'NIRF Rank', sortable: true },
  { key: 'avgPackage', label: 'Avg Package', sortable: true },
  { key: 'medianPackage', label: 'Median Package', sortable: true },
  { key: 'closingRank', label: 'Closing Rank (CSE)', sortable: true },
  { key: 'fees', label: 'Annual Fees', sortable: false },
  { key: 'hostelFees', label: 'Hostel Fees', sortable: false },
  { key: 'roiScore', label: 'ROI Score', sortable: true },
  { key: 'placement', label: 'Placement %', sortable: true },
];

const typeColors: Record<string, string> = {
  NIT: 'text-blue-400 bg-blue-400/10 border-blue-400/25',
  IIIT: 'text-cyan-400 bg-cyan-400/10 border-cyan-400/25',
  State: 'text-teal-400 bg-teal-400/10 border-teal-400/25',
};

export default function ComparisonPreview() {
  const [hoveredCol, setHoveredCol] = useState<number | null>(null);

  return (
    <section className="py-20 px-4 sm:px-6 lg:px-8 relative">
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-blue-950/5 to-transparent pointer-events-none" />

      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.4 }}
          className="text-center mb-10"
        >
          <p className="text-blue-400 text-xs font-medium uppercase tracking-widest mb-2">Side-by-Side</p>
          <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight mb-2">
            Compare Colleges <span className="gradient-text">Instantly</span>
          </h2>
          <p className="text-slate-400 text-sm max-w-lg mx-auto">
            Stop guessing. See fees, placements, ROI, and cutoffs in one table.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.4 }}
          className="overflow-x-auto rounded-xl border border-blue-500/15 shadow-xl shadow-blue-900/20"
        >
          <table className="w-full min-w-[700px]">
            <thead>
              <tr className="border-b border-blue-900/30 bg-[#070d1a]">
                <th className="text-left text-xs text-slate-500 font-medium uppercase tracking-wider px-4 py-3 w-36">
                  Metric
                </th>
                {colleges.map((college, i) => (
                  <th
                    key={college.name}
                    className={`px-3 py-3 text-center transition-colors cursor-pointer ${
                      hoveredCol === i ? 'bg-blue-600/10' : ''
                    }`}
                    onMouseEnter={() => setHoveredCol(i)}
                    onMouseLeave={() => setHoveredCol(null)}
                  >
                    <div>
                      <div className="text-white font-semibold text-sm">{college.name}</div>
                      <div className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold border mt-1 ${typeColors[college.type]}`}>
                        {college.type}
                      </div>
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-blue-900/20 bg-[#080e1d]">
              {metrics.map((metric, mi) => (
                <tr key={metric.key} className="hover:bg-blue-950/20 transition-colors">
                  <td className="px-4 py-3 text-slate-500 text-xs font-medium">
                    <div className="flex items-center gap-1.5">
                      {metric.label}
                      {metric.sortable && <ArrowUpDown className="w-3 h-3 opacity-40" />}
                    </div>
                  </td>
                  {colleges.map((college, ci) => {
                    const val = college[metric.key as keyof typeof college];
                    const isROI = metric.key === 'roiScore';
                    const roiNum = isROI ? Number(val) : 0;

                    return (
                      <td
                        key={`${college.name}-${metric.key}`}
                        className={`px-3 py-3 text-center transition-colors ${
                          hoveredCol === ci ? 'bg-blue-600/8' : ''
                        }`}
                      >
                        {isROI ? (
                          <div className="flex flex-col items-center gap-1">
                            <span className="text-white font-semibold text-sm">{val}</span>
                            <div className="w-14 h-1.5 rounded-full bg-blue-900/50 overflow-hidden">
                              <div
                                className="h-full rounded-full bg-gradient-to-r from-blue-600 to-blue-400"
                                style={{ width: `${(roiNum / 10) * 100}%` }}
                              />
                            </div>
                          </div>
                        ) : (
                          <span className="text-slate-300 text-sm font-medium">{val}</span>
                        )}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.3 }}
          className="text-center mt-6"
        >
          <Link href="/compare">
            <Button className="bg-blue-600/20 hover:bg-blue-600/30 text-blue-300 border border-blue-500/30 hover:border-blue-500/50 transition-all gap-2 h-9 text-sm">
              Open Full Comparison Tool
              <ExternalLink className="w-4 h-4" />
            </Button>
          </Link>
        </motion.div>
      </div>
    </section>
  );
}

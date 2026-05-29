'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Plus, X, TrendingUp, Award, DollarSign, Home, Users, BarChart3, Star } from 'lucide-react';
import Navbar from '@/components/landing/Navbar';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

const allColleges = [
  { id: '11111111', name: 'NIT Trichy', type: 'NIT', state: 'Tamil Nadu', nirfRank: 9, avgPkg: 12.5, medianPkg: 8.5, highestPkg: 50, fees: 1.45, hostelFees: 0.85, placement: 94.5, roiScore: 8.7, closingRank: 4850 },
  { id: '22222222', name: 'DTU Delhi', type: 'State', state: 'Delhi', nirfRank: 36, avgPkg: 11.0, medianPkg: 7.8, highestPkg: 45, fees: 1.70, hostelFees: 0.72, placement: 92.0, roiScore: 8.4, closingRank: 3200 },
  { id: '33333333', name: 'IIIT Allahabad', type: 'IIIT', state: 'UP', nirfRank: 52, avgPkg: 10.5, medianPkg: 7.5, highestPkg: 40, fees: 2.20, hostelFees: 0.90, placement: 91.0, roiScore: 7.8, closingRank: 9800 },
  { id: '44444444', name: 'NIT Surathkal', type: 'NIT', state: 'Karnataka', nirfRank: 16, avgPkg: 11.8, medianPkg: 8.2, highestPkg: 48, fees: 1.51, hostelFees: 0.88, placement: 93.5, roiScore: 8.5, closingRank: 7900 },
  { id: '55555555', name: 'NIT Warangal', type: 'NIT', state: 'Telangana', nirfRank: 26, avgPkg: 11.5, medianPkg: 8.0, highestPkg: 42, fees: 1.48, hostelFees: 0.82, placement: 93.0, roiScore: 8.6, closingRank: 7200 },
  { id: '77777777', name: 'IIIT Hyderabad', type: 'IIIT', state: 'Telangana', nirfRank: 26, avgPkg: 14.0, medianPkg: 11.0, highestPkg: 60, fees: 3.20, hostelFees: 1.10, placement: 95.5, roiScore: 7.5, closingRank: 2100 },
];

const typeColors: Record<string, string> = {
  NIT: 'text-blue-400 bg-blue-400/10 border-blue-400/25',
  IIIT: 'text-cyan-400 bg-cyan-400/10 border-cyan-400/25',
  State: 'text-teal-400 bg-teal-400/10 border-teal-400/25',
};

const metrics = [
  { key: 'nirfRank', label: 'NIRF Rank', icon: Award, format: (v: number) => `#${v}`, lowerIsBetter: true },
  { key: 'closingRank', label: 'JEE Closing Rank', icon: BarChart3, format: (v: number) => v.toLocaleString(), lowerIsBetter: true },
  { key: 'avgPkg', label: 'Avg Package', icon: TrendingUp, format: (v: number) => `₹${v} LPA`, lowerIsBetter: false },
  { key: 'medianPkg', label: 'Median Package', icon: TrendingUp, format: (v: number) => `₹${v} LPA`, lowerIsBetter: false },
  { key: 'highestPkg', label: 'Highest Package', icon: Star, format: (v: number) => `₹${v} LPA`, lowerIsBetter: false },
  { key: 'fees', label: 'Annual Fees', icon: DollarSign, format: (v: number) => `₹${v}L/yr`, lowerIsBetter: true },
  { key: 'hostelFees', label: 'Hostel Fees', icon: Home, format: (v: number) => `₹${v}L/yr`, lowerIsBetter: true },
  { key: 'placement', label: 'Placement %', icon: Users, format: (v: number) => `${v}%`, lowerIsBetter: false },
  { key: 'roiScore', label: 'ROI Score', icon: BarChart3, format: (v: number) => `${v}/10`, lowerIsBetter: false },
];

export default function ComparePage() {
  const [selected, setSelected] = useState([allColleges[0], allColleges[1], allColleges[3]]);
  const [showPicker, setShowPicker] = useState(false);

  const add = (college: typeof allColleges[0]) => {
    if (selected.length < 4 && !selected.find((c) => c.id === college.id)) {
      setSelected([...selected, college]);
    }
    setShowPicker(false);
  };

  const remove = (id: string) => setSelected(selected.filter((c) => c.id !== id));

  const getBest = (key: string, lowerIsBetter: boolean) => {
    const vals = selected.map((c) => Number(c[key as keyof typeof c]));
    return lowerIsBetter ? Math.min(...vals) : Math.max(...vals);
  };

  return (
    <div className="min-h-screen bg-[#050816]">
      <Navbar />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-16">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-white mb-2">College Comparison</h1>
            <p className="text-slate-500">Compare up to 4 colleges side-by-side across key metrics.</p>
          </div>

          {/* College selector chips */}
          <div className="flex flex-wrap gap-3 mb-8">
            {selected.map((college) => (
              <div key={college.id} className="flex items-center gap-2 px-4 py-2 glass-card rounded-xl border border-blue-500/20">
                <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded border ${typeColors[college.type]}`}>{college.type}</span>
                <span className="text-white text-sm font-medium">{college.name}</span>
                <button onClick={() => remove(college.id)} className="text-slate-500 hover:text-red-400 ml-1 transition-colors">
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}

            {selected.length < 4 && (
              <button
                onClick={() => setShowPicker(true)}
                className="flex items-center gap-2 px-4 py-2 rounded-xl border border-dashed border-blue-500/30 text-blue-400/60 hover:text-blue-400 hover:border-blue-500/50 text-sm transition-all"
              >
                <Plus className="w-4 h-4" />
                Add College
              </button>
            )}
          </div>

          {/* College picker dropdown */}
          {showPicker && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              className="glass-card rounded-2xl border border-blue-500/20 p-4 mb-6 grid grid-cols-2 sm:grid-cols-3 gap-3"
            >
              {allColleges
                .filter((c) => !selected.find((s) => s.id === c.id))
                .map((college) => (
                  <button
                    key={college.id}
                    onClick={() => add(college)}
                    className="flex flex-col items-start p-3 rounded-xl bg-[#0B1120] border border-blue-900/30 hover:border-blue-500/40 text-left transition-all"
                  >
                    <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded border mb-1.5 ${typeColors[college.type]}`}>{college.type}</span>
                    <span className="text-white text-xs font-medium">{college.name}</span>
                    <span className="text-slate-500 text-[10px]">{college.state}</span>
                  </button>
                ))}
              <button onClick={() => setShowPicker(false)} className="col-span-full text-slate-500 text-xs hover:text-slate-300 mt-1 transition-colors">
                Cancel
              </button>
            </motion.div>
          )}

          {/* Comparison table */}
          <div className="overflow-x-auto rounded-2xl border border-blue-500/15 shadow-xl">
            <table className="w-full min-w-[600px]">
              <thead>
                <tr className="border-b border-blue-900/30 bg-[#070d1a]">
                  <th className="text-left text-xs text-slate-500 font-medium uppercase tracking-wider px-6 py-4 w-44">Metric</th>
                  {selected.map((college) => (
                    <th key={college.id} className="px-4 py-4 text-center">
                      <div className="text-white font-semibold text-sm">{college.name}</div>
                      <div className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold border mt-1 ${typeColors[college.type]}`}>
                        {college.type} · {college.state}
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-blue-900/20 bg-[#080e1d]">
                {metrics.map((metric) => {
                  const best = getBest(metric.key, metric.lowerIsBetter);
                  const Icon = metric.icon;
                  return (
                    <tr key={metric.key} className="hover:bg-blue-950/20 transition-colors">
                      <td className="px-6 py-4 text-slate-500 text-xs font-medium">
                        <div className="flex items-center gap-2">
                          <Icon className="w-3.5 h-3.5 text-slate-600" />
                          {metric.label}
                        </div>
                      </td>
                      {selected.map((college) => {
                        const val = Number(college[metric.key as keyof typeof college]);
                        const isBest = val === best;
                        return (
                          <td key={college.id} className="px-4 py-4 text-center">
                            <span className={`text-sm font-semibold px-2 py-0.5 rounded-lg transition-colors ${
                              isBest
                                ? 'text-emerald-400 bg-emerald-400/10 border border-emerald-400/20'
                                : 'text-slate-300'
                            }`}>
                              {metric.format(val)}
                            </span>
                          </td>
                        );
                      })}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <p className="text-slate-600 text-xs mt-3 text-center">
            Highlighted values indicate the best in each metric across selected colleges.
          </p>

          {/* CTA */}
          <div className="flex justify-center mt-8 gap-4">
            <Link href="/dashboard">
              <Button className="bg-blue-600 hover:bg-blue-500 text-white gap-2">
                Predict My Colleges
              </Button>
            </Link>
            <Link href="/choice-filling">
              <Button variant="outline" className="border-blue-500/30 text-slate-300 hover:text-white gap-2">
                Build Choice List
              </Button>
            </Link>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

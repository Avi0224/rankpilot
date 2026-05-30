'use client';

export const dynamic = 'force-dynamic';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, DollarSign, BarChart3, ArrowUpDown, Info } from 'lucide-react';
import { getColleges } from '@/services/api';
import { type College } from '@/types';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/utils';

type SortKey = 'roi' | 'fees' | 'package';

export default function ROIPage() {
  const [colleges, setColleges] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState<SortKey>('roi');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await getColleges();
        if (data) {
          const processed = data.map((c: any) => {
            const avgPkg = c.avg_package || 0;
            const totalFees = (c.fees_per_year || 0) * 4;
            // ROI Score = (Average Package / Total Fees) * scaling factor (10)
            const roiScore = totalFees > 0 ? (avgPkg / (totalFees / 100000)) * 10 : 0;
            
            return {
              ...c,
              totalFees,
              roiScore: parseFloat(roiScore.toFixed(2))
            };
          });
          setColleges(processed);
        }
      } catch (err) {
        console.error('Failed to fetch ROI data');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const sortedColleges = [...colleges].sort((a, b) => {
    if (sortBy === 'roi') return b.roiScore - a.roiScore;
    if (sortBy === 'fees') return a.fees_per_year - b.fees_per_year;
    if (sortBy === 'package') return b.avg_package - a.avg_package;
    return 0;
  });

  return (
    <div className="p-4 md:p-8 space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white mb-1">ROI Analytics</h1>
          <p className="text-slate-500 text-sm">Value-for-money rankings based on placement data and fee structures.</p>
        </div>

        <div className="flex items-center gap-2 bg-[#0B1120] border border-blue-900/30 p-1 rounded-xl">
          {[
            { label: 'Highest ROI', value: 'roi' },
            { label: 'Lowest Fees', value: 'fees' },
            { label: 'Best Package', value: 'package' },
          ].map((opt) => (
            <button
              key={opt.value}
              onClick={() => setSortBy(opt.value as SortKey)}
              className={cn(
                "px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all",
                sortBy === opt.value 
                  ? "bg-blue-600 text-white shadow-lg shadow-blue-600/20" 
                  : "text-slate-500 hover:text-slate-300"
              )}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {loading ? (
          Array(6).fill(0).map((_, i) => (
            <div key={i} className="glass-card rounded-2xl p-5 border border-blue-900/20 flex items-center gap-6">
              <Skeleton className="w-12 h-12 rounded-xl bg-blue-900/20" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-5 w-48 bg-blue-900/20" />
                <Skeleton className="h-4 w-32 bg-blue-900/10" />
              </div>
              <Skeleton className="w-24 h-10 rounded-xl bg-blue-900/20" />
            </div>
          ))
        ) : (
          sortedColleges.map((college, index) => (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              key={college.id}
              className="glass-card rounded-2xl p-5 border border-blue-900/20 hover:border-blue-500/30 transition-all group"
            >
              <div className="flex flex-col md:flex-row md:items-center gap-6">
                <div className="flex items-center gap-4 flex-1">
                  <div className="w-12 h-12 rounded-xl bg-blue-600/10 border border-blue-500/20 flex items-center justify-center text-blue-400 font-black text-lg">
                    {index + 1}
                  </div>
                  <div>
                    <h2 className="text-white font-bold text-lg group-hover:text-blue-400 transition-colors">
                      {college.name}
                    </h2>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge variant="outline" className="text-[9px] uppercase tracking-tighter border-blue-900/50 text-slate-400">
                        {college.type}
                      </Badge>
                      <span className="text-slate-500 text-[10px] font-bold uppercase tracking-widest">
                        {college.city}, {college.state}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-8 md:gap-12">
                  <div className="space-y-1">
                    <div className="text-slate-500 text-[9px] font-bold uppercase tracking-widest flex items-center gap-1.5">
                      <TrendingUp className="w-3 h-3" />
                      ROI Score
                    </div>
                    <div className="text-emerald-400 font-black text-xl">
                      {college.roiScore}
                      <span className="text-[10px] ml-0.5 opacity-60">/10</span>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <div className="text-slate-500 text-[9px] font-bold uppercase tracking-widest flex items-center gap-1.5">
                      <DollarSign className="w-3 h-3" />
                      Annual Fees
                    </div>
                    <div className="text-white font-bold text-lg">
                      ₹{(college.fees_per_year / 100000).toFixed(2)}L
                    </div>
                  </div>

                  <div className="space-y-1 hidden sm:block">
                    <div className="text-slate-500 text-[9px] font-bold uppercase tracking-widest flex items-center gap-1.5">
                      <BarChart3 className="w-3 h-3" />
                      Avg Package
                    </div>
                    <div className="text-white font-bold text-lg">
                      ₹{college.avg_package}L
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          ))
        )}
      </div>

      <div className="bg-blue-600/5 border border-blue-500/10 rounded-2xl p-4 flex gap-4">
        <Info className="w-5 h-5 text-blue-400 shrink-0" />
        <p className="text-slate-500 text-xs leading-relaxed">
          The <span className="text-blue-400 font-bold">ROI Score</span> is calculated by dividing the average annual placement package by the total estimated 4-year tuition fees. A higher score indicates better financial returns on your education investment.
        </p>
      </div>
    </div>
  );
}


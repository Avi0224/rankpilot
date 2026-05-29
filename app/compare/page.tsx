'use client';

import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Plus, X, TrendingUp, Award, DollarSign, Home, Users, 
  BarChart3, Star, MapPin, Building2, ExternalLink, ArrowLeft, Trash2, GitCompare
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { useCompare } from '@/hooks/use-compare';
import { getCollegesByIds } from '@/lib/queries';
import { type College } from '@/lib/types';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

const typeColors: Record<string, string> = {
  NIT: 'text-blue-400 bg-blue-400/10 border-blue-400/25',
  IIIT: 'text-cyan-400 bg-cyan-400/10 border-cyan-400/25',
  IIT: 'text-orange-400 bg-orange-400/10 border-orange-400/25',
  GFTIs: 'text-slate-400 bg-slate-400/10 border-slate-400/25',
  State: 'text-teal-400 bg-teal-400/10 border-teal-400/25',
};

const metrics = [
  { key: 'nirf_rank', label: 'NIRF Rank', icon: Award, format: (v: any) => v ? `#${v}` : 'N/A', lowerIsBetter: true },
  { key: 'avg_package', label: 'Avg Package', icon: TrendingUp, format: (v: any) => v ? `₹${v} LPA` : 'N/A', lowerIsBetter: false },
  { key: 'median_package', label: 'Median Package', icon: BarChart3, format: (v: any) => v ? `₹${v} LPA` : 'N/A', lowerIsBetter: false },
  { key: 'highest_package', label: 'Highest Package', icon: Star, format: (v: any) => v ? `₹${v} LPA` : 'N/A', lowerIsBetter: false },
  { key: 'fees_per_year', label: 'Yearly Fees', icon: DollarSign, format: (v: any) => v ? `₹${(v/100000).toFixed(2)}L` : 'N/A', lowerIsBetter: true },
  { key: 'hostel_fees_per_year', label: 'Hostel Fees', icon: Home, format: (v: any) => v ? `₹${(v/100000).toFixed(2)}L` : 'N/A', lowerIsBetter: true },
  { key: 'placement_percentage', label: 'Placement %', icon: Users, format: (v: any) => v ? `${v}%` : 'N/A', lowerIsBetter: false },
  { key: 'roi_score', label: 'ROI Score', icon: TrendingUp, format: (v: any) => v ? `${v}/10` : 'N/A', lowerIsBetter: false },
  { key: 'campus_size_acres', label: 'Campus Size', icon: Building2, format: (v: any) => v ? `${v} Acres` : 'N/A', lowerIsBetter: false },
  { key: 'established_year', label: 'Established', icon: Award, format: (v: any) => v || 'N/A', lowerIsBetter: true },
];

export default function ComparePage() {
  const { selectedColleges, removeFromCompare, clearCompare } = useCompare();
  const [detailedColleges, setDetailedColleges] = useState<College[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDetails = async () => {
      if (selectedColleges.length === 0) {
        setDetailedColleges([]);
        setLoading(false);
        return;
      }
      setLoading(true);
      try {
        const data = await getCollegesByIds(selectedColleges.map(c => c.id));
        setDetailedColleges(data || []);
      } catch (err) {
        console.error('Failed to fetch college details');
      } finally {
        setLoading(false);
      }
    };
    fetchDetails();
  }, [selectedColleges]);

  const getBestValue = (key: string, lowerIsBetter: boolean) => {
    const vals = detailedColleges
      .map(c => c[key as keyof College])
      .filter(v => v !== null && v !== undefined && typeof v === 'number') as number[];
    
    if (vals.length === 0) return null;
    return lowerIsBetter ? Math.min(...vals) : Math.max(...vals);
  };

  if (selectedColleges.length === 0) {
    return (
      <div className="min-h-screen bg-[#050816] flex items-center justify-center p-6">
        <div className="text-center space-y-6 max-w-md">
          <div className="w-24 h-24 rounded-full bg-blue-600/10 flex items-center justify-center mx-auto border border-blue-500/20">
            <GitCompare className="w-12 h-12 text-blue-500/50" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white mb-2">No Colleges Selected</h1>
            <p className="text-slate-500">Add up to 4 colleges from the predictor to compare them side-by-side.</p>
          </div>
          <Link href="/dashboard">
            <Button className="bg-blue-600 hover:bg-blue-500 text-white rounded-2xl px-8 h-12 font-bold">
              Go to Predictor
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#050816] pb-20">
      {/* Sticky Header */}
      <div className="sticky top-0 z-40 bg-[#060c1a]/80 backdrop-blur-2xl border-b border-blue-900/20 px-4 md:px-8 h-16 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/dashboard">
            <button className="p-2 rounded-xl bg-blue-600/10 text-blue-400 border border-blue-500/20 hover:bg-blue-600/20 transition-all">
              <ArrowLeft className="w-4 h-4" />
            </button>
          </Link>
          <div>
            <h1 className="text-lg font-bold text-white leading-tight">Comparison Matrix</h1>
            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">
              {detailedColleges.length} Institutes Selected
            </p>
          </div>
        </div>

        <Button 
          variant="ghost" 
          onClick={clearCompare}
          className="text-slate-500 hover:text-red-400 gap-2 font-bold text-xs"
        >
          <Trash2 className="w-4 h-4" />
          <span className="hidden sm:inline">Clear All</span>
        </Button>
      </div>

      <div className="max-w-7xl mx-auto p-4 md:p-8">
        <div className="overflow-x-auto rounded-[2rem] border border-blue-900/30 shadow-2xl bg-[#0B1120]/50 backdrop-blur-xl scrollbar-none">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-[#050816]/50">
                <th className="sticky left-0 z-20 bg-[#050816] text-left px-6 py-8 border-r border-blue-900/20 w-48 shrink-0">
                  <div className="text-xs font-bold text-blue-500 uppercase tracking-[0.2em]">Parameter</div>
                </th>
                {loading ? (
                  Array(selectedColleges.length).fill(0).map((_, i) => (
                    <th key={i} className="px-6 py-8 min-w-[280px]">
                      <div className="space-y-3">
                        <Skeleton className="h-6 w-32 bg-blue-900/20 rounded-lg mx-auto" />
                        <Skeleton className="h-4 w-24 bg-blue-900/10 rounded-full mx-auto" />
                      </div>
                    </th>
                  ))
                ) : (
                  detailedColleges.map((college) => (
                    <th key={college.id} className="px-6 py-8 min-w-[280px] border-l border-blue-900/10 group">
                      <div className="relative">
                        <button 
                          onClick={() => removeFromCompare(college.id)}
                          className="absolute -top-4 -right-2 p-1.5 rounded-lg bg-red-500/10 text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                        <Badge className={cn("mb-3 uppercase tracking-tighter text-[9px]", typeColors[college.type])}>
                          {college.type}
                        </Badge>
                        <h2 className="text-white font-bold text-base leading-tight mb-2 line-clamp-2">
                          {college.name}
                        </h2>
                        <div className="flex items-center justify-center gap-1.5 text-slate-500 text-[10px] font-bold uppercase">
                          <MapPin className="w-3 h-3" />
                          {college.city}, {college.state}
                        </div>
                        <Link href={`/college/${college.id}`}>
                          <Button variant="ghost" className="mt-4 h-8 text-[10px] gap-2 text-blue-400 hover:text-white rounded-lg">
                            View Profile <ExternalLink className="w-3 h-3" />
                          </Button>
                        </Link>
                      </div>
                    </th>
                  ))
                )}
              </tr>
            </thead>
            <tbody className="divide-y divide-blue-900/10">
              {metrics.map((metric) => {
                const bestValue = getBestValue(metric.key, metric.lowerIsBetter);
                return (
                  <tr key={metric.key} className="hover:bg-white/[0.02] transition-colors group">
                    <td className="sticky left-0 z-20 bg-[#060c1a] px-6 py-5 border-r border-blue-900/20">
                      <div className="flex items-center gap-3">
                        <div className="w-7 h-7 rounded-lg bg-slate-800/50 flex items-center justify-center">
                          <metric.icon className="w-3.5 h-3.5 text-slate-400" />
                        </div>
                        <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">{metric.label}</span>
                      </div>
                    </td>
                    {detailedColleges.map((college) => {
                      const val = college[metric.key as keyof College];
                      const isBest = val !== null && val !== undefined && val === bestValue;
                      return (
                        <td key={college.id} className="px-6 py-5 text-center border-l border-blue-900/5">
                          <div className={cn(
                            "inline-flex flex-col items-center px-4 py-2 rounded-2xl transition-all duration-500",
                            isBest ? "bg-emerald-500/10 border border-emerald-500/20 scale-105 shadow-lg shadow-emerald-500/5" : ""
                          )}>
                            <span className={cn(
                              "text-sm font-bold",
                              isBest ? "text-emerald-400" : "text-slate-200"
                            )}>
                              {metric.format(val)}
                            </span>
                            {isBest && (
                              <span className="text-[8px] font-black text-emerald-500/80 uppercase tracking-tighter mt-0.5">
                                Best Choice
                              </span>
                            )}
                          </div>
                        </td>
                      );
                    })}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        
        <div className="mt-8 flex flex-col sm:flex-row items-center justify-between gap-6 px-4">
          <div className="flex items-center gap-2 text-slate-500 text-xs">
            <div className="w-3 h-3 rounded bg-emerald-500/20 border border-emerald-500/30" />
            <span>Highlighted metrics represent the superior choice.</span>
          </div>
          <div className="flex gap-4">
            <Link href="/dashboard">
              <Button variant="outline" className="border-blue-900/30 text-slate-300 rounded-2xl h-11 px-6">
                Add More Colleges
              </Button>
            </Link>
            <Button className="bg-blue-600 hover:bg-blue-500 text-white rounded-2xl h-11 px-8 font-bold shadow-lg shadow-blue-600/20">
              Download Report
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

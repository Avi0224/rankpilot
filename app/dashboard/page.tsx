'use client';

import { useState, useCallback, useMemo, memo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search, SlidersHorizontal, ChevronDown, X, BookmarkPlus,
  GitCompare, ExternalLink, MapPin, TrendingUp,
  DollarSign, GraduationCap, BarChart2, Building2, RefreshCw
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import { INDIAN_STATES, BRANCHES, type Category, type College, type Cutoff } from '@/lib/types';

const CATEGORIES: Category[] = ['OPEN', 'OBC-NCL', 'SC', 'ST', 'EWS', 'OPEN-PwD'];

const probabilityConfig = {
  safe: { label: 'Safe', className: 'safe-badge', barColor: 'bg-emerald-400', description: 'High chance of admission' },
  moderate: { label: 'Moderate', className: 'moderate-badge', barColor: 'bg-amber-400', description: 'Borderline — aim here' },
  dream: { label: 'Dream', className: 'dream-badge', barColor: 'bg-red-400', description: 'Stretch — worth trying' },
};

const typeColors: Record<string, string> = {
  NIT: 'text-blue-400 bg-blue-400/10 border-blue-400/20',
  IIIT: 'text-cyan-400 bg-cyan-400/10 border-cyan-400/20',
  State: 'text-teal-400 bg-teal-400/10 border-teal-400/20',
};

// Memoized result card component
const ResultCard = memo(function ResultCard({
  result,
  isSaved,
  onToggleSave,
  index,
}: {
  result: {
    college: College;
    branch: { branch_name: string };
    cutoff: Cutoff;
    probability: 'safe' | 'moderate' | 'dream';
    confidenceScore: number;
  };
  isSaved: boolean;
  onToggleSave: (id: string) => void;
  index: number;
}) {
  const prob = probabilityConfig[result.probability];
  const college = result.college;

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: Math.min(index * 0.05, 0.3) }}
      className="glass-card rounded-2xl p-5 border border-blue-500/10 hover:border-blue-500/25 transition-colors group"
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap mb-1">
            <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${typeColors[college.type]}`}>
              {college.type}
            </span>
            <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${prob.className}`}>
              {prob.label}
            </span>
            {college.nirf_rank && (
              <span className="text-[10px] text-slate-500">NIRF #{college.nirf_rank}</span>
            )}
          </div>
          <h3 className="text-white font-semibold text-sm leading-tight">{college.name}</h3>
          <p className="text-blue-400/70 text-xs mt-0.5 font-medium">{result.branch.branch_name}</p>
        </div>

        <div className="flex flex-col items-center gap-1 ml-4 flex-shrink-0">
          <div className="text-white font-bold text-lg">{result.confidenceScore}%</div>
          <div className="text-slate-600 text-[10px]">confidence</div>
        </div>
      </div>

      {/* Confidence bar */}
      <div className="w-full h-1.5 bg-blue-900/30 rounded-full mb-4 overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${result.confidenceScore}%` }}
          transition={{ duration: 0.6, delay: Math.min(index * 0.05, 0.3) }}
          className={`h-full rounded-full ${prob.barColor}`}
        />
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-3 gap-3 mb-4">
        {[
          { icon: BarChart2, label: 'Closing Rank', value: result.cutoff.closing_rank.toLocaleString() },
          { icon: DollarSign, label: 'Avg Package', value: college.avg_package ? `${college.avg_package}L` : '—' },
          { icon: TrendingUp, label: 'ROI Score', value: college.roi_score ? `${college.roi_score}/10` : '—' },
        ].map((stat) => {
          const Icon = stat.icon;
          return (
            <div key={stat.label} className="bg-[#080f1e] rounded-lg p-2.5 border border-blue-900/20">
              <Icon className="w-3.5 h-3.5 text-blue-400/60 mb-1" />
              <div className="text-white text-xs font-semibold">{stat.value}</div>
              <div className="text-slate-600 text-[10px]">{stat.label}</div>
            </div>
          );
        })}
      </div>

      <div className="flex items-center gap-2">
        <div className="flex items-center gap-1 text-slate-500 text-xs flex-1">
          <MapPin className="w-3 h-3" />
          {college.state}
        </div>
        <div className="flex items-center gap-1 text-slate-500 text-xs">
          <GraduationCap className="w-3 h-3" />
          {college.placement_percentage ? `${college.placement_percentage}%` : '—'} placed
        </div>
      </div>

      <div className="flex gap-2 mt-3 pt-3 border-t border-blue-900/20">
        <Link href={`/college/${college.id}`} className="flex-1">
          <Button variant="ghost" size="sm" className="w-full text-slate-400 hover:text-white text-xs gap-1">
            <ExternalLink className="w-3 h-3" />
            Details
          </Button>
        </Link>
        <Link href={`/compare?ids=${college.id}`} className="flex-1">
          <Button variant="ghost" size="sm" className="w-full text-slate-400 hover:text-white text-xs gap-1">
            <GitCompare className="w-3 h-3" />
            Compare
          </Button>
        </Link>
        <button
          onClick={() => onToggleSave(college.id)}
          className={`flex-1 flex items-center justify-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium transition-all border ${
            isSaved
              ? 'bg-blue-600/25 border-blue-500/40 text-blue-300'
              : 'bg-[#0B1120] border-blue-900/30 text-slate-500 hover:text-slate-300'
          }`}
        >
          <BookmarkPlus className="w-3 h-3" />
          {isSaved ? 'Saved' : 'Save'}
        </button>
      </div>
    </motion.div>
  );
});

// Skeleton loader for results
function ResultSkeleton() {
  return (
    <div className="glass-card rounded-2xl p-5 border border-blue-500/10 animate-pulse">
      <div className="flex gap-2 mb-3">
        <div className="h-5 w-16 bg-slate-700/50 rounded" />
        <div className="h-5 w-20 bg-slate-700/50 rounded" />
      </div>
      <div className="h-4 w-3/4 bg-slate-700/50 rounded mb-2" />
      <div className="h-3 w-1/2 bg-slate-700/50 rounded mb-4" />
      <div className="h-2 w-full bg-slate-700/50 rounded-full mb-4" />
      <div className="grid grid-cols-3 gap-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-16 bg-slate-700/30 rounded" />
        ))}
      </div>
    </div>
  );
}

export default function DashboardPage() {
  const [rank, setRank] = useState('');
  const [category, setCategory] = useState<Category>('OPEN');
  const [homeState, setHomeState] = useState('');
  const [selectedBranches, setSelectedBranches] = useState<string[]>([]);
  const [budget, setBudget] = useState(5);
  const [results, setResults] = useState<Array<{
    college: College;
    branch: { branch_name: string };
    cutoff: Cutoff;
    probability: 'safe' | 'moderate' | 'dream';
    confidenceScore: number;
  }>>([]);
  const [hasResults, setHasResults] = useState(false);
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState<'all' | 'safe' | 'moderate' | 'dream'>('all');
  const [savedIds, setSavedIds] = useState<Set<string>>(new Set());

  // Memoized handlers
  const handlePredict = useCallback(async () => {
    if (!rank) return;
    setLoading(true);

    try {
      // Fetch cutoffs with college and branch data
      const { data: cutoffData, error } = await supabase
        .from('cutoffs')
        .select(`
          *,
          colleges (*),
          branches (*)
        `)
        .eq('category', category)
        .eq('quota', 'AI')
        .gte('closing_rank', Number(rank) * 0.5)
        .lte('closing_rank', Number(rank) * 2)
        .order('closing_rank', { ascending: true })
        .limit(50);

      if (error) throw error;

      if (cutoffData && cutoffData.length > 0) {
        const processedResults = cutoffData.map((item: Record<string, unknown>) => {
          const college = item.colleges as College;
          const branch = item.branches as { branch_name: string };
          const cutoff = {
            id: item.id as string,
            college_id: item.college_id as string,
            branch_id: item.branch_id as string,
            year: item.year as number,
            round: item.round as number,
            category: item.category as Category,
            quota: item.quota as 'AI' | 'HS' | 'OS',
            gender: item.gender as 'Gender-Neutral' | 'Female-only',
            opening_rank: item.opening_rank as number,
            closing_rank: item.closing_rank as number,
            created_at: item.created_at as string,
          };

          const closingRank = cutoff.closing_rank;
          const userRank = Number(rank);

          let probability: 'safe' | 'moderate' | 'dream';
          let confidenceScore: number;

          if (userRank < closingRank * 0.7) {
            probability = 'safe';
            confidenceScore = Math.min(95, Math.round(((closingRank * 0.7 - userRank) / (closingRank * 0.7)) * 10 + 85));
          } else if (userRank < closingRank) {
            probability = 'moderate';
            confidenceScore = Math.round(50 + (closingRank - userRank) / closingRank * 40);
          } else {
            probability = 'dream';
            confidenceScore = Math.max(10, Math.round(50 - (userRank - closingRank) / closingRank * 40));
          }

          return { college, branch, cutoff, probability, confidenceScore };
        });

        setResults(processedResults);
        setHasResults(true);
      }
    } catch (err) {
      console.error('Prediction error:', err);
    } finally {
      setLoading(false);
    }
  }, [rank, category]);

  const toggleBranch = useCallback((branch: string) => {
    setSelectedBranches((prev) =>
      prev.includes(branch) ? prev.filter((b) => b !== branch) : [...prev, branch]
    );
  }, []);

  const toggleSave = useCallback((id: string) => {
    setSavedIds((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }, []);

  // Memoized filtered results
  const filteredResults = useMemo(() => {
    return hasResults
      ? results.filter((r) => filter === 'all' || r.probability === filter)
      : [];
  }, [hasResults, results, filter]);

  // Memoized stats
  const stats = useMemo(() => ({
    total: results.length,
    safe: results.filter((r) => r.probability === 'safe').length,
    moderate: results.filter((r) => r.probability === 'moderate').length,
    dream: results.filter((r) => r.probability === 'dream').length,
  }), [results]);

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Page header */}
      <div>
        <h1 className="text-2xl font-bold text-white">College Predictor</h1>
        <p className="text-slate-500 text-sm mt-1">Enter your JEE Main rank to find colleges you can get into.</p>
      </div>

      {/* Prediction form */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-card rounded-2xl p-6 border border-blue-500/15"
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
          {/* Rank */}
          <div>
            <label className="text-xs text-slate-500 font-medium mb-1.5 block uppercase tracking-wider">JEE Main Rank</label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
              <input
                type="number"
                value={rank}
                onChange={(e) => setRank(e.target.value)}
                placeholder="e.g. 12450"
                className="w-full bg-[#0B1120] border border-blue-900/30 rounded-xl pl-9 pr-4 py-2.5 text-sm text-white placeholder:text-slate-600 focus:outline-none focus:border-blue-500/50 transition-colors"
              />
            </div>
          </div>

          {/* Category */}
          <div>
            <label className="text-xs text-slate-500 font-medium mb-1.5 block uppercase tracking-wider">Category</label>
            <div className="relative">
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as Category)}
                className="w-full bg-[#0B1120] border border-blue-900/30 rounded-xl px-3 py-2.5 text-sm text-white appearance-none focus:outline-none focus:border-blue-500/50 transition-colors"
              >
                {CATEGORIES.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 pointer-events-none" />
            </div>
          </div>

          {/* Home State */}
          <div>
            <label className="text-xs text-slate-500 font-medium mb-1.5 block uppercase tracking-wider">Home State</label>
            <div className="relative">
              <select
                value={homeState}
                onChange={(e) => setHomeState(e.target.value)}
                className="w-full bg-[#0B1120] border border-blue-900/30 rounded-xl px-3 py-2.5 text-sm text-white appearance-none focus:outline-none focus:border-blue-500/50 transition-colors"
              >
                <option value="">All India</option>
                {INDIAN_STATES.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 pointer-events-none" />
            </div>
          </div>

          {/* Budget */}
          <div>
            <label className="text-xs text-slate-500 font-medium mb-1.5 block uppercase tracking-wider">
              Budget — ₹{budget}L/yr
            </label>
            <input
              type="range"
              min={1}
              max={10}
              step={0.5}
              value={budget}
              onChange={(e) => setBudget(Number(e.target.value))}
              className="w-full h-2 rounded-full accent-blue-500 mt-3 cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-slate-600 mt-1">
              <span>₹1L</span><span>₹10L</span>
            </div>
          </div>
        </div>

        {/* Branch chips */}
        <div className="mb-4">
          <label className="text-xs text-slate-500 font-medium mb-2 block uppercase tracking-wider">Preferred Branches</label>
          <div className="flex flex-wrap gap-2">
            {BRANCHES.slice(0, 6).map((b) => (
              <button
                key={b}
                onClick={() => toggleBranch(b)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all border ${
                  selectedBranches.includes(b)
                    ? 'bg-blue-600/30 border-blue-500/50 text-blue-300'
                    : 'bg-[#0B1120] border-blue-900/30 text-slate-500 hover:text-slate-300 hover:border-blue-500/30'
                }`}
              >
                {selectedBranches.includes(b) && <X className="inline w-3 h-3 mr-1" />}
                {b.replace(' and ', ' & ').replace('Engineering', 'Engg.')}
              </button>
            ))}
          </div>
        </div>

        <Button
          onClick={handlePredict}
          disabled={!rank || loading}
          className="bg-blue-600 hover:bg-blue-500 text-white px-8 py-2.5 font-semibold glow-blue-sm disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? (
            <span className="flex items-center gap-2">
              <RefreshCw className="w-4 h-4 animate-spin" />
              Predicting...
            </span>
          ) : (
            <span className="flex items-center gap-2">
              <Search className="w-4 h-4" />
              Predict Colleges
            </span>
          )}
        </Button>
      </motion.div>

      {/* Results */}
      {hasResults && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          {/* Summary stats */}
          <div className="grid grid-cols-4 gap-4 mb-5">
            {[
              { label: 'Total Results', value: stats.total, color: 'text-white' },
              { label: 'Safe Colleges', value: stats.safe, color: 'text-emerald-400' },
              { label: 'Moderate', value: stats.moderate, color: 'text-amber-400' },
              { label: 'Dream Colleges', value: stats.dream, color: 'text-red-400' },
            ].map((stat) => (
              <div key={stat.label} className="glass-card rounded-xl p-4 border border-blue-500/10">
                <div className={`text-2xl font-bold ${stat.color}`}>{stat.value}</div>
                <div className="text-slate-500 text-xs mt-0.5">{stat.label}</div>
              </div>
            ))}
          </div>

          {/* Filter tabs */}
          <div className="flex items-center gap-2 mb-5">
            <SlidersHorizontal className="w-4 h-4 text-slate-500" />
            {(['all', 'safe', 'moderate', 'dream'] as const).map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-4 py-1.5 rounded-lg text-xs font-semibold capitalize transition-all border ${
                  filter === f
                    ? 'bg-blue-600/25 border-blue-500/50 text-blue-300'
                    : 'bg-[#0B1120] border-blue-900/30 text-slate-500 hover:text-slate-300'
                }`}
              >
                {f === 'all' ? `All (${stats.total})` : `${f} (${stats[f as 'safe' | 'moderate' | 'dream']})`}
              </button>
            ))}
          </div>

          {/* Results grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {filteredResults.map((result, i) => (
              <ResultCard
                key={result.college.id + result.branch.branch_name}
                result={result}
                isSaved={savedIds.has(result.college.id)}
                onToggleSave={toggleSave}
                index={i}
              />
            ))}
          </div>
        </motion.div>
      )}

      {/* Loading skeletons */}
      {loading && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <ResultSkeleton key={i} />
          ))}
        </div>
      )}

      {/* Empty state */}
      {!hasResults && !loading && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex flex-col items-center justify-center py-20 text-center"
        >
          <div className="w-20 h-20 rounded-2xl bg-blue-600/10 border border-blue-500/20 flex items-center justify-center mb-5">
            <Building2 className="w-10 h-10 text-blue-400/40" />
          </div>
          <h3 className="text-white font-semibold text-lg mb-2">Enter Your Rank to Begin</h3>
          <p className="text-slate-500 text-sm max-w-sm">
            Fill in your JEE Main rank and preferences above to see personalized college predictions across 500+ institutions.
          </p>
        </motion.div>
      )}
    </div>
  );
}

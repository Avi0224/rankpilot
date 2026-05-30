'use client';

import { useState, useMemo, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search, BookmarkPlus, GitCompare, ExternalLink, RefreshCw, Trophy, TrendingUp,
  Filter, Sparkles, ChevronDown, LayoutGrid, List, SlidersHorizontal, X
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { predictColleges, toggleSaveCollege } from '@/services/api';
import { useAuth } from '@/hooks/use-auth';
import { toast } from 'sonner';
import { type PredictionResult, type Category, type Quota, type Gender, type PredictorParams } from '@/types';
import { CATEGORIES, QUOTAS, GENDERS } from '@/constants';
import { predictorSchema } from '@/utils/validations';
import dynamic from 'next/dynamic';

const PredictionCard = dynamic(() => import('@/components/features/dashboard/PredictionCard'), {
  loading: () => <PredictionSkeleton />
});

const AdvancedFilters = dynamic(() => import('@/components/features/dashboard/AdvancedFilters'), {
  ssr: false
});

const PredictionSkeleton = dynamic(() => import('@/components/features/dashboard/PredictionSkeleton').then(mod => mod.PredictionSkeleton));
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Sheet, SheetContent, SheetTrigger, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { cn } from '@/utils';

export default function DashboardPage() {
  const { user, profile } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<PredictionResult[]>([]);
  const [savedIds, setSavedIds] = useState<Set<string>>(new Set());
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [isFilterDrawerOpen, setIsFilterDrawerOpen] = useState(false);

  // Form State
  const [rank, setRank] = useState(profile?.jee_rank?.toString() || '');
  const [category, setCategory] = useState<Category>((profile?.category as Category) || 'OPEN');
  const [quota, setQuota] = useState<Quota>('AI');
  const [gender, setGender] = useState<Gender>('Gender-Neutral');

  // Advanced Filter State
  const [advancedFilters, setAdvancedFilters] = useState({
    instituteTypes: [],
    states: [],
    branches: [],
  });

  // Sync with URL params on mount
  useEffect(() => {
    const r = searchParams.get('rank');
    const c = searchParams.get('category') as Category;
    const q = searchParams.get('quota') as Quota;
    const g = searchParams.get('gender') as Gender;

    if (r) setRank(r);
    if (c) setCategory(c);
    if (q) setQuota(q);
    if (g) setGender(g);
  }, [searchParams]);

  // Grouped Results
  const groupedResults = useMemo(() => {
    return {
      safe: results.filter(r => r.probability === 'safe'),
      moderate: results.filter(r => r.probability === 'moderate'),
      dream: results.filter(r => r.probability === 'dream'),
    };
  }, [results]);

  const handlePredict = useCallback(async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    
    // Zod Validation
    const validation = predictorSchema.safeParse({
      rank,
      category,
      quota,
      gender,
      ...advancedFilters
    });

    if (!validation.success) {
      toast.error(validation.error.errors[0].message);
      return;
    }

    // Update URL for persistence
    const params = new URLSearchParams();
    params.set('rank', rank);
    params.set('category', category);
    params.set('quota', quota);
    params.set('gender', gender);
    router.push(`?${params.toString()}`, { scroll: false });

    setLoading(true);
    setResults([]);
    
    try {
      const predictorParams: PredictorParams = {
        rank: parseInt(rank),
        category,
        quota,
        gender,
        ...advancedFilters
      };

      const data = await predictColleges(predictorParams);
      setResults([...(data || [])]);
      
      if (data && data.length > 0) {
        toast.success(`Analysis Complete: Found ${data.length} matches`);
      } else {
        toast.info('No matches found for your rank and criteria.');
      }
    } catch (err: any) {
      toast.error(err.message || 'Prediction failed');
    } finally {
      setLoading(false);
      setIsFilterDrawerOpen(false);
    }
  }, [rank, category, quota, gender, advancedFilters, router]);

  const handleToggleSave = useCallback(async (result: PredictionResult) => {
    if (!user) {
      toast.error('Please sign in to save colleges');
      return;
    }
    try {
      const isSaved = await toggleSaveCollege(user.id, result.college_id, result.branch_id || undefined);
      const key = `${result.college_id}-${result.branch_id}`;
      const newSaved = new Set(savedIds);
      if (isSaved) {
        newSaved.add(key);
        toast.success('Saved to your list');
      } else {
        newSaved.delete(key);
        toast.info('Removed from your list');
      }
      setSavedIds(newSaved);
    } catch (err: any) {
      toast.error('Action failed');
    }
  }, [user, savedIds]);

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-8 pb-24 md:pb-8">
      {/* Header Section */}
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center gap-2 text-blue-500 font-semibold text-xs uppercase tracking-widest mb-2"
          >
            <Sparkles className="w-3.5 h-3.5" />
            Rank Analysis Portal
          </motion.div>
          <h1 className="text-3xl font-bold text-white tracking-tight">
            Welcome back, <span className="gradient-text">{profile?.name || user?.email?.split('@')[0] || 'Aspirant'}</span>
          </h1>
          <p className="text-slate-400 text-sm mt-1 max-w-md">
            Your personalized engineering college predictions based on latest JoSAA/CSAB trends.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* Mobile Filter Trigger */}
          <Sheet open={isFilterDrawerOpen} onOpenChange={setIsFilterDrawerOpen}>
            <SheetTrigger asChild>
              <Button variant="outline" className="lg:hidden border-blue-900/30 bg-[#0B1120] text-slate-300 gap-2 h-10 px-4 rounded-xl">
                <SlidersHorizontal className="w-4 h-4" />
                Filters
              </Button>
            </SheetTrigger>
            <SheetContent side="bottom" className="h-[80vh] bg-[#060c1a] border-blue-900/20 rounded-t-[2rem] p-0 overflow-hidden">
              <div className="h-full flex flex-col">
                <div className="p-6 border-b border-blue-900/20 flex items-center justify-between">
                  <SheetHeader>
                    <SheetTitle className="text-white">Adjust Search</SheetTitle>
                  </SheetHeader>
                  <Button variant="ghost" size="icon" onClick={() => setIsFilterDrawerOpen(false)} className="text-slate-400">
                    <X className="w-5 h-5" />
                  </Button>
                </div>
                <div className="flex-1 overflow-y-auto p-6 space-y-8 pb-32">
                  <div className="space-y-6">
                    <h3 className="text-sm font-bold text-blue-400 uppercase tracking-widest">Base Settings</h3>
                    {/* Reusing the form inputs for mobile drawer */}
                    <div className="space-y-4">
                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-slate-500 ml-1 uppercase tracking-wider">JEE Main Rank</label>
                        <input
                          type="number"
                          value={rank}
                          onChange={(e) => setRank(e.target.value)}
                          className="w-full bg-[#050816] border border-blue-900/30 rounded-2xl px-4 py-3 text-sm text-white"
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <select value={category} onChange={(e) => setCategory(e.target.value as Category)} className="w-full bg-[#050816] border border-blue-900/30 rounded-2xl px-4 py-3 text-sm text-white">
                          {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                        </select>
                        <select value={quota} onChange={(e) => setQuota(e.target.value as Quota)} className="w-full bg-[#050816] border border-blue-900/30 rounded-2xl px-4 py-3 text-sm text-white">
                          {QUOTAS.map(q => <option key={q.value} value={q.value}>{q.label}</option>)}
                        </select>
                      </div>
                    </div>
                  </div>
                  <AdvancedFilters onFilterChange={setAdvancedFilters} initialFilters={advancedFilters} />
                </div>
                <div className="absolute bottom-0 inset-x-0 p-6 bg-gradient-to-t from-[#060c1a] via-[#060c1a] to-transparent">
                  <Button onClick={() => handlePredict()} className="w-full bg-blue-600 h-12 rounded-2xl font-bold">
                    Apply & Analyze
                  </Button>
                </div>
              </div>
            </SheetContent>
          </Sheet>

          <div className="bg-[#0B1120] border border-blue-900/30 rounded-xl p-1 flex">
            <button 
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded-lg transition-all ${viewMode === 'grid' ? 'bg-blue-600 text-white' : 'text-slate-500'}`}
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
            <button 
              onClick={() => setViewMode('list')}
              className={`p-2 rounded-lg transition-all ${viewMode === 'list' ? 'bg-blue-600 text-white' : 'text-slate-500'}`}
            >
              <List className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Sticky Predictor Sidebar (Desktop) */}
        <aside className="hidden lg:block lg:col-span-4 space-y-6 lg:sticky lg:top-8">
          <div className="glass-card rounded-3xl p-6 shadow-2xl relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-blue-600/5 blur-3xl rounded-full -mr-16 -mt-16 group-hover:bg-blue-600/10 transition-colors" />
            
            <h2 className="text-lg font-bold text-white mb-6 flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-blue-600/20 flex items-center justify-center">
                <Filter className="w-4 h-4 text-blue-400" />
              </div>
              Prediction Engine
            </h2>
            
            <form onSubmit={handlePredict} className="space-y-6">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-500 ml-1 uppercase tracking-wider">JEE Main Rank</label>
                <div className="relative">
                  <input
                    type="number"
                    placeholder="Enter your CRL Rank"
                    value={rank}
                    onChange={(e) => setRank(e.target.value)}
                    className="w-full bg-[#050816] border border-blue-900/30 rounded-2xl px-4 py-3 text-sm text-white focus:outline-none focus:border-blue-500/50 focus:ring-4 focus:ring-blue-500/5 transition-all"
                  />
                  <div className="absolute right-4 top-1/2 -translate-y-1/2 text-[10px] font-bold text-blue-500/40 uppercase tracking-widest">CRL</div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-500 ml-1 uppercase tracking-wider">Category</label>
                  <div className="relative">
                    <select
                      value={category}
                      onChange={(e) => setCategory(e.target.value as Category)}
                      className="w-full bg-[#050816] border border-blue-900/30 rounded-2xl px-4 py-3 text-sm text-white focus:outline-none focus:border-blue-500/50 appearance-none transition-all"
                    >
                      {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 pointer-events-none" />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-500 ml-1 uppercase tracking-wider">Quota</label>
                  <div className="relative">
                    <select
                      value={quota}
                      onChange={(e) => setQuota(e.target.value as Quota)}
                      className="w-full bg-[#050816] border border-blue-900/30 rounded-2xl px-4 py-3 text-sm text-white focus:outline-none focus:border-blue-500/50 appearance-none transition-all"
                    >
                      {QUOTAS.map(q => <option key={q.value} value={q.value}>{q.label}</option>)}
                    </select>
                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 pointer-events-none" />
                  </div>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-500 ml-1 uppercase tracking-wider">Gender</label>
                <div className="flex p-1 bg-[#050816] rounded-2xl border border-blue-900/30">
                  {GENDERS.map(g => (
                    <button
                      key={g.value}
                      type="button"
                      onClick={() => setGender(g.value)}
                      className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all ${
                        gender === g.value 
                          ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20' 
                          : 'text-slate-500 hover:text-slate-300'
                      }`}
                    >
                      {g.label}
                    </button>
                  ))}
                </div>
              </div>

              <AdvancedFilters onFilterChange={setAdvancedFilters} initialFilters={advancedFilters} />

              <Button
                type="submit"
                disabled={loading}
                className="w-full bg-blue-600 hover:bg-blue-500 text-white h-12 rounded-2xl font-bold shadow-xl shadow-blue-600/20 group transition-all"
              >
                {loading ? (
                  <RefreshCw className="w-5 h-5 animate-spin" />
                ) : (
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 group-hover:rotate-12 transition-transform" />
                    Predict My Future
                  </div>
                )}
              </Button>
            </form>
          </div>
        </aside>

        {/* Results Section */}
        <div className="lg:col-span-8 space-y-6">
          <Tabs defaultValue="all" className="w-full">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-6">
              <TabsList className="bg-[#0B1120] border border-blue-900/30 p-1 rounded-2xl h-auto flex-wrap">
                <TabsTrigger value="all" className="rounded-xl px-4 py-2 text-xs font-bold data-[state=active]:bg-blue-600 data-[state=active]:text-white transition-all">
                  All Matches ({results.length})
                </TabsTrigger>
                <TabsTrigger value="safe" className="rounded-xl px-4 py-2 text-xs font-bold data-[state=active]:bg-emerald-600 data-[state=active]:text-white transition-all">
                  Safe ({groupedResults.safe.length})
                </TabsTrigger>
                <TabsTrigger value="moderate" className="rounded-xl px-4 py-2 text-xs font-bold data-[state=active]:bg-amber-600 data-[state=active]:text-white transition-all">
                  Moderate ({groupedResults.moderate.length})
                </TabsTrigger>
                <TabsTrigger value="dream" className="rounded-xl px-4 py-2 text-xs font-bold data-[state=active]:bg-red-600 data-[state=active]:text-white transition-all">
                  Dream ({groupedResults.dream.length})
                </TabsTrigger>
              </TabsList>
              
              <div className="hidden sm:flex items-center gap-2 text-[10px] text-slate-500 font-bold uppercase tracking-widest">
                <div className="w-2 h-2 rounded-full bg-blue-600 animate-pulse" />
                Live Data Analysis
              </div>
            </div>

            <AnimatePresence mode="wait">
              {loading ? (
                <div className={cn("grid gap-6", viewMode === 'grid' ? "grid-cols-1 md:grid-cols-2" : "grid-cols-1")}>
                  {[1, 2, 3, 4].map(i => (
                    <div key={i} className="glass-card rounded-3xl p-6 border border-blue-900/20 space-y-4 h-[350px]">
                      <div className="flex justify-between">
                        <Skeleton className="h-6 w-24 bg-blue-900/20 rounded-full" />
                        <Skeleton className="h-10 w-10 bg-blue-900/20 rounded-xl" />
                      </div>
                      <Skeleton className="h-8 w-full bg-blue-900/20" />
                      <Skeleton className="h-4 w-2/3 bg-blue-900/20" />
                      <div className="grid grid-cols-2 gap-4 pt-4">
                        <Skeleton className="h-16 bg-blue-900/20 rounded-2xl" />
                        <Skeleton className="h-16 bg-blue-900/20 rounded-2xl" />
                      </div>
                      <Skeleton className="h-12 w-full bg-blue-900/20 rounded-xl" />
                      <Skeleton className="h-1.5 w-full bg-blue-900/20 rounded-full" />
                    </div>
                  ))}
                </div>
              ) : results.length > 0 ? (
                <>
                  <TabsContent value="all" className="mt-0">
                    <div className={cn("grid gap-6", viewMode === 'grid' ? "grid-cols-1 md:grid-cols-2" : "grid-cols-1")}>
                      {results.map((result, idx) => (
                        <PredictionCard 
                          key={`${result.college_id}-${result.branch_id}-${idx}`}
                          result={result}
                          isSaved={savedIds.has(`${result.college_id}-${result.branch_id}`)}
                          onToggleSave={handleToggleSave}
                          index={idx}
                        />
                      ))}
                    </div>
                  </TabsContent>
                  <TabsContent value="safe" className="mt-0">
                    <div className={cn("grid gap-6", viewMode === 'grid' ? "grid-cols-1 md:grid-cols-2" : "grid-cols-1")}>
                      {groupedResults.safe.map((result, idx) => (
                        <PredictionCard 
                          key={result.id}
                          result={result}
                          isSaved={savedIds.has(`${result.college_id}-${result.branch_id}`)}
                          onToggleSave={handleToggleSave}
                          index={idx}
                        />
                      ))}
                    </div>
                  </TabsContent>
                  <TabsContent value="moderate" className="mt-0">
                    <div className={cn("grid gap-6", viewMode === 'grid' ? "grid-cols-1 md:grid-cols-2" : "grid-cols-1")}>
                      {groupedResults.moderate.map((result, idx) => (
                        <PredictionCard 
                          key={result.id}
                          result={result}
                          isSaved={savedIds.has(`${result.college_id}-${result.branch_id}`)}
                          onToggleSave={handleToggleSave}
                          index={idx}
                        />
                      ))}
                    </div>
                  </TabsContent>
                  <TabsContent value="dream" className="mt-0">
                    <div className={cn("grid gap-6", viewMode === 'grid' ? "grid-cols-1 md:grid-cols-2" : "grid-cols-1")}>
                      {groupedResults.dream.map((result, idx) => (
                        <PredictionCard 
                          key={result.id}
                          result={result}
                          isSaved={savedIds.has(`${result.college_id}-${result.branch_id}`)}
                          onToggleSave={handleToggleSave}
                          index={idx}
                        />
                      ))}
                    </div>
                  </TabsContent>
                </>
              ) : (
                <motion.div 
                  initial={{ opacity: 0, y: 40 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex flex-col items-center justify-center py-20 px-6 bg-blue-900/5 rounded-[2rem] border-2 border-dashed border-blue-900/20 text-center"
                >
                  <div className="w-20 h-20 rounded-full bg-[#0B1120] border border-blue-900/30 flex items-center justify-center mb-6 shadow-2xl relative" onClick={() => handlePredict()}>
                    <Search className="w-10 h-10 text-blue-500/50 cursor-pointer" />
                    <div className="absolute inset-0 rounded-full border border-blue-500/20 animate-ping" />
                  </div>
                  <h3 className="text-white font-bold text-xl mb-2">Awaiting Your Input</h3>
                  <p className="text-slate-500 text-sm max-w-sm leading-relaxed mb-8">
                    Enter your CRL rank and preferences in the sidebar to reveal your predicted engineering colleges.
                  </p>
                  <div className="flex flex-wrap justify-center gap-4">
                    {['2.5L+ Cutoff Data', 'Updated for 2025', 'IIT/NIT Analysis'].map(tag => (
                      <span key={tag} className="text-[10px] font-bold text-slate-400 bg-[#0B1120] border border-blue-900/30 px-3 py-1.5 rounded-full uppercase tracking-widest">
                        {tag}
                      </span>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </Tabs>
        </div>
      </div>
    </div>
  );
}


'use client';

import { useState, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search, SlidersHorizontal, ChevronDown, X, BookmarkPlus,
  GitCompare, ExternalLink, MapPin, TrendingUp,
  DollarSign, GraduationCap, BarChart2, Building2, RefreshCw,
  Trophy, BookmarkCheck, LayoutDashboard, Settings as SettingsIcon,
  HelpCircle, LogOut
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { predictColleges, toggleSaveCollege } from '@/lib/queries';
import { useAuth } from '@/hooks/use-auth';
import { toast } from 'sonner';
import { INDIAN_STATES, CATEGORIES, type PredictionResult, type Category } from '@/lib/types';

export default function DashboardPage() {
  const { user, signOut, profile } = useAuth();
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<any[]>([]);
  const [savedIds, setSavedIds] = useState<Set<string>>(new Set());

  // Form State
  const [rank, setRank] = useState(profile?.jee_rank?.toString() || '');
  const [category, setCategory] = useState<Category>(profile?.category || 'OPEN');
  const [quota, setQuota] = useState('AI');
  const [gender, setGender] = useState('Gender-Neutral');

  const handlePredict = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!rank) {
      toast.error('Please enter your rank');
      return;
    }

    setLoading(true);
    try {
      const data = await predictColleges({
        rank: parseInt(rank),
        category,
        quota,
        gender
      });
      setResults(data);
      toast.success(`Found ${data.length} potential matches`);
    } catch (err: any) {
      toast.error(err.message || 'Prediction failed');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleSave = async (result: any) => {
    if (!user) {
      toast.error('Please sign in to save colleges');
      return;
    }
    try {
      const isSaved = await toggleSaveCollege(user.id, result.college_id, result.branch_id);
      const newSaved = new Set(savedIds);
      if (isSaved) {
        newSaved.add(`${result.college_id}-${result.branch_id}`);
        toast.success('Saved to your list');
      } else {
        newSaved.delete(`${result.college_id}-${result.branch_id}`);
        toast.info('Removed from your list');
      }
      setSavedIds(newSaved);
    } catch (err: any) {
      toast.error('Action failed');
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Welcome Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white mb-2">
          Welcome back, <span className="text-blue-500">{profile?.name || user?.email?.split('@')[0]}</span>
        </h1>
        <p className="text-slate-400 text-sm">Based on your rank and preferences, here are your best matches.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left: Predictor Form */}
        <div className="lg:col-span-4 space-y-6">
          <div className="glass-card rounded-2xl p-6 border border-blue-900/30">
            <h2 className="text-lg font-semibold text-white mb-6 flex items-center gap-2">
              <Search className="w-5 h-5 text-blue-500" />
              Predictor Settings
            </h2>
            
            <form onSubmit={handlePredict} className="space-y-4">
              <div>
                <label className="text-xs font-medium text-slate-500 mb-1.5 block">JEE Main Rank</label>
                <input
                  type="number"
                  placeholder="e.g. 15000"
                  value={rank}
                  onChange={(e) => setRank(e.target.value)}
                  className="w-full bg-[#050816] border border-blue-900/30 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-blue-500/50 transition-all"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-medium text-slate-500 mb-1.5 block">Category</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as Category)}
                    className="w-full bg-[#050816] border border-blue-900/30 rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none focus:border-blue-500/50 transition-all"
                  >
                    {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-xs font-medium text-slate-500 mb-1.5 block">Quota</label>
                  <select
                    value={quota}
                    onChange={(e) => setQuota(e.target.value)}
                    className="w-full bg-[#050816] border border-blue-900/30 rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none focus:border-blue-500/50 transition-all"
                  >
                    <option value="AI">All India</option>
                    <option value="HS">Home State</option>
                    <option value="OS">Other State</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-xs font-medium text-slate-500 mb-1.5 block">Gender</label>
                <div className="flex gap-2">
                  {['Gender-Neutral', 'Female-only'].map(g => (
                    <button
                      key={g}
                      type="button"
                      onClick={() => setGender(g)}
                      className={`flex-1 py-2 rounded-lg text-xs font-medium border transition-all ${
                        gender === g 
                          ? 'bg-blue-600/20 border-blue-500/50 text-blue-400' 
                          : 'bg-[#050816] border-blue-900/30 text-slate-500 hover:text-slate-300'
                      }`}
                    >
                      {g.split('-')[0]}
                    </button>
                  ))}
                </div>
              </div>

              <Button
                type="submit"
                disabled={loading}
                className="w-full bg-blue-600 hover:bg-blue-500 text-white h-11 rounded-xl font-semibold shadow-lg shadow-blue-900/20"
              >
                {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : 'Predict Colleges'}
              </Button>
            </form>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-blue-600/5 border border-blue-900/20 rounded-2xl p-4">
              <Trophy className="w-5 h-5 text-blue-500 mb-2" />
              <div className="text-white font-bold text-lg">IIT/NIT</div>
              <div className="text-slate-500 text-[10px] uppercase tracking-wider">Top Tier Target</div>
            </div>
            <div className="bg-emerald-600/5 border border-emerald-900/20 rounded-2xl p-4">
              <TrendingUp className="w-5 h-5 text-emerald-500 mb-2" />
              <div className="text-white font-bold text-lg">ROI Based</div>
              <div className="text-slate-500 text-[10px] uppercase tracking-wider">Value Focus</div>
            </div>
          </div>
        </div>

        {/* Right: Results List */}
        <div className="lg:col-span-8 space-y-4">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-lg font-semibold text-white">Prediction Results</h2>
            <div className="flex gap-2">
              <span className="flex items-center gap-1.5 text-[10px] font-medium text-emerald-400 bg-emerald-400/10 px-2 py-1 rounded-full border border-emerald-400/20">
                Safe
              </span>
              <span className="flex items-center gap-1.5 text-[10px] font-medium text-amber-400 bg-amber-400/10 px-2 py-1 rounded-full border border-amber-400/20">
                Moderate
              </span>
              <span className="flex items-center gap-1.5 text-[10px] font-medium text-red-400 bg-red-400/10 px-2 py-1 rounded-full border border-red-400/20">
                Dream
              </span>
            </div>
          </div>

          <AnimatePresence mode="popLayout">
            {results.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {results.map((result, idx) => (
                  <motion.div
                    key={`${result.college_id}-${result.branch_id}`}
                    layout
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: idx * 0.05 }}
                    className="glass-card rounded-2xl p-5 border border-blue-900/30 hover:border-blue-500/30 transition-all group"
                  >
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1.5">
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${
                            result.probability === 'safe' ? 'text-emerald-400 bg-emerald-400/10' :
                            result.probability === 'moderate' ? 'text-amber-400 bg-amber-400/10' :
                            'text-red-400 bg-red-400/10'
                          }`}>
                            {result.probability}
                          </span>
                          <span className="text-[10px] text-slate-500 font-medium">#{result.college.nirf_rank} NIRF</span>
                        </div>
                        <h3 className="text-white font-bold text-sm line-clamp-1">{result.college.short_name || result.college.name}</h3>
                        <p className="text-blue-400 text-xs mt-0.5 font-medium">{result.branch.branch_name}</p>
                      </div>
                      <button 
                        onClick={() => handleToggleSave(result)}
                        className={`p-2 rounded-lg transition-all ${
                          savedIds.has(`${result.college_id}-${result.branch_id}`)
                            ? 'bg-blue-600 text-white'
                            : 'bg-[#050816] text-slate-500 hover:text-blue-400 border border-blue-900/30'
                        }`}
                      >
                        <BookmarkPlus className="w-4 h-4" />
                      </button>
                    </div>

                    <div className="grid grid-cols-2 gap-3 mb-4">
                      <div className="bg-[#050816] rounded-xl p-2.5 border border-blue-900/20">
                        <div className="text-slate-500 text-[10px] mb-0.5">Closing Rank</div>
                        <div className="text-white font-bold text-sm">{result.closing_rank.toLocaleString()}</div>
                      </div>
                      <div className="bg-[#050816] rounded-xl p-2.5 border border-blue-900/20">
                        <div className="text-slate-500 text-[10px] mb-0.5">Avg Package</div>
                        <div className="text-white font-bold text-sm">{result.college.avg_package}LPA</div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-3 border-t border-blue-900/20">
                      <div className="flex items-center gap-1.5">
                        <div className="w-8 h-1.5 bg-blue-900/30 rounded-full overflow-hidden">
                          <div className={`h-full ${
                            result.probability === 'safe' ? 'bg-emerald-400' :
                            result.probability === 'moderate' ? 'bg-amber-400' : 'bg-red-400'
                          }`} style={{ width: `${result.confidenceScore}%` }} />
                        </div>
                        <span className="text-[10px] font-bold text-white">{result.confidenceScore}%</span>
                      </div>
                      <Link href={`/college/${result.college_id}`}>
                        <Button variant="ghost" className="h-7 text-[10px] gap-1 text-slate-400 hover:text-white px-2">
                          View Details <ExternalLink className="w-3 h-3" />
                        </Button>
                      </Link>
                    </div>
                  </motion.div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-20 bg-blue-900/5 rounded-3xl border border-dashed border-blue-900/30">
                <div className="w-16 h-16 rounded-full bg-blue-900/20 flex items-center justify-center mb-4">
                  <Search className="w-8 h-8 text-blue-500/50" />
                </div>
                <h3 className="text-white font-bold text-lg mb-1">No predictions yet</h3>
                <p className="text-slate-500 text-sm">Enter your JEE rank to see matching colleges</p>
              </div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}

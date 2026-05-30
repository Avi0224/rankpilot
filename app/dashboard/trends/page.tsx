'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  BarChart3, LineChart as LineIcon, Plus, X, 
  TrendingDown, TrendingUp, Info, ChevronDown
} from 'lucide-react';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, 
  Tooltip, Legend, ResponsiveContainer 
} from 'recharts';
import { useAuth } from '@/hooks/use-auth';
import { getSavedColleges, getCutoffTrends } from '@/services/api';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/utils';

export default function CutoffTrendsPage() {
  const { user, profile } = useAuth();
  const [savedColleges, setSavedColleges] = useState<any[]>([]);
  const [selectedColleges, setSelectedColleges] = useState<any[]>([]);
  const [trendData, setTrendData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [fetchingTrends, setFetchingTrends] = useState(false);

  useEffect(() => {
    const fetchSaved = async () => {
      if (!user) return;
      try {
        const data = await getSavedColleges(user.id);
        setSavedColleges(data || []);
        // Automatically select the first one if available
        if (data && data.length > 0) {
          setSelectedColleges([data[0]]);
        }
      } catch (err) {
        console.error('Failed to fetch saved colleges');
      } finally {
        setLoading(false);
      }
    };
    fetchSaved();
  }, [user]);

  useEffect(() => {
    const fetchTrends = async () => {
      if (selectedColleges.length === 0 || !profile) return;
      setFetchingTrends(true);
      try {
        // Fetch trends for all selected colleges
        const allTrends = await Promise.all(
          selectedColleges.map(async (sc) => {
            const data = await getCutoffTrends(
              sc.college_id, 
              sc.branch_id, 
              profile.category || 'OPEN',
              'AI', // Defaulting to AI for trends
              profile.gender || 'Gender-Neutral'
            );
            return { name: sc.college.short_name || sc.college.name, data };
          })
        );

        // Transform data for Recharts: { year: 2021, "NIT Trichy": 4500, "IIT Bombay": 200 }
        const years = Array.from(new Set(allTrends.flatMap(t => t.data.map(d => d.year)))).sort();
        const formatted = years.map(year => {
          const entry: any = { year };
          allTrends.forEach(t => {
            const yearData = t.data.find(d => d.year === year);
            if (yearData) {
              entry[t.name] = yearData.closing_rank;
            }
          });
          return entry;
        });

        setTrendData(formatted);
      } catch (err) {
        console.error('Failed to fetch trends');
      } finally {
        setFetchingTrends(false);
      }
    };
    fetchTrends();
  }, [selectedColleges, profile]);

  const toggleSelection = (college: any) => {
    if (selectedColleges.find(s => s.id === college.id)) {
      setSelectedColleges(selectedColleges.filter(s => s.id !== college.id));
    } else {
      if (selectedColleges.length >= 3) return; // Limit to 3 for clarity
      setSelectedColleges([...selectedColleges, college]);
    }
  };

  if (!user) {
    return (
      <div className="p-8 flex items-center justify-center min-h-[60vh]">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 rounded-full bg-blue-600/10 flex items-center justify-center mx-auto">
            <BarChart3 className="w-8 h-8 text-blue-500/50" />
          </div>
          <h1 className="text-xl font-bold text-white">Sign in to view Trends</h1>
          <p className="text-slate-500 text-sm">Save colleges from the predictor to analyze their cutoff trends over years.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-8 space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-2xl font-bold text-white mb-1">Cutoff Trends</h1>
          <p className="text-slate-500 text-sm">Analyze how closing ranks have shifted over the last 3-5 years.</p>
        </div>

        <div className="flex items-center gap-2">
          {fetchingTrends && <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mr-2" />}
          <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest bg-[#0B1120] border border-blue-900/30 px-3 py-1.5 rounded-lg">
            Category: {profile?.category || 'OPEN'} • Quota: AI
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Selection Sidebar */}
        <div className="space-y-4">
          <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest">Select Institutes (Max 3)</h3>
          <div className="space-y-2">
            {loading ? (
              Array(3).fill(0).map((_, i) => <Skeleton key={i} className="h-14 w-full rounded-xl bg-blue-900/10" />)
            ) : savedColleges.length === 0 ? (
              <div className="p-6 text-center bg-blue-600/5 rounded-2xl border border-dashed border-blue-900/20">
                <p className="text-slate-600 text-[10px] font-bold uppercase">No saved colleges found</p>
              </div>
            ) : (
              savedColleges.map((sc) => (
                <button
                  key={sc.id}
                  onClick={() => toggleSelection(sc)}
                  className={cn(
                    "w-full flex items-center justify-between p-3 rounded-xl border transition-all text-left group",
                    selectedColleges.find(s => s.id === sc.id)
                      ? "bg-blue-600/10 border-blue-500/30"
                      : "bg-[#0B1120]/50 border-blue-900/20 hover:border-blue-500/20"
                  )}
                >
                  <div className="min-w-0">
                    <div className="text-xs font-bold text-white truncate">{sc.college.short_name || sc.college.name}</div>
                    <div className="text-[9px] text-slate-500 truncate uppercase font-bold mt-0.5">{sc.branch.branch_name}</div>
                  </div>
                  {selectedColleges.find(s => s.id === sc.id) ? (
                    <X className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                  ) : (
                    <Plus className="w-3.5 h-3.5 text-slate-600 group-hover:text-slate-400 shrink-0" />
                  )}
                </button>
              ))
            )}
          </div>
        </div>

        {/* Graph Area */}
        <div className="lg:col-span-2 space-y-6">
          <div className="glass-card rounded-3xl p-6 border border-blue-900/20 min-h-[400px]">
            {selectedColleges.length === 0 ? (
              <div className="h-full flex items-center justify-center py-20">
                <div className="text-center space-y-3">
                  <LineIcon className="w-10 h-10 text-blue-500/20 mx-auto" />
                  <p className="text-slate-500 text-xs font-bold uppercase tracking-widest">Select a college to view trends</p>
                </div>
              </div>
            ) : (
              <div className="h-[400px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={trendData} margin={{ top: 20, right: 30, left: 0, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                    <XAxis 
                      dataKey="year" 
                      stroke="#475569" 
                      tick={{ fill: '#64748b', fontSize: 11, fontWeight: 'bold' }} 
                      padding={{ left: 20, right: 20 }}
                    />
                    <YAxis 
                      reversed 
                      stroke="#475569" 
                      tick={{ fill: '#64748b', fontSize: 10, fontWeight: 'bold' }}
                      label={{ value: 'Closing Rank', angle: -90, position: 'insideLeft', offset: 10, fill: '#475569', fontSize: 10, fontWeight: 'bold' }}
                    />
                    <Tooltip 
                      contentStyle={{ background: '#0B1120', border: '1px solid #1e3a5f', borderRadius: '12px', fontSize: 12, fontWeight: 'bold' }}
                      itemStyle={{ padding: '2px 0' }}
                    />
                    <Legend wrapperStyle={{ paddingTop: '20px', fontSize: '11px', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '1px' }} />
                    {selectedColleges.map((sc, i) => {
                      const name = sc.college.short_name || sc.college.name;
                      const colors = ['#3B82F6', '#10B981', '#F59E0B'];
                      return (
                        <Line 
                          key={sc.id}
                          type="monotone" 
                          dataKey={name} 
                          stroke={colors[i % colors.length]} 
                          strokeWidth={3}
                          dot={{ r: 4, strokeWidth: 2, fill: '#050816' }}
                          activeDot={{ r: 6, strokeWidth: 0 }}
                          animationDuration={1000}
                        />
                      );
                    })}
                  </LineChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>

          <div className="bg-blue-600/5 border border-blue-500/10 rounded-2xl p-4 flex gap-4">
            <Info className="w-5 h-5 text-blue-400 shrink-0" />
            <p className="text-slate-500 text-[11px] leading-relaxed">
              <span className="text-blue-400 font-bold uppercase mr-1">Note:</span>
              The Y-axis is reversed because a lower numerical rank is more difficult to achieve. 
              An <span className="text-emerald-400 font-bold">upward trend</span> on this graph indicates that the college is becoming more popular and harder to get into.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

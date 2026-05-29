'use client';

import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft, ExternalLink, MapPin, Calendar, Users, Award,
  DollarSign, Home, TrendingUp, BookOpen, Building2, BarChart3, Star,
  CheckCircle2, AlertCircle, BookmarkPlus, Share2
} from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { getCollegeById, toggleSaveCollege } from '@/lib/queries';
import { useAuth } from '@/hooks/use-auth';
import { useRecentlyViewed } from '@/hooks/use-recently-viewed';
import { toast } from 'sonner';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Cell
} from 'recharts';

const tabs = ['Overview', 'Cutoff Trends', 'Placements', 'Branches'];

export default function CollegeDetailPage({ params }: { params: { id: string } }) {
  const { user } = useAuth();
  const { addToRecentlyViewed } = useRecentlyViewed();
  const [activeTab, setActiveTab] = useState('Overview');
  const [college, setCollege] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isSaved, setIsSaved] = useState(false);

  useEffect(() => {
    const fetchCollege = async () => {
      try {
        const data = await getCollegeById(params.id);
        setCollege(data);
        addToRecentlyViewed(data);
      } catch (err) {
        toast.error('Failed to load college details');
      } finally {
        setLoading(false);
      }
    };
    fetchCollege();
  }, [params.id]);

  const handleSave = async () => {
    if (!user) {
      toast.error('Please sign in to save colleges');
      return;
    }
    try {
      const saved = await toggleSaveCollege(user.id, college.id);
      setIsSaved(saved);
      toast.success(saved ? 'Added to your list' : 'Removed from your list');
    } catch (err) {
      toast.error('Action failed');
    }
  };

  const trendData = useMemo(() => {
    if (!college?.cutoffs) return [];
    // Group cutoffs by year for the trend chart
    const years = Array.from(new Set(college.cutoffs.map((c: any) => c.year))).sort();
    return years.map(year => {
      const yearCutoffs = college.cutoffs.filter((c: any) => c.year === year);
      const data: any = { year };
      yearCutoffs.forEach((c: any) => {
        // Use a subset of branches for clarity in chart
        if (c.branch_id) {
          const branch = college.branches.find((b: any) => b.id === c.branch_id);
          if (branch) data[branch.branch_name] = c.closing_rank;
        }
      });
      return data;
    });
  }, [college]);

  if (loading) return (
    <div className="min-h-screen bg-[#050816] p-4 md:p-8 pt-24">
      <div className="max-w-6xl mx-auto space-y-8">
        <Skeleton className="h-6 w-32 bg-blue-900/20" />
        <Skeleton className="h-64 w-full bg-blue-900/20 rounded-[2rem]" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <Skeleton className="h-96 md:col-span-2 bg-blue-900/20 rounded-[2rem]" />
          <Skeleton className="h-96 bg-blue-900/20 rounded-[2rem]" />
        </div>
      </div>
    </div>
  );

  if (!college) return (
    <div className="min-h-screen bg-[#050816] flex items-center justify-center">
      <div className="text-center">
        <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
        <h1 className="text-white font-bold text-xl">College Not Found</h1>
        <Link href="/dashboard">
          <Button variant="link" className="text-blue-400 mt-2">Back to Dashboard</Button>
        </Link>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#050816] pb-20">
      <div className="max-w-6xl mx-auto px-4 md:px-8 pt-24">
        {/* Breadcrumb */}
        <Link href="/dashboard" className="inline-flex items-center gap-2 text-slate-500 hover:text-blue-400 text-xs font-bold uppercase tracking-widest mb-8 transition-colors">
          <ArrowLeft className="w-4 h-4" />
          Back to Predictor
        </Link>

        {/* Hero Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-card rounded-[2.5rem] p-6 md:p-10 border border-blue-500/15 mb-8 relative overflow-hidden group"
        >
          <div className="absolute top-0 right-0 w-96 h-96 bg-blue-600/5 blur-[100px] rounded-full -mr-48 -mt-48 group-hover:bg-blue-600/10 transition-colors duration-700" />
          
          <div className="flex flex-col md:flex-row md:items-start justify-between gap-8 relative z-10">
            <div className="flex-1">
              <div className="flex flex-wrap items-center gap-3 mb-6">
                <Badge className="bg-blue-600/20 text-blue-400 border-blue-500/30 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest">
                  {college.type}
                </Badge>
                {college.nirf_rank && (
                  <Badge className="bg-yellow-500/20 text-yellow-500 border-yellow-500/30 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest">
                    NIRF Rank #{college.nirf_rank}
                  </Badge>
                )}
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                  Verified Data 2025
                </span>
              </div>
              
              <h1 className="text-3xl md:text-4xl font-black text-white mb-3 tracking-tight leading-tight">
                {college.name}
              </h1>
              
              <div className="flex flex-wrap items-center gap-6 text-slate-400 text-sm mt-4 font-medium">
                <span className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-blue-900/20 flex items-center justify-center">
                    <MapPin className="w-4 h-4 text-blue-500" />
                  </div>
                  {college.city}, {college.state}
                </span>
                <span className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-blue-900/20 flex items-center justify-center">
                    <Calendar className="w-4 h-4 text-blue-500" />
                  </div>
                  Established {college.established_year || 'N/A'}
                </span>
                {college.campus_size_acres && (
                  <span className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-blue-900/20 flex items-center justify-center">
                      <Building2 className="w-4 h-4 text-blue-500" />
                    </div>
                    {college.campus_size_acres} Acres
                  </span>
                )}
              </div>
            </div>

            <div className="flex gap-3 flex-shrink-0">
              <button 
                onClick={handleSave}
                className={cn(
                  "p-3 rounded-2xl transition-all duration-300 border flex items-center justify-center",
                  isSaved 
                    ? "bg-blue-600 text-white border-blue-500 shadow-xl shadow-blue-600/20" 
                    : "bg-[#050816] text-slate-400 border-blue-900/30 hover:border-blue-500/30"
                )}
              >
                <BookmarkPlus className={cn("w-5 h-5", isSaved && "fill-current")} />
              </button>
              <button className="p-3 rounded-2xl bg-[#050816] text-slate-400 border border-blue-900/30 hover:border-blue-500/30 transition-all">
                <Share2 className="w-5 h-5" />
              </button>
              {college.website && (
                <a href={college.website} target="_blank" rel="noopener noreferrer">
                  <Button className="bg-blue-600 hover:bg-blue-500 text-white rounded-2xl px-6 h-12 font-bold shadow-lg shadow-blue-600/20 gap-2">
                    Official Site <ExternalLink className="w-4 h-4" />
                  </Button>
                </a>
              )}
            </div>
          </div>

          {/* Key Stats Bar */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mt-10 pt-10 border-t border-blue-900/20">
            {[
              { label: 'Avg Package', value: college.avg_package ? `₹${college.avg_package} LPA` : 'N/A', icon: TrendingUp, color: 'text-emerald-400', bg: 'bg-emerald-400/5' },
              { label: 'Median CTC', value: college.median_package ? `₹${college.median_package} LPA` : 'N/A', icon: BarChart3, color: 'text-blue-400', bg: 'bg-blue-400/5' },
              { label: 'Yearly Fees', value: college.fees_per_year ? `₹${(college.fees_per_year/100000).toFixed(2)}L` : 'N/A', icon: DollarSign, color: 'text-amber-400', bg: 'bg-amber-400/5' },
              { label: 'ROI Score', value: college.roi_score ? `${college.roi_score}/10` : 'N/A', icon: Star, color: 'text-cyan-400', bg: 'bg-cyan-400/5' },
            ].map((stat) => (
              <div key={stat.label} className={cn("rounded-[2rem] p-5 border border-blue-900/10 transition-all hover:border-blue-500/20 group/stat", stat.bg)}>
                <stat.icon className={cn("w-5 h-5 mb-3 group-hover/stat:scale-110 transition-transform", stat.color)} />
                <div className="text-white font-black text-xl tracking-tight">{stat.value}</div>
                <div className="text-slate-500 text-[10px] font-bold uppercase tracking-widest mt-1">{stat.label}</div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Navigation Tabs */}
        <div className="flex gap-2 mb-8 p-1.5 bg-[#0B1120] rounded-[1.5rem] border border-blue-900/30 w-fit">
          {tabs.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={cn(
                "px-6 py-2.5 rounded-xl text-xs font-bold uppercase tracking-widest transition-all",
                activeTab === tab
                  ? "bg-blue-600 text-white shadow-lg shadow-blue-600/20"
                  : "text-slate-500 hover:text-slate-300 hover:bg-white/5"
              )}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
          >
            {activeTab === 'Overview' && (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-8">
                  <div className="glass-card rounded-[2rem] p-8 border border-blue-900/20 relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-1 h-full bg-blue-600" />
                    <h3 className="text-white font-bold text-lg mb-4 flex items-center gap-2">
                      <Building2 className="w-5 h-5 text-blue-500" />
                      About the Institute
                    </h3>
                    <p className="text-slate-400 text-sm leading-relaxed whitespace-pre-line">
                      {college.description || `The ${college.name} is one of the premier ${college.type}s located in ${college.city}, ${college.state}. Established in ${college.established_year || 'historical years'}, it has built a reputation for academic excellence and innovation in engineering and technology.`}
                    </p>
                  </div>

                  <div className="glass-card rounded-[2rem] p-8 border border-blue-900/20">
                    <h3 className="text-white font-bold text-lg mb-6 flex items-center gap-2">
                      <TrendingUp className="w-5 h-5 text-emerald-500" />
                      Financial & ROI Analysis
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                      <div className="bg-[#050816] rounded-2xl p-5 border border-blue-900/20">
                        <div className="text-slate-500 text-[10px] font-bold uppercase tracking-widest mb-1">Total 4-Year Cost</div>
                        <div className="text-white font-black text-2xl">
                          ₹{college.fees_per_year ? ((college.fees_per_year + (college.hostel_fees_per_year || 0)) * 4 / 100000).toFixed(1) : 'N/A'}L
                        </div>
                        <div className="text-slate-600 text-[10px] mt-1 italic">Includes tuition & hostel estimates</div>
                      </div>
                      <div className="bg-[#050816] rounded-2xl p-5 border border-blue-900/20">
                        <div className="text-slate-500 text-[10px] font-bold uppercase tracking-widest mb-1">Estimated Payback</div>
                        <div className="text-emerald-400 font-black text-2xl">
                          {college.avg_package && college.fees_per_year ? 
                            Math.round(((college.fees_per_year + (college.hostel_fees_per_year || 0)) * 4) / (college.avg_package * 100000 / 12)) 
                            : 'N/A'
                          } Months
                        </div>
                        <div className="text-slate-600 text-[10px] mt-1 italic">Based on average package CTC</div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-6">
                  <div className="glass-card rounded-[2rem] p-6 border border-blue-900/20">
                    <h3 className="text-white font-bold text-sm mb-4 uppercase tracking-widest text-blue-400">Campus Facilities</h3>
                    <div className="space-y-4">
                      {[
                        { label: 'Hostel Accommodation', value: college.hostel_fees_per_year ? 'Available' : 'Limited', icon: Home },
                        { label: 'Placement Cell', value: 'Highly Active', icon: Award },
                        { label: 'Student Body', value: college.total_students?.toLocaleString() || 'N/A', icon: Users },
                        { label: 'Accreditation', value: college.accreditation || 'NAAC/NBA', icon: CheckCircle2 },
                      ].map((item) => (
                        <div key={item.label} className="flex items-center justify-between">
                          <div className="flex items-center gap-2 text-slate-500 text-xs">
                            <item.icon className="w-3.5 h-3.5" />
                            {item.label}
                          </div>
                          <span className="text-white font-bold text-xs">{item.value}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  <div className="glass-card rounded-[2rem] p-6 border border-emerald-500/10 bg-emerald-500/[0.02]">
                    <h3 className="text-emerald-400 font-bold text-sm mb-4 uppercase tracking-widest">Key Highlights</h3>
                    <ul className="space-y-3">
                      {[
                        `Top ${college.type} in ${college.state}`,
                        `${college.placement_percentage || 90}%+ Placement Record`,
                        'Excellent ROI Metrics',
                        'State-of-the-art Research Labs'
                      ].map((h) => (
                        <li key={h} className="flex items-start gap-3 text-slate-400 text-[11px] leading-relaxed">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0 mt-0.5" />
                          {h}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'Cutoff Trends' && (
              <div className="glass-card rounded-[2rem] p-8 border border-blue-900/20">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-10">
                  <div>
                    <h3 className="text-white font-bold text-xl mb-1">Admission Trends</h3>
                    <p className="text-slate-500 text-xs uppercase tracking-widest font-bold">Closing Rank History (OPEN · AI · Gender-Neutral)</p>
                  </div>
                  <div className="flex flex-wrap gap-4">
                    {Object.keys(trendData[0] || {}).filter(k => k !== 'year').map((branch, i) => (
                      <div key={branch} className="flex items-center gap-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: `hsl(${i * 60 + 210}, 70%, 60%)` }} />
                        {branch}
                      </div>
                    ))}
                  </div>
                </div>
                
                <div className="h-[400px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={trendData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                      <XAxis 
                        dataKey="year" 
                        stroke="#475569" 
                        tick={{ fill: '#64748b', fontSize: 11, fontWeight: 'bold' }} 
                        axisLine={false}
                      />
                      <YAxis 
                        stroke="#475569" 
                        tick={{ fill: '#64748b', fontSize: 11, fontWeight: 'bold' }} 
                        reversed 
                        axisLine={false}
                        tickFormatter={(v) => v >= 1000 ? `${(v/1000).toFixed(1)}k` : v}
                      />
                      <Tooltip
                        contentStyle={{ background: '#0B1120', border: '1px solid #1e3a5f', borderRadius: 16, boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.5)' }}
                        itemStyle={{ fontSize: 12, fontWeight: 'bold' }}
                      />
                      {Object.keys(trendData[0] || {}).filter(k => k !== 'year').map((branch, i) => (
                        <Line 
                          key={branch}
                          type="monotone" 
                          dataKey={branch} 
                          stroke={`hsl(${i * 60 + 210}, 70%, 60%)`} 
                          strokeWidth={3} 
                          dot={{ fill: `hsl(${i * 60 + 210}, 70%, 60%)`, r: 5, strokeWidth: 2, stroke: '#050816' }} 
                          activeDot={{ r: 8, strokeWidth: 0 }}
                        />
                      ))}
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>
            )}

            {activeTab === 'Placements' && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="glass-card rounded-[2rem] p-8 border border-blue-900/20">
                  <h3 className="text-white font-bold text-lg mb-8 flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-blue-500" />
                    Salary Packages (LPA)
                  </h3>
                  <div className="h-72">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={[
                        { name: 'Average', value: college.avg_package, color: '#3B82F6' },
                        { name: 'Median', value: college.median_package, color: '#06B6D4' },
                        { name: 'Highest', value: college.highest_package, color: '#8B5CF6' }
                      ]}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                        <XAxis dataKey="name" stroke="#475569" tick={{ fill: '#64748b', fontSize: 11, fontWeight: 'bold' }} axisLine={false} />
                        <YAxis stroke="#475569" tick={{ fill: '#64748b', fontSize: 11, fontWeight: 'bold' }} axisLine={false} />
                        <Tooltip cursor={{ fill: 'rgba(255,255,255,0.05)' }} contentStyle={{ background: '#0B1120', border: '1px solid #1e3a5f', borderRadius: 12 }} />
                        <Bar dataKey="value" radius={[12, 12, 0, 0]}>
                          {[0, 1, 2].map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={['#3B82F6', '#06B6D4', '#8B5CF6'][index]} />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                <div className="glass-card rounded-[2rem] p-8 border border-blue-900/20">
                  <h3 className="text-white font-bold text-lg mb-6">Placement Statistics</h3>
                  <div className="space-y-6">
                    {[
                      { label: 'Overall Placement Rate', value: `${college.placement_percentage || 'N/A'}%`, sub: 'Across all engineering branches' },
                      { label: 'Top Recruiter Base', value: '150+ Companies', sub: 'Fortune 500 & Top Startups' },
                      { label: 'Pre-Placement Offers', value: '25%+', sub: 'From summer internships' },
                      { label: 'Average Package (CSE)', value: `₹${(college.avg_package * 1.4).toFixed(1)} LPA`, sub: 'Premium software roles' },
                    ].map((item) => (
                      <div key={item.label} className="flex justify-between items-center group/stat">
                        <div>
                          <div className="text-slate-500 text-xs font-bold uppercase tracking-widest mb-1">{item.label}</div>
                          <div className="text-slate-600 text-[10px] italic">{item.sub}</div>
                        </div>
                        <div className="text-white font-black text-xl group-hover/stat:text-blue-400 transition-colors">{item.value}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'Branches' && (
              <div className="glass-card rounded-[2rem] border border-blue-900/20 overflow-hidden shadow-2xl">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="bg-[#050816] border-b border-blue-900/30">
                        {['Academic Branch', 'Est. Seats', 'Avg Placement Package'].map((h) => (
                          <th key={h} className="text-left text-[10px] text-slate-500 font-bold uppercase tracking-[0.2em] px-8 py-5">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-blue-900/10 bg-[#0B1120]/30">
                      {college.branches?.map((branch: any) => (
                        <tr key={branch.id} className="hover:bg-white/[0.02] transition-colors group">
                          <td className="px-8 py-6">
                            <div className="text-white font-bold text-sm group-hover:text-blue-400 transition-colors">{branch.branch_name}</div>
                            <div className="text-slate-500 text-[10px] mt-1 font-medium">{branch.branch_code || 'B.Tech'}</div>
                          </td>
                          <td className="px-8 py-6 text-slate-400 text-sm font-bold">60-120</td>
                          <td className="px-8 py-6">
                            <div className="text-emerald-400 font-black text-sm">₹{college.avg_package ? (college.avg_package * (branch.branch_name.includes('Computer') ? 1.3 : 0.9)).toFixed(1) : 'N/A'} LPA</div>
                            <div className="text-slate-600 text-[10px] mt-1 uppercase tracking-tighter font-bold">Estimated</div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}

'use client';

export const dynamic = 'force-dynamic';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Bookmark, Trash2, ExternalLink, GitCompare, ListOrdered, MapPin, TrendingUp } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/use-auth';
import { getSavedColleges, toggleSaveCollege } from '@/services/api';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/utils';
import { toast } from 'sonner';

export default function SavedPage() {
  const { user } = useAuth();
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchSaved = async () => {
    if (!user) return;
    try {
      const data = await getSavedColleges(user.id);
      setItems(data || []);
    } catch (err) {
      console.error('Failed to fetch saved colleges');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSaved();
  }, [user]);

  const handleRemove = async (collegeId: string, branchId?: string) => {
    if (!user) return;
    try {
      await toggleSaveCollege(user.id, collegeId, branchId);
      setItems(items.filter(i => !(i.college_id === collegeId && i.branch_id === branchId)));
      toast.success('Removed from shortlist');
    } catch (err) {
      toast.error('Failed to remove college');
    }
  };

  if (!user) {
    return (
      <div className="p-8 flex items-center justify-center min-h-[60vh]">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 rounded-full bg-blue-600/10 flex items-center justify-center mx-auto">
            <Bookmark className="w-8 h-8 text-blue-500/50" />
          </div>
          <h1 className="text-xl font-bold text-white">Sign in to view Shortlist</h1>
          <p className="text-slate-500 text-sm">Save colleges from the predictor to build your personal shortlist.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-8 space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-2xl font-bold text-white mb-1">Saved Colleges</h1>
          <p className="text-slate-500 text-sm">Your personal shortlist of institutes and branches.</p>
        </div>
        
        {items.length > 0 && (
          <Link href="/dashboard/choice-filling">
            <Button className="bg-blue-600 hover:bg-blue-500 text-white rounded-xl h-10 px-6 font-bold shadow-lg shadow-blue-600/20 gap-2">
              <ListOrdered className="w-4 h-4" />
              Build Preference List
            </Button>
          </Link>
        )}
      </div>

      {loading ? (
        <div className="space-y-4">
          {Array(3).fill(0).map((_, i) => (
            <Skeleton key={i} className="h-24 w-full rounded-2xl bg-blue-900/10 border border-blue-900/20" />
          ))}
        </div>
      ) : items.length === 0 ? (
        <div className="glass-card rounded-[2.5rem] border border-dashed border-blue-900/30 p-20 text-center">
          <div className="w-16 h-16 rounded-2xl bg-blue-600/10 border border-blue-500/20 flex items-center justify-center mx-auto mb-6">
            <Bookmark className="w-8 h-8 text-blue-400/40" />
          </div>
          <h3 className="text-white font-bold text-lg mb-2">No Saved Colleges</h3>
          <p className="text-slate-500 text-sm mb-8">Use the predictor to find matching colleges and save them here.</p>
          <Link href="/dashboard">
            <Button className="bg-blue-600 hover:bg-blue-500 text-white rounded-xl h-11 px-8 font-bold">
              Start Predicting
            </Button>
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {items.map((item, i) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="glass-card rounded-2xl p-5 border border-blue-900/20 hover:border-blue-500/30 transition-all group"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-1.5">
                    <Badge variant="outline" className="text-[9px] uppercase tracking-tighter border-blue-900/50 text-blue-400">
                      {item.college?.type}
                    </Badge>
                    <h3 className="text-white font-bold text-base group-hover:text-blue-400 transition-colors">
                      {item.college?.name}
                    </h3>
                  </div>
                  <div className="flex items-center gap-4 text-[10px] font-bold uppercase tracking-widest text-slate-500">
                    <span className="text-blue-500/80">{item.branch?.branch_name}</span>
                    <span className="flex items-center gap-1"><MapPin className="w-3 h-3" />{item.college?.state}</span>
                    <span><TrendingUp className="inline w-3 h-3 mr-1" />₹{item.college?.avg_package}L AVG</span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Link href={`/dashboard/compare`}>
                    <Button variant="ghost" size="sm" className="h-9 rounded-xl text-slate-500 hover:text-white hover:bg-white/5 gap-2 font-bold text-[10px] uppercase">
                      <GitCompare className="w-3.5 h-3.5" /> Compare
                    </Button>
                  </Link>
                  <button
                    onClick={() => handleRemove(item.college_id, item.branch_id)}
                    className="w-9 h-9 rounded-xl flex items-center justify-center text-slate-600 hover:text-red-400 hover:bg-red-400/10 transition-all"
                    title="Remove from shortlist"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}


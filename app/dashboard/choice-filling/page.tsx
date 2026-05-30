'use client';

export const dynamic = 'force-dynamic';

import { useState, useEffect } from 'react';
import { motion, Reorder } from 'framer-motion';
import { 
  GripVertical, X, Download, TrendingUp, DollarSign, 
  BarChart3, ListOrdered, Save, ArrowUpDown
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/use-auth';
import { getSavedColleges, updateSavedPriority } from '@/services/api';
import { toast } from 'sonner';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/utils';

export default function ChoiceFillingPage() {
  const { user } = useAuth();
  const [choices, setChoices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      if (!user) return;
      try {
        const data = await getSavedColleges(user.id);
        if (data) {
          const processed = data.map(item => {
            const avgPkg = item.college?.avg_package || 0;
            const totalFees = (item.college?.fees_per_year || 0) * 4;
            const roiScore = totalFees > 0 ? (avgPkg / (totalFees / 100000)) * 10 : 0;
            return {
              ...item,
              roiScore: parseFloat(roiScore.toFixed(2))
            };
          });
          setChoices(processed);
        }
      } catch (err) {
        console.error('Failed to fetch choices');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [user]);

  const saveOrder = async () => {
    if (!user) return;
    setSaving(true);
    try {
      await Promise.all(
        choices.map((choice, index) => updateSavedPriority(choice.id, index))
      );
      toast.success('Preference order saved successfully');
    } catch (err) {
      toast.error('Failed to save preference order');
    } finally {
      setSaving(false);
    }
  };

  const sortBy = (key: 'roi' | 'fees' | 'package') => {
    const sorted = [...choices].sort((a, b) => {
      if (key === 'roi') return b.roiScore - a.roiScore;
      if (key === 'fees') return (a.college?.fees_per_year || 0) - (b.college?.fees_per_year || 0);
      if (key === 'package') return (b.college?.avg_package || 0) - (a.college?.avg_package || 0);
      return 0;
    });
    setChoices(sorted);
  };

  if (!user) {
    return (
      <div className="p-8 flex items-center justify-center min-h-[60vh]">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 rounded-full bg-blue-600/10 flex items-center justify-center mx-auto">
            <ListOrdered className="w-8 h-8 text-blue-500/50" />
          </div>
          <h1 className="text-xl font-bold text-white">Sign in to use Choice Filling</h1>
          <p className="text-slate-500 text-sm">Save colleges from the predictor to start building your preference list.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-8 max-w-4xl mx-auto space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-2xl font-bold text-white mb-1">Choice Filling Assistant</h1>
          <p className="text-slate-500 text-sm">Drag to reorder your preference list. Order them by your actual priority.</p>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 bg-[#0B1120] border border-blue-900/30 p-1 rounded-xl">
            <button onClick={() => sortBy('roi')} className="px-2 py-1.5 rounded-lg text-[9px] font-black uppercase text-slate-500 hover:text-white transition-all">ROI</button>
            <button onClick={() => sortBy('fees')} className="px-2 py-1.5 rounded-lg text-[9px] font-black uppercase text-slate-500 hover:text-white transition-all">Fees</button>
            <button onClick={() => sortBy('package')} className="px-2 py-1.5 rounded-lg text-[9px] font-black uppercase text-slate-500 hover:text-white transition-all">Package</button>
          </div>
          <Button 
            onClick={saveOrder} 
            disabled={saving || loading}
            className="bg-blue-600 hover:bg-blue-500 text-white rounded-xl h-10 px-6 font-bold shadow-lg shadow-blue-600/20 gap-2"
          >
            <Save className="w-4 h-4" />
            {saving ? 'Saving...' : 'Save Order'}
          </Button>
        </div>
      </div>

      {loading ? (
        <div className="space-y-3">
          {Array(5).fill(0).map((_, i) => (
            <Skeleton key={i} className="h-20 w-full rounded-2xl bg-blue-900/10 border border-blue-900/20" />
          ))}
        </div>
      ) : choices.length === 0 ? (
        <div className="glass-card rounded-[2.5rem] border border-dashed border-blue-900/30 p-20 text-center">
          <p className="text-slate-500 font-medium">Your list is empty. Add colleges from the Predictor.</p>
        </div>
      ) : (
        <Reorder.Group axis="y" values={choices} onReorder={setChoices} className="space-y-3">
          {choices.map((choice, index) => (
            <Reorder.Item
              key={choice.id}
              value={choice}
              className="glass-card rounded-2xl border border-blue-900/20 hover:border-blue-500/30 transition-all cursor-grab active:cursor-grabbing select-none"
            >
              <div className="flex items-center gap-4 p-4">
                <div className="w-8 h-8 rounded-lg bg-blue-600/10 border border-blue-500/20 flex items-center justify-center text-blue-400 font-black text-xs">
                  {index + 1}
                </div>
                <GripVertical className="w-4 h-4 text-slate-700 shrink-0" />
                
                <div className="flex-1 min-w-0">
                  <h3 className="text-white font-bold text-sm truncate">{choice.college?.name}</h3>
                  <div className="flex items-center gap-3 mt-0.5">
                    <span className="text-blue-500 text-[10px] font-black uppercase">{choice.branch?.branch_name}</span>
                    <span className="text-slate-600 text-[10px] font-bold uppercase tracking-widest">•</span>
                    <span className="text-slate-500 text-[10px] font-bold uppercase tracking-widest">{choice.college?.type}</span>
                  </div>
                </div>

                <div className="hidden sm:flex items-center gap-6">
                  <div className="text-center">
                    <div className="text-[8px] text-slate-600 font-black uppercase tracking-widest mb-0.5">ROI Score</div>
                    <div className="text-emerald-400 font-bold text-xs">{choice.roiScore}</div>
                  </div>
                  <div className="text-center">
                    <div className="text-[8px] text-slate-600 font-black uppercase tracking-widest mb-0.5">Fees/Yr</div>
                    <div className="text-white font-bold text-xs">₹{(choice.college?.fees_per_year / 100000).toFixed(1)}L</div>
                  </div>
                </div>
              </div>
            </Reorder.Item>
          ))}
        </Reorder.Group>
      )}

      <div className="bg-blue-600/5 border border-blue-500/10 rounded-2xl p-4 flex gap-4">
        <Download className="w-5 h-5 text-blue-400 shrink-0" />
        <div className="space-y-1">
          <p className="text-white text-xs font-bold">Export your list</p>
          <p className="text-slate-500 text-[10px] leading-relaxed">
            Once you are happy with your order, you can export it as a PDF or CSV to use during the actual counselling process.
          </p>
        </div>
      </div>
    </div>
  );
}


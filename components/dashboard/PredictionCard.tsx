'use client';

import { memo } from 'react';
import { motion } from 'framer-motion';
import { BookmarkPlus, ExternalLink, MapPin, Trophy, Info, GitCompare } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { type PredictionResult } from '@/lib/types';
import { cn } from '@/lib/utils';
import { useCompare } from '@/hooks/use-compare';

interface PredictionCardProps {
  result: PredictionResult;
  isSaved: boolean;
  onToggleSave: (result: PredictionResult) => void;
  index: number;
}

function PredictionCardComponent({ result, isSaved, onToggleSave, index }: PredictionCardProps) {
  const { probability, confidenceScore, reason, college, branch, closing_rank } = result;
  const { addToCompare, isInCompare, removeFromCompare } = useCompare();

  const isComparing = college ? isInCompare(college.id) : false;

  const probConfig = {
    safe: {
      color: 'text-emerald-400',
      bg: 'bg-emerald-400/10',
      border: 'border-emerald-500/20',
      label: 'Safe Match'
    },
    moderate: {
      color: 'text-amber-400',
      bg: 'bg-amber-400/10',
      border: 'border-amber-500/20',
      label: 'Moderate'
    },
    dream: {
      color: 'text-red-400',
      bg: 'bg-red-400/10',
      border: 'border-red-500/20',
      label: 'Dream / Ambitious'
    }
  }[probability];

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05, duration: 0.3 }}
      className="glass-card rounded-2xl p-5 border border-blue-900/30 hover:border-blue-500/40 transition-all group relative overflow-hidden flex flex-col h-full"
    >
      {/* Probability Badge */}
      <div className="flex justify-between items-start mb-4">
        <div className="flex flex-col gap-2">
          <div className={cn(
            "inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border",
            probConfig.bg, probConfig.color, probConfig.border
          )}>
            {probConfig.label}
          </div>
          {college?.type && (
            <div className="text-[10px] text-slate-500 font-semibold uppercase tracking-widest flex items-center gap-1.5">
              <Trophy className="w-3 h-3 text-blue-500/60" />
              {college.type} {college.nirf_rank ? `• #${college.nirf_rank} NIRF` : ''}
            </div>
          )}
        </div>
        
        <div className="flex items-center gap-2">
          {college && (
            <button 
              onClick={() => isComparing ? removeFromCompare(college.id) : addToCompare(college)}
              className={cn(
                "p-2 rounded-xl transition-all duration-300 border",
                isComparing 
                  ? "bg-emerald-600/20 text-emerald-400 border-emerald-500/30 shadow-lg shadow-emerald-600/10" 
                  : "bg-[#050816] text-slate-500 hover:text-blue-400 border-blue-900/30 hover:border-blue-500/30"
              )}
              title={isComparing ? "Remove from comparison" : "Add to comparison"}
            >
              <GitCompare className="w-4 h-4" />
            </button>
          )}
          
          <button 
            onClick={() => onToggleSave(result)}
            className={cn(
              "p-2 rounded-xl transition-all duration-300 border",
              isSaved 
                ? "bg-blue-600 text-white border-blue-500 shadow-lg shadow-blue-600/20" 
                : "bg-[#050816] text-slate-500 hover:text-blue-400 border-blue-900/30 hover:border-blue-500/30"
            )}
          >
            <BookmarkPlus className={cn("w-4 h-4", isSaved && "fill-current")} />
          </button>
        </div>
      </div>

      {/* College Info */}
      <div className="flex-1 mb-5">
        <h3 className="text-white font-bold text-base leading-tight mb-1 group-hover:text-blue-400 transition-colors line-clamp-2">
          {college?.name || 'Institution Data Unavailable'}
        </h3>
        <p className="text-blue-400 text-sm font-semibold mb-2">
          {branch?.branch_name || 'Allotted Engineering Branch'}
        </p>
        
        <div className="flex items-center gap-3 text-slate-500 text-xs">
          <div className="flex items-center gap-1">
            <MapPin className="w-3 h-3" />
            {college?.city}, {college?.state}
          </div>
        </div>
      </div>

      {/* Prediction Details */}
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-[#050816]/50 rounded-xl p-3 border border-blue-900/20">
            <div className="text-slate-500 text-[10px] mb-1 uppercase tracking-wider font-medium">Closing Rank</div>
            <div className="text-white font-bold text-base">{closing_rank.toLocaleString()}</div>
          </div>
          <div className="bg-[#050816]/50 rounded-xl p-3 border border-blue-900/20">
            <div className="text-slate-500 text-[10px] mb-1 uppercase tracking-wider font-medium">Confidence</div>
            <div className="text-white font-bold text-base flex items-center gap-1.5">
              {confidenceScore}%
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            </div>
          </div>
        </div>

        {/* Reason / Analysis */}
        <div className="bg-blue-600/5 rounded-xl p-3 border border-blue-500/10 relative group/reason">
          <div className="flex gap-2">
            <Info className="w-3.5 h-3.5 text-blue-400 shrink-0 mt-0.5" />
            <p className="text-[11px] text-slate-400 leading-relaxed italic">
              {reason}
            </p>
          </div>
        </div>

        {/* Action Bar */}
        <div className="flex items-center justify-between pt-4 border-t border-blue-900/20">
          <div className="flex-1 mr-4">
            <div className="flex justify-between text-[10px] text-slate-500 mb-1.5 font-medium">
              <span>Success Probability</span>
              <span>{confidenceScore}%</span>
            </div>
            <div className="w-full h-1.5 bg-[#050816] rounded-full overflow-hidden border border-blue-900/10">
              <motion.div 
                initial={{ width: 0 }}
                animate={{ width: `${confidenceScore}%` }}
                transition={{ duration: 1, delay: 0.5 }}
                className={cn(
                  "h-full shadow-[0_0_8px_rgba(37,99,235,0.4)]",
                  probability === 'safe' ? 'bg-emerald-400' :
                  probability === 'moderate' ? 'bg-amber-400' : 'bg-red-400'
                )} 
              />
            </div>
          </div>
          <Link href={`/college/${result.college_id}`}>
            <Button variant="ghost" className="h-9 text-xs gap-2 text-blue-400 hover:text-white hover:bg-blue-600/10 px-3 rounded-xl border border-transparent hover:border-blue-500/20 transition-all">
              Details <ExternalLink className="w-3.5 h-3.5" />
            </Button>
          </Link>
        </div>
      </div>
    </motion.div>
  );
}

export default memo(PredictionCardComponent);

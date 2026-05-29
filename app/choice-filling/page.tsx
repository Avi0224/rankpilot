'use client';

import { useState } from 'react';
import { motion, Reorder } from 'framer-motion';
import {
  GripVertical, X, Plus, Download, Zap, ListOrdered,
  TrendingUp, Shield, Star, AlertCircle
} from 'lucide-react';
import Navbar from '@/components/landing/Navbar';
import { Button } from '@/components/ui/button';

interface Choice {
  id: string;
  college: string;
  branch: string;
  type: string;
  closingRank: number;
  avgPkg: number;
  roiScore: number;
  tag?: 'dream' | 'moderate' | 'safe';
}

const initialChoices: Choice[] = [
  { id: '1', college: 'DTU Delhi', branch: 'CSE', type: 'State', closingRank: 3200, avgPkg: 11.0, roiScore: 8.4, tag: 'dream' },
  { id: '2', college: 'NIT Trichy', branch: 'CSE', type: 'NIT', closingRank: 4850, avgPkg: 12.5, roiScore: 8.7, tag: 'dream' },
  { id: '3', college: 'NIT Warangal', branch: 'CSE', type: 'NIT', closingRank: 7200, avgPkg: 11.5, roiScore: 8.6, tag: 'moderate' },
  { id: '4', college: 'NIT Surathkal', branch: 'CSE', type: 'NIT', closingRank: 7900, avgPkg: 11.8, roiScore: 8.5, tag: 'moderate' },
  { id: '5', college: 'IIIT Allahabad', branch: 'IT', type: 'IIIT', closingRank: 9800, avgPkg: 10.5, roiScore: 7.8, tag: 'safe' },
  { id: '6', college: 'NIT Rourkela', branch: 'CSE', type: 'NIT', closingRank: 14200, avgPkg: 10.5, roiScore: 8.3, tag: 'safe' },
];

const tagConfig = {
  dream: { label: 'Dream', className: 'dream-badge', icon: Star },
  moderate: { label: 'Moderate', className: 'moderate-badge', icon: AlertCircle },
  safe: { label: 'Safe', className: 'safe-badge', icon: Shield },
};

const typeColors: Record<string, string> = {
  NIT: 'text-blue-400',
  IIIT: 'text-cyan-400',
  State: 'text-teal-400',
};

export default function ChoiceFillingPage() {
  const [choices, setChoices] = useState<Choice[]>(initialChoices);
  const [optimized, setOptimized] = useState(false);

  const remove = (id: string) => setChoices(choices.filter((c) => c.id !== id));

  const autoOptimize = () => {
    const sorted = [...choices].sort((a, b) => {
      const tagOrder = { dream: 0, moderate: 1, safe: 2 };
      const aOrder = tagOrder[a.tag || 'safe'];
      const bOrder = tagOrder[b.tag || 'safe'];
      if (aOrder !== bOrder) return aOrder - bOrder;
      return b.roiScore - a.roiScore;
    });
    setChoices(sorted);
    setOptimized(true);
  };

  const sortByROI = () => {
    setChoices([...choices].sort((a, b) => b.roiScore - a.roiScore));
  };

  return (
    <div className="min-h-screen bg-[#050816]">
      <Navbar />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-16">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-8">
            <div>
              <h1 className="text-3xl font-bold text-white mb-2">Choice Filling Assistant</h1>
              <p className="text-slate-500">Drag to reorder your JoSAA preference list. Optimize for ROI or best fit.</p>
            </div>
            <div className="flex gap-3">
              <Button
                onClick={autoOptimize}
                className="bg-blue-600 hover:bg-blue-500 text-white gap-2 text-sm"
              >
                <Zap className="w-4 h-4" />
                Auto-Optimize
              </Button>
              <Button variant="outline" onClick={sortByROI} className="border-blue-500/30 text-slate-300 hover:text-white gap-2 text-sm">
                <TrendingUp className="w-4 h-4" />
                Sort by ROI
              </Button>
            </div>
          </div>

          {/* Stats bar */}
          <div className="grid grid-cols-3 gap-4 mb-6">
            {[
              { label: 'Dream Choices', value: choices.filter((c) => c.tag === 'dream').length, color: 'text-red-400' },
              { label: 'Moderate Choices', value: choices.filter((c) => c.tag === 'moderate').length, color: 'text-amber-400' },
              { label: 'Safe Choices', value: choices.filter((c) => c.tag === 'safe').length, color: 'text-emerald-400' },
            ].map((stat) => (
              <div key={stat.label} className="glass-card rounded-xl p-3 border border-blue-500/10 text-center">
                <div className={`text-2xl font-bold ${stat.color}`}>{stat.value}</div>
                <div className="text-slate-500 text-xs">{stat.label}</div>
              </div>
            ))}
          </div>

          {optimized && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center gap-2 px-4 py-3 rounded-xl bg-blue-600/10 border border-blue-500/25 text-blue-300 text-sm mb-4"
            >
              <Zap className="w-4 h-4" />
              List optimized! Dream choices first, then moderate, then safe. Within each category, sorted by ROI score.
            </motion.div>
          )}

          {/* Reorderable list */}
          <Reorder.Group axis="y" values={choices} onReorder={setChoices} className="space-y-3">
            {choices.map((choice, index) => {
              const tag = tagConfig[choice.tag || 'safe'];
              const TagIcon = tag.icon;
              return (
                <Reorder.Item
                  key={choice.id}
                  value={choice}
                  className="glass-card rounded-xl border border-blue-500/10 hover:border-blue-500/25 transition-all cursor-grab active:cursor-grabbing select-none"
                >
                  <div className="flex items-center gap-3 p-4">
                    {/* Rank number */}
                    <div className="w-7 h-7 rounded-lg bg-[#080f1e] border border-blue-900/30 flex items-center justify-center text-slate-500 text-xs font-bold flex-shrink-0">
                      {index + 1}
                    </div>

                    {/* Drag handle */}
                    <GripVertical className="w-4 h-4 text-slate-600 flex-shrink-0" />

                    {/* College info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className={`text-xs font-semibold ${typeColors[choice.type]}`}>{choice.type}</span>
                        <span className="text-white font-medium text-sm">{choice.college}</span>
                        <span className="text-blue-400/60 text-xs">— {choice.branch}</span>
                      </div>
                      <div className="flex items-center gap-3 mt-1">
                        <span className="text-slate-500 text-xs">Closing: {choice.closingRank.toLocaleString()}</span>
                        <span className="text-slate-500 text-xs">Avg: ₹{choice.avgPkg}L</span>
                        <span className="text-slate-500 text-xs">ROI: {choice.roiScore}/10</span>
                      </div>
                    </div>

                    {/* Tag */}
                    <div className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-semibold border ${tag.className} flex-shrink-0`}>
                      <TagIcon className="w-3 h-3" />
                      {tag.label}
                    </div>

                    {/* Remove */}
                    <button
                      onClick={() => remove(choice.id)}
                      className="text-slate-600 hover:text-red-400 transition-colors ml-2 flex-shrink-0"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </Reorder.Item>
              );
            })}
          </Reorder.Group>

          {/* Add more & export */}
          <div className="flex flex-col sm:flex-row gap-3 mt-6">
            <Button variant="outline" className="border-dashed border-blue-500/30 text-blue-400/60 hover:text-blue-400 hover:border-blue-500/50 gap-2 flex-1">
              <Plus className="w-4 h-4" />
              Add More Colleges
            </Button>
            <Button className="bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-400 border border-emerald-500/30 gap-2 sm:flex-none">
              <Download className="w-4 h-4" />
              Export as PDF
            </Button>
          </div>

          {/* Counselling tips */}
          <div className="mt-8 glass-card rounded-2xl p-5 border border-blue-500/10">
            <div className="flex items-center gap-2 mb-3">
              <ListOrdered className="w-4 h-4 text-blue-400" />
              <h3 className="text-white font-semibold text-sm">JoSAA Choice Filling Tips</h3>
            </div>
            <ul className="space-y-2 text-slate-400 text-xs">
              {[
                'Add ALL colleges you would be happy attending — more choices = better chance.',
                'Order by your preference, not just rank. Your dream college goes first.',
                'Add dream colleges at the top, even if the chance is low.',
                'Do not remove safe colleges — they are your backup if higher rounds do not work out.',
                'Floating candidates are upgraded automatically — you can only move up, not down.',
              ].map((tip, i) => (
                <li key={i} className="flex items-start gap-2">
                  <span className="w-4 h-4 rounded-full bg-blue-600/20 text-blue-400 text-[10px] font-bold flex items-center justify-center flex-shrink-0 mt-0.5">{i + 1}</span>
                  {tip}
                </li>
              ))}
            </ul>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Bookmark, Trash2, ExternalLink, GitCompare, ListOrdered, MapPin, TrendingUp } from 'lucide-react';
import Navbar from '@/components/landing/Navbar';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

const saved = [
  { id: '1', college: 'NIT Trichy', branch: 'Computer Science', type: 'NIT', state: 'Tamil Nadu', closingRank: 4850, avgPkg: 12.5, roiScore: 8.7, notes: 'First choice — check hostel availability' },
  { id: '2', college: 'DTU Delhi', branch: 'CSE', type: 'State', state: 'Delhi', closingRank: 3200, avgPkg: 11.0, roiScore: 8.4, notes: '' },
  { id: '3', college: 'NIT Warangal', branch: 'CSE', type: 'NIT', state: 'Telangana', closingRank: 7200, avgPkg: 11.5, roiScore: 8.6, notes: 'Strong alumni in Hyderabad' },
  { id: '4', college: 'IIIT Hyderabad', branch: 'CSE', type: 'IIIT', state: 'Telangana', closingRank: 2100, avgPkg: 14.0, roiScore: 7.5, notes: 'Dream option — fees are high' },
];

const typeColors: Record<string, string> = {
  NIT: 'text-blue-400 bg-blue-400/10 border-blue-400/25',
  IIIT: 'text-cyan-400 bg-cyan-400/10 border-cyan-400/25',
  State: 'text-teal-400 bg-teal-400/10 border-teal-400/25',
};

export default function SavedPage() {
  const [items, setItems] = useState(saved);

  const remove = (id: string) => setItems(items.filter((i) => i.id !== id));

  return (
    <div className="min-h-screen bg-[#050816]">
      <Navbar />

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-16">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <div className="flex items-start justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold text-white mb-2">Saved Colleges</h1>
              <p className="text-slate-500">{items.length} college{items.length !== 1 ? 's' : ''} in your shortlist.</p>
            </div>
            <Link href="/choice-filling">
              <Button className="bg-blue-600 hover:bg-blue-500 text-white gap-2 text-sm">
                <ListOrdered className="w-4 h-4" />
                Build Choice List
              </Button>
            </Link>
          </div>

          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <div className="w-16 h-16 rounded-2xl bg-blue-600/10 border border-blue-500/20 flex items-center justify-center mb-4">
                <Bookmark className="w-8 h-8 text-blue-400/40" />
              </div>
              <h3 className="text-white font-semibold text-lg mb-2">No Saved Colleges</h3>
              <p className="text-slate-500 text-sm mb-6 max-w-sm">Use the predictor to find colleges and save them here for quick access.</p>
              <Link href="/dashboard"><Button className="bg-blue-600 hover:bg-blue-500">Start Predicting</Button></Link>
            </div>
          ) : (
            <div className="space-y-4">
              {items.map((item, i) => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.06 }}
                  className="glass-card rounded-2xl p-5 border border-blue-500/10 hover:border-blue-500/25 transition-all"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 flex-wrap mb-1">
                        <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${typeColors[item.type]}`}>{item.type}</span>
                        <h3 className="text-white font-semibold text-sm">{item.college}</h3>
                        <span className="text-blue-400/60 text-xs">— {item.branch}</span>
                      </div>
                      <div className="flex flex-wrap gap-4 text-xs text-slate-500">
                        <span className="flex items-center gap-1"><MapPin className="w-3 h-3" />{item.state}</span>
                        <span>Closing Rank: {item.closingRank.toLocaleString()}</span>
                        <span><TrendingUp className="inline w-3 h-3 mr-0.5" />₹{item.avgPkg}L avg</span>
                        <span>ROI: {item.roiScore}/10</span>
                      </div>
                      {item.notes && (
                        <div className="mt-2 px-3 py-1.5 rounded-lg bg-blue-600/8 border border-blue-500/15 text-blue-300/70 text-xs">
                          {item.notes}
                        </div>
                      )}
                    </div>

                    <div className="flex items-center gap-2">
                      <Link href={`/college/${item.id}`}>
                        <Button variant="ghost" size="sm" className="text-slate-500 hover:text-white text-xs gap-1">
                          <ExternalLink className="w-3 h-3" />Details
                        </Button>
                      </Link>
                      <Link href="/compare">
                        <Button variant="ghost" size="sm" className="text-slate-500 hover:text-white text-xs gap-1">
                          <GitCompare className="w-3 h-3" />Compare
                        </Button>
                      </Link>
                      <button
                        onClick={() => remove(item.id)}
                        className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-600 hover:text-red-400 hover:bg-red-400/10 transition-all"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}

'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { GitCompare, X, ArrowRight, Trash2 } from 'lucide-react';
import { useCompare } from '@/hooks/use-compare';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export default function ComparisonBar() {
  const { selectedColleges, removeFromCompare, clearCompare } = useCompare();

  if (selectedColleges.length === 0) return null;

  return (
    <motion.div
      initial={{ y: 100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      exit={{ y: 100, opacity: 0 }}
      className="fixed bottom-6 inset-x-4 md:inset-x-auto md:right-8 md:left-auto z-50"
    >
      <div className="glass shadow-2xl rounded-[2rem] border border-blue-500/30 p-2 pl-6 flex items-center gap-6 backdrop-blur-2xl">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center shadow-lg shadow-blue-600/40">
            <GitCompare className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="text-white font-bold text-sm">{selectedColleges.length} Colleges</div>
            <div className="text-[10px] text-slate-400 font-medium uppercase tracking-widest">In Comparison</div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {selectedColleges.map((college) => (
            <motion.div
              layout
              key={college.id}
              className="relative group hidden sm:block"
            >
              <div className="w-10 h-10 rounded-full bg-[#0B1120] border border-blue-900/30 flex items-center justify-center text-[10px] font-bold text-blue-400">
                {college.short_name?.slice(0, 3) || 'CLG'}
              </div>
              <button
                onClick={() => removeFromCompare(college.id)}
                className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-red-500 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <X className="w-2.5 h-2.5" />
              </button>
            </motion.div>
          ))}
          
          <div className="h-8 w-px bg-blue-900/30 mx-2 hidden sm:block" />

          <div className="flex items-center gap-2">
            <button 
              onClick={clearCompare}
              className="p-2.5 rounded-xl text-slate-500 hover:text-red-400 hover:bg-red-400/10 transition-all"
              title="Clear All"
            >
              <Trash2 className="w-4 h-4" />
            </button>
            
            <Link href="/compare">
              <Button className="bg-blue-600 hover:bg-blue-500 text-white rounded-2xl px-6 h-11 font-bold shadow-lg shadow-blue-600/20 group">
                Compare Now
                <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ChevronDown, Check, SlidersHorizontal, MapPin, Building2, BookOpen, IndianRupee } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { INDIAN_STATES, BRANCHES, type CollegeType } from '@/lib/types';
import { cn } from '@/lib/utils';

interface AdvancedFiltersProps {
  onFilterChange: (filters: any) => void;
  initialFilters: any;
}

const COLLEGE_TYPES: CollegeType[] = ['IIT', 'NIT', 'IIIT', 'GFTIs', 'State'];

export default function AdvancedFilters({ onFilterChange, initialFilters }: AdvancedFiltersProps) {
  const [filters, setFilters] = useState(initialFilters);
  const [activeSection, setActiveSection] = useState<string | null>(null);

  const toggleFilter = (key: string, value: any) => {
    const currentValues = filters[key] || [];
    const newValues = currentValues.includes(value)
      ? currentValues.filter((v: any) => v !== value)
      : [...currentValues, value];
    
    const newFilters = { ...filters, [key]: newValues };
    setFilters(newFilters);
    onFilterChange(newFilters);
  };

  const clearFilters = () => {
    const cleared = {
      instituteTypes: [],
      states: [],
      branches: [],
      minPackage: 0,
      maxFees: 2000000
    };
    setFilters(cleared);
    onFilterChange(cleared);
  };

  const sections = [
    { id: 'types', label: 'Institute Type', icon: Building2, key: 'instituteTypes', options: COLLEGE_TYPES },
    { id: 'states', label: 'Preferred States', icon: MapPin, key: 'states', options: INDIAN_STATES },
    { id: 'branches', label: 'Preferred Branches', icon: BookOpen, key: 'branches', options: BRANCHES },
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-bold text-white flex items-center gap-2">
          <SlidersHorizontal className="w-4 h-4 text-blue-500" />
          Advanced Filters
        </h3>
        <button 
          onClick={clearFilters}
          className="text-[10px] font-bold text-blue-500 hover:text-blue-400 uppercase tracking-widest"
        >
          Reset All
        </button>
      </div>

      <div className="space-y-2">
        {sections.map((section) => (
          <div key={section.id} className="glass-card rounded-2xl overflow-hidden border-blue-900/20">
            <button
              onClick={() => setActiveSection(activeSection === section.id ? null : section.id)}
              className="w-full flex items-center justify-between p-4 hover:bg-white/5 transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-blue-600/10 flex items-center justify-center">
                  <section.icon className="w-4 h-4 text-blue-400" />
                </div>
                <div className="text-left">
                  <div className="text-xs font-bold text-white uppercase tracking-wider">{section.label}</div>
                  <div className="text-[10px] text-slate-500">
                    {filters[section.key]?.length || 0} selected
                  </div>
                </div>
              </div>
              <ChevronDown className={cn("w-4 h-4 text-slate-500 transition-transform", activeSection === section.id && "rotate-180")} />
            </button>

            <AnimatePresence>
              {activeSection === section.id && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="px-4 pb-4 overflow-hidden"
                >
                  <div className="pt-2 flex flex-wrap gap-2 max-h-48 overflow-y-auto scrollbar-none">
                    {section.options.map((opt) => (
                      <button
                        key={opt}
                        onClick={() => toggleFilter(section.key, opt)}
                        className={cn(
                          "px-3 py-1.5 rounded-xl text-[10px] font-bold border transition-all flex items-center gap-1.5",
                          filters[section.key]?.includes(opt)
                            ? "bg-blue-600 border-blue-500 text-white"
                            : "bg-[#050816] border-blue-900/30 text-slate-500 hover:border-blue-500/30"
                        )}
                      >
                        {filters[section.key]?.includes(opt) && <Check className="w-3 h-3" />}
                        {opt}
                      </button>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        ))}
      </div>

      {/* Numerical Sliders / Inputs */}
      <div className="glass-card rounded-2xl p-4 border-blue-900/20 space-y-4">
        <div>
          <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block mb-3">Min. Avg Package (LPA)</label>
          <div className="flex items-center gap-4">
            <input 
              type="range" 
              min="0" 
              max="50" 
              step="1"
              value={filters.minPackage || 0}
              onChange={(e) => {
                const val = parseInt(e.target.value);
                setFilters({ ...filters, minPackage: val });
                onFilterChange({ ...filters, minPackage: val });
              }}
              className="flex-1 accent-blue-600 h-1.5 bg-blue-900/20 rounded-full"
            />
            <span className="text-xs font-bold text-blue-400 w-8">{filters.minPackage || 0}L</span>
          </div>
        </div>

        <div>
          <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block mb-3">Max. Yearly Fees</label>
          <div className="flex items-center gap-4">
            <input 
              type="range" 
              min="0" 
              max="1000000" 
              step="50000"
              value={filters.maxFees || 1000000}
              onChange={(e) => {
                const val = parseInt(e.target.value);
                setFilters({ ...filters, maxFees: val });
                onFilterChange({ ...filters, maxFees: val });
              }}
              className="flex-1 accent-blue-600 h-1.5 bg-blue-900/20 rounded-full"
            />
            <span className="text-xs font-bold text-blue-400 w-12">
              {filters.maxFees >= 1000000 ? 'Any' : `${(filters.maxFees / 100000).toFixed(1)}L`}
            </span>
          </div>
        </div>
      </div>
      
      {/* Filter Chips */}
      <div className="flex flex-wrap gap-2 pt-2">
        {filters.instituteTypes?.map((t: string) => (
          <Badge key={t} variant="secondary" className="bg-blue-600/10 text-blue-400 border-blue-500/20 text-[9px] uppercase tracking-tighter gap-1">
            {t} <X className="w-2.5 h-2.5 cursor-pointer" onClick={() => toggleFilter('instituteTypes', t)} />
          </Badge>
        ))}
        {filters.states?.map((s: string) => (
          <Badge key={s} variant="secondary" className="bg-emerald-600/10 text-emerald-400 border-emerald-500/20 text-[9px] uppercase tracking-tighter gap-1">
            {s} <X className="w-2.5 h-2.5 cursor-pointer" onClick={() => toggleFilter('states', s)} />
          </Badge>
        ))}
      </div>
    </div>
  );
}

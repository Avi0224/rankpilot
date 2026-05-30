'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { type College } from '@/types';
import { toast } from 'sonner';

export interface ComparisonContextType {
  selectedColleges: College[];
  addToCompare: (college: College) => void;
  removeFromCompare: (collegeId: string) => void;
  clearCompare: () => void;
  isInCompare: (collegeId: string) => boolean;
}

export const ComparisonContext = createContext<ComparisonContextType | undefined>(undefined);

export function ComparisonProvider({ children }: { children: React.ReactNode }) {
  const [selectedColleges, setSelectedColleges] = useState<College[]>([]);

  // Persist in localStorage
  useEffect(() => {
    const saved = localStorage.getItem('rankpilot_compare');
    if (saved) {
      try {
        setSelectedColleges(JSON.parse(saved));
      } catch (e) {
        // Silently fail
      }
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('rankpilot_compare', JSON.stringify(selectedColleges));
  }, [selectedColleges]);

  const addToCompare = (college: College) => {
    if (selectedColleges.find(c => c.id === college.id)) {
      toast.info(`${college.short_name || 'College'} is already in comparison`);
      return;
    }
    if (selectedColleges.length >= 2) {
      toast.error('You can compare up to 2 colleges at a time');
      return;
    }
    setSelectedColleges([...selectedColleges, college]);
    toast.success(`Added ${college.short_name || 'College'} to compare`);
  };

  const removeFromCompare = (collegeId: string) => {
    setSelectedColleges(selectedColleges.filter(c => c.id !== collegeId));
  };

  const clearCompare = () => {
    setSelectedColleges([]);
  };

  const isInCompare = (collegeId: string) => {
    return selectedColleges.some(c => c.id === collegeId);
  };

  return (
    <ComparisonContext.Provider value={{
      selectedColleges,
      addToCompare,
      removeFromCompare,
      clearCompare,
      isInCompare
    }}>
      {children}
    </ComparisonContext.Provider>
  );
}

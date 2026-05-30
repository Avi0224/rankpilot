'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { type College } from '@/types';

export interface RecentlyViewedContextType {
  recentlyViewed: College[];
  addToRecentlyViewed: (college: College) => void;
}

export const RecentlyViewedContext = createContext<RecentlyViewedContextType | undefined>(undefined);

export function RecentlyViewedProvider({ children }: { children: React.ReactNode }) {
  const [recentlyViewed, setRecentlyViewed] = useState<College[]>([]);

  useEffect(() => {
    const saved = localStorage.getItem('rankpilot_recent');
    if (saved) {
      try {
        setRecentlyViewed(JSON.parse(saved));
      } catch (e) {}
    }
  }, []);

  const addToRecentlyViewed = (college: College) => {
    setRecentlyViewed(prev => {
      const filtered = prev.filter(c => c.id !== college.id);
      const next = [college, ...filtered].slice(0, 10);
      localStorage.setItem('rankpilot_recent', JSON.stringify(next));
      return next;
    });
  };

  return (
    <RecentlyViewedContext.Provider value={{ recentlyViewed, addToRecentlyViewed }}>
      {children}
    </RecentlyViewedContext.Provider>
  );
}

'use client';

import { useContext } from 'react';
import { ComparisonContext } from '@/providers/comparison-provider';

export function useCompare() {
  const context = useContext(ComparisonContext);
  if (context === undefined) {
    throw new Error('useCompare must be used within a ComparisonProvider');
  }
  return context;
}

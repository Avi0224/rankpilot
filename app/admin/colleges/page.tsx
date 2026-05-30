'use client';

export const dynamic = 'force-dynamic';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Building2, Search, Plus, Edit, Trash2, ExternalLink,
  X, Save, Loader2, AlertTriangle, CheckCircle2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { supabase } from '@/lib/supabase';
import { type College, type CollegeType } from '@/types';
import { INDIAN_STATES } from '@/constants';

const COLLEGE_TYPES: CollegeType[] = ['IIT', 'NIT', 'IIIT', 'GFTIs', 'State'];

const typeColors: Record<string, string> = {
  NIT: 'text-blue-400 bg-blue-400/10 border-blue-400/25',
  IIIT: 'text-cyan-400 bg-cyan-400/10 border-cyan-400/25',
  State: 'text-teal-400 bg-teal-400/10 border-teal-400/25',
  IIT: 'text-orange-400 bg-orange-400/10 border-orange-400/25',
  GFTIs: 'text-slate-400 bg-slate-400/10 border-slate-400/25',
};

interface CollegeFormData {
  name: string;
  short_name: string;
  state: string;
  city: string;
  type: CollegeType;
  nirf_rank: number | null;
  avg_package: number | null;
  median_package: number | null;
  highest_package: number | null;
  fees_per_year: number | null;
  hostel_fees_per_year: number | null;
  campus_size_acres: number | null;
  established_year: number | null;
  total_seats: number | null;
  placement_percentage: number | null;
  roi_score: number | null;
  website: string;
}

const emptyForm: CollegeFormData = {
  name: '', short_name: '', state: '', city: '', type: 'NIT',
  nirf_rank: null, avg_package: null, median_package: null, highest_package: null,
  fees_per_year: null, hostel_fees_per_year: null, campus_size_acres: null,
  established_year: null, total_seats: null, placement_percentage: null,
  roi_score: null, website: ''
};

import { supabase } from './supabase';
import { Database, Category, Quota, Gender, PredictionResult } from './types';

// Standardized Normalization Helpers
export const normalizeQuota = (quota: string): Quota => {
  const q = quota.trim().toLowerCase();
  const map: Record<string, Quota> = {
    'all india': 'AI',
    'ai': 'AI',
    'home state': 'HS',
    'hs': 'HS',
    'other state': 'OS',
    'os': 'OS',
  };
  return map[q] || (quota.trim().toUpperCase() as Quota);
};

export const normalizeCategory = (category: string): Category => {
  const c = category.trim().toLowerCase();
  const map: Record<string, Category> = {
    'open': 'OPEN',
    'general': 'OPEN',
    'obc-ncl': 'OBC-NCL',
    'obc': 'OBC-NCL',
    'sc': 'SC',
    'st': 'ST',
    'ews': 'EWS',
  };
  return map[c] || (category.trim().toUpperCase() as Category);
};

export const normalizeGender = (gender: string): Gender => {
  const lower = gender.trim().toLowerCase();
  if (lower.includes('female')) return 'Female-only';
  return 'Gender-Neutral';
};

/**
 * Predicts colleges based on user rank and criteria.
 * Production-ready implementation with robust filtering and classification.
 */
export const predictColleges = async (params: {
  rank: number;
  category: string;
  quota: string;
  gender: string;
  year?: number;
}): Promise<PredictionResult[]> => {
  const { rank, category, quota, gender, year } = params;

  // 1. Apply strict normalization for database compatibility
  const finalCategory = normalizeCategory(category);
  const finalQuota = normalizeQuota(quota);
  const finalGender = normalizeGender(gender);

  // 2. Build the primary Supabase query
  // Using !left joins to ensure we get data even if relations are partially missing
  let query = supabase
    .from('cutoffs')
    .select(`
      *,
      college:colleges!left(*),
      branch:branches!left(*)
    `)
    .eq('category', finalCategory)
    .eq('quota', finalQuota)
    .eq('gender', finalGender)
    .lte('opening_rank', rank)
    .gte('closing_rank', rank);

  if (year) {
    query = query.eq('year', year);
  }

  const { data, error } = await query.order('closing_rank', { ascending: true });

  if (error) {
    console.error('Prediction Engine Error:', error.message);
    throw error;
  }

  if (!data || data.length === 0) return [];

  // 3. Transform and classify results
  return data.map((item: any): PredictionResult => {
    const closingRank = item.closing_rank;
    const diffPercent = ((closingRank - rank) / rank) * 100;
    
    let probability: 'safe' | 'moderate' | 'dream' = 'dream';
    let confidenceScore = 0;

    // Classification Algorithm
    if (diffPercent > 15) {
      probability = 'safe';
      confidenceScore = Math.min(98, 75 + diffPercent);
    } else if (diffPercent >= 0) {
      probability = 'moderate';
      confidenceScore = 50 + (diffPercent * 3);
    } else {
      probability = 'dream';
      confidenceScore = Math.max(5, 30 + diffPercent);
    }

    return {
      ...item,
      probability,
      confidenceScore: Math.round(confidenceScore)
    };
  });
};

/**
 * College metadata queries
 */
export const getColleges = async () => {
  const { data, error } = await supabase
    .from('colleges')
    .select('*')
    .order('nirf_rank', { ascending: true, nullsFirst: false });
  if (error) throw error;
  return data;
};

export const getCollegeById = async (id: string) => {
  const { data, error } = await supabase
    .from('colleges')
    .select('*, branches(*)')
    .eq('id', id)
    .single();
  if (error) throw error;
  return data;
};

/**
 * User data management
 */
export const toggleSaveCollege = async (userId: string, collegeId: string, branchId?: string) => {
  const { data: existing } = await supabase
    .from('saved_colleges')
    .select('id')
    .eq('user_id', userId)
    .eq('college_id', collegeId)
    .eq('branch_id', branchId)
    .maybeSingle();

  if (existing) {
    await supabase.from('saved_colleges').delete().eq('id', existing.id);
    return false;
  } else {
    await supabase.from('saved_colleges').insert({
      user_id: userId,
      college_id: collegeId,
      branch_id: branchId
    });
    return true;
  }
};

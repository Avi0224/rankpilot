import { supabase } from './supabase';
import { Database, Category, Quota, Gender, PredictionResult, PredictorParams } from './types';

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
export const predictColleges = async (params: PredictorParams): Promise<PredictionResult[]> => {
  const { 
    rank, category, quota, gender, year, 
    instituteTypes, states, branches, minPackage, maxFees 
  } = params;

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

  // Apply Advanced Filters
  if (instituteTypes && instituteTypes.length > 0) {
    query = query.in('colleges.type', instituteTypes);
  }
  if (states && states.length > 0) {
    query = query.in('colleges.state', states);
  }
  if (branches && branches.length > 0) {
    query = query.in('branches.branch_name', branches);
  }
  if (minPackage) {
    query = query.gte('colleges.avg_package', minPackage);
  }
  if (maxFees) {
    query = query.lte('colleges.fees_per_year', maxFees);
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
    let reason = '';

    // Advanced Classification Algorithm with Reasons
    if (diffPercent > 20) {
      probability = 'safe';
      confidenceScore = Math.min(99, 85 + diffPercent / 2);
      reason = 'Highly likely based on consistent historical cutoff trends.';
    } else if (diffPercent > 5) {
      probability = 'safe';
      confidenceScore = 70 + diffPercent;
      reason = 'Very safe option with a comfortable rank margin.';
    } else if (diffPercent >= 0) {
      probability = 'moderate';
      confidenceScore = 40 + (diffPercent * 5);
      reason = 'Borderline match. Admission is probable but competitive.';
    } else if (diffPercent > -5) {
      probability = 'dream';
      confidenceScore = 20 + (diffPercent + 5) * 4;
      reason = 'Ambitious target. Admission depends on slight trend shifts.';
    } else {
      probability = 'dream';
      confidenceScore = Math.max(5, 10 + diffPercent);
      reason = 'Highly ambitious. Significant cutoff drop required.';
    }

    return {
      ...item,
      probability,
      confidenceScore: Math.round(confidenceScore),
      reason
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
    .select('*, branches(*), cutoffs(*)')
    .eq('id', id)
    .single();
  if (error) throw error;
  return data;
};

export const getCollegesByIds = async (ids: string[]) => {
  if (!ids.length) return [];
  const { data, error } = await supabase
    .from('colleges')
    .select('*, branches(*)')
    .in('id', ids);
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

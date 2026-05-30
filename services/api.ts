import { supabase } from './supabase';
import { Category, Quota, Gender, PredictionResult, PredictorParams } from '@/types';
import { unstable_cache } from 'next/cache';

/**
 * CACHE CONFIGURATION
 */
const CACHE_TTL = 3600; // 1 hour in seconds for Next.js cache
const CLIENT_CACHE_TTL = 5 * 60 * 1000; // 5 minutes for client-side Map

// Client-side L1 cache
const predictionCache = new Map<string, { data: PredictionResult[]; timestamp: number }>();

/**
 * CACHE KEYS & TAGS
 */
export const CACHE_TAGS = {
  COLLEGES: 'colleges',
  CUTOFFS: 'cutoffs',
  PREDICTIONS: 'predictions'
};

const getPredictionCacheKey = (params: PredictorParams) => 
  `pred:${params.rank}-${params.category}-${params.quota}-${params.gender}-${params.year || 'all'}-${JSON.stringify(params.instituteTypes || [])}`;

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
  const c = category.trim().toUpperCase();
  const map: Record<string, Category> = {
    'GEN': 'OPEN',
    'GENERAL': 'OPEN',
    'OPEN': 'OPEN',
    'OBC': 'OBC-NCL',
    'OBC-NCL': 'OBC-NCL',
    'SC': 'SC',
    'ST': 'ST',
    'EWS': 'EWS',
  };
  return map[c] || (c as Category);
};

export const normalizeBranch = (branch: string): string => {
  const b = branch.trim().toUpperCase();
  const map: Record<string, string> = {
    'CSE': 'Computer Science Engineering',
    'CS': 'Computer Science Engineering',
    'ECE': 'Electronics and Communication Engineering',
    'EE': 'Electrical Engineering',
    'ME': 'Mechanical Engineering',
    'CE': 'Civil Engineering',
    'IT': 'Information Technology',
    'AI': 'Artificial Intelligence / ML',
    'DS': 'Data Science',
  };
  return map[b] || branch;
};

export const normalizeGender = (gender: string): Gender => {
  const lower = gender.trim().toLowerCase();
  if (lower.includes('female')) return 'Female-only';
  return 'Gender-Neutral';
};

/**
 * Predicts colleges based on user rank and criteria.
 * Multi-layer caching: Client-side Map -> Server-side RPC.
 */
export const predictColleges = async (params: PredictorParams): Promise<PredictionResult[]> => {
  const { 
    rank, category, quota, gender, year, 
    instituteTypes, states, branches
  } = params;

  // 1. Client-Side L1 Cache Check
  const clientKey = getPredictionCacheKey(params);
  const cached = predictionCache.get(clientKey);
  if (cached && Date.now() - cached.timestamp < CLIENT_CACHE_TTL) {
    return cached.data;
  }

  // 2. Normalization (Mapping Layer)
  const finalCategory = normalizeCategory(category);
  const finalQuota = normalizeQuota(quota);
  const finalGender = normalizeGender(gender);
  const finalBranches = branches?.map(normalizeBranch);

  // 3. Call Server-Side RPC
  console.log('[DEBUG] Mapping Layer Output:', {
    rank,
    finalCategory,
    finalQuota,
    finalGender,
    finalBranches
  });

  const { data, error } = await supabase.rpc('get_cutoffs', {
  rank_input: rank,
  category_input: finalCategory,
  branch_input: finalBranches?.[0] || branches?.[0]
});

  if (error) {
    console.error('[DEBUG] Supabase RPC Error:', error);
    return predictCollegesClientSide(params);
  }

  if (!data || data.length === 0) {
    console.log('[DEBUG] Empty result set returned from RPC');
  } else {
    console.log(`[DEBUG] RPC Success: Returned ${data.length} results`);
  }

  // 4. Map and Cache Results
  const results = (data || []).map((item: any): PredictionResult => ({
    ...item,
    confidenceScore: item.confidence_score,
    cutoff: {
      id: item.id,
      college_id: item.college_id,
      branch_id: item.branch_id,
      year: item.year,
      round: item.round,
      category: item.category,
      quota: item.quota,
      gender: item.gender,
      opening_rank: item.opening_rank,
      closing_rank: item.closing_rank,
      created_at: new Date().toISOString()
    }
  }));

  predictionCache.set(clientKey, { data: results, timestamp: Date.now() });
  return results;
};

/**
 * Fallback client-side prediction logic (used if RPC is unavailable)
 */
async function predictCollegesClientSide(params: PredictorParams): Promise<PredictionResult[]> {
  const { rank, category, quota, gender, year, instituteTypes, states, branches } = params;
  
  const finalCategory = normalizeCategory(category);
  const finalQuota = normalizeQuota(quota);
  const finalGender = normalizeGender(gender);
  const finalBranches = branches?.map(normalizeBranch);

  let query = supabase
    .from('cutoffs')
    .select(`
      id, year, round, opening_rank, closing_rank, category, quota, gender,
      college_id, branch_id,
      college:colleges!inner(id, name, short_name, state, city, type, nirf_rank, avg_package, fees_per_year),
      branch:branches!inner(id, branch_name)
    `)
    .eq('category', finalCategory)
    .eq('quota', finalQuota)
    .eq('gender', finalGender)
    .lte('opening_rank', rank)
    .gte('closing_rank', rank);

  if (year) query = query.eq('year', year);
  if (instituteTypes?.length) query = query.in('colleges.type', instituteTypes);
  if (states?.length) query = query.in('colleges.state', states);
  if (finalBranches?.length) query = query.in('branches.branch_name', finalBranches);

  const { data, error } = await query.order('closing_rank', { ascending: true }).limit(200);
  if (error) throw error;

  return (data || []).map((item: any): PredictionResult => {
    const diffPercent = ((item.closing_rank - rank) / rank) * 100;
    
    let probability: 'safe' | 'moderate' | 'dream' = 'dream';
    let confidenceScore = 0;
    let reason = '';

    if (diffPercent > 20) {
      probability = 'safe';
      confidenceScore = 85;
      reason = 'Highly likely based on consistent historical cutoff trends.';
    } else if (diffPercent > 5) {
      probability = 'safe';
      confidenceScore = 70;
      reason = 'Very safe option with a comfortable rank margin.';
    } else if (diffPercent >= 0) {
      probability = 'moderate';
      confidenceScore = 40;
      reason = 'Borderline match. Admission is probable but competitive.';
    } else {
      probability = 'dream';
      confidenceScore = 15;
      reason = 'Ambitious target. Admission depends on slight trend shifts.';
    }

    return {
      ...item,
      probability,
      confidenceScore,
      reason,
      cutoff: item // Matching the PredictionResult structure
    };
  });
}

/**
 * College metadata queries - Wrapped in Next.js unstable_cache
 */
export const getColleges = unstable_cache(
  async () => {
    const { data, error } = await supabase
      .from('colleges')
      .select('id, name, short_name, state, city, type, nirf_rank, avg_package, median_package, highest_package, fees_per_year, placement_percentage')
      .order('nirf_rank', { ascending: true, nullsFirst: false });
    if (error) throw error;
    return data;
  },
  ['colleges-list'],
  { revalidate: CACHE_TTL, tags: [CACHE_TAGS.COLLEGES] }
);

export const getCollegeById = (id: string) => unstable_cache(
  async () => {
    const { data, error } = await supabase
      .from('colleges')
      .select(`
        *,
        branches (id, branch_name, total_seats, avg_package),
        cutoffs (id, year, round, category, quota, gender, opening_rank, closing_rank, branch_id)
      `)
      .eq('id', id)
      .single();
    if (error) throw error;
    return data;
  },
  [`college-detail-${id}`],
  { revalidate: CACHE_TTL, tags: [CACHE_TAGS.COLLEGES, `college-${id}`] }
)();

export const getCollegesByIds = (ids: string[]) => unstable_cache(
  async () => {
    if (!ids.length) return [];
    const { data, error } = await supabase
      .from('colleges')
      .select('id, name, short_name, state, city, type, nirf_rank, avg_package, median_package, highest_package, fees_per_year, hostel_fees_per_year, placement_percentage, roi_score, campus_size_acres, established_year')
      .in('id', ids);
    if (error) throw error;
    return data;
  },
  [`colleges-compare-${ids.sort().join('-')}`],
  { revalidate: CACHE_TTL, tags: [CACHE_TAGS.COLLEGES] }
)();

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

export const getSavedColleges = async (userId: string) => {
  const { data, error } = await supabase
    .from('saved_colleges')
    .select(`
      *,
      college:colleges(id, name, type, avg_package, fees_per_year, nirf_rank),
      branch:branches(id, branch_name)
    `)
    .eq('user_id', userId)
    .order('priority', { ascending: true });
  
  if (error) throw error;
  return data;
};

export const updateSavedPriority = async (id: string, priority: number) => {
  const { error } = await supabase
    .from('saved_colleges')
    .update({ priority })
    .eq('id', id);
  if (error) throw error;
};

export const getCutoffTrends = async (collegeId: string, branchId: string, category: string, quota: string, gender: string) => {
  const { data, error } = await supabase
    .from('cutoffs')
    .select('year, closing_rank')
    .eq('college_id', collegeId)
    .eq('branch_id', branchId)
    .eq('category', category)
    .eq('quota', quota)
    .eq('gender', gender)
    .order('year', { ascending: true });
  
  if (error) throw error;
  return data;
};



import { supabase } from './supabase';
import { Database } from './types';

type Tables = Database['public']['Tables'];

// College Queries
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

// Predictor Query
export const predictColleges = async (params: {
  rank: number;
  category: string;
  quota: string;
  gender: string;
  year?: number;
}) => {
  const { rank, category, quota, gender, year = 2023 } = params;

  // Fetch cutoffs that match the criteria
  const { data, error } = await supabase
    .from('cutoffs')
    .select(`
      *,
      college:colleges(*),
      branch:branches(*)
    `)
    .eq('category', category)
    .eq('quota', quota)
    .eq('gender', gender)
    .eq('year', year)
    .gte('closing_rank', rank * 0.5) // Optimization: don't fetch extremely unrealistic ones
    .order('closing_rank', { ascending: true });

  if (error) throw error;

  // Process results into Safe/Moderate/Dream
  return data.map(item => {
    const diff = item.closing_rank - rank;
    let probability: 'safe' | 'moderate' | 'dream' = 'dream';
    let confidenceScore = 0;

    if (diff > rank * 0.2) {
      probability = 'safe';
      confidenceScore = Math.min(95, 70 + (diff / rank) * 100);
    } else if (diff >= 0) {
      probability = 'moderate';
      confidenceScore = 50 + (diff / rank) * 100;
    } else if (Math.abs(diff) < rank * 0.1) {
      probability = 'dream';
      confidenceScore = 30 + (diff / rank) * 100;
    } else {
      probability = 'dream';
      confidenceScore = Math.max(5, 20 + (diff / rank) * 100);
    }

    return {
      ...item,
      probability,
      confidenceScore: Math.round(confidenceScore)
    };
  });
};

// Saved Colleges
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

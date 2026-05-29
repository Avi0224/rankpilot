export type CollegeType = 'IIT' | 'NIT' | 'IIIT' | 'GFTIs' | 'State';
export type Category = 'OPEN' | 'OBC-NCL' | 'SC' | 'ST' | 'EWS' | 'OPEN-PwD';
export type Quota = 'AI' | 'HS' | 'OS';
export type Gender = 'Gender-Neutral' | 'Female-only';
export type CounsellingType = 'JoSAA' | 'CSAB' | 'JAC Delhi' | 'COMEDK' | 'MHT CET' | 'State';

export const CATEGORIES: Category[] = ['OPEN', 'OBC-NCL', 'SC', 'ST', 'EWS', 'OPEN-PwD'];
export const QUOTAS: { label: string; value: Quota }[] = [
  { label: 'All India', value: 'AI' },
  { label: 'Home State', value: 'HS' },
  { label: 'Other State', value: 'OS' },
];
export const GENDERS: { label: string; value: Gender }[] = [
  { label: 'Gender-Neutral', value: 'Gender-Neutral' },
  { label: 'Female-only', value: 'Female-only' },
];

export interface College {
  id: string;
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
  image_url: string | null;
  website: string | null;
  accreditation: string | null;
  created_at: string;
}

export interface Branch {
  id: string;
  college_id: string;
  branch_name: string;
  branch_code: string;
  total_seats: number;
  avg_package: number | null;
  created_at: string;
}

export interface Cutoff {
  id: string;
  college_id: string;
  branch_id: string;
  year: number;
  round: number;
  category: Category;
  quota: Quota;
  gender: Gender;
  opening_rank: number;
  closing_rank: number;
  created_at: string;
}

export interface UserProfile {
  id: string;
  name: string | null;
  email: string | null;
  phone: string | null;
  jee_rank: number | null;
  category: Category | null;
  gender: string | null;
  home_state: string | null;
  is_admin: boolean;
  created_at: string;
  updated_at: string;
}

export interface SavedCollege {
  id: string;
  user_id: string;
  college_id: string;
  branch_id: string | null;
  notes: string | null;
  priority: number;
  created_at: string;
}

export interface ComparisonList {
  id: string;
  user_id: string;
  name: string;
  counselling_type: string;
  preferences: any[];
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface ChoicePreference {
  college_id: string;
  branch_id: string;
  college_name: string;
  branch_name: string;
  closing_rank: number;
  priority: number;
}

export interface PredictorInput {
  rank: number;
  category: Category;
  gender: string;
  home_state: string;
  preferredBranches: string[];
  budgetMax: number;
  preferredStates: string[];
}

export interface PredictionResult {
  college: College;
  branch: Branch;
  cutoff: Cutoff;
  probability: 'safe' | 'moderate' | 'dream';
  confidenceScore: number;
}

export type Database = {
  public: {
    Tables: {
      colleges: { Row: College; Insert: Omit<College, 'id' | 'created_at'>; Update: Partial<Omit<College, 'id'>> };
      branches: { Row: Branch; Insert: Omit<Branch, 'id' | 'created_at'>; Update: Partial<Omit<Branch, 'id'>> };
      cutoffs: { Row: Cutoff; Insert: Omit<Cutoff, 'id' | 'created_at'>; Update: Partial<Omit<Cutoff, 'id'>> };
      user_profiles: { Row: UserProfile; Insert: Omit<UserProfile, 'created_at' | 'updated_at'>; Update: Partial<Omit<UserProfile, 'id'>> };
      saved_colleges: { Row: SavedCollege; Insert: Omit<SavedCollege, 'id' | 'created_at'>; Update: Partial<Omit<SavedCollege, 'id'>> };
      comparison_lists: { Row: ComparisonList; Insert: Omit<ComparisonList, 'id' | 'created_at' | 'updated_at'>; Update: Partial<Omit<ComparisonList, 'id'>> };
    };
  };
};

export const INDIAN_STATES = [
  'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh',
  'Delhi', 'Goa', 'Gujarat', 'Haryana', 'Himachal Pradesh', 'Jharkhand',
  'Karnataka', 'Kerala', 'Madhya Pradesh', 'Maharashtra', 'Manipur',
  'Meghalaya', 'Mizoram', 'Nagaland', 'Odisha', 'Punjab', 'Rajasthan',
  'Sikkim', 'Tamil Nadu', 'Telangana', 'Tripura', 'Uttar Pradesh',
  'Uttarakhand', 'West Bengal'
];

export const BRANCHES = [
  'Computer Science and Engineering',
  'Electronics and Communication Engineering',
  'Electrical Engineering',
  'Mechanical Engineering',
  'Civil Engineering',
  'Chemical Engineering',
  'Information Technology',
  'Aerospace Engineering',
  'Biotechnology',
  'Data Science and AI',
  'Mathematics and Computing',
];

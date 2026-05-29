-- RankPilot Production Database Schema

-- 1. COLLEGES
CREATE TABLE IF NOT EXISTS colleges (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  short_name text NOT NULL,
  state text NOT NULL,
  city text NOT NULL,
  type text NOT NULL CHECK (type IN ('IIT', 'NIT', 'IIIT', 'GFTIs', 'State')),
  nirf_rank integer,
  avg_package decimal(10,2),
  median_package decimal(10,2),
  highest_package decimal(10,2),
  fees_per_year decimal(10,2),
  hostel_fees_per_year decimal(10,2),
  campus_size_acres integer,
  established_year integer,
  total_seats integer,
  placement_percentage decimal(5,2),
  roi_score decimal(4,2),
  image_url text,
  website text,
  accreditation text DEFAULT 'NAAC A+',
  created_at timestamptz DEFAULT now()
);

-- 2. BRANCHES
CREATE TABLE IF NOT EXISTS branches (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  college_id uuid NOT NULL REFERENCES colleges(id) ON DELETE CASCADE,
  branch_name text NOT NULL,
  branch_code text NOT NULL,
  total_seats integer DEFAULT 60,
  avg_package decimal(10,2),
  created_at timestamptz DEFAULT now()
);

-- 3. CUTOFFS
CREATE TABLE IF NOT EXISTS cutoffs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  college_id uuid NOT NULL REFERENCES colleges(id) ON DELETE CASCADE,
  branch_id uuid NOT NULL REFERENCES branches(id) ON DELETE CASCADE,
  year integer NOT NULL,
  round integer NOT NULL DEFAULT 1,
  category text NOT NULL CHECK (category IN ('OPEN', 'OBC-NCL', 'SC', 'ST', 'EWS', 'OPEN-PwD')),
  quota text NOT NULL CHECK (quota IN ('AI', 'HS', 'OS')),
  gender text NOT NULL CHECK (gender IN ('Gender-Neutral', 'Female-only')),
  opening_rank integer NOT NULL,
  closing_rank integer NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- 4. USER PROFILES
CREATE TABLE IF NOT EXISTS user_profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name text,
  email text,
  phone text,
  jee_rank integer,
  category text CHECK (category IN ('OPEN', 'OBC-NCL', 'SC', 'ST', 'EWS', 'OPEN-PwD')),
  gender text CHECK (gender IN ('Male', 'Female', 'Other')),
  home_state text,
  is_admin boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- 5. SAVED COLLEGES
CREATE TABLE IF NOT EXISTS saved_colleges (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  college_id uuid NOT NULL REFERENCES colleges(id) ON DELETE CASCADE,
  branch_id uuid REFERENCES branches(id) ON DELETE SET NULL,
  notes text,
  priority integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  UNIQUE(user_id, college_id, branch_id)
);

-- 6. COMPARISON LISTS
CREATE TABLE IF NOT EXISTS comparison_lists (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name text NOT NULL DEFAULT 'My Comparison',
  college_ids uuid[] NOT NULL DEFAULT '{}',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- RLS POLICIES
ALTER TABLE colleges ENABLE ROW LEVEL SECURITY;
ALTER TABLE branches ENABLE ROW LEVEL SECURITY;
ALTER TABLE cutoffs ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE saved_colleges ENABLE ROW LEVEL SECURITY;
ALTER TABLE comparison_lists ENABLE ROW LEVEL SECURITY;

-- Public read access
CREATE POLICY "Public Read Colleges" ON colleges FOR SELECT USING (true);
CREATE POLICY "Public Read Branches" ON branches FOR SELECT USING (true);
CREATE POLICY "Public Read Cutoffs" ON cutoffs FOR SELECT USING (true);

-- User-specific access
CREATE POLICY "Users can manage own profile" ON user_profiles
  USING (auth.uid() = id);

CREATE POLICY "Users can manage own saved colleges" ON saved_colleges
  USING (auth.uid() = user_id);

CREATE POLICY "Users can manage own comparison lists" ON comparison_lists
  USING (auth.uid() = user_id);

-- Admin-only write access (simplified check)
CREATE POLICY "Admins can manage colleges" ON colleges
  FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM user_profiles WHERE id = auth.uid() AND is_admin = true));

-- INDEXES for optimization
CREATE INDEX IF NOT EXISTS idx_colleges_type ON colleges(type);
CREATE INDEX IF NOT EXISTS idx_colleges_state ON colleges(state);
CREATE INDEX IF NOT EXISTS idx_cutoffs_ranks ON cutoffs(closing_rank, category, quota, gender);
CREATE INDEX IF NOT EXISTS idx_cutoffs_year ON cutoffs(year);
CREATE INDEX IF NOT EXISTS idx_branches_college ON branches(college_id);

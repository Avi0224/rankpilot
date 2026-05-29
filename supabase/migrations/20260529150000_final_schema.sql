/*
  RANKPILOT PRODUCTION DATABASE SCHEMA
  
  This schema matches the frontend expectations exactly as audited from:
  - lib/types.ts
  - lib/queries.ts
  - app/admin/*
  - app/dashboard/*
*/

-- 0. Enable extensions and cleanup (optional, careful with DROP in production)
-- CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. ENUMS
DO $$ BEGIN
    CREATE TYPE college_type AS ENUM ('IIT', 'NIT', 'IIIT', 'GFTIs', 'State');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
    CREATE TYPE category_type AS ENUM ('OPEN', 'OBC-NCL', 'SC', 'ST', 'EWS', 'OPEN-PwD');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
    CREATE TYPE quota_type AS ENUM ('AI', 'HS', 'OS');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
    CREATE TYPE gender_type AS ENUM ('Gender-Neutral', 'Female-only');
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- 2. TABLES

-- COLLEGES
CREATE TABLE IF NOT EXISTS colleges (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  short_name text NOT NULL,
  state text NOT NULL,
  city text NOT NULL,
  type college_type NOT NULL,
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

-- BRANCHES
CREATE TABLE IF NOT EXISTS branches (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  college_id uuid NOT NULL REFERENCES colleges(id) ON DELETE CASCADE,
  branch_name text NOT NULL,
  branch_code text NOT NULL,
  total_seats integer DEFAULT 60,
  avg_package decimal(10,2),
  created_at timestamptz DEFAULT now()
);

-- CUTOFFS
CREATE TABLE IF NOT EXISTS cutoffs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  college_id uuid NOT NULL REFERENCES colleges(id) ON DELETE CASCADE,
  branch_id uuid NOT NULL REFERENCES branches(id) ON DELETE CASCADE,
  year integer NOT NULL,
  round integer NOT NULL DEFAULT 1,
  category category_type NOT NULL,
  quota quota_type NOT NULL,
  gender gender_type NOT NULL,
  opening_rank integer NOT NULL,
  closing_rank integer NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- USER PROFILES
CREATE TABLE IF NOT EXISTS user_profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name text,
  email text,
  phone text,
  jee_rank integer,
  category category_type,
  gender text CHECK (gender IN ('Male', 'Female', 'Other')),
  home_state text,
  is_admin boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- SAVED COLLEGES
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

-- COMPARISON LISTS (Mapping to choice_lists in frontend)
CREATE TABLE IF NOT EXISTS comparison_lists (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name text NOT NULL DEFAULT 'My Comparison',
  counselling_type text DEFAULT 'JoSAA',
  preferences jsonb DEFAULT '[]'::jsonb, -- Array of {college_id, branch_id, priority}
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- 3. ROW LEVEL SECURITY (RLS)

ALTER TABLE colleges ENABLE ROW LEVEL SECURITY;
ALTER TABLE branches ENABLE ROW LEVEL SECURITY;
ALTER TABLE cutoffs ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE saved_colleges ENABLE ROW LEVEL SECURITY;
ALTER TABLE comparison_lists ENABLE ROW LEVEL SECURITY;

-- PUBLIC READ ACCESS
CREATE POLICY "Public Read Colleges" ON colleges FOR SELECT USING (true);
CREATE POLICY "Public Read Branches" ON branches FOR SELECT USING (true);
CREATE POLICY "Public Read Cutoffs" ON cutoffs FOR SELECT USING (true);

-- USER OWNED ACCESS
CREATE POLICY "Users can manage own profile" ON user_profiles 
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can manage own saved colleges" ON saved_colleges 
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can manage own comparison lists" ON comparison_lists 
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- ADMIN ACCESS (If profile has is_admin = true)
CREATE POLICY "Admins can update colleges" ON colleges 
  FOR ALL TO authenticated
  USING ((SELECT is_admin FROM user_profiles WHERE id = auth.uid()));

CREATE POLICY "Admins can update branches" ON branches 
  FOR ALL TO authenticated
  USING ((SELECT is_admin FROM user_profiles WHERE id = auth.uid()));

CREATE POLICY "Admins can update cutoffs" ON cutoffs 
  FOR ALL TO authenticated
  USING ((SELECT is_admin FROM user_profiles WHERE id = auth.uid()));

-- 4. INDEXES
CREATE INDEX IF NOT EXISTS idx_colleges_type ON colleges(type);
CREATE INDEX IF NOT EXISTS idx_colleges_state ON colleges(state);
CREATE INDEX IF NOT EXISTS idx_branches_college ON branches(college_id);
CREATE INDEX IF NOT EXISTS idx_cutoffs_lookup ON cutoffs(category, quota, gender, closing_rank);
CREATE INDEX IF NOT EXISTS idx_cutoffs_college ON cutoffs(college_id);
CREATE INDEX IF NOT EXISTS idx_saved_user ON saved_colleges(user_id);
CREATE INDEX IF NOT EXISTS idx_comparison_user ON comparison_lists(user_id);

-- 5. UPDATED_AT TRIGGER
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_user_profiles_updated_at BEFORE UPDATE ON user_profiles FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_comparison_lists_updated_at BEFORE UPDATE ON comparison_lists FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

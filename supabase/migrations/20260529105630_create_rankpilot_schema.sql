/*
  # RankPilot - Complete Schema

  ## Tables Created
  1. `user_profiles` - Extended user data (created first for policy references)
  2. `colleges` - Engineering colleges with placement, fees, ranking data
  3. `branches` - Available branches per college
  4. `cutoffs` - Year-wise JEE Main cutoff data
  5. `saved_colleges` - User's saved/shortlisted colleges
  6. `choice_lists` - User's counselling preference lists

  ## Security
  - RLS enabled on all tables
  - Public read for colleges/branches/cutoffs
  - Authenticated-only write for user-specific data
*/

-- USER PROFILES (created first - referenced by admin policies)
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

ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own profile"
  ON user_profiles FOR SELECT TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON user_profiles FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON user_profiles FOR UPDATE TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- COLLEGES
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

ALTER TABLE colleges ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Colleges are publicly readable"
  ON colleges FOR SELECT TO anon, authenticated
  USING (true);

CREATE POLICY "Only admins can insert colleges"
  ON colleges FOR INSERT TO authenticated
  WITH CHECK (
    EXISTS (SELECT 1 FROM user_profiles WHERE user_profiles.id = auth.uid() AND user_profiles.is_admin = true)
  );

CREATE POLICY "Only admins can update colleges"
  ON colleges FOR UPDATE TO authenticated
  USING (EXISTS (SELECT 1 FROM user_profiles WHERE user_profiles.id = auth.uid() AND user_profiles.is_admin = true))
  WITH CHECK (EXISTS (SELECT 1 FROM user_profiles WHERE user_profiles.id = auth.uid() AND user_profiles.is_admin = true));

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

ALTER TABLE branches ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Branches are publicly readable"
  ON branches FOR SELECT TO anon, authenticated
  USING (true);

CREATE POLICY "Only admins can insert branches"
  ON branches FOR INSERT TO authenticated
  WITH CHECK (
    EXISTS (SELECT 1 FROM user_profiles WHERE user_profiles.id = auth.uid() AND user_profiles.is_admin = true)
  );

-- CUTOFFS
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

ALTER TABLE cutoffs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Cutoffs are publicly readable"
  ON cutoffs FOR SELECT TO anon, authenticated
  USING (true);

CREATE POLICY "Only admins can insert cutoffs"
  ON cutoffs FOR INSERT TO authenticated
  WITH CHECK (
    EXISTS (SELECT 1 FROM user_profiles WHERE user_profiles.id = auth.uid() AND user_profiles.is_admin = true)
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

ALTER TABLE saved_colleges ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own saved colleges"
  ON saved_colleges FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own saved colleges"
  ON saved_colleges FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own saved colleges"
  ON saved_colleges FOR UPDATE TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own saved colleges"
  ON saved_colleges FOR DELETE TO authenticated
  USING (auth.uid() = user_id);

-- CHOICE LISTS
CREATE TABLE IF NOT EXISTS choice_lists (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name text NOT NULL DEFAULT 'My Choice List',
  counselling_type text NOT NULL DEFAULT 'JoSAA',
  preferences jsonb DEFAULT '[]'::jsonb,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE choice_lists ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own choice lists"
  ON choice_lists FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own choice lists"
  ON choice_lists FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own choice lists"
  ON choice_lists FOR UPDATE TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own choice lists"
  ON choice_lists FOR DELETE TO authenticated
  USING (auth.uid() = user_id);

-- INDEXES
CREATE INDEX IF NOT EXISTS idx_branches_college_id ON branches(college_id);
CREATE INDEX IF NOT EXISTS idx_cutoffs_college_id ON cutoffs(college_id);
CREATE INDEX IF NOT EXISTS idx_cutoffs_branch_id ON cutoffs(branch_id);
CREATE INDEX IF NOT EXISTS idx_cutoffs_year ON cutoffs(year);
CREATE INDEX IF NOT EXISTS idx_cutoffs_category ON cutoffs(category);
CREATE INDEX IF NOT EXISTS idx_cutoffs_closing_rank ON cutoffs(closing_rank);
CREATE INDEX IF NOT EXISTS idx_saved_colleges_user_id ON saved_colleges(user_id);

-- SEED COLLEGES
INSERT INTO colleges (id, name, short_name, state, city, type, nirf_rank, avg_package, median_package, highest_package, fees_per_year, hostel_fees_per_year, campus_size_acres, established_year, total_seats, placement_percentage, roi_score, website) VALUES
  ('11111111-1111-1111-1111-111111111111', 'National Institute of Technology Tiruchirappalli', 'NIT Trichy', 'Tamil Nadu', 'Tiruchirappalli', 'NIT', 9, 1250000, 850000, 5000000, 145000, 85000, 800, 1964, 900, 94.5, 8.7, 'https://www.nitt.edu'),
  ('22222222-2222-2222-2222-222222222222', 'Delhi Technological University', 'DTU', 'Delhi', 'New Delhi', 'State', 36, 1100000, 780000, 4500000, 170000, 72000, 164, 1941, 1400, 92.0, 8.4, 'https://dtu.ac.in'),
  ('33333333-3333-3333-3333-333333333333', 'Indian Institute of Information Technology Allahabad', 'IIIT Allahabad', 'Uttar Pradesh', 'Prayagraj', 'IIIT', 52, 1050000, 750000, 4000000, 220000, 90000, 100, 1999, 450, 91.0, 7.8, 'https://www.iiita.ac.in'),
  ('44444444-4444-4444-4444-444444444444', 'National Institute of Technology Karnataka Surathkal', 'NIT Surathkal', 'Karnataka', 'Mangalore', 'NIT', 16, 1180000, 820000, 4800000, 151000, 88000, 295, 1960, 850, 93.5, 8.5, 'https://www.nitk.ac.in'),
  ('55555555-5555-5555-5555-555555555555', 'National Institute of Technology Warangal', 'NIT Warangal', 'Telangana', 'Warangal', 'NIT', 26, 1150000, 800000, 4200000, 148000, 82000, 475, 1959, 950, 93.0, 8.6, 'https://www.nitw.ac.in'),
  ('66666666-6666-6666-6666-666666666666', 'Netaji Subhas University of Technology', 'NSUT Delhi', 'Delhi', 'New Delhi', 'State', 44, 980000, 720000, 3800000, 160000, 68000, 145, 1983, 1200, 90.5, 8.0, 'https://nsut.ac.in'),
  ('77777777-7777-7777-7777-777777777777', 'Indian Institute of Information Technology Hyderabad', 'IIIT Hyderabad', 'Telangana', 'Hyderabad', 'IIIT', 26, 1400000, 1100000, 6000000, 320000, 110000, 66, 1998, 300, 95.5, 7.5, 'https://www.iiit.ac.in'),
  ('88888888-8888-8888-8888-888888888888', 'National Institute of Technology Rourkela', 'NIT Rourkela', 'Odisha', 'Rourkela', 'NIT', 18, 1050000, 750000, 3900000, 142000, 80000, 610, 1961, 950, 92.0, 8.3, 'https://www.nitrkl.ac.in'),
  ('99999999-9999-9999-9999-999999999999', 'Maulana Azad National Institute of Technology Bhopal', 'MANIT Bhopal', 'Madhya Pradesh', 'Bhopal', 'NIT', 38, 920000, 680000, 3500000, 140000, 75000, 650, 1960, 900, 89.0, 7.9, 'https://www.manit.ac.in'),
  ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'Visvesvaraya National Institute of Technology Nagpur', 'VNIT Nagpur', 'Maharashtra', 'Nagpur', 'NIT', 41, 950000, 700000, 3600000, 143000, 76000, 227, 1960, 900, 89.5, 8.0, 'https://vnit.ac.in'),
  ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'National Institute of Technology Calicut', 'NIT Calicut', 'Kerala', 'Kozhikode', 'NIT', 27, 1100000, 780000, 4000000, 148000, 84000, 120, 1961, 900, 92.5, 8.4, 'https://nitc.ac.in'),
  ('cccccccc-cccc-cccc-cccc-cccccccccccc', 'Birla Institute of Technology and Science Pilani', 'BITS Pilani', 'Rajasthan', 'Pilani', 'GFTIs', 5, 1800000, 1400000, 8000000, 520000, 130000, 328, 1964, 800, 96.0, 6.8, 'https://www.bits-pilani.ac.in')
ON CONFLICT DO NOTHING;

-- SEED BRANCHES
INSERT INTO branches (id, college_id, branch_name, branch_code, total_seats, avg_package) VALUES
  ('b1000001-0000-0000-0000-000000000001', '11111111-1111-1111-1111-111111111111', 'Computer Science and Engineering', 'CSE', 60, 1800000),
  ('b1000001-0000-0000-0000-000000000002', '11111111-1111-1111-1111-111111111111', 'Electronics and Communication Engineering', 'ECE', 120, 1200000),
  ('b1000001-0000-0000-0000-000000000003', '11111111-1111-1111-1111-111111111111', 'Mechanical Engineering', 'ME', 120, 850000),
  ('b1000001-0000-0000-0000-000000000004', '11111111-1111-1111-1111-111111111111', 'Civil Engineering', 'CE', 120, 720000),
  ('b2000002-0000-0000-0000-000000000001', '22222222-2222-2222-2222-222222222222', 'Computer Science and Engineering', 'CSE', 180, 1600000),
  ('b2000002-0000-0000-0000-000000000002', '22222222-2222-2222-2222-222222222222', 'Electronics and Communication Engineering', 'ECE', 180, 1100000),
  ('b2000002-0000-0000-0000-000000000003', '22222222-2222-2222-2222-222222222222', 'Mechanical Engineering', 'ME', 180, 800000),
  ('b3000003-0000-0000-0000-000000000001', '33333333-3333-3333-3333-333333333333', 'Information Technology', 'IT', 120, 1400000),
  ('b3000003-0000-0000-0000-000000000002', '33333333-3333-3333-3333-333333333333', 'Electronics and Communication Engineering', 'ECE', 60, 1000000),
  ('b4000004-0000-0000-0000-000000000001', '44444444-4444-4444-4444-444444444444', 'Computer Science and Engineering', 'CSE', 64, 1700000),
  ('b4000004-0000-0000-0000-000000000002', '44444444-4444-4444-4444-444444444444', 'Electronics and Communication Engineering', 'ECE', 96, 1150000),
  ('b4000004-0000-0000-0000-000000000003', '44444444-4444-4444-4444-444444444444', 'Mechanical Engineering', 'ME', 80, 820000),
  ('b5000005-0000-0000-0000-000000000001', '55555555-5555-5555-5555-555555555555', 'Computer Science and Engineering', 'CSE', 60, 1600000),
  ('b5000005-0000-0000-0000-000000000002', '55555555-5555-5555-5555-555555555555', 'Electronics and Communication Engineering', 'ECE', 120, 1100000),
  ('b5000005-0000-0000-0000-000000000003', '55555555-5555-5555-5555-555555555555', 'Civil Engineering', 'CE', 120, 700000),
  ('b7000007-0000-0000-0000-000000000001', '77777777-7777-7777-7777-777777777777', 'Computer Science and Engineering', 'CSE', 100, 2200000),
  ('b7000007-0000-0000-0000-000000000002', '77777777-7777-7777-7777-777777777777', 'Electronics and Communication Engineering', 'ECE', 60, 1400000),
  ('b8000008-0000-0000-0000-000000000001', '88888888-8888-8888-8888-888888888888', 'Computer Science and Engineering', 'CSE', 60, 1500000),
  ('b8000008-0000-0000-0000-000000000002', '88888888-8888-8888-8888-888888888888', 'Electronics and Communication Engineering', 'ECE', 120, 1000000),
  ('bcc00001-0000-0000-0000-000000000001', 'cccccccc-cccc-cccc-cccc-cccccccccccc', 'Computer Science', 'CS', 100, 2500000),
  ('bcc00001-0000-0000-0000-000000000002', 'cccccccc-cccc-cccc-cccc-cccccccccccc', 'Electronics and Instrumentation', 'EI', 100, 1800000),
  ('bcc00001-0000-0000-0000-000000000003', 'cccccccc-cccc-cccc-cccc-cccccccccccc', 'Mechanical Engineering', 'ME', 80, 1200000)
ON CONFLICT DO NOTHING;

-- SEED CUTOFFS (2021-2024, Round 6, AI quota)
INSERT INTO cutoffs (college_id, branch_id, year, round, category, quota, gender, opening_rank, closing_rank) VALUES
  ('11111111-1111-1111-1111-111111111111', 'b1000001-0000-0000-0000-000000000001', 2024, 6, 'OPEN', 'AI', 'Gender-Neutral', 2130, 4850),
  ('11111111-1111-1111-1111-111111111111', 'b1000001-0000-0000-0000-000000000001', 2023, 6, 'OPEN', 'AI', 'Gender-Neutral', 2280, 5100),
  ('11111111-1111-1111-1111-111111111111', 'b1000001-0000-0000-0000-000000000001', 2022, 6, 'OPEN', 'AI', 'Gender-Neutral', 2100, 4700),
  ('11111111-1111-1111-1111-111111111111', 'b1000001-0000-0000-0000-000000000001', 2021, 6, 'OPEN', 'AI', 'Gender-Neutral', 2200, 4900),
  ('11111111-1111-1111-1111-111111111111', 'b1000001-0000-0000-0000-000000000001', 2024, 6, 'OBC-NCL', 'AI', 'Gender-Neutral', 800, 2100),
  ('11111111-1111-1111-1111-111111111111', 'b1000001-0000-0000-0000-000000000001', 2023, 6, 'OBC-NCL', 'AI', 'Gender-Neutral', 850, 2250),
  ('11111111-1111-1111-1111-111111111111', 'b1000001-0000-0000-0000-000000000001', 2024, 6, 'SC', 'AI', 'Gender-Neutral', 500, 1200),
  ('11111111-1111-1111-1111-111111111111', 'b1000001-0000-0000-0000-000000000001', 2024, 6, 'ST', 'AI', 'Gender-Neutral', 300, 800),
  ('11111111-1111-1111-1111-111111111111', 'b1000001-0000-0000-0000-000000000002', 2024, 6, 'OPEN', 'AI', 'Gender-Neutral', 6200, 12800),
  ('11111111-1111-1111-1111-111111111111', 'b1000001-0000-0000-0000-000000000002', 2023, 6, 'OPEN', 'AI', 'Gender-Neutral', 6800, 13400),
  ('11111111-1111-1111-1111-111111111111', 'b1000001-0000-0000-0000-000000000002', 2022, 6, 'OPEN', 'AI', 'Gender-Neutral', 6100, 12500),
  ('11111111-1111-1111-1111-111111111111', 'b1000001-0000-0000-0000-000000000002', 2021, 6, 'OPEN', 'AI', 'Gender-Neutral', 6500, 13200),
  ('22222222-2222-2222-2222-222222222222', 'b2000002-0000-0000-0000-000000000001', 2024, 6, 'OPEN', 'AI', 'Gender-Neutral', 980, 3200),
  ('22222222-2222-2222-2222-222222222222', 'b2000002-0000-0000-0000-000000000001', 2023, 6, 'OPEN', 'AI', 'Gender-Neutral', 1050, 3450),
  ('22222222-2222-2222-2222-222222222222', 'b2000002-0000-0000-0000-000000000001', 2022, 6, 'OPEN', 'AI', 'Gender-Neutral', 900, 3100),
  ('22222222-2222-2222-2222-222222222222', 'b2000002-0000-0000-0000-000000000001', 2021, 6, 'OPEN', 'AI', 'Gender-Neutral', 1000, 3300),
  ('22222222-2222-2222-2222-222222222222', 'b2000002-0000-0000-0000-000000000002', 2024, 6, 'OPEN', 'AI', 'Gender-Neutral', 3500, 8200),
  ('22222222-2222-2222-2222-222222222222', 'b2000002-0000-0000-0000-000000000002', 2023, 6, 'OPEN', 'AI', 'Gender-Neutral', 3700, 8600),
  ('22222222-2222-2222-2222-222222222222', 'b2000002-0000-0000-0000-000000000002', 2022, 6, 'OPEN', 'AI', 'Gender-Neutral', 3400, 8000),
  ('22222222-2222-2222-2222-222222222222', 'b2000002-0000-0000-0000-000000000002', 2021, 6, 'OPEN', 'AI', 'Gender-Neutral', 3600, 8400),
  ('33333333-3333-3333-3333-333333333333', 'b3000003-0000-0000-0000-000000000001', 2024, 6, 'OPEN', 'AI', 'Gender-Neutral', 4100, 9800),
  ('33333333-3333-3333-3333-333333333333', 'b3000003-0000-0000-0000-000000000001', 2023, 6, 'OPEN', 'AI', 'Gender-Neutral', 4300, 10200),
  ('33333333-3333-3333-3333-333333333333', 'b3000003-0000-0000-0000-000000000001', 2022, 6, 'OPEN', 'AI', 'Gender-Neutral', 4000, 9600),
  ('33333333-3333-3333-3333-333333333333', 'b3000003-0000-0000-0000-000000000001', 2021, 6, 'OPEN', 'AI', 'Gender-Neutral', 4200, 10000),
  ('44444444-4444-4444-4444-444444444444', 'b4000004-0000-0000-0000-000000000001', 2024, 6, 'OPEN', 'AI', 'Gender-Neutral', 3800, 7900),
  ('44444444-4444-4444-4444-444444444444', 'b4000004-0000-0000-0000-000000000001', 2023, 6, 'OPEN', 'AI', 'Gender-Neutral', 4000, 8200),
  ('44444444-4444-4444-4444-444444444444', 'b4000004-0000-0000-0000-000000000001', 2022, 6, 'OPEN', 'AI', 'Gender-Neutral', 3700, 7700),
  ('44444444-4444-4444-4444-444444444444', 'b4000004-0000-0000-0000-000000000001', 2021, 6, 'OPEN', 'AI', 'Gender-Neutral', 3900, 8000),
  ('55555555-5555-5555-5555-555555555555', 'b5000005-0000-0000-0000-000000000001', 2024, 6, 'OPEN', 'AI', 'Gender-Neutral', 3500, 7200),
  ('55555555-5555-5555-5555-555555555555', 'b5000005-0000-0000-0000-000000000001', 2023, 6, 'OPEN', 'AI', 'Gender-Neutral', 3700, 7600),
  ('55555555-5555-5555-5555-555555555555', 'b5000005-0000-0000-0000-000000000001', 2022, 6, 'OPEN', 'AI', 'Gender-Neutral', 3400, 7100),
  ('55555555-5555-5555-5555-555555555555', 'b5000005-0000-0000-0000-000000000001', 2021, 6, 'OPEN', 'AI', 'Gender-Neutral', 3600, 7400),
  ('77777777-7777-7777-7777-777777777777', 'b7000007-0000-0000-0000-000000000001', 2024, 6, 'OPEN', 'AI', 'Gender-Neutral', 680, 2100),
  ('77777777-7777-7777-7777-777777777777', 'b7000007-0000-0000-0000-000000000001', 2023, 6, 'OPEN', 'AI', 'Gender-Neutral', 720, 2250),
  ('77777777-7777-7777-7777-777777777777', 'b7000007-0000-0000-0000-000000000001', 2022, 6, 'OPEN', 'AI', 'Gender-Neutral', 660, 2050),
  ('77777777-7777-7777-7777-777777777777', 'b7000007-0000-0000-0000-000000000001', 2021, 6, 'OPEN', 'AI', 'Gender-Neutral', 700, 2200),
  ('88888888-8888-8888-8888-888888888888', 'b8000008-0000-0000-0000-000000000001', 2024, 6, 'OPEN', 'AI', 'Gender-Neutral', 6500, 14200),
  ('88888888-8888-8888-8888-888888888888', 'b8000008-0000-0000-0000-000000000001', 2023, 6, 'OPEN', 'AI', 'Gender-Neutral', 6800, 14800),
  ('88888888-8888-8888-8888-888888888888', 'b8000008-0000-0000-0000-000000000001', 2022, 6, 'OPEN', 'AI', 'Gender-Neutral', 6200, 13900),
  ('88888888-8888-8888-8888-888888888888', 'b8000008-0000-0000-0000-000000000001', 2021, 6, 'OPEN', 'AI', 'Gender-Neutral', 6600, 14500)
ON CONFLICT DO NOTHING;

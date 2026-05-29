/*
  # RankPilot Data Ingestion System

  ## Tables Created
  1. `normalization_rules` - Branch, category, quota, and college name mappings
  2. `import_logs` - History of all dataset imports with stats
  3. `import_errors` - Detailed error log per import
  4. `raw_uploads` - Staging table for uploaded data before normalization
  5. `counselling_systems` - Registry of supported counselling systems

  ## Modified Tables
  - `cutoffs` - Added counselling_system column and indexes
  - `colleges` - Added normalized_name column
  - `branches` - Added normalized_name column

  ## Security
  - RLS enabled on all tables
  - Admin-only write access
  - Public read where appropriate
*/

-- COUNSELLING SYSTEMS REGISTRY
CREATE TABLE IF NOT EXISTS counselling_systems (
  id text PRIMARY KEY,
  name text NOT NULL,
  short_name text NOT NULL,
  type text NOT NULL CHECK (type IN ('National', 'State', 'Institute')),
  state text,
  website text,
  active boolean DEFAULT true,
  last_import timestamptz,
  total_records bigint DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE counselling_systems ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Counselling systems are publicly readable"
  ON counselling_systems FOR SELECT TO anon, authenticated
  USING (true);

CREATE POLICY "Only admins can manage counselling systems"
  ON counselling_systems FOR INSERT TO authenticated
  WITH CHECK (
    EXISTS (SELECT 1 FROM user_profiles WHERE user_profiles.id = auth.uid() AND user_profiles.is_admin = true)
  );

-- NORMALIZATION RULES
CREATE TABLE IF NOT EXISTS normalization_rules (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  original_value text NOT NULL,
  normalized_value text NOT NULL,
  type text NOT NULL CHECK (type IN ('branch', 'category', 'quota', 'gender', 'college', 'state')),
  is_auto boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(original_value, type)
);

ALTER TABLE normalization_rules ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Normalization rules are publicly readable"
  ON normalization_rules FOR SELECT TO anon, authenticated
  USING (true);

CREATE POLICY "Only admins can manage normalization rules"
  ON normalization_rules FOR INSERT TO authenticated
  WITH CHECK (EXISTS (SELECT 1 FROM user_profiles WHERE user_profiles.id = auth.uid() AND user_profiles.is_admin = true));

CREATE POLICY "Only admins can update normalization rules"
  ON normalization_rules FOR UPDATE TO authenticated
  USING (EXISTS (SELECT 1 FROM user_profiles WHERE user_profiles.id = auth.uid() AND user_profiles.is_admin = true));

-- IMPORT LOGS
CREATE TABLE IF NOT EXISTS import_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  filename text NOT NULL,
  counselling_system text NOT NULL REFERENCES counselling_systems(id),
  year integer NOT NULL,
  round integer DEFAULT 1,
  uploaded_by uuid REFERENCES auth.users(id),
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'validating', 'processing', 'completed', 'failed', 'rolled_back')),
  total_rows integer DEFAULT 0,
  successful_rows integer DEFAULT 0,
  failed_rows integer DEFAULT 0,
  warning_count integer DEFAULT 0,
  duplicate_count integer DEFAULT 0,
  file_size_kb integer,
  parsing_time_ms integer,
  processing_time_ms integer,
  error_summary jsonb DEFAULT '{}'::jsonb,
  metadata jsonb DEFAULT '{}'::jsonb,
  rollback_available boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  completed_at timestamptz
);

ALTER TABLE import_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Import logs visible to authenticated users"
  ON import_logs FOR SELECT TO authenticated
  USING (true);

CREATE POLICY "Only admins can manage import logs"
  ON import_logs FOR INSERT TO authenticated
  WITH CHECK (EXISTS (SELECT 1 FROM user_profiles WHERE user_profiles.id = auth.uid() AND user_profiles.is_admin = true));

CREATE POLICY "Only admins can update import logs"
  ON import_logs FOR UPDATE TO authenticated
  USING (EXISTS (SELECT 1 FROM user_profiles WHERE user_profiles.id = auth.uid() AND user_profiles.is_admin = true));

-- IMPORT ERRORS (detailed per-row errors)
CREATE TABLE IF NOT EXISTS import_errors (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  import_log_id uuid NOT NULL REFERENCES import_logs(id) ON DELETE CASCADE,
  row_number integer NOT NULL,
  column_name text,
  original_value text,
  error_type text NOT NULL CHECK (error_type IN ('missing_value', 'invalid_format', 'duplicate', 'normalization_failed', 'constraint_violation', 'invalid_rank')),
  error_message text NOT NULL,
  severity text NOT NULL DEFAULT 'error' CHECK (severity IN ('error', 'warning')),
  suggested_fix text,
  resolved boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE import_errors ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Import errors visible to authenticated users"
  ON import_errors FOR SELECT TO authenticated
  USING (true);

CREATE POLICY "Only admins can manage import errors"
  ON import_errors FOR INSERT TO authenticated
  WITH CHECK (EXISTS (SELECT 1 FROM user_profiles WHERE user_profiles.id = auth.uid() AND user_profiles.is_admin = true));

CREATE POLICY "Only admins can update import errors"
  ON import_errors FOR UPDATE TO authenticated
  USING (EXISTS (SELECT 1 FROM user_profiles WHERE user_profiles.id = auth.uid() AND user_profiles.is_admin = true));

-- RAW UPLOADS (staging before normalization)
CREATE TABLE IF NOT EXISTS raw_uploads (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  import_log_id uuid NOT NULL REFERENCES import_logs(id) ON DELETE CASCADE,
  row_number integer NOT NULL,
  raw_data jsonb NOT NULL,
  normalized_data jsonb,
  is_valid boolean DEFAULT false,
  validation_errors text[],
  created_at timestamptz DEFAULT now()
);

ALTER TABLE raw_uploads ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Raw uploads visible to admins"
  ON raw_uploads FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM user_profiles WHERE user_profiles.id = auth.uid() AND user_profiles.is_admin = true));

CREATE POLICY "Only admins can manage raw uploads"
  ON raw_uploads FOR INSERT TO authenticated
  WITH CHECK (EXISTS (SELECT 1 FROM user_profiles WHERE user_profiles.id = auth.uid() AND user_profiles.is_admin = true));

-- INDEXES FOR PERFORMANCE
CREATE INDEX IF NOT EXISTS idx_import_logs_system ON import_logs(counselling_system);
CREATE INDEX IF NOT EXISTS idx_import_logs_status ON import_logs(status);
CREATE INDEX IF NOT EXISTS idx_import_logs_created ON import_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_import_errors_log ON import_errors(import_log_id);
CREATE INDEX IF NOT EXISTS idx_import_errors_type ON import_errors(error_type);
CREATE INDEX IF NOT EXISTS idx_raw_uploads_log ON raw_uploads(import_log_id);
CREATE INDEX IF NOT EXISTS idx_normalization_rules_type ON normalization_rules(type);
CREATE INDEX IF NOT EXISTS idx_normalization_rules_original ON normalization_rules(original_value);

-- ADD counselling_system to cutoffs if not exists
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'cutoffs' AND column_name = 'counselling_system'
  ) THEN
    ALTER TABLE cutoffs ADD COLUMN counselling_system text DEFAULT 'josaa';
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_cutoffs_system ON cutoffs(counselling_system);

-- ADD normalized_name columns to colleges and branches
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'colleges' AND column_name = 'normalized_name'
  ) THEN
    ALTER TABLE colleges ADD COLUMN normalized_name text;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'branches' AND column_name = 'normalized_branch'
  ) THEN
    ALTER TABLE branches ADD COLUMN normalized_branch text;
  END IF;
END $$;

-- SEED COUNSELLING SYSTEMS
INSERT INTO counselling_systems (id, name, short_name, type, state, website) VALUES
  ('josaa', 'Joint Seat Allocation Authority', 'JoSAA', 'National', NULL, 'https://josaa.nic.in'),
  ('csab', 'Central Seat Allocation Board', 'CSAB', 'National', NULL, 'https://csab.nic.in'),
  ('jac-delhi', 'Joint Admission Counselling Delhi', 'JAC Delhi', 'National', 'Delhi', 'https://jacdelhi.nic.in'),
  ('comedk', 'Consortium of Medical Engineering and Dental Colleges of Karnataka', 'COMEDK', 'State', 'Karnataka', 'https://comedk.org'),
  ('mht-cet', 'Maharashtra Common Entrance Test', 'MHT CET', 'State', 'Maharashtra', 'https://cetcell.mahacet.org'),
  ('uptac', 'Uttar Pradesh Technical Admission Counselling', 'UPTAC', 'State', 'Uttar Pradesh', 'https://uptac.admissions.nic.in'),
  ('wbjee', 'West Bengal Joint Entrance Examination', 'WBJEE', 'State', 'West Bengal', 'https://wbjee.nic.in'),
  ('kcet', 'Karnataka Common Entrance Test', 'KCET', 'State', 'Karnataka', 'https://kea.kar.nic.in'),
  ('ts-eamcet', 'Telangana State Engineering Agricultural Medical Common Entrance Test', 'TS EAMCET', 'State', 'Telangana', 'https://tseamcet.nic.in'),
  ('ap-eapcet', 'Andhra Pradesh Engineering Agricultural Pharmacy Common Entrance Test', 'AP EAPCET', 'State', 'Andhra Pradesh', 'https://sche.ap.gov.in')
ON CONFLICT (id) DO NOTHING;

-- SEED BRANCH NORMALIZATION RULES
INSERT INTO normalization_rules (original_value, normalized_value, type, is_auto) VALUES
  ('Computer Science and Engineering', 'CSE', 'branch', false),
  ('Computer Science Engineering', 'CSE', 'branch', false),
  ('Computer Science', 'CSE', 'branch', false),
  ('CSE', 'CSE', 'branch', false),
  ('Computer Science & Engineering', 'CSE', 'branch', false),
  ('Computer Sc. & Engg.', 'CSE', 'branch', false),
  ('Electronics and Communication Engineering', 'ECE', 'branch', false),
  ('Electronics & Communication Engineering', 'ECE', 'branch', false),
  ('Electronics Communication Engineering', 'ECE', 'branch', false),
  ('ECE', 'ECE', 'branch', false),
  ('Electronics and Comm. Engg.', 'ECE', 'branch', false),
  ('Electrical Engineering', 'EE', 'branch', false),
  ('Electrical Engg.', 'EE', 'branch', false),
  ('EE', 'EE', 'branch', false),
  ('Mechanical Engineering', 'ME', 'branch', false),
  ('Mechanical Engg.', 'ME', 'branch', false),
  ('ME', 'ME', 'branch', false),
  ('Civil Engineering', 'CE', 'branch', false),
  ('Civil Engg.', 'CE', 'branch', false),
  ('CE', 'CE', 'branch', false),
  ('Information Technology', 'IT', 'branch', false),
  ('Info. Technology', 'IT', 'branch', false),
  ('IT', 'IT', 'branch', false),
  ('Chemical Engineering', 'ChemE', 'branch', false),
  ('Chemical Engg.', 'ChemE', 'branch', false),
  ('Data Science and Engineering', 'DS', 'branch', false),
  ('Data Science', 'DS', 'branch', false),
  ('Artificial Intelligence and Machine Learning', 'AIML', 'branch', false),
  ('AI and ML', 'AIML', 'branch', false),
  ('Artificial Intelligence', 'AI', 'branch', false),
  ('Machine Learning', 'ML', 'branch', false),
  ('Electronics and Instrumentation Engineering', 'EIE', 'branch', false),
  ('Instrumentation Engineering', 'IE', 'branch', false),
  ('Biotechnology', 'BT', 'branch', false),
  ('Bio Technology', 'BT', 'branch', false),
  ('Aerospace Engineering', 'AE', 'branch', false),
  ('Aeronautical Engineering', 'AE', 'branch', false),
  ('Mathematics and Computing', 'MC', 'branch', false),
  ('Mathematics & Computing', 'MC', 'branch', false),
  ('Industrial and Production Engineering', 'IPE', 'branch', false),
  ('Industrial Engineering', 'IE', 'branch', false),
  ('Metallurgical Engineering', 'MetaE', 'branch', false),
  ('Metallurgy', 'MetaE', 'branch', false),
  ('Mining Engineering', 'MiningE', 'branch', false),
  ('Textile Engineering', 'TextileE', 'branch', false),
  ('Architecture', 'Arch', 'branch', false)
ON CONFLICT (original_value, type) DO NOTHING;

-- SEED CATEGORY NORMALIZATION RULES
INSERT INTO normalization_rules (original_value, normalized_value, type, is_auto) VALUES
  ('OPEN', 'OPEN', 'category', false),
  ('General', 'OPEN', 'category', false),
  ('GEN', 'OPEN', 'category', false),
  ('UR', 'OPEN', 'category', false),
  ('Unreserved', 'OPEN', 'category', false),
  ('OBC-NCL', 'OBC-NCL', 'category', false),
  ('OBC', 'OBC-NCL', 'category', false),
  ('OBC NCL', 'OBC-NCL', 'category', false),
  ('Other Backward Classes', 'OBC-NCL', 'category', false),
  ('OBC-Non Creamy Layer', 'OBC-NCL', 'category', false),
  ('GEN-EWS', 'EWS', 'category', false),
  ('EWS', 'EWS', 'category', false),
  ('Economically Weaker Section', 'EWS', 'category', false),
  ('OPEN-PwD', 'OPEN-PwD', 'category', false),
  ('PWD', 'OPEN-PwD', 'category', false),
  ('PwD', 'OPEN-PwD', 'category', false),
  ('Persons with Disabilities', 'OPEN-PwD', 'category', false),
  ('SC', 'SC', 'category', false),
  ('Scheduled Caste', 'SC', 'category', false),
  ('ST', 'ST', 'category', false),
  ('Scheduled Tribe', 'ST', 'category', false),
  ('OBC-NCL-PwD', 'OBC-NCL-PwD', 'category', false),
  ('OBC-PwD', 'OBC-NCL-PwD', 'category', false),
  ('SC-PwD', 'SC-PwD', 'category', false),
  ('ST-PwD', 'ST-PwD', 'category', false),
  ('EWS-PwD', 'EWS-PwD', 'category', false)
ON CONFLICT (original_value, type) DO NOTHING;

-- SEED QUOTA NORMALIZATION RULES
INSERT INTO normalization_rules (original_value, normalized_value, type, is_auto) VALUES
  ('AI', 'AI', 'quota', false),
  ('All India', 'AI', 'quota', false),
  ('All-India', 'AI', 'quota', false),
  ('ALL INDIA', 'AI', 'quota', false),
  ('HS', 'HS', 'quota', false),
  ('Home State', 'HS', 'quota', false),
  ('Home-State', 'HS', 'quota', false),
  ('HOME STATE', 'HS', 'quota', false),
  ('OS', 'OS', 'quota', false),
  ('Other State', 'OS', 'quota', false),
  ('Other-State', 'OS', 'quota', false),
  ('OTHER STATE', 'OS', 'quota', false),
  ('GO', 'GO', 'quota', false),
  ('Government', 'GO', 'quota', false),
  ('OP', 'OP', 'quota', false),
  ('Open', 'OP', 'quota', false)
ON CONFLICT (original_value, type) DO NOTHING;

-- SEED GENDER NORMALIZATION RULES
INSERT INTO normalization_rules (original_value, normalized_value, type, is_auto) VALUES
  ('Gender-Neutral', 'Gender-Neutral', 'gender', false),
  ('GN', 'Gender-Neutral', 'gender', false),
  ('Neutral', 'Gender-Neutral', 'gender', false),
  ('Female-only', 'Female-only', 'gender', false),
  ('FO', 'Female-only', 'gender', false),
  ('Female', 'Female-only', 'gender', false),
  ('Female Only', 'Female-only', 'gender', false),
  ('F', 'Female-only', 'gender', false),
  ('M', 'Gender-Neutral', 'gender', false),
  ('Male', 'Gender-Neutral', 'gender', false)
ON CONFLICT (original_value, type) DO NOTHING;

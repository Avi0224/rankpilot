/*
  FIXING USER PROFILES MISSING ERROR
  This migration ensures the user_profiles table exists to stop the frontend errors.
*/

CREATE TABLE IF NOT EXISTS user_profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name text,
  email text,
  phone text,
  jee_rank integer,
  category text, -- Using text for flexibility during debug
  gender text,
  home_state text,
  is_admin boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Ensure RLS is enabled
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

-- Basic policy
DO $$ BEGIN
  CREATE POLICY "Users can manage own profile" ON user_profiles 
    USING (auth.uid() = id)
    WITH CHECK (auth.uid() = id);
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- Enable RLS on all tables
ALTER TABLE colleges ENABLE ROW LEVEL SECURITY;
ALTER TABLE branches ENABLE ROW LEVEL SECURITY;
ALTER TABLE cutoffs ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE saved_colleges ENABLE ROW LEVEL SECURITY;

-- Public read access for data tables
CREATE POLICY "Public read access for colleges" ON colleges FOR SELECT USING (true);
CREATE POLICY "Public read access for branches" ON branches FOR SELECT USING (true);
CREATE POLICY "Public read access for cutoffs" ON cutoffs FOR SELECT USING (true);

-- User Profile Policies
CREATE POLICY "Users can view their own profile" 
ON user_profiles FOR SELECT 
USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile" 
ON user_profiles FOR UPDATE 
USING (auth.uid() = id);

CREATE POLICY "Users can insert their own profile" 
ON user_profiles FOR INSERT 
WITH CHECK (auth.uid() = id);

-- Saved Colleges Policies
CREATE POLICY "Users can view their own saved colleges" 
ON saved_colleges FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own saved colleges" 
ON saved_colleges FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own saved colleges" 
ON saved_colleges FOR DELETE 
USING (auth.uid() = user_id);

-- Admin Policies (for future use)
-- Assuming we have a way to identify admins, e.g., a role column in user_profiles
-- For now, let's keep it simple or restricted to authenticated users for data modification if needed.

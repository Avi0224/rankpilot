-- Performance optimization: Add indexes for frequently filtered columns in cutoffs table
CREATE INDEX IF NOT EXISTS idx_cutoffs_query_perf ON cutoffs (category, quota, gender, opening_rank, closing_rank);
CREATE INDEX IF NOT EXISTS idx_cutoffs_year ON cutoffs (year);
CREATE INDEX IF NOT EXISTS idx_colleges_type ON colleges (type);
CREATE INDEX IF NOT EXISTS idx_colleges_state ON colleges (state);
CREATE INDEX IF NOT EXISTS idx_branches_name ON branches (branch_name);

-- Analyze the tables to update statistics for the query planner
ANALYZE cutoffs;
ANALYZE colleges;
ANALYZE branches;

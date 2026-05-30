-- Backend Audit Fix: Advanced Performance Indexing
-- This composite index covers the primary prediction query filters and sorting.
-- The order is optimized for equality filters first, then range filters.
CREATE INDEX IF NOT EXISTS idx_cutoffs_prediction_engine ON cutoffs (
  category, 
  quota, 
  gender, 
  opening_rank, 
  closing_rank,
  year
);

-- Foreign key indexes for faster joins during prediction
CREATE INDEX IF NOT EXISTS idx_cutoffs_college_id ON cutoffs (college_id);
CREATE INDEX IF NOT EXISTS idx_cutoffs_branch_id ON cutoffs (branch_id);

-- GIN index for text search on college names if needed in future (scalability)
CREATE INDEX IF NOT EXISTS idx_colleges_name_trgm ON colleges USING gin (name gin_trgm_ops);
CREATE INDEX IF NOT EXISTS idx_colleges_short_name_trgm ON colleges USING gin (short_name gin_trgm_ops);

-- Ensure pg_trgm extension is available for the GIN indexes
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- Refresh statistics
ANALYZE cutoffs;
ANALYZE colleges;
ANALYZE branches;

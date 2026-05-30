-- advanced_supabase_optimization.sql
-- Expert-level performance optimizations for RankPilot

-- 1. MATERIALIZED VIEWS for Precomputed Analytics
-- This view precomputes ROI and aggregate statistics per college, 
-- avoiding expensive joins and aggregations on every page load.
CREATE MATERIALIZED VIEW IF NOT EXISTS mv_college_analytics AS
SELECT 
    c.id as college_id,
    c.name,
    c.short_name,
    c.type,
    c.state,
    c.nirf_rank,
    c.avg_package,
    c.fees_per_year,
    (c.avg_package * 4) / NULLIF(c.fees_per_year * 4, 0) as roi_index,
    COUNT(DISTINCT b.id) as branch_count,
    MIN(ct.closing_rank) as min_cutoff,
    MAX(ct.closing_rank) as max_cutoff
FROM colleges c
LEFT JOIN branches b ON c.id = b.college_id
LEFT JOIN cutoffs ct ON c.id = ct.college_id
GROUP BY c.id;

-- Index for the materialized view
CREATE UNIQUE INDEX IF NOT EXISTS idx_mv_college_analytics_id ON mv_college_analytics (college_id);
CREATE INDEX IF NOT EXISTS idx_mv_college_analytics_roi ON mv_college_analytics (roi_index DESC);

-- 2. PARTIAL INDEXES for Frequent Time-Bound Queries
-- Most students care about the latest year. Partial indexes reduce index size and speed up lookups.
CREATE INDEX IF NOT EXISTS idx_cutoffs_latest_year ON cutoffs (closing_rank) 
WHERE year = 2024; -- Adjust to your latest data year

-- 3. COMPOSITE INDEXES for Prediction Logic
-- The prediction engine filters on category, quota, and gender first, then rank.
-- This index order matches the query planner's selectivity.
CREATE INDEX IF NOT EXISTS idx_cutoffs_engine_optimized ON cutoffs (
  category, 
  quota, 
  gender, 
  year, 
  closing_rank
) INCLUDE (opening_rank, college_id, branch_id);

-- 4. RLS PERFORMANCE FIX
-- Replace the EXISTS subquery in admin policies with a more performant approach 
-- using JWT claims if possible, or at least optimize the subquery.
-- Current: CREATE POLICY "Admins can manage colleges" ... USING (EXISTS (SELECT 1 FROM user_profiles ...))
-- Suggestion: Use a database function with security definer to cache admin status or use Supabase custom claims.

-- 5. FUNCTION TO REFRESH VIEWS
-- Materialized views need refreshing when data changes.
CREATE OR REPLACE FUNCTION refresh_college_analytics()
RETURNS trigger AS $$
BEGIN
  REFRESH MATERIALIZED VIEW CONCURRENTLY mv_college_analytics;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Trigger to refresh (optional, depending on update frequency)
-- For high-volume cutoff data, a scheduled refresh is often better than a trigger.
-- CREATE TRIGGER trg_refresh_analytics AFTER INSERT OR UPDATE OR DELETE ON cutoffs
-- FOR EACH STATEMENT EXECUTE FUNCTION refresh_college_analytics();

-- 6. STATS UPDATE
ANALYZE cutoffs;
ANALYZE colleges;
ANALYZE branches;

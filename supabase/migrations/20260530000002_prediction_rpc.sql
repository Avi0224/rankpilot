-- Backend Audit Fix: Server-Side Prediction Engine
-- This function moves the heavy classification and ranking logic to the database server.
-- It reduces network payload and improves performance by filtering and classifying in one pass.

CREATE OR REPLACE FUNCTION predict_colleges_v2(
  p_rank integer,
  p_category text,
  p_quota text,
  p_gender text,
  p_year integer DEFAULT NULL,
  p_institute_types text[] DEFAULT NULL,
  p_states text[] DEFAULT NULL,
  p_branches text[] DEFAULT NULL,
  p_limit integer DEFAULT 200
)
RETURNS TABLE (
  id uuid,
  year integer,
  round integer,
  opening_rank integer,
  closing_rank integer,
  category text,
  quota text,
  gender text,
  college_id uuid,
  branch_id uuid,
  college jsonb,
  branch jsonb,
  probability text,
  confidence_score integer,
  reason text
) 
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  WITH filtered_cutoffs AS (
    SELECT 
      c.*,
      col.name as college_name,
      col.short_name as college_short_name,
      col.state as college_state,
      col.city as college_city,
      col.type as college_type,
      col.nirf_rank as college_nirf_rank,
      col.avg_package as college_avg_package,
      col.fees_per_year as college_fees_per_year,
      b.branch_name as branch_name
    FROM cutoffs c
    JOIN colleges col ON c.college_id = col.id
    JOIN branches b ON c.branch_id = b.id
    WHERE c.category = p_category
      AND c.quota = p_quota
      AND c.gender = p_gender
      AND c.opening_rank <= p_rank
      AND c.closing_rank >= p_rank
      AND (p_year IS NULL OR c.year = p_year)
      AND (p_institute_types IS NULL OR col.type = ANY(p_institute_types))
      AND (p_states IS NULL OR col.state = ANY(p_states))
      AND (p_branches IS NULL OR b.branch_name = ANY(p_branches))
    ORDER BY c.closing_rank ASC
    LIMIT p_limit
  )
  SELECT 
    fc.id,
    fc.year,
    fc.round,
    fc.opening_rank,
    fc.closing_rank,
    fc.category,
    fc.quota,
    fc.gender,
    fc.college_id,
    fc.branch_id,
    jsonb_build_object(
      'id', fc.college_id,
      'name', fc.college_name,
      'short_name', fc.college_short_name,
      'state', fc.college_state,
      'city', fc.college_city,
      'type', fc.college_type,
      'nirf_rank', fc.college_nirf_rank,
      'avg_package', fc.college_avg_package,
      'fees_per_year', fc.college_fees_per_year
    ) as college,
    jsonb_build_object(
      'id', fc.branch_id,
      'branch_name', fc.branch_name
    ) as branch,
    CASE 
      WHEN ((fc.closing_rank - p_rank)::float / p_rank) * 100 > 20 THEN 'safe'
      WHEN ((fc.closing_rank - p_rank)::float / p_rank) * 100 > 5 THEN 'safe'
      WHEN ((fc.closing_rank - p_rank)::float / p_rank) * 100 >= 0 THEN 'moderate'
      WHEN ((fc.closing_rank - p_rank)::float / p_rank) * 100 > -5 THEN 'dream'
      ELSE 'dream'
    END as probability,
    CASE 
      WHEN ((fc.closing_rank - p_rank)::float / p_rank) * 100 > 20 THEN LEAST(99, (85 + ((fc.closing_rank - p_rank)::float / p_rank) * 50))::integer
      WHEN ((fc.closing_rank - p_rank)::float / p_rank) * 100 > 5 THEN (70 + ((fc.closing_rank - p_rank)::float / p_rank) * 100)::integer
      WHEN ((fc.closing_rank - p_rank)::float / p_rank) * 100 >= 0 THEN (40 + ((fc.closing_rank - p_rank)::float / p_rank) * 500)::integer
      WHEN ((fc.closing_rank - p_rank)::float / p_rank) * 100 > -5 THEN (20 + (((fc.closing_rank - p_rank)::float / p_rank) * 100 + 5) * 4)::integer
      ELSE GREATEST(5, (10 + ((fc.closing_rank - p_rank)::float / p_rank) * 100))::integer
    END as confidence_score,
    CASE 
      WHEN ((fc.closing_rank - p_rank)::float / p_rank) * 100 > 20 THEN 'Highly likely based on consistent historical cutoff trends.'
      WHEN ((fc.closing_rank - p_rank)::float / p_rank) * 100 > 5 THEN 'Very safe option with a comfortable rank margin.'
      WHEN ((fc.closing_rank - p_rank)::float / p_rank) * 100 >= 0 THEN 'Borderline match. Admission is probable but competitive.'
      WHEN ((fc.closing_rank - p_rank)::float / p_rank) * 100 > -5 THEN 'Ambitious target. Admission depends on slight trend shifts.'
      ELSE 'Highly ambitious. Significant cutoff drop required.'
    END as reason
  FROM filtered_cutoffs fc;
END;
$$;

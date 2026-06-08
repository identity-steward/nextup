
-- Report: counts per category and sample rows
SELECT 
  category,
  COUNT(*) as tag_count,
  MIN(sort_order) as sort_min,
  MAX(sort_order) as sort_max,
  STRING_AGG(label, ', ' ORDER BY sort_order) as labels
FROM visibility_tags
GROUP BY category
ORDER BY MIN(sort_order);

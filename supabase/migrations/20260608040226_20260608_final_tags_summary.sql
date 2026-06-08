
SELECT 
  category,
  COUNT(*) as tag_count,
  STRING_AGG(label, ', ' ORDER BY sort_order) as labels
FROM visibility_tags
GROUP BY category
ORDER BY MIN(sort_order);

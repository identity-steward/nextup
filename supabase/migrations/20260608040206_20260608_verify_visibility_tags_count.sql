
-- Verification query — run as migration so it executes in the same context.
-- Results will be visible in migration output.
DO $$
DECLARE
  total_before INT := 40; -- known count from Phase 3B audit
  total_after  INT;
BEGIN
  SELECT COUNT(*) INTO total_after FROM visibility_tags;
  RAISE NOTICE 'Total tags now: %', total_after;
  RAISE NOTICE 'Net inserted: %', total_after - total_before;
END $$;

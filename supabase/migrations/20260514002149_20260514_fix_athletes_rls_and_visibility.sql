/*
  # Fix athletes RLS public visibility policy

  ## Problem
  The public SELECT policy on `athletes` checks `is_active = true`, but every
  service method (getAllAthletes, getAthleteBySlug, getFeaturedAthlete) filters
  by `profile_status = 'active'`. The two gates read different columns, creating
  an unpredictable visibility state after admin approval.

  ## Changes
  1. Drop the old `"Anyone can view active athletes"` policy (reads `is_active`)
  2. Create `"Public can view active athletes"` policy (reads `profile_status`)

  The `sync_athlete_is_active` trigger already keeps `is_active` in sync with
  `profile_status`, so no data changes are needed — only the policy gate is updated.
*/

-- Drop old policy that reads is_active
DROP POLICY IF EXISTS "Anyone can view active athletes" ON public.athletes;

-- Create aligned policy that reads profile_status (same field all service methods use)
CREATE POLICY "Public can view active athletes"
  ON public.athletes
  FOR SELECT
  TO anon, authenticated
  USING (profile_status = 'active');

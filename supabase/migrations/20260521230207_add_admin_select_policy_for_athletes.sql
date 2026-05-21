/*
  # Add Admin SELECT Policy for Athletes Table

  ## Problem
  The athletes table was missing an admin SELECT policy, causing the admin
  live-athletes page to only return athletes with profile_status = 'active'
  (visible via the public policy). Pending, hidden, and rejected athletes
  were invisible to admins.

  ## Changes
  - Adds a new SELECT policy allowing users with role = 'admin' in their
    JWT app_metadata to read ALL athlete rows regardless of profile_status.

  ## Security
  - Mirrors the pattern already used by existing admin UPDATE and DELETE policies
  - Only applies to authenticated users with the admin role in app_metadata
*/

CREATE POLICY "Admins can view all athletes"
  ON athletes
  FOR SELECT
  TO authenticated
  USING (
    ((auth.jwt() -> 'app_metadata'::text) ->> 'role'::text) = 'admin'::text
  );

/*
  # Bind journey entry authorship to the signed-in account

  1. Problem
     The INSERT policy authenticated_insert_pending_entries forced
     status='pending' and visibility='private' but never constrained
     created_by, so a caller could file an entry in another member's name.

  2. Changes
     - Recreates the policy with an additional created_by = auth.uid() check.
     - Adds a DEFAULT of auth.uid() on journey_entries.created_by so inserts
       that omit the column still satisfy the check.

  3. Security notes
     1. The admin insert policy is untouched, so the moderation tooling keeps
        working.
     2. No existing client call inserts through this policy.
*/

ALTER TABLE public.journey_entries ALTER COLUMN created_by SET DEFAULT auth.uid();

DROP POLICY IF EXISTS "authenticated_insert_pending_entries" ON public.journey_entries;
CREATE POLICY "authenticated_insert_pending_entries"
  ON public.journey_entries FOR INSERT
  TO authenticated
  WITH CHECK (
    status = 'pending'
    AND visibility = 'private'
    AND auth.uid() IS NOT NULL
    AND created_by = auth.uid()
  );

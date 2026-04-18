/*
  # Add creator ownership and tighten RLS policies

  ## Summary
  Adds a `creator_uid` column to the `creators` table so each creator profile
  can be linked to a Supabase auth user. RLS policies are tightened so that
  only the owning user (or any authenticated admin) can update/delete their
  own row, while public reads remain open for active profiles.

  ## Changes

  ### `creators`
  - New `creator_uid` (uuid, nullable) — references auth.users(id).
    Nullable so existing admin-seeded rows are unaffected.
    Indexed for fast ownership lookups.

  ### RLS policy changes
  - DROP broad "Authenticated users can update/delete creators" policies
  - ADD ownership-scoped UPDATE policy: creator_uid = auth.uid()
  - ADD ownership-scoped DELETE policy: creator_uid = auth.uid()
  - INSERT policy unchanged (any authenticated user can create — admin gates
    this at the application layer)

  ## Security Notes
  - Public SELECT still works for active profiles (unchanged)
  - Unauthenticated users cannot mutate any row
  - Authenticated users can only UPDATE/DELETE rows they own (creator_uid = auth.uid())
  - Existing rows without a creator_uid cannot be mutated by anyone except
    through service-role (admin backend) until a uid is assigned
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'creators' AND column_name = 'creator_uid'
  ) THEN
    ALTER TABLE creators ADD COLUMN creator_uid uuid REFERENCES auth.users(id) ON DELETE SET NULL;
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS creators_creator_uid_idx
  ON creators (creator_uid)
  WHERE creator_uid IS NOT NULL;

-- Drop old overly-broad policies
DROP POLICY IF EXISTS "Authenticated users can update creators" ON creators;
DROP POLICY IF EXISTS "Authenticated users can delete creators" ON creators;

-- Ownership-scoped UPDATE: must own the row
CREATE POLICY "Creator can update own profile"
  ON creators
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = creator_uid)
  WITH CHECK (auth.uid() = creator_uid);

-- Ownership-scoped DELETE: must own the row
CREATE POLICY "Creator can delete own profile"
  ON creators
  FOR DELETE
  TO authenticated
  USING (auth.uid() = creator_uid);

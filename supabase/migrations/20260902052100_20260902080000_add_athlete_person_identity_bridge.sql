-- Phase 2F.1: Athlete → Person identity bridge
-- Adds nullable person_id and identity confirmation provenance fields to athletes.
-- No backfill. All existing athletes remain unresolved (person_id = NULL).

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'athletes' AND column_name = 'person_id'
  ) THEN
    ALTER TABLE public.athletes
      ADD COLUMN person_id uuid NULL REFERENCES public.persons(id) ON DELETE SET NULL;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'athletes' AND column_name = 'identity_confirmed_at'
  ) THEN
    ALTER TABLE public.athletes
      ADD COLUMN identity_confirmed_at timestamptz NULL;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'athletes' AND column_name = 'identity_confirmed_by'
  ) THEN
    ALTER TABLE public.athletes
      ADD COLUMN identity_confirmed_by uuid NULL;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'athletes' AND column_name = 'identity_confirmation_method'
  ) THEN
    ALTER TABLE public.athletes
      ADD COLUMN identity_confirmation_method text NULL
        CHECK (identity_confirmation_method IS NULL
               OR identity_confirmation_method IN ('admin_manual_review'));
  END IF;
END $$;

-- Index for identity-bridge queries
CREATE INDEX IF NOT EXISTS idx_athletes_person_id ON public.athletes(person_id);

-- Integrity constraint: if person_id is set, provenance fields must be set too.
-- if person_id is NULL, provenance fields should be NULL.
-- Enforced via a CHECK constraint.
ALTER TABLE public.athletes DROP CONSTRAINT IF EXISTS athlete_identity_provenance_check;
ALTER TABLE public.athletes ADD CONSTRAINT athlete_identity_provenance_check CHECK (
  (
    person_id IS NOT NULL
    AND identity_confirmed_at IS NOT NULL
    AND identity_confirmed_by IS NOT NULL
    AND identity_confirmation_method IS NOT NULL
  )
  OR
  (
    person_id IS NULL
    AND identity_confirmed_at IS NULL
    AND identity_confirmed_by IS NULL
    AND identity_confirmation_method IS NULL
  )
);

-- RLS: Only admins can modify identity-bridge fields.
-- The existing "Admins can update athletes" policy already covers all columns
-- for admin role. The "Athletes can update own profile" policy allows
-- auth.uid() = auth_user_id to update. We need to prevent non-admins from
-- setting person_id and identity provenance fields.

-- Create a SECURITY DEFINER function that only admins can call to update
-- identity-bridge fields, and revoke direct UPDATE access to those columns
-- from non-admins via a column-level UPDATE policy.

-- Approach: Add a restrictive UPDATE policy for identity columns.
-- Since Postgres RLS is row-level (not column-level), we use a trigger
-- to prevent non-admins from setting identity-bridge fields.

CREATE OR REPLACE FUNCTION public.guard_athlete_identity_fields()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public', 'pg_catalog'
AS $$
DECLARE
  v_is_admin boolean;
BEGIN
  SELECT (auth.jwt() -> 'app_metadata' ->> 'role') = 'admin' INTO v_is_admin;

  IF NOT v_is_admin THEN
    -- Non-admins cannot modify identity-bridge fields
    IF NEW.person_id IS DISTINCT FROM OLD.person_id
       OR NEW.identity_confirmed_at IS DISTINCT FROM OLD.identity_confirmed_at
       OR NEW.identity_confirmed_by IS DISTINCT FROM OLD.identity_confirmed_by
       OR NEW.identity_confirmation_method IS DISTINCT FROM OLD.identity_confirmation_method
    THEN
      RAISE EXCEPTION 'Permission denied: only admins can modify athlete identity fields';
    END IF;
  END IF;

  RETURN NEW;
END;
$$;

REVOKE ALL ON FUNCTION public.guard_athlete_identity_fields() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.guard_athlete_identity_fields() TO authenticated;

DROP TRIGGER IF EXISTS trg_guard_athlete_identity ON public.athletes;
CREATE TRIGGER trg_guard_athlete_identity
  BEFORE UPDATE ON public.athletes
  FOR EACH ROW
  EXECUTE FUNCTION public.guard_athlete_identity_fields();

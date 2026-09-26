-- Phase 2F.2: Youth-governance classification + Person relationships
--
-- 1. Replace persons.is_youth boolean with a tri-state youth_governance_status
--    to distinguish "adult" from "not yet reviewed"
-- 2. Add youth-status provenance fields
-- 3. Create person_relationships table for explicit Person ↔ Person relationships
-- 4. RLS: admin-only for both youth status and relationship management

-- ============================================================
-- 1. Youth-governance status on persons
-- ============================================================

-- Add new tri-state column alongside existing is_youth
ALTER TABLE public.persons
  ADD COLUMN IF NOT EXISTS youth_governance_status text NOT NULL DEFAULT 'unknown'
    CHECK (youth_governance_status IN ('youth', 'adult', 'unknown'));

ALTER TABLE public.persons
  ADD COLUMN IF NOT EXISTS youth_status_confirmed_at timestamptz NULL;
ALTER TABLE public.persons
  ADD COLUMN IF NOT EXISTS youth_status_confirmed_by uuid NULL;
ALTER TABLE public.persons
  ADD COLUMN IF NOT EXISTS youth_status_source text NULL
    CHECK (youth_status_source IS NULL
           OR youth_status_source IN ('subject_declared', 'guardian_declared', 'admin_recorded'));

-- Migrate existing is_youth values: false -> 'unknown' (not 'adult', since we don't know if it was reviewed)
-- true -> 'youth'
UPDATE public.persons SET youth_governance_status = 'youth' WHERE is_youth = true;
UPDATE public.persons SET youth_governance_status = 'unknown' WHERE is_youth = false;

-- Drop the old boolean column
ALTER TABLE public.persons DROP COLUMN IF EXISTS is_youth;

-- Integrity constraint: if status is not 'unknown', provenance must be set
ALTER TABLE public.persons DROP CONSTRAINT IF EXISTS person_youth_status_provenance_check;
ALTER TABLE public.persons ADD CONSTRAINT person_youth_status_provenance_check CHECK (
  (
    youth_governance_status IN ('youth', 'adult')
    AND youth_status_confirmed_at IS NOT NULL
    AND youth_status_confirmed_by IS NOT NULL
    AND youth_status_source IS NOT NULL
  )
  OR
  (
    youth_governance_status = 'unknown'
    AND youth_status_confirmed_at IS NULL
    AND youth_status_confirmed_by IS NULL
    AND youth_status_source IS NULL
  )
);

-- ============================================================
-- 2. Person relationships table
-- ============================================================

CREATE TABLE IF NOT EXISTS public.person_relationships (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  subject_person_id uuid NOT NULL REFERENCES public.persons(id) ON DELETE CASCADE,
  related_person_id uuid NOT NULL REFERENCES public.persons(id) ON DELETE CASCADE,
  relationship_type text NOT NULL
    CHECK (relationship_type IN ('parent', 'guardian', 'caregiver', 'sibling', 'other')),
  status text NOT NULL DEFAULT 'active'
    CHECK (status IN ('active', 'disputed', 'ended')),
  source text NOT NULL DEFAULT 'admin_recorded'
    CHECK (source IN ('self_declared', 'subject_confirmed', 'related_person_confirmed', 'admin_recorded', 'external_record')),
  confirmed_at timestamptz NOT NULL DEFAULT now(),
  confirmed_by uuid NOT NULL,
  ended_at timestamptz NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Prevent duplicate active relationships of the same type between the same pair
CREATE UNIQUE INDEX IF NOT EXISTS idx_person_rel_unique_active
  ON public.person_relationships (subject_person_id, related_person_id, relationship_type)
  WHERE status = 'active';

CREATE INDEX IF NOT EXISTS idx_person_rel_subject ON public.person_relationships(subject_person_id);
CREATE INDEX IF NOT EXISTS idx_person_rel_related ON public.person_relationships(related_person_id);

-- Constraint: subject and related must be different people
ALTER TABLE public.person_relationships
  DROP CONSTRAINT IF EXISTS person_rel_not_self_check;
ALTER TABLE public.person_relationships
  ADD CONSTRAINT person_rel_not_self_check CHECK (subject_person_id <> related_person_id);

-- Integrity: if status is 'ended', ended_at must be set
ALTER TABLE public.person_relationships
  DROP CONSTRAINT IF EXISTS person_rel_ended_check;
ALTER TABLE public.person_relationships
  ADD CONSTRAINT person_rel_ended_check CHECK (
    (status = 'ended' AND ended_at IS NOT NULL)
    OR (status <> 'ended')
  );

-- ============================================================
-- 3. RLS
-- ============================================================

-- Enable RLS on person_relationships
ALTER TABLE public.person_relationships ENABLE ROW LEVEL SECURITY;

-- Admins can do everything with person_relationships
CREATE POLICY "admin_all_person_relationships" ON public.person_relationships
  FOR ALL TO authenticated
  USING ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin')
  WITH CHECK ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');

-- Persons can view relationships where they are the subject or related person
-- (read-only, no writes)
CREATE POLICY "person_view_own_relationships" ON public.person_relationships
  FOR SELECT TO authenticated
  USING (
    subject_person_id IN (SELECT id FROM public.persons WHERE auth_user_id = auth.uid())
    OR related_person_id IN (SELECT id FROM public.persons WHERE auth_user_id = auth.uid())
  );

-- ============================================================
-- 4. Guard youth-status fields on persons (trigger)
-- ============================================================

CREATE OR REPLACE FUNCTION public.guard_person_youth_fields()
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
    IF NEW.youth_governance_status IS DISTINCT FROM OLD.youth_governance_status
       OR NEW.youth_status_confirmed_at IS DISTINCT FROM OLD.youth_status_confirmed_at
       OR NEW.youth_status_confirmed_by IS DISTINCT FROM OLD.youth_status_confirmed_by
       OR NEW.youth_status_source IS DISTINCT FROM OLD.youth_status_source
    THEN
      RAISE EXCEPTION 'Permission denied: only admins can modify youth-governance fields';
    END IF;
  END IF;

  RETURN NEW;
END;
$$;

REVOKE ALL ON FUNCTION public.guard_person_youth_fields() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.guard_person_youth_fields() TO authenticated;

DROP TRIGGER IF EXISTS trg_guard_person_youth ON public.persons;
CREATE TRIGGER trg_guard_person_youth
  BEFORE UPDATE ON public.persons
  FOR EACH ROW
  EXECUTE FUNCTION public.guard_person_youth_fields();

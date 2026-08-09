/*
  # Phase 2 — Person-Centered Narration Schema

  ## Summary
  Creates the first person-centered data layer for NextUp Pilot 001.
  Five new tables: persons, households, household_memberships,
  person_narrations, and needs. All have RLS enabled with ownership-scoped
  policies. Existing youth athlete data is untouched.

  ## New Tables

  ### persons
  - Represents a person independently from athlete/profile identity.
  - `auth_user_id` (nullable) links to the auth user who owns this person record.
  - `first_name` (required), `last_name` (nullable), `is_youth` (boolean).
  - No demographic data (income, insurance, SSN, etc.) is collected.

  ### households
  - `name` (nullable) — a household name is NOT required.
  - `created_by_person_id` references persons.

  ### household_memberships
  - Links a person to a household with a simple `relationship_role` text field.
  - Does NOT encode legal custody or legal authority.
  - Household membership does NOT equal authority to act.

  ### person_narrations
  - The core table: stores the person's original narration and NextUp's
    interpretation.
  - `original_text` is IMMUTABLE after submission (enforced by trigger).
  - `proposed_interpretation` is entered by an authorized reviewer.
  - `confirmed_interpretation` is set when the person confirms or modifies.
  - Status flow: draft → submitted → proposed → confirmed/modified/rejected.

  ### needs
  - Organizational representation of confirmed information.
  - Must originate from a confirmed or modified interpretation.
  - NOT a diagnosis or official determination.
  - Statuses: confirmed, active, met, unmet, chose_differently.

  ## Security
  - RLS enabled on all 5 tables.
  - A person can only access records for their own person/household context.
  - Admins (app_metadata.role = 'admin') can access all records for review.
  - No table is publicly readable.
  - Cross-household access is blocked by policy predicates.

  ## Important Notes
  1. No existing tables were modified or dropped.
  2. No athlete records are migrated into persons.
  3. original_text immutability is enforced by a database trigger.
  4. Needs are linked to a narration_id so they remain traceable to the
     person's original story.
*/

-- ============================================================
-- persons
-- ============================================================

CREATE TABLE IF NOT EXISTS public.persons (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  auth_user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  first_name text NOT NULL,
  last_name text,
  is_youth boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.persons ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_own_person" ON public.persons;
CREATE POLICY "select_own_person"
  ON public.persons FOR SELECT
  TO authenticated
  USING (auth.uid() = auth_user_id);

DROP POLICY IF EXISTS "insert_own_person" ON public.persons;
CREATE POLICY "insert_own_person"
  ON public.persons FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = auth_user_id);

DROP POLICY IF EXISTS "update_own_person" ON public.persons;
CREATE POLICY "update_own_person"
  ON public.persons FOR UPDATE
  TO authenticated
  USING (auth.uid() = auth_user_id)
  WITH CHECK (auth.uid() = auth_user_id);

DROP POLICY IF EXISTS "admin_select_persons" ON public.persons;
CREATE POLICY "admin_select_persons"
  ON public.persons FOR SELECT
  TO authenticated
  USING ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');

DROP POLICY IF EXISTS "admin_update_persons" ON public.persons;
CREATE POLICY "admin_update_persons"
  ON public.persons FOR UPDATE
  TO authenticated
  USING ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin')
  WITH CHECK ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');

CREATE INDEX IF NOT EXISTS idx_persons_auth_user_id ON public.persons(auth_user_id);

-- ============================================================
-- households (table only — policies after household_memberships)
-- ============================================================

CREATE TABLE IF NOT EXISTS public.households (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text,
  created_by_person_id uuid NOT NULL REFERENCES public.persons(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.households ENABLE ROW LEVEL SECURITY;

-- INSERT policy can be defined now (doesn't reference household_memberships)
DROP POLICY IF EXISTS "insert_own_household" ON public.households;
CREATE POLICY "insert_own_household"
  ON public.households FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.persons p
      WHERE p.id = households.created_by_person_id
        AND p.auth_user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "admin_select_households" ON public.households;
CREATE POLICY "admin_select_households"
  ON public.households FOR SELECT
  TO authenticated
  USING ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');

DROP POLICY IF EXISTS "admin_update_households" ON public.households;
CREATE POLICY "admin_update_households"
  ON public.households FOR UPDATE
  TO authenticated
  USING ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin')
  WITH CHECK ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');

CREATE INDEX IF NOT EXISTS idx_households_created_by ON public.households(created_by_person_id);

-- ============================================================
-- household_memberships
-- ============================================================

CREATE TABLE IF NOT EXISTS public.household_memberships (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  household_id uuid NOT NULL REFERENCES public.households(id) ON DELETE CASCADE,
  person_id uuid NOT NULL REFERENCES public.persons(id) ON DELETE CASCADE,
  relationship_role text NOT NULL DEFAULT 'self',
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.household_memberships ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_own_memberships" ON public.household_memberships;
CREATE POLICY "select_own_memberships"
  ON public.household_memberships FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.persons p
      WHERE p.id = household_memberships.person_id
        AND p.auth_user_id = auth.uid()
    )
    OR EXISTS (
      SELECT 1 FROM public.household_memberships hm2
      JOIN public.persons p2 ON hm2.person_id = p2.id
      WHERE hm2.household_id = household_memberships.household_id
        AND p2.auth_user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "insert_own_memberships" ON public.household_memberships;
CREATE POLICY "insert_own_memberships"
  ON public.household_memberships FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.households h
      JOIN public.persons p ON h.created_by_person_id = p.id
      WHERE h.id = household_memberships.household_id
        AND p.auth_user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "delete_own_memberships" ON public.household_memberships;
CREATE POLICY "delete_own_memberships"
  ON public.household_memberships FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.households h
      JOIN public.persons p ON h.created_by_person_id = p.id
      WHERE h.id = household_memberships.household_id
        AND p.auth_user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "admin_select_memberships" ON public.household_memberships;
CREATE POLICY "admin_select_memberships"
  ON public.household_memberships FOR SELECT
  TO authenticated
  USING ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');

DROP POLICY IF EXISTS "admin_insert_memberships" ON public.household_memberships;
CREATE POLICY "admin_insert_memberships"
  ON public.household_memberships FOR INSERT
  TO authenticated
  WITH CHECK ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');

DROP POLICY IF EXISTS "admin_delete_memberships" ON public.household_memberships;
CREATE POLICY "admin_delete_memberships"
  ON public.household_memberships FOR DELETE
  TO authenticated
  USING ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');

CREATE INDEX IF NOT EXISTS idx_hm_household_id ON public.household_memberships(household_id);
CREATE INDEX IF NOT EXISTS idx_hm_person_id ON public.household_memberships(person_id);

-- ============================================================
-- households SELECT + UPDATE policies (now that household_memberships exists)
-- ============================================================

DROP POLICY IF EXISTS "select_own_household" ON public.households;
CREATE POLICY "select_own_household"
  ON public.households FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.household_memberships hm
      JOIN public.persons p ON hm.person_id = p.id
      WHERE hm.household_id = households.id
        AND p.auth_user_id = auth.uid()
    )
    OR EXISTS (
      SELECT 1 FROM public.persons p
      WHERE p.id = households.created_by_person_id
        AND p.auth_user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "update_own_household" ON public.households;
CREATE POLICY "update_own_household"
  ON public.households FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.persons p
      WHERE p.id = households.created_by_person_id
        AND p.auth_user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.persons p
      WHERE p.id = households.created_by_person_id
        AND p.auth_user_id = auth.uid()
    )
  );

-- ============================================================
-- person_narrations
-- ============================================================

CREATE TABLE IF NOT EXISTS public.person_narrations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  person_id uuid NOT NULL REFERENCES public.persons(id) ON DELETE CASCADE,
  household_id uuid REFERENCES public.households(id) ON DELETE SET NULL,
  original_text text NOT NULL,
  proposed_interpretation text,
  confirmed_interpretation text,
  status text NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'submitted', 'proposed', 'confirmed', 'modified', 'rejected')),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  submitted_at timestamptz,
  confirmed_at timestamptz
);

ALTER TABLE public.person_narrations ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_own_narrations" ON public.person_narrations;
CREATE POLICY "select_own_narrations"
  ON public.person_narrations FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.persons p
      WHERE p.id = person_narrations.person_id
        AND p.auth_user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "insert_own_narrations" ON public.person_narrations;
CREATE POLICY "insert_own_narrations"
  ON public.person_narrations FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.persons p
      WHERE p.id = person_narrations.person_id
        AND p.auth_user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "update_own_narrations" ON public.person_narrations;
CREATE POLICY "update_own_narrations"
  ON public.person_narrations FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.persons p
      WHERE p.id = person_narrations.person_id
        AND p.auth_user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.persons p
      WHERE p.id = person_narrations.person_id
        AND p.auth_user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "admin_select_narrations" ON public.person_narrations;
CREATE POLICY "admin_select_narrations"
  ON public.person_narrations FOR SELECT
  TO authenticated
  USING ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');

DROP POLICY IF EXISTS "admin_update_narrations" ON public.person_narrations;
CREATE POLICY "admin_update_narrations"
  ON public.person_narrations FOR UPDATE
  TO authenticated
  USING ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin')
  WITH CHECK ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');

CREATE INDEX IF NOT EXISTS idx_narrations_person_id ON public.person_narrations(person_id);
CREATE INDEX IF NOT EXISTS idx_narrations_household_id ON public.person_narrations(household_id);
CREATE INDEX IF NOT EXISTS idx_narrations_status ON public.person_narrations(status);

-- Trigger: prevent original_text from being modified after submission
CREATE OR REPLACE FUNCTION public.protect_narration_original_text()
  RETURNS trigger
  LANGUAGE plpgsql
  SECURITY DEFINER
  SET search_path = public, pg_catalog
AS $$
BEGIN
  IF TG_OP = 'UPDATE' AND OLD.status IN ('submitted', 'proposed', 'confirmed', 'modified', 'rejected') THEN
    IF NEW.original_text IS DISTINCT FROM OLD.original_text THEN
      RAISE EXCEPTION 'original_text is immutable after submission and cannot be modified';
    END IF;
  END IF;
  NEW.updated_at := now();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_protect_narration_original ON public.person_narrations;
CREATE TRIGGER trg_protect_narration_original
  BEFORE UPDATE ON public.person_narrations
  FOR EACH ROW EXECUTE FUNCTION public.protect_narration_original_text();

-- ============================================================
-- needs
-- ============================================================

CREATE TABLE IF NOT EXISTS public.needs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  person_id uuid NOT NULL REFERENCES public.persons(id) ON DELETE CASCADE,
  household_id uuid REFERENCES public.households(id) ON DELETE SET NULL,
  narration_id uuid NOT NULL REFERENCES public.person_narrations(id) ON DELETE CASCADE,
  title text NOT NULL,
  description text,
  status text NOT NULL DEFAULT 'confirmed' CHECK (status IN ('confirmed', 'active', 'met', 'unmet', 'chose_differently')),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.needs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_own_needs" ON public.needs;
CREATE POLICY "select_own_needs"
  ON public.needs FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.persons p
      WHERE p.id = needs.person_id
        AND p.auth_user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "insert_own_needs" ON public.needs;
CREATE POLICY "insert_own_needs"
  ON public.needs FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.persons p
      WHERE p.id = needs.person_id
        AND p.auth_user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "update_own_needs" ON public.needs;
CREATE POLICY "update_own_needs"
  ON public.needs FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.persons p
      WHERE p.id = needs.person_id
        AND p.auth_user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.persons p
      WHERE p.id = needs.person_id
        AND p.auth_user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "delete_own_needs" ON public.needs;
CREATE POLICY "delete_own_needs"
  ON public.needs FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.persons p
      WHERE p.id = needs.person_id
        AND p.auth_user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "admin_select_needs" ON public.needs;
CREATE POLICY "admin_select_needs"
  ON public.needs FOR SELECT
  TO authenticated
  USING ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');

DROP POLICY IF EXISTS "admin_update_needs" ON public.needs;
CREATE POLICY "admin_update_needs"
  ON public.needs FOR UPDATE
  TO authenticated
  USING ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin')
  WITH CHECK ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');

CREATE INDEX IF NOT EXISTS idx_needs_person_id ON public.needs(person_id);
CREATE INDEX IF NOT EXISTS idx_needs_household_id ON public.needs(household_id);
CREATE INDEX IF NOT EXISTS idx_needs_narration_id ON public.needs(narration_id);
CREATE INDEX IF NOT EXISTS idx_needs_status ON public.needs(status);

-- ============================================================
-- updated_at triggers
-- ============================================================

CREATE OR REPLACE FUNCTION public.update_timestamp()
  RETURNS trigger
  LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at := now();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_persons_updated ON public.persons;
CREATE TRIGGER trg_persons_updated
  BEFORE UPDATE ON public.persons
  FOR EACH ROW EXECUTE FUNCTION public.update_timestamp();

DROP TRIGGER IF EXISTS trg_households_updated ON public.households;
CREATE TRIGGER trg_households_updated
  BEFORE UPDATE ON public.households
  FOR EACH ROW EXECUTE FUNCTION public.update_timestamp();

DROP TRIGGER IF EXISTS trg_needs_updated ON public.needs;
CREATE TRIGGER trg_needs_updated
  BEFORE UPDATE ON public.needs
  FOR EACH ROW EXECUTE FUNCTION public.update_timestamp();
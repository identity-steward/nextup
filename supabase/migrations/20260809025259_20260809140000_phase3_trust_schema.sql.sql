/*
  # Phase 3 — Trust Schema

  ## Summary
  Creates the trust and permission layer for NextUp Pilot 001.
  Eight new tables: navigator_assignments, authority_to_act,
  youth_assents, consent_grants, disclosures, document_references,
  escalations, incidents. All have RLS enabled with ownership-scoped
  and navigator-assignment-scoped policies.

  ## Design Principles
  - People narrate. NextUp translates. Authorities determine.
  - Consent does not equal authority.
  - Household membership does not equal authority.
  - Youth voice does not disappear because an adult is involved.
  - Hard stop does not equal dead end.
  - A document can exist without NextUp possessing it.

  ## New Tables

  ### navigator_assignments
  Governs internal access to households. Being a navigator does NOT
  grant access to all households — only to assigned ones.

  ### authority_to_act
  Records who may act for a person, scoped by data_category x action_type.
  Authority is NOT global. Hard stops: disputed, legal_instrument_asserted
  with unresolved effect, authority expired/review date reached.

  ### youth_assents
  Records youth assent per data_category x action_type.
  asked_declined and relevant not_yet_asked must block automated disclosure.

  ### consent_grants
  New Trust-layer table (separate from legacy consents table which is tied
  to athletes/media). Answers WHO, WHY, WHAT, DURATION.

  ### disclosures
  Records what actually left NextUp. No artifact_url. Auto-logged when
  send succeeds. No send-without-logging path.

  ### document_references
  Metadata only. No file upload, no storage path, no signed URL, no binary.

  ### escalations
  A hard stop must have a next action. Triggered by authority unresolved,
  youth assent review, legal instrument asserted, consent ambiguity, etc.

  ### incidents
  Records unauthorized disclosure, incorrect recipient, reliance
  substitution, funding misinformation, inappropriate internal access, other.

  ## Security
  - RLS enabled on all 8 tables.
  - Household members access their own household records.
  - Navigators access only assigned households via navigator_assignments.
  - Admins access all records.
  - Cross-household access is blocked.
  - No table is publicly readable.

  ## Important Notes
  1. No existing tables modified or dropped.
  2. Legacy consents table (athlete/media) is untouched.
  3. No file upload or storage paths in document_references.
  4. No verification letters, certification PDFs, or official attestations.
*/

-- ============================================================
-- navigator_assignments
-- ============================================================

CREATE TABLE IF NOT EXISTS public.navigator_assignments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  navigator_user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  household_id uuid NOT NULL REFERENCES public.households(id) ON DELETE CASCADE,
  assignment_status text NOT NULL DEFAULT 'active' CHECK (assignment_status IN ('active', 'paused', 'ended')),
  assigned_at timestamptz NOT NULL DEFAULT now(),
  expires_at timestamptz,
  assigned_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.navigator_assignments ENABLE ROW LEVEL SECURITY;

-- Admins can do everything
DROP POLICY IF EXISTS "admin_all_navigator_assignments" ON public.navigator_assignments;
CREATE POLICY "admin_all_navigator_assignments"
  ON public.navigator_assignments FOR ALL
  TO authenticated
  USING ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin')
  WITH CHECK ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');

-- A navigator can see their own assignments
DROP POLICY IF EXISTS "navigator_select_own_assignments" ON public.navigator_assignments;
CREATE POLICY "navigator_select_own_assignments"
  ON public.navigator_assignments FOR SELECT
  TO authenticated
  USING (auth.uid() = navigator_user_id);

-- A household member can see who is assigned to their household
DROP POLICY IF EXISTS "household_select_own_navigator_assignments" ON public.navigator_assignments;
CREATE POLICY "household_select_own_navigator_assignments"
  ON public.navigator_assignments FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.household_memberships hm
      JOIN public.persons p ON hm.person_id = p.id
      WHERE hm.household_id = navigator_assignments.household_id
        AND p.auth_user_id = auth.uid()
    )
  );

CREATE INDEX IF NOT EXISTS idx_nav_assign_navigator ON public.navigator_assignments(navigator_user_id);
CREATE INDEX IF NOT EXISTS idx_nav_assign_household ON public.navigator_assignments(household_id);
CREATE INDEX IF NOT EXISTS idx_nav_assign_status ON public.navigator_assignments(assignment_status);

-- ============================================================
-- authority_to_act
-- ============================================================

CREATE TABLE IF NOT EXISTS public.authority_to_act (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  subject_person_id uuid NOT NULL REFERENCES public.persons(id) ON DELETE CASCADE,
  actor_person_id uuid REFERENCES public.persons(id) ON DELETE SET NULL,
  actor_user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  household_id uuid NOT NULL REFERENCES public.households(id) ON DELETE CASCADE,
  data_category text NOT NULL,
  action_type text NOT NULL,
  authority_basis text,
  verification_status text NOT NULL DEFAULT 'unknown' CHECK (verification_status IN ('asserted', 'documented', 'verified_by_qualified_authority', 'disputed', 'unknown')),
  legal_instrument_asserted boolean NOT NULL DEFAULT false,
  disputed boolean NOT NULL DEFAULT false,
  effective_at timestamptz,
  review_at timestamptz,
  expires_at timestamptz,
  notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.authority_to_act ENABLE ROW LEVEL SECURITY;

-- Household members can read their own authority records
DROP POLICY IF EXISTS "household_select_authority" ON public.authority_to_act;
CREATE POLICY "household_select_authority"
  ON public.authority_to_act FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.household_memberships hm
      JOIN public.persons p ON hm.person_id = p.id
      WHERE hm.household_id = authority_to_act.household_id
        AND p.auth_user_id = auth.uid()
    )
  );

-- Navigators can read authority for assigned households
DROP POLICY IF EXISTS "navigator_select_authority" ON public.authority_to_act;
CREATE POLICY "navigator_select_authority"
  ON public.authority_to_act FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.navigator_assignments na
      WHERE na.household_id = authority_to_act.household_id
        AND na.navigator_user_id = auth.uid()
        AND na.assignment_status = 'active'
    )
  );

-- Admins can read and update
DROP POLICY IF EXISTS "admin_select_authority" ON public.authority_to_act;
CREATE POLICY "admin_select_authority"
  ON public.authority_to_act FOR SELECT
  TO authenticated
  USING ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');

DROP POLICY IF EXISTS "admin_update_authority" ON public.authority_to_act;
CREATE POLICY "admin_update_authority"
  ON public.authority_to_act FOR UPDATE
  TO authenticated
  USING ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin')
  WITH CHECK ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');

DROP POLICY IF EXISTS "admin_insert_authority" ON public.authority_to_act;
CREATE POLICY "admin_insert_authority"
  ON public.authority_to_act FOR INSERT
  TO authenticated
  WITH CHECK ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');

-- Household members can insert authority for their own household
DROP POLICY IF EXISTS "household_insert_authority" ON public.authority_to_act;
CREATE POLICY "household_insert_authority"
  ON public.authority_to_act FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.household_memberships hm
      JOIN public.persons p ON hm.person_id = p.id
      WHERE hm.household_id = authority_to_act.household_id
        AND p.auth_user_id = auth.uid()
    )
  );

-- Household members can update their own authority records
DROP POLICY IF EXISTS "household_update_authority" ON public.authority_to_act;
CREATE POLICY "household_update_authority"
  ON public.authority_to_act FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.household_memberships hm
      JOIN public.persons p ON hm.person_id = p.id
      WHERE hm.household_id = authority_to_act.household_id
        AND p.auth_user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.household_memberships hm
      JOIN public.persons p ON hm.person_id = p.id
      WHERE hm.household_id = authority_to_act.household_id
        AND p.auth_user_id = auth.uid()
    )
  );

CREATE INDEX IF NOT EXISTS idx_auth_subject ON public.authority_to_act(subject_person_id);
CREATE INDEX IF NOT EXISTS idx_auth_household ON public.authority_to_act(household_id);
CREATE INDEX IF NOT EXISTS idx_auth_status ON public.authority_to_act(verification_status);

-- ============================================================
-- youth_assents
-- ============================================================

CREATE TABLE IF NOT EXISTS public.youth_assents (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  youth_person_id uuid NOT NULL REFERENCES public.persons(id) ON DELETE CASCADE,
  household_id uuid NOT NULL REFERENCES public.households(id) ON DELETE CASCADE,
  data_category text NOT NULL,
  action_type text NOT NULL,
  recipient_label text,
  status text NOT NULL DEFAULT 'not_yet_asked' CHECK (status IN ('asked_agreed', 'asked_declined', 'not_yet_asked', 'not_applicable', 'unknown')),
  asked_at timestamptz,
  reviewed_at timestamptz,
  reviewed_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.youth_assents ENABLE ROW LEVEL SECURITY;

-- Household members can read their own youth assent records
DROP POLICY IF EXISTS "household_select_youth_assent" ON public.youth_assents;
CREATE POLICY "household_select_youth_assent"
  ON public.youth_assents FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.household_memberships hm
      JOIN public.persons p ON hm.person_id = p.id
      WHERE hm.household_id = youth_assents.household_id
        AND p.auth_user_id = auth.uid()
    )
  );

-- Navigators can read for assigned households
DROP POLICY IF EXISTS "navigator_select_youth_assent" ON public.youth_assents;
CREATE POLICY "navigator_select_youth_assent"
  ON public.youth_assents FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.navigator_assignments na
      WHERE na.household_id = youth_assents.household_id
        AND na.navigator_user_id = auth.uid()
        AND na.assignment_status = 'active'
    )
  );

-- Admins full access
DROP POLICY IF EXISTS "admin_all_youth_assent" ON public.youth_assents;
CREATE POLICY "admin_all_youth_assent"
  ON public.youth_assents FOR ALL
  TO authenticated
  USING ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin')
  WITH CHECK ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');

-- Household members can insert/update
DROP POLICY IF EXISTS "household_insert_youth_assent" ON public.youth_assents;
CREATE POLICY "household_insert_youth_assent"
  ON public.youth_assents FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.household_memberships hm
      JOIN public.persons p ON hm.person_id = p.id
      WHERE hm.household_id = youth_assents.household_id
        AND p.auth_user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "household_update_youth_assent" ON public.youth_assents;
CREATE POLICY "household_update_youth_assent"
  ON public.youth_assents FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.household_memberships hm
      JOIN public.persons p ON hm.person_id = p.id
      WHERE hm.household_id = youth_assents.household_id
        AND p.auth_user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.household_memberships hm
      JOIN public.persons p ON hm.person_id = p.id
      WHERE hm.household_id = youth_assents.household_id
        AND p.auth_user_id = auth.uid()
    )
  );

CREATE INDEX IF NOT EXISTS idx_ya_youth ON public.youth_assents(youth_person_id);
CREATE INDEX IF NOT EXISTS idx_ya_household ON public.youth_assents(household_id);
CREATE INDEX IF NOT EXISTS idx_ya_status ON public.youth_assents(status);

-- ============================================================
-- consent_grants
-- ============================================================

CREATE TABLE IF NOT EXISTS public.consent_grants (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  subject_person_id uuid NOT NULL REFERENCES public.persons(id) ON DELETE CASCADE,
  authorizing_actor_id uuid NOT NULL REFERENCES public.persons(id) ON DELETE CASCADE,
  household_id uuid NOT NULL REFERENCES public.households(id) ON DELETE CASCADE,
  recipient_name text NOT NULL,
  recipient_type text,
  purpose text NOT NULL,
  data_categories jsonb NOT NULL DEFAULT '[]'::jsonb,
  effective_at timestamptz NOT NULL DEFAULT now(),
  expires_at timestamptz,
  revoked_at timestamptz,
  authority_to_act_id uuid REFERENCES public.authority_to_act(id) ON DELETE SET NULL,
  status text NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'active', 'revoked', 'expired')),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.consent_grants ENABLE ROW LEVEL SECURITY;

-- Household members can read their own consent grants
DROP POLICY IF EXISTS "household_select_consent" ON public.consent_grants;
CREATE POLICY "household_select_consent"
  ON public.consent_grants FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.household_memberships hm
      JOIN public.persons p ON hm.person_id = p.id
      WHERE hm.household_id = consent_grants.household_id
        AND p.auth_user_id = auth.uid()
    )
  );

-- Navigators can read for assigned households
DROP POLICY IF EXISTS "navigator_select_consent" ON public.consent_grants;
CREATE POLICY "navigator_select_consent"
  ON public.consent_grants FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.navigator_assignments na
      WHERE na.household_id = consent_grants.household_id
        AND na.navigator_user_id = auth.uid()
        AND na.assignment_status = 'active'
    )
  );

-- Admins full access
DROP POLICY IF EXISTS "admin_all_consent" ON public.consent_grants;
CREATE POLICY "admin_all_consent"
  ON public.consent_grants FOR ALL
  TO authenticated
  USING ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin')
  WITH CHECK ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');

-- Household members can insert/update
DROP POLICY IF EXISTS "household_insert_consent" ON public.consent_grants;
CREATE POLICY "household_insert_consent"
  ON public.consent_grants FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.household_memberships hm
      JOIN public.persons p ON hm.person_id = p.id
      WHERE hm.household_id = consent_grants.household_id
        AND p.auth_user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "household_update_consent" ON public.consent_grants;
CREATE POLICY "household_update_consent"
  ON public.consent_grants FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.household_memberships hm
      JOIN public.persons p ON hm.person_id = p.id
      WHERE hm.household_id = consent_grants.household_id
        AND p.auth_user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.household_memberships hm
      JOIN public.persons p ON hm.person_id = p.id
      WHERE hm.household_id = consent_grants.household_id
        AND p.auth_user_id = auth.uid()
    )
  );

CREATE INDEX IF NOT EXISTS idx_cg_subject ON public.consent_grants(subject_person_id);
CREATE INDEX IF NOT EXISTS idx_cg_household ON public.consent_grants(household_id);
CREATE INDEX IF NOT EXISTS idx_cg_status ON public.consent_grants(status);

-- ============================================================
-- disclosures
-- ============================================================

CREATE TABLE IF NOT EXISTS public.disclosures (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  consent_grant_id uuid REFERENCES public.consent_grants(id) ON DELETE SET NULL,
  subject_person_id uuid NOT NULL REFERENCES public.persons(id) ON DELETE CASCADE,
  household_id uuid NOT NULL REFERENCES public.households(id) ON DELETE CASCADE,
  sender_user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  recipient_name text NOT NULL,
  purpose text NOT NULL,
  data_fields jsonb NOT NULL DEFAULT '[]'::jsonb,
  claim_attributions jsonb,
  sent_at timestamptz NOT NULL DEFAULT now(),
  delivery_method text,
  status text NOT NULL DEFAULT 'sent' CHECK (status IN ('sent', 'failed', 'revoked')),
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.disclosures ENABLE ROW LEVEL SECURITY;

-- Household members can read their own disclosures
DROP POLICY IF EXISTS "household_select_disclosure" ON public.disclosures;
CREATE POLICY "household_select_disclosure"
  ON public.disclosures FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.household_memberships hm
      JOIN public.persons p ON hm.person_id = p.id
      WHERE hm.household_id = disclosures.household_id
        AND p.auth_user_id = auth.uid()
    )
  );

-- Navigators can read for assigned households
DROP POLICY IF EXISTS "navigator_select_disclosure" ON public.disclosures;
CREATE POLICY "navigator_select_disclosure"
  ON public.disclosures FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.navigator_assignments na
      WHERE na.household_id = disclosures.household_id
        AND na.navigator_user_id = auth.uid()
        AND na.assignment_status = 'active'
    )
  );

-- Admins full access
DROP POLICY IF EXISTS "admin_all_disclosure" ON public.disclosures;
CREATE POLICY "admin_all_disclosure"
  ON public.disclosures FOR ALL
  TO authenticated
  USING ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin')
  WITH CHECK ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');

-- Household members can insert disclosures
DROP POLICY IF EXISTS "household_insert_disclosure" ON public.disclosures;
CREATE POLICY "household_insert_disclosure"
  ON public.disclosures FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.household_memberships hm
      JOIN public.persons p ON hm.person_id = p.id
      WHERE hm.household_id = disclosures.household_id
        AND p.auth_user_id = auth.uid()
    )
  );

CREATE INDEX IF NOT EXISTS idx_disc_subject ON public.disclosures(subject_person_id);
CREATE INDEX IF NOT EXISTS idx_disc_household ON public.disclosures(household_id);
CREATE INDEX IF NOT EXISTS idx_disc_consent ON public.disclosures(consent_grant_id);
CREATE INDEX IF NOT EXISTS idx_disc_sent_at ON public.disclosures(sent_at);

-- ============================================================
-- document_references
-- ============================================================

CREATE TABLE IF NOT EXISTS public.document_references (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  person_id uuid NOT NULL REFERENCES public.persons(id) ON DELETE CASCADE,
  household_id uuid NOT NULL REFERENCES public.households(id) ON DELETE CASCADE,
  document_type text NOT NULL,
  existence_status text NOT NULL DEFAULT 'person_reports_available' CHECK (existence_status IN ('person_reports_available', 'person_reports_unavailable', 'confirmed_available', 'confirmed_unavailable', 'unknown')),
  holder text NOT NULL,
  needed_for text,
  last_confirmed_at timestamptz,
  notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.document_references ENABLE ROW LEVEL SECURITY;

-- Household members can read their own document references
DROP POLICY IF EXISTS "household_select_doc_ref" ON public.document_references;
CREATE POLICY "household_select_doc_ref"
  ON public.document_references FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.household_memberships hm
      JOIN public.persons p ON hm.person_id = p.id
      WHERE hm.household_id = document_references.household_id
        AND p.auth_user_id = auth.uid()
    )
  );

-- Navigators can read for assigned households
DROP POLICY IF EXISTS "navigator_select_doc_ref" ON public.document_references;
CREATE POLICY "navigator_select_doc_ref"
  ON public.document_references FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.navigator_assignments na
      WHERE na.household_id = document_references.household_id
        AND na.navigator_user_id = auth.uid()
        AND na.assignment_status = 'active'
    )
  );

-- Admins full access
DROP POLICY IF EXISTS "admin_all_doc_ref" ON public.document_references;
CREATE POLICY "admin_all_doc_ref"
  ON public.document_references FOR ALL
  TO authenticated
  USING ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin')
  WITH CHECK ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');

-- Household members can insert/update/delete
DROP POLICY IF EXISTS "household_insert_doc_ref" ON public.document_references;
CREATE POLICY "household_insert_doc_ref"
  ON public.document_references FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.household_memberships hm
      JOIN public.persons p ON hm.person_id = p.id
      WHERE hm.household_id = document_references.household_id
        AND p.auth_user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "household_update_doc_ref" ON public.document_references;
CREATE POLICY "household_update_doc_ref"
  ON public.document_references FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.household_memberships hm
      JOIN public.persons p ON hm.person_id = p.id
      WHERE hm.household_id = document_references.household_id
        AND p.auth_user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.household_memberships hm
      JOIN public.persons p ON hm.person_id = p.id
      WHERE hm.household_id = document_references.household_id
        AND p.auth_user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "household_delete_doc_ref" ON public.document_references;
CREATE POLICY "household_delete_doc_ref"
  ON public.document_references FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.household_memberships hm
      JOIN public.persons p ON hm.person_id = p.id
      WHERE hm.household_id = document_references.household_id
        AND p.auth_user_id = auth.uid()
    )
  );

CREATE INDEX IF NOT EXISTS idx_docref_person ON public.document_references(person_id);
CREATE INDEX IF NOT EXISTS idx_docref_household ON public.document_references(household_id);

-- ============================================================
-- escalations
-- ============================================================

CREATE TABLE IF NOT EXISTS public.escalations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  household_id uuid NOT NULL REFERENCES public.households(id) ON DELETE CASCADE,
  person_id uuid REFERENCES public.persons(id) ON DELETE SET NULL,
  trigger_type text NOT NULL CHECK (trigger_type IN ('authority_unresolved', 'youth_assent_review', 'legal_instrument_asserted', 'consent_ambiguity', 'sensitive_disclosure_question', 'professional_determination_needed')),
  affected_action text,
  destination text,
  status text NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'acknowledged', 'resolved', 'closed')),
  acknowledged_at timestamptz,
  expected_response text,
  fallback text,
  resolution text,
  created_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.escalations ENABLE ROW LEVEL SECURITY;

-- Household members can read their own escalations
DROP POLICY IF EXISTS "household_select_escalation" ON public.escalations;
CREATE POLICY "household_select_escalation"
  ON public.escalations FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.household_memberships hm
      JOIN public.persons p ON hm.person_id = p.id
      WHERE hm.household_id = escalations.household_id
        AND p.auth_user_id = auth.uid()
    )
  );

-- Navigators can read for assigned households
DROP POLICY IF EXISTS "navigator_select_escalation" ON public.escalations;
CREATE POLICY "navigator_select_escalation"
  ON public.escalations FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.navigator_assignments na
      WHERE na.household_id = escalations.household_id
        AND na.navigator_user_id = auth.uid()
        AND na.assignment_status = 'active'
    )
  );

-- Admins full access
DROP POLICY IF EXISTS "admin_all_escalation" ON public.escalations;
CREATE POLICY "admin_all_escalation"
  ON public.escalations FOR ALL
  TO authenticated
  USING ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin')
  WITH CHECK ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');

-- Household members can insert escalations
DROP POLICY IF EXISTS "household_insert_escalation" ON public.escalations;
CREATE POLICY "household_insert_escalation"
  ON public.escalations FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.household_memberships hm
      JOIN public.persons p ON hm.person_id = p.id
      WHERE hm.household_id = escalations.household_id
        AND p.auth_user_id = auth.uid()
    )
  );

-- Navigators can insert escalations for assigned households
DROP POLICY IF EXISTS "navigator_insert_escalation" ON public.escalations;
CREATE POLICY "navigator_insert_escalation"
  ON public.escalations FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.navigator_assignments na
      WHERE na.household_id = escalations.household_id
        AND na.navigator_user_id = auth.uid()
        AND na.assignment_status = 'active'
    )
  );

-- Navigators can update escalations for assigned households
DROP POLICY IF EXISTS "navigator_update_escalation" ON public.escalations;
CREATE POLICY "navigator_update_escalation"
  ON public.escalations FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.navigator_assignments na
      WHERE na.household_id = escalations.household_id
        AND na.navigator_user_id = auth.uid()
        AND na.assignment_status = 'active'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.navigator_assignments na
      WHERE na.household_id = escalations.household_id
        AND na.navigator_user_id = auth.uid()
        AND na.assignment_status = 'active'
    )
  );

CREATE INDEX IF NOT EXISTS idx_esc_household ON public.escalations(household_id);
CREATE INDEX IF NOT EXISTS idx_esc_status ON public.escalations(status);
CREATE INDEX IF NOT EXISTS idx_esc_trigger ON public.escalations(trigger_type);

-- ============================================================
-- incidents
-- ============================================================

CREATE TABLE IF NOT EXISTS public.incidents (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  household_id uuid NOT NULL REFERENCES public.households(id) ON DELETE CASCADE,
  person_id uuid REFERENCES public.persons(id) ON DELETE SET NULL,
  incident_type text NOT NULL CHECK (incident_type IN ('unauthorized_disclosure', 'incorrect_recipient', 'reliance_substitution', 'funding_misinformation', 'inappropriate_internal_access', 'other')),
  severity text NOT NULL DEFAULT 'moderate' CHECK (severity IN ('low', 'moderate', 'high', 'critical')),
  discovered_at timestamptz NOT NULL DEFAULT now(),
  information_involved text,
  financial_harm_possible boolean NOT NULL DEFAULT false,
  immediate_mitigation text,
  notification_status text,
  review_status text NOT NULL DEFAULT 'open' CHECK (review_status IN ('open', 'under_review', 'resolved', 'closed')),
  corrective_action text,
  resolution text,
  created_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.incidents ENABLE ROW LEVEL SECURITY;

-- Household members can read their own incidents
DROP POLICY IF EXISTS "household_select_incident" ON public.incidents;
CREATE POLICY "household_select_incident"
  ON public.incidents FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.household_memberships hm
      JOIN public.persons p ON hm.person_id = p.id
      WHERE hm.household_id = incidents.household_id
        AND p.auth_user_id = auth.uid()
    )
  );

-- Navigators can read for assigned households
DROP POLICY IF EXISTS "navigator_select_incident" ON public.incidents;
CREATE POLICY "navigator_select_incident"
  ON public.incidents FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.navigator_assignments na
      WHERE na.household_id = incidents.household_id
        AND na.navigator_user_id = auth.uid()
        AND na.assignment_status = 'active'
    )
  );

-- Admins full access
DROP POLICY IF EXISTS "admin_all_incident" ON public.incidents;
CREATE POLICY "admin_all_incident"
  ON public.incidents FOR ALL
  TO authenticated
  USING ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin')
  WITH CHECK ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');

-- Navigators can insert incidents for assigned households
DROP POLICY IF EXISTS "navigator_insert_incident" ON public.incidents;
CREATE POLICY "navigator_insert_incident"
  ON public.incidents FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.navigator_assignments na
      WHERE na.household_id = incidents.household_id
        AND na.navigator_user_id = auth.uid()
        AND na.assignment_status = 'active'
    )
  );

-- Navigators can update incidents for assigned households
DROP POLICY IF EXISTS "navigator_update_incident" ON public.incidents;
CREATE POLICY "navigator_update_incident"
  ON public.incidents FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.navigator_assignments na
      WHERE na.household_id = incidents.household_id
        AND na.navigator_user_id = auth.uid()
        AND na.assignment_status = 'active'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.navigator_assignments na
      WHERE na.household_id = incidents.household_id
        AND na.navigator_user_id = auth.uid()
        AND na.assignment_status = 'active'
    )
  );

CREATE INDEX IF NOT EXISTS idx_inc_household ON public.incidents(household_id);
CREATE INDEX IF NOT EXISTS idx_inc_type ON public.incidents(incident_type);
CREATE INDEX IF NOT EXISTS idx_inc_review ON public.incidents(review_status);

-- ============================================================
-- updated_at triggers for new tables
-- ============================================================

DROP TRIGGER IF EXISTS trg_navigator_assignments_updated ON public.navigator_assignments;
CREATE TRIGGER trg_navigator_assignments_updated
  BEFORE UPDATE ON public.navigator_assignments
  FOR EACH ROW EXECUTE FUNCTION public.update_timestamp();

DROP TRIGGER IF EXISTS trg_authority_to_act_updated ON public.authority_to_act;
CREATE TRIGGER trg_authority_to_act_updated
  BEFORE UPDATE ON public.authority_to_act
  FOR EACH ROW EXECUTE FUNCTION public.update_timestamp();

DROP TRIGGER IF EXISTS trg_youth_assents_updated ON public.youth_assents;
CREATE TRIGGER trg_youth_assents_updated
  BEFORE UPDATE ON public.youth_assents
  FOR EACH ROW EXECUTE FUNCTION public.update_timestamp();

DROP TRIGGER IF EXISTS trg_consent_grants_updated ON public.consent_grants;
CREATE TRIGGER trg_consent_grants_updated
  BEFORE UPDATE ON public.consent_grants
  FOR EACH ROW EXECUTE FUNCTION public.update_timestamp();

DROP TRIGGER IF EXISTS trg_document_references_updated ON public.document_references;
CREATE TRIGGER trg_document_references_updated
  BEFORE UPDATE ON public.document_references
  FOR EACH ROW EXECUTE FUNCTION public.update_timestamp();

DROP TRIGGER IF EXISTS trg_escalations_updated ON public.escalations;
CREATE TRIGGER trg_escalations_updated
  BEFORE UPDATE ON public.escalations
  FOR EACH ROW EXECUTE FUNCTION public.update_timestamp();

DROP TRIGGER IF EXISTS trg_incidents_updated ON public.incidents;
CREATE TRIGGER trg_incidents_updated
  BEFORE UPDATE ON public.incidents
  FOR EACH ROW EXECUTE FUNCTION public.update_timestamp();
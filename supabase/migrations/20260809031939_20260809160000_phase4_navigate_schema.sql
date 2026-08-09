/*
  # Phase 4 — Navigate Schema

  ## Summary
  Creates the navigation layer for NextUp Pilot 001. Eight new tables
  connect a confirmed Need to a possible sequence of service, provider,
  eligibility, funding, referral, and contact-attempt actions.

  Core chain: Need → Service → Provider → EligibilityPathway →
  FundingOption → FundingGate → Referral → ContactAttempt

  ## Design Principles
  - People narrate. NextUp translates. Authorities determine.
  - `completed` on a Pathway means the navigation workflow is complete,
    NOT that the person's need was resolved.
  - Referral `sent` means actually transmitted; `received` means receipt
    confirmed; `acknowledged` means recipient acknowledged it.
  - NextUp never infers authority_confirmed_eligible or
    authority_confirmed_ineligible without an authoritative source.
  - Unresolved blocking funding gates prevent presenting a funding path
    as confirmed applicable.
  - No percentage-complete or "almost approved" displays.
  - Stale provider/service data shows "Needs re-check".
  - "Closed loop" only when recipient can return meaningful status.

  ## New Tables (creation order respects FK dependencies)
  1. services — curated pathway components (no FK deps)
  2. providers — organizations (no FK deps)
  3. eligibility_pathways — external authority rules (no FK deps)
  4. pathways — connects Need to service/provider/eligibility (FK to households, persons, needs, services, providers, eligibility_pathways)
  5. funding_options — funding mechanism for a pathway (FK to pathways)
  6. funding_gates — independent requirements (FK to funding_options)
  7. referrals — actual connection to external provider (FK to pathways, services, providers, consent_grants, disclosures)
  8. contact_attempts — individual contact attempts (FK to referrals)

  Note: pathways.funding_option_id FK to funding_options is added after
  funding_options is created (circular dependency broken by deferring
  this one constraint).

  ## Security
  - RLS enabled on all 8 tables.
  - Household members access their own household-scoped records.
  - Navigators access only households with active navigator_assignments.
  - Admins have full access.
  - services/providers/eligibility_pathways catalog readable to all authenticated users.
  - Service/provider creation is admin-only.
  - Cross-household access is blocked.
  - No existing RLS policies weakened.

  ## Important Notes
  1. No Phase 5 tables created.
  2. No existing tables modified or dropped.
  3. Referral state transitions enforced via trigger.
  4. Disclosure-to-referral link: referral `sent` requires linked disclosure
     status='sent' (enforced by trigger).
*/

-- ============================================================
-- 1. services
-- ============================================================

CREATE TABLE IF NOT EXISTS public.services (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text,
  service_type text NOT NULL,
  modality text,
  geography text,
  access_channel text,
  source_authority text,
  source_checked_at timestamptz,
  status text NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'unknown')),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.services ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "authenticated_select_services" ON public.services;
CREATE POLICY "authenticated_select_services"
  ON public.services FOR SELECT
  TO authenticated
  USING (true);

DROP POLICY IF EXISTS "admin_insert_services" ON public.services;
CREATE POLICY "admin_insert_services"
  ON public.services FOR INSERT
  TO authenticated
  WITH CHECK ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');

DROP POLICY IF EXISTS "admin_update_services" ON public.services;
CREATE POLICY "admin_update_services"
  ON public.services FOR UPDATE
  TO authenticated
  USING ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin')
  WITH CHECK ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');

DROP POLICY IF EXISTS "admin_delete_services" ON public.services;
CREATE POLICY "admin_delete_services"
  ON public.services FOR DELETE
  TO authenticated
  USING ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');

CREATE INDEX IF NOT EXISTS idx_services_type ON public.services(service_type);
CREATE INDEX IF NOT EXISTS idx_services_status ON public.services(status);

-- ============================================================
-- 2. providers
-- ============================================================

CREATE TABLE IF NOT EXISTS public.providers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_name text NOT NULL,
  location text,
  contact_name text,
  contact_email text,
  contact_phone text,
  service_area text,
  source_authority text,
  source_checked_at timestamptz,
  verification_status text NOT NULL DEFAULT 'unverified' CHECK (verification_status IN ('unverified', 'source_confirmed', 'partner_confirmed', 'stale', 'unknown')),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.providers ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "authenticated_select_providers" ON public.providers;
CREATE POLICY "authenticated_select_providers"
  ON public.providers FOR SELECT
  TO authenticated
  USING (true);

DROP POLICY IF EXISTS "admin_insert_providers" ON public.providers;
CREATE POLICY "admin_insert_providers"
  ON public.providers FOR INSERT
  TO authenticated
  WITH CHECK ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');

DROP POLICY IF EXISTS "admin_update_providers" ON public.providers;
CREATE POLICY "admin_update_providers"
  ON public.providers FOR UPDATE
  TO authenticated
  USING ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin')
  WITH CHECK ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');

DROP POLICY IF EXISTS "admin_delete_providers" ON public.providers;
CREATE POLICY "admin_delete_providers"
  ON public.providers FOR DELETE
  TO authenticated
  USING ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');

CREATE INDEX IF NOT EXISTS idx_providers_verification ON public.providers(verification_status);

-- ============================================================
-- 3. eligibility_pathways
-- ============================================================

CREATE TABLE IF NOT EXISTS public.eligibility_pathways (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  program_name text NOT NULL,
  authority_name text NOT NULL,
  criteria_summary text,
  decision_owner text,
  authoritative_source text,
  source_checked_at timestamptz,
  effective_start timestamptz,
  effective_end timestamptz,
  status text NOT NULL DEFAULT 'possible' CHECK (status IN ('possible', 'verification_needed', 'application_initiated', 'under_review', 'authority_confirmed_eligible', 'authority_confirmed_ineligible', 'unknown')),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.eligibility_pathways ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "authenticated_select_eligibility" ON public.eligibility_pathways;
CREATE POLICY "authenticated_select_eligibility"
  ON public.eligibility_pathways FOR SELECT
  TO authenticated
  USING (true);

DROP POLICY IF EXISTS "admin_insert_eligibility" ON public.eligibility_pathways;
CREATE POLICY "admin_insert_eligibility"
  ON public.eligibility_pathways FOR INSERT
  TO authenticated
  WITH CHECK ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');

DROP POLICY IF EXISTS "admin_update_eligibility" ON public.eligibility_pathways;
CREATE POLICY "admin_update_eligibility"
  ON public.eligibility_pathways FOR UPDATE
  TO authenticated
  USING ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin')
  WITH CHECK ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');

CREATE INDEX IF NOT EXISTS idx_elig_status ON public.eligibility_pathways(status);

-- ============================================================
-- 4. pathways (funding_option_id FK added later)
-- ============================================================

CREATE TABLE IF NOT EXISTS public.pathways (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  household_id uuid NOT NULL REFERENCES public.households(id) ON DELETE CASCADE,
  person_id uuid NOT NULL REFERENCES public.persons(id) ON DELETE CASCADE,
  need_id uuid NOT NULL REFERENCES public.needs(id) ON DELETE CASCADE,
  service_id uuid REFERENCES public.services(id) ON DELETE SET NULL,
  provider_id uuid REFERENCES public.providers(id) ON DELETE SET NULL,
  eligibility_pathway_id uuid REFERENCES public.eligibility_pathways(id) ON DELETE SET NULL,
  funding_option_id uuid,
  status text NOT NULL DEFAULT 'possible' CHECK (status IN ('possible', 'active', 'waiting', 'blocked', 'completed', 'closed', 'unknown')),
  created_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.pathways ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "household_select_pathways" ON public.pathways;
CREATE POLICY "household_select_pathways"
  ON public.pathways FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.household_memberships hm
      JOIN public.persons p ON hm.person_id = p.id
      WHERE hm.household_id = pathways.household_id
        AND p.auth_user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "navigator_select_pathways" ON public.pathways;
CREATE POLICY "navigator_select_pathways"
  ON public.pathways FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.navigator_assignments na
      WHERE na.household_id = pathways.household_id
        AND na.navigator_user_id = auth.uid()
        AND na.assignment_status = 'active'
    )
  );

DROP POLICY IF EXISTS "admin_all_pathways" ON public.pathways;
CREATE POLICY "admin_all_pathways"
  ON public.pathways FOR ALL
  TO authenticated
  USING ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin')
  WITH CHECK ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');

DROP POLICY IF EXISTS "household_insert_pathways" ON public.pathways;
CREATE POLICY "household_insert_pathways"
  ON public.pathways FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.household_memberships hm
      JOIN public.persons p ON hm.person_id = p.id
      WHERE hm.household_id = pathways.household_id
        AND p.auth_user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "navigator_insert_pathways" ON public.pathways;
CREATE POLICY "navigator_insert_pathways"
  ON public.pathways FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.navigator_assignments na
      WHERE na.household_id = pathways.household_id
        AND na.navigator_user_id = auth.uid()
        AND na.assignment_status = 'active'
    )
  );

DROP POLICY IF EXISTS "household_update_pathways" ON public.pathways;
CREATE POLICY "household_update_pathways"
  ON public.pathways FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.household_memberships hm
      JOIN public.persons p ON hm.person_id = p.id
      WHERE hm.household_id = pathways.household_id
        AND p.auth_user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.household_memberships hm
      JOIN public.persons p ON hm.person_id = p.id
      WHERE hm.household_id = pathways.household_id
        AND p.auth_user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "navigator_update_pathways" ON public.pathways;
CREATE POLICY "navigator_update_pathways"
  ON public.pathways FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.navigator_assignments na
      WHERE na.household_id = pathways.household_id
        AND na.navigator_user_id = auth.uid()
        AND na.assignment_status = 'active'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.navigator_assignments na
      WHERE na.household_id = pathways.household_id
        AND na.navigator_user_id = auth.uid()
        AND na.assignment_status = 'active'
    )
  );

CREATE INDEX IF NOT EXISTS idx_pathways_household ON public.pathways(household_id);
CREATE INDEX IF NOT EXISTS idx_pathways_person ON public.pathways(person_id);
CREATE INDEX IF NOT EXISTS idx_pathways_need ON public.pathways(need_id);
CREATE INDEX IF NOT EXISTS idx_pathways_status ON public.pathways(status);

-- ============================================================
-- 5. funding_options
-- ============================================================

CREATE TABLE IF NOT EXISTS public.funding_options (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  pathway_id uuid REFERENCES public.pathways(id) ON DELETE SET NULL,
  mechanism_type text NOT NULL CHECK (mechanism_type IN ('insurance_benefit', 'medicaid_managed_care', 'school_funded', 'government_benefit', 'grant_funded', 'philanthropic_assistance', 'scholarship', 'fee_waiver', 'employer_benefit', 'fiscal_sponsor_fund', 'provider_charity', 'member_reimbursement', 'direct_provider_payment', 'self_pay', 'other')),
  payer_or_funder_name text,
  source_authority text,
  source_checked_at timestamptz,
  assertion_type text NOT NULL DEFAULT 'possible' CHECK (assertion_type IN ('possible', 'verified', 'approved', 'denied', 'paid', 'exhausted', 'unknown')),
  applicability_status text NOT NULL DEFAULT 'unknown' CHECK (applicability_status IN ('unknown', 'may_apply', 'needs_verification', 'confirmed_applicable', 'not_applicable')),
  payment_status text NOT NULL DEFAULT 'not_started' CHECK (payment_status IN ('not_started', 'pending', 'approved', 'denied', 'paid', 'reimbursed', 'partially_paid', 'unknown')),
  payment_recipient text,
  coverage_limit text,
  required_authorization text,
  network_requirement text,
  effective_start timestamptz,
  effective_end timestamptz,
  notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.funding_options ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "household_select_funding" ON public.funding_options;
CREATE POLICY "household_select_funding"
  ON public.funding_options FOR SELECT
  TO authenticated
  USING (
    pathway_id IS NOT NULL AND EXISTS (
      SELECT 1 FROM public.pathways pw
      WHERE pw.id = funding_options.pathway_id
        AND EXISTS (
          SELECT 1 FROM public.household_memberships hm
          JOIN public.persons p ON hm.person_id = p.id
          WHERE hm.household_id = pw.household_id
            AND p.auth_user_id = auth.uid()
        )
    )
  );

DROP POLICY IF EXISTS "navigator_select_funding" ON public.funding_options;
CREATE POLICY "navigator_select_funding"
  ON public.funding_options FOR SELECT
  TO authenticated
  USING (
    pathway_id IS NOT NULL AND EXISTS (
      SELECT 1 FROM public.pathways pw
      WHERE pw.id = funding_options.pathway_id
        AND EXISTS (
          SELECT 1 FROM public.navigator_assignments na
          WHERE na.household_id = pw.household_id
            AND na.navigator_user_id = auth.uid()
            AND na.assignment_status = 'active'
        )
    )
  );

DROP POLICY IF EXISTS "admin_all_funding" ON public.funding_options;
CREATE POLICY "admin_all_funding"
  ON public.funding_options FOR ALL
  TO authenticated
  USING ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin')
  WITH CHECK ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');

DROP POLICY IF EXISTS "navigator_insert_funding" ON public.funding_options;
CREATE POLICY "navigator_insert_funding"
  ON public.funding_options FOR INSERT
  TO authenticated
  WITH CHECK (
    pathway_id IS NOT NULL AND EXISTS (
      SELECT 1 FROM public.pathways pw
      WHERE pw.id = funding_options.pathway_id
        AND EXISTS (
          SELECT 1 FROM public.navigator_assignments na
          WHERE na.household_id = pw.household_id
            AND na.navigator_user_id = auth.uid()
            AND na.assignment_status = 'active'
        )
    )
  );

DROP POLICY IF EXISTS "navigator_update_funding" ON public.funding_options;
CREATE POLICY "navigator_update_funding"
  ON public.funding_options FOR UPDATE
  TO authenticated
  USING (
    pathway_id IS NOT NULL AND EXISTS (
      SELECT 1 FROM public.pathways pw
      WHERE pw.id = funding_options.pathway_id
        AND EXISTS (
          SELECT 1 FROM public.navigator_assignments na
          WHERE na.household_id = pw.household_id
            AND na.navigator_user_id = auth.uid()
            AND na.assignment_status = 'active'
        )
    )
  )
  WITH CHECK (
    pathway_id IS NOT NULL AND EXISTS (
      SELECT 1 FROM public.pathways pw
      WHERE pw.id = funding_options.pathway_id
        AND EXISTS (
          SELECT 1 FROM public.navigator_assignments na
          WHERE na.household_id = pw.household_id
            AND na.navigator_user_id = auth.uid()
            AND na.assignment_status = 'active'
        )
    )
  );

CREATE INDEX IF NOT EXISTS idx_funding_pathway ON public.funding_options(pathway_id);
CREATE INDEX IF NOT EXISTS idx_funding_applicability ON public.funding_options(applicability_status);

-- Now add the FK from pathways.funding_option_id to funding_options
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE constraint_name = 'pathways_funding_option_id_fkey'
      AND table_name = 'pathways'
  ) THEN
    ALTER TABLE public.pathways
      ADD CONSTRAINT pathways_funding_option_id_fkey
      FOREIGN KEY (funding_option_id) REFERENCES public.funding_options(id) ON DELETE SET NULL;
  END IF;
END $$;

-- ============================================================
-- 6. funding_gates
-- ============================================================

CREATE TABLE IF NOT EXISTS public.funding_gates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  funding_option_id uuid NOT NULL REFERENCES public.funding_options(id) ON DELETE CASCADE,
  gate_type text NOT NULL,
  sequence integer NOT NULL DEFAULT 0,
  blocking boolean NOT NULL DEFAULT true,
  decision_owner text,
  status text NOT NULL DEFAULT 'unknown' CHECK (status IN ('unknown', 'needs_verification', 'met', 'not_met', 'not_applicable')),
  source_authority text,
  checked_at timestamptz,
  notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.funding_gates ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "household_select_funding_gates" ON public.funding_gates;
CREATE POLICY "household_select_funding_gates"
  ON public.funding_gates FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.funding_options fo
      JOIN public.pathways pw ON fo.pathway_id = pw.id
      WHERE fo.id = funding_gates.funding_option_id
        AND EXISTS (
          SELECT 1 FROM public.household_memberships hm
          JOIN public.persons p ON hm.person_id = p.id
          WHERE hm.household_id = pw.household_id
            AND p.auth_user_id = auth.uid()
        )
    )
  );

DROP POLICY IF EXISTS "navigator_select_funding_gates" ON public.funding_gates;
CREATE POLICY "navigator_select_funding_gates"
  ON public.funding_gates FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.funding_options fo
      JOIN public.pathways pw ON fo.pathway_id = pw.id
      WHERE fo.id = funding_gates.funding_option_id
        AND EXISTS (
          SELECT 1 FROM public.navigator_assignments na
          WHERE na.household_id = pw.household_id
            AND na.navigator_user_id = auth.uid()
            AND na.assignment_status = 'active'
        )
    )
  );

DROP POLICY IF EXISTS "admin_all_funding_gates" ON public.funding_gates;
CREATE POLICY "admin_all_funding_gates"
  ON public.funding_gates FOR ALL
  TO authenticated
  USING ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin')
  WITH CHECK ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');

DROP POLICY IF EXISTS "navigator_insert_funding_gates" ON public.funding_gates;
CREATE POLICY "navigator_insert_funding_gates"
  ON public.funding_gates FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.funding_options fo
      JOIN public.pathways pw ON fo.pathway_id = pw.id
      WHERE fo.id = funding_gates.funding_option_id
        AND EXISTS (
          SELECT 1 FROM public.navigator_assignments na
          WHERE na.household_id = pw.household_id
            AND na.navigator_user_id = auth.uid()
            AND na.assignment_status = 'active'
        )
    )
  );

DROP POLICY IF EXISTS "navigator_update_funding_gates" ON public.funding_gates;
CREATE POLICY "navigator_update_funding_gates"
  ON public.funding_gates FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.funding_options fo
      JOIN public.pathways pw ON fo.pathway_id = pw.id
      WHERE fo.id = funding_gates.funding_option_id
        AND EXISTS (
          SELECT 1 FROM public.navigator_assignments na
          WHERE na.household_id = pw.household_id
            AND na.navigator_user_id = auth.uid()
            AND na.assignment_status = 'active'
        )
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.funding_options fo
      JOIN public.pathways pw ON fo.pathway_id = pw.id
      WHERE fo.id = funding_gates.funding_option_id
        AND EXISTS (
          SELECT 1 FROM public.navigator_assignments na
          WHERE na.household_id = pw.household_id
            AND na.navigator_user_id = auth.uid()
            AND na.assignment_status = 'active'
        )
    )
  );

CREATE INDEX IF NOT EXISTS idx_funding_gates_option ON public.funding_gates(funding_option_id);
CREATE INDEX IF NOT EXISTS idx_funding_gates_status ON public.funding_gates(status);

-- ============================================================
-- 7. referrals
-- ============================================================

CREATE TABLE IF NOT EXISTS public.referrals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  household_id uuid NOT NULL REFERENCES public.households(id) ON DELETE CASCADE,
  person_id uuid NOT NULL REFERENCES public.persons(id) ON DELETE CASCADE,
  pathway_id uuid NOT NULL REFERENCES public.pathways(id) ON DELETE CASCADE,
  service_id uuid REFERENCES public.services(id) ON DELETE SET NULL,
  provider_id uuid REFERENCES public.providers(id) ON DELETE SET NULL,
  consent_grant_id uuid REFERENCES public.consent_grants(id) ON DELETE SET NULL,
  disclosure_id uuid REFERENCES public.disclosures(id) ON DELETE SET NULL,
  sender_user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  recipient_name text NOT NULL,
  recipient_type text,
  status text NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'ready', 'sent', 'received', 'acknowledged', 'screening', 'accepted', 'declined', 'intake_scheduled', 'service_initiated', 'completed', 'unable_to_contact', 'person_declined', 'cancelled', 'expired', 'unknown')),
  status_reason text,
  status_source text NOT NULL DEFAULT 'unknown' CHECK (status_source IN ('person_reported', 'navigator_reported', 'provider_confirmed', 'system_observed', 'unknown')),
  sent_at timestamptz,
  received_at timestamptz,
  acknowledged_at timestamptz,
  closed_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.referrals ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "household_select_referrals" ON public.referrals;
CREATE POLICY "household_select_referrals"
  ON public.referrals FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.household_memberships hm
      JOIN public.persons p ON hm.person_id = p.id
      WHERE hm.household_id = referrals.household_id
        AND p.auth_user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "navigator_select_referrals" ON public.referrals;
CREATE POLICY "navigator_select_referrals"
  ON public.referrals FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.navigator_assignments na
      WHERE na.household_id = referrals.household_id
        AND na.navigator_user_id = auth.uid()
        AND na.assignment_status = 'active'
    )
  );

DROP POLICY IF EXISTS "admin_all_referrals" ON public.referrals;
CREATE POLICY "admin_all_referrals"
  ON public.referrals FOR ALL
  TO authenticated
  USING ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin')
  WITH CHECK ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');

DROP POLICY IF EXISTS "navigator_insert_referrals" ON public.referrals;
CREATE POLICY "navigator_insert_referrals"
  ON public.referrals FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.navigator_assignments na
      WHERE na.household_id = referrals.household_id
        AND na.navigator_user_id = auth.uid()
        AND na.assignment_status = 'active'
    )
  );

DROP POLICY IF EXISTS "navigator_update_referrals" ON public.referrals;
CREATE POLICY "navigator_update_referrals"
  ON public.referrals FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.navigator_assignments na
      WHERE na.household_id = referrals.household_id
        AND na.navigator_user_id = auth.uid()
        AND na.assignment_status = 'active'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.navigator_assignments na
      WHERE na.household_id = referrals.household_id
        AND na.navigator_user_id = auth.uid()
        AND na.assignment_status = 'active'
    )
  );

DROP POLICY IF EXISTS "household_update_referrals" ON public.referrals;
CREATE POLICY "household_update_referrals"
  ON public.referrals FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.household_memberships hm
      JOIN public.persons p ON hm.person_id = p.id
      WHERE hm.household_id = referrals.household_id
        AND p.auth_user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.household_memberships hm
      JOIN public.persons p ON hm.person_id = p.id
      WHERE hm.household_id = referrals.household_id
        AND p.auth_user_id = auth.uid()
    )
  );

CREATE INDEX IF NOT EXISTS idx_referrals_household ON public.referrals(household_id);
CREATE INDEX IF NOT EXISTS idx_referrals_person ON public.referrals(person_id);
CREATE INDEX IF NOT EXISTS idx_referrals_pathway ON public.referrals(pathway_id);
CREATE INDEX IF NOT EXISTS idx_referrals_status ON public.referrals(status);
CREATE INDEX IF NOT EXISTS idx_referrals_disclosure ON public.referrals(disclosure_id);

-- ============================================================
-- 8. contact_attempts
-- ============================================================

CREATE TABLE IF NOT EXISTS public.contact_attempts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  referral_id uuid NOT NULL REFERENCES public.referrals(id) ON DELETE CASCADE,
  initiator text NOT NULL,
  intended_recipient text NOT NULL,
  method text NOT NULL CHECK (method IN ('email', 'phone', 'secure_portal', 'in_person', 'text', 'other')),
  attempted_at timestamptz NOT NULL DEFAULT now(),
  result text NOT NULL CHECK (result IN ('no_response', 'message_left', 'reached', 'scheduled_follow_up', 'wrong_contact', 'contact_information_invalid', 'other')),
  follow_up_at timestamptz,
  notes text,
  created_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.contact_attempts ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "household_select_contact_attempts" ON public.contact_attempts;
CREATE POLICY "household_select_contact_attempts"
  ON public.contact_attempts FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.referrals r
      WHERE r.id = contact_attempts.referral_id
        AND EXISTS (
          SELECT 1 FROM public.household_memberships hm
          JOIN public.persons p ON hm.person_id = p.id
          WHERE hm.household_id = r.household_id
            AND p.auth_user_id = auth.uid()
        )
    )
  );

DROP POLICY IF EXISTS "navigator_select_contact_attempts" ON public.contact_attempts;
CREATE POLICY "navigator_select_contact_attempts"
  ON public.contact_attempts FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.referrals r
      WHERE r.id = contact_attempts.referral_id
        AND EXISTS (
          SELECT 1 FROM public.navigator_assignments na
          WHERE na.household_id = r.household_id
            AND na.navigator_user_id = auth.uid()
            AND na.assignment_status = 'active'
        )
    )
  );

DROP POLICY IF EXISTS "admin_all_contact_attempts" ON public.contact_attempts;
CREATE POLICY "admin_all_contact_attempts"
  ON public.contact_attempts FOR ALL
  TO authenticated
  USING ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin')
  WITH CHECK ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');

DROP POLICY IF EXISTS "navigator_insert_contact_attempts" ON public.contact_attempts;
CREATE POLICY "navigator_insert_contact_attempts"
  ON public.contact_attempts FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.referrals r
      WHERE r.id = contact_attempts.referral_id
        AND EXISTS (
          SELECT 1 FROM public.navigator_assignments na
          WHERE na.household_id = r.household_id
            AND na.navigator_user_id = auth.uid()
            AND na.assignment_status = 'active'
        )
    )
  );

CREATE INDEX IF NOT EXISTS idx_contact_attempts_referral ON public.contact_attempts(referral_id);
CREATE INDEX IF NOT EXISTS idx_contact_attempts_result ON public.contact_attempts(result);

-- ============================================================
-- Referral state transition guard (trigger)
-- ============================================================

CREATE OR REPLACE FUNCTION public.guard_referral_transition()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  allowed boolean := false;
  disclosure_status text;
BEGIN
  IF NEW.status = OLD.status THEN
    RETURN NEW;
  END IF;

  allowed := CASE
    WHEN OLD.status = 'draft' AND NEW.status IN ('ready', 'cancelled', 'unknown') THEN true
    WHEN OLD.status = 'ready' AND NEW.status IN ('sent', 'cancelled', 'unknown') THEN true
    WHEN OLD.status = 'sent' AND NEW.status IN ('received', 'unable_to_contact', 'unknown', 'cancelled', 'expired') THEN true
    WHEN OLD.status = 'received' AND NEW.status IN ('acknowledged', 'screening', 'unknown', 'cancelled') THEN true
    WHEN OLD.status = 'acknowledged' AND NEW.status IN ('screening', 'unknown', 'cancelled') THEN true
    WHEN OLD.status = 'screening' AND NEW.status IN ('accepted', 'declined', 'unknown', 'cancelled') THEN true
    WHEN OLD.status = 'accepted' AND NEW.status IN ('intake_scheduled', 'service_initiated', 'unknown', 'cancelled') THEN true
    WHEN OLD.status = 'intake_scheduled' AND NEW.status IN ('service_initiated', 'cancelled', 'unknown') THEN true
    WHEN OLD.status = 'service_initiated' AND NEW.status IN ('completed', 'unknown', 'cancelled') THEN true
    WHEN OLD.status = 'unable_to_contact' AND NEW.status IN ('sent', 'cancelled', 'unknown') THEN true
    WHEN OLD.status = 'person_declined' AND NEW.status IN ('closed', 'unknown') THEN true
    WHEN OLD.status = 'declined' AND NEW.status IN ('closed', 'unknown') THEN true
    WHEN OLD.status = 'completed' AND NEW.status IN ('closed', 'unknown') THEN true
    WHEN OLD.status = 'expired' AND NEW.status IN ('unknown') THEN true
    WHEN OLD.status = 'cancelled' AND NEW.status IN ('unknown') THEN true
    WHEN OLD.status = 'unknown' AND NEW.status IN ('draft', 'ready', 'sent', 'cancelled') THEN true
    ELSE false
  END;

  IF NOT allowed THEN
    RAISE EXCEPTION 'Invalid referral transition: % -> %', OLD.status, NEW.status
      USING ERRCODE = 'check_violation';
  END IF;

  IF NEW.status = 'sent' THEN
    IF NEW.disclosure_id IS NULL THEN
      RAISE EXCEPTION 'Referral cannot be sent without a linked disclosure'
        USING ERRCODE = 'check_violation';
    END IF;
    SELECT status INTO disclosure_status
      FROM public.disclosures
      WHERE id = NEW.disclosure_id;
    IF disclosure_status IS NULL OR disclosure_status <> 'sent' THEN
      RAISE EXCEPTION 'Referral cannot be sent until linked disclosure has been delivered (disclosure status must be ''sent'')'
        USING ERRCODE = 'check_violation';
    END IF;
    NEW.sent_at := now();
  END IF;

  IF NEW.status = 'received' AND NEW.received_at IS NULL THEN
    NEW.received_at := now();
  END IF;

  IF NEW.status = 'acknowledged' AND NEW.acknowledged_at IS NULL THEN
    NEW.acknowledged_at := now();
  END IF;

  IF NEW.status IN ('completed', 'cancelled', 'expired', 'person_declined', 'declined') AND NEW.closed_at IS NULL THEN
    NEW.closed_at := now();
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_referral_transition_guard ON public.referrals;
CREATE TRIGGER trg_referral_transition_guard
  BEFORE UPDATE ON public.referrals
  FOR EACH ROW EXECUTE FUNCTION public.guard_referral_transition();

-- ============================================================
-- CHECK constraints for referral timestamps
-- ============================================================

ALTER TABLE public.referrals
  DROP CONSTRAINT IF EXISTS referrals_sent_at_check;
ALTER TABLE public.referrals
  ADD CONSTRAINT referrals_sent_at_check
  CHECK (
    sent_at IS NULL OR status IN ('sent', 'received', 'acknowledged', 'screening', 'accepted', 'declined', 'intake_scheduled', 'service_initiated', 'completed', 'unable_to_contact', 'unknown')
  );

ALTER TABLE public.referrals
  DROP CONSTRAINT IF EXISTS referrals_received_at_check;
ALTER TABLE public.referrals
  ADD CONSTRAINT referrals_received_at_check
  CHECK (
    received_at IS NULL OR status IN ('received', 'acknowledged', 'screening', 'accepted', 'declined', 'intake_scheduled', 'service_initiated', 'completed')
  );

ALTER TABLE public.referrals
  DROP CONSTRAINT IF EXISTS referrals_acknowledged_at_check;
ALTER TABLE public.referrals
  ADD CONSTRAINT referrals_acknowledged_at_check
  CHECK (
    acknowledged_at IS NULL OR status IN ('acknowledged', 'screening', 'accepted', 'declined', 'intake_scheduled', 'service_initiated', 'completed')
  );

-- ============================================================
-- updated_at triggers for new tables
-- ============================================================

DROP TRIGGER IF EXISTS trg_services_updated ON public.services;
CREATE TRIGGER trg_services_updated
  BEFORE UPDATE ON public.services
  FOR EACH ROW EXECUTE FUNCTION public.update_timestamp();

DROP TRIGGER IF EXISTS trg_providers_updated ON public.providers;
CREATE TRIGGER trg_providers_updated
  BEFORE UPDATE ON public.providers
  FOR EACH ROW EXECUTE FUNCTION public.update_timestamp();

DROP TRIGGER IF EXISTS trg_eligibility_pathways_updated ON public.eligibility_pathways;
CREATE TRIGGER trg_eligibility_pathways_updated
  BEFORE UPDATE ON public.eligibility_pathways
  FOR EACH ROW EXECUTE FUNCTION public.update_timestamp();

DROP TRIGGER IF EXISTS trg_funding_options_updated ON public.funding_options;
CREATE TRIGGER trg_funding_options_updated
  BEFORE UPDATE ON public.funding_options
  FOR EACH ROW EXECUTE FUNCTION public.update_timestamp();

DROP TRIGGER IF EXISTS trg_funding_gates_updated ON public.funding_gates;
CREATE TRIGGER trg_funding_gates_updated
  BEFORE UPDATE ON public.funding_gates
  FOR EACH ROW EXECUTE FUNCTION public.update_timestamp();

DROP TRIGGER IF EXISTS trg_pathways_updated ON public.pathways;
CREATE TRIGGER trg_pathways_updated
  BEFORE UPDATE ON public.pathways
  FOR EACH ROW EXECUTE FUNCTION public.update_timestamp();

DROP TRIGGER IF EXISTS trg_referrals_updated ON public.referrals;
CREATE TRIGGER trg_referrals_updated
  BEFORE UPDATE ON public.referrals
  FOR EACH ROW EXECUTE FUNCTION public.update_timestamp();

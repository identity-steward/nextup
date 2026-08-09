/*
  # Phase 5 — Learn Schema

  ## Summary
  Creates the learning layer for NextUp Pilot 001. Two new tables
  capture what actually happened for the person after a referral or
  connection attempt.

  Core chain: Referral → Outcome → BarrierEvent (when relevant) →
  Next Action → Updated My NextUp

  ## Critical Rule
  Referral status is NOT the same as person outcome.
  A referral may be 'completed' while the person reports
  'service not received' or 'service received but not helpful'.
  A referral may remain open while the person chooses another option.
  These states are never collapsed.

  ## New Tables

  ### outcomes
  Records what happened for the person after a referral or connection.
  Linked to a Referral (no free-floating outcomes).
  Tracks connected_status, service_received_status, helpfulness_status,
  next_action, reported_by, provenance.
  Person report is never silently converted to provider-confirmed fact.

  ### barrier_events
  Captures what prevented or complicated access without assigning blame.
  Tracks access_stage, barrier_type, locus, verification_status,
  remediability, next_action.
  Locus defaults to 'undetermined' — never automatically assigned
  based on barrier type alone.
  Person-facing UI asks "What got in the way?" — never "Whose fault?"

  ## Security
  - RLS enabled on both tables.
  - Household members: own records only (via household_memberships).
  - Navigators: assigned households only (via navigator_assignments).
  - Admins: full access.
  - Cross-household access blocked.
  - No existing RLS policies weakened.

  ## Important Notes
  1. No community analytics, provider scoring, or aggregate dashboards.
  2. No automated Need status changes from referral completion alone.
  3. Person report and provider report can coexist without overwriting.
  4. 'chose_differently' is never treated as failure.
  5. No blame language in barrier types.
  6. Locus is internal classification — never shown to the person.
  7. NextUp can be recorded as the locus of a barrier (locus = 'nextup').
  8. No automatic Incident creation — navigator/admin decides.
*/

-- ============================================================
-- outcomes
-- ============================================================

CREATE TABLE IF NOT EXISTS public.outcomes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  household_id uuid NOT NULL REFERENCES public.households(id) ON DELETE CASCADE,
  person_id uuid NOT NULL REFERENCES public.persons(id) ON DELETE CASCADE,
  referral_id uuid NOT NULL REFERENCES public.referrals(id) ON DELETE CASCADE,
  pathway_id uuid REFERENCES public.pathways(id) ON DELETE SET NULL,
  connected_status text NOT NULL DEFAULT 'unknown' CHECK (connected_status IN ('yes', 'no', 'not_yet', 'chose_differently', 'unknown')),
  service_received_status text NOT NULL DEFAULT 'unknown' CHECK (service_received_status IN ('yes', 'no', 'partially', 'still_waiting', 'not_applicable', 'unknown')),
  helpfulness_status text NOT NULL DEFAULT 'unknown' CHECK (helpfulness_status IN ('yes', 'no', 'too_early_to_tell', 'not_yet', 'not_applicable', 'unknown')),
  next_action text,
  reported_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  provenance text NOT NULL DEFAULT 'unknown' CHECK (provenance IN ('person_reported', 'parent_reported', 'youth_reported', 'navigator_reported', 'provider_reported', 'system_observed', 'unknown')),
  notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.outcomes ENABLE ROW LEVEL SECURITY;

-- Household members can read their own outcomes
DROP POLICY IF EXISTS "household_select_outcomes" ON public.outcomes;
CREATE POLICY "household_select_outcomes"
  ON public.outcomes FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.household_memberships hm
      JOIN public.persons p ON hm.person_id = p.id
      WHERE hm.household_id = outcomes.household_id
        AND p.auth_user_id = auth.uid()
    )
  );

-- Navigators can read for assigned households
DROP POLICY IF EXISTS "navigator_select_outcomes" ON public.outcomes;
CREATE POLICY "navigator_select_outcomes"
  ON public.outcomes FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.navigator_assignments na
      WHERE na.household_id = outcomes.household_id
        AND na.navigator_user_id = auth.uid()
        AND na.assignment_status = 'active'
    )
  );

-- Admins full access
DROP POLICY IF EXISTS "admin_all_outcomes" ON public.outcomes;
CREATE POLICY "admin_all_outcomes"
  ON public.outcomes FOR ALL
  TO authenticated
  USING ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin')
  WITH CHECK ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');

-- Household members can insert outcomes for their own household
DROP POLICY IF EXISTS "household_insert_outcomes" ON public.outcomes;
CREATE POLICY "household_insert_outcomes"
  ON public.outcomes FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.household_memberships hm
      JOIN public.persons p ON hm.person_id = p.id
      WHERE hm.household_id = outcomes.household_id
        AND p.auth_user_id = auth.uid()
    )
  );

-- Navigators can insert outcomes for assigned households
DROP POLICY IF EXISTS "navigator_insert_outcomes" ON public.outcomes;
CREATE POLICY "navigator_insert_outcomes"
  ON public.outcomes FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.navigator_assignments na
      WHERE na.household_id = outcomes.household_id
        AND na.navigator_user_id = auth.uid()
        AND na.assignment_status = 'active'
    )
  );

-- Household members can update their own outcomes
DROP POLICY IF EXISTS "household_update_outcomes" ON public.outcomes;
CREATE POLICY "household_update_outcomes"
  ON public.outcomes FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.household_memberships hm
      JOIN public.persons p ON hm.person_id = p.id
      WHERE hm.household_id = outcomes.household_id
        AND p.auth_user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.household_memberships hm
      JOIN public.persons p ON hm.person_id = p.id
      WHERE hm.household_id = outcomes.household_id
        AND p.auth_user_id = auth.uid()
    )
  );

-- Navigators can update outcomes for assigned households
DROP POLICY IF EXISTS "navigator_update_outcomes" ON public.outcomes;
CREATE POLICY "navigator_update_outcomes"
  ON public.outcomes FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.navigator_assignments na
      WHERE na.household_id = outcomes.household_id
        AND na.navigator_user_id = auth.uid()
        AND na.assignment_status = 'active'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.navigator_assignments na
      WHERE na.household_id = outcomes.household_id
        AND na.navigator_user_id = auth.uid()
        AND na.assignment_status = 'active'
    )
  );

CREATE INDEX IF NOT EXISTS idx_outcomes_household ON public.outcomes(household_id);
CREATE INDEX IF NOT EXISTS idx_outcomes_person ON public.outcomes(person_id);
CREATE INDEX IF NOT EXISTS idx_outcomes_referral ON public.outcomes(referral_id);
CREATE INDEX IF NOT EXISTS idx_outcomes_pathway ON public.outcomes(pathway_id);
CREATE INDEX IF NOT EXISTS idx_outcomes_connected ON public.outcomes(connected_status);

-- ============================================================
-- barrier_events
-- ============================================================

CREATE TABLE IF NOT EXISTS public.barrier_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  household_id uuid NOT NULL REFERENCES public.households(id) ON DELETE CASCADE,
  person_id uuid NOT NULL REFERENCES public.persons(id) ON DELETE CASCADE,
  referral_id uuid NOT NULL REFERENCES public.referrals(id) ON DELETE CASCADE,
  outcome_id uuid REFERENCES public.outcomes(id) ON DELETE SET NULL,
  pathway_id uuid REFERENCES public.pathways(id) ON DELETE SET NULL,
  access_stage text NOT NULL DEFAULT 'unknown' CHECK (access_stage IN (
    'discovery', 'contact_attempted', 'intake', 'application',
    'eligibility_review', 'enrollment', 'authorization', 'scheduling',
    'attendance', 'service_initiation', 'service_continuation',
    'payment', 'reimbursement', 'follow_up', 'unknown'
  )),
  barrier_type text NOT NULL DEFAULT 'unknown' CHECK (barrier_type IN (
    'eligibility_criteria_not_met', 'eligibility_unverified',
    'capacity_unavailable', 'waitlist', 'program_paused',
    'funding_exhausted', 'geographic_mismatch', 'transportation',
    'cost', 'copay', 'deposit', 'debt', 'insurance_network',
    'authorization_denied', 'required_documentation_unavailable',
    'identity_residency_address', 'digital_access', 'technology',
    'language_interpretation', 'communication_failure', 'hours_conflict',
    'caregiving_conflict', 'work_conflict', 'accessibility_accommodation',
    'safety_concern', 'legal_concern', 'trust_concern', 'no_service_match',
    'person_chose_alternative', 'referral_error', 'stale_directory_information',
    'unknown', 'other'
  )),
  locus text NOT NULL DEFAULT 'undetermined' CHECK (locus IN (
    'undetermined', 'person_context', 'provider', 'program', 'payer',
    'school', 'government', 'nextup', 'technology',
    'transportation_system', 'multi_party', 'unknown'
  )),
  reported_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  provenance text NOT NULL DEFAULT 'unknown' CHECK (provenance IN (
    'person_reported', 'parent_reported', 'youth_reported',
    'navigator_reported', 'provider_reported', 'system_observed', 'unknown'
  )),
  verification_status text NOT NULL DEFAULT 'unverified' CHECK (verification_status IN (
    'self_reported', 'partner_reported', 'navigator_observed',
    'documented', 'confirmed_by_authority', 'unverified', 'unknown'
  )),
  remediability text NOT NULL DEFAULT 'unknown' CHECK (remediability IN (
    'actionable_now', 'requires_follow_up', 'requires_external_decision',
    'not_currently_actionable', 'resolved', 'unknown'
  )),
  free_text text,
  next_action text,
  incident_id uuid REFERENCES public.incidents(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.barrier_events ENABLE ROW LEVEL SECURITY;

-- Household members can read their own barrier events
DROP POLICY IF EXISTS "household_select_barriers" ON public.barrier_events;
CREATE POLICY "household_select_barriers"
  ON public.barrier_events FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.household_memberships hm
      JOIN public.persons p ON hm.person_id = p.id
      WHERE hm.household_id = barrier_events.household_id
        AND p.auth_user_id = auth.uid()
    )
  );

-- Navigators can read for assigned households
DROP POLICY IF EXISTS "navigator_select_barriers" ON public.barrier_events;
CREATE POLICY "navigator_select_barriers"
  ON public.barrier_events FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.navigator_assignments na
      WHERE na.household_id = barrier_events.household_id
        AND na.navigator_user_id = auth.uid()
        AND na.assignment_status = 'active'
    )
  );

-- Admins full access
DROP POLICY IF EXISTS "admin_all_barriers" ON public.barrier_events;
CREATE POLICY "admin_all_barriers"
  ON public.barrier_events FOR ALL
  TO authenticated
  USING ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin')
  WITH CHECK ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');

-- Household members can insert barrier events
DROP POLICY IF EXISTS "household_insert_barriers" ON public.barrier_events;
CREATE POLICY "household_insert_barriers"
  ON public.barrier_events FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.household_memberships hm
      JOIN public.persons p ON hm.person_id = p.id
      WHERE hm.household_id = barrier_events.household_id
        AND p.auth_user_id = auth.uid()
    )
  );

-- Navigators can insert barrier events for assigned households
DROP POLICY IF EXISTS "navigator_insert_barriers" ON public.barrier_events;
CREATE POLICY "navigator_insert_barriers"
  ON public.barrier_events FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.navigator_assignments na
      WHERE na.household_id = barrier_events.household_id
        AND na.navigator_user_id = auth.uid()
        AND na.assignment_status = 'active'
    )
  );

-- Navigators can update barrier events for assigned households
DROP POLICY IF EXISTS "navigator_update_barriers" ON public.barrier_events;
CREATE POLICY "navigator_update_barriers"
  ON public.barrier_events FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.navigator_assignments na
      WHERE na.household_id = barrier_events.household_id
        AND na.navigator_user_id = auth.uid()
        AND na.assignment_status = 'active'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.navigator_assignments na
      WHERE na.household_id = barrier_events.household_id
        AND na.navigator_user_id = auth.uid()
        AND na.assignment_status = 'active'
    )
  );

-- Household members can update their own barrier events
DROP POLICY IF EXISTS "household_update_barriers" ON public.barrier_events;
CREATE POLICY "household_update_barriers"
  ON public.barrier_events FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.household_memberships hm
      JOIN public.persons p ON hm.person_id = p.id
      WHERE hm.household_id = barrier_events.household_id
        AND p.auth_user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.household_memberships hm
      JOIN public.persons p ON hm.person_id = p.id
      WHERE hm.household_id = barrier_events.household_id
        AND p.auth_user_id = auth.uid()
    )
  );

CREATE INDEX IF NOT EXISTS idx_barriers_household ON public.barrier_events(household_id);
CREATE INDEX IF NOT EXISTS idx_barriers_person ON public.barrier_events(person_id);
CREATE INDEX IF NOT EXISTS idx_barriers_referral ON public.barrier_events(referral_id);
CREATE INDEX IF NOT EXISTS idx_barriers_outcome ON public.barrier_events(outcome_id);
CREATE INDEX IF NOT EXISTS idx_barriers_locus ON public.barrier_events(locus);
CREATE INDEX IF NOT EXISTS idx_barriers_remediability ON public.barrier_events(remediability);
CREATE INDEX IF NOT EXISTS idx_barriers_incident ON public.barrier_events(incident_id);

-- ============================================================
-- updated_at triggers
-- ============================================================

DROP TRIGGER IF EXISTS trg_outcomes_updated ON public.outcomes;
CREATE TRIGGER trg_outcomes_updated
  BEFORE UPDATE ON public.outcomes
  FOR EACH ROW EXECUTE FUNCTION public.update_timestamp();

DROP TRIGGER IF EXISTS trg_barrier_events_updated ON public.barrier_events;
CREATE TRIGGER trg_barrier_events_updated
  BEFORE UPDATE ON public.barrier_events
  FOR EACH ROW EXECUTE FUNCTION public.update_timestamp();

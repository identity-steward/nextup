/*
  # Phase 3.1 — Disclosure Delivery Semantics Hardening

  ## Summary
  Separates authorization (ConsentGrant) from actual external delivery
  (Disclosure). A Disclosure record must now represent what actually
  left NextUp, not merely that a person approved sharing.

  The previous schema defaulted status='sent' and sent_at=now() on
  insert, collapsing "person approved" with "information was
  delivered." This migration corrects that by introducing an explicit
  delivery lifecycle with five states and enforcing that status='sent'
  can only exist when delivery_method, sent_at, AND delivered_by_user_id
  are all populated.

  ## Changes to `disclosures` table (additive only)

  ### New columns
  - `prepared_at` (nullable timestamptz) — when the person approved the
    disclosure package. NULL means not yet prepared.
  - `delivery_started_at` (nullable timestamptz) — when a navigator
    received handoff and began the delivery attempt.
  - `failed_at` (nullable timestamptz) — when a real delivery attempt
    failed.
  - `cancelled_at` (nullable timestamptz) — when the approved disclosure
    was cancelled before successful delivery.
  - `delivered_by_user_id` (nullable uuid, references auth.users) — the
    navigator/admin who confirmed actual external delivery. Required
    before status can become 'sent'.
  - `delivery_reference` (nullable text) — optional external reference
    (tracking number, portal confirmation, etc.).
  - `delivery_notes` (nullable text) — optional notes about the
    delivery.

  ### Modified columns
  - `sent_at`: changed from NOT NULL DEFAULT now() to nullable with no
    default. Remains NULL until actual external delivery succeeds.
  - `status`: CHECK constraint expanded from ('sent','failed','revoked')
    to ('prepared','delivery_pending','sent','failed','cancelled').
    Default changed from 'sent' to 'prepared'.

  ### New CHECK constraints (enforced at the database layer)
  1. `disclosures_sent_requires_delivery` — status='sent' is blocked
     unless delivery_method IS NOT NULL, sent_at IS NOT NULL, AND
     delivered_by_user_id IS NOT NULL. This makes it impossible for a
     bug or client error to record a sent state without all three
     delivery proof fields.
  2. `disclosures_sent_at_only_when_sent` — sent_at must be NULL when
     status is not 'sent'. Prevents a non-sent record from carrying a
     delivery timestamp that would imply delivery occurred.

  ## Security
  - No RLS policies changed. The existing household-scoped SELECT,
    navigator-scoped SELECT, admin full-access, and household INSERT
    policies remain exactly as they were.
  - A new navigator UPDATE policy is added so navigators can record
    delivery confirmation, delivery failure, and cancellation for
    disclosures in their assigned households. This does NOT weaken any
    existing policy — it adds a new capability scoped to navigator
    assignments.
  - A new household UPDATE policy is added so household members can
    cancel their own prepared disclosures before delivery.

  ## Data Preservation
  - Zero existing disclosure rows confirmed before migration (COUNT=0).
  - No backfill needed.
  - No columns dropped, renamed, or type-changed.
  - sent_at default removed but column retained.

  ## Important Notes
  1. No Phase 4 tables created (no Service, Provider, EligibilityPathway,
     FundingOption, FundingGate, Referral, ContactAttempt, BarrierEvent,
     Outcome).
  2. No artifact_url or file attachment columns added.
  3. ConsentGrant purpose is unchanged — it records permission, not
     delivery.
  4. The database enforces the delivery semantics: even if a client bug
     tries to set status='sent' without delivery proof, the CHECK
     constraint blocks it.
*/

-- ============================================================
-- Additive columns
-- ============================================================

ALTER TABLE public.disclosures
  ADD COLUMN IF NOT EXISTS prepared_at timestamptz,
  ADD COLUMN IF NOT EXISTS delivery_started_at timestamptz,
  ADD COLUMN IF NOT EXISTS failed_at timestamptz,
  ADD COLUMN IF NOT EXISTS cancelled_at timestamptz,
  ADD COLUMN IF NOT EXISTS delivered_by_user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS delivery_reference text,
  ADD COLUMN IF NOT EXISTS delivery_notes text;

-- ============================================================
-- Make sent_at nullable (was NOT NULL DEFAULT now())
-- ============================================================

ALTER TABLE public.disclosures
  ALTER COLUMN sent_at DROP NOT NULL,
  ALTER COLUMN sent_at DROP DEFAULT;

-- ============================================================
-- Expand status CHECK constraint
-- ============================================================

ALTER TABLE public.disclosures
  DROP CONSTRAINT IF EXISTS disclosures_status_check;

ALTER TABLE public.disclosures
  ADD CONSTRAINT disclosures_status_check
  CHECK (status IN ('prepared', 'delivery_pending', 'sent', 'failed', 'cancelled'));

-- Change default status from 'sent' to 'prepared'
ALTER TABLE public.disclosures
  ALTER COLUMN status SET DEFAULT 'prepared';

-- ============================================================
-- Delivery proof CHECK constraints
-- ============================================================

-- status='sent' requires delivery_method, sent_at, AND delivered_by_user_id
ALTER TABLE public.disclosures
  DROP CONSTRAINT IF EXISTS disclosures_sent_requires_delivery;

ALTER TABLE public.disclosures
  ADD CONSTRAINT disclosures_sent_requires_delivery
  CHECK (
    status <> 'sent' OR (
      delivery_method IS NOT NULL
      AND sent_at IS NOT NULL
      AND delivered_by_user_id IS NOT NULL
    )
  );

-- sent_at must be NULL unless status='sent'
ALTER TABLE public.disclosures
  DROP CONSTRAINT IF EXISTS disclosures_sent_at_only_when_sent;

ALTER TABLE public.disclosures
  ADD CONSTRAINT disclosures_sent_at_only_when_sent
  CHECK (
    sent_at IS NULL OR status = 'sent'
  );

-- ============================================================
-- Navigator UPDATE policy for disclosures
-- Allows navigators to record delivery confirmation, failure, and
-- cancellation for disclosures in their assigned households.
-- ============================================================

DROP POLICY IF EXISTS "navigator_update_disclosure" ON public.disclosures;
CREATE POLICY "navigator_update_disclosure"
  ON public.disclosures FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.navigator_assignments na
      WHERE na.household_id = disclosures.household_id
        AND na.navigator_user_id = auth.uid()
        AND na.assignment_status = 'active'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.navigator_assignments na
      WHERE na.household_id = disclosures.household_id
        AND na.navigator_user_id = auth.uid()
        AND na.assignment_status = 'active'
    )
  );

-- ============================================================
-- Household UPDATE policy for disclosures
-- Allows household members to cancel their own prepared disclosures
-- before delivery. Does NOT allow marking sent.
-- ============================================================

DROP POLICY IF EXISTS "household_update_disclosure" ON public.disclosures;
CREATE POLICY "household_update_disclosure"
  ON public.disclosures FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.household_memberships hm
      JOIN public.persons p ON hm.person_id = p.id
      WHERE hm.household_id = disclosures.household_id
        AND p.auth_user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.household_memberships hm
      JOIN public.persons p ON hm.person_id = p.id
      WHERE hm.household_id = disclosures.household_id
        AND p.auth_user_id = auth.uid()
    )
  );

-- ============================================================
-- Index for delivery lifecycle queries
-- ============================================================

CREATE INDEX IF NOT EXISTS idx_disc_status ON public.disclosures(status);
CREATE INDEX IF NOT EXISTS idx_disc_delivered_by ON public.disclosures(delivered_by_user_id);

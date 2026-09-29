/*
  # Pilot 002 Phase 1 — Authority Validity Enforcement (W1 completion)

  ## Purpose

  Extends the existing guard_consent_authority_household trigger to also enforce
  that an active consent grant cannot reference an authority that the existing
  domain model considers invalid/hard-stopped.

  This closes the W1 gap: an authenticated navigator could bypass UI controls
  and create an active consent referencing a disputed, expired, unverified-legal,
  or review-overdue authority.

  ## Hard-stop conditions (from existing checkAuthorityHardStops in trustService.ts)

  The domain model already defines these as hard-stops:
  1. authority.disputed = true
  2. authority.legal_instrument_asserted = true AND verification_status != 'verified_by_qualified_authority'
  3. authority.expires_at IS NOT NULL AND authority.expires_at < now()
  4. authority.review_at IS NOT NULL AND authority.review_at < now() AND verification_status != 'verified_by_qualified_authority'

  ## Additional property: subject_person_id match

  Both consent_grants and authority_to_act have subject_person_id. The consent's
  subject must match the authority's subject — an authority for Person A cannot
  authorize consent for Person B. This IS representable in the current model.

  ## NOT enforced (not representable in current model)

  data_categories (jsonb array on consent) vs data_category + action_type (text on
  authority) — applicability by category/action is NOT directly representable
  without inventing a join convention. Documented as NOT REPRESENTABLE.

  ## Safety

  - Only modifies the trigger function (CREATE OR REPLACE). No new constraints,
    no column changes, no table changes.
  - The trigger fires BEFORE INSERT OR UPDATE and only checks when
    authority_to_act_id IS NOT NULL (matching existing behavior).
  - Existing data compatibility checked: 0 active consent_grants, 0 violations.
  - EXECUTE revoked from anon/authenticated, matching existing pattern.
*/

CREATE OR REPLACE FUNCTION public.guard_consent_authority_household()
  RETURNS trigger
  LANGUAGE plpgsql
  SECURITY DEFINER
  SET search_path TO 'public'
AS $$
DECLARE
  auth_record RECORD;
BEGIN
  -- No authority reference: allow (CHECK constraint handles active-requires-authority)
  IF NEW.authority_to_act_id IS NULL THEN
    RETURN NEW;
  END IF;

  -- Fetch the referenced authority record
  SELECT household_id, subject_person_id, disputed, legal_instrument_asserted,
         verification_status, expires_at, review_at
    INTO auth_record
  FROM public.authority_to_act
  WHERE id = NEW.authority_to_act_id;

  -- Authority must exist (FK should guarantee this, but defend in depth)
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Referenced authority_to_act record does not exist'
    USING ERRCODE = 'foreign_key_violation';
  END IF;

  -- Sub-property B: same household
  IF auth_record.household_id IS NULL OR auth_record.household_id <> NEW.household_id THEN
    RAISE EXCEPTION 'Consent grant household_id (%) does not match authority_to_act household_id (%)',
      NEW.household_id::text, auth_record.household_id::text
    USING ERRCODE = 'check_violation';
  END IF;

  -- Sub-property: same subject person
  -- Both tables have subject_person_id. An authority for Person A cannot
  -- authorize consent for Person B, even within the same household.
  IF auth_record.subject_person_id <> NEW.subject_person_id THEN
    RAISE EXCEPTION 'Consent grant subject_person_id (%) does not match authority_to_act subject_person_id (%)',
      NEW.subject_person_id::text, auth_record.subject_person_id::text
    USING ERRCODE = 'check_violation';
  END IF;

  -- W1: authority validity — reject if authority is in a hard-stop state
  -- These conditions mirror checkAuthorityHardStops() in trustService.ts
  IF auth_record.disputed THEN
    RAISE EXCEPTION 'Cannot create active consent: referenced authority is disputed'
    USING ERRCODE = 'check_violation';
  END IF;

  IF auth_record.legal_instrument_asserted
     AND auth_record.verification_status <> 'verified_by_qualified_authority' THEN
    RAISE EXCEPTION 'Cannot create active consent: legal instrument asserted but not verified by qualified authority'
    USING ERRCODE = 'check_violation';
  END IF;

  IF auth_record.expires_at IS NOT NULL AND auth_record.expires_at < now() THEN
    RAISE EXCEPTION 'Cannot create active consent: referenced authority has expired'
    USING ERRCODE = 'check_violation';
  END IF;

  IF auth_record.review_at IS NOT NULL
     AND auth_record.review_at < now()
     AND auth_record.verification_status <> 'verified_by_qualified_authority' THEN
    RAISE EXCEPTION 'Cannot create active consent: referenced authority is overdue for review'
    USING ERRCODE = 'check_violation';
  END IF;

  RETURN NEW;
END;
$$;

REVOKE EXECUTE ON FUNCTION public.guard_consent_authority_household() FROM anon, authenticated;

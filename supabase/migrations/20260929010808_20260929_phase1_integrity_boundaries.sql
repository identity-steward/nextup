/*
# Pilot 002 Phase 1 — Integrity Boundaries

## Purpose

Implements database-level enforcement for three Pilot 002 integrity properties
that must survive authenticated UI-bypass (direct API INSERT/UPDATE):

1. G-NO-DB-TRUST-GUARD / H-NO-AUTHORITY-LINK (P1): An active consent grant
   cannot exist without a valid applicable authority in the same household.
   - Sub-property A: authority_to_act_id must be non-null when status='active'
     (enforced via CHECK constraint — allows status='draft' with null authority).
   - Sub-property B: The referenced authority must belong to the same household
     as the consent grant (enforced via SECURITY DEFINER trigger).

2. I-NO-CONSENT-DISCLOSURE-HOUSEHOLD-CHECK (P2): Cross-household references
   are prevented at the database level.
   - Sub-property C: A consent grant for Household A cannot reference an authority
     belonging to Household B (enforced via the same trigger as sub-property B).
   - Sub-property D: A referral for Household A cannot reference a disclosure
     belonging to Household B (enforced via a separate SECURITY DEFINER trigger).

3. D — Preserve existing delivery-proof enforcement: The existing
   disclosures_sent_requires_delivery CHECK constraint is NOT modified.

## Changes

### New CHECK constraint
- consent_grants_active_requires_authority: on consent_grants — rejects
  status='active' when authority_to_act_id IS NULL. Drafts (status='draft')
  remain allowed with null authority.

### New trigger functions (SECURITY DEFINER, search_path = public)
- guard_consent_authority_household(): BEFORE INSERT OR UPDATE on
  consent_grants. When authority_to_act_id is non-null, queries
  authority_to_act.household_id and rejects mismatch with NEW.household_id.
- guard_referral_disclosure_household(): BEFORE INSERT OR UPDATE on
  referrals. When disclosure_id is non-null, queries
  disclosures.household_id and rejects mismatch with NEW.household_id.

### New triggers
- trg_consent_authority_household on consent_grants
- trg_referral_disclosure_household on referrals

### EXECUTE revocation
- REVOKE EXECUTE on both new guard functions from anon and authenticated,
  matching the existing pattern for guard_referral_transition and
  guard_pathway_confirmed_need.

## Safety
- All changes are additive (new constraints, triggers, functions). No columns
  dropped, types changed, or tables renamed.
- Existing data compatibility checked before migration: 0 rows in all four
  tables, 0 violations of any kind.
- The CHECK constraint allows status='draft' with null authority (drafts are
  pre-approval). Only status='active' requires the link.
- Both triggers are no-ops when the FK column is null (they only validate when
  a reference is populated), so they do not interfere with draft creation.
- Triggers use SECURITY DEFINER with search_path = public to prevent
  search_path manipulation and ensure they run with owner privileges.
- Idempotent: uses DROP IF EXISTS before creating functions, triggers,
  and constraints.
*/

-- ============================================================
-- 1. CHECK constraint: active consent requires authority_to_act_id
-- ============================================================

DO $$
BEGIN
  ALTER TABLE public.consent_grants
    DROP CONSTRAINT IF EXISTS consent_grants_active_requires_authority;
END $$;

ALTER TABLE public.consent_grants
  ADD CONSTRAINT consent_grants_active_requires_authority
  CHECK (
    status <> 'active'
    OR authority_to_act_id IS NOT NULL
  );

-- ============================================================
-- 2. Trigger function: consent-authority household match
-- ============================================================

CREATE OR REPLACE FUNCTION public.guard_consent_authority_household()
  RETURNS trigger
  LANGUAGE plpgsql
  SECURITY DEFINER
  SET search_path TO 'public'
AS $$
DECLARE
  auth_household_id uuid;
BEGIN
  IF NEW.authority_to_act_id IS NULL THEN
    RETURN NEW;
  END IF;

  SELECT household_id INTO auth_household_id
  FROM public.authority_to_act
  WHERE id = NEW.authority_to_act_id;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Referenced authority_to_act record does not exist'
    USING ERRCODE = 'foreign_key_violation';
  END IF;

  IF auth_household_id IS NULL OR auth_household_id <> NEW.household_id THEN
    RAISE EXCEPTION 'Consent grant household_id (%) does not match authority_to_act household_id (%)',
      NEW.household_id, COALESCE(auth_household_id, 'NULL'::uuid)
    USING ERRCODE = 'check_violation';
  END IF;

  RETURN NEW;
END;
$$;

REVOKE EXECUTE ON FUNCTION public.guard_consent_authority_household() FROM anon, authenticated;

DROP TRIGGER IF EXISTS trg_consent_authority_household ON public.consent_grants;

CREATE TRIGGER trg_consent_authority_household
  BEFORE INSERT OR UPDATE OF authority_to_act_id, household_id ON public.consent_grants
  FOR EACH ROW
  EXECUTE FUNCTION public.guard_consent_authority_household();

-- ============================================================
-- 3. Trigger function: referral-disclosure household match
-- ============================================================

CREATE OR REPLACE FUNCTION public.guard_referral_disclosure_household()
  RETURNS trigger
  LANGUAGE plpgsql
  SECURITY DEFINER
  SET search_path TO 'public'
AS $$
DECLARE
  disc_household_id uuid;
BEGIN
  IF NEW.disclosure_id IS NULL THEN
    RETURN NEW;
  END IF;

  SELECT household_id INTO disc_household_id
  FROM public.disclosures
  WHERE id = NEW.disclosure_id;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Referenced disclosure does not exist'
    USING ERRCODE = 'foreign_key_violation';
  END IF;

  IF disc_household_id IS NULL OR disc_household_id <> NEW.household_id THEN
    RAISE EXCEPTION 'Referral household_id (%) does not match disclosure household_id (%)',
      NEW.household_id, COALESCE(disc_household_id, 'NULL'::uuid)
    USING ERRCODE = 'check_violation';
  END IF;

  RETURN NEW;
END;
$$;

REVOKE EXECUTE ON FUNCTION public.guard_referral_disclosure_household() FROM anon, authenticated;

DROP TRIGGER IF EXISTS trg_referral_disclosure_household ON public.referrals;

CREATE TRIGGER trg_referral_disclosure_household
  BEFORE INSERT OR UPDATE OF disclosure_id, household_id ON public.referrals
  FOR EACH ROW
  EXECUTE FUNCTION public.guard_referral_disclosure_household();

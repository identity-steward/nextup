/*
# Pilot 002 Phase 1 — Fix trigger error message UUID cast

## Purpose
Fix a bug in the guard_consent_authority_household and guard_referral_disclosure_household
trigger functions where COALESCE(auth_household_id, 'NULL'::uuid) causes an invalid input
syntax error when the RAISE EXCEPTION path fires. The household_id columns on
authority_to_act and disclosures are NOT NULL, so the COALESCE is never actually reached,
but the expression is still evaluated at function creation and can fail at runtime.
Replace with text cast for the error message.

## Safety
- Only modifies the two trigger functions created in the previous migration.
- No data changes. No schema changes. No new objects.
*/

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
      NEW.household_id::text, auth_household_id::text
    USING ERRCODE = 'check_violation';
  END IF;

  RETURN NEW;
END;
$$;

REVOKE EXECUTE ON FUNCTION public.guard_consent_authority_household() FROM anon, authenticated;

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
      NEW.household_id::text, disc_household_id::text
    USING ERRCODE = 'check_violation';
  END IF;

  RETURN NEW;
END;
$$;

REVOKE EXECUTE ON FUNCTION public.guard_referral_disclosure_household() FROM anon, authenticated;

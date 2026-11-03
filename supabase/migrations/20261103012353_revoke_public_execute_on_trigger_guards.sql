/*
  # Remove public EXECUTE on internal trigger guard functions

  1. Problem
     Postgres grants EXECUTE to PUBLIC on every new function, so the four
     SECURITY DEFINER trigger guards were callable as RPCs by anon and
     authenticated.

  2. Changes
     - Revokes EXECUTE from PUBLIC, anon and authenticated on
       guard_athlete_identity_fields, guard_consent_authority_household,
       guard_person_youth_fields and guard_referral_disclosure_household.

  3. Security notes
     1. Trigger EXECUTE permission is checked when the trigger is created,
        not when it fires, so the triggers keep working.
*/

REVOKE EXECUTE ON FUNCTION public.guard_athlete_identity_fields() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.guard_consent_authority_household() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.guard_person_youth_fields() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.guard_referral_disclosure_household() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.guard_user_profile_staff_name() FROM PUBLIC, anon, authenticated;

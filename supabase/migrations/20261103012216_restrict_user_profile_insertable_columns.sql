/*
  # Restrict which user_profiles columns the owner may insert

  1. Problem
     user_profiles INSERT was granted at table level, covering every column,
     so a caller could create their own profile row with role='parent' (or
     any other role) and an arbitrary athlete_id. Several policies trust
     user_profiles.role and user_profiles.athlete_id.

  2. Changes
     - Revokes the blanket INSERT grant from anon and authenticated.
     - Re-grants INSERT only on (id, display_name, phone, updated_at) to
       authenticated.

  3. Security notes
     1. handle_new_user() is SECURITY DEFINER and still creates the profile
        row (with a sanitised role) at signup, so onboarding is unaffected.
     2. UPDATE was already column-restricted; this makes INSERT match.
*/

REVOKE INSERT ON public.user_profiles FROM anon;
REVOKE INSERT ON public.user_profiles FROM authenticated;
GRANT INSERT (id, display_name, phone, updated_at) ON public.user_profiles TO authenticated;

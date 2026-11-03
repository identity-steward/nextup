/*
  # Limit privileged RPCs to signed-in callers

  1. Problem
     claim_event_code, link_athlete_profile and resolve_delivery_recorder_labels
     are SECURITY DEFINER functions that still carried the default PUBLIC
     EXECUTE grant, so the anon role could call them.

  2. Changes
     - Revokes EXECUTE from PUBLIC and anon on all three.
     - Grants EXECUTE to authenticated, which is the only role the app uses
       for these calls.

  3. Security notes
     1. Each function already verifies session, athlete ownership or
        household membership internally; this removes the unused surface.
*/

REVOKE EXECUTE ON FUNCTION public.claim_event_code(text, uuid) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.claim_event_code(text, uuid) TO authenticated;

REVOKE EXECUTE ON FUNCTION public.link_athlete_profile(uuid) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.link_athlete_profile(uuid) TO authenticated;

REVOKE EXECUTE ON FUNCTION public.resolve_delivery_recorder_labels(uuid) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.resolve_delivery_recorder_labels(uuid) TO authenticated;

/*
  # Revoke EXECUTE on narration protection trigger

  ## Summary
  The protect_narration_original_text() function is a SECURITY DEFINER trigger
  function. It should only fire as a BEFORE UPDATE trigger on person_narrations,
  not be directly callable via the REST API. Revoking EXECUTE from anon and
  authenticated prevents direct invocation.

  ## Security
  - REVOKE EXECUTE on public.protect_narration_original_text() from anon and authenticated.
  - The trigger still works because trigger functions execute with the
    trigger's owner privileges, not the caller's.
*/

REVOKE EXECUTE ON FUNCTION public.protect_narration_original_text() FROM anon, authenticated;
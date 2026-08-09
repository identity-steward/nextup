/*
  # Revoke EXECUTE on narration protection trigger (broader)

  The previous REVOKE from anon/authenticated didn't clear the advisor.
  Revoke from PUBLIC as well to ensure no role can directly call this
  trigger function via the REST API.
*/

REVOKE EXECUTE ON FUNCTION public.protect_narration_original_text() FROM PUBLIC;
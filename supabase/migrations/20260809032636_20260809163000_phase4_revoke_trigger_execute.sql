/*
  # Phase 4 Fix — Revoke public execute on guard_referral_transition

  The guard_referral_transition function is a SECURITY DEFINER trigger
  function. It should only be called by the BEFORE UPDATE trigger on
  the referrals table, not via the REST API. Revoking EXECUTE from
  anon and authenticated prevents direct RPC calls.
*/

REVOKE EXECUTE ON FUNCTION public.guard_referral_transition() FROM anon, authenticated;

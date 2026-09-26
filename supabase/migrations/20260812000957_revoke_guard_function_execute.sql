/*
  # Remove direct API access to trigger guard functions

  guard_referral_transition() and guard_pathway_confirmed_need() are
  SECURITY DEFINER trigger functions and were callable as RPCs by anonymous
  and signed-in clients. Triggers keep working without any EXECUTE grant to
  those roles.
*/

REVOKE ALL ON FUNCTION public.guard_referral_transition() FROM public, anon, authenticated;
REVOKE ALL ON FUNCTION public.guard_pathway_confirmed_need() FROM public, anon, authenticated;

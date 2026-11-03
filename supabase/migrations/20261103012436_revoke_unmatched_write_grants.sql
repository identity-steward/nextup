/*
  # Remove write grants that no policy permits

  1. Problem
     Several high-value tables had INSERT/UPDATE/DELETE granted to anon or
     authenticated while having no policy for those commands. Row level
     security denies them today, but the grants mean any future permissive
     policy silently becomes a write path.

  2. Changes
     - Revokes the unmatched write verbs on payments, support_plans,
       support_access, navigator_assignments, person_relationships and
       agent_trigger_log from anon and authenticated.

  3. Security notes
     1. No behaviour changes: these writes were already rejected by row
        level security, so nothing in the app relied on them.
     2. service_role grants are untouched.
*/

REVOKE INSERT, UPDATE, DELETE ON public.payments FROM anon, authenticated;
REVOKE INSERT, UPDATE, DELETE ON public.support_plans FROM anon, authenticated;
REVOKE INSERT, UPDATE, DELETE ON public.support_access FROM anon, authenticated;
REVOKE INSERT, UPDATE, DELETE ON public.navigator_assignments FROM anon, authenticated;
REVOKE INSERT, UPDATE, DELETE ON public.person_relationships FROM anon, authenticated;
REVOKE UPDATE, DELETE ON public.agent_trigger_log FROM anon, authenticated;

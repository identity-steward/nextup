/*
  # Secure event codes

  1. Removes the policy that let any signed-in user rewrite any active event
     code, and the policy that let anonymous visitors read active codes.
  2. Adds claim_event_code(), which validates and consumes a code in a single
     atomic statement and applies the resulting profile status server-side.
  3. increment_event_code_uses() is retired in favour of the claim function.
*/

DROP POLICY IF EXISTS "Authenticated users can increment event code uses" ON public.event_codes;
DROP POLICY IF EXISTS "Anyone can read active event codes" ON public.event_codes;

CREATE OR REPLACE FUNCTION public.claim_event_code(p_code text, p_athlete_id uuid)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public', 'pg_catalog'
AS $function$
DECLARE
  v_uid uuid := auth.uid();
  v_id uuid;
  v_auto boolean;
BEGIN
  IF v_uid IS NULL OR p_code IS NULL OR btrim(p_code) = '' THEN
    RETURN NULL;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM public.athletes a
    WHERE a.id = p_athlete_id
      AND (a.auth_user_id = v_uid OR a.created_by_user_id = v_uid OR a.managed_by_parent_id = v_uid)
  ) THEN
    RETURN NULL;
  END IF;

  UPDATE public.event_codes
  SET uses_count = COALESCE(uses_count, 0) + 1
  WHERE upper(code) = upper(btrim(p_code))
    AND is_active = true
    AND (expires_at IS NULL OR expires_at > now())
    AND (max_uses IS NULL OR COALESCE(uses_count, 0) < max_uses)
  RETURNING id, auto_approve INTO v_id, v_auto;

  IF v_id IS NULL THEN
    RETURN NULL;
  END IF;

  UPDATE public.athletes
  SET profile_status = CASE WHEN v_auto THEN 'active' ELSE 'pending' END,
      event_code_id = v_id,
      event_code_used = upper(btrim(p_code)),
      source_type = 'event_code'
  WHERE id = p_athlete_id;

  RETURN v_id;
END;
$function$;

REVOKE ALL ON FUNCTION public.claim_event_code(text, uuid) FROM public, anon;
GRANT EXECUTE ON FUNCTION public.claim_event_code(text, uuid) TO authenticated;

REVOKE ALL ON FUNCTION public.increment_event_code_uses(text) FROM public, anon, authenticated;

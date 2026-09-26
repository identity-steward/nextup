/*
  # Let the event-code claim set the profile status

  The athlete field guard pins profile_status for non-admin callers, which
  would also block the server-side approval performed inside
  claim_event_code(). The claim marks a transaction-local flag that the guard
  honours; the flag can only be set from inside these SECURITY DEFINER
  functions.
*/

CREATE OR REPLACE FUNCTION public.enforce_athlete_privileged_fields()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public', 'pg_catalog'
AS $function$
DECLARE
  v_claims text := current_setting('request.jwt.claims', true);
  v_is_admin boolean := COALESCE(((auth.jwt() -> 'app_metadata') ->> 'role') = 'admin', false);
  v_privileged boolean := COALESCE(current_setting('app.privileged_athlete_write', true) = 'on', false);
  v_is_service boolean;
BEGIN
  v_is_service := v_claims IS NULL
    OR COALESCE((v_claims::jsonb ->> 'role') = 'service_role', false);

  IF v_is_admin OR v_is_service OR v_privileged THEN
    RETURN NEW;
  END IF;

  IF TG_OP = 'INSERT' THEN
    NEW.profile_status := 'pending';
    NEW.is_featured := false;
    NEW.profile_tier := 'basic';
    NEW.monthly_funding := 0;
    NEW.season_amount_raised := 0;
    NEW.supporters_count := 0;
    NEW.views_count := 0;
    NEW.followers_count := 0;
    NEW.stripe_payment_link := NULL;
    RETURN NEW;
  END IF;

  NEW.profile_status := OLD.profile_status;
  NEW.is_featured := OLD.is_featured;
  NEW.is_active := OLD.is_active;
  NEW.profile_tier := OLD.profile_tier;
  NEW.monthly_funding := OLD.monthly_funding;
  NEW.season_amount_raised := OLD.season_amount_raised;
  NEW.supporters_count := OLD.supporters_count;
  NEW.views_count := OLD.views_count;
  NEW.followers_count := OLD.followers_count;
  NEW.stripe_payment_link := OLD.stripe_payment_link;
  NEW.auth_user_id := OLD.auth_user_id;
  NEW.created_by_user_id := OLD.created_by_user_id;
  NEW.managed_by_parent_id := OLD.managed_by_parent_id;
  NEW.event_code_id := OLD.event_code_id;
  NEW.event_code_used := OLD.event_code_used;
  RETURN NEW;
END;
$function$;

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

  PERFORM set_config('app.privileged_athlete_write', 'on', true);

  UPDATE public.athletes
  SET profile_status = CASE WHEN v_auto THEN 'active' ELSE 'pending' END,
      event_code_id = v_id,
      event_code_used = upper(btrim(p_code)),
      source_type = 'event_code'
  WHERE id = p_athlete_id;

  PERFORM set_config('app.privileged_athlete_write', 'off', true);

  RETURN v_id;
END;
$function$;

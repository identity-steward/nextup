/*
  # Pin privileged athlete columns for non-admin callers

  Row-level policies let an athlete update every column of their own row,
  including publication status, feature flags, funding totals, audience
  counters and the payment link. This trigger keeps those columns
  server-controlled: admins (JWT app_metadata role) may set them, everyone
  else gets defaults on insert and the previous value on update.
*/

CREATE OR REPLACE FUNCTION public.enforce_athlete_privileged_fields()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public', 'pg_catalog'
AS $function$
DECLARE
  v_is_admin boolean := COALESCE(((auth.jwt() -> 'app_metadata') ->> 'role') = 'admin', false);
  v_is_service boolean := COALESCE(current_setting('request.jwt.claims', true) IS NULL, true);
BEGIN
  IF v_is_admin OR v_is_service THEN
    RETURN NEW;
  END IF;

  IF TG_OP = 'INSERT' THEN
    NEW.profile_status := 'pending';
    NEW.is_featured := false;
    NEW.profile_tier := COALESCE(NEW.profile_tier, 'basic');
    IF NEW.profile_tier <> 'basic' THEN NEW.profile_tier := 'basic'; END IF;
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

DROP TRIGGER IF EXISTS enforce_athlete_privileged_fields_trg ON public.athletes;
CREATE TRIGGER enforce_athlete_privileged_fields_trg
  BEFORE INSERT OR UPDATE ON public.athletes
  FOR EACH ROW EXECUTE FUNCTION public.enforce_athlete_privileged_fields();

REVOKE ALL ON FUNCTION public.enforce_athlete_privileged_fields() FROM public, anon, authenticated;

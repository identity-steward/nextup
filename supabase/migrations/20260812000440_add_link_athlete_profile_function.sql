/*
  # Server-controlled athlete linking

  Replaces the client's direct write to user_profiles.athlete_id, which is no
  longer permitted. The caller may only link an athlete row they created or
  manage, and only while no link exists yet.
*/

CREATE OR REPLACE FUNCTION public.link_athlete_profile(p_athlete_id uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public', 'pg_catalog'
AS $function$
DECLARE
  v_uid uuid := auth.uid();
  v_ok boolean;
BEGIN
  IF v_uid IS NULL THEN
    RETURN false;
  END IF;

  SELECT EXISTS (
    SELECT 1 FROM public.athletes a
    WHERE a.id = p_athlete_id
      AND (a.auth_user_id = v_uid OR a.created_by_user_id = v_uid OR a.managed_by_parent_id = v_uid)
  ) INTO v_ok;

  IF NOT v_ok THEN
    RETURN false;
  END IF;

  UPDATE public.user_profiles
  SET athlete_id = p_athlete_id,
      updated_at = now()
  WHERE id = v_uid
    AND (athlete_id IS NULL OR athlete_id = p_athlete_id);

  RETURN FOUND;
END;
$function$;

REVOKE ALL ON FUNCTION public.link_athlete_profile(uuid) FROM public, anon;
GRANT EXECUTE ON FUNCTION public.link_athlete_profile(uuid) TO authenticated;

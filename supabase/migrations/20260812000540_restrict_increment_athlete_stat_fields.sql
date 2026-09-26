/*
  # Restrict which athlete counters can be incremented

  increment_athlete_stat accepted any column name from the caller, letting a
  visitor raise funding or supporter figures. Only the three display counters
  the app actually increments are allowed now, and the function no longer
  needs table-wide write privileges from anonymous callers.
*/

CREATE OR REPLACE FUNCTION public.increment_athlete_stat(athlete_id uuid, field text)
RETURNS void
LANGUAGE plpgsql
SET search_path TO 'public', 'pg_catalog'
AS $function$
BEGIN
  IF field NOT IN ('views_count', 'supporters_count', 'followers_count') THEN
    RAISE EXCEPTION 'Unsupported stat field';
  END IF;

  EXECUTE format('update public.athletes set %I = coalesce(%I, 0) + 1 where id = $1', field, field)
  USING athlete_id;
END;
$function$;

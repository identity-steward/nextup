/*
  # Pin search_path on the two timestamp trigger functions
*/

ALTER FUNCTION public.update_journey_entries_updated_at() SET search_path = 'public', 'pg_catalog';
ALTER FUNCTION public.update_timestamp() SET search_path = 'public', 'pg_catalog';

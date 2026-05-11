
/*
  # Fix sab_ids consent_status to use 'accepted' instead of 'granted'

  Keeps consent language consistent across all tables.
*/

UPDATE public.sab_ids SET consent_status = 'accepted' WHERE consent_status = 'granted';

ALTER TABLE public.sab_ids DROP CONSTRAINT IF EXISTS sab_ids_consent_status_check;

ALTER TABLE public.sab_ids ADD CONSTRAINT sab_ids_consent_status_check
  CHECK (consent_status IN ('pending', 'accepted', 'revoked'));

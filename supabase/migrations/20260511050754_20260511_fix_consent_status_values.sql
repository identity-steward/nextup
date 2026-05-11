
/*
  # Fix consent_status allowed values

  ## Summary
  Replaces the consent_status CHECK constraint on the consents table.
  Old values: pending | granted | revoked
  New values: pending | accepted | revoked

  'accepted' is the canonical value meaning consent has been given.
  'granted' is removed to avoid confusion with profile approval language.
  Existing rows with consent_status = 'granted' are migrated to 'accepted'.
*/

-- Migrate any existing 'granted' rows before dropping the constraint
UPDATE public.consents SET consent_status = 'accepted' WHERE consent_status = 'granted';

-- Drop old constraint and add new one
ALTER TABLE public.consents DROP CONSTRAINT IF EXISTS consents_consent_status_check;

ALTER TABLE public.consents ADD CONSTRAINT consents_consent_status_check
  CHECK (consent_status IN ('pending', 'accepted', 'revoked'));

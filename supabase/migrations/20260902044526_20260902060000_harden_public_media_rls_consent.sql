-- Phase 2C: Harden public media_uploads RLS to enforce consent_status
--
-- OLD POLICY (anonymous SELECT):
--   status = 'approved'
--
-- NEW POLICY (anonymous SELECT):
--   status = 'approved' AND consent_status != 'revoked'
--
-- Admin, uploader, and owner policies are NOT changed.
-- usage_scope is intentionally NOT added to RLS (semantics are ambiguous).

DROP POLICY IF EXISTS "Public can view approved media" ON public.media_uploads;

CREATE POLICY "Public can view approved media with current consent"
  ON public.media_uploads FOR SELECT
  TO anon, authenticated
  USING (status = 'approved' AND consent_status != 'revoked');

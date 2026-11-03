/*
  # Create media_consent_audit and media_signed_url_log tables + media-quarantine bucket

  ## New Tables

  1. `media_consent_audit`
     - Tracks consent status changes, quarantine operations, and revocation actions
     - Columns: id, media_upload_id, previous_status, new_status, changed_by_user_id,
       changed_at, reason, original_storage_path, quarantine_storage_path

  2. `media_signed_url_log`
     - Logs each signed URL issuance for audit purposes
     - Columns: id, media_upload_id, caller_user_id, issued_at, expires_at,
       authorization_basis

  ## New Storage Bucket

  3. `media-quarantine` (private)
     - Stores revoked/quarantined media files
     - Only accessible via service role key (no public or anon access)

  ## Security
  - Both tables have RLS enabled
  - media_consent_audit: authenticated can read, admin-only write (via service role from Edge Function)
  - media_signed_url_log: admin-only read, service-role-only write
  - No grants to anon role on either table
  - service_role gets INSERT on both tables (Edge Functions use service role key)
*/

-- 1. media_consent_audit table
CREATE TABLE IF NOT EXISTS public.media_consent_audit (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  media_upload_id uuid NOT NULL REFERENCES public.media_uploads(id) ON DELETE CASCADE,
  previous_status text,
  new_status text,
  changed_by_user_id uuid,
  changed_at timestamptz NOT NULL DEFAULT now(),
  reason text NOT NULL,
  original_storage_path text,
  quarantine_storage_path text
);

ALTER TABLE public.media_consent_audit ENABLE ROW LEVEL SECURITY;

GRANT SELECT ON public.media_consent_audit TO authenticated;
GRANT INSERT ON public.media_consent_audit TO service_role;

DROP POLICY IF EXISTS "Authenticated can read consent audit" ON public.media_consent_audit;
CREATE POLICY "Authenticated can read consent audit"
  ON public.media_consent_audit FOR SELECT
  TO authenticated
  USING (((auth.jwt() -> 'app_metadata') ->> 'role') = 'admin' OR
         EXISTS (SELECT 1 FROM public.media_uploads mu
                 WHERE mu.id = media_consent_audit.media_upload_id
                   AND mu.uploader_id = auth.uid()));

-- 2. media_signed_url_log table
CREATE TABLE IF NOT EXISTS public.media_signed_url_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  media_upload_id uuid NOT NULL REFERENCES public.media_uploads(id) ON DELETE CASCADE,
  caller_user_id uuid,
  issued_at timestamptz NOT NULL DEFAULT now(),
  expires_at timestamptz NOT NULL,
  authorization_basis text NOT NULL
);

ALTER TABLE public.media_signed_url_log ENABLE ROW LEVEL SECURITY;

GRANT SELECT ON public.media_signed_url_log TO authenticated;
GRANT INSERT ON public.media_signed_url_log TO service_role;

DROP POLICY IF EXISTS "Admins can read signed url log" ON public.media_signed_url_log;
CREATE POLICY "Admins can read signed url log"
  ON public.media_signed_url_log FOR SELECT
  TO authenticated
  USING (((auth.jwt() -> 'app_metadata') ->> 'role') = 'admin');

-- 3. Create media-quarantine bucket (private)
INSERT INTO storage.buckets (id, name, public, file_size_limit)
VALUES ('media-quarantine', 'media-quarantine', false, 524288000)
ON CONFLICT (id) DO NOTHING;

-- Storage policy: only service role can access quarantine bucket objects
-- (service role bypasses RLS, so we just need to ensure anon/authenticated cannot)
DROP POLICY IF EXISTS "Service role can manage quarantine objects" ON storage.objects;
CREATE POLICY "Service role can manage quarantine objects"
  ON storage.objects FOR SELECT
  TO authenticated
  USING (bucket_id = 'media-quarantine' AND ((auth.jwt() ->> 'role') = 'service_role'));

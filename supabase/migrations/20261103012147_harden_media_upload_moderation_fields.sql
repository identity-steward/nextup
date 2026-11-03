/*
  # Enforce moderation and consent fields on media uploads

  1. Problem
     Any authenticated caller could POST a row to media_uploads with
     status='approved', consent_status='granted' and usage_scope='{public}'
     for an arbitrary athlete_id, publishing unreviewed media on another
     youth athlete's public profile.

  2. Changes
     - New function enforce_media_upload_privileged_fields(): a BEFORE INSERT
       OR UPDATE trigger that, for callers who are not admin and not the
       service role, forces the moderation/consent fields to their safe
       values on insert and preserves the stored values on update.
     - Replaces the INSERT policy "Uploaders can insert media" so the named
       athlete must belong to the caller (own athlete record, parent-managed
       record, or the athlete linked through user_profiles).

  3. Security notes
     1. Admin and service-role writes are unaffected, so the review queue
        continues to approve media normally.
     2. No client code inserts into media_uploads today, so no existing
        feature depends on the wider behaviour.
*/

CREATE OR REPLACE FUNCTION public.enforce_media_upload_privileged_fields()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public', 'pg_catalog'
AS $function$
DECLARE
  v_claims text := current_setting('request.jwt.claims', true);
  v_is_admin boolean := COALESCE(((auth.jwt() -> 'app_metadata') ->> 'role') = 'admin', false);
  v_is_service boolean;
BEGIN
  v_is_service := v_claims IS NULL
    OR COALESCE((v_claims::jsonb ->> 'role') = 'service_role', false);

  IF v_is_admin OR v_is_service THEN
    RETURN NEW;
  END IF;

  IF TG_OP = 'INSERT' THEN
    NEW.uploader_id := COALESCE(auth.uid(), NEW.uploader_id);
    NEW.status := 'pending';
    NEW.consent_status := 'pending';
    NEW.usage_scope := ARRAY['profile']::text[];
    NEW.is_featured := false;
    NEW.featured := false;
    NEW.approved_by := NULL;
    NEW.approved_at := NULL;
    NEW.reviewed_at := NULL;
    NEW.admin_notes := NULL;
    RETURN NEW;
  END IF;

  NEW.uploader_id := OLD.uploader_id;
  NEW.athlete_id := OLD.athlete_id;
  NEW.status := OLD.status;
  NEW.consent_status := OLD.consent_status;
  NEW.usage_scope := OLD.usage_scope;
  NEW.is_featured := OLD.is_featured;
  NEW.featured := OLD.featured;
  NEW.approved_by := OLD.approved_by;
  NEW.approved_at := OLD.approved_at;
  NEW.reviewed_at := OLD.reviewed_at;
  NEW.admin_notes := OLD.admin_notes;
  RETURN NEW;
END;
$function$;

REVOKE EXECUTE ON FUNCTION public.enforce_media_upload_privileged_fields() FROM PUBLIC, anon, authenticated;

DROP TRIGGER IF EXISTS enforce_media_upload_privileged_fields_trg ON public.media_uploads;
CREATE TRIGGER enforce_media_upload_privileged_fields_trg
  BEFORE INSERT OR UPDATE ON public.media_uploads
  FOR EACH ROW EXECUTE FUNCTION public.enforce_media_upload_privileged_fields();

DROP POLICY IF EXISTS "Uploaders can insert media" ON public.media_uploads;
CREATE POLICY "Uploaders can insert media"
  ON public.media_uploads FOR INSERT
  TO authenticated
  WITH CHECK (
    auth.uid() = uploader_id
    AND (
      EXISTS (
        SELECT 1 FROM public.athletes a
        WHERE a.id = media_uploads.athlete_id
          AND (a.auth_user_id = auth.uid()
               OR a.created_by_user_id = auth.uid()
               OR a.managed_by_parent_id = auth.uid())
      )
      OR EXISTS (
        SELECT 1 FROM public.user_profiles up
        WHERE up.id = auth.uid()
          AND up.athlete_id = media_uploads.athlete_id
      )
    )
  );

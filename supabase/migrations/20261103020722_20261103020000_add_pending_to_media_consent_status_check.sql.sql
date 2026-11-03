/*
  # Repair media_uploads consent_status CHECK constraint and trigger usage_scope assignment

  ## Problem

  1. The enforce_media_upload_privileged_fields() trigger (added in the F1
     security fix) sets `consent_status := 'pending'` for non-admin uploads.
     However, the CHECK constraint on media_uploads.consent_status only
     allows `'implied'`, `'signed'`, `'revoked'` — it does NOT include
     `'pending'`. PostgreSQL CHECK constraints apply even inside
     SECURITY DEFINER functions, so every non-admin media upload attempt
     fails with a constraint violation.

  2. The same trigger sets `usage_scope := ARRAY['profile']::text[]`, but
     the `usage_scope` column is type `text` (scalar), not `text[]`.
     Additionally, `'profile'` is not in the usage_scope CHECK constraint
     (which allows `'platform'`, `'marketing'`, `'public'`). This would
     also cause non-admin uploads to fail with a type/constraint error.

  ## Changes

  1. Drop the existing `media_uploads_consent_status_check` constraint and
     re-create it to allow `'pending'` in addition to the existing values.
     New allowed set: `'pending'`, `'implied'`, `'signed'`, `'revoked'`.

  2. Recreate `enforce_media_upload_privileged_fields()` with the
     `usage_scope` assignment fixed to `NEW.usage_scope := 'platform'`
     (a valid scalar text value in the existing CHECK constraint). The
     `consent_status := 'pending'` assignment is preserved and now valid.

  ## What does NOT change

  - No existing media_uploads records are modified.
  - No athlete, consent, guardian, or authority records are modified.
  - No bucket visibility or storage policies are changed.
  - The INSERT policy "Uploaders can insert media" (requiring athlete
    ownership) is unchanged.
  - The SELECT, UPDATE, DELETE policies on media_uploads are unchanged.
  - The trigger's core behavior is preserved: non-admin inserts get
    status='pending', consent_status='pending', featured=false, all
    approval fields cleared. Non-admin updates have privileged fields
    frozen to their stored values.
*/

-- 1. Expand the consent_status CHECK constraint to include 'pending'
ALTER TABLE public.media_uploads DROP CONSTRAINT IF EXISTS media_uploads_consent_status_check;

ALTER TABLE public.media_uploads ADD CONSTRAINT media_uploads_consent_status_check
  CHECK (consent_status = ANY (ARRAY['pending'::text, 'implied'::text, 'signed'::text, 'revoked'::text]));

-- 2. Recreate the trigger function with the usage_scope fix
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
    NEW.usage_scope := 'platform';
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

-- Re-create the trigger (DROP + CREATE to ensure it points to the updated function)
DROP TRIGGER IF EXISTS enforce_media_upload_privileged_fields_trg ON public.media_uploads;
CREATE TRIGGER enforce_media_upload_privileged_fields_trg
  BEFORE INSERT OR UPDATE ON public.media_uploads
  FOR EACH ROW EXECUTE FUNCTION public.enforce_media_upload_privileged_fields();

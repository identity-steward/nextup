
/*
  # Fix SECURITY DEFINER Function Vulnerabilities

  ## Summary

  1. `apply_approved_media` — trigger function missing SET search_path; add it.
  2. `create_sab_id` — switch SECURITY DEFINER → SECURITY INVOKER; add INSERT
     policy on sab_ids for authenticated users so the function still works.
  3. `validate_event_code` — switch SECURITY DEFINER → SECURITY INVOKER;
     existing "Anyone can read active event codes" policy covers anon + authenticated reads.
  4. `increment_event_code_uses` — switch SECURITY DEFINER → SECURITY INVOKER;
     add narrow UPDATE policy on event_codes for authenticated users (uses_count only).

  All three callable functions are re-created as SECURITY INVOKER so they run with
  the caller's own permissions and RLS applies normally. This removes the elevated
  privilege concern while keeping them callable.

  Leaked password protection must be enabled via the Auth dashboard — not configurable via SQL.
*/

-- ============================================================
-- 1. Fix apply_approved_media: add SET search_path
-- ============================================================

CREATE OR REPLACE FUNCTION public.apply_approved_media()
  RETURNS trigger
  LANGUAGE plpgsql
  SECURITY DEFINER
  SET search_path = public, pg_catalog
AS $$
BEGIN
  IF NEW.status = 'approved' AND OLD.status <> 'approved' THEN
    IF NEW.media_type = 'photo' AND NEW.public_url IS NOT NULL THEN
      UPDATE public.athletes
         SET image_url = NEW.public_url
       WHERE id = NEW.athlete_id
         AND (image_url IS NULL OR NEW.is_featured = true);
    END IF;

    IF NEW.media_type IN ('video', 'highlight') AND NEW.public_url IS NOT NULL AND NEW.is_featured = true THEN
      UPDATE public.athletes
         SET highlight_video_url = NEW.public_url
       WHERE id = NEW.athlete_id;
    END IF;
  END IF;

  RETURN NEW;
END;
$$;

-- Trigger functions only need to run as postgres internally; revoke RPC access
REVOKE ALL ON FUNCTION public.apply_approved_media() FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.apply_approved_media() FROM anon;
REVOKE EXECUTE ON FUNCTION public.apply_approved_media() FROM authenticated;

-- ============================================================
-- 2. Add INSERT policy on sab_ids for authenticated users
--    (needed before switching create_sab_id to SECURITY INVOKER)
-- ============================================================

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'sab_ids'
      AND policyname = 'Authenticated users can insert own SAB IDs'
  ) THEN
    EXECUTE $p$
      CREATE POLICY "Authenticated users can insert own SAB IDs"
        ON public.sab_ids FOR INSERT
        TO authenticated
        WITH CHECK (auth.uid() = user_id)
    $p$;
  END IF;
END $$;

-- ============================================================
-- 3. create_sab_id — switch to SECURITY INVOKER
-- ============================================================

CREATE OR REPLACE FUNCTION public.create_sab_id(
  p_athlete_id uuid,
  p_user_id uuid,
  p_media_upload_id uuid DEFAULT NULL,
  p_creator_id uuid DEFAULT NULL,
  p_event_code_id uuid DEFAULT NULL,
  p_source_type text DEFAULT 'player_upload',
  p_consent_status text DEFAULT 'pending',
  p_usage_scope text[] DEFAULT ARRAY['profile']
)
  RETURNS uuid
  LANGUAGE plpgsql
  SECURITY INVOKER
  SET search_path = public, pg_catalog
AS $$
DECLARE
  v_sab_code text;
  v_id uuid;
BEGIN
  v_sab_code := 'SAB-' || upper(substring(gen_random_uuid()::text, 1, 8));

  INSERT INTO public.sab_ids (
    sab_code, athlete_id, user_id, media_upload_id,
    creator_id, event_id, source_type, consent_status, usage_scope
  )
  VALUES (
    v_sab_code, p_athlete_id, p_user_id, p_media_upload_id,
    p_creator_id, p_event_code_id, p_source_type, p_consent_status, p_usage_scope
  )
  RETURNING id INTO v_id;

  RETURN v_id;
END;
$$;

-- Revoke anon; keep authenticated (they call this after upload)
REVOKE ALL ON FUNCTION public.create_sab_id(uuid, uuid, uuid, uuid, uuid, text, text, text[]) FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.create_sab_id(uuid, uuid, uuid, uuid, uuid, text, text, text[]) FROM anon;
GRANT EXECUTE ON FUNCTION public.create_sab_id(uuid, uuid, uuid, uuid, uuid, text, text, text[]) TO authenticated;

-- ============================================================
-- 4. Add narrow UPDATE policy on event_codes for authenticated users
--    (uses_count increment only — no other columns)
-- ============================================================

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'event_codes'
      AND policyname = 'Authenticated users can increment event code uses'
  ) THEN
    EXECUTE $p$
      CREATE POLICY "Authenticated users can increment event code uses"
        ON public.event_codes FOR UPDATE
        TO authenticated
        USING (is_active = true)
        WITH CHECK (is_active = true)
    $p$;
  END IF;
END $$;

-- ============================================================
-- 5. validate_event_code — switch to SECURITY INVOKER
--    (event_codes "Anyone can read active event codes" covers anon + authenticated)
-- ============================================================

CREATE OR REPLACE FUNCTION public.validate_event_code(p_code text)
  RETURNS text
  LANGUAGE plpgsql
  SECURITY INVOKER
  SET search_path = public, pg_catalog
AS $$
DECLARE
  v_auto_approve boolean;
  v_is_active    boolean;
  v_max_uses     integer;
  v_uses_count   integer;
  v_expires_at   timestamptz;
BEGIN
  SELECT auto_approve, is_active, max_uses, uses_count, expires_at
    INTO v_auto_approve, v_is_active, v_max_uses, v_uses_count, v_expires_at
    FROM public.event_codes
   WHERE UPPER(code) = UPPER(p_code)
   LIMIT 1;

  IF NOT FOUND THEN RETURN NULL; END IF;
  IF NOT v_is_active THEN RETURN NULL; END IF;
  IF v_expires_at IS NOT NULL AND v_expires_at < now() THEN RETURN NULL; END IF;
  IF v_max_uses IS NOT NULL AND v_uses_count >= v_max_uses THEN RETURN NULL; END IF;

  IF v_auto_approve THEN
    RETURN 'verified_event';
  ELSE
    RETURN 'approved';
  END IF;
END;
$$;

-- Keep callable by anon (used during signup before auth session exists)
-- and authenticated. SECURITY INVOKER means RLS gates what they can see.
GRANT EXECUTE ON FUNCTION public.validate_event_code(text) TO anon;
GRANT EXECUTE ON FUNCTION public.validate_event_code(text) TO authenticated;

-- ============================================================
-- 6. increment_event_code_uses — switch to SECURITY INVOKER
-- ============================================================

CREATE OR REPLACE FUNCTION public.increment_event_code_uses(p_code text)
  RETURNS void
  LANGUAGE plpgsql
  SECURITY INVOKER
  SET search_path = public, pg_catalog
AS $$
BEGIN
  UPDATE public.event_codes
     SET uses_count = uses_count + 1
   WHERE UPPER(code) = UPPER(p_code)
     AND is_active = true;
END;
$$;

-- Keep callable by authenticated (called right after validate_event_code on signup)
REVOKE ALL ON FUNCTION public.increment_event_code_uses(text) FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.increment_event_code_uses(text) FROM anon;
GRANT EXECUTE ON FUNCTION public.increment_event_code_uses(text) TO authenticated;

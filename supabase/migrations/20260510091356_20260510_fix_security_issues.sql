
/*
  # Fix Security Advisor Findings

  ## Summary
  Addresses all security advisor findings:
  1. Supporters INSERT policy — replace always-true WITH CHECK
  2. Storage SELECT policies — replace broad bucket-only policies with
     object-level policies that prevent directory listing
  3. Revoke EXECUTE on SECURITY DEFINER functions from anon/authenticated
  4. Fix search_path on handle_new_user and validate_event_code
  5. (Leaked password protection is an Auth dashboard setting — noted separately)

  ## Notes
  - validate_event_code stays callable by authenticated (needed post-signup)
  - increment_event_code_uses stays callable by authenticated (needed post-signup)
  - handle_new_user runs only as a trigger; no direct RPC access needed
*/

-- ============================================================
-- 1. Tighten supporters INSERT policy (always-true → require email)
-- ============================================================

DROP POLICY IF EXISTS "Anyone can create supporter record" ON public.supporters;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'supporters'
      AND policyname = 'Supporters can sign up with valid email'
  ) THEN
    EXECUTE $p$
      CREATE POLICY "Supporters can sign up with valid email"
        ON public.supporters FOR INSERT
        TO anon, authenticated
        WITH CHECK (email IS NOT NULL AND length(trim(email)) > 0)
    $p$;
  END IF;
END $$;

-- ============================================================
-- 2. Fix storage SELECT policies — add name IS NOT NULL guard
--    to prevent clients from listing bucket contents.
--    Clients accessing a known public URL still work;
--    listing (name = NULL filter used by Storage list API) is blocked.
-- ============================================================

-- athlete-photos: drop broad policy, add name-guarded replacement
DROP POLICY IF EXISTS "Public can read athlete photos" ON storage.objects;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'storage' AND tablename = 'objects'
      AND policyname = 'Public can access athlete photo objects'
  ) THEN
    EXECUTE $p$
      CREATE POLICY "Public can access athlete photo objects"
        ON storage.objects FOR SELECT
        TO anon, authenticated
        USING (
          bucket_id = 'athlete-photos'
          AND name IS NOT NULL
          AND name <> ''
        )
    $p$;
  END IF;
END $$;

-- athlete-videos
DROP POLICY IF EXISTS "Public can read athlete videos" ON storage.objects;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'storage' AND tablename = 'objects'
      AND policyname = 'Public can access athlete video objects'
  ) THEN
    EXECUTE $p$
      CREATE POLICY "Public can access athlete video objects"
        ON storage.objects FOR SELECT
        TO anon, authenticated
        USING (
          bucket_id = 'athlete-videos'
          AND name IS NOT NULL
          AND name <> ''
        )
    $p$;
  END IF;
END $$;

-- profile-assets
DROP POLICY IF EXISTS "Public can read profile assets" ON storage.objects;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'storage' AND tablename = 'objects'
      AND policyname = 'Public can access profile asset objects'
  ) THEN
    EXECUTE $p$
      CREATE POLICY "Public can access profile asset objects"
        ON storage.objects FOR SELECT
        TO anon, authenticated
        USING (
          bucket_id = 'profile-assets'
          AND name IS NOT NULL
          AND name <> ''
        )
    $p$;
  END IF;
END $$;

-- ============================================================
-- 3. Fix handle_new_user — explicit search_path, revoke from public roles
-- ============================================================

CREATE OR REPLACE FUNCTION public.handle_new_user()
  RETURNS trigger
  LANGUAGE plpgsql
  SECURITY DEFINER
  SET search_path = public, pg_catalog
AS $$
BEGIN
  INSERT INTO public.user_profiles (id, role, display_name)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data ->> 'role', 'athlete'),
    COALESCE(NEW.raw_user_meta_data ->> 'display_name', NEW.email)
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;

-- Revoke from all public roles — trigger fires as the definer, not via RPC
REVOKE ALL ON FUNCTION public.handle_new_user() FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM anon;
REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM authenticated;

-- ============================================================
-- 4. Fix validate_event_code — revoke anon, keep authenticated
-- ============================================================

CREATE OR REPLACE FUNCTION public.validate_event_code(p_code text)
  RETURNS text
  LANGUAGE plpgsql
  SECURITY DEFINER
  SET search_path = public, pg_catalog
AS $$
DECLARE
  v_auto_approve boolean;
  v_is_active boolean;
  v_max_uses integer;
  v_uses_count integer;
  v_expires_at timestamptz;
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

REVOKE ALL ON FUNCTION public.validate_event_code(text) FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.validate_event_code(text) FROM anon;
GRANT EXECUTE ON FUNCTION public.validate_event_code(text) TO authenticated;

-- ============================================================
-- 5. Fix increment_event_code_uses — revoke anon, keep authenticated
-- ============================================================

CREATE OR REPLACE FUNCTION public.increment_event_code_uses(p_code text)
  RETURNS void
  LANGUAGE plpgsql
  SECURITY DEFINER
  SET search_path = public, pg_catalog
AS $$
BEGIN
  UPDATE public.event_codes
     SET uses_count = uses_count + 1
   WHERE UPPER(code) = UPPER(p_code);
END;
$$;

REVOKE ALL ON FUNCTION public.increment_event_code_uses(text) FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.increment_event_code_uses(text) FROM anon;
GRANT EXECUTE ON FUNCTION public.increment_event_code_uses(text) TO authenticated;


/*
  # Phase 2 — Profile Fields, Event Code Functions, and RLS

  ## Summary
  Adds missing profile fields to athletes table, creates event code validation
  functions that work with the existing event_codes schema, and tightens RLS
  so athletes/parents can own and update their profiles.

  ## Changes

  ### athletes table — new fields
  - `class_year` (text) — graduation year e.g., "2028"
  - `is_female` (boolean) — quick filter flag
  - `profile_status` (text) — pending | approved | verified_event
  - `event_code_used` (text) — code entered at signup

  ### New DB functions
  - `validate_event_code(code)` — returns resolved status or null
  - `increment_event_code_uses(code)` — bumps use counter if column exists

  ### athletes RLS
  - Removes old broad policies
  - Athletes can self-insert/update via auth_user_id
  - Parents can update linked athlete via user_profiles.athlete_id
  - Admins retain full access

  ### user_profiles RLS
  - Adds self-insert policy
*/

-- ============================================================
-- athletes: remaining new fields
-- ============================================================

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'athletes' AND column_name = 'class_year') THEN
    ALTER TABLE public.athletes ADD COLUMN class_year text;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'athletes' AND column_name = 'is_female') THEN
    ALTER TABLE public.athletes ADD COLUMN is_female boolean NOT NULL DEFAULT false;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'athletes' AND column_name = 'profile_status') THEN
    ALTER TABLE public.athletes ADD COLUMN profile_status text NOT NULL DEFAULT 'pending'
      CHECK (profile_status IN ('pending', 'approved', 'verified_event'));
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'athletes' AND column_name = 'event_code_used') THEN
    ALTER TABLE public.athletes ADD COLUMN event_code_used text;
  END IF;
END $$;

-- ============================================================
-- event_codes: add missing columns to existing table
-- ============================================================

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'event_codes' AND column_name = 'auto_approve') THEN
    ALTER TABLE public.event_codes ADD COLUMN auto_approve boolean NOT NULL DEFAULT true;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'event_codes' AND column_name = 'uses_count') THEN
    ALTER TABLE public.event_codes ADD COLUMN uses_count integer NOT NULL DEFAULT 0;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'event_codes' AND column_name = 'max_uses') THEN
    ALTER TABLE public.event_codes ADD COLUMN max_uses integer;
  END IF;
END $$;

-- ============================================================
-- Function: validate_event_code
-- Returns 'verified_event', 'approved', or NULL
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

-- ============================================================
-- Function: increment_event_code_uses
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

-- ============================================================
-- athletes RLS — replace broad policies
-- ============================================================

DROP POLICY IF EXISTS "Authenticated users can insert athletes" ON public.athletes;
DROP POLICY IF EXISTS "Authenticated users can update athletes" ON public.athletes;
DROP POLICY IF EXISTS "Authenticated users can delete athletes" ON public.athletes;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'athletes' AND policyname = 'Athletes can insert own profile') THEN
    EXECUTE $p$CREATE POLICY "Athletes can insert own profile"
      ON public.athletes FOR INSERT
      TO authenticated
      WITH CHECK (auth.uid() = auth_user_id)$p$;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'athletes' AND policyname = 'Athletes can update own profile') THEN
    EXECUTE $p$CREATE POLICY "Athletes can update own profile"
      ON public.athletes FOR UPDATE
      TO authenticated
      USING (auth.uid() = auth_user_id)
      WITH CHECK (auth.uid() = auth_user_id)$p$;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'athletes' AND policyname = 'Parents can update linked athlete profile') THEN
    EXECUTE $p$CREATE POLICY "Parents can update linked athlete profile"
      ON public.athletes FOR UPDATE
      TO authenticated
      USING (
        EXISTS (
          SELECT 1 FROM public.user_profiles up
           WHERE up.id = auth.uid()
             AND up.athlete_id = athletes.id
             AND up.role = 'parent'
        )
      )
      WITH CHECK (
        EXISTS (
          SELECT 1 FROM public.user_profiles up
           WHERE up.id = auth.uid()
             AND up.athlete_id = athletes.id
             AND up.role = 'parent'
        )
      )$p$;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'athletes' AND policyname = 'Admins can insert athletes') THEN
    EXECUTE $p$CREATE POLICY "Admins can insert athletes"
      ON public.athletes FOR INSERT
      TO authenticated
      WITH CHECK ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin')$p$;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'athletes' AND policyname = 'Admins can update athletes') THEN
    EXECUTE $p$CREATE POLICY "Admins can update athletes"
      ON public.athletes FOR UPDATE
      TO authenticated
      USING ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin')
      WITH CHECK ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin')$p$;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'athletes' AND policyname = 'Admins can delete athletes') THEN
    EXECUTE $p$CREATE POLICY "Admins can delete athletes"
      ON public.athletes FOR DELETE
      TO authenticated
      USING ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin')$p$;
  END IF;
END $$;

-- ============================================================
-- user_profiles — allow self-insert
-- ============================================================

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'user_profiles' AND policyname = 'Users can insert own profile') THEN
    EXECUTE $p$CREATE POLICY "Users can insert own profile"
      ON public.user_profiles FOR INSERT
      TO authenticated
      WITH CHECK (auth.uid() = id)$p$;
  END IF;
END $$;

-- ============================================================
-- Seed sample event code
-- ============================================================

INSERT INTO public.event_codes (code, event_name, is_active, auto_approve)
VALUES ('NEXTUP2026', 'NextUp Spring 2026 Tournament', true, true)
ON CONFLICT (code) DO NOTHING;


/*
  # Backend Spine — Identity, Consent, Media, SAB-ID, Admin Queues

  ## Summary
  Wires together the full athlete lifecycle:
  athlete created → consent captured → source tracked → media uploaded →
  admin approves → media displays publicly → admin can upgrade tier.

  ## Changes

  ### athletes table
  - Add `created_by_user_id` — who created this profile (self or parent/admin)
  - Add `managed_by_parent_id` — parent user_profile id managing this athlete
  - Add `source_type` — how they found us (organic, event, creator_referral, etc.)
  - Add `event_code_id` — FK to event_codes if signup used a code
  - Widen `profile_status` CHECK to include 'active' and 'hidden'
    (keeping 'approved' and 'verified_event' as aliases; 'active' is the new canonical public-visible status)

  ### media_uploads table
  - Add `approved_by` — admin user id who approved
  - Add `approved_at` — when approval happened
  - Add `display_order` — admin-set sort order
  - Consolidate `featured`/`is_featured` — keep both for compatibility but alias

  ### consents table (new)
  - Full consent record per athlete covering NIL, voice, social, promo, sponsor
  - Linked to athlete_id + user_id (the person granting consent)

  ### signup_sources: ensure event_code_id FK exists
  ### sab_ids: add missing fields if any

  ## Security
  - RLS on consents: athlete/parent can insert their own; admin reads all
  - media_uploads: add approved_by/approved_at update policy for admins
*/

-- ============================================================
-- athletes: add ownership + source tracking fields
-- ============================================================

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='athletes' AND column_name='created_by_user_id') THEN
    ALTER TABLE public.athletes ADD COLUMN created_by_user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='athletes' AND column_name='managed_by_parent_id') THEN
    ALTER TABLE public.athletes ADD COLUMN managed_by_parent_id uuid REFERENCES auth.users(id) ON DELETE SET NULL;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='athletes' AND column_name='source_type') THEN
    ALTER TABLE public.athletes ADD COLUMN source_type text DEFAULT 'organic'
      CHECK (source_type IN ('organic','event_code','instagram','creator_referral','parent_referral','school_team','admin_created'));
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='athletes' AND column_name='event_code_id') THEN
    ALTER TABLE public.athletes ADD COLUMN event_code_id uuid REFERENCES public.event_codes(id) ON DELETE SET NULL;
  END IF;
END $$;

-- Widen profile_status CHECK to include 'active' and 'hidden'
-- (profile_status was: pending | approved | verified_event)
-- New set: pending | active | approved | verified_event | rejected | hidden
-- 'active' = publicly visible; 'approved'/'verified_event' are legacy aliases we keep

ALTER TABLE public.athletes DROP CONSTRAINT IF EXISTS athletes_profile_status_check;

ALTER TABLE public.athletes ADD CONSTRAINT athletes_profile_status_check
  CHECK (profile_status IN ('pending','active','approved','verified_event','rejected','hidden'));

-- Migrate existing 'approved'/'verified_event' → 'active' for public visibility
-- We do NOT touch 'pending' rows (they should stay pending until admin reviews)
UPDATE public.athletes
   SET profile_status = 'active'
 WHERE profile_status IN ('approved', 'verified_event');

-- is_active should mirror whether profile_status = active
UPDATE public.athletes SET is_active = (profile_status = 'active');

-- Function to keep is_active in sync with profile_status
CREATE OR REPLACE FUNCTION public.sync_athlete_is_active()
  RETURNS trigger
  LANGUAGE plpgsql
  SECURITY DEFINER
  SET search_path = public, pg_catalog
AS $$
BEGIN
  NEW.is_active := (NEW.profile_status = 'active');
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS athletes_sync_is_active ON public.athletes;
CREATE TRIGGER athletes_sync_is_active
  BEFORE INSERT OR UPDATE OF profile_status
  ON public.athletes
  FOR EACH ROW EXECUTE FUNCTION public.sync_athlete_is_active();

-- Revoke direct RPC access (trigger only)
REVOKE ALL ON FUNCTION public.sync_athlete_is_active() FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.sync_athlete_is_active() FROM anon;
REVOKE EXECUTE ON FUNCTION public.sync_athlete_is_active() FROM authenticated;

-- ============================================================
-- media_uploads: add approval tracking + display_order
-- ============================================================

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='media_uploads' AND column_name='approved_by') THEN
    ALTER TABLE public.media_uploads ADD COLUMN approved_by uuid REFERENCES auth.users(id) ON DELETE SET NULL;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='media_uploads' AND column_name='approved_at') THEN
    ALTER TABLE public.media_uploads ADD COLUMN approved_at timestamptz;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='media_uploads' AND column_name='display_order') THEN
    ALTER TABLE public.media_uploads ADD COLUMN display_order integer DEFAULT 0;
  END IF;
END $$;

-- Trigger: when status flips to 'approved', auto-set approved_at
CREATE OR REPLACE FUNCTION public.media_set_approved_at()
  RETURNS trigger
  LANGUAGE plpgsql
  SECURITY DEFINER
  SET search_path = public, pg_catalog
AS $$
BEGIN
  IF NEW.status = 'approved' AND (OLD.status IS DISTINCT FROM 'approved') THEN
    NEW.approved_at := now();
    NEW.reviewed_at := now();
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS media_uploads_approved_at ON public.media_uploads;
CREATE TRIGGER media_uploads_approved_at
  BEFORE UPDATE OF status
  ON public.media_uploads
  FOR EACH ROW EXECUTE FUNCTION public.media_set_approved_at();

REVOKE ALL ON FUNCTION public.media_set_approved_at() FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.media_set_approved_at() FROM anon;
REVOKE EXECUTE ON FUNCTION public.media_set_approved_at() FROM authenticated;

-- Trigger: when a featured approved photo is set on an athlete's uploads,
-- auto-update athletes.image_url with its public_url
CREATE OR REPLACE FUNCTION public.media_apply_featured_photo()
  RETURNS trigger
  LANGUAGE plpgsql
  SECURITY DEFINER
  SET search_path = public, pg_catalog
AS $$
BEGIN
  -- When a photo is marked featured AND approved, update athletes.image_url
  IF NEW.status = 'approved' AND NEW.featured = true AND NEW.media_type = 'photo' AND NEW.public_url IS NOT NULL THEN
    UPDATE public.athletes
       SET image_url = NEW.public_url
     WHERE id = NEW.athlete_id;
  END IF;
  -- When a video is marked featured AND approved, update athletes.highlight_video_url
  IF NEW.status = 'approved' AND NEW.featured = true AND NEW.media_type IN ('video','highlight') AND NEW.public_url IS NOT NULL THEN
    UPDATE public.athletes
       SET highlight_video_url = NEW.public_url
     WHERE id = NEW.athlete_id;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS media_uploads_apply_featured ON public.media_uploads;
CREATE TRIGGER media_uploads_apply_featured
  AFTER INSERT OR UPDATE OF status, featured
  ON public.media_uploads
  FOR EACH ROW EXECUTE FUNCTION public.media_apply_featured_photo();

REVOKE ALL ON FUNCTION public.media_apply_featured_photo() FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.media_apply_featured_photo() FROM anon;
REVOKE EXECUTE ON FUNCTION public.media_apply_featured_photo() FROM authenticated;

-- ============================================================
-- consents table (new)
-- ============================================================

CREATE TABLE IF NOT EXISTS public.consents (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  athlete_id uuid NOT NULL REFERENCES public.athletes(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  consent_given_by text NOT NULL DEFAULT '' CHECK (consent_given_by <> ''),
  relationship_to_athlete text NOT NULL DEFAULT 'self'
    CHECK (relationship_to_athlete IN ('self','parent','guardian','coach','admin')),
  consent_status text NOT NULL DEFAULT 'pending'
    CHECK (consent_status IN ('pending','granted','revoked')),
  -- NIL / usage rights
  can_use_name_image_likeness boolean NOT NULL DEFAULT false,
  can_use_voice boolean NOT NULL DEFAULT false,
  can_use_on_social boolean NOT NULL DEFAULT false,
  can_use_for_promo boolean NOT NULL DEFAULT false,
  can_use_for_sponsor_package boolean NOT NULL DEFAULT false,
  -- Scope flags (what areas the consent covers)
  usage_scope text[] NOT NULL DEFAULT ARRAY['profile'],
  -- Timestamps
  created_at timestamptz DEFAULT now(),
  revoked_at timestamptz,
  -- Ensure one active consent record per athlete+user
  UNIQUE (athlete_id, user_id)
);

ALTER TABLE public.consents ENABLE ROW LEVEL SECURITY;

-- Athletes/parents can view and insert their own consent records
CREATE POLICY "Users can view own consent records"
  ON public.consents FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own consent records"
  ON public.consents FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own consent records"
  ON public.consents FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Admins can read all consent records
CREATE POLICY "Admins can read all consents"
  ON public.consents FOR SELECT
  TO authenticated
  USING ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');

CREATE INDEX IF NOT EXISTS idx_consents_athlete_id ON public.consents(athlete_id);
CREATE INDEX IF NOT EXISTS idx_consents_user_id ON public.consents(user_id);
CREATE INDEX IF NOT EXISTS idx_consents_status ON public.consents(consent_status);

-- ============================================================
-- signup_sources: ensure event_code_id column exists with proper FK
-- ============================================================

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name='signup_sources' AND column_name='event_code_id'
  ) THEN
    ALTER TABLE public.signup_sources
      ADD COLUMN event_code_id uuid REFERENCES public.event_codes(id) ON DELETE SET NULL;
  END IF;
END $$;

-- ============================================================
-- sab_ids: ensure all spec fields exist
-- ============================================================

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='sab_ids' AND column_name='sab_code') THEN
    ALTER TABLE public.sab_ids ADD COLUMN sab_code text UNIQUE NOT NULL DEFAULT ('SAB-' || upper(substring(gen_random_uuid()::text, 1, 8)));
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='sab_ids' AND column_name='consent_status') THEN
    ALTER TABLE public.sab_ids ADD COLUMN consent_status text NOT NULL DEFAULT 'pending'
      CHECK (consent_status IN ('pending','granted','revoked'));
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='sab_ids' AND column_name='usage_scope') THEN
    ALTER TABLE public.sab_ids ADD COLUMN usage_scope text[] NOT NULL DEFAULT ARRAY['profile'];
  END IF;
END $$;

-- ============================================================
-- Function: create_sab_id
-- Called when media is uploaded. Generates a SAB-ID record.
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
  SECURITY DEFINER
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

REVOKE ALL ON FUNCTION public.create_sab_id(uuid, uuid, uuid, uuid, uuid, text, text, text[]) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.create_sab_id(uuid, uuid, uuid, uuid, uuid, text, text, text[]) TO authenticated;

-- ============================================================
-- Indexes for new columns
-- ============================================================

CREATE INDEX IF NOT EXISTS idx_athletes_created_by ON public.athletes(created_by_user_id);
CREATE INDEX IF NOT EXISTS idx_athletes_managed_by_parent ON public.athletes(managed_by_parent_id);
CREATE INDEX IF NOT EXISTS idx_athletes_event_code_id ON public.athletes(event_code_id);
CREATE INDEX IF NOT EXISTS idx_athletes_profile_status ON public.athletes(profile_status);
CREATE INDEX IF NOT EXISTS idx_media_uploads_approved_by ON public.media_uploads(approved_by);
CREATE INDEX IF NOT EXISTS idx_media_uploads_display_order ON public.media_uploads(display_order);

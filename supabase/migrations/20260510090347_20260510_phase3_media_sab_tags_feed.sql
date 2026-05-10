
/*
  # Phase 3 — Media Workflow, SAB-ID, Premium Profiles, Visibility Tags, Live Feed

  ## Summary
  Extends the platform with:
  - Profile tiers (basic / premium) on the athletes table
  - SAB-ID tracking columns on media_uploads (source tracking, consent, usage scope)
  - Visibility tags system (master tag list + junction table)
  - Live feed view over approved media
  - Event code source types for attribution

  ## Changes

  ### athletes
  - `profile_tier` (text, default 'basic') — basic | premium

  ### media_uploads — SAB-ID columns
  - `source_type` (text) — athlete_upload | creator_upload | event_upload | admin_upload
  - `creator_id` (uuid) — optional creator who uploaded
  - `event_code` (text) — event/tournament code if applicable
  - `consent_status` (text, default 'implied') — implied | signed | revoked
  - `usage_scope` (text, default 'platform') — platform | marketing | public

  ### visibility_tags table (new)
  - Master list of tags: leadership, hustle, communication, composure, confidence, teamwork, coachable, energy

  ### athlete_tags junction table (new)
  - athlete_id + tag_id — admin-assigned tags on athlete profiles

  ### media_tags junction table (new)
  - media_upload_id + tag_id — admin-assigned tags on media items

  ### live_feed_items view (new)
  - Approved media joined with athlete info and tags for the public feed
*/

-- ============================================================
-- athletes: profile_tier
-- ============================================================

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'athletes' AND column_name = 'profile_tier') THEN
    ALTER TABLE public.athletes ADD COLUMN profile_tier text NOT NULL DEFAULT 'basic'
      CHECK (profile_tier IN ('basic', 'premium'));
  END IF;
END $$;

-- Mark existing athletes with rich content as premium (Jacob Fouse)
UPDATE public.athletes
   SET profile_tier = 'premium'
 WHERE slug = 'jacob-fouse'
    OR slug = 'jacob-f';

-- ============================================================
-- media_uploads: SAB-ID tracking columns
-- ============================================================

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'media_uploads' AND column_name = 'source_type') THEN
    ALTER TABLE public.media_uploads ADD COLUMN source_type text NOT NULL DEFAULT 'athlete_upload'
      CHECK (source_type IN ('athlete_upload', 'creator_upload', 'event_upload', 'admin_upload'));
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'media_uploads' AND column_name = 'creator_id') THEN
    ALTER TABLE public.media_uploads ADD COLUMN creator_id uuid REFERENCES auth.users(id) ON DELETE SET NULL;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'media_uploads' AND column_name = 'event_code') THEN
    ALTER TABLE public.media_uploads ADD COLUMN event_code text;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'media_uploads' AND column_name = 'consent_status') THEN
    ALTER TABLE public.media_uploads ADD COLUMN consent_status text NOT NULL DEFAULT 'implied'
      CHECK (consent_status IN ('implied', 'signed', 'revoked'));
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'media_uploads' AND column_name = 'usage_scope') THEN
    ALTER TABLE public.media_uploads ADD COLUMN usage_scope text NOT NULL DEFAULT 'platform'
      CHECK (usage_scope IN ('platform', 'marketing', 'public'));
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'media_uploads' AND column_name = 'featured') THEN
    ALTER TABLE public.media_uploads ADD COLUMN featured boolean NOT NULL DEFAULT false;
  END IF;
END $$;

-- ============================================================
-- visibility_tags: master tag list
-- ============================================================

CREATE TABLE IF NOT EXISTS public.visibility_tags (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text UNIQUE NOT NULL,
  label text NOT NULL,
  category text NOT NULL DEFAULT 'character',
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE public.visibility_tags ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read visibility tags"
  ON public.visibility_tags FOR SELECT
  TO anon, authenticated
  USING (true);

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'visibility_tags' AND policyname = 'Admins can manage visibility tags') THEN
    EXECUTE $p$CREATE POLICY "Admins can manage visibility tags"
      ON public.visibility_tags FOR INSERT
      TO authenticated
      WITH CHECK ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin')$p$;
  END IF;
END $$;

-- Seed default tags
INSERT INTO public.visibility_tags (slug, label, category, sort_order) VALUES
  ('leadership',    'Leadership',    'character', 1),
  ('hustle',        'Hustle',        'character', 2),
  ('communication', 'Communication', 'character', 3),
  ('composure',     'Composure',     'character', 4),
  ('confidence',    'Confidence',    'character', 5),
  ('teamwork',      'Teamwork',      'character', 6),
  ('coachable',     'Coachable',     'character', 7),
  ('energy',        'Energy',        'character', 8)
ON CONFLICT (slug) DO NOTHING;

-- ============================================================
-- athlete_tags: admin-assigned tags on athlete profiles
-- ============================================================

CREATE TABLE IF NOT EXISTS public.athlete_tags (
  athlete_id uuid NOT NULL REFERENCES public.athletes(id) ON DELETE CASCADE,
  tag_id     uuid NOT NULL REFERENCES public.visibility_tags(id) ON DELETE CASCADE,
  assigned_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  assigned_at timestamptz DEFAULT now(),
  PRIMARY KEY (athlete_id, tag_id)
);

ALTER TABLE public.athlete_tags ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read athlete tags"
  ON public.athlete_tags FOR SELECT
  TO anon, authenticated
  USING (true);

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'athlete_tags' AND policyname = 'Admins can manage athlete tags') THEN
    EXECUTE $p$CREATE POLICY "Admins can manage athlete tags"
      ON public.athlete_tags FOR INSERT
      TO authenticated
      WITH CHECK ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin')$p$;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'athlete_tags' AND policyname = 'Admins can delete athlete tags') THEN
    EXECUTE $p$CREATE POLICY "Admins can delete athlete tags"
      ON public.athlete_tags FOR DELETE
      TO authenticated
      USING ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin')$p$;
  END IF;
END $$;

-- ============================================================
-- media_tags: admin-assigned tags on media items
-- ============================================================

CREATE TABLE IF NOT EXISTS public.media_tags (
  media_upload_id uuid NOT NULL REFERENCES public.media_uploads(id) ON DELETE CASCADE,
  tag_id          uuid NOT NULL REFERENCES public.visibility_tags(id) ON DELETE CASCADE,
  assigned_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  assigned_at timestamptz DEFAULT now(),
  PRIMARY KEY (media_upload_id, tag_id)
);

ALTER TABLE public.media_tags ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read media tags"
  ON public.media_tags FOR SELECT
  TO anon, authenticated
  USING (true);

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'media_tags' AND policyname = 'Admins can manage media tags') THEN
    EXECUTE $p$CREATE POLICY "Admins can manage media tags"
      ON public.media_tags FOR INSERT
      TO authenticated
      WITH CHECK ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin')$p$;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'media_tags' AND policyname = 'Admins can delete media tags') THEN
    EXECUTE $p$CREATE POLICY "Admins can delete media tags"
      ON public.media_tags FOR DELETE
      TO authenticated
      USING ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin')$p$;
  END IF;
END $$;

-- ============================================================
-- Indexes
-- ============================================================

CREATE INDEX IF NOT EXISTS idx_media_uploads_source_type ON public.media_uploads(source_type);
CREATE INDEX IF NOT EXISTS idx_media_uploads_featured ON public.media_uploads(featured) WHERE featured = true;
CREATE INDEX IF NOT EXISTS idx_athlete_tags_athlete_id ON public.athlete_tags(athlete_id);
CREATE INDEX IF NOT EXISTS idx_media_tags_media_upload_id ON public.media_tags(media_upload_id);
CREATE INDEX IF NOT EXISTS idx_athletes_profile_tier ON public.athletes(profile_tier);

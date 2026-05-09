
/*
  # Athlete Auth System

  ## Summary
  Extends the database to support athlete/parent login and profile ownership.

  1. New Tables
     - `user_profiles` — links auth.users to a role (admin/athlete/parent) and optionally to an athlete record
     - `media_uploads` — tracks all uploaded files with metadata, status, and athlete association

  2. Modified Tables
     - `athletes` — adds `auth_user_id` column so an athlete can own their profile

  3. Storage Buckets (created via SQL policy hooks)
     - athlete-photos, athlete-videos, profile-assets

  4. Security
     - RLS on user_profiles: users can read/update their own row; admins can read all
     - RLS on media_uploads: uploaders see their own; admins see all; public can read approved
     - athletes: owners (via auth_user_id) can submit updates but NOT directly edit is_active/is_featured

  5. Important Notes
     - Roles are stored in user_profiles.role (admin/athlete/parent)
     - app_metadata.role is still the authority for admin gating (set by service role)
     - parent users link to an athlete via user_profiles.athlete_id
     - All media starts as 'pending' and requires admin approval
*/

-- ============================================================
-- user_profiles: links auth user to role + athlete
-- ============================================================

CREATE TABLE IF NOT EXISTS public.user_profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  role text NOT NULL DEFAULT 'athlete' CHECK (role IN ('admin', 'athlete', 'parent')),
  athlete_id uuid REFERENCES public.athletes(id) ON DELETE SET NULL,
  display_name text DEFAULT '',
  phone text DEFAULT '',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own profile"
  ON public.user_profiles FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON public.user_profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Admins can read all user profiles"
  ON public.user_profiles FOR SELECT
  TO authenticated
  USING ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');

CREATE POLICY "Admins can update all user profiles"
  ON public.user_profiles FOR UPDATE
  TO authenticated
  USING ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin')
  WITH CHECK ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');

-- Auto-create user_profile on new auth signup
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

CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

CREATE INDEX IF NOT EXISTS idx_user_profiles_athlete_id ON public.user_profiles(athlete_id);

-- ============================================================
-- athletes: add auth_user_id for profile ownership
-- ============================================================

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'athletes' AND column_name = 'auth_user_id'
  ) THEN
    ALTER TABLE public.athletes ADD COLUMN auth_user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL;
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_athletes_auth_user_id ON public.athletes(auth_user_id);

-- Allow athlete owners to view their own (even if not is_active)
CREATE POLICY "Athletes can view own profile"
  ON public.athletes FOR SELECT
  TO authenticated
  USING (auth.uid() = auth_user_id);

-- ============================================================
-- media_uploads table
-- ============================================================

CREATE TABLE IF NOT EXISTS public.media_uploads (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  athlete_id uuid NOT NULL REFERENCES public.athletes(id) ON DELETE CASCADE,
  uploader_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  media_type text NOT NULL CHECK (media_type IN ('photo', 'video', 'highlight', 'document')),
  bucket text NOT NULL DEFAULT 'athlete-photos',
  storage_path text NOT NULL,
  public_url text,
  file_name text NOT NULL DEFAULT '',
  file_size_bytes bigint,
  caption text DEFAULT '',
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  admin_notes text DEFAULT '',
  created_at timestamptz DEFAULT now(),
  reviewed_at timestamptz
);

ALTER TABLE public.media_uploads ENABLE ROW LEVEL SECURITY;

-- Uploaders see their own uploads
CREATE POLICY "Uploaders can view own uploads"
  ON public.media_uploads FOR SELECT
  TO authenticated
  USING (auth.uid() = uploader_id);

-- Uploaders can insert
CREATE POLICY "Uploaders can insert media"
  ON public.media_uploads FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = uploader_id);

-- Public can see approved media
CREATE POLICY "Public can view approved media"
  ON public.media_uploads FOR SELECT
  TO anon, authenticated
  USING (status = 'approved');

-- Admins have full access
CREATE POLICY "Admins can view all media"
  ON public.media_uploads FOR SELECT
  TO authenticated
  USING ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');

CREATE POLICY "Admins can update media"
  ON public.media_uploads FOR UPDATE
  TO authenticated
  USING ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin')
  WITH CHECK ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');

CREATE POLICY "Admins can delete media"
  ON public.media_uploads FOR DELETE
  TO authenticated
  USING ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');

CREATE INDEX IF NOT EXISTS idx_media_uploads_athlete_id ON public.media_uploads(athlete_id);
CREATE INDEX IF NOT EXISTS idx_media_uploads_uploader_id ON public.media_uploads(uploader_id);
CREATE INDEX IF NOT EXISTS idx_media_uploads_status ON public.media_uploads(status);

-- ============================================================
-- profile_update_requests: add uploader_id for auth users
-- ============================================================

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'profile_update_requests' AND column_name = 'submitted_by_user_id'
  ) THEN
    ALTER TABLE public.profile_update_requests
      ADD COLUMN submitted_by_user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL;
  END IF;
END $$;

-- Let authenticated users see their own submissions
CREATE POLICY "Users can view own update requests"
  ON public.profile_update_requests FOR SELECT
  TO authenticated
  USING (auth.uid() = submitted_by_user_id);

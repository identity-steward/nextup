
/*
  # Storage Buckets and Profile Update Fields

  ## Summary
  1. Creates Supabase Storage buckets for athlete media:
     - athlete-photos: public bucket for athlete profile photos
     - athlete-videos: public bucket for highlight reels and video clips
     - profile-assets: public bucket for misc profile assets

  2. Adds highlight_video_url and instagram/twitter handle fields to
     profile_update_requests if they don't already exist, so the athlete
     dashboard edit form can submit all the relevant fields.

  3. Adds instagram_handle and twitter_handle to profile_update_requests.
*/

-- ============================================================
-- Storage buckets
-- ============================================================

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES
  ('athlete-photos', 'athlete-photos', true, 52428800, ARRAY['image/jpeg','image/png','image/webp','image/gif']),
  ('athlete-videos', 'athlete-videos', true, 524288000, ARRAY['video/mp4','video/quicktime','video/webm','video/x-msvideo']),
  ('profile-assets', 'profile-assets', true, 52428800, ARRAY['image/jpeg','image/png','image/webp','application/pdf'])
ON CONFLICT (id) DO NOTHING;

-- Storage policies: authenticated users can upload to athlete buckets
CREATE POLICY "Authenticated users can upload athlete photos"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'athlete-photos');

CREATE POLICY "Authenticated users can upload athlete videos"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'athlete-videos');

CREATE POLICY "Authenticated users can upload profile assets"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'profile-assets');

-- Public read access for all athlete media buckets
CREATE POLICY "Public can read athlete photos"
  ON storage.objects FOR SELECT
  TO anon, authenticated
  USING (bucket_id = 'athlete-photos');

CREATE POLICY "Public can read athlete videos"
  ON storage.objects FOR SELECT
  TO anon, authenticated
  USING (bucket_id = 'athlete-videos');

CREATE POLICY "Public can read profile assets"
  ON storage.objects FOR SELECT
  TO anon, authenticated
  USING (bucket_id = 'profile-assets');

-- Uploaders can delete their own uploads
CREATE POLICY "Uploaders can delete own athlete photos"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (bucket_id = 'athlete-photos' AND auth.uid()::text = (storage.foldername(name))[1]);

-- ============================================================
-- profile_update_requests: add missing fields
-- ============================================================

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'profile_update_requests' AND column_name = 'highlight_video_url'
  ) THEN
    ALTER TABLE public.profile_update_requests ADD COLUMN highlight_video_url text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'profile_update_requests' AND column_name = 'instagram_handle'
  ) THEN
    ALTER TABLE public.profile_update_requests ADD COLUMN instagram_handle text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'profile_update_requests' AND column_name = 'twitter_handle'
  ) THEN
    ALTER TABLE public.profile_update_requests ADD COLUMN twitter_handle text;
  END IF;
END $$;

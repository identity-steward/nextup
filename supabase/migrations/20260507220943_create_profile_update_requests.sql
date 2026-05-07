/*
  # Create Profile Update Requests Table

  ## Purpose
  Stores pending athlete profile correction/update submissions from athletes,
  parents/guardians, coaches, or authorized representatives. Submissions are
  held for admin review and do NOT automatically update the public profile.

  ## New Tables
  - `profile_update_requests`
    - `id` (uuid, primary key)
    - `athlete_slug` (text) — identifies which athlete profile the request is for
    - `submitted_by_name` (text) — name of person submitting the request
    - `submitted_by_role` (text) — their relationship to the athlete
    - `submitted_by_email` (text) — contact email
    - `field_athlete_name` (text, nullable) — proposed athlete name correction
    - `field_class_year` (text, nullable)
    - `field_team` (text, nullable)
    - `field_position` (text, nullable)
    - `field_school` (text, nullable)
    - `field_city_state` (text, nullable)
    - `field_jersey_number` (text, nullable)
    - `field_height` (text, nullable)
    - `field_social_instagram` (text, nullable)
    - `field_social_twitter` (text, nullable)
    - `field_bio` (text, nullable)
    - `field_awards` (text, nullable)
    - `field_correction_notes` (text, nullable)
    - `status` (text) — 'pending' | 'approved' | 'rejected'
    - `admin_notes` (text, nullable) — for reviewer to leave notes
    - `created_at` (timestamptz)
    - `reviewed_at` (timestamptz, nullable)

  ## Security
  - RLS enabled (table locked by default)
  - INSERT allowed for everyone (public submissions, no auth required)
  - SELECT/UPDATE restricted to authenticated admins only (via app_metadata)
*/

CREATE TABLE IF NOT EXISTS profile_update_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  athlete_slug text NOT NULL DEFAULT '',
  submitted_by_name text NOT NULL DEFAULT '',
  submitted_by_role text NOT NULL DEFAULT '',
  submitted_by_email text NOT NULL DEFAULT '',
  field_athlete_name text,
  field_class_year text,
  field_team text,
  field_position text,
  field_school text,
  field_city_state text,
  field_jersey_number text,
  field_height text,
  field_social_instagram text,
  field_social_twitter text,
  field_bio text,
  field_awards text,
  field_correction_notes text,
  status text NOT NULL DEFAULT 'pending',
  admin_notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  reviewed_at timestamptz
);

ALTER TABLE profile_update_requests ENABLE ROW LEVEL SECURITY;

-- Anyone can submit a profile update request (no auth needed)
CREATE POLICY "Anyone can submit a profile update request"
  ON profile_update_requests
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

-- Only admins (app_metadata.role = 'admin') can read requests
CREATE POLICY "Admins can read profile update requests"
  ON profile_update_requests
  FOR SELECT
  TO authenticated
  USING (
    (auth.jwt() -> 'app_metadata' ->> 'role') = 'admin'
  );

-- Only admins can update request status
CREATE POLICY "Admins can update profile update request status"
  ON profile_update_requests
  FOR UPDATE
  TO authenticated
  USING (
    (auth.jwt() -> 'app_metadata' ->> 'role') = 'admin'
  )
  WITH CHECK (
    (auth.jwt() -> 'app_metadata' ->> 'role') = 'admin'
  );

-- Index for fast lookup by athlete and status
CREATE INDEX IF NOT EXISTS idx_profile_update_requests_athlete_slug
  ON profile_update_requests (athlete_slug);

CREATE INDEX IF NOT EXISTS idx_profile_update_requests_status
  ON profile_update_requests (status);

/*
  # Create Creators Table

  ## Summary
  Creates a comprehensive table for storing digital creator profiles who partner
  with NextUp Memphis to capture athlete highlights and content.

  ## New Tables
  
  ### `creators`
  - `id` (uuid, primary key) - Unique identifier
  - `first_name` (text) - Creator's first name
  - `last_name` (text, nullable) - Creator's last name (optional)
  - `display_name` (text) - Public display name
  - `tagline` (text) - Short descriptor line
  - `bio` (text) - Full biography
  - `location` (text) - City/region
  - `specialties` (text) - Main focus areas (e.g., "Highlight videos • Photos • Reels")
  - `primary_platform` (text) - Main platform (Instagram, TikTok, etc.)
  - `portfolio_url` (text, nullable) - Portfolio website URL
  - `instagram_handle` (text, nullable) - Instagram username
  - `image_url` (text, nullable) - Profile image URL
  - `cover_image_url` (text, nullable) - Cover/banner image URL
  - `service_game_highlights` (boolean, default true) - Offers game highlights
  - `service_season_package` (boolean, default true) - Offers season packages
  - `service_custom_story` (boolean, default true) - Offers custom stories
  - `is_featured` (boolean, default false) - Featured on homepage
  - `is_active` (boolean, default true) - Active profile
  - `slug` (text, unique) - URL-friendly identifier
  - `created_at` (timestamptz) - Creation timestamp
  - `updated_at` (timestamptz) - Last update timestamp

  ## Security
  - Enable RLS on creators table
  - Public read access for active creators
  - Only authenticated admins can insert/update/delete

  ## Notes
  - Creators are independent contractors
  - All bookings handled directly between families and creators
  - Showcased for exposure and opportunities
*/

-- Create creators table
CREATE TABLE IF NOT EXISTS creators (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  first_name text NOT NULL,
  last_name text,
  display_name text NOT NULL,
  tagline text NOT NULL,
  bio text NOT NULL,
  location text NOT NULL,
  specialties text NOT NULL,
  primary_platform text DEFAULT 'Instagram',
  portfolio_url text,
  instagram_handle text,
  image_url text,
  cover_image_url text,
  service_game_highlights boolean DEFAULT true,
  service_season_package boolean DEFAULT true,
  service_custom_story boolean DEFAULT true,
  is_featured boolean DEFAULT false,
  is_active boolean DEFAULT true,
  slug text UNIQUE NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE creators ENABLE ROW LEVEL SECURITY;

-- Policy: Anyone can view active creators
CREATE POLICY "Anyone can view active creators"
  ON creators
  FOR SELECT
  USING (is_active = true);

-- Policy: Only authenticated users can insert creators
CREATE POLICY "Authenticated users can insert creators"
  ON creators
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Policy: Only authenticated users can update creators
CREATE POLICY "Authenticated users can update creators"
  ON creators
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Policy: Only authenticated users can delete creators
CREATE POLICY "Authenticated users can delete creators"
  ON creators
  FOR DELETE
  TO authenticated
  USING (true);

-- Create index for slug lookups
CREATE INDEX IF NOT EXISTS creators_slug_idx ON creators(slug);

-- Create index for featured creators
CREATE INDEX IF NOT EXISTS creators_featured_idx ON creators(is_featured) WHERE is_featured = true;

-- Create index for active creators
CREATE INDEX IF NOT EXISTS creators_active_idx ON creators(is_active) WHERE is_active = true;

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_creators_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to automatically update updated_at
CREATE TRIGGER creators_updated_at_trigger
  BEFORE UPDATE ON creators
  FOR EACH ROW
  EXECUTE FUNCTION update_creators_updated_at();
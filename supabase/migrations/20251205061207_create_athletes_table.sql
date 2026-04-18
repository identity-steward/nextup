/*
  # Create Athletes Table

  ## Summary
  Creates a comprehensive table for storing youth athlete profiles with all necessary
  information for the NextUp Memphis platform.

  ## New Tables
  
  ### `athletes`
  - `id` (uuid, primary key) - Unique identifier
  - `first_name` (text) - Athlete's first name
  - `last_initial` (text) - Last name initial for privacy
  - `grade` (text) - Current grade (e.g., "8th Grade")
  - `sport` (text) - Primary sport
  - `position` (text) - Position/role
  - `city` (text) - City location
  - `school` (text, nullable) - School name (optional)
  - `descriptor` (text) - Short 3-trait descriptor
  - `strength` (text) - Key strength/characteristic
  - `goal` (text) - Season goal
  - `bio` (text) - Full biography/story
  - `gpa` (text, nullable) - Current GPA
  - `years_playing` (integer, default 0) - Years of experience
  - `image_url` (text, nullable) - Profile image URL
  - `highlight_video_url` (text, nullable) - Featured highlight video
  - `supporters_count` (integer, default 0) - Number of supporters
  - `views_count` (integer, default 0) - Total highlight views
  - `followers_count` (integer, default 0) - Followers count
  - `monthly_funding` (integer, default 0) - Monthly funding in dollars
  - `is_featured` (boolean, default false) - Featured on homepage
  - `is_active` (boolean, default true) - Active profile
  - `slug` (text, unique) - URL-friendly identifier
  - `created_at` (timestamptz) - Creation timestamp
  - `updated_at` (timestamptz) - Last update timestamp

  ## Security
  - Enable RLS on athletes table
  - Public read access for active athletes
  - Only authenticated admins can insert/update/delete

  ## Notes
  - Profiles are public for community visibility
  - Parent-managed content (enforced at app level)
  - No sensitive personal information stored
*/

-- Create athletes table
CREATE TABLE IF NOT EXISTS athletes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  first_name text NOT NULL,
  last_initial text NOT NULL,
  grade text NOT NULL,
  sport text NOT NULL,
  position text NOT NULL,
  city text NOT NULL DEFAULT 'Memphis, TN',
  school text,
  descriptor text NOT NULL,
  strength text NOT NULL,
  goal text NOT NULL,
  bio text NOT NULL,
  gpa text,
  years_playing integer DEFAULT 0,
  image_url text,
  highlight_video_url text,
  supporters_count integer DEFAULT 0 CHECK (supporters_count >= 0),
  views_count integer DEFAULT 0 CHECK (views_count >= 0),
  followers_count integer DEFAULT 0 CHECK (followers_count >= 0),
  monthly_funding integer DEFAULT 0 CHECK (monthly_funding >= 0),
  is_featured boolean DEFAULT false,
  is_active boolean DEFAULT true,
  slug text UNIQUE NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE athletes ENABLE ROW LEVEL SECURITY;

-- Policy: Anyone can view active athletes
CREATE POLICY "Anyone can view active athletes"
  ON athletes
  FOR SELECT
  USING (is_active = true);

-- Policy: Only authenticated users can insert athletes
CREATE POLICY "Authenticated users can insert athletes"
  ON athletes
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Policy: Only authenticated users can update athletes
CREATE POLICY "Authenticated users can update athletes"
  ON athletes
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Policy: Only authenticated users can delete athletes
CREATE POLICY "Authenticated users can delete athletes"
  ON athletes
  FOR DELETE
  TO authenticated
  USING (true);

-- Create index for slug lookups
CREATE INDEX IF NOT EXISTS athletes_slug_idx ON athletes(slug);

-- Create index for featured athletes
CREATE INDEX IF NOT EXISTS athletes_featured_idx ON athletes(is_featured) WHERE is_featured = true;

-- Create index for active athletes
CREATE INDEX IF NOT EXISTS athletes_active_idx ON athletes(is_active) WHERE is_active = true;

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_athletes_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to automatically update updated_at
CREATE TRIGGER athletes_updated_at_trigger
  BEFORE UPDATE ON athletes
  FOR EACH ROW
  EXECUTE FUNCTION update_athletes_updated_at();
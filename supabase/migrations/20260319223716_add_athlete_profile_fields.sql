/*
  # Add Enhanced Profile Fields to Athletes Table

  ## Summary
  Adds new fields to support dynamic athlete profiles with team info, social proof,
  fundraising goals, and video embeds.

  ## Changes
  - `team_name` (text, nullable) - Current team/club name
  - `team_circuit` (text, nullable) - Circuit or league (e.g., "Puma Circuit")
  - `competition_status` (text, nullable) - Current competition status
  - `social_proof` (text, nullable) - Featured mentions (e.g., "Featured on NXTPro (20+ shares)")
  - `season_goal_amount` (integer, default 0) - Fundraising goal in dollars
  - `season_amount_raised` (integer, default 0) - Current amount raised
  - `next_goal_description` (text, nullable) - Description of next funding milestone
  - `stripe_payment_link` (text, nullable) - Stripe payment link for donations
  - `highlight_video_embed_url` (text, nullable) - Embed URL for highlight video (YouTube, Vimeo)
  - `instagram_handle` (text, nullable) - Instagram username
  - `twitter_handle` (text, nullable) - Twitter/X username

  ## Notes
  - All new fields are nullable to support gradual migration
  - Existing athlete records remain valid
  - Default values set for numeric fields
*/

-- Add team and competition fields
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'athletes' AND column_name = 'team_name'
  ) THEN
    ALTER TABLE athletes ADD COLUMN team_name text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'athletes' AND column_name = 'team_circuit'
  ) THEN
    ALTER TABLE athletes ADD COLUMN team_circuit text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'athletes' AND column_name = 'competition_status'
  ) THEN
    ALTER TABLE athletes ADD COLUMN competition_status text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'athletes' AND column_name = 'social_proof'
  ) THEN
    ALTER TABLE athletes ADD COLUMN social_proof text;
  END IF;
END $$;

-- Add fundraising fields
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'athletes' AND column_name = 'season_goal_amount'
  ) THEN
    ALTER TABLE athletes ADD COLUMN season_goal_amount integer DEFAULT 0 CHECK (season_goal_amount >= 0);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'athletes' AND column_name = 'season_amount_raised'
  ) THEN
    ALTER TABLE athletes ADD COLUMN season_amount_raised integer DEFAULT 0 CHECK (season_amount_raised >= 0);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'athletes' AND column_name = 'next_goal_description'
  ) THEN
    ALTER TABLE athletes ADD COLUMN next_goal_description text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'athletes' AND column_name = 'stripe_payment_link'
  ) THEN
    ALTER TABLE athletes ADD COLUMN stripe_payment_link text;
  END IF;
END $$;

-- Add video and social media fields
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'athletes' AND column_name = 'highlight_video_embed_url'
  ) THEN
    ALTER TABLE athletes ADD COLUMN highlight_video_embed_url text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'athletes' AND column_name = 'instagram_handle'
  ) THEN
    ALTER TABLE athletes ADD COLUMN instagram_handle text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'athletes' AND column_name = 'twitter_handle'
  ) THEN
    ALTER TABLE athletes ADD COLUMN twitter_handle text;
  END IF;
END $$;
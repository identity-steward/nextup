/*
  # Add Missing Fields to Parent Intake Table

  ## Summary
  Adds missing fields to the parent_intake table to support the complete
  parent intake form including city, support needed, and consent fields.

  ## Changes
  - Add athlete_age column (integer)
  - Add city column (text)
  - Add support_needed column (text) 
  - Add consent_given column (boolean)

  ## Notes
  - Uses DO blocks to check if columns exist before adding
  - Maintains existing data integrity
*/

-- Add athlete_age column if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'parent_intake' AND column_name = 'athlete_age'
  ) THEN
    ALTER TABLE parent_intake ADD COLUMN athlete_age integer CHECK (athlete_age >= 5 AND athlete_age <= 18);
  END IF;
END $$;

-- Add city column if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'parent_intake' AND column_name = 'city'
  ) THEN
    ALTER TABLE parent_intake ADD COLUMN city text;
  END IF;
END $$;

-- Add support_needed column if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'parent_intake' AND column_name = 'support_needed'
  ) THEN
    ALTER TABLE parent_intake ADD COLUMN support_needed text;
  END IF;
END $$;

-- Add consent_given column if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'parent_intake' AND column_name = 'consent_given'
  ) THEN
    ALTER TABLE parent_intake ADD COLUMN consent_given boolean DEFAULT false;
  END IF;
END $$;

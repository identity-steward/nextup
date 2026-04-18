/*
  # Link athlete_signups to existing athletes

  ## Summary
  Adds an `athlete_id` foreign key column to `athlete_signups` so that
  when an incoming signup matches an already-existing athlete profile, the
  signup row is attached to that athlete instead of triggering a new
  profile creation.

  ## Changes
  ### `athlete_signups`
  - New `athlete_id` (uuid, nullable) — references `athletes.id`
  - New `match_source` (text, nullable) — records how the match was made:
      'name_sport' | 'manual' | null (no match found)

  ## Notes
  - Nullable so existing rows are unaffected
  - No CASCADE delete — signups are kept as historical records
  - Index added for fast lookup by athlete_id
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'athlete_signups' AND column_name = 'athlete_id'
  ) THEN
    ALTER TABLE athlete_signups
      ADD COLUMN athlete_id uuid REFERENCES athletes(id) ON DELETE SET NULL;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'athlete_signups' AND column_name = 'match_source'
  ) THEN
    ALTER TABLE athlete_signups ADD COLUMN match_source text;
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS athlete_signups_athlete_id_idx
  ON athlete_signups (athlete_id)
  WHERE athlete_id IS NOT NULL;

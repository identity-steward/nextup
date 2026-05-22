/*
  # Add field_grade to profile_update_requests

  ## Summary
  Separates "Athlete Level" (current grade/level description) from "Graduation / Class Year"
  so athletes at any level — middle school, high school, or college — can submit both fields
  independently through the profile update request workflow.

  ## Changes
  - `profile_update_requests`
    - New column: `field_grade` (nullable text)
      Carries the athlete's current level, e.g. "8th Grade", "High School Sophomore",
      "College Freshman". On admin approval, this writes to `athletes.grade`.
      The existing `field_class_year` column is unchanged and continues to carry the
      graduation/class year, which on approval now writes to `athletes.class_year`.

  ## Notes
  - Additive-only migration. All existing rows will have field_grade = NULL (safe).
  - No changes to the athletes table.
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'profile_update_requests' AND column_name = 'field_grade'
  ) THEN
    ALTER TABLE profile_update_requests ADD COLUMN field_grade text;
  END IF;
END $$;

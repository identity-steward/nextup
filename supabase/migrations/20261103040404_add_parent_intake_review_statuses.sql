/*
# Extend parent_intake status values

## Summary
Widens the CHECK constraint on `parent_intake.status` to include
`contacted` and `needs_verification`, giving administrators more
granular review states for the parent intake queue.

## Changes
- Drops the existing constraint `parent_intake_status_check` (allows pending, reviewed, approved, rejected)
- Creates a new constraint allowing all six values: pending, contacted, needs_verification, reviewed, approved, rejected
- No data is modified — existing records (all status=pending) remain valid

## Security
- No RLS or policy changes
- No new grants
- No new tables or columns
*/

ALTER TABLE parent_intake DROP CONSTRAINT IF EXISTS parent_intake_status_check;

ALTER TABLE parent_intake ADD CONSTRAINT parent_intake_status_check
  CHECK (status = ANY (ARRAY['pending'::text, 'contacted'::text, 'needs_verification'::text, 'reviewed'::text, 'approved'::text, 'rejected'::text]));

/*
# Phase 7A — Create journey_entries table

## Purpose
The journey_entries table transforms athlete profiles from static snapshots into living
development portfolios. Each entry documents a verified or pending moment of growth
across five categories: sports, leadership, community, education, and wellness.

## New Tables

### journey_entries
Core fields:
- id (uuid, pk): Unique identifier
- athlete_id (uuid, fk → athletes): The athlete this entry belongs to
- title (text, not null): Headline of the development moment
- body (text, nullable): Optional narrative description
- entry_type (text, not null): Category — milestone, achievement, performance, academic,
  leadership, community, wellness, creative, challenge
- date_occurred (date, nullable): When the moment happened (distinct from created_at)

Workflow fields:
- visibility (text, default 'private'): 'public' | 'private'
- status (text, default 'pending'): 'pending' | 'approved' | 'rejected'
- verified (boolean, default false): Admin has independently confirmed this moment occurred
- verified_by (text, nullable): Who verified (coach name, school official, event organizer)
- verification_source (text, nullable): Source of verification
- admin_notes (text, nullable): Internal admin notes

Attribution fields:
- created_by (uuid, fk → auth.users, default auth.uid()): Who submitted the entry
- created_by_role (text): 'admin' | 'parent' | 'athlete'

Evidence linking fields (both nullable):
- evidence_media_id (uuid, fk → media_uploads): Links entry to an approved media upload
- evidence_tag_id (uuid, fk → visibility_tags): Links entry to the trait it earned

Audit fields:
- reviewed_at (timestamptz): When admin reviewed this entry
- created_at, updated_at (timestamptz, auto-managed)

## Security (RLS)
1. Public / anon: SELECT where status = 'approved' AND visibility = 'public'
2. Authenticated owner: SELECT where created_by = auth.uid() OR user_profiles.athlete_id matches
3. Authenticated admin: Full SELECT, INSERT, UPDATE, DELETE
4. Authenticated non-admin: INSERT only with status = 'pending' AND visibility = 'private'
   No UPDATE or DELETE for non-admins

## Indexes
- athlete_id: Fast lookups by athlete (profile page query)
- status + visibility: Fast public timeline queries
- date_occurred: Fast chronological sorting
*/

CREATE TABLE IF NOT EXISTS journey_entries (
  id                  uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  athlete_id          uuid NOT NULL REFERENCES athletes(id) ON DELETE CASCADE,
  title               text NOT NULL,
  body                text,
  entry_type          text NOT NULL,
  date_occurred       date,
  visibility          text NOT NULL DEFAULT 'private' CHECK (visibility IN ('public', 'private')),
  status              text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  verified            boolean NOT NULL DEFAULT false,
  verified_by         text,
  verification_source text,
  admin_notes         text,
  created_by          uuid DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE SET NULL,
  created_by_role     text CHECK (created_by_role IN ('admin', 'parent', 'athlete')),
  evidence_media_id   uuid REFERENCES media_uploads(id) ON DELETE SET NULL,
  evidence_tag_id     uuid REFERENCES visibility_tags(id) ON DELETE SET NULL,
  reviewed_at         timestamptz,
  created_at          timestamptz NOT NULL DEFAULT now(),
  updated_at          timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS journey_entries_athlete_id_idx
  ON journey_entries(athlete_id);

CREATE INDEX IF NOT EXISTS journey_entries_status_visibility_idx
  ON journey_entries(status, visibility);

CREATE INDEX IF NOT EXISTS journey_entries_date_occurred_idx
  ON journey_entries(date_occurred DESC NULLS LAST);

CREATE OR REPLACE FUNCTION update_journey_entries_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS journey_entries_set_updated_at ON journey_entries;
CREATE TRIGGER journey_entries_set_updated_at
  BEFORE UPDATE ON journey_entries
  FOR EACH ROW EXECUTE FUNCTION update_journey_entries_updated_at();

ALTER TABLE journey_entries ENABLE ROW LEVEL SECURITY;

-- Public read: approved + public entries visible to everyone
DROP POLICY IF EXISTS "public_read_approved_public" ON journey_entries;
CREATE POLICY "public_read_approved_public" ON journey_entries FOR SELECT
TO anon, authenticated
USING (status = 'approved' AND visibility = 'public');

-- Owner read: athlete/parent sees all entries for their athlete
DROP POLICY IF EXISTS "owner_read_own_entries" ON journey_entries;
CREATE POLICY "owner_read_own_entries" ON journey_entries FOR SELECT
TO authenticated
USING (
  created_by = auth.uid()
  OR EXISTS (
    SELECT 1 FROM user_profiles
    WHERE user_profiles.id = auth.uid()
      AND user_profiles.athlete_id = journey_entries.athlete_id
  )
);

-- Admin read: admin sees all entries
DROP POLICY IF EXISTS "admin_read_all_entries" ON journey_entries;
CREATE POLICY "admin_read_all_entries" ON journey_entries FOR SELECT
TO authenticated
USING ((auth.jwt()->'app_metadata'->>'role') = 'admin');

-- Admin insert: admin can create entries with any status/visibility
DROP POLICY IF EXISTS "admin_insert_entries" ON journey_entries;
CREATE POLICY "admin_insert_entries" ON journey_entries FOR INSERT
TO authenticated
WITH CHECK ((auth.jwt()->'app_metadata'->>'role') = 'admin');

-- Non-admin insert: pending + private only
DROP POLICY IF EXISTS "authenticated_insert_pending_entries" ON journey_entries;
CREATE POLICY "authenticated_insert_pending_entries" ON journey_entries FOR INSERT
TO authenticated
WITH CHECK (
  status = 'pending'
  AND visibility = 'private'
  AND auth.uid() IS NOT NULL
);

-- Admin update only
DROP POLICY IF EXISTS "admin_update_entries" ON journey_entries;
CREATE POLICY "admin_update_entries" ON journey_entries FOR UPDATE
TO authenticated
USING ((auth.jwt()->'app_metadata'->>'role') = 'admin')
WITH CHECK ((auth.jwt()->'app_metadata'->>'role') = 'admin');

-- Admin delete only
DROP POLICY IF EXISTS "admin_delete_entries" ON journey_entries;
CREATE POLICY "admin_delete_entries" ON journey_entries FOR DELETE
TO authenticated
USING ((auth.jwt()->'app_metadata'->>'role') = 'admin');

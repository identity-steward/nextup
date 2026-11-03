/*
# Phase 2: Make Youth-Media Buckets Private

## Summary
Makes the three youth-identifiable media buckets private and replaces their
public SELECT policies with authenticated-only policies. Creates a new public
`brand-assets` bucket for non-identifiable graphics. This is the final
private-storage cutover step — once applied, direct public storage URLs for
athlete photos and videos return 403, and all media access goes through the
`media-urls` Edge Function which enforces per-record authorization with
5-minute signed URLs.

## Changes

### 1. New Bucket
- `brand-assets` (public=true) — for non-identifiable graphics only (logos,
  backgrounds, placeholder images). No youth-identifiable content.

### 2. Bucket Visibility Changes
- `athlete-photos`: public=true → public=false
- `athlete-videos`: public=true → public=false
- `profile-assets`: public=true → public=false
- `media-quarantine`: already private (unchanged)

### 3. Policy Changes on storage.objects
- DROPS 3 public SELECT policies that granted `anon` read access to
  youth-media buckets.
- CREATES 3 new SELECT policies scoped to `authenticated` only.
- Existing INSERT/DELETE policies for authenticated uploaders are unchanged.
- service_role retains full access (bypasses RLS) — the Edge Function uses
  service_role to issue signed URLs.

### 4. No File or Data Changes
- No storage objects are deleted, moved, or modified.
- No database records are changed.
- All files remain at their original paths in their original buckets.

## Security
- Youth-media buckets are now private: anonymous users cannot read objects
  directly via public storage URLs.
- The `media-urls` Edge Function uses the service_role key, which bypasses
  RLS, so signed URL issuance continues to work.
- Authenticated users (owners, navigators, admins) can still read objects
  directly via the Supabase client, subject to RLS policies.
- The `brand-assets` bucket is public for non-identifiable graphics only.

## Rollback Policy
Youth-media buckets must NEVER be restored to public access. If something
breaks, repair the service or display placeholders. Never run
`UPDATE storage.buckets SET public = true` on youth-media buckets.
*/

-- Step 1: Create brand-assets bucket (public, for non-identifiable graphics)
INSERT INTO storage.buckets (id, name, public)
VALUES ('brand-assets', 'brand-assets', true)
ON CONFLICT (id) DO NOTHING;

-- Step 2: Set youth-media buckets to private
UPDATE storage.buckets SET public = false
WHERE id IN ('athlete-photos', 'athlete-videos', 'profile-assets');

-- Step 3: Drop the 3 public SELECT policies
DROP POLICY IF EXISTS "Public can access athlete photo objects" ON storage.objects;
DROP POLICY IF EXISTS "Public can access athlete video objects" ON storage.objects;
DROP POLICY IF EXISTS "Public can access profile asset objects" ON storage.objects;

-- Step 4: Create authenticated-only SELECT policies
CREATE POLICY "Authenticated can read athlete photos"
ON storage.objects FOR SELECT TO authenticated
USING (bucket_id = 'athlete-photos' AND name IS NOT NULL AND name <> '');

CREATE POLICY "Authenticated can read athlete videos"
ON storage.objects FOR SELECT TO authenticated
USING (bucket_id = 'athlete-videos' AND name IS NOT NULL AND name <> '');

CREATE POLICY "Authenticated can read profile assets"
ON storage.objects FOR SELECT TO authenticated
USING (bucket_id = 'profile-assets' AND name IS NOT NULL AND name <> '');

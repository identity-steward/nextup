# Private Media Storage Migration — Cutover Checklist

## Confirmed Decisions

1. **Add `pending` to consent_status CHECK constraint** — DONE (Phase 1A migration `20261103020000`). The constraint now allows `'pending'`, `'implied'`, `'signed'`, `'revoked'`. Non-admin uploads get `consent_status='pending'` via the trigger, representing "awaiting guardian authorization." Admins approve to `'signed'` after verifying guardian authority.

2. **Unverified directory photos show placeholders** — When the Edge Function cannot verify guardian authorization for an athlete's media, it returns `null` for that media ID. The directory, profile, and journey pages show a placeholder instead of the photo. No fallback to public URLs. Applies to `athletes.image_url` values that point to Supabase storage (Tadiwa, Kenneth). Local paths (Jacob's `/untitled-design.png`) and Pexels URLs pass through unchanged.

3. **Local youth-identifiable images also require consent authorization** — Jacob's `/untitled-design.png` is a local file in `public/`, not a Supabase storage object. It is not affected by bucket privacy changes. However, it is youth-identifiable. Phase 1B will route local youth-identifiable images through the same consent check: if the athlete has no verified consent + authority, the local image is replaced with a placeholder in the UI. This is a client-side check (the file itself remains public in the bundled assets), but it prevents display without authorization.

4. **`media-urls` uses `verify_jwt=false` with independently verified JWTs** — The Edge Function config sets `verify_jwt = false` so Supabase does not reject anonymous requests. The function itself extracts the JWT from the `Authorization` header when present, verifies it using the Supabase JWKS, and determines the caller's identity and role. When no JWT is present, the caller is treated as anonymous and subject to the strictest authorization rules (signed consent + verified authority required).

5. **Audit and cover all homepage, directory, profile, journey, and external media rendering paths** — The following routes must be updated in Phase 1B:
   - `/youth/:slug` — `AthleteProfilePage.tsx` → `AthleteProfileTemplate.tsx` (gallery `public_url`, `image_url`, `highlight_video_embed_url`)
   - `/youth/jacob-f` — same as above (fixedSlug route)
   - `/youth` — `AthletesPage.tsx` (directory card `image_url`)
   - `/` — `FeaturedAthletesPreview.tsx` (`athlete.image_url`), `AthleteStory.tsx` (`athlete.image_url`), `HighlightReel.tsx` (`athlete.image_url`)
   - Journey evidence — `ProfileUpdates.tsx` (`evidence.public_url`)
   - External embeds — `highlight_video_embed_url` (YouTube/embed iframes) are NOT storage objects and are unaffected by bucket privacy. They pass through `safeVideoEmbedUrl()` unchanged.

## Phase 1A — Complete

- [x] Migration applied: `20261103020000_add_pending_to_media_consent_status_check.sql`
- [x] CHECK constraint expanded to include `'pending'`
- [x] Trigger `usage_scope` assignment fixed from `ARRAY['profile']::text[]` to scalar `'platform'`
- [x] Trigger preserves non-admin upload forcing: `status='pending'`, `consent_status='pending'`, `usage_scope='platform'`, all approval fields cleared
- [x] INSERT policy unchanged: requires `auth.uid() = uploader_id` AND athlete ownership
- [x] UPDATE policy unchanged: admin-only (`app_metadata.role = 'admin'`)
- [x] Synthetic test record inserted with `consent_status='pending'` — constraint accepted it
- [x] Existing 4 real media records unchanged — all still `consent_status='implied'`
- [x] Test fixtures cleaned up (synthetic athlete, auth user, and media record deleted)
- [x] Build passes (`npm run build` — 0 errors)
- [x] Security advisor: 0 new findings (4 pre-existing warnings unchanged)

## Phase 1B — Complete

### Prerequisites
- [x] Create `media_consent_audit` table (migration `20261103030000`)
- [x] Create `media_signed_url_log` table (migration `20261103030000`)
- [x] Create `media-quarantine` bucket (private, migration `20261103030000`)
- [x] Write `supabase/functions/media-urls/index.ts`
- [x] Write `supabase/functions/media-revoke/index.ts`
- [x] Add `[functions.media-urls]` and `[functions.media-revoke]` to `supabase/config.toml`
  - `media-urls`: `verify_jwt = false` (anonymous access required)
  - `media-revoke`: `verify_jwt = false` (function verifies admin JWT internally)

### Edge Function: `media-urls`
- [x] Accepts POST `{ mediaUploadIds: string[] }`
- [x] Uses `SUPABASE_SERVICE_ROLE_KEY` for all DB and storage operations
- [x] Does NOT accept storage paths or role claims from request body
- [x] Per-record authorization:
  - Anonymous: `status=approved` AND `consent_status=signed` AND `usage_scope IN (platform,public)` AND `athlete.profile_status=active` AND consents row with `can_use_name_image_likeness=true` AND verified `authority_to_act`
  - Owner (`auth_user_id`/`created_by_user_id`/`managed_by_parent_id` match): all media for that athlete including pending
  - Navigator (active assignment to athlete's household): approved + pending media for that athlete
  - Admin (`app_metadata.role='admin'`): all media including revoked
- [x] Calls `createSignedUrl(path, 300)` for qualifying records
- [x] Returns `{ urls: { [id]: string|null } }`
- [x] Logs each issuance to `media_signed_url_log`
- [x] CORS headers on all responses
- [x] Per-record error isolation (one failure doesn't block others)

### Edge Function: `media-revoke`
- [x] Accepts POST `{ mediaUploadId: string, action: 'quarantine'|'restore' }`
- [x] Verifies admin JWT internally
- [x] Quarantine: copies file to `media-quarantine` bucket, deletes original, updates `storage_path`
- [x] Restore: copies from quarantine back to original bucket, updates `storage_path`
- [x] Logs to `media_consent_audit` with retryable status tracking
- [x] Resilient to partial failures (copy fails → retry; delete fails → retry; path update fails → retry)
- [x] CORS headers on all responses

### Application Code
- [x] Create `src/services/mediaUrlService.ts` (`getSignedUrls`, `resolveAthleteImageUrl`, `resolveAthleteImageWithConsent`, `checkAthleteMediaConsent`)
- [x] Update `AthleteProfilePage.tsx` — query `id` not `public_url`; call `getSignedUrls`
- [x] Update `AthleteProfileTemplate.tsx` — `signedUrl` replaces `public_url`; consent-aware hero image
- [x] Update `ProfileUpdates.tsx` — signed URLs for evidence media
- [x] Update `AthletesPage.tsx` — resolve bucket URLs in `image_url` to signed URLs; local/Pexels pass through
- [x] Update `FeaturedAthletesPreview.tsx` — consent-aware image resolution
- [x] Update `AthleteStory.tsx` — consent-aware image with placeholder fallback
- [x] Update `HighlightReel.tsx` — consent-aware image with placeholder fallback

### Verification Gate (Phase 1B → Phase 2)
- [x] `media-urls` function deployed and active
- [x] `media-revoke` function deployed and active
- [x] `npm run build` passes (0 errors)
- [x] `npm run typecheck` passes (0 errors)
- [x] Security advisor: 0 new findings (4 pre-existing warnings unchanged)
- [x] All 4 real media records unchanged (consent_status still 'implied')
- [x] media-quarantine bucket created as private
- [ ] No `public_url` or `storage/v1/object/public` in rendered HTML (verify after deploy)
- [ ] Jacob profile shows placeholder for video (verify after deploy)
- [ ] Directory shows placeholder for Tadiwa (verify after deploy)
- [ ] Signed URLs expire after 5 minutes (verify after deploy)
- [ ] Admin media review still works (verify after deploy)

## Phase 2 — Make Buckets Private (Proposed, Requires Approval)

### Current State
- `athlete-photos`: public=true
- `athlete-videos`: public=true
- `profile-assets`: public=true
- `media-quarantine`: public=false (already private)

### Current storage.objects SELECT Policies (to be replaced)
1. `Public can access athlete photo objects` — TO `anon, authenticated`, USING `bucket_id = 'athlete-photos' AND name IS NOT NULL AND name != ''`
2. `Public can access athlete video objects` — TO `anon, authenticated`, USING `bucket_id = 'athlete-videos' AND name IS NOT NULL AND name != ''`
3. `Public can access profile asset objects` — TO `anon, authenticated`, USING `bucket_id = 'profile-assets' AND name IS NOT NULL AND name != ''`

### Proposed Changes (Single Migration)

**Step 1 — Create `brand-assets` bucket (public)**
```sql
INSERT INTO storage.buckets (id, name, public)
VALUES ('brand-assets', 'brand-assets', true)
ON CONFLICT (id) DO NOTHING;
```

**Step 2 — Set 3 media buckets to private**
```sql
UPDATE storage.buckets SET public = false
WHERE id IN ('athlete-photos', 'athlete-videos', 'profile-assets');
```

**Step 3 — Drop the 3 public SELECT policies**
```sql
DROP POLICY IF EXISTS "Public can access athlete photo objects" ON storage.objects;
DROP POLICY IF EXISTS "Public can access athlete video objects" ON storage.objects;
DROP POLICY IF EXISTS "Public can access profile asset objects" ON storage.objects;
```

**Step 4 — Create authenticated-only SELECT policies**
```sql
CREATE POLICY "Authenticated can read athlete photos"
ON storage.objects FOR SELECT TO authenticated
USING (bucket_id = 'athlete-photos' AND name IS NOT NULL AND name != '');

CREATE POLICY "Authenticated can read athlete videos"
ON storage.objects FOR SELECT TO authenticated
USING (bucket_id = 'athlete-videos' AND name IS NOT NULL AND name != '');

CREATE POLICY "Authenticated can read profile assets"
ON storage.objects FOR SELECT TO authenticated
USING (bucket_id = 'profile-assets' AND name IS NOT NULL AND name != '');
```

**Step 5 — Grant service_role access to brand-assets**
```sql
-- service_role already has full access to storage.objects
-- No additional grant needed
```

### Visible Impact
- Anonymous visitors cannot load media via public storage URLs — all 4 current URLs return 403
- The `media-urls` Edge Function (using service_role key) bypasses RLS and still issues signed URLs
- All image-rendering paths already route through the Edge Function with placeholder fallback
- No UI changes — visitors see either the photo (via signed URL) or a placeholder
- Authenticated users (owners, navigators, admins) can still read objects directly via the Supabase client

### Rollback Procedure
If anything breaks after Phase 2:
```sql
-- Revert buckets to public
UPDATE storage.buckets SET public = true
WHERE id IN ('athlete-photos', 'athlete-videos', 'profile-assets');

-- Restore public SELECT policies
DROP POLICY IF EXISTS "Authenticated can read athlete photos" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated can read athlete videos" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated can read profile assets" ON storage.objects;

CREATE POLICY "Public can access athlete photo objects"
ON storage.objects FOR SELECT TO anon, authenticated
USING (bucket_id = 'athlete-photos' AND name IS NOT NULL AND name != '');

CREATE POLICY "Public can access athlete video objects"
ON storage.objects FOR SELECT TO anon, authenticated
USING (bucket_id = 'athlete-videos' AND name IS NOT NULL AND name != '');

CREATE POLICY "Public can access profile asset objects"
ON storage.objects FOR SELECT TO anon, authenticated
USING (bucket_id = 'profile-assets' AND name IS NOT NULL AND name != '');
```

### Gate Criteria for Phase 2 Completion
- [ ] All 3 media buckets have `public = false`
- [ ] `brand-assets` bucket created and public
- [ ] No `storage/v1/object/public` URLs in page source
- [ ] All 4 old public URLs return 403
- [ ] Athlete profiles, directory, and journey evidence render correctly via signed URLs
- [ ] `npm run build` passes

### File Preservation Guarantee
Phase 2 does NOT delete, move, or modify any storage objects. It only changes bucket visibility and SELECT policies. All files remain in their original buckets at their original paths. The Edge Function's `createSignedUrl` continues to work because it uses the service_role key, which bypasses RLS.

## Phase 3 — Quarantine Workflow

- [ ] `media-revoke` quarantine workflow tested end-to-end
- [ ] Revocation cuts off new signed URLs immediately
- [ ] File copied to `media-quarantine` bucket; original deleted
- [ ] `media_consent_audit` records the transition
- [ ] Failed quarantine is retryable
- [ ] Admin can restore from quarantine

## Existing Public Storage URL Exposure

Until Phase 2 completes, the 4 public storage URLs remain accessible:
- `athlete-photos/a11bf416.../1778557730370-1000001162.png` (Tadiwa, active)
- `athlete-photos/2b855933.../1779425543980-Hockey_Memphis.jpg` (Kenneth, hidden)
- `athlete-videos/acf09f5e.../1778361542925-Player_13_Highlight_v1.mov` (Jacob, active)
- `athlete-videos/2b855933.../1779425591208-Player_13_Highlight_v1.mov` (Kenneth, hidden)

These URLs are embedded in page HTML and discoverable. They will return 403 only after Phase 2 sets buckets to private. This is accepted risk: tightening storage policies before signed URL delivery would break the live site.

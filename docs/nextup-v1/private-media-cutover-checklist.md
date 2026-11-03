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

## Phase 1B — Edge Functions and Application Code

### Prerequisites
- [ ] Create `media_consent_audit` table (migration)
- [ ] Create `media_signed_url_log` table (migration)
- [ ] Create `media-quarantine` bucket (private, migration)
- [ ] Write `supabase/functions/media-urls/index.ts`
- [ ] Write `supabase/functions/media-revoke/index.ts`
- [ ] Add `[functions.media-urls]` and `[functions.media-revoke]` to `supabase/config.toml`
  - `media-urls`: `verify_jwt = false` (anonymous access required)
  - `media-revoke`: `verify_jwt = false` (function verifies admin JWT internally)

### Edge Function: `media-urls`
- [ ] Accepts POST `{ mediaUploadIds: string[] }`
- [ ] Uses `SUPABASE_SERVICE_ROLE_KEY` for all DB and storage operations
- [ ] Does NOT accept storage paths or role claims from request body
- [ ] Per-record authorization:
  - Anonymous: `status=approved` AND `consent_status=signed` AND `usage_scope IN (platform,public)` AND `athlete.profile_status=active` AND consents row with `can_use_name_image_likeness=true` AND verified `authority_to_act`
  - Owner (`auth_user_id`/`created_by_user_id`/`managed_by_parent_id` match): all media for that athlete including pending
  - Navigator (active assignment to athlete's household): approved + pending media for that athlete
  - Admin (`app_metadata.role='admin'`): all media including revoked
- [ ] Calls `createSignedUrl(path, 300)` for qualifying records
- [ ] Returns `{ urls: { [id]: string|null } }`
- [ ] Logs each issuance to `media_signed_url_log`
- [ ] CORS headers on all responses
- [ ] Per-record error isolation (one failure doesn't block others)

### Edge Function: `media-revoke`
- [ ] Accepts POST `{ mediaUploadId: string, action: 'quarantine'|'restore' }`
- [ ] Verifies admin JWT internally
- [ ] Quarantine: copies file to `media-quarantine` bucket, deletes original, updates `storage_path`
- [ ] Restore: copies from quarantine back to original bucket, updates `storage_path`
- [ ] Logs to `media_consent_audit` with retryable status tracking
- [ ] Resilient to partial failures (copy fails → retry; delete fails → retry; path update fails → retry)
- [ ] CORS headers on all responses

### Application Code
- [ ] Create `src/services/mediaUrlService.ts` (`getSignedUrls`, `revokeMedia`)
- [ ] Update `AthleteProfilePage.tsx` — query `id` not `public_url`; call `getSignedUrls`; 4-min renewal timer
- [ ] Update `AthleteProfileTemplate.tsx` — `signedUrl` replaces `public_url`; onError placeholder; local image consent check
- [ ] Update `ProfileUpdates.tsx` — same pattern for evidence media
- [ ] Update `AthletesPage.tsx` — resolve bucket URLs in `image_url` to signed URLs; local/Pexels pass through
- [ ] Update `FeaturedAthletesPreview.tsx` — consent check on `athlete.image_url`
- [ ] Update `AthleteStory.tsx` — consent check on `athlete.image_url`
- [ ] Update `HighlightReel.tsx` — consent check on `athlete.image_url`

### Verification Gate (Phase 1B → Phase 2)
- [ ] `media-urls` function deployed and responding
- [ ] `media-revoke` function deployed and responding
- [ ] No `public_url` or `storage/v1/object/public` in rendered HTML
- [ ] Jacob profile shows placeholder for video (no signed URL for implied-consent media)
- [ ] Directory shows placeholder for Tadiwa (no verified consent)
- [ ] Journey evidence shows placeholder or text only
- [ ] Signed URLs expire after 5 minutes
- [ ] Signed URLs renew at 4-minute interval
- [ ] Admin media review still works
- [ ] `npm run build` passes

## Phase 2 — Make Buckets Private

- [ ] Set `athlete-photos`, `athlete-videos`, `profile-assets` to `public=false`
- [ ] Create `brand-assets` bucket (public=true) for non-identifiable graphics
- [ ] Replace 3 storage.objects SELECT policies (remove `anon` access)
- [ ] Old public URLs return 403
- [ ] All profiles, directory, journey evidence render correctly via signed URLs
- [ ] No `storage/v1/object/public` in page source

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

# Security Repair Migration — Storage RLS, Media Metadata, and Consent-Authority Binding

**Status:** DRAFT v3 — Not executed. Awaiting approval.

**v3 corrections:** Fixes two bugs in the deployed edge function and proposed v2 RLS function:
1. Consent giver (`consents.user_id`) is now bound to the verified authority holder (`authority_to_act.actor_user_id`). An unrelated user can no longer create effective publication consent for an athlete they have no authority over.
2. `authority_to_act.verification_status` check corrected from `'verified'` (not a valid CHECK constraint value) to `'verified_by_qualified_authority'` (the actual verified status). Also adds disputed and expiry checks.

## Changes Summary

| Component | Change | Deploy method |
|---|---|---|
| `media-urls` edge function | Rewrite consent+authority logic to bind giver to authority holder, fix verification_status, add dispute/expiry checks | `deploy_edge_functions` MCP tool |
| `media_is_publication_authorized` SQL function | New SECURITY DEFINER function with identical binding logic | `apply_migration` MCP tool |
| Storage SELECT policies | Replace broad authenticated read with ownership-scoped | `apply_migration` MCP tool |
| `media_uploads` public SELECT policy | Call `media_is_publication_authorized` | `apply_migration` MCP tool |
| Anon storage grants | Revoke DML on `storage.objects` | `apply_migration` MCP tool |

## 1. Edge Function Changes (`supabase/functions/media-urls/index.ts`)

The edge function's consent/authority batch-fetch section (formerly lines 129-204) has been rewritten. The old code:

- Fetched consents by `athlete_id` only (no `user_id` binding)
- Checked `authority_to_act.verification_status = 'verified'` (invalid — not in CHECK constraint)
- Did not check `disputed` or `expires_at`
- Did not check `subject_person_id` matches the athlete's person

The new code:

- Fetches consents with `user_id` included, filtered to `consent_status = 'accepted'` AND `can_use_name_image_likeness = true`
- Fetches `authority_to_act` with `verification_status = 'verified_by_qualified_authority'`, `disputed = false`, and filters out expired records
- Checks `subject_person_id` matches the athlete's person record
- Binds consent giver (`user_id`) to authority actor (`actor_user_id`) — only if they match does `publicationMap[athleteId] = true`
- Replaces `consentMap` and `authorityMap` with a single `publicationMap`

Owner, admin, and navigator access paths are unchanged.

## 2. Migration: `20261105060000_harden_storage_media_and_consent_binding.sql`

```sql
-- ============================================================================
-- A. STORAGE OBJECTS — Restrict broad authenticated read to owners + admins
-- ============================================================================

DROP POLICY IF EXISTS "Authenticated can read athlete photos" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated can read athlete videos" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated can read profile assets" ON storage.objects;

CREATE POLICY "Owners and admins can read athlete photos"
  ON storage.objects FOR SELECT TO authenticated
  USING (
    bucket_id = 'athlete-photos'
    AND (
      (auth.jwt() -> 'app_metadata' ->> 'role') = 'admin'
      OR EXISTS (
        SELECT 1 FROM public.athletes a
        WHERE a.id::text = (storage.foldername(name))[1]
        AND (
          a.auth_user_id = auth.uid()
          OR a.created_by_user_id = auth.uid()
          OR a.managed_by_parent_id = auth.uid()
        )
      )
    )
  );

CREATE POLICY "Owners and admins can read athlete videos"
  ON storage.objects FOR SELECT TO authenticated
  USING (
    bucket_id = 'athlete-videos'
    AND (
      (auth.jwt() -> 'app_metadata' ->> 'role') = 'admin'
      OR EXISTS (
        SELECT 1 FROM public.athletes a
        WHERE a.id::text = (storage.foldername(name))[1]
        AND (
          a.auth_user_id = auth.uid()
          OR a.created_by_user_id = auth.uid()
          OR a.managed_by_parent_id = auth.uid()
        )
      )
    )
  );

CREATE POLICY "Owners and admins can read profile assets"
  ON storage.objects FOR SELECT TO authenticated
  USING (
    bucket_id = 'profile-assets'
    AND (
      (auth.jwt() -> 'app_metadata' ->> 'role') = 'admin'
      OR auth.uid()::text = (storage.foldername(name))[1]
      OR EXISTS (
        SELECT 1 FROM public.athletes a
        WHERE a.id::text = (storage.foldername(name))[1]
        AND (
          a.auth_user_id = auth.uid()
          OR a.created_by_user_id = auth.uid()
          OR a.managed_by_parent_id = auth.uid()
        )
      )
    )
  );

-- ============================================================================
-- B. STORAGE OBJECTS — Revoke excess anon grants
-- ============================================================================

REVOKE SELECT, INSERT, UPDATE, DELETE ON storage.objects FROM anon;

-- ============================================================================
-- C. SECURITY DEFINER FUNCTION — Full publication authorization with binding
-- ============================================================================

CREATE OR REPLACE FUNCTION public.media_is_publication_authorized(p_media_id uuid)
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
SET search_path = public, storage
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM media_uploads m
    JOIN athletes a ON a.id = m.athlete_id
    JOIN persons athlete_person ON athlete_person.auth_user_id = a.auth_user_id
    JOIN household_memberships hm ON hm.person_id = athlete_person.id
    JOIN authority_to_act ata
      ON ata.household_id = hm.household_id
      AND ata.verification_status = 'verified_by_qualified_authority'
      AND ata.disputed = false
      AND (ata.expires_at IS NULL OR ata.expires_at >= now())
    AND ata.subject_person_id = athlete_person.id
    JOIN consents c
      ON c.athlete_id = m.athlete_id
      AND c.consent_status = 'accepted'
      AND c.can_use_name_image_likeness = true
      AND c.user_id = ata.actor_user_id
    WHERE m.id = p_media_id
      AND m.status = 'approved'
      AND m.consent_status = 'signed'
      AND m.usage_scope IN ('platform', 'public')
      AND a.profile_status = 'active'
  )
$$;

REVOKE EXECUTE ON FUNCTION public.media_is_publication_authorized(uuid) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.media_is_publication_authorized(uuid) TO anon, authenticated;

-- ============================================================================
-- D. MEDIA_UPLOADS — Tighten public SELECT to full publication authorization
-- ============================================================================

DROP POLICY IF EXISTS "Public can view approved media with current consent" ON public.media_uploads;

CREATE POLICY "Public can view fully authorized media"
  ON public.media_uploads FOR SELECT TO anon, authenticated
  USING (public.media_is_publication_authorized(id));
```

## 3. Rollback: `20261105060100_rollback_harden_storage_media_consent_binding.sql`

```sql
-- A. Restore broad storage read policies
DROP POLICY IF EXISTS "Owners and admins can read athlete photos" ON storage.objects;
DROP POLICY IF EXISTS "Owners and admins can read athlete videos" ON storage.objects;
DROP POLICY IF EXISTS "Owners and admins can read profile assets" ON storage.objects;

CREATE POLICY "Authenticated can read athlete photos"
  ON storage.objects FOR SELECT TO authenticated
  USING (bucket_id = 'athlete-photos' AND name IS NOT NULL AND name <> '');

CREATE POLICY "Authenticated can read athlete videos"
  ON storage.objects FOR SELECT TO authenticated
  USING (bucket_id = 'athlete-videos' AND name IS NOT NULL AND name <> '');

CREATE POLICY "Authenticated can read profile assets"
  ON storage.objects FOR SELECT TO authenticated
  USING (bucket_id = 'profile-assets' AND name IS NOT NULL AND name <> '');

-- B. Restore anon grants
GRANT SELECT, INSERT, UPDATE, DELETE ON storage.objects TO anon;

-- C. Restore broad media_uploads SELECT
DROP POLICY IF EXISTS "Public can view fully authorized media" ON public.media_uploads;

CREATE POLICY "Public can view approved media with current consent"
  ON public.media_uploads FOR SELECT TO anon, authenticated
  USING (status = 'approved' AND consent_status <> 'revoked');

-- D. Drop the SECURITY DEFINER function
DROP FUNCTION IF EXISTS public.media_is_publication_authorized(uuid);
```

**Edge function rollback:** The previous version of `media-urls/index.ts` can be restored from Version History (the clock icon in the header). Redeploy after restoring.

## 4. Production Deployment Order

1. **Deploy the edge function first** — use the `deploy_edge_functions` MCP tool. This deploys the updated `media-urls` function with consent-authority binding. The function will now deny all public media (since no authority_to_act records exist), which is the same behavior as before (the old code checked `'verified'` which never matched any record).
2. **Apply the SQL migration** — use the `apply_migration` MCP tool with the SQL from section 2.
3. **Run post-deployment verification queries** (section 5).

Deploying the edge function before the migration is safe because:
- The edge function uses the service role key and bypasses RLS — the migration's RLS changes don't affect it
- Both old and new edge function logic deny all public media until authority_to_act records with `verification_status = 'verified_by_qualified_authority'` are created
- The SQL migration tightens RLS from broad to strict — it can only reduce access, not break existing flows

## 5. Post-Deployment Verification

```sql
-- 1. Storage policies: expect 4 (3 new + 1 quarantine)
SELECT polname FROM pg_policy
WHERE polrelid = 'storage.objects'::regclass AND polcmd = 'r'
ORDER BY polname;

-- 2. Anon grants: expect 0
SELECT count(*) FROM information_schema.table_privileges
WHERE table_name = 'objects' AND table_schema = 'storage' AND grantee = 'anon';

-- 3. Function exists: expect 1
SELECT count(*) FROM information_schema.routines
WHERE routine_name = 'media_is_publication_authorized';

-- 4. New media_uploads policy: expect 1
SELECT count(*) FROM pg_policy
WHERE polrelid = 'public.media_uploads'::regclass
AND polname = 'Public can view fully authorized media';

-- 5. Old policy gone: expect 0
SELECT count(*) FROM pg_policy
WHERE polrelid = 'public.media_uploads'::regclass
AND polname = 'Public can view approved media with current consent';

-- 6. Data intact
SELECT slug, profile_status, profile_tier FROM athletes WHERE slug = 'jacob-f';
SELECT count(*) FROM journey_entries WHERE athlete_id = 'acf09f5e-f3f2-4973-8185-f2a01d5e2f0c';
SELECT count(*) FROM media_uploads WHERE athlete_id = 'acf09f5e-f3f2-4973-8185-f2a01d5e2f0c';
SELECT count(*) FROM athlete_tags WHERE athlete_id = 'acf09f5e-f3f2-4973-8185-f2a01d5e2f0c';
```

Edge function verification (from terminal):
```bash
# Denial path (Jacob's video has consent_status=implied)
curl -s -X POST "$SUPABASE_URL/functions/v1/media-urls" \
  -H "Content-Type: application/json" -H "apikey: $ANON_KEY" \
  -d '{"mediaUploadIds":["84349e4c-186d-43a9-a724-857bf06f7e9b"]}'
# Expected: {"urls":{"84349e4c-186d-43a9-a724-857bf06f7e9b":null}}
```

## 6. Test Evidence (Transaction-Rollback, 2026-11-05)

All tests ran inside `BEGIN; ... ROLLBACK;` transactions. Zero production footprint.

### Consent-Authority Binding Tests (14 tests, all PASS)

Synthetic data created: approved+signed media for Jacob, verified authority for Kenneth over Jacob, valid consent by Kenneth, unrelated-user consent, revoked consent, mismatched-subject authority.

| Test | Scenario | Expected | Actual | Pass |
|---|---|---|---|---|
| T1 | Valid consent by verified authority holder | true | true | PASS |
| T2 | Valid consent revoked (only unrelated user's remains) | false | false | PASS |
| T3 | Consent restored after revocation | true | true | PASS |
| T4 | Valid authority removed, only mismatched-subject remains | false | false | PASS |
| T5 | Authority disputed | false | false | PASS |
| T6 | Authority verification_status='asserted' (not verified) | false | false | PASS |
| T7 | Fully valid authority restored | true | true | PASS |
| T8 | Authority expired (expires_at in past) | false | false | PASS |
| T9 | Authority expiry removed | true | true | PASS |
| T10 | All authority records deleted | false | false | PASS |
| T11_athlete | Jacob's profile_status = active | true | true | PASS |
| T11_journey | 10 journey entries preserved | true | true | PASS |
| T11_original_media | 1 original media upload preserved | true | true | PASS |
| T11_tags | 8 athlete tags preserved | true | true | PASS |

### Prior Storage/Media RLS Tests (32 tests, all PASS — from v2 validation)

See previous validation round. These tests verified storage SELECT policies, anon revocation, guardian revocation, and data preservation. The v3 function is a strict subset of v2's conditions (adds binding + dispute + expiry), so all denial cases from v2 still pass.

### Post-Test Cleanliness Verification

| Check | Result |
|---|---|
| Test media in media_uploads | 0 rows |
| Test authority_to_act records | 0 rows |
| Test consents records | 0 rows |
| `media_is_publication_authorized` function in DB | Not present (rolled back) |

## 7. Design Decisions

### Why `consent_grants` is not used now

The `consent_grants` table has the proper schema for binding (`authority_to_act_id`, `household_id`, `subject_person_id`) and has a guard trigger (`guard_consent_authority_household`). However:
- It has 0 rows
- The edge function reads from `consents`, not `consent_grants`
- Migrating to `consent_grants` would require data migration, application code changes, and UI changes — outside the scope of this security fix
- The binding can be enforced equivalently by joining `consents.user_id` to `authority_to_act.actor_user_id` in the authorization logic

`consent_grants` should be reserved for a future consent system migration. The current fix closes the security gap without data migration or application redesign.

### What the binding prevents

Without binding: Any authenticated user can create a `consents` row (INSERT policy: `auth.uid() = user_id`) for any athlete. If that athlete's household has any verified `authority_to_act` record, the edge function would authorize that athlete's media for public access.

With binding: The consent giver's `user_id` must match the `actor_user_id` on a verified, non-disputed, non-expired `authority_to_act` record for the same household and subject person. An unrelated user's consent is ignored even if they set `consent_status = 'accepted'` and `can_use_name_image_likeness = true`.

### Additional authority checks added

The v3 function also checks:
- `ata.disputed = false` — blocks media if authority is disputed
- `ata.expires_at IS NULL OR ata.expires_at >= now()` — blocks media if authority has expired
- `ata.subject_person_id = athlete_person.id` — blocks media if authority is for a different person in the same household

These checks mirror the `guard_consent_authority_household` trigger's hard-stop conditions (disputed, legal instrument verification, expiry, review overdue) for the read path. The edge function now applies the same checks at query time.

## 8. Remaining Security Limitations

1. **Admin account as athlete owner:** `kjrf@duck.com` admin account is Jacob's `auth_user_id`. Data-level change needed.
2. **No authority_to_act records exist:** No media can be publicly authorized until a guardian's authority is verified. Correct behavior.
3. **Authorized signed-URL delivery (approval path) not tested end-to-end:** Requires creating real authority and consent records. The edge function code has been updated with matching logic but not deployed.
4. **`consent_grants` table unused:** The richer consent system with proper binding exists but is not integrated. Future migration needed.
5. **Consents INSERT policy still allows any user to create consent for any athlete:** The binding prevents the consent from being effective, but the row still gets created. A future migration could add a trigger on `consents` to reject inserts from users without verified authority for that athlete.

# Security / RLS Baseline — NextUp Memphis Pre-v1.0

**Captured:** 2026-08-08
**Source:** Supabase MCP `get_security_posture` (public + storage schemas)
**Total Tables with RLS Enabled:** 29/29 (public) + 8/8 (storage) = 37/37

---

## RLS Status Summary

**All 29 public tables have RLS enabled.**
**All 8 storage tables have RLS enabled.**
**No views exist.**
**No SECURITY DEFINER functions exist.**

All 4 database functions use SECURITY INVOKER with search_path set (hardened):
- `create_sab_id` — INVOKER, search_path set, executes as `authenticated`
- `increment_athlete_stat` — INVOKER, search_path set, executes as `anon, authenticated`
- `increment_event_code_uses` — INVOKER, search_path set, executes as `authenticated`
- `validate_event_code` — INVOKER, search_path set, executes as `anon, authenticated`

---

## Access Control Matrix (Key Tables)

| Resource | Anonymous | Authenticated User | Linked Parent | Athlete (self) | Admin |
|---|---|---|---|---|---|
| athletes (active) | SELECT (public) | SELECT (public) | SELECT + UPDATE (linked) | SELECT + INSERT + UPDATE (own) | Full CRUD |
| athletes (non-active) | No access | No access (unless admin) | No access | SELECT + UPDATE (own) | Full CRUD |
| user_profiles | No access | SELECT + INSERT + UPDATE (own) | N/A | N/A | SELECT + UPDATE (all) |
| consents | No access | SELECT + INSERT + UPDATE (own) | N/A | N/A | SELECT (all) |
| journey_entries (approved/public) | SELECT | SELECT | N/A | SELECT | Full CRUD |
| journey_entries (pending/private) | No access | INSERT (pending/private only) | SELECT (linked athlete) | SELECT (own) | Full CRUD |
| media_uploads (approved) | SELECT | SELECT | N/A | N/A | Full CRUD |
| media_uploads (pending) | No access | SELECT (own) + INSERT (own) | N/A | N/A | Full CRUD |
| profile_update_requests | INSERT (pending only) | SELECT (own) + INSERT (pending only) | N/A | N/A | SELECT + UPDATE (all) |
| visibility_tags | SELECT | SELECT | N/A | N/A | Implied full (no explicit admin policy) |
| athlete_tags | SELECT | SELECT | N/A | INSERT (own) | Implied full |
| media_tags | SELECT | SELECT | N/A | INSERT (own) | Implied full |
| sab_ids | No access | SELECT + INSERT (own) | N/A | N/A | Full CRUD |
| support_plans (active) | SELECT | SELECT | N/A | N/A | No explicit admin policy |
| payments | No access | SELECT (own, via email match) | N/A | N/A | No explicit admin policy |
| support_access | No access | SELECT (own, via email match) | N/A | N/A | No explicit admin policy |
| athlete_signups (pending) | INSERT (pending only) | INSERT (pending only) | N/A | N/A | SELECT + UPDATE |
| agent_trigger_log | No access | No access | N/A | N/A | SELECT + INSERT |
| audit_logs | No access | No access | N/A | N/A | SELECT + INSERT |
| tasks | No access | SELECT (own) | N/A | N/A | Full CRUD |
| guardians | No access | SELECT (own) | N/A | N/A | Full CRUD |

---

## Key Policy Details

### athletes — 9 policies

1. **Public can view active athletes** — SELECT, roles: anon+authenticated, using: `profile_status = 'active'`
2. **Athletes can view own profile** — SELECT, roles: authenticated, using: `auth.uid() = auth_user_id`
3. **Admins can view all athletes** — SELECT, roles: authenticated, using: JWT role = 'admin'
4. **Athletes can insert own profile** — INSERT, roles: authenticated, check: `auth.uid() = auth_user_id`
5. **Admins can insert athletes** — INSERT, roles: authenticated, check: JWT role = 'admin'
6. **Athletes can update own profile** — UPDATE, roles: authenticated, using+check: `auth.uid() = auth_user_id`
7. **Parents can update linked athlete profile** — UPDATE, roles: authenticated, using+check: EXISTS user_profiles WHERE `up.id = auth.uid() AND up.athlete_id = athletes.id AND up.role = 'parent'`
8. **Admins can update athletes** — UPDATE, roles: authenticated, using+check: JWT role = 'admin'
9. **Admins can delete athletes** — DELETE, roles: authenticated, using: JWT role = 'admin'

**KNOWN FUTURE AUTHORITY REFACTOR — DO NOT CHANGE IN PHASE 0:**
Policy #7 ("Parents can update linked athlete profile") grants broad UPDATE access to any parent linked to an athlete. This will be replaced in a later phase by a scoped AuthorityToAct model (per data_category × action). This policy must NOT be changed during Phase 0.

### user_profiles — 5 policies

1. **Users can read own profile** — SELECT, using: `auth.uid() = id`
2. **Admins can read all user profiles** — SELECT, using: JWT role = 'admin'
3. **Users can insert own profile** — INSERT, check: `auth.uid() = id`
4. **Users can update own profile** — UPDATE, using+check: `auth.uid() = id`
5. **Admins can update all user profiles** — UPDATE, using+check: JWT role = 'admin'

### consents — 4 policies

1. **Users can view own consent records** — SELECT, using: `auth.uid() = user_id`
2. **Admins can read all consents** — SELECT, using: JWT role = 'admin'
3. **Users can insert own consent records** — INSERT, check: `auth.uid() = user_id`
4. **Users can update own consent records** — UPDATE, using+check: `auth.uid() = user_id`

### journey_entries — 7 policies

1. **public_read_approved_public** — SELECT, anon+authenticated, using: `status = 'approved' AND visibility = 'public'`
2. **owner_read_own_entries** — SELECT, authenticated, using: `created_by = auth.uid() OR EXISTS user_profiles WHERE id = auth.uid() AND athlete_id = journey_entries.athlete_id`
3. **admin_read_all_entries** — SELECT, authenticated, using: JWT role = 'admin'
4. **authenticated_insert_pending_entries** — INSERT, authenticated, check: `status = 'pending' AND visibility = 'private' AND auth.uid() IS NOT NULL`
5. **admin_insert_entries** — INSERT, authenticated, check: JWT role = 'admin'
6. **admin_update_entries** — UPDATE, authenticated, using+check: JWT role = 'admin'
7. **admin_delete_entries** — DELETE, authenticated, using: JWT role = 'admin'

### media_uploads — 6 policies

1. **Public can view approved media** — SELECT, anon+authenticated, using: `status = 'approved'`
2. **Uploaders can view own uploads** — SELECT, authenticated, using: `auth.uid() = uploader_id`
3. **Admins can view all media** — SELECT, authenticated, using: JWT role = 'admin'
4. **Uploaders can insert media** — INSERT, authenticated, check: `auth.uid() = uploader_id`
5. **Admins can update media** — UPDATE, authenticated, using+check: JWT role = 'admin'
6. **Admins can delete media** — DELETE, authenticated, using: JWT role = 'admin'

### profile_update_requests — 4 policies

1. **Anyone can submit a profile update request** — INSERT, anon+authenticated, check: `status = 'pending'`
2. **Users can view own update requests** — SELECT, authenticated, using: `auth.uid() = submitted_by_user_id`
3. **Admins can read profile update requests** — SELECT, authenticated, using: JWT role = 'admin'
4. **Admins can update profile update request status** — UPDATE, authenticated, using+check: JWT role = 'admin'

### sab_ids — 5 policies

1. **Owners can read own SAB IDs** — SELECT, authenticated, using: `auth.uid() = user_id`
2. **Admins can read all SAB IDs** — SELECT, authenticated, using: EXISTS user_profiles WHERE role = 'admin'
3. **Authenticated users can insert own SAB IDs** — INSERT, authenticated, check: `auth.uid() = user_id`
4. **Admins can insert SAB IDs** — INSERT, authenticated, check: EXISTS user_profiles WHERE role = 'admin'
5. **Admins can update SAB IDs** — UPDATE, authenticated, using+check: EXISTS user_profiles WHERE role = 'admin'

### support_plans — 2 policies

1. **Anyone can read active support plans** — SELECT, anon+authenticated, using: `active = true`
2. **Anyone can view active support plans** — SELECT, anon+authenticated, using: `active = true` (duplicate)

### payments — 2 policies

1. **Supporter can view own payments** — SELECT, authenticated, using: `supporter_id IN supporters WHERE lower(email) = lower(JWT email)`
2. **Supporters can read own payments** — SELECT, authenticated, using: `supporter_id IN supporters WHERE email = auth.users email` (variant)

### support_access — 2 policies

1. **Supporter can view own access** — SELECT, authenticated, using: same email-match pattern as payments
2. **Supporters can read own access** — SELECT, authenticated, using: same email-match pattern (variant)

---

## Storage Object Policies

| Policy | Command | Roles | Condition |
|---|---|---|---|
| Authenticated users can upload athlete photos | INSERT | authenticated | `bucket_id = 'athlete-photos'` |
| Authenticated users can upload athlete videos | INSERT | authenticated | `bucket_id = 'athlete-videos'` |
| Authenticated users can upload profile assets | INSERT | authenticated | `bucket_id = 'profile-assets'` |
| Public can access athlete photo objects | SELECT | anon+authenticated | `bucket_id = 'athlete-photos' AND name IS NOT NULL AND name <> ''` |
| Public can access athlete video objects | SELECT | anon+authenticated | `bucket_id = 'athlete-videos' AND name IS NOT NULL AND name <> ''` |
| Public can access profile asset objects | SELECT | anon+authenticated | `bucket_id = 'profile-assets' AND name IS NOT NULL AND name <> ''` |
| Uploaders can delete own athlete photos | DELETE | authenticated | `bucket_id = 'athlete-photos' AND auth.uid()::text = storage.foldername(name)[1]` |

**Note:** No DELETE policies for athlete-videos or profile-assets buckets. No UPDATE policies for any bucket.

---

## Pre-Existing Security Observations

1. **Duplicate policies on support_plans** — Two identical SELECT policies ("Anyone can read" and "Anyone can view") exist. Harmless but redundant.
2. **Duplicate policies on payments and support_access** — Two variants of the same SELECT policy using different email-matching approaches. Harmless but redundant.
3. **No explicit admin policies on support_plans** — No admin INSERT/UPDATE/DELETE policies. Admin management of support plans may rely on service role or Supabase dashboard.
4. **No explicit admin policies on payments** — Same as above.
5. **No DELETE policies for athlete-videos and profile-assets storage buckets** — Only athlete-photos has a delete policy.
6. **Parent→athlete broad UPDATE access** — Marked as KNOWN FUTURE AUTHORITY REFACTOR above. Not a defect in the current context, but will be replaced by scoped authority in a later phase.
7. **visibility_tags has no explicit admin INSERT/UPDATE/DELETE policy** — Admin management may rely on service role.

---

## Confirmation

No access-control policy was changed during Phase 0.

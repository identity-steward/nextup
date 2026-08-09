# Database Baseline — NextUp Memphis Pre-v1.0

**Captured:** 2026-08-08
**Source:** Supabase MCP `get_security_posture`, `execute_sql` (row counts)
**Total Tables:** 29 (public schema)
**Total Migrations:** 38

---

## Row Count Baseline

| Table | Current Count | Phase 1 Audit Count | Match? |
|---|---|---|---|
| athletes | 7 | 7 | YES |
| creators | 1 | 1 | YES |
| user_profiles | 6 | 6 | YES |
| visibility_tags | 48 | 48 | YES |
| athlete_tags | 20 | 20 | YES |
| journey_entries | 10 | 10 | YES |
| media_uploads | 4 | 4 | YES |
| consents | 4 | 4 | YES |
| profile_update_requests | 8 | 8 | YES |
| support_plans | 11 | 11 | YES |
| sab_ids | 3 | 3 | YES |
| media_tags | 2 | 2 | YES |
| athlete_signups | 2 | 2 | YES |
| event_codes | 1 | 1 | YES |
| testimonials | 0 | not reported | NEW DISCOVERY |
| agent_trigger_log | 0 | not reported | YES (was 0) |
| audit_logs | 0 | not reported | YES |
| creator_applications | 0 | not reported | YES |
| guardians | 0 | not reported | YES |
| media_pass_requests | 0 | not reported | YES |
| needs_manual_review | 0 | not reported | YES |
| parent_intake | 0 | not reported | YES |
| payments | 0 | not reported | YES |
| signup_sources | 0 | not reported | YES |
| support_access | 0 | not reported | YES |
| supporter_signups | 0 | not reported | YES |
| supporters | 0 | not reported | YES |
| tasks | 0 | not reported | YES |
| team_inquiries | 0 | not reported | YES |

**Discrepancies:** None. All counts match the Phase 1 audit where counts were reported. The `testimonials` table was not mentioned in the Phase 1 audit but exists with 0 rows — this is a new discovery, not a discrepancy.

---

## Table Documentation

### user_profiles
- **Purpose:** Stores authenticated user accounts with role, display name, phone, and optional athlete linkage
- **Primary Key:** `id` (uuid, matches `auth.users.id`)
- **Key Foreign Keys:** `athlete_id` → `athletes.id`
- **RLS:** Enabled
- **Policies:** 5 (admin read all, admin update all, user insert own, user read own, user update own)
- **Row Count:** 6
- **Pilot 001 Disposition:** PROTECT — will be EXTEND_LATER to add navigator/person roles

### athletes
- **Purpose:** Youth athlete profiles with sports, school, stats, media, and visibility
- **Primary Key:** `id` (uuid)
- **Key Foreign Keys:** `auth_user_id` → `auth.users.id`
- **RLS:** Enabled
- **Policies:** 9 (admin CRUD, athlete self CRUD, parent update linked, public view active)
- **Row Count:** 7
- **Pilot 001 Disposition:** PROTECT — core youth platform data

### consents
- **Purpose:** Consent records for media/data usage
- **Primary Key:** `id` (uuid)
- **Key Foreign Keys:** `user_id` → `auth.users.id`
- **RLS:** Enabled
- **Policies:** 4 (admin read all, user insert own, user update own, user view own)
- **Row Count:** 4
- **Pilot 001 Disposition:** EXTEND_LATER — will add recipient, purpose, data_categories, duration columns

### journey_entries
- **Purpose:** Journey/documentation entries for athletes (game logs, milestones, updates)
- **Primary Key:** `id` (uuid)
- **Key Foreign Keys:** `athlete_id` → `athletes.id`, `created_by` → `auth.users.id`
- **RLS:** Enabled
- **Policies:** 7 (admin CRUD, authenticated insert pending-private, owner read, public read approved-public)
- **Row Count:** 10
- **Pilot 001 Disposition:** PROTECT — may be EXTEND_LATER for pathway/outcome tracking

### media_uploads
- **Purpose:** Media uploads (photos, videos) for athlete profiles
- **Primary Key:** `id` (uuid)
- **Key Foreign Keys:** `uploader_id` → `auth.users.id`, `athlete_id` → `athletes.id`
- **RLS:** Enabled
- **Policies:** 6 (admin CRUD, public view approved, uploader insert, uploader view own)
- **Row Count:** 4
- **Pilot 001 Disposition:** PROTECT — youth media pipeline, must remain distinct from Pilot 001 document handling

### visibility_tags
- **Purpose:** Character-strength/visibility tags for youth profiles
- **Primary Key:** `id` (uuid)
- **RLS:** Enabled
- **Policies:** 2 (public read all, admin manage)
- **Row Count:** 48
- **Pilot 001 Disposition:** PROTECT — youth character-strength system

### athlete_tags
- **Purpose:** Links athletes to visibility tags
- **Primary Key:** `id` (uuid)
- **Key Foreign Keys:** `athlete_id` → `athletes.id`, `tag_id` → `visibility_tags.id`
- **RLS:** Enabled
- **Policies:** 3 (public read, admin manage, owner insert)
- **Row Count:** 20
- **Pilot 001 Disposition:** PROTECT — youth character-strength assignments

### media_tags
- **Purpose:** Links media uploads to visibility tags
- **Primary Key:** `id` (uuid)
- **Key Foreign Keys:** `media_upload_id` → `media_uploads.id`, `tag_id` → `visibility_tags.id`
- **RLS:** Enabled
- **Policies:** 3 (public read, admin manage, uploader insert)
- **Row Count:** 2
- **Pilot 001 Disposition:** PROTECT — youth media tagging

### support_plans
- **Purpose:** Stripe support plan definitions (monthly recurring, one-time gifts)
- **Primary Key:** `id` (uuid)
- **RLS:** Enabled
- **Policies:** 2 (public read active — two duplicate policies)
- **Row Count:** 11
- **Pilot 001 Disposition:** LEAVE_UNTOUCHED — Stripe infrastructure preserved but hidden from public UI in Pilot 001

### payments
- **Purpose:** Payment records linked to Stripe checkouts
- **Primary Key:** `id` (uuid)
- **Key Foreign Keys:** `supporter_id` → `supporters.id`
- **RLS:** Enabled
- **Policies:** 2 (supporter view own — two variants, one via JWT email, one via auth.users lookup)
- **Row Count:** 0
- **Pilot 001 Disposition:** LEAVE_UNTOUCHED — Stripe infrastructure preserved

### support_access
- **Purpose:** Access control for supporter content/features
- **Primary Key:** `id` (uuid)
- **Key Foreign Keys:** `supporter_id` → `supporters.id`
- **RLS:** Enabled
- **Policies:** 2 (supporter view own — two variants, same as payments)
- **Row Count:** 0
- **Pilot 001 Disposition:** LEAVE_UNTOUCHED — Stripe infrastructure preserved

### sab_ids
- **Purpose:** SAB (Supporter-Athlete-Brand) ID tracking for consent/usage provenance
- **Primary Key:** `id` (uuid)
- **Key Foreign Keys:** `athlete_id`, `user_id`, `media_upload_id`, `creator_id`, `event_code_id`
- **RLS:** Enabled
- **Policies:** 5 (admin CRUD, authenticated insert own, owner read own)
- **Row Count:** 3
- **Pilot 001 Disposition:** PROTECT — consent tracking system

### athlete_signups
- **Purpose:** Athlete signup form submissions
- **Primary Key:** `id` (uuid)
- **RLS:** Enabled
- **Policies:** 3 (admin view/update, anyone insert pending)
- **Row Count:** 2
- **Pilot 001 Disposition:** LEAVE_UNTOUCHED — will be replaced by `/start` flow later

### creator_applications
- **Purpose:** Creator application form submissions
- **Primary Key:** `id` (uuid)
- **RLS:** Enabled
- **Policies:** 3 (admin view, anyone insert pending, owner view own)
- **Row Count:** 0
- **Pilot 001 Disposition:** ARCHIVE_FUNCTIONALITY

### creators
- **Purpose:** Creator profiles (content creators, not athletes)
- **Primary Key:** `id` (uuid)
- **RLS:** Enabled
- **Policies:** 4 (admin CRUD, public view active, owner CRUD)
- **Row Count:** 1
- **Pilot 001 Disposition:** ARCHIVE_FUNCTIONALITY

### event_codes
- **Purpose:** Event codes for athlete signup validation
- **Primary Key:** `id` (uuid)
- **RLS:** Enabled
- **Policies:** 5 (admin manage, authenticated validate, public validate)
- **Row Count:** 1
- **Pilot 001 Disposition:** LEAVE_UNTOUCHED

### guardians
- **Purpose:** Guardian records for athletes
- **Primary Key:** `id` (uuid)
- **RLS:** Enabled
- **Policies:** 3 (admin manage, owner view own)
- **Row Count:** 0
- **Pilot 001 Disposition:** EXTEND_LATER — may support household/authority model

### media_pass_requests
- **Purpose:** Media pass request form submissions
- **Primary Key:** `id` (uuid)
- **RLS:** Enabled
- **Policies:** 3 (admin view, anyone insert pending, owner view own)
- **Row Count:** 0
- **Pilot 001 Disposition:** ARCHIVE_FUNCTIONALITY

### needs_manual_review
- **Purpose:** Flagged records requiring manual review
- **Primary Key:** `id` (uuid)
- **RLS:** Enabled
- **Policies:** 3 (admin manage, owner view own)
- **Row Count:** 0
- **Pilot 001 Disposition:** LEAVE_UNTOUCHED

### parent_intake
- **Purpose:** Parent intake form submissions
- **Primary Key:** `id` (uuid)
- **RLS:** Enabled
- **Policies:** 3 (admin view, anyone insert pending, owner view own)
- **Row Count:** 0
- **Pilot 001 Disposition:** LEAVE_UNTOUCHED — will be replaced by `/start` flow later

### profile_update_requests
- **Purpose:** Profile update requests submitted by athletes/parents for admin review
- **Primary Key:** `id` (uuid)
- **RLS:** Enabled
- **Policies:** 4 (admin read/update, anyone insert pending, user view own)
- **Row Count:** 8
- **Pilot 001 Disposition:** PROTECT — may be EXTEND_LATER for narration confirmation pattern

### signup_sources
- **Purpose:** Tracking signup source attribution
- **Primary Key:** `id` (uuid)
- **RLS:** Enabled
- **Policies:** 3 (admin manage, owner view own)
- **Row Count:** 0
- **Pilot 001 Disposition:** LEAVE_UNTOUCHED

### supporter_signups
- **Purpose:** Supporter signup form submissions
- **Primary Key:** `id` (uuid)
- **RLS:** Enabled
- **Policies:** 3 (admin view, anyone insert pending, owner view own)
- **Row Count:** 0
- **Pilot 001 Disposition:** LEAVE_UNTOUCHED

### supporters
- **Purpose:** Supporter records (donors/sponsors)
- **Primary Key:** `id` (uuid)
- **RLS:** Enabled
- **Policies:** 5 (admin manage, self view via email)
- **Row Count:** 0
- **Pilot 001 Disposition:** LEAVE_UNTOUCHED — Stripe infrastructure preserved

### tasks
- **Purpose:** Agent/system task tracking
- **Primary Key:** `id` (uuid)
- **RLS:** Enabled
- **Policies:** 3 (admin manage, owner view own)
- **Row Count:** 0
- **Pilot 001 Disposition:** ARCHIVE_FUNCTIONALITY — tied to agent system

### team_inquiries
- **Purpose:** Team/school partnership inquiry submissions
- **Primary Key:** `id` (uuid)
- **RLS:** Enabled
- **Policies:** 3 (admin view, anyone insert pending, owner view own)
- **Row Count:** 0
- **Pilot 001 Disposition:** ARCHIVE_FUNCTIONALITY

### testimonials
- **Purpose:** Testimonials/supporter quotes
- **Primary Key:** `id` (uuid)
- **RLS:** Enabled
- **Policies:** 3 (public read, admin manage, owner insert)
- **Row Count:** 0
- **Pilot 001 Disposition:** LEAVE_UNTOUCHED
- **Note:** Not mentioned in Phase 1 audit — new discovery, not a discrepancy

### agent_trigger_log
- **Purpose:** Log of agent trigger events
- **Primary Key:** `id` (uuid)
- **RLS:** Enabled
- **Policies:** 2 (admin read, admin insert)
- **Row Count:** 0
- **Pilot 001 Disposition:** ARCHIVE_FUNCTIONALITY — tied to agent system

### audit_logs
- **Purpose:** Audit log records
- **Primary Key:** `id` (uuid)
- **RLS:** Enabled
- **Policies:** 2 (admin read, admin insert)
- **Row Count:** 0
- **Pilot 001 Disposition:** LEAVE_UNTOUCHED — may support disclosure logging later

---

## Storage Buckets

| Bucket ID | Public | Policies | Pilot 001 Disposition |
|---|---|---|---|
| athlete-photos | true | 4 (authenticated upload, public read, uploader delete) | PROTECT |
| athlete-videos | true | 1 (authenticated upload, public read) | PROTECT |
| profile-assets | true | 1 (authenticated upload, public read) | PROTECT |

---

## Database Functions

| Function | Security | Search Path | Execute Roles | Pilot 001 Disposition |
|---|---|---|---|---|
| `create_sab_id` | INVOKER | Set (hardened) | authenticated | PROTECT |
| `increment_athlete_stat` | INVOKER | Set (hardened) | anon, authenticated | PROTECT |
| `increment_event_code_uses` | INVOKER | Set (hardened) | authenticated | LEAVE_UNTOUCHED |
| `validate_event_code` | INVOKER | Set (hardened) | anon, authenticated | LEAVE_UNTOUCHED |

All functions are SECURITY INVOKER (not DEFINER) with search_path set (hardened). No security concerns.

---

## Confirmation

No schema or production-data changes were made during Phase 0.

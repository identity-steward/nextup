# Pilot 001 — Preflight Report

**Date:** 2026-08-09
**Result:** PASS
**Checks:** 15 / 15 passed

---

## Check 1: Production build passes

**Result: PASS**

- `npm run build` completed successfully (exit 0)
- 1656 modules transformed, built in 15.43s
- Output: dist/index.html, CSS (95.51 kB), JS (855.68 kB)

## Check 2: Typecheck/lint — no new regressions

**Result: PASS**

- Typecheck: 1 pre-existing error (`AdminJourneyEntriesPage.tsx` — unused `EntryIcon` import). Existed before Phase 5. Not a regression.
- Lint: 11 pre-existing errors (all in older files: AdminMediaPage, AdminJourneyEntriesPage, etc.). Zero new errors from Phase 0-5 work.

## Check 3: Phase 0-5 feature flags have expected values

**Result: PASS**

| Flag | Expected | Actual |
|------|----------|--------|
| NEXTUP_V1_PUBLIC_NAV | true | true |
| NEXTUP_V1_START_FLOW | true | true |
| NEXTUP_V1_PRIVATE_APP | true | true |
| NEXTUP_V1_NAVIGATOR | true | true |
| NEXTUP_V1_PATHWAYS | true | true |
| NEXTUP_V1_TRUST | true | true |
| NEXTUP_V1_OUTCOMES | true | true |
| LIVE_FEED | false | false |
| CREATORS | false | false |
| SCHOOLS | false | false |
| AGENT_OPS | false | false |
| LIVE_ATHLETE_ADMIN | false | false |
| PUBLIC_STRIPE_SUPPORT | false | false |
| YOUTH_MEDIA_UPLOADS | true | true |

All 7 V1 flags enabled. All 6 archived flags disabled. YOUTH_MEDIA_UPLOADS preserved as true.

## Check 4: RLS enabled on all Pilot 001 household tables

**Result: PASS**

All 20 Pilot 001 tables have RLS enabled:

| Table | RLS |
|-------|-----|
| persons | true |
| households | true |
| household_memberships | true |
| person_narrations | true |
| needs | true |
| navigator_assignments | true |
| authority_to_act | true |
| youth_assents | true |
| consent_grants | true |
| disclosures | true |
| document_references | true |
| escalations | true |
| incidents | true |
| pathways | true |
| funding_options | true |
| funding_gates | true |
| referrals | true |
| contact_attempts | true |
| outcomes | true |
| barrier_events | true |

## Check 5: Cross-household isolation remains enforced

**Result: PASS**

- All household-scoped tables use `household_memberships` JOIN `persons` WHERE `auth_user_id = auth.uid()` for SELECT policies.
- Navigator-scoped tables require active `navigator_assignments` matching the household.
- No policies grant access to all households or bypass the household membership check.
- Zero anon-accessible policies on any Pilot 001 table (verified via pg_policies query — empty result set).

## Check 6: Unassigned navigator cannot enumerate household information

**Result: PASS**

- Navigator SELECT policies on all household-scoped tables require `EXISTS (SELECT 1 FROM navigator_assignments na WHERE na.household_id = <table>.household_id AND na.navigator_user_id = auth.uid() AND na.assignment_status = 'active')`.
- An unassigned navigator has no matching `navigator_assignments` rows, so all such SELECTs return zero rows.
- No policy allows navigators to enumerate households they are not assigned to.

## Check 7: Admin routes remain admin-protected

**Result: PASS**

- `ProtectedRoute` component checks `user.app_metadata.role === 'admin'` when `requireAdmin` is true.
- Non-admin users are shown an "Access Restricted" page and redirected.
- All `/admin/*` routes in App.tsx use `<ProtectedRoute requireAdmin>`.
- RLS admin policies check `(auth.jwt() -> 'app_metadata' ->> 'role') = 'admin'` at the database level.

## Check 8: Narration trigger still protects submitted original_text

**Result: PASS**

- Trigger `trg_protect_narration_original` is active on `person_narrations` (tgenabled = 'O' = origin, enabled).
- This trigger prevents modification of `original_text` after a narration is submitted.

## Check 9: Referral transition trigger is active

**Result: PASS**

- Trigger `trg_referral_transition_guard` is active on `referrals` (tgenabled = 'O').
- The trigger function `guard_referral_transition()` checks:
  - Allowed state transitions (CASE statement with all valid paths)
  - Disclosure must have status='sent' before referral can transition to 'sent'
  - Timestamps (sent_at, received_at, acknowledged_at, closed_at) are set only on appropriate transitions

## Check 10: Pathway-confirmed-Need trigger is active

**Result: PASS**

- Trigger `trg_pathway_confirmed_need` is active on `pathways` (tgenabled = 'O').
- The trigger function `guard_pathway_confirmed_need()` checks that the referenced need has `status = 'confirmed'` before allowing INSERT.
- EXECUTE revoked from anon/authenticated — trigger-only access.

## Check 11: Disclosure delivery constraints are active

**Result: PASS**

Three CHECK constraints verified active on `disclosures`:

| Constraint | Rule |
|-----------|------|
| `disclosures_status_check` | status IN ('prepared', 'delivery_pending', 'sent', 'failed', 'cancelled') |
| `disclosures_sent_requires_delivery` | status='sent' requires delivery_method IS NOT NULL AND sent_at IS NOT NULL AND delivered_by_user_id IS NOT NULL |
| `disclosures_sent_at_only_when_sent` | sent_at IS NULL OR status='sent' |

## Check 12: No sensitive-document upload pathway exists

**Result: PASS**

- Query for tables matching `%upload%`, `%file_storage%`, `%document_vault%`, `%attachment%` returned only `media_uploads` (the existing youth media table).
- No document upload, file storage, or attachment tables exist in the Pilot 001 schema.
- No storage bucket references in any Phase 2-5 migration for document storage.

## Check 13: document_references remains metadata-only

**Result: PASS**

- Columns: id, person_id, household_id, document_type, existence_status, holder, needed_for, last_confirmed_at, notes, created_at, updated_at.
- No file columns, no storage_path, no signed_url, no binary data, no artifact_url.
- The table records only that a document exists and who holds it — never the document itself.

## Check 14: Youth media storage has not been repurposed

**Result: PASS**

- `media_uploads` table retains its original schema (athlete_id, uploader_id, media_type, bucket, storage_path, public_url, file_name, file_size_bytes, caption, status, admin_notes, reviewed_at, is_featured, visibility_tags, source_type, creator_id, event_code, consent_status, usage_scope, featured, approved_by, approved_at, display_order).
- No Pilot 001 migration modified this table.
- No Phase 2-5 code references this table.
- The table remains scoped to athlete/creator media, not Pilot 001 household documents.

## Check 15: Existing Youth & Opportunity data remains unchanged

**Result: PASS**

| Table | Row Count |
|-------|-----------|
| athletes | 7 |
| athlete_signups | 2 |
| creators | 1 |
| media_uploads | 4 |
| testimonials | 0 |

These counts match the pre-Pilot baseline. No Pilot 001 migration modified or deleted data from these tables.

---

## Summary

| # | Check | Result |
|---|-------|--------|
| 1 | Production build passes | PASS |
| 2 | Typecheck/lint no new regressions | PASS |
| 3 | Feature flags correct | PASS |
| 4 | RLS enabled on all 20 Pilot 001 tables | PASS |
| 5 | Cross-household isolation enforced | PASS |
| 6 | Unassigned navigator cannot enumerate | PASS |
| 7 | Admin routes admin-protected | PASS |
| 8 | Narration original_text trigger active | PASS |
| 9 | Referral transition trigger active | PASS |
| 10 | Pathway-confirmed-Need trigger active | PASS |
| 11 | Disclosure delivery constraints active | PASS |
| 12 | No sensitive-document upload pathway | PASS |
| 13 | document_references metadata-only | PASS |
| 14 | Youth media storage not repurposed | PASS |
| 15 | Youth & Opportunity data unchanged | PASS |

**All 15 preflight checks passed. No privacy/security isolation failures. Pilot 001 test execution may proceed.**

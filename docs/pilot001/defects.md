# Pilot 001 — Defect Tracker

**Date started:** 2026-08-09
**Status:** 1 defect recorded (P0 — FIXED). Test B: 0 defects. Test C: 0 defects. Test D: 0 defects. Test E: 0 defects. Test F: 0 defects introduced. 1 pre-existing P2 finding recorded (F-NO-FUNDING-GUARD, OPEN). Test G: 1 P1 finding recorded (G-NO-DB-TRUST-GUARD, OPEN). Test H: 4 findings recorded (H-NO-AUTHORITY-LINK P1 OPEN, H-NO-DURATION P2 OPEN, H-NO-DELIVERY-UI P2 OPEN, H-WILL-NOT-SHARE-SERVICE P3 OPEN).

---

## Defect Template (copy per defect)

```
### DEFECT ID: D-001

- **Severity:** P0 / P1 / P2 / P3
- **Test ID:** [e.g., A3]
- **Description:** [what is wrong]
- **Reproduction steps:**
  1. [step]
  2. [step]
  3. [step]
- **Expected:** [what should happen]
- **Actual:** [what actually happens]
- **Privacy/security impact:** [none / description]
- **Workaround:** [if any]
- **Status:** OPEN / IN PROGRESS / FIXED / WONTFIX
- **Required before Pilot 002?:** yes / no
```

---

## Severity Definitions

| Severity | Meaning |
|----------|---------|
| P0 | STOP PILOT — Privacy leak, cross-household access, unauthorized disclosure, narration corruption, fabricated external action |
| P1 | CRITICAL BEFORE PILOT 002 — Trust control failure, misleading authority/eligibility/funding representation, major workflow break |
| P2 | IMPORTANT — Significant confusion, unnecessary burden, missing workflow state |
| P3 | IMPROVEMENT — Copy, layout, convenience, minor friction |

P0 findings stop Pilot 001 immediately.

---

## Defects

### DEFECT ID: D-001

- **Severity:** P0
- **Test ID:** A3
- **Description:** Infinite RLS recursion between `households` and `household_memberships` SELECT policies. The `select_own_memberships` policy on `household_memberships` had a self-referential subquery — it queried `household_memberships` itself to check if the user is in the same household. When `select_own_household` on `households` (which queries `household_memberships`) fired during INSERT ... RETURNING, it triggered `select_own_memberships`, which queried `household_memberships` again — infinite recursion. This blocked ALL household creation, making the entire Pilot 001 flow impossible.
- **Reproduction steps:**
  1. Sign in as any authenticated user
  2. Create a person record (INSERT INTO persons)
  3. Attempt to create a household (INSERT INTO households) — the INSERT ... RETURNING triggers the SELECT policy on `households`, which queries `household_memberships`, which triggers `select_own_memberships`, which queries `household_memberships` again — infinite recursion
- **Expected:** Household INSERT succeeds, RETURNING returns the new row
- **Actual:** `ERROR: infinite recursion detected in policy for relation "household_memberships"`
- **Privacy/security impact:** Not a privacy leak — the opposite. The RLS policies were too restrictive (self-referential), blocking ALL household creation. No data was exposed. However, this made the entire application non-functional for Pilot 001.
- **Workaround:** None — the application cannot function without household creation.
- **Status:** FIXED
- **Required before Pilot 002?:** yes (already fixed)
- **Fix applied:** Migration `20260809180000_pilot001_fix_household_rls_recursion`. Rewrote `select_own_household` on `households` to only check `created_by_person_id` against `persons` (no reference to `household_memberships`). Rewrote `select_own_memberships` on `household_memberships` to check own person_id OR household creator via `households` JOIN `persons` (no self-reference to `household_memberships`). This breaks the recursion cycle while preserving cross-household isolation.
- **Verification:** Test A re-run after fix — A3 PASS, A5 PASS, A6 PASS (cross-household isolation still enforced), A7 PASS (navigator isolation still enforced), O6 PASS (anonymous still blocked).

---

### FINDING ID: F-NO-FUNDING-GUARD

- **Severity:** P2
- **Test ID:** F (identified during Test F preparation, not introduced by Test F execution)
- **Description:** The funding model currently allows technically valid but semantically misleading combinations through direct service/database update paths. Specifically: (1) `applicability_status = confirmed_applicable` while an unresolved blocking FundingGate exists; (2) `assertion_type = approved` without recorded external approval evidence; (3) `payment_status = paid` without an actual payment event; (4) `payment_status = reimbursed` without an actual reimbursement event. No DB trigger or application-level validation prevents these combinations. CHECK constraints only validate enum values, not cross-field or cross-table consistency.
- **Reproduction steps:**
  1. Create a FundingOption with a blocking FundingGate in `needs_verification` status
  2. Directly UPDATE the FundingOption setting `applicability_status = confirmed_applicable` (or `assertion_type = approved`, or `payment_status = paid`)
  3. The UPDATE succeeds — no guard blocks it
- **Expected:** The system should prevent `confirmed_applicable` while blocking gates are unresolved, `approved` without evidence, and `paid`/`reimbursed` without a payment event.
- **Actual:** All four misleading combinations are accepted by the database and application service layer.
- **Privacy/security impact:** None directly — this is a semantic/trust issue, not a data leak.
- **Workaround:** No participant-facing or navigator-facing funding management UI currently exposes these state changes. No automatic process creates these combinations. The risk is organizational, not automatic.
- **Status:** OPEN — do not fix during Test F.
- **Required before:** Any navigator funding-management UI or Pilot 002 expansion that operationalizes these statuses. Evidence-backed transition rules must be enforced before these states can be set through ordinary application behavior.
- **Why this matters:** The labels "Confirmed applicable", "Approved", "Paid", and "Reimbursed" represent external facts and should eventually require evidence-backed transition rules.

### FINDING ID: G-NO-DB-TRUST-GUARD

- **Severity:** P1
- **Test ID:** G (identified during Test G preparation, not introduced by Test G execution)
- **Description:** The participant-facing Share flow correctly checks AuthorityToAct and YouthAssent before allowing sharing, but the trust boundary is not enforced at the service/database layer. Current direct-client paths can potentially: (1) create a ConsentGrant without a valid AuthorityToAct record; (2) create a Disclosure without a valid AuthorityToAct record; (3) create a Disclosure while YouthAssent blocks sharing; (4) rely on household RLS membership without proving authority. Additionally, a direct Disclosure INSERT can set status='sent' without the full Phase 3.1 delivery proof (delivery_method, sent_at, delivered_by_user_id). The CHECK constraint `(sent_at IS NULL) OR (status = 'sent')` only prevents updating sent_at on a non-sent row, not a direct INSERT with status='sent' and sent_at set.
- **Reproduction steps:**
  1. Using the Supabase client with an authenticated household member's JWT, call `createConsentGrant()` directly — no AuthorityToAct record is checked or required
  2. Call `prepareDisclosure()` directly — no authority or youth assent check is performed
  3. Direct INSERT into disclosures with status='sent' and sent_at=now() succeeds — delivery_method and delivered_by_user_id are not required by any constraint
- **Expected:** Authority/assent/consent checks must be enforced beneath the UI so that direct client calls cannot bypass the trust boundary. Disclosure status='sent' must require delivery_method, sent_at, and delivered_by_user_id.
- **Actual:** `createConsentGrant()` and `prepareDisclosure()` in trustService.ts perform no authority or youth assent check. RLS allows household members to INSERT into consent_grants and disclosures. No DB trigger prevents disclosure creation without authority.
- **Privacy/security impact:** A technically sophisticated user with the authenticated key could create consent grants and disclosures without authority, bypassing the trust boundary. This is a P1 trust control failure, not a P0 data leak (no cross-household access is possible — RLS still scopes to own household).
- **Workaround:** No navigator/admin UI exposes direct consent or disclosure creation outside the SharePage flow. No automatic process creates these records without the hard-stop check. The risk is from direct API access, not normal application behavior.
- **Status:** OPEN — do not fix during Test G.
- **Required before:** Pilot 002. Authority/assent/consent checks must be enforced at the service or database layer (SECURITY DEFINER functions or DB triggers) so that direct client calls cannot bypass the trust boundary. Disclosure status='sent' must require full delivery proof.
- **Why this matters:** Household membership is not authority. Consent is not authority. Authority is not youth assent. These are distinct legal/trust concepts that must not be bypassable by direct API calls.

### FINDING ID: H-NO-AUTHORITY-LINK

- **Severity:** P1
- **Test ID:** H (identified during Test H preparation)
- **Description:** The normal SharePage checks AuthorityToAct before approval, but the ConsentGrant created after approval does not store the authority_to_act_id that satisfied that check. SharePage calls `createConsentGrant()` without passing `authorityToActId` (line 99-107). The `createConsentGrant` function accepts `opts?.authorityToActId` but SharePage does not provide it. The consent is created with `authority_to_act_id = null`.
- **Reproduction steps:**
  1. Complete the SharePage flow with a valid AuthorityToAct record
  2. Click "Approve Sharing" — `handleApprove` calls `createConsentGrant` without `authorityToActId`
  3. Inspect the created ConsentGrant — `authority_to_act_id` is null
- **Expected:** Consent creation should preserve the specific authority record used for the authorization decision.
- **Actual:** `authority_to_act_id` is null on every ConsentGrant created via SharePage.
- **Privacy/security impact:** The consent cannot later be traced directly to the authority record that made the share permissible. This is a provenance gap — auditors cannot verify which authority authorized a given consent.
- **Workaround:** The authority_to_act record exists in the household and can be queried separately, but the link is not explicit.
- **Status:** OPEN — do not fix during Test H.
- **Required before:** Pilot 002. Consent creation should preserve the specific authority record used for the authorization decision.
- **Why this matters:** Without an explicit link, the audit trail from consent back to authority is broken. In a legal review, you cannot prove which authority authorized which consent.

### FINDING ID: H-NO-DURATION

- **Severity:** P2
- **Test ID:** H (identified during Test H preparation)
- **Description:** The current SharePage does not collect or pass `expires_at` when creating ConsentGrant. `createConsentGrant` accepts `opts?.expiresAt` but SharePage does not pass it (line 106). The consent is active with no expiry. WHO, WHY, and WHAT are captured, but DURATION is not explicitly captured.
- **Reproduction steps:**
  1. Complete the SharePage flow and approve sharing
  2. Inspect the created ConsentGrant — `expires_at` is null
  3. Navigate to `/app/privacy` — Active Permissions shows no expiry date
- **Expected:** Add participant-visible consent duration/expiration semantics appropriate to the use case and professional review.
- **Actual:** Consent remains active until manually revoked. No expiry is set.
- **Privacy/security impact:** A consent with no expiry remains active indefinitely. The participant may not realize the consent persists until explicitly revoked.
- **Workaround:** `revokeConsentGrant()` exists in the service layer, but no UI exposes revocation to the participant.
- **Status:** OPEN — do not fix during Test H.
- **Required before:** Pilot 002. Add participant-visible consent duration/expiration semantics appropriate to the use case and professional review.
- **Why this matters:** Consent without a duration dimension is incomplete. WHO/WHY/WHAT/DURATION are all required for a valid consent record.

### FINDING ID: H-NO-DELIVERY-UI

- **Severity:** P2
- **Test ID:** H (identified during Test H preparation)
- **Description:** `startDelivery()`, `confirmDelivery()`, `failDelivery()`, and `cancelDisclosure()` exist in the service layer (trustService.ts), but no navigator/admin UI exposes the delivery lifecycle. No navigator UI exists to advance a disclosure from prepared → delivery_pending → sent.
- **Reproduction steps:**
  1. Complete SharePage flow — disclosure is created as 'prepared'
  2. Search for any navigator/admin UI that calls `startDelivery` or `confirmDelivery` — none found
- **Expected:** Build controlled navigator delivery workflow.
- **Actual:** Delivery lifecycle functions are callable only via direct service calls. Pilot 001 must validate delivery states programmatically.
- **Privacy/security impact:** Without a UI, navigators cannot manage delivery through the intended workflow. This is the same class of finding as F-NO-FUNDING-UI and G-NO-TRUST-UI.
- **Workaround:** Direct service function calls or SQL can exercise the lifecycle for testing.
- **Status:** OPEN — do not fix during Test H.
- **Required before:** Pilot 002. Build controlled navigator delivery workflow.
- **Why this matters:** A disclosure stuck in 'prepared' with no way to advance through the delivery lifecycle is not usable in production.

### FINDING ID: H-WILL-NOT-SHARE-SERVICE

- **Severity:** P3
- **Test ID:** H (identified during Test H preparation)
- **Description:** `buildDisclosurePreview()` returns `willNotShare: []` (line 498). SharePage recomputes WILL NOT SHARE client-side from `AVAILABLE_FIELDS.filter((f) => !preview.willShare.includes(f))` (line 346). The visible UI is correct, but disclosure-preview semantics are split between service and presentation layers.
- **Reproduction steps:**
  1. Call `buildDisclosurePreview()` — inspect the returned `willNotShare` field — it is always `[]`
  2. Inspect SharePage review screen — WILL NOT SHARE is computed client-side and displayed correctly
- **Expected:** The service should return the computed `willNotShare` list, not force the UI to recompute it.
- **Actual:** The service returns an empty array; the UI compensates.
- **Privacy/security impact:** None — the UI is correct. This is a code quality / separation-of-concerns issue.
- **Workaround:** None needed — the UI computes the correct list.
- **Status:** OPEN — do not fix during Test H.
- **Required before:** No hard requirement. Consider refactoring before Pilot 002.
- **Why this matters:** If a different UI client uses `buildDisclosurePreview()` without recomputing `willNotShare`, it will display an empty WILL NOT SHARE list. The service should be the single source of truth.

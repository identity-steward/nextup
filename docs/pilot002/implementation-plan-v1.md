# PILOT 002 — IMPLEMENTATION PLAN v1

---

## 1. Implementation Objective

Build the minimum Pilot 002 workflow through the application UI:

**confirmed need → pathway → authority → participant sharing approval → disclosure delivery → referral sent → participant privacy/sharing-history understanding**

The service layer (`trustService.ts`, `pathwayService.ts`) and database schema (trust, disclosure, navigation migrations) are substantially complete. The implementation gap is concentrated in two areas:

1. **Two P1 database-level integrity gaps** (consent-authority enforcement, cross-household reference checks)
2. **Six P2 UI gaps** (all four target pages plus PrivacyPage are 1–9 line stubs)

Routing is already wired for all target pages. No new routes are needed.

---

## 2. Current-Gap Map

### What Exists (Pilot 001 + service layer)

| Layer | Status | Details |
|-------|--------|---------|
| Database schema | Complete | `authority_to_act`, `youth_assent`, `consent_grants`, `disclosures` (Phase 3 + 3.1), `pathways`, `referrals` (Phase 4) all exist with RLS policies |
| Disclosure delivery proof | Enforced | CHECK constraint `disclosures_sent_requires_delivery` blocks `status='sent'` without `delivery_method + sent_at + delivered_by_user_id` |
| Referral transition guard | Enforced | Trigger `guard_referral_transition` blocks referral → `sent` unless linked disclosure is `sent` |
| Pathway confirmed-need guard | Enforced | Trigger `guard_pathway_confirmed_need` blocks pathway INSERT unless need is `confirmed` |
| RLS household isolation | Enforced | All navigator-mediated tables scope SELECT/INSERT/UPDATE by `household_id` via household membership or navigator assignment subqueries |
| Service layer — trust | Complete (726 lines) | `createAuthority`, `createConsentGrant` (accepts `authorityToActId`), `prepareDisclosure`, `startDelivery`, `confirmDelivery`, `buildDisclosurePreview`, `checkAuthorityHardStops` |
| Service layer — pathway | Complete (660 lines) | `createPathway`, `getEligibilityPathways`, `createReferralDraft`, `updateReferralStatus`, `linkReferralToDisclosure` |
| Type layer | Complete | `ConsentGrant.authority_to_act_id`, `Disclosure` delivery fields, `Referral.disclosure_id` + `consent_grant_id` all typed |
| Routing | Complete | `/app/share`, `/app/pathways`, `/app/privacy`, `/admin/trust`, `/admin/pathways` all registered and protected |

### What Is Missing

| Gap | Finding | Layer | Description |
|-----|---------|-------|-------------|
| Consent-authority DB enforcement | G-NO-DB-TRUST-GUARD (P1) | Database | `consent_grants.authority_to_act_id` is nullable; no CHECK or trigger requires it to be non-null or to match the same household. A navigator can INSERT a consent_grant with null authority via direct API. |
| Cross-household reference check | I-NO-CONSENT-DISCLOSURE-HOUSEHOLD-CHECK (P2) | Database | No check that `referrals.disclosure_id` belongs to the same `household_id` as the referral, or that `consent_grants.authority_to_act_id` belongs to the same household. RLS scopes each row independently but does not validate cross-row household consistency. |
| Navigator pathway creation UI | E-NO-CREATION-UI (P2) | UI | `PathwaysPage.tsx` is a 1-line stub. No UI to view confirmed needs, select a service/provider from the catalog, or create a pathway. |
| Navigator authority creation UI | G-NO-TRUST-UI (P2) | UI | `AdminTrustPage.tsx` is a 9-line stub. No UI to create authority-to-act records. |
| Participant sharing approval UI | G-NO-TRUST-UI (P2) | UI | `SharePage.tsx` is a 1-line stub. No UI for participant to view sharing proposal, see authority is satisfied, and approve sharing (creating consent grant with authority link). |
| Disclosure delivery UI | H-NO-DELIVERY-UI (P2) | UI | `SharePage.tsx` (same stub). No UI for navigator to prepare disclosure, start delivery, confirm delivery with proof. |
| Referral creation UI | I-NO-REFERRAL-CREATION-UI (P2) | UI | `PathwaysPage.tsx` (same stub). No UI for navigator to create a referral after disclosure is sent, or for UI to prevent referral creation before disclosure is sent (U2 transition guard). |
| Privacy history UI | N-NO-PRIVACY-HISTORY-UI (P2) | UI | `PrivacyPage.tsx` is a 1-line stub. No UI for participant to view sharing history with who/why/what/what-not/status/timestamps/recorder/active-revoked. |

---

## 3. Finding → Test-Case → Implementation Traceability

| Finding | Severity | Affected Test Cases | Required Property (from frozen test design) | Implementation Surface | Smallest Change Sufficient |
|---------|----------|--------------------|----------------------------------------------|------------------------|---------------------------|
| G-NO-DB-TRUST-GUARD | P1 | W1, W2 | W1: prohibited state (consent without authority) cannot be created through authenticated UI-bypass access. W2: prohibited state (disclosure `sent` without delivery proof) cannot be created through authenticated UI-bypass access. | Database (consent_grants table). Disclosures already enforced by CHECK constraint. | Add a CHECK constraint or trigger on `consent_grants` requiring `authority_to_act_id IS NOT NULL` when `status='active'`. The test design permits any enforcement mechanism (CHECK, trigger, RLS, SECURITY DEFINER). The disclosure delivery-proof property is already satisfied by `disclosures_sent_requires_delivery` CHECK. |
| H-NO-AUTHORITY-LINK | P1 | S3, AA1 | Consent grant must have populated `authority_to_act_id` referencing a valid authority in the same household. | Database (consent_grants table) + UI (SharePage). | DB: same CHECK/trigger as above ensures the field is populated. UI: SharePage must pass the authority ID when calling `createConsentGrant`. The service function already accepts `authorityToActId` — no service change needed. |
| I-NO-CONSENT-DISCLOSURE-HOUSEHOLD-CHECK | P2 | Y1, Y2, Y3 | Cross-household referral (A referral referencing B disclosure) cannot be created. Cross-household consent (A consent referencing B authority) cannot be created. | Database (referrals + consent_grants tables). | Add a trigger or CHECK constraint on `referrals` verifying `disclosures.household_id = referrals.household_id` when `disclosure_id` is set. Add same on `consent_grants` verifying `authority_to_act.household_id = consent_grants.household_id` when `authority_to_act_id` is set. |
| E-NO-CREATION-UI | P2 | Q1, Q2 | Navigator views confirmed needs and creates pathway through UI. | UI (PathwaysPage). Service: `createPathway` exists. | Build PathwaysPage with: confirmed needs list, pathway creation form (service/provider/eligibility from catalog), submission calling `createPathway`. |
| G-NO-TRUST-UI | P2 | R1, S1 | Navigator creates authority-to-act through UI. SharePage recognizes authority and permits sharing. | UI (AdminTrustPage or navigator workflow area, SharePage). Service: `createAuthority`, `checkAuthorityHardStops`, `buildDisclosurePreview` exist. | Build authority creation UI in the navigator workflow. Build SharePage to call `buildDisclosurePreview` and render the sharing proposal when authority is satisfied. |
| H-NO-DELIVERY-UI | P2 | T1, T2, T3 | Navigator prepares, starts, confirms delivery through UI. | UI (SharePage or navigator disclosure area). Service: `prepareDisclosure`, `startDelivery`, `confirmDelivery` exist. | Build disclosure delivery UI with three steps: prepare (content + recipient), start (delivery method), confirm (delivery proof). |
| I-NO-REFERRAL-CREATION-UI | P2 | U1, U2 | Navigator creates referral through UI after disclosure sent. UI prevents referral before disclosure sent. | UI (PathwaysPage or navigator referral area). Service: `createReferralDraft`, `updateReferralStatus`, `linkReferralToDisclosure` exist. DB: `guard_referral_transition` trigger enforces disclosure-sent gate. | Build referral creation UI. For U2, check disclosure status in the UI before allowing referral creation attempt; the DB trigger is the backstop. |
| N-NO-PRIVACY-HISTORY-UI | P2 | V1–V10, AA1 | Participant views privacy history showing who/why/what/what-not/prepared-vs-sent/when/who-recorded/active-vs-revoked. Answers 8 questions without navigator assistance. | UI (PrivacyPage). Service: `getDisclosures`, `getConsentGrants` (or a new aggregation function) exist. | Build PrivacyPage aggregating consent grants + disclosures + referrals into a human-readable sharing history. Must display all 8 data points from the V10 comprehension questions. |

---

## 4. Ordered Implementation Phases

### Phase 1 — Database Integrity (P1 + P2 integrity gaps)

**Rationale**: The two P1 findings (G-NO-DB-TRUST-GUARD, H-NO-AUTHORITY-LINK) and the P2 cross-household check (I-NO-CONSENT-DISCLOSURE-HOUSEHOLD-CHECK) are database-level constraints. They must be in place before UI work because the UI relies on the service layer, which relies on the schema. Building UI on top of an unenforced schema would mean the security tests (W1, W2, Y1, Y2) fail regardless of UI quality.

**Work items**:

| Item | Finding | Description | Migration approach |
|------|---------|-------------|-------------------|
| 1a | G-NO-DB-TRUST-GUARD, H-NO-AUTHORITY-LINK | Add enforcement that `consent_grants.authority_to_act_id` must be non-null when `status='active'`. | Add a CHECK constraint: `CHECK (status != 'active' OR authority_to_act_id IS NOT NULL)`. This is the smallest change. A trigger that also validates the authority belongs to the same household is an alternative but CHECK is simpler. The test design permits any enforcement mechanism. |
| 1b | I-NO-CONSENT-DISCLOSURE-HOUSEHOLD-CHECK | Add cross-household validation for consent→authority and referral→disclosure. | Add a trigger on `consent_grants` (BEFORE INSERT/UPDATE) that checks `authority_to_act.household_id = consent_grants.household_id` when `authority_to_act_id` is set. Add a trigger on `referrals` (BEFORE INSERT/UPDATE) that checks `disclosures.household_id = referrals.household_id` when `disclosure_id` is set. Both raise `check_violation` on mismatch. |

**Security/integrity considerations**:
- Item 1a: The CHECK constraint must allow `status='draft'` with null authority (drafts may not yet have authority linked). Only `status='active'` requires the link. This matches the frozen workflow: authority is created first, then sharing is approved (creating active consent with the link).
- Item 1b: Triggers must be SECURITY DEFINER (to query the referenced table regardless of caller RLS) with `search_path = public`. EXECUTE should be revoked from `anon`/`authenticated` (trigger-only use, same pattern as existing `guard_referral_transition` and `guard_pathway_confirmed_need`).
- Neither item drops columns, changes column types, or renames tables. Both are additive constraints.

**Evidence of completion**:
- `consent_grants` INSERT with `status='active'` and null `authority_to_act_id` is rejected.
- `consent_grants` INSERT with `authority_to_act_id` referencing a different household is rejected.
- `referrals` INSERT with `disclosure_id` referencing a different household is rejected.
- Existing Pilot 001 records are not affected (no Pilot 001 records exist in these tables per the Pilot 001 debrief).

**Professional/domain decision checkpoint**: None. The frozen classification says the consent+disclosure transaction decision is REQUIRED BEFORE EXECUTION, not before implementation. The self-authorization and guardian/parent decisions are NOT REQUIRED. Implementation can proceed.

---

### Phase 2 — Navigator Workflow UI (parallelizable)

**Rationale**: Once the database enforces integrity, the UI layer can be built. The navigator workflow UI (pathway creation, authority creation, disclosure delivery, referral creation) and the participant UI (SharePage, PrivacyPage) can be developed in parallel because they call independent service functions and render different pages.

**Work items** (can be parallelized across 2 tracks):

#### Track A — Navigator Workflow (E-NO-CREATION-UI, G-NO-TRUST-UI, H-NO-DELIVERY-UI, I-NO-REFERRAL-CREATION-UI)

| Item | Finding | Page | Description | Service calls |
|------|---------|------|-------------|---------------|
| 2a | E-NO-CREATION-UI | PathwaysPage | Navigator sees confirmed needs for assigned households; selects a need; selects service/provider/eligibility from catalog; creates pathway. | `getNeeds` (narrationService), `getServices`, `getProviders`, `getEligibilityPathways`, `createPathway` |
| 2b | G-NO-TRUST-UI | Navigator trust area (within PathwaysPage or AdminTrustPage) | Navigator creates authority-to-act for a household/person/pathway. | `createAuthority`, `getAuthorityRecords` |
| 2c | H-NO-DELIVERY-UI | Navigator disclosure area (within SharePage or a dedicated navigator view) | Navigator prepares disclosure (content + recipient), starts delivery (method), confirms delivery (proof). | `prepareDisclosure`, `startDelivery`, `confirmDelivery`, `getDisclosures` |
| 2d | I-NO-REFERRAL-CREATION-UI | Navigator referral area (within PathwaysPage) | Navigator creates referral draft, links to sent disclosure, updates status to sent. UI checks disclosure status before allowing creation (U2). | `createReferralDraft`, `linkReferralToDisclosure`, `updateReferralStatus`, `getDisclosures` |

**Dependencies within Track A**:
- 2a (pathway) must be built first — 2b (authority) references a pathway, 2d (referral) references a pathway.
- 2b (authority) must be built before 2c (disclosure) can be fully tested — `buildDisclosurePreview` checks for authority.
- 2c (disclosure) must be built before 2d (referral) — referral requires sent disclosure.
- **Serial order within track**: 2a → 2b → 2c → 2d

#### Track B — Participant UI (G-NO-TRUST-UI [SharePage portion], N-NO-PRIVACY-HISTORY-UI)

| Item | Finding | Page | Description | Service calls |
|------|---------|------|-------------|---------------|
| 2e | G-NO-TRUST-UI | SharePage | Participant views sharing proposal (what/who/why), sees authority is satisfied (no hard-stop), approves sharing (creates consent grant with authority link). | `buildDisclosurePreview`, `checkAuthorityHardStops`, `createConsentGrant` (with `authorityToActId`), `getAuthorityRecords` |
| 2f | N-NO-PRIVACY-HISTORY-UI | PrivacyPage | Participant views sharing history: who shared with, why, what shared, what NOT shared, prepared-vs-sent, delivery timestamp, who recorded delivery, active-vs-revoked. | `getConsentGrants`, `getDisclosures`, plus a new aggregation function or inline join to produce the privacy history view |

**Dependencies within Track B**:
- 2e (SharePage) depends on 2b (authority) existing in the navigator track — the participant can only approve sharing after the navigator has created authority. But the UI can be built independently; it just can't be tested end-to-end until authority exists.
- 2f (PrivacyPage) depends on the full workflow producing records — but the UI can be built independently and tested with pre-existing records.
- **Parallel order**: 2e and 2f can be built simultaneously.

**Cross-track parallelization**: Track A and Track B can proceed in parallel. The only cross-track dependency is for end-to-end testing (AA1), which requires both tracks complete.

---

### Phase 3 — Privacy History Aggregation Service

**Rationale**: PrivacyPage (2f) needs a service function that aggregates consent grants, disclosures, and referrals into a unified privacy history view. The existing `getConsentGrants` and `getDisclosures` return raw records; the UI needs a joined, human-readable view.

| Item | Description | Service calls |
|------|-------------|---------------|
| 3a | Create `getPrivacyHistory(householdId)` in trustService (or a new privacyService). Joins consent_grants → disclosures → referrals by household. Returns an array of privacy history entries with all 8 V10 data points: recipient name, purpose, data categories (what shared), willNotShare (what NOT shared), disclosure status (prepared vs sent), delivered_at, delivered_by user name, consent status (active vs revoked). | `getConsentGrants`, `getDisclosures`, plus user name resolution for `delivered_by_user_id` |

**Dependencies**: 3a is a prerequisite for 2f (PrivacyPage UI). It can be built in parallel with Phase 1 and Track A.

---

### Phase 4 — Integration and AA1 Readiness

**Rationale**: After all UI components and service functions are built, verify the full workflow can execute continuously. This is not a test execution — it is implementation completeness verification.

| Item | Description |
|------|-------------|
| 4a | Verify the workflow can be executed end-to-end through the UI: navigator creates pathway → authority → participant approves sharing → navigator prepares/starts/confirms delivery → navigator creates referral → participant views privacy history. |
| 4b | Verify the UI prevents referral creation before disclosure is sent (U2 property). |
| 4c | Verify SharePage passes `authorityToActId` when creating consent (S3 property). |
| 4d | Verify PrivacyPage displays all 8 V10 data points. |

---

## 5. Parallelizable Work Summary

| Work | Can Parallelize With | Rationale |
|------|---------------------|-----------|
| Phase 1 (DB integrity) | Nothing — must be first | UI depends on schema being correct |
| Track A (navigator UI) | Track B (participant UI), Phase 3 (privacy service) | Independent pages, independent service calls |
| Track B (participant UI) | Track A (navigator UI), Phase 3 (privacy service) | Independent pages |
| Phase 3 (privacy aggregation) | Track A, Track B | New service function, no dependency on UI |
| Phase 4 (integration) | Nothing — must be last | Requires all prior phases complete |

**Recommended implementation order**: Phase 1 → (Track A + Track B + Phase 3 in parallel) → Phase 4

---

## 6. Security/Integrity Work Detail

### 6a. Consent-Authority Enforcement (G-NO-DB-TRUST-GUARD, H-NO-AUTHORITY-LINK)

**Current state**: `consent_grants.authority_to_act_id` is a nullable FK. RLS allows household members and navigators to INSERT. No CHECK or trigger requires the field to be populated.

**Required property**: A navigator cannot create an active consent grant without a valid authority reference through direct API access (W1). Every active consent grant links to an authority-to-act record (S3).

**Smallest change**: Add a CHECK constraint:
```sql
ALTER TABLE consent_grants
  ADD CONSTRAINT consent_grants_active_requires_authority
  CHECK (status != 'active' OR authority_to_act_id IS NOT NULL);
```

This allows `status='draft'` with null authority (drafts are pre-approval) but blocks `status='active'` without authority. The test design permits any enforcement mechanism — this CHECK is the simplest.

**What this does NOT prescribe**: The test design explicitly does not require a specific trigger, RLS policy, or SECURITY DEFINER function. A CHECK constraint is sufficient. If the team prefers a trigger that also validates household match, that is also acceptable but not required by the test design.

### 6b. Cross-Household Reference Check (I-NO-CONSENT-DISCLOSURE-HOUSEHOLD-CHECK)

**Current state**: RLS policies scope each table by `household_id` independently. No check validates that cross-row references (referral→disclosure, consent→authority) stay within the same household. A navigator assigned to both households could create a Household A referral referencing a Household B disclosure.

**Required property**: Cross-household referral (Y1) and cross-household consent (Y2) cannot be created.

**Smallest change**: Add two triggers:

1. On `consent_grants` (BEFORE INSERT/UPDATE): when `authority_to_act_id` is set, query `authority_to_act.household_id` and verify it matches `NEW.household_id`. Raise `check_violation` on mismatch.

2. On `referrals` (BEFORE INSERT/UPDATE): when `disclosure_id` is set, query `disclosures.household_id` and verify it matches `NEW.household_id`. Raise `check_violation` on mismatch.

Both triggers must be SECURITY DEFINER with `search_path = public` and EXECUTE revoked from `anon`/`authenticated` (same pattern as existing guard functions).

**What this does NOT prescribe**: The test design does not prescribe triggers specifically. A CHECK constraint with a subquery is not possible in Postgres (CHECK constraints cannot reference other tables). A trigger is the natural mechanism. An alternative is a SECURITY DEFINER function that is the only path to INSERT/UPDATE these tables (revoking direct INSERT/UPDATE from RLS). Both approaches satisfy the test property.

### 6c. Disclosure Delivery Proof (already enforced)

**Current state**: The CHECK constraint `disclosures_sent_requires_delivery` already blocks `status='sent'` without `delivery_method + sent_at + delivered_by_user_id`. This satisfies W2's required property.

**No additional work needed** for W2 at the database level. The UI must populate these fields when confirming delivery (Track A item 2c).

---

## 7. UI Work Detail

### 7a. PathwaysPage (E-NO-CREATION-UI, I-NO-REFERRAL-CREATION-UI)

**Current**: 1-line stub.

**Required**: Two distinct views within the page (or separate sections):
1. **Confirmed needs → Pathway creation**: Navigator sees confirmed needs for assigned households, selects one, picks service/provider/eligibility from the seed catalog, creates pathway.
2. **Referral creation**: After disclosure is sent, navigator creates a referral linked to the pathway and sent disclosure. UI checks disclosure status and prevents creation if disclosure is not sent (U2).

**Service calls**: `getNeeds`, `getServices`, `getProviders`, `getEligibilityPathways`, `createPathway`, `getDisclosures`, `createReferralDraft`, `linkReferralToDisclosure`, `updateReferralStatus`

**Design considerations**:
- Use existing `PathwayDetail`, `PathwayCard`, `ReferralStatusCard` components for display.
- Pathway creation form should show service name, provider name, eligibility criteria in plain language (not UUIDs).
- Referral creation should show the disclosure recipient and status, and disable the "Create referral" button if disclosure is not `sent`.
- Match the visual style of existing admin pages (DashboardLayout, card-based layout, Tailwind).

### 7b. SharePage (G-NO-TRUST-UI, H-NO-DELIVERY-UI)

**Current**: 1-line stub.

**Required**: Two modes based on user role:
1. **Participant mode** (P1): Views sharing proposal, sees authority is satisfied (no hard-stop), approves sharing. Calls `buildDisclosurePreview` to check authority status. Calls `createConsentGrant` with the `authorityToActId` from the matched authority record.
2. **Navigator mode** (N1): Prepares disclosure, starts delivery, confirms delivery. Three-step flow calling `prepareDisclosure` → `startDelivery` → `confirmDelivery`.

**Service calls**: `buildDisclosurePreview`, `checkAuthorityHardStops`, `getAuthorityRecords`, `createConsentGrant`, `prepareDisclosure`, `startDelivery`, `confirmDelivery`, `getDisclosures`

**Design considerations**:
- Participant mode must show: what will be shared (data categories), who it will be shared with (recipient name), why (purpose), and whether authority is satisfied.
- If authority is NOT satisfied, show the trust hard-stop (Pilot 001 G1-G8 behavior).
- Navigator mode must show: disclosure content summary, delivery method selector, delivery confirmation with timestamp and delivered-by attribution.
- The `willNotShare` field is currently hardcoded to `[]` in `buildDisclosurePreview` (H-WILL-NOT-SHARE-SERVICE P3 accepted limitation). The UI must display "No items were explicitly excluded" when the list is empty (V5 requirement).

### 7c. AdminTrustPage (G-NO-TRUST-UI)

**Current**: 9-line stub.

**Required**: Navigator authority creation form. Navigator selects a household/person/pathway, specifies authority basis, action type, data category, and creates the authority record.

**Service calls**: `createAuthority`, `getAuthorityRecords`, `getNavigatorAssignments`

**Design considerations**:
- May be better placed in a navigator workflow area rather than admin area, since navigators (not admins) create authority records. However, the route `/admin/trust` is already wired. If the navigator role is separate from admin, a new route may be needed. For minimum Pilot 002, using the existing admin route with role check is sufficient.
- Show existing authority records for the selected household.
- Form fields: subject person, action type, data category, authority basis, verification status.

### 7d. PrivacyPage (N-NO-PRIVACY-HISTORY-UI)

**Current**: 1-line stub.

**Required**: Participant views sharing history with all 8 V10 data points visible and understandable without navigator assistance.

**Service calls**: `getPrivacyHistory` (new, Phase 3a) or inline calls to `getConsentGrants` + `getDisclosures`

**Design considerations**:
- Each sharing history entry must display:
  1. Who was shared with (recipient name — not UUID)
  2. Why sharing was approved (purpose — not code)
  3. What was shared (data categories / claim content summary)
  4. What was NOT shared (willNotShare or "No items were explicitly excluded")
  5. Prepared vs sent (disclosure status in plain language)
  6. When delivery occurred (delivered_at in human-readable date/time)
  7. Who recorded delivery (delivered_by user name — not UUID)
  8. Active vs revoked (consent status in plain language)
- Layout should be a timeline or card list, readable by a non-technical person.
- Must be navigable without navigator assistance (V10/AA1 comprehension requirement).

---

## 8. Professional/Domain Decision Checkpoints

| Decision | Frozen Classification | When It Matters | Implementation Impact |
|----------|----------------------|-----------------|----------------------|
| Self-authorization for adults | NOT REQUIRED FOR MINIMUM PILOT 002 | Does not affect implementation. The authority record's `actor_person_id` / `actor_user_id` fields are set by the UI. Whether the participant's own person ID is the authorizing actor is a domain decision that does not change the implementation — the field accepts any person ID. | None — implement without resolving. |
| Guardian/parent actor for youth | NOT REQUIRED FOR MINIMUM PILOT 002 | Only matters if R2/W3 are activated (youth participant). Adult-only topology means this is not exercised. | None — do not implement youth-assent UI. |
| Consent + disclosure transaction | REQUIRED BEFORE EXECUTION | If a partial failure occurs during test execution (consent created but disclosure preparation fails), the team must decide whether to treat it as a defect or accepted limitation. This does not affect implementation — the current code creates consent and disclosure as separate operations. | None for implementation. Flag for test execution team. |
| Claim attribution adequacy | NOT REQUIRED FOR MINIMUM PILOT 002 | The provenance language "Family's own description. Not verified by NextUp." is already in the disclosure content. The test verifies content is displayed, not legal adequacy. | None — use existing provenance language. |

**No implementation step requires resolving any professional/domain decision before proceeding.**

---

## 9. Implementation-Complete Entry Criteria for Test Execution

Before Pilot 002 test execution may begin, ALL of the following must be true:

### Database Integrity (Phase 1)

| Criterion | Verification |
|-----------|-------------|
| `consent_grants` INSERT with `status='active'` and null `authority_to_act_id` is rejected | Execute SQL: `INSERT INTO consent_grants (...status='active', authority_to_act_id=NULL...)` → expect constraint violation |
| `consent_grants` INSERT with `authority_to_act_id` referencing a different household is rejected | Execute SQL with mismatched household IDs → expect trigger violation |
| `referrals` INSERT with `disclosure_id` referencing a different household is rejected | Execute SQL with mismatched household IDs → expect trigger violation |
| Existing `disclosures_sent_requires_delivery` CHECK still functions | Execute SQL: `UPDATE disclosures SET status='sent' WHERE delivery_method IS NULL` → expect constraint violation |
| Pilot 001 records unchanged | Compare record counts before and after migration |

### Navigator UI (Track A)

| Criterion | Verification |
|-----------|-------------|
| Navigator can sign in and see confirmed needs for assigned households | Navigate to PathwaysPage as N1, verify needs are displayed |
| Navigator can create a pathway from a confirmed need through UI | Complete pathway creation form, verify record in database |
| Navigator can create authority-to-act through UI | Complete authority creation form, verify record in database |
| Navigator can prepare a disclosure through UI | Complete disclosure preparation, verify `status='prepared'` in database |
| Navigator can start delivery through UI | Complete delivery start, verify `status='delivery_pending'` in database |
| Navigator can confirm delivery through UI | Complete delivery confirmation, verify `status='sent'` + delivery proof fields in database |
| Navigator can create a referral through UI after disclosure sent | Complete referral creation, verify record with correct `disclosure_id` and `pathway_id` |
| UI prevents referral creation before disclosure is sent | Attempt referral creation with `status='prepared'` disclosure → UI blocks or displays message |

### Participant UI (Track B)

| Criterion | Verification |
|-----------|-------------|
| Participant can sign in and view SharePage | Navigate to SharePage as P1, verify sharing proposal is displayed |
| SharePage shows authority is satisfied (no hard-stop) when authority exists | Verify no hard-stop message when authority record exists |
| Participant can approve sharing through SharePage | Complete sharing approval, verify `consent_grants` record with `authority_to_act_id` populated and `status='active'` |
| Participant can access PrivacyPage | Navigate to PrivacyPage as P1, verify sharing history is displayed |
| PrivacyPage shows all 8 V10 data points | Verify recipient, purpose, what shared, what NOT shared, prepared-vs-sent, delivery timestamp, who recorded delivery, active-vs-revoked are all displayed |

### Privacy History Service (Phase 3)

| Criterion | Verification |
|-----------|-------------|
| `getPrivacyHistory(householdId)` returns entries with all 8 data points | Call function, verify output shape |

### Application Build

| Criterion | Verification |
|-----------|-------------|
| `npm run build` succeeds | No TypeScript errors, no build failures |
| `npm run typecheck` succeeds | No type errors |
| Application loads without console errors | Navigate to sign-in page, verify no errors |

---

## 10. Explicit Non-Goals

The following are explicitly excluded from this implementation plan. They must not be built, implemented, or scaffolded:

| Non-Goal | Rationale |
|----------|-----------|
| Funding management UI | Excluded by frozen scope. F-NO-FUNDING-UI and F-NO-FUNDING-GUARD do not intersect minimum Pilot 002. |
| Outcome reporting UI | Excluded by frozen scope. K-NO-OUTCOME-UI does not intersect minimum Pilot 002. |
| Barrier reporting UI | Excluded by frozen scope. L-NO-BARRIER-UI does not intersect minimum Pilot 002. |
| Contact-attempt recording UI | Excluded by frozen scope. Not in the minimum workflow. |
| Participant declines referral | Excluded by frozen scope. I-NO-PERSON-DECLINED-TRANSITION does not intersect minimum Pilot 002. |
| Consent revocation | Excluded by frozen scope. Not an entry or exit condition for minimum Pilot 002. |
| Full consent-duration semantics | Excluded by frozen scope. H-NO-DURATION does not intersect minimum Pilot 002. |
| Youth-assent implementation | Excluded by adult-only topology. R2/W3 are conditional and not exercised. Do not build youth-assent UI or bypass protection unless separately activated. |
| Pilot 001 modifications | Do not modify any Pilot 001 frozen records, test artifacts, or baseline data. |
| Service/provider catalog creation UI | Not needed for minimum Pilot 002. The seed catalog from Pilot 001 has eligible services. Catalog creation is admin tooling, not navigator workflow. |
| New routing | All routes are already wired. Do not add new routes. |
| Performance optimization | N+1 query patterns in existing services are noted but not in scope for minimum Pilot 002. |
| Automated interpretation generation | Interpretation remains navigator-proposed (Pilot 001 baseline). |

---

## 11. Finding → Phase → Dependency Summary

| Finding | Severity | Phase | Depends On | Test Cases |
|---------|----------|-------|------------|------------|
| G-NO-DB-TRUST-GUARD | P1 | Phase 1 (1a) | Nothing | W1, W2 |
| H-NO-AUTHORITY-LINK | P1 | Phase 1 (1a) + Phase 2 (2e) | 1a for DB; 2b for authority UI | S3, AA1 |
| I-NO-CONSENT-DISCLOSURE-HOUSEHOLD-CHECK | P2 | Phase 1 (1b) | Nothing | Y1, Y2, Y3 |
| E-NO-CREATION-UI | P2 | Phase 2 (2a) | Phase 1 | Q1, Q2 |
| G-NO-TRUST-UI | P2 | Phase 2 (2b, 2e) | 2a for pathway; Phase 1 for DB | R1, S1 |
| H-NO-DELIVERY-UI | P2 | Phase 2 (2c) | 2b for authority; 2e for consent | T1, T2, T3 |
| I-NO-REFERRAL-CREATION-UI | P2 | Phase 2 (2d) | 2c for disclosure | U1, U2 |
| N-NO-PRIVACY-HISTORY-UI | P2 | Phase 2 (2f) + Phase 3 (3a) | Phase 3 service; workflow records for testing | V1–V10, AA1 |

---

PILOT 002 IMPLEMENTATION PLAN v1 — AWAITING REVIEW

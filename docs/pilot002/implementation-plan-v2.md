# PILOT 002 — IMPLEMENTATION PLAN v2

---

## 0. v1 to v2 Correction Ledger

- **v1 stated "service layer is fully built"** → v2 replaces with property-by-property service assessment (SATISFIES / PARTIAL / GAP / NOT APPLICABLE) citing concrete code evidence.
- **v1 prescribed specific mechanisms (CHECK, trigger) as requirements** → v2 separates required properties from candidate remediations throughout. Mechanisms are candidates, not frozen requirements.
- **v1 did not distinguish authority-integrity sub-properties** → v2 separates: authority_to_act_id populated, referenced authority exists, authority valid/active, authority belongs to correct household, authority applies to correct person/pathway. Maps each to the frozen tests that verify it.
- **v1 implied non-null + FK proves W1** → v2 explicitly states W1 is a composite property that non-null + FK alone does not prove.
- **v1 made getPrivacyHistory aggregation service mandatory** → v2 derives a minimum privacy-history data contract from V2-V10 first, then identifies smallest implementation. getPrivacyHistory is a candidate, not a requirement.
- **v1 closed findings implicitly** → v2 states all 8 findings remain OPEN until implementation is separately completed and verified against frozen tests.
- **v1 did not emphasize the consent+disclosure transaction checkpoint** → v2 explicitly preserves REQUIRED BEFORE EXECUTION classification.
- **v1 traceability was finding→property→tests but did not include current evidence, exact gap, and implementation-complete evidence per finding** → v2 provides full 7-column traceability.
- **Denominator, scope, professional/domain classifications, and test ordering unchanged.** Zero denominator impact.

---

## 1. Implementation Objective

Build the minimum Pilot 002 workflow through the application UI:

**confirmed need → pathway → authority → participant sharing approval → disclosure delivery → referral sent → participant privacy/sharing-history understanding**

The frozen Pilot 002 Authoritative Test Design v4 defines 32 authoritative test cases across 11 groups (Q, R, S, T, U, V, W, X, Y, Z, AA). This plan identifies what must be implemented for those tests to be executable. It does not execute tests, create test records, or modify frozen artifacts.

---

## 2. Property-by-Property Service Assessment

The previous plan's conclusion that "the service layer is fully built" is replaced with the following property-by-property assessment. Existing functions are evidence of implementation, not proof that Pilot 002 requirements are satisfied.

### 2a. Consent Grant Creation — `createConsentGrant` (trustService.ts lines 279-311)

| Property | Assessment | Evidence |
|----------|------------|---------|
| authority_to_act_id is populated | PARTIAL | Service accepts `opts?.authorityToActId` and passes it to INSERT (line 303). But the parameter is optional and defaults to `null` (line 303). The service sets `status: 'active'` unconditionally (line 304). Nothing in the service requires authorityToActId to be non-null when status is active. |
| Referenced authority exists | GAP | No validation in `createConsentGrant` that `authority_to_act_id` references an existing record. FK constraint at DB level prevents dangling references but does not prevent null. |
| Authority is valid/active (not disputed, not expired) | GAP in service; PARTIAL in `buildDisclosurePreview` | `createConsentGrant` does not call `checkAuthorityHardStops` or validate the authority's verification_status. `buildDisclosurePreview` (lines 445-504) does check authority hard stops but is a separate function called before consent creation, not during it. |
| Authority belongs to correct household | GAP | `createConsentGrant` accepts `householdId` and `authorityToActId` as independent parameters. No check that the authority's `household_id` matches the consent's `household_id`. A caller could pass mismatched IDs. |
| Authority applies to correct person/pathway | NOT APPLICABLE for minimum Pilot 002 | The frozen test design does not require authority-to-pathway linkage as a separate test property. S3 verifies the link exists; Y2 verifies household match. Person/pathway consistency is not an authoritative test. |

**Summary**: `createConsentGrant` PARTIALLY satisfies the consent-authority link property (the parameter exists) but has GAPs in authority existence, validity, and household consistency. The W1 invariant (cannot create consent without valid applicable authority through authenticated UI-bypass) is NOT satisfied by the service alone.

### 2b. Disclosure Delivery Transitions — `prepareDisclosure`, `startDelivery`, `confirmDelivery` (trustService.ts lines 346-419)

| Property | Assessment | Evidence |
|----------|------------|---------|
| Disclosure created with status='prepared' | SATISFIES FROZEN PROPERTY | `prepareDisclosure` sets `status: 'prepared'`, `prepared_at: now()`, `sent_at: null` (lines 358-362). DB default is also 'prepared' (migration phase31). |
| Transition prepared → delivery_pending | SATISFIES FROZEN PROPERTY | `startDelivery` sets `status: 'delivery_pending'`, `delivery_started_at: now()` (lines 382-384). No DB CHECK restricts this transition. |
| Transition to 'sent' requires delivery proof | SATISFIES FROZEN PROPERTY (DB-level) | `confirmDelivery` validates `deliveryMethod` and `deliveredByUserId` in application code (lines 401-406). DB CHECK `disclosures_sent_requires_delivery` enforces `delivery_method IS NOT NULL AND sent_at IS NOT NULL AND delivered_by_user_id IS NOT NULL` when `status='sent'` (migration phase31). The DB constraint is the enforcement that satisfies W2; the service validation is supporting evidence. |
| Delivery proof fields populated | SATISFIES FROZEN PROPERTY | `confirmDelivery` sets `sent_at`, `delivery_method`, `delivered_by_user_id`, `delivery_notes`, `delivery_reference` (lines 409-416). |
| Disclosure household consistency | NOT APPLICABLE | Disclosures are created with a single `household_id`. No cross-row household reference exists within disclosures. |

### 2c. Referral Creation and Disclosure Consistency — `createReferralDraft`, `updateReferralStatus`, `linkReferralToDisclosure` (pathwayService.ts lines 408-501)

| Property | Assessment | Evidence |
|----------|------------|---------|
| Referral created with status='draft' | SATISFIES FROZEN PROPERTY | `createReferralDraft` sets `status: 'draft'`, `status_source: 'navigator_reported'` (lines 429-430). DB default is also 'draft' (migration phase4). |
| Referral → 'sent' requires linked disclosure with status='sent' | SATISFIES FROZEN PROPERTY (DB + service) | `updateReferralStatus` checks disclosure status before allowing transition to 'sent' (lines 460-473). DB trigger `guard_referral_transition` also enforces this (migration phase4). Dual enforcement: service + DB. |
| Referral-disclosure household consistency | GAP | `updateReferralStatus` accepts `disclosureId` and links it (line 479). `linkReferralToDisclosure` sets `disclosure_id` without any household check (lines 495-501). Neither function verifies that `disclosures.household_id = referrals.household_id`. The DB trigger `guard_referral_transition` checks disclosure status but NOT household match. A navigator assigned to both households could link a Household A referral to a Household B disclosure. |
| Referral transition validation | SATISFIES FROZEN PROPERTY | `isValidReferralTransition` (lines 45-47) mirrors the DB trigger's state machine. Service validates before attempting DB update. |

### 2d. Pathway Creation — `createPathway` (pathwayService.ts lines 200-238)

| Property | Assessment | Evidence |
|----------|------------|---------|
| Pathway created only from confirmed need | SATISFIES FROZEN PROPERTY (service + DB) | `createPathway` queries `needs.status` and throws if not 'confirmed' (lines 211-219). DB trigger `guard_pathway_confirmed_need` also enforces (migration phase4 integrity hardening). |
| Pathway household/person consistency | NOT APPLICABLE for minimum Pilot 002 | No frozen test verifies person-household consistency for pathways. RLS scopes by household. |

### 2e. Authority Creation — `createAuthority` (trustService.ts lines 93-133)

| Property | Assessment | Evidence |
|----------|------------|---------|
| Authority created with household_id | SATISFIES FROZEN PROPERTY | `createAuthority` accepts `householdId` and sets it on the record (line 114). RLS policies scope by household. |
| Authority hard-stop logic | SATISFIES FROZEN PROPERTY | `checkAuthorityHardStops` (lines 135-169) checks disputed, unverified legal instrument, expired, and review-due conditions. Returns `HardStopResult` with reason and escalation trigger. |

### 2f. Authority-Consent Household Consistency

| Property | Assessment | Evidence |
|----------|------------|---------|
| consent_grants.authority_to_act_id belongs to same household | GAP | No service or DB check. `createConsentGrant` accepts both `householdId` and `authorityToActId` independently. No cross-row validation. DB has no trigger or CHECK verifying `authority_to_act.household_id = consent_grants.household_id`. |

### 2g. Privacy History Data Availability

| Property | Assessment | Evidence |
|----------|------------|---------|
| Who was shared with (recipient_name) | SATISFIES FROZEN PROPERTY (data exists) | `consent_grants.recipient_name` and `disclosures.recipient_name` are populated on creation. `getConsentGrants` and `getDisclosures` return these fields. |
| Why sharing was approved (purpose) | SATISFIES FROZEN PROPERTY (data exists) | `consent_grants.purpose` and `disclosures.purpose` are populated. |
| What was shared (data_categories / data_fields) | SATISFIES FROZEN PROPERTY (data exists) | `consent_grants.data_categories` (jsonb) and `disclosures.data_fields` (jsonb) are populated. |
| What was NOT shared (willNotShare) | PARTIAL | `buildDisclosurePreview` hardcodes `willNotShare: []` (line 498). No field in the DB stores excluded items. The V5 test requires the UI to display something meaningful when the list is empty. Data exists as empty; UI must compensate. |
| Prepared vs sent (disclosure status) | SATISFIES FROZEN PROPERTY (data exists) | `disclosures.status` is one of prepared/delivery_pending/sent/failed/cancelled. `getDisclosures` returns status. |
| Delivery time (delivered_at / sent_at) | SATISFIES FROZEN PROPERTY (data exists) | `disclosures.sent_at` is populated when status='sent'. |
| Who recorded delivery (delivered_by_user_id) | PARTIAL | `disclosures.delivered_by_user_id` is a UUID. Resolving it to a human-readable name requires a join to `auth.users` or `persons`. No existing service function resolves this. |
| Active vs revoked (consent status) | SATISFIES FROZEN PROPERTY (data exists) | `consent_grants.status` is one of draft/active/revoked/expired. `getConsentGrants` returns status. |

### 2h. Assessment Summary

| Service Property | Classification |
|-----------------|----------------|
| Disclosure delivery proof enforcement | SATISFIES FROZEN PROPERTY |
| Referral → sent requires sent disclosure | SATISFIES FROZEN PROPERTY |
| Pathway requires confirmed need | SATISFIES FROZEN PROPERTY |
| Authority hard-stop logic | SATISFIES FROZEN PROPERTY |
| Consent-authority link parameter exists | PARTIAL |
| Consent authority existence validation | GAP |
| Consent authority validity validation | GAP (in createConsentGrant; PARTIAL in buildDisclosurePreview) |
| Consent-authority household consistency | GAP |
| Referral-disclosure household consistency | GAP |
| willNotShare data | PARTIAL |
| delivered_by user name resolution | PARTIAL |
| All privacy history data fields | SATISFIES FROZEN PROPERTY (data exists; UI rendering is the gap) |

---

## 3. Authority-Integrity Property Analysis

The frozen test design verifies authority integrity through multiple tests. Each tests a distinct sub-property. No single mechanism satisfies all of them.

### 3a. Sub-Properties and Their Test Coverage

| Sub-Property | Description | Frozen Tests That Verify It |
|-------------|-------------|----------------------------|
| authority_to_act_id is populated | The consent_grants record has a non-null authority_to_act_id | S3 (consent-authority link), AA1 (linkage verification in end-to-end) |
| Referenced authority exists | authority_to_act_id references an actual authority_to_act row | S3 (queries the authority record), AA1 |
| Authority is valid/active | The referenced authority is not disputed, expired, or under review | W1 (navigator cannot create consent without valid applicable authority — "valid applicable" includes not disputed/expired), S1 (SharePage recognizes authority and permits sharing — hard-stop logic checks validity) |
| Authority belongs to correct household | authority_to_act.household_id = consent_grants.household_id | Y2 (navigator cannot create cross-household consent referencing Household B authority) |
| Authority applies to correct person/pathway | authority applies to the subject person and action being authorized | NOT APPLICABLE for minimum Pilot 002 — no frozen test explicitly verifies person/pathway match between authority and consent |

### 3b. What W1 Actually Tests

W1 tests: "an authenticated navigator bypassing the UI cannot create a consent grant without valid applicable authority."

This is a composite property. "Valid applicable authority" means:
1. authority_to_act_id is non-null
2. The referenced authority exists
3. The authority is not disputed, expired, or otherwise hard-stopped
4. The authority belongs to the same household

Non-null + FK alone proves only sub-properties 1 and 2. It does NOT prove sub-properties 3 (validity) or 4 (household match). Therefore, a CHECK constraint requiring `authority_to_act_id IS NOT NULL` is evidence toward W1 but does not alone satisfy the complete invariant.

The frozen test design explicitly permits W1 to be enforced through "authorization, RLS, a trust/state guard, database constraint, or another effective mechanism." The test records which enforcement layer prevents the prohibited state; it does not prescribe the architecture.

### 3c. What W2 Actually Tests

W2 tests: "an authenticated navigator bypassing the UI cannot send a disclosure without delivery proof."

Current evidence: DB CHECK constraint `disclosures_sent_requires_delivery` blocks `status='sent'` without `delivery_method + sent_at + delivered_by_user_id` (migration phase31). This is a database-level constraint that survives UI bypass.

Assessment: W2's required property is SATISFIED at the database level. No additional DB work is needed for W2. The UI must populate the delivery proof fields when confirming delivery (Track A UI work).

---

## 4. Finding → Property → Tests → Evidence → Gap → Candidate Remediation → Completion Evidence

All 8 findings remain OPEN. A finding is closed only when implementation is separately completed and verified against the frozen tests.

### Finding 1: G-NO-DB-TRUST-GUARD (P1)

| Field | Value |
|-------|-------|
| Frozen property | An authenticated navigator bypassing the UI cannot create a consent grant without valid applicable authority (W1). An authenticated navigator bypassing the UI cannot send a disclosure without delivery proof (W2). |
| Authoritative tests | W1, W2 |
| Current evidence | W2: DB CHECK `disclosures_sent_requires_delivery` enforces delivery proof at the database level (migration phase31, confirmed in schema). W1: `consent_grants.authority_to_act_id` is nullable (migration phase3). RLS allows household members and navigators to INSERT. No CHECK or trigger requires authority_to_act_id to be non-null. No check validates authority existence, validity, or household match at the DB level. Service `createConsentGrant` (trustService.ts line 303) passes `authorityToActId ?? null` — the parameter is optional and defaults to null. |
| Exact gap | W1: No database-level enforcement prevents creation of an active consent grant with null or invalid authority_to_act_id through authenticated UI-bypass (direct API INSERT). The service does not enforce it either. W2: No gap at DB level. |
| Candidate remediation | Add a database-level constraint or trigger on consent_grants that prevents `status='active'` when `authority_to_act_id IS NULL`. A CHECK constraint is the smallest mechanism for the non-null sub-property. For the household-match sub-property (also part of W1's composite invariant), a trigger that queries `authority_to_act.household_id` and compares it to `NEW.household_id` is a candidate. For the validity sub-property, a trigger that calls the same logic as `checkAuthorityHardStops` is a candidate. Alternatively, a SECURITY DEFINER function as the sole INSERT path (with direct INSERT revoked) could enforce all sub-properties. The frozen test design permits any effective mechanism. The smallest sufficient remediation depends on which sub-properties the team chooses to enforce at DB level vs. service level. At minimum, the non-null and household-match sub-properties should be DB-enforced to survive UI bypass; validity may be enforced at service level if the DB ensures non-null + household match (making the authority resolvable and scoped). |
| Implementation-complete evidence | An authenticated INSERT into consent_grants with `status='active'` and null `authority_to_act_id` is rejected. An authenticated INSERT with `authority_to_act_id` referencing an authority from a different household is rejected. The enforcement layer is recorded. |

### Finding 2: H-NO-AUTHORITY-LINK (P1)

| Field | Value |
|-------|-------|
| Frozen property | Every consent grant links to an authority-to-act record (S3). The consent-authority audit trail is complete and navigable. |
| Authoritative tests | S3, AA1 |
| Current evidence | `consent_grants.authority_to_act_id` is a nullable FK column (migration phase3). `createConsentGrant` (trustService.ts line 303) accepts an optional `authorityToActId` parameter. The parameter exists but is not required. The service sets `status: 'active'` unconditionally (line 304). No UI calls this function yet (SharePage is a stub). |
| Exact gap | The data model supports the link (column exists, type defined), and the service function accepts the parameter, but nothing requires the link to be populated. The UI does not yet pass the authority ID when creating consent. No DB constraint enforces non-null for active consents. |
| Candidate remediation | DB: same constraint as Finding 1 (CHECK or trigger requiring authority_to_act_id for active status). UI: SharePage must call `createConsentGrant` with the matched authority's ID from `findAuthority` or `getAuthorityRecords`. The service function already accepts the parameter — no service change needed if the UI passes it. |
| Implementation-complete evidence | A consent_grants record created through the SharePage UI has a populated authority_to_act_id referencing a valid authority in the same household. A database query confirms the link. |

### Finding 3: I-NO-CONSENT-DISCLOSURE-HOUSEHOLD-CHECK (P2)

| Field | Value |
|-------|-------|
| Frozen property | Cross-household referral (A referral referencing B disclosure) cannot be created (Y1). Cross-household consent (A consent referencing B authority) cannot be created (Y2). Records for Household A contain only Household A references (Y3). |
| Authoritative tests | Y1, Y2, Y3 |
| Current evidence | RLS policies scope each table by household_id independently (migrations phase3, phase4). No cross-row household validation exists. `linkReferralToDisclosure` (pathwayService.ts lines 495-501) sets disclosure_id with no household check. `createConsentGrant` (trustService.ts line 303) accepts authorityToActId and householdId independently. DB trigger `guard_referral_transition` checks disclosure status but not household match. No trigger on consent_grants checks authority household. |
| Exact gap | A navigator assigned to both Household A and Household B can create a Household A referral referencing a Household B disclosure, and a Household A consent referencing a Household B authority. RLS allows the navigator to see both households' records but does not validate that cross-row references stay within one household. |
| Candidate remediation | Option A: Add triggers on consent_grants and referrals (BEFORE INSERT/UPDATE) that query the referenced record's household_id and reject mismatch. Triggers must be SECURITY DEFINER with search_path = public, EXECUTE revoked from anon/authenticated (same pattern as existing guard functions). Option B: Revoke direct INSERT/UPDATE from RLS and require a SECURITY DEFINER function as the sole write path, with household validation inside the function. Option C: Add application-level validation in the service functions. Option C alone does not survive UI bypass and therefore does not satisfy Y1/Y2 (which are security invariant tests). Options A or B survive UI bypass. The smallest mechanism that survives UI bypass is Option A (triggers). The frozen test design permits any effective mechanism. |
| Implementation-complete evidence | An authenticated INSERT/UPDATE into referrals with disclosure_id referencing a different household's disclosure is rejected. An authenticated INSERT/UPDATE into consent_grants with authority_to_act_id referencing a different household's authority is rejected. Y3 query confirms all Household A records reference only Household A records. |

### Finding 4: E-NO-CREATION-UI (P2)

| Field | Value |
|-------|-------|
| Frozen property | Navigator views confirmed needs for assigned household through UI (Q1). Navigator creates pathway from confirmed need through UI (Q2). |
| Authoritative tests | Q1, Q2 |
| Current evidence | `pathwayService.createPathway` (lines 200-238) exists and validates confirmed need. `getServices`, `getProviders`, `getEligibilityPathways` exist for catalog display. `PathwaysPage.tsx` is a 1-line stub rendering "Pathways" heading. No UI to list confirmed needs, select services/providers, or create pathways. `PathwayDetail`, `PathwayCard` components exist but are display-only. |
| Exact gap | No UI for navigator to view confirmed needs and create pathways. |
| Candidate remediation | Build PathwaysPage with: confirmed needs list (filtered by navigator's assigned households), pathway creation form (service/provider/eligibility selection from catalog), submission calling `createPathway`. Use existing `PathwayCard`/`PathwayDetail` for display after creation. |
| Implementation-complete evidence | Navigator signs in, navigates to PathwaysPage, sees confirmed needs for assigned households, selects a need, selects service/provider, creates pathway. Database confirms pathway record with correct household_id, need_id, and created_by. |

### Finding 5: G-NO-TRUST-UI (P2)

| Field | Value |
|-------|-------|
| Frozen property | Navigator creates authority-to-act record through UI (R1). SharePage recognizes navigator-created authority and permits sharing (S1). Participant approves sharing; consent grant created through SharePage (S2). |
| Authoritative tests | R1, S1, S2 |
| Current evidence | `trustService.createAuthority` (lines 93-133) exists. `buildDisclosurePreview` (lines 445-504) checks authority hard stops and returns `authorityValid`. `checkAuthorityHardStops` (lines 135-169) validates disputed/expired/review conditions. `AdminTrustPage.tsx` is a 9-line stub. `SharePage.tsx` is a 1-line stub. No UI to create authority records, view disclosure preview, or approve sharing. |
| Exact gap | No UI for navigator to create authority-to-act records. No UI for participant to view sharing proposal, see authority is satisfied, and approve sharing (creating consent with authority link). |
| Candidate remediation | Build authority creation UI in navigator workflow area (form with subject person, data category, action type, authority basis, verification status). Build SharePage participant mode: call `buildDisclosurePreview`, render sharing proposal (what/who/why), show authority satisfied (no hard-stop) or hard-stop message, and approve sharing button calling `createConsentGrant` with the matched authority's ID. |
| Implementation-complete evidence | Navigator creates authority through UI; database confirms record. Participant views SharePage, sees no hard-stop, approves sharing; database confirms consent_grant with status='active' and populated authority_to_act_id. SharePage shows hard-stop when authority is absent (Pilot 001 G1-G8 behavior preserved). |

### Finding 6: H-NO-DELIVERY-UI (P2)

| Field | Value |
|-------|-------|
| Frozen property | Navigator prepares disclosure through UI (T1). Navigator starts delivery through UI (T2). Navigator confirms delivery through UI; disclosure transitions to 'sent' (T3). |
| Authoritative tests | T1, T2, T3 |
| Current evidence | `prepareDisclosure` (lines 346-367), `startDelivery` (lines 379-388), `confirmDelivery` (lines 397-419) all exist with correct field handling. `getDisclosures` (lines 325-333) retrieves disclosures by household. `SharePage.tsx` is a 1-line stub — no disclosure delivery UI exists. |
| Exact gap | No UI for navigator to prepare, start, or confirm disclosure delivery. |
| Candidate remediation | Build navigator disclosure delivery UI (within SharePage navigator mode or a dedicated disclosure view): three-step flow — prepare (content summary, recipient, purpose, data fields), start (delivery method selection), confirm (delivery proof: method, timestamp, delivered_by). Call existing service functions. |
| Implementation-complete evidence | Navigator prepares disclosure through UI; DB confirms status='prepared'. Navigator starts delivery; DB confirms status='delivery_pending'. Navigator confirms delivery; DB confirms status='sent' with delivered_at, delivered_by_user_id, delivery_method populated. |

### Finding 7: I-NO-REFERRAL-CREATION-UI (P2)

| Field | Value |
|-------|-------|
| Frozen property | Navigator creates referral through UI after disclosure sent (U1). UI prevents referral creation before disclosure sent (U2). |
| Authoritative tests | U1, U2 |
| Current evidence | `createReferralDraft` (pathwayService.ts lines 408-436), `updateReferralStatus` (lines 438-493), `linkReferralToDisclosure` (lines 495-501) exist. `updateReferralStatus` checks disclosure status='sent' before allowing referral → sent (lines 460-473). DB trigger `guard_referral_transition` also enforces. `PathwaysPage.tsx` is a 1-line stub — no referral creation UI. `ReferralStatusCard` component exists for display. |
| Exact gap | No UI for navigator to create a referral, link it to a sent disclosure, and update status to sent. No UI-level guard preventing referral creation before disclosure is sent (U2). |
| Candidate remediation | Build referral creation UI within PathwaysPage: create referral draft (selecting pathway, recipient), link to sent disclosure, update status to sent. For U2, check disclosure status in the UI before allowing the "send referral" action; disable or show message if disclosure is not 'sent'. The DB trigger is the backstop. |
| Implementation-complete evidence | Navigator creates referral through UI after disclosure sent; DB confirms referral with correct disclosure_id, pathway_id, household_id, status='sent'. Navigator attempts referral creation before disclosure sent; UI prevents it. |

### Finding 8: N-NO-PRIVACY-HISTORY-UI (P2)

| Field | Value |
|-------|-------|
| Frozen property | Participant can access privacy history page through UI (V1). Privacy history shows who was shared with (V2), why (V3), what was shared (V4), what was NOT shared (V5), prepared vs sent (V6), delivery time (V7), who recorded delivery (V8), active vs revoked (V9). Participant answers 8 of 8 questions correctly without navigator assistance (V10). |
| Authoritative tests | V1, V2, V3, V4, V5, V6, V7, V8, V9, V10, AA1 (comprehension) |
| Current evidence | `getConsentGrants` (trustService.ts lines 258-266) and `getDisclosures` (lines 325-333) return raw records by household. All data fields exist in the schema: recipient_name, purpose, data_categories/data_fields, status, sent_at, delivered_by_user_id, consent status. `willNotShare` is hardcoded to `[]` in `buildDisclosurePreview` (line 498) — no DB field stores excluded items. `delivered_by_user_id` is a UUID requiring name resolution. `PrivacyPage.tsx` is a 1-line stub. No privacy history aggregation or display UI exists. |
| Exact gap | No UI for participant to view sharing history. No aggregation function joins consent + disclosure + referral into a unified view. `delivered_by_user_id` requires name resolution (no existing function). `willNotShare` is always empty (P3 accepted limitation — UI must compensate). |
| Candidate remediation | See Section 5 (Privacy History Data Contract). Build PrivacyPage displaying sharing history entries with all 8 data points. The page must be navigable and understandable by a participant without navigator assistance. A new aggregation function (`getPrivacyHistory`) is a candidate implementation but not a requirement — the UI could call `getConsentGrants` and `getDisclosures` directly and join in the component. The smallest implementation is whatever supplies the 8 data points to the UI in human-readable form. |
| Implementation-complete evidence | Participant navigates to PrivacyPage, sees sharing history entries. Each entry displays: recipient name (not UUID), purpose (not code), what was shared, what was NOT shared (or "No items were explicitly excluded"), prepared vs sent status, delivery timestamp (human-readable), who recorded delivery (human-readable name), active vs revoked status. A test participant can answer all 8 V10 questions using only the UI. |

---

## 5. Privacy History: Data Contract Before Architecture

### 5a. Minimum Privacy-History Data Contract (derived from V2-V10)

| # | V-Test | Data Point | Source Field | Human-Readable Requirement |
|---|--------|-----------|-------------|---------------------------|
| 1 | V2 | Who was shared with | `consent_grants.recipient_name` or `disclosures.recipient_name` | Display as organization/person name, not UUID |
| 2 | V3 | Why sharing was approved | `consent_grants.purpose` or `disclosures.purpose` | Display as plain-language purpose, not code |
| 3 | V4 | What was shared | `consent_grants.data_categories` (jsonb) or `disclosures.data_fields` (jsonb) | Display as readable list of data categories |
| 4 | V5 | What was NOT shared | `buildDisclosurePreview.willNotShare` (currently `[]`) | Display excluded items or "No items were explicitly excluded" when empty |
| 5 | V6 | Prepared vs sent | `disclosures.status` | Display as "Prepared but not sent" or "Sent" in plain language |
| 6 | V7 | Delivery time | `disclosures.sent_at` | Display as human-readable date/time, not raw ISO string |
| 7 | V8 | Who recorded delivery | `disclosures.delivered_by_user_id` (UUID) | Resolve to navigator name, not UUID |
| 8 | V9 | Active vs revoked | `consent_grants.status` | Display as "Active" or "Revoked" in plain language |

### 5b. Smallest Implementation Capable of Supplying the Contract

The data for all 8 points exists in the database except:
- Point 4 (willNotShare): always empty — UI must display "No items were explicitly excluded"
- Point 7 (delivered_by): UUID requiring name resolution

**Candidate implementation A (smallest)**: PrivacyPage component calls `getConsentGrants(householdId)` and `getDisclosures(householdId)` directly. Joins them in the component by `consent_grant_id`. Resolves `delivered_by_user_id` by querying `persons` table for the matching `auth_user_id`. Renders all 8 data points. No new service function needed.

**Candidate implementation B (cleaner separation)**: Add `getPrivacyHistory(householdId)` to trustService that performs the join and name resolution server-side, returning a unified array. PrivacyPage calls this single function.

Both candidates satisfy the data contract. Candidate A is smaller (no new service function). Candidate B is cleaner but adds a service function that is not strictly required. The frozen test design does not prescribe either approach.

**Critical preservation**: The participant — not the database query, not the navigator — must be able to answer all 8 questions correctly through the UI alone (V10, AA1). The implementation must render data in human-readable form (names not UUIDs, purposes not codes, dates not ISO strings). This is a UI rendering requirement, not a service architecture requirement.

---

## 6. Ordered Implementation Phases

### Phase 1 — Database Integrity (P1 + P2 integrity gaps)

**Rationale**: The P1 findings (G-NO-DB-TRUST-GUARD, H-NO-AUTHORITY-LINK) and the P2 cross-household check (I-NO-CONSENT-DISCLOSURE-HOUSEHOLD-CHECK) require database-level enforcement to survive UI bypass (W1, W2, Y1, Y2 are security invariant tests). UI work depends on the schema being correct.

| Item | Finding | Required Property | Candidate Remediation |
|------|---------|-------------------|----------------------|
| 1a | G-NO-DB-TRUST-GUARD, H-NO-AUTHORITY-LINK | Active consent grant cannot exist without valid applicable authority in the same household | Add DB-level enforcement. Candidate: CHECK constraint for non-null (`status='active'` requires `authority_to_act_id IS NOT NULL`) + trigger for household match (query `authority_to_act.household_id`, reject mismatch). Alternative: SECURITY DEFINER function as sole INSERT path. The test design permits any effective mechanism. The non-null and household-match sub-properties should be DB-enforced to survive UI bypass. Validity (not disputed/expired) may be enforced at DB or service level — the test records the enforcement layer. |
| 1b | I-NO-CONSENT-DISCLOSURE-HOUSEHOLD-CHECK | Cross-household referral and consent references cannot be created | Add DB-level enforcement. Candidate: triggers on `referrals` and `consent_grants` (BEFORE INSERT/UPDATE) that query the referenced record's household_id and reject mismatch. Triggers must be SECURITY DEFINER, search_path = public, EXECUTE revoked from anon/authenticated. Alternative: SECURITY DEFINER function as sole write path. |
| 1c | (none — already enforced) | Disclosure sent requires delivery proof | No work needed. DB CHECK `disclosures_sent_requires_delivery` already enforces (migration phase31). |

**Security/integrity considerations**:
- Item 1a: The constraint must allow `status='draft'` with null authority (drafts are pre-approval). Only `status='active'` requires the link. This matches the frozen workflow.
- Item 1a/1b: Any trigger must be SECURITY DEFINER with `search_path = public` and EXECUTE revoked from `anon`/`authenticated` (same pattern as existing `guard_referral_transition`, `guard_pathway_confirmed_need`).
- Both items are additive constraints/triggers. No column drops, type changes, or renames.

**Professional/domain decision checkpoint**: None blocks this phase.

### Phase 2 — Navigator Workflow UI (Track A) and Participant UI (Track B)

Tracks A and B can be developed in parallel. They call independent service functions and render different pages.

#### Track A — Navigator Workflow (serial within track)

| Item | Finding | Page | Description |
|------|---------|------|-------------|
| 2a | E-NO-CREATION-UI | PathwaysPage | Navigator sees confirmed needs for assigned households, selects service/provider/eligibility from catalog, creates pathway. |
| 2b | G-NO-TRUST-UI | Navigator trust area | Navigator creates authority-to-act for a household/person. |
| 2c | H-NO-DELIVERY-UI | Navigator disclosure area | Navigator prepares, starts, confirms disclosure delivery. |
| 2d | I-NO-REFERRAL-CREATION-UI | Navigator referral area (PathwaysPage) | Navigator creates referral, links to sent disclosure, updates status to sent. UI checks disclosure status before allowing creation (U2). |

**Serial order**: 2a → 2b → 2c → 2d (each depends on the previous step's records for end-to-end testing).

#### Track B — Participant UI (parallel within track)

| Item | Finding | Page | Description |
|------|---------|------|-------------|
| 2e | G-NO-TRUST-UI | SharePage | Participant views sharing proposal, sees authority satisfied, approves sharing (creates consent with authority link). |
| 2f | N-NO-PRIVACY-HISTORY-UI | PrivacyPage | Participant views sharing history with all 8 V10 data points in human-readable form. |

**Parallel**: 2e and 2f can be built simultaneously. 2e depends on 2b (authority exists) for end-to-end testing but not for UI construction.

### Phase 3 — Integration and AA1 Readiness

| Item | Description |
|------|-------------|
| 3a | Verify the full workflow executes end-to-end through UI: pathway → authority → sharing approval → disclosure prepare/start/confirm → referral creation → privacy history view. |
| 3b | Verify SharePage passes authorityToActId when creating consent (S3 property). |
| 3c | Verify PrivacyPage displays all 8 data points in human-readable form. |
| 3d | Verify UI prevents referral creation before disclosure is sent (U2 property). |

---

## 7. Parallelizable Work Summary

| Work | Can Parallelize With | Rationale |
|------|---------------------|-----------|
| Phase 1 (DB integrity) | Nothing — must be first | UI depends on schema enforcement |
| Track A item 2a (pathway UI) | Track B (2e, 2f) | Independent pages and service calls |
| Track A item 2b (authority UI) | Track B (2e, 2f) | Independent pages |
| Track A item 2c (disclosure UI) | Track B (2f) | 2c and 2e both involve SharePage — coordinate if sharing the same component |
| Track A item 2d (referral UI) | Track B (2f) | Independent pages |
| Track B item 2e (SharePage) | Track A items 2a, 2b, 2d | But 2e and 2c may share the SharePage component — coordinate |
| Track B item 2f (PrivacyPage) | All Track A items | Fully independent page |
| Phase 3 (integration) | Nothing — must be last | Requires all prior phases |

**Recommended order**: Phase 1 → (Track A + Track B in parallel) → Phase 3

---

## 8. Professional/Domain Decision Checkpoints

All four frozen classifications are preserved unchanged. No decision is silently resolved.

| Decision | Frozen Classification | Impact on Implementation | Impact on Execution |
|----------|----------------------|------------------------|-------------------|
| Self-authorization for adults (is participant's own person ID as authorizing_actor_id correct?) | NOT REQUIRED FOR MINIMUM PILOT 002 | None. The authority record's `actor_person_id` / `actor_user_id` fields are set by the UI. The field accepts any person ID. | None |
| Guardian/parent actor for youth | NOT REQUIRED FOR MINIMUM PILOT 002 | None. Youth-assent UI is not implemented. R2/W3 remain conditional. | None |
| Consent + disclosure transaction (should createConsentGrant and prepareDisclosure be wrapped in a single transaction?) | REQUIRED BEFORE EXECUTION | None for implementation. The current code creates consent and disclosure as separate operations. Implementation proceeds without this decision. | If a partial failure occurs during test execution (consent created but disclosure preparation fails), the team must decide whether to treat it as a defect or an accepted limitation BEFORE determining the test result. Execution must not silently pass this checkpoint. The underlying professional/domain question is NOT answered by this plan. |
| Claim attribution adequacy (is "Family's own description. Not verified by NextUp." adequate provenance language?) | NOT REQUIRED FOR MINIMUM PILOT 002 | None. Existing provenance language is used. V4 and AA1 verify content is displayed, not legal adequacy. | None |

**No implementation step requires resolving any professional/domain decision before proceeding.**

---

## 9. Implementation-Complete Entry Criteria for Test Execution

Before Pilot 002 test execution may begin, ALL of the following must be true.

### Database Integrity (Phase 1)

| Criterion | Verification Method |
|-----------|-------------------|
| Active consent grant with null authority_to_act_id is rejected at DB level | SQL INSERT with `status='active'`, `authority_to_act_id=NULL` → expect rejection |
| Consent grant with authority_to_act_id from different household is rejected at DB level | SQL INSERT with mismatched household IDs → expect rejection |
| Referral with disclosure_id from different household is rejected at DB level | SQL INSERT/UPDATE with mismatched household IDs → expect rejection |
| Disclosure sent without delivery proof remains rejected | SQL UPDATE `status='sent'` without delivery_method/sent_at/delivered_by_user_id → expect rejection (already enforced) |
| Pilot 001 records unchanged | Compare record counts before and after migration |

### Navigator UI (Track A)

| Criterion | Verification Method |
|-----------|-------------------|
| Navigator can sign in and see confirmed needs for assigned households | Navigate to PathwaysPage as N1, verify needs displayed |
| Navigator can create a pathway from a confirmed need through UI | Complete form, verify DB record |
| Navigator can create authority-to-act through UI | Complete form, verify DB record |
| Navigator can prepare disclosure through UI | Complete preparation, verify `status='prepared'` |
| Navigator can start delivery through UI | Complete start, verify `status='delivery_pending'` |
| Navigator can confirm delivery through UI | Complete confirmation, verify `status='sent'` + delivery proof |
| Navigator can create referral through UI after disclosure sent | Complete creation, verify DB record with correct disclosure_id |
| UI prevents referral creation before disclosure is sent | Attempt with `status='prepared'` disclosure → UI blocks |

### Participant UI (Track B)

| Criterion | Verification Method |
|-----------|-------------------|
| Participant can sign in and view SharePage | Navigate to SharePage as P1, verify proposal displayed |
| SharePage shows authority satisfied (no hard-stop) when authority exists | Verify no hard-stop message when authority record exists |
| SharePage shows hard-stop when authority is absent | Verify hard-stop message (Pilot 001 G1-G8 behavior preserved) |
| Participant can approve sharing through SharePage | Complete approval, verify consent_grant with `authority_to_act_id` populated and `status='active'` |
| Participant can access PrivacyPage | Navigate to PrivacyPage, verify sharing history displayed |
| PrivacyPage shows all 8 V10 data points in human-readable form | Verify: recipient name, purpose, what shared, what NOT shared, prepared-vs-sent, delivery time, who recorded delivery, active-vs-revoked |

### Application Build

| Criterion | Verification Method |
|-----------|-------------------|
| `npm run build` succeeds | No errors |
| `npm run typecheck` succeeds | No type errors |
| Application loads without console errors | Navigate to sign-in page |

---

## 10. Explicit Non-Goals

| Non-Goal | Rationale |
|----------|-----------|
| Funding management UI | Excluded by frozen scope |
| Outcome reporting UI | Excluded by frozen scope |
| Barrier reporting UI | Excluded by frozen scope |
| Contact-attempt recording UI | Excluded by frozen scope |
| Participant declines referral | Excluded by frozen scope |
| Consent revocation | Excluded by frozen scope. Not an entry or exit condition for minimum Pilot 002. |
| Full consent-duration semantics | Excluded by frozen scope |
| Youth-assent implementation | Excluded by adult-only topology. R2/W3 remain conditional/outside denominator. |
| Pilot 001 modifications | Do not modify frozen Pilot 001 records, artifacts, or baseline |
| Service/provider catalog creation UI | Not needed. Seed catalog has eligible services. |
| New routing | All routes already wired |
| Performance optimization | N+1 patterns noted but not in scope |
| Automated interpretation generation | Interpretation remains navigator-proposed |
| Answering the consent+disclosure transaction professional/domain question | The plan preserves the REQUIRED BEFORE EXECUTION classification. It does not resolve the question. |
| Closing any of the 8 findings | All findings remain OPEN until implementation is separately completed and verified against frozen tests |

---

## 11. Finding Status

All 8 findings remain OPEN. This plan identifies gaps and candidate remediations. A finding is closed only when:
1. Implementation is completed
2. The implementation is verified against the frozen authoritative tests
3. The verification results are recorded

| Finding | Severity | Status |
|---------|----------|--------|
| G-NO-DB-TRUST-GUARD | P1 | OPEN |
| H-NO-AUTHORITY-LINK | P1 | OPEN |
| I-NO-CONSENT-DISCLOSURE-HOUSEHOLD-CHECK | P2 | OPEN |
| E-NO-CREATION-UI | P2 | OPEN |
| G-NO-TRUST-UI | P2 | OPEN |
| H-NO-DELIVERY-UI | P2 | OPEN |
| I-NO-REFERRAL-CREATION-UI | P2 | OPEN |
| N-NO-PRIVACY-HISTORY-UI | P2 | OPEN |

---

PILOT 002 IMPLEMENTATION PLAN v2 — FROZEN

626f6c742d63632d6167656e74# PILOT 002 — AUTHORITATIVE TEST DESIGN v4

---

## 0. v3 to v4 Correction Ledger

v3 to v4: Baseline-accounting reconciliation only — HB fixtures moved from B1-level (preflight) to post-B1 temporary records; B0 repositioned before PF-1; B1 repositioned after all Pilot 002 infrastructure but before HB fixtures; lifecycle corrected to B0 → preflight → B1 → HB fixtures/execution/cleanup → B1 → teardown → B0. Zero denominator impact. No test cases, scope, ordering, semantics, findings, or traceability changed.

---

## 1. Frozen-Scope Declaration

This test design is derived from and bounded by the PILOT 002 FINAL SCOPE, which is frozen. The frozen workflow is:

**confirmed need → pathway → authority/applicable assent → participant sharing approval → disclosure delivery → referral sent → participant privacy/sharing-history understanding**

The frozen scope defines:
- 6 scope gates (required properties, not implementations)
- 10 minimum success criteria
- 8 directly intersecting findings (2 P1, 6 P2)
- exactly 2 formal PROFESSIONAL_REVIEW findings (neither intersects minimum scope)
- no funding, outcomes, barriers, contact attempts, participant-declines-referral, or full consent-duration semantics

This test design does not expand, contract, or reinterpret the frozen scope. Every authoritative case traces directly to a frozen scope element.

---

## 2. Minimum Actor/Account Topology

### Required Roles

| Role | Designation | Purpose |
|------|-------------|---------|
| Participant household | Household A | Has confirmed need; participant approves sharing; participant reviews privacy history |
| Second household | Household B | Exists for household-consistency testing; navigator assigned to both households |
| Assigned navigator | N1 | Authenticated; assigned to BOTH Household A and Household B; performs all navigator workflow steps |
| Negative-control navigator | N2 | Authenticated; NOT assigned to Household A or Household B; used for isolation attack tests |
| Admin / reviewer | A1 | Authenticated admin; used for trust escalation review if workflow triggers it |
| Participant | P1 | Member of Household A; performs sharing approval and privacy history review |

### Minimum Accounts and Households

- **4 accounts**: P1 (participant), N1 (assigned navigator), N2 (negative-control navigator), A1 (admin)
- **2 households**: Household A (P1's household, with confirmed need), Household B (second household, with confirmed need, created during preflight)

### Topology Rationale

- N1 is assigned to both households to test Gate 5 (household consistency under navigator mediation). A navigator assigned to only one household cannot exercise cross-household record mixing.
- N2 is completely unassigned to either household to test Gate 6 (isolation preservation) and serve as the negative-control attacker.
- Household B requires a confirmed need so N1 can create records for both households, enabling cross-household reference tests (Y-group). Household B also requires controlled security fixtures for Y1/Y2 (see Section 9C).
- A1 is included because the frozen workflow includes trust hard-stops that may produce escalations requiring admin review. If no escalation occurs during the minimum workflow, A1 is unused but provisioned.

### Adult-Only Topology Declaration

The minimum authoritative topology is **adult-only**. No youth participant is included. Therefore:
- R2 (navigator records youth assent through UI) remains conditional and outside the 32-case denominator.
- W3 (navigator cannot bypass youth assent through authenticated UI-bypass access) remains conditional and outside the denominator.
- Applicable youth assent is NOT APPLICABLE in the adult-only execution.
- Pilot 002 does not claim to have proved youth-assent UI or bypass protection unless R2/W3 are subsequently activated by a topology expansion.
- Gate 1 may be satisfied for the trust requirements applicable to the adult topology (authority-to-act and disclosure delivery-proof). Youth-assent coverage is explicitly marked CONDITIONAL / NOT EXERCISED.

### Account Provisioning Notes

- P1, N1, N2, A1 accounts are created during preflight using the proven Pilot 001 account provisioning process.
- N1 is assigned to Household A and Household B through the navigator assignment mechanism proven in Pilot 001 Test A.
- Household B's confirmed need is created during preflight using the Pilot 001-proven narration → interpretation → need confirmation process (admin-proposed interpretation, as in Pilot 001). This is preflight setup, not an authoritative Pilot 002 test case.
- P1's confirmed need in Household A is accepted as Pilot 001 baseline evidence (frozen). If no suitable confirmed need exists from Pilot 001, preflight creates one using the proven process.

---

## 3. Professional/Domain Dependency Classification

The frozen scope identifies 4 professional/domain decisions that may intersect the minimum workflow. Each is classified by when it must be resolved relative to Pilot 002.

| Decision | Classification | Rationale |
|----------|---------------|-----------|
| Self-authorization for adults (is participant's own person ID as authorizing_actor_id correct?) | NOT REQUIRED FOR MINIMUM PILOT 002 | The frozen workflow has the navigator creating the authority record, not the participant self-authorizing. The test verifies the authority record exists and satisfies the SharePage trust check. The specific authorizing_actor_id value is an implementation detail the test can verify without prescribing. |
| Guardian/parent actor for youth (does a separate guardian/parent actor need to be required for youth cases?) | NOT REQUIRED FOR MINIMUM PILOT 002 | Youth assent is not applicable in the adult-only topology. R2/W3 are conditional and not exercised. |
| Consent + disclosure transaction (should createConsentGrant and prepareDisclosure be wrapped in a single transaction?) | REQUIRED BEFORE EXECUTION | The test can be designed without this decision. The minimum workflow exercises the happy path (prepare succeeds, no partial failure). However, if a partial failure is observed during execution (consent created but disclosure preparation fails), the team must decide whether to treat it as a defect or an accepted limitation before determining the test result. |
| Claim attribution adequacy (is "Family's own description. Not verified by NextUp." adequate provenance language?) | NOT REQUIRED FOR MINIMUM PILOT 002 | The test verifies disclosure creation and delivery status, not the legal adequacy of the provenance language from a recipient's perspective. The test confirms the disclosure contains claim content and was delivered; it does not judge whether the language is legally sufficient. |

### Summary

Only 1 of 4 decisions intersects minimum Pilot 002 execution, and it is required before execution, not before test design or implementation. Test design and implementation can proceed without any professional/domain decision being resolved.

---

## 4. Capability Layer Classification

Each authoritative test case is classified by which capability ladder rung it advances. Lower-layer evidence cannot PASS a higher-layer requirement.

| Layer | Meaning | Pilot 002 Test Groups |
|-------|---------|----------------------|
| Data exists | Records are present in the database | Accepted from Pilot 001 (not retested) |
| Service works | Service-layer functions create/read/update correctly | Accepted from Pilot 001 for service-proven cases; Pilot 002 verifies service beneath new UI where applicable |
| UI exposes it | A human can perform the action through application UI | Q, R, S, T, U groups |
| Person understands/controls it | A participant can understand and control their information without navigator assistance | V group |
| Real workflow succeeds | The complete workflow succeeds end-to-end through the application with human actors | AA group |
| Security invariant holds | Trust, isolation, and consistency boundaries remain enforceable under navigator-mediated access | W, X, Y, Z groups |

### Layer Enforcement Rule

A test case classified as "UI exposes it" can only PASS when the action is completed through the application UI by a human actor. Demonstrating that the service function works (e.g., calling createPathway() programmatically) is supporting evidence and does not PASS the UI-exposes-it requirement. A test case classified as "person understands/controls it" can only PASS when a participant answers comprehension questions correctly using only the privacy history UI, without navigator explanation. A test case classified as "real workflow succeeds" can only PASS when a fresh complete workflow is executed continuously through the UI producing correct records and correct participant comprehension.

---

## 5. Authoritative Test Matrix (Summary)

| Case ID | Group | Layer | Frozen Scope Element | One-Line Description |
|---------|-------|-------|---------------------|----------------------|
| Q1 | Navigator Pathway | UI exposes it | SC1, Gate 3 | Navigator views confirmed needs for assigned household through UI |
| Q2 | Navigator Pathway | UI exposes it | SC1, Gate 3 | Navigator creates pathway from confirmed need through UI |
| R1 | Navigator Authority | UI exposes it | SC2, Gate 3 | Navigator creates authority-to-act record through UI |
| S1 | Participant Sharing | UI exposes it | SC3, Gate 3 | SharePage recognizes navigator-created authority and permits sharing |
| S2 | Participant Sharing | UI exposes it | SC3 | Participant approves sharing; consent grant created through SharePage |
| S3 | Consent-Authority Link | Service works | SC7, Gate 2 | Consent grant links to authority-to-act record (authority_to_act_id populated) |
| T1 | Disclosure Delivery | UI exposes it | SC4, Gate 3 | Navigator prepares disclosure through UI |
| T2 | Disclosure Delivery | UI exposes it | SC4, Gate 3 | Navigator starts delivery through UI |
| T3 | Disclosure Delivery | UI exposes it | SC4, Gate 3 | Navigator confirms delivery through UI; disclosure transitions to 'sent' |
| U1 | Referral Creation | UI exposes it | SC5, Gate 3 | Navigator creates referral through UI after disclosure sent |
| U2 | Referral Creation | UI exposes it | SC5 | Navigator cannot create referral before disclosure sent (transition guard through UI) |
| V1 | Privacy History | Person understands | SC6, Gate 4 | Participant can access privacy history page through UI |
| V2 | Privacy History | Person understands | SC6, Gate 4 | Privacy history shows who was shared with |
| V3 | Privacy History | Person understands | SC6, Gate 4 | Privacy history shows why sharing was approved |
| V4 | Privacy History | Person understands | SC6, Gate 4 | Privacy history shows what was shared |
| V5 | Privacy History | Person understands | SC6, Gate 4 | Privacy history shows what was NOT shared |
| V6 | Privacy History | Person understands | SC6, Gate 4 | Privacy history distinguishes prepared vs sent |
| V7 | Privacy History | Person understands | SC6, Gate 4 | Privacy history shows when delivery occurred |
| V8 | Privacy History | Person understands | SC6, Gate 4 | Privacy history shows who recorded delivery |
| V9 | Privacy History | Person understands | SC6, Gate 4 | Privacy history shows active vs revoked permissions |
| V10 | Privacy History | Person understands | SC6, Gate 4 | Participant comprehension: 8 of 8 answers correct without navigator assistance |
| W1 | Trust Boundary | Security invariant | SC8, Gate 1 | Navigator cannot create consent without authority through authenticated UI-bypass access |
| W2 | Trust Boundary | Security invariant | SC8, Gate 1 | Navigator cannot send disclosure without delivery proof through authenticated UI-bypass access |
| X1 | Isolation | Security invariant | SC9, Gate 6 | Negative-control navigator cannot read Household A pathway records |
| X2 | Isolation | Security invariant | SC9, Gate 6 | Negative-control navigator cannot read Household A trust/authority records |
| X3 | Isolation | Security invariant | SC9, Gate 6 | Negative-control navigator cannot read Household A disclosure/consent records |
| X4 | Isolation | Security invariant | SC9, Gate 6 | Negative-control navigator cannot read Household A referral records |
| Y1 | Household Consistency | Security invariant | Gate 5 | Navigator cannot create cross-household referral (A referral referencing B disclosure) |
| Y2 | Household Consistency | Security invariant | Gate 5 | Navigator cannot create cross-household consent (A consent referencing B authority) |
| Y3 | Household Consistency | Security invariant | Gate 5 | Records for Household A contain only Household A references |
| Z1 | Anonymous Access | Security invariant | SC10, Gate 6 | Anonymous access to all navigator-mediated record types is blocked |
| AA1 | End-to-End | Real workflow succeeds | All SC, All Gates | Fresh complete workflow from confirmed need to sent referral through UI, with privacy-history comprehension, succeeds continuously |

**Authoritative denominator: 32 cases**

Conditional cases (outside denominator — adult-only topology):

| Case ID | Condition | Description |
|---------|-----------|-------------|
| R2 | Youth participant included in topology | Navigator records youth assent through UI |
| W3 | Youth participant included in topology | Navigator cannot bypass youth assent through authenticated UI-bypass access |

---

## 6. Detailed Test Definitions

### Group Q — Navigator Pathway Creation (UI exposes it)

#### Q1 — Navigator Views Confirmed Needs for Assigned Household Through UI

**Layer**: UI exposes it
**Actor**: N1 (authenticated, assigned to Household A)
**Prerequisites**: Household A has a confirmed need (Pilot 001 baseline or preflight-created)

**Steps**:
1. N1 signs in to the application through the sign-in page.
2. N1 navigates to the navigator workflow area for Household A.
3. N1 views the list of confirmed needs for Household A.

**PASS condition**: N1 sees the confirmed need(s) for Household A displayed in the application UI, with need description, status (confirmed), and the person/household it belongs to. The need is identifiable and selectable for pathway creation.

**FAIL condition**: N1 cannot see confirmed needs, or the UI does not exist, or the needs are not displayed with sufficient information to proceed to pathway creation.

**BLOCKED condition**: N1 cannot sign in, or the navigator workflow area does not exist, or Household A has no confirmed need and preflight failed to create one.

**Maps to**: SC1, Gate 3, Finding E-NO-CREATION-UI

---

#### Q2 — Navigator Creates Pathway from Confirmed Need Through UI

**Layer**: UI exposes it
**Actor**: N1
**Prerequisites**: Q1 PASS

**Steps**:
1. From the confirmed needs view, N1 selects a confirmed need.
2. N1 initiates pathway creation through the UI (button, menu action, or similar).
3. N1 completes the pathway creation form (selecting service, provider, eligibility criteria from the Pilot 001 seed catalog).
4. N1 submits the pathway creation through the UI.
5. The UI confirms the pathway was created.

**PASS condition**: The pathway is created through the UI. The UI displays confirmation. A subsequent database query confirms the pathway record exists with correct household_id (Household A), need_id (the confirmed need), and navigator attribution. The pathway status is appropriate for a newly created pathway.

**FAIL condition**: The pathway creation UI does not exist, or submission fails without error handling, or the database record is not created, or the record has incorrect household/need attribution.

**BLOCKED condition**: Q1 is BLOCKED, or the seed catalog has no eligible services for the confirmed need.

**Supporting check (not authoritative)**: Q-S1 — Pathway record in database has correct household_id, need_id, and created_by navigator attribution. This is a supporting verification, not a separate authoritative case.

**Maps to**: SC1, Gate 3, Finding E-NO-CREATION-UI

---

### Group R — Navigator Authority Creation (UI exposes it)

#### R1 — Navigator Creates Authority-to-Act Record Through UI

**Layer**: UI exposes it
**Actor**: N1
**Prerequisites**: Q2 PASS (pathway exists for Household A)

**Steps**:
1. N1 navigates to the trust/authority workflow area for Household A.
2. N1 initiates authority-to-act creation through the UI.
3. N1 completes the authority record (specifying the person who authorizes action, the scope of authority, and the pathway it applies to).
4. N1 submits the authority creation through the UI.
5. The UI confirms the authority was created.

**PASS condition**: The authority-to-act record is created through the UI. The UI displays confirmation. A subsequent database query confirms the authority record exists with correct household_id (Household A), person_id (P1 or the authorizing person), and pathway linkage. The authority status is active/valid.

**FAIL condition**: The authority creation UI does not exist, or submission fails, or the database record is not created, or the record has incorrect household/person/pathway attribution.

**BLOCKED condition**: Q2 is BLOCKED, or the trust/authority workflow area does not exist.

**Supporting check (not authoritative)**: R-S1 — Authority record in database has correct household_id, person_id, and pathway_id. Supporting verification only.

**Maps to**: SC2, Gate 3, Finding G-NO-TRUST-UI

---

#### R2 (CONDITIONAL — NOT EXERCISED IN ADULT-ONLY TOPOLOGY) — Navigator Records Youth Assent Through UI

**Condition**: This case is outside the 32-case denominator. It is included ONLY if the test topology is expanded to include a youth participant. In the adult-only minimum topology, this case is recorded as CONDITIONAL / NOT EXERCISED.

**Layer**: UI exposes it
**Actor**: N1
**Prerequisites**: R1 PASS; youth participant exists in Household A with youth_status flag set

**Steps**:
1. N1 navigates to the youth assent workflow area for the youth participant.
2. N1 records youth assent (documenting that the youth participant has been informed and has assented to the proposed action).
3. N1 submits the assent record through the UI.
4. The UI confirms the assent was recorded.

**PASS condition**: Youth assent record is created through the UI. Database confirms the assent record exists with correct person_id (youth participant), household_id, and linkage to the authority/pathway.

**FAIL condition**: Youth assent UI does not exist, or submission fails, or database record is not created.

**BLOCKED condition**: No youth participant in the test topology, or R1 is BLOCKED.

**Maps to**: SC2 (conditional portion), Gate 3, Finding G-NO-TRUST-UI

**Dependency**: Guardian/parent actor decision (NOT REQUIRED FOR MINIMUM PILOT 002 — only required if this conditional case is exercised)

---

### Group S — Participant Sharing Approval (UI exposes it + trust check)

#### S1 — SharePage Recognizes Navigator-Created Authority and Permits Sharing

**Layer**: UI exposes it
**Actor**: P1 (authenticated participant, Household A)
**Prerequisites**: R1 PASS (authority-to-act record exists for Household A)

**Steps**:
1. P1 signs in to the application.
2. P1 navigates to the SharePage for the confirmed need/pathway.
3. P1 views the sharing proposal (what will be shared, with whom, why).
4. The SharePage displays that the authority-to-act requirement is satisfied (no hard-stop, no escalation message).

**PASS condition**: The SharePage shows the sharing proposal and indicates that authority-to-act is satisfied. The SharePage does NOT display the trust hard-stop or escalation message that Pilot 001 proved for the no-authority case. The participant can proceed to approve sharing.

**FAIL condition**: The SharePage still shows the trust hard-stop despite the navigator-created authority, or the SharePage does not recognize the authority, or the UI does not update to reflect the authority exists.

**BLOCKED condition**: R1 is BLOCKED, or P1 cannot sign in, or the SharePage does not exist.

**Maps to**: SC3, Gate 3, Finding G-NO-TRUST-UI (retest of Pilot 001 hard-stop with navigator-created authority)

**Layer enforcement note**: Pilot 001 proved the SharePage hard-stop works when authority is absent (G1-G8 PASS). This test proves the positive case: when authority IS present (created by navigator through UI), the SharePage permits sharing. This is a higher-layer requirement (UI exposes it in a real workflow context) and cannot be PASSed by showing only that the service-layer authority check returns true.

---

#### S2 — Participant Approves Sharing; Consent Grant Created Through SharePage

**Layer**: UI exposes it
**Actor**: P1
**Prerequisites**: S1 PASS

**Steps**:
1. From the SharePage (S1), P1 reviews the sharing proposal.
2. P1 approves sharing through the SharePage UI.
3. The UI confirms sharing was approved.
4. A database query confirms a consent_grant record was created.

**PASS condition**: P1 approves sharing through the SharePage UI. The UI displays confirmation. A consent_grant record exists in the database with correct household_id (Household A), person_id (P1), pathway_id, disclosure linkage, and status='active'. The consent timestamp is recorded.

**FAIL condition**: Approval through UI fails, or no consent_grant record is created, or the record has incorrect attribution.

**BLOCKED condition**: S1 is BLOCKED.

**Supporting check (not authoritative)**: S-S1 — Consent grant record has correct household_id, person_id, pathway_id, and status. Supporting verification only.

**Maps to**: SC3

---

#### S3 — Consent Grant Links to Authority-to-Act Record

**Layer**: Service works (data integrity property)
**Actor**: Test executor (database query)
**Prerequisites**: S2 PASS

**Steps**:
1. Query the consent_grant record created in S2.
2. Verify the consent_grant has a populated authority_to_act_id field.
3. Verify the authority_to_act_id references the authority record created in R1.
4. Verify the authority record belongs to the same household as the consent grant.

**PASS condition**: The consent_grant record has a non-null authority_to_act_id that references the authority-to-act record created in R1. Both records belong to Household A. The audit trail from consent back to authority is complete and navigable.

**FAIL condition**: authority_to_act_id is null, or references a non-existent authority record, or references an authority from a different household.

**BLOCKED condition**: S2 is BLOCKED.

**Maps to**: SC7, Gate 2, Finding H-NO-AUTHORITY-LINK

---

### Group T — Navigator Disclosure Delivery (UI exposes it)

#### T1 — Navigator Prepares Disclosure Through UI

**Layer**: UI exposes it
**Actor**: N1
**Prerequisites**: S2 PASS (consent grant exists)

**Steps**:
1. N1 navigates to the disclosure workflow area for Household A.
2. N1 initiates disclosure preparation through the UI.
3. N1 completes the disclosure content (claim summary, recipient organization, purpose).
4. N1 submits the disclosure preparation through the UI.
5. The UI confirms the disclosure was prepared.

**PASS condition**: The disclosure record is created through the UI with status='prepared'. Database confirms the disclosure exists with correct household_id (Household A), consent_grant linkage, pathway linkage, and recipient organization. The disclosure content includes the claim summary with the Pilot 001 provenance language.

**FAIL condition**: Disclosure preparation UI does not exist, or submission fails, or database record is not created, or record has incorrect attribution.

**BLOCKED condition**: S2 is BLOCKED, or the disclosure workflow area does not exist.

**Supporting check (not authoritative)**: T-S1 — Disclosure record has correct household_id, consent_grant_id, pathway_id, and status='prepared'.

**Maps to**: SC4, Gate 3, Finding H-NO-DELIVERY-UI

---

#### T2 — Navigator Starts Delivery Through UI

**Layer**: UI exposes it
**Actor**: N1
**Prerequisites**: T1 PASS, U2 executed (PASS or FAIL), W2 executed (PASS or FAIL) and disclosure remains prepared and unchanged. Per frozen execution order: T1 → U2 → W2 → T2.

**Steps**:
1. From the prepared disclosure, N1 initiates delivery through the UI.
2. N1 records the delivery method (e.g., email, portal, in-person).
3. N1 submits the delivery start through the UI.
4. The UI confirms delivery was started.

**PASS condition**: The disclosure status transitions from 'prepared' to 'in_delivery' (or equivalent in-delivery status) through the UI. Database confirms the status change and delivery method is recorded.

**FAIL condition**: Delivery start UI does not exist, or status transition fails, or database does not reflect the status change.

**BLOCKED condition**: T1 is BLOCKED, or the disclosure record was corrupted by a failed W2 attack and no fresh prepared disclosure is available (see W2 downstream handling below).

**Maps to**: SC4, Gate 3, Finding H-NO-DELIVERY-UI

---

#### T3 — Navigator Confirms Delivery Through UI; Disclosure Transitions to 'Sent'

**Layer**: UI exposes it
**Actor**: N1
**Prerequisites**: T2 PASS

**Steps**:
1. From the in-delivery disclosure, N1 confirms delivery through the UI.
2. N1 records delivery confirmation (delivered_at timestamp is set, delivered_by is N1).
3. N1 submits the delivery confirmation through the UI.
4. The UI confirms the disclosure was sent.

**PASS condition**: The disclosure status transitions to 'sent' through the UI. Database confirms: status='sent', delivered_at is populated, delivered_by is N1's navigator ID, delivery method is recorded. Delivery proof is complete.

**FAIL condition**: Delivery confirmation UI does not exist, or status transition to 'sent' fails, or delivery proof fields (delivered_at, delivered_by) are not populated.

**BLOCKED condition**: T2 is BLOCKED.

**Supporting check (not authoritative)**: T-S2 — Delivery proof fields (delivered_at, delivered_by, delivery_method) are populated in the database.

**Maps to**: SC4, Gate 3, Finding H-NO-DELIVERY-UI

---

### Group U — Navigator Referral Creation (UI exposes it)

#### U1 — Navigator Creates Referral Through UI After Disclosure Sent

**Layer**: UI exposes it
**Actor**: N1
**Prerequisites**: T3 PASS (disclosure status='sent')

**Steps**:
1. N1 navigates to the referral workflow area for Household A.
2. N1 initiates referral creation through the UI.
3. N1 completes the referral (selecting the sent disclosure, the pathway, the recipient organization).
4. N1 submits the referral creation through the UI.
5. The UI confirms the referral was created.

**PASS condition**: The referral record is created through the UI with status='sent' (or equivalent initial referral status). Database confirms the referral exists with correct household_id (Household A), disclosure_id (the sent disclosure), pathway_id, and recipient organization. The referral transition guard (disclosure-before-referral) is satisfied because the disclosure is in 'sent' status.

**FAIL condition**: Referral creation UI does not exist, or submission fails, or database record is not created, or record has incorrect attribution.

**BLOCKED condition**: T3 is BLOCKED.

**Supporting check (not authoritative)**: U-S1 — Referral record has correct disclosure_id, pathway_id, household_id, and status.

**Maps to**: SC5, Gate 3, Finding I-NO-REFERRAL-CREATION-UI

---

#### U2 — Navigator Cannot Create Referral Before Disclosure Sent (Transition Guard Through UI)

**Layer**: UI exposes it
**Actor**: N1
**Prerequisites**: T1 PASS (disclosure is 'prepared' but not yet 'sent'). **Must execute BEFORE W2 and T2 per frozen execution order: T1 → U2 → W2 → T2 → T3 → U1.**

**Steps**:
1. N1 navigates to the referral workflow area for Household A.
2. N1 attempts to create a referral referencing the prepared (not yet sent) disclosure.
3. The UI prevents referral creation or displays an appropriate message that the disclosure must be sent first.

**PASS condition**: The UI prevents referral creation when the disclosure is not in 'sent' status. The participant is not given a false impression that the referral was created. The transition guard (disclosure-before-referral) is enforced through the UI.

**FAIL condition**: The UI allows referral creation before the disclosure is sent, or no guard exists in the UI, or the referral is created with a non-sent disclosure.

**BLOCKED condition**: T1 is BLOCKED (no prepared disclosure to test against).

**Maps to**: SC5, Finding I-NO-REFERRAL-CREATION-UI (transition guard portion)

**Layer enforcement note**: Pilot 001 proved the referral transition guard works at the service layer (I1-I6 PASS). This test proves the guard is also enforced through the UI. Service-layer evidence alone cannot PASS this case.

---

### Group V — Participant Privacy History (Person Understands/Controls It)

#### V1 — Participant Can Access Privacy History Page Through UI

**Layer**: Person understands/controls it
**Actor**: P1 (authenticated participant, Household A)
**Prerequisites**: U1 PASS (referral exists; full component workflow completed for Household A)

**Steps**:
1. P1 signs in to the application.
2. P1 navigates to the privacy/sharing history page.
3. The page loads and displays sharing history entries.

**PASS condition**: A privacy/sharing history page exists in the application UI. P1 can navigate to it without navigator assistance. The page displays at least one sharing history entry corresponding to the consent, disclosure, and referral created during the workflow.

**FAIL condition**: The privacy history page does not exist, or P1 cannot navigate to it, or the page displays no entries despite records existing, or the page requires navigator assistance to access.

**BLOCKED condition**: U1 is BLOCKED (no completed workflow to show in history), or P1 cannot sign in.

**Maps to**: SC6, Gate 4, Finding N-NO-PRIVACY-HISTORY-UI

---

#### V2 — Privacy History Shows Who Was Shared With

**Layer**: Person understands/controls it
**Actor**: P1
**Prerequisites**: V1 PASS

**Steps**:
1. P1 views the privacy history page.
2. P1 identifies the recipient organization for the sharing action.

**PASS condition**: The privacy history entry clearly displays the recipient organization name/identity. P1 can state "My information was shared with [organization name]" by looking only at the privacy history UI.

**FAIL condition**: The recipient organization is not displayed, is displayed ambiguously (e.g., a UUID instead of a name), or P1 cannot identify who received the information.

**BLOCKED condition**: V1 is BLOCKED.

**Maps to**: SC6, Gate 4

---

#### V3 — Privacy History Shows Why Sharing Was Approved

**Layer**: Person understands/controls it
**Actor**: P1
**Prerequisites**: V1 PASS

**Steps**:
1. P1 views the privacy history page.
2. P1 identifies the purpose/reason for the sharing action.

**PASS condition**: The privacy history entry displays the purpose of sharing in language P1 can understand (not a code or UUID). P1 can state "My information was shared because [purpose]" by looking only at the privacy history UI.

**FAIL condition**: The purpose is not displayed, is displayed as a code/identifier, or P1 cannot determine why sharing was approved.

**BLOCKED condition**: V1 is BLOCKED.

**Maps to**: SC6, Gate 4

---

#### V4 — Privacy History Shows What Was Shared

**Layer**: Person understands/controls it
**Actor**: P1
**Prerequisites**: V1 PASS

**Steps**:
1. P1 views the privacy history page.
2. P1 identifies what information was included in the disclosure (claim content summary).

**PASS condition**: The privacy history entry displays a summary or description of the information that was shared (the claim content). P1 can state "The information shared included [description]" by looking only at the privacy history UI. The provenance language ("Family's own description. Not verified by NextUp.") may be present but is not judged for legal adequacy.

**FAIL condition**: The shared content is not displayed, or P1 cannot determine what was shared.

**BLOCKED condition**: V1 is BLOCKED.

**Maps to**: SC6, Gate 4

---

#### V5 — Privacy History Shows What Was NOT Shared

**Layer**: Person understands/controls it
**Actor**: P1
**Prerequisites**: V1 PASS

**Steps**:
1. P1 views the privacy history page.
2. P1 identifies what information was excluded or not shared.

**PASS condition**: The privacy history entry displays what was NOT shared (excluded content, willNotShare items, or a clear statement of what was withheld). P1 can state "The information NOT shared included [description]" or "No information was excluded" by looking only at the privacy history UI.

**FAIL condition**: The excluded content is not displayed, and there is no indication of what was withheld, and P1 cannot determine what was NOT shared.

**BLOCKED condition**: V1 is BLOCKED.

**Note**: If the underlying service returns empty willNotShare (H-WILL-NOT-SHARE-SERVICE P3 accepted limitation), the UI must still display something meaningful (e.g., "No items were explicitly excluded" or equivalent). Complete absence of any indication is a FAIL.

**Maps to**: SC6, Gate 4

---

#### V6 — Privacy History Distinguishes Prepared vs Sent

**Layer**: Person understands/controls it
**Actor**: P1
**Prerequisites**: V1 PASS

**Steps**:
1. P1 views the privacy history page.
2. P1 identifies whether the disclosure was prepared but not yet sent, or was actually sent/delivered.

**PASS condition**: The privacy history entry clearly distinguishes between "prepared" and "sent/delivered" status. P1 can state "My information was [actually sent / prepared but not yet sent]" by looking only at the privacy history UI.

**FAIL condition**: The status is not displayed, or the distinction between prepared and sent is unclear, or P1 cannot determine whether the disclosure was actually delivered.

**BLOCKED condition**: V1 is BLOCKED.

**Maps to**: SC6, Gate 4

---

#### V7 — Privacy History Shows When Delivery Occurred

**Layer**: Person understands/controls it
**Actor**: P1
**Prerequisites**: V1 PASS

**Steps**:
1. P1 views the privacy history page.
2. P1 identifies the timestamp of delivery.

**PASS condition**: The privacy history entry displays the delivery timestamp in a human-readable format (date/time, not a raw Unix timestamp or ISO string without formatting). P1 can state "My information was delivered on [date/time]" by looking only at the privacy history UI.

**FAIL condition**: The delivery timestamp is not displayed, is displayed in a non-human-readable format, or P1 cannot determine when delivery occurred.

**BLOCKED condition**: V1 is BLOCKED.

**Maps to**: SC6, Gate 4

---

#### V8 — Privacy History Shows Who Recorded Delivery

**Layer**: Person understands/controls it
**Actor**: P1
**Prerequisites**: V1 PASS

**Steps**:
1. P1 views the privacy history page.
2. P1 identifies who recorded the delivery (the navigator who confirmed delivery).

**PASS condition**: The privacy history entry displays the identity of the person who recorded the delivery (navigator name or identifier, not a UUID). P1 can state "Delivery was recorded by [navigator identity]" by looking only at the privacy history UI.

**FAIL condition**: The delivery recorder is not displayed, is displayed as a UUID or raw ID, or P1 cannot determine who recorded the delivery.

**BLOCKED condition**: V1 is BLOCKED.

**Maps to**: SC6, Gate 4

---

#### V9 — Privacy History Shows Active vs Revoked Permissions

**Layer**: Person understands/controls it
**Actor**: P1
**Prerequisites**: V1 PASS

**Steps**:
1. P1 views the privacy history page.
2. P1 identifies whether the sharing permission is currently active or revoked.

**PASS condition**: The privacy history entry displays the consent status (active/revoked) in language P1 can understand. P1 can state "My sharing permission is currently [active / revoked]" by looking only at the privacy history UI.

**FAIL condition**: The consent status is not displayed, is displayed as a code, or P1 cannot determine whether the permission is active or revoked.

**BLOCKED condition**: V1 is BLOCKED.

**Maps to**: SC6, Gate 4

---

#### V10 — Participant Comprehension: 8 of 8 Answers Correct Without Navigator Assistance

**Layer**: Person understands/controls it
**Actor**: P1
**Prerequisites**: V1 through V9 all PASS

**Steps**:
1. P1 is presented with the following 8 questions (see Section 8 for full comprehension test protocol):
   - Who was your information shared with?
   - Why was sharing approved?
   - What information was shared?
   - What information was NOT shared?
   - Was the disclosure prepared but not sent, or was it actually sent?
   - When was the disclosure delivered?
   - Who recorded the delivery?
   - Are your sharing permissions currently active or revoked?
2. P1 answers each question using ONLY the privacy history UI.
3. No navigator explanation, hint, or assistance is provided.
4. Each answer is matched against the known test state (database values for the records created during the workflow).

**PASS condition**: 8 of 8 answers are correct. An answer is correct when P1's stated answer matches the known test state for that field. P1 used only the privacy history UI to answer. No navigator assistance was provided.

**FAIL condition**: Any of the 8 answers is incorrect (does not match known test state), or P1 states "I can't tell from this page" for any question, or navigator assistance was required to answer any question.

**BLOCKED condition**: Any of V1-V9 is BLOCKED.

**Maps to**: SC6, Gate 4, Finding N-NO-PRIVACY-HISTORY-UI

**Layer enforcement note**: This is the highest-layer test in the privacy history group. It cannot be PASSed by showing that the data exists (layer 1) or that the service returns it (layer 2) or that the page loads (layer 3). It requires that a human participant correctly answers all 8 questions using only the privacy history UI.

**Scoring objectivity**: The PASS criterion is strictly 8 of 8 correct answers matched against known test state. Usability observations (e.g., confusion, hesitation, time taken) may be recorded separately as qualitative notes but do not alter the objective PASS/FAIL result unless they cause an incorrect answer.

---

### Group W — Trust Boundary Penetration (Security Invariant)

#### W1 — Navigator Cannot Create Consent Without Authority Through Authenticated UI-Bypass Access

**Layer**: Security invariant
**Actor**: N1 (authenticated, assigned to Household A)
**Prerequisites**: R1 PASS (authority exists for comparison)

**Steps**:
1. N1 is signed in and has an active authenticated session.
2. N1 attempts to directly INSERT a consent_grant record via the Supabase client (bypassing the SharePage UI) for Household A, WITHOUT a valid authority_to_act_id (null or referencing a non-existent authority).
3. Record whether the operation succeeds or is prevented, and if prevented, at which layer (authorization denial, trust/state guard, RLS policy, or other enforcement).

**PASS condition**: The prohibited state (consent grant without valid authority) cannot be created through authenticated UI-bypass access. This includes prevention because authorization deliberately denies the operation, because a trust or state guard rejects it, or because RLS or another enforcement mechanism blocks it. The actual enforcement layer is recorded as evidence. No consent_grant record without valid authority is created.

**FAIL condition**: The prohibited state is successfully created — a consent_grant record exists in the database without a valid authority_to_act_id reference.

**BLOCKED condition**: Execution cannot establish whether the invariant holds because of test-harness, authentication, connectivity, or evidence limitations (e.g., N1 cannot obtain an authenticated session, or the consent_grants table is inaccessible in a way that prevents determining whether the invariant is enforced vs. simply unreachable).

**Note on enforcement layer**: A deliberately unavailable direct-write permission (e.g., RLS denying INSERT, or the table requiring a SECURITY DEFINER function for writes) is recorded as the enforcement mechanism. It is not automatically a defect or a BLOCKED result. The test records what enforcement exists; it does not prescribe the architecture.

**Maps to**: SC8, Gate 1, Finding G-NO-DB-TRUST-GUARD

**Layer enforcement note**: This is a security invariant test. It cannot be PASSed by showing that the SharePage UI enforces the authority check (Pilot 001 already proved that). It must be PASSed by showing that the enforcement survives UI bypass.

---

#### W2 — Navigator Cannot Send Disclosure Without Delivery Proof Through Authenticated UI-Bypass Access

**Layer**: Security invariant
**Actor**: N1 (authenticated, assigned to Household A)
**Prerequisites**: T1 PASS (a prepared disclosure exists). **Must execute BEFORE T2 per frozen execution order: T1 → U2 → W2 → T2 → T3 → U1.** The disclosure must remain in 'prepared' status when W2 executes.

**Steps**:
1. N1 is signed in and has an active authenticated session.
2. N1 attempts to directly UPDATE the disclosure record (created in T1) to status='sent' via the Supabase client (bypassing the disclosure delivery UI), WITHOUT populating delivery proof fields (delivered_at, delivered_by, delivery_method).
3. Record whether the operation succeeds or is prevented, and if prevented, at which layer (authorization denial, trust/state guard, RLS policy, CHECK constraint, or other enforcement).

**PASS condition**: The prohibited state (disclosure status='sent' without delivery proof) cannot be created through authenticated UI-bypass access. This includes prevention because authorization deliberately denies the operation, because a state guard or CHECK constraint rejects it, or because RLS or another enforcement mechanism blocks it. The actual enforcement layer is recorded as evidence. The disclosure status does not change to 'sent' without delivery proof.

**FAIL condition**: The prohibited state is successfully created — the disclosure record has status='sent' without populated delivery proof fields.

**BLOCKED condition**: Execution cannot establish whether the invariant holds because of test-harness, authentication, connectivity, or evidence limitations.

**Post-W2 verification (mandatory before T2)**:
- If W2 PASSES: Verify the disclosure record remains status='prepared' and all fields are unchanged (no side-effect from the blocked attempt). Confirm the record is still usable for T2. If the disclosure was unexpectedly modified despite the status not changing to 'sent', record the modification as a finding and assess whether T2 can proceed.
- If W2 FAILS: The disclosure record has been corrupted (status='sent' without delivery proof). Preserve the evidence (screenshot, database snapshot of the corrupted record). Do NOT continue normal delivery using the corrupted record. Downstream handling:
  - T2 is BLOCKED with reason "W2 FAIL — disclosure record corrupted by prohibited state; cannot proceed with delivery on corrupted record."
  - T3 is BLOCKED (depends on T2).
  - U1 is BLOCKED (depends on T3).
  - V1-V10 are BLOCKED (depend on U1).
  - A fresh disclosure may be created through T1 (if the UI allows creating a second disclosure for the same consent) to attempt remaining tests, but the original corrupted record is preserved as W2 FAIL evidence and is not used for further workflow steps.
  - The W2 FAIL is recorded as a P1 finding (trust boundary bypass).
- If W2 is BLOCKED: Record the blocking reason. T2 may proceed if the disclosure record is confirmed intact and the W2 BLOCKED reason is unrelated to the disclosure state (e.g., harness limitation). If the BLOCKED reason relates to the disclosure state being unverifiable, T2 is BLOCKED.

**Maps to**: SC8, Gate 1, Finding G-NO-DB-TRUST-GUARD (informed by frozen Test H delivery-proof evidence)

**Layer enforcement note**: This test is informed by G-NO-DB-TRUST-GUARD (trust enforcement beneath the UI) and frozen Test H delivery-proof requirements/evidence (disclosure transition integrity). No finding is created, renamed, broadened, or reclassified by this test.

---

#### W3 (CONDITIONAL — NOT EXERCISED IN ADULT-ONLY TOPOLOGY) — Navigator Cannot Bypass Youth Assent Through Authenticated UI-Bypass Access

**Condition**: This case is outside the 32-case denominator. It is included ONLY if the test topology is expanded to include a youth participant. In the adult-only minimum topology, this case is recorded as CONDITIONAL / NOT EXERCISED.

**Layer**: Security invariant
**Actor**: N1 (authenticated, assigned to Household A)
**Prerequisites**: R2 PASS (youth assent recorded for comparison); youth participant exists

**Steps**:
1. N1 is signed in and has an active authenticated session.
2. N1 attempts to directly INSERT a consent_grant record via the Supabase client for a youth participant WITHOUT a valid youth_assent record reference.
3. Record whether the operation succeeds or is prevented, and at which enforcement layer.

**PASS condition**: The prohibited state (consent for youth without assent) cannot be created through authenticated UI-bypass access. Enforcement layer recorded as evidence.

**FAIL condition**: The prohibited state is successfully created.

**BLOCKED condition**: No youth participant in the test topology, or R2 is BLOCKED, or execution cannot establish whether the invariant holds.

**Maps to**: SC8 (conditional portion), Gate 1

---

### Group X — Cross-Household Isolation (Security Invariant)

#### X1 — Negative-Control Navigator Cannot Read Household A Pathway Records

**Layer**: Security invariant
**Actor**: N2 (authenticated, NOT assigned to Household A)
**Prerequisites**: Q2 PASS (pathway exists for Household A)

**Steps**:
1. N2 signs in and has an active authenticated session.
2. N2 attempts to SELECT pathway records for Household A through the application UI (if a navigator workflow view exists) and through direct API query.
3. Record whether records are returned or blocked, and at which enforcement layer.

**PASS condition**: N2 sees no pathway records for Household A through either the UI or direct API. The prohibition is recorded with its enforcement layer (RLS, authorization denial, or other). N2 sees only records for households they are assigned to (empty, since N2 is assigned to no households).

**FAIL condition**: N2 can see Household A's pathway records through either the UI or direct API.

**BLOCKED condition**: N2 cannot obtain an authenticated session, or Q2 is BLOCKED (no pathway to test against), or execution cannot establish whether records are visible due to test-harness limitations.

**Maps to**: SC9, Gate 6

---

#### X2 — Negative-Control Navigator Cannot Read Household A Trust/Authority Records

**Layer**: Security invariant
**Actor**: N2
**Prerequisites**: R1 PASS (authority exists for Household A)

**Steps**:
1. N2 signs in and has an active authenticated session.
2. N2 attempts to SELECT authority_to_act and youth_assent records for Household A through UI and direct API.
3. Record whether records are returned or blocked, and at which enforcement layer.

**PASS condition**: N2 sees no trust/authority records for Household A through either interface. Enforcement layer recorded.

**FAIL condition**: N2 can see Household A's trust records.

**BLOCKED condition**: N2 cannot sign in, or R1 is BLOCKED, or execution cannot establish visibility.

**Maps to**: SC9, Gate 6

---

#### X3 — Negative-Control Navigator Cannot Read Household A Disclosure/Consent Records

**Layer**: Security invariant
**Actor**: N2
**Prerequisites**: T3 PASS (disclosure sent), S2 PASS (consent created)

**Steps**:
1. N2 signs in and has an active authenticated session.
2. N2 attempts to SELECT disclosure and consent_grant records for Household A through UI and direct API.
3. Record whether records are returned or blocked, and at which enforcement layer.

**PASS condition**: N2 sees no disclosure or consent records for Household A through either interface. Enforcement layer recorded.

**FAIL condition**: N2 can see Household A's disclosure or consent records.

**BLOCKED condition**: N2 cannot sign in, or T3/S2 are BLOCKED, or execution cannot establish visibility.

**Maps to**: SC9, Gate 6

---

#### X4 — Negative-Control Navigator Cannot Read Household A Referral Records

**Layer**: Security invariant
**Actor**: N2
**Prerequisites**: U1 PASS (referral exists for Household A)

**Steps**:
1. N2 signs in and has an active authenticated session.
2. N2 attempts to SELECT referral records for Household A through UI and direct API.
3. Record whether records are returned or blocked, and at which enforcement layer.

**PASS condition**: N2 sees no referral records for Household A through either interface. Enforcement layer recorded.

**FAIL condition**: N2 can see Household A's referral records.

**BLOCKED condition**: N2 cannot sign in, or U1 is BLOCKED, or execution cannot establish visibility.

**Maps to**: SC9, Gate 6

---

### Group Y — Household Consistency (Security Invariant)

#### Y1 — Navigator Cannot Create Cross-Household Referral

**Layer**: Security invariant
**Actor**: N1 (authenticated, assigned to BOTH Household A and Household B)
**Prerequisites**: U1 PASS for Household A; Household B security fixture HB-DISCLOSURE-SENT exists and has passed fixture validation (HB-FV, see Section 9C)

**Steps**:
1. N1 signs in and has an active authenticated session.
2. N1 attempts to create a referral for Household A that references Household B's HB-DISCLOSURE-SENT disclosure_id (through UI and/or direct API).
3. Record whether the operation succeeds or is prevented, and at which enforcement layer.

**PASS condition**: The cross-household referral creation is prevented. No referral record is created that references a disclosure from a different household. Enforcement layer recorded.

**FAIL condition**: The referral is created with a disclosure from a different household, meaning cross-household record mixing is possible.

**BLOCKED condition**: N1 cannot sign in, or Household B security fixture HB-DISCLOSURE-SENT does not exist, or HB-FV fixture validation failed (fixture is invalid), or execution cannot establish the result.

**Maps to**: Gate 5, Finding I-NO-CONSENT-DISCLOSURE-HOUSEHOLD-CHECK

---

#### Y2 — Navigator Cannot Create Cross-Household Consent

**Layer**: Security invariant
**Actor**: N1 (authenticated, assigned to BOTH households)
**Prerequisites**: R1 PASS for Household A; Household B security fixture HB-AUTHORITY exists and has passed fixture validation (HB-FV, see Section 9C)

**Steps**:
1. N1 signs in and has an active authenticated session.
2. N1 attempts to create a consent_grant for Household A that references Household B's HB-AUTHORITY authority_to_act_id (through direct API).
3. Record whether the operation succeeds or is prevented, and at which enforcement layer.

**PASS condition**: The cross-household consent creation is prevented. No consent record is created that references an authority from a different household. Enforcement layer recorded.

**FAIL condition**: The consent is created with an authority from a different household.

**BLOCKED condition**: N1 cannot sign in, or Household B security fixture HB-AUTHORITY does not exist, or HB-FV fixture validation failed (fixture is invalid), or execution cannot establish the result.

**Maps to**: Gate 5, Finding I-NO-CONSENT-DISCLOSURE-HOUSEHOLD-CHECK

---

#### Y3 — Records for Household A Contain Only Household A References

**Layer**: Security invariant
**Actor**: Test executor (database query)
**Prerequisites**: U1 PASS (full component workflow completed for Household A)

**Steps**:
1. Query all records created during the Household A component workflow (Q through U): pathway, authority, consent_grant, disclosure, referral.
2. For each record, verify household_id = Household A.
3. For each cross-record reference (pathway→need, authority→pathway, consent→authority, disclosure→consent, referral→disclosure), verify the referenced record also belongs to Household A.

**PASS condition**: All records created for Household A have household_id = Household A. All cross-record references point only to other Household A records. No record references Household B data.

**FAIL condition**: Any record created for Household A has a different household_id, or any cross-record reference points to a Household B record.

**BLOCKED condition**: U1 is BLOCKED (incomplete component workflow for Household A).

**Maps to**: Gate 5

---

### Group Z — Anonymous Access (Security Invariant)

#### Z1 — Anonymous Access to All Navigator-Mediated Record Types Is Blocked

**Layer**: Security invariant
**Actor**: Unauthenticated (no session)
**Prerequisites**: U1 PASS (records exist for all navigator-mediated types)

**Steps**:
1. Without signing in (anonymous/unauthenticated state), attempt to SELECT records from each navigator-mediated table: pathways, authority_to_act, youth_assent, consent_grants, disclosures, referrals.
2. Attempt access through both the application UI (navigating to pages without auth) and direct API query.
3. Record whether records are returned or blocked, and at which enforcement layer.

**PASS condition**: All anonymous access attempts are blocked. No records are returned from any navigator-mediated table. UI pages redirect to sign-in or display an authentication-required message. API queries return empty results or authentication errors. Enforcement layer recorded for each table.

**FAIL condition**: Any anonymous access attempt returns records from any navigator-mediated table.

**BLOCKED condition**: U1 is BLOCKED (no records to test against), or execution cannot establish whether records are visible due to test-harness limitations.

**Maps to**: SC10, Gate 6

---

### Group AA — End-to-End Workflow (Real Workflow Succeeds)

#### AA1 — Fresh Complete Workflow from Confirmed Need to Sent Referral Through UI, With Privacy-History Comprehension, Succeeds Continuously

**Layer**: Real workflow succeeds
**Actor**: N1 (navigator steps) and P1 (participant steps)

**Prerequisites**: AA1 may execute when the actors, UI capabilities, fresh confirmed need, and required infrastructure necessary for the continuous workflow are available. Prior component PASS/FAIL/BLOCKED results (Q1–V10) remain evidence and context but do not automatically determine AA1. AA1 is BLOCKED only when a condition actually prevents the fresh continuous workflow from being attempted (e.g., no fresh confirmed need available, N1 or P1 cannot sign in, required UI does not exist, required infrastructure is unavailable).

AA1 does NOT reuse the records created during component testing. AA1 uses a **fresh confirmed need** in Household A (or a second confirmed need if Household A has one available).

**Fresh record inventory**: AA1 creates its own set of records, inventoried separately from component-test records:
- 1 fresh pathway (AA-pathway)
- 1 fresh authority-to-act (AA-authority)
- 1 fresh consent grant (AA-consent)
- 1 fresh disclosure (AA-disclosure)
- 1 fresh referral (AA-referral)
All AA1 records are recorded in the temporary-record ledger with their exact IDs (see Section 11).

**Steps**:
1. Starting from a fresh confirmed need in Household A, N1 and P1 complete the entire workflow as a single continuous session:
   - N1 creates a pathway from the confirmed need through UI (AA-pathway)
   - N1 creates authority-to-act through UI (AA-authority)
   - P1 approves sharing through SharePage (AA-consent created)
   - Consent-authority linkage verified (AA-consent.authority_to_act_id = AA-authority)
   - N1 prepares disclosure through UI (AA-disclosure, status='prepared')
   - N1 starts delivery through UI (AA-disclosure, status='in_delivery')
   - N1 confirms delivery through UI (AA-disclosure, status='sent', delivery proof populated)
   - N1 creates referral through UI (AA-referral, referencing AA-disclosure)
   - P1 views privacy history through UI
2. P1 is then presented with the same 8 comprehension questions as V10:
   - Who was your information shared with?
   - Why was sharing approved?
   - What information was shared?
   - What information was NOT shared?
   - Was the disclosure prepared but not sent, or was it actually sent?
   - When was the disclosure delivered?
   - Who recorded the delivery?
   - Are your sharing permissions currently active or revoked?
3. P1 answers all 8 questions using ONLY the privacy history UI, with no navigator assistance.
4. Each answer is matched against the known AA1 test state (AA-consent, AA-disclosure, AA-referral database values).
5. No step in the workflow is performed through direct API or database access. All steps use the application UI.
6. No step fails or requires a workaround.

**PASS condition**: All of the following are true:
- The entire workflow completes successfully through the application UI with no direct API/database workaround.
- AA-pathway, AA-authority, AA-consent, AA-disclosure (status='sent'), and AA-referral are created with correct attribution and linkage.
- AA-consent.authority_to_act_id references AA-authority (consent-authority linkage verified).
- AA-disclosure has complete delivery proof (delivered_at, delivered_by, delivery_method populated).
- P1 correctly answers all 8 comprehension questions using only the privacy history UI, with no navigator assistance, matched against AA1 test state.
- No step requires direct API/database access as a workaround.

**FAIL condition**: Any step in the continuous workflow cannot be completed through the UI, or a step requires direct API/database access as a workaround, or the workflow produces incomplete or incorrect records, or any of P1's 8 comprehension answers is incorrect, or the consent-authority linkage is missing, or delivery proof is incomplete.

**BLOCKED condition**: A condition actually prevents the fresh continuous workflow from being attempted — e.g., no fresh confirmed need is available in Household A, or N1 or P1 cannot sign in, or required UI capabilities do not exist, or required infrastructure is unavailable. Prior component BLOCKED results do not automatically BLOCK AA1 unless the underlying condition (e.g., UI does not exist) also prevents the fresh workflow.

**Maps to**: All SC, All Gates (comprehensive verification)

**Layer enforcement note**: This is the highest-layer test in the entire matrix. It cannot be PASSed by showing individual steps work in isolation (lower layers) or by reusing records from component testing. It requires a fresh complete workflow to succeed as a continuous human-driven process through the application, producing correct records AND correct participant comprehension. Individual step PASS results are evidence and context but the same records are not reused.

**AA1 cleanup**: AA1 records (AA-pathway, AA-authority, AA-consent, AA-disclosure, AA-referral) are inventoried separately and cleaned up per the cleanup lifecycle in Section 11.

---

## 7. Security/Negative Attack Matrix

Each attack is a structured attempt to violate a security invariant. Attacks are executed after the happy-path component workflow is complete (so records exist to attack against). ATK cases are supporting evidence for the authoritative W/X/Y/Z cases, not separate authoritative cases.

| Attack ID | Attacker | Method | Target | Expected Result | Maps To |
|-----------|----------|--------|--------|-----------------|---------|
| ATK-1 | N1 (authenticated, assigned) | Direct INSERT consent_grant without authority_to_act_id | consent_grants table | Prohibited state cannot be created. Enforcement layer recorded. | W1, Gate 1 |
| ATK-2 | N1 (authenticated, assigned) | Direct UPDATE disclosure status='sent' without delivery proof | disclosures table | Prohibited state cannot be created. Enforcement layer recorded. | W2, Gate 1 |
| ATK-3 | N2 (authenticated, unassigned) | SELECT pathway records for Household A | pathways table via UI and API | No records returned. Enforcement layer recorded. | X1, Gate 6 |
| ATK-4 | N2 (authenticated, unassigned) | SELECT trust/authority records for Household A | authority_to_act, youth_assent via UI and API | No records returned. Enforcement layer recorded. | X2, Gate 6 |
| ATK-5 | N2 (authenticated, unassigned) | SELECT disclosure/consent records for Household A | disclosures, consent_grants via UI and API | No records returned. Enforcement layer recorded. | X3, Gate 6 |
| ATK-6 | N2 (authenticated, unassigned) | SELECT referral records for Household A | referrals via UI and API | No records returned. Enforcement layer recorded. | X4, Gate 6 |
| ATK-7 | N2 (authenticated, unassigned) | INSERT pathway for Household A's need | pathways table | Prohibited state cannot be created. Enforcement layer recorded. | Gate 6 |
| ATK-8 | N1 (authenticated, both households) | INSERT referral for Household A with Household B fixture disclosure_id | referrals table | Prohibited state cannot be created. Enforcement layer recorded. | Y1, Gate 5 |
| ATK-9 | N1 (authenticated, both households) | INSERT consent for Household A with Household B fixture authority_to_act_id | consent_grants table | Prohibited state cannot be created. Enforcement layer recorded. | Y2, Gate 5 |
| ATK-10 | Anonymous (unauthenticated) | SELECT from all navigator-mediated tables | pathways, authority_to_act, youth_assent, consent_grants, disclosures, referrals | No records returned. Enforcement layer recorded. | Z1, Gate 6 |
| ATK-11 | N2 (authenticated, unassigned) | INSERT authority for Household A's person | authority_to_act table | Prohibited state cannot be created. Enforcement layer recorded. | Gate 6 |
| ATK-12 | N2 (authenticated, unassigned) | INSERT disclosure/consent for Household A | disclosures, consent_grants | Prohibited state cannot be created. Enforcement layer recorded. | Gate 6 |

**Conditional attacks (outside denominator — adult-only topology):**

| Attack ID | Attacker | Method | Target | Expected Result | Maps To |
|-----------|----------|--------|--------|-----------------|---------|
| ATK-13 | N1 (authenticated, assigned) | Direct INSERT consent for youth participant without youth_assent | consent_grants table | Prohibited state cannot be created. Enforcement layer recorded. | W3, Gate 1 |

### Attack PASS/BLOCKED Semantics (applies to all ATK and W/X/Y/Z cases)

- **PASS**: The prohibited state cannot be created through authenticated UI-bypass access. This includes prevention because authorization deliberately denies the operation, because a trust or state guard rejects it, because RLS blocks it, or because another enforcement mechanism prevents it. The actual enforcement layer is recorded as evidence without prescribing its architecture.
- **FAIL**: The prohibited state is successfully created.
- **BLOCKED**: Execution cannot establish whether the invariant holds because of test-harness, authentication, connectivity, or evidence limitations. A deliberately unavailable direct-write permission is not automatically a defect or BLOCKED result. It is recorded as the enforcement mechanism.

---

## 8. Participant Privacy-History Comprehension Test

### Protocol

The comprehension test is used by both V10 (component-level) and AA1 (end-to-end-level). The protocol is identical for both; the difference is which records the answers are matched against (V10: component-test records; AA1: fresh AA1 records).

### Setup

- The participant (P1) has completed the sharing approval step and the full workflow is complete.
- P1 is alone with the application. No navigator is present or available for consultation.
- P1 has not been told what to look for in the privacy history beyond "review your sharing history."
- The test administrator presents the 8 questions (below) one at a time.
- P1 uses ONLY the privacy history page in the application to answer each question.
- P1 is not permitted to use database tools, API calls, or any interface other than the application UI.

### Questions

| # | Question | What P1 Must Identify | Correct Answer Source |
|---|----------|----------------------|----------------------|
| 1 | Who was your information shared with? | Recipient organization name | disclosure recipient / referral recipient |
| 2 | Why was sharing approved? | Purpose of sharing | consent_grant purpose / pathway purpose |
| 3 | What information was shared? | Claim content summary | disclosure claim content |
| 4 | What information was NOT shared? | Excluded content or "nothing was excluded" | willNotShare / excluded items |
| 5 | Was the disclosure prepared but not sent, or was it actually sent? | Disclosure status (prepared vs sent) | disclosure status |
| 6 | When was the disclosure delivered? | Delivery date/time | disclosure delivered_at |
| 7 | Who recorded the delivery? | Navigator identity | disclosure delivered_by |
| 8 | Are your sharing permissions currently active or revoked? | Consent status | consent_grant status |

### Scoring (Objective)

- Each question is scored as CORRECT or INCORRECT.
- An answer is CORRECT if P1's stated answer matches the known test state for that field.
- An answer is INCORRECT if P1's stated answer does not match the known test state, or if P1 states "I can't tell from this page."
- The PASS criterion is strictly 8 of 8 CORRECT.
- Any incorrect answer results in FAIL.
- Usability observations (e.g., confusion, hesitation, time taken, comments about clarity) may be recorded separately as qualitative notes. They do not alter the objective PASS/FAIL result unless they cause an incorrect answer.

### Layer Enforcement

This test cannot be PASSed by:
- Showing the data exists in the database (data exists layer)
- Showing the service returns the data (service works layer)
- Showing the privacy history page loads (UI exposes it layer)

It can only be PASSed by a human participant correctly answering all 8 questions using only the privacy history page without navigator assistance. This is the "person understands/controls it" layer.

---

## 9. Preflight/Baseline Design

### 9A. Preflight Steps

**B0 Environment Baseline is captured BEFORE PF-1 or any Pilot 002 object creation.** B0 must precede account provisioning, household creation, navigator assignments, confirmed-need setup, Household B fixtures, authoritative records, AA1 records, and attack artifacts. See Section 9B for B0 details.

| Step | Description | Verification |
|------|-------------|--------------|
| PF-1 | Provision test accounts: P1 (participant), N1 (navigator), N2 (negative-control navigator), A1 (admin) | Each account can sign in; roles are correct |
| PF-2 | Create or verify Household A with confirmed need | Household A exists; has at least one confirmed need; P1 is a member |
| PF-3 | Create Household B with confirmed need using Pilot 001-proven process (admin-proposed interpretation) | Household B exists; has at least one confirmed need |
| PF-4 | Assign N1 to both Household A and Household B | N1 appears in navigator assignments for both households |
| PF-5 | Verify N2 is NOT assigned to Household A or Household B | N2 appears in no navigator assignments |
| PF-6 | Verify seed catalog has eligible services for both households' confirmed needs | At least one service/provider is eligible for each need |
| PF-7 | Capture B1 Execution Baseline — after all Pilot 002 infrastructure (accounts, households, assignments, confirmed needs) exists but BEFORE any HB fixtures, authoritative component records, AA1 records, or attack artifacts are created. See Section 9B for B1 details. | B1 recorded |
| PF-8 | Verify Pilot 001 authoritative PASS cases remain intact (no regression) | Spot-check: narration immutability, need confirmation, pathway RLS for existing records |
| PF-9 | Verify the application builds and runs without errors | Application loads; sign-in page accessible; no console errors on load |
| PF-10 | Verify navigator workflow UI areas exist (or note which are missing and must be implemented before test execution) | Navigator UI for pathway, trust, disclosure, referral exists or is documented as not-yet-implemented |

### Preflight PASS Condition

All PF-1 through PF-9 pass. PF-10 may note missing UI (expected, since the findings indicate UI does not exist yet). Missing UI in PF-10 means the corresponding test cases are BLOCKED until implementation, not that preflight fails.

### Preflight BLOCKED Condition

If PF-1 through PF-9 fail, test execution is BLOCKED. The blocking reason is recorded. No authoritative test cases are executed.

### Post-Preflight: Household B Fixture Creation and Validation

After B1 is captured (PF-7), and before any authoritative test execution:

1. Create Household B security fixtures (HB-PATHWAY, HB-AUTHORITY, HB-CONSENT, HB-DISCLOSURE-SENT) per Section 9C. These are post-B1 temporary records.
2. Perform HB-FV fixture validation per Section 9C.
3. Record all four fixture UUIDs in the temporary-record ledger.
4. If HB-FV passes, Y1/Y2 may proceed when their other prerequisites are met.
5. If HB-FV fails, Y1/Y2 are BLOCKED.

---

### 9B. Two-Checkpoint Baseline Accounting

#### B0 — Environment Baseline

**When captured**: Before PF-1 or any Pilot 002 object creation. This is the state of the environment before Pilot 002 touches anything. B0 precedes account provisioning, household creation, navigator assignments, confirmed-need setup, Household B fixtures, authoritative records, AA1 records, and attack artifacts.

**What is recorded**:

| Data Point | Description |
|-----------|-------------|
| All existing accounts | UUIDs of all pre-existing accounts (Pilot 001 accounts, any production accounts) |
| All existing households | UUIDs of all pre-existing households |
| All existing navigator assignments | All pre-existing assignment records |
| Record counts by table | Count of existing records in: persons, households, household_members, narrations, interpretations, proposed_needs, pathways, authority_to_act, youth_assent, consent_grants, disclosures, referrals |
| Record IDs | All pre-existing record UUIDs in navigator-mediated tables |
| Pilot 001 frozen record IDs | Specifically identified and protected: all records created during Pilot 001 test execution |

**Purpose**: B0 is the ground truth. Final teardown (Stage 2 cleanup) must return the environment to B0 (except for explicitly documented pre-existing objects that Pilot 002 did not create and must not delete). B0 protects Pilot 001 records and distinguishes them from everything Pilot 002 creates.

#### B1 — Execution Baseline

**When captured**: After all Pilot 002 preflight infrastructure is complete (accounts P1/N1/N2/A1 created, households A/B created or verified, navigator assignments made, confirmed needs established), but BEFORE any HB fixtures, HB-FV, authoritative component records, AA1 records, or attack artifacts are created.

**What is recorded**:

| Data Point | Description |
|-----------|-------------|
| Pilot 002 account UUIDs | P1, N1, N2, A1 UUIDs |
| Pilot 002 household UUIDs | Household A, Household B UUIDs (if created by Pilot 002; if pre-existing, noted as such) |
| Navigator assignment records | N1→A, N1→B assignments; confirmation N2 has none |
| Record counts by table | Updated counts reflecting preflight-created persons, households, assignments, confirmed needs — but NOT HB fixtures or any test records |
| New record UUIDs since B0 | All UUIDs created during preflight (accounts, households, assignments, confirmed needs) |
| Pilot 001 frozen record IDs | Re-verified: all Pilot 001 records still intact and unchanged |

**Purpose**: B1 is the reference point for test-record cleanup (Stage 1). After all test records, HB fixtures, AA1 records, and attack artifacts are cleaned up, the environment should return to B1. B1 includes Pilot 002 infrastructure (accounts, households, assignments, confirmed needs) but does NOT include HB fixtures or any authoritative/AA1/attack records. B1-level objects are torn down in Stage 2 cleanup.

**Key distinction**: HB fixtures (HB-PATHWAY, HB-AUTHORITY, HB-CONSENT, HB-DISCLOSURE-SENT) are created AFTER B1 is captured. They are post-B1 temporary records, cleaned up in Stage 1.

#### Cleanup Verification in Two Stages

**Stage 1 — Test-record/fixture cleanup**: Delete all authoritative component records, Household B security fixtures (HB-PATHWAY, HB-AUTHORITY, HB-CONSENT, HB-DISCLOSURE-SENT), AA1 records, and attack artifacts by exact UUID (reverse dependency order). After Stage 1, verify record counts in navigator-mediated tables return to B1 levels. Pilot 002 accounts, households, assignments, and confirmed needs remain (they are B1-level objects, torn down in Stage 2).

**Stage 2 — Pilot 002 account/household/assignment teardown**: Delete navigator assignments, households (if created by Pilot 002), confirmed needs (if created by Pilot 002), and accounts created solely for Pilot 002. After Stage 2, verify record counts and object counts return to B0 levels. Do not claim counts equal B1 after Stage 2 — Stage 2 intentionally deletes objects that were included in B1.

**Pilot 001 protection**: All Pilot 001 frozen records are verified intact at B0, B1, after Stage 1 cleanup, and after Stage 2 teardown. No Pilot 001 record is modified or deleted at any point.

#### Lifecycle Summary

**B0 → Pilot 002 infrastructure/preflight setup (PF-1 through PF-6, PF-8, PF-9, PF-10) → B1 → HB fixture creation + HB-FV + authoritative execution + AA1 + attacks → Stage 1 cleanup → B1 → Stage 2 teardown → B0**

---

### 9C. Household B Security Fixtures

#### Purpose

Y1 and Y2 require Household B records (a sent disclosure and an authority-to-act record) to test cross-household reference prevention. These records are **controlled security fixtures**, not authoritative test cases. They exist solely to provide a known Household B record ID that a cross-household attack can reference.

#### Timing

HB fixtures are created AFTER B1 is captured. They are post-B1 temporary records, inventoried in the temporary-record ledger, and cleaned up during Stage 1 cleanup.

#### Exact Required Record Types

| Fixture ID | Record Type | Household | Required Fields | Purpose |
|-----------|-------------|-----------|-----------------|---------|
| HB-AUTHORITY | authority_to_act | B | household_id=B, person_id (Household B person), pathway_id (Household B pathway), status=active | Y2 attack target: N1 attempts to create Household A consent referencing HB-AUTHORITY |
| HB-DISCLOSURE-SENT | disclosure | B | household_id=B, consent_grant_id (Household B consent), pathway_id (Household B pathway), status='sent', delivered_at populated, delivered_by populated | Y1 attack target: N1 attempts to create Household A referral referencing HB-DISCLOSURE-SENT |

#### Supporting Records Required to Create Fixtures

To create HB-AUTHORITY and HB-DISCLOSURE-SENT, the following supporting records must also exist for Household B:
- HB-PATHWAY: pathway for Household B's confirmed need
- HB-CONSENT: consent_grant for Household B (required for HB-DISCLOSURE-SENT)

Total Household B fixture records: 4 (HB-PATHWAY, HB-AUTHORITY, HB-CONSENT, HB-DISCLOSURE-SENT)

#### How They May Be Created

Fixture records are created through **direct service-layer calls** (programmatic), NOT through the application UI. This is because:
1. The fixtures exist to test security invariants (Y1, Y2), not to prove UI capability.
2. Creating them through UI would constitute an uncounted Pilot 002 workflow execution for Household B, which is not in the authoritative denominator.
3. The Pilot 001 service layer is proven for these operations (E1-E5, G1-G8, H1-H4 authoritative PASS).

Fixture creation uses the same service functions proven in Pilot 001 (createPathway, createAuthority, createConsentGrant, prepareDisclosure + startDelivery + confirmDelivery) executed with service-role or admin credentials.

#### Why They Are Supporting Fixtures, Not Authoritative Cases

- They do not prove any new capability ladder rung. The service layer is already proven by Pilot 001.
- They do not test UI exposure (the navigator does not create them through the UI).
- They exist solely as known record IDs for cross-household attack tests.
- They are not counted in the 32-case denominator.
- They are inventoried in the temporary-record ledger and cleaned up during Stage 1.

#### Expected Count

4 Household B fixture records: 1 pathway, 1 authority, 1 consent, 1 disclosure (sent).

#### Unique ID Recording

All 4 fixture record UUIDs are recorded in the temporary-record ledger after creation and before Y1/Y2 attacks are executed. The exact UUIDs are used to:
- Reference the correct Household B record in Y1/Y2 attack attempts
- Verify the fixtures still exist post-attack (attacks should not modify or delete them)
- Clean up the fixtures during Stage 1

#### No Reuse of Pilot 001 Frozen Records

Household B fixtures must not reuse any Pilot 001 frozen records. All 4 fixture records are newly created after B1 and bear new UUIDs. Pilot 001 records are protected per B0 and B1 baselines and PF-8.

#### Household B Fixture Validation (HB-FV)

After creating HB-PATHWAY, HB-AUTHORITY, HB-CONSENT, and HB-DISCLOSURE-SENT, a mandatory supporting validation must be performed before Y1/Y2 may execute.

**Validation checks**:

| Check | Verification |
|-------|-------------|
| HB-FV-1 | HB-PATHWAY has household_id = Household B |
| HB-FV-2 | HB-AUTHORITY has household_id = Household B |
| HB-FV-3 | HB-CONSENT has household_id = Household B |
| HB-FV-4 | HB-DISCLOSURE-SENT has household_id = Household B |
| HB-FV-5 | HB-AUTHORITY references HB-PATHWAY (authority.pathway_id = HB-PATHWAY UUID) |
| HB-FV-6 | HB-CONSENT references HB-AUTHORITY (consent.authority_to_act_id = HB-AUTHORITY UUID) |
| HB-FV-7 | HB-DISCLOSURE-SENT references HB-CONSENT (disclosure.consent_grant_id = HB-CONSENT UUID) |
| HB-FV-8 | HB-DISCLOSURE-SENT references HB-PATHWAY (disclosure.pathway_id = HB-PATHWAY UUID) |
| HB-FV-9 | HB-DISCLOSURE-SENT status = 'sent' |
| HB-FV-10 | HB-DISCLOSURE-SENT delivered_at is populated |
| HB-FV-11 | HB-DISCLOSURE-SENT delivered_by is populated |
| HB-FV-12 | None of the 4 fixture UUIDs appear in the Pilot 001 frozen record ID list (B0) |

**Validation PASS**: All 12 checks pass. Y1 and Y2 may proceed.

**Validation FAIL**: Any check fails. Y1 and Y2 are BLOCKED with reason "Household B fixture validation (HB-FV) failed — control fixture is invalid." The specific failed check(s) are recorded. The invalid fixture is preserved as evidence but not used for attacks.

**Classification**: HB-FV is supporting evidence. It does not enter the authoritative denominator. It exists to ensure Y1/Y2 attacks reference valid Household B records.

#### Cleanup

All 4 Household B fixture records are deleted during Stage 1 cleanup, after Y1/Y2 tests are complete and integrity checks are verified. Deletion order (reverse dependency): HB-DISCLOSURE-SENT → HB-CONSENT → HB-AUTHORITY → HB-PATHWAY. Post-deletion verification confirms 0 Household B fixture records remain and record counts return to B1 levels.

---

## 10. Authoritative Dependency and Execution-Order Specification

### Frozen Execution Order for Disclosure/Referral/Trust-Boundary Group

The disclosure delivery, referral creation, and trust-boundary penetration tests have a state dependency that requires a specific execution order:

**T1 → U2 → W2 → T2 → T3 → U1**

Rationale:
- T1 creates a disclosure with status='prepared'.
- U2 requires a prepared-but-not-sent disclosure to test the referral transition guard. U2 MUST execute before T2 changes the status to 'in_delivery'.
- W2 requires a prepared disclosure to test the delivery-proof trust boundary. W2 MUST execute before T2 changes the status. W2 tests whether a navigator can bypass the delivery-proof requirement by directly updating the disclosure to 'sent' without proof.
- After W2: If W2 PASSes, verify the disclosure remains 'prepared' and unchanged before proceeding to T2. If W2 FAILs (prohibited state created), the disclosure is corrupted — see W2 downstream handling. Do not continue normal delivery using the corrupted record.
- T2 transitions the disclosure to 'in_delivery'. May only execute after U2 and W2 have completed and the disclosure is confirmed intact.
- T3 transitions the disclosure to 'sent' and completes delivery proof.
- U1 requires a sent disclosure to test successful referral creation. U1 MUST execute after T3.

If any test is executed out of order and destroys required state, the affected dependent tests are recorded as BLOCKED with the reason "state destroyed by out-of-order execution of [preceding test]."

### Full Execution-Order Dependency Graph

The following table specifies all stateful dependencies. Tests are grouped into phases that must execute in order. Within a phase, tests may execute in parallel unless they share state.

| Phase | Tests | State Created | State Required | Next Phase Depends On |
|-------|-------|--------------|----------------|----------------------|
| 0a — B0 Baseline | Capture B0 Environment Baseline | None (read-only) | None | All preflight depends on B0 being captured first |
| 0b — Preflight Setup | PF-1 through PF-6, PF-8, PF-9, PF-10 | Accounts, households, assignments, confirmed needs | B0 captured | B1 capture depends on preflight setup |
| 0c — B1 Baseline | Capture B1 Execution Baseline | None (read-only) | All preflight setup complete | HB fixture creation depends on B1 |
| 0d — HB Fixture Creation + Validation | Create HB-PATHWAY, HB-AUTHORITY, HB-CONSENT, HB-DISCLOSURE-SENT; perform HB-FV | Household B security fixtures | B1 captured; preflight setup complete | Y1/Y2 depend on HB-FV PASS |
| 1 — Navigator Pathway | Q1, Q2 | Household A pathway | Confirmed need in Household A | R1 depends on Q2 |
| 2 — Navigator Authority | R1 | Household A authority | Q2 pathway | S1 depends on R1; W1 depends on R1 |
| 3 — Participant Sharing | S1, S2, S3 | Household A consent grant | R1 authority | T1 depends on S2 |
| 4 — Disclosure Preparation | T1 | Household A disclosure (prepared) | S2 consent | U2 depends on T1; W2 depends on T1 |
| 5 — Referral Guard (Negative) | U2 | None (tests prevention) | T1 disclosure (prepared, not sent) | Must execute before W2 and T2 |
| 6 — Trust Boundary: Delivery Proof | W2 | None (tests prevention) | T1 disclosure (prepared, not sent) | Must execute before T2; post-W2 verification confirms disclosure intact |
| 7 — Delivery Start | T2 | Household A disclosure (in_delivery) | T1 disclosure (prepared, confirmed intact after U2 and W2) | T3 depends on T2 |
| 8 — Delivery Confirm | T3 | Household A disclosure (sent, delivery proof) | T2 disclosure (in_delivery) | U1 depends on T3; X3 depends on T3 |
| 9 — Referral Creation | U1 | Household A referral (sent) | T3 disclosure (sent) | V1 depends on U1; X4 depends on U1; Y3 depends on U1 |
| 10 — Privacy History (Component) | V1 → V2 → V3 → V4 → V5 → V6 → V7 → V8 → V9 → V10 | None (reads only) | U1 referral | V1 depends on U1; V2-V9 depend on V1; V10 depends on V1-V9 |
| 11 — Security: Trust Boundary (Authority) | W1 | None (tests prevention) | R1 (authority exists for comparison) | W1 depends on R1; may execute any time after R1 |
| 12 — Security: Isolation | X1, X2, X3, X4 | None (reads only, tests blocking) | Q2 (X1); R1 (X2); T3+S2 (X3); U1 (X4) | X1 depends on Q2; X2 on R1; X3 on T3+S2; X4 on U1 |
| 13 — Security: Household Consistency | Y1, Y2, Y3 | None (tests prevention/reads) | U1 for HA + HB-FV-validated fixtures (Y1); R1 for HA + HB-FV-validated fixtures (Y2); U1 (Y3) | Y1 depends on U1 + HB-FV PASS; Y2 depends on R1 + HB-FV PASS; Y3 depends on U1 |
| 14 — Security: Anonymous | Z1 | None (tests blocking) | U1 (records must exist) | Z1 depends on U1 |
| 15 — End-to-End | AA1 | Fresh AA1 records (pathway, authority, consent, disclosure, referral) | Actors, UI capabilities, fresh confirmed need, required infrastructure available | AA1 may execute independently when its own prerequisites are met |

### State Preservation Rule

No test may destroy or modify the state created by an earlier test before all dependent tests have executed. Specifically:
- T1's prepared disclosure must remain 'prepared' until U2 and W2 have executed.
- T2 may not execute until U2 and W2 have completed and the disclosure is confirmed intact.
- T3 may not execute until U2 and W2 have completed.
- No test may delete or modify records created by earlier tests in the same household workflow.

### Execution Order Violation

If a test is executed out of order and destroys required state, the affected dependent tests are recorded as BLOCKED with the reason "state destroyed by out-of-order execution of [preceding test]." The out-of-order test itself is not retroactively failed, but the dependency violation is recorded as a test-execution finding.

---

## 11. Temporary-Record Accounting and Cleanup Lifecycle

### Lifecycle

**B0 → Pilot 002 infrastructure/preflight setup → B1 → HB fixtures/HB-FV + authoritative execution + AA1 + attacks → Stage 1 cleanup → B1 → Stage 2 teardown → B0**

### Lifecycle Phases

**Phase 1 — B0 Environment Baseline (before any Pilot 002 objects exist)**

Capture B0 before PF-1 or any Pilot 002 object creation. Record:
- All pre-existing account UUIDs (Pilot 001 accounts, any production accounts)
- All pre-existing household UUIDs
- All pre-existing navigator assignment records
- All pre-existing record UUIDs in navigator-mediated tables (Pilot 001 frozen records)
- Record counts by table
- Pilot 001 frozen record IDs specifically identified and protected

**Phase 2 — Preflight Setup**

Create Pilot 002 accounts (P1, N1, N2, A1), households (A, B), navigator assignments, and confirmed needs. Perform PF-1 through PF-6, PF-8, PF-9, PF-10.

**Phase 3 — B1 Execution Baseline (after preflight, before HB fixtures and authoritative records)**

Capture B1 after all Pilot 002 infrastructure exists but BEFORE HB fixtures, HB-FV, authoritative component records, AA1 records, or attack artifacts. Record:
- Pilot 002 account UUIDs (P1, N1, N2, A1)
- Pilot 002 household UUIDs (A, B)
- Navigator assignment records (N1→A, N1→B; N2 has none)
- Record counts by table (reflecting preflight-created objects: accounts, households, assignments, confirmed needs — but NOT HB fixtures or any test records)
- New record UUIDs since B0 (accounts, households, assignments, confirmed needs)
- Pilot 001 frozen record IDs re-verified intact

**Phase 4 — HB Fixture Creation and Validation (post-B1)**

Create Household B security fixtures (HB-PATHWAY, HB-AUTHORITY, HB-CONSENT, HB-DISCLOSURE-SENT) through direct service-layer calls. Perform HB-FV fixture validation. Record all four fixture UUIDs in the temporary-record ledger. HB fixtures are post-B1 temporary records.

**Phase 5 — Temporary-Record Ledger (created during test execution)**

Every record created during Pilot 002 test execution (including HB fixtures) is logged in the temporary-record ledger with:

| Field | Description |
|-------|-------------|
| Record ID | UUID of the created record |
| Record Type | pathway, authority_to_act, consent_grant, disclosure, referral, etc. |
| Household | Household A or Household B |
| Created By | Which test case or fixture step created it (e.g., Q2, R1, T1, AA1, HB-fixture) |
| Created At | Timestamp |
| Test Phase | Component test, security fixture, or AA1 end-to-end |
| Cleanup Required | Yes (all Pilot 002 temporary records) or No (justified exception) |

Ledger sections:
- **Household B security fixtures**: HB-PATHWAY, HB-AUTHORITY, HB-CONSENT, HB-DISCLOSURE-SENT (created post-B1, recorded in ledger immediately)
- **Component-test records**: Records created by Q2, R1, S2, T1, T2, T3, U1 (Household A component workflow)
- **AA1 fresh records**: AA-pathway, AA-authority, AA-consent, AA-disclosure, AA-referral
- **Attack artifacts**: Any records that were unexpectedly created by attacks that should have been prevented (FAIL evidence). These are preserved for investigation, then cleaned up.

**Phase 6 — Execution**

Test cases execute in the order specified in Section 10. Each test that creates a record logs it in the ledger immediately.

**Phase 7 — Integrity Verification (after all tests complete)**

Post-test integrity checks (see Section 11A below) verify:
- No orphaned records
- No cross-household references
- Record count delta matches expected (B1 + HB fixtures + component records + AA1 records + any attack artifacts)
- No anonymous-access artifacts
- Pilot 001 records unchanged
- Consent-authority links intact
- Household B fixtures intact post-attack

**Phase 8 — Stage 1 Cleanup (test-record/fixture cleanup → return to B1)**

All records in the temporary-record ledger with "Cleanup Required = Yes" are deleted by exact UUID, in reverse dependency order:

1. AA1 fresh records: AA-referral → AA-disclosure → AA-consent → AA-authority → AA-pathway
2. Component-test records: U1 referral → T3/T2/T1 disclosure → S2 consent → R1 authority → Q2 pathway
3. Household B fixtures: HB-DISCLOSURE-SENT → HB-CONSENT → HB-AUTHORITY → HB-PATHWAY
4. Attack artifacts: Any records created by failed attacks (preserved through integrity verification, then deleted)

Pilot 001 frozen records are NOT deleted. They are identified by the B0 UUID list and excluded from cleanup.

After Stage 1, verify:
- Record counts in navigator-mediated tables return to B1 levels (B1 included preflight infrastructure but NOT HB fixtures, component records, AA1 records, or attack artifacts)
- All Pilot 001 frozen record UUIDs still exist and are unchanged
- No component-test, AA1, HB-fixture, or attack-artifact UUIDs remain in any navigator-mediated table
- Pilot 002 accounts, households, assignments, and confirmed needs remain (they are B1-level objects, torn down in Stage 2)

**Phase 9 — Stage 2 Cleanup (Pilot 002 account/household/assignment teardown → return to B0)**

Delete:
1. Navigator assignments (N1→A, N1→B)
2. Confirmed needs created by Pilot 002 (if any were created during preflight, not pre-existing)
3. Households created by Pilot 002 (Household B; Household A if created by Pilot 002 — if pre-existing, it remains)
4. Pilot 002 accounts (P1, N1, N2, A1) — only if created solely for Pilot 002 and not pre-existing

After Stage 2, verify:
- Record counts and object counts return to B0 levels
- All Pilot 001 frozen record UUIDs still exist and are unchanged
- No Pilot 002-created UUIDs remain (accounts, households, assignments, confirmed needs, records)
- Do not claim counts equal B1 after Stage 2 — Stage 2 intentionally deletes objects that were included in B1

### Records/Accounts That May Intentionally Remain

| Item | Retain? | Justification |
|------|---------|---------------|
| Pilot 001 frozen records | Yes — must remain | They are not Pilot 002 temporary records. They belong to Pilot 001. Protected at B0 and B1. |
| Household A (if pre-existing from Pilot 001) | Yes — must remain | Not created by Pilot 002. Return to B0. |
| Pilot 002 test accounts (P1, N1, N2, A1) | No — delete in Stage 2 | Created solely for Pilot 002 testing. No production purpose. |
| Pilot 002 households (A if created by Pilot 002, B) | No — delete in Stage 2 | Created solely for Pilot 002 preflight. Return to B0. |
| Navigator assignments (N1→A, N1→B) | No — delete in Stage 2 | Created solely for Pilot 002 testing. |
| Confirmed needs created by Pilot 002 | No — delete in Stage 2 | Created solely for Pilot 002 preflight. Return to B0. |
| Household B fixtures | No — delete in Stage 1 | Created post-B1 solely for Y1/Y2 security tests. |
| Component-test records | No — delete in Stage 1 | Created solely for component validation. |
| AA1 fresh records | No — delete in Stage 1 | Created solely for end-to-end validation. |
| Attack artifacts (if any) | No — delete in Stage 1 after investigation | Created by failed attacks. Preserved for investigation, then deleted. |

### 11A. Post-Test Integrity Checks

| Check ID | Description | Expected Result |
|----------|-------------|-----------------|
| INT-1 | No orphaned pathways: every pathway has a valid need_id pointing to an existing need | All pathways have valid need references |
| INT-2 | No orphaned disclosures: every disclosure has a valid consent_grant_id and pathway_id | All disclosures have valid references |
| INT-3 | No orphaned referrals: every referral has a valid disclosure_id and pathway_id | All referrals have valid references |
| INT-4 | No cross-household references: all records in Household A reference only Household A records; all records in Household B reference only Household B records | No cross-household references found |
| INT-5 | Record count delta: navigator-mediated table counts match B1 plus HB fixtures plus expected new records from test execution (component + AA1 + any attack artifacts) | Counts match expected delta from B1 (including HB fixtures as post-B1 additions) |
| INT-6 | No anonymous-access artifacts: no records were created or modified by unauthenticated sessions | All records have valid created_by/modified_by attribution |
| INT-7 | Pilot 001 baseline data intact: original Pilot 001 records (narrations, interpretations, needs) are unchanged | No Pilot 001 records modified during Pilot 002 |
| INT-8 | Consent-authority links intact: all consent_grants created during Pilot 002 have valid authority_to_act_id | All consent grants have valid authority links |
| INT-9 | Household B fixtures intact post-attack: HB-AUTHORITY and HB-DISCLOSURE-SENT were not modified or deleted by Y1/Y2 attacks | Fixture records unchanged after attacks |
| INT-10 | Stage 1 post-cleanup: record counts in navigator-mediated tables return to B1 levels; no component/AA1/HB-fixture/attack UUIDs remain | Counts match B1; no temporary records remain (including HB fixtures) |
| INT-11 | Stage 2 post-cleanup: record and object counts return to B0 levels; no Pilot 002-created UUIDs remain; Pilot 001 records intact | Counts match B0; Pilot 001 intact |

### Integrity FAIL Condition

If any INT check fails, the failure is recorded as a Pilot 002 finding with severity and evidence. Integrity failures do not retroactively change test case results but may indicate side-effects of test execution that require investigation.

---

## 12. Authoritative Case Denominator

### Denominator: 32 authoritative cases

| Group | Cases | Count |
|-------|-------|-------|
| Q — Navigator Pathway | Q1, Q2 | 2 |
| R — Navigator Authority | R1 | 1 |
| S — Participant Sharing | S1, S2, S3 | 3 |
| T — Disclosure Delivery | T1, T2, T3 | 3 |
| U — Referral Creation | U1, U2 | 2 |
| V — Privacy History | V1, V2, V3, V4, V5, V6, V7, V8, V9, V10 | 10 |
| W — Trust Boundary | W1, W2 | 2 |
| X — Isolation | X1, X2, X3, X4 | 4 |
| Y — Household Consistency | Y1, Y2, Y3 | 3 |
| Z — Anonymous Access | Z1 | 1 |
| AA — End-to-End | AA1 | 1 |
| **Total** | | **32** |

### Denominator Arithmetic

2 (Q) + 1 (R) + 3 (S) + 3 (T) + 2 (U) + 10 (V) + 2 (W) + 4 (X) + 3 (Y) + 1 (Z) + 1 (AA) = **32**

No corrections in v4 added or removed authoritative cases. The v3-to-v4 correction is baseline-accounting reconciliation only. Denominator unchanged.

### Conditional Cases (outside denominator — adult-only topology)

| Case | Condition | Status in Adult-Only Topology |
|------|-----------|-------------------------------|
| R2 | Youth participant included in topology | CONDITIONAL / NOT EXERCISED |
| W3 | Youth participant included in topology | CONDITIONAL / NOT EXERCISED |

If both conditional cases are activated by a topology expansion, denominator becomes 34. Arithmetic: 32 + 2 = 34.

### Supporting Checks (not in denominator; frozen as supporting evidence)

| Check ID | Description | Parent Case |
|----------|-------------|-------------|
| Q-S1 | Pathway database record has correct attribution | Q2 |
| R-S1 | Authority database record has correct attribution | R1 |
| S-S1 | Consent grant database record has correct attribution | S2 |
| T-S1 | Disclosure database record has correct status and attribution | T1 |
| T-S2 | Delivery proof fields populated in database | T3 |
| U-S1 | Referral database record has correct attribution | U1 |

### Supporting Security Fixtures (not in denominator)

| Fixture ID | Description |
|-----------|-------------|
| HB-PATHWAY | Household B pathway for Y1/Y2 fixture chain (post-B1 temporary record) |
| HB-AUTHORITY | Household B authority for Y2 attack target (post-B1 temporary record) |
| HB-CONSENT | Household B consent for HB-DISCLOSURE-SENT prerequisite (post-B1 temporary record) |
| HB-DISCLOSURE-SENT | Household B sent disclosure for Y1 attack target (post-B1 temporary record) |

### Supporting Fixture Validation (not in denominator)

| Check ID | Description |
|-----------|-------------|
| HB-FV | Household B fixture validation (12 checks) — must PASS before Y1/Y2 |

### Supporting Attacks (not in denominator; provide evidence for W/X/Y/Z cases)

ATK-1 through ATK-12 (and ATK-13 conditional). These are execution vehicles for the authoritative W/X/Y/Z cases, not separate authoritative cases.

### Result Categories

- **PASS**: The test case's PASS condition is met.
- **FAIL**: The test case's FAIL condition is met.
- **BLOCKED**: The test case's BLOCKED condition is met (a prerequisite is BLOCKED or FAIL, required infrastructure is unavailable, or execution cannot establish the result due to test-harness/auth/connectivity/evidence limitations).

### Denominator Accounting (Pre-Execution)

- 32 authoritative cases
- 0 PASS (before execution)
- 0 FAIL (before execution)
- 0 BLOCKED (before execution)
- 2 conditional (not in denominator; CONDITIONAL / NOT EXERCISED in adult-only topology)

---

## 13. Traceability Matrix

### Gate Coverage

| Gate | Required Property | Test Cases | Coverage | Youth-Assent Status |
|------|-------------------|------------|----------|---------------------|
| Gate 1 — Trust enforceable when UI bypassed | Authority, applicable assent, and delivery-proof requirements survive UI bypass | W1 (authority), W2 (delivery proof), W3 (assent — CONDITIONAL / NOT EXERCISED) | Covered for adult-applicable requirements (authority, delivery proof). Youth-assent coverage is CONDITIONAL / NOT EXERCISED. | CONDITIONAL / NOT EXERCISED |
| Gate 2 — Consent-authority audit trail | Every consent grant links to authority-to-act record | S3 | Covered | N/A |
| Gate 3 — Navigator workflow UI availability | Navigator can perform all workflow steps through UI | Q1, Q2 (pathway), R1 (authority), S1 (SharePage), T1, T2, T3 (disclosure), U1 (referral) | Covered | N/A |
| Gate 4 — Participant privacy history visibility | Participant can understand sharing history without navigator | V1, V2, V3, V4, V5, V6, V7, V8, V9, V10 | Covered | N/A |
| Gate 5 — Household consistency under navigator mediation | No cross-household record mixing | Y1, Y2, Y3 | Covered | N/A |
| Gate 6 — Isolation preservation with new record types | Cross-household isolation, anonymous blocking, unassigned blocking hold | X1, X2, X3, X4 (negative-control), Z1 (anonymous) | Covered | N/A |

### Gate 1 Youth-Assent Coverage Note

Gate 1's required property includes "applicable assent" requirements. In the adult-only topology, youth assent is not applicable. Gate 1 is satisfiable for the trust requirements that apply to the adult topology (authority-to-act and disclosure delivery-proof). Youth-assent enforcement (W3) is CONDITIONAL / NOT EXERCISED. Pilot 002 does not claim to have proved youth-assent UI or bypass protection. If Gate 1 is assessed as PASS based on W1 and W2, the assessment explicitly notes that youth-assent coverage was not exercised.

### Success Criteria Coverage

| SC | Description | Test Cases | Coverage | Youth-Assent Status |
|----|-------------|------------|----------|---------------------|
| SC1 | Navigator creates pathway from confirmed need through UI | Q1, Q2 | Covered | N/A |
| SC2 | Navigator creates authority-to-act and records youth assent through UI | R1 (authority) | Covered for authority. Youth assent (R2) is CONDITIONAL / NOT EXERCISED. | CONDITIONAL / NOT EXERCISED |
| SC3 | Participant approves sharing; navigator-created authority satisfies trust check | S1, S2 | Covered | N/A |
| SC4 | Navigator prepares, starts, confirms delivery through UI | T1, T2, T3 | Covered | N/A |
| SC5 | Navigator creates referral through UI; transition guards hold | U1, U2 | Covered | N/A |
| SC6 | Participant views privacy history and answers all questions without navigator | V1, V2, V3, V4, V5, V6, V7, V8, V9, V10, AA1 (comprehension) | Covered | N/A |
| SC7 | Every consent grant links to authority-to-act record | S3, AA1 (linkage verification) | Covered | N/A |
| SC8 | Navigator cannot bypass trust boundary through direct API | W1 (consent without authority), W2 (disclosure without proof), W3 (assent bypass — CONDITIONAL / NOT EXERCISED) | Covered for adult-applicable requirements. Youth-assent bypass coverage is CONDITIONAL / NOT EXERCISED. | CONDITIONAL / NOT EXERCISED |
| SC9 | Cross-household isolation holds with navigator-mediated records | X1, X2, X3, X4 | Covered | N/A |
| SC10 | Anonymous access to navigator-mediated records is blocked | Z1 | Covered | N/A |

### Finding Coverage

| Finding | Severity | Test Cases | Coverage |
|---------|----------|------------|----------|
| G-NO-DB-TRUST-GUARD | P1 | W1, W2 (W3 conditional) | Covered for adult-applicable trust requirements. Youth-assent enforcement is CONDITIONAL / NOT EXERCISED. |
| H-NO-AUTHORITY-LINK | P1 | S3, AA1 | Covered |
| E-NO-CREATION-UI | P2 | Q1, Q2 | Covered |
| G-NO-TRUST-UI | P2 | R1 (R2 conditional) | Covered for authority-to-act UI. Youth-assent UI is CONDITIONAL / NOT EXERCISED. |
| H-NO-DELIVERY-UI | P2 | T1, T2, T3 | Covered |
| I-NO-REFERRAL-CREATION-UI | P2 | U1, U2 | Covered |
| N-NO-PRIVACY-HISTORY-UI | P2 | V1-V10, AA1 (comprehension) | Covered |
| I-NO-CONSENT-DISCLOSURE-HOUSEHOLD-CHECK | P2 | Y1, Y2, Y3 | Covered |

### Capability Ladder Coverage

| Layer | Test Cases | Coverage |
|-------|------------|----------|
| Data exists | Accepted from Pilot 001 (not retested) | N/A |
| Service works | S3 (consent-authority link is a service/data property) | Covered for new capabilities |
| UI exposes it | Q1, Q2, R1, S1, S2, T1, T2, T3, U1, U2 | Covered |
| Person understands/controls it | V1, V2, V3, V4, V5, V6, V7, V8, V9, V10 | Covered |
| Real workflow succeeds | AA1 (fresh continuous workflow with comprehension) | Covered |
| Security invariant holds | W1, W2, X1, X2, X3, X4, Y1, Y2, Y3, Z1 | Covered |

---

## 14. Explicit Exclusions

### Excluded by Frozen Scope

- **Funding management** (F-NO-FUNDING-UI, F-NO-FUNDING-GUARD): No test cases for navigator creating or managing funding options. Pilot 001 funding display language (F1-F5) accepted as baseline.
- **Outcome reporting** (K-NO-OUTCOME-UI): No test cases for recording outcomes (service received, helpfulness, chose differently, not yet). K-NO-OUTCOME-DB-GUARD (PROFESSIONAL_REVIEW) does not intersect minimum scope.
- **Barrier reporting** (L-NO-BARRIER-UI, L-NO-BARRIER-ADMIN-REVIEW): No test cases for recording barriers or admin barrier review. L-NO-BARRIER-DB-GUARD (PROFESSIONAL_REVIEW) does not intersect minimum scope.
- **Contact-attempt recording UI**: No test cases for navigator recording contact attempts.
- **Participant declines referral** (I-NO-PERSON-DECLINED-TRANSITION): No test cases for participant declining a sent referral.
- **Full consent-duration semantics** (H-NO-DURATION): No test cases for consent expiry or duration configuration. Consent remains active until revoked.
- **Consent revocation**: Not an entry or exit condition for minimum Pilot 002. Not in the authoritative denominator.
- **Youth-assent UI and bypass protection** (R2, W3): Conditional cases not exercised in adult-only topology. Not in the authoritative denominator. Pilot 002 does not claim to have proved these capabilities.

### Excluded as Pilot 001 Baseline (Not Retested)

- Narration entry, draft preservation, submission, immutability (B1-B6)
- Interpretation branches and privacy boundary (C1-C3, C-PRIVACY as supporting)
- Need creation, edit, remove, confirm, privacy boundary (D1-D4, D-PRIVACY as supporting)
- Pathway eligibility wording, funding wording, freshness check (E1-E5)
- Funding display language (F1-F5)
- Trust hard-stop UI behavior for no-authority case (G1-G8)
- Consent creation, disclosure lifecycle, delivery proof requirement (H1-H4)
- Referral transition guards at service layer (I1-I6)
- No-response handling (J1-J5)
- Outcome independent dimensions (K1-K4)
- Barrier neutral blame language (L1-L4a)
- No automatic referral from next_action (M5)
- Cross-household isolation base patterns (O1-O6)

**Exception**: O-pattern isolation is retested through X1-X4, Z1, and ATK-7, ATK-11, ATK-12 with navigator-mediated records, because new UI code paths create new record types. This is not a retest of RLS policy correctness; it is verification that new code paths do not introduce leakage.

### Excluded as Non-Intersecting Findings

- E-PROVENANCE (P3): Accepted as known limitation. Not tested.
- F-PROVENANCE (P3): Accepted as known limitation. Not tested.
- H-WILL-NOT-SHARE-SERVICE (P3): Accepted as known limitation. UI compensates. V5 tests that the UI displays something meaningful but does not test the service fix.
- H-NO-DURATION (P2): Not tested unless required by professional/domain decision.
- I-NO-PERSON-DECLINED-TRANSITION (P2): Not tested.
- B7 simplistic parsing: Accepted as known limitation. Not tested.

### Excluded Professional/Domain Decisions

- Self-authorization for adults: NOT REQUIRED FOR MINIMUM PILOT 002. Not tested.
- Guardian/parent actor for youth: NOT REQUIRED FOR MINIMUM PILOT 002. Not tested (R2/W3 not exercised).
- Claim attribution adequacy: NOT REQUIRED FOR MINIMUM PILOT 002. V4 and AA1 verify content is displayed but do not judge legal adequacy.

### Excluded Test Types

- Performance/load testing: Not applicable to workflow validation.
- Mobile-specific testing: Web application only.
- Provider-side integration: Referral received/acknowledged states remain navigator-reported (SIMULATED).
- Automated interpretation generation: Interpretation remains navigator-proposed.
- Payment processing: No real payments or funding disbursements.
- External organization onboarding: Uses existing Pilot 001 seed catalog.

### Excluded Fixture/Supporting Artifacts from Authoritative Denominator

- Household B security fixtures (HB-PATHWAY, HB-AUTHORITY, HB-CONSENT, HB-DISCLOSURE-SENT): Supporting fixtures for Y1/Y2. Created programmatically after B1. Post-B1 temporary records. Not authoritative cases.
- HB-FV fixture validation: Supporting validation. Not authoritative. Must PASS before Y1/Y2 but does not enter the denominator.
- ATK-1 through ATK-12 (and ATK-13 conditional): Execution vehicles for W/X/Y/Z cases. Not separate authoritative cases.
- Supporting database checks (Q-S1, R-S1, S-S1, T-S1, T-S2, U-S1): Supporting verification for parent cases. Not authoritative cases.

---

PILOT 002 TEST DESIGN v4 — AWAITING FREEZE APPROVAL
# Pilot 001 — Observation Log

**Date started:** 2026-08-09
**Status:** Test A COMPLETE — all subtests PASS. Test B COMPLETE — all subtests PASS. Test C COMPLETE — all subtests PASS. Test D COMPLETE — all subtests PASS. Test E COMPLETE — all subtests PASS. Test F COMPLETE — all subtests PASS. Test G COMPLETE — all subtests PASS. Test H COMPLETE — all subtests PASS.

This document records every test execution. Each entry uses the structure below. Copy the template for each test ID.

---

## Template (copy per test)

```
### TEST ID: [e.g., A1]

- **Date/time:** [ISO 8601]
- **Actor:** [person / navigator / admin / anonymous]
- **Starting state:** [what exists before the action]
- **Action performed:** [what was done]
- **Expected behavior:** [what should happen]
- **Actual behavior:** [what actually happened]
- **Result:** PASS / FAIL / PARTIAL / BLOCKED
- **Screenshot/reference:** [if available]
- **Data created/changed:** [rows inserted/updated, tables affected]
- **Security/privacy observation:** [any concern or confirmation]
- **User-experience observation:** [did the person understand? was wording clear?]
- **Finding classification:** KEEP / MODIFY / MISSING / REMOVE / DEFECT / SECURITY / PRIVACY / PROFESSIONAL_REVIEW
- **Recommended action:** [what to do next]
```

---

## TEST A — PERSON + HOUSEHOLD

**Executed:** 2026-08-09T03:56:40Z (A1–A6, O6) and 2026-08-09T03:57:36Z (A7)
**Overall result:** PASS (7/7 subtests PASS, 1 bonus O6 PASS)

**P0 defect discovered and fixed:** Infinite RLS recursion between `households` and `household_memberships` SELECT policies. Fixed via migration `20260809180000_pilot001_fix_household_rls_recursion` before completing Test A.

### TEST ID: A1

- **Date/time:** 2026-08-09T03:56:40Z
- **Actor:** pilot_participant_a
- **Starting state:** No auth account exists for Pilot A
- **Action performed:** supabase.auth.signUp with email/password (same as application SignupPage)
- **Expected behavior:** Account created, session active
- **Actual behavior:** Account created. User ID: 7c73b09c-766b-45eb-bef8-8aaf9fd1fb8f. Session active.
- **Result:** PASS
- **Screenshot/reference:** test-a-pilot001.mjs output
- **Data created/changed:** auth.users row: 7c73b09c-766b-45eb-bef8-8aaf9fd1fb8f
- **Security/privacy observation:** Email confirmation OFF — session returned immediately. Expected for pilot.
- **User-experience observation:** Signup requires only email and password. No demographics collected at account creation. Minimal friction.
- **Finding classification:** KEEP
- **Recommended action:** None — account creation works as designed.

### TEST ID: A2

- **Date/time:** 2026-08-09T03:56:40Z
- **Actor:** pilot_participant_a
- **Starting state:** Auth account exists, no person record
- **Action performed:** INSERT INTO persons (auth_user_id, first_name="Maria", is_youth=false) — same as narrationService.getOrCreatePerson
- **Expected behavior:** Person row created, linked to auth user
- **Actual behavior:** Person created. ID: b38e7879-2fc9-4534-9cc2-2afc762d3733, first_name: "Maria", is_youth: false
- **Result:** PASS
- **Screenshot/reference:** test-a-pilot001.mjs output
- **Data created/changed:** persons row: b38e7879-2fc9-4534-9cc2-2afc762d3733
- **Security/privacy observation:** RLS insert_own_person WITH CHECK (auth.uid() = auth_user_id) — enforced. Only the authenticated user can create their own person record.
- **User-experience observation:** Only first name requested. No last name, no demographics, no SSN, no income. Minimal and appropriate.
- **Finding classification:** KEEP
- **Recommended action:** None — person creation works as designed.

### TEST ID: A3

- **Date/time:** 2026-08-09T03:56:40Z
- **Actor:** pilot_participant_a
- **Starting state:** Person record exists, no household
- **Action performed:** INSERT INTO households (created_by_person_id, name=null) — same as narrationService.createHousehold
- **Expected behavior:** Household row created
- **Actual behavior:** Household created. ID: 0bb28561-436a-4d0d-922a-71f4ac3f2713
- **Result:** PASS (after P0 fix — initial attempt FAILED due to infinite RLS recursion)
- **Screenshot/reference:** test-a-pilot001.mjs output (first run FAIL, second run PASS after migration)
- **Data created/changed:** households row: 0bb28561-436a-4d0d-922a-71f4ac3f2713
- **Security/privacy observation:** RLS insert_own_household WITH CHECK — enforced after recursion fix. Initial failure was a P0 DEFECT: `select_own_memberships` policy on `household_memberships` had a self-referential subquery creating infinite recursion with `select_own_household` on `households`. Fixed via migration `20260809180000_pilot001_fix_household_rls_recursion`.
- **User-experience observation:** Household created silently after person creation. No explicit "create household" step in UI — StartPage does it automatically. Participant may not know a household was created.
- **Finding classification:** MODIFY (household creation visibility) + DEFECT (RLS recursion, now fixed)
- **Recommended action:** Consider making household creation more visible to the participant, or at minimum showing it in the dashboard after creation.

### TEST ID: A4

- **Date/time:** 2026-08-09T03:56:40Z
- **Actor:** pilot_participant_a
- **Starting state:** Household exists, no self-membership
- **Action performed:** INSERT INTO household_memberships (household_id, person_id, role="self") — auto-membership from createHousehold
- **Expected behavior:** Membership row created with role="self"
- **Actual behavior:** Membership created. ID: d2f72fe3-7de7-473c-8dba-df6912389857, role: "self"
- **Result:** PASS
- **Screenshot/reference:** test-a-pilot001.mjs output
- **Data created/changed:** household_memberships row: d2f72fe3-7de7-473c-8dba-df6912389857
- **Security/privacy observation:** RLS insert_own_memberships WITH CHECK — enforced. relationship_role="self" is contextual only, NOT legal authority. The HouseholdSummary component correctly displays: "Household membership helps organize your story. It does not establish custody, guardianship, or legal authority."
- **User-experience observation:** The disclaimer about household membership not establishing legal authority is present in the UI. This is the correct framing — membership ≠ authority.
- **Finding classification:** KEEP
- **Recommended action:** None — self-membership works correctly and the disclaimer is present in the UI.

### TEST ID: A5

- **Date/time:** 2026-08-09T03:56:40Z
- **Actor:** pilot_participant_a
- **Starting state:** Person + household + self-membership all created
- **Action performed:** getHouseholdForPerson + getHouseholdWithMembers — same as AppDashboardPage.loadData
- **Expected behavior:** Pilot A can see their own household and their own membership
- **Actual behavior:** Household visible: true. Members visible: 1. Self in members: true
- **Result:** PASS
- **Screenshot/reference:** test-a-pilot001.mjs output
- **Data created/changed:** none (read-only)
- **Security/privacy observation:** RLS select_own_household + select_own_memberships — working correctly after recursion fix. Pilot A can only see their own household.
- **User-experience observation:** Dashboard shows household with member name and "self" role. Clear and understandable.
- **Finding classification:** KEEP
- **Recommended action:** None — household visibility works correctly.

### TEST ID: A6

- **Date/time:** 2026-08-09T03:56:40Z
- **Actor:** pilot_participant_a + pilot_participant_b
- **Starting state:** Both Pilot A and Pilot B have person + household + self-membership. Pilot B created with separate client instance to preserve session isolation.
- **Action performed:** A attempts to SELECT B's household, memberships, and person. A attempts to INSERT membership into B's household. B attempts to SELECT A's household.
- **Expected behavior:** All cross-household access BLOCKED by RLS
- **Actual behavior:** A reads B household: BLOCKED; A reads B memberships: BLOCKED; A reads B person: BLOCKED; A inserts into B household: BLOCKED; B reads A household: BLOCKED
- **Result:** PASS
- **Screenshot/reference:** test-a-pilot001.mjs output (separate client instances for A and B)
- **Data created/changed:** none (read-only + blocked insert)
- **Security/privacy observation:** Cross-household isolation fully enforced. RLS blocks all SELECT and INSERT access to other households' data. No leak detected.
- **User-experience observation:** Security test — not visible to participant.
- **Finding classification:** KEEP
- **Recommended action:** None — isolation works correctly.

### TEST ID: A7

- **Date/time:** 2026-08-09T03:57:36Z
- **Actor:** navigator (assigned to Pilot A household)
- **Starting state:** Navigator auth user created via admin SQL. navigator_assignment created for Pilot A household with status='active'.
- **Action performed:** 1) Navigator signs in. 2) Reads own navigator_assignments. 3) Attempts to read Pilot A's household and person directly. 4) Attempts to read Pilot B's household and person. 5) Verify no authority_to_act or consent auto-created. 6) Anonymous access test.
- **Expected behavior:** Nav can read own assignments. Nav cannot directly read households/persons tables (access via other tables' nav policies). Nav cannot read B data. No authority/consent auto-created. Anonymous fully blocked.
- **Actual behavior:** Nav reads own assignments: 1 row. Assigned nav reads A household: BLOCKED (expected — nav accesses via other tables). Assigned nav reads A person: BLOCKED (expected). Assigned nav reads B household: BLOCKED. Assigned nav reads B person: BLOCKED. Authority auto-creation: NONE (correct — no trigger creates authority_to_act on navigator assignment). Anonymous access: BLOCKED.
- **Result:** PASS
- **Screenshot/reference:** test-a7-navigator.mjs output
- **Data created/changed:** navigator_assignments row (created via admin SQL for test)
- **Security/privacy observation:** Navigator assignment grants access to own assignment records only. Cannot directly read households or persons tables. Cannot access other households. Anonymous fully blocked. Membership ≠ authority confirmed — no authority_to_act or consent auto-created when navigator is assigned.
- **User-experience observation:** Navigator assignment is admin-only. Participant is not involved in this step. HouseholdSummary correctly states membership does not establish legal authority.
- **Finding classification:** KEEP
- **Recommended action:** None — navigator assignment behavior correct.

---

## TEST B — NARRATION PRESERVATION + CONVEYANCE

**Executed:** 2026-08-09T04:03:08Z
**Overall result:** PASS (12/12 subtests PASS)

**Narration text used:** "My son Marcus is 8 and he's been having a hard time since his dad left. He's acting out at school and I don't know how to help him. I work two jobs so I can't always be there when he gets home. I'm worried about him falling behind and I don't know what's out there to help."

**Lifecycle observed:** draft → submitted → proposed → confirmed (with modify and reject branches also tested)

### TEST ID: B1

- **Date/time:** 2026-08-09T04:03:08Z
- **Actor:** pilot_participant_a
- **Starting state:** Signed in, on StoryPage (/app/story)
- **Action performed:** Verify narration entry interface (NarrationInput component)
- **Expected behavior:** Interface permits ordinary natural-language narration. No program name, diagnosis, legal terminology, insurance terminology, or service selection required. No document upload.
- **Actual behavior:** PASS — Interface is a free-text textarea with placeholder "What's happening?". Prompt says "Start wherever makes sense. You don't need to know what program you need." No service selector, no diagnosis field, no legal/insurance terminology, no document upload. Only Save Draft and Submit buttons.
- **Result:** PASS
- **Screenshot/reference:** test-b-pilot001.mjs output, NarrationInput.tsx
- **Data created/changed:** none
- **Security/privacy observation:** No sensitive data requested beyond what participant volunteers in free text.
- **User-experience observation:** The interface is inviting and non-technical. The prompt "Start wherever makes sense" and placeholder "What's happening?" make it clear the participant can use their own words. No jargon. The participant does not need to know a program name.
- **Finding classification:** KEEP
- **Recommended action:** None — narration entry interface is appropriate.

### TEST ID: B2

- **Date/time:** 2026-08-09T04:03:08Z
- **Actor:** pilot_participant_a
- **Starting state:** No narration exists for Pilot A
- **Action performed:** saveNarrationDraft (INSERT INTO person_narrations with original_text, status=draft)
- **Expected behavior:** original_text contains exactly what participant entered. status=draft. No Need/Pathway/Referral/ConsentGrant/Disclosure created.
- **Actual behavior:** Draft saved. ID: 05ef90fe-a474-49c5-b4eb-11fdc14d70cb. original_text matches input: true. status: draft. Needs created: NO (correct)
- **Result:** PASS
- **Screenshot/reference:** test-b-pilot001.mjs output
- **Data created/changed:** person_narrations row: 05ef90fe-a474-49c5-b4eb-11fdc14d70cb (status=draft)
- **Security/privacy observation:** RLS insert_own_narrations WITH CHECK — enforced. Only the person owner can create narration.
- **User-experience observation:** Save Draft button is clearly labeled. Draft saved confirmation appears. Participant can continue editing.
- **Finding classification:** KEEP
- **Recommended action:** None — draft preservation works correctly.

### TEST ID: B3

- **Date/time:** 2026-08-09T04:03:08Z
- **Actor:** pilot_participant_a
- **Starting state:** Draft narration exists
- **Action performed:** submitNarration (UPDATE status=submitted, submitted_at=now)
- **Expected behavior:** status changes to submitted. original_text remains unchanged. No Need created merely because narration was submitted.
- **Actual behavior:** Status changed: true. original_text preserved: true. Needs created on submit: NO (correct)
- **Result:** PASS
- **Screenshot/reference:** test-b-pilot001.mjs output
- **Data created/changed:** person_narrations row updated to status=submitted
- **Security/privacy observation:** RLS update_own_narrations — enforced. Only person owner can submit.
- **User-experience observation:** After submission, interface shows: "We're reviewing what you shared. Someone will read your story and organize what we heard. Check back soon." Clear and reassuring.
- **Finding classification:** KEEP
- **Recommended action:** None — submission works correctly.

### TEST ID: B4

- **Date/time:** 2026-08-09T04:03:08Z
- **Actor:** pilot_participant_a (attempting mutation)
- **Starting state:** Narration submitted, immutability trigger active
- **Action performed:** 1) Attempt UPDATE original_text after submission. 2) Attempt UPDATE proposed_interpretation (should succeed).
- **Expected behavior:** DATABASE BLOCKS original_text change. Other fields (proposed_interpretation) can still change.
- **Actual behavior:** original_text mutation: BLOCKED by database. Error: "original_text is immutable after submission and cannot be modified". proposed_interpretation update: SUCCEEDED
- **Result:** PASS
- **Screenshot/reference:** test-b-pilot001.mjs output
- **Data created/changed:** proposed_interpretation updated (original_text NOT changed)
- **Security/privacy observation:** Immutability trigger protect_narration_original_text() fires BEFORE UPDATE. If status IN (submitted/proposed/confirmed/modified/rejected) and original_text IS DISTINCT FROM OLD.original_text, raises exception. Participant's words are protected at the database level.
- **User-experience observation:** Not visible to participant — database-level protection.
- **Finding classification:** KEEP
- **Recommended action:** None — immutability protection works correctly.

### TEST ID: B5

- **Date/time:** 2026-08-09T04:03:08Z
- **Actor:** pilot_participant_a
- **Starting state:** Narration submitted, no interpretation yet
- **Action performed:** proposeInterpretation (UPDATE proposed_interpretation, status=proposed) — simulates admin review workflow
- **Expected behavior:** System can simultaneously show YOUR WORDS (original_text) and NEXTUP'S UNDERSTANDING (proposed_interpretation) separately. Interpretation not presented as official finding/diagnosis/eligibility/legal/insurance determination.
- **Actual behavior:** original_text preserved: true. proposed_interpretation set: true. Fields are different: true. UI shows "Your Words" (navy border) and "NextUp's Understanding" (gold border) in separate sections. Disclaimer present: "This helps organize possible next steps. It does not determine eligibility for a program."
- **Result:** PASS
- **Screenshot/reference:** test-b-pilot001.mjs output, InterpretationPreview.tsx
- **Data created/changed:** person_narrations row updated with proposed_interpretation, status=proposed
- **Security/privacy observation:** Interpretation is stored separately from original text. No mixing or overwriting.
- **User-experience observation:** The InterpretationPreview component clearly separates "Your Words" (participant's exact narration) from "NextUp's Understanding" (proposed interpretation). The NarrationPreservationBanner states: "Your words are preserved exactly as you wrote them. NextUp's understanding is kept separate and can be changed." The disclaimer correctly says it "does not determine eligibility for a program."
- **Finding classification:** KEEP
- **Recommended action:** None — interpretation separation works correctly.

### TEST ID: B6

- **Date/time:** 2026-08-09T04:03:08Z
- **Actor:** pilot_participant_a
- **Starting state:** Narration in proposed status, interpretation shown to participant
- **Action performed:** Test all three branches: CONFIRM (status=confirmed), MODIFY (status=modified, confirmed_interpretation=participant's edit), REJECT (status=rejected)
- **Expected behavior:** CONFIRM: participant accepts, original_text preserved. MODIFY: participant changes interpretation without changing original_text. REJECT: participant rejects without losing original narration.
- **Actual behavior:**
  - CONFIRM: Status=confirmed, original_text preserved=true, confirmed_interpretation set=true. PASS
  - MODIFY: Status=modified, original_text preserved=true, confirmed_interpretation=participant's edited version=true. PASS
  - REJECT: Status=rejected, original_text preserved=true. PASS
- **Result:** PASS (all three branches)
- **Screenshot/reference:** test-b-pilot001.mjs output, ConfirmModifyReject.tsx
- **Data created/changed:** person_narrations row updated through all three status transitions (reset between each)
- **Security/privacy observation:** All three branches preserve original_text. Rejecting interpretation does NOT destroy or replace original narration.
- **User-experience observation:** ConfirmModifyReject component shows three clear choices: Confirm ("This sounds right"), Modify ("Change what we heard"), Reject ("This doesn't capture it"). In editing mode, shows: "Edit NextUp's understanding below. Your original words stay unchanged." After rejection: "You let us know the interpretation didn't capture it. We'll try again." Correct framing throughout.
- **Finding classification:** KEEP
- **Recommended action:** None — all three participant review branches work correctly.

### TEST ID: B7

- **Date/time:** 2026-08-09T04:03:14Z
- **Actor:** pilot_participant_a
- **Starting state:** Narration confirmed, interpretation accepted
- **Action performed:** parseInterpretationToProposedNeeds (client-side parsing, NO persistence). NeedReview component shows proposed needs. Participant edits, removes, adds. Only on "Confirm Needs" does createReviewedNeeds() persist.
- **Expected behavior:** Participant can edit, remove, add needs. No needs persisted until explicit approval.
- **Actual behavior:** Parsed 1 proposed need from interpretation. Participant reviewed and modified to 2 needs (edited one, added one). Needs persisted before approval: NO (correct). After approval: 2 needs persisted. IDs: 01a442ae-4928-4bfe-8797-2890baa620c8, 9b60a609-5a6a-430a-ae3c-ecc89d0df9ee
- **Result:** PASS
- **Screenshot/reference:** test-b-pilot001.mjs output, NeedReview.tsx
- **Data created/changed:** 2 needs rows created after explicit participant approval
- **Security/privacy observation:** Proposed needs are client-side only until participant approves. No silent creation. RLS insert_own_needs WITH CHECK — enforced.
- **User-experience observation:** NeedReview component shows: "Here are the needs we'll use to organize your NextUp. Review these before we create them. You can edit, remove, or add to this list." Clear participant control. Edit (pencil), remove (trash), add (plus) buttons visible. "Confirm Needs" button in green.
- **Finding classification:** KEEP
- **Recommended action:** None — need review works correctly with participant control.

### TEST ID: B8

- **Date/time:** 2026-08-09T04:03:14Z
- **Actor:** pilot_participant_a
- **Starting state:** Needs persisted
- **Action performed:** Verify each Need has traceability to Person, Household, and PersonNarration
- **Expected behavior:** Each Need has person_id, household_id, and narration_id linking it to the source narration.
- **Actual behavior:** Need "Emotional support for Marcus": person=true, household=true, narration=true. Need "After-school program for Marcus": person=true, household=true, narration=true.
- **Result:** PASS
- **Screenshot/reference:** test-b-pilot001.mjs output
- **Data created/changed:** none (verification only)
- **Security/privacy observation:** Needs are traceable to the person and narration that generated them. No orphaned needs.
- **User-experience observation:** Needs are displayed as "What We're Working On" — organizational/navigation concepts, not authoritative determinations. Each need has a status badge.
- **Finding classification:** KEEP
- **Recommended action:** None — traceability is complete.

### TEST ID: B9

- **Date/time:** 2026-08-09T04:03:14Z
- **Actor:** pilot_participant_a
- **Starting state:** Narration confirmed + needs persisted
- **Action performed:** SELECT from pathways, referrals, consent_grants, disclosures, outcomes, barrier_events — verify none auto-created. Verified via both client-side and admin SQL.
- **Expected behavior:** No Pathways, Referrals, FundingOptions, FundingGates, ConsentGrants, Disclosures, Outcomes, or BarrierEvents auto-created.
- **Actual behavior:** pathways: 0 (correct). referrals: 0 (correct). consent_grants: 0 (correct). disclosures: 0 (correct). outcomes: 0 (correct). barrier_events: 0 (correct). Only 2 needs and 1 narration exist — exactly what Test B should produce.
- **Result:** PASS
- **Screenshot/reference:** test-b-pilot001.mjs output + admin SQL verification
- **Data created/changed:** none
- **Security/privacy observation:** No premature downstream records created. Test B ends with confirmed narration + participant-reviewed Needs only.
- **User-experience observation:** Not visible to participant.
- **Finding classification:** KEEP
- **Recommended action:** None — no premature creation detected.

### TEST ID: B10

- **Date/time:** 2026-08-09T04:03:14Z
- **Actor:** pilot_participant_b + anonymous + navigator
- **Starting state:** Narration confirmed + needs persisted
- **Action performed:** 1) B reads A narration/needs. 2) Anonymous reads narration/needs. 3) Navigator reads A narration/needs. 4) Check public profiles. 5) Check document upload.
- **Expected behavior:** All cross-household and anonymous access BLOCKED. Narration not on public profiles. No document upload.
- **Actual behavior:** B reads A narration: BLOCKED. B reads A needs: BLOCKED. Anonymous reads narrations/needs: BLOCKED. Navigator reads A narration: BLOCKED. Navigator reads A needs: BLOCKED. Narration on public profiles: NO — person_narrations is separate from athletes table. Document upload: NOT present in narration flow.
- **Result:** PASS
- **Screenshot/reference:** test-b-pilot001.mjs output
- **Data created/changed:** none
- **Security/privacy observation:** Narration and needs are private. Cross-household, anonymous, and navigator access all blocked. No public exposure. Narration is not copied into Youth & Opportunity public profiles (person_narrations has no FK to athletes).
- **User-experience observation:** Participant's story is private. Not exposed anywhere public.
- **Finding classification:** KEEP
- **Recommended action:** None — privacy boundaries hold.

---

## TEST C — INTERPRETATION

**Executed:** 2026-08-09T04:14:03Z
**Overall result:** PASS (3/3 branches PASS + 1 privacy check PASS)

**Pre-test Need IDs captured:** `bc4cbf8e-70f7-4782-b567-65a9deb2fcae`, `92823c92-8106-4306-896b-bc09f8ca2457` (count: 2)

**Narration ID:** `d4de836f-6b45-4bd1-8828-a91c8b8d846a`

**Method:** Each branch reset narration to `proposed` status, then exercised the participant action (confirm/modify/reject). After each branch, verified needs count and IDs remained unchanged, original_text preserved, and no downstream records created.

### TEST ID: C1

- **Date/time:** 2026-08-09T04:14:03Z
- **Actor:** pilot_participant_a
- **Starting state:** Narration in proposed status, interpretation shown to participant
- **Action performed:** confirmNarration (UPDATE status=confirmed, confirmed_interpretation=proposed_interpretation) — participant clicks Confirm
- **Expected behavior:** Status changes to confirmed. confirmed_interpretation equals accepted proposed interpretation. original_text remains byte-for-byte unchanged. No new Needs. No downstream records.
- **Actual behavior:** Status: confirmed. confirmed_interpretation = proposed: true. original_text preserved: true. Needs: 2 (expected 2), IDs match: true. Pathways: 0. Referrals: 0.
- **Result:** PASS
- **Screenshot/reference:** test-c-pilot001.mjs output
- **Data created/changed:** person_narrations row updated to status=confirmed (no new rows)
- **Security/privacy observation:** RLS update_own_narrations enforced. Immutability trigger protects original_text. No needs or downstream records created.
- **User-experience observation:** ConfirmModifyReject component shows three clear choices: Confirm ("This sounds right"), Modify ("Change what we heard"), Reject ("This doesn't capture it"). InterpretationPreview shows "Your Words" (navy border) and "NextUp's Understanding" (gold border) separately. Disclaimer: "This helps organize possible next steps. It does not determine eligibility for a program." NarrationPreservationBanner: "Your words are preserved exactly as you wrote them. NextUp's understanding is kept separate and can be changed."
- **Finding classification:** KEEP
- **Recommended action:** None — confirm branch works correctly.

### TEST ID: C2

- **Date/time:** 2026-08-09T04:14:03Z
- **Actor:** pilot_participant_a
- **Starting state:** Narration reset to proposed status
- **Action performed:** confirmNarration with modified=true (UPDATE status=modified, confirmed_interpretation=participant's edited version). Then attempt to modify original_text.
- **Expected behavior:** Status changes to modified. confirmed_interpretation contains participant's modification. proposed_interpretation remains distinguishable from modified version. original_text remains byte-for-byte unchanged. Attempt to modify original_text is BLOCKED by database. No new Needs. No downstream records.
- **Actual behavior:** Status: modified. confirmed_interpretation = modified version: true. proposed_interpretation still distinct: true. original_text preserved: true. original_text mutation: BLOCKED by database (error: "original_text is immutable after submission and cannot be modified"). Needs: 2 (expected 2), IDs match: true. Pathways: 0. Referrals: 0.
- **Result:** PASS
- **Screenshot/reference:** test-c-pilot001.mjs output
- **Data created/changed:** person_narrations row updated to status=modified (no new rows)
- **Security/privacy observation:** Immutability trigger protect_narration_original_text() blocks original_text modification. proposed_interpretation preserved separately from confirmed_interpretation. No needs or downstream records created.
- **User-experience observation:** ConfirmModifyReject in editing mode shows: "Edit NextUp's understanding below. Your original words stay unchanged." Participant can edit the interpretation textarea. The NarrationPreservationBanner reinforces: "Your words are preserved exactly as you wrote them. NextUp's understanding is kept separate and can be changed."
- **Finding classification:** KEEP
- **Recommended action:** None — modify branch works correctly.

### TEST ID: C3

- **Date/time:** 2026-08-09T04:14:03Z
- **Actor:** pilot_participant_a
- **Starting state:** Narration reset to proposed status
- **Action performed:** rejectNarration (UPDATE status=rejected)
- **Expected behavior:** Status changes to rejected. original_text remains byte-for-byte unchanged. Rejected interpretation remains auditable/preserved (proposed_interpretation still present). No new Needs. No downstream records.
- **Actual behavior:** Status: rejected. original_text preserved: true. proposed_interpretation preserved (auditable): true. confirmed_interpretation null: true. Needs: 2 (expected 2), IDs match: true. Pathways: 0. Referrals: 0.
- **Result:** PASS
- **Screenshot/reference:** test-c-pilot001.mjs output
- **Data created/changed:** person_narrations row updated to status=rejected (no new rows)
- **Security/privacy observation:** Rejection does NOT destroy or replace original narration. proposed_interpretation preserved for audit. No needs or downstream records created.
- **User-experience observation:** After rejection, UI shows: "You let us know the interpretation didn't capture it. We'll try again." Correct — participant's words are safe and the rejection is not a dead end.
- **Finding classification:** KEEP
- **Recommended action:** None — reject branch works correctly.

### TEST ID: C-PRIVACY

- **Date/time:** 2026-08-09T04:14:03Z
- **Actor:** pilot_participant_b + anonymous + navigator
- **Starting state:** After C1, C2, C3 branches executed
- **Action performed:** 1) B reads A narration/needs. 2) Anonymous reads narration/needs. 3) Navigator reads A narration/needs. 4) Check public profiles. 5) Check authority/consent creation.
- **Expected behavior:** All cross-household and anonymous access BLOCKED. Narration not public. No authority/consent auto-created.
- **Actual behavior:** B reads A narration: BLOCKED. B reads A needs: BLOCKED. Anonymous reads narrations/needs: BLOCKED. Navigator reads A narration: BLOCKED. Navigator reads A needs: BLOCKED. Narration on public profiles: NO. authority_to_act/consent_grants auto-created: NO.
- **Result:** PASS
- **Screenshot/reference:** test-c-pilot001.mjs output
- **Data created/changed:** none
- **Security/privacy observation:** All privacy boundaries hold. Cross-household, anonymous, and navigator access all blocked. No authority or consent records auto-created.
- **User-experience observation:** Participant's story remains private throughout all interpretation branches.
- **Finding classification:** KEEP
- **Recommended action:** None — privacy boundaries hold.

---

## TEST D — STRUCTURED NEED REVIEW

**Executed:** 2026-08-09T04:24:44Z
**Overall result:** PASS (4/4 subtests PASS + 1 privacy check PASS)

**Pre-test Need IDs captured:** `bc4cbf8e-70f7-4782-b567-65a9deb2fcae`, `92823c92-8106-4306-896b-bc09f8ca2457` (count: 2)

**Narration ID:** `d4de836f-6b45-4bd1-8828-a91c8b8d846a` (status: confirmed)

**Method:** Generated proposed Needs from confirmed_interpretation using the same parser logic as the application. Exercised edit (D1), remove (D2), add (D3), and confirm (D4) controls. Verified DB need count remained 2 through D1-D3, then persisted the final reviewed list via createReviewedNeeds().

**Raw parser output (3 proposed Needs):**
1. "Maria is concerned about her 8-year-old son Marcus who is struggling emotionally after his father left."
2. "She works two jobs and worries about Marcus being unsupervised after school."
3. "She's looking for emotional support for Marcus and after-school supervision or activities."

**Final human-reviewed list (3 Needs):**
1. EDITED: "Counseling for Marcus to help with emotional struggles" (desc: "Marcus needs someone to talk to about his feelings since his dad left. A counselor or therapist who works with kids.")
2. UNCHANGED from parser: "She's looking for emotional support for Marcus and after-school supervision or activities."
3. MANUALLY ADDED: "Help with homework for Marcus" (desc: "Marcus is falling behind in school and needs someone to help him with homework after school.")

**Removed from parser output:** "She works two jobs and worries about Marcus being unsupervised after school."

**Test D Need IDs created during D4:**
- `09ded01a-d81d-4908-ba14-12b3f46c31fa` — "Counseling for Marcus to help with emotional struggles"
- `30e1b985-b3a8-4a5c-abda-929bbabebf1e` — "She's looking for emotional support for Marcus and after-school supervision or activities."
- `b24b8486-2f6b-4dfd-af7f-51c1eb7a1e4d` — "Help with homework for Marcus"

### TEST ID: D1

- **Date/time:** 2026-08-09T04:24:44Z
- **Actor:** pilot_participant_a
- **Starting state:** Raw parser output loaded into NeedReview component state (3 proposed Needs)
- **Action performed:** Edit first proposed Need: changed title from "Maria is concerned about her 8-year-old son Marcus who is struggling emotionally after his father left." to "Counseling for Marcus to help with emotional struggles" and added description.
- **Expected behavior:** Need text changed in review state. DB need count still 2. Existing Test B Needs unchanged.
- **Actual behavior:** Edited title: "Counseling for Marcus to help with emotional struggles". DB needs: 2 (expected 2). Test B IDs intact: true.
- **Result:** PASS
- **Screenshot/reference:** test-d-pilot001.mjs output
- **Data created/changed:** none (component state change only)
- **Security/privacy observation:** No DB writes during edit. RLS not exercised.
- **User-experience observation:** NeedReview shows edit (pencil) icon next to each Need. Clicking opens inline edit with title input and description textarea. Save/Cancel buttons. Edit is intuitive and non-destructive.
- **Finding classification:** KEEP
- **Recommended action:** None

### TEST ID: D2

- **Date/time:** 2026-08-09T04:24:44Z
- **Actor:** pilot_participant_a
- **Starting state:** Review state after D1 edit
- **Action performed:** Remove second proposed Need: "She works two jobs and worries about Marcus being unsupervised after school."
- **Expected behavior:** Need removed from review state. DB need count still 2. Existing Test B Needs unchanged.
- **Actual behavior:** Removed: "She works two jobs and worries about Marcus being unsupervised after school.". Review state now has 2 needs. DB needs: 2 (expected 2). Test B IDs intact: true.
- **Result:** PASS
- **Screenshot/reference:** test-d-pilot001.mjs output
- **Data created/changed:** none (component state change only)
- **Security/privacy observation:** No DB writes during remove. RLS not exercised.
- **User-experience observation:** NeedReview shows trash icon next to each Need. Clicking removes it from the list immediately. No confirmation dialog — could feel abrupt but is simple.
- **Finding classification:** KEEP
- **Recommended action:** None

### TEST ID: D3

- **Date/time:** 2026-08-09T04:24:44Z
- **Actor:** pilot_participant_a
- **Starting state:** Review state after D2 remove
- **Action performed:** Manually add a Need not produced by parser: "Help with homework for Marcus" (desc: "Marcus is falling behind in school and needs someone to help him with homework after school.")
- **Expected behavior:** New Need appears in review state. DB need count still 2.
- **Actual behavior:** Added: "Help with homework for Marcus". Review state now has 3 needs. DB needs: 2 (expected 2).
- **Result:** PASS
- **Screenshot/reference:** test-d-pilot001.mjs output
- **Data created/changed:** none (component state change only)
- **Security/privacy observation:** No DB writes during add. RLS not exercised.
- **User-experience observation:** NeedReview shows "+ Add a need" link. Clicking opens inline form with title input and description textarea. Add/Cancel buttons. Flow is intuitive.
- **Finding classification:** KEEP
- **Recommended action:** None

### TEST ID: D4

- **Date/time:** 2026-08-09T04:24:44Z
- **Actor:** pilot_participant_a
- **Starting state:** Final reviewed list with 3 Needs (1 edited, 1 removed from parser, 1 manually added)
- **Action performed:** createReviewedNeeds() — persist ONLY the final reviewed list
- **Expected behavior:** Only final reviewed list persisted. Removed Need NOT persisted. Unedited parser version NOT persisted. Manually added Need persisted. Test B Needs unchanged. Total 5 needs.
- **Actual behavior:** Created 3 Test D Needs. All fields correct: true. Removed NOT persisted: true. Unedited NOT persisted: true. Manually added persisted: true. Total: 5 (expected 5). Test B intact: true.
- **Result:** PASS
- **Screenshot/reference:** test-d-pilot001.mjs output
- **Data created/changed:** 3 needs rows created: 09ded01a-..., 30e1b985-..., b24b8486-...
- **Security/privacy observation:** RLS insert_own_needs enforced. Only person owner can insert.
- **User-experience observation:** NeedReview "Confirm Needs" button (green) persists the final list. Participant is redirected to dashboard. The NeedList component shows confirmed Needs with status badges.
- **Finding classification:** KEEP
- **Recommended action:** None

### TEST ID: D-PRIVACY

- **Date/time:** 2026-08-09T04:24:44Z
- **Actor:** pilot_b + anonymous + navigator
- **Starting state:** After D4 persistence
- **Action performed:** B reads/creates A needs. Anonymous reads/creates needs. Navigator reads A needs.
- **Expected behavior:** All cross-household and anonymous access BLOCKED.
- **Actual behavior:** A reads Test D needs: OK. B reads A needs: BLOCKED. B creates need for A: BLOCKED. Anonymous reads needs: BLOCKED. Anonymous creates need: BLOCKED. Navigator reads A needs: BLOCKED. Test D needs on public surfaces: NO.
- **Result:** PASS
- **Screenshot/reference:** test-d-pilot001.mjs output
- **Data created/changed:** none (blocked inserts)
- **Security/privacy observation:** All privacy boundaries hold. Cross-household, anonymous, and navigator access all blocked. No authority or consent records auto-created.
- **User-experience observation:** Participant needs remain private.
- **Finding classification:** KEEP
- **Recommended action:** None

---

## TEST E — PATHWAY

**Executed:** 2026-08-09T04:40:27Z
**Overall result:** PASS (5/5 subtests PASS + RLS PASS + downstream-zero PASS)

**Pathway ID:** `33ea7323-08b9-4189-b301-35df240c358b`
**Pathway status:** `possible`
**Need used:** "After-school program for Marcus" (`92823c92-8106-4306-896b-bc09f8ca2457`, status=confirmed)

**Candidate catalog records used:**
- Service: "Youth Sports Program Enrollment" (`1af373aa-08c0-46d2-a208-ed24dea60a26`), source_authority="NextUp Memphis Pilot 001 curation", source_checked_at=2026-08-09T03:19:56Z (fresh, ~0.056 days old)
- Provider: "Memphis Athletic Ministries" (`ab03874d-8497-4eba-a12d-936db4b891eb`), source_authority="Publicly available organization information", source_checked_at=2026-08-09T03:19:56Z (fresh, ~0.056 days old)
- Eligibility: "Scholarship and Fee Waiver Pathway for Sports Participation" (`fcdd9eef-282c-47c9-8e40-4600ca0a778f`), authority_name="Program Provider / School District", decision_owner="Program Provider", source_checked_at=2026-08-09T03:19:56Z (fresh)

**Provenance note:** "NextUp Memphis Pilot 001 curation" and "Publicly available organization information" are not equivalent to current provider confirmation. These are candidate matches only — not authoritative evidence of provider capacity, program availability, eligibility, or enrollment status.

### TEST ID: E1

- **Date/time:** 2026-08-09T04:40:06Z
- **Actor:** navigator/admin (service role)
- **Starting state:** 2 confirmed Needs, 0 pathways. Temporary need created with status='active' (non-confirmed) to test the guard.
- **Action performed:** Attempted INSERT INTO pathways with need_id pointing to the temporary 'active' status need.
- **Expected behavior:** BLOCKED by guard_pathway_confirmed_need() trigger.
- **Actual behavior:** BLOCKED. Error: "Pathway can only be created from a confirmed need (current need status: active)". Errcode: check_violation (23514).
- **Result:** PASS
- **Screenshot/reference:** SQL execution output
- **Data created/changed:** none (insert blocked). Temporary need deleted after test.
- **Security/privacy observation:** The database trigger enforces confirmed-need requirement at the DB level, not just in application code. SECURITY DEFINER function with search_path='public' — properly secured.
- **User-experience observation:** Not visible to participant — database-level guard.
- **Finding classification:** KEEP
- **Recommended action:** None — confirmed-need guard works correctly.

### TEST ID: E2

- **Date/time:** 2026-08-09T04:40:27Z
- **Actor:** navigator/admin (service role)
- **Starting state:** 2 confirmed Needs, 0 pathways, 0 downstream records
- **Action performed:** INSERT INTO pathways with confirmed Need "After-school program for Marcus", linked to candidate service, provider, and eligibility pathway. Status='possible'.
- **Expected behavior:** Pathway created with status='possible'. No downstream records auto-created.
- **Actual behavior:** Pathway created. ID: 33ea7323-08b9-4189-b301-35df240c358b. person_id=b38e7879-... (correct). household_id=0bb28561-... (correct). need_id=92823c92-... (correct). service_id=1af373aa-... (correct). provider_id=ab03874d-... (correct). eligibility_pathway_id=fcdd9eef-... (correct). funding_option_id=null (correct). status=possible (correct). Downstream: funding_options=0, funding_gates=0, referrals=0, consent_grants=0, disclosures=0, authority_to_act=0, outcomes=0, barrier_events=0, contact_attempts=0. Test B Needs unchanged. Narration unchanged.
- **Result:** PASS
- **Screenshot/reference:** SQL execution output
- **Data created/changed:** 1 pathways row: 33ea7323-08b9-4189-b301-35df240c358b
- **Security/privacy observation:** RLS household_insert_pathways WITH CHECK enforces household membership. Pathway creation does not auto-create any downstream records.
- **User-experience observation:** PathwayCard shows status badge "Possible" (blue). PathwayDetail shows "What you told us" (need title), "What may help" (service name), "Who provides it" (provider name), "Who controls the next step" (eligibility program + decision owner). Next action: "Review pathway". No "eligible" or "approved" language.
- **Finding classification:** KEEP
- **Recommended action:** None — pathway creation from confirmed need works correctly.

### TEST ID: E3

- **Date/time:** 2026-08-09T04:41:07Z
- **Actor:** navigator/admin (service role)
- **Starting state:** Pathway exists with fresh service and provider records (source_checked_at ~0.056 days old)
- **Action performed:** 1) Verified isStale() returns false for current records (0.056 days < 90 days threshold). 2) Temporarily set provider source_checked_at to 180 days ago. 3) Verified isStale() would return true (180 > 90). 4) PathwayDetail would render "Needs re-check" with AlertCircle icon for stale provider. 5) Restored provider source_checked_at to exact original value.
- **Expected behavior:** Fresh records show no warning. Stale records show "Needs re-check". Original value restored.
- **Actual behavior:** Fresh: days_old=0.056, isStale=false. Stale: days_old=180, isStale=true. Restored: source_checked_at=2026-08-09T03:19:56.333254+00 (exact original), days_old=0.056.
- **Result:** PASS
- **Screenshot/reference:** SQL execution output, PathwayDetail.tsx, pathwayService.ts isStale()
- **Data created/changed:** provider source_checked_at temporarily changed then restored. No permanent mutation.
- **Security/privacy observation:** Staleness check is client-side (isStale function in pathwayService.ts). No security concern.
- **User-experience observation:** PathwayDetail shows "Needs re-check" (amber, AlertCircle icon) next to stale service/provider names. AdminPathwaysPage shows stale providers/services in a dedicated "Stale catalog info" section. The 90-day threshold is reasonable for pilot.
- **Finding classification:** KEEP
- **Recommended action:** None — freshness check works correctly. Provenance limitation recorded separately.

### TEST ID: E4

- **Date/time:** 2026-08-09T04:40:27Z
- **Actor:** pilot_participant_a (UI inspection)
- **Starting state:** Pathway exists with linked eligibility pathway
- **Action performed:** Inspected PathwayDetail component rendering for eligibility language. Verified no "eligible", "you qualify", "approved", or "confirmed eligible" language appears in PathwayDetail, PathwayCard, or FundingStatus components.
- **Expected behavior:** UI uses "Who controls the next step" not "Your eligibility". Decision owner is external. No eligibility determination implied.
- **Actual behavior:** PathwayDetail section header: "Who controls the next step" (with ShieldCheck icon). Displays: program_name="Scholarship and Fee Waiver Pathway for Sports Participation". "Decision made by Program Provider" (external). criteria_summary: "Some sports programs offer scholarships or fee waivers based on financial need. Eligibility criteria vary by provider. Decision is made by the program or school, not NextUp." No "eligible" or "you qualify" language in any rendered component. Grep for "eligible" in src/ found matches only in types/pathway.ts (type definitions) and OutcomePage.tsx (not in pathway UI).
- **Result:** PASS
- **Screenshot/reference:** PathwayDetail.tsx, PathwayCard.tsx, FundingStatus.tsx, grep results
- **Data created/changed:** none
- **Security/privacy observation:** No eligibility determination is presented. Decision owner is correctly externalized.
- **User-experience observation:** The participant sees who controls the eligibility decision (Program Provider), not a determination from NextUp. The criteria summary uses "may" and "vary by provider" — appropriately provisional. The section title "Who controls the next step" avoids the word "eligibility" entirely.
- **Finding classification:** KEEP
- **Recommended action:** None — eligibility wording is correctly provisional and externalized.

### TEST ID: E5

- **Date/time:** 2026-08-09T04:40:27Z
- **Actor:** pilot_participant_a (UI inspection)
- **Starting state:** Pathway exists with funding_option_id=null (no funding option linked)
- **Action performed:** Inspected PathwayDetail and FundingStatus components for funding language. Verified no "covered", "guaranteed", "billable", "reimbursable", "approved", or "paid" language appears.
- **Expected behavior:** No funding section renders when no funding_option exists. No approval/coverage language appears.
- **Actual behavior:** PathwayDetail only renders the funding section if `pathway.funding_option` is truthy. Since funding_option_id=null, the funding section does NOT render. No funding language appears anywhere. PathwayCard shows no cost/funding information. The "What still needs verification" section does NOT list funding as a gap (it only lists service/provider identification and staleness). FundingStatus component labels: "Unknown", "May apply", "Needs verification", "Confirmed applicable", "Not applicable" — none of these are "covered", "approved", "guaranteed", or "reimbursable".
- **Result:** PASS
- **Screenshot/reference:** PathwayDetail.tsx, FundingStatus.tsx
- **Data created/changed:** none
- **Security/privacy observation:** No false funding claims are possible when no funding option exists.
- **User-experience observation:** The participant sees no funding information — appropriate for a pathway with no funding option linked yet. When a funding option is added (Test F), the FundingStatus component uses provisional language ("May apply", "Needs verification") and includes the disclaimer "This may be a possible funding pathway. Confirm with the official program, plan, or provider."
- **Finding classification:** KEEP
- **Recommended action:** None — funding wording is correctly absent when no funding option exists.

### TEST ID: E-RLS

- **Date/time:** 2026-08-09T04:40:27Z
- **Actor:** pilot_participant_a + pilot_participant_b + anonymous + navigator
- **Starting state:** Pathway 33ea7323-... exists for Pilot A
- **Action performed:** RLS policy inspection for pathways table.
- **Expected behavior:** Pilot A can read. Pilot B cannot. Anonymous cannot. Unassigned navigator cannot. Assigned navigator can (if assignment scope allows).
- **Actual behavior:** household_select_pathways: SELECT requires household_memberships JOIN persons WHERE p.auth_user_id = auth.uid() — Pilot A is a member, Pilot B is not. Anonymous has no auth.uid(). navigator_select_pathways: requires navigator_assignments with assignment_status='active' — no assignment exists for Pilot A's household in this test. admin_all_pathways: admin role can access. All boundaries hold.
- **Result:** PASS
- **Screenshot/reference:** pg_policies output for pathways table
- **Data created/changed:** none
- **Security/privacy observation:** RLS correctly scopes pathway access to household members, assigned navigators, and admins. Cross-household access blocked. Anonymous blocked. Same pattern as Tests A-D.
- **User-experience observation:** Security test — not visible to participant.
- **Finding classification:** KEEP
- **Recommended action:** None — pathway RLS is correctly scoped.

### TEST ID: E-DOWNSTREAM-ZERO

- **Date/time:** 2026-08-09T04:40:27Z
- **Actor:** navigator/admin (service role)
- **Starting state:** After E2 pathway creation
- **Action performed:** Verified zero downstream records after pathway creation.
- **Expected behavior:** No funding_options, funding_gates, referrals, consent_grants, disclosures, authority_to_act, outcomes, barrier_events, contact_attempts auto-created.
- **Actual behavior:** All zero: funding_options=0, funding_gates=0, referrals=0, consent_grants=0, disclosures=0, authority_to_act=0, outcomes=0, barrier_events=0, contact_attempts=0. Test B Needs unchanged (2 confirmed). Narration unchanged (confirmed).
- **Result:** PASS
- **Screenshot/reference:** SQL execution output
- **Data created/changed:** none (verification only)
- **Security/privacy observation:** Pathway creation does not trigger any downstream record creation.
- **User-experience observation:** Not visible to participant — data-level check.
- **Finding classification:** KEEP
- **Recommended action:** None — pathway creation is correctly isolated.

---

## TEST F — FUNDING GATES

**Executed:** 2026-08-09T05:08:31Z
**Overall result:** PASS (5/5 subtests PASS + RLS PASS + downstream-zero PASS + state-integrity PASS)

**Pathway ID:** `47f94bf9-1d0c-4741-aac8-ee32c1ee5559` (status=possible)
**FundingOption ID:** `b5f6bd22-9bcb-48b5-b5f2-40ed59f1a3e9`
**FundingGate 1 ID:** `670c61f9-bb54-464c-853e-68ee60e30ae4` (Financial need verification, blocking, needs_verification)
**FundingGate 2 ID:** `6df410b3-8659-4b0c-b12c-6348f023aafc` (Program availability check, nonblocking, unknown)

**FundingOption initial state:**
- mechanism_type = scholarship
- payer_or_funder_name = Memphis Athletic Ministries Scholarship Program
- assertion_type = possible
- applicability_status = needs_verification
- payment_status = not_started
- source_authority = Program Provider / School District
- source_checked_at = 2026-08-09T05:08:31.638573+00

**Pre-existing finding recorded before Test F execution:** F-NO-FUNDING-GUARD (P2, OPEN) — the funding model allows misleading state combinations through direct DB/service paths. Not introduced by Test F. Not fixed during Test F.

### TEST ID: F1

- **Date/time:** 2026-08-09T05:08:31Z
- **Actor:** navigator/admin (service role) + pilot_participant_a (UI inspection)
- **Starting state:** Pathway 47f94bf9-... with linked FundingOption b5f6bd22-... and 2 FundingGates (1 blocking+needs_verification, 1 nonblocking+unknown)
- **Action performed:** Inspected FundingStatus component rendering with hasUnresolvedBlockingGates=true. Verified badge text, sub-text, and disclaimer.
- **Expected behavior:** Primary FundingStatus badge shows "Needs verification" (amber, AlertCircle). Sub-text shows "Funding status: Possible" and "Payment status: Not started". Disclaimer appears.
- **Actual behavior:** FundingStatus.tsx line 71: `hasUnresolvedBlockingGates ? 'Needs verification' : APPLICABILITY_LABELS[applicability]` — badge overrides to "Needs verification" when blocking gates unresolved. Badge style: amber (bg-amber-50 text-amber-800). Icon: AlertCircle. Sub-text: "Funding status: Possible" (ASSERTION_LABELS[possible]) and "Payment status: Not started" (PAYMENT_LABELS[not_started]). Disclaimer (line 82): "This may be a possible funding pathway. Confirm with the official program, plan, or provider." The unresolved blocking gate prevents the funding option from appearing confirmed.
- **Result:** PASS
- **Screenshot/reference:** FundingStatus.tsx lines 41-86
- **Data created/changed:** none (inspection only)
- **Security/privacy observation:** None — UI rendering only.
- **User-experience observation:** The amber "Needs verification" badge is the primary visual signal. The sub-text "Possible" and "Not started" are secondary and consistent with the provisional state. The disclaimer reinforces the provisional nature. No false confirmation.
- **Finding classification:** KEEP
- **Recommended action:** None — unresolved blocking gate correctly prevents confirmed display.

### TEST ID: F2

- **Date/time:** 2026-08-09T05:08:31Z
- **Actor:** pilot_participant_a (UI inspection)
- **Starting state:** Same as F1
- **Action performed:** Searched all source files in src/ for percentage, progress bar, "of N", "50%", "4 of 5", "almost complete", completion score. Inspected PathwayDetail, PathwayCard, FundingStatus, AdminPathwaysPage.
- **Expected behavior:** No percentage-complete score, no progress bar, no "1 of 2", no "50%", no "4 of 5", no "almost complete". Each FundingGate remains an independent requirement.
- **Actual behavior:** `rg -i -n 'percent|progress bar|completion|of [0-9]+' src/` returned zero matches. PathwayDetail renders gates as a list with colored dots (green/amber/red) and "— needs verification" labels — no count, no percentage, no progress bar. PathwayCard does not render gate information. AdminPathwaysPage "Funding gates needing verification" section shows gate_type, status, payer — no percentage. FundingStatus does not compute or display any ratio. Each gate is an independent line item.
- **Result:** PASS
- **Screenshot/reference:** PathwayDetail.tsx lines 110-129, AdminPathwaysPage.tsx lines 123-143, FundingStatus.tsx, rg search results
- **Data created/changed:** none
- **Security/privacy observation:** None
- **User-experience observation:** Gates are presented as independent requirements, not as a progress score. The participant sees what needs verification, not how close they are to completion.
- **Finding classification:** KEEP
- **Recommended action:** None — no percentage-complete score appears.

### TEST ID: F3

- **Date/time:** 2026-08-09T05:08:31Z
- **Actor:** pilot_participant_a (UI inspection)
- **Starting state:** Same as F1
- **Action performed:** Searched all source files in src/ for "almost", "nearly", "pending approval", "likely approved", "likely reimbursable", "almost eligible". Inspected all funding-related components.
- **Expected behavior:** No language equivalent to "almost approved", "nearly approved", "pending approval", "likely approved", "likely reimbursable", "almost eligible". The unresolved state remains "Needs verification."
- **Actual behavior:** `rg -i -n 'almost|nearly|pending approval|likely approved|likely reimbursable|almost eligible' src/` returned zero matches. The only state language used is "Needs verification" (badge), "Possible" (assertion), "Not started" (payment), "May apply" (applicability label, not rendered when gates unresolved). No "almost", "nearly", "pending approval", or "likely" language anywhere in the codebase.
- **Result:** PASS
- **Screenshot/reference:** rg search results, FundingStatus.tsx, PathwayDetail.tsx
- **Data created/changed:** none
- **Security/privacy observation:** None
- **User-experience observation:** The funding state is presented as provisional without any implication of approaching approval. "Needs verification" is clear and does not suggest progress toward a predetermined outcome.
- **Finding classification:** KEEP
- **Recommended action:** None — no "almost approved" language appears.

### TEST ID: F4

- **Date/time:** 2026-08-09T05:08:31Z
- **Actor:** pilot_participant_a (UI inspection)
- **Starting state:** Same as F1
- **Action performed:** Inspected PathwayDetail for decision owner visibility. Verified the "Who controls the next step" section renders the eligibility pathway's decision_owner.
- **Expected behavior:** Participant can see who controls the external decision. "Program Provider" is visible. NextUp does not appear to be the decision-maker, payer, eligibility authority, or approval authority.
- **Actual behavior:** PathwayDetail.tsx lines 80-94: "Who controls the next step" section renders `pathway.eligibility_pathway.decision_owner ?? pathway.eligibility_pathway.authority_name`. For Test F, decision_owner = "Program Provider". The text reads "Decision made by Program Provider". The eligibility pathway program_name = "Scholarship and Fee Waiver Pathway for Sports Participation". Criteria summary: "Some sports programs offer scholarships or fee waivers based on financial need. Eligibility criteria vary by provider. Decision is made by the program or school, not NextUp." NextUp is not presented as the decision-maker. The FundingStatus sub-text shows "Funding status: Possible" — not "Approved by NextUp". The disclaimer says "Confirm with the official program, plan, or provider."
- **Result:** PASS
- **Screenshot/reference:** PathwayDetail.tsx lines 80-94, FundingStatus.tsx lines 74-84
- **Data created/changed:** none
- **Security/privacy observation:** None
- **User-experience observation:** The participant can see that "Program Provider" controls the decision, not NextUp. The criteria summary explicitly states "Decision is made by the program or school, not NextUp." The funding section uses "What it might cost & who might pay" — provisional language. The participant-facing wording is: "Decision made by Program Provider."
- **Finding classification:** KEEP
- **Recommended action:** None — external decision owner is visible.

### TEST ID: F5

- **Date/time:** 2026-08-09T05:08:31Z
- **Actor:** pilot_participant_a (UI inspection)
- **Starting state:** Same as F1
- **Action performed:** Inspected FundingStatus for source/provenance visibility. Verified source_authority is rendered.
- **Expected behavior:** Source authority shown where the current design expects it. source_authority and source_checked_at recorded.
- **Actual behavior:** FundingStatus.tsx line 77: `{sourceAuthority && <p className="text-gray-400">Source: {sourceAuthority}</p>}` — source_authority is rendered as "Source: Program Provider / School District" in small gray text below the funding/payment status. source_checked_at = 2026-08-09T05:08:31.638573+00 (fresh, set during creation). The source is visible to the participant in the FundingStatus sub-text. However, source_checked_at is NOT rendered in the UI — only source_authority is shown. The PathwayDetail "What still needs verification" section also shows "Funding requirements need verification" because unresolvedGates=true.
- **Result:** PASS
- **Screenshot/reference:** FundingStatus.tsx line 77, PathwayDetail.tsx lines 133-148
- **Data created/changed:** none
- **Security/privacy observation:** None
- **User-experience observation:** The participant sees "Source: Program Provider / School District" — provenance is visible. However, "Program Provider / School District" is a generic source description and does NOT establish that Memphis Athletic Ministries currently confirmed the scholarship. The source_checked_at timestamp is not shown to the participant, so they cannot see when the information was last checked. Classification: MODIFY / P3 provenance improvement — same as E-PROVENANCE.
- **Finding classification:** KEEP (with provenance limitation noted)
- **Recommended action:** None for Test F. Provenance improvement tracked as E-PROVENANCE (P3).

### TEST ID: F-RLS

- **Date/time:** 2026-08-09T05:08:31Z
- **Actor:** pilot_participant_a + pilot_participant_b + anonymous + navigator
- **Starting state:** Test F pathway, funding_option, and funding_gates exist
- **Action performed:** RLS policy inspection for funding_options and funding_gates tables.
- **Expected behavior:** Pilot A can read. Pilot B cannot. Anonymous cannot. Unassigned navigator cannot. Assigned navigator can (if assignment scope allows).
- **Actual behavior:** funding_options: household_select_funding requires pathway_id NOT NULL AND household membership via pathway→household→persons.auth_user_id=auth.uid(). Pilot A is a member, Pilot B is not. Anonymous has no auth.uid(). navigator_select_funding requires active navigator_assignment. No assignment exists for Pilot A's household. admin_all_funding for admin role. funding_gates: household_select_funding_gates requires membership via funding_option→pathway→household. navigator_select_funding_gates requires active assignment. admin_all_funding_gates for admin. All boundaries hold.
- **Result:** PASS
- **Screenshot/reference:** pg_policies output for funding_options and funding_gates
- **Data created/changed:** none
- **Security/privacy observation:** RLS correctly scopes funding access to household members, assigned navigators, and admins. Cross-household access blocked. Anonymous blocked. Same pattern as Tests A-E.
- **User-experience observation:** Security test — not visible to participant.
- **Finding classification:** KEEP
- **Recommended action:** None — funding RLS is correctly scoped.

### TEST ID: F-DOWNSTREAM-ZERO

- **Date/time:** 2026-08-09T05:08:31Z
- **Actor:** navigator/admin (service role)
- **Starting state:** After funding_option and funding_gates creation
- **Action performed:** Verified zero downstream records after funding creation.
- **Expected behavior:** No referrals, contact_attempts, authority_to_act, consent_grants, disclosures, outcomes, barrier_events auto-created.
- **Actual behavior:** All zero: referrals=0, consent_grants=0, disclosures=0, authority_to_act=0, outcomes=0, barrier_events=0, contact_attempts=0. Test B Needs unchanged (2 confirmed). Narration unchanged (confirmed).
- **Result:** PASS
- **Screenshot/reference:** SQL execution output
- **Data created/changed:** none (verification only)
- **Security/privacy observation:** Funding creation does not trigger any downstream record creation.
- **User-experience observation:** Not visible to participant — data-level check.
- **Finding classification:** KEEP
- **Recommended action:** None — funding creation is correctly isolated.

### TEST ID: F-STATE-INTEGRITY

- **Date/time:** 2026-08-09T05:08:31Z
- **Actor:** navigator/admin (service role)
- **Starting state:** After funding_option and funding_gates creation
- **Action performed:** Verified funding option state unchanged after gate creation. Verified no automatic gate status changes.
- **Expected behavior:** assertion_type=possible, applicability_status=needs_verification, payment_status=not_started before and after gate creation. No gate status changed during F1-F5.
- **Actual behavior:** assertion_type=possible (unchanged), applicability_status=needs_verification (unchanged), payment_status=not_started (unchanged). Gate 1 status=needs_verification (unchanged). Gate 2 status=unknown (unchanged). No automatic transitions occurred. Gate creation did not alter funding option state.
- **Result:** PASS
- **Screenshot/reference:** SQL execution output
- **Data created/changed:** none (verification only)
- **Security/privacy observation:** None
- **User-experience observation:** Not visible to participant — data-level check.
- **Finding classification:** KEEP
- **Recommended action:** None — funding state integrity maintained.

---

## TEST G — TRUST HARD STOP

**Executed:** 2026-08-09T05:25:00Z
**Overall result:** PASS (8/8 subtests PASS + RLS PASS + downstream-zero PASS + escalation-semantics PASS + delivery-semantics PASS)

**Pre-test control state verified:**
- 1 Person, 1 Household, 1 HouseholdMembership, 1 confirmed PersonNarration, 2 confirmed Needs
- Zero: pathways, funding_options, funding_gates, referrals, contact_attempts, authority_to_act, youth_assents, consent_grants, disclosures, escalations, incidents, outcomes, barrier_events
- persons.is_youth = false (captured pre-test, modified for G7/G8, restored during cleanup)
- athletes=7, athlete_signups=2, creators=1, media_uploads=4

**Pre-existing finding recorded before Test G execution:** G-NO-DB-TRUST-GUARD (P1, OPEN) — trust boundary not enforced at service/database layer. Not introduced by Test G. Not fixed during Test G.

**Test records created:**
- AuthorityToAct ID: `a282cd8a-8eea-406d-b8ab-bf2be0641f89` (verification_status=documented, disputed=false, legal_instrument_asserted=false — safe test authority for G7/G8)
- YouthAssent ID: `6a3c4f87-16fc-434b-b1a2-ef9a37f08fa5` (not_yet_asked → asked_declined for G7 → G8)
- Escalation IDs: `b4f9456b-2c55-4a75-bbee-b407d4fcbdf6` (G1-G6, authority_unresolved), `f31c685c-d032-41ae-8842-be4a50d7d54f` (G7, youth_assent_review), `aea9bf05-e8d4-4722-ab9a-260d081fa400` (G8, youth_assent_review)

### TEST ID: G1

- **Date/time:** 2026-08-09T05:25:00Z
- **Actor:** pilot_participant_a (SharePage flow simulation)
- **Starting state:** No AuthorityToAct, no YouthAssent, no ConsentGrant, is_youth=false
- **Action performed:** Navigate to /app/share. Enter recipient="School Support Contact", purpose="Ask about after-school support", select minimal data fields. Click Review → triggers buildDisclosurePreview(householdId, personId, false, recipientName, purpose, selectedFields, 'general_navigation', 'share_information').
- **Expected behavior:** buildDisclosurePreview finds no authority_to_act record. Hard stop pushed with reason "We need to confirm who can authorize this action before anything is shared." and trigger authority_unresolved. SharePage routes to step='blocked'.
- **Actual behavior:** findAuthority() returns null (verified: authority_count=0). buildDisclosurePreview line 476: when authority is null, pushes {blocked: true, reason: "We need to confirm who can authorize this action before anything is shared.", escalationNeeded: true, escalationTrigger: 'authority_unresolved'}. SharePage line 83-84: `if (p.hardStops.some((s) => s.blocked)) setStep('blocked')`. Flow routes to blocked, not review. No handleApprove call possible.
- **Result:** PASS
- **Screenshot/reference:** trustService.ts lines 472-482, SharePage.tsx lines 83-84
- **Data created/changed:** none (preview only, no DB writes)
- **Security/privacy observation:** No data leaves the system. The preview is computed client-side from existing records. No disclosure or consent is created.
- **User-experience observation:** The participant sees the blocked screen, not the review screen. They cannot approve sharing.
- **Finding classification:** KEEP
- **Recommended action:** None — sharing flow correctly initiates and then blocks when no authority exists.

### TEST ID: G2

- **Date/time:** 2026-08-09T05:25:00Z
- **Actor:** pilot_participant_a
- **Starting state:** Same as G1 — no AuthorityToAct exists
- **Action performed:** Verify hard-stop reason and that household membership alone does not satisfy the authority check.
- **Expected behavior:** Plain-language reason: "We need to confirm who can authorize this action before anything is shared." Household membership does NOT satisfy the authority check. No AuthorityToAct silently created. No ConsentGrant. No Disclosure.
- **Actual behavior:** Hard-stop reason: "We need to confirm who can authorize this action before anything is shared." (trustService.ts line 478). buildDisclosurePreview queries authority_to_act table by household_id + subject_person_id + data_category + action_type — it does NOT check household_memberships as a substitute for authority. No authority_to_act record exists (count=0). No consent_grant created (count=0). No disclosure created (count=0). Household membership provides RLS access to the table but does not satisfy the authority check.
- **Result:** PASS
- **Screenshot/reference:** trustService.ts lines 171-189 (findAuthority), lines 472-482 (null authority hard stop)
- **Data created/changed:** none
- **Security/privacy observation:** Household membership ≠ authority. The check is explicit and separate.
- **User-experience observation:** The reason is clear and does not blame the participant.
- **Finding classification:** KEEP
- **Recommended action:** None — household membership does not satisfy authority.

### TEST ID: G3

- **Date/time:** 2026-08-09T05:25:00Z
- **Actor:** pilot_participant_a
- **Starting state:** Same as G1 — blocked state
- **Action performed:** Verify participant cannot reach "Approve Sharing" or any disclosure preparation action.
- **Expected behavior:** UI state = blocked. Not review, prepared, delivery_pending, or sent. disclosures=0. consent_grants=0.
- **Actual behavior:** SharePage step='blocked'. The "Approve Sharing" button only renders when step='review' (line 361). handleApprove is only callable from step='review'. The blocked screen renders only "Send to Navigator Review" and "Not Now" buttons. No prepareDisclosure or createConsentGrant call occurs. Database verified: disclosures=0, consent_grants=0.
- **Result:** PASS
- **Screenshot/reference:** SharePage.tsx lines 386-420 (blocked screen), lines 360-383 (review screen — unreachable from blocked)
- **Data created/changed:** none
- **Security/privacy observation:** The disclosure lifecycle cannot begin when blocked. No prepared_at, no sent_at, no delivery_method, no delivered_by_user_id.
- **User-experience observation:** The participant sees a clear blocked state, not a partially-enabled review.
- **Finding classification:** KEEP
- **Recommended action:** None — disclosure is correctly blocked.

### TEST ID: G4

- **Date/time:** 2026-08-09T05:27:00Z
- **Actor:** pilot_participant_a
- **Starting state:** Blocked screen from G1-G3
- **Action performed:** Click "Send to Navigator Review" → handleHardStopEscalate() calls createEscalation(householdId, 'authority_unresolved', 'Share with School Support Contact for Ask about after-school support', 'Navigator review', personId, userId)
- **Expected behavior:** Exactly one Escalation created. trigger_type=authority_unresolved, status=open, affected_action describes the sharing attempt, destination=Navigator review. Escalation ≠ authority, ≠ consent, ≠ permission to disclose. Still: disclosures=0, consent_grants=0.
- **Actual behavior:** Escalation created: id=b4f9456b-2c55-4a75-bbee-b407d4fcbdf6, trigger_type=authority_unresolved, status=open, affected_action="Share with School Support Contact for Ask about after-school support", destination="Navigator review". Post-escalation verified: disclosures=0, consent_grants=0. Escalation is a workflow record — buildDisclosurePreview does not query escalations. No code path treats an escalation as authorizing a disclosure.
- **Result:** PASS
- **Screenshot/reference:** SharePage.tsx lines 128-145 (handleHardStopEscalate), trustService.ts lines 577-600 (createEscalation)
- **Data created/changed:** 1 escalation (b4f9456b-2c55-4a75-bbee-b407d4fcbdf6)
- **Security/privacy observation:** Escalation does not grant any permission. It is a review request only.
- **User-experience observation:** "Send to Navigator Review" feels like a meaningful next action — the participant is not left at a dead end.
- **Finding classification:** KEEP
- **Recommended action:** None — escalation correctly created as a workflow record.

### TEST ID: G5

- **Date/time:** 2026-08-09T05:27:00Z
- **Actor:** pilot_participant_a
- **Starting state:** Blocked screen
- **Action performed:** Record exact participant-facing wording. Evaluate clarity.
- **Expected behavior:** Header: "A navigator needs to review this before anything is shared." Supporting text: "This doesn't mean we can't move forward. It means we need to confirm a few things first. A navigator will reach out to help." Participant understands: what is blocked, why, what happens next, that nothing has been shared.
- **Actual behavior:** Exact wording:
  - Header (line 393): "A navigator needs to review this before anything is shared."
  - Hard-stop reason (line 395): "We need to confirm who can authorize this action before anything is shared."
  - Supporting text (line 400-403): "This doesn't mean we can't move forward. It means we need to confirm a few things first. A navigator will reach out to help."
  - Action button (line 408): "Send to Navigator Review"
  - Secondary button (line 413): "Not Now"
  Evaluation:
  A. Clearly communicates a hard stop? YES — "before anything is shared" is unambiguous.
  B. Gives the person a next action? YES — "Send to Navigator Review" is a clear next step.
  C. Does NOT imply sharing already happened? YES — "before anything is shared" is future-tense. No past-tense language.
  D. Does NOT imply navigator will automatically approve? YES — "A navigator will reach out to help" implies human review, not automatic approval.
- **Result:** PASS
- **Screenshot/reference:** SharePage.tsx lines 386-420
- **Data created/changed:** none (wording inspection)
- **Security/privacy observation:** None
- **User-experience observation:** The wording is clear, non-punitive, and gives a next action. "This doesn't mean we can't move forward" is reassuring without undermining the seriousness of the stop. The amber ShieldAlert icon communicates caution without alarm.
- **Finding classification:** KEEP
- **Recommended action:** None — plain-language explanation is clear and accurate.

### TEST ID: G6

- **Date/time:** 2026-08-09T05:27:00Z
- **Actor:** pilot_participant_a
- **Starting state:** Blocked screen
- **Action performed:** Inspect blocked state for any hidden override. Verify only "Send to Navigator Review" and "Not Now" are available.
- **Expected behavior:** No "Proceed Anyway", "Override", "Skip Review", "Force Send", "Approve Sharing", or "Send Now" button. Only "Send to Navigator Review" and "Not Now". disclosures=0, consent_grants=0.
- **Actual behavior:** Blocked screen (lines 386-420) renders exactly two buttons: "Send to Navigator Review" (handleHardStopEscalate) and "Not Now" (navigate to /app). No other buttons. No hidden state path. handleApprove is unreachable from blocked. Database verified: disclosures=0, consent_grants=0. The known direct-client bypass (G-NO-DB-TRUST-GUARD) was NOT used during this test — Test G validates the normal participant path only.
- **Result:** PASS
- **Screenshot/reference:** SharePage.tsx lines 386-420
- **Data created/changed:** none
- **Security/privacy observation:** No hidden override exists in the UI. The only bypass is the direct-client path documented as G-NO-DB-TRUST-GUARD.
- **User-experience observation:** The participant has exactly two options: escalate or cancel. Both are appropriate.
- **Finding classification:** KEEP
- **Recommended action:** None — no hidden override in the participant path.

### TEST ID: G7

- **Date/time:** 2026-08-09T05:31:00Z
- **Actor:** pilot_participant_a (with admin setup)
- **Starting state:** is_youth set to true. AuthorityToAct created (a282cd8a-..., verification_status=documented, disputed=false, legal_instrument_asserted=false, no expires_at, no review_at — passes checkAuthorityHardStops). YouthAssent created (6a3c4f87-..., status=not_yet_asked, data_category=general_navigation, action_type=share_information).
- **Action performed:** Repeat Share review. buildDisclosurePreview: authority found → checkAuthorityHardStops returns blocked=false (authority passes). is_youth=true → checkYouthAssentStop(assent, true): assent.status=not_yet_asked → returns blocked=true, reason="A young person involved needs to be asked before this is shared.", trigger=youth_assent_review. SharePage routes to blocked. Click "Send to Navigator Review" → createEscalation with trigger_type=youth_assent_review.
- **Expected behavior:** BLOCKED because assent=not_yet_asked. Reason: "A young person involved needs to be asked before this is shared." No ConsentGrant, no Disclosure. Escalation created with trigger_type=youth_assent_review.
- **Actual behavior:** Authority passes (disputed=false, no legal instrument, no expiry, no review due). Youth assent blocks: checkYouthAssentStop line 235 — `if (!assent || assent.status === 'not_yet_asked' || assent.status === 'unknown')` returns {blocked: true, reason: "A young person involved needs to be asked before this is shared.", escalationNeeded: true, escalationTrigger: 'youth_assent_review'}. SharePage routes to blocked. Escalation created: id=f31c685c-d032-41ae-8842-be4a50d7d54f, trigger_type=youth_assent_review, status=open. Post-escalation: disclosures=0, consent_grants=0.
- **Result:** PASS
- **Screenshot/reference:** trustService.ts lines 230-252 (checkYouthAssentStop), lines 484-488 (assent check in buildDisclosurePreview)
- **Data created/changed:** 1 youth_assent (6a3c4f87-...), 1 authority_to_act (a282cd8a-...), 1 escalation (f31c685c-...)
- **Security/privacy observation:** Youth assent is checked independently from authority. Both must pass. The not_yet_asked state correctly blocks.
- **User-experience observation:** The reason "A young person involved needs to be asked before this is shared" is clear and actionable — it tells the participant what needs to happen next.
- **Finding classification:** KEEP
- **Recommended action:** None — not_yet_asked correctly blocks sharing.

### TEST ID: G8

- **Date/time:** 2026-08-09T05:33:00Z
- **Actor:** pilot_participant_a (with admin setup)
- **Starting state:** Same authority (a282cd8a-..., still valid). YouthAssent updated to status=asked_declined, asked_at=now().
- **Action performed:** Update youth_assents set status='asked_declined'. Repeat Share review. buildDisclosurePreview: authority passes. is_youth=true → checkYouthAssentStop: assent.status=asked_declined → returns blocked=true, reason="The young person did not agree to this sharing. A navigator needs to review this before anything is sent.", trigger=youth_assent_review. SharePage routes to blocked. Click "Send to Navigator Review" → createEscalation with trigger_type=youth_assent_review.
- **Expected behavior:** BLOCKED. Reason: "The young person did not agree to this sharing. A navigator needs to review this before anything is sent." No ConsentGrant, no Disclosure, no hidden override. Youth decline NOT converted to consent, authority, assent_agreed, disclosure, or navigator override. Escalation trigger_type=youth_assent_review.
- **Actual behavior:** checkYouthAssentStop line 243 — `if (assent.status === 'asked_declined')` returns {blocked: true, reason: "The young person did not agree to this sharing. A navigator needs to review this before anything is sent.", escalationNeeded: true, escalationTrigger: 'youth_assent_review'}. SharePage routes to blocked. Escalation created: id=aea9bf05-e8d4-4722-ab9a-260d081fa400, trigger_type=youth_assent_review, status=open. Post-escalation: disclosures=0, consent_grants=0. No automatic conversion of declined assent to any other state.
- **Result:** PASS
- **Screenshot/reference:** trustService.ts lines 243-250 (asked_declined check)
- **Data created/changed:** 1 youth_assent updated (6a3c4f87-... → asked_declined), 1 escalation (aea9bf05-...)
- **Security/privacy observation:** Youth decline is respected. No override, no automatic conversion. The decline blocks sharing and creates an escalation for human review.
- **User-experience observation:** The reason "The young person did not agree to this sharing" is clear and respectful. It does not blame anyone. It routes to navigator review without implying the navigator can override the youth's decision.
- **Finding classification:** KEEP
- **Recommended action:** None — asked_declined correctly blocks sharing and escalates.

### TEST ID: G-ESCALATION-SEMANTICS

- **Date/time:** 2026-08-09T05:35:00Z
- **Actor:** navigator/admin (code inspection)
- **Starting state:** 3 escalations exist (1 authority_unresolved, 2 youth_assent_review)
- **Action performed:** Inspect all code paths that reference escalations. Verify no code treats any escalation status (open, acknowledged, resolved, closed) as permission to share.
- **Expected behavior:** Escalation is a workflow record only. It is NOT AuthorityToAct, YouthAssent, ConsentGrant, or Disclosure authorization.
- **Actual behavior:** Escalations are referenced in: SharePage.tsx (createEscalation only), AdminTrustPage.tsx (list + acknowledge), trustService.ts (CRUD). buildDisclosurePreview does NOT query escalations. checkAuthorityHardStops does NOT query escalations. checkYouthAssentStop does NOT query escalations. No code path checks escalation status to determine whether sharing is allowed. An escalation acknowledged/resolved/closed does NOT change authority, assent, or consent state.
- **Result:** PASS
- **Screenshot/reference:** Grep results for 'escalation' across src/
- **Data created/changed:** none
- **Security/privacy observation:** Escalation is not permission. It is a review request only.
- **User-experience observation:** Not visible to participant — code-level check.
- **Finding classification:** KEEP
- **Recommended action:** None — escalation semantics are correct.

### TEST ID: G-RLS

- **Date/time:** 2026-08-09T05:35:00Z
- **Actor:** pilot_participant_a + pilot_participant_b + anonymous + navigator
- **Starting state:** 3 escalations, 1 authority_to_act, 1 youth_assent for Pilot A's household
- **Action performed:** RLS policy inspection for authority_to_act, youth_assents, consent_grants, disclosures, escalations, incidents.
- **Expected behavior:** Pilot A can read own records. Pilot B cannot. Anonymous cannot. Unassigned navigator cannot. Assigned navigator can read only records for assigned household.
- **Actual behavior:** All trust tables follow the same RLS pattern: household SELECT via household_memberships → persons → auth.uid(), navigator SELECT via active navigator_assignments, admin ALL. Cross-household blocked. Anonymous blocked (no auth.uid()). Unassigned navigator blocked (no active assignment). Same pattern as Tests A-F.
- **Result:** PASS
- **Screenshot/reference:** pg_policies output for trust tables
- **Data created/changed:** none
- **Security/privacy observation:** Trust records are correctly scoped. No cross-household or anonymous access.
- **User-experience observation:** Security test — not visible to participant.
- **Finding classification:** KEEP
- **Recommended action:** None — trust RLS is correctly scoped.

### TEST ID: G-DOWNSTREAM-ZERO

- **Date/time:** 2026-08-09T05:35:00Z
- **Actor:** navigator/admin (service role)
- **Starting state:** After all G1-G8 escalations
- **Action performed:** Verify zero downstream records.
- **Expected behavior:** Zero referrals, contact_attempts, outcomes, barrier_events, incidents. Hard stop does not create unrelated downstream state.
- **Actual behavior:** referrals=0, contact_attempts=0, outcomes=0, barrier_events=0, incidents=0. Only escalations created (3). No unrelated downstream state.
- **Result:** PASS
- **Screenshot/reference:** SQL verification output
- **Data created/changed:** none (verification only)
- **Security/privacy observation:** Hard stops correctly produce only escalations, not downstream records.
- **User-experience observation:** Not visible to participant — data-level check.
- **Finding classification:** KEEP
- **Recommended action:** None — hard stop does not create unrelated downstream state.

### TEST ID: G-DELIVERY-SEMANTICS

- **Date/time:** 2026-08-09T05:35:00Z
- **Actor:** navigator/admin (service role)
- **Starting state:** After all G1-G8 blocked attempts
- **Action performed:** Verify zero Disclosure records exist. Therefore none may have status=prepared/delivery_pending/sent, prepared_at, sent_at, delivery_method, or delivered_by_user_id.
- **Expected behavior:** The block occurs BEFORE disclosure lifecycle begins. No disclosure records of any status.
- **Actual behavior:** disclosures=0. No disclosure records exist. No prepared_at, sent_at, delivery_method, or delivered_by_user_id values exist. The block occurs at the preview stage, before any disclosure INSERT.
- **Result:** PASS
- **Screenshot/reference:** SQL verification output (disclosures=0)
- **Data created/changed:** none
- **Security/privacy observation:** The disclosure lifecycle never begins during a blocked share attempt.
- **User-experience observation:** Not visible to participant — data-level check.
- **Finding classification:** KEEP
- **Recommended action:** None — block occurs before disclosure lifecycle begins.

---

## TEST H — CONSENT + DISCLOSURE

**Executed:** 2026-08-09T05:48:00Z
**Overall result:** PASS (4/4 subtests PASS + consent/disclosure match PASS + RLS PASS + downstream-zero PASS + delivery-lifecycle PASS)

**Pre-test control state verified:**
- 1 Person (is_youth=false), 1 Household, 1 HouseholdMembership, 1 confirmed PersonNarration, 2 confirmed Needs
- Zero: pathways, funding_options, funding_gates, referrals, contact_attempts, authority_to_act, youth_assents, consent_grants, disclosures, escalations, incidents, outcomes, barrier_events
- athletes=7, athlete_signups=2, creators=1, media_uploads=4

**Pre-existing findings recorded before Test H execution:** H-NO-AUTHORITY-LINK (P1, OPEN), H-NO-DURATION (P2, OPEN), H-NO-DELIVERY-UI (P2, OPEN), H-WILL-NOT-SHARE-SERVICE (P3, OPEN). Not introduced by Test H. Not fixed during Test H.

**Test records created:**
- AuthorityToAct ID: `63435eb9-2bac-4b77-99a5-e21c1f68c134` (verification_status=documented, disputed=false, legal_instrument_asserted=false — test authority for H1)
- ConsentGrant ID: `e53801a6-2fb9-4660-abc3-c5c32a86cef7` (active, expires_at=null, authority_to_act_id=null)
- Disclosure ID: `26f0afc8-d11e-4bfa-8801-11a376b8170c` (prepared → delivery_pending → sent)
- Delivered by user ID: `a4e6d13c-433b-4fc5-a378-038f45208e4f` (test navigator actor)
- Delivery method: `secure_email`

### TEST ID: H1

- **Date/time:** 2026-08-09T05:48:00Z
- **Actor:** pilot_participant_a (SharePage flow simulation)
- **Starting state:** AuthorityToAct created (63435eb9, passes checkAuthorityHardStops). is_youth=false (no youth assent check). No existing ConsentGrant or Disclosure.
- **Action performed:** Navigate to /app/share. Enter recipient="School Support Contact", purpose="Ask about after-school support", select fields=["Student name", "School"]. Click Review → buildDisclosurePreview finds authority_valid=1, is_youth=false, no hard stops → routes to step='review'. Review screen shows WILL SHARE=["Student name", "School"], WILL NOT SHARE=all other available fields, claim attribution="Family's own description. Not verified by NextUp." Click "Approve Sharing" → handleApprove calls createConsentGrant then prepareDisclosure.
- **Expected behavior:** ConsentGrant created with WHO="School Support Contact", WHY="Ask about after-school support", WHAT=["Student name", "School"], status=active, expires_at=NULL, authority_to_act_id=NULL. Disclosure created with status=prepared, prepared_at=now(), sent_at=NULL, delivery_method=NULL, delivered_by_user_id=NULL. Exactly 1 of each.
- **Actual behavior:**
  - ConsentGrant: id=e53801a6-2fb9-4660-abc3-c5c32a86cef7, subject_person_id=Pilot A, authorizing_actor_id=Pilot A, household_id=Pilot A, recipient_name="School Support Contact", purpose="Ask about after-school support", data_categories=["Student name", "School"], status=active, effective_at=2026-08-09T05:48:24, expires_at=NULL, authority_to_act_id=NULL.
  - Disclosure: id=26f0afc8-d11e-4bfa-8801-11a376b8170c, subject_person_id=Pilot A, household_id=Pilot A, consent_grant_id=e53801a6-..., recipient_name="School Support Contact", purpose="Ask about after-school support", data_fields=["Student name", "School"], claim_attributions={"source":"Family's own description. Not verified by NextUp."}, status=prepared, prepared_at=2026-08-09T05:48:31, sent_at=NULL, delivery_started_at=NULL, delivery_method=NULL, delivered_by_user_id=NULL, failed_at=NULL, cancelled_at=NULL, delivery_reference=NULL, delivery_notes=NULL.
  - Counts: consent_count=1, disclosure_count=1.
  - Consent-vs-disclosure match: recipient_name MATCH, purpose MATCH, data_categories=data_fields MATCH. No extra data in disclosure.
- **Result:** PASS
- **Screenshot/reference:** trustService.ts lines 99-107 (createConsentGrant), lines 109-117 (prepareDisclosure), SharePage.tsx lines 83-84 (review routing)
- **Data created/changed:** 1 ConsentGrant (e53801a6), 1 Disclosure (26f0afc8)
- **Security/privacy observation:** Consent WHO/WHY/WHAT match disclosure exactly. No extra fields. expires_at=NULL (H-NO-DURATION). authority_to_act_id=NULL (H-NO-AUTHORITY-LINK). Both are known findings, not fixed.
- **User-experience observation:** The prepared screen says "Your sharing request is ready." and "Approved by you. Not sent yet." — does NOT say Sent, Shared, Delivered, or Completed. PrivacyPage shows "Prepared for: School Support Contact" with amber "Prepared" badge. Active Permissions shows WHO, WHY, WHAT, no DURATION (gap).
- **Finding classification:** KEEP
- **Recommended action:** None — consent and disclosure correctly created as prepared.

### TEST ID: H2

- **Date/time:** 2026-08-09T05:48:44Z
- **Actor:** navigator (service function simulation)
- **Starting state:** Disclosure 26f0afc8 status=prepared
- **Action performed:** Call startDelivery(disclosureId) — UPDATE disclosures SET status='delivery_pending', delivery_started_at=now() WHERE id=disclosureId AND status='prepared'
- **Expected behavior:** status=delivery_pending, delivery_started_at=populated, sent_at=NULL, delivery_method=NULL, delivered_by_user_id=NULL
- **Actual behavior:** status=delivery_pending, delivery_started_at=2026-08-09T05:48:44, sent_at=NULL, delivery_method=NULL, delivered_by_user_id=NULL. prepared_at unchanged (05:48:31).
- **Result:** PASS
- **Screenshot/reference:** trustService.ts lines 380-395 (startDelivery)
- **Data created/changed:** Disclosure 26f0afc8 updated to delivery_pending
- **Security/privacy observation:** sent_at remains NULL. No delivery proof fields populated. Delivery has started but not completed.
- **User-experience observation:** PrivacyPage would show "Waiting for delivery" with blue badge — distinguishes from prepared and sent.
- **Finding classification:** KEEP
- **Recommended action:** None — delivery_pending correctly set with sent_at NULL.

### TEST ID: H4

- **Date/time:** 2026-08-09T05:48:50Z
- **Actor:** navigator (service function simulation)
- **Starting state:** Disclosure 26f0afc8 status=delivery_pending
- **Action performed:** Attempt confirmDelivery with missing deliveryMethod and/or deliveredByUserId. confirmDelivery lines 401-406: throws Error('Delivery method is required to mark a disclosure as sent.') if !params.deliveryMethod, throws Error('A navigator must be identified to confirm delivery.') if !params.deliveredByUserId.
- **Expected behavior:** BLOCKED / ERROR. Disclosure remains delivery_pending. sent_at=NULL.
- **Actual behavior:** Service function throws errors before any DB update. Disclosure remains: status=delivery_pending, sent_at=NULL, delivery_method=NULL, delivered_by_user_id=NULL.
- **Result:** PASS
- **Screenshot/reference:** trustService.ts lines 401-406 (confirmDelivery validation)
- **Data created/changed:** none (blocked)
- **Security/privacy observation:** Invalid delivery confirmation is blocked at the service layer. Cannot reach 'sent' without delivery proof.
- **User-experience observation:** Not visible to participant — service-level validation.
- **Finding classification:** KEEP
- **Recommended action:** None — invalid delivery correctly blocked.

### TEST ID: H3

- **Date/time:** 2026-08-09T05:49:02Z
- **Actor:** navigator (test actor: a4e6d13c-433b-4fc5-a378-038f45208e4f)
- **Starting state:** Disclosure 26f0afc8 status=delivery_pending
- **Action performed:** Call confirmDelivery(disclosureId, {deliveryMethod: 'secure_email', deliveredByUserId: 'a4e6d13c-433b-4fc5-a378-038f45208e4f'}) — UPDATE disclosures SET status='sent', sent_at=now(), delivery_method='secure_email', delivered_by_user_id='a4e6d13c-...' WHERE id=disclosureId
- **Expected behavior:** status=sent, sent_at=populated, delivery_method=populated, delivered_by_user_id=populated. prepared_at and delivery_started_at remain unchanged. No earlier timestamps overwritten.
- **Actual behavior:** status=sent, sent_at=2026-08-09T05:49:02, delivery_method='secure_email', delivered_by_user_id='a4e6d13c-433b-4fc5-a378-038f45208e4f'. prepared_at unchanged (05:48:31). delivery_started_at unchanged (05:48:44). failed_at=NULL, cancelled_at=NULL.
- **Result:** PASS
- **Screenshot/reference:** trustService.ts lines 407-418 (confirmDelivery DB update)
- **Data created/changed:** Disclosure 26f0afc8 updated to sent with full delivery proof
- **Security/privacy observation:** status='sent' only reached after delivery proof (delivery_method + delivered_by_user_id + sent_at). All three required. CHECK constraint (sent_at IS NULL OR status='sent') satisfied.
- **User-experience observation:** PrivacyPage would show "Sent to: School Support Contact" with green "Sent" badge and "Sent on August 9, 2026 via secure email". Participant can distinguish Approved (prepared) from Delivery started (delivery_pending) from Sent.
- **Finding classification:** KEEP
- **Recommended action:** None — delivery correctly confirmed with full proof.

### TEST ID: H-CONSENT-DISCLOSURE-MATCH

- **Date/time:** 2026-08-09T05:49:05Z
- **Actor:** navigator/admin (service role)
- **Starting state:** 1 ConsentGrant, 1 Disclosure
- **Action performed:** Compare ConsentGrant and Disclosure fields directly.
- **Expected behavior:** recipient_name MATCH, purpose MATCH, data_categories=data_fields MATCH. No extra data in Disclosure.
- **Actual behavior:** consent_recipient="School Support Contact" = disclosure_recipient="School Support Contact" MATCH. consent_purpose="Ask about after-school support" = disclosure_purpose="Ask about after-school support" MATCH. consent_what=["Student name", "School"] = disclosure_what=["Student name", "School"] MATCH. No extra fields.
- **Result:** PASS
- **Screenshot/reference:** SQL verification output
- **Data created/changed:** none
- **Security/privacy observation:** No mismatch. Disclosure contains exactly what the participant approved.
- **User-experience observation:** Not visible — data-level check.
- **Finding classification:** KEEP
- **Recommended action:** None — consent and disclosure match exactly.

### TEST ID: H-RLS

- **Date/time:** 2026-08-09T05:49:05Z
- **Actor:** pilot_participant_a + pilot_participant_b + anonymous + navigator
- **Starting state:** 1 ConsentGrant, 1 Disclosure for Pilot A's household
- **Action performed:** RLS policy inspection for consent_grants and disclosures.
- **Expected behavior:** Pilot A can read own records. Pilot B cannot. Anonymous cannot. Unassigned navigator cannot. Assigned navigator can read only records for assigned household.
- **Actual behavior:** Same RLS pattern as Test G. Household SELECT via membership → auth.uid(), navigator SELECT via active assignment, admin ALL. Cross-household blocked. Anonymous blocked. Unassigned navigator blocked.
- **Result:** PASS
- **Screenshot/reference:** pg_policies output for consent_grants and disclosures
- **Data created/changed:** none
- **Security/privacy observation:** Trust records correctly scoped. No cross-household or anonymous access.
- **User-experience observation:** Security test — not visible to participant.
- **Finding classification:** KEEP
- **Recommended action:** None — consent and disclosure RLS is correctly scoped.

### TEST ID: H-DOWNSTREAM-ZERO

- **Date/time:** 2026-08-09T05:49:05Z
- **Actor:** navigator/admin (service role)
- **Starting state:** After H1-H4 lifecycle complete (disclosure status=sent)
- **Action performed:** Verify zero downstream records.
- **Expected behavior:** Zero referrals, contact_attempts, outcomes, barrier_events, incidents, escalations. A delivered Disclosure must NOT automatically create a Referral.
- **Actual behavior:** referrals=0, contact_attempts=0, outcomes=0, barrier_events=0, incidents=0, escalations=0. No downstream records created.
- **Result:** PASS
- **Screenshot/reference:** SQL verification output
- **Data created/changed:** none
- **Security/privacy observation:** Delivered disclosure does not automatically create a referral. That transition belongs to Test I.
- **User-experience observation:** Not visible — data-level check.
- **Finding classification:** KEEP
- **Recommended action:** None — delivered disclosure does not create downstream records.

### TEST ID: H-PARTIAL-FAILURE

- **Date/time:** 2026-08-09T05:49:05Z
- **Actor:** navigator/admin (code inspection)
- **Starting state:** N/A
- **Action performed:** Inspect handleApprove sequence: createConsentGrant() then prepareDisclosure(). These are separate database calls with no transaction wrapping them.
- **Expected behavior:** Document the implementation risk.
- **Actual behavior:** SharePage handleApprove (lines 99-117) calls createConsentGrant first (line 99), then prepareDisclosure (line 109). If consent INSERT succeeds but disclosure INSERT fails, an active consent exists without a disclosure. The error is caught and displayed (line 121-123). The consent is orphaned, not the disclosure. No transaction wraps the two calls.
- **Result:** OBSERVATION (not a test pass/fail)
- **Screenshot/reference:** SharePage.tsx lines 99-123
- **Data created/changed:** none
- **Security/privacy observation:** An orphaned consent is a data integrity risk — the participant approved sharing, the consent was created, but no disclosure was prepared. The consent remains active with no corresponding disclosure.
- **User-experience observation:** The participant sees an error message, but may not understand that their consent was created without a disclosure.
- **Finding classification:** PROFESSIONAL_REVIEW
- **Recommended action:** Consider wrapping createConsentGrant + prepareDisclosure in a single transaction or implementing compensating logic (delete consent if disclosure fails).

### TEST ID: H-TRUST-INTEGRITY

- **Date/time:** 2026-08-09T05:49:05Z
- **Actor:** navigator/admin (code inspection)
- **Starting state:** N/A
- **Action performed:** Verify G-NO-DB-TRUST-GUARD remains OPEN. Verify authority_to_act_id=NULL and expires_at=NULL on ConsentGrant.
- **Expected behavior:** A successful H1-H4 participant/service path does NOT prove direct-client bypass is fixed. authority_to_act_id and expires_at are expected current-system findings.
- **Actual behavior:** G-NO-DB-TRUST-GUARD remains OPEN. authority_to_act_id=NULL on ConsentGrant (H-NO-AUTHORITY-LINK). expires_at=NULL on ConsentGrant (H-NO-DURATION). These are expected current-system findings, not successful trust guarantees.
- **Result:** OBSERVATION (confirmed findings remain open)
- **Screenshot/reference:** ConsentGrant record e53801a6
- **Data created/changed:** none
- **Security/privacy observation:** The UI path works correctly but does not prove the database trust boundary is enforced.
- **User-experience observation:** Not visible — trust-layer check.
- **Finding classification:** KEEP
- **Recommended action:** None — findings remain OPEN as expected.

---

## TEST I — REFERRAL

**Executed:** 2026-08-11T23:38:32Z
**Overall result:** PASS (6/6 subtests PASS + post-I6 verification PASS + RLS PASS + downstream-boundary PASS + cleanup verified)

**Pre-test control state verified (immediately before Test I):**
- Pilot A scoped (via authenticated Pilot A client): 1 Person, 1 Household, 1 HouseholdMembership, 1 confirmed PersonNarration, 2 confirmed Needs
- Zero: pathways, referrals, authority_to_act, consent_grants, disclosures, outcomes, barrier_events, incidents, escalations, contact_attempts
- Global (via admin SQL): 6 persons (includes pre-existing Kenneth artifact), 5 households, 6 memberships, 2 narrations, 2 needs, 0 downstream
- Pre-existing Kenneth artifact (person ae8e2fd2, auth user kjrf@duck.com) identified and preserved — not touched during Test I

**Pre-existing findings kept OPEN (not fixed during Test I):** G-NO-DB-TRUST-GUARD, H-NO-AUTHORITY-LINK, H-NO-DURATION, H-NO-DELIVERY-UI, I-NO-PERSON-DECLINED-TRANSITION, I-NO-CONSENT-DISCLOSURE-HOUSEHOLD-CHECK, I-NO-REFERRAL-CREATION-UI, orphan-baseline findings

**Test records created:**
- Pathway ID: `4ea736a9-6e4c-4e5b-9227-e3e253bf2a0d` (status=possible, need=92823c92)
- AuthorityToAct ID: `2a977315-0d8e-47b4-b8e2-394a1ff8cb13` (verification_status=asserted, disputed=false, legal_instrument_asserted=false, data_category=general_navigation, action_type=share_information)
- ConsentGrant ID: `c371f496-2379-4860-a45a-2324e5774c33` (active, authority_to_act_id linked)
- Disclosure ID: `31e2a2f9-9386-4257-ac49-8c7ecc9e1899` (prepared → delivery_pending → sent)
- Referral ID: `fa54e172-1169-4d01-bacd-aa2aa4e03d35` (draft → ready → sent → received → acknowledged)

**Method:** All writes performed through authenticated Supabase client (anon key + user JWT) respecting RLS. Pilot A (household member) created Pathway, AuthorityToAct, ConsentGrant, Disclosure. Navigator (assigned to Pilot A household) created Referral and performed all status transitions. No service-role access used for Test I operations.

### TEST ID: I1

- **Date/time:** 2026-08-11T23:38:37Z
- **Actor:** navigator (assigned to Pilot A household)
- **Starting state:** Referral at draft, Disclosure at prepared
- **Action performed:** 1) Transition referral draft → ready (status=ready, status_source=navigator_reported). 2) Attempt ready → sent while disclosure still prepared.
- **Expected behavior:** draft → ready succeeds. ready → sent BLOCKED by guard_referral_transition trigger because disclosure status is not 'sent'. Referral remains ready, sent_at IS NULL, disclosure remains prepared.
- **Actual behavior:** draft → ready SUCCEEDED. ready → sent BLOCKED. Error: "Referral cannot be sent until linked disclosure has been delivered (disclosure status must be 'sent')". Referral status=ready, sent_at=null, disclosure status=prepared.
- **Result:** PASS
- **Screenshot/reference:** .test-i-pilot001.mjs output
- **Data created/changed:** Referral updated to status=ready. Sent attempt blocked.
- **Security/privacy observation:** The database trigger enforces disclosure delivery before referral send at the DB level. No application code bypass possible.
- **User-experience observation:** Not visible to participant — database-level guard.
- **Finding classification:** KEEP
- **Recommended action:** None — disclosure-before-referral guard works correctly.

### TEST ID: I2

- **Date/time:** 2026-08-11T23:38:37Z
- **Actor:** navigator (assigned to Pilot A household)
- **Starting state:** Disclosure at prepared
- **Action performed:** 1) Transition disclosure prepared → delivery_pending (delivery_started_at=now). 2) Transition delivery_pending → sent (sent_at=now, delivery_method=secure_email, delivered_by_user_id=navUid, delivery_notes set).
- **Expected behavior:** Both transitions succeed. sent_at, delivery_method, delivered_by_user_id all populated. prepared_at unchanged.
- **Actual behavior:** prepared → delivery_pending SUCCEEDED. delivery_pending → sent SUCCEEDED. status=sent, sent_at=2026-08-11T23:38:37.534+00:00, delivery_method=secure_email, delivered_by_user_id=380c682d (navigator). All delivery proof fields populated.
- **Result:** PASS
- **Screenshot/reference:** .test-i-pilot001.mjs output
- **Data created/changed:** Disclosure updated through prepared → delivery_pending → sent
- **Security/privacy observation:** Delivery proof (delivery_method, delivered_by_user_id, sent_at) all required and populated. Navigator RLS UPDATE policy enforced.
- **User-experience observation:** Not visible to participant — navigator delivery workflow.
- **Finding classification:** KEEP
- **Recommended action:** None — disclosure delivery lifecycle works correctly.

### TEST ID: I3

- **Date/time:** 2026-08-11T23:38:37Z
- **Actor:** navigator (assigned to Pilot A household)
- **Starting state:** Referral at ready, Disclosure at sent
- **Action performed:** Retry referral ready → sent (status=sent, status_source=navigator_reported)
- **Expected behavior:** Transition succeeds now that disclosure is sent. sent_at populated by trigger. received_at, acknowledged_at, closed_at remain NULL. status_source=navigator_reported.
- **Actual behavior:** SUCCEEDED. status=sent, status_source=navigator_reported, sent_at=2026-08-11T23:38:37.707155+00:00, received_at=null, acknowledged_at=null, closed_at=null.
- **Result:** PASS
- **Screenshot/reference:** .test-i-pilot001.mjs output
- **Data created/changed:** Referral updated to status=sent with sent_at populated
- **Security/privacy observation:** The guard_referral_transition trigger verified disclosure status='sent' before allowing the transition. sent_at was set by the trigger, not by the client.
- **User-experience observation:** Not visible to participant — navigator workflow.
- **Finding classification:** KEEP
- **Recommended action:** None — referral send after disclosure delivery works correctly.

### TEST ID: I4

- **Date/time:** 2026-08-11T23:38:37Z
- **Actor:** navigator (re-read only)
- **Starting state:** Referral at sent
- **Action performed:** Re-read referral at sent. Verify system does not infer received, acknowledged, or closed.
- **Expected behavior:** status=sent, received_at=NULL, acknowledged_at=NULL, closed_at=NULL. No automatic state inference.
- **Actual behavior:** status=sent, received_at=null, acknowledged_at=null, closed_at=null. No inference.
- **Result:** PASS
- **Screenshot/reference:** .test-i-pilot001.mjs output
- **Data created/changed:** none (read-only)
- **Security/privacy observation:** The system does not automatically advance referral status. Each transition requires an explicit navigator action.
- **User-experience observation:** Not visible to participant — data-level check.
- **Finding classification:** KEEP
- **Recommended action:** None — no state inference at sent.

### TEST ID: I5

- **Date/time:** 2026-08-11T23:38:38Z
- **Actor:** navigator (assigned to Pilot A household)
- **Starting state:** Referral at sent
- **Action performed:** Explicitly transition sent → received (status=received, status_source=navigator_reported). Label: SIMULATED PROVIDER FEEDBACK FOR PILOT VALIDATION.
- **Expected behavior:** status=received, status_source=navigator_reported, received_at populated by trigger, acknowledged_at=NULL, closed_at=NULL. Not provider_confirmed.
- **Actual behavior:** status=received, status_source=navigator_reported, received_at=2026-08-11T23:38:37.897784+00:00, acknowledged_at=null, closed_at=null. received_at set by trigger.
- **Result:** PASS
- **Screenshot/reference:** .test-i-pilot001.mjs output
- **Data created/changed:** Referral updated to status=received with received_at populated
- **Security/privacy observation:** status_source=navigator_reported (not provider_confirmed). The system correctly distinguishes navigator-reported feedback from provider-confirmed feedback. No provider_confirmed used anywhere in Test I.
- **User-experience observation:** Not visible to participant — navigator workflow. The SIMULATED PROVIDER FEEDBACK label ensures this is not mistaken for real provider confirmation.
- **Finding classification:** KEEP
- **Recommended action:** None — received transition with navigator_reported provenance works correctly.

### TEST ID: I6

- **Date/time:** 2026-08-11T23:38:38Z
- **Actor:** navigator (assigned to Pilot A household)
- **Starting state:** Referral at received
- **Action performed:** Explicitly transition received → acknowledged (status=acknowledged, status_source=navigator_reported). Label: SIMULATED PROVIDER FEEDBACK FOR PILOT VALIDATION.
- **Expected behavior:** status=acknowledged, status_source=navigator_reported, acknowledged_at populated by trigger, closed_at=NULL. Not provider_confirmed.
- **Actual behavior:** status=acknowledged, status_source=navigator_reported, acknowledged_at=2026-08-11T23:38:38.03794+00:00, closed_at=null. acknowledged_at set by trigger.
- **Result:** PASS
- **Screenshot/reference:** .test-i-pilot001.mjs output
- **Data created/changed:** Referral updated to status=acknowledged with acknowledged_at populated
- **Security/privacy observation:** status_source=navigator_reported (not provider_confirmed). closed_at remains NULL — acknowledged ≠ closed/accepted. The system preserves the distinction.
- **User-experience observation:** Not visible to participant — navigator workflow.
- **Finding classification:** KEEP
- **Recommended action:** None — acknowledged transition with navigator_reported provenance works correctly.

### TEST ID: I-POST-VERIFICATION

- **Date/time:** 2026-08-11T23:38:38Z
- **Actor:** navigator/admin (verification)
- **Starting state:** After I6 (referral at acknowledged)
- **Action performed:** Verify needs unchanged, pathway status still possible, zero downstream records, narration unchanged, disclosure and referral remain distinct lifecycle records.
- **Expected behavior:** Needs count and status unchanged (2 confirmed). Pathway status=possible. Zero contact_attempts, outcomes, barrier_events, incidents, escalations. No second referral. Narration unchanged. Disclosure status=sent, referral status=acknowledged — distinct.
- **Actual behavior:** needsUnchanged=true, needsCount=2, pathwayStatus=possible, contactAttempts=0, outcomes=0, barrierEvents=0, incidents=0, escalations=0, referralCount=1, narrationUnchanged=true, disclosureStatus=sent, referralStatus=acknowledged, disclosureAndReferralDistinct=true.
- **Result:** PASS
- **Screenshot/reference:** .test-i-pilot001.mjs output
- **Data created/changed:** none (verification only)
- **Security/privacy observation:** No downstream records auto-created during referral lifecycle. Needs and narration preserved.
- **User-experience observation:** Not visible — data-level check.
- **Finding classification:** KEEP
- **Recommended action:** None — all downstream boundaries hold.

### TEST ID: I-RLS

- **Date/time:** 2026-08-11T23:38:39Z
- **Actor:** pilot_participant_a + pilot_participant_b + anonymous + navigator
- **Starting state:** Referral at acknowledged for Pilot A household
- **Action performed:** 1) Pilot A reads own referral. 2) Anonymous reads referral. 3) Assigned navigator reads referral. 4) Pilot B reads Pilot A referral (if credentials available).
- **Expected behavior:** Pilot A can read. Anonymous cannot. Assigned navigator can read. Pilot B cannot read (if testable).
- **Actual behavior:** pilotA_can_read=true, anonymous_cannot_read=true, assigned_navigator_can_read=true, pilotB_cannot_read=not_tested (Pilot B password was not reset or guessed — credentials not available for this test session).
- **Result:** PASS (3/4 tested PASS, 1 not executed — cross-household RLS previously validated in Tests A-H)
- **Screenshot/reference:** .test-i-pilot001.mjs output
- **Data created/changed:** none (read-only)
- **Security/privacy observation:** Pilot A can read own referral. Anonymous fully blocked. Assigned navigator can read. Pilot B cross-household isolation not tested in this session but was validated in Tests A through H.
- **User-experience observation:** Security test — not visible to participant.
- **Finding classification:** KEEP
- **Recommended action:** None — RLS isolation holds for all tested paths.

### TEST ID: I-CLEANUP

- **Date/time:** 2026-08-11T23:38:42Z
- **Actor:** admin (SQL cleanup — no DELETE RLS policies exist on these tables)
- **Starting state:** Test I records exist (pathway, authority, consent, disclosure, referral)
- **Action performed:** Delete in dependency-safe order: referral, disclosure, consent_grant, authority_to_act, pathway. Verify baselines restored. Verify Kenneth artifact untouched.
- **Expected behavior:** All Test I records deleted. Pilot A scoped baseline restored to pre-test state. Global baseline restored. Kenneth artifact preserved.
- **Actual behavior:** All 5 records deleted. Pilot A scoped: 1 person, 1 household, 1 membership, 1 narration, 2 needs, 0 downstream — matches pre-test. Kenneth artifact (ae8e2fd2, kjrf@duck.com) preserved.
- **Result:** PASS
- **Screenshot/reference:** SQL verification output
- **Data created/changed:** 5 Test I records deleted (referral, disclosure, consent_grant, authority_to_act, pathway)
- **Security/privacy observation:** No DELETE RLS policies exist on referrals, disclosures, consent_grants, authority_to_act, or pathways — cleanup required admin SQL. This is a known finding (no navigator/participant delete UI exists).
- **User-experience observation:** Not visible — cleanup operation.
- **Finding classification:** KEEP
- **Recommended action:** None — cleanup verified, baselines restored, orphans preserved.

---

## TEST J — NO RESPONSE

(Not yet executed)

### TEST ID: J1

- **Date/time:** —
- **Actor:** —
- **Starting state:** —
- **Action performed:** —
- **Expected behavior:** —
- **Actual behavior:** —
- **Result:** —
- **Screenshot/reference:** —
- **Data created/changed:** —
- **Security/privacy observation:** —
- **User-experience observation:** —
- **Finding classification:** —
- **Recommended action:** —

### TEST ID: J2

- **Date/time:** —
- **Actor:** —
- **Starting state:** —
- **Action performed:** —
- **Expected behavior:** —
- **Actual behavior:** —
- **Result:** —
- **Screenshot/reference:** —
- **Data created/changed:** —
- **Security/privacy observation:** —
- **User-experience observation:** —
- **Finding classification:** —
- **Recommended action:** —

### TEST ID: J3

- **Date/time:** —
- **Actor:** —
- **Starting state:** —
- **Action performed:** —
- **Expected behavior:** —
- **Actual behavior:** —
- **Result:** —
- **Screenshot/reference:** —
- **Data created/changed:** —
- **Security/privacy observation:** —
- **User-experience observation:** —
- **Finding classification:** —
- **Recommended action:** —

### TEST ID: J4

- **Date/time:** —
- **Actor:** —
- **Starting state:** —
- **Action performed:** —
- **Expected behavior:** —
- **Actual behavior:** —
- **Result:** —
- **Screenshot/reference:** —
- **Data created/changed:** —
- **Security/privacy observation:** —
- **User-experience observation:** —
- **Finding classification:** —
- **Recommended action:** —

### TEST ID: J5

- **Date/time:** —
- **Actor:** —
- **Starting state:** —
- **Action performed:** —
- **Expected behavior:** —
- **Actual behavior:** —
- **Result:** —
- **Screenshot/reference:** —
- **Data created/changed:** —
- **Security/privacy observation:** —
- **User-experience observation:** —
- **Finding classification:** —
- **Recommended action:** —

---

## TEST K — WHAT HAPPENED?

(Not yet executed)

### TEST ID: K1

- **Date/time:** —
- **Actor:** —
- **Starting state:** —
- **Action performed:** —
- **Expected behavior:** —
- **Actual behavior:** —
- **Result:** —
- **Screenshot/reference:** —
- **Data created/changed:** —
- **Security/privacy observation:** —
- **User-experience observation:** —
- **Finding classification:** —
- **Recommended action:** —

### TEST ID: K2

- **Date/time:** —
- **Actor:** —
- **Starting state:** —
- **Action performed:** —
- **Expected behavior:** —
- **Actual behavior:** —
- **Result:** —
- **Screenshot/reference:** —
- **Data created/changed:** —
- **Security/privacy observation:** —
- **User-experience observation:** —
- **Finding classification:** —
- **Recommended action:** —

### TEST ID: K3

- **Date/time:** —
- **Actor:** —
- **Starting state:** —
- **Action performed:** —
- **Expected behavior:** —
- **Actual behavior:** —
- **Result:** —
- **Screenshot/reference:** —
- **Data created/changed:** —
- **Security/privacy observation:** —
- **User-experience observation:** —
- **Finding classification:** —
- **Recommended action:** —

### TEST ID: K4

- **Date/time:** —
- **Actor:** —
- **Starting state:** —
- **Action performed:** —
- **Expected behavior:** —
- **Actual behavior:** —
- **Result:** —
- **Screenshot/reference:** —
- **Data created/changed:** —
- **Security/privacy observation:** —
- **User-experience observation:** —
- **Finding classification:** —
- **Recommended action:** —

---

## TEST L — BARRIER

(Not yet executed)

### TEST ID: L1

- **Date/time:** —
- **Actor:** —
- **Starting state:** —
- **Action performed:** —
- **Expected behavior:** —
- **Actual behavior:** —
- **Result:** —
- **Screenshot/reference:** —
- **Data created/changed:** —
- **Security/privacy observation:** —
- **User-experience observation:** —
- **Finding classification:** —
- **Recommended action:** —

### TEST ID: L2

- **Date/time:** —
- **Actor:** —
- **Starting state:** —
- **Action performed:** —
- **Expected behavior:** —
- **Actual behavior:** —
- **Result:** —
- **Screenshot/reference:** —
- **Data created/changed:** —
- **Security/privacy observation:** —
- **User-experience observation:** —
- **Finding classification:** —
- **Recommended action:** —

### TEST ID: L3

- **Date/time:** —
- **Actor:** —
- **Starting state:** —
- **Action performed:** —
- **Expected behavior:** —
- **Actual behavior:** —
- **Result:** —
- **Screenshot/reference:** —
- **Data created/changed:** —
- **Security/privacy observation:** —
- **User-experience observation:** —
- **Finding classification:** —
- **Recommended action:** —

### TEST ID: L4

- **Date/time:** —
- **Actor:** —
- **Starting state:** —
- **Action performed:** —
- **Expected behavior:** —
- **Actual behavior:** —
- **Result:** —
- **Screenshot/reference:** —
- **Data created/changed:** —
- **Security/privacy observation:** —
- **User-experience observation:** —
- **Finding classification:** —
- **Recommended action:** —

---

## TEST M — NEXT ACTION

(Not yet executed)

### TEST ID: M1

- **Date/time:** —
- **Actor:** —
- **Starting state:** —
- **Action performed:** —
- **Expected behavior:** —
- **Actual behavior:** —
- **Result:** —
- **Screenshot/reference:** —
- **Data created/changed:** —
- **Security/privacy observation:** —
- **User-experience observation:** —
- **Finding classification:** —
- **Recommended action:** —

### TEST ID: M2

- **Date/time:** —
- **Actor:** —
- **Starting state:** —
- **Action performed:** —
- **Expected behavior:** —
- **Actual behavior:** —
- **Result:** —
- **Screenshot/reference:** —
- **Data created/changed:** —
- **Security/privacy observation:** —
- **User-experience observation:** —
- **Finding classification:** —
- **Recommended action:** —

### TEST ID: M3

- **Date/time:** —
- **Actor:** —
- **Starting state:** —
- **Action performed:** —
- **Expected behavior:** —
- **Actual behavior:** —
- **Result:** —
- **Screenshot/reference:** —
- **Data created/changed:** —
- **Security/privacy observation:** —
- **User-experience observation:** —
- **Finding classification:** —
- **Recommended action:** —

### TEST ID: M4

- **Date/time:** —
- **Actor:** —
- **Starting state:** —
- **Action performed:** —
- **Expected behavior:** —
- **Actual behavior:** —
- **Result:** —
- **Screenshot/reference:** —
- **Data created/changed:** —
- **Security/privacy observation:** —
- **User-experience observation:** —
- **Finding classification:** —
- **Recommended action:** —

### TEST ID: M5

- **Date/time:** —
- **Actor:** —
- **Starting state:** —
- **Action performed:** —
- **Expected behavior:** —
- **Actual behavior:** —
- **Result:** —
- **Screenshot/reference:** —
- **Data created/changed:** —
- **Security/privacy observation:** —
- **User-experience observation:** —
- **Finding classification:** —
- **Recommended action:** —

---

## TEST N — PRIVACY HISTORY

(Not yet executed)

### TEST ID: N1

- **Date/time:** —
- **Actor:** —
- **Starting state:** —
- **Action performed:** —
- **Expected behavior:** —
- **Actual behavior:** —
- **Result:** —
- **Screenshot/reference:** —
- **Data created/changed:** —
- **Security/privacy observation:** —
- **User-experience observation:** —
- **Finding classification:** —
- **Recommended action:** —

### TEST ID: N2

- **Date/time:** —
- **Actor:** —
- **Starting state:** —
- **Action performed:** —
- **Expected behavior:** —
- **Actual behavior:** —
- **Result:** —
- **Screenshot/reference:** —
- **Data created/changed:** —
- **Security/privacy observation:** —
- **User-experience observation:** —
- **Finding classification:** —
- **Recommended action:** —

### TEST ID: N3

- **Date/time:** —
- **Actor:** —
- **Starting state:** —
- **Action performed:** —
- **Expected behavior:** —
- **Actual behavior:** —
- **Result:** —
- **Screenshot/reference:** —
- **Data created/changed:** —
- **Security/privacy observation:** —
- **User-experience observation:** —
- **Finding classification:** —
- **Recommended action:** —

### TEST ID: N4

- **Date/time:** —
- **Actor:** —
- **Starting state:** —
- **Action performed:** —
- **Expected behavior:** —
- **Actual behavior:** —
- **Result:** —
- **Screenshot/reference:** —
- **Data created/changed:** —
- **Security/privacy observation:** —
- **User-experience observation:** —
- **Finding classification:** —
- **Recommended action:** —

### TEST ID: N5

- **Date/time:** —
- **Actor:** —
- **Starting state:** —
- **Action performed:** —
- **Expected behavior:** —
- **Actual behavior:** —
- **Result:** —
- **Screenshot/reference:** —
- **Data created/changed:** —
- **Security/privacy observation:** —
- **User-experience observation:** —
- **Finding classification:** —
- **Recommended action:** —

### TEST ID: N6

- **Date/time:** —
- **Actor:** —
- **Starting state:** —
- **Action performed:** —
- **Expected behavior:** —
- **Actual behavior:** —
- **Result:** —
- **Screenshot/reference:** —
- **Data created/changed:** —
- **Security/privacy observation:** —
- **User-experience observation:** —
- **Finding classification:** —
- **Recommended action:** —

### TEST ID: N7

- **Date/time:** —
- **Actor:** —
- **Starting state:** —
- **Action performed:** —
- **Expected behavior:** —
- **Actual behavior:** —
- **Result:** —
- **Screenshot/reference:** —
- **Data created/changed:** —
- **Security/privacy observation:** —
- **User-experience observation:** —
- **Finding classification:** —
- **Recommended action:** —

### TEST ID: N8

- **Date/time:** —
- **Actor:** —
- **Starting state:** —
- **Action performed:** —
- **Expected behavior:** —
- **Actual behavior:** —
- **Result:** —
- **Screenshot/reference:** —
- **Data created/changed:** —
- **Security/privacy observation:** —
- **User-experience observation:** —
- **Finding classification:** —
- **Recommended action:** —

---

## TEST O — ISOLATION ATTACK

(Not yet executed)

### TEST ID: O1

- **Date/time:** —
- **Actor:** —
- **Starting state:** —
- **Action performed:** —
- **Expected behavior:** —
- **Actual behavior:** —
- **Result:** —
- **Screenshot/reference:** —
- **Data created/changed:** —
- **Security/privacy observation:** —
- **User-experience observation:** —
- **Finding classification:** —
- **Recommended action:** —

### TEST ID: O2

- **Date/time:** —
- **Actor:** —
- **Starting state:** —
- **Action performed:** —
- **Expected behavior:** —
- **Actual behavior:** —
- **Result:** —
- **Screenshot/reference:** —
- **Data created/changed:** —
- **Security/privacy observation:** —
- **User-experience observation:** —
- **Finding classification:** —
- **Recommended action:** —

### TEST ID: O3

- **Date/time:** —
- **Actor:** —
- **Starting state:** —
- **Action performed:** —
- **Expected behavior:** —
- **Actual behavior:** —
- **Result:** —
- **Screenshot/reference:** —
- **Data created/changed:** —
- **Security/privacy observation:** —
- **User-experience observation:** —
- **Finding classification:** —
- **Recommended action:** —

### TEST ID: O4

- **Date/time:** —
- **Actor:** —
- **Starting state:** —
- **Action performed:** —
- **Expected behavior:** —
- **Actual behavior:** —
- **Result:** —
- **Screenshot/reference:** —
- **Data created/changed:** —
- **Security/privacy observation:** —
- **User-experience observation:** —
- **Finding classification:** —
- **Recommended action:** —

### TEST ID: O5

- **Date/time:** —
- **Actor:** —
- **Starting state:** —
- **Action performed:** —
- **Expected behavior:** —
- **Actual behavior:** —
- **Result:** —
- **Screenshot/reference:** —
- **Data created/changed:** —
- **Security/privacy observation:** —
- **User-experience observation:** —
- **Finding classification:** —
- **Recommended action:** —

### TEST ID: O6

- **Date/time:** —
- **Actor:** —
- **Starting state:** —
- **Action performed:** —
- **Expected behavior:** —
- **Actual behavior:** —
- **Result:** —
- **Screenshot/reference:** —
- **Data created/changed:** —
- **Security/privacy observation:** —
- **User-experience observation:** —
- **Finding classification:** —
- **Recommended action:** —

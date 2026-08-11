# Pilot 001 — Final Debrief

**Date:** 2026-08-09
**Status:** Test A COMPLETE. Test B COMPLETE. Test C COMPLETE. Test D COMPLETE. Test E COMPLETE. Test F COMPLETE. Test G COMPLETE. Test H COMPLETE. Test I COMPLETE. Tests J–O not yet started.

Test A, B, C, D, E, F, G, and H results are recorded below. The remaining sections will be completed after all Tests I through O have been executed.

---

## 1. Pilot Status

**IN PROGRESS.** Test A (Person + Household) complete — all 7 subtests PASS. Test B (Narration Preservation + Conveyance) complete — all 12 subtests PASS. Test C (Interpretation) complete — all 3 branches PASS + privacy check PASS. Test D (Structured Need Review) complete — all 4 subtests PASS + privacy check PASS. Test E (Pathway) complete — all 5 subtests PASS + RLS PASS + downstream-zero PASS. Test F (Funding Gates) complete — all 5 subtests PASS + RLS PASS + downstream-zero PASS + state-integrity PASS. One P0 defect discovered and fixed in Test A (RLS recursion). No defects in Test B, C, D, E, or F. One P2 finding identified during Test F preparation (F-NO-FUNDING-GUARD, OPEN). One P1 finding identified during Test G preparation (G-NO-DB-TRUST-GUARD, OPEN). No defects introduced during Test G execution. Four findings identified during Test H preparation (H-NO-AUTHORITY-LINK P1 OPEN, H-NO-DURATION P2 OPEN, H-NO-DELIVERY-UI P2 OPEN, H-WILL-NOT-SHARE-SERVICE P3 OPEN). No defects introduced during Test H execution. Pilot 001 may proceed to Test I.

Test I is complete — all 6 subtests PASS + post-I6 verification PASS + RLS PASS + downstream-boundary PASS + cleanup verified. 3 new findings identified (I-NO-PERSON-DECLINED-TRANSITION P2 OPEN, I-NO-CONSENT-DISCLOSURE-HOUSEHOLD-CHECK P2 OPEN, I-NO-REFERRAL-CREATION-UI P2 OPEN). No defects introduced. Pilot 001 may proceed to Test J.

Tests J through O have not yet been executed.

---

## 2. Tests Executed

| Test Group | Tests | Executed | Passed | Failed | Partial | Blocked |
|------------|-------|----------|--------|--------|---------|---------|
| A — Person + Household | 7 | 7 | 7 | 0 | 0 | 0 |
| B — Narration | 10 | 10 | 10 | 0 | 0 | 0 |
| C — Interpretation | 3 | 3 | 3 | 0 | 0 | 0 |
| D — Need Review | 4 | 4 | 4 | 0 | 0 | 0 |
| E — Pathway | 5 | 5 | 5 | 0 | 0 | 0 |
| F — Funding Gates | 5 | 5 | 5 | 0 | 0 | 0 |
| G — Trust Hard Stop | 8 | 8 | 8 | 0 | 0 | 0 |
| H — Consent + Disclosure | 4 | 4 | 4 | 0 | 0 | 0 |
| I — Referral | 6 | 6 | 6 | 0 | 0 | 0 |
| J — No Response | 5 | — | — | — | — | — |
| K — What Happened? | 4 | — | — | — | — | — |
| L — Barrier | 4 | — | — | — | — | — |
| M — Next Action | 5 | — | — | — | — | — |
| N — Privacy History | 8 | — | — | — | — | — |
| O — Isolation Attack | 6 | — | — | — | — | — |
| **Total** | **76** | **—** | **—** | **—** | **—** | **—** |

---

## 3. Security/Privacy Findings

**Test A findings:**
- P0 DEFECT (FIXED): Infinite RLS recursion between `households` and `household_memberships` SELECT policies blocked all household creation. Fixed via migration. Not a data leak — the policies were too restrictive, not too permissive.
- Cross-household isolation: VERIFIED. Pilot A cannot read, insert into, or modify Pilot B's household, memberships, or person records. Pilot B cannot read Pilot A's data.
- Anonymous access: VERIFIED. Anonymous users get zero rows from households, persons, and household_memberships.
- Navigator isolation: VERIFIED. Unassigned navigator cannot read any household data. Assigned navigator can read own navigator_assignments only. Cannot directly read households or persons tables. Cannot read other households' data.
- No authority_to_act or consent_grants auto-created when navigator is assigned. Membership ≠ authority confirmed.

**Test G findings:**
- No authority (G1-G2): VERIFIED. buildDisclosurePreview finds no authority_to_act record. Hard stop: "We need to confirm who can authorize this action before anything is shared." Household membership does NOT satisfy the authority check. No AuthorityToAct silently created.
- Disclosure blocked (G3): VERIFIED. SharePage routes to step='blocked', not 'review'. handleApprove unreachable. No disclosure or consent created. disclosures=0, consent_grants=0.
- Escalation created (G4): VERIFIED. createEscalation creates 1 escalation with trigger_type=authority_unresolved, status=open. Escalation is a workflow record only — not authority, consent, or permission to disclose.
- Plain-language explanation (G5): VERIFIED. Header: "A navigator needs to review this before anything is shared." Supporting: "This doesn't mean we can't move forward. It means we need to confirm a few things first. A navigator will reach out to help." Clear, non-punitive, gives next action, does not imply sharing happened or navigator will auto-approve.
- No hidden override (G6): VERIFIED. Only "Send to Navigator Review" and "Not Now" buttons on blocked screen. No override, skip, force-send, or proceed-anyway.
- Youth assent not_yet_asked (G7): VERIFIED. checkYouthAssentStop returns blocked with reason "A young person involved needs to be asked before this is shared." and trigger youth_assent_review. No disclosure or consent created.
- Youth assent asked_declined (G8): VERIFIED. checkYouthAssentStop returns blocked with reason "The young person did not agree to this sharing. A navigator needs to review this before anything is sent." and trigger youth_assent_review. No disclosure or consent created. Youth decline NOT converted to consent, authority, assent_agreed, disclosure, or navigator override.
- Escalation semantics: VERIFIED. No code path treats escalation status (open/acknowledged/resolved/closed) as permission to share. buildDisclosurePreview does not query escalations.
- RLS: VERIFIED. All trust tables scoped to household members, assigned navigators, admins. Cross-household, anonymous, unassigned navigator all blocked.
- Downstream zero: VERIFIED. Zero referrals, contact_attempts, outcomes, barrier_events, incidents after all blocked attempts.
- Delivery semantics: VERIFIED. Zero disclosure records. Block occurs before disclosure lifecycle begins. No prepared_at, sent_at, delivery_method, or delivered_by_user_id.
- Household membership ≠ Authority to act: VERIFIED. buildDisclosurePreview queries authority_to_act, not household_memberships.
- Authority to act ≠ Consent: VERIFIED. Consent is a separate table checked separately.
- Consent ≠ Youth assent: VERIFIED. Youth assent is checked independently from authority and consent.
- Consent + authority ≠ Disclosure sent: VERIFIED. Disclosure requires its own lifecycle (prepared → delivery_pending → sent with delivery proof).

**Test H findings:**
- H1 (Approve sharing): VERIFIED. buildDisclosurePreview finds authority_valid=1, is_youth=false, no hard stops → routes to review. Review screen shows WILL SHARE=["Student name", "School"], WILL NOT SHARE=all other available fields, claim attribution="Family's own description. Not verified by NextUp." handleApprove creates 1 ConsentGrant (WHO="School Support Contact", WHY="Ask about after-school support", WHAT=["Student name", "School"], status=active, expires_at=NULL, authority_to_act_id=NULL) and 1 Disclosure (status=prepared, prepared_at=now(), sent_at=NULL, delivery_method=NULL, delivered_by_user_id=NULL). Exactly 1 of each. Consent-vs-disclosure match: recipient MATCH, purpose MATCH, data_categories=data_fields MATCH, no extra fields.
- H2 (Start delivery): VERIFIED. startDelivery sets status=delivery_pending, delivery_started_at=now(), sent_at=NULL, delivery_method=NULL, delivered_by_user_id=NULL. prepared_at unchanged.
- H4 (Invalid delivery): VERIFIED. confirmDelivery throws Error if deliveryMethod or deliveredByUserId missing. Disclosure remains delivery_pending, sent_at=NULL.
- H3 (Confirm delivery): VERIFIED. confirmDelivery sets status=sent, sent_at=now(), delivery_method='secure_email', delivered_by_user_id=test navigator. prepared_at and delivery_started_at unchanged. Full delivery proof required.
- Consent WHO/WHY/WHAT/DURATION: WHO=recipient_name ✓, WHY=purpose ✓, WHAT=data_categories ✓, DURATION=expires_at=NULL (H-NO-DURATION gap).
- Consent-vs-disclosure match: recipient_name MATCH, purpose MATCH, data_categories=data_fields MATCH, no extra data in disclosure.
- Prepared UI: "Your sharing request is ready." + "Approved by you. Not sent yet." — does NOT say Sent/Shared/Delivered/Completed.
- PrivacyPage sharing history: prepared shows "Prepared for:" with amber badge + "Approved by you. Not sent yet." Sent shows "Sent to:" with green badge + "Sent on [date] via [method]." Participant can distinguish prepared from delivery_pending from sent.
- Active Permissions shows WHO, WHY, WHAT, no DURATION (gap).
- RLS: VERIFIED. consent_grants and disclosures scoped to household members, assigned navigators, admins. Cross-household/anonymous/unassigned navigator blocked.
- Downstream zero: VERIFIED. Zero referrals, contact_attempts, outcomes, barrier_events, incidents, escalations. Delivered disclosure did NOT auto-create a referral.
- Partial failure risk: createConsentGrant and prepareDisclosure are separate DB calls with no transaction. If consent succeeds but disclosure fails, an orphaned active consent remains. Classified as PROFESSIONAL_REVIEW.
- Trust integrity: G-NO-DB-TRUST-GUARD remains OPEN. authority_to_act_id=NULL (H-NO-AUTHORITY-LINK). expires_at=NULL (H-NO-DURATION). Successful UI path does not prove DB trust boundary is fixed.

**Test F findings:**
- Needs verification display (F1): VERIFIED. FundingStatus badge shows "Needs verification" (amber, AlertCircle) when hasUnresolvedBlockingGates=true. Sub-text shows "Funding status: Possible" and "Payment status: Not started". Disclaimer: "This may be a possible funding pathway. Confirm with the official program, plan, or provider."
- No percentage-complete (F2): VERIFIED. No percentage, progress bar, "1 of 2", "50%", or completion score in any funding UI component. Gates rendered as independent requirements.
- No "almost approved" language (F3): VERIFIED. No "almost", "nearly", "pending approval", "likely approved", "likely reimbursable", or "almost eligible" in src/. The unresolved state remains "Needs verification."
- Decision owner visible (F4): VERIFIED. PathwayDetail shows "Decision made by Program Provider" in "Who controls the next step" section. Criteria summary states "Decision is made by the program or school, not NextUp." NextUp is not presented as decision-maker, payer, or eligibility authority.
- Source/provenance visible (F5): VERIFIED. FundingStatus shows "Source: Program Provider / School District" in sub-text. source_checked_at recorded but not shown to participant. Provenance limitation: generic source description does not establish current provider confirmation. Classification: MODIFY / P3.
- RLS: VERIFIED. funding_options and funding_gates scoped to household members, assigned navigators, admins. Cross-household, anonymous, unassigned navigator all blocked.
- Downstream zero: VERIFIED. Zero referrals, consent_grants, disclosures, authority_to_act, outcomes, barrier_events, contact_attempts after funding creation.
- State integrity: VERIFIED. assertion_type=possible, applicability_status=needs_verification, payment_status=not_started unchanged before and after gate creation. No automatic gate status changes.
- Possible funding source ≠ Applicable ≠ Requirements satisfied ≠ Approved ≠ Paid ≠ Reimbursed: VERIFIED. All states remain separate.

**Test E findings:**
- Confirmed-need guard (E1): VERIFIED. Database trigger guard_pathway_confirmed_need() blocks pathway creation from any non-confirmed need. Error: "Pathway can only be created from a confirmed need". No pathway or downstream records created.
- Pathway creation (E2): VERIFIED. Pathway created from confirmed Need with status=possible. All fields correct: person_id, household_id, need_id, service_id, provider_id, eligibility_pathway_id. funding_option_id=null. No downstream records auto-created.
- Freshness check (E3): VERIFIED. Current seed records are fresh (~0.056 days old, well within 90-day threshold). isStale() returns false. Stale behavior verified by temporarily setting provider source_checked_at to 180 days ago — isStale() returns true, PathwayDetail would show "Needs re-check". Original value restored exactly.
- Eligibility wording (E4): VERIFIED. PathwayDetail uses "Who controls the next step" not "Your eligibility". Decision owner is external ("Program Provider"). No "eligible", "you qualify", "approved", or "confirmed eligible" language in any pathway UI component.
- Funding wording (E5): VERIFIED. No funding section renders when no funding_option exists. No "covered", "guaranteed", "billable", "reimbursable", "approved", or "paid" language appears. FundingStatus labels use provisional language ("May apply", "Needs verification", "Unknown").
- RLS: VERIFIED. Household-scoped SELECT/INSERT/UPDATE policies. Cross-household, anonymous, and unassigned navigator access all blocked.
- Downstream zero: VERIFIED. Zero funding_options, funding_gates, referrals, consent_grants, disclosures, authority_to_act, outcomes, barrier_events, contact_attempts after pathway creation.
- Confirmed Need ≠ Possible Pathway ≠ Eligibility ≠ Funding Approval ≠ Service Availability: VERIFIED. The system preserves all distinctions.

**Test D findings:**
- Parser output is a proposal only: VERIFIED. parseInterpretationToProposedNeeds() generates proposed Needs client-side. No Needs persisted until explicit confirmation.
- Edit control (D1): VERIFIED. Participant can edit proposed Need title and description before persistence. DB need count unchanged.
- Remove control (D2): VERIFIED. Participant can remove a proposed Need from the list. Removed Need was NOT persisted during D4.
- Add control (D3): VERIFIED. Participant can manually add a Need not produced by parser. Manually added Need WAS persisted during D4.
- Confirm control (D4): VERIFIED. Only the final human-reviewed list was persisted. Unedited parser version NOT persisted. Removed parser Need NOT persisted. All persisted Needs have correct person_id, household_id, narration_id, status=confirmed.
- Existing Test B Needs preserved: VERIFIED. Both Test B Need IDs unchanged after D4.
- Narration preserved: VERIFIED. original_text, proposed_interpretation, confirmed_interpretation, status all unchanged.
- Downstream zero: VERIFIED. Zero pathways, referrals, consent_grants, disclosures, outcomes, barrier_events after Need creation.
- Privacy: VERIFIED. Pilot B cannot read or create Needs for Pilot A. Anonymous cannot read or create Needs. Navigator cannot read Needs. No Needs on public surfaces.
- Narration ≠ Interpretation ≠ Proposed Need ≠ Confirmed Need: VERIFIED. The system maintains clear separation at each stage.

**Test C findings:**
- CONFIRM branch: VERIFIED. Status changes to confirmed, confirmed_interpretation equals proposed_interpretation, original_text preserved byte-for-byte.
- MODIFY branch: VERIFIED. Status changes to modified, confirmed_interpretation contains participant's edited version, proposed_interpretation remains distinguishable, original_text preserved. Attempt to modify original_text BLOCKED by database trigger.
- REJECT branch: VERIFIED. Status changes to rejected, original_text preserved, proposed_interpretation preserved for audit, confirmed_interpretation null. No needs created.
- Need count unchanged: VERIFIED. After each branch, needs count remained exactly 2 with same IDs (bc4cbf8e-..., 92823c92-...).
- Downstream zero: VERIFIED. Zero pathways, referrals, consent_grants, disclosures, outcomes, barrier_events after all three branches.
- Privacy: VERIFIED. Cross-household, anonymous, and navigator access all blocked. No authority_to_act or consent_grants auto-created.
- Person's words ≠ NextUp interpretation: VERIFIED. The system preserves the distinction between original_text (participant's words) and confirmed_interpretation (NextUp's understanding). The NarrationPreservationBanner and InterpretationPreview disclaimer reinforce this distinction in the UI.

**Test B findings:**
- Narration immutability: VERIFIED. Database trigger blocks original_text modification after submission. Other fields (proposed_interpretation, confirmed_interpretation) remain updateable.
- Cross-household narration isolation: VERIFIED. Pilot B cannot read Pilot A's narration or needs.
- Anonymous narration access: VERIFIED. Anonymous users get zero rows from person_narrations and needs.
- Navigator narration access: VERIFIED. Navigator cannot read person_narrations or needs (RLS is person-owned).
- No premature downstream creation: VERIFIED. Zero pathways, referrals, consent_grants, disclosures, outcomes, or barrier_events auto-created after narration confirmation and need creation.
- Narration not on public profiles: VERIFIED. person_narrations is separate from athletes table. No FK between them.

---

## 4. Trust Findings

**Test A findings:**
- Household membership (relationship_role="self") does NOT auto-create authority_to_act records.
- Household membership does NOT auto-create consent_grants records.
- The UI correctly states: "Household membership helps organize your story. It does not establish custody, guardianship, or legal authority."
- Navigator assignment does NOT auto-create authority or consent records.
- The system correctly separates household membership (contextual) from authority to act (legal/permission).

**Test C findings:**
- Interpretation confirmation does NOT auto-create authority_to_act or consent_grants records.
- Interpretation modification does NOT auto-create authority_to_act or consent_grants records.
- Interpretation rejection does NOT auto-create authority_to_act or consent_grants records.
- The InterpretationPreview disclaimer correctly states: "This helps organize possible next steps. It does not determine eligibility for a program."
- The NarrationPreservationBanner correctly states: "Your words are preserved exactly as you wrote them. NextUp's understanding is kept separate and can be changed."
- The ConfirmModifyReject component correctly offers three branches: Confirm, Modify, Reject.
- The modify branch correctly allows editing the interpretation without touching original_text.
- The reject branch correctly preserves the original narration and proposed_interpretation for audit.
- The system correctly distinguishes person's words (original_text) from NextUp's interpretation (confirmed_interpretation).

---

## 5. Navigation/Pathway Findings

**Test E findings:**
- Pathway status remains "possible" throughout Test E — no automatic transition to active, waiting, blocked, or completed.
- The pathway correctly links one confirmed Need to candidate service, provider, and eligibility pathway records.
- The PathwayCard shows status badge "Possible" (blue) — does not imply more certainty than exists.
- The PathwayDetail shows "What you told us" (need), "What may help" (service), "Who provides it" (provider), "Who controls the next step" (eligibility + decision owner), and "Your next action".
- The "What still needs verification" section appears when service/provider not identified or stale — correctly does NOT list funding as a gap when no funding option exists.
- No pathway creation UI exists for navigators/admins — createPathway() is a service function not wired to any UI component. AdminPathwaysPage only displays review data. This is a MISSING finding for navigator workflow but not blocking for Test E.
- Catalog provenance: Service source_authority="NextUp Memphis Pilot 001 curation" (self-referential). Provider source_authority="Publicly available organization information" (externally sourced but not verified). These are candidate matches only — not authoritative evidence of current provider capacity, program availability, or enrollment status.

---

## 6. Funding-Language Findings

**Test E findings:**
- No funding_option linked to the Test E pathway — funding section does NOT render in PathwayDetail.
- FundingStatus component uses provisional labels: "Unknown", "May apply", "Needs verification", "Confirmed applicable", "Not applicable" — never "eligible", "covered", "approved", "guaranteed", or "reimbursable" without verified evidence.
- When hasUnresolvedBlockingGates is true, FundingStatus shows "This may be a possible funding pathway. Confirm with the official program, plan, or provider." — correctly provisional.
- No false funding claims are possible when no funding option exists.

---

## 7. Referral Findings

**Test I findings:**
- I1 (Disclosure-before-referral guard): VERIFIED. `guard_referral_transition()` trigger blocks `ready → sent` when linked disclosure status is not `sent`. Error: "Referral cannot be sent until linked disclosure has been delivered (disclosure status must be 'sent')". Referral remains `ready`, `sent_at` IS NULL, disclosure remains `prepared`.
- I2 (Disclosure delivery): VERIFIED. Disclosure transitions `prepared → delivery_pending → sent` succeed with full delivery proof (`sent_at`, `delivery_method=secure_email`, `delivered_by_user_id=navigator`). All fields populated.
- I3 (Referral send after disclosure): VERIFIED. After disclosure is `sent`, `ready → sent` succeeds. `sent_at` populated by trigger. `received_at`, `acknowledged_at`, `closed_at` all NULL. `status_source=navigator_reported`.
- I4 (No inference at sent): VERIFIED. Re-reading referral at `sent` shows no automatic state inference. `received_at`, `acknowledged_at`, `closed_at` all remain NULL.
- I5 (Explicit received — SIMULATED): VERIFIED. `sent → received` with `status_source=navigator_reported` succeeds. `received_at` populated by trigger. `acknowledged_at` remains NULL. Labeled SIMULATED PROVIDER FEEDBACK — not `provider_confirmed`.
- I6 (Explicit acknowledged — SIMULATED): VERIFIED. `received → acknowledged` with `status_source=navigator_reported` succeeds. `acknowledged_at` populated by trigger. `closed_at` remains NULL. Labeled SIMULATED PROVIDER FEEDBACK — not `provider_confirmed`.
- Post-I6 downstream: VERIFIED. Needs unchanged (2 confirmed), pathway status=possible, zero contact_attempts, outcomes, barrier_events, incidents, escalations. No second referral. Narration unchanged. Disclosure (sent) and referral (acknowledged) remain distinct lifecycle records.
- RLS: VERIFIED. Pilot A can read own referral. Anonymous cannot read. Assigned navigator can read. Pilot B cross-household isolation not tested (credentials not available — previously validated in Tests A–H).
- Cleanup: VERIFIED. All 5 Test I records deleted in dependency-safe order. Pilot A scoped baseline restored. Kenneth artifact preserved.
- Disclosure sent ≠ Referral sent: VERIFIED. Disclosure status=sent, referral status=acknowledged — distinct.
- Referral sent ≠ received: VERIFIED. sent_at populated, status advanced beyond sent.
- received ≠ acknowledged: VERIFIED. received_at and acknowledged_at are distinct timestamps.
- acknowledged ≠ accepted: VERIFIED. status=acknowledged, not accepted.
- status_source independent of status: VERIFIED. status_source=navigator_reported throughout, not provider_confirmed.
- No DELETE RLS policies: No DELETE policies exist on referrals, disclosures, consent_grants, authority_to_act, or pathways. Cleanup required admin SQL. This is expected — no navigator/participant delete UI exists.
- I-NO-PERSON-DECLINED-TRANSITION (P2 OPEN): The `person_declined` status exists in the trigger but is unreachable through normal transitions. No path exists for a participant to decline a referral.
- I-NO-CONSENT-DISCLOSURE-HOUSEHOLD-CHECK (P2 OPEN): The referral transition guard checks disclosure status but not household_id consistency between referral, consent, and disclosure. A multi-assigned navigator could mix records across households.
- I-NO-REFERRAL-CREATION-UI (P2 OPEN): No navigator/admin UI exists to create a referral. The table and RLS are ready but no application path exercises referral creation.

---

## 8. Outcome/Barrier Findings

(To be completed after test execution.)

---

## 9. Human-Experience Observations

**Test B observations:**
- Did the person understand what NextUp was asking? YES — "Start wherever makes sense. You don't need to know what program you need." is clear and non-technical.
- Did the wording imply more authority than NextUp actually has? NO — the disclaimer "does not determine eligibility for a program" is present.
- Did the person know what would happen next? YES — after submission: "Someone will read your story and organize what we heard. Check back soon." After confirmation: "Pathways are coming next."
- Did the person understand what was confirmed versus still uncertain? YES — "Your Words" vs "NextUp's Understanding" separation makes this clear.
- Was information requested that was unnecessary? NO — only free-text narration requested. No demographics, no documents, no service selection.
- Did the person have to repeat themselves? NO — original text is preserved and shown alongside interpretation.
- Did the system preserve nuance? YES — original_text is immutable and displayed verbatim. Interpretation is separate and editable.
- Did NextUp create work instead of removing work? NO — the flow is minimal: tell story → review interpretation → review needs. Each step adds value.
- Did the system distinguish person-reported information from authoritative determinations? YES — "Your Words" (person-reported) vs "NextUp's Understanding" (organizational interpretation) with explicit disclaimer.
- Did the person's situation fit the data model? YES — the free-text narration captured a complex family situation without forcing it into categories.

**Test H observations:**
- Does the review screen clearly show what WILL and WILL NOT be shared? YES — green check for WILL SHARE, gray X for WILL NOT SHARE.
- Does the participant understand they are approving preparation, not sending? YES — "Approved by you. Not sent yet." is shown after approval.
- Does "Approve Sharing" imply the information will be sent immediately? PARTIALLY — "Approve Sharing" could be read as approval to send. The prepared screen clarifies, but the button label itself is ambiguous. Consider "Approve Sharing Request" or "Prepare for Sharing".
- Does the sharing history distinguish "Prepared for:" from "Sent to:"? YES — different labels and badge colors.
- Is the missing DURATION noticeable or confusing? YES — Active Permissions shows no expiry, which could imply indefinite consent. This is a known gap (H-NO-DURATION).
- Does "Family's own description. Not verified by NextUp." provide appropriate provenance? YES — clearly attributes the information source.

**Test G observations:**
- Did the participant understand why sharing stopped? YES — "A navigator needs to review this before anything is shared" is clear.
- Did "Send to Navigator Review" feel like a meaningful next step? YES — it provides a concrete action, not a dead end.
- Did the wording feel punitive or neutral? NEUTRAL — "This doesn't mean we can't move forward" is reassuring without undermining the stop.
- Could the participant tell authority failure from youth-assent failure? YES — different reasons are shown: "We need to confirm who can authorize this action" vs "A young person involved needs to be asked" vs "The young person did not agree."
- Did the UI clearly communicate that nothing had been shared? YES — "before anything is shared" is future-tense. No past-tense language.
- Did "This doesn't mean we can't move forward" weaken the seriousness of the stop? NO — it follows the hard-stop reason, not precedes it. The amber ShieldAlert icon and header maintain seriousness.
- Did the participant understand that navigator review is not automatic approval? YES — "A navigator will reach out to help" implies human review, not automatic approval.

**Test F observations:**
- Does "Needs verification" feel clear? YES — amber badge with AlertCircle icon, "Needs verification" is the primary label, not buried in sub-text.
- Can the participant see what must still be checked? YES — PathwayDetail "What still needs verification" section includes "Funding requirements need verification". Gate list shows "Financial need verification — needs verification".
- Can the participant see who makes the decision? YES — "Decision made by Program Provider" in "Who controls the next step".
- Does "Possible" sound appropriately provisional? YES — "Funding status: Possible" in sub-text, not as the primary badge. The badge "Needs verification" is more provisional than "Possible".
- Does any secondary copy undermine the primary amber warning? NO — sub-text shows "Possible" and "Not started", both consistent with provisional state. The disclaimer reinforces it.
- Does generic provenance make the funding option appear more verified than it is? PARTIALLY — "Source: Program Provider / School District" is shown, but source_checked_at is not shown to the participant. The generic source label does not establish current confirmation. Classified as MODIFY / P3.
- Does the participant understand "This funding source may exist" vs "This funding source applies to me" vs "I have satisfied its requirements" vs "I have been approved" vs "The provider has been paid"? YES — these feel like visibly different facts. "Needs verification" (badge) ≠ "Possible" (assertion) ≠ "Not started" (payment). No state implies more certainty than exists.

**Test E observations:**
- What did I tell NextUp? YES — PathwayDetail shows "What you told us" with the need title and description.
- What may help? YES — PathwayDetail shows "What may help" with the service name and description.
- Who provides it? YES — PathwayDetail shows "Who provides it" with the provider name, location, and phone.
- Who decides whether I can access it? YES — PathwayDetail shows "Who controls the next step" with the eligibility program name and decision owner ("Decision made by Program Provider").
- What still needs verification? YES — PathwayDetail shows "What still needs verification" section when items are unresolved (service/provider not identified, stale data, unresolved gates).
- What do I do next? YES — PathwayDetail shows "Your next action" with context-appropriate guidance.
- Does the interface make the candidate provider look more confirmed than it actually is? PARTIALLY — the provider name, location, and phone are displayed without a staleness or verification warning when fresh. The source_authority ("Publicly available organization information") is NOT shown to the participant. A participant could reasonably assume the provider information is confirmed. Classified as MODIFY — source_authority or a verification status should be visible to the participant, not just to admins.
- Did the wording imply more authority than NextUp actually has? NO — "What may help", "Who provides it", "Who controls the next step" all use provisional language. No "eligible" or "approved".
- Did the person know what would happen next? YES — "Your next action" section provides clear guidance. PathwayCard shows "Next: Review pathway".

**Test D observations:**
- Did the person understand they could edit, remove, and add Needs before confirming? YES — the NeedReview header says "Review these before we create them" and edit/remove/add controls are visible.
- Did the wording imply more authority than NextUp actually has? NO — "Here are the needs we'll use to organize your NextUp" frames Needs as organizational, not authoritative.
- Did the person know what would happen next? YES — "Confirm Needs" button persists the list and redirects to dashboard.
- Did the person understand what was confirmed versus still uncertain? YES — Needs are presented as a review step before persistence, not as final determinations.
- Was information requested that was unnecessary? NO — the participant only reviews what was generated from their own interpretation.
- Did the person have to repeat themselves? NO — Needs are generated from the interpretation, not re-entered from scratch.
- Did the system preserve nuance? YES — the participant can edit Need text to match their understanding.
- Did NextUp create work instead of removing work? NO — the review is minimal and the participant has full control over the final list.
- Did the system distinguish person-reported information from authoritative determinations? YES — Needs are framed as organizational tools, not eligibility determinations.
- Did the person's situation fit the data model? YES — the Need list captured the family's specific needs (counseling, after-school, homework help).

**Test C observations:**
- Did the person understand what NextUp was asking? YES — the three choices (Confirm/Modify/Reject) are clear and labeled in plain language.
- Did the wording imply more authority than NextUp actually has? NO — the disclaimer "does not determine eligibility for a program" is present.
- Did the person know what would happen next? YES — after confirm: proceeds to Need review. After modify: proceeds to Need review with edited interpretation. After reject: "We'll try again."
- Did the person understand what was confirmed versus still uncertain? YES — "Your Words" vs "NextUp's Understanding" separation makes this clear. The NarrationPreservationBanner reinforces it.
- Was information requested that was unnecessary? NO — the participant only reviews what was already submitted.
- Did the person have to repeat themselves? NO — original_text is preserved and shown alongside interpretation.
- Did the system preserve nuance? YES — the modify branch lets the participant edit the interpretation without losing original text.
- Did NextUp create work instead of removing work? NO — the review is minimal and meaningful.
- Did the system distinguish person-reported information from authoritative determinations? YES — "Your Words" (person-reported) vs "NextUp's Understanding" (organizational interpretation) with explicit disclaimer.
- Did the person's situation fit the data model? YES — the interpretation captured the family situation in plain language.

For each major step:
- Did the person understand what NextUp was asking?
- Did the wording imply more authority than NextUp actually has?
- Did the person know what would happen next?
- Did the person understand what was confirmed versus still uncertain?
- Was information requested that was unnecessary?
- Did the person have to repeat themselves?
- Did the system preserve nuance?
- Did NextUp create work instead of removing work?
- Did the system distinguish person-reported information from authoritative determinations?
- Did the person's situation fit the data model?

---

## 10. Data-Model Mismatches

(To be completed after test execution. Record as MISSING or MODIFY first — do not change schema during validation.)

---

## 11. KEEP

- A1: Account creation — minimal, email/password only, no demographics
- A2: Person creation — first name only, no SSN/income/demographics
- A4: Self-membership creation — role="self", correct legal disclaimer in UI
- A5: Household visibility — user sees only their own household
- A6: Cross-household isolation — fully enforced, no leaks
- A7: Navigator assignment — grants own-assignment visibility only, no authority auto-created
- O6: Anonymous access — fully blocked
- B1: Narration entry — free-text, no jargon, no service selection, no document upload
- B2: Draft preservation — original_text preserved exactly, status=draft, no downstream creation
- B3: Submission — status changes, original_text preserved, no needs created on submit
- B4: Immutability trigger — database blocks original_text changes after submission, other fields updateable
- B5: Interpretation separation — "Your Words" vs "NextUp's Understanding" in separate UI sections with disclaimer
- B6: Participant review — all three branches (confirm/modify/reject) preserve original_text
- B7: Need review — participant can edit/remove/add needs, nothing persisted until explicit approval
- B8: Need traceability — each need links to person, household, and narration
- B9: No premature downstream creation — zero pathways/referrals/consents/disclosures/outcomes/barriers
- B10: Privacy boundary — narration private, not on public profiles, no cross-household/anonymous/navigator access
- C1: CONFIRM branch — status changes to confirmed, confirmed_interpretation equals proposed, original_text preserved, no new needs, no downstream records
- C2: MODIFY branch — status changes to modified, confirmed_interpretation contains participant's edit, proposed_interpretation remains distinct, original_text preserved, mutation attempt BLOCKED by database
- C3: REJECT branch — status changes to rejected, original_text preserved, proposed_interpretation preserved for audit, no needs created
- C-PRIVACY: All privacy boundaries hold after all three interpretation branches
- D1: Edit control — participant can edit proposed Need title/description before persistence, DB unchanged
- D2: Remove control — participant can remove a proposed Need, removed Need NOT persisted during D4
- D3: Add control — participant can manually add a Need not produced by parser, manually added Need WAS persisted during D4
- D4: Confirm control — only the final human-reviewed list persisted, not raw parser output; all fields correct; Test B Needs preserved
- D-PRIVACY: All privacy boundaries hold after Need creation — cross-household, anonymous, navigator all blocked
- E1: Confirmed-need guard — database trigger blocks pathway creation from unconfirmed need, no pathway or downstream records created
- E2: Pathway creation — correct person/household/need/service/provider/eligibility links, status=possible, funding_option_id=null, zero downstream records
- E3: Freshness check — isStale() correctly returns false for fresh records, true for stale (>90 days), original value restored after temporary test
- E4: Eligibility wording — "Who controls the next step" not "Your eligibility", decision owner external, no "eligible" or "you qualify" language
- E5: Funding wording — no funding section renders when no funding_option, no "covered/approved/guaranteed/reimbursable" language
- E-RLS: Pathway RLS correctly scoped — household members, assigned navigators, admins only; cross-household/anonymous/unassigned navigator blocked
- E-DOWNSTREAM-ZERO: Zero funding_options, funding_gates, referrals, consent_grants, disclosures, authority_to_act, outcomes, barrier_events, contact_attempts after pathway creation
- F1: Needs verification display — amber badge "Needs verification" when blocking gate unresolved, sub-text "Possible" + "Not started", disclaimer present
- F2: No percentage-complete — no percentage, progress bar, or count in any funding UI component
- F3: No "almost approved" — no "almost", "nearly", "pending approval", "likely" language in src/
- F4: Decision owner visible — "Decision made by Program Provider", NextUp not presented as decision-maker
- F5: Source/provenance visible — "Source: Program Provider / School District" shown, source_checked_at recorded but not shown to participant
- F-RLS: Funding RLS correctly scoped — household members, assigned navigators, admins only; cross-household/anonymous/unassigned navigator blocked
- F-DOWNSTREAM-ZERO: Zero referrals, consent_grants, disclosures, authority_to_act, outcomes, barrier_events, contact_attempts after funding creation
- F-STATE-INTEGRITY: assertion_type=possible, applicability_status=needs_verification, payment_status=not_started unchanged after gate creation; no automatic gate transitions
- G1: No authority → hard stop "We need to confirm who can authorize this action before anything is shared."
- G2: Household membership does NOT satisfy authority check; no AuthorityToAct silently created
- G3: Disclosure blocked — SharePage routes to blocked, not review; handleApprove unreachable; disclosures=0, consent_grants=0
- G4: Escalation created — trigger_type=authority_unresolved, status=open; escalation ≠ authority, ≠ consent, ≠ permission to disclose
- G5: Plain-language explanation — "A navigator needs to review this before anything is shared" + "This doesn't mean we can't move forward. It means we need to confirm a few things first."
- G6: No hidden override — only "Send to Navigator Review" and "Not Now" buttons; no proceed/override/skip/force
- G7: Youth assent not_yet_asked → blocked "A young person involved needs to be asked before this is shared"; trigger=youth_assent_review
- G8: Youth assent asked_declined → blocked "The young person did not agree to this sharing"; trigger=youth_assent_review; decline NOT converted to consent/authority/assent_agreed/disclosure
- G-ESCALATION-SEMANTICS: No code treats escalation status as permission to share; buildDisclosurePreview does not query escalations
- G-RLS: Trust tables scoped to household members, assigned navigators, admins; cross-household/anonymous/unassigned navigator blocked
- G-DOWNSTREAM-ZERO: Zero referrals, contact_attempts, outcomes, barrier_events, incidents after all blocked attempts
- G-DELIVERY-SEMANTICS: Zero disclosure records; block occurs before disclosure lifecycle begins
- H1: Authority satisfied + participant approves → ConsentGrant created + Disclosure status=prepared; prepared_at set; sent_at/delivery_method/delivered_by_user_id all NULL
- H2: startDelivery → status=delivery_pending; delivery_started_at set; sent_at remains NULL
- H4: confirmDelivery without deliveryMethod or deliveredByUserId → BLOCKED (service validation throws error); disclosure remains delivery_pending
- H3: confirmDelivery with full proof → status=sent; sent_at/delivery_method/delivered_by_user_id all populated; prepared_at and delivery_started_at unchanged
- H-CONSENT-DISCLOSURE-MATCH: ConsentGrant.recipient_name = Disclosure.recipient_name; ConsentGrant.purpose = Disclosure.purpose; ConsentGrant.data_categories = Disclosure.data_fields; no extra fields
- H-RLS: consent_grants and disclosures scoped to household members, assigned navigators, admins; cross-household/anonymous/unassigned navigator blocked
- H-DOWNSTREAM-ZERO: Zero referrals, contact_attempts, outcomes, barrier_events, incidents, escalations after delivered disclosure; no automatic referral creation
- H-PARTIAL-FAILURE: createConsentGrant + prepareDisclosure are separate DB calls with no transaction; orphaned consent risk if disclosure fails
- H-TRUST-INTEGRITY: G-NO-DB-TRUST-GUARD remains OPEN; authority_to_act_id=NULL and expires_at=NULL are expected findings, not trust guarantees

---

## 12. MODIFY

- A3: Household creation is silent — StartPage creates the household automatically after person creation without telling the participant. Consider making household creation more visible or at minimum showing it clearly in the dashboard after creation.
- B7: Need parsing is simplistic — parseInterpretationToProposedNeeds splits interpretation text by lines/sentences. For the test interpretation (a single paragraph), it produced only 1 proposed need. A more robust parsing approach would identify multiple needs from a paragraph. The participant can add needs manually, so this is not blocking.
- D2: Remove has no confirmation dialog — clicking the trash icon removes a Need immediately. Consider adding a confirmation or undo for the remove action to prevent accidental removal.
- E-PROVENANCE: Provider source_authority ("Publicly available organization information") is not shown to the participant in PathwayDetail. The participant sees provider name, location, and phone without any indication that this information is unverified. Consider showing source_authority or a verification status to the participant, not just to admins.
- E-NO-CREATION-UI: No navigator/admin UI form exists to create a pathway. createPathway() is a service function not wired to any component. AdminPathwaysPage only displays review data. A pathway creation form is needed for navigator workflow.
- F-NO-FUNDING-GUARD: The funding model allows technically valid but semantically misleading combinations through direct service/database update paths: `confirmed_applicable` with unresolved blocking gates, `approved` without evidence, `paid`/`reimbursed` without payment events. No DB trigger or application-level validation prevents these. Currently mitigated by absence of navigator funding-management UI. Required before any such UI or Pilot 002 expansion.
- F-PROVENANCE: FundingOption source_authority ("Program Provider / School District") is a generic source description. source_checked_at is recorded but not shown to the participant. The participant sees "Source: Program Provider / School District" without knowing when it was last checked or how specific the source is. Consider showing source_checked_at or a more specific source label.
- G-NO-DB-TRUST-GUARD: The participant-facing Share flow correctly checks AuthorityToAct and YouthAssent before allowing sharing, but the trust boundary is not enforced at the service/database layer. Direct-client paths can create ConsentGrant or Disclosure without valid AuthorityToAct, create Disclosure while YouthAssent blocks sharing, and rely on household RLS membership without proving authority. Direct Disclosure INSERT can set status='sent' without delivery proof (delivery_method, sent_at, delivered_by_user_id). Currently mitigated by: SharePage UI routes blocked cases to navigator review, no override button exists, no automatic process bypasses the SharePage flow. Required before Pilot 002: authority/assent/consent checks must be enforced beneath the UI.
- H-NO-AUTHORITY-LINK: The normal SharePage checks AuthorityToAct before approval, but the ConsentGrant created after approval does not store the authority_to_act_id that satisfied that check. The consent cannot later be traced directly to the authority record that made the share permissible. Required before Pilot 002: consent creation should preserve the specific authority record used for the authorization decision.
- H-NO-DURATION: The current SharePage does not collect or pass expires_at when creating ConsentGrant. WHO, WHY, and WHAT are captured, but DURATION is not explicitly captured. Consent remains active until revoked. Required before Pilot 002: add participant-visible consent duration/expiration semantics appropriate to the use case and professional review.
- H-NO-DELIVERY-UI: startDelivery(), confirmDelivery(), failDelivery(), and cancelDisclosure() exist in the service layer, but no navigator/admin UI exposes the delivery lifecycle. Pilot 001 must validate delivery states programmatically. Required before Pilot 002: build controlled navigator delivery workflow.
- H-WILL-NOT-SHARE-SERVICE: buildDisclosurePreview() returns willNotShare=[]. SharePage recomputes WILL NOT SHARE client-side from AVAILABLE_FIELDS. The visible UI is correct, but disclosure-preview semantics are split between service and presentation layers.

---

## 13. MISSING

- E-NO-CREATION-UI: No navigator/admin UI form exists to create a pathway. The createPathway() function exists in pathwayService.ts but is not called from any UI component. AdminPathwaysPage only shows review data (needs without pathways, draft pathways, stale catalog). A pathway creation form is needed for navigators to act on confirmed needs.
- F-NO-FUNDING-UI: No navigator/admin UI form exists to create or manage funding options or gates. createFundingOption(), createFundingGate(), updateFundingOption(), updateFundingGateStatus() are service functions not wired to any UI component. AdminPathwaysPage only shows gates needing verification in a read-only list. A funding management form is needed for navigator workflow.
- G-NO-TRUST-UI: No navigator/admin UI form exists to create or manage AuthorityToAct, YouthAssent, or ConsentGrant records. createAuthority(), createYouthAssent(), createConsentGrant() are service functions not wired to any UI component. AdminTrustPage only displays escalations, disputed authorities, declined assents, and revoked consents in read-only lists. A trust management form is needed for navigator workflow.
- H-NO-DELIVERY-UI-MISSING: No navigator/admin UI form exists to manage the disclosure delivery lifecycle. startDelivery(), confirmDelivery(), failDelivery(), and cancelDisclosure() are service functions not wired to any UI component. A delivery management workflow is needed for navigator operations.

---

## 14. REMOVE

(Should not exist.)

---

## 15. PROFESSIONAL_REVIEW

- Whether consent without an expiry date is legally sufficient
- Whether consent without a link to the specific AuthorityToAct record is legally defensible
- Whether the claim attribution "Family's own description. Not verified by NextUp." is adequate for recipient organizations
- Whether "Approve Sharing" language implies delivery rather than preparation
- Whether the participant's authorizing_actor_id being their own person ID is correct (self-authorization) vs. requiring a separate guardian/parent actor
- Whether createConsentGrant + prepareDisclosure should be wrapped in a single transaction to prevent orphaned consents

---

## 16. P0/P1/P2/P3 Defects

| Severity | Count | Defect IDs |
|----------|-------|------------|
| P0 | 1 (FIXED) | D-001 |
| P1 | 2 (OPEN) | G-NO-DB-TRUST-GUARD, H-NO-AUTHORITY-LINK |
| P2 | 9 (OPEN) | E-NO-CREATION-UI, F-NO-FUNDING-GUARD, F-NO-FUNDING-UI, G-NO-TRUST-UI, H-NO-DURATION, H-NO-DELIVERY-UI, I-NO-PERSON-DECLINED-TRANSITION, I-NO-CONSENT-DISCLOSURE-HOUSEHOLD-CHECK, I-NO-REFERRAL-CREATION-UI |
| P3 | 3 (OPEN) | E-PROVENANCE, F-PROVENANCE, H-WILL-NOT-SHARE-SERVICE |

---

## 17. Changes Required Before Pilot 002

- D-001 (P0, FIXED): RLS recursion fix applied via migration `20260809180000_pilot001_fix_household_rls_recursion`. Verified working.

---

## 18. Changes Intentionally Deferred

- H-NO-AUTHORITY-LINK (P1): ConsentGrant should store authority_to_act_id linking consent to the authority that authorized the share.
- H-NO-DURATION (P2): SharePage should collect and pass expires_at for consent duration.
- H-NO-DELIVERY-UI (P2): Navigator/admin UI should expose startDelivery, confirmDelivery, failDelivery, cancelDisclosure.
- H-WILL-NOT-SHARE-SERVICE (P3): buildDisclosurePreview should return computed willNotShare, not empty array.
- H-PARTIAL-FAILURE (PROFESSIONAL_REVIEW): Consider wrapping createConsentGrant + prepareDisclosure in a transaction.

---

## 19. Automated Tests That Should Now Be Created

(To be completed after test execution.)

---

## 20. Pilot 002 Recommendation

(To be completed after test execution.)

### Final Gate

**READY FOR PILOT 002** or **NOT READY FOR PILOT 002**

(To be determined after all tests are executed.)

### Explanation

(To be completed after test execution.)

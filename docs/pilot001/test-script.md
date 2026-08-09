# Pilot 001 — Test Script

**Date:** 2026-08-09
**Status:** NOT STARTED

This document defines Tests A through O from the approved Pilot 001 validation protocol. Each test is executed against the live system. Results are recorded in `observation-log.md`. Defects are recorded in `defects.md`.

---

## TEST A — PERSON + HOUSEHOLD

Create the controlled Pilot 001 Person/Household through the actual application.

| ID | Test | Expected |
|----|------|----------|
| A1 | Person account creation/sign-in | Account created, session active |
| A2 | Person record creation | Person row linked to auth user |
| A3 | Household creation | Household row created |
| A4 | Household membership | Person added to household via household_memberships |
| A5 | Correct household visibility | Person sees only their own household |
| A6 | Unauthorized household isolation | Person cannot see other households |
| A7 | Navigator assignment behavior | Navigator assigned to household; assignment does NOT automatically equal authority to disclose |

**Verify:** Household membership does NOT automatically equal authority to disclose information.

---

## TEST B — NARRATION

Use a realistic narration. Do not optimize for the database. Test whether the system handles natural human language.

| ID | Test | Expected |
|----|------|----------|
| B1 | Save narration as draft | Draft saved, status='draft' |
| B2 | Edit original_text while draft | original_text editable while status='draft' |
| B3 | Submit narration | status='submitted', original_text frozen |
| B4 | Attempt to modify original_text after submission | Database rejects modification |
| B5 | Confirm database rejects unauthorized overwrite | Trigger blocks UPDATE of original_text |
| B6 | Verify original words remain exactly preserved | original_text matches what was entered in B1/B2 |

**Record:** The exact original narration separately in the observation log for comparison.

**PASS condition:** NextUp preserves what the person actually said.

---

## TEST C — INTERPRETATION

Reviewer proposes "Here's what we heard." Test all three interpretation branches.

| ID | Test | Expected |
|----|------|----------|
| C1 | CONFIRM — person accepts accurate interpretation | Interpretation accepted, proceeds to Need review |
| C2 | MODIFY — person changes something in interpretation | Interpretation modified WITHOUT modifying original narration |
| C3 | REJECT — person rejects inaccurate interpretation | Rejection creates NO Needs |

**Confirm:** Person's words ≠ NextUp interpretation. The system preserves that distinction.

---

## TEST D — STRUCTURED NEED REVIEW

Generate proposed Needs from an accepted/modified interpretation.

| ID | Test | Expected |
|----|------|----------|
| D1 | Edit one proposed Need | Need text updated before persistence |
| D2 | Remove one proposed Need | Need removed from proposed list |
| D3 | Add one Need manually | New Need added to list |
| D4 | Confirm final Need list | Final list reflects explicit human review |

**PASS condition:** No Need is persisted merely because a parser generated it. The final structured Need list reflects an explicit human review.

---

## TEST E — PATHWAY

Select one confirmed Need. Create a real Pilot 001 pathway.

| ID | Test | Expected |
|----|------|----------|
| E1 | Attempt pathway from unconfirmed Need | BLOCKED |
| E2 | Create pathway from confirmed Need | SUCCESS |
| E3 | Check provider/service freshness | Stale data shows "Needs re-check" |
| E4 | Check eligibility wording | No "eligible" unless authority confirmed |
| E5 | Check funding wording | No "covered/approved/guaranteed" unless verified |

**Verify the person-facing experience answers:**
- What did I tell NextUp?
- What may help?
- Who controls the next decision?
- What might I need?
- What might it cost?
- Who might pay?
- What still needs verification?
- What is my next action?

**The interface must NOT convert:**
- possible → eligible
- possible → covered
- possible → reimbursable
- possible → guaranteed
- possible → approved

unless authoritative evidence actually supports that state.

---

## TEST F — FUNDING GATES

Create or use a funding option with at least one unresolved blocking gate.

| ID | Test | Expected |
|----|------|----------|
| F1 | Funding remains "Needs verification" | Unresolved blocking gate shows "Needs verification" |
| F2 | No percentage-complete score appears | No "4 of 5", no progress bar |
| F3 | No "almost approved" language appears | No "almost", "nearly", "pending approval" language |
| F4 | Decision owner is visible | Person can see who controls the decision |
| F5 | Source/provenance is visible where appropriate | Source authority shown |

**PASS condition:** NextUp describes the funding pathway without pretending to be the payer, insurer, agency, or eligibility authority.

---

## TEST G — TRUST HARD STOP

Intentionally create one unresolved authority scenario.

| ID | Test | Expected |
|----|------|----------|
| G1 | Attempt sharing | Sharing flow initiated |
| G2 | Authority check fails | Authority requirement not met |
| G3 | Disclosure is blocked | Disclosure cannot proceed |
| G4 | Escalation is created | Escalation row created for navigator review |
| G5 | Person receives plain-language explanation | UI shows why sharing is blocked in plain language |
| G6 | No hidden override sends the information | No data leaves the system |

**Where youth assent applies:**

| ID | Test | Expected |
|----|------|----------|
| G7 | not_yet_asked assent state | Produces appropriate stop/review behavior |
| G8 | asked_declined assent state | Produces appropriate stop/review behavior |

**PASS condition:** A hard stop produces a next action — not a dead end and not a silent override.

---

## TEST H — CONSENT + DISCLOSURE

After authority/assent requirements are satisfied, create scoped consent.

| ID | Test | Expected |
|----|------|----------|
| H1 | Person approves sharing | status='prepared', prepared_at populated, sent_at=NULL. UI says "Approved by you. Not sent yet." |
| H2 | Start delivery | status='delivery_pending', sent_at=NULL |
| H3 | Complete actual delivery | Requires delivery_method, delivered_by_user_id, sent_at. Only now may status='sent' |
| H4 | Attempt sent without delivery proof | DATABASE BLOCK |

**Verify:** WHO / WHY / WHAT / DURATION on consent. Disclosure preview shows WILL SHARE / WILL NOT SHARE.

---

## TEST I — REFERRAL

Connect the delivered disclosure to the referral.

| ID | Test | Expected |
|----|------|----------|
| I1 | Attempt referral sent before disclosure sent | BLOCKED |
| I2 | Mark disclosure actually delivered | Disclosure status='sent' |
| I3 | Send referral | Referral status='sent', sent_at populated |
| I4 | Leave referral at sent | System does NOT infer received |
| I5 | Explicitly record received | System does NOT infer acknowledged |
| I6 | Explicitly record acknowledged | Acknowledged_at populated |

**Record:** status_source every time (navigator_reported, provider_confirmed, person_reported, system_observed).

**PASS condition:** NextUp never manufactures a closed loop.

---

## TEST J — NO RESPONSE

Create a second controlled referral/contact scenario or use a safe test pathway.

| ID | Test | Expected |
|----|------|----------|
| J1 | Record contact attempt → no response | ContactAttempt created with result='no_response' |
| J2 | No-response not blamed on person | No blame language, locus defaults undetermined |
| J3 | Referral does not magically become failed | Referral status remains 'sent' or 'unable_to_contact' |
| J4 | Appropriate follow-up is generated | Follow-up action or next action visible |
| J5 | ContactAttempt remains distinct from Referral status | Contact attempt does not auto-change referral status |

---

## TEST K — WHAT HAPPENED?

Use the person-facing outcome experience. Test several combinations.

| ID | Test | Expected |
|----|------|----------|
| K1 | Referral completed, person reports service NOT received | Valid outcome. Need does NOT become met. |
| K2 | Service received, person reports NOT helpful | Valid outcome. Need does NOT automatically become met. |
| K3 | Person chooses "Not yet" | Not treated as failure. Pathway remains open/waiting. |
| K4 | Person chooses "Chose differently" | Not treated as failure. No automatic BarrierEvent. |

---

## TEST L — BARRIER

Record a real or controlled barrier. Ask "What got in the way?" — not "Who failed?"

| ID | Test | Expected |
|----|------|----------|
| L1 | Transportation barrier | BarrierEvent with barrier_type='transportation', access_stage appropriate, locus not auto-assigned |
| L2 | Communication/no-response barrier | BarrierEvent with barrier_type='communication_failure', locus defaults undetermined |
| L3 | External decision barrier | BarrierEvent with remediability='requires_external_decision' |
| L4 | NextUp-caused barrier (stale provider info) | BarrierEvent with locus='nextup'. Admin review suggests Incident consideration without auto-creating one. |

**Leave locus: undetermined unless evidence supports another classification.**

---

## TEST M — NEXT ACTION

Verify NextUp produces an understandable next action after the outcome/barrier.

| ID | Test | Expected |
|----|------|----------|
| M1 | Next action after "not yet" outcome | "Wait for response" or similar |
| M2 | Next action after "chose differently" outcome | "Review another pathway" or similar |
| M3 | Next action after "service not received" | "Ask navigator to review" or similar |
| M4 | Next action after "service received, not helpful" | "Ask navigator to review other options" or similar |
| M5 | No automatic referral creation | NextUp does NOT automatically create a new referral merely because a next action exists |

---

## TEST N — PRIVACY HISTORY

Have the person review their privacy/sharing history.

| ID | Test | Expected |
|----|------|----------|
| N1 | Person can see who they allowed information to be shared with | Recipient visible |
| N2 | Person can see why | Purpose visible |
| N3 | Person can see what was shared | Scope visible |
| N4 | Person can see what was NOT shared | Exclusions visible |
| N5 | Person can see if it was only prepared or actually sent | Status visible and understandable |
| N6 | Person can see when it was delivered | sent_at visible |
| N7 | Person can see who recorded delivery | delivered_by visible |
| N8 | Person can see what permissions remain active | Active/expired/revoked visible |

**PASS condition:** A reasonable person can understand their information history without needing a navigator to decode it.

---

## TEST O — ISOLATION ATTACK

Perform controlled negative security tests.

| ID | Test | Expected |
|----|------|----------|
| O1 | Household A attempts Household B narration access | BLOCKED |
| O2 | Household A attempts Household B pathway access | BLOCKED |
| O3 | Household A attempts Household B referral access | BLOCKED |
| O4 | Household A attempts Household B outcome access | BLOCKED |
| O5 | Unassigned navigator attempts household access | BLOCKED |
| O6 | Anonymous user attempts private Pilot data access | BLOCKED |

**Expected for every test:** BLOCKED. Any failure here is a PILOT-STOPPING defect.

---

## Finding Classifications

| Classification | Meaning |
|---------------|---------|
| KEEP | Working correctly, preserve as-is |
| MODIFY | Works but needs adjustment |
| MISSING | Expected functionality not present |
| REMOVE | Should not exist |
| DEFECT | Not working as designed |
| SECURITY | Security vulnerability |
| PRIVACY | Privacy concern |
| PROFESSIONAL_REVIEW | Requires domain expert review |

## Defect Severity

| Severity | Meaning |
|----------|---------|
| P0 | STOP PILOT — Privacy leak, cross-household access, unauthorized disclosure, narration corruption, fabricated external action |
| P1 | CRITICAL BEFORE PILOT 002 — Trust control failure, misleading authority/eligibility/funding representation, major workflow break |
| P2 | IMPORTANT — Significant confusion, unnecessary burden, missing workflow state |
| P3 | IMPROVEMENT — Copy, layout, convenience, minor friction |

P0 findings stop Pilot 001 immediately.

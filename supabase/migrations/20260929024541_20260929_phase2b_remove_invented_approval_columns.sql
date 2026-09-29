/*
# Remove invented participant approval columns from disclosures

Phase 2B introduced participant_approved and participant_approved_at as a
second, redundant approval semantic. The frozen S2 design defines
consent_grants.status='active' as the participant approval state.
These columns are not part of the frozen model and have zero rows.

Pre-removal audit: 0 total disclosures, 0 approved=true, 0 approved_at set.
*/

ALTER TABLE disclosures DROP COLUMN IF EXISTS participant_approved;
ALTER TABLE disclosures DROP COLUMN IF EXISTS participant_approved_at;

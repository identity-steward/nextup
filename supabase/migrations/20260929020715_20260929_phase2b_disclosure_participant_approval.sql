/*
# Add participant approval fields to disclosures table

1. Modified Tables
- `disclosures`
  - `participant_approved` (boolean, default false) — records whether the participant has reviewed and approved the disclosure before it is sent
  - `participant_approved_at` (timestamptz, nullable) — timestamp of participant approval

2. Security
- No new RLS policies needed. The existing household_select_disclosure and household_update_disclosure policies already allow household members to SELECT and UPDATE disclosures for their own household. Participant approval uses the existing household UPDATE policy — no access broadening.

3. Important Notes
- This is additive only — no existing columns are dropped or changed.
- Participant approval is a UI-level acknowledgment, not a trust gate. The existing Phase 1 integrity boundaries (authority hard stops, consent authority check, delivery proof CHECK) remain the authoritative enforcement layer.
- The disclosure can still be sent without participant approval in the current model — approval is recorded for participant visibility and history, not as a hard gate. This is consistent with the existing model where navigator creates consent as 'active' and the participant's role is review/acknowledgment.
*/

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'disclosures' AND column_name = 'participant_approved') THEN
    ALTER TABLE disclosures ADD COLUMN participant_approved boolean NOT NULL DEFAULT false;
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'disclosures' AND column_name = 'participant_approved_at') THEN
    ALTER TABLE disclosures ADD COLUMN participant_approved_at timestamptz;
  END IF;
END $$;

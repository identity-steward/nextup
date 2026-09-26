-- Phase 2B: Add source_type to journey_entries for provenance
-- Nullable, backward-compatible. No bulk mutation of existing entries.
-- Existing entries remain NULL (unknown source), not guessed.

ALTER TABLE public.journey_entries
  ADD COLUMN IF NOT EXISTS source_type text
  CHECK (source_type IN ('youth', 'family', 'navigator', 'partner', 'system', 'admin'));

/*
  # Phase 4 Integrity Hardening — Pathway-Confirmed-Need Guard

  ## Summary
  Phase 4 currently blocks Pathway creation from unconfirmed Needs
  in the TypeScript service layer only. This migration adds
  defense-in-depth at the database level using a BEFORE INSERT
  trigger that checks the Need's status.

  The trigger is simple and narrow:
  - Only fires on INSERT (not UPDATE — pathway status may change
    after the need's status changes, and we do not want to block
    legitimate pathway updates if a need later transitions away
    from confirmed).
  - Checks that the referenced need has status = 'confirmed'.
  - Raises an exception if not.

  This is not recursive: it reads from the needs table, does not
  modify any rows, and does not fire other triggers.

  ## Security
  - SECURITY DEFINER function (needs to read needs table across RLS).
  - EXECUTE revoked from anon/authenticated — trigger use only.
  - No RLS policies changed.
*/

CREATE OR REPLACE FUNCTION public.guard_pathway_confirmed_need()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  need_status text;
BEGIN
  SELECT status INTO need_status FROM public.needs WHERE id = NEW.need_id;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Referenced need does not exist'
      USING ERRCODE = 'foreign_key_violation';
  END IF;

  IF need_status IS NULL OR need_status NOT IN ('confirmed') THEN
    RAISE EXCEPTION 'Pathway can only be created from a confirmed need (current need status: %)', COALESCE(need_status, 'NULL')
      USING ERRCODE = 'check_violation';
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_pathway_confirmed_need ON public.pathways;
CREATE TRIGGER trg_pathway_confirmed_need
  BEFORE INSERT ON public.pathways
  FOR EACH ROW EXECUTE FUNCTION public.guard_pathway_confirmed_need();

REVOKE EXECUTE ON FUNCTION public.guard_pathway_confirmed_need() FROM anon, authenticated;

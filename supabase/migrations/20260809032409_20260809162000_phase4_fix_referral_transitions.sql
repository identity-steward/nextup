/*
  # Phase 4 Fix — Remove 'closed' from referral transitions

  The 'closed' status is not in the referral status CHECK constraint.
  The trigger referenced 'closed' as a valid transition target, which
  would never fire because the CHECK constraint blocks it first.
  This updates the trigger to match the actual allowed statuses.
*/

CREATE OR REPLACE FUNCTION public.guard_referral_transition()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  allowed boolean := false;
  disclosure_status text;
BEGIN
  IF NEW.status = OLD.status THEN
    RETURN NEW;
  END IF;

  allowed := CASE
    WHEN OLD.status = 'draft' AND NEW.status IN ('ready', 'cancelled', 'unknown') THEN true
    WHEN OLD.status = 'ready' AND NEW.status IN ('sent', 'cancelled', 'unknown') THEN true
    WHEN OLD.status = 'sent' AND NEW.status IN ('received', 'unable_to_contact', 'unknown', 'cancelled', 'expired') THEN true
    WHEN OLD.status = 'received' AND NEW.status IN ('acknowledged', 'screening', 'unknown', 'cancelled') THEN true
    WHEN OLD.status = 'acknowledged' AND NEW.status IN ('screening', 'unknown', 'cancelled') THEN true
    WHEN OLD.status = 'screening' AND NEW.status IN ('accepted', 'declined', 'unknown', 'cancelled') THEN true
    WHEN OLD.status = 'accepted' AND NEW.status IN ('intake_scheduled', 'service_initiated', 'unknown', 'cancelled') THEN true
    WHEN OLD.status = 'intake_scheduled' AND NEW.status IN ('service_initiated', 'cancelled', 'unknown') THEN true
    WHEN OLD.status = 'service_initiated' AND NEW.status IN ('completed', 'unknown', 'cancelled') THEN true
    WHEN OLD.status = 'unable_to_contact' AND NEW.status IN ('sent', 'cancelled', 'unknown') THEN true
    WHEN OLD.status = 'person_declined' AND NEW.status IN ('unknown') THEN true
    WHEN OLD.status = 'declined' AND NEW.status IN ('unknown') THEN true
    WHEN OLD.status = 'completed' AND NEW.status IN ('unknown') THEN true
    WHEN OLD.status = 'expired' AND NEW.status IN ('unknown') THEN true
    WHEN OLD.status = 'cancelled' AND NEW.status IN ('unknown') THEN true
    WHEN OLD.status = 'unknown' AND NEW.status IN ('draft', 'ready', 'sent', 'cancelled') THEN true
    ELSE false
  END;

  IF NOT allowed THEN
    RAISE EXCEPTION 'Invalid referral transition: % -> %', OLD.status, NEW.status
      USING ERRCODE = 'check_violation';
  END IF;

  IF NEW.status = 'sent' THEN
    IF NEW.disclosure_id IS NULL THEN
      RAISE EXCEPTION 'Referral cannot be sent without a linked disclosure'
        USING ERRCODE = 'check_violation';
    END IF;
    SELECT status INTO disclosure_status
      FROM public.disclosures
      WHERE id = NEW.disclosure_id;
    IF disclosure_status IS NULL OR disclosure_status <> 'sent' THEN
      RAISE EXCEPTION 'Referral cannot be sent until linked disclosure has been delivered (disclosure status must be ''sent'')'
        USING ERRCODE = 'check_violation';
    END IF;
    NEW.sent_at := now();
  END IF;

  IF NEW.status = 'received' AND NEW.received_at IS NULL THEN
    NEW.received_at := now();
  END IF;

  IF NEW.status = 'acknowledged' AND NEW.acknowledged_at IS NULL THEN
    NEW.acknowledged_at := now();
  END IF;

  IF NEW.status IN ('completed', 'cancelled', 'expired', 'person_declined', 'declined') AND NEW.closed_at IS NULL THEN
    NEW.closed_at := now();
  END IF;

  RETURN NEW;
END;
$$;

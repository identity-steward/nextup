/*
# Redesign notification trigger: log-only, no premature sent status

## Purpose
The previous trigger used pg_net to call the edge function from the database and
marked the notification as "sent" when pg_net queued the HTTP request — but
pg_net is async, so a queued request does NOT mean the email was sent.

This migration replaces the trigger function with a simpler version that:
1. Creates a "pending" log entry when a new submission is inserted
2. Does NOT call pg_net or any edge function
3. Does NOT mark anything as "sent"

The actual email sending is handled by the process-submission-notifications edge
function, which is called from the browser after the database insert succeeds.
The edge function reads the actual record from the database (never trusting
browser-supplied details), sends the email via Resend, and updates the
notification_log entry to "sent" or "failed" with the actual provider response.

## Changed
- public.notify_new_submission() function — simplified to log-only
- No other objects changed, no data modified
*/

CREATE OR REPLACE FUNCTION public.notify_new_submission()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO ''
AS $function$
DECLARE
  v_record_id uuid;
  v_source_table text;
  v_existing_count int;
BEGIN
  IF TG_TABLE_NAME = 'athlete_signups' THEN
    v_source_table := 'athlete_signups';
    v_record_id := NEW.id;
  ELSIF TG_TABLE_NAME = 'parent_intake' THEN
    v_source_table := 'parent_intake';
    v_record_id := NEW.id;
  ELSE
    RETURN NEW;
  END IF;

  -- Duplicate prevention: skip if an admin notification log already exists
  SELECT count(*) INTO v_existing_count
  FROM public.notification_log
  WHERE source_table = v_source_table
    AND source_record_id = v_record_id
    AND notification_type = 'admin_notification';

  IF v_existing_count > 0 THEN
    RETURN NEW;
  END IF;

  -- Insert a pending log entry only — the edge function updates it to sent/failed
  INSERT INTO public.notification_log (source_table, source_record_id, notification_type, status, attempt_count)
  VALUES (v_source_table, v_record_id, 'admin_notification', 'pending', 0);

  RETURN NEW;
END;
$function$;

-- Revoke direct EXECUTE from all roles
REVOKE EXECUTE ON FUNCTION public.notify_new_submission() FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.notify_new_submission() FROM anon;
REVOKE EXECUTE ON FUNCTION public.notify_new_submission() FROM authenticated;

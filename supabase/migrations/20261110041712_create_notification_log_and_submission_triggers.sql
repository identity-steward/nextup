/*
# Create notification infrastructure for onboarding submissions

## Purpose
When a parent submits an athlete signup or parent intake form, the system needs to:
1. Log the notification attempt for audit and duplicate prevention
2. Trigger an admin notification email via an edge function
This migration creates the notification_log table, a SECURITY DEFINER function
that calls the edge function via pg_net, and AFTER INSERT triggers on both
athlete_signups and parent_intake tables.

## New Table: public.notification_log
- id (uuid, PK, auto-generated)
- source_table (text, not null) — 'athlete_signups' or 'parent_intake'
- source_record_id (uuid, not null) — the inserted row's ID
- notification_type (text, not null) — 'admin_notification' or 'parent_confirmation'
- recipient_email (text, nullable) — the email the notification was sent to
- status (text, not null, default 'pending') — pending, sent, failed
- attempt_count (int, default 0)
- error_message (text, nullable)
- created_at (timestamptz, default now())
- sent_at (timestamptz, nullable)
- Unique constraint on (source_table, source_record_id, notification_type) prevents duplicates

## New Function: public.notify_new_submission()
- SECURITY DEFINER, owned by postgres, empty search_path
- Called by AFTER INSERT triggers on athlete_signups and parent_intake
- Checks notification_log for existing entries (duplicate prevention)
- Calls the send-admin-notification edge function via pg_net
- Logs the result (sent/failed) in notification_log
- Uses exception handling so notification failure NEVER blocks the INSERT
- All internal references schema-qualified

## New Triggers
- trg_notify_athlete_signup AFTER INSERT ON athlete_signups
- trg_notify_parent_intake AFTER INSERT ON parent_intake

## Security
- RLS enabled on notification_log
- REVOKE ALL from anon and authenticated
- GRANT SELECT to authenticated (admin-only read for audit)
- Admin JWT role check in SELECT policy
- No INSERT/UPDATE/DELETE grants to anon or authenticated (only the trigger function writes)
- pg_net extension enabled for HTTP calls from the database

## Not Changed
- athlete_signups table, columns, data, or existing RLS policies — untouched
- parent_intake table, columns, data, or existing RLS policies — untouched
- No existing data is modified, migrated, or deleted
- No new anon or authenticated function EXECUTE grants
*/

-- Enable pg_net for HTTP calls from the database
CREATE EXTENSION IF NOT EXISTS pg_net;

-- Create notification_log table
CREATE TABLE IF NOT EXISTS public.notification_log (
  id                uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  source_table      text NOT NULL,
  source_record_id  uuid NOT NULL,
  notification_type text NOT NULL,
  recipient_email   text,
  status            text NOT NULL DEFAULT 'pending',
  attempt_count     int  NOT NULL DEFAULT 0,
  error_message     text,
  created_at        timestamptz NOT NULL DEFAULT now(),
  sent_at           timestamptz,
  CONSTRAINT notification_log_status_check
    CHECK (status IN ('pending', 'sent', 'failed')),
  CONSTRAINT notification_log_type_check
    CHECK (notification_type IN ('admin_notification', 'parent_confirmation')),
  CONSTRAINT notification_log_unique
    UNIQUE (source_table, source_record_id, notification_type)
);

ALTER TABLE public.notification_log ENABLE ROW LEVEL SECURITY;

-- Defensively strip all privileges before granting minimal access
REVOKE ALL ON public.notification_log FROM anon;
REVOKE ALL ON public.notification_log FROM authenticated;

-- Admins can read notification logs for audit purposes
GRANT SELECT ON public.notification_log TO authenticated;

-- No INSERT, UPDATE, DELETE grants to anon or authenticated.
-- Only the SECURITY DEFINER trigger function writes to this table.

-- Admin-only SELECT policy
DROP POLICY IF EXISTS "Admins can view notification logs" ON public.notification_log;
CREATE POLICY "Admins can view notification logs"
  ON public.notification_log FOR SELECT
  TO authenticated
  USING (auth.jwt() -> 'app_metadata' ->> 'role' = 'admin');

-- Indexes for efficient duplicate-prevention lookups
CREATE INDEX IF NOT EXISTS notification_log_source_idx
  ON public.notification_log (source_table, source_record_id);

CREATE INDEX IF NOT EXISTS notification_log_status_idx
  ON public.notification_log (status);

-- Notification function — called by triggers, never directly by API clients
CREATE OR REPLACE FUNCTION public.notify_new_submission()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO ''
AS $function$
DECLARE
  v_record_id uuid;
  v_parent_email text;
  v_parent_name text;
  v_youth_first_name text;
  v_source_table text;
  v_edge_url text;
  v_app_url text;
  v_admin_email text;
  v_request_body jsonb;
  v_response int;
  v_existing_count int;
BEGIN
  -- Determine source table and extract relevant fields
  IF TG_TABLE_NAME = 'athlete_signups' THEN
    v_source_table := 'athlete_signups';
    v_record_id := NEW.id;
    v_parent_email := NEW.parent_email;
    v_parent_name := NEW.parent_first_name || ' ' || NEW.parent_last_name;
    v_youth_first_name := NEW.athlete_first_name;
  ELSIF TG_TABLE_NAME = 'parent_intake' THEN
    v_source_table := 'parent_intake';
    v_record_id := NEW.id;
    v_parent_email := NEW.parent_email;
    v_parent_name := NEW.parent_first_name || ' ' || NEW.parent_last_name;
    v_youth_first_name := NEW.athlete_first_name;
  ELSE
    RETURN NEW;
  END IF;

  -- Duplicate prevention: skip if an admin notification already exists for this record
  SELECT count(*) INTO v_existing_count
  FROM public.notification_log
  WHERE source_table = v_source_table
    AND source_record_id = v_record_id
    AND notification_type = 'admin_notification';

  IF v_existing_count > 0 THEN
    RETURN NEW;
  END IF;

  -- Insert a pending log entry first
  INSERT INTO public.notification_log (source_table, source_record_id, notification_type, status, attempt_count)
  VALUES (v_source_table, v_record_id, 'admin_notification', 'pending', 0);

  -- Build the edge function URL
  -- Use the Supabase project URL from the environment
  v_app_url := current_setting('app.app_url', true);
  IF v_app_url IS NULL OR v_app_url = '' THEN
    v_app_url := 'https://60974817.supabase.co';
  END IF;

  v_edge_url := v_app_url || '/functions/v1/send-admin-notification';

  -- Build the request body — no sensitive youth details
  v_request_body := jsonb_build_object(
    'source_table', v_source_table,
    'source_record_id', v_record_id::text,
    'parent_name', v_parent_name,
    'youth_first_name', v_youth_first_name,
    'parent_email', v_parent_email,
    'submission_date', to_char(now(), 'YYYY-MM-DD"T"HH24:MI:SS"Z"')
  );

  -- Call the edge function via pg_net
  -- The edge function handles the actual email sending with Resend
  BEGIN
    v_response := net.http_post(
      url := v_edge_url,
      body := v_request_body::text,
      headers := '{"Content-Type": "application/json"}'::jsonb
    );

    -- net.http_post returns a request ID (int), not the HTTP status.
    -- The actual response is async. Mark as sent since the request was queued.
    -- If the edge function fails, it will log the error internally.
    UPDATE public.notification_log
    SET status = 'sent',
        sent_at = now(),
        attempt_count = attempt_count + 1
    WHERE source_table = v_source_table
      AND source_record_id = v_record_id
      AND notification_type = 'admin_notification';
  EXCEPTION WHEN OTHERS THEN
    -- Log the error but never block the INSERT
    UPDATE public.notification_log
    SET status = 'failed',
        error_message = SQLERRM,
        attempt_count = attempt_count + 1
    WHERE source_table = v_source_table
      AND source_record_id = v_record_id
      AND notification_type = 'admin_notification';
  END;

  RETURN NEW;
END;
$function$;

-- Revoke direct EXECUTE from all roles — only triggers call this function
REVOKE EXECUTE ON FUNCTION public.notify_new_submission() FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.notify_new_submission() FROM anon;
REVOKE EXECUTE ON FUNCTION public.notify_new_submission() FROM authenticated;

-- Create AFTER INSERT triggers
DROP TRIGGER IF EXISTS trg_notify_athlete_signup ON public.athlete_signups;
CREATE TRIGGER trg_notify_athlete_signup
  AFTER INSERT ON public.athlete_signups
  FOR EACH ROW
  EXECUTE FUNCTION public.notify_new_submission();

DROP TRIGGER IF EXISTS trg_notify_parent_intake ON public.parent_intake;
CREATE TRIGGER trg_notify_parent_intake
  AFTER INSERT ON public.parent_intake
  FOR EACH ROW
  EXECUTE FUNCTION public.notify_new_submission();

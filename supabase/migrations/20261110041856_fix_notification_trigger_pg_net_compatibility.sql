/*
# Fix notification trigger function for pg_net compatibility

## Purpose
The initial migration used incorrect pg_net function signature and wrong Supabase URL.
This migration fixes the notify_new_submission() function to use:
- Correct pg_net signature: net.http_post(url text, body jsonb, params jsonb, headers jsonb, timeout_milliseconds int)
- The actual Supabase project URL from the environment
- Schema-qualified net.http_post call

## Changed
- public.notify_new_submission() function — replaced with corrected version
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
  v_parent_email text;
  v_parent_name text;
  v_youth_first_name text;
  v_source_table text;
  v_edge_url text;
  v_request_body jsonb;
  v_existing_count int;
  v_project_url text;
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

  -- Build the edge function URL using the actual Supabase project URL
  -- The project URL is available via the Supabase API host
  v_project_url := 'https://phetxmcqufdvozaydlbq.supabase.co';
  v_edge_url := v_project_url || '/functions/v1/send-admin-notification';

  -- Build the request body — no sensitive youth details
  v_request_body := jsonb_build_object(
    'source_table', v_source_table,
    'source_record_id', v_record_id::text,
    'parent_name', v_parent_name,
    'youth_first_name', v_youth_first_name,
    'parent_email', v_parent_email,
    'submission_date', to_char(now(), 'YYYY-MM-DD"T"HH24:MI:SS"Z"')
  );

  -- Call the edge function via pg_net (async, returns request ID)
  -- Signature: net.http_post(url text, body jsonb, params jsonb, headers jsonb, timeout_milliseconds int)
  BEGIN
    PERFORM net.http_post(
      url := v_edge_url,
      body := v_request_body,
      headers := jsonb_build_object(
        'Content-Type', 'application/json',
        'Authorization', 'Bearer ' || current_setting('app.service_role_key', true)
      ),
      timeout_milliseconds := 10000
    );

    -- net.http_post is async — it queues the request. Mark as sent.
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

-- Revoke direct EXECUTE from all roles
REVOKE EXECUTE ON FUNCTION public.notify_new_submission() FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.notify_new_submission() FROM anon;
REVOKE EXECUTE ON FUNCTION public.notify_new_submission() FROM authenticated;

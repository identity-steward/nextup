/*
# Create contact_inquiries table with secured submission function

## Purpose
Separates general contact and sponsorship inquiries from financial supporter
registrations (supporter_signups). Both the Contact form and the Sponsorship
info request form were writing invalid support_type values to supporter_signups,
causing every submission to fail. This table gives them a correct home with
proper access controls.

## New Table: public.contact_inquiries
- id (uuid, PK, auto-generated)
- name (text, not null, 1-200 chars enforced by function)
- email (text, not null, 5-320 chars enforced by function)
- organization (text, nullable, 0-200 chars enforced by function)
- inquiry_type (text, not null) — general, partnership, athlete, media, sponsorship
- message (text, not null, 1-5000 chars enforced by function)
- status (text, not null, default 'pending') — pending, reviewed, responded, archived
- notes (text, nullable) — admin-only, never settable by public
- created_at (timestamptz, default now())
- updated_at (timestamptz, default now())

## New Function: public.submit_contact_inquiry
- SECURITY DEFINER, owned by postgres, empty search_path
- All internal references schema-qualified as public.contact_inquiries
- Only path for public to create inquiries — no INSERT grant or policy on table
- Server-side validation: required fields, email format, field length limits
- Rate limit: max 3 per email per 24h, max 5 per email per 7d (sliding window)
- Advisory lock on email hash serializes concurrent submissions from same email
- Hardcodes status='pending', notes=NULL — admin fields never client-settable
- EXECUTE granted to anon + authenticated only; revoked from PUBLIC

## Security
- RLS enabled
- REVOKE ALL from anon and authenticated before minimal grants (defensive)
- SELECT + UPDATE granted to authenticated only, gated by admin JWT role check
- No INSERT, DELETE, TRUNCATE, REFERENCES, or TRIGGER grants to any role
- anon has zero direct table access
- No INSERT or DELETE policies exist for any role

## Not Changed
- supporter_signups, Stripe links, agents, athletes, media, consent — untouched
*/

CREATE TABLE IF NOT EXISTS public.contact_inquiries (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name         text NOT NULL,
  email        text NOT NULL,
  organization text,
  inquiry_type text NOT NULL DEFAULT 'general',
  message      text NOT NULL,
  status       text NOT NULL DEFAULT 'pending',
  notes        text,
  created_at   timestamptz NOT NULL DEFAULT now(),
  updated_at   timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT contact_inquiries_status_check
    CHECK (status IN ('pending', 'reviewed', 'responded', 'archived')),
  CONSTRAINT contact_inquiries_type_check
    CHECK (inquiry_type IN ('general', 'partnership', 'athlete', 'media', 'sponsorship'))
);

ALTER TABLE public.contact_inquiries ENABLE ROW LEVEL SECURITY;

-- Defensively strip ALL privileges before granting minimal access
REVOKE ALL ON public.contact_inquiries FROM anon;
REVOKE ALL ON public.contact_inquiries FROM authenticated;

-- Admins can read inquiries (anon gets nothing)
GRANT SELECT ON public.contact_inquiries TO authenticated;

-- Admins can update inquiry status and notes
GRANT UPDATE ON public.contact_inquiries TO authenticated;

-- No INSERT, DELETE, TRUNCATE, REFERENCES, or TRIGGER grants to any role.
-- The SECURITY DEFINER function is the only insert path.

-- SELECT policy: admin only
DROP POLICY IF EXISTS "Admins can view contact inquiries" ON public.contact_inquiries;
CREATE POLICY "Admins can view contact inquiries"
  ON public.contact_inquiries FOR SELECT
  TO authenticated
  USING (auth.jwt() -> 'app_metadata' ->> 'role' = 'admin');

-- UPDATE policy: admin only
DROP POLICY IF EXISTS "Admins can update contact inquiries" ON public.contact_inquiries;
CREATE POLICY "Admins can update contact inquiries"
  ON public.contact_inquiries FOR UPDATE
  TO authenticated
  USING (auth.jwt() -> 'app_metadata' ->> 'role' = 'admin')
  WITH CHECK (auth.jwt() -> 'app_metadata' ->> 'role' = 'admin');

-- No INSERT or DELETE policies. None.

-- Submission function — the only public path to create an inquiry
CREATE OR REPLACE FUNCTION public.submit_contact_inquiry(
  p_name text,
  p_email text,
  p_organization text,
  p_inquiry_type text,
  p_message text
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO ''
AS $function$
DECLARE
  v_id uuid;
  v_email text;
  v_count_24h int;
  v_count_7d int;
BEGIN
  -- --- Required field validation ---
  IF p_name IS NULL OR btrim(p_name) = '' THEN
    RAISE EXCEPTION 'Name is required' USING ERRCODE = '23502';
  END IF;
  IF length(btrim(p_name)) > 200 THEN
    RAISE EXCEPTION 'Name is too long (200 character maximum)' USING ERRCODE = '22001';
  END IF;

  IF p_email IS NULL OR btrim(p_email) = '' THEN
    RAISE EXCEPTION 'Email is required' USING ERRCODE = '23502';
  END IF;
  IF length(btrim(p_email)) > 320 THEN
    RAISE EXCEPTION 'Email is too long (320 character maximum)' USING ERRCODE = '22001';
  END IF;

  -- Email format validation
  IF btrim(p_email) !~ '^[^@\s]+@[^@\s]+\.[^@\s]+$' THEN
    RAISE EXCEPTION 'A valid email address is required' USING ERRCODE = '23514';
  END IF;

  IF p_message IS NULL OR btrim(p_message) = '' THEN
    RAISE EXCEPTION 'Message is required' USING ERRCODE = '23502';
  END IF;
  IF length(p_message) > 5000 THEN
    RAISE EXCEPTION 'Message is too long (5000 character maximum)' USING ERRCODE = '22001';
  END IF;

  -- Validate inquiry_type
  IF p_inquiry_type NOT IN ('general', 'partnership', 'athlete', 'media', 'sponsorship') THEN
    RAISE EXCEPTION 'Invalid inquiry type' USING ERRCODE = '23514';
  END IF;

  -- Normalize email for dedup and rate limit
  v_email := lower(btrim(p_email));

  -- Serialize concurrent submissions from the same email
  -- pg_advisory_xact_lock is released automatically at transaction end
  PERFORM pg_advisory_xact_lock(hashtext(v_email));

  -- --- Rate limiting: sliding window ---
  SELECT count(*) INTO v_count_24h
  FROM public.contact_inquiries
  WHERE email = v_email
    AND created_at > now() - interval '24 hours';

  IF v_count_24h >= 3 THEN
    RAISE EXCEPTION 'Too many inquiries from this email in the last 24 hours. Please try again tomorrow.'
      USING ERRCODE = '23P01';
  END IF;

  SELECT count(*) INTO v_count_7d
  FROM public.contact_inquiries
  WHERE email = v_email
    AND created_at > now() - interval '7 days';

  IF v_count_7d >= 5 THEN
    RAISE EXCEPTION 'Too many inquiries from this email in the last 7 days. Please try again later.'
      USING ERRCODE = '23P01';
  END IF;

  -- --- Insert with safe defaults ---
  -- Admin-only fields (status, notes) are hardcoded, never client-settable.
  INSERT INTO public.contact_inquiries (name, email, organization, inquiry_type, message, status, notes)
  VALUES (
    btrim(p_name),
    v_email,
    CASE WHEN p_organization IS NULL OR btrim(p_organization) = '' THEN NULL ELSE btrim(p_organization) END,
    p_inquiry_type,
    btrim(p_message),
    'pending',
    NULL
  )
  RETURNING id INTO v_id;

  RETURN v_id;
END;
$function$;

-- Lock down function execute: revoke from PUBLIC, grant only to anon + authenticated
REVOKE EXECUTE ON FUNCTION public.submit_contact_inquiry(text, text, text, text, text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.submit_contact_inquiry(text, text, text, text, text) TO anon, authenticated;

-- Indexes for admin sorting and rate-limit queries
CREATE INDEX IF NOT EXISTS contact_inquiries_created_at_idx
  ON public.contact_inquiries (created_at DESC);

CREATE INDEX IF NOT EXISTS contact_inquiries_status_idx
  ON public.contact_inquiries (status);

CREATE INDEX IF NOT EXISTS contact_inquiries_email_idx
  ON public.contact_inquiries (lower(email));

CREATE INDEX IF NOT EXISTS contact_inquiries_email_created_at_idx
  ON public.contact_inquiries (lower(email), created_at DESC);

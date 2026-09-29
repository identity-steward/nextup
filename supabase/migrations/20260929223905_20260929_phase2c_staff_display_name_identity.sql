/*
# Gap B: Participant-facing staff display name identity primitive

## Purpose
Adds a narrowly controlled participant-facing staff label to user_profiles,
distinct from the existing mutable display_name. This label is the
participant-facing recorder identity for V8 — it lets P1 see "who recorded
delivery" without exposing email, UUID, or broad profile data.

## Changes

### 1. New column
- `user_profiles.staff_display_name` (text, nullable, default NULL)
  - Admin-controlled participant-facing label for staff/navigator users
  - NULL for all non-staff users and staff who haven't been assigned a label
  - Not an email, not a legal name, not user-editable

### 2. Write guard trigger function
- `public.guard_user_profile_staff_name()` — SECURITY INVOKER
  - Pinned search_path: 'public', 'pg_catalog'
  - Uses TG_OP to separate INSERT from UPDATE
  - INSERT: NULL allowed without admin; non-null requires admin + validation
  - UPDATE: unchanged field passes silently; changed field requires admin;
    non-null new value validated; admin may clear to NULL
  - Validation: rejects empty/whitespace-only, rejects email-like patterns
  - Does NOT query any tables — only examines NEW/OLD/TG_OP/auth.jwt()
  - SECURITY INVOKER is sufficient because the function needs no elevated
    table access; the guard power comes from the trigger mechanism + exception

### 3. Trigger
- `trg_guard_user_profile_staff_name` BEFORE INSERT OR UPDATE on user_profiles

### 4. Resolver function
- `public.resolve_delivery_recorder_labels(uuid)` — SECURITY DEFINER
  - Pinned search_path: 'public', 'pg_catalog'
  - Schema-qualified tables: public.disclosures, public.user_profiles,
    public.household_memberships, public.persons
  - Schema-qualified auth helpers: auth.uid()
  - Validates caller is a household member before returning data
  - Returns only (delivered_by_user_id, staff_display_name)
  - No email, no display_name, no other profile columns
  - No dynamic SQL, no caller-controlled object identifiers
  - SECURITY DEFINER required because P1's RLS blocks reading other users'
    user_profiles rows; the resolver's internal membership check replaces RLS

### 5. Grants
- Trigger function: REVOKE ALL FROM PUBLIC, anon, authenticated (not directly callable)
- Resolver function: REVOKE FROM PUBLIC, anon; GRANT TO authenticated only

### Security
- No RLS policy changes on user_profiles
- No new tables
- No changes to disclosures, navigator_assignments, or persons tables
- delivered_by_user_id remains the underlying audit reference
- No delivery-time snapshot — read-time resolution from current staff_display_name
*/

-- ============================================================
-- 1. Add staff_display_name column
-- ============================================================

ALTER TABLE public.user_profiles
  ADD COLUMN IF NOT EXISTS staff_display_name text DEFAULT NULL;

-- ============================================================
-- 2. Write guard trigger function (SECURITY INVOKER)
-- ============================================================

CREATE OR REPLACE FUNCTION public.guard_user_profile_staff_name()
RETURNS trigger
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = 'public', 'pg_catalog'
AS $$
DECLARE
  v_is_admin boolean;
BEGIN
  v_is_admin := COALESCE((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin', false);

  IF TG_OP = 'INSERT' THEN
    -- INSERT: no OLD row exists
    IF NEW.staff_display_name IS NOT NULL THEN
      IF NOT v_is_admin THEN
        RAISE EXCEPTION 'Permission denied: only admins can set staff_display_name'
          USING ERRCODE = 'check_violation';
      END IF;
      -- Validate non-null value
      IF btrim(NEW.staff_display_name) = '' THEN
        RAISE EXCEPTION 'staff_display_name cannot be empty or whitespace-only'
          USING ERRCODE = 'check_violation';
      END IF;
      IF NEW.staff_display_name ~ '@.*\.' THEN
        RAISE EXCEPTION 'staff_display_name cannot be an email address'
          USING ERRCODE = 'check_violation';
      END IF;
    END IF;
    -- NULL on INSERT is allowed (default for all non-staff users)

  ELSIF TG_OP = 'UPDATE' THEN
    -- UPDATE: compare OLD and NEW
    IF NEW.staff_display_name IS DISTINCT FROM OLD.staff_display_name THEN
      -- Field is being changed
      IF NOT v_is_admin THEN
        RAISE EXCEPTION 'Permission denied: only admins can set staff_display_name'
          USING ERRCODE = 'check_violation';
      END IF;
      -- If new value is non-null, validate it
      IF NEW.staff_display_name IS NOT NULL THEN
        IF btrim(NEW.staff_display_name) = '' THEN
          RAISE EXCEPTION 'staff_display_name cannot be empty or whitespace-only'
            USING ERRCODE = 'check_violation';
        END IF;
        IF NEW.staff_display_name ~ '@.*\.' THEN
          RAISE EXCEPTION 'staff_display_name cannot be an email address'
            USING ERRCODE = 'check_violation';
        END IF;
      END IF;
      -- Admin clearing to NULL is allowed
    END IF;
    -- Unchanged field: do nothing, allow the update
  END IF;

  RETURN NEW;
END;
$$;

REVOKE ALL ON FUNCTION public.guard_user_profile_staff_name() FROM PUBLIC, anon, authenticated;

-- ============================================================
-- 3. Trigger
-- ============================================================

DROP TRIGGER IF EXISTS trg_guard_user_profile_staff_name ON public.user_profiles;
CREATE TRIGGER trg_guard_user_profile_staff_name
  BEFORE INSERT OR UPDATE ON public.user_profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.guard_user_profile_staff_name();

-- ============================================================
-- 4. Resolver function (SECURITY DEFINER)
-- ============================================================

CREATE OR REPLACE FUNCTION public.resolve_delivery_recorder_labels(p_household_uuid uuid)
RETURNS TABLE(delivered_by_user_id uuid, staff_display_name text)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public', 'pg_catalog'
AS $$
BEGIN
  -- Explicit household authorization: caller must be a member of the household
  IF NOT EXISTS (
    SELECT 1
    FROM public.household_memberships hm
    JOIN public.persons p ON hm.person_id = p.id
    WHERE hm.household_id = p_household_uuid
      AND p.auth_user_id = auth.uid()
  ) THEN
    RETURN;  -- empty result set — no data leaked
  END IF;

  -- Return only the minimum: UUID for service-layer mapping, label for display
  RETURN QUERY
    SELECT DISTINCT
      d.delivered_by_user_id,
      up.staff_display_name
    FROM public.disclosures d
    LEFT JOIN public.user_profiles up ON up.id = d.delivered_by_user_id
    WHERE d.household_id = p_household_uuid
      AND d.delivered_by_user_id IS NOT NULL;
END;
$$;

-- ============================================================
-- 5. Resolver grants
-- ============================================================

REVOKE EXECUTE ON FUNCTION public.resolve_delivery_recorder_labels(uuid) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.resolve_delivery_recorder_labels(uuid) TO authenticated;

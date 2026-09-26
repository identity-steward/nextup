/*
  # Harden self-assignable role and admin policy predicates

  1. handle_new_user() no longer accepts an arbitrary role from signup metadata.
  2. user_profiles.role and user_profiles.athlete_id are no longer writable by
     the row owner (column-level UPDATE grant).
  3. Admin policies that trusted user_profiles.role now trust the JWT
     app_metadata role claim, which only the server can set.
*/

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public', 'pg_catalog'
AS $function$
DECLARE
  v_requested text;
  v_role text;
BEGIN
  v_requested := NEW.raw_user_meta_data ->> 'role';
  v_role := CASE WHEN v_requested IN ('athlete', 'parent') THEN v_requested ELSE 'athlete' END;

  INSERT INTO public.user_profiles (id, role, display_name)
  VALUES (
    NEW.id,
    v_role,
    COALESCE(NEW.raw_user_meta_data ->> 'display_name', NEW.email)
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$function$;

REVOKE UPDATE ON public.user_profiles FROM authenticated;
GRANT UPDATE (display_name, phone, updated_at) ON public.user_profiles TO authenticated;

REVOKE UPDATE ON public.user_profiles FROM anon;

DROP POLICY IF EXISTS "Admins can insert event codes" ON public.event_codes;
CREATE POLICY "Admins can insert event codes" ON public.event_codes
  FOR INSERT TO authenticated
  WITH CHECK (((auth.jwt() -> 'app_metadata') ->> 'role') = 'admin');

DROP POLICY IF EXISTS "Admins can manage event codes" ON public.event_codes;
CREATE POLICY "Admins can manage event codes" ON public.event_codes
  FOR SELECT TO authenticated
  USING (((auth.jwt() -> 'app_metadata') ->> 'role') = 'admin');

DROP POLICY IF EXISTS "Admins can update event codes" ON public.event_codes;
CREATE POLICY "Admins can update event codes" ON public.event_codes
  FOR UPDATE TO authenticated
  USING (((auth.jwt() -> 'app_metadata') ->> 'role') = 'admin')
  WITH CHECK (((auth.jwt() -> 'app_metadata') ->> 'role') = 'admin');

DROP POLICY IF EXISTS "Admins can insert SAB IDs" ON public.sab_ids;
CREATE POLICY "Admins can insert SAB IDs" ON public.sab_ids
  FOR INSERT TO authenticated
  WITH CHECK (((auth.jwt() -> 'app_metadata') ->> 'role') = 'admin');

DROP POLICY IF EXISTS "Admins can read all SAB IDs" ON public.sab_ids;
CREATE POLICY "Admins can read all SAB IDs" ON public.sab_ids
  FOR SELECT TO authenticated
  USING (((auth.jwt() -> 'app_metadata') ->> 'role') = 'admin');

DROP POLICY IF EXISTS "Admins can update SAB IDs" ON public.sab_ids;
CREATE POLICY "Admins can update SAB IDs" ON public.sab_ids
  FOR UPDATE TO authenticated
  USING (((auth.jwt() -> 'app_metadata') ->> 'role') = 'admin')
  WITH CHECK (((auth.jwt() -> 'app_metadata') ->> 'role') = 'admin');

DROP POLICY IF EXISTS "Admins can read all signup sources" ON public.signup_sources;
CREATE POLICY "Admins can read all signup sources" ON public.signup_sources
  FOR SELECT TO authenticated
  USING (((auth.jwt() -> 'app_metadata') ->> 'role') = 'admin');

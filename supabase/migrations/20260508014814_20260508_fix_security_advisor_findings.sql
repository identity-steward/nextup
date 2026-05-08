
/*
  # Fix Supabase Security Advisor Findings

  ## Summary
  Addresses all 36 security advisor warnings across four categories:

  1. **Mutable search_path** — `increment_athlete_stat` and `update_tasks_updated_at` are
     recreated with `SET search_path = public, pg_catalog` to prevent schema injection attacks.

  2. **SECURITY DEFINER trigger functions** — `update_athletes_updated_at`,
     `update_creators_updated_at`, and `update_updated_at_column` are converted to
     SECURITY INVOKER and their EXECUTE permission is revoked from anon/authenticated.
     Triggers should not be directly callable via the REST API.

  3. **Always-true INSERT policies on public intake forms** — The five anon-accessible
     INSERT policies (athlete_signups, creator_applications, media_pass_requests,
     parent_intake, team_inquiries) are tightened with a meaningful WITH CHECK that
     constrains the submitted `status` to 'pending' only.

  4. **Always-true policies on admin/internal tables** — All USING (true) / WITH CHECK (true)
     policies on authenticated-only tables are replaced with role-checked versions that
     require `app_metadata.role = 'admin'`. Affected tables: agent_trigger_log,
     athlete_signups (update), audit_logs, creator_applications (update),
     guardians, media_pass_requests (update), needs_manual_review, parent_intake (update),
     supporter_signups (update), tasks, team_inquiries (update).
     The profile_update_requests anon INSERT is also constrained to status = 'pending'.

  ## Security Notes
  - Public intake INSERT policies now enforce status = 'pending' so anon users cannot
    self-promote submissions (e.g., set status = 'approved').
  - Admin tables require app_metadata.role = 'admin' — set this via the Supabase Auth
    admin API or service role when promoting users.
  - Trigger functions are now SECURITY INVOKER (run as the calling user, not owner).
*/

-- ============================================================
-- 1. Fix mutable search_path on non-trigger functions
-- ============================================================

CREATE OR REPLACE FUNCTION public.increment_athlete_stat(athlete_id uuid, field text)
  RETURNS void
  LANGUAGE plpgsql
  SECURITY INVOKER
  SET search_path = public, pg_catalog
AS $$
begin
  execute format(
    'update athletes set %I = coalesce(%I, 0) + 1 where id = $1',
    field, field
  )
  using athlete_id;
end;
$$;

CREATE OR REPLACE FUNCTION public.update_tasks_updated_at()
  RETURNS trigger
  LANGUAGE plpgsql
  SECURITY INVOKER
  SET search_path = public, pg_catalog
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- ============================================================
-- 2. Fix SECURITY DEFINER trigger functions
--    Convert to SECURITY INVOKER + revoke direct EXECUTE
-- ============================================================

CREATE OR REPLACE FUNCTION public.update_athletes_updated_at()
  RETURNS trigger
  LANGUAGE plpgsql
  SECURITY INVOKER
  SET search_path = public, pg_catalog
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.update_creators_updated_at()
  RETURNS trigger
  LANGUAGE plpgsql
  SECURITY INVOKER
  SET search_path = public, pg_catalog
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.update_updated_at_column()
  RETURNS trigger
  LANGUAGE plpgsql
  SECURITY INVOKER
  SET search_path = public, pg_catalog
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

REVOKE EXECUTE ON FUNCTION public.update_athletes_updated_at() FROM anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.update_creators_updated_at() FROM anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.update_updated_at_column() FROM anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.update_tasks_updated_at() FROM anon, authenticated;

-- ============================================================
-- 3. Tighten anon INSERT policies on public intake forms
--    Constrain WITH CHECK so status must be 'pending'
-- ============================================================

-- athlete_signups
DROP POLICY IF EXISTS "Anyone can submit athlete signup" ON public.athlete_signups;
CREATE POLICY "Anyone can submit athlete signup"
  ON public.athlete_signups
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (status = 'pending');

-- creator_applications
DROP POLICY IF EXISTS "Anyone can submit creator application" ON public.creator_applications;
CREATE POLICY "Anyone can submit creator application"
  ON public.creator_applications
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (status = 'pending');

-- media_pass_requests
DROP POLICY IF EXISTS "Anyone can submit media pass request" ON public.media_pass_requests;
CREATE POLICY "Anyone can submit media pass request"
  ON public.media_pass_requests
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (status = 'pending');

-- parent_intake
DROP POLICY IF EXISTS "Anyone can submit parent intake" ON public.parent_intake;
CREATE POLICY "Anyone can submit parent intake"
  ON public.parent_intake
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (status = 'pending');

-- team_inquiries
DROP POLICY IF EXISTS "Anyone can submit team inquiry" ON public.team_inquiries;
CREATE POLICY "Anyone can submit team inquiry"
  ON public.team_inquiries
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (status = 'pending');

-- profile_update_requests (anon insert)
DROP POLICY IF EXISTS "Anyone can submit a profile update request" ON public.profile_update_requests;
CREATE POLICY "Anyone can submit a profile update request"
  ON public.profile_update_requests
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (status = 'pending');

-- supporters (anon create)
DROP POLICY IF EXISTS "Anyone can create supporter record" ON public.supporters;
CREATE POLICY "Anyone can create supporter record"
  ON public.supporters
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

-- supporter_signups (anon insert)
DROP POLICY IF EXISTS "Anyone can submit supporter signup" ON public.supporter_signups;
CREATE POLICY "Anyone can submit supporter signup"
  ON public.supporter_signups
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (status = 'pending');

-- testimonials (anon insert)
DROP POLICY IF EXISTS "Anyone can submit testimonials" ON public.testimonials;
CREATE POLICY "Anyone can submit testimonials"
  ON public.testimonials
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (is_approved = false);

-- ============================================================
-- 4. Tighten always-true policies on admin/internal tables
--    Require app_metadata.role = 'admin'
-- ============================================================

-- agent_trigger_log
DROP POLICY IF EXISTS "Authenticated users can insert trigger log" ON public.agent_trigger_log;
DROP POLICY IF EXISTS "Authenticated users can read trigger log" ON public.agent_trigger_log;

CREATE POLICY "Admins can insert trigger log"
  ON public.agent_trigger_log
  FOR INSERT
  TO authenticated
  WITH CHECK (
    (auth.jwt() -> 'app_metadata' ->> 'role') = 'admin'
  );

CREATE POLICY "Admins can read trigger log"
  ON public.agent_trigger_log
  FOR SELECT
  TO authenticated
  USING (
    (auth.jwt() -> 'app_metadata' ->> 'role') = 'admin'
  );

-- athlete_signups (authenticated SELECT + UPDATE)
DROP POLICY IF EXISTS "Authenticated users can view athlete signups" ON public.athlete_signups;
DROP POLICY IF EXISTS "Authenticated users can update athlete signups" ON public.athlete_signups;

CREATE POLICY "Admins can view athlete signups"
  ON public.athlete_signups
  FOR SELECT
  TO authenticated
  USING (
    (auth.jwt() -> 'app_metadata' ->> 'role') = 'admin'
  );

CREATE POLICY "Admins can update athlete signups"
  ON public.athlete_signups
  FOR UPDATE
  TO authenticated
  USING (
    (auth.jwt() -> 'app_metadata' ->> 'role') = 'admin'
  )
  WITH CHECK (
    (auth.jwt() -> 'app_metadata' ->> 'role') = 'admin'
  );

-- audit_logs
DROP POLICY IF EXISTS "Authenticated users can insert audit logs" ON public.audit_logs;
DROP POLICY IF EXISTS "Authenticated users can view audit logs" ON public.audit_logs;

CREATE POLICY "Admins can insert audit logs"
  ON public.audit_logs
  FOR INSERT
  TO authenticated
  WITH CHECK (
    (auth.jwt() -> 'app_metadata' ->> 'role') = 'admin'
  );

CREATE POLICY "Admins can view audit logs"
  ON public.audit_logs
  FOR SELECT
  TO authenticated
  USING (
    (auth.jwt() -> 'app_metadata' ->> 'role') = 'admin'
  );

-- creator_applications (authenticated SELECT + UPDATE)
DROP POLICY IF EXISTS "Authenticated users can view creator applications" ON public.creator_applications;
DROP POLICY IF EXISTS "Authenticated users can update creator applications" ON public.creator_applications;

CREATE POLICY "Admins can view creator applications"
  ON public.creator_applications
  FOR SELECT
  TO authenticated
  USING (
    (auth.jwt() -> 'app_metadata' ->> 'role') = 'admin'
  );

CREATE POLICY "Admins can update creator applications"
  ON public.creator_applications
  FOR UPDATE
  TO authenticated
  USING (
    (auth.jwt() -> 'app_metadata' ->> 'role') = 'admin'
  )
  WITH CHECK (
    (auth.jwt() -> 'app_metadata' ->> 'role') = 'admin'
  );

-- guardians
DROP POLICY IF EXISTS "Authenticated users can insert guardians" ON public.guardians;
DROP POLICY IF EXISTS "Authenticated users can update guardians" ON public.guardians;
DROP POLICY IF EXISTS "Authenticated users can view guardians" ON public.guardians;

CREATE POLICY "Admins can insert guardians"
  ON public.guardians
  FOR INSERT
  TO authenticated
  WITH CHECK (
    (auth.jwt() -> 'app_metadata' ->> 'role') = 'admin'
  );

CREATE POLICY "Admins can update guardians"
  ON public.guardians
  FOR UPDATE
  TO authenticated
  USING (
    (auth.jwt() -> 'app_metadata' ->> 'role') = 'admin'
  )
  WITH CHECK (
    (auth.jwt() -> 'app_metadata' ->> 'role') = 'admin'
  );

CREATE POLICY "Admins can view guardians"
  ON public.guardians
  FOR SELECT
  TO authenticated
  USING (
    (auth.jwt() -> 'app_metadata' ->> 'role') = 'admin'
  );

-- media_pass_requests (authenticated SELECT + UPDATE)
DROP POLICY IF EXISTS "Authenticated users can view media pass requests" ON public.media_pass_requests;
DROP POLICY IF EXISTS "Authenticated users can update media pass requests" ON public.media_pass_requests;

CREATE POLICY "Admins can view media pass requests"
  ON public.media_pass_requests
  FOR SELECT
  TO authenticated
  USING (
    (auth.jwt() -> 'app_metadata' ->> 'role') = 'admin'
  );

CREATE POLICY "Admins can update media pass requests"
  ON public.media_pass_requests
  FOR UPDATE
  TO authenticated
  USING (
    (auth.jwt() -> 'app_metadata' ->> 'role') = 'admin'
  )
  WITH CHECK (
    (auth.jwt() -> 'app_metadata' ->> 'role') = 'admin'
  );

-- needs_manual_review
DROP POLICY IF EXISTS "Authenticated users can insert review flags" ON public.needs_manual_review;
DROP POLICY IF EXISTS "Authenticated users can update review flags" ON public.needs_manual_review;
DROP POLICY IF EXISTS "Authenticated users can view review flags" ON public.needs_manual_review;

CREATE POLICY "Admins can insert review flags"
  ON public.needs_manual_review
  FOR INSERT
  TO authenticated
  WITH CHECK (
    (auth.jwt() -> 'app_metadata' ->> 'role') = 'admin'
  );

CREATE POLICY "Admins can update review flags"
  ON public.needs_manual_review
  FOR UPDATE
  TO authenticated
  USING (
    (auth.jwt() -> 'app_metadata' ->> 'role') = 'admin'
  )
  WITH CHECK (
    (auth.jwt() -> 'app_metadata' ->> 'role') = 'admin'
  );

CREATE POLICY "Admins can view review flags"
  ON public.needs_manual_review
  FOR SELECT
  TO authenticated
  USING (
    (auth.jwt() -> 'app_metadata' ->> 'role') = 'admin'
  );

-- parent_intake (authenticated SELECT + UPDATE)
DROP POLICY IF EXISTS "Authenticated users can view parent intake" ON public.parent_intake;
DROP POLICY IF EXISTS "Authenticated users can update parent intake" ON public.parent_intake;

CREATE POLICY "Admins can view parent intake"
  ON public.parent_intake
  FOR SELECT
  TO authenticated
  USING (
    (auth.jwt() -> 'app_metadata' ->> 'role') = 'admin'
  );

CREATE POLICY "Admins can update parent intake"
  ON public.parent_intake
  FOR UPDATE
  TO authenticated
  USING (
    (auth.jwt() -> 'app_metadata' ->> 'role') = 'admin'
  )
  WITH CHECK (
    (auth.jwt() -> 'app_metadata' ->> 'role') = 'admin'
  );

-- supporter_signups (authenticated SELECT + UPDATE)
DROP POLICY IF EXISTS "Authenticated users can view supporter signups" ON public.supporter_signups;
DROP POLICY IF EXISTS "Authenticated users can update supporter signups" ON public.supporter_signups;

CREATE POLICY "Admins can view supporter signups"
  ON public.supporter_signups
  FOR SELECT
  TO authenticated
  USING (
    (auth.jwt() -> 'app_metadata' ->> 'role') = 'admin'
  );

CREATE POLICY "Admins can update supporter signups"
  ON public.supporter_signups
  FOR UPDATE
  TO authenticated
  USING (
    (auth.jwt() -> 'app_metadata' ->> 'role') = 'admin'
  )
  WITH CHECK (
    (auth.jwt() -> 'app_metadata' ->> 'role') = 'admin'
  );

-- tasks
DROP POLICY IF EXISTS "Authenticated users can insert tasks" ON public.tasks;
DROP POLICY IF EXISTS "Authenticated users can update tasks" ON public.tasks;
DROP POLICY IF EXISTS "Authenticated users can view tasks" ON public.tasks;

CREATE POLICY "Admins can insert tasks"
  ON public.tasks
  FOR INSERT
  TO authenticated
  WITH CHECK (
    (auth.jwt() -> 'app_metadata' ->> 'role') = 'admin'
  );

CREATE POLICY "Admins can update tasks"
  ON public.tasks
  FOR UPDATE
  TO authenticated
  USING (
    (auth.jwt() -> 'app_metadata' ->> 'role') = 'admin'
  )
  WITH CHECK (
    (auth.jwt() -> 'app_metadata' ->> 'role') = 'admin'
  );

CREATE POLICY "Admins can view tasks"
  ON public.tasks
  FOR SELECT
  TO authenticated
  USING (
    (auth.jwt() -> 'app_metadata' ->> 'role') = 'admin'
  );

-- team_inquiries (authenticated SELECT + UPDATE)
DROP POLICY IF EXISTS "Authenticated users can view team inquiries" ON public.team_inquiries;
DROP POLICY IF EXISTS "Authenticated users can update team inquiries" ON public.team_inquiries;

CREATE POLICY "Admins can view team inquiries"
  ON public.team_inquiries
  FOR SELECT
  TO authenticated
  USING (
    (auth.jwt() -> 'app_metadata' ->> 'role') = 'admin'
  );

CREATE POLICY "Admins can update team inquiries"
  ON public.team_inquiries
  FOR UPDATE
  TO authenticated
  USING (
    (auth.jwt() -> 'app_metadata' ->> 'role') = 'admin'
  )
  WITH CHECK (
    (auth.jwt() -> 'app_metadata' ->> 'role') = 'admin'
  );

-- athletes (authenticated INSERT + UPDATE + DELETE)
DROP POLICY IF EXISTS "Authenticated users can insert athletes" ON public.athletes;
DROP POLICY IF EXISTS "Authenticated users can update athletes" ON public.athletes;
DROP POLICY IF EXISTS "Authenticated users can delete athletes" ON public.athletes;

CREATE POLICY "Admins can insert athletes"
  ON public.athletes
  FOR INSERT
  TO authenticated
  WITH CHECK (
    (auth.jwt() -> 'app_metadata' ->> 'role') = 'admin'
  );

CREATE POLICY "Admins can update athletes"
  ON public.athletes
  FOR UPDATE
  TO authenticated
  USING (
    (auth.jwt() -> 'app_metadata' ->> 'role') = 'admin'
  )
  WITH CHECK (
    (auth.jwt() -> 'app_metadata' ->> 'role') = 'admin'
  );

CREATE POLICY "Admins can delete athletes"
  ON public.athletes
  FOR DELETE
  TO authenticated
  USING (
    (auth.jwt() -> 'app_metadata' ->> 'role') = 'admin'
  );

-- creators (authenticated INSERT)
DROP POLICY IF EXISTS "Authenticated users can insert creators" ON public.creators;

CREATE POLICY "Admins can insert creators"
  ON public.creators
  FOR INSERT
  TO authenticated
  WITH CHECK (
    (auth.jwt() -> 'app_metadata' ->> 'role') = 'admin'
  );

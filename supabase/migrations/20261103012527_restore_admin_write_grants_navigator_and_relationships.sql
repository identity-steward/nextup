/*
  # Restore admin write grants on navigator assignments and person relationships

  1. Problem
     The previous migration revoked INSERT/UPDATE/DELETE from authenticated
     on these two tables, but each has an admin-only FOR ALL policy, so
     admins legitimately write to them. The revoke would have broken the
     navigator assignment and relationship management features.

  2. Changes
     - Re-grants INSERT, UPDATE, DELETE on navigator_assignments and
       person_relationships to authenticated only.

  3. Security notes
     1. anon keeps no write grant on either table.
     2. Row level security still limits these writes to callers whose JWT
        app_metadata role is admin, so the grant alone confers nothing.
*/

GRANT INSERT, UPDATE, DELETE ON public.navigator_assignments TO authenticated;
GRANT INSERT, UPDATE, DELETE ON public.person_relationships TO authenticated;


-- ============================================================================
-- A. STORAGE OBJECTS — Restrict broad authenticated read to owners + admins
-- ============================================================================

DROP POLICY IF EXISTS "Authenticated can read athlete photos" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated can read athlete videos" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated can read profile assets" ON storage.objects;

CREATE POLICY "Owners and admins can read athlete photos"
  ON storage.objects FOR SELECT TO authenticated
  USING (
    bucket_id = 'athlete-photos'
    AND (
      (auth.jwt() -> 'app_metadata' ->> 'role') = 'admin'
      OR EXISTS (
        SELECT 1 FROM public.athletes a
        WHERE a.id::text = (storage.foldername(name))[1]
        AND (
          a.auth_user_id = auth.uid()
          OR a.created_by_user_id = auth.uid()
          OR a.managed_by_parent_id = auth.uid()
        )
      )
    )
  );

CREATE POLICY "Owners and admins can read athlete videos"
  ON storage.objects FOR SELECT TO authenticated
  USING (
    bucket_id = 'athlete-videos'
    AND (
      (auth.jwt() -> 'app_metadata' ->> 'role') = 'admin'
      OR EXISTS (
        SELECT 1 FROM public.athletes a
        WHERE a.id::text = (storage.foldername(name))[1]
        AND (
          a.auth_user_id = auth.uid()
          OR a.created_by_user_id = auth.uid()
          OR a.managed_by_parent_id = auth.uid()
        )
      )
    )
  );

CREATE POLICY "Owners and admins can read profile assets"
  ON storage.objects FOR SELECT TO authenticated
  USING (
    bucket_id = 'profile-assets'
    AND (
      (auth.jwt() -> 'app_metadata' ->> 'role') = 'admin'
      OR auth.uid()::text = (storage.foldername(name))[1]
      OR EXISTS (
        SELECT 1 FROM public.athletes a
        WHERE a.id::text = (storage.foldername(name))[1]
        AND (
          a.auth_user_id = auth.uid()
          OR a.created_by_user_id = auth.uid()
          OR a.managed_by_parent_id = auth.uid()
        )
      )
    )
  );

-- ============================================================================
-- B. STORAGE OBJECTS — Revoke excess anon grants
-- ============================================================================

REVOKE SELECT, INSERT, UPDATE, DELETE ON storage.objects FROM anon;

-- ============================================================================
-- C. SECURITY DEFINER FUNCTION — Full publication authorization with binding
-- ============================================================================

CREATE OR REPLACE FUNCTION public.media_is_publication_authorized(p_media_id uuid)
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
SET search_path = public, storage
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM media_uploads m
    JOIN athletes a ON a.id = m.athlete_id
    JOIN persons athlete_person ON athlete_person.auth_user_id = a.auth_user_id
    JOIN household_memberships hm ON hm.person_id = athlete_person.id
    JOIN authority_to_act ata
      ON ata.household_id = hm.household_id
      AND ata.verification_status = 'verified_by_qualified_authority'
      AND ata.disputed = false
      AND (ata.expires_at IS NULL OR ata.expires_at >= now())
    AND ata.subject_person_id = athlete_person.id
    JOIN consents c
      ON c.athlete_id = m.athlete_id
      AND c.consent_status = 'accepted'
      AND c.can_use_name_image_likeness = true
      AND c.user_id = ata.actor_user_id
    WHERE m.id = p_media_id
      AND m.status = 'approved'
      AND m.consent_status = 'signed'
      AND m.usage_scope IN ('platform', 'public')
      AND a.profile_status = 'active'
  )
$$;

REVOKE EXECUTE ON FUNCTION public.media_is_publication_authorized(uuid) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.media_is_publication_authorized(uuid) TO anon, authenticated;

-- ============================================================================
-- D. MEDIA_UPLOADS — Tighten public SELECT to full publication authorization
-- ============================================================================

DROP POLICY IF EXISTS "Public can view approved media with current consent" ON public.media_uploads;

CREATE POLICY "Public can view fully authorized media"
  ON public.media_uploads FOR SELECT TO anon, authenticated
  USING (public.media_is_publication_authorized(id));

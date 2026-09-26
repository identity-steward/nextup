/*
  # Scope media uploads to folders the caller owns

  The upload policies checked only the bucket, so any signed-in user could
  write into any athlete's folder in publicly readable buckets. Uploads must
  now land in a folder named after an athlete the caller owns, created or
  manages (profile assets: the caller's own user id).
*/

DROP POLICY IF EXISTS "Authenticated users can upload athlete photos" ON storage.objects;
CREATE POLICY "Authenticated users can upload athlete photos" ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (
    bucket_id = 'athlete-photos'
    AND EXISTS (
      SELECT 1 FROM public.athletes a
      WHERE a.id::text = (storage.foldername(name))[1]
        AND (a.auth_user_id = auth.uid() OR a.created_by_user_id = auth.uid() OR a.managed_by_parent_id = auth.uid())
    )
  );

DROP POLICY IF EXISTS "Authenticated users can upload athlete videos" ON storage.objects;
CREATE POLICY "Authenticated users can upload athlete videos" ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (
    bucket_id = 'athlete-videos'
    AND EXISTS (
      SELECT 1 FROM public.athletes a
      WHERE a.id::text = (storage.foldername(name))[1]
        AND (a.auth_user_id = auth.uid() OR a.created_by_user_id = auth.uid() OR a.managed_by_parent_id = auth.uid())
    )
  );

DROP POLICY IF EXISTS "Authenticated users can upload profile assets" ON storage.objects;
CREATE POLICY "Authenticated users can upload profile assets" ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (
    bucket_id = 'profile-assets'
    AND (
      (auth.uid())::text = (storage.foldername(name))[1]
      OR EXISTS (
        SELECT 1 FROM public.athletes a
        WHERE a.id::text = (storage.foldername(name))[1]
          AND (a.auth_user_id = auth.uid() OR a.created_by_user_id = auth.uid() OR a.managed_by_parent_id = auth.uid())
      )
    )
  );

DROP POLICY IF EXISTS "Uploaders can delete own athlete photos" ON storage.objects;
CREATE POLICY "Uploaders can delete own athlete photos" ON storage.objects
  FOR DELETE TO authenticated
  USING (
    bucket_id = 'athlete-photos'
    AND (
      (auth.uid())::text = (storage.foldername(name))[1]
      OR EXISTS (
        SELECT 1 FROM public.athletes a
        WHERE a.id::text = (storage.foldername(name))[1]
          AND (a.auth_user_id = auth.uid() OR a.created_by_user_id = auth.uid() OR a.managed_by_parent_id = auth.uid())
      )
    )
  );

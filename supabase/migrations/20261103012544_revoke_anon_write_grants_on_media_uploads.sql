/*
  # Remove anon write grants on media uploads

  1. Problem
     The anon role still held INSERT and UPDATE grants on media_uploads
     even though no policy permits an anonymous write.

  2. Changes
     - Revokes INSERT, UPDATE and DELETE on media_uploads from anon.

  3. Security notes
     1. Anonymous read of approved, consented media is unchanged.
     2. Authenticated uploads continue to work and remain forced to
        pending review by the guard trigger.
*/

REVOKE INSERT, UPDATE, DELETE ON public.media_uploads FROM anon;

/*
  # Require a real email shape on supporter sign-up

  1. Problem
     The anon-reachable INSERT policy on supporters accepted any non-empty
     string as an email, so the supporter list could be filled with junk.

  2. Changes
     - Recreates "Supporters can sign up with valid email" with a basic
       address-shape check and a length bound.

  3. Security notes
     1. supporters has no anon SELECT policy, so nothing is readable back;
        this only stops write pollution.
*/

DROP POLICY IF EXISTS "Supporters can sign up with valid email" ON public.supporters;
CREATE POLICY "Supporters can sign up with valid email"
  ON public.supporters FOR INSERT
  TO anon, authenticated
  WITH CHECK (
    email IS NOT NULL
    AND length(btrim(email)) BETWEEN 5 AND 254
    AND btrim(email) ~ '^[^[:space:]@]+@[^[:space:]@]+\.[A-Za-z]{2,}$'
  );

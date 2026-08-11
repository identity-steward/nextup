/*
  # Reset Pilot 001 Test Account Passwords

  ## Summary
  Resets the encrypted password for two disposable Pilot 001 validation
  test accounts so that Test I can be executed through the normal
  authenticated anon-key client + RLS path.

  These are disposable test accounts used solely for controlled Pilot 001
  validation. Credentials are rotated solely for controlled validation.

  ## Accounts Reset
  - pilot001.a.1786247800479@nextup-test.local (Pilot A household member)
  - pilot001.nav@nextup-test.local (Assigned navigator)

  ## Security
  - No schema, RLS, policy, trigger, or application code changes.
  - No new tables, columns, or indexes.
  - Only auth.users.encrypted_password is updated for two test accounts.
  - Passwords are bcrypt-hashed via the built-in crypt() function.
*/

UPDATE auth.users
SET encrypted_password = crypt('Pilot001!TestI', gen_salt('bf'))
WHERE email IN (
  'pilot001.a.1786247800479@nextup-test.local',
  'pilot001.nav@nextup-test.local'
);
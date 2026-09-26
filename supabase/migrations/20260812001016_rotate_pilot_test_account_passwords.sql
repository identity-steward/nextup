/*
  # Rotate pilot test account passwords

  An earlier migration set these two accounts to a password written in plain
  text in the repository. The accounts and all their data are preserved; only
  the password is replaced with a random value nobody holds.
*/

UPDATE auth.users
SET encrypted_password = crypt(encode(gen_random_bytes(32), 'hex'), gen_salt('bf'))
WHERE email IN (
  'pilot001.a.1786247800479@nextup-test.local',
  'pilot001.nav@nextup-test.local'
);

/*
  Internal error handling helper.

  Backend errors (Postgres messages, policy violations, constraint names)
  are internal detail. Surfacing them in the interface tells a caller how
  the database is shaped. Log the real error for developers and return an
  empty string so the calling site falls back to its own user-facing copy.
*/

export function logInternalError(error: unknown): string {
  console.error(error);
  return '';
}

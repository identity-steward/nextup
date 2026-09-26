/**
 * Narrow guard for base public media eligibility.
 *
 * Evaluates ONLY: status === 'approved' AND consent_status !== 'revoked'.
 * Does NOT evaluate usage_scope — that requires a policy definition that
 * does not yet exist in the codebase. Context-specific usage checks
 * must be applied separately by the calling surface.
 */

export interface BaseMediaFields {
  status: string;
  consent_status: string;
}

export function passesBasePublicMediaGuard(media: BaseMediaFields): boolean {
  return media.status === 'approved' && media.consent_status !== 'revoked';
}

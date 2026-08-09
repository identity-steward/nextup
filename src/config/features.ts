/**
 * NextUp v1.0 — Feature Flag Configuration
 *
 * Phase 0: This file exists but is NOT imported by any component.
 * All defaults preserve the current application behavior exactly.
 * Later phases will import these flags to conditionally show/hide features.
 *
 * V1 flags default to FALSE (new features are off until explicitly enabled).
 * Preservation flags default to TRUE (existing features remain visible until explicitly hidden).
 */

export interface FeatureFlags {
  // ─── V1 Feature Flags (default: false) ───────────────────────────────────
  /** Phase 1 — Replace public nav with simplified v1 navigation */
  NEXTUP_V1_PUBLIC_NAV: boolean;
  /** Phase 2 — Enable the narration-first Start My NextUp flow */
  NEXTUP_V1_START_FLOW: boolean;
  /** Phase 2 — Enable the private My NextUp app shell */
  NEXTUP_V1_PRIVATE_APP: boolean;
  /** Phase 3 — Enable navigator dashboard and household assignment */
  NEXTUP_V1_NAVIGATOR: boolean;
  /** Phase 4 — Enable pathways, referrals, and funding status */
  NEXTUP_V1_PATHWAYS: boolean;
  /** Phase 3 — Enable consent, authority, disclosure, and sharing */
  NEXTUP_V1_TRUST: boolean;
  /** Phase 5 — Enable outcome and barrier capture */
  NEXTUP_V1_OUTCOMES: boolean;

  // ─── Preservation / Archive Flags (default: true) ────────────────────────
  /** Phase 1 — Controls visibility of the Live Feed route and nav item */
  LIVE_FEED: boolean;
  /** Phase 1 — Controls visibility of the Creators routes and nav item */
  CREATORS: boolean;
  /** Phase 1 — Controls visibility of the For Schools route and nav item */
  SCHOOLS: boolean;
  /** Phase 1 — Controls visibility of the Agent Ops admin route and nav item */
  AGENT_OPS: boolean;
  /** Phase 1 — Controls visibility of the Live Athletes admin route and nav item */
  LIVE_ATHLETE_ADMIN: boolean;
  /** Phase 1 — Controls visibility of public Stripe payment links */
  PUBLIC_STRIPE_SUPPORT: boolean;
  /** Phase 1 — Controls visibility of the youth media upload pipeline */
  YOUTH_MEDIA_UPLOADS: boolean;
}

export const FEATURE_FLAGS: FeatureFlags = {
  // V1 flags — off until explicitly enabled
  NEXTUP_V1_PUBLIC_NAV: false,
  NEXTUP_V1_START_FLOW: false,
  NEXTUP_V1_PRIVATE_APP: false,
  NEXTUP_V1_NAVIGATOR: false,
  NEXTUP_V1_PATHWAYS: false,
  NEXTUP_V1_TRUST: false,
  NEXTUP_V1_OUTCOMES: false,

  // Preservation flags — on until explicitly hidden
  LIVE_FEED: true,
  CREATORS: true,
  SCHOOLS: true,
  AGENT_OPS: true,
  LIVE_ATHLETE_ADMIN: true,
  PUBLIC_STRIPE_SUPPORT: true,
  YOUTH_MEDIA_UPLOADS: true,
};

// Intended future phase mapping for documentation purposes
export const FLAG_PHASE_MAPPING: Record<keyof FeatureFlags, string> = {
  NEXTUP_V1_PUBLIC_NAV: 'Phase 1 — Simplify',
  NEXTUP_V1_START_FLOW: 'Phase 2 — Convey',
  NEXTUP_V1_PRIVATE_APP: 'Phase 2 — Convey',
  NEXTUP_V1_NAVIGATOR: 'Phase 3 — Trust',
  NEXTUP_V1_PATHWAYS: 'Phase 4 — Navigate',
  NEXTUP_V1_TRUST: 'Phase 3 — Trust',
  NEXTUP_V1_OUTCOMES: 'Phase 5 — Learn',
  LIVE_FEED: 'Phase 1 — Simplify (hide)',
  CREATORS: 'Phase 1 — Simplify (archive)',
  SCHOOLS: 'Phase 1 — Simplify (archive)',
  AGENT_OPS: 'Phase 1 — Simplify (hide)',
  LIVE_ATHLETE_ADMIN: 'Phase 1 — Simplify (hide)',
  PUBLIC_STRIPE_SUPPORT: 'Phase 1 — Simplify (hide)',
  YOUTH_MEDIA_UPLOADS: 'Phase 1 — Simplify (preserve in youth section)',
};

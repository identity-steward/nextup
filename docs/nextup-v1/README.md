# NextUp Memphis — Phase 0 Documentation Index

**Created:** 2026-08-08
**Purpose:** Pre-v1.0 baseline documentation for the NextUp Memphis application

This directory contains the complete Phase 0 baseline documentation for the NextUp Memphis application before the v1.0 Pilot 001 transition. These documents capture the exact state of the application as of 2026-08-08 and serve as the reference point for all future phases.

---

## Documentation Files

| Document | Purpose |
|---|---|
| [Route Baseline](./route-baseline.md) | Complete inventory of all routes, their auth requirements, nav visibility, and Phase 1 classifications |
| [Database Baseline](./database-baseline.md) | All 29 database tables with schemas, RLS status, policies, row counts, and Pilot 001 dispositions |
| [Security / RLS Baseline](./security-baseline.md) | Full access-control posture, policy details, storage policies, database functions, and access matrix |
| [Auth Baseline](./auth-baseline.md) | Current roles, AuthContext behavior, ProtectedRoute behavior, sign-in/out flows |
| [Regression Checklist](./regression-checklist.md) | Regression checks that must pass through all later phases (build, auth, youth, admin, payments, data, security, document boundary) |
| [Dependency / Environment Baseline](./dependency-baseline.md) | All framework/package versions, Stripe approach, media approach, env var inventory, edge function inventory |

## Feature Flag Configuration

| File | Purpose |
|---|---|
| `src/config/features.ts` | Centralized feature flag configuration — 14 flags (7 v1 flags default false, 7 preservation flags default true). Not imported by any component in Phase 0. |

---

## Visual Baseline List

The following routes should be captured as before-state visual references for later comparison:

| Route | Description | Capture Method |
|---|---|---|
| `/` | Homepage with hero, athlete showcase, CTAs | Manual screenshot required |
| `/athletes` | Athlete listing page | Manual screenshot required |
| `/athletes/:slug` | Individual athlete profile page | Manual screenshot required |
| `/signin` | Sign-in page | Manual screenshot required |
| `/dashboard` | Participant/parent dashboard (requires auth) | Manual screenshot required |
| `/admin` | Admin dashboard (requires admin auth) | Manual screenshot required |

**Note:** Automated screenshot capture is not available in this environment. Screenshots must be captured manually from the running dev server. These are before-state references only — no redesign is implied.

---

## Phase 0 Completion Summary

- **Snapshot:** Created at `/tmp/cc-agent/60974817/nextup-pre-v1-pilot001-20260808` with 190 files and SHA-256 manifest
- **Build:** Production build passes (pre-existing chunk-size warning)
- **Typecheck:** 1 pre-existing error (unused `EntryIcon` import)
- **Lint:** 11 errors, 8 warnings (all pre-existing)
- **Database:** 29 tables, all with RLS enabled, no schema changes
- **Security:** No policies changed, all functions SECURITY INVOKER with hardened search_path
- **Auth:** 3 roles (admin, athlete, parent), no changes
- **Feature Flags:** 14 flags created, all defaulting to current behavior, not imported anywhere
- **Data:** All row counts match Phase 1 audit — no discrepancies
- **Code Changes:** Only `src/config/features.ts` added — no existing files modified

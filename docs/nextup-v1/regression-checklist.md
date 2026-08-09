# Youth Platform Regression Checklist — NextUp Memphis v1.0

**Created:** 2026-08-08
**Purpose:** Regression checks that must pass through all later phases

---

## BUILD

- [ ] Production build passes (`npm run build` exits 0)
- [ ] TypeScript typecheck passes (`npm run typecheck` — baseline: 1 pre-existing error in AdminJourneyEntriesPage.tsx, `EntryIcon` unused)
- [ ] Lint passes (`npm run lint` — baseline: 11 errors, 8 warnings, all pre-existing)
- [ ] No new build warnings introduced
- [ ] No new typecheck errors introduced
- [ ] No new lint errors introduced

## AUTH

- [ ] Anonymous user can access public routes (`/`, `/athletes`, `/athletes/:slug`, `/sponsors`, `/about`, `/contact`)
- [ ] Anonymous user is redirected to `/signin` when accessing protected routes (`/dashboard`, `/profile-setup`, `/admin/*`)
- [ ] Sign-in page accepts email/password and authenticates via Supabase
- [ ] Successful sign-in redirects to role-appropriate dashboard (`/admin` for admin, `/dashboard` for others)
- [ ] Sign-out clears session and redirects to `/`
- [ ] Non-admin user sees "Access Restricted" page when accessing `/admin/*` routes
- [ ] Admin user can access all `/admin/*` routes
- [ ] Header shows correct auth state (Sign In/Get Started when logged out, Dashboard/Sign Out when logged in)

## YOUTH & OPPORTUNITY

- [ ] Athlete list page (`/athletes`) displays active athletes
- [ ] Athlete profile page (`/athletes/:slug`) displays individual athlete details
- [ ] Media/highlights display on athlete profiles (approved media only)
- [ ] Tags/traits display on athlete profiles (visibility tags + athlete tags)
- [ ] Profile update workflow: authenticated user can submit a profile update request
- [ ] Profile update workflow: admin can review and approve/reject profile update requests
- [ ] Media approval: admin can review and approve/reject media uploads
- [ ] Journey functionality: journey entries display on athlete profiles (approved/public entries)
- [ ] Journey functionality: admin can manage journey entries

## ADMIN

- [ ] Admin dashboard (`/admin`) loads and displays stats
- [ ] Athlete management (`/admin/athletes`) displays athlete signups
- [ ] Intake review (`/admin/intake`) displays parent intake submissions
- [ ] Profile update review (`/admin/profile-updates`) displays pending update requests
- [ ] Media review (`/admin/media`) displays pending media uploads
- [ ] Journey management (`/admin/journey`) displays journey entries
- [ ] Admin sidebar navigation works for all defined routes
- [ ] Admin sidebar dead links (`/admin/creators`, `/admin/teams`, `/admin/media-passes`, `/admin/supporters`) redirect to `/` (pre-existing defect, not a regression)

## PAYMENTS

- [ ] Stripe configuration in `src/config/stripeLinks.ts` remains intact
- [ ] Support plans table data remains intact (11 rows)
- [ ] No requirement to perform a real payment test
- [ ] Edge function `stripe-webhook` remains deployed and active

## DATA

- [ ] Baseline row counts remain unchanged unless an authorized later migration explains the difference:
  - athletes: 7
  - creators: 1
  - user_profiles: 6
  - visibility_tags: 48
  - athlete_tags: 20
  - journey_entries: 10
  - media_uploads: 4
  - consents: 4
  - profile_update_requests: 8
  - support_plans: 11
  - sab_ids: 3
  - media_tags: 2
  - athlete_signups: 2
  - event_codes: 1
  - All other tables: 0

## SECURITY

- [ ] RLS remains enabled on all 29 public tables
- [ ] RLS remains enabled on all 8 storage tables
- [ ] No new anonymous access has been introduced
- [ ] No cross-user access regression (athlete A cannot read athlete B's private data)
- [ ] No SECURITY DEFINER functions have been introduced
- [ ] All database functions retain hardened search_path
- [ ] Parent→athlete broad-update policy remains unchanged (KNOWN FUTURE AUTHORITY REFACTOR)

## DOCUMENT BOUNDARY CHECK — MANDATORY

- [ ] Youth media uploads remain intact and accessible via the existing Youth & Opportunity media workflow
- [ ] No new general document-upload pathway has been created outside the existing Youth & Opportunity media workflow
- [ ] No Pilot 001 sensitive-document storage has been introduced (no medical, school, legal, insurance, benefit, ID, or court record storage)
- [ ] YOUTH_MEDIA_UPLOADS feature flag remains `true` (or, if set to `false` in a later phase, the youth media workflow is explicitly hidden, not replaced by a Pilot 001 document vault)
- [ ] The existing media storage buckets (`athlete-photos`, `athlete-videos`, `profile-assets`) are not repurposed for Pilot 001 document storage
- [ ] No new storage buckets have been created for Pilot 001 document storage

# Route Baseline — NextUp Memphis Pre-v1.0

**Captured:** 2026-08-08
**Source:** `src/App.tsx`, `src/components/Header.tsx`, `src/components/DashboardLayout.tsx`

---

## Public Routes

| Route | Page Component | Auth | Role | Nav Visible | Redirect Behavior | Phase 1 Classification |
|---|---|---|---|---|---|---|
| `/` | `HomePage` | Public | None | Yes (Home) | — | KEEP_MODIFY |
| `/athletes` | `AthletesPage` | Public | None | Yes (Athletes) | — | KEEP_MODIFY (re-route to `/youth`) |
| `/athletes/jacob-fouse` | `JacobFousePage` | Public | None | No (direct link only) | — | ARCHIVE (generalize pattern) |
| `/athletes/:slug` | `AthleteProfilePage` | Public | None | No (via athlete list) | — | KEEP_MODIFY (re-route to `/youth/:slug`) |
| `/signup` | `SignupPage` | Public | None | Yes (Get Started button) | — | REDIRECT (to `/start`) |
| `/signup/player` | `JoinPage` | Public | None | No (via `/signup`) | — | REDIRECT (to `/start`) |
| `/signup/parent` | `ParentIntakePage` | Public | None | No (via `/signup`) | — | REDIRECT (to `/start`) |
| `/live-feed` | `LiveFeedPage` | Public | None | Yes (Live Feed, with radio icon) | — | HIDE_PILOT001 |
| `/creators` | `CreatorsPage` | Public | None | Yes (Creators) | — | ARCHIVE |
| `/creators/:slug` | `CreatorProfilePage` | Public | None | No (via creator list) | — | ARCHIVE |
| `/sponsors` | `SponsorsPage` | Public | None | Yes (Sponsors) | — | KEEP_MODIFY (merge into `/partners`) |
| `/support` | `SupportPage` | Public | None | No (direct link only) | — | MOVE (merge into `/partners`) |
| `/contact` | `ContactPage` | Public | None | No (footer link) | — | KEEP |
| `/about` | `AboutPage` | Public | None | Yes (About) | — | KEEP_MODIFY (rewrite as `/method`) |
| `/schools` | `ForSchoolsPage` | Public | None | No (direct link only) | — | ARCHIVE |
| `/demo` | `HackathonDemoPage` | Public | None | No | — | HIDE_PILOT001 |
| `/thank-you` | `ThankYouPage` | Public | None | No (post-Stripe redirect) | — | KEEP |
| `/creator` | `CreatorPage` | Public | None | No | — | ARCHIVE |

## Legacy Redirects

| Route | Redirects To | Phase 1 Classification |
|---|---|---|
| `/join` | `/signup/player` (replace) | REDIRECT (update to `/start`) |
| `/parent-intake` | `/signup/parent` (replace) | REDIRECT (update to `/start`) |

## Auth Route

| Route | Page Component | Auth | Role | Nav Visible | Redirect Behavior | Phase 1 Classification |
|---|---|---|---|---|---|---|
| `/signin` | `SignInPage` | Public | None | Yes (Sign In, when logged out) | — | KEEP |

## Protected Routes

| Route | Page Component | Auth | Role | Nav Visible | Redirect Behavior | Phase 1 Classification |
|---|---|---|---|---|---|---|
| `/profile-setup` | `ProfileSetupPage` | Authenticated | Any | No (post-signup) | Redirects to `/signin` if not authenticated | KEEP_MODIFY |
| `/dashboard` | `AthleteDashboardPage` | Authenticated | Any | Yes (My Dashboard, when logged in) | Redirects to `/signin` if not authenticated | KEEP_MODIFY (restructure to `/app`) |

## Admin Routes

| Route | Page Component | Auth | Role | Nav Visible | Redirect Behavior | Phase 1 Classification |
|---|---|---|---|---|---|---|
| `/admin` | `AdminDashboardPage` | Authenticated | admin | Yes (Admin, when admin logged in) | Shows "Access Restricted" if not admin | KEEP_MODIFY |
| `/admin/athletes` | `AdminAthletesPage` | Authenticated | admin | Yes (Athlete Signups) | Shows "Access Restricted" if not admin | KEEP_MODIFY (re-route to `/admin/youth`) |
| `/admin/intake` | `AdminParentIntakePage` | Authenticated | admin | Yes (Parent Intake) | Shows "Access Restricted" if not admin | KEEP_MODIFY (reframe as narration review) |
| `/admin/agent-ops` | `AdminAgentOpsPage` | Authenticated | admin | Yes (Agent Ops) | Shows "Access Restricted" if not admin | HIDE_PILOT001 |
| `/admin/profile-updates` | `AdminProfileUpdatesPage` | Authenticated | admin | Yes (Profile Updates) | Shows "Access Restricted" if not admin | KEEP |
| `/admin/media` | `AdminMediaPage` | Authenticated | admin | Yes (Media Review) | Shows "Access Restricted" if not admin | KEEP_MODIFY |
| `/admin/live-athletes` | `AdminLiveAthletesPage` | Authenticated | admin | Yes (Athletes) | Shows "Access Restricted" if not admin | HIDE_PILOT001 |
| `/admin/journey` | `AdminJourneyEntriesPage` | Authenticated | admin | Yes (Journey Entries) | Shows "Access Restricted" if not admin | KEEP_MODIFY |

## Catch-all

| Route | Behavior | Phase 1 Classification |
|---|---|---|
| `*` (any unmatched) | `Navigate to "/"` (replace) | KEEP |

---

## Admin Sidebar Dead Links — PRE-EXISTING DEFECTS

The `DashboardLayout` component defines navigation links to routes that do NOT exist in `App.tsx`. Clicking these links navigates to the catch-all route which redirects to `/`.

| Sidebar Label | Link Target | Issue | Status |
|---|---|---|---|
| Creator Applications | `/admin/creators` | Route does not exist in App.tsx | PRE-EXISTING DEFECT — Do not fix in Phase 0 |
| Team Inquiries | `/admin/teams` | Route does not exist in App.tsx | PRE-EXISTING DEFECT — Do not fix in Phase 0 |
| Media Pass Requests | `/admin/media-passes` | Route does not exist in App.tsx | PRE-EXISTING DEFECT — Do not fix in Phase 0 |
| Supporter Signups | `/admin/supporters` | Route does not exist in App.tsx | PRE-EXISTING DEFECT — Do not fix in Phase 0 |

---

## Public Navigation Items (Header.tsx)

The public header navigation contains these items:

| Label | Path | Phase 1 Classification |
|---|---|---|
| Home | `/` | KEEP_MODIFY |
| Athletes | `/athletes` | KEEP_MODIFY (rename to Youth & Opportunity, re-route to `/youth`) |
| Creators | `/creators` | ARCHIVE (remove from nav) |
| Live Feed | `/live-feed` | HIDE_PILOT001 (remove from nav) |
| Sponsors | `/sponsors` | KEEP_MODIFY (rename to For Partners, re-route to `/partners`) |
| About | `/about` | KEEP_MODIFY (rename to Our Method, re-route to `/method`) |

Auth-area buttons:
- When logged out: "Sign In" (`/signin`), "Get Started" (`/signup`)
- When logged in: "My Dashboard" or "Admin" (role-dependent), "Sign Out"

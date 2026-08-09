# Dependency / Environment Baseline — NextUp Memphis Pre-v1.0

**Captured:** 2026-08-08
**Source:** `package.json`, `.env`, Supabase MCP `list_edge_functions`, `list_edge_function_secrets`

---

## Framework and Library Versions

### Core Dependencies

| Package | Version | Purpose | Notes |
|---|---|---|---|
| react | ^18.3.1 | UI framework | Current major (18) |
| react-dom | ^18.3.1 | React DOM renderer | Matches React |
| react-router-dom | ^6.30.3 | Client-side routing | v6 (v7 is available) |
| @supabase/supabase-js | ^2.57.4 | Supabase client | v2 |
| lucide-react | ^0.344.0 | Icon library | Used throughout for icons |

### Dev Dependencies

| Package | Version | Purpose | Notes |
|---|---|---|---|
| vite | ^5.4.2 | Build tool / dev server | v5 (v6 is available) |
| typescript | ^5.5.3 | Type checking | v5 |
| tailwindcss | ^3.4.1 | CSS framework | v3 (v4 is available) |
| postcss | ^8.4.35 | CSS processing | Required by Tailwind |
| autoprefixer | ^10.4.18 | CSS vendor prefixing | Required by Tailwind |
| eslint | ^9.9.1 | Linting | v9 flat config |
| @eslint/js | ^9.9.1 | ESLint JS config | |
| typescript-eslint | ^8.3.0 | TypeScript ESLint rules | |
| eslint-plugin-react-hooks | ^5.1.0-rc.0 | React hooks lint rules | Release candidate |
| eslint-plugin-react-refresh | ^0.4.11 | React Refresh lint rules | |
| globals | ^15.9.0 | Global variable definitions | |
| @vitejs/plugin-react | ^4.3.1 | Vite React plugin | |
| @types/react | ^18.3.5 | React type definitions | |
| @types/react-dom | ^18.3.0 | React DOM type definitions | |

### Not Installed (Notable Absences)

| Package | Why Notable | Status |
|---|---|---|
| Stripe SDK (stripe / @stripe/stripe-js) | Stripe is handled via payment links + edge functions, no client SDK | Not needed for current approach |
| Testing framework (vitest, jest, etc.) | No automated tests exist | Deferred — no testing framework to be introduced in Phase 0 |
| Analytics (posthog, mixpanel, etc.) | No analytics tracking | Not present |
| AI/ML SDK (openai, anthropic, etc.) | Agent code is custom, no SDK | Not present |
| Media processing (sharp, etc.) | Uses Supabase storage directly | Not present |

---

## Build / Lint / Typecheck Commands

| Command | Script | Notes |
|---|---|---|
| `npm run dev` | `vite` | Dev server (auto-started by harness) |
| `npm run build` | `vite build` | Production build |
| `npm run lint` | `eslint .` | Lint check |
| `npm run typecheck` | `tsc --noEmit -p tsconfig.app.json` | Type checking |
| `npm run preview` | `vite preview` | Preview production build |

---

## Stripe Approach

- **Client-side:** No Stripe SDK installed. Uses Stripe Payment Links (buy.stripe.com URLs) configured in `src/config/stripeLinks.ts`
- **Server-side:** Edge function `stripe-webhook` handles Stripe webhook events
- **Database:** `support_plans`, `payments`, `support_access` tables store plan definitions and payment records
- **No live payment testing required** during Phase 0 or regression checks

## Media / Upload Approach

- **Storage:** Supabase Storage with 3 public buckets: `athlete-photos`, `athlete-videos`, `profile-assets`
- **Upload:** Client-side upload via Supabase client, stored in bucket with folder naming by user ID
- **Metadata:** `media_uploads` table tracks upload status (pending/approved/rejected), uploader, athlete association
- **Tags:** `media_tags` links media to visibility tags
- **Approval:** Admin reviews and approves/rejects media via `/admin/media`

## Agent Code Dependencies

- **Location:** `src/agents/` (9 agent directories), `src/services/*AgentService.ts` (6 service files), `src/services/agentRunner.ts`, `src/services/taskService.ts`
- **Dependencies:** No external AI/ML packages. Agent code is custom TypeScript that orchestrates Supabase queries and edge functions.
- **Pilot 001 Disposition:** ARCHIVE_FUNCTIONALITY — agent code will be feature-flagged off, not deleted

## Analytics Packages

- None installed. No analytics tracking of any kind.

## Test Framework Status

- **No testing framework is installed.**
- **No test files exist.**
- Lint (`npm run lint`) and typecheck (`npm run typecheck`) are the only automated code quality checks.
- Phase 0 does NOT introduce a testing framework.

---

## Environment Variable Inventory

**Variable NAMES only. No secret values are documented.**

### Client-Side (in `.env`)

| Variable Name | Classification | Purpose |
|---|---|---|
| `VITE_SUPABASE_URL` | CORE | Supabase project URL |
| `VITE_SUPABASE_ANON_KEY` | CORE | Supabase anonymous API key |

### Edge Function Secrets (configured in Supabase)

| Variable Name | Classification | Purpose |
|---|---|---|
| `SUPABASE_URL` | CORE | Supabase project URL (server-side) |
| `SUPABASE_ANON_KEY` | CORE | Supabase anon key (server-side) |
| `SUPABASE_SERVICE_ROLE_KEY` | CORE | Supabase service role key (server-side) |
| `SUPABASE_DB_URL` | CORE | Direct Postgres connection string |
| `STRIPE_WEBHOOK_SECRET` | PILOT_LATER | Stripe webhook signature verification |
| `SUPABASE_PUBLISHABLE_KEYS` | CORE | Supabase publishable keys |
| `SUPABASE_SECRET_KEYS` | CORE | Supabase secret keys |
| `SUPABASE_JWKS` | CORE | Supabase JWT verification keys |
| `RESEND_API_KEY` | CORE | Resend email service API key (used by email edge functions) |
| `FROM_EMAIL` | CORE | Sender email address for outgoing emails |
| `APP_URL` | CORE | Application URL for email links/redirects |

No variables are classified as ARCHIVED_FEATURE or UNKNOWN.
No secrets are rotated or modified during Phase 0.

---

## Edge Function Inventory

| Function Name | Slug | Purpose | JWT Verification | External Dependency | Pilot 001 Disposition |
|---|---|---|---|---|---|
| Stripe Webhook | `stripe-webhook` | Handles Stripe checkout webhooks, records payments | false (disabled) | Stripe (via webhook signature) | LEAVE_UNTOUCHED (hide public links, keep function) |
| Send Welcome Email | `send-welcome-email` | Sends welcome email to new users | false (disabled) | Resend (email API) | LEAVE_UNTOUCHED |
| Send Profile Approved Email | `send-profile-approved-email` | Notifies athlete/parent when profile is approved | false (disabled) | Resend (email API) | LEAVE_UNTOUCHED |
| Send Profile Update Reviewed Email | `send-profile-update-reviewed-email` | Notifies user when profile update is reviewed | false (disabled) | Resend (email API) | LEAVE_UNTOUCHED |

**Note:** All edge functions have `verifyJWT=false`. They rely on other authentication mechanisms (webhook signatures, Supabase service role key, or internal calls).

No edge functions are modified during Phase 0.

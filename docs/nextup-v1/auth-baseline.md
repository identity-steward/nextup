# Auth Baseline — NextUp Memphis Pre-v1.0

**Captured:** 2026-08-08
**Source:** `src/context/AuthContext.tsx`, `src/components/ProtectedRoute.tsx`, `src/lib/supabase.ts`

---

## Current Roles

The application supports 3 roles stored in `user_profiles.role` and optionally in `user.app_metadata.role`:

| Role | Source | Usage |
|---|---|---|
| `admin` | `user_profiles.role` or `user.app_metadata.role` | Full admin access to `/admin/*` routes |
| `athlete` | `user_profiles.role` | Self-access to own athlete profile and `/dashboard` |
| `parent` | `user_profiles.role` | Linked access to child's athlete profile and `/dashboard` |

**No other roles exist.** Navigator, participant, multi-role, and NavigatorAssignment do NOT exist and will NOT be introduced in Phase 0.

---

## AuthContext Behavior

**File:** `src/context/AuthContext.tsx`

### State
- `session`: Supabase session object (null if not logged in)
- `user`: Supabase user object (null if not logged in)
- `profile`: UserProfile object from `user_profiles` table (null if not loaded or not logged in)
- `loading`: Boolean, true during initial session/profile fetch
- `isAdmin`: True if `user.app_metadata.role === 'admin'` OR `profile.role === 'admin'`
- `isAthlete`: True if `profile.role === 'athlete'`
- `isParent`: True if `profile.role === 'parent'`

### Profile Shape
```typescript
interface UserProfile {
  id: string;
  role: 'admin' | 'athlete' | 'parent';
  athlete_id: string | null;
  display_name: string;
  phone: string;
}
```

### Initialization
1. On mount, calls `supabase.auth.getSession()` to restore any existing session
2. If session exists, fetches the user's profile from `user_profiles` by `id = auth.uid()`
3. Sets `loading` to false after profile fetch (or immediately if no session)
4. Subscribes to `supabase.auth.onAuthStateChange` to react to sign-in/sign-out events
5. On auth state change with a session, fetches the profile asynchronously

### signOut
- Calls `supabase.auth.signOut()`
- Clears `profile` state to null
- Session is cleared by the auth state change listener

### refreshProfile
- Re-fetches the profile from `user_profiles` for the current session user
- Used after profile updates to refresh the context

### Mock Supabase Fallback
When `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` are not set, `src/lib/supabase.ts` creates a mock client that:
- Returns null sessions and users
- Returns error objects for all queries
- Provides stub auth methods (signInWithPassword returns error, signOut succeeds)
- Shows a "Running in local preview mode" banner in App.tsx

---

## ProtectedRoute Behavior

**File:** `src/components/ProtectedRoute.tsx`

### Props
- `children`: ReactNode to render if access is granted
- `requireAdmin`: Boolean (default false) — if true, requires admin role

### Logic
1. **Loading state**: Shows a spinner (gold border, transparent top) while `loading` is true
2. **Not authenticated**: If `session` is null, redirects to `/signin` with the current location in state (for post-login redirect)
3. **Admin check**: If `requireAdmin` is true, checks `user.app_metadata.role`:
   - If role is NOT `admin`, shows an "Access Restricted" page with a "Back to Home" link
   - If role IS `admin`, renders the children
4. **Non-admin protected routes** (requireAdmin=false): Renders children for any authenticated user

### Routes Using ProtectedRoute

| Route | requireAdmin | Who Can Access |
|---|---|---|
| `/profile-setup` | false | Any authenticated user |
| `/dashboard` | false | Any authenticated user (athlete or parent) |
| `/admin` | true | Admin only |
| `/admin/athletes` | true | Admin only |
| `/admin/intake` | true | Admin only |
| `/admin/agent-ops` | true | Admin only |
| `/admin/profile-updates` | true | Admin only |
| `/admin/media` | true | Admin only |
| `/admin/live-athletes` | true | Admin only |
| `/admin/journey` | true | Admin only |

---

## Sign-In Behavior

**File:** `src/pages/SignInPage.tsx`

- Uses Supabase email/password authentication
- On success, redirects to the location stored in `location.state.from` (if redirected from a protected route) or to the role-appropriate dashboard (`/admin` for admin, `/dashboard` for others)
- On failure, shows error message

## Sign-Out Behavior

- Header "Sign Out" button calls `signOut()` from AuthContext
- After sign-out, navigates to `/`
- Session and profile are cleared

## Sign-Up Behavior

- `/signup` (SignupPage) — role selection (athlete or parent)
- `/signup/player` (JoinPage) — athlete signup with event code
- `/signup/parent` (ParentIntakePage) — parent intake form
- After signup, user is redirected to `/profile-setup` (protected route)

---

## Header Navigation Auth Behavior

**File:** `src/components/Header.tsx`

- **Logged out:** Shows "Sign In" link and "Get Started" button (links to `/signup`)
- **Logged in:** Shows "My Dashboard" (non-admin) or "Admin" (admin) link, and "Sign Out" button
- Dashboard path: `isAdmin ? '/admin' : '/dashboard'`
- Dashboard label: `isAdmin ? 'Admin' : 'My Dashboard'`

---

## Confirmation

No authentication behavior was changed during Phase 0.
No new roles were introduced.
No auth-related code was modified.

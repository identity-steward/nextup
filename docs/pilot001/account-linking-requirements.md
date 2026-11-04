# Account-Linking Requirements for Jacob's Premium Profile

**Status:** Read-only findings. No changes to auth_user_id, accounts, or migrations were made.

## Current State

| Field | Value |
|---|---|
| `auth_user_id` | `d66b5b02-a768-4584-ada5-ab5ed5d433a8` |
| `identity_confirmed_at` | null |
| `identity_confirmed_by` | null |
| `identity_confirmation_method` | null |
| `created_by_user_id` | null |
| `managed_by_parent_id` | null |
| `person_id` | null |

The `auth_user_id` on Jacob's athlete record appears to be an admin account (same UUID appears as `approved_by` on other athletes' media uploads). No personal athlete or guardian account is linked.

## Requirements for Secure Login-to-Profile Connection

1. **Create a separate auth account** for Jacob's parent/guardian (or Jacob himself, if age-appropriate) via standard Supabase email/password signup.

2. **Use the existing `link_athlete_profile` database function** to associate the new auth account with Jacob's athlete record. This function exists in the database (migration `20260812000440_add_link_athlete_profile_function.sql`) and is designed for this purpose.

3. **Do NOT reassign the existing `auth_user_id`** — the admin account should remain as the original creator/approver. The new account should be linked via `created_by_user_id` or `managed_by_parent_id` instead.

4. **Perform identity verification** after linking:
   - Set `identity_confirmed_at`, `identity_confirmed_by`, and `identity_confirmation_method` on the athletes table
   - This must be done by an admin (privileged fields are protected by RLS — athletes cannot self-verify)
   - Verification method should be documented (e.g., "admin_verified_guardian_email", "in_person_guardian_confirmation")

5. **Establish media consent** before publishing any photos or videos:
   - Create a `consents` row with `consent_status='granted'` and `can_use_name_image_likeness=true`
   - This must be signed/submitted by the verified guardian
   - Without this, the consent-gated image resolver will block Jacob's photo from displaying

6. **Set `stripe_payment_link`** only after:
   - The guardian account is linked and verified
   - A Stripe payment link has been created and tested
   - The link is validated via `safePaymentLink()` (must be on `buy.stripe.com` or `checkout.stripe.com`)

7. **Expose profile editing** by wiring the existing `ProfileUpdateModal` into the premium profile (already done in this restoration). The modal writes to `profile_update_requests` which are reviewed by admin before changes are applied — this is the correct flow for unverified or newly-linked accounts.

## What Was NOT Changed

- No auth accounts created or modified
- No `auth_user_id` reassigned
- No identity verification fields set
- No consent records created
- No `stripe_payment_link` set on the athlete record
- No migrations applied

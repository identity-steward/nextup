/*
  STRIPE PAYMENT LINKS CONFIG
  ===========================
  Paste your existing Stripe Payment Link URLs here.
  These are the "buy.stripe.com/..." links from your Stripe Dashboard.

  HOW TO FIND YOUR LINKS:
    Stripe Dashboard → Payment Links → copy the URL for each product

  HOW TO MAP TO ATHLETES:
    Each support_plans row in Supabase has a `stripe_payment_link_url` column.
    After seeding, update those rows with these same URLs so the webhook can
    reverse-map a completed checkout back to a plan + athlete.

  HOW TO ADD YOUR WEBHOOK SECRET:
    In Supabase Edge Function secrets (Dashboard → Edge Functions → Secrets):
      STRIPE_SECRET_KEY      = sk_live_... or sk_test_...
      STRIPE_WEBHOOK_SECRET  = whsec_...
*/

export const STRIPE_LINKS = {
  // ─── Jacob Fouse – monthly recurring support ───────────────────────────────
  SUPPORT_JACOB_5: 'https://buy.stripe.com/aFa3cwdgbfQy1FKbkg6Na00',   // $5/month – Fan Support
  SUPPORT_JACOB_10: 'https://buy.stripe.com/fZu9AUb8347Q1FK7406Na01',  // $10/month – Athlete Booster

  // ─── One-time gifts for Jacob ───────────────────────────────────────────────
  SUPPORT_JACOB_GIFT_20: 'https://buy.stripe.com/4gM7sM2Bx5bU3NS1JG6Na03', // $20 Highlight Boost
  SUPPORT_JACOB_GIFT_25: 'https://buy.stripe.com/4gM7sM7VRgUC4RWbkg6Na02', // $25 Gift

  // ─── Platform & sponsor links (PASTE YOUR LINKS BELOW) ─────────────────────
  // SUPPORT_PLATFORM_LINK: 'https://buy.stripe.com/YOUR_LINK_HERE',
  // SPONSOR_ATHLETE_LINK:  'https://buy.stripe.com/YOUR_LINK_HERE',
  // CREATOR_SUPPORT_LINK:  'https://buy.stripe.com/YOUR_LINK_HERE',

  SUPPORT_PLATFORM_LINK: null as string | null,  // Coming soon
  SPONSOR_ATHLETE_LINK:  null as string | null,  // Coming soon
  CREATOR_SUPPORT_LINK:  null as string | null,  // Coming soon
} as const;

/*
  THANK-YOU PAGE REDIRECT
  ========================
  In your Stripe Dashboard, set the "Confirmation page" for each Payment Link to:
    Custom URL → https://yourdomain.com/?page=thank-you&plan=PLAN_CODE

  Example for Jacob $5 plan:
    https://yourdomain.com/?page=thank-you&plan=jacob_fan&athlete=jacob-fouse

  This lets the Thank You page show the right athlete and plan name.
*/

export const THANK_YOU_BASE_PATH = '/?page=thank-you';

/*
  ATHLETE SLUG → PAYMENT LINK MAPPING
  =====================================
  Used by the webhook to reverse-map a completed checkout to an athlete.
  Key = stripe_payment_link_url, Value = { athleteSlug, planCode }
*/
export const STRIPE_LINK_TO_PLAN_MAP: Record<string, { athleteSlug: string; planCode: string }> = {
  'https://buy.stripe.com/aFa3cwdgbfQy1FKbkg6Na00': { athleteSlug: 'jacob-fouse', planCode: 'jacob_fan_5' },
  'https://buy.stripe.com/fZu9AUb8347Q1FK7406Na01': { athleteSlug: 'jacob-fouse', planCode: 'jacob_booster_10' },
  'https://buy.stripe.com/4gM7sM2Bx5bU3NS1JG6Na03': { athleteSlug: 'jacob-fouse', planCode: 'jacob_gift_20' },
  'https://buy.stripe.com/4gM7sM7VRgUC4RWbkg6Na02': { athleteSlug: 'jacob-fouse', planCode: 'jacob_gift_25' },
};

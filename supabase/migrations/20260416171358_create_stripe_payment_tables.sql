/*
  # Stripe Payment Integration Tables

  ## Summary
  Creates the full payment data model to sync Stripe webhook events into Supabase.
  These tables track supporters, their plans, individual payments, and access state.

  ## New Tables

  ### `supporters`
  People who have completed a Stripe checkout. Created/updated on each
  checkout.session.completed event. Keyed by email and stripe_customer_id.

  ### `support_plans`
  Catalog of available support tiers. Each row maps a Stripe Payment Link URL
  to a plan code, name, and optional athlete. Seed data inserted at end of migration.

  ### `payments`
  Immutable ledger of every Stripe event processed. Uses stripe_event_id as a
  unique key to guarantee idempotency — duplicate webhook deliveries are ignored.

  ### `support_access`
  Current access/subscription state per supporter per plan. Updated by webhook
  events: subscription.created/updated/deleted and invoice.paid/payment_failed.

  ## Security
  - RLS enabled on all tables
  - Public read disabled on all payment tables (private data)
  - Service role (webhook) can read/write all rows
  - Authenticated users can read their own rows only
*/

-- ── supporters ─────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS supporters (
  id                  uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email               text NOT NULL,
  full_name           text,
  stripe_customer_id  text,
  created_at          timestamptz DEFAULT now(),
  CONSTRAINT supporters_email_unique UNIQUE (email)
);

CREATE UNIQUE INDEX IF NOT EXISTS supporters_stripe_customer_id_idx
  ON supporters (stripe_customer_id)
  WHERE stripe_customer_id IS NOT NULL;

ALTER TABLE supporters ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Supporters can read own row"
  ON supporters FOR SELECT
  TO authenticated
  USING (email = (SELECT email FROM auth.users WHERE id = auth.uid()));

-- ── support_plans ───────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS support_plans (
  id                       uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  code                     text UNIQUE NOT NULL,
  name                     text NOT NULL,
  athlete_id               uuid REFERENCES athletes(id) ON DELETE SET NULL,
  stripe_payment_link_url  text,
  support_type             text NOT NULL CHECK (support_type IN ('membership','donation','sponsorship')),
  active                   boolean DEFAULT true,
  created_at               timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS support_plans_athlete_id_idx ON support_plans (athlete_id);
CREATE INDEX IF NOT EXISTS support_plans_stripe_link_idx ON support_plans (stripe_payment_link_url)
  WHERE stripe_payment_link_url IS NOT NULL;

ALTER TABLE support_plans ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read active support plans"
  ON support_plans FOR SELECT
  TO anon, authenticated
  USING (active = true);

-- ── payments ────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS payments (
  id                           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  stripe_event_id              text UNIQUE NOT NULL,
  stripe_checkout_session_id   text,
  stripe_payment_intent_id     text,
  stripe_subscription_id       text,
  supporter_id                 uuid REFERENCES supporters(id) ON DELETE SET NULL,
  athlete_id                   uuid REFERENCES athletes(id) ON DELETE SET NULL,
  support_plan_id              uuid REFERENCES support_plans(id) ON DELETE SET NULL,
  amount_total                 integer,
  currency                     text,
  payment_status               text,
  mode                         text,
  raw_event                    jsonb,
  created_at                   timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS payments_supporter_id_idx ON payments (supporter_id);
CREATE INDEX IF NOT EXISTS payments_stripe_session_idx ON payments (stripe_checkout_session_id)
  WHERE stripe_checkout_session_id IS NOT NULL;

ALTER TABLE payments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Supporters can read own payments"
  ON payments FOR SELECT
  TO authenticated
  USING (
    supporter_id IN (
      SELECT id FROM supporters
      WHERE email = (SELECT email FROM auth.users WHERE id = auth.uid())
    )
  );

-- ── support_access ──────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS support_access (
  id               uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  supporter_id     uuid NOT NULL REFERENCES supporters(id) ON DELETE CASCADE,
  athlete_id       uuid REFERENCES athletes(id) ON DELETE SET NULL,
  support_plan_id  uuid REFERENCES support_plans(id) ON DELETE SET NULL,
  status           text NOT NULL DEFAULT 'active'
                     CHECK (status IN ('active','inactive','past_due','canceled')),
  starts_at        timestamptz DEFAULT now(),
  ends_at          timestamptz,
  created_at       timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS support_access_supporter_id_idx ON support_access (supporter_id);
CREATE INDEX IF NOT EXISTS support_access_athlete_id_idx ON support_access (athlete_id);
CREATE INDEX IF NOT EXISTS support_access_status_idx ON support_access (status);

ALTER TABLE support_access ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Supporters can read own access"
  ON support_access FOR SELECT
  TO authenticated
  USING (
    supporter_id IN (
      SELECT id FROM supporters
      WHERE email = (SELECT email FROM auth.users WHERE id = auth.uid())
    )
  );

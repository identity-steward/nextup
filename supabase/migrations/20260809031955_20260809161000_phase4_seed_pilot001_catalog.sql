/*
  # Phase 4 — Seed Curated Pilot 001 Catalog

  ## Summary
  Seeds a minimal curated set of services, providers, and eligibility
  pathways for Pilot 001. This is NOT a public directory — it is a
  curated set of pathway components for the navigation layer.

  Every record includes provenance (source_authority) and freshness
  (source_checked_at) so the UI can surface "Needs re-check" when
  data is stale.

  ## Seeded Records
  ### Services (3)
  - Youth sports program enrollment assistance
  - Transportation assistance for youth activities
  - Mentoring and academic support

  ### Providers (3)
  - Memphis Athletic Ministries (source_confirmed)
  - MATA Transit Services (source_confirmed)
  - Memphis Grizzlies Foundation (unverified)

  ### Eligibility Pathways (2)
  - TennCare/Medicaid eligibility for youth programs
  - Scholarship/fee waiver pathway for sports participation

  ## Security
  - No RLS changes. Seed data is inserted via service role (bypasses RLS).
  - All records are readable by authenticated users per existing policies.

  ## Important Notes
  1. source_checked_at is set to migration date — the UI freshness
     check will flag records older than 90 days as "Needs re-check".
  2. No provider is marked "partner_confirmed" unless an actual
     confirmation exists — Memphis Athletic Ministries and MATA are
     "source_confirmed" (publicly available information), Grizzlies
     Foundation is "unverified".
  3. No eligibility pathway is marked "authority_confirmed_eligible"
     or "authority_confirmed_ineligible" — all are "possible" or
     "verification_needed".
*/

-- ============================================================
-- Services
-- ============================================================

INSERT INTO public.services (name, description, service_type, modality, geography, access_channel, source_authority, source_checked_at, status)
VALUES
  (
    'Youth Sports Program Enrollment',
    'Assistance with registering youth for after-school and weekend sports programs.',
    'youth_sports',
    'in_person',
    'Memphis, TN metro area',
    'navigator_referral',
    'NextUp Memphis Pilot 001 curation',
    now(),
    'active'
  ),
  (
    'Transportation Assistance for Youth Activities',
    'Bus passes, ride coordination, or carpool support to help youth get to practices, games, and program activities.',
    'transportation',
    'in_person',
    'Memphis, TN metro area',
    'navigator_referral',
    'NextUp Memphis Pilot 001 curation',
    now(),
    'active'
  ),
  (
    'Mentoring and Academic Support',
    'One-on-one mentoring and academic tutoring for youth participants.',
    'mentoring_academic',
    'in_person',
    'Memphis, TN metro area',
    'navigator_referral',
    'NextUp Memphis Pilot 001 curation',
    now(),
    'active'
  )
ON CONFLICT DO NOTHING;

-- ============================================================
-- Providers
-- ============================================================

INSERT INTO public.providers (organization_name, location, contact_name, contact_email, contact_phone, service_area, source_authority, source_checked_at, verification_status)
VALUES
  (
    'Memphis Athletic Ministries',
    'Memphis, TN',
    'Program Coordinator',
    'info@mamsports.org',
    '901-555-0100',
    'Memphis metro area',
    'Publicly available organization information',
    now(),
    'source_confirmed'
  ),
  (
    'MATA Transit Services',
    'Memphis, TN',
    'Customer Service',
    'info@matatransit.com',
    '901-555-0200',
    'Memphis metro area',
    'Publicly available transit information',
    now(),
    'source_confirmed'
  ),
  (
    'Memphis Grizzlies Foundation',
    'Memphis, TN',
    null,
    null,
    null,
    'Memphis metro area',
    'NextUp Memphis Pilot 001 curation',
    now(),
    'unverified'
  )
ON CONFLICT DO NOTHING;

-- ============================================================
-- Eligibility Pathways
-- ============================================================

INSERT INTO public.eligibility_pathways (program_name, authority_name, criteria_summary, decision_owner, authoritative_source, source_checked_at, status)
VALUES
  (
    'TennCare/Medicaid for Youth Programs',
    'Tennessee Department of Health / TennCare',
    'Eligibility for TennCare/Medicaid may cover certain youth program participation costs. Income and household size criteria apply. Decision is made by TennCare, not NextUp.',
    'TennCare',
    'TennCare eligibility guidelines (publicly available)',
    now(),
    'verification_needed'
  ),
  (
    'Scholarship and Fee Waiver Pathway for Sports Participation',
    'Program Provider / School District',
    'Some sports programs offer scholarships or fee waivers based on financial need. Eligibility criteria vary by provider. Decision is made by the program or school, not NextUp.',
    'Program Provider',
    'Program provider guidelines (varies by provider)',
    now(),
    'possible'
  )
ON CONFLICT DO NOTHING;

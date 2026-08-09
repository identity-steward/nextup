/*
# Fix infinite RLS recursion between households and household_memberships

## Problem
The `select_own_memberships` policy on `household_memberships` had a self-referential
subquery: it queried `household_memberships` itself to check if the user is in the same
household. When `select_own_household` on `households` (which queries `household_memberships`)
fired during INSERT ... RETURNING, it triggered `select_own_memberships`, which queried
`household_memberships` again — infinite recursion.

The recursion cycle was:
  households.select_own_household → household_memberships.select_own_memberships
    → household_memberships (self-reference) → infinite loop

## Fix
1. `select_own_household` on `households`: Replace the two-branch policy with a single
   check against `persons` via `created_by_person_id`. No longer references
   `household_memberships`, breaking the cycle.

2. `select_own_memberships` on `household_memberships`: Replace the self-referential
   second branch. New branches:
   a) User owns the person_id on this membership row (unchanged — no recursion)
   b) User is the household creator (check households.created_by_person_id → persons.auth_user_id)
      This now queries `households` which only checks `persons` — no cycle.

## Trade-off
A non-creator household member cannot directly SELECT the `households` row. In Pilot 001,
the household creator is the primary authenticated user. Other members (e.g. children) are
person records without their own auth accounts. Navigators access household-scoped data
through other tables (person_narrations, needs, etc.) that have their own navigator
SELECT policies — they do not need direct SELECT on `households`.

## Security
- RLS remains enabled on both tables.
- Cross-household isolation preserved: users can only see their own household and memberships.
- No anon-accessible policies added.
- No data changed.
*/

-- Fix 1: households SELECT policy — remove household_memberships reference
DROP POLICY IF EXISTS "select_own_household" ON households;
CREATE POLICY "select_own_household"
  ON households FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM persons p
      WHERE p.id = households.created_by_person_id
      AND p.auth_user_id = auth.uid()
    )
  );

-- Fix 2: household_memberships SELECT policy — remove self-referential branch
DROP POLICY IF EXISTS "select_own_memberships" ON household_memberships;
CREATE POLICY "select_own_memberships"
  ON household_memberships FOR SELECT
  TO authenticated
  USING (
    -- User owns the person on this membership row
    EXISTS (
      SELECT 1 FROM persons p
      WHERE p.id = household_memberships.person_id
      AND p.auth_user_id = auth.uid()
    )
    OR
    -- User is the household creator (can see all members in their household)
    EXISTS (
      SELECT 1 FROM households h
      JOIN persons p ON h.created_by_person_id = p.id
      WHERE h.id = household_memberships.household_id
      AND p.auth_user_id = auth.uid()
    )
  );

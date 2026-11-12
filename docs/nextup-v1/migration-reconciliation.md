# Migration Reconciliation Log

## Purpose
Documents Supabase migrations that are applied to the database but whose SQL
files are missing from the Bolt workspace. This occurred because earlier
sessions created and applied these migrations, but the workspace files were
lost when Bolt loaded an older snapshot in a subsequent session.

All migrations listed below are already applied to the production database.
They do NOT need to be reapplied. This log exists so that a future session can
recreate the SQL files if a complete migration history in GitHub is desired.

## Missing Migration Files (14 total)

| Version (timestamp) | Description (inferred from filename) | Applied? |
|---|---|---|
| 20251202075645 | create_supporters_and_testimonials | Yes |
| 20251202145627 | fix_rls_security_issues_v2 | Yes |
| 20251205081138 | fix_function_search_path_security | Yes |
| 20260318015509 | create_form_submissions_tables | Yes |
| 20260415041553 | add_guardians_tasks_audit_logs_needs_manual_review | Yes |
| 20260415044209 | add_gender_to_athletes | Yes |
| 20260416171311 | extend_supporters_add_stripe_tables | Yes |
| 20260416171333 | seed_support_plans | Yes |
| 20260510055139 | phase3_to_8_foundation | Yes |
| 20260521200134 | activate_jacob_profile | Yes |
| 20260521230207 | add_admin_select_policy_for_athletes | Yes |
| 20260522032844 | add_field_grade_to_profile_update_requests | Yes |
| 20260608031844 | expand_visibility_tags | Yes |
| 20261110051733 | redesign_trigger_log_only_no_premature_sent (earlier version) | Yes |

## Duplicate Migration Note

The `redesign_trigger_log_only_no_premature_sent` migration was applied twice:
- 20261110051733 — created in an earlier session, file lost from workspace
- 20261111143415 — recreated in the most recent session, file present in workspace

Both produce the same final database state (log-only trigger, no pg_net call).
The database function `notify_new_submission()` has been verified as correct.

## Reconciliation Strategy

1. No database action is required — all migrations are applied.
2. The workspace's 78 migration files are sufficient for the database to function.
3. If a complete migration history is needed in GitHub, the 14 missing files
   can be recreated as no-op placeholder files (containing only a comment)
   in a future session. They must NOT reexecute any DDL.
4. The `supabase_migrations.schema_migrations` table tracks applied versions
   by timestamp — Supabase will not attempt to reapply any of these.

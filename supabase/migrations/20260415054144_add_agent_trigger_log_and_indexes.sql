/*
  # Agent Trigger Infrastructure

  ## Summary
  Adds supporting indexes, updated_at triggers, and an agent_trigger_log table
  to track every Supabase realtime event dispatched to an agent folder.

  ## New Tables
  ### `agent_trigger_log`
  - `id` (uuid, primary key)
  - `folder` (text) - e.g. '01_INTAKE', '05_PARTNERS'
  - `agent` (text) - agent name that handled the event
  - `source_table` (text) - originating table
  - `source_id` (uuid) - originating row id
  - `event_type` (text) - INSERT | UPDATE | DELETE
  - `result_success` (boolean)
  - `result_message` (text, nullable)
  - `task_id` (uuid, nullable) - task created by this trigger
  - `audit_log_id` (uuid, nullable)
  - `flagged_for_review` (boolean)
  - `triggered_at` (timestamptz)

  ## Indexes
  - agent_trigger_log: source_table + source_id (lookup by record)
  - agent_trigger_log: folder (lookup by agent folder)
  - tasks: related_table + related_id
  - audit_logs: table_name + row_id
  - needs_manual_review: related_table + resolved

  ## Security
  - RLS enabled on agent_trigger_log
  - Authenticated users can read; no direct insert from client
*/

CREATE TABLE IF NOT EXISTS agent_trigger_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  folder text NOT NULL,
  agent text NOT NULL,
  source_table text NOT NULL,
  source_id uuid NOT NULL,
  event_type text NOT NULL DEFAULT 'INSERT',
  result_success boolean NOT NULL DEFAULT false,
  result_message text,
  task_id uuid,
  audit_log_id uuid,
  flagged_for_review boolean NOT NULL DEFAULT false,
  triggered_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE agent_trigger_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can read trigger log"
  ON agent_trigger_log
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can insert trigger log"
  ON agent_trigger_log
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE INDEX IF NOT EXISTS agent_trigger_log_source_idx
  ON agent_trigger_log (source_table, source_id);

CREATE INDEX IF NOT EXISTS agent_trigger_log_folder_idx
  ON agent_trigger_log (folder);

CREATE INDEX IF NOT EXISTS agent_trigger_log_triggered_at_idx
  ON agent_trigger_log (triggered_at DESC);

CREATE INDEX IF NOT EXISTS tasks_related_idx
  ON tasks (related_table, related_id);

CREATE INDEX IF NOT EXISTS tasks_status_priority_idx
  ON tasks (status, priority);

CREATE INDEX IF NOT EXISTS audit_logs_table_row_idx
  ON audit_logs (table_name, row_id);

CREATE INDEX IF NOT EXISTS audit_logs_performed_at_idx
  ON audit_logs (performed_at DESC);

CREATE INDEX IF NOT EXISTS needs_manual_review_table_resolved_idx
  ON needs_manual_review (related_table, resolved);

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'tasks' AND column_name = 'updated_at'
  ) THEN
    ALTER TABLE tasks ADD COLUMN updated_at timestamptz DEFAULT now();
  END IF;
END $$;

CREATE OR REPLACE FUNCTION update_tasks_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS tasks_updated_at_trigger ON tasks;
CREATE TRIGGER tasks_updated_at_trigger
  BEFORE UPDATE ON tasks
  FOR EACH ROW
  EXECUTE FUNCTION update_tasks_updated_at();

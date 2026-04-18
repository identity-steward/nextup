import { supabase } from '../../lib/supabase';
import type { AgentResult } from '../../types/agent';

export interface TriggerLogEntry {
  id: string;
  folder: string;
  agent: string;
  source_table: string;
  source_id: string;
  event_type: string;
  result_success: boolean;
  result_message?: string;
  task_id?: string;
  audit_log_id?: string;
  flagged_for_review: boolean;
  triggered_at: string;
}

export async function logTriggerResult(
  folder: string,
  agent: string,
  sourceTable: string,
  sourceId: string,
  eventType: 'INSERT' | 'UPDATE' | 'DELETE',
  result: AgentResult
): Promise<void> {
  await supabase.from('agent_trigger_log').insert([
    {
      folder,
      agent,
      source_table: sourceTable,
      source_id: sourceId,
      event_type: eventType,
      result_success: result.success,
      result_message: result.message,
      task_id: result.taskId ?? null,
      audit_log_id: result.auditLogId ?? null,
      flagged_for_review: result.flaggedForReview ?? false,
    },
  ]);
}

export async function getRecentTriggerLogs(limit = 100): Promise<TriggerLogEntry[]> {
  const { data, error } = await supabase
    .from('agent_trigger_log')
    .select('*')
    .order('triggered_at', { ascending: false })
    .limit(limit);

  if (error) {
    console.error('Error fetching trigger logs:', error);
    return [];
  }
  return data || [];
}

export async function getTriggerLogsByFolder(folder: string): Promise<TriggerLogEntry[]> {
  const { data, error } = await supabase
    .from('agent_trigger_log')
    .select('*')
    .eq('folder', folder)
    .order('triggered_at', { ascending: false })
    .limit(50);

  if (error) return [];
  return data || [];
}

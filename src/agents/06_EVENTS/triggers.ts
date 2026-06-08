import { supabase } from '../../lib/supabase';
import { ContentAgentService } from '../../services/contentAgentService';
import { TaskService } from '../../services/taskService';
import { AuditService } from '../../services/auditService';
import type { AgentResult } from '../../types/agent';

export type EventTriggerSource = 'media_pass_requests';

export async function dispatchEventTrigger(
  _source: EventTriggerSource,
  recordId: string
): Promise<{ content: AgentResult; outreach: AgentResult }> {
  const [content, outreach] = await Promise.all([
    ContentAgentService.processMediaPassRequest(recordId),
    (async (): Promise<AgentResult> => {
      const { data: record } = await supabase
        .from('media_pass_requests')
        .select('first_name, last_name, organization, event_details')
        .eq('id', recordId)
        .maybeSingle();

      if (!record) return { success: false, message: 'Record not found for outreach' };

      const task = await TaskService.create({
        title: `Coordinate event coverage: ${record.organization}`,
        description: `Outreach follow-up for media pass from ${record.first_name} ${record.last_name}. Event: ${record.event_details}`,
        priority: 'normal',
        related_table: 'media_pass_requests',
        related_id: recordId,
        status: 'open',
      });

      await AuditService.log({
        table_name: 'media_pass_requests',
        row_id: recordId,
        action: 'outreach_event_task_created',
        new_value: { taskId: task?.id },
      });

      return { success: true, taskId: task?.id, message: 'Outreach task created for event coverage' };
    })(),
  ]);

  return { content, outreach };
}

export function subscribeEventTriggers(
  onResult?: (source: string, result: { content: AgentResult; outreach: AgentResult }) => void
) {
  const channel = supabase
    .channel('events_media_pass_requests')
    .on(
      'postgres_changes',
      { event: 'INSERT', schema: 'public', table: 'media_pass_requests' },
      async (payload) => {
        const result = await dispatchEventTrigger('media_pass_requests', payload.new.id);
        onResult?.('media_pass_requests', result);
      }
    )
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
}

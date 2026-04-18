import { supabase } from '../../lib/supabase';
import { SupporterAgentService } from '../../services/supporterAgentService';
import type { AgentResult } from '../../types/agent';

export type SupporterTriggerSource = 'supporter_signups' | 'supporters';

export async function dispatchSupporterTrigger(
  source: SupporterTriggerSource,
  recordId: string
): Promise<AgentResult> {
  switch (source) {
    case 'supporter_signups':
      return SupporterAgentService.processSupporterSignup(recordId);
    case 'supporters':
      return { success: true, message: 'supporters table change noted — no automated action required' };
    default:
      return { success: false, message: `Unknown supporter source: ${source}` };
  }
}

export function subscribeSupporterTriggers(onResult?: (source: string, result: AgentResult) => void) {
  const channels = [
    supabase
      .channel('supporter_signups_insert')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'supporter_signups' },
        async (payload) => {
          const result = await SupporterAgentService.processSupporterSignup(payload.new.id);
          onResult?.('supporter_signups', result);
        }
      )
      .subscribe(),

    supabase
      .channel('supporters_insert')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'supporters' },
        async (payload) => {
          onResult?.('supporters', { success: true, message: `New supporter row: ${payload.new.id}` });
        }
      )
      .subscribe(),
  ];

  return () => {
    channels.forEach((ch) => supabase.removeChannel(ch));
  };
}

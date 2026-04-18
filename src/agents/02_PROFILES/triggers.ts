import { supabase } from '../../lib/supabase';
import { ProfileAgentService } from '../../services/profileAgentService';
import type { AgentResult } from '../../types/agent';

export type ProfileTriggerSource = 'athletes' | 'creators';

export async function dispatchProfileTrigger(
  source: ProfileTriggerSource,
  recordId: string
): Promise<AgentResult> {
  switch (source) {
    case 'athletes':
      return ProfileAgentService.auditAthlete(recordId);
    case 'creators':
      return ProfileAgentService.auditCreator(recordId);
    default:
      return { success: false, message: `Unknown profile source: ${source}` };
  }
}

export function subscribeProfileTriggers(onResult?: (source: string, result: AgentResult) => void) {
  const channels = [
    supabase
      .channel('profile_athletes')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'athletes' },
        async (payload) => {
          const result = await ProfileAgentService.auditAthlete(payload.new.id);
          onResult?.('athletes', result);
        }
      )
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'athletes' },
        async (payload) => {
          const result = await ProfileAgentService.auditAthlete(payload.new.id);
          onResult?.('athletes', result);
        }
      )
      .subscribe(),

    supabase
      .channel('profile_creators')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'creators' },
        async (payload) => {
          const result = await ProfileAgentService.auditCreator(payload.new.id);
          onResult?.('creators', result);
        }
      )
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'creators' },
        async (payload) => {
          const result = await ProfileAgentService.auditCreator(payload.new.id);
          onResult?.('creators', result);
        }
      )
      .subscribe(),
  ];

  return () => {
    channels.forEach((ch) => supabase.removeChannel(ch));
  };
}

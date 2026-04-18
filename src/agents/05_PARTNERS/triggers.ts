import { supabase } from '../../lib/supabase';
import { OutreachAgentService } from '../../services/outreachAgentService';
import type { AgentResult } from '../../types/agent';

export type PartnerTriggerSource = 'team_inquiries' | 'athletes';

export async function dispatchPartnerTrigger(
  source: PartnerTriggerSource,
  recordId: string
): Promise<AgentResult> {
  switch (source) {
    case 'team_inquiries':
      return OutreachAgentService.processTeamInquiry(recordId);
    case 'athletes':
      return OutreachAgentService.auditAthleteForOutreach(recordId);
    default:
      return { success: false, message: `Unknown partner source: ${source}` };
  }
}

export function subscribePartnerTriggers(onResult?: (source: string, result: AgentResult) => void) {
  const channels = [
    supabase
      .channel('partners_team_inquiries')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'team_inquiries' },
        async (payload) => {
          const result = await OutreachAgentService.processTeamInquiry(payload.new.id);
          onResult?.('team_inquiries', result);
        }
      )
      .subscribe(),

    supabase
      .channel('partners_athletes_insert')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'athletes' },
        async (payload) => {
          const result = await OutreachAgentService.auditAthleteForOutreach(payload.new.id);
          onResult?.('athletes', result);
        }
      )
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'athletes' },
        async (payload) => {
          const result = await OutreachAgentService.auditAthleteForOutreach(payload.new.id);
          onResult?.('athletes', result);
        }
      )
      .subscribe(),
  ];

  return () => {
    channels.forEach((ch) => supabase.removeChannel(ch));
  };
}

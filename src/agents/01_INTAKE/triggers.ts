import { supabase } from '../../lib/supabase';
import { IntakeAgentService } from '../../services/intakeAgentService';
import { SupporterAgentService } from '../../services/supporterAgentService';
import { OutreachAgentService } from '../../services/outreachAgentService';
import type { AgentResult } from '../../types/agent';

export type IntakeTriggerSource =
  | 'athlete_signups'
  | 'parent_intake'
  | 'creator_applications'
  | 'team_inquiries'
  | 'supporter_signups';

export async function dispatchIntakeTrigger(
  source: IntakeTriggerSource,
  recordId: string
): Promise<AgentResult> {
  switch (source) {
    case 'athlete_signups':
      return IntakeAgentService.processAthleteSignup(recordId);
    case 'parent_intake':
      return IntakeAgentService.processParentIntake(recordId);
    case 'creator_applications':
      return IntakeAgentService.processCreatorApplication(recordId);
    case 'team_inquiries':
      return OutreachAgentService.processTeamInquiry(recordId);
    case 'supporter_signups':
      return SupporterAgentService.processSupporterSignup(recordId);
    default:
      return { success: false, message: `Unknown intake source: ${source}` };
  }
}

export function subscribeIntakeTriggers(onResult?: (source: string, result: AgentResult) => void) {
  const channels = [
    supabase
      .channel('intake_athlete_signups')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'athlete_signups' },
        async (payload) => {
          const result = await IntakeAgentService.processAthleteSignup(payload.new.id);
          onResult?.('athlete_signups', result);
        }
      )
      .subscribe(),

    supabase
      .channel('intake_parent_intake')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'parent_intake' },
        async (payload) => {
          const result = await IntakeAgentService.processParentIntake(payload.new.id);
          onResult?.('parent_intake', result);
        }
      )
      .subscribe(),

    supabase
      .channel('intake_creator_applications')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'creator_applications' },
        async (payload) => {
          const result = await IntakeAgentService.processCreatorApplication(payload.new.id);
          onResult?.('creator_applications', result);
        }
      )
      .subscribe(),

    supabase
      .channel('intake_team_inquiries')
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
      .channel('intake_supporter_signups')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'supporter_signups' },
        async (payload) => {
          const result = await SupporterAgentService.processSupporterSignup(payload.new.id);
          onResult?.('supporter_signups', result);
        }
      )
      .subscribe(),
  ];

  return () => {
    channels.forEach((ch) => supabase.removeChannel(ch));
  };
}

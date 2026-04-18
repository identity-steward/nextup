import { supabase } from '../../lib/supabase';
import { ContentAgentService } from '../../services/contentAgentService';
import { ProfileAgentService } from '../../services/profileAgentService';
import type { AgentResult } from '../../types/agent';

export type ContentTriggerSource = 'athletes' | 'creators' | 'media_pass_requests' | 'testimonials';

export async function dispatchContentTrigger(
  source: ContentTriggerSource,
  recordId: string
): Promise<AgentResult> {
  switch (source) {
    case 'athletes':
      return ProfileAgentService.auditAthlete(recordId);
    case 'creators':
      return ProfileAgentService.auditCreator(recordId);
    case 'media_pass_requests':
      return ContentAgentService.processMediaPassRequest(recordId);
    case 'testimonials':
      return ContentAgentService.moderateTestimonial(recordId);
    default:
      return { success: false, message: `Unknown content source: ${source}` };
  }
}

export function subscribeContentTriggers(onResult?: (source: string, result: AgentResult) => void) {
  const channels = [
    supabase
      .channel('content_media_pass_requests')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'media_pass_requests' },
        async (payload) => {
          const result = await ContentAgentService.processMediaPassRequest(payload.new.id);
          onResult?.('media_pass_requests', result);
        }
      )
      .subscribe(),

    supabase
      .channel('content_testimonials')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'testimonials' },
        async (payload) => {
          const result = await ContentAgentService.moderateTestimonial(payload.new.id);
          onResult?.('testimonials', result);
        }
      )
      .subscribe(),

    supabase
      .channel('content_athletes_update')
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
      .channel('content_creators_update')
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

import { supabase } from '../lib/supabase';
import { TaskService } from './taskService';
import { AuditService } from './auditService';
import type { AgentResult } from '../types/agent';

type ContentRecord = Record<string, unknown> & { id: string };

function classifyMediaPassRequest(record: ContentRecord): {
  priority: 'low' | 'normal' | 'high' | 'urgent';
  flags: string[];
} {
  const flags: string[] = [];
  let priority: 'low' | 'normal' | 'high' | 'urgent' = 'normal';

  if (!record.email) flags.push('missing email');
  if (!record.organization) flags.push('missing organization');
  if (!record.credentials) flags.push('no credentials provided');
  if (!record.event_details) flags.push('missing event details');
  if (!record.coverage_purpose) flags.push('missing coverage purpose');

  if (flags.length >= 3) priority = 'high';
  if (!record.credentials) priority = 'high';

  return { priority, flags };
}

function moderateTestimonial(record: ContentRecord): {
  approved: boolean;
  flags: string[];
} {
  const flags: string[] = [];
  const quote = (record.quote as string) || '';
  const name = (record.name as string) || '';

  if (!name) flags.push('missing name');
  if (quote.length < 20) flags.push('quote too short');
  if (quote.length > 500) flags.push('quote too long');
  if (!record.relationship) flags.push('missing relationship');

  const banned = ['spam', 'fake', 'http://', 'https://', 'www.', 'buy now', 'click here'];
  const lowerQuote = quote.toLowerCase();
  if (banned.some((w) => lowerQuote.includes(w))) flags.push('potential spam content');

  const approved = flags.length === 0;
  return { approved, flags };
}

export class ContentAgentService {
  static async processMediaPassRequest(recordId: string): Promise<AgentResult> {
    const { data: record, error } = await supabase
      .from('media_pass_requests')
      .select('*')
      .eq('id', recordId)
      .maybeSingle();

    if (error || !record) {
      return { success: false, message: 'Record not found' };
    }

    const { priority, flags } = classifyMediaPassRequest(record as ContentRecord);
    const needsReview = flags.length > 0;

    const nextStatus = needsReview ? 'pending' : 'reviewed';
    await supabase
      .from('media_pass_requests')
      .update({ status: nextStatus })
      .eq('id', recordId);

    const task = await TaskService.create({
      title: `Media pass request: ${record.first_name} ${record.last_name} (${record.organization})`,
      description: needsReview
        ? `Validation flags: ${flags.join(', ')}`
        : `${record.role} from ${record.organization} requested media access for: ${record.event_details}. Review credentials and approve/deny.`,
      priority,
      related_table: 'media_pass_requests',
      related_id: recordId,
      status: 'open',
    });

    const auditLog = await AuditService.log({
      table_name: 'media_pass_requests',
      row_id: recordId,
      action: 'content_agent_processed',
      new_value: { status: nextStatus, flags, priority },
    });

    let flaggedForReview = false;
    if (needsReview) {
      await AuditService.flagForReview({
        related_table: 'media_pass_requests',
        related_id: recordId,
        reason: `Media pass validation flags: ${flags.join(', ')}`,
      });
      flaggedForReview = true;
    }

    await TaskService.create({
      title: `Outreach follow-up: media coverage by ${record.organization}`,
      description: `Coordinate coverage and ensure athlete/event alignment for ${record.coverage_purpose}.`,
      priority: 'low',
      related_table: 'media_pass_requests',
      related_id: recordId,
      status: 'open',
    });

    return {
      success: true,
      taskId: task?.id,
      auditLogId: auditLog?.id,
      flaggedForReview,
      message: needsReview ? `Flagged for review: ${flags.join(', ')}` : 'Media pass request queued for review',
    };
  }

  static async moderateTestimonial(recordId: string): Promise<AgentResult> {
    const { data: record, error } = await supabase
      .from('testimonials')
      .select('*')
      .eq('id', recordId)
      .maybeSingle();

    if (error || !record) {
      return { success: false, message: 'Testimonial not found' };
    }

    const { approved, flags } = moderateTestimonial(record as ContentRecord);

    await supabase
      .from('testimonials')
      .update({ is_approved: approved })
      .eq('id', recordId);

    const auditLog = await AuditService.log({
      table_name: 'testimonials',
      row_id: recordId,
      action: approved ? 'testimonial_auto_approved' : 'testimonial_flagged',
      new_value: { is_approved: approved, flags },
    });

    if (approved) {
      return { success: true, auditLogId: auditLog?.id, flaggedForReview: false, message: 'Testimonial approved' };
    }

    const task = await TaskService.create({
      title: `Review testimonial from ${record.name}`,
      description: `Auto-moderation flagged: ${flags.join(', ')}. Manually review before approving.`,
      priority: flags.includes('potential spam content') ? 'high' : 'normal',
      related_table: 'testimonials',
      related_id: recordId,
      status: 'open',
    });

    await AuditService.flagForReview({
      related_table: 'testimonials',
      related_id: recordId,
      reason: `Testimonial moderation flags: ${flags.join(', ')}`,
    });

    return {
      success: true,
      taskId: task?.id,
      auditLogId: auditLog?.id,
      flaggedForReview: true,
      message: `Testimonial flagged: ${flags.join(', ')}`,
    };
  }

  static async processPendingMediaRequests(): Promise<AgentResult[]> {
    const { data } = await supabase
      .from('media_pass_requests')
      .select('id')
      .eq('status', 'pending')
      .limit(20);

    return Promise.all((data || []).map((r) => ContentAgentService.processMediaPassRequest(r.id)));
  }

  static async moderatePendingTestimonials(): Promise<AgentResult[]> {
    const { data } = await supabase
      .from('testimonials')
      .select('id')
      .eq('is_approved', false)
      .limit(20);

    return Promise.all((data || []).map((r) => ContentAgentService.moderateTestimonial(r.id)));
  }
}

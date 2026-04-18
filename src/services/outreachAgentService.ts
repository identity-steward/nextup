import { supabase } from '../lib/supabase';
import { TaskService } from './taskService';
import { AuditService } from './auditService';
import type { AgentResult } from '../types/agent';

type InquiryRecord = Record<string, unknown> & { id: string };
type AthleteRecord = Record<string, unknown> & { id: string };

function classifyTeamInquiry(record: InquiryRecord): {
  priority: 'low' | 'normal' | 'high' | 'urgent';
  flags: string[];
} {
  const flags: string[] = [];
  let priority: 'low' | 'normal' | 'high' | 'urgent' = 'normal';

  if (!record.contact_email) flags.push('missing contact email');
  if (!record.team_name) flags.push('missing team name');
  if (!record.sport) flags.push('missing sport');
  if (!record.message) flags.push('missing message');

  const numAthletes = typeof record.num_athletes === 'number' ? record.num_athletes : 0;
  if (numAthletes >= 10) priority = 'high';
  if (numAthletes >= 20) priority = 'urgent';
  if (flags.length >= 2) priority = 'high';

  return { priority, flags };
}

function checkAthleteOutreachNeeds(record: AthleteRecord): string[] {
  const actions: string[] = [];

  if (!record.image_url) actions.push('needs profile photo');
  if (!record.highlight_video_url && !record.highlight_video_embed_url) actions.push('needs highlight video');
  if (!record.stripe_payment_link) actions.push('needs payment link setup');
  if (!record.bio || (record.bio as string).length < 50) actions.push('bio too short');
  if (!record.instagram_handle && !record.twitter_handle) actions.push('no social handles linked');

  return actions;
}

export class OutreachAgentService {
  static async processTeamInquiry(recordId: string): Promise<AgentResult> {
    const { data: record, error } = await supabase
      .from('team_inquiries')
      .select('*')
      .eq('id', recordId)
      .maybeSingle();

    if (error || !record) {
      return { success: false, message: 'Record not found' };
    }

    const { priority, flags } = classifyTeamInquiry(record as InquiryRecord);
    const needsReview = flags.length > 0;

    const nextStatus = needsReview ? 'pending' : 'reviewed';
    await supabase
      .from('team_inquiries')
      .update({ status: nextStatus })
      .eq('id', recordId);

    const task = await TaskService.create({
      title: `Team inquiry: ${record.team_name} (${record.sport})`,
      description: needsReview
        ? `Validation flags: ${flags.join(', ')}`
        : `${record.contact_first_name} ${record.contact_last_name} (${record.role}) inquired about ${record.num_athletes} athletes. Follow up within 24 hours.`,
      priority,
      related_table: 'team_inquiries',
      related_id: recordId,
      status: 'open',
    });

    const auditLog = await AuditService.log({
      table_name: 'team_inquiries',
      row_id: recordId,
      action: 'outreach_agent_processed',
      new_value: { status: nextStatus, flags, priority },
    });

    let flaggedForReview = false;
    if (needsReview) {
      await AuditService.flagForReview({
        related_table: 'team_inquiries',
        related_id: recordId,
        reason: `Inquiry validation flags: ${flags.join(', ')}`,
      });
      flaggedForReview = true;
    }

    return {
      success: true,
      taskId: task?.id,
      auditLogId: auditLog?.id,
      flaggedForReview,
      message: needsReview ? `Flagged for review: ${flags.join(', ')}` : 'Team inquiry queued for outreach',
    };
  }

  static async auditAthleteForOutreach(athleteId: string): Promise<AgentResult> {
    const { data: record, error } = await supabase
      .from('athletes')
      .select('*')
      .eq('id', athleteId)
      .maybeSingle();

    if (error || !record) {
      return { success: false, message: 'Athlete not found' };
    }

    const actions = checkAthleteOutreachNeeds(record as AthleteRecord);

    if (actions.length === 0) {
      const auditLog = await AuditService.log({
        table_name: 'athletes',
        row_id: athleteId,
        action: 'outreach_audit_passed',
        new_value: { actions: [], result: 'profile_complete' },
      });
      return { success: true, auditLogId: auditLog?.id, flaggedForReview: false, message: 'Profile complete' };
    }

    const task = await TaskService.create({
      title: `Complete profile for ${record.first_name} ${record.last_initial}.`,
      description: `Outreach readiness issues: ${actions.join(', ')}`,
      priority: actions.length >= 3 ? 'high' : 'normal',
      related_table: 'athletes',
      related_id: athleteId,
      status: 'open',
    });

    const auditLog = await AuditService.log({
      table_name: 'athletes',
      row_id: athleteId,
      action: 'outreach_audit_flagged',
      new_value: { actions },
    });

    await AuditService.flagForReview({
      related_table: 'athletes',
      related_id: athleteId,
      reason: `Profile incomplete for outreach: ${actions.join(', ')}`,
    });

    return {
      success: true,
      taskId: task?.id,
      auditLogId: auditLog?.id,
      flaggedForReview: true,
      message: `Profile needs attention: ${actions.join(', ')}`,
    };
  }

  static async processPendingInquiries(): Promise<AgentResult[]> {
    const { data } = await supabase
      .from('team_inquiries')
      .select('id')
      .eq('status', 'pending')
      .limit(20);

    return Promise.all((data || []).map((r) => OutreachAgentService.processTeamInquiry(r.id)));
  }

  static async auditAllActiveAthletes(): Promise<AgentResult[]> {
    const { data } = await supabase
      .from('athletes')
      .select('id')
      .eq('is_active', true)
      .limit(50);

    return Promise.all((data || []).map((r) => OutreachAgentService.auditAthleteForOutreach(r.id)));
  }
}

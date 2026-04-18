import { supabase } from '../lib/supabase';
import { TaskService } from './taskService';
import { AuditService } from './auditService';
import type { AgentResult } from '../types/agent';

type ProfileRecord = Record<string, unknown> & { id: string };

function auditAthleteProfile(record: ProfileRecord): string[] {
  const issues: string[] = [];

  if (!record.image_url) issues.push('no profile image');
  if (!record.bio || (record.bio as string).length < 80) issues.push('bio needs expansion');
  if (!record.descriptor) issues.push('missing descriptor');
  if (!record.strength) issues.push('missing strength statement');
  if (!record.goal) issues.push('missing season goal');
  if (!record.highlight_video_url && !record.highlight_video_embed_url) issues.push('no highlight video');
  if (!record.slug) issues.push('missing slug');

  return issues;
}

function auditCreatorProfile(record: ProfileRecord): string[] {
  const issues: string[] = [];

  if (!record.image_url) issues.push('no profile image');
  if (!record.bio || (record.bio as string).length < 60) issues.push('bio needs expansion');
  if (!record.tagline) issues.push('missing tagline');
  if (!record.specialties) issues.push('missing specialties');
  if (!record.portfolio_url && !record.instagram_handle) issues.push('no portfolio or social link');
  if (!record.slug) issues.push('missing slug');

  return issues;
}

export class ProfileAgentService {
  static async auditAthlete(athleteId: string): Promise<AgentResult> {
    const { data: record, error } = await supabase
      .from('athletes')
      .select('*')
      .eq('id', athleteId)
      .maybeSingle();

    if (error || !record) {
      return { success: false, message: 'Athlete not found' };
    }

    const issues = auditAthleteProfile(record as ProfileRecord);

    const auditLog = await AuditService.log({
      table_name: 'athletes',
      row_id: athleteId,
      action: 'profile_agent_audit',
      new_value: { issues, result: issues.length === 0 ? 'profile_complete' : 'profile_incomplete' },
    });

    if (issues.length === 0) {
      return { success: true, auditLogId: auditLog?.id, flaggedForReview: false, message: 'Athlete profile complete' };
    }

    const task = await TaskService.create({
      title: `Improve athlete profile: ${record.first_name} ${record.last_initial}.`,
      description: `Profile gaps identified: ${issues.join(', ')}`,
      priority: issues.length >= 4 ? 'high' : 'normal',
      related_table: 'athletes',
      related_id: athleteId,
      status: 'open',
    });

    await AuditService.flagForReview({
      related_table: 'athletes',
      related_id: athleteId,
      reason: `Profile incomplete: ${issues.join(', ')}`,
    });

    return {
      success: true,
      taskId: task?.id,
      auditLogId: auditLog?.id,
      flaggedForReview: true,
      message: `Profile needs updates: ${issues.join(', ')}`,
    };
  }

  static async auditCreator(creatorId: string): Promise<AgentResult> {
    const { data: record, error } = await supabase
      .from('creators')
      .select('*')
      .eq('id', creatorId)
      .maybeSingle();

    if (error || !record) {
      return { success: false, message: 'Creator not found' };
    }

    const issues = auditCreatorProfile(record as ProfileRecord);

    const auditLog = await AuditService.log({
      table_name: 'creators',
      row_id: creatorId,
      action: 'profile_agent_audit',
      new_value: { issues, result: issues.length === 0 ? 'profile_complete' : 'profile_incomplete' },
    });

    if (issues.length === 0) {
      return { success: true, auditLogId: auditLog?.id, flaggedForReview: false, message: 'Creator profile complete' };
    }

    const task = await TaskService.create({
      title: `Improve creator profile: ${record.display_name}`,
      description: `Profile gaps identified: ${issues.join(', ')}`,
      priority: issues.length >= 3 ? 'high' : 'normal',
      related_table: 'creators',
      related_id: creatorId,
      status: 'open',
    });

    await AuditService.flagForReview({
      related_table: 'creators',
      related_id: creatorId,
      reason: `Profile incomplete: ${issues.join(', ')}`,
    });

    return {
      success: true,
      taskId: task?.id,
      auditLogId: auditLog?.id,
      flaggedForReview: true,
      message: `Creator profile needs updates: ${issues.join(', ')}`,
    };
  }

  static async auditAllAthletes(): Promise<AgentResult[]> {
    const { data } = await supabase
      .from('athletes')
      .select('id')
      .eq('is_active', true)
      .limit(50);

    return Promise.all((data || []).map((r) => ProfileAgentService.auditAthlete(r.id)));
  }

  static async auditAllCreators(): Promise<AgentResult[]> {
    const { data } = await supabase
      .from('creators')
      .select('id')
      .eq('is_active', true)
      .limit(50);

    return Promise.all((data || []).map((r) => ProfileAgentService.auditCreator(r.id)));
  }
}

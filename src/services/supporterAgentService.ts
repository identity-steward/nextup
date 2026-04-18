import { supabase } from '../lib/supabase';
import { TaskService } from './taskService';
import { AuditService } from './auditService';
import type { AgentResult } from '../types/agent';

type SupporterRecord = Record<string, unknown> & { id: string };

function classifySupporter(record: SupporterRecord): {
  priority: 'low' | 'normal' | 'high' | 'urgent';
  flags: string[];
  isHighValue: boolean;
} {
  const flags: string[] = [];
  let priority: 'low' | 'normal' | 'high' | 'urgent' = 'normal';
  let isHighValue = false;

  if (!record.email) flags.push('missing email');
  if (!record.first_name || !record.last_name) flags.push('missing full name');
  if (!record.support_type) flags.push('missing support type');

  if (record.support_type === 'monthly_10') {
    isHighValue = true;
    priority = 'high';
  }

  if (flags.length >= 2) priority = 'urgent';

  return { priority, flags, isHighValue };
}

export class SupporterAgentService {
  static async processSupporterSignup(recordId: string): Promise<AgentResult> {
    const { data: record, error } = await supabase
      .from('supporter_signups')
      .select('*')
      .eq('id', recordId)
      .maybeSingle();

    if (error || !record) {
      return { success: false, message: 'Record not found' };
    }

    const { priority, flags, isHighValue } = classifySupporter(record as SupporterRecord);
    const needsReview = flags.length > 0;

    const nextStatus = needsReview ? 'pending' : 'active';
    await supabase
      .from('supporter_signups')
      .update({ status: nextStatus })
      .eq('id', recordId);

    const supportLabel = record.support_type === 'monthly_10'
      ? '$10/month'
      : record.support_type === 'monthly_5'
        ? '$5/month'
        : 'one-time';

    const task = await TaskService.create({
      title: `New supporter: ${record.first_name} ${record.last_name} (${supportLabel})`,
      description: needsReview
        ? `Validation flags: ${flags.join(', ')}`
        : isHighValue
          ? `High-value supporter signed up at ${supportLabel}. Send welcome sequence and connect with preferred athlete if specified.`
          : `New supporter signed up at ${supportLabel}. Send confirmation and welcome message.`,
      priority,
      related_table: 'supporter_signups',
      related_id: recordId,
      status: 'open',
    });

    const auditLog = await AuditService.log({
      table_name: 'supporter_signups',
      row_id: recordId,
      action: 'supporter_agent_processed',
      new_value: { status: nextStatus, flags, priority, isHighValue },
    });

    let flaggedForReview = false;
    if (needsReview) {
      await AuditService.flagForReview({
        related_table: 'supporter_signups',
        related_id: recordId,
        reason: `Supporter validation flags: ${flags.join(', ')}`,
      });
      flaggedForReview = true;
    }

    if (record.preferred_athlete && !needsReview) {
      await TaskService.create({
        title: `Match supporter to athlete: ${record.preferred_athlete}`,
        description: `${record.first_name} ${record.last_name} expressed interest in supporting ${record.preferred_athlete}. Confirm athlete exists and notify them.`,
        priority: 'normal',
        related_table: 'supporter_signups',
        related_id: recordId,
        status: 'open',
      });
    }

    return {
      success: true,
      taskId: task?.id,
      auditLogId: auditLog?.id,
      flaggedForReview,
      message: needsReview
        ? `Flagged for review: ${flags.join(', ')}`
        : `Supporter activated (${supportLabel})`,
    };
  }

  static async processPendingSupporters(): Promise<AgentResult[]> {
    const { data } = await supabase
      .from('supporter_signups')
      .select('id')
      .eq('status', 'pending')
      .limit(20);

    return Promise.all((data || []).map((r) => SupporterAgentService.processSupporterSignup(r.id)));
  }
}

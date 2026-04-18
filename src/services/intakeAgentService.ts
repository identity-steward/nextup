import { supabase } from '../lib/supabase';
import { TaskService } from './taskService';
import { AuditService } from './auditService';
import type { AgentResult } from '../types/agent';

type IntakeRecord = Record<string, unknown> & { id: string };

function classifyAthleteSignup(record: IntakeRecord): { priority: 'low' | 'normal' | 'high' | 'urgent'; flags: string[] } {
  const flags: string[] = [];
  let priority: 'low' | 'normal' | 'high' | 'urgent' = 'normal';

  if (!record.parent_email) flags.push('missing parent email');
  if (!record.athlete_first_name) flags.push('missing athlete name');
  if (!record.athlete_sport) flags.push('missing sport');
  if (!record.athlete_grade) flags.push('missing grade');
  if (!record.parent_phone) flags.push('missing phone number');

  if (flags.length >= 3) priority = 'high';
  if (flags.length === 0) priority = 'normal';

  return { priority, flags };
}

function classifyParentIntake(record: IntakeRecord): { priority: 'low' | 'normal' | 'high' | 'urgent'; flags: string[] } {
  const flags: string[] = [];
  let priority: 'low' | 'normal' | 'high' | 'urgent' = 'normal';

  if (!record.consent_given) flags.push('consent not given');
  if (!record.athlete_bio) flags.push('missing bio');
  if (!record.parent_email) flags.push('missing parent email');
  if (!record.athlete_sport) flags.push('missing sport');

  if (!record.consent_given) priority = 'high';
  if (flags.length >= 3) priority = 'urgent';

  return { priority, flags };
}

function classifyCreatorApplication(record: IntakeRecord): { priority: 'low' | 'normal' | 'high' | 'urgent'; flags: string[] } {
  const flags: string[] = [];
  let priority: 'low' | 'normal' | 'high' | 'urgent' = 'normal';

  if (!record.portfolio_url && !record.instagram_handle) flags.push('no portfolio or social handle');
  if (!record.specialties) flags.push('missing specialties');
  if (!record.experience) flags.push('missing experience');
  if (!record.email) flags.push('missing email');

  if (flags.includes('no portfolio or social handle')) priority = 'high';
  if (flags.length >= 3) priority = 'urgent';

  return { priority, flags };
}

async function findExistingAthlete(
  firstName: string,
  lastName: string,
  sport: string
): Promise<string | null> {
  if (!firstName || !sport) return null;

  const lastInitial = lastName ? lastName[0].toUpperCase() : null;

  let query = supabase
    .from('athletes')
    .select('id')
    .ilike('first_name', firstName.trim())
    .ilike('sport', sport.trim());

  if (lastInitial) {
    query = query.ilike('last_initial', lastInitial);
  }

  const { data } = await query.limit(1).maybeSingle();
  return data ? (data.id as string) : null;
}

export class IntakeAgentService {
  static async processAthleteSignup(recordId: string): Promise<AgentResult> {
    const { data: record, error } = await supabase
      .from('athlete_signups')
      .select('*')
      .eq('id', recordId)
      .maybeSingle();

    if (error || !record) {
      return { success: false, message: 'Record not found' };
    }

    const firstName = (record.athlete_first_name as string | undefined)?.trim() ?? '';
    const lastName = (record.athlete_last_name as string | undefined)?.trim() ?? '';
    const sport = (record.athlete_sport as string | undefined)?.trim() ?? '';

    const matchedAthleteId = await findExistingAthlete(firstName, lastName, sport);
    const matchSource = matchedAthleteId ? 'name_sport' : null;

    const { priority, flags } = classifyAthleteSignup(record as IntakeRecord);
    const needsReview = flags.length > 0;
    const nextStatus = needsReview ? 'pending' : 'reviewed';

    const updatePayload: Record<string, unknown> = { status: nextStatus };
    if (matchedAthleteId) {
      updatePayload.athlete_id = matchedAthleteId;
      updatePayload.match_source = matchSource;
    }

    await supabase
      .from('athlete_signups')
      .update(updatePayload)
      .eq('id', recordId);

    const taskTitle = matchedAthleteId
      ? `Attached signup to existing athlete: ${firstName} ${lastName}`
      : `Review new athlete signup: ${firstName} ${lastName}`;

    const taskDescription = matchedAthleteId
      ? `Signup linked to existing athlete profile (match: ${matchSource}).${needsReview ? ` Flags: ${flags.join(', ')}` : ' No missing fields.'}`
      : needsReview
        ? `Flagged issues: ${flags.join(', ')}`
        : 'New athlete — no existing profile found. Ready for profile creation.';

    const task = await TaskService.create({
      title: taskTitle,
      description: taskDescription,
      priority,
      related_table: 'athlete_signups',
      related_id: recordId,
      status: 'open',
    });

    const auditLog = await AuditService.log({
      table_name: 'athlete_signups',
      row_id: recordId,
      action: matchedAthleteId ? 'intake_agent_matched_existing' : 'intake_agent_processed',
      new_value: {
        status: nextStatus,
        flags,
        priority,
        athlete_id: matchedAthleteId,
        match_source: matchSource,
      },
    });

    let flaggedForReview = false;
    if (needsReview) {
      await AuditService.flagForReview({
        related_table: 'athlete_signups',
        related_id: recordId,
        reason: `Intake validation flags: ${flags.join(', ')}`,
      });
      flaggedForReview = true;
    }

    const message = matchedAthleteId
      ? `Attached to existing athlete (${matchSource})${needsReview ? ` — flags: ${flags.join(', ')}` : ''}`
      : needsReview
        ? `Flagged for review: ${flags.join(', ')}`
        : 'Processed — no existing athlete found, ready for profile creation';

    return {
      success: true,
      taskId: task?.id,
      auditLogId: auditLog?.id,
      flaggedForReview,
      message,
    };
  }

  static async processParentIntake(recordId: string): Promise<AgentResult> {
    const { data: record, error } = await supabase
      .from('parent_intake')
      .select('*')
      .eq('id', recordId)
      .maybeSingle();

    if (error || !record) {
      return { success: false, message: 'Record not found' };
    }

    const { priority, flags } = classifyParentIntake(record as IntakeRecord);
    const needsReview = flags.length > 0;

    const nextStatus = needsReview ? 'pending' : 'reviewed';
    await supabase
      .from('parent_intake')
      .update({ status: nextStatus })
      .eq('id', recordId);

    const task = await TaskService.create({
      title: `Review parent intake: ${record.athlete_first_name} ${record.athlete_last_name}`,
      description: needsReview
        ? `Flagged issues: ${flags.join(', ')}`
        : 'Parent intake complete — ready for athlete profile setup.',
      priority,
      related_table: 'parent_intake',
      related_id: recordId,
      status: 'open',
    });

    const auditLog = await AuditService.log({
      table_name: 'parent_intake',
      row_id: recordId,
      action: 'intake_agent_processed',
      new_value: { status: nextStatus, flags, priority },
    });

    let flaggedForReview = false;
    if (needsReview) {
      await AuditService.flagForReview({
        related_table: 'parent_intake',
        related_id: recordId,
        reason: `Intake validation flags: ${flags.join(', ')}`,
      });
      flaggedForReview = true;
    }

    return {
      success: true,
      taskId: task?.id,
      auditLogId: auditLog?.id,
      flaggedForReview,
      message: needsReview ? `Flagged for review: ${flags.join(', ')}` : 'Processed successfully',
    };
  }

  static async processCreatorApplication(recordId: string): Promise<AgentResult> {
    const { data: record, error } = await supabase
      .from('creator_applications')
      .select('*')
      .eq('id', recordId)
      .maybeSingle();

    if (error || !record) {
      return { success: false, message: 'Record not found' };
    }

    const { priority, flags } = classifyCreatorApplication(record as IntakeRecord);
    const needsReview = flags.length > 0;

    const nextStatus = needsReview ? 'pending' : 'reviewed';
    await supabase
      .from('creator_applications')
      .update({ status: nextStatus })
      .eq('id', recordId);

    const task = await TaskService.create({
      title: `Review creator application: ${record.first_name} ${record.last_name}`,
      description: needsReview
        ? `Flagged issues: ${flags.join(', ')}`
        : 'Creator application ready for portfolio review and onboarding.',
      priority,
      related_table: 'creator_applications',
      related_id: recordId,
      status: 'open',
    });

    const auditLog = await AuditService.log({
      table_name: 'creator_applications',
      row_id: recordId,
      action: 'intake_agent_processed',
      new_value: { status: nextStatus, flags, priority },
    });

    let flaggedForReview = false;
    if (needsReview) {
      await AuditService.flagForReview({
        related_table: 'creator_applications',
        related_id: recordId,
        reason: `Application validation flags: ${flags.join(', ')}`,
      });
      flaggedForReview = true;
    }

    return {
      success: true,
      taskId: task?.id,
      auditLogId: auditLog?.id,
      flaggedForReview,
      message: needsReview ? `Flagged for review: ${flags.join(', ')}` : 'Processed successfully',
    };
  }

  static async processPendingRecords(): Promise<{
    athleteSignups: AgentResult[];
    parentIntakes: AgentResult[];
    creatorApplications: AgentResult[];
  }> {
    const [signups, intakes, applications] = await Promise.all([
      supabase.from('athlete_signups').select('id').eq('status', 'pending').limit(20),
      supabase.from('parent_intake').select('id').eq('status', 'pending').limit(20),
      supabase.from('creator_applications').select('id').eq('status', 'pending').limit(20),
    ]);

    const athleteResults = await Promise.all(
      (signups.data || []).map((r) => IntakeAgentService.processAthleteSignup(r.id))
    );
    const intakeResults = await Promise.all(
      (intakes.data || []).map((r) => IntakeAgentService.processParentIntake(r.id))
    );
    const creatorResults = await Promise.all(
      (applications.data || []).map((r) => IntakeAgentService.processCreatorApplication(r.id))
    );

    return {
      athleteSignups: athleteResults,
      parentIntakes: intakeResults,
      creatorApplications: creatorResults,
    };
  }
}

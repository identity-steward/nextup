import { supabase } from '../lib/supabase';
import type {
  Outcome,
  BarrierEvent,
  OutcomeWithRelations,
  BarrierEventWithRelations,
  OutcomeReviewData,
  ConnectedStatus,
  ServiceReceivedStatus,
  HelpfulnessStatus,
  AccessStage,
  BarrierType,
  BarrierLocus,
  BarrierProvenance,
  BarrierVerificationStatus,
  BarrierRemediability,
} from '../types/outcome';

// ============================================================
// Next Action generation
// ============================================================

export function generateNextAction(
  connected: ConnectedStatus,
  serviceReceived: ServiceReceivedStatus,
  helpfulness: HelpfulnessStatus,
): string {
  if (connected === 'yes') {
    if (serviceReceived === 'yes' && helpfulness === 'yes') return 'Close this pathway';
    if (serviceReceived === 'yes' && helpfulness === 'no') return 'Ask navigator to review other options';
    if (serviceReceived === 'yes' && helpfulness === 'too_early_to_tell') return 'Keep this pathway open and check back later';
    if (serviceReceived === 'yes' && helpfulness === 'not_yet') return 'Keep this pathway open and check back later';
    if (serviceReceived === 'still_waiting') return 'Wait for service to begin';
    if (serviceReceived === 'partially') return 'Check what else is needed';
    if (serviceReceived === 'no') return 'Ask navigator to review';
    return 'Wait for response';
  }
  if (connected === 'no') return 'Try another pathway';
  if (connected === 'not_yet') return 'Wait for response';
  if (connected === 'chose_differently') return 'Review another pathway';
  return 'Ask navigator to review';
}

// ============================================================
// Outcome CRUD
// ============================================================

export async function getOutcomesForHousehold(householdId: string): Promise<OutcomeWithRelations[]> {
  const { data, error } = await supabase
    .from('outcomes')
    .select(`
      *,
      referral:referrals(id, recipient_name, status),
      pathway:pathways(id, status)
    `)
    .eq('household_id', householdId)
    .order('created_at', { ascending: false });
  if (error) throw error;

  const outcomes = (data ?? []) as unknown as OutcomeWithRelations[];

  for (const o of outcomes) {
    const { data: barriers } = await supabase
      .from('barrier_events')
      .select('*')
      .eq('outcome_id', o.id)
      .order('created_at', { ascending: false });
    o.barrier_events = (barriers ?? []) as BarrierEvent[];
  }

  return outcomes;
}

export async function getOutcomesForPerson(personId: string): Promise<OutcomeWithRelations[]> {
  const { data, error } = await supabase
    .from('outcomes')
    .select(`
      *,
      referral:referrals(id, recipient_name, status),
      pathway:pathways(id, status)
    `)
    .eq('person_id', personId)
    .order('created_at', { ascending: false });
  if (error) throw error;

  const outcomes = (data ?? []) as unknown as OutcomeWithRelations[];

  for (const o of outcomes) {
    const { data: barriers } = await supabase
      .from('barrier_events')
      .select('*')
      .eq('outcome_id', o.id)
      .order('created_at', { ascending: false });
    o.barrier_events = (barriers ?? []) as BarrierEvent[];
  }

  return outcomes;
}

export async function getLatestOutcomeForReferral(referralId: string): Promise<Outcome | null> {
  const { data, error } = await supabase
    .from('outcomes')
    .select('*')
    .eq('referral_id', referralId)
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle();
  if (error) throw error;
  return data as Outcome | null;
}

export async function createOutcome(params: {
  household_id: string;
  person_id: string;
  referral_id: string;
  pathway_id?: string;
  connected_status: ConnectedStatus;
  service_received_status?: ServiceReceivedStatus;
  helpfulness_status?: HelpfulnessStatus;
  notes?: string;
  reported_by?: string;
  provenance?: BarrierProvenance;
}): Promise<Outcome> {
  const connected = params.connected_status;
  const serviceReceived = params.service_received_status ?? inferServiceReceived(connected);
  const helpfulness = params.helpfulness_status ?? 'unknown';
  const nextAction = generateNextAction(connected, serviceReceived, helpfulness);

  const { data, error } = await supabase
    .from('outcomes')
    .insert({
      household_id: params.household_id,
      person_id: params.person_id,
      referral_id: params.referral_id,
      pathway_id: params.pathway_id ?? null,
      connected_status: connected,
      service_received_status: serviceReceived,
      helpfulness_status: helpfulness,
      next_action: nextAction,
      reported_by: params.reported_by ?? null,
      provenance: params.provenance ?? 'person_reported',
      notes: params.notes ?? null,
    })
    .select()
    .single();
  if (error) throw error;
  return data as Outcome;
}

export async function updateOutcome(id: string, updates: Partial<Outcome>): Promise<void> {
  if (updates.connected_status && updates.service_received_status !== undefined) {
    updates.next_action = generateNextAction(
      updates.connected_status,
      updates.service_received_status,
      updates.helpfulness_status ?? 'unknown',
    );
  }
  const { error } = await supabase.from('outcomes').update(updates).eq('id', id);
  if (error) throw error;
}

function inferServiceReceived(connected: ConnectedStatus): ServiceReceivedStatus {
  switch (connected) {
    case 'yes': return 'unknown';
    case 'no': return 'no';
    case 'not_yet': return 'still_waiting';
    case 'chose_differently': return 'not_applicable';
    default: return 'unknown';
  }
}

// ============================================================
// Barrier Event CRUD
// ============================================================

export async function getBarrierEventsForOutcome(outcomeId: string): Promise<BarrierEvent[]> {
  const { data, error } = await supabase
    .from('barrier_events')
    .select('*')
    .eq('outcome_id', outcomeId)
    .order('created_at', { ascending: false });
  if (error) throw error;
  return (data ?? []) as BarrierEvent[];
}

export async function getBarrierEventsForHousehold(householdId: string): Promise<BarrierEventWithRelations[]> {
  const { data, error } = await supabase
    .from('barrier_events')
    .select(`
      *,
      referral:referrals(id, recipient_name, status),
      outcome:outcomes(id, connected_status),
      pathway:pathways(id, status),
      incident:incidents(id, incident_type, review_status)
    `)
    .eq('household_id', householdId)
    .order('created_at', { ascending: false });
  if (error) throw error;
  return (data ?? []) as unknown as BarrierEventWithRelations[];
}

export async function createBarrierEvent(params: {
  household_id: string;
  person_id: string;
  referral_id: string;
  outcome_id?: string;
  pathway_id?: string;
  access_stage: AccessStage;
  barrier_type: BarrierType;
  locus?: BarrierLocus;
  reported_by?: string;
  provenance?: BarrierProvenance;
  verification_status?: BarrierVerificationStatus;
  remediability?: BarrierRemediability;
  free_text?: string;
  next_action?: string;
}): Promise<BarrierEvent> {
  const { data, error } = await supabase
    .from('barrier_events')
    .insert({
      household_id: params.household_id,
      person_id: params.person_id,
      referral_id: params.referral_id,
      outcome_id: params.outcome_id ?? null,
      pathway_id: params.pathway_id ?? null,
      access_stage: params.access_stage,
      barrier_type: params.barrier_type,
      locus: params.locus ?? 'undetermined',
      reported_by: params.reported_by ?? null,
      provenance: params.provenance ?? 'person_reported',
      verification_status: params.verification_status ?? 'self_reported',
      remediability: params.remediability ?? 'unknown',
      free_text: params.free_text ?? null,
      next_action: params.next_action ?? null,
    })
    .select()
    .single();
  if (error) throw error;
  return data as BarrierEvent;
}

export async function updateBarrierEvent(id: string, updates: Partial<BarrierEvent>): Promise<void> {
  const { error } = await supabase.from('barrier_events').update(updates).eq('id', id);
  if (error) throw error;
}

export async function linkBarrierToIncident(barrierId: string, incidentId: string): Promise<void> {
  const { error } = await supabase
    .from('barrier_events')
    .update({ incident_id: incidentId })
    .eq('id', barrierId);
  if (error) throw error;
}

// ============================================================
// Person-facing barrier type mapping (plain language → internal)
// ============================================================

export const PERSON_BARRIER_OPTIONS: { label: string; barrier_type: BarrierType; access_stage: AccessStage }[] = [
  { label: "Didn't hear back", barrier_type: 'communication_failure', access_stage: 'contact_attempted' },
  { label: "Couldn't get there", barrier_type: 'transportation', access_stage: 'attendance' },
  { label: "Timing didn't work", barrier_type: 'hours_conflict', access_stage: 'scheduling' },
  { label: "Cost was a barrier", barrier_type: 'cost', access_stage: 'payment' },
  { label: "Needed information wasn't available", barrier_type: 'required_documentation_unavailable', access_stage: 'application' },
  { label: "Program was full", barrier_type: 'capacity_unavailable', access_stage: 'enrollment' },
  { label: "A requirement wasn't confirmed", barrier_type: 'eligibility_unverified', access_stage: 'eligibility_review' },
  { label: "Chose another option", barrier_type: 'person_chose_alternative', access_stage: 'unknown' },
  { label: "Something else", barrier_type: 'other', access_stage: 'unknown' },
];

// ============================================================
// Admin: Outcome Review Aggregation
// ============================================================

export async function getOutcomeReviewData(): Promise<OutcomeReviewData> {
  // Outcomes needing follow-up (connected but not resolved)
  const { data: allOutcomes } = await supabase
    .from('outcomes')
    .select(`
      *,
      referral:referrals(id, recipient_name, status),
      pathway:pathways(id, status)
    `)
    .order('created_at', { ascending: false });
  const outcomes = (allOutcomes ?? []) as unknown as OutcomeWithRelations[];

  const outcomesNeedingFollowUp = outcomes.filter((o) =>
    o.helpfulness_status === 'no' ||
    o.helpfulness_status === 'not_yet' ||
    (o.connected_status === 'yes' && o.service_received_status === 'still_waiting')
  );

  const noResponseOutcomes = outcomes.filter((o) =>
    o.connected_status === 'not_yet' || o.connected_status === 'no'
  );

  // Barriers
  const { data: allBarriers } = await supabase
    .from('barrier_events')
    .select(`
      *,
      referral:referrals(id, recipient_name, status),
      outcome:outcomes(id, connected_status),
      pathway:pathways(id, status),
      incident:incidents(id, incident_type, review_status)
    `)
    .order('created_at', { ascending: false });
  const barriers = (allBarriers ?? []) as unknown as BarrierEventWithRelations[];

  const barriersRequiringNavigatorAction = barriers.filter((b) =>
    b.remediability === 'actionable_now' || b.remediability === 'requires_follow_up'
  );

  const barriersRequiringExternalDecision = barriers.filter((b) =>
    b.remediability === 'requires_external_decision'
  );

  const nextUpCausedBarriers = barriers.filter((b) => b.locus === 'nextup');

  // Open pathways without recent outcome
  const { data: openPathways } = await supabase
    .from('pathways')
    .select(`
      id,
      need:needs(title),
      person_id,
      household_id,
      status,
      referrals:referrals(id, status, created_at)
    `)
    .in('status', ['active', 'waiting', 'possible', 'blocked']);
  
  const openPathwaysWithoutRecentOutcome: OutcomeReviewData['openPathwaysWithoutRecentOutcome'] = [];
  for (const pw of (openPathways ?? []) as Array<Record<string, unknown>>) {
    const referrals = pw.referrals as Array<{ id: string; status: string; created_at: string }> | null;
    if (!referrals || referrals.length === 0) continue;
    const latestReferral = referrals[0];
    
    // Check if there's an outcome for this referral
    const { data: existingOutcome } = await supabase
      .from('outcomes')
      .select('id')
      .eq('referral_id', latestReferral.id)
      .maybeSingle();
    if (existingOutcome) continue;

    const daysSince = Math.floor((Date.now() - new Date(latestReferral.created_at).getTime()) / (1000 * 60 * 60 * 24));
    openPathwaysWithoutRecentOutcome.push({
      pathway_id: pw.id as string,
      need_title: (pw.need as { title: string })?.title ?? 'Unknown need',
      person_id: pw.person_id as string,
      household_id: pw.household_id as string,
      last_referral_status: latestReferral.status,
      days_since_referral: daysSince,
    });
  }

  return {
    outcomesNeedingFollowUp,
    noResponseOutcomes,
    barriersRequiringNavigatorAction,
    barriersRequiringExternalDecision,
    nextUpCausedBarriers,
    openPathwaysWithoutRecentOutcome,
  };
}

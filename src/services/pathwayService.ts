import { supabase } from '../lib/supabase';
import type {
  Pathway,
  Service,
  Provider,
  EligibilityPathway,
  FundingOption,
  FundingGate,
  Referral,
  ContactAttempt,
  PathwayWithRelations,
  ReferralWithRelations,
  PathwayReviewData,
  PathwayStatus,
  ReferralStatus,
  ReferralStatusSource,
  FundingGateStatus,
  FundingApplicabilityStatus,
} from '../types/pathway';
import type { Need } from '../types/narration';

// ============================================================
// Referral state transition map (mirrors database trigger)
// ============================================================

const REFERRAL_TRANSITIONS: Record<ReferralStatus, ReferralStatus[]> = {
  draft: ['ready', 'cancelled', 'unknown'],
  ready: ['sent', 'cancelled', 'unknown'],
  sent: ['received', 'unable_to_contact', 'unknown', 'cancelled', 'expired'],
  received: ['acknowledged', 'screening', 'unknown', 'cancelled'],
  acknowledged: ['screening', 'unknown', 'cancelled'],
  screening: ['accepted', 'declined', 'unknown', 'cancelled'],
  accepted: ['intake_scheduled', 'service_initiated', 'unknown', 'cancelled'],
  intake_scheduled: ['service_initiated', 'cancelled', 'unknown'],
  service_initiated: ['completed', 'unknown', 'cancelled'],
  unable_to_contact: ['sent', 'cancelled', 'unknown'],
  person_declined: ['unknown'],
  declined: ['unknown'],
  completed: ['unknown'],
  expired: ['unknown'],
  cancelled: ['unknown'],
  unknown: ['draft', 'ready', 'sent', 'cancelled'],
};

export function isValidReferralTransition(from: ReferralStatus, to: ReferralStatus): boolean {
  return REFERRAL_TRANSITIONS[from]?.includes(to) ?? false;
}

// ============================================================
// Freshness check
// ============================================================

const STALE_THRESHOLD_DAYS = 90;

export function isStale(checkedAt: string | null): boolean {
  if (!checkedAt) return true;
  const days = (Date.now() - new Date(checkedAt).getTime()) / (1000 * 60 * 60 * 24);
  return days > STALE_THRESHOLD_DAYS;
}

// ============================================================
// Service catalog
// ============================================================

export async function getServices(): Promise<Service[]> {
  const { data, error } = await supabase
    .from('services')
    .select('*')
    .eq('status', 'active')
    .order('name');
  if (error) throw error;
  return (data ?? []) as Service[];
}

export async function getServiceById(id: string): Promise<Service | null> {
  const { data, error } = await supabase
    .from('services')
    .select('*')
    .eq('id', id)
    .maybeSingle();
  if (error) throw error;
  return data as Service | null;
}

// ============================================================
// Provider catalog
// ============================================================

export async function getProviders(): Promise<Provider[]> {
  const { data, error } = await supabase
    .from('providers')
    .select('*')
    .order('organization_name');
  if (error) throw error;
  return (data ?? []) as Provider[];
}

export async function getProviderById(id: string): Promise<Provider | null> {
  const { data, error } = await supabase
    .from('providers')
    .select('*')
    .eq('id', id)
    .maybeSingle();
  if (error) throw error;
  return data as Provider | null;
}

// ============================================================
// Eligibility pathways
// ============================================================

export async function getEligibilityPathways(): Promise<EligibilityPathway[]> {
  const { data, error } = await supabase
    .from('eligibility_pathways')
    .select('*')
    .order('program_name');
  if (error) throw error;
  return (data ?? []) as EligibilityPathway[];
}

// ============================================================
// Pathways
// ============================================================

export async function getPathwaysForHousehold(householdId: string): Promise<PathwayWithRelations[]> {
  const { data, error } = await supabase
    .from('pathways')
    .select(`
      *,
      service:services(*),
      provider:providers(*),
      eligibility_pathway:eligibility_pathways(*),
      funding_option:funding_options(*),
      need:needs(id, title, description)
    `)
    .eq('household_id', householdId)
    .order('created_at', { ascending: false });
  if (error) throw error;

  const pathways = (data ?? []) as unknown as PathwayWithRelations[];

  // Fetch funding gates and referrals for each pathway
  for (const pw of pathways) {
    if (pw.funding_option_id) {
      const { data: gates } = await supabase
        .from('funding_gates')
        .select('*')
        .eq('funding_option_id', pw.funding_option_id)
        .order('sequence', { ascending: true });
      pw.funding_gates = (gates ?? []) as FundingGate[];
    }
    const { data: referrals } = await supabase
      .from('referrals')
      .select('*')
      .eq('pathway_id', pw.id)
      .order('created_at', { ascending: false });
    pw.referrals = (referrals ?? []) as Referral[];
  }

  return pathways;
}

export async function getPathwaysForPerson(personId: string): Promise<PathwayWithRelations[]> {
  const { data, error } = await supabase
    .from('pathways')
    .select(`
      *,
      service:services(*),
      provider:providers(*),
      eligibility_pathway:eligibility_pathways(*),
      funding_option:funding_options(*),
      need:needs(id, title, description)
    `)
    .eq('person_id', personId)
    .order('created_at', { ascending: false });
  if (error) throw error;

  const pathways = (data ?? []) as unknown as PathwayWithRelations[];

  for (const pw of pathways) {
    if (pw.funding_option_id) {
      const { data: gates } = await supabase
        .from('funding_gates')
        .select('*')
        .eq('funding_option_id', pw.funding_option_id)
        .order('sequence', { ascending: true });
      pw.funding_gates = (gates ?? []) as FundingGate[];
    }
    const { data: referrals } = await supabase
      .from('referrals')
      .select('*')
      .eq('pathway_id', pw.id)
      .order('created_at', { ascending: false });
    pw.referrals = (referrals ?? []) as Referral[];
  }

  return pathways;
}

export async function createPathway(params: {
  household_id: string;
  person_id: string;
  need_id: string;
  service_id?: string;
  provider_id?: string;
  eligibility_pathway_id?: string;
  status?: PathwayStatus;
  created_by?: string;
}): Promise<Pathway> {
  // Verify the need is confirmed before creating a pathway
  const { data: need, error: needError } = await supabase
    .from('needs')
    .select('status')
    .eq('id', params.need_id)
    .maybeSingle();
  if (needError) throw needError;
  if (!need) throw new Error('Need not found');
  if (need.status !== 'confirmed') {
    throw new Error('Pathway can only be created from a confirmed need');
  }

  const { data, error } = await supabase
    .from('pathways')
    .insert({
      household_id: params.household_id,
      person_id: params.person_id,
      need_id: params.need_id,
      service_id: params.service_id ?? null,
      provider_id: params.provider_id ?? null,
      eligibility_pathway_id: params.eligibility_pathway_id ?? null,
      status: params.status ?? 'possible',
      created_by: params.created_by ?? null,
    })
    .select()
    .single();
  if (error) throw error;
  return data as Pathway;
}

export async function updatePathwayStatus(id: string, status: PathwayStatus): Promise<void> {
  const { error } = await supabase
    .from('pathways')
    .update({ status })
    .eq('id', id);
  if (error) throw error;
}

export async function updatePathwayLinks(id: string, updates: {
  service_id?: string | null;
  provider_id?: string | null;
  eligibility_pathway_id?: string | null;
  funding_option_id?: string | null;
}): Promise<void> {
  const { error } = await supabase
    .from('pathways')
    .update(updates)
    .eq('id', id);
  if (error) throw error;
}

// ============================================================
// Funding options
// ============================================================

export async function getFundingOptionsForPathway(pathwayId: string): Promise<FundingOption[]> {
  const { data, error } = await supabase
    .from('funding_options')
    .select('*')
    .eq('pathway_id', pathwayId)
    .order('created_at', { ascending: false });
  if (error) throw error;
  return (data ?? []) as FundingOption[];
}

export async function createFundingOption(params: {
  pathway_id: string;
  mechanism_type: FundingOption['mechanism_type'];
  payer_or_funder_name?: string;
  source_authority?: string;
  assertion_type?: FundingOption['assertion_type'];
  applicability_status?: FundingApplicabilityStatus;
  payment_status?: FundingOption['payment_status'];
  notes?: string;
}): Promise<FundingOption> {
  const { data, error } = await supabase
    .from('funding_options')
    .insert({
      pathway_id: params.pathway_id,
      mechanism_type: params.mechanism_type,
      payer_or_funder_name: params.payer_or_funder_name ?? null,
      source_authority: params.source_authority ?? null,
      source_checked_at: new Date().toISOString(),
      assertion_type: params.assertion_type ?? 'possible',
      applicability_status: params.applicability_status ?? 'unknown',
      payment_status: params.payment_status ?? 'not_started',
      notes: params.notes ?? null,
    })
    .select()
    .single();
  if (error) throw error;
  return data as FundingOption;
}

export async function updateFundingOption(id: string, updates: Partial<FundingOption>): Promise<void> {
  const { error } = await supabase
    .from('funding_options')
    .update(updates)
    .eq('id', id);
  if (error) throw error;
}

// ============================================================
// Funding gates
// ============================================================

export async function getFundingGates(fundingOptionId: string): Promise<FundingGate[]> {
  const { data, error } = await supabase
    .from('funding_gates')
    .select('*')
    .eq('funding_option_id', fundingOptionId)
    .order('sequence', { ascending: true });
  if (error) throw error;
  return (data ?? []) as FundingGate[];
}

export async function createFundingGate(params: {
  funding_option_id: string;
  gate_type: string;
  sequence?: number;
  blocking?: boolean;
  decision_owner?: string;
  status?: FundingGateStatus;
  notes?: string;
}): Promise<FundingGate> {
  const { data, error } = await supabase
    .from('funding_gates')
    .insert({
      funding_option_id: params.funding_option_id,
      gate_type: params.gate_type,
      sequence: params.sequence ?? 0,
      blocking: params.blocking ?? true,
      decision_owner: params.decision_owner ?? null,
      status: params.status ?? 'unknown',
      checked_at: new Date().toISOString(),
      notes: params.notes ?? null,
    })
    .select()
    .single();
  if (error) throw error;
  return data as FundingGate;
}

export async function updateFundingGateStatus(id: string, status: FundingGateStatus, notes?: string): Promise<void> {
  const update: Record<string, unknown> = { status, checked_at: new Date().toISOString() };
  if (notes !== undefined) update.notes = notes;
  const { error } = await supabase
    .from('funding_gates')
    .update(update)
    .eq('id', id);
  if (error) throw error;
}

export function hasUnresolvedBlockingGates(gates: FundingGate[]): boolean {
  return gates.some((g) => g.blocking && g.status !== 'met' && g.status !== 'not_applicable');
}

// ============================================================
// Referrals
// ============================================================

export async function getReferralsForHousehold(householdId: string): Promise<ReferralWithRelations[]> {
  const { data, error } = await supabase
    .from('referrals')
    .select(`
      *,
      pathway:pathways(*),
      service:services(*),
      provider:providers(*)
    `)
    .eq('household_id', householdId)
    .order('created_at', { ascending: false });
  if (error) throw error;

  const referrals = (data ?? []) as unknown as ReferralWithRelations[];

  for (const r of referrals) {
    const { data: attempts } = await supabase
      .from('contact_attempts')
      .select('*')
      .eq('referral_id', r.id)
      .order('attempted_at', { ascending: false });
    r.contact_attempts = (attempts ?? []) as ContactAttempt[];
  }

  return referrals;
}

export async function getReferralsForPathway(pathwayId: string): Promise<Referral[]> {
  const { data, error } = await supabase
    .from('referrals')
    .select('*')
    .eq('pathway_id', pathwayId)
    .order('created_at', { ascending: false });
  if (error) throw error;
  return (data ?? []) as Referral[];
}

export async function createReferralDraft(params: {
  household_id: string;
  person_id: string;
  pathway_id: string;
  service_id?: string;
  provider_id?: string;
  sender_user_id?: string;
  recipient_name: string;
  recipient_type?: string;
}): Promise<Referral> {
  const { data, error } = await supabase
    .from('referrals')
    .insert({
      household_id: params.household_id,
      person_id: params.person_id,
      pathway_id: params.pathway_id,
      service_id: params.service_id ?? null,
      provider_id: params.provider_id ?? null,
      sender_user_id: params.sender_user_id ?? null,
      recipient_name: params.recipient_name,
      recipient_type: params.recipient_type ?? null,
      status: 'draft',
      status_source: 'navigator_reported',
    })
    .select()
    .single();
  if (error) throw error;
  return data as Referral;
}

export async function updateReferralStatus(
  id: string,
  newStatus: ReferralStatus,
  statusSource?: ReferralStatusSource,
  statusReason?: string,
  disclosureId?: string,
): Promise<void> {
  // Fetch current status for transition validation
  const { data: current, error: fetchError } = await supabase
    .from('referrals')
    .select('status, disclosure_id')
    .eq('id', id)
    .maybeSingle();
  if (fetchError) throw fetchError;
  if (!current) throw new Error('Referral not found');

  const currentStatus = current.status as ReferralStatus;
  if (!isValidReferralTransition(currentStatus, newStatus)) {
    throw new Error(`Invalid referral transition: ${currentStatus} -> ${newStatus}`);
  }

  // If transitioning to 'sent', verify linked disclosure has status='sent'
  if (newStatus === 'sent') {
    const linkedDisclosureId = disclosureId ?? current.disclosure_id;
    if (!linkedDisclosureId) {
      throw new Error('Referral cannot be sent without a linked disclosure');
    }
    const { data: disclosure, error: discError } = await supabase
      .from('disclosures')
      .select('status')
      .eq('id', linkedDisclosureId)
      .maybeSingle();
    if (discError) throw discError;
    if (!disclosure || disclosure.status !== 'sent') {
      throw new Error('Referral cannot be sent until linked disclosure has been delivered');
    }

    const update: Record<string, unknown> = {
      status: newStatus,
      status_source: statusSource ?? 'navigator_reported',
      status_reason: statusReason ?? null,
      disclosure_id: linkedDisclosureId,
    };
    const { error } = await supabase.from('referrals').update(update).eq('id', id);
    if (error) throw error;
    return;
  }

  const update: Record<string, unknown> = {
    status: newStatus,
    status_source: statusSource ?? 'navigator_reported',
    status_reason: statusReason ?? null,
  };
  const { error } = await supabase.from('referrals').update(update).eq('id', id);
  if (error) throw error;
}

export async function linkReferralToDisclosure(referralId: string, disclosureId: string): Promise<void> {
  const { error } = await supabase
    .from('referrals')
    .update({ disclosure_id: disclosureId })
    .eq('id', referralId);
  if (error) throw error;
}

// ============================================================
// Contact attempts
// ============================================================

export async function getContactAttempts(referralId: string): Promise<ContactAttempt[]> {
  const { data, error } = await supabase
    .from('contact_attempts')
    .select('*')
    .eq('referral_id', referralId)
    .order('attempted_at', { ascending: false });
  if (error) throw error;
  return (data ?? []) as ContactAttempt[];
}

export async function createContactAttempt(params: {
  referral_id: string;
  initiator: string;
  intended_recipient: string;
  method: ContactAttempt['method'];
  result: ContactAttempt['result'];
  follow_up_at?: string;
  notes?: string;
  created_by?: string;
}): Promise<ContactAttempt> {
  const { data, error } = await supabase
    .from('contact_attempts')
    .insert({
      referral_id: params.referral_id,
      initiator: params.initiator,
      intended_recipient: params.intended_recipient,
      method: params.method,
      result: params.result,
      follow_up_at: params.follow_up_at ?? null,
      notes: params.notes ?? null,
      created_by: params.created_by ?? null,
    })
    .select()
    .single();
  if (error) throw error;
  return data as ContactAttempt;
}

// ============================================================
// Admin: Pathway Review Aggregation
// ============================================================

export async function getPathwayReviewData(): Promise<PathwayReviewData> {
  // Needs without pathways
  const { data: allNeeds } = await supabase
    .from('needs')
    .select('id, title, person_id, household_id, status')
    .eq('status', 'confirmed')
    .order('created_at', { ascending: false });
  const confirmedNeeds = (allNeeds ?? []) as Need[];
  const needIds = confirmedNeeds.map((n) => n.id);

  let needsWithoutPathways: { id: string; title: string; person_id: string; household_id: string }[] = [];
  if (needIds.length > 0) {
    const { data: pathwayNeeds } = await supabase
      .from('pathways')
      .select('need_id')
      .in('need_id', needIds);
    const needsWithPathways = new Set((pathwayNeeds ?? []).map((p: { need_id: string }) => p.need_id));
    needsWithoutPathways = confirmedNeeds
      .filter((n) => !needsWithPathways.has(n.id))
      .map((n) => ({ id: n.id, title: n.title, person_id: n.person_id, household_id: n.household_id ?? '' }));
  }

  // Draft pathways
  const { data: draftPws } = await supabase
    .from('pathways')
    .select(`
      *,
      service:services(*),
      provider:providers(*),
      eligibility_pathway:eligibility_pathways(*),
      funding_option:funding_options(*),
      need:needs(id, title, description)
    `)
    .in('status', ['possible', 'blocked', 'unknown'])
    .order('created_at', { ascending: false });
  const draftPathways = (draftPws ?? []) as unknown as PathwayWithRelations[];

  // Stale providers (source_checked_at older than 90 days or null)
  const { data: allProviders } = await supabase
    .from('providers')
    .select('*')
    .order('organization_name');
  const staleProviders = (allProviders ?? []).filter((p: Provider) => isStale(p.source_checked_at)) as Provider[];

  // Stale services
  const { data: allServices } = await supabase
    .from('services')
    .select('*')
    .order('name');
  const staleServices = (allServices ?? []).filter((s: Service) => isStale(s.source_checked_at)) as Service[];

  // Funding gates needing verification
  const { data: gatesNeedingVerification } = await supabase
    .from('funding_gates')
    .select(`
      *,
      funding_option:funding_options(*)
    `)
    .in('status', ['unknown', 'needs_verification'])
    .eq('blocking', true)
    .order('created_at', { ascending: false });
  const fundingGatesNeedingVerification = (gatesNeedingVerification ?? []) as unknown as (FundingGate & { funding_option?: FundingOption })[];

  // Referrals waiting for action (draft, ready, sent without received)
  const { data: waitingReferrals } = await supabase
    .from('referrals')
    .select(`
      *,
      pathway:pathways(*),
      service:services(*),
      provider:providers(*)
    `)
    .in('status', ['draft', 'ready', 'sent', 'screening', 'accepted', 'intake_scheduled'])
    .order('created_at', { ascending: false });
  const referralsWaitingForAction = (waitingReferrals ?? []) as unknown as ReferralWithRelations[];

  // Referrals with no response (sent, unable_to_contact)
  const { data: noResponseReferrals } = await supabase
    .from('referrals')
    .select(`
      *,
      pathway:pathways(*),
      service:services(*),
      provider:providers(*)
    `)
    .in('status', ['sent', 'unable_to_contact'])
    .order('created_at', { ascending: false });
  const referralsNoResponse = (noResponseReferrals ?? []) as unknown as ReferralWithRelations[];

  // Contact attempts needing follow-up
  const { data: followUpAttempts } = await supabase
    .from('contact_attempts')
    .select('*')
    .not('follow_up_at', 'is', null)
    .order('follow_up_at', { ascending: true });
  const now = new Date().toISOString();
  const contactAttemptsNeedingFollowUp = (followUpAttempts ?? []).filter(
    (ca: ContactAttempt) => ca.follow_up_at && ca.follow_up_at <= now,
  ) as ContactAttempt[];

  return {
    needsWithoutPathways,
    draftPathways,
    staleProviders,
    staleServices,
    fundingGatesNeedingVerification,
    referralsWaitingForAction,
    referralsNoResponse,
    contactAttemptsNeedingFollowUp,
  };
}

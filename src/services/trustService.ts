import { supabase } from '../lib/supabase';
import type {
  NavigatorAssignment,
  AuthorityToAct,
  YouthAssent,
  ConsentGrant,
  Disclosure,
  DocumentReference,
  Escalation,
  Incident,
  HardStopResult,
  DisclosurePreview,
  AssignmentStatus,
  VerificationStatus,
  YouthAssentStatus,
  EscalationStatus,
  EscalationTrigger,
  IncidentType,
  IncidentSeverity,
  IncidentReviewStatus,
  DocumentExistenceStatus,
} from '../types/trust';

// ============================================================
// Navigator Assignments
// ============================================================

export async function getNavigatorAssignments(navigatorUserId: string): Promise<NavigatorAssignment[]> {
  const { data, error } = await supabase
    .from('navigator_assignments')
    .select('*')
    .eq('navigator_user_id', navigatorUserId)
    .order('assigned_at', { ascending: false });
  if (error) throw error;
  return (data ?? []) as NavigatorAssignment[];
}

export async function getAllNavigatorAssignments(): Promise<NavigatorAssignment[]> {
  const { data, error } = await supabase
    .from('navigator_assignments')
    .select('*')
    .order('assigned_at', { ascending: false });
  if (error) throw error;
  return (data ?? []) as NavigatorAssignment[];
}

export async function createNavigatorAssignment(
  navigatorUserId: string,
  householdId: string,
  assignedBy: string,
  expiresAt?: string,
): Promise<NavigatorAssignment> {
  const { data, error } = await supabase
    .from('navigator_assignments')
    .insert({
      navigator_user_id: navigatorUserId,
      household_id: householdId,
      assigned_by: assignedBy,
      expires_at: expiresAt ?? null,
      assignment_status: 'active',
    })
    .select()
    .single();
  if (error) throw error;
  return data as NavigatorAssignment;
}

export async function updateAssignmentStatus(
  assignmentId: string,
  status: AssignmentStatus,
): Promise<void> {
  const { error } = await supabase
    .from('navigator_assignments')
    .update({ assignment_status: status })
    .eq('id', assignmentId);
  if (error) throw error;
}

// ============================================================
// Authority to Act
// ============================================================

export async function getAuthorityRecords(householdId: string): Promise<AuthorityToAct[]> {
  const { data, error } = await supabase
    .from('authority_to_act')
    .select('*')
    .eq('household_id', householdId)
    .order('created_at', { ascending: false });
  if (error) throw error;
  return (data ?? []) as AuthorityToAct[];
}

export async function createAuthority(
  subjectPersonId: string,
  householdId: string,
  dataCategory: string,
  actionType: string,
  verificationStatus: VerificationStatus,
  opts?: {
    actorPersonId?: string;
    actorUserId?: string;
    authorityBasis?: string;
    legalInstrumentAsserted?: boolean;
    disputed?: boolean;
    effectiveAt?: string;
    reviewAt?: string;
    expiresAt?: string;
    notes?: string;
  },
): Promise<AuthorityToAct> {
  const { data, error } = await supabase
    .from('authority_to_act')
    .insert({
      subject_person_id: subjectPersonId,
      household_id: householdId,
      data_category: dataCategory,
      action_type: actionType,
      verification_status: verificationStatus,
      actor_person_id: opts?.actorPersonId ?? null,
      actor_user_id: opts?.actorUserId ?? null,
      authority_basis: opts?.authorityBasis ?? null,
      legal_instrument_asserted: opts?.legalInstrumentAsserted ?? false,
      disputed: opts?.disputed ?? false,
      effective_at: opts?.effectiveAt ?? null,
      review_at: opts?.reviewAt ?? null,
      expires_at: opts?.expiresAt ?? null,
      notes: opts?.notes ?? null,
    })
    .select()
    .single();
  if (error) throw error;
  return data as AuthorityToAct;
}

export function checkAuthorityHardStops(authority: AuthorityToAct): HardStopResult {
  if (authority.disputed) {
    return {
      blocked: true,
      reason: 'We need to confirm who can authorize this action before anything is shared.',
      escalationNeeded: true,
      escalationTrigger: 'authority_unresolved',
    };
  }
  if (authority.legal_instrument_asserted && authority.verification_status !== 'verified_by_qualified_authority') {
    return {
      blocked: true,
      reason: 'A legal instrument has been asserted but not yet verified. A navigator needs to review this before anything is sent.',
      escalationNeeded: true,
      escalationTrigger: 'legal_instrument_asserted',
    };
  }
  if (authority.expires_at && new Date(authority.expires_at) < new Date()) {
    return {
      blocked: true,
      reason: 'The authority for this action has expired. It needs to be reviewed before anything is shared.',
      escalationNeeded: true,
      escalationTrigger: 'authority_unresolved',
    };
  }
  if (authority.review_at && new Date(authority.review_at) < new Date() && authority.verification_status !== 'verified_by_qualified_authority') {
    return {
      blocked: true,
      reason: 'This authority is due for review. A navigator needs to review this before anything is shared.',
      escalationNeeded: true,
      escalationTrigger: 'authority_unresolved',
    };
  }
  return { blocked: false, reason: '', escalationNeeded: false };
}

export async function findAuthority(
  householdId: string,
  subjectPersonId: string,
  dataCategory: string,
  actionType: string,
): Promise<AuthorityToAct | null> {
  const { data, error } = await supabase
    .from('authority_to_act')
    .select('*')
    .eq('household_id', householdId)
    .eq('subject_person_id', subjectPersonId)
    .eq('data_category', dataCategory)
    .eq('action_type', actionType)
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle();
  if (error) throw error;
  return data as AuthorityToAct | null;
}

// ============================================================
// Youth Assent
// ============================================================

export async function getYouthAssents(householdId: string): Promise<YouthAssent[]> {
  const { data, error } = await supabase
    .from('youth_assents')
    .select('*')
    .eq('household_id', householdId)
    .order('created_at', { ascending: false });
  if (error) throw error;
  return (data ?? []) as YouthAssent[];
}

export async function createYouthAssent(
  youthPersonId: string,
  householdId: string,
  dataCategory: string,
  actionType: string,
  status: YouthAssentStatus,
  recipientLabel?: string,
): Promise<YouthAssent> {
  const { data, error } = await supabase
    .from('youth_assents')
    .insert({
      youth_person_id: youthPersonId,
      household_id: householdId,
      data_category: dataCategory,
      action_type: actionType,
      status,
      recipient_label: recipientLabel ?? null,
      asked_at: status === 'asked_agreed' || status === 'asked_declined' ? new Date().toISOString() : null,
    })
    .select()
    .single();
  if (error) throw error;
  return data as YouthAssent;
}

export function checkYouthAssentStop(
  assent: YouthAssent | null,
  isYouth: boolean,
): HardStopResult | null {
  if (!isYouth) return null;
  if (!assent || assent.status === 'not_yet_asked' || assent.status === 'unknown') {
    return {
      blocked: true,
      reason: 'A young person involved needs to be asked before this is shared.',
      escalationNeeded: true,
      escalationTrigger: 'youth_assent_review',
    };
  }
  if (assent.status === 'asked_declined') {
    return {
      blocked: true,
      reason: 'The young person did not agree to this sharing. A navigator needs to review this before anything is sent.',
      escalationNeeded: true,
      escalationTrigger: 'youth_assent_review',
    };
  }
  return null;
}

// ============================================================
// Consent Grants
// ============================================================

export async function getConsentGrants(householdId: string): Promise<ConsentGrant[]> {
  const { data, error } = await supabase
    .from('consent_grants')
    .select('*')
    .eq('household_id', householdId)
    .order('created_at', { ascending: false });
  if (error) throw error;
  return (data ?? []) as ConsentGrant[];
}

export async function getActiveConsentGrants(householdId: string): Promise<ConsentGrant[]> {
  const { data, error } = await supabase
    .from('consent_grants')
    .select('*')
    .eq('household_id', householdId)
    .eq('status', 'active')
    .order('created_at', { ascending: false });
  if (error) throw error;
  return (data ?? []) as ConsentGrant[];
}

export async function createConsentGrant(
  subjectPersonId: string,
  authorizingActorId: string,
  householdId: string,
  recipientName: string,
  purpose: string,
  dataCategories: string[],
  opts?: {
    recipientType?: string;
    expiresAt?: string;
    authorityToActId?: string;
  },
): Promise<ConsentGrant> {
  const { data, error } = await supabase
    .from('consent_grants')
    .insert({
      subject_person_id: subjectPersonId,
      authorizing_actor_id: authorizingActorId,
      household_id: householdId,
      recipient_name: recipientName,
      recipient_type: opts?.recipientType ?? null,
      purpose,
      data_categories: dataCategories,
      expires_at: opts?.expiresAt ?? null,
      authority_to_act_id: opts?.authorityToActId ?? null,
      status: 'active',
      effective_at: new Date().toISOString(),
    })
    .select()
    .single();
  if (error) throw error;
  return data as ConsentGrant;
}

export async function revokeConsentGrant(consentId: string): Promise<void> {
  const { error } = await supabase
    .from('consent_grants')
    .update({ status: 'revoked', revoked_at: new Date().toISOString() })
    .eq('id', consentId);
  if (error) throw error;
}

// ============================================================
// Disclosures
// ============================================================

export async function getDisclosures(householdId: string): Promise<Disclosure[]> {
  const { data, error } = await supabase
    .from('disclosures')
    .select('*')
    .eq('household_id', householdId)
    .order('created_at', { ascending: false });
  if (error) throw error;
  return (data ?? []) as Disclosure[];
}

export interface PrepareDisclosureParams {
  householdId: string;
  subjectPersonId: string;
  senderUserId: string;
  recipientName: string;
  purpose: string;
  dataFields: string[];
  claimAttributions?: Record<string, string>;
  consentGrantId?: string;
}

export async function prepareDisclosure(params: PrepareDisclosureParams): Promise<Disclosure> {
  const { data, error } = await supabase
    .from('disclosures')
    .insert({
      household_id: params.householdId,
      subject_person_id: params.subjectPersonId,
      sender_user_id: params.senderUserId,
      recipient_name: params.recipientName,
      purpose: params.purpose,
      data_fields: params.dataFields,
      claim_attributions: params.claimAttributions ?? null,
      consent_grant_id: params.consentGrantId ?? null,
      delivery_method: null,
      status: 'prepared',
      prepared_at: new Date().toISOString(),
      sent_at: null,
    })
    .select()
    .single();
  if (error) throw error;
  return data as Disclosure;
}

export async function getDisclosuresAwaitingDelivery(): Promise<Disclosure[]> {
  const { data, error } = await supabase
    .from('disclosures')
    .select('*')
    .in('status', ['prepared', 'delivery_pending'])
    .order('created_at', { ascending: false });
  if (error) throw error;
  return (data ?? []) as Disclosure[];
}

export async function startDelivery(disclosureId: string): Promise<void> {
  const { error } = await supabase
    .from('disclosures')
    .update({
      status: 'delivery_pending',
      delivery_started_at: new Date().toISOString(),
    })
    .eq('id', disclosureId);
  if (error) throw error;
}

export interface ConfirmDeliveryParams {
  deliveredByUserId: string;
  deliveryMethod: string;
  deliveryNotes?: string;
  deliveryReference?: string;
}

export async function confirmDelivery(
  disclosureId: string,
  params: ConfirmDeliveryParams,
): Promise<void> {
  if (!params.deliveryMethod) {
    throw new Error('Delivery method is required to mark a disclosure as sent.');
  }
  if (!params.deliveredByUserId) {
    throw new Error('A navigator must be identified to confirm delivery.');
  }
  const { error } = await supabase
    .from('disclosures')
    .update({
      status: 'sent',
      sent_at: new Date().toISOString(),
      delivery_method: params.deliveryMethod,
      delivered_by_user_id: params.deliveredByUserId,
      delivery_notes: params.deliveryNotes ?? null,
      delivery_reference: params.deliveryReference ?? null,
    })
    .eq('id', disclosureId);
  if (error) throw error;
}

export async function failDelivery(disclosureId: string, notes?: string): Promise<void> {
  const { error } = await supabase
    .from('disclosures')
    .update({
      status: 'failed',
      failed_at: new Date().toISOString(),
      delivery_notes: notes ?? null,
    })
    .eq('id', disclosureId);
  if (error) throw error;
}

export async function cancelDisclosure(disclosureId: string, reason?: string): Promise<void> {
  const { error } = await supabase
    .from('disclosures')
    .update({
      status: 'cancelled',
      cancelled_at: new Date().toISOString(),
      delivery_notes: reason ?? null,
    })
    .eq('id', disclosureId);
  if (error) throw error;
}

export async function buildDisclosurePreview(
  householdId: string,
  subjectPersonId: string,
  isYouth: boolean,
  recipientName: string,
  purpose: string,
  dataFields: string[],
  dataCategory: string,
  actionType: string,
): Promise<DisclosurePreview> {
  const [authority, assentRecord, activeConsents] = await Promise.all([
    findAuthority(householdId, subjectPersonId, dataCategory, actionType),
    supabase
      .from('youth_assents')
      .select('*')
      .eq('household_id', householdId)
      .eq('youth_person_id', subjectPersonId)
      .eq('data_category', dataCategory)
      .eq('action_type', actionType)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle(),
    getActiveConsentGrants(householdId),
  ]);

  const hardStops: HardStopResult[] = [];

  if (authority) {
    const authStop = checkAuthorityHardStops(authority);
    if (authStop.blocked) hardStops.push(authStop);
  } else {
    hardStops.push({
      blocked: true,
      reason: 'We need to confirm who can authorize this action before anything is shared.',
      escalationNeeded: true,
      escalationTrigger: 'authority_unresolved',
    });
  }

  if (isYouth) {
    const assent = assentRecord.data as YouthAssent | null;
    const assentStop = checkYouthAssentStop(assent, true);
    if (assentStop) hardStops.push(assentStop);
  }

  const matchingConsent = activeConsents.find(
    (c) => c.recipient_name === recipientName && c.purpose === purpose,
  );

  return {
    recipientName,
    purpose,
    willShare: dataFields,
    willNotShare: [],
    authorityValid: !hardStops.some((s) => s.blocked && s.escalationTrigger === 'authority_unresolved'),
    youthAssentValid: !hardStops.some((s) => s.blocked && s.escalationTrigger === 'youth_assent_review'),
    consentActive: !!matchingConsent,
    hardStops,
  };
}

// ============================================================
// Document References
// ============================================================

export async function getDocumentReferences(householdId: string): Promise<DocumentReference[]> {
  const { data, error } = await supabase
    .from('document_references')
    .select('*')
    .eq('household_id', householdId)
    .order('created_at', { ascending: false });
  if (error) throw error;
  return (data ?? []) as DocumentReference[];
}

export async function createDocumentReference(
  personId: string,
  householdId: string,
  documentType: string,
  holder: string,
  neededFor: string,
  existenceStatus: DocumentExistenceStatus = 'person_reports_available',
  notes?: string,
): Promise<DocumentReference> {
  const { data, error } = await supabase
    .from('document_references')
    .insert({
      person_id: personId,
      household_id: householdId,
      document_type: documentType,
      holder,
      needed_for: neededFor,
      existence_status: existenceStatus,
      notes: notes ?? null,
      last_confirmed_at: new Date().toISOString(),
    })
    .select()
    .single();
  if (error) throw error;
  return data as DocumentReference;
}

export async function deleteDocumentReference(id: string): Promise<void> {
  const { error } = await supabase
    .from('document_references')
    .delete()
    .eq('id', id);
  if (error) throw error;
}

// ============================================================
// Escalations
// ============================================================

export async function getEscalations(householdId?: string): Promise<Escalation[]> {
  let query = supabase.from('escalations').select('*').order('created_at', { ascending: false });
  if (householdId) query = query.eq('household_id', householdId);
  const { data, error } = await query;
  if (error) throw error;
  return (data ?? []) as Escalation[];
}

export async function getOpenEscalations(): Promise<Escalation[]> {
  const { data, error } = await supabase
    .from('escalations')
    .select('*')
    .in('status', ['open', 'acknowledged'])
    .order('created_at', { ascending: false });
  if (error) throw error;
  return (data ?? []) as Escalation[];
}

export async function createEscalation(
  householdId: string,
  triggerType: EscalationTrigger,
  affectedAction: string,
  destination?: string,
  personId?: string,
  createdBy?: string,
): Promise<Escalation> {
  const { data, error } = await supabase
    .from('escalations')
    .insert({
      household_id: householdId,
      person_id: personId ?? null,
      trigger_type: triggerType,
      affected_action: affectedAction,
      destination: destination ?? null,
      status: 'open',
      created_by: createdBy ?? null,
    })
    .select()
    .single();
  if (error) throw error;
  return data as Escalation;
}

export async function updateEscalationStatus(
  id: string,
  status: EscalationStatus,
  resolution?: string,
): Promise<void> {
  const update: Record<string, unknown> = { status };
  if (status === 'acknowledged') update.acknowledged_at = new Date().toISOString();
  if (resolution) update.resolution = resolution;
  const { error } = await supabase.from('escalations').update(update).eq('id', id);
  if (error) throw error;
}

// ============================================================
// Incidents
// ============================================================

export async function getIncidents(householdId?: string): Promise<Incident[]> {
  let query = supabase.from('incidents').select('*').order('created_at', { ascending: false });
  if (householdId) query = query.eq('household_id', householdId);
  const { data, error } = await query;
  if (error) throw error;
  return (data ?? []) as Incident[];
}

export async function getOpenIncidents(): Promise<Incident[]> {
  const { data, error } = await supabase
    .from('incidents')
    .select('*')
    .in('review_status', ['open', 'under_review'])
    .order('created_at', { ascending: false });
  if (error) throw error;
  return (data ?? []) as Incident[];
}

export async function createIncident(
  householdId: string,
  incidentType: IncidentType,
  severity: IncidentSeverity,
  opts?: {
    personId?: string;
    informationInvolved?: string;
    financialHarmPossible?: boolean;
    immediateMitigation?: string;
    createdBy?: string;
  },
): Promise<Incident> {
  const { data, error } = await supabase
    .from('incidents')
    .insert({
      household_id: householdId,
      person_id: opts?.personId ?? null,
      incident_type: incidentType,
      severity,
      information_involved: opts?.informationInvolved ?? null,
      financial_harm_possible: opts?.financialHarmPossible ?? false,
      immediate_mitigation: opts?.immediateMitigation ?? null,
      created_by: opts?.createdBy ?? null,
    })
    .select()
    .single();
  if (error) throw error;
  return data as Incident;
}

export async function updateIncidentReviewStatus(
  id: string,
  reviewStatus: IncidentReviewStatus,
  resolution?: string,
  correctiveAction?: string,
): Promise<void> {
  const update: Record<string, unknown> = { review_status: reviewStatus };
  if (resolution) update.resolution = resolution;
  if (correctiveAction) update.corrective_action = correctiveAction;
  const { error } = await supabase.from('incidents').update(update).eq('id', id);
  if (error) throw error;
}

// ============================================================
// Trust Review Aggregation
// ============================================================

export interface TrustReviewData {
  openEscalations: Escalation[];
  openIncidents: Incident[];
  disputedAuthorities: AuthorityToAct[];
  declinedAssents: YouthAssent[];
  revokedConsents: ConsentGrant[];
  disclosuresAwaitingDelivery: Disclosure[];
}

export async function getTrustReviewData(): Promise<TrustReviewData> {
  const [openEscalations, openIncidents, disclosuresAwaitingDelivery] = await Promise.all([
    getOpenEscalations(),
    getOpenIncidents(),
    getDisclosuresAwaitingDelivery(),
  ]);

  const { data: disputedAuth } = await supabase
    .from('authority_to_act')
    .select('*')
    .eq('disputed', true)
    .order('created_at', { ascending: false });

  const { data: declinedAssents } = await supabase
    .from('youth_assents')
    .select('*')
    .eq('status', 'asked_declined')
    .order('created_at', { ascending: false });

  const { data: revokedConsents } = await supabase
    .from('consent_grants')
    .select('*')
    .eq('status', 'revoked')
    .order('updated_at', { ascending: false });

  return {
    openEscalations,
    openIncidents,
    disputedAuthorities: (disputedAuth ?? []) as AuthorityToAct[],
    declinedAssents: (declinedAssents ?? []) as YouthAssent[],
    revokedConsents: (revokedConsents ?? []) as ConsentGrant[],
    disclosuresAwaitingDelivery,
  };
}

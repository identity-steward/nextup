// Phase 5 — Learn: Outcome and BarrierEvent types

export type ConnectedStatus = 'yes' | 'no' | 'not_yet' | 'chose_differently' | 'unknown';
export type ServiceReceivedStatus = 'yes' | 'no' | 'partially' | 'still_waiting' | 'not_applicable' | 'unknown';
export type HelpfulnessStatus = 'yes' | 'no' | 'too_early_to_tell' | 'not_yet' | 'not_applicable' | 'unknown';
export type OutcomeProvenance = 'person_reported' | 'parent_reported' | 'youth_reported' | 'navigator_reported' | 'provider_reported' | 'system_observed' | 'unknown';

export type AccessStage =
  | 'discovery' | 'contact_attempted' | 'intake' | 'application'
  | 'eligibility_review' | 'enrollment' | 'authorization' | 'scheduling'
  | 'attendance' | 'service_initiation' | 'service_continuation'
  | 'payment' | 'reimbursement' | 'follow_up' | 'unknown';

export type BarrierType =
  | 'eligibility_criteria_not_met' | 'eligibility_unverified'
  | 'capacity_unavailable' | 'waitlist' | 'program_paused'
  | 'funding_exhausted' | 'geographic_mismatch' | 'transportation'
  | 'cost' | 'copay' | 'deposit' | 'debt' | 'insurance_network'
  | 'authorization_denied' | 'required_documentation_unavailable'
  | 'identity_residency_address' | 'digital_access' | 'technology'
  | 'language_interpretation' | 'communication_failure' | 'hours_conflict'
  | 'caregiving_conflict' | 'work_conflict' | 'accessibility_accommodation'
  | 'safety_concern' | 'legal_concern' | 'trust_concern' | 'no_service_match'
  | 'person_chose_alternative' | 'referral_error' | 'stale_directory_information'
  | 'unknown' | 'other';

export type BarrierLocus =
  | 'undetermined' | 'person_context' | 'provider' | 'program' | 'payer'
  | 'school' | 'government' | 'nextup' | 'technology'
  | 'transportation_system' | 'multi_party' | 'unknown';

export type BarrierProvenance = 'person_reported' | 'parent_reported' | 'youth_reported' | 'navigator_reported' | 'provider_reported' | 'system_observed' | 'unknown';
export type BarrierVerificationStatus = 'self_reported' | 'partner_reported' | 'navigator_observed' | 'documented' | 'confirmed_by_authority' | 'unverified' | 'unknown';
export type BarrierRemediability = 'actionable_now' | 'requires_follow_up' | 'requires_external_decision' | 'not_currently_actionable' | 'resolved' | 'unknown';

export interface Outcome {
  id: string;
  household_id: string;
  person_id: string;
  referral_id: string;
  pathway_id: string | null;
  connected_status: ConnectedStatus;
  service_received_status: ServiceReceivedStatus;
  helpfulness_status: HelpfulnessStatus;
  next_action: string | null;
  reported_by: string | null;
  provenance: OutcomeProvenance;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface BarrierEvent {
  id: string;
  household_id: string;
  person_id: string;
  referral_id: string;
  outcome_id: string | null;
  pathway_id: string | null;
  access_stage: AccessStage;
  barrier_type: BarrierType;
  locus: BarrierLocus;
  reported_by: string | null;
  provenance: BarrierProvenance;
  verification_status: BarrierVerificationStatus;
  remediability: BarrierRemediability;
  free_text: string | null;
  next_action: string | null;
  incident_id: string | null;
  created_at: string;
  updated_at: string;
}

export interface OutcomeWithRelations extends Outcome {
  referral?: { id: string; recipient_name: string; status: string } | null;
  pathway?: { id: string; status: string } | null;
  barrier_events?: BarrierEvent[];
}

export interface BarrierEventWithRelations extends BarrierEvent {
  referral?: { id: string; recipient_name: string; status: string } | null;
  outcome?: { id: string; connected_status: ConnectedStatus } | null;
  pathway?: { id: string; status: string } | null;
  incident?: { id: string; incident_type: string; review_status: string } | null;
}

export interface OutcomeReviewData {
  outcomesNeedingFollowUp: OutcomeWithRelations[];
  noResponseOutcomes: OutcomeWithRelations[];
  barriersRequiringNavigatorAction: BarrierEventWithRelations[];
  barriersRequiringExternalDecision: BarrierEventWithRelations[];
  nextUpCausedBarriers: BarrierEventWithRelations[];
  openPathwaysWithoutRecentOutcome: { pathway_id: string; need_title: string; person_id: string; household_id: string; last_referral_status: string; days_since_referral: number }[];
}

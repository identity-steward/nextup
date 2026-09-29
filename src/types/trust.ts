export type AssignmentStatus = 'active' | 'paused' | 'ended';
export type VerificationStatus = 'asserted' | 'documented' | 'verified_by_qualified_authority' | 'disputed' | 'unknown';
export type YouthAssentStatus = 'asked_agreed' | 'asked_declined' | 'not_yet_asked' | 'not_applicable' | 'unknown';
export type ConsentStatus = 'draft' | 'active' | 'revoked' | 'expired';
export type DisclosureStatus = 'prepared' | 'delivery_pending' | 'sent' | 'failed' | 'cancelled';
export type EscalationStatus = 'open' | 'acknowledged' | 'resolved' | 'closed';
export type EscalationTrigger = 'authority_unresolved' | 'youth_assent_review' | 'legal_instrument_asserted' | 'consent_ambiguity' | 'sensitive_disclosure_question' | 'professional_determination_needed';
export type IncidentType = 'unauthorized_disclosure' | 'incorrect_recipient' | 'reliance_substitution' | 'funding_misinformation' | 'inappropriate_internal_access' | 'other';
export type IncidentSeverity = 'low' | 'moderate' | 'high' | 'critical';
export type IncidentReviewStatus = 'open' | 'under_review' | 'resolved' | 'closed';
export type DocumentExistenceStatus = 'person_reports_available' | 'person_reports_unavailable' | 'confirmed_available' | 'confirmed_unavailable' | 'unknown';

export interface NavigatorAssignment {
  id: string;
  navigator_user_id: string;
  household_id: string;
  assignment_status: AssignmentStatus;
  assigned_at: string;
  expires_at: string | null;
  assigned_by: string | null;
  created_at: string;
  updated_at: string;
}

export interface AuthorityToAct {
  id: string;
  subject_person_id: string;
  actor_person_id: string | null;
  actor_user_id: string | null;
  household_id: string;
  data_category: string;
  action_type: string;
  authority_basis: string | null;
  verification_status: VerificationStatus;
  legal_instrument_asserted: boolean;
  disputed: boolean;
  effective_at: string | null;
  review_at: string | null;
  expires_at: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface YouthAssent {
  id: string;
  youth_person_id: string;
  household_id: string;
  data_category: string;
  action_type: string;
  recipient_label: string | null;
  status: YouthAssentStatus;
  asked_at: string | null;
  reviewed_at: string | null;
  reviewed_by: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface ConsentGrant {
  id: string;
  subject_person_id: string;
  authorizing_actor_id: string;
  household_id: string;
  recipient_name: string;
  recipient_type: string | null;
  purpose: string;
  data_categories: string[];
  effective_at: string;
  expires_at: string | null;
  revoked_at: string | null;
  authority_to_act_id: string | null;
  status: ConsentStatus;
  created_at: string;
  updated_at: string;
}

export interface Disclosure {
  id: string;
  consent_grant_id: string | null;
  subject_person_id: string;
  household_id: string;
  sender_user_id: string | null;
  recipient_name: string;
  purpose: string;
  data_fields: string[];
  claim_attributions: Record<string, string> | null;
  sent_at: string | null;
  delivery_method: string | null;
  status: DisclosureStatus;
  prepared_at: string | null;
  delivery_started_at: string | null;
  failed_at: string | null;
  cancelled_at: string | null;
  delivered_by_user_id: string | null;
  delivery_reference: string | null;
  delivery_notes: string | null;
  created_at: string;
}

export interface DocumentReference {
  id: string;
  person_id: string;
  household_id: string;
  document_type: string;
  existence_status: DocumentExistenceStatus;
  holder: string;
  needed_for: string | null;
  last_confirmed_at: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface Escalation {
  id: string;
  household_id: string;
  person_id: string | null;
  trigger_type: EscalationTrigger;
  affected_action: string | null;
  destination: string | null;
  status: EscalationStatus;
  acknowledged_at: string | null;
  expected_response: string | null;
  fallback: string | null;
  resolution: string | null;
  created_by: string | null;
  created_at: string;
  updated_at: string;
}

export interface Incident {
  id: string;
  household_id: string;
  person_id: string | null;
  incident_type: IncidentType;
  severity: IncidentSeverity;
  discovered_at: string;
  information_involved: string | null;
  financial_harm_possible: boolean;
  immediate_mitigation: string | null;
  notification_status: string | null;
  review_status: IncidentReviewStatus;
  corrective_action: string | null;
  resolution: string | null;
  created_by: string | null;
  created_at: string;
  updated_at: string;
}

export interface HardStopResult {
  blocked: boolean;
  reason: string;
  escalationNeeded: boolean;
  escalationTrigger?: EscalationTrigger;
}

export interface DisclosurePreview {
  recipientName: string;
  purpose: string;
  willShare: string[];
  willNotShare: string[];
  authorityValid: boolean;
  youthAssentValid: boolean;
  consentActive: boolean;
  hardStops: HardStopResult[];
}

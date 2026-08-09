// Phase 4 — Navigate: Pathway, Service, Provider, Funding, Referral, Contact types

export type PathwayStatus = 'possible' | 'active' | 'waiting' | 'blocked' | 'completed' | 'closed' | 'unknown';
export type ServiceStatus = 'active' | 'inactive' | 'unknown';
export type ProviderVerificationStatus = 'unverified' | 'source_confirmed' | 'partner_confirmed' | 'stale' | 'unknown';
export type EligibilityPathwayStatus =
  | 'possible'
  | 'verification_needed'
  | 'application_initiated'
  | 'under_review'
  | 'authority_confirmed_eligible'
  | 'authority_confirmed_ineligible'
  | 'unknown';

export type FundingMechanismType =
  | 'insurance_benefit'
  | 'medicaid_managed_care'
  | 'school_funded'
  | 'government_benefit'
  | 'grant_funded'
  | 'philanthropic_assistance'
  | 'scholarship'
  | 'fee_waiver'
  | 'employer_benefit'
  | 'fiscal_sponsor_fund'
  | 'provider_charity'
  | 'member_reimbursement'
  | 'direct_provider_payment'
  | 'self_pay'
  | 'other';

export type FundingAssertionType = 'possible' | 'verified' | 'approved' | 'denied' | 'paid' | 'exhausted' | 'unknown';
export type FundingApplicabilityStatus = 'unknown' | 'may_apply' | 'needs_verification' | 'confirmed_applicable' | 'not_applicable';
export type FundingPaymentStatus = 'not_started' | 'pending' | 'approved' | 'denied' | 'paid' | 'reimbursed' | 'partially_paid' | 'unknown';
export type FundingGateStatus = 'unknown' | 'needs_verification' | 'met' | 'not_met' | 'not_applicable';

export type ReferralStatus =
  | 'draft'
  | 'ready'
  | 'sent'
  | 'received'
  | 'acknowledged'
  | 'screening'
  | 'accepted'
  | 'declined'
  | 'intake_scheduled'
  | 'service_initiated'
  | 'completed'
  | 'unable_to_contact'
  | 'person_declined'
  | 'cancelled'
  | 'expired'
  | 'unknown';

export type ReferralStatusSource = 'person_reported' | 'navigator_reported' | 'provider_confirmed' | 'system_observed' | 'unknown';
export type ContactMethod = 'email' | 'phone' | 'secure_portal' | 'in_person' | 'text' | 'other';
export type ContactResult = 'no_response' | 'message_left' | 'reached' | 'scheduled_follow_up' | 'wrong_contact' | 'contact_information_invalid' | 'other';

export interface Service {
  id: string;
  name: string;
  description: string | null;
  service_type: string;
  modality: string | null;
  geography: string | null;
  access_channel: string | null;
  source_authority: string | null;
  source_checked_at: string | null;
  status: ServiceStatus;
  created_at: string;
  updated_at: string;
}

export interface Provider {
  id: string;
  organization_name: string;
  location: string | null;
  contact_name: string | null;
  contact_email: string | null;
  contact_phone: string | null;
  service_area: string | null;
  source_authority: string | null;
  source_checked_at: string | null;
  verification_status: ProviderVerificationStatus;
  created_at: string;
  updated_at: string;
}

export interface EligibilityPathway {
  id: string;
  program_name: string;
  authority_name: string;
  criteria_summary: string | null;
  decision_owner: string | null;
  authoritative_source: string | null;
  source_checked_at: string | null;
  effective_start: string | null;
  effective_end: string | null;
  status: EligibilityPathwayStatus;
  created_at: string;
  updated_at: string;
}

export interface FundingOption {
  id: string;
  pathway_id: string | null;
  mechanism_type: FundingMechanismType;
  payer_or_funder_name: string | null;
  source_authority: string | null;
  source_checked_at: string | null;
  assertion_type: FundingAssertionType;
  applicability_status: FundingApplicabilityStatus;
  payment_status: FundingPaymentStatus;
  payment_recipient: string | null;
  coverage_limit: string | null;
  required_authorization: string | null;
  network_requirement: string | null;
  effective_start: string | null;
  effective_end: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface FundingGate {
  id: string;
  funding_option_id: string;
  gate_type: string;
  sequence: number;
  blocking: boolean;
  decision_owner: string | null;
  status: FundingGateStatus;
  source_authority: string | null;
  checked_at: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface Pathway {
  id: string;
  household_id: string;
  person_id: string;
  need_id: string;
  service_id: string | null;
  provider_id: string | null;
  eligibility_pathway_id: string | null;
  funding_option_id: string | null;
  status: PathwayStatus;
  created_by: string | null;
  created_at: string;
  updated_at: string;
}

export interface Referral {
  id: string;
  household_id: string;
  person_id: string;
  pathway_id: string;
  service_id: string | null;
  provider_id: string | null;
  consent_grant_id: string | null;
  disclosure_id: string | null;
  sender_user_id: string | null;
  recipient_name: string;
  recipient_type: string | null;
  status: ReferralStatus;
  status_reason: string | null;
  status_source: ReferralStatusSource;
  sent_at: string | null;
  received_at: string | null;
  acknowledged_at: string | null;
  closed_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface ContactAttempt {
  id: string;
  referral_id: string;
  initiator: string;
  intended_recipient: string;
  method: ContactMethod;
  attempted_at: string;
  result: ContactResult;
  follow_up_at: string | null;
  notes: string | null;
  created_by: string | null;
  created_at: string;
}

export interface PathwayWithRelations extends Pathway {
  service?: Service | null;
  provider?: Provider | null;
  eligibility_pathway?: EligibilityPathway | null;
  funding_option?: FundingOption | null;
  funding_gates?: FundingGate[];
  referrals?: Referral[];
  need?: { id: string; title: string; description: string | null };
}

export interface ReferralWithRelations extends Referral {
  pathway?: Pathway | null;
  service?: Service | null;
  provider?: Provider | null;
  contact_attempts?: ContactAttempt[];
}

export interface PathwayReviewData {
  needsWithoutPathways: { id: string; title: string; person_id: string; household_id: string }[];
  draftPathways: PathwayWithRelations[];
  staleProviders: Provider[];
  staleServices: Service[];
  fundingGatesNeedingVerification: (FundingGate & { funding_option?: FundingOption })[];
  referralsWaitingForAction: ReferralWithRelations[];
  referralsNoResponse: ReferralWithRelations[];
  contactAttemptsNeedingFollowUp: ContactAttempt[];
}

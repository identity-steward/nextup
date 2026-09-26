export type YouthGovernanceStatus = 'youth' | 'adult' | 'unknown';
export type YouthStatusSource = 'subject_declared' | 'guardian_declared' | 'admin_recorded';
export type RelationshipType = 'parent' | 'guardian' | 'caregiver' | 'sibling' | 'other';
export type RelationshipStatus = 'active' | 'disputed' | 'ended';
export type RelationshipSource = 'self_declared' | 'subject_confirmed' | 'related_person_confirmed' | 'admin_recorded' | 'external_record';

export interface Person {
  id: string;
  auth_user_id?: string | null;
  first_name: string;
  last_name?: string | null;
  youth_governance_status: YouthGovernanceStatus;
  youth_status_confirmed_at?: string | null;
  youth_status_confirmed_by?: string | null;
  youth_status_source?: YouthStatusSource | null;
  created_at: string;
  updated_at: string;
}

export interface PersonRelationship {
  id: string;
  subject_person_id: string;
  related_person_id: string;
  relationship_type: RelationshipType;
  status: RelationshipStatus;
  source: RelationshipSource;
  confirmed_at: string;
  confirmed_by: string;
  ended_at?: string | null;
  created_at: string;
  updated_at: string;
}

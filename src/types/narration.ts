export type NarrationStatus = 'draft' | 'submitted' | 'proposed' | 'confirmed' | 'modified' | 'rejected';
export type NeedStatus = 'confirmed' | 'active' | 'met' | 'unmet' | 'chose_differently';

export interface Person {
  id: string;
  auth_user_id: string | null;
  first_name: string;
  last_name: string | null;
  is_youth: boolean;
  created_at: string;
  updated_at: string;
}

export interface Household {
  id: string;
  name: string | null;
  created_by_person_id: string;
  created_at: string;
  updated_at: string;
}

export interface HouseholdMembership {
  id: string;
  household_id: string;
  person_id: string;
  relationship_role: string;
  created_at: string;
  person?: Person;
}

export interface PersonNarration {
  id: string;
  person_id: string;
  household_id: string | null;
  original_text: string;
  proposed_interpretation: string | null;
  confirmed_interpretation: string | null;
  status: NarrationStatus;
  created_at: string;
  updated_at: string;
  submitted_at: string | null;
  confirmed_at: string | null;
}

export interface Need {
  id: string;
  person_id: string;
  household_id: string | null;
  narration_id: string;
  title: string;
  description: string | null;
  status: NeedStatus;
  created_at: string;
  updated_at: string;
}

export interface HouseholdWithMembers extends Household {
  members: HouseholdMembership[];
}

export interface PersonContext {
  person: Person;
  household: HouseholdWithMembers | null;
}

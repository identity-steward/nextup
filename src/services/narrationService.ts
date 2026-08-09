import { supabase } from '../lib/supabase';
import type {
  Person,
  Household,
  HouseholdMembership,
  PersonNarration,
  Need,
  HouseholdWithMembers,
  NarrationStatus,
} from '../types/narration';

// ============================================================
// Person
// ============================================================

export async function getOrCreatePerson(userId: string, firstName: string, lastName?: string, isYouth = false): Promise<Person> {
  const { data: existing } = await supabase
    .from('persons')
    .select('*')
    .eq('auth_user_id', userId)
    .maybeSingle();

  if (existing) return existing as Person;

  const { data, error } = await supabase
    .from('persons')
    .insert({
      auth_user_id: userId,
      first_name: firstName,
      last_name: lastName ?? null,
      is_youth: isYouth,
    })
    .select()
    .single();

  if (error) throw error;
  return data as Person;
}

export async function getPersonForUser(userId: string): Promise<Person | null> {
  const { data } = await supabase
    .from('persons')
    .select('*')
    .eq('auth_user_id', userId)
    .maybeSingle();
  return data as Person | null;
}

// ============================================================
// Household
// ============================================================

export async function getHouseholdWithMembers(householdId: string): Promise<HouseholdWithMembers | null> {
  const [householdRes, membersRes] = await Promise.all([
    supabase.from('households').select('*').eq('id', householdId).maybeSingle(),
    supabase
      .from('household_memberships')
      .select('*, person:persons(*)')
      .eq('household_id', householdId),
  ]);

  if (!householdRes.data) return null;

  return {
    ...householdRes.data,
    members: (membersRes.data ?? []) as HouseholdMembership[],
  } as HouseholdWithMembers;
}

export async function getHouseholdForPerson(personId: string): Promise<HouseholdWithMembers | null> {
  const { data: membership } = await supabase
    .from('household_memberships')
    .select('household_id')
    .eq('person_id', personId)
    .maybeSingle();

  if (!membership) return null;
  return getHouseholdWithMembers(membership.household_id);
}

export async function createHousehold(personId: string, name?: string): Promise<Household> {
  const { data, error } = await supabase
    .from('households')
    .insert({ created_by_person_id: personId, name: name ?? null })
    .select()
    .single();

  if (error) throw error;

  const household = data as Household;

  // Auto-create self membership
  await supabase
    .from('household_memberships')
    .insert({ household_id: household.id, person_id: personId, relationship_role: 'self' });

  return household;
}

export async function addHouseholdMember(householdId: string, personId: string, role: string): Promise<void> {
  const { error } = await supabase
    .from('household_memberships')
    .insert({ household_id: householdId, person_id: personId, relationship_role: role });

  if (error) throw error;
}

// ============================================================
// Narration
// ============================================================

export async function getNarrations(personId: string): Promise<PersonNarration[]> {
  const { data, error } = await supabase
    .from('person_narrations')
    .select('*')
    .eq('person_id', personId)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return (data ?? []) as PersonNarration[];
}

export async function getLatestNarration(personId: string): Promise<PersonNarration | null> {
  const { data, error } = await supabase
    .from('person_narrations')
    .select('*')
    .eq('person_id', personId)
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) throw error;
  return data as PersonNarration | null;
}

export async function saveNarrationDraft(personId: string, householdId: string | null, text: string): Promise<PersonNarration> {
  // Check for existing draft
  const { data: existing } = await supabase
    .from('person_narrations')
    .select('*')
    .eq('person_id', personId)
    .eq('status', 'draft')
    .maybeSingle();

  if (existing) {
    const { data, error } = await supabase
      .from('person_narrations')
      .update({ original_text: text })
      .eq('id', existing.id)
      .select()
      .single();
    if (error) throw error;
    return data as PersonNarration;
  }

  const { data, error } = await supabase
    .from('person_narrations')
    .insert({
      person_id: personId,
      household_id: householdId,
      original_text: text,
      status: 'draft',
    })
    .select()
    .single();

  if (error) throw error;
  return data as PersonNarration;
}

export async function submitNarration(narrationId: string): Promise<PersonNarration> {
  const { data, error } = await supabase
    .from('person_narrations')
    .update({
      status: 'submitted',
      submitted_at: new Date().toISOString(),
    })
    .eq('id', narrationId)
    .select()
    .single();

  if (error) throw error;
  return data as PersonNarration;
}

export async function confirmNarration(
  narrationId: string,
  interpretation: string,
  modified: boolean,
): Promise<PersonNarration> {
  const status: NarrationStatus = modified ? 'modified' : 'confirmed';
  const { data, error } = await supabase
    .from('person_narrations')
    .update({
      status,
      confirmed_interpretation: interpretation,
      confirmed_at: new Date().toISOString(),
    })
    .eq('id', narrationId)
    .select()
    .single();

  if (error) throw error;
  return data as PersonNarration;
}

export async function rejectNarration(narrationId: string): Promise<PersonNarration> {
  const { data, error } = await supabase
    .from('person_narrations')
    .update({
      status: 'rejected',
      confirmed_at: new Date().toISOString(),
    })
    .eq('id', narrationId)
    .select()
    .single();

  if (error) throw error;
  return data as PersonNarration;
}

// ============================================================
// Needs
// ============================================================

export interface ProposedNeed {
  title: string;
  description: string | null;
}

export async function getNeeds(personId: string): Promise<Need[]> {
  const { data, error } = await supabase
    .from('needs')
    .select('*')
    .eq('person_id', personId)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return (data ?? []) as Need[];
}

export function parseInterpretationToProposedNeeds(interpretation: string): ProposedNeed[] {
  const lines = interpretation
    .split('\n')
    .map((l) => l.trim())
    .filter((l) => l.length > 0);

  const needs: ProposedNeed[] = [];

  for (const line of lines) {
    const cleaned = line.replace(/^[-•]\s*/, '').trim();
    if (cleaned.length === 0) continue;
    if (cleaned.length <= 80) {
      needs.push({ title: cleaned, description: null });
    } else {
      const parts = cleaned.split(/(?<=\.)\s+/);
      needs.push({ title: parts[0] ?? cleaned.slice(0, 80), description: parts.slice(1).join(' ') || null });
    }
  }

  if (needs.length === 0) {
    needs.push({ title: interpretation.slice(0, 80), description: interpretation.length > 80 ? interpretation : null });
  }

  return needs;
}

export async function createReviewedNeeds(
  personId: string,
  householdId: string | null,
  narrationId: string,
  reviewedNeeds: ProposedNeed[],
): Promise<Need[]> {
  if (reviewedNeeds.length === 0) return [];

  const rows = reviewedNeeds.map((n) => ({
    person_id: personId,
    household_id: householdId,
    narration_id: narrationId,
    title: n.title,
    description: n.description,
    status: 'confirmed' as const,
  }));

  const { data, error } = await supabase
    .from('needs')
    .insert(rows)
    .select();

  if (error) throw error;
  return (data ?? []) as Need[];
}

// ============================================================
// Admin: Narration Review
// ============================================================

export async function getSubmittedNarrations(): Promise<(PersonNarration & { person: Person })[]> {
  const { data, error } = await supabase
    .from('person_narrations')
    .select('*, person:persons(*)')
    .in('status', ['submitted', 'proposed'])
    .order('submitted_at', { ascending: true });

  if (error) throw error;
  return (data ?? []) as unknown as (PersonNarration & { person: Person })[];
}

export async function proposeInterpretation(
  narrationId: string,
  interpretation: string,
): Promise<PersonNarration> {
  const { data, error } = await supabase
    .from('person_narrations')
    .update({
      proposed_interpretation: interpretation,
      status: 'proposed',
    })
    .eq('id', narrationId)
    .select()
    .single();

  if (error) throw error;
  return data as PersonNarration;
}

export async function getAllNarrations(): Promise<(PersonNarration & { person: Person })[]> {
  const { data, error } = await supabase
    .from('person_narrations')
    .select('*, person:persons(*)')
    .order('created_at', { ascending: false });

  if (error) throw error;
  return (data ?? []) as unknown as (PersonNarration & { person: Person })[];
}

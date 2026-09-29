import { supabase } from '../lib/supabase';
import type { Disclosure, ConsentGrant, AuthorityToAct } from '../types/trust';

export interface PrivacyHistoryEntry {
  disclosure: Disclosure;
  consent: ConsentGrant | null;
  authority: AuthorityToAct | null;
  deliveredByName: string | null;
}

export interface PrivacyHistoryResult {
  entries: PrivacyHistoryEntry[];
  activeConsents: ConsentGrant[];
}

export async function getPrivacyHistory(householdId: string): Promise<PrivacyHistoryResult> {
  const [disclosuresRes, consentsRes, authoritiesRes] = await Promise.all([
    supabase.from('disclosures').select('*').eq('household_id', householdId).order('created_at', { ascending: false }),
    supabase.from('consent_grants').select('*').eq('household_id', householdId).order('created_at', { ascending: false }),
    supabase.from('authority_to_act').select('*').eq('household_id', householdId).order('created_at', { ascending: false }),
  ]);

  if (disclosuresRes.error) throw disclosuresRes.error;
  if (consentsRes.error) throw consentsRes.error;
  if (authoritiesRes.error) throw authoritiesRes.error;

  const disclosures = (disclosuresRes.data ?? []) as Disclosure[];
  const consents = (consentsRes.data ?? []) as ConsentGrant[];
  const authorities = (authoritiesRes.data ?? []) as AuthorityToAct[];

  const activeConsents = consents.filter((c) => c.status === 'active');

  const recorderRes = await supabase
    .rpc('resolve_delivery_recorder_labels', { p_household_uuid: householdId });

  const recorderMap = new Map<string, string | null>();
  if (!recorderRes.error && recorderRes.data) {
    for (const row of recorderRes.data as { delivered_by_user_id: string; staff_display_name: string | null }[]) {
      recorderMap.set(row.delivered_by_user_id, row.staff_display_name);
    }
  }

  const entries: PrivacyHistoryEntry[] = disclosures.map((disclosure) => {
    const consent = disclosure.consent_grant_id
      ? consents.find((c) => c.id === disclosure.consent_grant_id) ?? null
      : null;
    const authority = consent?.authority_to_act_id
      ? authorities.find((a) => a.id === consent.authority_to_act_id) ?? null
      : null;
    const deliveredByName = disclosure.delivered_by_user_id
      ? recorderMap.get(disclosure.delivered_by_user_id) ?? null
      : null;
    return { disclosure, consent, authority, deliveredByName };
  });

  return { entries, activeConsents };
}

export async function getParticipantHouseholdId(userId: string): Promise<{ householdId: string; personId: string } | null> {
  const { data: person } = await supabase
    .from('persons')
    .select('id')
    .eq('auth_user_id', userId)
    .maybeSingle();
  if (!person) return null;

  const { data: membership } = await supabase
    .from('household_memberships')
    .select('household_id')
    .eq('person_id', person.id)
    .maybeSingle();
  if (!membership) return null;

  return { householdId: membership.household_id, personId: person.id };
}

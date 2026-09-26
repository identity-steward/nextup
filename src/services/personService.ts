import { supabase } from '../lib/supabase';
import type { YouthGovernanceStatus, YouthStatusSource, PersonRelationship, RelationshipType, RelationshipSource } from '../types/person';

export class PersonService {
  // ============================================================
  // Youth-governance status
  // ============================================================

  static async setYouthStatus(
    personId: string,
    status: YouthGovernanceStatus,
    confirmedBy: string,
    source: YouthStatusSource,
  ): Promise<boolean> {
    if (status === 'unknown') {
      const { error } = await supabase
        .from('persons')
        .update({
          youth_governance_status: 'unknown',
          youth_status_confirmed_at: null,
          youth_status_confirmed_by: null,
          youth_status_source: null,
        })
        .eq('id', personId);
      if (error) { console.error('Error clearing youth status:', error); return false; }
      return true;
    }

    const { error } = await supabase
      .from('persons')
      .update({
        youth_governance_status: status,
        youth_status_confirmed_at: new Date().toISOString(),
        youth_status_confirmed_by: confirmedBy,
        youth_status_source: source,
      })
      .eq('id', personId);
    if (error) { console.error('Error setting youth status:', error); return false; }
    return true;
  }

  static async getPersonById(personId: string) {
    const { data, error } = await supabase
      .from('persons')
      .select('*')
      .eq('id', personId)
      .maybeSingle();
    if (error) { console.error('Error fetching person:', error); return null; }
    return data;
  }

  // ============================================================
  // Person relationships
  // ============================================================

  static async getRelationshipsForPerson(personId: string): Promise<PersonRelationship[]> {
    const { data, error } = await supabase
      .from('person_relationships')
      .select('*')
      .or(`subject_person_id.eq.${personId},related_person_id.eq.${personId}`)
      .order('created_at', { ascending: false });
    if (error) { console.error('Error fetching relationships:', error); return []; }
    return (data || []) as PersonRelationship[];
  }

  static async createRelationship(
    subjectPersonId: string,
    relatedPersonId: string,
    relationshipType: RelationshipType,
    source: RelationshipSource,
    confirmedBy: string,
  ): Promise<PersonRelationship | null> {
    const { data, error } = await supabase
      .from('person_relationships')
      .insert({
        subject_person_id: subjectPersonId,
        related_person_id: relatedPersonId,
        relationship_type: relationshipType,
        status: 'active',
        source,
        confirmed_by: confirmedBy,
      })
      .select('*')
      .single();
    if (error) { console.error('Error creating relationship:', error); return null; }
    return data as PersonRelationship;
  }

  static async endRelationship(relationshipId: string): Promise<boolean> {
    const { error } = await supabase
      .from('person_relationships')
      .update({
        status: 'ended',
        ended_at: new Date().toISOString(),
      })
      .eq('id', relationshipId);
    if (error) { console.error('Error ending relationship:', error); return false; }
    return true;
  }
}

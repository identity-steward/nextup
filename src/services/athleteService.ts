import { supabase } from '../lib/supabase';
import type { Athlete, AthleteInput } from '../types/athlete';

export class AthleteService {
  static async getAllAthletes(): Promise<Athlete[]> {
    const { data, error } = await supabase
      .from('athletes')
      .select('*')
      .eq('profile_status', 'active')
      .order('created_at', { ascending: false });
    if (error) { console.error('Error fetching athletes:', error); return []; }
    return data || [];
  }

  static async getAthleteBySlug(slug: string): Promise<Athlete | null> {
    const { data, error } = await supabase
      .from('athletes')
      .select('*')
      .eq('slug', slug)
      .eq('profile_status', 'active')
      .maybeSingle();
    if (error) { console.error('Error fetching athlete by slug:', error); return null; }
    return data;
  }

  static async getAthleteBySlugAsOwner(slug: string): Promise<Athlete | null> {
    const { data, error } = await supabase
      .from('athletes')
      .select('*')
      .eq('slug', slug)
      .maybeSingle();
    if (error) { console.error('Error fetching own athlete by slug:', error); return null; }
    return data;
  }

  // ============================================================
  // Identity Review (Phase 2F.1)
  // ============================================================

  static async getAthletesForIdentityReview(): Promise<IdentityReviewAthlete[]> {
    const { data, error } = await supabase
      .from('athletes')
      .select(`
        id, slug, first_name, last_initial, sport, school, city,
        profile_status, class_year, auth_user_id,
        person_id, identity_confirmed_at, identity_confirmation_method,
        created_at
      `)
      .order('first_name', { ascending: true });
    if (error) { console.error('Error fetching athletes for identity review:', error); return []; }
    return (data || []) as IdentityReviewAthlete[];
  }

  static async getPersonsForSelection(): Promise<IdentityReviewPerson[]> {
    const { data, error } = await supabase
      .from('persons')
      .select('id, first_name, last_name, auth_user_id, youth_governance_status')
      .order('first_name', { ascending: true });
    if (error) { console.error('Error fetching persons for selection:', error); return []; }
    return (data || []) as IdentityReviewPerson[];
  }

  static async createPersonForIdentity(firstName: string, lastName?: string): Promise<IdentityReviewPerson | null> {
    const { data, error } = await supabase
      .from('persons')
      .insert({ first_name: firstName, last_name: lastName ?? null, auth_user_id: null, youth_governance_status: 'unknown' })
      .select('id, first_name, last_name, auth_user_id, youth_governance_status')
      .single();
    if (error) { console.error('Error creating person for identity:', error); return null; }
    return data as IdentityReviewPerson;
  }

  static async confirmAthletePersonIdentity(athleteId: string, personId: string, confirmedBy: string): Promise<boolean> {
    const { error } = await supabase
      .from('athletes')
      .update({
        person_id: personId,
        identity_confirmed_at: new Date().toISOString(),
        identity_confirmed_by: confirmedBy,
        identity_confirmation_method: 'admin_manual_review',
      })
      .eq('id', athleteId);
    if (error) { console.error('Error confirming athlete person identity:', error); return false; }
    return true;
  }

  static async clearAthletePersonIdentity(athleteId: string): Promise<boolean> {
    const { error } = await supabase
      .from('athletes')
      .update({
        person_id: null,
        identity_confirmed_at: null,
        identity_confirmed_by: null,
        identity_confirmation_method: null,
      })
      .eq('id', athleteId);
    if (error) { console.error('Error clearing athlete person identity:', error); return false; }
    return true;
  }
}

export interface IdentityReviewAthlete {
  id: string;
  slug: string;
  first_name: string;
  last_initial: string;
  sport: string;
  school?: string;
  city?: string;
  profile_status: string;
  class_year?: string;
  auth_user_id?: string;
  person_id?: string | null;
  identity_confirmed_at?: string | null;
  identity_confirmation_method?: string | null;
  created_at: string;
}

export interface IdentityReviewPerson {
  id: string;
  first_name: string;
  last_name?: string | null;
  auth_user_id?: string | null;
  youth_governance_status: string;
}

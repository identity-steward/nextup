import { supabase } from '../lib/supabase';
import type { JourneyEntry } from '../types/journey';

interface AthleteListItem {
  id: string;
  first_name: string;
  last_initial: string;
  slug: string;
}

interface EntryWithAthlete extends JourneyEntry {
  athletes?: {
    first_name: string;
    last_initial: string;
    slug: string;
  } | null;
}

export class JourneyService {
  static async getPublicEntries(athleteId: string, limit = 3): Promise<JourneyEntry[]> {
    const { data, error } = await supabase
      .from('journey_entries')
      .select('*')
      .eq('athlete_id', athleteId)
      .eq('status', 'approved')
      .eq('visibility', 'public')
      .order('date_occurred', { ascending: false, nullsFirst: false })
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) {
      console.error('Error fetching public journey entries:', error);
      return [];
    }
    return data || [];
  }

  static async getAthleteEntries(athleteId: string): Promise<JourneyEntry[]> {
    const { data, error } = await supabase
      .from('journey_entries')
      .select('*')
      .eq('athlete_id', athleteId)
      .order('date_occurred', { ascending: false, nullsFirst: false })
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching athlete journey entries:', error);
      return [];
    }
    return data || [];
  }

  static async getAllEntries(statusFilter?: string): Promise<EntryWithAthlete[]> {
    let query = supabase
      .from('journey_entries')
      .select('*, athletes(first_name, last_initial, slug)')
      .order('created_at', { ascending: false })
      .limit(200);

    if (statusFilter && statusFilter !== 'all') {
      query = query.eq('status', statusFilter);
    }

    const { data, error } = await query;
    if (error) {
      console.error('Error fetching all journey entries:', error);
      return [];
    }
    return (data || []) as EntryWithAthlete[];
  }

  static async createEntry(
    entry: Omit<JourneyEntry, 'id' | 'created_at' | 'updated_at'>
  ): Promise<JourneyEntry | null> {
    const { data, error } = await supabase
      .from('journey_entries')
      .insert([entry])
      .select()
      .single();

    if (error) {
      console.error('Error creating journey entry:', error);
      return null;
    }
    return data;
  }

  static async reviewEntry(
    id: string,
    action: 'approved' | 'rejected',
    visibility: 'public' | 'private',
    verified: boolean,
    verifiedBy: string | null,
    adminNotes: string | null
  ): Promise<boolean> {
    const { error } = await supabase
      .from('journey_entries')
      .update({
        status: action,
        visibility,
        verified,
        verified_by: verifiedBy || null,
        admin_notes: adminNotes || null,
        reviewed_at: new Date().toISOString(),
      })
      .eq('id', id);

    if (error) {
      console.error('Error reviewing journey entry:', error);
      return false;
    }
    return true;
  }

  static async updateEntry(id: string, updates: Partial<JourneyEntry>): Promise<boolean> {
    const { error } = await supabase
      .from('journey_entries')
      .update(updates)
      .eq('id', id);

    if (error) {
      console.error('Error updating journey entry:', error);
      return false;
    }
    return true;
  }

  static async getAthletesList(): Promise<AthleteListItem[]> {
    const { data, error } = await supabase
      .from('athletes')
      .select('id, first_name, last_initial, slug')
      .in('profile_status', ['active', 'approved', 'verified_event', 'pending'])
      .order('first_name');

    if (error) {
      console.error('Error fetching athletes list:', error);
      return [];
    }
    return data || [];
  }
}

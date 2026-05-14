import { supabase } from '../lib/supabase';
import type { Athlete, AthleteInput } from '../types/athlete';

export class AthleteService {
  static async getAllAthletes(): Promise<Athlete[]> {
    const { data, error } = await supabase
      .from('athletes')
      .select('*')
      .eq('profile_status', 'active')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching athletes:', error);
      return [];
    }

    return data || [];
  }

  static async getFeaturedAthlete(): Promise<Athlete | null> {
    const { data, error } = await supabase
      .from('athletes')
      .select('*')
      .eq('is_featured', true)
      .eq('profile_status', 'active')
      .maybeSingle();

    if (error) {
      console.error('Error fetching featured athlete:', error);
      return null;
    }

    return data;
  }

  static async getAthleteBySlug(slug: string): Promise<Athlete | null> {
    const { data, error } = await supabase
      .from('athletes')
      .select('*')
      .eq('slug', slug)
      .eq('profile_status', 'active')
      .maybeSingle();

    if (error) {
      console.error('Error fetching athlete by slug:', error);
      return null;
    }

    return data;
  }

  // Fetches any athlete by slug regardless of profile_status — only works if the
  // caller is the owner (RLS: athletes can view own profile via auth_user_id).
  // Used so a pending athlete can preview their own profile page.
  static async getAthleteBySlugAsOwner(slug: string): Promise<Athlete | null> {
    const { data, error } = await supabase
      .from('athletes')
      .select('*')
      .eq('slug', slug)
      .maybeSingle();

    if (error) {
      console.error('Error fetching own athlete by slug:', error);
      return null;
    }

    return data;
  }

  static async createAthlete(athleteData: AthleteInput): Promise<Athlete | null> {
    const { data, error } = await supabase
      .from('athletes')
      .insert([athleteData])
      .select()
      .single();

    if (error) {
      console.error('Error creating athlete:', error);
      return null;
    }

    return data;
  }

  static async updateAthlete(id: string, updates: Partial<AthleteInput>): Promise<Athlete | null> {
    const { data, error } = await supabase
      .from('athletes')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating athlete:', error);
      return null;
    }

    return data;
  }

  static async getFemaleAthletes(limit = 3): Promise<Athlete[]> {
    const { data, error } = await supabase
      .from('athletes')
      .select('*')
      .eq('profile_status', 'active')
      .eq('gender', 'female')
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) {
      console.error('Error fetching female athletes:', error);
      return [];
    }

    return data || [];
  }

  static async incrementStats(id: string, field: 'supporters_count' | 'views_count' | 'followers_count'): Promise<void> {
    const { error } = await supabase.rpc('increment_athlete_stat', {
      athlete_id: id,
      field: field
    });

    if (error) {
      console.error(`Error incrementing ${field}:`, error);
    }
  }
}

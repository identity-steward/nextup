import { supabase } from '../lib/supabase';

export type AthleteSignupStatus = 'pending' | 'reviewed' | 'approved' | 'rejected';

export interface AthleteSignupRecord {
  id: string;
  parent_first_name: string;
  parent_last_name: string;
  parent_email: string;
  parent_phone: string;
  athlete_first_name: string;
  athlete_last_name: string;
  athlete_grade: string;
  athlete_sport: string;
  athlete_school: string | null;
  athlete_team: string | null;
  status: AthleteSignupStatus;
  notes: string | null;
  created_at: string;
  updated_at: string;
  athlete_id: string | null;
  match_source: string | null;
}

export class AthleteSignupService {
  static async getAll(): Promise<AthleteSignupRecord[]> {
    const { data, error } = await supabase
      .from('athlete_signups')
      .select('*')
      .order('created_at', { ascending: false });
    if (error) {
      console.error('Error fetching athlete signups:', error);
      return [];
    }
    return (data || []) as AthleteSignupRecord[];
  }

  static async updateStatus(id: string, status: AthleteSignupStatus): Promise<boolean> {
    const { error } = await supabase
      .from('athlete_signups')
      .update({ status, updated_at: new Date().toISOString() })
      .eq('id', id);
    if (error) {
      console.error('Error updating athlete signup status:', error);
      return false;
    }
    return true;
  }

  static async updateNotes(id: string, notes: string): Promise<boolean> {
    const { error } = await supabase
      .from('athlete_signups')
      .update({ notes, updated_at: new Date().toISOString() })
      .eq('id', id);
    if (error) {
      console.error('Error updating athlete signup notes:', error);
      return false;
    }
    return true;
  }
}

export const SIGNUP_STATUSES: AthleteSignupStatus[] = [
  'pending',
  'reviewed',
  'approved',
  'rejected',
];

export const SIGNUP_STATUS_LABELS: Record<AthleteSignupStatus, string> = {
  pending: 'Pending',
  reviewed: 'Reviewed',
  approved: 'Approved',
  rejected: 'Rejected',
};

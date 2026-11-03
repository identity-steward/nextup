import { supabase } from '../lib/supabase';

export type ParentIntakeStatus =
  | 'pending'
  | 'contacted'
  | 'needs_verification'
  | 'reviewed'
  | 'approved'
  | 'rejected';

export interface ParentIntakeRecord {
  id: string;
  parent_first_name: string;
  parent_last_name: string;
  parent_email: string;
  parent_phone: string;
  athlete_first_name: string;
  athlete_last_name: string;
  athlete_age: number | null;
  athlete_sport: string;
  athlete_school: string | null;
  athlete_team: string | null;
  athlete_bio: string;
  athlete_achievements: string | null;
  city: string | null;
  support_needed: string | null;
  consent_given: boolean | null;
  status: ParentIntakeStatus;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export class ParentIntakeService {
  static async getAll(): Promise<ParentIntakeRecord[]> {
    const { data, error } = await supabase
      .from('parent_intake')
      .select('*')
      .order('created_at', { ascending: false });
    if (error) {
      console.error('Error fetching parent intake records:', error);
      return [];
    }
    return (data || []) as ParentIntakeRecord[];
  }

  static async updateStatus(
    id: string,
    status: ParentIntakeStatus
  ): Promise<boolean> {
    const { error } = await supabase
      .from('parent_intake')
      .update({ status, updated_at: new Date().toISOString() })
      .eq('id', id);
    if (error) {
      console.error('Error updating parent intake status:', error);
      return false;
    }
    return true;
  }

  static async updateNotes(
    id: string,
    notes: string
  ): Promise<boolean> {
    const { error } = await supabase
      .from('parent_intake')
      .update({ notes, updated_at: new Date().toISOString() })
      .eq('id', id);
    if (error) {
      console.error('Error updating parent intake notes:', error);
      return false;
    }
    return true;
  }
}

export const REVIEWABLE_STATUSES: ParentIntakeStatus[] = [
  'pending',
  'contacted',
  'needs_verification',
  'reviewed',
];

export const STATUS_LABELS: Record<ParentIntakeStatus, string> = {
  pending: 'Pending',
  contacted: 'Contacted',
  needs_verification: 'Needs Verification',
  reviewed: 'Reviewed',
  approved: 'Approved',
  rejected: 'Rejected',
};

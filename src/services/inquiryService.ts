import { supabase } from '../lib/supabase';

export type InquiryStatus = 'pending' | 'reviewed' | 'responded' | 'archived';

export type InquiryType = 'general' | 'partnership' | 'athlete' | 'media' | 'sponsorship';

export interface ContactInquiry {
  id: string;
  name: string;
  email: string;
  organization: string | null;
  inquiry_type: InquiryType;
  message: string;
  status: InquiryStatus;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export class InquiryService {
  static async submit(params: {
    name: string;
    email: string;
    organization?: string | null;
    inquiryType: InquiryType;
    message: string;
  }): Promise<{ success: boolean; error?: string }> {
    const { error } = await supabase.rpc('submit_contact_inquiry', {
      p_name: params.name,
      p_email: params.email,
      p_organization: params.organization ?? null,
      p_inquiry_type: params.inquiryType,
      p_message: params.message,
    });

    if (error) {
      return { success: false, error: error.message };
    }
    return { success: true };
  }

  static async getAll(): Promise<ContactInquiry[]> {
    const { data, error } = await supabase
      .from('contact_inquiries')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching contact inquiries:', error);
      return [];
    }
    return (data || []) as ContactInquiry[];
  }

  static async updateStatus(id: string, status: InquiryStatus): Promise<boolean> {
    const { error } = await supabase
      .from('contact_inquiries')
      .update({ status, updated_at: new Date().toISOString() })
      .eq('id', id);

    if (error) {
      console.error('Error updating inquiry status:', error);
      return false;
    }
    return true;
  }

  static async updateNotes(id: string, notes: string): Promise<boolean> {
    const { error } = await supabase
      .from('contact_inquiries')
      .update({ notes, updated_at: new Date().toISOString() })
      .eq('id', id);

    if (error) {
      console.error('Error updating inquiry notes:', error);
      return false;
    }
    return true;
  }
}

export const INQUIRY_STATUSES: InquiryStatus[] = [
  'pending',
  'reviewed',
  'responded',
  'archived',
];

export const INQUIRY_STATUS_LABELS: Record<InquiryStatus, string> = {
  pending: 'Pending',
  reviewed: 'Reviewed',
  responded: 'Responded',
  archived: 'Archived',
};

export const INQUIRY_TYPE_LABELS: Record<InquiryType, string> = {
  general: 'General Question',
  partnership: 'Partnership',
  athlete: 'Athlete / Family',
  media: 'Media / Press',
  sponsorship: 'Sponsorship',
};

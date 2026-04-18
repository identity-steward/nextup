import { supabase } from '../lib/supabase';
import type { AuditLog, AuditLogInput, NeedsManualReview, NeedsManualReviewInput } from '../types/agent';

export class AuditService {
  static async log(input: AuditLogInput): Promise<AuditLog | null> {
    const { data, error } = await supabase
      .from('audit_logs')
      .insert([input])
      .select()
      .single();

    if (error) {
      console.error('Error writing audit log:', error);
      return null;
    }
    return data;
  }

  static async getByRow(tableName: string, rowId: string): Promise<AuditLog[]> {
    const { data, error } = await supabase
      .from('audit_logs')
      .select('*')
      .eq('table_name', tableName)
      .eq('row_id', rowId)
      .order('performed_at', { ascending: false });

    if (error) {
      console.error('Error fetching audit logs:', error);
      return [];
    }
    return data || [];
  }

  static async flagForReview(input: NeedsManualReviewInput): Promise<NeedsManualReview | null> {
    const existing = await supabase
      .from('needs_manual_review')
      .select('id')
      .eq('related_table', input.related_table)
      .eq('related_id', input.related_id)
      .eq('resolved', false)
      .maybeSingle();

    if (existing.data) {
      return existing.data as NeedsManualReview;
    }

    const { data, error } = await supabase
      .from('needs_manual_review')
      .insert([input])
      .select()
      .single();

    if (error) {
      console.error('Error flagging for review:', error);
      return null;
    }
    return data;
  }

  static async resolveFlag(id: string): Promise<boolean> {
    const { error } = await supabase
      .from('needs_manual_review')
      .update({ resolved: true, resolved_at: new Date().toISOString() })
      .eq('id', id);

    if (error) {
      console.error('Error resolving review flag:', error);
      return false;
    }
    return true;
  }

  static async getPendingFlags(): Promise<NeedsManualReview[]> {
    const { data, error } = await supabase
      .from('needs_manual_review')
      .select('*')
      .eq('resolved', false)
      .order('created_at', { ascending: true });

    if (error) {
      console.error('Error fetching review flags:', error);
      return [];
    }
    return data || [];
  }
}

export type TaskStatus = 'open' | 'in_progress' | 'done' | 'cancelled';
export type TaskPriority = 'low' | 'normal' | 'high' | 'urgent';

export interface Task {
  id: string;
  title: string;
  description?: string;
  status: TaskStatus;
  priority: TaskPriority;
  assigned_to?: string;
  related_table?: string;
  related_id?: string;
  due_date?: string;
  created_by?: string;
  created_at: string;
  updated_at: string;
}

export interface TaskInput {
  title: string;
  description?: string;
  status?: TaskStatus;
  priority?: TaskPriority;
  assigned_to?: string;
  related_table?: string;
  related_id?: string;
  due_date?: string;
}

export interface AuditLog {
  id: string;
  table_name: string;
  row_id: string;
  action: string;
  old_value?: Record<string, unknown>;
  new_value?: Record<string, unknown>;
  performed_by?: string;
  performed_at: string;
}

export interface AuditLogInput {
  table_name: string;
  row_id: string;
  action: string;
  old_value?: Record<string, unknown>;
  new_value?: Record<string, unknown>;
  performed_by?: string;
}

export interface NeedsManualReview {
  id: string;
  related_table: string;
  related_id: string;
  reason: string;
  flagged_by?: string;
  resolved: boolean;
  resolved_by?: string;
  resolved_at?: string;
  created_at: string;
}

export interface NeedsManualReviewInput {
  related_table: string;
  related_id: string;
  reason: string;
  flagged_by?: string;
}

export type AgentSource =
  | 'athlete_signups'
  | 'parent_intake'
  | 'creator_applications'
  | 'supporter_signups'
  | 'team_inquiries'
  | 'athletes'
  | 'creators'
  | 'media_pass_requests'
  | 'testimonials';

export interface AgentResult {
  success: boolean;
  taskId?: string;
  auditLogId?: string;
  flaggedForReview?: boolean;
  message?: string;
}

import { supabase } from '../../lib/supabase';
import { TaskService } from '../../services/taskService';
import { AuditService } from '../../services/auditService';
import type { Task, AuditLog, NeedsManualReview } from '../../types/agent';

export interface AdminFeedSnapshot {
  openTasks: Task[];
  pendingFlags: NeedsManualReview[];
  recentAuditLogs: AuditLog[];
  taskCountByTable: Record<string, number>;
  flagCountByTable: Record<string, number>;
}

export async function loadAdminFeedSnapshot(): Promise<AdminFeedSnapshot> {
  const [openTasks, pendingFlags, auditResult] = await Promise.all([
    TaskService.getOpen(),
    AuditService.getPendingFlags(),
    supabase
      .from('audit_logs')
      .select('*')
      .order('performed_at', { ascending: false })
      .limit(50),
  ]);

  const recentAuditLogs = (auditResult.data || []) as AuditLog[];

  const taskCountByTable: Record<string, number> = {};
  for (const task of openTasks) {
    if (task.related_table) {
      taskCountByTable[task.related_table] = (taskCountByTable[task.related_table] ?? 0) + 1;
    }
  }

  const flagCountByTable: Record<string, number> = {};
  for (const flag of pendingFlags) {
    flagCountByTable[flag.related_table] = (flagCountByTable[flag.related_table] ?? 0) + 1;
  }

  return { openTasks, pendingFlags, recentAuditLogs, taskCountByTable, flagCountByTable };
}

export function subscribeAdminFeed(
  onTaskChange: (tasks: Task[]) => void,
  onFlagChange: (flags: NeedsManualReview[]) => void
) {
  const taskChannel = supabase
    .channel('admin_tasks_feed')
    .on('postgres_changes', { event: '*', schema: 'public', table: 'tasks' }, async () => {
      const tasks = await TaskService.getOpen();
      onTaskChange(tasks);
    })
    .subscribe();

  const flagChannel = supabase
    .channel('admin_flags_feed')
    .on('postgres_changes', { event: '*', schema: 'public', table: 'needs_manual_review' }, async () => {
      const flags = await AuditService.getPendingFlags();
      onFlagChange(flags);
    })
    .subscribe();

  return () => {
    supabase.removeChannel(taskChannel);
    supabase.removeChannel(flagChannel);
  };
}

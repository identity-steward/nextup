import { supabase } from '../lib/supabase';
import type { Task, TaskInput, TaskStatus } from '../types/agent';

export class TaskService {
  static async create(input: TaskInput): Promise<Task | null> {
    const { data, error } = await supabase
      .from('tasks')
      .insert([input])
      .select()
      .single();

    if (error) {
      console.error('Error creating task:', error);
      return null;
    }
    return data;
  }

  static async updateStatus(id: string, status: TaskStatus): Promise<boolean> {
    const { error } = await supabase
      .from('tasks')
      .update({ status })
      .eq('id', id);

    if (error) {
      console.error('Error updating task status:', error);
      return false;
    }
    return true;
  }

  static async getByRelated(table: string, rowId: string): Promise<Task[]> {
    const { data, error } = await supabase
      .from('tasks')
      .select('*')
      .eq('related_table', table)
      .eq('related_id', rowId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching tasks:', error);
      return [];
    }
    return data || [];
  }

  static async getOpen(): Promise<Task[]> {
    const { data, error } = await supabase
      .from('tasks')
      .select('*')
      .in('status', ['open', 'in_progress'])
      .order('priority', { ascending: false })
      .order('created_at', { ascending: true });

    if (error) {
      console.error('Error fetching open tasks:', error);
      return [];
    }
    return data || [];
  }
}

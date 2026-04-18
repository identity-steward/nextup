import { supabase } from '../lib/supabase';
import type { Creator, CreatorInput } from '../types/creator';

export class CreatorService {
  static async getAllCreators(): Promise<Creator[]> {
    const { data, error } = await supabase
      .from('creators')
      .select('*')
      .eq('is_active', true)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching creators:', error);
      return [];
    }

    return data || [];
  }

  static async getFeaturedCreator(): Promise<Creator | null> {
    const { data, error } = await supabase
      .from('creators')
      .select('*')
      .eq('is_featured', true)
      .eq('is_active', true)
      .maybeSingle();

    if (error) {
      console.error('Error fetching featured creator:', error);
      return null;
    }

    return data;
  }

  static async getCreatorBySlug(slug: string): Promise<Creator | null> {
    const { data, error } = await supabase
      .from('creators')
      .select('*')
      .eq('slug', slug)
      .eq('is_active', true)
      .maybeSingle();

    if (error) {
      console.error('Error fetching creator by slug:', error);
      return null;
    }

    return data;
  }

  static async createCreator(creatorData: CreatorInput): Promise<Creator | null> {
    const { data, error } = await supabase
      .from('creators')
      .insert([creatorData])
      .select()
      .single();

    if (error) {
      console.error('Error creating creator:', error);
      return null;
    }

    return data;
  }

  static async updateCreator(id: string, updates: Partial<CreatorInput>): Promise<Creator | null> {
    const { data, error } = await supabase
      .from('creators')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating creator:', error);
      return null;
    }

    return data;
  }
}

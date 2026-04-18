import { supabase } from '../lib/supabase';

export interface SupportAccess {
  id: string;
  status: 'active' | 'inactive' | 'past_due' | 'canceled';
  starts_at: string;
  ends_at: string | null;
  athlete: { slug: string; first_name: string; last_initial: string } | null;
  plan: { name: string; support_type: string } | null;
}

export async function getMySupport(): Promise<SupportAccess[]> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user?.email) return [];

  const { data: supporter } = await supabase
    .from('supporters')
    .select('id')
    .eq('email', user.email)
    .maybeSingle();

  if (!supporter) return [];

  const { data, error } = await supabase
    .from('support_access')
    .select(`
      id,
      status,
      starts_at,
      ends_at,
      athlete:athlete_id ( slug, first_name, last_initial ),
      plan:support_plan_id ( name, support_type )
    `)
    .eq('supporter_id', supporter.id)
    .order('starts_at', { ascending: false });

  if (error) {
    console.error('getMySupport error:', error);
    return [];
  }

  return (data as unknown as SupportAccess[]) || [];
}

export async function hasActiveSupport(athleteSlug?: string): Promise<boolean> {
  const access = await getMySupport();
  if (!access.length) return false;
  return access.some((a) => {
    if (a.status !== 'active') return false;
    if (athleteSlug) return a.athlete?.slug === athleteSlug;
    return true;
  });
}

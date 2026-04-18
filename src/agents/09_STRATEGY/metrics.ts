import { supabase } from '../../lib/supabase';

export interface PlatformScorecard {
  totalAthletes: number;
  activeAthletes: number;
  totalCreators: number;
  totalSupporters: number;
  totalAthleteSignups: number;
  totalParentIntakes: number;
  pendingIntakes: number;
  totalCreatorApplications: number;
  totalTeamInquiries: number;
  totalMediaPasses: number;
  openTasks: number;
  pendingReviewFlags: number;
  approvedTestimonials: number;
  fetchedAt: string;
}

export async function loadPlatformScorecard(): Promise<PlatformScorecard> {
  const [
    { count: totalAthletes },
    { count: activeAthletes },
    { count: totalCreators },
    { count: totalSupporters },
    { count: totalAthleteSignups },
    { count: totalParentIntakes },
    { count: pendingIntakes },
    { count: totalCreatorApplications },
    { count: totalTeamInquiries },
    { count: totalMediaPasses },
    { count: openTasks },
    { count: pendingReviewFlags },
    { count: approvedTestimonials },
  ] = await Promise.all([
    supabase.from('athletes').select('*', { count: 'exact', head: true }),
    supabase.from('athletes').select('*', { count: 'exact', head: true }).eq('is_active', true),
    supabase.from('creators').select('*', { count: 'exact', head: true }).eq('is_active', true),
    supabase.from('supporters').select('*', { count: 'exact', head: true }),
    supabase.from('athlete_signups').select('*', { count: 'exact', head: true }),
    supabase.from('parent_intake').select('*', { count: 'exact', head: true }),
    supabase.from('parent_intake').select('*', { count: 'exact', head: true }).eq('status', 'pending'),
    supabase.from('creator_applications').select('*', { count: 'exact', head: true }),
    supabase.from('team_inquiries').select('*', { count: 'exact', head: true }),
    supabase.from('media_pass_requests').select('*', { count: 'exact', head: true }),
    supabase.from('tasks').select('*', { count: 'exact', head: true }).in('status', ['open', 'in_progress']),
    supabase.from('needs_manual_review').select('*', { count: 'exact', head: true }).eq('resolved', false),
    supabase.from('testimonials').select('*', { count: 'exact', head: true }).eq('is_approved', true),
  ]);

  return {
    totalAthletes: totalAthletes ?? 0,
    activeAthletes: activeAthletes ?? 0,
    totalCreators: totalCreators ?? 0,
    totalSupporters: totalSupporters ?? 0,
    totalAthleteSignups: totalAthleteSignups ?? 0,
    totalParentIntakes: totalParentIntakes ?? 0,
    pendingIntakes: pendingIntakes ?? 0,
    totalCreatorApplications: totalCreatorApplications ?? 0,
    totalTeamInquiries: totalTeamInquiries ?? 0,
    totalMediaPasses: totalMediaPasses ?? 0,
    openTasks: openTasks ?? 0,
    pendingReviewFlags: pendingReviewFlags ?? 0,
    approvedTestimonials: approvedTestimonials ?? 0,
    fetchedAt: new Date().toISOString(),
  };
}

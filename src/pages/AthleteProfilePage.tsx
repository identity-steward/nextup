import { useEffect, useState, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import AthleteProfileTemplate from '../components/AthleteProfileTemplate';
import { supabase } from '../lib/supabase';
import { getSignedUrls, useSignedUrlRenewal } from '../services/mediaUrlService';
import type { Athlete } from '../types/athlete';
import type { AthleteTag } from '../types/traits';

interface ApprovedMedia {
  id: string;
  media_type: string;
  signedUrl: string | null;
  caption: string | null;
  featured: boolean;
}

interface AthleteProfilePageProps {
  fixedSlug?: string;
}

export function AthleteProfilePage({ fixedSlug }: AthleteProfilePageProps) {
  const { slug: routeSlug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const slug = fixedSlug ?? routeSlug;
  const [athlete, setAthlete] = useState<Athlete | null>(null);
  const [approvedMedia, setApprovedMedia] = useState<ApprovedMedia[]>([]);
  const [athleteTags, setAthleteTags] = useState<AthleteTag[]>([]);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;

    if (!slug) {
      setNotFound(true);
      setLoading(false);
      return;
    }

    (async () => {
      const { data, error: athleteError } = await supabase
        .from('athletes')
        .select('*')
        .eq('slug', slug)
        .eq('profile_status', 'active')
        .maybeSingle();

      if (!active) return;
      if (athleteError) {
        setError('This athlete profile is temporarily unavailable. Please try again shortly.');
        setLoading(false);
        return;
      }
      if (!data) {
        setNotFound(true);
        setLoading(false);
        return;
      }

      const currentAthlete = data as Athlete;
      const [mediaResult, tagsResult] = await Promise.all([
        supabase
          .from('media_uploads')
          .select('id, media_type, caption, featured')
          .eq('athlete_id', currentAthlete.id)
          .eq('status', 'approved')
          .neq('consent_status', 'revoked')
          .in('usage_scope', ['platform', 'public'])
          .order('featured', { ascending: false }),
        supabase
          .from('athlete_tags')
          .select('visibility_tags(id, slug, label, category, sort_order)')
          .eq('athlete_id', currentAthlete.id),
      ]);

      if (!active) return;
      setAthlete(currentAthlete);

      // Resolve signed URLs for approved media
      const mediaRows = (mediaResult.data ?? []) as Array<{ id: string; media_type: string; caption: string | null; featured: boolean }>;
      const mediaIds = mediaRows.map(m => m.id);
      const signedUrls = await getSignedUrls(mediaIds);
      const mediaWithUrls: ApprovedMedia[] = mediaRows.map(m => ({
        id: m.id,
        media_type: m.media_type,
        signedUrl: signedUrls[m.id] ?? null,
        caption: m.caption,
        featured: m.featured,
      }));
      setApprovedMedia(mediaWithUrls);
      setAthleteTags((tagsResult.data ?? []) as unknown as AthleteTag[]);
      if (mediaResult.error || tagsResult.error) {
        setError('Some profile details are temporarily unavailable. The published athlete information is still shown.');
      }
      setLoading(false);
    })();

    return () => {
      active = false;
    };
  }, [slug]);

  const mediaIds = approvedMedia.map(m => m.id);
  const renewUrls = useCallback((urls: Record<string, string | null>) => {
    setApprovedMedia(prev => prev.map(m => ({
      ...m,
      signedUrl: urls[m.id] ?? m.signedUrl,
    })));
  }, []);
  useSignedUrlRenewal(mediaIds, renewUrls);

  if (loading) return <div className="min-h-screen flex items-center justify-center text-gray-500">Loading athlete profile...</div>;
  if (error && !athlete) return <div className="min-h-screen flex items-center justify-center px-6 text-center text-red-800">{error}</div>;
  if (notFound || !athlete) return <div className="min-h-screen flex items-center justify-center px-6 text-center text-gray-500">No published athlete profile was found for this link.</div>;

  return (
    <>
      {error && <div className="bg-amber-50 border-b border-amber-200 text-amber-900 px-6 py-3 text-center text-sm">{error}</div>}
      <AthleteProfileTemplate
        athlete={athlete}
        onBack={() => navigate('/youth')}
        approvedMedia={approvedMedia}
        athleteTags={athleteTags}
        showJourney
        signedUrlRefreshFn={getSignedUrls}
      />
    </>
  );
}

import { useEffect, useState, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { getSignedUrls, useSignedUrlRenewal, resolveAthleteImageWithConsent, MEDIA_PLACEHOLDER } from '../services/mediaUrlService';
import { safeVideoEmbedUrl, safePaymentLink } from '../lib/safeLinks';
import type { Athlete } from '../types/athlete';
import type { AthleteTag } from '../types/traits';

import ProfileHero from '../components/jacob/ProfileHero';
import ProfileAbout from '../components/jacob/ProfileAbout';
import ProfileAttributes from '../components/jacob/ProfileAttributes';
import ProfileTraits from '../components/jacob/ProfileTraits';
import ProfileHighlightVideo from '../components/jacob/ProfileHighlightVideo';
import ProfileHighlightGrid from '../components/jacob/ProfileHighlightGrid';
import ProfileUpdates from '../components/jacob/ProfileUpdates';
import ProfileSupport from '../components/jacob/ProfileSupport';
import ProfileMidCTA from '../components/jacob/ProfileMidCTA';
import ProfileTrustStrip from '../components/jacob/ProfileTrustStrip';
import ProfileShare from '../components/jacob/ProfileShare';
import ProfileDisclaimerStrip from '../components/jacob/ProfileDisclaimerStrip';
import ProfileFooterCTA from '../components/jacob/ProfileFooterCTA';
import ProfileUpdateModal from '../components/jacob/ProfileUpdateModal';

interface ApprovedMedia {
  id: string;
  media_type: string;
  signedUrl: string | null;
  caption: string | null;
  featured: boolean;
}

export function JacobPremiumProfile() {
  const navigate = useNavigate();

  const [athlete, setAthlete] = useState<Athlete | null>(null);
  const [approvedMedia, setApprovedMedia] = useState<ApprovedMedia[]>([]);
  const [athleteTags, setAthleteTags] = useState<AthleteTag[]>([]);
  const [heroImageUrl, setHeroImageUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showUpdateModal, setShowUpdateModal] = useState(false);

  const supportRef = useRef<HTMLDivElement>(null);
  const highlightsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let active = true;

    (async () => {
      const { data, error: athleteError } = await supabase
        .from('athletes')
        .select('*')
        .eq('slug', 'jacob-f')
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
      const [mediaResult, tagsResult, heroImg] = await Promise.all([
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
        resolveAthleteImageWithConsent(currentAthlete.image_url, currentAthlete.id),
      ]);

      if (!active) return;
      setAthlete(currentAthlete);
      setHeroImageUrl(heroImg ?? MEDIA_PLACEHOLDER);
      setAthleteTags((tagsResult.data ?? []) as unknown as AthleteTag[]);

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

      if (mediaResult.error || tagsResult.error) {
        setError('Some profile details are temporarily unavailable. The published athlete information is still shown.');
      }
      setLoading(false);
    })();

    return () => { active = false; };
  }, []);

  const mediaIds = approvedMedia.map(m => m.id);
  const renewUrls = useCallback((urls: Record<string, string | null>) => {
    setApprovedMedia(prev => prev.map(m => ({
      ...m,
      signedUrl: urls[m.id] ?? m.signedUrl,
    })));
  }, []);
  useSignedUrlRenewal(mediaIds, renewUrls);

  const scrollToSupport = useCallback(() => {
    supportRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }, []);

  const scrollToHighlights = useCallback(() => {
    highlightsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }, []);

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center text-gray-400" style={{ background: '#181c24' }}>Loading athlete profile...</div>;
  }
  if (notFound || !athlete) {
    return <div className="min-h-screen flex items-center justify-center px-6 text-center text-gray-400" style={{ background: '#181c24' }}>No published athlete profile was found for this link.</div>;
  }

  const raised = athlete.season_amount_raised ?? 0;
  const goal = athlete.season_goal_amount ?? 0;
  const progressPct = goal > 0 ? Math.min(100, Math.round((raised / goal) * 100)) : 0;
  const stillNeeded = Math.max(0, goal - raised);
  const supporters = athlete.supporters_count ?? 0;

  const videoEmbedUrl = safeVideoEmbedUrl(athlete.highlight_video_embed_url);
  const paymentLink = safePaymentLink(athlete.stripe_payment_link);

  const hasTags = athleteTags.length > 0;
  const hasMedia = approvedMedia.length > 0;
  const hasVideo = Boolean(videoEmbedUrl);

  return (
    <div className="min-h-screen" style={{ background: '#181c24' }}>
      {error && (
        <div className="bg-amber-500/10 border-b border-amber-500/20 text-amber-300 px-6 py-3 text-center text-sm">
          {error}
        </div>
      )}

      <ProfileHero
        raised={raised}
        goal={goal}
        supporters={supporters}
        progressPct={progressPct}
        stillNeeded={stillNeeded}
        onSupportClick={scrollToSupport}
        onHighlightsClick={scrollToHighlights}
        athlete={athlete}
        heroImageUrl={heroImageUrl}
      />

      <ProfileAbout athlete={athlete} />

      <ProfileAttributes athlete={athlete} />

      {hasTags && <ProfileTraits athleteId={athlete.id} />}

      <div ref={highlightsRef}>
        {hasVideo ? (
          <ProfileHighlightVideo embedUrl={videoEmbedUrl} athlete={athlete} />
        ) : (
          <ProfileHighlightGrid media={approvedMedia} athlete={athlete} />
        )}
      </div>

      <ProfileUpdates athleteId={athlete.id} athleteName={`${athlete.first_name} ${athlete.last_initial}`} />

      <div ref={supportRef}>
        <ProfileSupport
          raised={raised}
          goal={goal}
          supporters={supporters}
          progressPct={progressPct}
          stillNeeded={stillNeeded}
          paymentLink={paymentLink}
          athlete={athlete}
        />
      </div>

      <ProfileMidCTA
        raised={raised}
        goal={goal}
        progressPct={progressPct}
        onSupportClick={scrollToSupport}
        athlete={athlete}
      />

      <ProfileTrustStrip athlete={athlete} />

      <ProfileShare athleteName={`${athlete.first_name} ${athlete.last_initial}`} />

      <ProfileDisclaimerStrip onRequestUpdate={() => setShowUpdateModal(true)} />

      <ProfileFooterCTA onSupportClick={scrollToSupport} athlete={athlete} />

      {showUpdateModal && (
        <ProfileUpdateModal
          athleteSlug={athlete.slug}
          athleteName={`${athlete.first_name} ${athlete.last_initial}`}
          onClose={() => setShowUpdateModal(false)}
        />
      )}
    </div>
  );
}

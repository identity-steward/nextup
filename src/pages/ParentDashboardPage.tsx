import { useState, useEffect, useRef } from 'react';
import { Users, Clock, CheckCircle, XCircle, AlertCircle, ChevronRight, Upload, Camera, Video, LogOut, ExternalLink, ShieldCheck, ShieldAlert, X, Sparkles, Star, Link2, Instagram, Twitter, File as FileEdit } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';

interface Athlete {
  id: string;
  slug: string;
  first_name: string;
  last_initial: string;
  sport: string;
  grade: string;
  class_year: string | null;
  school: string | null;
  team_name: string | null;
  position: string | null;
  bio: string | null;
  city: string | null;
  height: string | null;
  jersey_number: string | null;
  instagram_handle: string | null;
  twitter_handle: string | null;
  highlight_video_url: string | null;
  image_url: string | null;
  profile_status: 'pending' | 'active' | 'approved' | 'verified_event' | 'hidden' | 'rejected';
  profile_tier: string;
}

interface ConsentRecord {
  id: string;
  consent_status: string;
  can_use_name_image_likeness: boolean;
  can_use_voice: boolean;
  can_use_on_social: boolean;
  can_use_for_sponsor_package: boolean;
}

interface UpdateRequest {
  id: string;
  status: string;
  created_at: string;
  admin_notes: string | null;
  field_correction_notes: string | null;
}

interface MediaUpload {
  id: string;
  media_type: string;
  file_name: string;
  caption: string | null;
  status: string;
  created_at: string;
}

type Tab = 'overview' | 'media' | 'updates' | 'support';

const BUCKETS: Record<string, string> = {
  photo: 'athlete-photos',
  video: 'athlete-videos',
  highlight: 'athlete-videos',
};

const LIVE_STATUSES = new Set(['active', 'approved', 'verified_event']);

function Toggle({ checked, onChange }: { checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      type="button"
      onClick={() => onChange(!checked)}
      className={`relative inline-flex h-6 w-11 shrink-0 rounded-full border-2 transition-colors duration-200 focus:outline-none ${
        checked ? 'bg-navy border-navy' : 'bg-gray-200 border-gray-200'
      }`}
      role="switch"
      aria-checked={checked}
    >
      <span
        className={`pointer-events-none inline-block h-4 w-4 rounded-full bg-white shadow transition-transform duration-200 mt-0.5 ${
          checked ? 'translate-x-5' : 'translate-x-0.5'
        }`}
      />
    </button>
  );
}

export default function ParentDashboardPage() {
  const navigate = useNavigate();
  const { user, profile, signOut } = useAuth();
  const [athlete, setAthlete] = useState<Athlete | null>(null);
  const [consent, setConsent] = useState<ConsentRecord | null>(null);
  const [updates, setUpdates] = useState<UpdateRequest[]>([]);
  const [media, setMedia] = useState<MediaUpload[]>([]);
  const [tab, setTab] = useState<Tab>('overview');
  const [loading, setLoading] = useState(true);
  const [noProfile, setNoProfile] = useState(false);

  // Welcome banner
  const [bannerDismissed, setBannerDismissed] = useState(false);

  // Consent editor
  const [consentEditing, setConsentEditing] = useState(false);
  const [consentSaving, setConsentSaving] = useState(false);
  const [consentSaveError, setConsentSaveError] = useState('');
  const [consentPrefs, setConsentPrefs] = useState({
    can_use_name_image_likeness: false,
    can_use_voice: false,
    can_use_on_social: false,
    can_use_for_sponsor_package: false,
  });

  const consentCardRef = useRef<HTMLDivElement>(null);

  // Profile update form
  const [editForm, setEditForm] = useState({
    grade: '',
    class_year: '',
    bio: '',
    school: '',
    team_name: '',
    position: '',
    city: '',
    height: '',
    jersey_number: '',
    instagram_handle: '',
    twitter_handle: '',
    highlight_video_url: '',
    notes: '',
  });
  const [editExpanded, setEditExpanded] = useState(false);
  const [editSubmitting, setEditSubmitting] = useState(false);
  const [editSuccess, setEditSuccess] = useState(false);
  const [editError, setEditError] = useState('');

  // Media upload
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [uploadType, setUploadType] = useState<'photo' | 'video' | 'highlight'>('photo');
  const [uploadCaption, setUploadCaption] = useState('');
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState('');
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!user) return;
    loadData();
  }, [user, profile]);

  const loadData = async () => {
    setLoading(true);

    let athleteData: Athlete | null = null;

    if (profile?.athlete_id) {
      const { data } = await supabase
        .from('athletes')
        .select('id, slug, first_name, last_initial, sport, grade, class_year, school, team_name, position, bio, city, height, jersey_number, instagram_handle, twitter_handle, highlight_video_url, image_url, profile_status, profile_tier')
        .eq('id', profile.athlete_id)
        .maybeSingle();
      athleteData = data as Athlete | null;
    } else {
      const { data } = await supabase
        .from('athletes')
        .select('id, slug, first_name, last_initial, sport, grade, class_year, school, team_name, position, bio, city, height, jersey_number, instagram_handle, twitter_handle, highlight_video_url, image_url, profile_status, profile_tier')
        .eq('managed_by_parent_id', user!.id)
        .maybeSingle();
      athleteData = data as Athlete | null;
    }

    if (!athleteData) {
      setNoProfile(true);
      setLoading(false);
      return;
    }

    setAthlete(athleteData);
    setEditForm({
      grade: athleteData.grade || '',
      class_year: athleteData.class_year || '',
      bio: athleteData.bio || '',
      school: athleteData.school || '',
      team_name: athleteData.team_name || '',
      position: athleteData.position || '',
      city: athleteData.city || '',
      height: athleteData.height || '',
      jersey_number: athleteData.jersey_number || '',
      instagram_handle: athleteData.instagram_handle || '',
      twitter_handle: athleteData.twitter_handle || '',
      highlight_video_url: athleteData.highlight_video_url || '',
      notes: '',
    });

    const [consentRes, updatesRes, mediaRes] = await Promise.all([
      supabase
        .from('consents')
        .select('id, consent_status, can_use_name_image_likeness, can_use_voice, can_use_on_social, can_use_for_sponsor_package')
        .eq('athlete_id', athleteData.id)
        .maybeSingle(),
      supabase
        .from('profile_update_requests')
        .select('id, status, created_at, admin_notes, field_correction_notes')
        .eq('athlete_slug', athleteData.slug)
        .order('created_at', { ascending: false })
        .limit(20),
      supabase
        .from('media_uploads')
        .select('id, media_type, file_name, caption, status, created_at')
        .eq('athlete_id', athleteData.id)
        .order('created_at', { ascending: false }),
    ]);

    const c = consentRes.data as ConsentRecord | null;
    setConsent(c);
    if (c) {
      setConsentPrefs({
        can_use_name_image_likeness: c.can_use_name_image_likeness,
        can_use_voice: c.can_use_voice,
        can_use_on_social: c.can_use_on_social,
        can_use_for_sponsor_package: c.can_use_for_sponsor_package,
      });
    }
    setUpdates((updatesRes.data || []) as UpdateRequest[]);
    setMedia((mediaRes.data || []) as MediaUpload[]);
    setLoading(false);
  };

  const handleSaveConsent = async () => {
    if (!athlete || !user) return;
    setConsentSaving(true);
    setConsentSaveError('');

    const payload = {
      ...consentPrefs,
      consent_status: 'granted',
      can_use_for_promo: consentPrefs.can_use_on_social,
      usage_scope: ['profile', 'platform'],
    };

    let error;
    if (consent?.id) {
      ({ error } = await supabase
        .from('consents')
        .update(payload)
        .eq('id', consent.id));
    } else {
      ({ error } = await supabase
        .from('consents')
        .insert([{
          athlete_id: athlete.id,
          user_id: user.id,
          consent_given_by: user.email ?? '',
          relationship_to_athlete: 'parent',
          ...payload,
        }]));
    }

    if (error) {
      setConsentSaveError('Could not save preferences. Please try again.');
    } else {
      setConsentEditing(false);
      await loadData();
    }
    setConsentSaving(false);
  };

  const handleUpdateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!athlete || !user) return;
    setEditSubmitting(true);
    setEditError('');
    setEditSuccess(false);

    const nullIfEmpty = (v: string) => v.trim() || null;

    const { error } = await supabase.from('profile_update_requests').insert([{
      athlete_slug: athlete.slug,
      submitted_by_name: profile?.display_name || user.email || '',
      submitted_by_role: 'parent',
      submitted_by_email: user.email || '',
      submitted_by_user_id: user.id,
      field_grade: nullIfEmpty(editForm.grade),
      field_class_year: nullIfEmpty(editForm.class_year),
      field_bio: nullIfEmpty(editForm.bio),
      field_school: nullIfEmpty(editForm.school),
      field_team: nullIfEmpty(editForm.team_name),
      field_position: nullIfEmpty(editForm.position),
      field_city_state: nullIfEmpty(editForm.city),
      field_height: nullIfEmpty(editForm.height),
      field_jersey_number: nullIfEmpty(editForm.jersey_number),
      field_social_instagram: nullIfEmpty(editForm.instagram_handle),
      field_social_twitter: nullIfEmpty(editForm.twitter_handle),
      highlight_video_url: nullIfEmpty(editForm.highlight_video_url),
      field_correction_notes: nullIfEmpty(editForm.notes),
      status: 'pending',
    }]);

    if (error) {
      setEditError('Submission failed. Please try again.');
    } else {
      setEditSuccess(true);
      setEditExpanded(false);
      setEditForm(prev => ({ ...prev, notes: '' }));
      await loadData();
    }
    setEditSubmitting(false);
  };

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!uploadFile || !athlete) return;
    setUploading(true);
    setUploadError('');
    setUploadSuccess(false);

    const bucket = BUCKETS[uploadType];
    const path = `${athlete.id}/${Date.now()}-${uploadFile.name.replace(/[^a-z0-9.\-_]/gi, '_')}`;

    const { error: storageError } = await supabase.storage
      .from(bucket)
      .upload(path, uploadFile, { upsert: false });

    if (storageError) {
      setUploadError(`Upload failed: ${storageError.message}`);
      setUploading(false);
      return;
    }

    const { data: urlData } = supabase.storage.from(bucket).getPublicUrl(path);

    const { data: insertedMedia, error: dbError } = await supabase
      .from('media_uploads')
      .insert([{
        athlete_id: athlete.id,
        uploader_id: user!.id,
        media_type: uploadType,
        bucket,
        storage_path: path,
        public_url: urlData.publicUrl,
        file_name: uploadFile.name,
        file_size_bytes: uploadFile.size,
        caption: uploadCaption || null,
        status: 'pending',
        source_type: 'parent_upload',
        consent_status: 'implied',
        usage_scope: 'platform',
      }])
      .select('id')
      .single();

    if (!dbError && insertedMedia?.id) {
      await supabase.rpc('create_sab_id', {
        p_athlete_id: athlete.id,
        p_user_id: user!.id,
        p_media_upload_id: insertedMedia.id,
        p_source_type: 'parent_upload',
        p_consent_status: 'pending',
        p_usage_scope: ['profile'],
      });
    }

    if (dbError) {
      setUploadError('File uploaded but failed to save record. Contact support.');
    } else {
      setUploadSuccess(true);
      setUploadFile(null);
      setUploadCaption('');
      if (fileRef.current) fileRef.current.value = '';
      await loadData();
    }
    setUploading(false);
  };

  const statusBadge = (status: string) => {
    const map: Record<string, { cls: string; icon: React.ReactNode; label: string }> = {
      pending: { cls: 'bg-amber-50 text-amber-700 border-amber-200', icon: <Clock className="w-3 h-3" />, label: 'Pending Review' },
      approved: { cls: 'bg-green-50 text-green-700 border-green-200', icon: <CheckCircle className="w-3 h-3" />, label: 'Approved' },
      rejected: { cls: 'bg-red-50 text-red-700 border-red-200', icon: <XCircle className="w-3 h-3" />, label: 'Rejected' },
    };
    const s = map[status] || map.pending;
    return (
      <span className={`inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full border ${s.cls}`}>
        {s.icon} {s.label}
      </span>
    );
  };

  const inputCls = 'w-full px-4 py-3 rounded-lg border-2 border-gray-200 focus:border-gold focus:outline-none transition-colors text-navy text-sm';
  const labelCls = 'block text-sm font-semibold text-navy mb-1.5';

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 pt-20">
        <div className="w-8 h-8 border-4 border-gold border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (noProfile) {
    navigate('/profile-setup', { replace: true });
    return null;
  }

  const a = athlete!;

  // Derived state for onboarding
  const consentGranted = consent?.consent_status === 'granted';
  const profileLive = LIVE_STATUSES.has(a.profile_status);
  const visibilityBoosted = a.profile_tier !== 'basic';

  const showWelcomeBanner =
    !bannerDismissed &&
    !localStorage.getItem(`banner_dismissed_${a.id}`) &&
    (a.profile_status === 'pending' || !consentGranted);

  const dismissBanner = () => {
    localStorage.setItem(`banner_dismissed_${a.id}`, '1');
    setBannerDismissed(true);
  };

  const scrollToConsent = () => {
    consentCardRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    if (!consentGranted) setConsentEditing(true);
  };

  const tabs: { id: Tab; label: string; icon: React.ReactNode }[] = [
    { id: 'overview', label: 'Overview', icon: <Users className="w-4 h-4" /> },
    { id: 'media', label: 'Media', icon: <Camera className="w-4 h-4" /> },
    { id: 'updates', label: 'Updates', icon: <FileEdit className="w-4 h-4" /> },
    { id: 'support', label: 'Support', icon: <ChevronRight className="w-4 h-4" /> },
  ];

  const pendingCount = updates.filter(u => u.status === 'pending').length;
  const mediaCount = media.length;
  const consentNeedsAttention = !consentGranted;

  const profileStatusMeta: Record<string, { label: string; cls: string; pulse: string }> = {
    pending:        { label: 'Pending Approval',        cls: 'text-amber-400', pulse: 'bg-amber-400' },
    active:         { label: 'Profile Live',            cls: 'text-green-400', pulse: 'bg-green-400' },
    approved:       { label: 'Profile Approved — Live', cls: 'text-green-400', pulse: 'bg-green-400' },
    verified_event: { label: 'Verified Event Profile',  cls: 'text-green-400', pulse: 'bg-green-400' },
    hidden:         { label: 'Profile Hidden',          cls: 'text-red-400',   pulse: 'bg-red-400' },
    rejected:       { label: 'Profile Not Approved',    cls: 'text-red-400',   pulse: 'bg-red-400' },
  };
  const statusMeta = profileStatusMeta[a.profile_status] || profileStatusMeta.pending;

  // Checklist steps
  const checklist = [
    {
      label: 'Profile Submitted',
      done: true,
      description: `${a.first_name}'s profile is in the system.`,
      action: null,
    },
    {
      label: 'Participation Consent Granted',
      done: consentGranted,
      description: consentGranted
        ? 'You have approved participation preferences.'
        : 'Review and approve how NextUp uses your athlete\'s profile.',
      action: scrollToConsent,
    },
    {
      label: 'Profile Approved',
      done: profileLive,
      description: profileLive
        ? `${a.first_name}'s profile is live on NextUp.`
        : 'Our team reviews profiles within 48 hours.',
      action: null,
    },
    {
      label: 'Visibility Boost Active',
      done: visibilityBoosted,
      description: visibilityBoosted
        ? 'Premium visibility is active.'
        : `Give ${a.first_name} priority placement and a verified badge.`,
      action: visibilityBoosted ? null : () => setTab('support'),
    },
  ];

  const completedSteps = checklist.filter(s => s.done).length;

  return (
    <div className="min-h-screen bg-gray-50 pt-20">
      {/* Top bar */}
      <div className="bg-navy text-white">
        <div className="max-w-6xl mx-auto px-6 lg:px-8 py-5 flex items-center justify-between">
          <div>
            <p className="text-gold text-xs font-bold uppercase tracking-widest mb-0.5">Parent Portal</p>
            <h1 className="text-xl font-bold">
              {a.first_name} {a.last_initial}.
              <span className="ml-2 text-base font-normal text-gray-400">{a.sport}</span>
            </h1>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate(`/athletes/${a.slug}`)}
              className="hidden sm:inline-flex items-center gap-1.5 text-xs text-gray-300 hover:text-white border border-white/20 hover:border-white/40 px-3 py-2 rounded-lg transition-colors"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              View Public Profile
            </button>
            <button
              onClick={async () => { await signOut(); navigate('/'); }}
              className="inline-flex items-center gap-1.5 text-xs text-gray-400 hover:text-white px-3 py-2 rounded-lg transition-colors"
            >
              <LogOut className="w-3.5 h-3.5" />
              Sign Out
            </button>
          </div>
        </div>

        {/* Status strip */}
        <div className="border-t border-white/10 px-6 lg:px-8 py-2 max-w-6xl mx-auto">
          <span className={`text-xs font-semibold inline-flex items-center gap-1.5 ${statusMeta.cls}`}>
            <span className={`w-1.5 h-1.5 rounded-full ${statusMeta.pulse} ${a.profile_status === 'pending' || a.profile_status === 'active' ? 'animate-pulse' : ''}`} />
            {statusMeta.label}
          </span>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 lg:px-8 py-8">

        {/* ── Welcome Banner ── */}
        {showWelcomeBanner && (
          <div className="relative bg-gradient-to-r from-navy to-[#1a3a5c] text-white rounded-2xl p-6 mb-8 overflow-hidden shadow-lg">
            <div className="absolute inset-0 opacity-5" style={{ backgroundImage: 'radial-gradient(circle at 80% 50%, white 1px, transparent 1px)', backgroundSize: '24px 24px' }} />
            <button
              onClick={dismissBanner}
              className="absolute top-4 right-4 text-white/50 hover:text-white transition-colors"
              aria-label="Dismiss"
            >
              <X className="w-4 h-4" />
            </button>
            <div className="relative">
              <div className="flex items-center gap-2 mb-2">
                <Sparkles className="w-4 h-4 text-gold" />
                <span className="text-gold text-xs font-bold uppercase tracking-widest">Getting Started</span>
              </div>
              <h2 className="text-xl font-black mb-1">Welcome to {a.first_name}'s Parent Portal</h2>
              <p className="text-gray-300 text-sm leading-relaxed max-w-lg">
                You're a few steps away from getting {a.first_name} full visibility on the NextUp Network.
                Complete the steps below to unlock everything.
              </p>
              <div className="mt-4 flex items-center gap-3">
                <div className="flex-1 max-w-xs bg-white/10 rounded-full h-1.5">
                  <div
                    className="bg-gold h-1.5 rounded-full transition-all duration-500"
                    style={{ width: `${(completedSteps / checklist.length) * 100}%` }}
                  />
                </div>
                <span className="text-xs text-gray-400 font-semibold">{completedSteps} of {checklist.length} complete</span>
              </div>
            </div>
          </div>
        )}

        {/* Tab nav */}
        <div className="flex gap-1 bg-white border border-gray-200 rounded-2xl p-1.5 mb-8 overflow-x-auto">
          {tabs.map(t => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold whitespace-nowrap transition-all duration-200 ${
                tab === t.id
                  ? 'bg-navy text-white shadow-sm'
                  : 'text-gray-500 hover:text-navy hover:bg-gray-50'
              }`}
            >
              {t.icon}
              {t.label}
              {t.id === 'updates' && pendingCount > 0 && (
                <span className="bg-amber-500 text-white text-[10px] font-black px-1.5 py-0.5 rounded-full">{pendingCount}</span>
              )}
              {t.id === 'media' && mediaCount > 0 && (
                <span className="bg-navy/20 text-navy text-[10px] font-black px-1.5 py-0.5 rounded-full">{mediaCount}</span>
              )}
              {t.id === 'overview' && consentNeedsAttention && (
                <span className="w-2 h-2 bg-amber-400 rounded-full" />
              )}
            </button>
          ))}
        </div>

        {/* ---- OVERVIEW ---- */}
        {tab === 'overview' && (
          <div className="grid md:grid-cols-3 gap-6">
            <div className="md:col-span-1 space-y-4">
              {/* Athlete card */}
              <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
                <div className="w-20 h-20 rounded-2xl bg-navy/10 overflow-hidden mb-3">
                  {a.image_url ? (
                    <img src={a.image_url} alt={a.first_name} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Users className="w-8 h-8 text-navy/40" />
                    </div>
                  )}
                </div>
                <h2 className="text-lg font-bold text-navy">{a.first_name} {a.last_initial}.</h2>
                <p className="text-gold font-semibold text-sm">{a.sport}</p>

                <div className="mt-4 space-y-2 text-sm">
                  {a.grade && <div className="flex justify-between"><span className="text-gray-400">Level</span><span className="text-navy font-medium">{a.grade}</span></div>}
                  {a.school && <div className="flex justify-between"><span className="text-gray-400">School</span><span className="text-navy font-medium">{a.school}</span></div>}
                  {a.team_name && <div className="flex justify-between"><span className="text-gray-400">Team</span><span className="text-navy font-medium">{a.team_name}</span></div>}
                  {a.city && <div className="flex justify-between"><span className="text-gray-400">City</span><span className="text-navy font-medium">{a.city}</span></div>}
                </div>
              </div>

              {/* ── Interactive Consent Card ── */}
              <div
                ref={consentCardRef}
                className={`bg-white rounded-2xl border-2 p-6 shadow-sm transition-colors duration-200 ${
                  consentGranted ? 'border-gray-200' : 'border-amber-300'
                }`}
              >
                <h3 className="font-bold text-navy mb-3 text-sm flex items-center gap-2">
                  {consentGranted
                    ? <ShieldCheck className="w-4 h-4 text-green-500" />
                    : <ShieldAlert className="w-4 h-4 text-amber-500" />
                  }
                  Participation Preferences
                </h3>

                {/* Read-only granted state */}
                {consentGranted && !consentEditing && (
                  <>
                    <div className="space-y-2 text-sm">
                      {[
                        { label: 'Public profile (name & photo)', value: consent!.can_use_name_image_likeness },
                        { label: 'Highlight clips on platform',   value: consent!.can_use_voice },
                        { label: 'Featured on social media',      value: consent!.can_use_on_social },
                        { label: 'Sponsor/brand packages',        value: consent!.can_use_for_sponsor_package },
                      ].map(row => (
                        <div key={row.label} className="flex items-center justify-between">
                          <span className="text-gray-500 text-xs">{row.label}</span>
                          <span className={`text-xs font-semibold ${row.value ? 'text-green-700' : 'text-gray-400'}`}>
                            {row.value ? 'Allowed' : 'Off'}
                          </span>
                        </div>
                      ))}
                    </div>
                    <button
                      onClick={() => setConsentEditing(true)}
                      className="mt-4 text-xs font-semibold text-gold hover:underline"
                    >
                      Update preferences
                    </button>
                  </>
                )}

                {/* Pending / no consent — call to action */}
                {!consentGranted && !consentEditing && (
                  <div>
                    <p className="text-sm text-amber-800 mb-4 leading-relaxed">
                      Tell us how NextUp can use {a.first_name}'s profile to maximize visibility and opportunities.
                    </p>
                    <button
                      onClick={() => setConsentEditing(true)}
                      className="w-full bg-amber-500 hover:bg-amber-600 text-white font-bold py-2.5 px-4 rounded-xl text-sm flex items-center justify-center gap-2 transition-colors"
                    >
                      <ShieldCheck className="w-4 h-4" />
                      Review &amp; Approve Participation
                    </button>
                  </div>
                )}

                {/* Edit mode */}
                {consentEditing && (
                  <div>
                    <p className="text-xs text-gray-500 mb-4 leading-relaxed">
                      NextUp uses your athlete's name, photo, and highlights to build their public profile and connect them with opportunities. You control what we can use.
                    </p>

                    <div className="space-y-4 mb-5">
                      {(
                        [
                          { key: 'can_use_name_image_likeness', label: 'Public profile (name & photo)',     desc: 'Show name and photo on the NextUp platform.' },
                          { key: 'can_use_voice',               label: 'Highlight clips on platform',       desc: 'Display video clips on the profile page.' },
                          { key: 'can_use_on_social',           label: 'Featured on NextUp social media',   desc: 'Share highlights on NextUp\'s social channels.' },
                          { key: 'can_use_for_sponsor_package', label: 'Included in sponsor/brand packages', desc: 'Include athlete in partnership opportunities.' },
                        ] as { key: keyof typeof consentPrefs; label: string; desc: string }[]
                      ).map(row => (
                        <div key={row.key} className="flex items-start gap-3">
                          <Toggle
                            checked={consentPrefs[row.key]}
                            onChange={v => setConsentPrefs(p => ({ ...p, [row.key]: v }))}
                          />
                          <div>
                            <p className="text-sm font-semibold text-navy leading-tight">{row.label}</p>
                            <p className="text-xs text-gray-400 mt-0.5">{row.desc}</p>
                          </div>
                        </div>
                      ))}
                    </div>

                    {consentSaveError && (
                      <p className="text-red-600 text-xs mb-3">{consentSaveError}</p>
                    )}

                    <div className="flex gap-2">
                      <button
                        onClick={handleSaveConsent}
                        disabled={consentSaving}
                        className="flex-1 bg-navy hover:bg-navy/90 disabled:opacity-50 text-white font-bold py-2.5 rounded-xl text-sm transition-colors"
                      >
                        {consentSaving ? 'Saving...' : 'Save Participation Preferences'}
                      </button>
                      <button
                        onClick={() => { setConsentEditing(false); setConsentSaveError(''); }}
                        className="px-3 py-2.5 rounded-xl border border-gray-200 text-gray-500 hover:text-navy text-sm transition-colors"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Right side */}
            <div className="md:col-span-2 space-y-4">

              {/* ── Onboarding Checklist ── */}
              <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-bold text-navy text-sm">Setup Progress</h3>
                  <span className="text-xs text-gray-400 font-semibold">{completedSteps} / {checklist.length}</span>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-1.5 mb-5">
                  <div
                    className="bg-gold h-1.5 rounded-full transition-all duration-500"
                    style={{ width: `${(completedSteps / checklist.length) * 100}%` }}
                  />
                </div>
                <div className="space-y-3">
                  {checklist.map((step, i) => (
                    <div
                      key={i}
                      className={`flex items-start gap-3 p-3 rounded-xl transition-colors ${
                        step.action && !step.done ? 'hover:bg-gray-50 cursor-pointer' : ''
                      }`}
                      onClick={step.action && !step.done ? step.action : undefined}
                    >
                      <div className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 mt-0.5 ${
                        step.done
                          ? 'bg-green-100 text-green-600'
                          : 'bg-gray-100 text-gray-300'
                      }`}>
                        {step.done
                          ? <CheckCircle className="w-4 h-4" />
                          : <span className="w-2 h-2 rounded-full bg-gray-300" />
                        }
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className={`text-sm font-semibold ${step.done ? 'text-navy' : 'text-gray-500'}`}>
                          {step.label}
                        </p>
                        <p className="text-xs text-gray-400 mt-0.5 leading-relaxed">{step.description}</p>
                      </div>
                      {step.action && !step.done && (
                        <ChevronRight className="w-4 h-4 text-gold shrink-0 mt-1" />
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Quick actions */}
              <div className="grid sm:grid-cols-2 gap-3">
                {[
                  { label: 'Submit Profile Update', icon: <FileEdit className="w-4 h-4" />, action: () => { setTab('updates'); setEditExpanded(true); } },
                  { label: 'Upload Photo / Video', icon: <Upload className="w-4 h-4" />, action: () => setTab('media') },
                  { label: 'View Update History', icon: <Clock className="w-4 h-4" />, action: () => setTab('updates') },
                  { label: 'View Public Profile', icon: <ExternalLink className="w-4 h-4" />, action: () => navigate(`/athletes/${a.slug}`) },
                ].map(action => (
                  <button key={action.label} onClick={action.action}
                    className="flex items-center gap-2 bg-white border border-gray-200 hover:border-gold/40 hover:shadow-sm px-4 py-3 rounded-xl text-sm font-semibold text-navy transition-all group">
                    <span className="text-gold">{action.icon}</span>
                    {action.label}
                    <ChevronRight className="w-3.5 h-3.5 ml-auto text-gray-300 group-hover:text-gold transition-colors" />
                  </button>
                ))}
              </div>

              {/* Profile status info */}
              {a.profile_status === 'pending' && (
                <div className="bg-amber-50 border border-amber-200 rounded-xl p-5">
                  <div className="flex items-start gap-3">
                    <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                    <div>
                      <p className="text-amber-900 font-semibold text-sm">Profile Under Review</p>
                      <p className="text-amber-700 text-sm mt-1">
                        {a.first_name}'s profile is being reviewed by the NextUp team. Profiles are typically approved within 48 hours.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {profileLive && (
                <div className="bg-green-50 border border-green-200 rounded-xl p-5">
                  <div className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-green-600 shrink-0 mt-0.5" />
                    <div>
                      <p className="text-green-900 font-semibold text-sm">Profile is Live</p>
                      <p className="text-green-700 text-sm mt-1">
                        {a.first_name}'s profile is published and visible on NextUp.{' '}
                        <button onClick={() => navigate(`/athletes/${a.slug}`)} className="underline font-semibold hover:no-underline">
                          View it here.
                        </button>
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Recent media */}
              {media.length > 0 && (
                <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
                  <h3 className="font-bold text-navy mb-3">Recent Media</h3>
                  <div className="space-y-2">
                    {media.slice(0, 3).map(m => (
                      <div key={m.id} className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
                        <div className="flex items-center gap-2 min-w-0">
                          {m.media_type === 'photo' ? <Camera className="w-4 h-4 text-gray-400 shrink-0" /> : <Video className="w-4 h-4 text-gray-400 shrink-0" />}
                          <span className="text-xs text-gray-600 truncate">{m.file_name}</span>
                        </div>
                        {statusBadge(m.status)}
                      </div>
                    ))}
                  </div>
                  {media.length > 3 && (
                    <button onClick={() => setTab('media')} className="text-gold text-xs font-semibold mt-2 hover:underline">
                      View all {media.length} uploads →
                    </button>
                  )}
                </div>
              )}

              {/* Recent updates */}
              {updates.length > 0 && (
                <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
                  <h3 className="font-bold text-navy mb-3">Recent Updates</h3>
                  <div className="space-y-2">
                    {updates.slice(0, 3).map(u => (
                      <div key={u.id} className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
                        <span className="text-xs text-gray-500">{new Date(u.created_at).toLocaleDateString()}</span>
                        {statusBadge(u.status)}
                      </div>
                    ))}
                  </div>
                  <button onClick={() => setTab('updates')} className="text-gold text-xs font-semibold mt-2 hover:underline">
                    View all updates →
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ---- MEDIA ---- */}
        {tab === 'media' && (
          <div className="max-w-3xl space-y-6">
            <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
              <h3 className="font-bold text-navy mb-1">Upload Media for {a.first_name}</h3>
              <p className="text-gray-500 text-sm mb-5">Photos and videos are reviewed before appearing on the profile.</p>

              {uploadSuccess && (
                <div className="bg-green-50 border border-green-200 rounded-xl p-3 mb-4 flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-600" />
                  <p className="text-green-800 text-sm font-semibold">File uploaded and pending review.</p>
                </div>
              )}
              {uploadError && (
                <div className="bg-red-50 border border-red-200 rounded-xl p-3 mb-4">
                  <p className="text-red-700 text-sm">{uploadError}</p>
                </div>
              )}

              <form onSubmit={handleUpload} className="space-y-4">
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className={labelCls}>Media Type</label>
                    <select value={uploadType} onChange={e => setUploadType(e.target.value as 'photo' | 'video' | 'highlight')} className={inputCls}>
                      <option value="photo">Photo</option>
                      <option value="video">Video</option>
                      <option value="highlight">Highlight Clip</option>
                    </select>
                  </div>
                  <div>
                    <label className={labelCls}>Caption (optional)</label>
                    <input type="text" value={uploadCaption} onChange={e => setUploadCaption(e.target.value)} className={inputCls} placeholder="e.g. Game 3 vs Whitehaven..." />
                  </div>
                </div>
                <div>
                  <label className={labelCls}>File</label>
                  <input
                    ref={fileRef}
                    type="file"
                    accept={uploadType === 'photo' ? 'image/*' : 'video/*'}
                    onChange={e => setUploadFile(e.target.files?.[0] || null)}
                    className="w-full text-sm text-gray-600 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-gold/10 file:text-gold hover:file:bg-gold/20 transition-all"
                  />
                  <p className="text-xs text-gray-400 mt-1">Max 50MB. Photos: JPG/PNG/WEBP. Videos: MP4/MOV.</p>
                </div>
                <button
                  type="submit"
                  disabled={!uploadFile || uploading}
                  className="btn-primary px-8 py-3 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  <Upload className="w-4 h-4" />
                  {uploading ? 'Uploading...' : 'Upload File'}
                </button>
              </form>
            </div>

            {media.length > 0 && (
              <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-100">
                  <h3 className="font-bold text-navy">All Uploads ({media.length})</h3>
                </div>
                <div className="divide-y divide-gray-50">
                  {media.map(m => (
                    <div key={m.id} className="px-6 py-4 flex items-center gap-4">
                      <div className="w-10 h-10 bg-navy/5 rounded-xl flex items-center justify-center shrink-0">
                        {m.media_type === 'photo' ? <Camera className="w-5 h-5 text-navy/50" /> : <Video className="w-5 h-5 text-navy/50" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-navy truncate">{m.file_name}</p>
                        {m.caption && <p className="text-xs text-gray-400 truncate">{m.caption}</p>}
                        <p className="text-xs text-gray-300 mt-0.5">{new Date(m.created_at).toLocaleDateString()}</p>
                      </div>
                      <div className="shrink-0">{statusBadge(m.status)}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* ---- UPDATES ---- */}
        {tab === 'updates' && (
          <div className="max-w-2xl space-y-6">

            {/* Submit form */}
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
              <button
                onClick={() => { setEditExpanded(e => !e); setEditSuccess(false); setEditError(''); }}
                className="w-full flex items-center justify-between px-6 py-4 hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 bg-gold/10 rounded-xl flex items-center justify-center">
                    <FileEdit className="w-4 h-4 text-gold" />
                  </div>
                  <div className="text-left">
                    <p className="font-bold text-navy text-sm">Submit Profile Update</p>
                    <p className="text-xs text-gray-400">Request changes to {a.first_name}'s profile info</p>
                  </div>
                </div>
                <ChevronRight className={`w-4 h-4 text-gray-400 transition-transform duration-200 ${editExpanded ? 'rotate-90' : ''}`} />
              </button>

              {editExpanded && (
                <div className="border-t border-gray-100 px-6 pb-6 pt-4">
                  <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-5 flex items-start gap-3">
                    <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                    <p className="text-amber-800 text-sm">
                      Updates are reviewed by the NextUp team before going live. Changes typically post within 24–48 hours.
                    </p>
                  </div>

                  {editSuccess && (
                    <div className="bg-green-50 border border-green-200 rounded-xl p-4 mb-5 flex items-start gap-3">
                      <CheckCircle className="w-4 h-4 text-green-600 shrink-0 mt-0.5" />
                      <p className="text-green-800 text-sm font-semibold">Update submitted! We'll review it shortly.</p>
                    </div>
                  )}

                  {editError && (
                    <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-5">
                      <p className="text-red-700 text-sm">{editError}</p>
                    </div>
                  )}

                  <form onSubmit={handleUpdateSubmit} className="space-y-6">
                    <div>
                      <p className="text-xs font-black text-gold uppercase tracking-widest mb-4">Basic Info</p>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className={labelCls}>Athlete Level</label>
                          <input type="text" value={editForm.grade} onChange={e => setEditForm(p => ({ ...p, grade: e.target.value }))} className={inputCls} placeholder="e.g. 8th Grade, High School Sophomore" />
                        </div>
                        <div>
                          <label className={labelCls}>Graduation / Class Year</label>
                          <input type="text" value={editForm.class_year} onChange={e => setEditForm(p => ({ ...p, class_year: e.target.value }))} className={inputCls} placeholder="e.g. Class of 2027" />
                        </div>
                        <div>
                          <label className={labelCls}>Position</label>
                          <input type="text" value={editForm.position} onChange={e => setEditForm(p => ({ ...p, position: e.target.value }))} className={inputCls} placeholder="e.g. Point Guard" />
                        </div>
                        <div>
                          <label className={labelCls}>School</label>
                          <input type="text" value={editForm.school} onChange={e => setEditForm(p => ({ ...p, school: e.target.value }))} className={inputCls} placeholder="School name" />
                        </div>
                        <div>
                          <label className={labelCls}>Team / Club</label>
                          <input type="text" value={editForm.team_name} onChange={e => setEditForm(p => ({ ...p, team_name: e.target.value }))} className={inputCls} placeholder="e.g. Mid-South 13U AAU" />
                        </div>
                        <div>
                          <label className={labelCls}>City / State</label>
                          <input type="text" value={editForm.city} onChange={e => setEditForm(p => ({ ...p, city: e.target.value }))} className={inputCls} placeholder="Memphis, TN" />
                        </div>
                        <div>
                          <label className={labelCls}>Height</label>
                          <input type="text" value={editForm.height} onChange={e => setEditForm(p => ({ ...p, height: e.target.value }))} className={inputCls} placeholder={`e.g. 6'1"`} />
                        </div>
                        <div>
                          <label className={labelCls}>Jersey Number</label>
                          <input type="text" value={editForm.jersey_number} onChange={e => setEditForm(p => ({ ...p, jersey_number: e.target.value }))} className={inputCls} placeholder="e.g. 23" />
                        </div>
                      </div>
                    </div>

                    <div className="h-px bg-gray-100" />

                    <div>
                      <p className="text-xs font-black text-navy uppercase tracking-widest mb-4">Bio</p>
                      <textarea
                        rows={4}
                        value={editForm.bio}
                        onChange={e => setEditForm(p => ({ ...p, bio: e.target.value }))}
                        className={inputCls}
                        placeholder={`Tell ${a.first_name}'s story — background, goals, and what drives them.`}
                      />
                    </div>

                    <div className="h-px bg-gray-100" />

                    <div>
                      <p className="text-xs font-black text-navy uppercase tracking-widest mb-4">Social &amp; Highlights</p>
                      <div className="space-y-4">
                        <div className="flex items-center gap-2">
                          <Instagram className="w-5 h-5 text-gray-400 shrink-0" />
                          <input type="text" value={editForm.instagram_handle} onChange={e => setEditForm(p => ({ ...p, instagram_handle: e.target.value }))} className={inputCls} placeholder="Instagram handle (without @)" />
                        </div>
                        <div className="flex items-center gap-2">
                          <Twitter className="w-5 h-5 text-gray-400 shrink-0" />
                          <input type="text" value={editForm.twitter_handle} onChange={e => setEditForm(p => ({ ...p, twitter_handle: e.target.value }))} className={inputCls} placeholder="Twitter / X handle (without @)" />
                        </div>
                        <div className="flex items-center gap-2">
                          <Link2 className="w-5 h-5 text-gray-400 shrink-0" />
                          <input type="url" value={editForm.highlight_video_url} onChange={e => setEditForm(p => ({ ...p, highlight_video_url: e.target.value }))} className={inputCls} placeholder="Highlight video URL (YouTube, Hudl, etc.)" />
                        </div>
                      </div>
                    </div>

                    <div className="h-px bg-gray-100" />

                    <div>
                      <label className={labelCls}>Notes for the Admin Team</label>
                      <textarea
                        rows={2}
                        value={editForm.notes}
                        onChange={e => setEditForm(p => ({ ...p, notes: e.target.value }))}
                        className={inputCls}
                        placeholder="Anything else you'd like us to know about these changes"
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={editSubmitting}
                      className="w-full btn-primary py-3.5 text-base font-bold disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {editSubmitting ? 'Submitting...' : 'Submit for Review'}
                    </button>
                  </form>
                </div>
              )}
            </div>

            {/* Update history */}
            {updates.length === 0 ? (
              <div className="bg-white rounded-2xl border border-gray-200 p-10 text-center shadow-sm">
                <Clock className="w-10 h-10 text-gray-200 mx-auto mb-3" />
                <p className="text-gray-500 text-sm">No updates submitted yet.</p>
              </div>
            ) : (
              <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-100">
                  <h3 className="font-bold text-navy">Update History</h3>
                </div>
                <div className="divide-y divide-gray-50">
                  {updates.map(u => (
                    <div key={u.id} className="px-6 py-4">
                      <div className="flex items-start justify-between mb-2">
                        <p className="text-sm text-gray-600">{new Date(u.created_at).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</p>
                        {statusBadge(u.status)}
                      </div>
                      {u.field_correction_notes && (
                        <p className="text-xs text-gray-500 mt-1">Your notes: {u.field_correction_notes}</p>
                      )}
                      {u.admin_notes && (
                        <div className="mt-2 bg-gray-50 rounded-lg px-3 py-2">
                          <p className="text-xs font-semibold text-navy mb-0.5">Admin Response</p>
                          <p className="text-xs text-gray-600">{u.admin_notes}</p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* ---- SUPPORT / UPGRADE ---- */}
        {tab === 'support' && (
          <div className="max-w-2xl space-y-4">
            <div className="bg-white rounded-2xl border border-gray-200 p-8 shadow-sm text-center">
              <div className="w-16 h-16 bg-gold/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Star className="w-8 h-8 text-gold" />
              </div>
              <h2 className="text-xl font-bold text-navy mb-2">Support {a.first_name}'s Journey</h2>
              <p className="text-gray-600 text-sm leading-relaxed mb-6">
                Unlock a verified profile, premium media, and increased visibility for your athlete on the NextUp Network.
              </p>
              <a
                href="/support"
                className="btn-primary px-8 py-3 inline-block text-sm font-bold"
              >
                View Support Options
              </a>
            </div>

            <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
              <h3 className="font-bold text-navy mb-3 text-sm">Need Help?</h3>
              <p className="text-gray-500 text-sm mb-4">
                Have questions about {a.first_name}'s profile, consent settings, or media approvals?
              </p>
              <a
                href="/contact"
                className="inline-flex items-center gap-2 text-sm font-semibold text-gold hover:text-gold-dark transition-colors"
              >
                Contact Support
                <ChevronRight className="w-4 h-4" />
              </a>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

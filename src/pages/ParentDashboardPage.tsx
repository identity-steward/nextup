import { useState, useEffect, useRef } from 'react';
import { Users, Clock, CheckCircle, XCircle, AlertCircle, ChevronRight, Upload, Camera, Video, LogOut, ExternalLink, ShieldCheck, ShieldAlert } from 'lucide-react';
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
  school: string | null;
  team_name: string | null;
  city: string | null;
  image_url: string | null;
  profile_status: 'pending' | 'active' | 'approved' | 'verified_event' | 'hidden' | 'rejected';
}

interface ConsentRecord {
  id: string;
  consent_status: string;
  can_use_name_image_likeness: boolean;
  can_use_on_social: boolean;
}

interface UpdateRequest {
  id: string;
  status: string;
  created_at: string;
  admin_notes: string | null;
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
        .select('id, slug, first_name, last_initial, sport, grade, school, team_name, city, image_url, profile_status')
        .eq('id', profile.athlete_id)
        .maybeSingle();
      athleteData = data as Athlete | null;
    } else {
      const { data } = await supabase
        .from('athletes')
        .select('id, slug, first_name, last_initial, sport, grade, school, team_name, city, image_url, profile_status')
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

    const [consentRes, updatesRes, mediaRes] = await Promise.all([
      supabase
        .from('consents')
        .select('id, consent_status, can_use_name_image_likeness, can_use_on_social')
        .eq('athlete_id', athleteData.id)
        .maybeSingle(),
      supabase
        .from('profile_update_requests')
        .select('id, status, created_at, admin_notes')
        .eq('athlete_slug', athleteData.slug)
        .order('created_at', { ascending: false })
        .limit(20),
      supabase
        .from('media_uploads')
        .select('id, media_type, file_name, caption, status, created_at')
        .eq('athlete_id', athleteData.id)
        .order('created_at', { ascending: false }),
    ]);

    setConsent(consentRes.data as ConsentRecord | null);
    setUpdates((updatesRes.data || []) as UpdateRequest[]);
    setMedia((mediaRes.data || []) as MediaUpload[]);
    setLoading(false);
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

  const tabs: { id: Tab; label: string; icon: React.ReactNode }[] = [
    { id: 'overview', label: 'Overview', icon: <Users className="w-4 h-4" /> },
    { id: 'media', label: 'Media', icon: <Camera className="w-4 h-4" /> },
    { id: 'updates', label: 'Submissions', icon: <Clock className="w-4 h-4" /> },
    { id: 'support', label: 'Support', icon: <ChevronRight className="w-4 h-4" /> },
  ];

  const pendingCount = updates.filter(u => u.status === 'pending').length;
  const mediaCount = media.length;

  const profileStatusMeta: Record<string, { label: string; cls: string; pulse: string }> = {
    pending:        { label: 'Pending Approval',       cls: 'text-amber-400', pulse: 'bg-amber-400' },
    active:         { label: 'Profile Live',           cls: 'text-green-400', pulse: 'bg-green-400' },
    approved:       { label: 'Profile Approved — Live', cls: 'text-green-400', pulse: 'bg-green-400' },
    verified_event: { label: 'Verified Event Profile', cls: 'text-green-400', pulse: 'bg-green-400' },
    hidden:         { label: 'Profile Hidden',         cls: 'text-red-400',   pulse: 'bg-red-400' },
    rejected:       { label: 'Profile Not Approved',   cls: 'text-red-400',   pulse: 'bg-red-400' },
  };
  const statusMeta = profileStatusMeta[athlete!.profile_status] || profileStatusMeta.pending;

  return (
    <div className="min-h-screen bg-gray-50 pt-20">
      {/* Top bar */}
      <div className="bg-navy text-white">
        <div className="max-w-6xl mx-auto px-6 lg:px-8 py-5 flex items-center justify-between">
          <div>
            <p className="text-gold text-xs font-bold uppercase tracking-widest mb-0.5">Parent Portal</p>
            <h1 className="text-xl font-bold">
              {athlete!.first_name} {athlete!.last_initial}.
              <span className="ml-2 text-base font-normal text-gray-400">{athlete!.sport}</span>
            </h1>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate(`/athletes/${athlete!.slug}`)}
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
            <span className={`w-1.5 h-1.5 rounded-full ${statusMeta.pulse} ${athlete!.profile_status === 'pending' || athlete!.profile_status === 'active' ? 'animate-pulse' : ''}`} />
            {statusMeta.label}
          </span>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 lg:px-8 py-8">
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
                  {athlete!.image_url ? (
                    <img src={athlete!.image_url} alt={athlete!.first_name} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Users className="w-8 h-8 text-navy/40" />
                    </div>
                  )}
                </div>
                <h2 className="text-lg font-bold text-navy">{athlete!.first_name} {athlete!.last_initial}.</h2>
                <p className="text-gold font-semibold text-sm">{athlete!.sport}</p>

                <div className="mt-4 space-y-2 text-sm">
                  {athlete!.grade && <div className="flex justify-between"><span className="text-gray-400">Level</span><span className="text-navy font-medium">{athlete!.grade}</span></div>}
                  {athlete!.school && <div className="flex justify-between"><span className="text-gray-400">School</span><span className="text-navy font-medium">{athlete!.school}</span></div>}
                  {athlete!.team_name && <div className="flex justify-between"><span className="text-gray-400">Team</span><span className="text-navy font-medium">{athlete!.team_name}</span></div>}
                  {athlete!.city && <div className="flex justify-between"><span className="text-gray-400">City</span><span className="text-navy font-medium">{athlete!.city}</span></div>}
                </div>
              </div>

              {/* Consent card */}
              <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
                <h3 className="font-bold text-navy mb-3 text-sm flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-gold" />
                  Consent Status
                </h3>
                {consent ? (
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-500">Profile consent</span>
                      {consent.consent_status === 'granted' ? (
                        <span className="inline-flex items-center gap-1 text-xs font-semibold text-green-700 bg-green-50 border border-green-200 px-2 py-0.5 rounded-full">
                          <CheckCircle className="w-3 h-3" /> Granted
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-xs font-semibold text-amber-700 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-full">
                          <Clock className="w-3 h-3" /> Pending
                        </span>
                      )}
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-500">Name & likeness</span>
                      <span className={`text-xs font-semibold ${consent.can_use_name_image_likeness ? 'text-green-700' : 'text-gray-400'}`}>
                        {consent.can_use_name_image_likeness ? 'Allowed' : 'Not yet'}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-500">Social media use</span>
                      <span className={`text-xs font-semibold ${consent.can_use_on_social ? 'text-green-700' : 'text-gray-400'}`}>
                        {consent.can_use_on_social ? 'Allowed' : 'Not yet'}
                      </span>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-start gap-2 text-sm text-gray-500">
                    <ShieldAlert className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                    No consent record on file. Contact support to update.
                  </div>
                )}
              </div>
            </div>

            {/* Right side */}
            <div className="md:col-span-2 space-y-4">
              {/* Quick actions */}
              <div className="grid sm:grid-cols-3 gap-3">
                {[
                  { label: 'Upload Photo / Video', icon: <Upload className="w-4 h-4" />, action: () => setTab('media') },
                  { label: 'View Submissions', icon: <Clock className="w-4 h-4" />, action: () => setTab('updates') },
                  { label: 'View Public Profile', icon: <ExternalLink className="w-4 h-4" />, action: () => navigate(`/athletes/${athlete!.slug}`) },
                ].map(a => (
                  <button key={a.label} onClick={a.action}
                    className="flex items-center gap-2 bg-white border border-gray-200 hover:border-gold/40 hover:shadow-sm px-4 py-3 rounded-xl text-sm font-semibold text-navy transition-all group">
                    <span className="text-gold">{a.icon}</span>
                    {a.label}
                    <ChevronRight className="w-3.5 h-3.5 ml-auto text-gray-300 group-hover:text-gold transition-colors" />
                  </button>
                ))}
              </div>

              {/* Profile status info */}
              {(athlete!.profile_status === 'pending') && (
                <div className="bg-amber-50 border border-amber-200 rounded-xl p-5">
                  <div className="flex items-start gap-3">
                    <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                    <div>
                      <p className="text-amber-900 font-semibold text-sm">Profile Under Review</p>
                      <p className="text-amber-700 text-sm mt-1">
                        Your athlete's profile is being reviewed by the NextUp team. Profiles are typically approved within 48 hours.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {(athlete!.profile_status === 'active' || athlete!.profile_status === 'approved' || athlete!.profile_status === 'verified_event') && (
                <div className="bg-green-50 border border-green-200 rounded-xl p-5">
                  <div className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-green-600 shrink-0 mt-0.5" />
                    <div>
                      <p className="text-green-900 font-semibold text-sm">Profile is Live</p>
                      <p className="text-green-700 text-sm mt-1">
                        {athlete!.first_name}'s profile is published and visible on NextUp.
                        {' '}
                        <button onClick={() => navigate(`/athletes/${athlete!.slug}`)} className="underline font-semibold hover:no-underline">
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

              {/* Recent submissions */}
              {updates.length > 0 && (
                <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
                  <h3 className="font-bold text-navy mb-3">Recent Submissions</h3>
                  <div className="space-y-2">
                    {updates.slice(0, 3).map(u => (
                      <div key={u.id} className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
                        <span className="text-xs text-gray-500">{new Date(u.created_at).toLocaleDateString()}</span>
                        {statusBadge(u.status)}
                      </div>
                    ))}
                  </div>
                  <button onClick={() => setTab('updates')} className="text-gold text-xs font-semibold mt-2 hover:underline">
                    View all submissions →
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
              <h3 className="font-bold text-navy mb-1">Upload Media for {athlete!.first_name}</h3>
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

        {/* ---- UPDATES / SUBMISSIONS ---- */}
        {tab === 'updates' && (
          <div className="max-w-2xl">
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-6 flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
              <p className="text-amber-800 text-sm">
                Profile update submissions are reviewed by the NextUp team. To request a change, contact{' '}
                <a href="/contact" className="font-semibold underline">our support team</a> or check back when the full update form is available.
              </p>
            </div>

            {updates.length === 0 ? (
              <div className="bg-white rounded-2xl border border-gray-200 p-10 text-center shadow-sm">
                <Clock className="w-10 h-10 text-gray-200 mx-auto mb-3" />
                <p className="text-gray-500 text-sm">No submissions on record yet.</p>
              </div>
            ) : (
              <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-100">
                  <h3 className="font-bold text-navy">Profile Update History</h3>
                </div>
                <div className="divide-y divide-gray-50">
                  {updates.map(u => (
                    <div key={u.id} className="px-6 py-4">
                      <div className="flex items-start justify-between mb-2">
                        <p className="text-sm text-gray-600">{new Date(u.created_at).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</p>
                        {statusBadge(u.status)}
                      </div>
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
                <Users className="w-8 h-8 text-gold" />
              </div>
              <h2 className="text-xl font-bold text-navy mb-2">Support {athlete!.first_name}'s Journey</h2>
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
                Have questions about your athlete's profile, consent settings, or media approvals?
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

import { useState, useEffect, useRef } from 'react';
import { User, CreditCard as Edit3, Upload, Link2, Trophy, Star, Clock, CheckCircle, XCircle, AlertCircle, ChevronRight, Instagram, Twitter, ExternalLink, Camera, Video, LogOut } from 'lucide-react';
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
  position: string | null;
  bio: string | null;
  city: string | null;
  instagram_handle: string | null;
  twitter_handle: string | null;
  highlight_video_url: string | null;
  image_url: string | null;
  is_active: boolean;
  profile_status: 'pending' | 'active' | 'approved' | 'verified_event' | 'hidden' | 'rejected';
  height: string | null;
  jersey_number: string | null;
  class_year: string | null;
}

interface UpdateRequest {
  id: string;
  status: string;
  created_at: string;
  field_correction_notes: string | null;
  admin_notes: string | null;
}

interface MediaUpload {
  id: string;
  media_type: string;
  file_name: string;
  caption: string | null;
  status: string;
  created_at: string;
  public_url: string | null;
}

type Tab = 'overview' | 'edit' | 'media' | 'updates';

const BUCKETS: Record<string, string> = {
  photo: 'athlete-photos',
  video: 'athlete-videos',
  highlight: 'athlete-videos',
  document: 'profile-assets',
};

export default function AthleteDashboardPage() {
  const navigate = useNavigate();
  const { user, profile, isAdmin, signOut } = useAuth();
  const [athlete, setAthlete] = useState<Athlete | null>(null);
  const [updates, setUpdates] = useState<UpdateRequest[]>([]);
  const [media, setMedia] = useState<MediaUpload[]>([]);
  const [tab, setTab] = useState<Tab>('overview');
  const [loading, setLoading] = useState(true);
  const [noProfile, setNoProfile] = useState(false);

  // Edit form state
  const [editForm, setEditForm] = useState({
    bio: '',
    grade: '',
    school: '',
    team_name: '',
    position: '',
    city: '',
    instagram_handle: '',
    twitter_handle: '',
    highlight_video_url: '',
    notes: '',
  });
  const [editSubmitting, setEditSubmitting] = useState(false);
  const [editSuccess, setEditSuccess] = useState(false);
  const [editError, setEditError] = useState('');

  // Upload state
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
        .select('id, slug, first_name, last_initial, sport, grade, school, team_name, position, bio, city, instagram_handle, twitter_handle, highlight_video_url, image_url, is_active, profile_status, height, jersey_number, class_year')
        .eq('id', profile.athlete_id)
        .maybeSingle();
      athleteData = data as Athlete | null;
    } else {
      // Try to find by auth_user_id
      const { data } = await supabase
        .from('athletes')
        .select('id, slug, first_name, last_initial, sport, grade, school, team_name, position, bio, city, instagram_handle, twitter_handle, highlight_video_url, image_url, is_active, profile_status, height, jersey_number, class_year')
        .eq('auth_user_id', user!.id)
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
      bio: athleteData.bio || '',
      grade: athleteData.grade || '',
      school: athleteData.school || '',
      team_name: athleteData.team_name || '',
      position: athleteData.position || '',
      city: athleteData.city || '',
      instagram_handle: athleteData.instagram_handle || '',
      twitter_handle: athleteData.twitter_handle || '',
      highlight_video_url: athleteData.highlight_video_url || '',
      notes: '',
    });

    // Load update requests for this athlete's slug
    const { data: upd } = await supabase
      .from('profile_update_requests')
      .select('id, status, created_at, field_correction_notes, admin_notes')
      .eq('athlete_slug', athleteData.slug)
      .order('created_at', { ascending: false })
      .limit(20);
    setUpdates((upd || []) as UpdateRequest[]);

    // Load media
    const { data: med } = await supabase
      .from('media_uploads')
      .select('id, media_type, file_name, caption, status, created_at, public_url')
      .eq('athlete_id', athleteData.id)
      .order('created_at', { ascending: false });
    setMedia((med || []) as MediaUpload[]);

    setLoading(false);
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!athlete) return;
    setEditSubmitting(true);
    setEditError('');
    setEditSuccess(false);

    const { error } = await supabase.from('profile_update_requests').insert([{
      athlete_slug: athlete.slug,
      submitted_by_name: profile?.display_name || user?.email || '',
      submitted_by_role: profile?.role || 'athlete',
      submitted_by_email: user?.email || '',
      submitted_by_user_id: user?.id,
      field_bio: editForm.bio || null,
      field_class_year: editForm.grade || null,
      field_school: editForm.school || null,
      field_team: editForm.team_name || null,
      field_position: editForm.position || null,
      field_city_state: editForm.city || null,
      field_social_instagram: editForm.instagram_handle || null,
      field_social_twitter: editForm.twitter_handle || null,
      highlight_video_url: editForm.highlight_video_url || null,
      field_correction_notes: editForm.notes || null,
      status: 'pending',
    }]);

    if (error) {
      setEditError('Submission failed. Please try again.');
    } else {
      setEditSuccess(true);
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
        source_type: profile?.role === 'parent' ? 'parent_upload' : 'athlete_upload',
        consent_status: 'implied',
        usage_scope: 'platform',
      }])
      .select('id')
      .single();

    // Generate SAB-ID for tracking
    if (!dbError && insertedMedia?.id) {
      await supabase.rpc('create_sab_id', {
        p_athlete_id: athlete.id,
        p_user_id: user!.id,
        p_media_upload_id: insertedMedia.id,
        p_source_type: profile?.role === 'parent' ? 'parent_upload' : 'player_upload',
        p_consent_status: 'pending',
        p_usage_scope: ['profile'],
      });
    }

    const dbError2 = dbError;

    if (dbError2) {
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
    // Redirect new users to profile setup wizard
    navigate('/profile-setup', { replace: true });
    return null;
  }

  const tabs: { id: Tab; label: string; icon: React.ReactNode }[] = [
    { id: 'overview', label: 'Overview', icon: <User className="w-4 h-4" /> },
    { id: 'edit', label: 'Submit Update', icon: <Edit3 className="w-4 h-4" /> },
    { id: 'media', label: 'Media', icon: <Camera className="w-4 h-4" /> },
    { id: 'updates', label: 'My Submissions', icon: <Clock className="w-4 h-4" /> },
  ];

  const pendingCount = updates.filter(u => u.status === 'pending').length;
  const mediaCount = media.length;

  return (
    <div className="min-h-screen bg-gray-50 pt-20">
      {/* Top bar */}
      <div className="bg-navy text-white">
        <div className="max-w-6xl mx-auto px-6 lg:px-8 py-5 flex items-center justify-between">
          <div>
            <p className="text-gold text-xs font-bold uppercase tracking-widest mb-0.5">Athlete Dashboard</p>
            <h1 className="text-xl font-bold">
              {athlete?.first_name} {athlete?.last_initial}.
              <span className="ml-2 text-base font-normal text-gray-400">{athlete?.sport}</span>
            </h1>
          </div>
          <div className="flex items-center gap-3">
            {athlete && (
              <button
                onClick={() => navigate(`/athletes/${athlete.slug}`)}
                className="hidden sm:inline-flex items-center gap-1.5 text-xs text-gray-300 hover:text-white border border-white/20 hover:border-white/40 px-3 py-2 rounded-lg transition-colors"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                View Public Profile
              </button>
            )}
            {isAdmin && (
              <button
                onClick={() => navigate('/admin')}
                className="hidden sm:inline-flex items-center gap-1.5 text-xs text-gold hover:text-gold-dark border border-gold/30 hover:border-gold/60 px-3 py-2 rounded-lg transition-colors"
              >
                <Star className="w-3.5 h-3.5" />
                Admin Panel
              </button>
            )}
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
        <div className="border-t border-white/10 px-6 lg:px-8 py-2 max-w-6xl mx-auto flex items-center gap-3">
          {(athlete?.profile_status === 'active' || athlete?.profile_status === 'approved' || athlete?.profile_status === 'verified_event') && (
            <span className="text-xs font-semibold inline-flex items-center gap-1.5 text-green-400">
              <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
              {athlete.profile_status === 'verified_event' ? 'Verified Event Profile — Live' : 'Profile Approved — Live'}
            </span>
          )}
          {athlete?.profile_status === 'pending' && (
            <span className="text-xs font-semibold inline-flex items-center gap-1.5 text-amber-400">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
              Profile Pending Admin Approval
            </span>
          )}
          {(athlete?.profile_status === 'hidden' || athlete?.profile_status === 'rejected') && (
            <span className="text-xs font-semibold inline-flex items-center gap-1.5 text-red-400">
              <span className="w-1.5 h-1.5 rounded-full bg-red-400" />
              Profile {athlete.profile_status === 'hidden' ? 'Hidden' : 'Not Approved'} — Contact Support
            </span>
          )}
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
        {tab === 'overview' && athlete && (
          <div className="grid md:grid-cols-3 gap-6">
            {/* Profile card */}
            <div className="md:col-span-1">
              <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
                <div className="w-20 h-20 rounded-2xl bg-navy/10 overflow-hidden mb-2">
                  {athlete.image_url ? (
                    <img src={athlete.image_url} alt={athlete.first_name} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <User className="w-8 h-8 text-navy/40" />
                    </div>
                  )}
                </div>
                {!athlete.image_url && (() => {
                  const pendingPhoto = media.find(m => m.media_type === 'photo' && m.status === 'pending');
                  const rejectedPhoto = media.find(m => m.media_type === 'photo' && m.status === 'rejected');
                  if (pendingPhoto) {
                    return <p className="text-xs text-amber-600 font-medium mb-3">Photo pending review</p>;
                  }
                  if (rejectedPhoto) {
                    return <p className="text-xs text-red-500 font-medium mb-3">Photo not approved — try another</p>;
                  }
                  return (
                    <button onClick={() => setTab('media')} className="text-xs text-gold font-semibold hover:underline mb-3 block">
                      + Upload profile photo
                    </button>
                  );
                })()}
                <h2 className="text-lg font-bold text-navy">{athlete.first_name} {athlete.last_initial}.</h2>
                <p className="text-gold font-semibold text-sm">{athlete.sport}</p>
                {athlete.position && <p className="text-gray-500 text-xs mt-1">{athlete.position}</p>}

                <div className="mt-4 space-y-2 text-sm">
                  {athlete.grade && <div className="flex justify-between"><span className="text-gray-400">Grade</span><span className="text-navy font-medium">{athlete.grade}</span></div>}
                  {athlete.school && <div className="flex justify-between"><span className="text-gray-400">School</span><span className="text-navy font-medium">{athlete.school}</span></div>}
                  {athlete.team_name && <div className="flex justify-between"><span className="text-gray-400">Team</span><span className="text-navy font-medium">{athlete.team_name}</span></div>}
                  {athlete.city && <div className="flex justify-between"><span className="text-gray-400">City</span><span className="text-navy font-medium">{athlete.city}</span></div>}
                </div>

                {(athlete.instagram_handle || athlete.twitter_handle) && (
                  <div className="mt-4 flex gap-2">
                    {athlete.instagram_handle && (
                      <a href={`https://instagram.com/${athlete.instagram_handle}`} target="_blank" rel="noopener noreferrer"
                        className="flex items-center gap-1 text-xs text-gray-500 hover:text-navy transition-colors">
                        <Instagram className="w-3.5 h-3.5" />
                        @{athlete.instagram_handle}
                      </a>
                    )}
                    {athlete.twitter_handle && (
                      <a href={`https://twitter.com/${athlete.twitter_handle}`} target="_blank" rel="noopener noreferrer"
                        className="flex items-center gap-1 text-xs text-gray-500 hover:text-navy transition-colors">
                        <Twitter className="w-3.5 h-3.5" />
                        @{athlete.twitter_handle}
                      </a>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Right side */}
            <div className="md:col-span-2 space-y-4">
              {/* Bio */}
              <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
                <h3 className="font-bold text-navy mb-2">Bio</h3>
                {athlete.bio
                  ? <p className="text-gray-600 text-sm leading-relaxed">{athlete.bio}</p>
                  : <p className="text-gray-400 text-sm italic">No bio yet. Submit an update to add one.</p>
                }
              </div>

              {/* Highlight video */}
              {athlete.highlight_video_url && (
                <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
                  <h3 className="font-bold text-navy mb-2 flex items-center gap-2"><Video className="w-4 h-4 text-gold" />Highlight Video</h3>
                  <a href={athlete.highlight_video_url} target="_blank" rel="noopener noreferrer"
                    className="text-gold text-sm hover:underline flex items-center gap-1">
                    {athlete.highlight_video_url}
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              )}

              {/* Quick actions */}
              <div className="grid sm:grid-cols-3 gap-3">
                {[
                  { label: 'Submit Profile Update', icon: <Edit3 className="w-4 h-4" />, action: () => setTab('edit') },
                  { label: 'Upload Photo / Video', icon: <Upload className="w-4 h-4" />, action: () => setTab('media') },
                  { label: 'View Public Profile', icon: <ExternalLink className="w-4 h-4" />, action: () => navigate(`/athletes/${athlete.slug}`) },
                ].map(a => (
                  <button key={a.label} onClick={a.action}
                    className="flex items-center gap-2 bg-white border border-gray-200 hover:border-gold/40 hover:shadow-sm px-4 py-3 rounded-xl text-sm font-semibold text-navy transition-all group">
                    <span className="text-gold">{a.icon}</span>
                    {a.label}
                    <ChevronRight className="w-3.5 h-3.5 ml-auto text-gray-300 group-hover:text-gold transition-colors" />
                  </button>
                ))}
              </div>

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

        {/* ---- EDIT / SUBMIT UPDATE ---- */}
        {tab === 'edit' && (
          <div className="max-w-2xl">
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-6 flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
              <p className="text-amber-800 text-sm">
                Updates are reviewed by the NextUp team before going live. Changes typically post within 24–48 hours.
              </p>
            </div>

            {editSuccess && (
              <div className="bg-green-50 border border-green-200 rounded-xl p-4 mb-6 flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-green-600 shrink-0 mt-0.5" />
                <p className="text-green-800 text-sm font-semibold">Update submitted! We'll review it shortly.</p>
              </div>
            )}

            {editError && (
              <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6">
                <p className="text-red-700 text-sm">{editError}</p>
              </div>
            )}

            <form onSubmit={handleEditSubmit} className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm space-y-6">
              <div>
                <p className="text-xs font-black text-gold uppercase tracking-widest mb-4">Basic Info</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className={labelCls}>Grade / Class Year</label>
                    <input type="text" value={editForm.grade} onChange={e => setEditForm(p => ({ ...p, grade: e.target.value }))} className={inputCls} placeholder="e.g. 10th Grade / Class of 2027" />
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
                  placeholder="Tell your story — your background, goals, and what drives you."
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

        {/* ---- MEDIA ---- */}
        {tab === 'media' && (
          <div className="max-w-3xl space-y-6">
            {/* Upload form */}
            <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
              <h3 className="font-bold text-navy mb-1">Upload New Media</h3>
              <p className="text-gray-500 text-sm mb-5">Photos and videos are reviewed before appearing on your profile.</p>

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
                    <input type="text" value={uploadCaption} onChange={e => setUploadCaption(e.target.value)} className={inputCls} placeholder="Game 3 vs. Whitehaven..." />
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

            {/* Media list */}
            {media.length > 0 && (
              <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-100">
                  <h3 className="font-bold text-navy">Your Uploads ({media.length})</h3>
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
                      <div className="shrink-0">
                        {statusBadge(m.status)}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* ---- UPDATES HISTORY ---- */}
        {tab === 'updates' && (
          <div className="max-w-2xl">
            {updates.length === 0 ? (
              <div className="bg-white rounded-2xl border border-gray-200 p-10 text-center shadow-sm">
                <Trophy className="w-10 h-10 text-gray-200 mx-auto mb-3" />
                <p className="text-gray-500 text-sm">No submissions yet. Use the "Submit Update" tab to request profile changes.</p>
              </div>
            ) : (
              <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-100">
                  <h3 className="font-bold text-navy">Profile Update Submissions</h3>
                </div>
                <div className="divide-y divide-gray-50">
                  {updates.map(u => (
                    <div key={u.id} className="px-6 py-4">
                      <div className="flex items-start justify-between mb-2">
                        <p className="text-sm text-gray-600">{new Date(u.created_at).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</p>
                        {statusBadge(u.status)}
                      </div>
                      {u.field_correction_notes && (
                        <p className="text-xs text-gray-500 mt-1">Notes: {u.field_correction_notes}</p>
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
      </div>
    </div>
  );
}

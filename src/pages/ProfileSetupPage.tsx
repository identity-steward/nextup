import { useState, useEffect } from 'react';
import { CheckCircle, AlertCircle, ChevronRight, ChevronLeft, User, MapPin, Trophy, Link2, ArrowRight } from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';

const SPORTS = [
  'Basketball', 'Football', 'Soccer', 'Track & Field', 'Baseball',
  'Softball', 'Volleyball', 'Cheerleading', 'Tennis', 'Swimming',
  'Wrestling', 'Cross Country', 'Golf', 'Lacrosse', 'Other',
];

const CURRENT_YEAR = new Date().getFullYear();
const CLASS_YEARS = Array.from({ length: 10 }, (_, i) => String(CURRENT_YEAR + i));

type Step = 'basics' | 'details' | 'bio' | 'links' | 'review';
const STEPS: Step[] = ['basics', 'details', 'bio', 'links', 'review'];

function slugify(firstName: string, lastName: string): string {
  const base = `${firstName}-${lastName[0] || ''}`
    .toLowerCase()
    .replace(/[^a-z0-9-]/g, '')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
  return `${base}-${Math.random().toString(36).slice(2, 6)}`;
}

export default function ProfileSetupPage() {
  const navigate = useNavigate();
  const { user, profile, refreshProfile } = useAuth();
  const [step, setStep] = useState<Step>('basics');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [done, setDone] = useState(false);
  const [createdSlug, setCreatedSlug] = useState('');
  const [isAutoApproved, setIsAutoApproved] = useState(false);

  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    sport: '',
    grade: '',
    classYear: '',
    gender: '',
    height: '',
    jerseyNumber: '',
    school: '',
    city: '',
    teamName: '',
    position: '',
    bio: '',
    descriptor: '',
    instagram: '',
    twitter: '',
    highlightUrl: '',
  });

  useEffect(() => {
    // Pre-fill name from sessionStorage set by signup pages
    const fn = sessionStorage.getItem('signup_first_name') || '';
    const ln = sessionStorage.getItem('signup_last_name') || '';
    if (fn || ln) {
      setForm(prev => ({ ...prev, firstName: fn, lastName: ln }));
    }
  }, []);

  const set = (field: string, value: string) =>
    setForm(prev => ({ ...prev, [field]: value }));

  const stepIndex = STEPS.indexOf(step);
  const goNext = () => {
    if (stepIndex < STEPS.length - 1) setStep(STEPS[stepIndex + 1]);
  };
  const goBack = () => {
    if (stepIndex > 0) setStep(STEPS[stepIndex - 1]);
  };

  const validateStep = (): string => {
    if (step === 'basics') {
      if (!form.firstName.trim()) return 'First name is required.';
      if (!form.lastName.trim()) return 'Last name is required.';
      if (!form.sport) return 'Please select a sport.';
      if (!form.grade.trim()) return 'Athlete level is required.';
    }
    return '';
  };

  const handleNext = () => {
    const err = validateStep();
    if (err) { setError(err); return; }
    setError('');
    goNext();
  };

  const handleSubmit = async () => {
    if (!user) return;
    setSubmitting(true);
    setError('');

    // Resolve event code → profile_status + event_code_id
    const eventCode = (sessionStorage.getItem('signup_event_code') || '').trim();
    const signupRole = sessionStorage.getItem('signup_role') || 'athlete';
    let profileStatus = 'pending';
    let eventCodeId: string | null = null;

    if (eventCode) {
      const { data: resolvedStatus } = await supabase.rpc('validate_event_code', { p_code: eventCode });
      if (resolvedStatus) {
        // Map old statuses to new canonical 'active'
        profileStatus = 'active';
        await supabase.rpc('increment_event_code_uses', { p_code: eventCode });
        // Get event_code_id for FK
        const { data: ecRow } = await supabase
          .from('event_codes')
          .select('id')
          .eq('code', eventCode.toUpperCase())
          .maybeSingle();
        eventCodeId = ecRow?.id ?? null;
      }
    }

    const sourceType = eventCode
      ? 'event_code'
      : signupRole === 'parent'
        ? 'parent_referral'
        : 'organic';

    const slug = slugify(form.firstName, form.lastName);
    const lastInitial = form.lastName.trim().charAt(0).toUpperCase();

    const { data: athleteData, error: insertError } = await supabase
      .from('athletes')
      .insert([{
        auth_user_id: user.id,
        created_by_user_id: user.id,
        managed_by_parent_id: signupRole === 'parent' ? user.id : null,
        first_name: form.firstName.trim(),
        last_initial: lastInitial,
        sport: form.sport,
        grade: form.grade,
        class_year: form.classYear || null,
        gender: form.gender || null,
        is_female: form.gender === 'female',
        height: form.height || null,
        jersey_number: form.jerseyNumber || null,
        school: form.school || null,
        city: form.city || 'Memphis, TN',
        team_name: form.teamName || null,
        position: form.position || null,
        bio: form.bio || '',
        descriptor: form.descriptor || `${form.sport} athlete`,
        strength: '',
        goal: '',
        instagram_handle: form.instagram || null,
        twitter_handle: form.twitter || null,
        highlight_video_url: form.highlightUrl || null,
        slug,
        profile_status: profileStatus,
        profile_tier: 'basic',
        source_type: sourceType,
        event_code_id: eventCodeId,
        event_code_used: eventCode || null,
      }])
      .select('id, slug')
      .single();

    if (insertError || !athleteData) {
      setError(insertError?.message || 'Failed to create profile. Please try again.');
      setSubmitting(false);
      return;
    }

    // Link athlete to user_profile — critical: without this the dashboard uses the slower
    // auth_user_id fallback. upsert handles both the "row exists" and "row missing" cases.
    const linkPayload = {
      id: user.id,
      athlete_id: athleteData.id,
      role: signupRole === 'parent' ? 'parent' : 'athlete',
    };
    const { error: linkError } = await supabase
      .from('user_profiles')
      .upsert(linkPayload, { onConflict: 'id' });

    if (linkError) {
      // Upsert failed — attempt a plain update as a fallback before giving up.
      const { error: retryError } = await supabase
        .from('user_profiles')
        .update({ athlete_id: athleteData.id })
        .eq('id', user.id);

      if (retryError) {
        // Both attempts failed. The athlete record is intact and the auth_user_id
        // fallback in AthleteDashboardPage will still find the athlete, but log
        // both errors so the broken link can be repaired manually if needed.
        console.error('user_profiles upsert failed:', linkError.message);
        console.error('user_profiles update retry failed:', retryError.message);
        console.error('athlete_id not linked for user:', user.id, '— athlete id:', athleteData.id);
      }
    }

    // Record signup source
    await supabase.from('signup_sources').insert([{
      user_id: user.id,
      athlete_id: athleteData.id,
      event_code_id: eventCodeId,
      source_type: sourceType,
      source_label: eventCode || signupRole,
    }]);

    // Create initial consent record (implied consent at signup)
    await supabase.from('consents').insert([{
      athlete_id: athleteData.id,
      user_id: user.id,
      consent_given_by: form.firstName.trim() + ' ' + form.lastName.trim(),
      relationship_to_athlete: signupRole === 'parent' ? 'parent' : 'self',
      consent_status: 'pending',
      can_use_name_image_likeness: false,
      can_use_voice: false,
      can_use_on_social: false,
      can_use_for_promo: false,
      can_use_for_sponsor_package: false,
      usage_scope: ['profile'],
    }]);

    const wasAutoApproved = profileStatus === 'active';

    // Clear sessionStorage
    ['signup_event_code', 'signup_first_name', 'signup_last_name', 'signup_role'].forEach(k =>
      sessionStorage.removeItem(k)
    );

    await refreshProfile();
    setCreatedSlug(athleteData.slug);
    setIsAutoApproved(wasAutoApproved);
    setDone(true);
    setSubmitting(false);
  };

  const inputCls = 'w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-amber-500 focus:outline-none transition-colors text-sm text-gray-900';
  const selectCls = `${inputCls} bg-white`;

  if (done) {
    return (
      <div className="min-h-screen bg-gray-50 pt-20 flex items-center justify-center px-6">
        <div className="bg-white rounded-3xl shadow-xl border border-gray-100 p-10 max-w-md w-full text-center">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-10 h-10 text-green-500" />
          </div>
          <h2 className="text-3xl font-black text-gray-900 mb-3">Profile Created!</h2>
          <p className="text-gray-500 text-base leading-relaxed mb-8">
            {isAutoApproved
              ? 'Your profile is verified and live.'
              : 'Your profile is under review and will be visible once approved by our team (usually within 48 hours).'}
          </p>
          <div className="flex flex-col gap-3">
            <Link
              to="/dashboard"
              className="w-full bg-amber-500 hover:bg-amber-400 text-white font-black py-4 rounded-xl flex items-center justify-center gap-2 transition-colors"
            >
              Go to Dashboard
              <ArrowRight className="w-5 h-5" />
            </Link>
            {createdSlug && (
              <Link
                to={`/athletes/${createdSlug}`}
                className="w-full border-2 border-gray-200 hover:border-gray-300 text-gray-700 font-semibold py-3.5 rounded-xl flex items-center justify-center gap-2 transition-colors text-sm"
              >
                View My Profile
              </Link>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pt-20">
      {/* Header */}
      <div className="bg-[#0f1923] text-white py-10">
        <div className="max-w-xl mx-auto px-6">
          <p className="text-amber-400 text-xs font-bold uppercase tracking-widest mb-3">Step {stepIndex + 1} of {STEPS.length}</p>
          <h1 className="text-3xl font-black mb-1">
            {step === 'basics' && 'Basic Information'}
            {step === 'details' && 'Position & Details'}
            {step === 'bio' && 'Your Story'}
            {step === 'links' && 'Social & Highlights'}
            {step === 'review' && 'Review & Submit'}
          </h1>
          {/* Progress bar */}
          <div className="mt-5 h-1.5 bg-white/10 rounded-full">
            <div
              className="h-1.5 bg-amber-500 rounded-full transition-all duration-500"
              style={{ width: `${((stepIndex + 1) / STEPS.length) * 100}%` }}
            />
          </div>
        </div>
      </div>

      <div className="max-w-xl mx-auto px-6 py-10">
        {error && (
          <div className="bg-red-50 border-2 border-red-200 rounded-xl p-4 mb-6 flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-500 mt-0.5 flex-shrink-0" />
            <p className="text-red-800 text-sm font-medium">{error}</p>
          </div>
        )}

        <div className="bg-white rounded-3xl shadow-lg border border-gray-100 p-8">

          {/* STEP: basics */}
          {step === 'basics' && (
            <div className="space-y-5">
              <div className="flex items-center gap-2 text-gray-400 text-sm font-semibold mb-2">
                <User className="w-4 h-4" />
                Athlete Identity
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-800 mb-1.5">First Name *</label>
                  <input type="text" required value={form.firstName}
                    onChange={e => set('firstName', e.target.value)}
                    className={inputCls} placeholder="Marcus" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-800 mb-1.5">Last Name *</label>
                  <input type="text" required value={form.lastName}
                    onChange={e => set('lastName', e.target.value)}
                    className={inputCls} placeholder="Johnson" />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-800 mb-1.5">Sport *</label>
                <select value={form.sport} onChange={e => set('sport', e.target.value)} className={selectCls}>
                  <option value="">Select a sport</option>
                  {SPORTS.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-800 mb-1.5">Athlete Level *</label>
                  <input
                    type="text"
                    value={form.grade}
                    onChange={e => set('grade', e.target.value)}
                    className={inputCls}
                    placeholder="e.g. 8th Grade, HS Junior, College Freshman"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-800 mb-1.5">Graduation / Class Year</label>
                  <select value={form.classYear} onChange={e => set('classYear', e.target.value)} className={selectCls}>
                    <option value="">Select year</option>
                    {CLASS_YEARS.map(y => <option key={y} value={y}>{y}</option>)}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-800 mb-1.5">Gender</label>
                <select value={form.gender} onChange={e => set('gender', e.target.value)} className={selectCls}>
                  <option value="">Prefer not to say</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="nonbinary">Non-binary</option>
                </select>
              </div>
            </div>
          )}

          {/* STEP: details */}
          {step === 'details' && (
            <div className="space-y-5">
              <div className="flex items-center gap-2 text-gray-400 text-sm font-semibold mb-2">
                <Trophy className="w-4 h-4" />
                Team & Physical Details
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-800 mb-1.5">Position / Role</label>
                <input type="text" value={form.position}
                  onChange={e => set('position', e.target.value)}
                  className={inputCls} placeholder="e.g. Point Guard, Wide Receiver" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-800 mb-1.5">Height</label>
                  <input type="text" value={form.height}
                    onChange={e => set('height', e.target.value)}
                    className={inputCls} placeholder={`5'10"`} />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-800 mb-1.5">Jersey #</label>
                  <input type="text" value={form.jerseyNumber}
                    onChange={e => set('jerseyNumber', e.target.value)}
                    className={inputCls} placeholder="23" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-800 mb-1.5">Team / Club</label>
                <input type="text" value={form.teamName}
                  onChange={e => set('teamName', e.target.value)}
                  className={inputCls} placeholder="Memphis Tigers" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-800 mb-1.5">School</label>
                <input type="text" value={form.school}
                  onChange={e => set('school', e.target.value)}
                  className={inputCls} placeholder="Whitehaven High School" />
              </div>
              <div className="flex items-center gap-2 text-gray-400 text-xs mb-1">
                <MapPin className="w-3.5 h-3.5" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-800 mb-1.5">City, State</label>
                <input type="text" value={form.city}
                  onChange={e => set('city', e.target.value)}
                  className={inputCls} placeholder="Memphis, TN" />
              </div>
            </div>
          )}

          {/* STEP: bio */}
          {step === 'bio' && (
            <div className="space-y-5">
              <div className="flex items-center gap-2 text-gray-400 text-sm font-semibold mb-2">
                <User className="w-4 h-4" />
                Tell Your Story
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-800 mb-1.5">
                  Short Descriptor
                  <span className="ml-2 text-xs font-normal text-gray-400">shown on athlete cards</span>
                </label>
                <input type="text" value={form.descriptor}
                  onChange={e => set('descriptor', e.target.value)}
                  className={inputCls}
                  placeholder="e.g. Point guard with D1 potential and elite court vision" />
                <p className="text-gray-400 text-xs mt-1">Keep it to one compelling sentence.</p>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-800 mb-1.5">Full Bio</label>
                <textarea value={form.bio}
                  onChange={e => set('bio', e.target.value)}
                  rows={6}
                  className={`${inputCls} resize-none`}
                  placeholder="Share your athletic journey, achievements, goals, and what drives you..." />
              </div>
            </div>
          )}

          {/* STEP: links */}
          {step === 'links' && (
            <div className="space-y-5">
              <div className="flex items-center gap-2 text-gray-400 text-sm font-semibold mb-2">
                <Link2 className="w-4 h-4" />
                Social & Highlight Links
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-800 mb-1.5">Instagram Handle</label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-sm">@</span>
                  <input type="text" value={form.instagram}
                    onChange={e => set('instagram', e.target.value)}
                    className={`${inputCls} pl-8`}
                    placeholder="yourusername" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-800 mb-1.5">Twitter / X Handle</label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-sm">@</span>
                  <input type="text" value={form.twitter}
                    onChange={e => set('twitter', e.target.value)}
                    className={`${inputCls} pl-8`}
                    placeholder="yourusername" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-800 mb-1.5">Highlight Video Link</label>
                <input type="url" value={form.highlightUrl}
                  onChange={e => set('highlightUrl', e.target.value)}
                  className={inputCls}
                  placeholder="https://youtube.com/watch?v=..." />
                <p className="text-gray-400 text-xs mt-1">YouTube, Hudl, or any public video URL.</p>
              </div>
            </div>
          )}

          {/* STEP: review */}
          {step === 'review' && (
            <div className="space-y-4">
              <p className="text-gray-500 text-sm mb-4">Review your information before submitting. You can always edit your profile later from the dashboard.</p>

              {[
                { label: 'Name', value: `${form.firstName} ${form.lastName}` },
                { label: 'Sport', value: form.sport },
                { label: 'Athlete Level', value: form.grade },
                { label: 'Class Year', value: form.classYear },
                { label: 'Position', value: form.position },
                { label: 'Height', value: form.height },
                { label: 'Jersey #', value: form.jerseyNumber },
                { label: 'Team', value: form.teamName },
                { label: 'School', value: form.school },
                { label: 'City', value: form.city },
                { label: 'Descriptor', value: form.descriptor },
                { label: 'Instagram', value: form.instagram ? `@${form.instagram}` : '' },
                { label: 'Twitter', value: form.twitter ? `@${form.twitter}` : '' },
              ].filter(r => r.value).map(row => (
                <div key={row.label} className="flex justify-between text-sm border-b border-gray-100 pb-2">
                  <span className="text-gray-500 font-medium">{row.label}</span>
                  <span className="text-gray-900 font-semibold text-right max-w-[60%]">{row.value}</span>
                </div>
              ))}

              {form.bio && (
                <div className="border-b border-gray-100 pb-2">
                  <p className="text-gray-500 font-medium text-sm mb-1">Bio</p>
                  <p className="text-gray-700 text-sm leading-relaxed line-clamp-3">{form.bio}</p>
                </div>
              )}

              <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mt-4">
                <p className="text-amber-800 text-xs font-semibold">
                  {(sessionStorage.getItem('signup_event_code') || '').trim()
                    ? 'Your profile will be published instantly with your event code.'
                    : 'Your profile will be reviewed by our team and published within 48 hours.'}
                </p>
              </div>
            </div>
          )}

          {/* Navigation buttons */}
          <div className="flex gap-3 mt-8">
            {stepIndex > 0 && (
              <button type="button" onClick={goBack}
                className="flex items-center gap-2 px-5 py-3 border-2 border-gray-200 hover:border-gray-300 rounded-xl text-sm font-semibold text-gray-700 transition-colors">
                <ChevronLeft className="w-4 h-4" />
                Back
              </button>
            )}
            {step !== 'review' ? (
              <button type="button" onClick={handleNext}
                className="flex-1 bg-amber-500 hover:bg-amber-400 text-white font-black py-3 rounded-xl flex items-center justify-center gap-2 transition-colors">
                Continue
                <ChevronRight className="w-4 h-4" />
              </button>
            ) : (
              <button type="button" onClick={handleSubmit} disabled={submitting}
                className="flex-1 bg-amber-500 hover:bg-amber-400 disabled:opacity-50 disabled:cursor-not-allowed text-white font-black py-3 rounded-xl flex items-center justify-center gap-2 transition-colors">
                {submitting ? (
                  <><div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />Creating Profile...</>
                ) : (
                  <>Submit Profile<ArrowRight className="w-5 h-5" /></>
                )}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

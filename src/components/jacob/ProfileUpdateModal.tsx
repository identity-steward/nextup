import { useState } from 'react';
import { X, Send, ChevronDown, ChevronUp, Loader } from 'lucide-react';
import { supabase } from '../../lib/supabase';

interface ProfileUpdateModalProps {
  athleteSlug: string;
  athleteName: string;
  onClose: () => void;
}

type SubmitState = 'idle' | 'submitting' | 'success' | 'error';

const ROLES = [
  'Athlete',
  'Parent / Guardian',
  'Coach',
  'Authorized Representative',
  'Other',
];

export default function ProfileUpdateModal({ athleteSlug, athleteName, onClose }: ProfileUpdateModalProps) {
  const [submitterName, setSubmitterName] = useState('');
  const [submitterRole, setSubmitterRole] = useState('');
  const [submitterEmail, setSubmitterEmail] = useState('');

  const [athleteNameField, setAthleteNameField] = useState('');
  const [classYear, setClassYear] = useState('');
  const [team, setTeam] = useState('');
  const [position, setPosition] = useState('');
  const [school, setSchool] = useState('');
  const [cityState, setCityState] = useState('');
  const [jerseyNumber, setJerseyNumber] = useState('');
  const [height, setHeight] = useState('');
  const [instagram, setInstagram] = useState('');
  const [twitter, setTwitter] = useState('');
  const [bio, setBio] = useState('');
  const [awards, setAwards] = useState('');
  const [correctionNotes, setCorrectionNotes] = useState('');

  const [showOptional, setShowOptional] = useState(false);
  const [submitState, setSubmitState] = useState<SubmitState>('idle');
  const [errorMsg, setErrorMsg] = useState('');

  const hasAnyField =
    athleteNameField || classYear || team || position || school ||
    cityState || jerseyNumber || height || instagram || twitter ||
    bio || awards || correctionNotes;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!submitterName.trim() || !submitterRole || !submitterEmail.trim()) return;
    if (!hasAnyField) {
      setErrorMsg('Please fill in at least one profile field to update.');
      return;
    }
    setErrorMsg('');
    setSubmitState('submitting');

    const { error } = await supabase.from('profile_update_requests').insert({
      athlete_slug: athleteSlug,
      submitted_by_name: submitterName.trim(),
      submitted_by_role: submitterRole,
      submitted_by_email: submitterEmail.trim(),
      field_athlete_name: athleteNameField.trim() || null,
      field_class_year: classYear.trim() || null,
      field_team: team.trim() || null,
      field_position: position.trim() || null,
      field_school: school.trim() || null,
      field_city_state: cityState.trim() || null,
      field_jersey_number: jerseyNumber.trim() || null,
      field_height: height.trim() || null,
      field_social_instagram: instagram.trim() || null,
      field_social_twitter: twitter.trim() || null,
      field_bio: bio.trim() || null,
      field_awards: awards.trim() || null,
      field_correction_notes: correctionNotes.trim() || null,
    });

    if (error) {
      setSubmitState('error');
      setErrorMsg('Something went wrong. Please try again.');
    } else {
      setSubmitState('success');
    }
  };

  const inputClass =
    'w-full bg-white/[0.05] border border-white/10 rounded-xl px-4 py-3 text-white text-sm placeholder:text-white/25 focus:outline-none focus:border-sky-500/50 focus:bg-white/[0.07] transition-all duration-200';

  const labelClass = 'block text-white/50 text-[11px] font-bold uppercase tracking-[0.12em] mb-1.5';

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4"
      style={{ background: 'rgba(5,7,9,0.85)', backdropFilter: 'blur(6px)' }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div
        className="relative w-full sm:max-w-xl max-h-[92vh] overflow-y-auto rounded-t-3xl sm:rounded-3xl"
        style={{ background: '#0c1018', border: '1px solid rgba(255,255,255,0.08)' }}
      >
        {/* Header */}
        <div
          className="sticky top-0 z-10 flex items-center justify-between px-6 py-5"
          style={{ background: '#0c1018', borderBottom: '1px solid rgba(255,255,255,0.06)' }}
        >
          <div>
            <p className="text-white/40 text-[10px] font-black uppercase tracking-[0.18em] mb-0.5">Profile Correction</p>
            <h2 className="text-white font-black text-lg leading-tight">{athleteName}</h2>
          </div>
          <button
            onClick={onClose}
            className="w-9 h-9 flex items-center justify-center rounded-full bg-white/6 hover:bg-white/12 border border-white/8 text-white/50 hover:text-white transition-all duration-200"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {submitState === 'success' ? (
          <div className="px-6 py-16 text-center">
            <div className="w-16 h-16 rounded-full bg-emerald-500/10 border border-emerald-500/25 flex items-center justify-center mx-auto mb-6">
              <Send className="w-7 h-7 text-emerald-400" />
            </div>
            <h3 className="text-white font-black text-2xl mb-3">Request Submitted</h3>
            <p className="text-white/40 text-sm leading-relaxed max-w-xs mx-auto mb-8">
              Thanks for helping keep {athleteName}'s profile accurate. The NextUp team will review your submission before making any changes.
            </p>
            <button
              onClick={onClose}
              className="px-8 py-3 rounded-xl bg-white/8 hover:bg-white/12 border border-white/10 text-white font-bold text-sm transition-all duration-200"
            >
              Close
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="px-6 py-6 space-y-6">
            {/* Submitter info */}
            <div>
              <p className="text-sky-400 text-[10px] font-black uppercase tracking-[0.18em] mb-4">About You</p>
              <div className="space-y-4">
                <div>
                  <label className={labelClass}>Your Name</label>
                  <input
                    type="text"
                    value={submitterName}
                    onChange={(e) => setSubmitterName(e.target.value)}
                    placeholder="Full name"
                    required
                    className={inputClass}
                  />
                </div>
                <div>
                  <label className={labelClass}>Your Role</label>
                  <div className="relative">
                    <select
                      value={submitterRole}
                      onChange={(e) => setSubmitterRole(e.target.value)}
                      required
                      className={`${inputClass} appearance-none pr-10 cursor-pointer`}
                    >
                      <option value="" disabled style={{ background: '#0c1018' }}>Select your relationship</option>
                      {ROLES.map((r) => (
                        <option key={r} value={r} style={{ background: '#0c1018' }}>{r}</option>
                      ))}
                    </select>
                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30 pointer-events-none" />
                  </div>
                </div>
                <div>
                  <label className={labelClass}>Contact Email</label>
                  <input
                    type="email"
                    value={submitterEmail}
                    onChange={(e) => setSubmitterEmail(e.target.value)}
                    placeholder="your@email.com"
                    required
                    className={inputClass}
                  />
                </div>
              </div>
            </div>

            <div className="h-px" style={{ background: 'rgba(255,255,255,0.06)' }} />

            {/* Core profile fields */}
            <div>
              <p className="text-sky-400 text-[10px] font-black uppercase tracking-[0.18em] mb-4">Profile Updates</p>
              <p className="text-white/30 text-xs mb-4 leading-relaxed">
                Only fill in fields that need correction. Leave the rest blank.
              </p>
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className={labelClass}>Athlete Name</label>
                  <input type="text" value={athleteNameField} onChange={(e) => setAthleteNameField(e.target.value)} placeholder="Full name" className={inputClass} />
                </div>
                <div>
                  <label className={labelClass}>Class Year</label>
                  <input type="text" value={classYear} onChange={(e) => setClassYear(e.target.value)} placeholder="e.g. 2028" className={inputClass} />
                </div>
                <div>
                  <label className={labelClass}>Position</label>
                  <input type="text" value={position} onChange={(e) => setPosition(e.target.value)} placeholder="e.g. Guard" className={inputClass} />
                </div>
                <div className="col-span-2">
                  <label className={labelClass}>Team</label>
                  <input type="text" value={team} onChange={(e) => setTeam(e.target.value)} placeholder="Team name" className={inputClass} />
                </div>
                <div className="col-span-2">
                  <label className={labelClass}>School</label>
                  <input type="text" value={school} onChange={(e) => setSchool(e.target.value)} placeholder="School name" className={inputClass} />
                </div>
                <div>
                  <label className={labelClass}>City / State</label>
                  <input type="text" value={cityState} onChange={(e) => setCityState(e.target.value)} placeholder="Memphis, TN" className={inputClass} />
                </div>
                <div>
                  <label className={labelClass}>Jersey #</label>
                  <input type="text" value={jerseyNumber} onChange={(e) => setJerseyNumber(e.target.value)} placeholder="e.g. 23" className={inputClass} />
                </div>
                <div>
                  <label className={labelClass}>Height</label>
                  <input type="text" value={height} onChange={(e) => setHeight(e.target.value)} placeholder='e.g. 5&apos;10"' className={inputClass} />
                </div>
              </div>
            </div>

            {/* Optional expanded fields */}
            <button
              type="button"
              onClick={() => setShowOptional((v) => !v)}
              className="w-full flex items-center justify-between px-4 py-3 rounded-xl bg-white/[0.03] border border-white/8 text-white/50 hover:text-white/70 text-sm font-bold transition-all duration-200"
            >
              <span>Social links, bio & awards</span>
              {showOptional ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>

            {showOptional && (
              <div className="space-y-4">
                <div>
                  <label className={labelClass}>Instagram Handle</label>
                  <input type="text" value={instagram} onChange={(e) => setInstagram(e.target.value)} placeholder="@handle" className={inputClass} />
                </div>
                <div>
                  <label className={labelClass}>Twitter / X Handle</label>
                  <input type="text" value={twitter} onChange={(e) => setTwitter(e.target.value)} placeholder="@handle" className={inputClass} />
                </div>
                <div>
                  <label className={labelClass}>Short Bio</label>
                  <textarea value={bio} onChange={(e) => setBio(e.target.value)} placeholder="Brief description (2–3 sentences)" rows={3} className={`${inputClass} resize-none`} />
                </div>
                <div>
                  <label className={labelClass}>Awards / Highlights</label>
                  <textarea value={awards} onChange={(e) => setAwards(e.target.value)} placeholder="Notable achievements, honors, stats..." rows={3} className={`${inputClass} resize-none`} />
                </div>
              </div>
            )}

            <div className="h-px" style={{ background: 'rgba(255,255,255,0.06)' }} />

            {/* Correction notes */}
            <div>
              <label className={labelClass}>Correction Notes</label>
              <textarea
                value={correctionNotes}
                onChange={(e) => setCorrectionNotes(e.target.value)}
                placeholder="Any additional context or corrections for the NextUp team..."
                rows={3}
                className={`${inputClass} resize-none`}
              />
            </div>

            {errorMsg && (
              <p className="text-red-400 text-xs font-bold">{errorMsg}</p>
            )}

            {/* Disclaimer */}
            <p className="text-white/20 text-[11px] leading-relaxed">
              Submissions are reviewed by the NextUp team before any changes are published. By submitting, you confirm that the information provided is accurate to the best of your knowledge.
            </p>

            <button
              type="submit"
              disabled={submitState === 'submitting'}
              className="w-full flex items-center justify-center gap-2.5 py-4 rounded-2xl font-black text-sm uppercase tracking-[0.08em] text-white transition-all duration-200 disabled:opacity-60"
              style={{
                background: 'linear-gradient(135deg, #0ea5e9, #38bdf8)',
                boxShadow: '0 0 32px rgba(14,165,233,0.35)',
              }}
            >
              {submitState === 'submitting' ? (
                <>
                  <Loader className="w-4 h-4 animate-spin" />
                  Submitting...
                </>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  Submit Update Request
                </>
              )}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}

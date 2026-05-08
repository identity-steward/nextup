import { useState } from 'react';
import { UserPlus, ArrowRight, CheckCircle, AlertCircle } from 'lucide-react';
import { supabase } from '../lib/supabase';

interface CreateAthletePageProps {
  onNavigate?: (page: string, slug?: string) => void;
}

type SubmitState = 'idle' | 'submitting' | 'success' | 'error';

export default function CreateAthletePage({ onNavigate }: CreateAthletePageProps) {
  const [form, setForm] = useState({
    athleteFirstName: '',
    athleteLastName: '',
    sport: '',
    grade: '',
    school: '',
    team: '',
    parentFirstName: '',
    parentLastName: '',
    email: '',
    phone: '',
    city: '',
    supportNeeded: '',
  });
  const [submitState, setSubmitState] = useState<SubmitState>('idle');
  const [errorMsg, setErrorMsg] = useState('');

  const set = (field: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
    setForm((prev) => ({ ...prev, [field]: e.target.value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!form.athleteFirstName.trim() || !form.athleteLastName.trim()) {
      setErrorMsg('Athlete first and last name are required.');
      return;
    }
    if (!form.sport.trim()) {
      setErrorMsg('Sport is required.');
      return;
    }
    if (!form.email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      setErrorMsg('A valid contact email is required.');
      return;
    }

    setSubmitState('submitting');

    const { error } = await supabase.from('athlete_signups').insert([{
      parent_first_name: form.parentFirstName.trim() || form.athleteFirstName.trim(),
      parent_last_name: form.parentLastName.trim() || form.athleteLastName.trim(),
      parent_email: form.email.trim(),
      parent_phone: form.phone.trim() || '',
      athlete_first_name: form.athleteFirstName.trim(),
      athlete_last_name: form.athleteLastName.trim(),
      athlete_grade: form.grade.trim() || '',
      athlete_sport: form.sport.trim(),
      athlete_school: form.school.trim() || null,
      athlete_team: form.team.trim() || null,
      status: 'pending',
    }]);

    if (error) {
      setErrorMsg('Something went wrong. Please try again or email info@NextUpMemphis.com.');
      setSubmitState('error');
    } else {
      setSubmitState('success');
    }
  };

  const inputClass =
    'w-full px-4 py-3 rounded-lg border-2 border-gray-200 focus:border-gold focus:outline-none transition-colors text-navy text-sm';
  const labelClass = 'block text-sm font-semibold text-navy mb-2';

  if (submitState === 'success') {
    return (
      <div className="min-h-screen bg-gray-50 pt-20 flex items-center justify-center px-6">
        <div className="max-w-md w-full text-center bg-white rounded-3xl shadow-lg p-12 border-2 border-gray-100">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-10 h-10 text-green-600" />
          </div>
          <h2 className="text-3xl font-bold text-navy mb-3">Application Submitted!</h2>
          <p className="text-gray-600 leading-relaxed mb-8">
            We'll review your athlete's information and reach out within 48 hours to get their profile set up.
          </p>
          <button
            onClick={() => onNavigate?.('athletes')}
            className="btn-primary px-8 py-3 inline-flex items-center gap-2"
          >
            Browse Athletes
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pt-20">
      <section className="bg-gradient-to-br from-navy via-navy-light to-navy text-white py-16">
        <div className="max-w-4xl mx-auto px-6 lg:px-8 text-center">
          <div className="inline-flex items-center gap-2 bg-gold/20 text-gold px-4 py-2 rounded-full text-sm font-semibold mb-6 border border-gold/30">
            <UserPlus className="w-4 h-4" />
            Free Athlete Profile
          </div>
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            Create Your Athlete Page
          </h1>
          <p className="text-xl text-gray-300 max-w-2xl mx-auto">
            Submit your athlete's info and we'll build their profile. No cost. Parent-managed. Reviewed before publishing.
          </p>
        </div>
      </section>

      <section className="py-16">
        <div className="max-w-2xl mx-auto px-6 lg:px-8">

          {(submitState === 'error' || errorMsg) && (
            <div className="bg-red-50 border-2 border-red-200 rounded-xl p-5 mb-6 flex items-start gap-3">
              <AlertCircle className="w-6 h-6 text-red-600 mt-0.5 flex-shrink-0" />
              <div>
                <p className="font-semibold text-red-900">Submission Failed</p>
                <p className="text-red-700 text-sm">{errorMsg}</p>
              </div>
            </div>
          )}

          <div className="bg-white rounded-3xl shadow-lg p-8 md:p-12 border-2 border-gray-100">
            <form onSubmit={handleSubmit} className="space-y-6">

              {/* Athlete info */}
              <div>
                <p className="text-xs font-black text-gold uppercase tracking-widest mb-4">Athlete Information</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className={labelClass}>First Name *</label>
                    <input type="text" required value={form.athleteFirstName} onChange={set('athleteFirstName')} className={inputClass} placeholder="Jacob" />
                  </div>
                  <div>
                    <label className={labelClass}>Last Name *</label>
                    <input type="text" required value={form.athleteLastName} onChange={set('athleteLastName')} className={inputClass} placeholder="Fouse" />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className={labelClass}>Sport *</label>
                  <input type="text" required value={form.sport} onChange={set('sport')} className={inputClass} placeholder="Basketball" />
                </div>
                <div>
                  <label className={labelClass}>Grade / Class Year</label>
                  <input type="text" value={form.grade} onChange={set('grade')} className={inputClass} placeholder="8th Grade / Class of 2029" />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className={labelClass}>School</label>
                  <input type="text" value={form.school} onChange={set('school')} className={inputClass} placeholder="School name" />
                </div>
                <div>
                  <label className={labelClass}>Team / Club</label>
                  <input type="text" value={form.team} onChange={set('team')} className={inputClass} placeholder="Mid-South 13U AAU" />
                </div>
              </div>

              <div className="h-px bg-gray-100" />

              {/* Parent / contact info */}
              <div>
                <p className="text-xs font-black text-navy uppercase tracking-widest mb-4">Parent / Guardian Contact</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className={labelClass}>First Name</label>
                    <input type="text" value={form.parentFirstName} onChange={set('parentFirstName')} className={inputClass} placeholder="Parent first name" />
                  </div>
                  <div>
                    <label className={labelClass}>Last Name</label>
                    <input type="text" value={form.parentLastName} onChange={set('parentLastName')} className={inputClass} placeholder="Parent last name" />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className={labelClass}>Email *</label>
                  <input type="email" required value={form.email} onChange={set('email')} className={inputClass} placeholder="your@email.com" />
                </div>
                <div>
                  <label className={labelClass}>Phone</label>
                  <input type="tel" value={form.phone} onChange={set('phone')} className={inputClass} placeholder="(901) 555-0000" />
                </div>
              </div>

              {errorMsg && submitState !== 'error' && (
                <p className="text-red-600 text-sm font-semibold">{errorMsg}</p>
              )}

              <p className="text-gray-400 text-xs leading-relaxed border-l-2 border-gold/40 pl-3">
                Athlete information is submitted or confirmed by the athlete, parent/guardian, coach, or authorized representative. NextUp reviews submissions before publishing.
              </p>

              <button
                type="submit"
                disabled={submitState === 'submitting'}
                className="w-full btn-primary px-8 py-4 flex items-center justify-center gap-2 text-lg disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {submitState === 'submitting' ? 'Submitting...' : 'Submit Athlete Profile'}
                {submitState !== 'submitting' && <ArrowRight className="w-5 h-5" />}
              </button>

              <p className="text-center text-gray-400 text-xs">
                Questions? Email{' '}
                <a href="mailto:info@NextUpMemphis.com" className="text-gold hover:underline">
                  info@NextUpMemphis.com
                </a>
              </p>
            </form>
          </div>
        </div>
      </section>
    </div>
  );
}

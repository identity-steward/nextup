import { useState, type ChangeEvent, type FormEvent } from 'react';
import { CheckCircle, Send } from 'lucide-react';
import { supabase } from '../lib/supabase';

type FormState = {
  parentFirstName: string;
  parentLastName: string;
  parentEmail: string;
  parentPhone: string;
  athleteFirstName: string;
  athleteLastName: string;
  athleteAge: string;
  athleteSport: string;
  athleteSchool: string;
  city: string;
  athleteBio: string;
  supportNeeded: string;
  consentGiven: boolean;
};

const initialForm: FormState = {
  parentFirstName: '', parentLastName: '', parentEmail: '', parentPhone: '',
  athleteFirstName: '', athleteLastName: '', athleteAge: '', athleteSport: '',
  athleteSchool: '', city: '', athleteBio: '', supportNeeded: '', consentGiven: false,
};

export function ParentIntakePage() {
  const [form, setForm] = useState<FormState>(initialForm);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const setField = (field: keyof FormState) => (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const value = event.target.type === 'checkbox' ? (event.target as HTMLInputElement).checked : event.target.value;
    setForm((current) => ({ ...current, [field]: value }));
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setSubmitting(true);

    const { error: submitError } = await supabase.from('parent_intake').insert({
      parent_first_name: form.parentFirstName.trim(),
      parent_last_name: form.parentLastName.trim(),
      parent_email: form.parentEmail.trim(),
      parent_phone: form.parentPhone.trim(),
      athlete_first_name: form.athleteFirstName.trim(),
      athlete_last_name: form.athleteLastName.trim(),
      athlete_age: form.athleteAge ? Number(form.athleteAge) : null,
      athlete_sport: form.athleteSport.trim(),
      athlete_school: form.athleteSchool.trim() || null,
      city: form.city.trim() || null,
      athlete_bio: form.athleteBio.trim(),
      support_needed: form.supportNeeded.trim() || null,
      consent_given: form.consentGiven,
      status: 'pending',
    });

    setSubmitting(false);
    if (submitError) {
      setError('We could not submit the intake right now. Please try again shortly.');
      return;
    }
    setSubmitted(true);
  };

  const inputClass = 'w-full rounded-xl border border-gray-200 px-4 py-3 text-navy-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100';
  const labelClass = 'block text-sm font-semibold text-navy-900 mb-2';

  if (submitted) {
    return <div className="min-h-screen bg-gray-50 flex items-center justify-center px-6"><div className="max-w-lg text-center bg-white rounded-2xl border border-gray-200 p-10"><CheckCircle className="w-12 h-12 text-emerald-600 mx-auto mb-5" /><h1 className="text-3xl font-black text-navy-900 mb-3">Thank you for sharing.</h1><p className="text-gray-600 leading-relaxed">Your intake has been received for review. NextUp will follow up using the contact information you provided.</p></div></div>;
  }

  return (
    <div className="min-h-screen bg-gray-50 py-16">
      <div className="max-w-3xl mx-auto px-6 lg:px-8">
        <div className="mb-10"><p className="text-xs font-bold uppercase tracking-widest text-blue-600 mb-3">Parent &amp; Guardian Intake</p><h1 className="text-4xl sm:text-5xl font-black text-navy-900 mb-4">Help us understand the journey.</h1><p className="text-lg text-gray-600 leading-relaxed">Share the essentials once. Our team can review what support, connections, and next steps may fit.</p></div>
        {error && <div className="mb-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">{error}</div>}
        <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-gray-200 p-6 sm:p-8 space-y-8">
          <div><h2 className="text-lg font-black text-navy-900 mb-5">Parent or guardian contact</h2><div className="grid sm:grid-cols-2 gap-5"><div><label className={labelClass}>First name *</label><input required className={inputClass} value={form.parentFirstName} onChange={setField('parentFirstName')} /></div><div><label className={labelClass}>Last name *</label><input required className={inputClass} value={form.parentLastName} onChange={setField('parentLastName')} /></div><div><label className={labelClass}>Email *</label><input required type="email" className={inputClass} value={form.parentEmail} onChange={setField('parentEmail')} /></div><div><label className={labelClass}>Phone</label><input type="tel" className={inputClass} value={form.parentPhone} onChange={setField('parentPhone')} /></div></div></div>
          <div><h2 className="text-lg font-black text-navy-900 mb-5">Young person</h2><div className="grid sm:grid-cols-2 gap-5"><div><label className={labelClass}>First name *</label><input required className={inputClass} value={form.athleteFirstName} onChange={setField('athleteFirstName')} /></div><div><label className={labelClass}>Last name *</label><input required className={inputClass} value={form.athleteLastName} onChange={setField('athleteLastName')} /></div><div><label className={labelClass}>Age</label><input type="number" min="5" max="18" className={inputClass} value={form.athleteAge} onChange={setField('athleteAge')} /></div><div><label className={labelClass}>Sport or activity *</label><input required className={inputClass} value={form.athleteSport} onChange={setField('athleteSport')} /></div><div><label className={labelClass}>School</label><input className={inputClass} value={form.athleteSchool} onChange={setField('athleteSchool')} /></div><div><label className={labelClass}>City</label><input className={inputClass} value={form.city} onChange={setField('city')} /></div></div></div>
          <div><label className={labelClass}>Tell us about their journey</label><textarea rows={5} className={inputClass} value={form.athleteBio} onChange={setField('athleteBio')} /><label className={`${labelClass} mt-5`}>What support would be helpful?</label><textarea rows={4} className={inputClass} value={form.supportNeeded} onChange={setField('supportNeeded')} /></div>
          <label className="flex items-start gap-3 text-sm text-gray-600"><input required type="checkbox" checked={form.consentGiven} onChange={setField('consentGiven')} className="mt-1 h-4 w-4 accent-blue-600" /><span>I confirm I am authorized to share this information for NextUp to review this intake.</span></label>
          <button type="submit" disabled={submitting} className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold px-6 py-4 transition-colors disabled:opacity-50"><Send className="w-5 h-5" />{submitting ? 'Submitting...' : 'Submit intake'}</button>
        </form>
      </div>
    </div>
  );
}

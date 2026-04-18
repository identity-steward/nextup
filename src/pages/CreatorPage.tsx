import { Video, Camera, CreditCard as Edit, Users, ArrowRight, CheckCircle, AlertCircle } from 'lucide-react';
import { useState } from 'react';
import { supabase } from '../lib/supabase';

const roles = [
  {
    icon: Video,
    title: 'Videographer',
    description: 'Capture game footage and highlight moments',
  },
  {
    icon: Edit,
    title: 'Editor',
    description: 'Create compelling highlight reels and content',
  },
  {
    icon: Camera,
    title: 'Photographer',
    description: 'Document athletic moments through photos',
  },
  {
    icon: Users,
    title: 'Social Media',
    description: 'Help share athlete stories across platforms',
  },
];

const SPECIALTY_OPTIONS = ['Videography', 'Editing', 'Photography', 'Social Media', 'Graphic Design', 'Writing'];

export default function CreatorPage() {
  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    location: '',
    instagramHandle: '',
    portfolioUrl: '',
    specialties: '',
    experience: '',
  });
  const [submitting, setSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [showError, setShowError] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setShowError(false);
    setErrorMessage('');

    if (!form.firstName.trim() || !form.lastName.trim()) {
      setShowError(true);
      setErrorMessage('First and last name are required.');
      return;
    }
    if (!form.email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      setShowError(true);
      setErrorMessage('A valid email address is required.');
      return;
    }
    if (!form.location.trim()) {
      setShowError(true);
      setErrorMessage('Location is required.');
      return;
    }
    if (!form.specialties) {
      setShowError(true);
      setErrorMessage('Please select a primary specialty.');
      return;
    }
    if (!form.experience.trim()) {
      setShowError(true);
      setErrorMessage('Please describe your experience.');
      return;
    }

    setSubmitting(true);

    try {
      const { error } = await supabase.from('creator_applications').insert([{
        first_name: form.firstName,
        last_name: form.lastName,
        email: form.email,
        phone: form.phone || null,
        location: form.location,
        instagram_handle: form.instagramHandle || null,
        portfolio_url: form.portfolioUrl || null,
        specialties: form.specialties,
        experience: form.experience,
        status: 'pending',
      }]);

      if (error) throw error;

      setShowSuccess(true);
      setForm({
        firstName: '', lastName: '', email: '', phone: '', location: '',
        instagramHandle: '', portfolioUrl: '', specialties: '', experience: '',
      });
      setTimeout(() => setShowSuccess(false), 6000);
    } catch (err) {
      console.error('CreatorPage application error:', err);
      setShowError(true);
      setErrorMessage(err instanceof Error ? err.message : 'Failed to submit. Please try again.');
      setTimeout(() => setShowError(false), 6000);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 pt-20">
      <section className="bg-navy text-white py-16">
        <div className="max-w-4xl mx-auto px-6 lg:px-8 text-center">
          <div className="inline-flex items-center gap-2 bg-gold/20 text-gold px-4 py-2 rounded-full text-sm font-semibold mb-6 border border-gold/30">
            <Video className="w-4 h-4" />
            Join the Team
          </div>
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Become a NextUp Creator</h1>
          <p className="text-xl text-gray-300">
            Help document the journey of young athletes in Memphis
          </p>
        </div>
      </section>

      <section className="py-16">
        <div className="max-w-6xl mx-auto px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-navy mb-4">
              What We're Looking For
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Passionate creators who want to tell the stories of Memphis youth athletes
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
            {roles.map((role, index) => {
              const Icon = role.icon;
              return (
                <div
                  key={index}
                  className="bg-white rounded-2xl p-8 shadow-lg border-2 border-gray-100 hover:border-gold/30 transition-all"
                >
                  <div className="w-14 h-14 bg-gold/20 rounded-xl flex items-center justify-center mb-4">
                    <Icon className="w-7 h-7 text-gold" />
                  </div>
                  <h3 className="text-xl font-bold text-navy mb-2">{role.title}</h3>
                  <p className="text-gray-600">{role.description}</p>
                </div>
              );
            })}
          </div>

          <div className="bg-white rounded-3xl shadow-lg p-8 md:p-12 border-2 border-gray-100 max-w-3xl mx-auto">
            <h3 className="text-2xl font-bold text-navy mb-2">Apply to Join</h3>
            <p className="text-gray-600 mb-8">Tell us about yourself and how you'd like to contribute to the NextUp Memphis community.</p>

            {showSuccess && (
              <div className="bg-green-50 border-2 border-green-200 rounded-xl p-5 mb-6 flex items-start gap-3">
                <CheckCircle className="w-6 h-6 text-green-600 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="font-semibold text-green-900">Application Received!</p>
                  <p className="text-green-700 text-sm">We'll review your application and be in touch within 48 hours.</p>
                </div>
              </div>
            )}

            {showError && (
              <div className="bg-red-50 border-2 border-red-200 rounded-xl p-5 mb-6 flex items-start gap-3">
                <AlertCircle className="w-6 h-6 text-red-600 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="font-semibold text-red-900">Submission Failed</p>
                  <p className="text-red-700 text-sm">{errorMessage}</p>
                </div>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-navy mb-2">First Name *</label>
                  <input
                    type="text"
                    name="firstName"
                    required
                    value={form.firstName}
                    onChange={handleChange}
                    className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-gold focus:outline-none transition-colors"
                    placeholder="Marcus"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-navy mb-2">Last Name *</label>
                  <input
                    type="text"
                    name="lastName"
                    required
                    value={form.lastName}
                    onChange={handleChange}
                    className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-gold focus:outline-none transition-colors"
                    placeholder="Johnson"
                  />
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-navy mb-2">Email *</label>
                  <input
                    type="email"
                    name="email"
                    required
                    value={form.email}
                    onChange={handleChange}
                    className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-gold focus:outline-none transition-colors"
                    placeholder="you@email.com"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-navy mb-2">Phone</label>
                  <input
                    type="tel"
                    name="phone"
                    value={form.phone}
                    onChange={handleChange}
                    className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-gold focus:outline-none transition-colors"
                    placeholder="(901) 555-0100"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-navy mb-2">Location *</label>
                <input
                  type="text"
                  name="location"
                  required
                  value={form.location}
                  onChange={handleChange}
                  className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-gold focus:outline-none transition-colors"
                  placeholder="Memphis, TN"
                />
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-navy mb-2">Instagram Handle</label>
                  <input
                    type="text"
                    name="instagramHandle"
                    value={form.instagramHandle}
                    onChange={handleChange}
                    className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-gold focus:outline-none transition-colors"
                    placeholder="@yourhandle"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-navy mb-2">Portfolio URL</label>
                  <input
                    type="url"
                    name="portfolioUrl"
                    value={form.portfolioUrl}
                    onChange={handleChange}
                    className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-gold focus:outline-none transition-colors"
                    placeholder="https://yourportfolio.com"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-navy mb-2">Primary Specialty *</label>
                <select
                  name="specialties"
                  required
                  value={form.specialties}
                  onChange={handleChange}
                  className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-gold focus:outline-none transition-colors bg-white"
                >
                  <option value="">Select your primary skill</option>
                  {SPECIALTY_OPTIONS.map((s) => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-navy mb-2">Tell us about your experience *</label>
                <textarea
                  name="experience"
                  required
                  rows={5}
                  value={form.experience}
                  onChange={handleChange}
                  className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-gold focus:outline-none transition-colors resize-none"
                  placeholder="Describe your background, previous work, and why you want to cover youth athletes..."
                />
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full btn-primary px-8 py-4 inline-flex items-center justify-center gap-2 text-lg disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {submitting ? 'Submitting...' : 'Submit Application'}
                {!submitting && <ArrowRight className="w-5 h-5" />}
              </button>
            </form>
          </div>
        </div>
      </section>
    </div>
  );
}

import { Heart, Building2, Mail, User, CheckCircle, AlertCircle } from 'lucide-react';
import { useState } from 'react';
import { supabase } from '../lib/supabase';
import { STRIPE_LINKS } from '../config/stripeLinks';

interface SupportPageProps {
  onNavigate?: (page: string) => void;
}

export default function SupportPage({ onNavigate }: SupportPageProps) {
  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    companyName: '',
    email: '',
    interests: '',
  });
  const [submitting, setSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [showError, setShowError] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
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

    setSubmitting(true);

    try {
      const { error } = await supabase.from('supporter_signups').insert([{
        first_name: form.firstName,
        last_name: form.lastName,
        email: form.email,
        phone: null,
        support_type: 'corporate_sponsor',
        preferred_athlete: form.companyName || null,
        message: form.interests || null,
        marketing_consent: false,
        status: 'pending',
      }]);

      if (error) throw error;

      setShowSuccess(true);
      setForm({ firstName: '', lastName: '', companyName: '', email: '', interests: '' });
      setTimeout(() => setShowSuccess(false), 6000);
    } catch (err) {
      console.error('SupportPage sponsorship submission error:', err);
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
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="flex items-center gap-2 mb-4">
            <Heart className="w-8 h-8 text-gold" />
            <h1 className="text-4xl md:text-5xl font-bold">Support NextUp Memphis</h1>
          </div>
          <p className="text-xl text-gray-300 max-w-3xl">
            Help us empower young athletes by providing the resources, visibility, and opportunities they need to succeed.
          </p>
        </div>
      </section>

      <section id="tiers" className="py-16 bg-white scroll-mt-20">
        <div className="max-w-4xl mx-auto px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-navy mb-4">Support Tiers</h2>
            <p className="text-lg text-gray-600">
              Choose a support level that works for you. All contributions go directly to helping athletes succeed.
            </p>
          </div>

          <div className="space-y-6">
            <div className="bg-white rounded-2xl p-8 shadow-lg border-2 border-gray-200 hover:border-gold/50 transition-colors">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="text-2xl font-bold text-navy mb-2">Starter Support Team</h3>
                  <p className="text-gray-600">Perfect for individuals wanting to make a consistent impact</p>
                </div>
                <div className="text-right">
                  <div className="text-3xl font-bold text-navy">$5</div>
                  <div className="text-sm text-gray-600">/month</div>
                </div>
              </div>
              <ul className="space-y-2 mb-6">
                <li className="flex items-start gap-2">
                  <div className="w-1.5 h-1.5 bg-gold rounded-full mt-2"></div>
                  <span className="text-gray-700">Help cover basics like team fees and small gear</span>
                </li>
                <li className="flex items-start gap-2">
                  <div className="w-1.5 h-1.5 bg-gold rounded-full mt-2"></div>
                  <span className="text-gray-700">Weekly game updates + quick highlight clips</span>
                </li>
              </ul>
              {STRIPE_LINKS.SUPPORT_JACOB_5 ? (
                <a href={STRIPE_LINKS.SUPPORT_JACOB_5} className="btn-secondary px-6 py-3 block text-center rounded-xl">
                  Join Support Team — $5/month
                </a>
              ) : (
                <button disabled className="btn-secondary px-6 py-3 block text-center rounded-xl w-full opacity-50 cursor-not-allowed">Coming Soon</button>
              )}
            </div>

            <div className="bg-white rounded-2xl p-8 shadow-lg border-2 border-gold">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <div className="inline-block bg-gold text-navy text-xs font-bold px-3 py-1 rounded-full mb-2">
                    MOST POPULAR
                  </div>
                  <h3 className="text-2xl font-bold text-navy mb-2">Season Builder</h3>
                  <p className="text-gray-600">For supporters who want to make a bigger difference</p>
                </div>
                <div className="text-right">
                  <div className="text-3xl font-bold text-navy">$10</div>
                  <div className="text-sm text-gray-600">/month</div>
                </div>
              </div>
              <ul className="space-y-2 mb-6">
                <li className="flex items-start gap-2">
                  <div className="w-1.5 h-1.5 bg-gold rounded-full mt-2"></div>
                  <span className="text-gray-700">Boost training, travel, and development sessions</span>
                </li>
                <li className="flex items-start gap-2">
                  <div className="w-1.5 h-1.5 bg-gold rounded-full mt-2"></div>
                  <span className="text-gray-700">Behind-the-scenes updates + early access to highlight reels</span>
                </li>
              </ul>
              {STRIPE_LINKS.SUPPORT_JACOB_10 ? (
                <a href={STRIPE_LINKS.SUPPORT_JACOB_10} className="btn-primary px-6 py-3 block text-center rounded-xl">
                  Season Builder — $10/month
                </a>
              ) : (
                <button disabled className="btn-primary px-6 py-3 block text-center rounded-xl w-full opacity-50 cursor-not-allowed">Coming Soon</button>
              )}
            </div>
          </div>

          <div className="mt-12 text-center">
            <button
              onClick={() => onNavigate?.('athletes')}
              className="btn-primary px-8 py-4 text-lg"
            >
              Choose an Athlete to Support
            </button>
          </div>
        </div>
      </section>

      <section className="py-16 bg-gray-50">
        <div className="max-w-2xl mx-auto px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-navy mb-4">Request Sponsorship Information</h2>
            <p className="text-lg text-gray-600">
              Interested in becoming a corporate sponsor? Fill out the form below and we'll get in touch.
            </p>
          </div>

          {showSuccess && (
            <div className="bg-green-50 border-2 border-green-200 rounded-xl p-5 mb-6 flex items-start gap-3">
              <CheckCircle className="w-6 h-6 text-green-600 mt-0.5 flex-shrink-0" />
              <div>
                <p className="font-semibold text-green-900">Request Submitted!</p>
                <p className="text-green-700 text-sm">We'll review your inquiry and reach out within 48 hours.</p>
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

          <form onSubmit={handleSubmit} className="space-y-6 bg-white rounded-2xl p-8">
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold text-navy mb-2">
                  First Name *
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <User className="w-5 h-5 text-gray-400" />
                  </div>
                  <input
                    type="text"
                    name="firstName"
                    required
                    value={form.firstName}
                    onChange={handleChange}
                    className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:border-gold focus:outline-none transition-colors bg-white"
                    placeholder="John"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-navy mb-2">
                  Last Name *
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <User className="w-5 h-5 text-gray-400" />
                  </div>
                  <input
                    type="text"
                    name="lastName"
                    required
                    value={form.lastName}
                    onChange={handleChange}
                    className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:border-gold focus:outline-none transition-colors bg-white"
                    placeholder="Doe"
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-navy mb-2">
                Company Name
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Building2 className="w-5 h-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  name="companyName"
                  value={form.companyName}
                  onChange={handleChange}
                  className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:border-gold focus:outline-none transition-colors bg-white"
                  placeholder="Your Company"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-navy mb-2">
                Email Address *
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Mail className="w-5 h-5 text-gray-400" />
                </div>
                <input
                  type="email"
                  name="email"
                  required
                  value={form.email}
                  onChange={handleChange}
                  className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:border-gold focus:outline-none transition-colors bg-white"
                  placeholder="you@company.com"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-navy mb-2">
                Tell us about your sponsorship interests
              </label>
              <textarea
                name="interests"
                rows={5}
                value={form.interests}
                onChange={handleChange}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-gold focus:outline-none transition-colors bg-white resize-none"
                placeholder="Let us know what you're interested in and we'll reach out to discuss opportunities..."
              />
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full btn-primary py-4 text-lg disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {submitting ? 'Submitting...' : 'Submit Request'}
            </button>
          </form>
        </div>
      </section>
    </div>
  );
}

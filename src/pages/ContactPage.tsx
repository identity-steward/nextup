import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail, User, Building2, MessageSquare, Send, CheckCircle, AlertCircle, Heart, ArrowRight, HelpCircle } from 'lucide-react';
import { supabase } from '../lib/supabase';

const inquiryTypes = [
  { value: 'general', label: 'General Question' },
  { value: 'partnership', label: 'Partnership / Sponsorship' },
  { value: 'athlete', label: 'Athlete / Family Inquiry' },
  { value: 'media', label: 'Media / Press' },
];

export function ContactPage() {
  const [form, setForm] = useState({
    name: '',
    email: '',
    organization: '',
    inquiryType: 'general',
    message: '',
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

    if (!form.name.trim()) {
      setShowError(true);
      setErrorMessage('Your name is required.');
      return;
    }
    if (!form.email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      setShowError(true);
      setErrorMessage('A valid email address is required.');
      return;
    }
    if (!form.message.trim()) {
      setShowError(true);
      setErrorMessage('Please tell us what you need.');
      return;
    }

    setSubmitting(true);

    try {
      const { error } = await supabase.from('supporter_signups').insert([{
        first_name: form.name.trim(),
        last_name: '',
        email: form.email.trim(),
        phone: null,
        support_type: form.inquiryType,
        preferred_athlete: form.organization || null,
        message: form.message.trim(),
        marketing_consent: false,
        status: 'pending',
      }]);

      if (error) throw error;

      setShowSuccess(true);
      setForm({ name: '', email: '', organization: '', inquiryType: 'general', message: '' });
      setTimeout(() => setShowSuccess(false), 6000);
    } catch (err) {
      console.error('ContactPage submission error:', err);
      setShowError(true);
      setErrorMessage('Something went wrong. Please try again or email us directly.');
      setTimeout(() => setShowError(false), 6000);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <section className="bg-navy text-white py-16 lg:py-20">
        <div className="max-w-4xl mx-auto px-6 lg:px-8">
          <div className="flex items-center gap-2 mb-4">
            <Mail className="w-8 h-8 text-gold" />
            <h1 className="text-4xl md:text-5xl font-bold">Contact NextUp Memphis</h1>
          </div>
          <p className="text-xl text-gray-300 max-w-2xl">
            Questions, partnership ideas, or want to learn more about NextUp? Send us a message and we'll get back to you.
          </p>
        </div>
      </section>

      <section className="py-16">
        <div className="max-w-6xl mx-auto px-6 lg:px-8">
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Contact info sidebar */}
            <div className="lg:col-span-1 space-y-6">
              <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm">
                <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mb-4">
                  <Mail className="w-6 h-6 text-blue-600" />
                </div>
                <h3 className="text-lg font-bold text-navy-900 mb-2">Email</h3>
                <p className="text-sm text-gray-600 mb-3">Reach out directly and we'll respond within 48 hours.</p>
                <a href="mailto:info@NextUpMemphis.com" className="text-blue-600 font-semibold text-sm hover:underline">
                  info@NextUpMemphis.com
                </a>
              </div>

              <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm">
                <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mb-4">
                  <Heart className="w-6 h-6 text-blue-600" />
                </div>
                <h3 className="text-lg font-bold text-navy-900 mb-2">Support an Athlete</h3>
                <p className="text-sm text-gray-600 mb-4">Browse athlete profiles and join a support team.</p>
                <Link to="/youth" className="inline-flex items-center gap-2 text-sm font-bold text-blue-600">
                  Explore Athletes
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>

              <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm">
                <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mb-4">
                  <HelpCircle className="w-6 h-6 text-blue-600" />
                </div>
                <h3 className="text-lg font-bold text-navy-900 mb-2">How It Works</h3>
                <p className="text-sm text-gray-600 mb-4">Learn about the NextUp model and what's available today.</p>
                <Link to="/how-it-works" className="inline-flex items-center gap-2 text-sm font-bold text-blue-600">
                  Read More
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>

            {/* Form */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-2xl p-8 border border-gray-200 shadow-sm">
                <h2 className="text-2xl font-bold text-navy-900 mb-2">Send a Message</h2>
                <p className="text-sm text-gray-500 mb-6">Fill out the form below and we'll review your inquiry.</p>

                {showSuccess && (
                  <div className="bg-green-50 border-2 border-green-200 rounded-xl p-5 mb-6 flex items-start gap-3">
                    <CheckCircle className="w-6 h-6 text-green-600 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="font-semibold text-green-900">Message Sent</p>
                      <p className="text-green-700 text-sm">Thank you for reaching out. We'll review your message and respond within 48 hours.</p>
                    </div>
                  </div>
                )}

                {showError && (
                  <div className="bg-red-50 border-2 border-red-200 rounded-xl p-5 mb-6 flex items-start gap-3">
                    <AlertCircle className="w-6 h-6 text-red-600 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="font-semibold text-red-900">Something Went Wrong</p>
                      <p className="text-red-700 text-sm">{errorMessage}</p>
                    </div>
                  </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-5">
                  <div className="grid md:grid-cols-2 gap-5">
                    <div>
                      <label className="block text-sm font-semibold text-navy-900 mb-2">Your Name *</label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                          <User className="w-5 h-5 text-gray-400" />
                        </div>
                        <input
                          type="text"
                          name="name"
                          required
                          value={form.name}
                          onChange={handleChange}
                          className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none transition-colors bg-white"
                          placeholder="Jane Doe"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-navy-900 mb-2">Email Address *</label>
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
                          className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none transition-colors bg-white"
                          placeholder="jane@example.com"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-5">
                    <div>
                      <label className="block text-sm font-semibold text-navy-900 mb-2">Organization (optional)</label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                          <Building2 className="w-5 h-5 text-gray-400" />
                        </div>
                        <input
                          type="text"
                          name="organization"
                          value={form.organization}
                          onChange={handleChange}
                          className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none transition-colors bg-white"
                          placeholder="Your organization"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-navy-900 mb-2">Inquiry Type</label>
                      <select
                        name="inquiryType"
                        value={form.inquiryType}
                        onChange={handleChange}
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none transition-colors bg-white text-navy-900"
                      >
                        {inquiryTypes.map((type) => (
                          <option key={type.value} value={type.value}>{type.label}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-navy-900 mb-2">Message *</label>
                    <div className="relative">
                      <div className="absolute top-4 left-4 pointer-events-none">
                        <MessageSquare className="w-5 h-5 text-gray-400" />
                      </div>
                      <textarea
                        name="message"
                        required
                        rows={5}
                        value={form.message}
                        onChange={handleChange}
                        className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none transition-colors bg-white resize-none"
                        placeholder="Tell us what you'd like to discuss..."
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={submitting}
                    className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-4 rounded-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {submitting ? 'Sending...' : (
                      <>
                        <Send className="w-5 h-5" />
                        Send Message
                      </>
                    )}
                  </button>
                </form>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

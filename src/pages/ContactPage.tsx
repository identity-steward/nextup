import { MessageSquare, Mail, Phone, User, CheckCircle, AlertCircle } from 'lucide-react';
import { useState } from 'react';
import { supabase } from '../lib/supabase';

interface ContactPageProps {
  onNavigate?: (page: string) => void;
}

export default function ContactPage({ onNavigate }: ContactPageProps) {
  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    message: '',
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
    if (!form.message.trim()) {
      setShowError(true);
      setErrorMessage('Please enter a message before submitting.');
      return;
    }

    setSubmitting(true);

    try {
      const { error } = await supabase.from('team_inquiries').insert([{
        contact_first_name: form.firstName,
        contact_last_name: form.lastName,
        contact_email: form.email,
        contact_phone: form.phone || null,
        role: 'general',
        school_name: null,
        team_name: 'General Inquiry',
        sport: 'N/A',
        num_athletes: null,
        message: form.message,
        status: 'pending',
      }]);

      if (error) throw error;

      setShowSuccess(true);
      setForm({ firstName: '', lastName: '', email: '', phone: '', message: '' });
      setTimeout(() => setShowSuccess(false), 6000);
    } catch (err) {
      console.error('ContactPage submission error:', err);
      setShowError(true);
      setErrorMessage(err instanceof Error ? err.message : 'Failed to send message. Please try again.');
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
            <MessageSquare className="w-8 h-8 text-gold" />
            <h1 className="text-4xl md:text-5xl font-bold">Contact Us</h1>
          </div>
          <p className="text-xl text-gray-300 max-w-3xl">
            Have questions or want to schedule a conversation? We'd love to hear from you.
          </p>
        </div>
      </section>

      <section className="py-16">
        <div className="max-w-2xl mx-auto px-6 lg:px-8">
          {showSuccess && (
            <div className="bg-green-50 border-2 border-green-200 rounded-xl p-5 mb-6 flex items-start gap-3">
              <CheckCircle className="w-6 h-6 text-green-600 mt-0.5 flex-shrink-0" />
              <div>
                <p className="font-semibold text-green-900">Message Sent!</p>
                <p className="text-green-700 text-sm">We'll get back to you within 48 hours.</p>
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

          <div className="bg-white rounded-2xl shadow-xl p-8">
            <h3 className="text-2xl font-bold text-navy mb-6">Get in Touch</h3>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-navy mb-2">
                    First Name *
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <User className="w-4 h-4 text-gray-400" />
                    </div>
                    <input
                      type="text"
                      name="firstName"
                      required
                      value={form.firstName}
                      onChange={handleChange}
                      className="w-full pl-10 pr-3 py-2.5 border-2 border-gray-200 rounded-lg focus:border-gold focus:outline-none transition-colors text-sm"
                      placeholder="John"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-navy mb-2">
                    Last Name *
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <User className="w-4 h-4 text-gray-400" />
                    </div>
                    <input
                      type="text"
                      name="lastName"
                      required
                      value={form.lastName}
                      onChange={handleChange}
                      className="w-full pl-10 pr-3 py-2.5 border-2 border-gray-200 rounded-lg focus:border-gold focus:outline-none transition-colors text-sm"
                      placeholder="Doe"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-navy mb-2">
                  Email Address *
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Mail className="w-4 h-4 text-gray-400" />
                  </div>
                  <input
                    type="email"
                    name="email"
                    required
                    value={form.email}
                    onChange={handleChange}
                    className="w-full pl-10 pr-3 py-2.5 border-2 border-gray-200 rounded-lg focus:border-gold focus:outline-none transition-colors text-sm"
                    placeholder="you@example.com"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-navy mb-2">
                  Phone Number
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Phone className="w-4 h-4 text-gray-400" />
                  </div>
                  <input
                    type="tel"
                    name="phone"
                    value={form.phone}
                    onChange={handleChange}
                    className="w-full pl-10 pr-3 py-2.5 border-2 border-gray-200 rounded-lg focus:border-gold focus:outline-none transition-colors text-sm"
                    placeholder="(555) 123-4567"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-navy mb-2">
                  How can we help? *
                </label>
                <textarea
                  name="message"
                  required
                  rows={4}
                  value={form.message}
                  onChange={handleChange}
                  className="w-full px-3 py-2.5 border-2 border-gray-200 rounded-lg focus:border-gold focus:outline-none transition-colors resize-none text-sm"
                  placeholder="Tell us what you'd like to discuss..."
                />
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full btn-primary py-3 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {submitting ? 'Sending...' : 'Send Message'}
              </button>
            </form>
          </div>

          <div className="mt-8 text-center">
            <p className="text-gray-600 mb-4">
              Or email us directly at <a href="mailto:kenneth@flmlifestyle.com" className="text-gold hover:underline font-semibold">kenneth@flmlifestyle.com</a>
            </p>
            <button
              onClick={() => onNavigate?.('athletes')}
              className="btn-secondary px-8 py-3 inline-flex items-center gap-2"
            >
              View Athletes
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}

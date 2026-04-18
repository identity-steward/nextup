import { useState } from 'react';
import { UserPlus, CheckCircle, AlertCircle } from 'lucide-react';
import { supabase } from '../lib/supabase';
import Header from '../components/Header';
import Footer from '../components/Footer';

interface ParentIntakePageProps {
  onNavigate?: (page: string) => void;
}

export default function ParentIntakePage({ onNavigate }: ParentIntakePageProps) {
  const [submitting, setSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [showError, setShowError] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const [form, setForm] = useState({
    parentFirstName: '',
    parentLastName: '',
    athleteFirstName: '',
    athleteLastName: '',
    athleteAge: '',
    athleteGrade: '',
    sport: '',
    school: '',
    team: '',
    parentEmail: '',
    parentPhone: '',
    city: '',
    supportNeeded: '',
    consentGiven: false,
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const target = e.target;
    const value = target.type === 'checkbox' ? (target as HTMLInputElement).checked : target.value;
    const name = target.name;

    setForm({
      ...form,
      [name]: value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!form.consentGiven) {
      setShowError(true);
      setErrorMessage('You must agree to the terms and conditions to submit this form.');
      setTimeout(() => setShowError(false), 5000);
      return;
    }

    setSubmitting(true);
    setShowError(false);
    setErrorMessage('');

    try {
      const { error } = await supabase.from('parent_intake').insert([
        {
          parent_first_name: form.parentFirstName,
          parent_last_name: form.parentLastName,
          parent_email: form.parentEmail,
          parent_phone: form.parentPhone,
          athlete_first_name: form.athleteFirstName,
          athlete_last_name: form.athleteLastName,
          athlete_age: parseInt(form.athleteAge),
          athlete_grade: form.athleteGrade,
          athlete_sport: form.sport,
          athlete_school: form.school || null,
          athlete_team: form.team || null,
          athlete_bio: '',
          city: form.city,
          support_needed: form.supportNeeded,
          consent_given: form.consentGiven,
          status: 'pending',
        },
      ]);

      if (error) {
        throw error;
      }

      setShowSuccess(true);
      setForm({
        parentFirstName: '',
        parentLastName: '',
        athleteFirstName: '',
        athleteLastName: '',
        athleteAge: '',
        athleteGrade: '',
        sport: '',
        school: '',
        team: '',
        parentEmail: '',
        parentPhone: '',
        city: '',
        supportNeeded: '',
        consentGiven: false,
      });
      setTimeout(() => setShowSuccess(false), 5000);
    } catch (error) {
      console.error('Error submitting parent intake:', error);
      setShowError(true);
      setErrorMessage(error instanceof Error ? error.message : 'Failed to submit form. Please try again.');
      setTimeout(() => setShowError(false), 5000);
    } finally {
      setSubmitting(false);
    }
  };

  const handleNavigation = (page: string) => {
    if (onNavigate) {
      onNavigate(page);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-navy via-navy-light to-navy">
      <Header onNavigate={handleNavigation} />

      <main className="pt-32 pb-24">
        <div className="max-w-4xl mx-auto px-6">
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
              Parent Intake Form
            </h1>
            <p className="text-xl text-gray-300 max-w-2xl mx-auto">
              Tell us about your athlete and how we can support their journey. We'll review your submission and reach out within 48 hours.
            </p>
          </div>

          {showSuccess && (
            <div className="bg-green-50 border-2 border-green-200 rounded-xl p-6 mb-8 flex items-start gap-3">
              <CheckCircle className="w-6 h-6 text-green-600 mt-0.5 flex-shrink-0" />
              <div>
                <p className="font-semibold text-green-900 text-lg">Form Submitted Successfully!</p>
                <p className="text-green-700">We'll review your information and contact you within 48 hours.</p>
              </div>
            </div>
          )}

          {showError && (
            <div className="bg-red-50 border-2 border-red-200 rounded-xl p-6 mb-8 flex items-start gap-3">
              <AlertCircle className="w-6 h-6 text-red-600 mt-0.5 flex-shrink-0" />
              <div>
                <p className="font-semibold text-red-900 text-lg">Submission Failed</p>
                <p className="text-red-700">{errorMessage}</p>
              </div>
            </div>
          )}

          <div className="bg-white rounded-2xl shadow-2xl p-8 md:p-12">
            <form onSubmit={handleSubmit}>
              <div className="border-b border-gray-200 pb-6 mb-6">
                <h3 className="text-lg font-semibold text-navy mb-4">Parent / Guardian Information</h3>

                <div className="grid md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <label htmlFor="parentFirstName" className="block text-sm font-semibold text-navy mb-2">
                      First Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      id="parentFirstName"
                      name="parentFirstName"
                      type="text"
                      required
                      value={form.parentFirstName}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-gold focus:outline-none transition-colors bg-white"
                      placeholder="John"
                    />
                  </div>

                  <div>
                    <label htmlFor="parentLastName" className="block text-sm font-semibold text-navy mb-2">
                      Last Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      id="parentLastName"
                      name="parentLastName"
                      type="text"
                      required
                      value={form.parentLastName}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-gold focus:outline-none transition-colors bg-white"
                      placeholder="Doe"
                    />
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <label htmlFor="parentEmail" className="block text-sm font-semibold text-navy mb-2">
                      Email <span className="text-red-500">*</span>
                    </label>
                    <input
                      id="parentEmail"
                      name="parentEmail"
                      type="email"
                      required
                      value={form.parentEmail}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-gold focus:outline-none transition-colors bg-white"
                      placeholder="john.doe@email.com"
                    />
                  </div>

                  <div>
                    <label htmlFor="parentPhone" className="block text-sm font-semibold text-navy mb-2">
                      Phone <span className="text-red-500">*</span>
                    </label>
                    <input
                      id="parentPhone"
                      name="parentPhone"
                      type="tel"
                      required
                      value={form.parentPhone}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-gold focus:outline-none transition-colors bg-white"
                      placeholder="(555) 123-4567"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="city" className="block text-sm font-semibold text-navy mb-2">
                    City <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="city"
                    name="city"
                    type="text"
                    required
                    value={form.city}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-gold focus:outline-none transition-colors bg-white"
                    placeholder="Memphis"
                  />
                </div>
              </div>

              <div className="border-b border-gray-200 pb-6 mb-6">
                <h3 className="text-lg font-semibold text-navy mb-4">Athlete Information</h3>

                <div className="grid md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <label htmlFor="athleteFirstName" className="block text-sm font-semibold text-navy mb-2">
                      Athlete First Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      id="athleteFirstName"
                      name="athleteFirstName"
                      type="text"
                      required
                      value={form.athleteFirstName}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-gold focus:outline-none transition-colors bg-white"
                      placeholder="Jacob"
                    />
                  </div>

                  <div>
                    <label htmlFor="athleteLastName" className="block text-sm font-semibold text-navy mb-2">
                      Athlete Last Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      id="athleteLastName"
                      name="athleteLastName"
                      type="text"
                      required
                      value={form.athleteLastName}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-gold focus:outline-none transition-colors bg-white"
                      placeholder="Fouse"
                    />
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <label htmlFor="athleteAge" className="block text-sm font-semibold text-navy mb-2">
                      Age <span className="text-red-500">*</span>
                    </label>
                    <input
                      id="athleteAge"
                      name="athleteAge"
                      type="number"
                      min="5"
                      max="18"
                      required
                      value={form.athleteAge}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-gold focus:outline-none transition-colors bg-white"
                      placeholder="14"
                    />
                  </div>

                  <div>
                    <label htmlFor="athleteGrade" className="block text-sm font-semibold text-navy mb-2">
                      Grade <span className="text-red-500">*</span>
                    </label>
                    <select
                      id="athleteGrade"
                      name="athleteGrade"
                      required
                      value={form.athleteGrade}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-gold focus:outline-none transition-colors bg-white"
                    >
                      <option value="">Select Grade</option>
                      <option value="5th Grade">5th Grade</option>
                      <option value="6th Grade">6th Grade</option>
                      <option value="7th Grade">7th Grade</option>
                      <option value="8th Grade">8th Grade</option>
                      <option value="9th Grade">9th Grade</option>
                      <option value="10th Grade">10th Grade</option>
                      <option value="11th Grade">11th Grade</option>
                      <option value="12th Grade">12th Grade</option>
                    </select>
                  </div>
                </div>

                <div className="mb-4">
                  <label htmlFor="sport" className="block text-sm font-semibold text-navy mb-2">
                    Sport <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="sport"
                    name="sport"
                    type="text"
                    required
                    value={form.sport}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-gold focus:outline-none transition-colors bg-white"
                    placeholder="Basketball"
                  />
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="school" className="block text-sm font-semibold text-navy mb-2">
                      School
                    </label>
                    <input
                      id="school"
                      name="school"
                      type="text"
                      value={form.school}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-gold focus:outline-none transition-colors bg-white"
                      placeholder="Memphis Middle School"
                    />
                  </div>

                  <div>
                    <label htmlFor="team" className="block text-sm font-semibold text-navy mb-2">
                      Team
                    </label>
                    <input
                      id="team"
                      name="team"
                      type="text"
                      value={form.team}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-gold focus:outline-none transition-colors bg-white"
                      placeholder="Memphis Tigers"
                    />
                  </div>
                </div>
              </div>

              <div className="mb-6">
                <h3 className="text-lg font-semibold text-navy mb-4">Support Information</h3>

                <div>
                  <label htmlFor="supportNeeded" className="block text-sm font-semibold text-navy mb-2">
                    What support is needed? <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    id="supportNeeded"
                    name="supportNeeded"
                    required
                    rows={5}
                    value={form.supportNeeded}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-gold focus:outline-none transition-colors bg-white resize-none"
                    placeholder="Please describe what support or resources you're looking for..."
                  />
                </div>
              </div>

              <div className="mb-6">
                <label className="flex items-start gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    name="consentGiven"
                    checked={form.consentGiven}
                    onChange={handleChange}
                    className="mt-1 w-5 h-5 text-gold border-2 border-gray-300 rounded focus:ring-gold focus:ring-2"
                    required
                  />
                  <span className="text-sm text-gray-700">
                    I agree to allow NextUp Memphis to contact me and use the information provided to support my athlete's development. <span className="text-red-500">*</span>
                  </span>
                </label>
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full btn-primary py-4 text-lg flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <UserPlus className="w-5 h-5" />
                {submitting ? 'Submitting...' : 'Submit Intake Form'}
              </button>
            </form>
          </div>
        </div>
      </main>

      <Footer onNavigate={handleNavigation} />
    </div>
  );
}

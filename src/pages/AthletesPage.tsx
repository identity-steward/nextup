import { useState, useEffect } from 'react';
import { Users, MapPin, ArrowRight, UserPlus, CheckCircle, AlertCircle } from 'lucide-react';
import { AthleteService } from '../services/athleteService';
import type { Athlete } from '../types/athlete';
import { supabase } from '../lib/supabase';

interface AthletesPageProps {
  onNavigate?: (page: string, slug?: string) => void;
}

export default function AthletesPage({ onNavigate }: AthletesPageProps) {
  const [athletes, setAthletes] = useState<Athlete[]>([]);
  const [loading, setLoading] = useState(true);
  const [showSuccess, setShowSuccess] = useState(false);
  const [showError, setShowError] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const [signupForm, setSignupForm] = useState({
    athleteFirstName: '',
    athleteLastName: '',
    age: '',
    grade: '',
    sport: '',
    school: '',
    team: '',
    parentFirstName: '',
    parentLastName: '',
    parentEmail: '',
    parentPhone: '',
  });

  useEffect(() => {
    const loadAthletes = async () => {
      const data = await AthleteService.getAllAthletes();
      setAthletes(data);
      setLoading(false);
    };

    loadAthletes();
  }, []);

  const handleSignupChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setSignupForm({
      ...signupForm,
      [e.target.name]: e.target.value,
    });
  };

  const handleSignupSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setShowError(false);
    setErrorMessage('');

    try {
      const { error } = await supabase.from('athlete_signups').insert([
        {
          parent_first_name: signupForm.parentFirstName,
          parent_last_name: signupForm.parentLastName,
          parent_email: signupForm.parentEmail,
          parent_phone: signupForm.parentPhone,
          athlete_first_name: signupForm.athleteFirstName,
          athlete_last_name: signupForm.athleteLastName,
          athlete_grade: signupForm.grade,
          athlete_sport: signupForm.sport,
          athlete_school: signupForm.school || null,
          athlete_team: signupForm.team || null,
          status: 'pending',
        },
      ]);

      if (error) {
        throw error;
      }

      setShowSuccess(true);
      setSignupForm({
        athleteFirstName: '',
        athleteLastName: '',
        age: '',
        grade: '',
        sport: '',
        school: '',
        team: '',
        parentFirstName: '',
        parentLastName: '',
        parentEmail: '',
        parentPhone: '',
      });
      setTimeout(() => setShowSuccess(false), 5000);
    } catch (error) {
      console.error('Error submitting athlete signup:', error);
      setShowError(true);
      setErrorMessage(error instanceof Error ? error.message : 'Failed to submit application. Please try again.');
      setTimeout(() => setShowError(false), 5000);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 pt-20">
        <div className="text-navy text-xl">Loading athletes...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pt-20">
      <section className="bg-navy text-white py-16">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="flex items-center gap-2 mb-4">
            <Users className="w-8 h-8 text-gold" />
            <h1 className="text-4xl md:text-5xl font-bold">Meet the NextUp Memphis Athletes</h1>
          </div>
          <p className="text-xl text-gray-300 max-w-3xl">
            Explore the journeys, highlights, and stories of young athletes across the city.
          </p>
        </div>
      </section>

      <section className="py-16">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          {athletes.length === 0 ? (
            <div className="text-center py-20">
              <p className="text-gray-600 text-xl">No athletes found. Check back soon!</p>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {athletes.map((athlete) => (
                <div
                  key={athlete.id}
                  className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-2xl transition-all duration-300 group"
                >
                  <div className="aspect-[4/5] overflow-hidden bg-gray-200">
                    <img
                      src={athlete.image_url || 'https://images.pexels.com/photos/2834914/pexels-photo-2834914.jpeg?auto=compress&cs=tinysrgb&w=800'}
                      alt={`${athlete.first_name} ${athlete.last_initial}`}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                  <div className="p-6">
                    <div className="flex items-center gap-2 text-gray-600 text-sm mb-2">
                      <MapPin className="w-4 h-4" />
                      <span>{athlete.city}</span>
                    </div>
                    <h3 className="text-2xl font-bold text-navy mb-1">
                      {athlete.first_name} {athlete.last_initial}
                    </h3>
                    <p className="text-gray-600 mb-1">{athlete.position} • {athlete.grade}</p>
                    <p className="text-gold font-semibold text-sm mb-4">{athlete.descriptor}</p>
                    <button
                      onClick={() => onNavigate?.('athlete-profile', athlete.slug)}
                      className="btn-primary w-full flex items-center justify-center gap-2"
                    >
                      View Profile
                      <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      <section id="signup" className="py-16 bg-white scroll-mt-20">
        <div className="max-w-3xl mx-auto px-6 lg:px-8">
          <div className="text-center mb-12">
            <div className="w-16 h-16 bg-gold/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <UserPlus className="w-8 h-8 text-gold" />
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-navy mb-4">Sign Up Your Athlete</h2>
            <p className="text-lg text-gray-600">
              Fill out this form to get your athlete featured on NextUp Memphis
            </p>
          </div>

          {showSuccess && (
            <div className="bg-green-50 border-2 border-green-200 rounded-xl p-6 mb-8 flex items-start gap-3">
              <CheckCircle className="w-6 h-6 text-green-600 mt-0.5 flex-shrink-0" />
              <div>
                <p className="font-semibold text-green-900 text-lg">Application Submitted!</p>
                <p className="text-green-700">We'll review your submission and contact you within 48 hours.</p>
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

          <div className="bg-gray-50 rounded-2xl p-8 shadow-lg">
            <form onSubmit={handleSignupSubmit} className="space-y-6">
              <div className="border-b border-gray-200 pb-6">
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
                      value={signupForm.athleteFirstName}
                      onChange={handleSignupChange}
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
                      value={signupForm.athleteLastName}
                      onChange={handleSignupChange}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-gold focus:outline-none transition-colors bg-white"
                      placeholder="Fouse"
                    />
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <label htmlFor="grade" className="block text-sm font-semibold text-navy mb-2">
                      Grade <span className="text-red-500">*</span>
                    </label>
                    <select
                      id="grade"
                      name="grade"
                      required
                      value={signupForm.grade}
                      onChange={handleSignupChange}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-gold focus:outline-none transition-colors bg-white"
                    >
                      <option value="">Select Grade</option>
                      <option value="6th Grade">6th Grade</option>
                      <option value="7th Grade">7th Grade</option>
                      <option value="8th Grade">8th Grade</option>
                      <option value="9th Grade">9th Grade</option>
                      <option value="10th Grade">10th Grade</option>
                      <option value="11th Grade">11th Grade</option>
                      <option value="12th Grade">12th Grade</option>
                    </select>
                  </div>

                  <div>
                    <label htmlFor="sport" className="block text-sm font-semibold text-navy mb-2">
                      Sport <span className="text-red-500">*</span>
                    </label>
                    <input
                      id="sport"
                      name="sport"
                      type="text"
                      required
                      value={signupForm.sport}
                      onChange={handleSignupChange}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-gold focus:outline-none transition-colors bg-white"
                      placeholder="Basketball"
                    />
                  </div>
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
                      value={signupForm.school}
                      onChange={handleSignupChange}
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
                      value={signupForm.team}
                      onChange={handleSignupChange}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-gold focus:outline-none transition-colors bg-white"
                      placeholder="Memphis Tigers"
                    />
                  </div>
                </div>
              </div>

              <div className="border-b border-gray-200 pb-6">
                <h3 className="text-lg font-semibold text-navy mb-4">Parent / Guardian Information</h3>

                <div className="grid md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <label htmlFor="parentFirstName" className="block text-sm font-semibold text-navy mb-2">
                      Parent First Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      id="parentFirstName"
                      name="parentFirstName"
                      type="text"
                      required
                      value={signupForm.parentFirstName}
                      onChange={handleSignupChange}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-gold focus:outline-none transition-colors bg-white"
                      placeholder="John"
                    />
                  </div>

                  <div>
                    <label htmlFor="parentLastName" className="block text-sm font-semibold text-navy mb-2">
                      Parent Last Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      id="parentLastName"
                      name="parentLastName"
                      type="text"
                      required
                      value={signupForm.parentLastName}
                      onChange={handleSignupChange}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-gold focus:outline-none transition-colors bg-white"
                      placeholder="Doe"
                    />
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="parentEmail" className="block text-sm font-semibold text-navy mb-2">
                      Email <span className="text-red-500">*</span>
                    </label>
                    <input
                      id="parentEmail"
                      name="parentEmail"
                      type="email"
                      required
                      value={signupForm.parentEmail}
                      onChange={handleSignupChange}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-gold focus:outline-none transition-colors bg-white"
                      placeholder="parent@example.com"
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
                      value={signupForm.parentPhone}
                      onChange={handleSignupChange}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-gold focus:outline-none transition-colors bg-white"
                      placeholder="(555) 123-4567"
                    />
                  </div>
                </div>
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full btn-primary py-4 text-lg flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <UserPlus className="w-5 h-5" />
                {submitting ? 'Submitting...' : 'Submit Application'}
              </button>

              <p className="text-sm text-gray-600 text-center">
                By submitting, you agree to be contacted by NextUp Memphis about your athlete's profile.
              </p>
            </form>
          </div>
        </div>
      </section>

      <section className="py-16 bg-gradient-to-br from-navy via-navy-light to-navy text-white">
        <div className="max-w-4xl mx-auto px-6 lg:px-8">
          <div className="text-center mb-8">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Get Featured on NextUp</h2>
            <p className="text-xl text-gray-300 max-w-2xl mx-auto">
              Sign up to get your athlete profile, highlights, and exposure opportunities.
            </p>
          </div>

          <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">
            <iframe
              src="https://tally.so/embed/Ek0MxA?alignLeft=1&hideTitle=1&transparentBackground=1&dynamicHeight=1"
              width="100%"
              height="600"
              frameBorder="0"
              marginHeight={0}
              marginWidth={0}
              title="Get Featured on NextUp"
              className="w-full"
              style={{ minHeight: '600px' }}
            />
          </div>
        </div>
      </section>

      <section className="py-16 bg-navy text-white">
        <div className="max-w-4xl mx-auto px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Need more information?</h2>
          <p className="text-xl text-gray-300 mb-8">
            Learn about our pricing and what's included with your athlete's profile page.
          </p>
          <button
            onClick={() => onNavigate?.('create')}
            className="btn-primary text-lg px-10 py-4 inline-flex items-center gap-2"
          >
            Learn More
            <ArrowRight className="w-5 h-5" />
          </button>
        </div>
      </section>
    </div>
  );
}

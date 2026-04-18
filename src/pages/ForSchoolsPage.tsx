import { GraduationCap, CheckCircle, Shield, Users, Trophy, TrendingUp, Mail, AlertCircle } from 'lucide-react';
import { useState } from 'react';
import { supabase } from '../lib/supabase';

interface ForSchoolsPageProps {
  onNavigate?: (page: string) => void;
}

export default function ForSchoolsPage({ onNavigate }: ForSchoolsPageProps) {
  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    role: 'coach',
    schoolName: '',
    teamName: '',
    sport: '',
    numAthletes: '',
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
    setSubmitting(true);
    setShowError(false);
    setErrorMessage('');

    try {
      const { error } = await supabase.from('team_inquiries').insert([{
        contact_first_name: form.firstName,
        contact_last_name: form.lastName,
        contact_email: form.email,
        contact_phone: form.phone || null,
        role: form.role,
        school_name: form.schoolName || null,
        team_name: form.teamName,
        sport: form.sport,
        num_athletes: form.numAthletes ? parseInt(form.numAthletes) : null,
        message: form.message,
        status: 'pending',
      }]);

      if (error) throw error;

      setShowSuccess(true);
      setForm({
        firstName: '', lastName: '', email: '', phone: '', role: 'coach',
        schoolName: '', teamName: '', sport: '', numAthletes: '', message: '',
      });
      setTimeout(() => setShowSuccess(false), 6000);
    } catch (err) {
      console.error('ForSchoolsPage inquiry submission error:', err);
      setShowError(true);
      setErrorMessage(err instanceof Error ? err.message : 'Failed to submit. Please try again.');
      setTimeout(() => setShowError(false), 6000);
    } finally {
      setSubmitting(false);
    }
  };

  const coachBenefits = [
    {
      icon: Trophy,
      title: 'Showcase Your Program',
      description: 'Highlight your team\'s achievements and attract community support',
    },
    {
      icon: Users,
      title: 'Build Team Unity',
      description: 'Give each athlete a professional platform that strengthens team identity',
    },
    {
      icon: TrendingUp,
      title: 'Recruit Better',
      description: 'Professional athlete pages help with college recruiting and visibility',
    },
  ];

  const schoolBenefits = [
    {
      title: 'Community Engagement',
      description: 'Connect students, families, and local supporters around athletics',
    },
    {
      title: 'Financial Support',
      description: 'Help families offset sports costs through community contributions',
    },
    {
      title: 'Positive Recognition',
      description: 'Celebrate student-athletes and their achievements publicly',
    },
    {
      title: 'Safe Platform',
      description: 'Parent-controlled, compliant with school policies and student safety',
    },
  ];

  const safetyPoints = [
    'All athlete pages are parent-managed and approved',
    'No direct athlete-to-supporter messaging',
    'Compliant with school district policies',
    'Privacy controls and content moderation',
    'No personal contact information shared',
    'FERPA and COPPA compliant processes',
  ];

  return (
    <div className="min-h-screen bg-gray-50 pt-20">
      <section className="bg-gradient-to-br from-navy via-navy-light to-navy text-white py-20">
        <div className="max-w-4xl mx-auto px-6 lg:px-8 text-center">
          <div className="inline-flex items-center gap-2 bg-gold/20 text-gold px-4 py-2 rounded-full text-sm font-semibold mb-6 border border-gold/30">
            <GraduationCap className="w-4 h-4" />
            For Schools & Coaches
          </div>
          <h1 className="text-4xl md:text-5xl font-bold mb-6">
            Bring NextUp to Your Team
          </h1>
          <p className="text-xl text-gray-300 mb-8">
            Empower your athletes with professional support pages that connect them with their community while keeping them safe.
          </p>
        </div>
      </section>

      <section className="py-20">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <h2 className="text-3xl md:text-4xl font-bold text-navy text-center mb-4">
            What Coaches Get
          </h2>
          <p className="text-xl text-gray-600 text-center mb-12 max-w-2xl mx-auto">
            NextUp Memphis gives coaches tools to support their athletes beyond the court.
          </p>

          <div className="grid md:grid-cols-3 gap-8 mb-20">
            {coachBenefits.map((benefit, index) => (
              <div key={index} className="bg-white rounded-xl p-8 shadow-lg text-center">
                <div className="w-16 h-16 bg-gold/20 rounded-full flex items-center justify-center mb-6 mx-auto">
                  <benefit.icon className="w-8 h-8 text-gold" />
                </div>
                <h3 className="text-xl font-bold text-navy mb-3">{benefit.title}</h3>
                <p className="text-gray-600">{benefit.description}</p>
              </div>
            ))}
          </div>

          <div className="bg-navy text-white rounded-2xl p-12 mb-20">
            <h2 className="text-3xl font-bold text-center mb-8">What Schools Get</h2>
            <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
              {schoolBenefits.map((benefit, index) => (
                <div key={index} className="bg-navy-light rounded-xl p-6">
                  <h3 className="text-xl font-bold mb-2 text-gold">{benefit.title}</h3>
                  <p className="text-gray-300">{benefit.description}</p>
                </div>
              ))}
            </div>
          </div>

          <h2 className="text-3xl md:text-4xl font-bold text-navy text-center mb-12">
            Safety & Compliance
          </h2>

          <div className="bg-white rounded-2xl shadow-xl p-8 md:p-12 max-w-4xl mx-auto">
            <div className="flex items-center justify-center gap-3 mb-8">
              <Shield className="w-12 h-12 text-green-600" />
              <h3 className="text-2xl font-bold text-navy">Student Safety First</h3>
            </div>

            <div className="space-y-4 mb-8">
              {safetyPoints.map((point, index) => (
                <div key={index} className="flex items-start gap-3">
                  <CheckCircle className="w-6 h-6 text-green-600 mt-0.5 flex-shrink-0" />
                  <p className="text-gray-700 text-lg">{point}</p>
                </div>
              ))}
            </div>

            <div className="bg-gray-50 rounded-xl p-6">
              <p className="text-gray-700 leading-relaxed">
                <strong className="text-navy">NextUp Memphis</strong> is designed from the ground up with student safety in mind. Parents control all content, schools can review pages, and we comply with all relevant regulations and district policies.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="py-20 bg-white" id="inquiry">
        <div className="max-w-2xl mx-auto px-6 lg:px-8">
          <div className="text-center mb-10">
            <Mail className="w-12 h-12 text-gold mx-auto mb-6" />
            <h2 className="text-3xl md:text-4xl font-bold text-navy mb-4">
              Ready to Bring NextUp to Your Team?
            </h2>
            <p className="text-xl text-gray-600">
              Tell us about your program and we'll reach out to discuss how we can support your athletes.
            </p>
          </div>

          {showSuccess && (
            <div className="bg-green-50 border-2 border-green-200 rounded-xl p-5 mb-6 flex items-start gap-3">
              <CheckCircle className="w-6 h-6 text-green-600 mt-0.5 flex-shrink-0" />
              <div>
                <p className="font-semibold text-green-900">Inquiry Submitted!</p>
                <p className="text-green-700 text-sm">We'll be in touch within 48 hours to schedule a conversation.</p>
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

          <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-xl p-8 space-y-6 border border-gray-100">
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold text-navy mb-2">First Name *</label>
                <input
                  type="text"
                  name="firstName"
                  required
                  value={form.firstName}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-gold focus:outline-none transition-colors"
                  placeholder="Coach Williams"
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
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-gold focus:outline-none transition-colors"
                  placeholder="Williams"
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
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-gold focus:outline-none transition-colors"
                  placeholder="coach@school.edu"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-navy mb-2">Phone</label>
                <input
                  type="tel"
                  name="phone"
                  value={form.phone}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-gold focus:outline-none transition-colors"
                  placeholder="(901) 555-0100"
                />
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold text-navy mb-2">Your Role *</label>
                <select
                  name="role"
                  required
                  value={form.role}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-gold focus:outline-none transition-colors bg-white"
                >
                  <option value="coach">Coach</option>
                  <option value="athletic_director">Athletic Director</option>
                  <option value="administrator">School Administrator</option>
                  <option value="parent_volunteer">Parent Volunteer</option>
                  <option value="other">Other</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold text-navy mb-2">School Name</label>
                <input
                  type="text"
                  name="schoolName"
                  value={form.schoolName}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-gold focus:outline-none transition-colors"
                  placeholder="Memphis High School"
                />
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold text-navy mb-2">Team Name *</label>
                <input
                  type="text"
                  name="teamName"
                  required
                  value={form.teamName}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-gold focus:outline-none transition-colors"
                  placeholder="Memphis Tigers"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-navy mb-2">Sport *</label>
                <input
                  type="text"
                  name="sport"
                  required
                  value={form.sport}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-gold focus:outline-none transition-colors"
                  placeholder="Basketball"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-navy mb-2">Number of Athletes</label>
              <input
                type="number"
                name="numAthletes"
                min="1"
                value={form.numAthletes}
                onChange={handleChange}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-gold focus:outline-none transition-colors"
                placeholder="15"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-navy mb-2">How can we help? *</label>
              <textarea
                name="message"
                required
                rows={4}
                value={form.message}
                onChange={handleChange}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-gold focus:outline-none transition-colors resize-none"
                placeholder="Tell us about your program and what you're hoping to accomplish with NextUp..."
              />
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full btn-primary py-4 text-lg disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {submitting ? 'Submitting...' : 'Submit Inquiry'}
            </button>
          </form>

          <p className="text-gray-600 mt-6 text-center">
            Questions? Email us at <a href="mailto:kenneth@flmlifestyle.com" className="text-gold hover:underline font-semibold">kenneth@flmlifestyle.com</a>
          </p>
        </div>
      </section>

      <section className="py-20 bg-gray-50">
        <div className="max-w-4xl mx-auto px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-navy text-center mb-8">
            Frequently Asked Questions
          </h2>

          <div className="space-y-6">
            <div className="bg-white rounded-xl p-6 shadow-md">
              <h3 className="text-lg font-bold text-navy mb-2">Is there a cost to schools?</h3>
              <p className="text-gray-700">
                No. Schools and coaches can refer athletes at no cost. Families pay for individual athlete pages.
              </p>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-md">
              <h3 className="text-lg font-bold text-navy mb-2">How do you ensure student safety?</h3>
              <p className="text-gray-700">
                All pages are parent-controlled, no direct messaging is allowed, and we comply with all relevant student privacy regulations.
              </p>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-md">
              <h3 className="text-lg font-bold text-navy mb-2">Can schools review athlete pages?</h3>
              <p className="text-gray-700">
                Yes. We work with schools to ensure all content meets district policies and maintains appropriate representation.
              </p>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-md">
              <h3 className="text-lg font-bold text-navy mb-2">What if a family can't afford the setup fee?</h3>
              <p className="text-gray-700">
                We offer scholarships and work with sponsors to ensure no athlete is excluded due to cost.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

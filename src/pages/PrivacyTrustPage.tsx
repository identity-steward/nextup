import { Link } from 'react-router-dom';
import { ShieldCheck, Lock, Eye, FileText, Users, AlertTriangle, ArrowRight, Heart } from 'lucide-react';

export function PrivacyTrustPage() {
  const principles = [
    {
      icon: Eye,
      title: 'You control what is shared',
      description: 'Families decide what information appears on an athlete profile and what stays private. Nothing moves without your decision.',
    },
    {
      icon: FileText,
      title: 'Sharing is documented',
      description: 'When information is shared, NextUp records what was shared, why it was shared, who received it, when it was delivered, and who recorded the delivery.',
    },
    {
      icon: Lock,
      title: 'Access is restricted',
      description: 'Athlete profile data and media are protected by row-level security. Only authorized users can access non-public information.',
    },
    {
      icon: Users,
      title: 'Guardian consent is tracked',
      description: 'Parent and guardian consent is recorded separately from athlete profile data. Administrators review intake submissions before any next step.',
    },
    {
      icon: ShieldCheck,
      title: 'Adult consent vs. guardian authorization',
      description: 'Athletes who are legal adults can consent to sharing their own information. For athletes under 18, a parent or legal guardian must authorize sharing. NextUp does not treat a minor\'s own assent as guardian authorization.',
    },
  ];

  return (
    <div className="bg-navy-900">
      <section className="relative pt-32 pb-20 lg:pt-40 lg:pb-28 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-navy-950 via-navy-900 to-navy-900" />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-blue-600/10 blur-[120px] rounded-full" />

        <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center gap-2 bg-blue-600/20 border border-blue-300/35 text-blue-100 px-4 py-2 rounded-full text-xs font-bold uppercase tracking-widest mb-6">
            <ShieldCheck className="w-3.5 h-3.5" />
            Privacy & Trust
          </div>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-white tracking-tight mb-6 leading-tight">
            Your story is{' '}
            <span className="text-gradient-blue">yours.</span>
          </h1>
          <p className="text-lg sm:text-xl text-navy-200 leading-relaxed max-w-2xl mx-auto">
            NextUp is built around a simple principle: families control their information.
            Here is how privacy and consent work in the current platform — and what is still
            being improved.
          </p>
        </div>
      </section>

      {/* Principles */}
      <section className="bg-white py-20 lg:py-28">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <p className="text-xs font-bold uppercase tracking-widest text-blue-600 mb-3">How Privacy Works</p>
            <h2 className="text-4xl sm:text-5xl font-black text-navy-900 tracking-tight mb-4">
              Five core principles
            </h2>
            <p className="text-lg text-gray-500 max-w-2xl mx-auto">
              These principles guide how NextUp handles athlete data, media, and sharing.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8">
            {principles.map((principle) => {
              const Icon = principle.icon;
              return (
                <div
                  key={principle.title}
                  className="bg-gray-50 rounded-2xl p-8 border border-gray-100 hover:border-blue-200 hover:shadow-lg transition-all duration-300"
                >
                  <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mb-5">
                    <Icon className="w-6 h-6 text-blue-600" />
                  </div>
                  <h3 className="text-xl font-bold text-navy-900 mb-3">{principle.title}</h3>
                  <p className="text-gray-600 leading-relaxed">{principle.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Current Limitations */}
      <section className="bg-gray-50 py-20 lg:py-28">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-2xl p-8 lg:p-12 border-2 border-amber-200">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center">
                <AlertTriangle className="w-5 h-5 text-amber-700" />
              </div>
              <h3 className="text-2xl font-bold text-navy-900">Current limitations</h3>
            </div>
            <p className="text-gray-600 leading-relaxed mb-6">
              NextUp is in its pilot phase. The following are known limitations in the
              current platform that we are actively working to address:
            </p>
            <ul className="space-y-4">
              <li className="flex items-start gap-3">
                <div className="w-2 h-2 bg-amber-500 rounded-full mt-2 flex-shrink-0" />
                <span className="text-gray-700 leading-relaxed">
                  <strong className="text-navy-900">Media consent status.</strong> Existing
                  media uploads currently have a consent status of "implied" rather than
                  verified parental or adult self-consent. "Implied" consent does not
                  authorize public publication. NextUp is building a verified consent
                  workflow to replace this. Until that workflow is in place, media is not
                  published without administrative review and verified consent.
                </span>
              </li>
              <li className="flex items-start gap-3">
                <div className="w-2 h-2 bg-amber-500 rounded-full mt-2 flex-shrink-0" />
                <span className="text-gray-700 leading-relaxed">
                  <strong className="text-navy-900">Intake review is manual.</strong> Parent
                  intake submissions are reviewed by administrators before any next step is
                  taken. There is no automated eligibility determination or automatic
                  referral.
                </span>
              </li>
              <li className="flex items-start gap-3">
                <div className="w-2 h-2 bg-amber-500 rounded-full mt-2 flex-shrink-0" />
                <span className="text-gray-700 leading-relaxed">
                  <strong className="text-navy-900">Disclosure logging is in development.</strong>
                  The system can record what, why, who, when, and who recorded a disclosure.
                  The full disclosure tracking workflow for families to review their own
                  sharing history is still being built.
                </span>
              </li>
              <li className="flex items-start gap-3">
                <div className="w-2 h-2 bg-amber-500 rounded-full mt-2 flex-shrink-0" />
                <span className="text-gray-700 leading-relaxed">
                  <strong className="text-navy-900">This is not a legal policy.</strong> This
                  page describes how the platform currently handles data and consent. It is
                  not a finalized privacy policy or legal document. A formal privacy policy
                  will be published before the platform exits pilot phase.
                </span>
              </li>
            </ul>
          </div>
        </div>
      </section>

      {/* Data overview */}
      <section className="bg-white py-20 lg:py-28">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <p className="text-xs font-bold uppercase tracking-widest text-blue-600 mb-3">What We Store</p>
            <h2 className="text-4xl sm:text-5xl font-black text-navy-900 tracking-tight mb-4">
              Data on the platform
            </h2>
          </div>

          <div className="space-y-6">
            <div className="bg-gray-50 rounded-2xl p-6 border border-gray-100">
              <h3 className="text-lg font-bold text-navy-900 mb-2">Athlete profiles</h3>
              <p className="text-sm text-gray-600 leading-relaxed">
                Public profile information includes name, sport, position, grade, city, and
                profile photo. Journey entries, traits, and updates are added with guardian
                awareness. Non-public fields (contact details, internal notes) are restricted
                to authenticated administrators.
              </p>
            </div>

            <div className="bg-gray-50 rounded-2xl p-6 border border-gray-100">
              <h3 className="text-lg font-bold text-navy-900 mb-2">Parent intake data</h3>
              <p className="text-sm text-gray-600 leading-relaxed">
                Intake form submissions include athlete details, support needs, and guardian
                contact information. These are stored securely and reviewed manually by
                NextUp administrators. Intake data is not visible to the public.
              </p>
            </div>

            <div className="bg-gray-50 rounded-2xl p-6 border border-gray-100">
              <h3 className="text-lg font-bold text-navy-900 mb-2">Media uploads</h3>
              <p className="text-sm text-gray-600 leading-relaxed">
                Photos and videos uploaded to athlete profiles are stored in private storage
                buckets. Media is reviewed by administrators before approval. Consent status
                is tracked per upload, and media is not published without administrative
                review.
              </p>
            </div>

            <div className="bg-gray-50 rounded-2xl p-6 border border-gray-100">
              <h3 className="text-lg font-bold text-navy-900 mb-2">Contact inquiries</h3>
              <p className="text-sm text-gray-600 leading-relaxed">
                The contact form collects name, email, organization, inquiry type, and
                message. This information is used to respond to inquiries and is reviewed by
                NextUp administrators.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Contact */}
      <section className="relative bg-navy-950 py-24 lg:py-32 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-900/20 via-navy-950 to-navy-950" />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-blue-600/10 blur-[120px] rounded-full" />

        <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Heart className="w-5 h-5 text-blue-400" />
            <p className="text-xs font-bold uppercase tracking-widest text-blue-400">Questions about privacy?</p>
          </div>
          <h2 className="text-4xl sm:text-5xl font-black text-white tracking-tight mb-6 leading-tight">
            We're happy to{' '}
            <span className="text-gradient-blue">talk it through.</span>
          </h2>
          <p className="text-lg text-navy-200 mb-10 max-w-2xl mx-auto">
            If you have questions about how your data is handled, contact us. We take privacy
            seriously and want families to feel confident about how their stories are treated.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 items-center justify-center">
            <Link
              to="/contact"
              className="inline-flex items-center gap-3 bg-blue-600 hover:bg-blue-500 text-white font-bold text-base px-8 py-4 rounded-xl transition-all duration-200 hover:scale-105 hover:glow-blue"
            >
              Contact Us
              <ArrowRight className="w-5 h-5" />
            </Link>
            <a
              href="mailto:info@NextUpMemphis.com"
              className="text-blue-400 hover:text-blue-300 font-semibold transition-colors"
            >
              info@NextUpMemphis.com
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}

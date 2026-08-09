import { Shield, Lock, FileText, Eye, HandHeart, Scale } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function PrivacyTrustPage() {
  const principles = [
    {
      icon: Lock,
      title: 'Collect Only What Is Needed',
      description:
        'NextUp is being designed to collect only what is necessary to help — not everything that could be collected.',
    },
    {
      icon: Eye,
      title: 'Telling Is Not Sharing',
      description:
        'Telling NextUp something is not automatically permission to share it. Sharing is purpose-specific and subject to the applicable consent and authority rules.',
    },
    {
      icon: FileText,
      title: 'Your Words Stay Yours',
      description:
        'NextUp distinguishes the person\u2019s words from its own interpretation. What you say and what NextUp understands are kept separate.',
    },
    {
      icon: HandHeart,
      title: 'Documents Stay With You',
      description:
        'Documents may remain with the person or the original organization. NextUp does not require you to hand over your records to get help.',
    },
    {
      icon: Scale,
      title: 'NextUp Does Not Replace Authorities',
      description:
        'NextUp does not replace authoritative eligibility or verification systems. It helps you navigate them — not override them.',
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50 pt-20">
      <section className="bg-gradient-to-br from-navy via-navy-light to-navy text-white py-20">
        <div className="max-w-4xl mx-auto px-6 lg:px-8 text-center">
          <div className="inline-flex items-center gap-2 bg-gold/20 text-gold px-4 py-2 rounded-full text-sm font-semibold mb-6 border border-gold/30">
            <Shield className="w-4 h-4" />
            Privacy & Trust
          </div>
          <h1 className="text-4xl md:text-5xl font-bold mb-6">
            Your story does not need to become everybody's file.
          </h1>
          <p className="text-xl text-gray-300 max-w-2xl mx-auto">
            NextUp is being built around a simple idea: people should be able to
            get help without losing control of their story.
          </p>
        </div>
      </section>

      <section className="py-20">
        <div className="max-w-5xl mx-auto px-6 lg:px-8">
          <div className="bg-white rounded-2xl shadow-lg p-8 md:p-12 mb-12">
            <h2 className="text-2xl md:text-3xl font-bold text-navy mb-6">
              How NextUp Thinks About Your Information
            </h2>
            <div className="space-y-8">
              {principles.map((principle, index) => (
                <div key={index} className="flex items-start gap-5">
                  <div className="w-12 h-12 bg-gold/20 rounded-xl flex items-center justify-center flex-shrink-0">
                    <principle.icon className="w-6 h-6 text-gold" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-navy mb-2">
                      {principle.title}
                    </h3>
                    <p className="text-gray-600 leading-relaxed">
                      {principle.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-navy rounded-2xl p-8 md:p-12 text-center">
            <h2 className="text-2xl font-bold text-white mb-4">
              What NextUp Does Not Do
            </h2>
            <p className="text-lg text-gray-300 leading-relaxed max-w-2xl mx-auto">
              NextUp does not share information just because you told us.
              Sharing is purpose-specific and subject to the applicable consent
              and authority rules.
            </p>
          </div>
        </div>
      </section>

      <section className="py-16 bg-white">
        <div className="max-w-3xl mx-auto px-6 lg:px-8 text-center">
          <p className="text-gray-500 text-sm leading-relaxed max-w-xl mx-auto mb-6">
            NextUp is still in development. This page describes the principles
            guiding our design — not a finalized legal privacy policy. As the
            platform grows, we will publish formal policies that reflect what we
            have actually built.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/about" className="btn-secondary">
              Learn About NextUp
            </Link>
            <Link to="/contact" className="btn-primary">
              Ask a Question
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}

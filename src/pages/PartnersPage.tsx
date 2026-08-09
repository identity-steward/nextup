import { Handshake, Heart, Building2, Users, TrendingUp, Mail, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { FEATURE_FLAGS } from '../config/features';

export default function PartnersPage() {
  const partnerTypes = [
    {
      icon: Heart,
      title: 'Community Partners',
      description: 'Organizations working alongside NextUp to support youth and families across Memphis.',
    },
    {
      icon: Building2,
      title: 'Service Providers',
      description: 'Schools, nonprofits, and civic institutions that help connect people to what they need.',
    },
    {
      icon: Users,
      title: 'Funders & Sponsors',
      description: 'Individuals and organizations investing in youth opportunity and community development.',
    },
    {
      icon: TrendingUp,
      title: 'Youth Opportunity Partners',
      description: 'Employers, programs, and institutions creating pathways for young people.',
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50 pt-20">
      <section className="bg-gradient-to-br from-navy via-navy-light to-navy text-white py-20">
        <div className="max-w-4xl mx-auto px-6 lg:px-8 text-center">
          <div className="inline-flex items-center gap-2 bg-gold/20 text-gold px-4 py-2 rounded-full text-sm font-semibold mb-6 border border-gold/30">
            <Handshake className="w-4 h-4" />
            For Partners
          </div>
          <h1 className="text-4xl md:text-5xl font-bold mb-6">
            Partner With NextUp Memphis
          </h1>
          <p className="text-xl text-gray-300 max-w-2xl mx-auto">
            NextUp is building community infrastructure that connects youth,
            families, and the organizations that serve them. We work with
            community partners, service providers, funders, and organizations
            that want to collaborate.
          </p>
        </div>
      </section>

      <section className="py-20">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <h2 className="text-3xl md:text-4xl font-bold text-navy text-center mb-4">
            Who We Work With
          </h2>
          <p className="text-xl text-gray-600 text-center mb-12 max-w-2xl mx-auto">
            NextUp is more than a youth platform. It's a developing network of
            partners committed to helping people navigate what's happening.
          </p>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {partnerTypes.map((item, index) => (
              <div key={index} className="bg-white rounded-xl p-6 shadow-lg text-center">
                <div className="w-16 h-16 bg-gold/20 rounded-full flex items-center justify-center mb-4 mx-auto">
                  <item.icon className="w-8 h-8 text-gold" />
                </div>
                <h3 className="text-xl font-bold text-navy mb-2">{item.title}</h3>
                <p className="text-gray-600 text-sm leading-relaxed">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 bg-white">
        <div className="max-w-4xl mx-auto px-6 lg:px-8 text-center">
          <Mail className="w-12 h-12 text-gold mx-auto mb-6" />
          <h2 className="text-3xl md:text-4xl font-bold text-navy mb-4">
            Let's Talk
          </h2>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            Whether you're a community organization, a funder, or a partner
            looking to collaborate, we'd love to hear from you.
          </p>
          {FEATURE_FLAGS.PUBLIC_STRIPE_SUPPORT ? (
            <div className="grid md:grid-cols-2 gap-6 max-w-2xl mx-auto mb-8">
              <div className="bg-navy rounded-2xl p-6 text-center">
                <h3 className="text-white font-bold text-lg mb-2">Sponsor a Youth Athlete</h3>
                <p className="text-gray-400 text-sm mb-5 leading-relaxed">
                  Directly support a Memphis youth athlete's development.
                </p>
                <Link
                  to="/youth"
                  className="inline-flex items-center gap-2 bg-gold hover:bg-gold-dark text-navy font-black text-sm px-6 py-3 rounded-xl transition-all duration-200 uppercase tracking-wide"
                >
                  Browse Youth
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
              <div className="bg-gray-50 border-2 border-gray-200 rounded-2xl p-6 text-center">
                <h3 className="text-navy font-bold text-lg mb-2">Become a Supporter</h3>
                <p className="text-gray-600 text-sm mb-5 leading-relaxed">
                  Monthly contributions that go directly to youth athletes.
                </p>
                <Link
                  to="/contact"
                  className="inline-flex items-center gap-2 btn-secondary text-sm px-6 py-3 rounded-xl uppercase tracking-wide"
                >
                  Get Started
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          ) : (
            <p className="text-gray-500 mb-8">
              During our pilot phase, partnership arrangements are handled
              directly. Reach out to start the conversation.
            </p>
          )}
          <Link to="/contact" className="btn-primary text-lg px-10 py-4 inline-block">
            Contact Us
          </Link>
          <p className="text-gray-600 mt-6">
            Or email us at{' '}
            <a
              href="mailto:info@NextUpMemphis.com"
              className="text-gold hover:underline font-semibold"
            >
              info@NextUpMemphis.com
            </a>
          </p>
        </div>
      </section>
    </div>
  );
}

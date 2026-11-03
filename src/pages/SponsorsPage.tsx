import { Handshake, Users, TrendingUp, Heart, Building2, Mail, CheckCircle, UserPlus, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { STRIPE_LINKS } from '../config/stripeLinks';

export default function SponsorsPage() {
  const whyPartner = [
    {
      icon: Heart,
      title: 'Community Impact',
      description: 'Support Memphis youth athletes and their families through a platform that makes development visible.',
    },
    {
      icon: Building2,
      title: 'Brand Visibility',
      description: 'Showcase your commitment to local youth development alongside athlete journeys.',
    },
    {
      icon: Users,
      title: 'Authentic Connection',
      description: 'Build meaningful relationships with the Memphis community through real stories.',
    },
    {
      icon: TrendingUp,
      title: 'Measurable Results',
      description: 'Follow athlete progress through documented journey entries and milestones.',
    },
  ];

  const tiers = [
    {
      name: 'Bronze Partner',
      amount: '$100',
      period: 'per month',
      benefits: [
        'Logo on NextUp Memphis website',
        'Social media recognition',
        'Support youth athlete development',
        'Quarterly impact summaries',
      ],
      color: 'border-orange-400',
    },
    {
      name: 'Silver Partner',
      amount: '$250',
      period: 'per month',
      benefits: [
        'All Bronze benefits',
        'Featured sponsor placement',
        'Monthly impact updates',
        'Sponsor spotlight content',
      ],
      color: 'border-gray-400',
      popular: true,
    },
    {
      name: 'Gold Partner',
      amount: '$500',
      period: 'per month',
      benefits: [
        'All Silver benefits',
        'Premium logo placement',
        'Dedicated partnership contact',
        'Custom partnership opportunities',
        'Event sponsorship options',
      ],
      color: 'border-gold',
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50 pt-20">
      <section className="bg-gradient-to-br from-navy via-navy-light to-navy text-white py-20">
        <div className="max-w-4xl mx-auto px-6 lg:px-8 text-center">
          <div className="inline-flex items-center gap-2 bg-gold/20 text-gold px-4 py-2 rounded-full text-sm font-semibold mb-6 border border-gold/30">
            <Handshake className="w-4 h-4" />
            Corporate Partnerships
          </div>
          <h1 className="text-4xl md:text-5xl font-bold mb-6">
            Partner With NextUp Memphis
          </h1>
          <p className="text-xl text-gray-300 mb-8">
            Invest in the future of Memphis youth. Support athletes, strengthen communities, and showcase your commitment to local development.
          </p>
        </div>
      </section>

      <section className="py-20">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <h2 className="text-3xl md:text-4xl font-bold text-navy text-center mb-4">
            Why Partner With Us
          </h2>
          <p className="text-xl text-gray-600 text-center mb-12 max-w-2xl mx-auto">
            Your sponsorship helps young athletes build documented records of growth and connect to opportunity.
          </p>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 mb-20">
            {whyPartner.map((item, index) => {
              const Icon = item.icon;
              return (
                <div key={index} className="bg-white rounded-xl p-6 shadow-lg text-center">
                  <div className="w-16 h-16 bg-gold/20 rounded-full flex items-center justify-center mb-4 mx-auto">
                    <Icon className="w-8 h-8 text-gold" />
                  </div>
                  <h3 className="text-xl font-bold text-navy mb-2">{item.title}</h3>
                  <p className="text-gray-600">{item.description}</p>
                </div>
              );
            })}
          </div>

          <h2 className="text-3xl md:text-4xl font-bold text-navy text-center mb-12">
            Sponsorship Tiers
          </h2>

          <div className="grid md:grid-cols-3 gap-8 mb-20">
            {tiers.map((tier, index) => (
              <div
                key={index}
                className={`bg-white rounded-xl p-8 shadow-lg border-4 ${tier.color} relative ${
                  tier.popular ? 'transform md:-translate-y-4' : ''
                }`}
              >
                {tier.popular && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 bg-gold text-navy px-6 py-1 rounded-full text-sm font-bold">
                    Most Popular
                  </div>
                )}
                <h3 className="text-2xl font-bold text-navy mb-2">{tier.name}</h3>
                <div className="mb-6">
                  <span className="text-4xl font-bold text-navy">{tier.amount}</span>
                  <span className="text-gray-600">/{tier.period}</span>
                </div>
                <ul className="space-y-3 mb-8">
                  {tier.benefits.map((benefit, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                      <span className="text-gray-700">{benefit}</span>
                    </li>
                  ))}
                </ul>
                {STRIPE_LINKS.SPONSOR_ATHLETE_LINK ? (
                  <a href={STRIPE_LINKS.SPONSOR_ATHLETE_LINK} className="btn-primary w-full block text-center">
                    Get Started
                  </a>
                ) : (
                  <Link to="/contact" className="btn-primary w-full block text-center">
                    Get Started
                  </Link>
                )}
              </div>
            ))}
          </div>

          <div className="bg-navy text-white rounded-2xl p-12">
            <h2 className="text-3xl font-bold mb-4 text-center">Become a Founding Partner</h2>
            <p className="text-gray-300 text-center max-w-2xl mx-auto mb-8">
              NextUp Memphis is in its pilot phase. We are building partnerships with
              organizations that share our commitment to making youth development visible.
              If you are interested in being part of this early stage, we would like to talk.
            </p>
            <div className="text-center">
              <Link to="/contact" className="btn-primary text-lg px-10 py-4 inline-block">
                Start the Conversation
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="py-20 bg-white">
        <div className="max-w-4xl mx-auto px-6 lg:px-8">

          <div className="text-center mb-12">
            <Mail className="w-12 h-12 text-gold mx-auto mb-6" />
            <h2 className="text-3xl md:text-4xl font-bold text-navy mb-4">
              Ready to Make a Difference?
            </h2>
            <p className="text-xl text-gray-600 mb-8">
              Let's discuss how your organization can support Memphis youth athletes.
            </p>
            <Link to="/contact" className="btn-primary text-lg px-10 py-4 inline-block">
              Request Sponsorship Info
            </Link>
            <p className="text-gray-600 mt-6">
              Or email us at <a href="mailto:info@NextUpMemphis.com" className="text-gold hover:underline font-semibold">info@NextUpMemphis.com</a>
            </p>
          </div>

          <div className="grid sm:grid-cols-2 gap-5 max-w-2xl mx-auto">
            <div className="bg-navy rounded-2xl p-6 text-center">
              <div className="w-12 h-12 bg-gold/20 rounded-xl flex items-center justify-center mx-auto mb-4">
                <Heart className="w-6 h-6 text-gold" />
              </div>
              <h3 className="text-white font-bold text-lg mb-2">Sponsor an Athlete</h3>
              <p className="text-gray-400 text-sm mb-5 leading-relaxed">
                Support a Memphis youth athlete's development through the NextUp platform.
              </p>
              <Link
                to="/youth"
                className="inline-flex items-center gap-2 bg-gold hover:bg-gold-dark text-navy font-black text-sm px-6 py-3 rounded-xl transition-all duration-200 uppercase tracking-wide"
              >
                Browse Athletes
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>

            <div className="bg-gray-50 border-2 border-gray-200 rounded-2xl p-6 text-center">
              <div className="w-12 h-12 bg-navy/10 rounded-xl flex items-center justify-center mx-auto mb-4">
                <UserPlus className="w-6 h-6 text-navy" />
              </div>
              <h3 className="text-navy font-bold text-lg mb-2">Nominate an Athlete</h3>
              <p className="text-gray-600 text-sm mb-5 leading-relaxed">
                Know a Memphis youth athlete who deserves a platform? Submit their info.
              </p>
              <Link
                to="/signup/parent"
                className="inline-flex items-center gap-2 btn-secondary text-sm px-6 py-3 rounded-xl uppercase tracking-wide"
              >
                Nominate Now
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

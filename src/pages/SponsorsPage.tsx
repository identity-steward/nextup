import { Handshake, Target, Users, TrendingUp, Heart, Building2, Mail, CheckCircle } from 'lucide-react';
import { STRIPE_LINKS } from '../config/stripeLinks';

interface SponsorsPageProps {
  onNavigate?: (page: string) => void;
}

export default function SponsorsPage({ onNavigate }: SponsorsPageProps) {
  const whyPartner = [
    {
      icon: Heart,
      title: 'Community Impact',
      description: 'Directly support Memphis youth athletes and their families',
    },
    {
      icon: Building2,
      title: 'Brand Visibility',
      description: 'Showcase your commitment to local youth development',
    },
    {
      icon: Users,
      title: 'Authentic Connection',
      description: 'Build meaningful relationships with the Memphis community',
    },
    {
      icon: TrendingUp,
      title: 'Measurable Results',
      description: 'See the direct impact of your sponsorship through athlete progress',
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
        'Support 2-3 athletes monthly',
        'Quarterly impact reports',
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
        'Support 5-6 athletes monthly',
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
        'Support 10+ athletes monthly',
        'Dedicated account manager',
        'Custom partnership opportunities',
        'Event sponsorship options',
      ],
      color: 'border-gold',
    },
  ];

  const testimonials = [
    {
      company: 'Memphis Sports Complex',
      quote: 'Partnering with NextUp Memphis has been incredible. We love seeing these young athletes thrive.',
      author: 'Sarah Johnson',
      role: 'Community Director',
    },
    {
      company: 'Local Bank & Trust',
      quote: 'NextUp Memphis is making a real difference in our community. Proud to be a sponsor.',
      author: 'Michael Davis',
      role: 'VP of Community Relations',
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
            Invest in the future of Memphis youth sports. Support athletes, strengthen communities, and showcase your commitment to local development.
          </p>
        </div>
      </section>

      <section className="py-20">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <h2 className="text-3xl md:text-4xl font-bold text-navy text-center mb-4">
            Why Partner With Us
          </h2>
          <p className="text-xl text-gray-600 text-center mb-12 max-w-2xl mx-auto">
            Your sponsorship goes beyond logos. It changes lives and builds futures.
          </p>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 mb-20">
            {whyPartner.map((item, index) => (
              <div key={index} className="bg-white rounded-xl p-6 shadow-lg text-center">
                <div className="w-16 h-16 bg-gold/20 rounded-full flex items-center justify-center mb-4 mx-auto">
                  <item.icon className="w-8 h-8 text-gold" />
                </div>
                <h3 className="text-xl font-bold text-navy mb-2">{item.title}</h3>
                <p className="text-gray-600">{item.description}</p>
              </div>
            ))}
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
                  <button
                    onClick={() => onNavigate?.('contact')}
                    className="btn-primary w-full"
                  >
                    Get Started
                  </button>
                )}
              </div>
            ))}
          </div>

          <div className="bg-navy text-white rounded-2xl p-12">
            <h2 className="text-3xl font-bold mb-8 text-center">What Sponsors Say</h2>
            <div className="grid md:grid-cols-2 gap-8">
              {testimonials.map((testimonial, index) => (
                <div key={index} className="bg-navy-light rounded-xl p-6">
                  <Target className="w-8 h-8 text-gold mb-4" />
                  <p className="text-gray-300 mb-4 italic">"{testimonial.quote}"</p>
                  <div>
                    <p className="font-semibold">{testimonial.author}</p>
                    <p className="text-sm text-gray-400">{testimonial.role}</p>
                    <p className="text-sm text-gold font-semibold mt-1">{testimonial.company}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="py-20 bg-white">
        <div className="max-w-4xl mx-auto px-6 lg:px-8 text-center">
          <Mail className="w-12 h-12 text-gold mx-auto mb-6" />
          <h2 className="text-3xl md:text-4xl font-bold text-navy mb-4">
            Ready to Make a Difference?
          </h2>
          <p className="text-xl text-gray-600 mb-8">
            Let's discuss how your organization can support Memphis youth athletes.
          </p>
          <button
            onClick={() => onNavigate?.('support')}
            className="btn-primary text-lg px-10 py-4"
          >
            Request Sponsorship Info
          </button>
          <p className="text-gray-600 mt-6">
            Or email us at <a href="mailto:kenneth@flmlifestyle.com" className="text-gold hover:underline font-semibold">kenneth@flmlifestyle.com</a>
          </p>
        </div>
      </section>
    </div>
  );
}

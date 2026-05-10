import { Check, Heart, Sparkles, Star, Handshake, ArrowRight, UserPlus } from 'lucide-react';
import { Link } from 'react-router-dom';

const freeBenefits = [
  'Athlete profile page on NextUp Memphis',
  'Basic stats and bio section',
  'Share your story with the community',
  'Parent-managed and privacy-first',
];

const starterBenefits = [
  'Everything in Free',
  'Highlight reel embed (up to 3 clips)',
  'Tournament & event schedule display',
  'Supporter progress tracker',
  'Priority review and publishing',
];

const featuredBenefits = [
  'Everything in Starter',
  'Featured placement on homepage',
  'Full highlight reel (unlimited clips)',
  'Sponsor outreach support',
  'Custom athlete story content',
  'Social media promotion',
];

export default function SupporterTier() {
  return (
    <section id="pricing" className="py-24 bg-white scroll-mt-20">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">

        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 bg-gold/20 text-gold-dark px-4 py-2 rounded-full text-sm font-semibold mb-6 border border-gold/30">
            <Star className="w-4 h-4" />
            Athlete Profile Plans
          </div>
          <h2 className="text-4xl md:text-5xl font-bold text-navy mb-4 leading-tight">
            Get Your Athlete Seen
          </h2>
          <p className="text-gray-500 text-lg">
            Start free. Upgrade when you're ready for more visibility and support.
          </p>
        </div>

        {/* Tier cards */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">

          {/* Free */}
          <div className="bg-white rounded-3xl shadow-lg border-2 border-gray-200 overflow-hidden hover:shadow-xl hover:border-gold/30 transition-all duration-300 flex flex-col">
            <div className="p-8 flex-1">
              <div className="w-14 h-14 bg-navy/5 rounded-2xl flex items-center justify-center mb-6">
                <UserPlus className="w-7 h-7 text-navy" />
              </div>
              <h3 className="text-2xl font-bold text-navy mb-1">Free Profile</h3>
              <p className="text-gray-400 text-sm mb-4">Get started at no cost</p>
              <div className="flex items-baseline gap-2 mb-6">
                <span className="text-4xl font-bold text-navy">$0</span>
                <span className="text-lg text-gray-500">forever</span>
              </div>
              <ul className="space-y-3">
                {freeBenefits.map((b) => (
                  <li key={b} className="flex items-start gap-3">
                    <div className="w-5 h-5 bg-navy/10 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                      <Check className="w-3 h-3 text-navy" />
                    </div>
                    <span className="text-gray-700 text-sm leading-relaxed">{b}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="p-8 pt-0">
              <Link
                to="/signup"
                className="w-full btn-secondary px-6 py-4 rounded-xl flex items-center justify-center gap-2"
              >
                Get Started Free
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>

          {/* Starter — most popular */}
          <div className="bg-white rounded-3xl shadow-xl border-4 border-gold overflow-hidden hover:shadow-2xl transition-all duration-300 flex flex-col relative lg:-translate-y-4">
            <div className="absolute top-0 left-0 right-0 bg-gold text-navy text-center py-2 text-sm font-bold flex items-center justify-center gap-1">
              <Sparkles className="w-4 h-4" />
              Most Popular
            </div>
            <div className="p-8 pt-16 flex-1">
              <div className="w-14 h-14 bg-gold/20 rounded-2xl flex items-center justify-center mb-6">
                <Heart className="w-7 h-7 text-gold" />
              </div>
              <h3 className="text-2xl font-bold text-navy mb-1">Starter Profile</h3>
              <p className="text-gray-400 text-sm mb-4">For athletes ready to grow</p>
              <div className="flex items-baseline gap-2 mb-6">
                <span className="text-4xl font-bold text-navy">$99</span>
                <span className="text-lg text-gray-500">one-time</span>
              </div>
              <ul className="space-y-3">
                {starterBenefits.map((b) => (
                  <li key={b} className="flex items-start gap-3">
                    <div className="w-5 h-5 bg-gold/20 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                      <Check className="w-3 h-3 text-gold" />
                    </div>
                    <span className="text-gray-700 text-sm leading-relaxed">{b}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="p-8 pt-0">
              <Link
                to="/contact"
                className="w-full btn-primary px-6 py-4 rounded-xl flex items-center justify-center gap-2"
              >
                Get Starter — $99
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>

          {/* Featured */}
          <div className="bg-white rounded-3xl shadow-lg border-2 border-gray-200 overflow-hidden hover:shadow-xl hover:border-gold/30 transition-all duration-300 flex flex-col">
            <div className="p-8 flex-1">
              <div className="w-14 h-14 bg-gold/10 rounded-2xl flex items-center justify-center mb-6">
                <Star className="w-7 h-7 text-gold" />
              </div>
              <h3 className="text-2xl font-bold text-navy mb-1">Featured Athlete</h3>
              <p className="text-gray-400 text-sm mb-4">Maximum visibility & support</p>
              <div className="flex items-baseline gap-2 mb-6">
                <span className="text-4xl font-bold text-navy">$250</span>
                <span className="text-lg text-gray-500">starting at</span>
              </div>
              <ul className="space-y-3">
                {featuredBenefits.map((b) => (
                  <li key={b} className="flex items-start gap-3">
                    <div className="w-5 h-5 bg-gold/20 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                      <Check className="w-3 h-3 text-gold" />
                    </div>
                    <span className="text-gray-700 text-sm leading-relaxed">{b}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="p-8 pt-0">
              <Link
                to="/contact"
                className="w-full bg-navy hover:bg-navy-light text-white px-6 py-4 rounded-xl font-semibold transition-all duration-200 shadow-md hover:shadow-lg flex items-center justify-center gap-2"
              >
                Get Featured — from $250
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>

        {/* Bottom action strip */}
        <div className="mt-14 max-w-4xl mx-auto grid sm:grid-cols-2 gap-4">

          {/* Sponsor CTA */}
          <div className="flex items-center gap-4 bg-navy rounded-2xl px-6 py-5">
            <div className="w-10 h-10 bg-gold/20 rounded-xl flex items-center justify-center flex-shrink-0">
              <Handshake className="w-5 h-5 text-gold" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-white font-bold text-sm">Sponsor an Athlete</p>
              <p className="text-gray-400 text-xs mt-0.5">Partner with us to fund Memphis youth sports</p>
            </div>
            <Link
              to="/sponsors"
              className="flex-shrink-0 inline-flex items-center gap-1.5 bg-gold hover:bg-gold-dark text-navy font-black text-xs px-4 py-2.5 rounded-xl transition-all duration-200 uppercase tracking-wide whitespace-nowrap"
            >
              Learn More
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {/* Jacob CTA */}
          <div className="flex items-center gap-4 bg-[#0a0e1a] border border-white/10 rounded-2xl px-6 py-5">
            <div className="flex-1 min-w-0">
              <p className="text-white font-bold text-sm">Want to support Jacob directly?</p>
              <p className="text-gray-400 text-xs mt-0.5">Visit his profile to choose your amount and see his full story.</p>
            </div>
            <Link
              to="/athletes/jacob-fouse"
              className="flex-shrink-0 inline-flex items-center gap-2 bg-amber-500 hover:bg-amber-400 text-white font-black text-xs px-5 py-2.5 rounded-xl transition-all duration-200 shadow-[0_0_16px_rgba(245,158,11,0.35)] hover:shadow-[0_0_28px_rgba(245,158,11,0.55)] uppercase tracking-wide whitespace-nowrap"
            >
              <Heart className="w-3.5 h-3.5" fill="white" />
              Jacob's Profile
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}

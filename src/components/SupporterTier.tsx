import { Check, Heart, Sparkles, Gift, Video, ArrowRight } from 'lucide-react';
import { STRIPE_LINKS } from '../config/stripeLinks';

const tier1Benefits = [
  'Help cover basics like team fees and small gear',
  'Includes weekly game updates + quick highlight clips',
];

const tier2Benefits = [
  'Boost training, travel, and development sessions',
  'Includes behind-the-scenes updates + early access to highlight reels',
];

const oneTimeBenefits = [
  'Make a one-time contribution toward a specific need',
  'Perfect for milestones, big games, or special moments',
];

interface SupporterTierProps {
  onNavigate?: (page: string, slug?: string) => void;
}

export default function SupporterTier({ onNavigate }: SupporterTierProps) {
  return (
    <section id="support" className="py-24 bg-white scroll-mt-20">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 bg-gold/20 text-gold-dark px-4 py-2 rounded-full text-sm font-semibold mb-6 border border-gold/30">
            <Heart className="w-4 h-4" />
            Choose How You Want to Support
          </div>

          <h2 className="text-4xl md:text-5xl font-bold text-navy mb-4 leading-tight">
            Support Starts at Less Than a Meal
          </h2>
          <p className="text-gray-500 text-lg">Pick what fits your budget—every level makes a real difference.</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
          <div className="bg-white rounded-3xl shadow-lg border-2 border-gray-200 overflow-hidden hover:shadow-2xl hover:border-gold/30 transition-all duration-300 flex flex-col">
            <div className="p-8 flex-1">
              <div className="w-14 h-14 bg-gold/10 rounded-2xl flex items-center justify-center mb-6">
                <Heart className="w-7 h-7 text-gold" />
              </div>

              <h3 className="text-2xl font-bold text-navy mb-2">
                Fan Support
              </h3>

              <div className="flex items-baseline gap-2 mb-6">
                <span className="text-4xl font-bold text-navy">$5</span>
                <span className="text-lg text-gray-600">/month</span>
              </div>

              <ul className="space-y-3 mb-8">
                {tier1Benefits.map((benefit, index) => (
                  <li key={index} className="flex items-start gap-3">
                    <div className="w-5 h-5 bg-gold/20 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                      <Check className="w-3 h-3 text-gold" />
                    </div>
                    <span className="text-gray-700 text-sm leading-relaxed">{benefit}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="p-8 pt-0">
              {STRIPE_LINKS.SUPPORT_JACOB_5 ? (
                <a
                  href={STRIPE_LINKS.SUPPORT_JACOB_5}
                  className="w-full btn-secondary px-6 py-4 rounded-xl block text-center"
                >
                  Fan Support — $5/month
                </a>
              ) : (
                <button disabled className="w-full btn-secondary px-6 py-4 rounded-xl opacity-50 cursor-not-allowed">Coming Soon</button>
              )}
            </div>
          </div>

          <div className="bg-white rounded-3xl shadow-xl border-4 border-gold overflow-hidden hover:shadow-2xl transition-all duration-300 flex flex-col relative transform lg:-translate-y-4">
            <div className="absolute top-0 left-0 right-0 bg-gold text-navy text-center py-2 text-sm font-bold flex items-center justify-center gap-1">
              <Sparkles className="w-4 h-4" />
              Most Popular
            </div>

            <div className="p-8 pt-16 flex-1">
              <div className="w-14 h-14 bg-gold/20 rounded-2xl flex items-center justify-center mb-6">
                <Heart className="w-7 h-7 text-gold" />
              </div>

              <h3 className="text-2xl font-bold text-navy mb-2">
                Athlete Booster
              </h3>

              <div className="flex items-baseline gap-2 mb-6">
                <span className="text-4xl font-bold text-navy">$10</span>
                <span className="text-lg text-gray-600">/month</span>
              </div>

              <ul className="space-y-3 mb-8">
                {tier2Benefits.map((benefit, index) => (
                  <li key={index} className="flex items-start gap-3">
                    <div className="w-5 h-5 bg-gold/20 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                      <Check className="w-3 h-3 text-gold" />
                    </div>
                    <span className="text-gray-700 text-sm leading-relaxed">{benefit}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="p-8 pt-0">
              {STRIPE_LINKS.SUPPORT_JACOB_10 ? (
                <a
                  href={STRIPE_LINKS.SUPPORT_JACOB_10}
                  className="w-full btn-primary px-6 py-4 rounded-xl block text-center"
                >
                  Athlete Booster — $10/month
                </a>
              ) : (
                <button disabled className="w-full btn-primary px-6 py-4 rounded-xl opacity-50 cursor-not-allowed">Coming Soon</button>
              )}
            </div>
          </div>

          <div className="bg-white rounded-3xl shadow-lg border-2 border-gray-200 overflow-hidden hover:shadow-2xl hover:border-gold/30 transition-all duration-300 flex flex-col">
            <div className="p-8 flex-1">
              <div className="w-14 h-14 bg-navy/10 rounded-2xl flex items-center justify-center mb-6">
                <Gift className="w-7 h-7 text-navy" />
              </div>

              <h3 className="text-2xl font-bold text-navy mb-2">
                One-Time Gift
              </h3>

              <div className="flex items-baseline gap-2 mb-6">
                <span className="text-2xl font-bold text-navy">Custom Amount</span>
              </div>

              <ul className="space-y-3 mb-8">
                {oneTimeBenefits.map((benefit, index) => (
                  <li key={index} className="flex items-start gap-3">
                    <div className="w-5 h-5 bg-navy/10 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                      <Check className="w-3 h-3 text-navy" />
                    </div>
                    <span className="text-gray-700 text-sm leading-relaxed">{benefit}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="p-8 pt-0 space-y-3">
              {STRIPE_LINKS.SUPPORT_JACOB_GIFT_20 ? (
                <a
                  href={STRIPE_LINKS.SUPPORT_JACOB_GIFT_20}
                  className="w-full bg-navy hover:bg-navy-light text-white px-6 py-3 rounded-xl font-semibold transition-all duration-200 shadow-md hover:shadow-lg flex items-center justify-center gap-2"
                >
                  <Video className="w-4 h-4" />
                  $20 Highlight Boost
                </a>
              ) : (
                <button disabled className="w-full bg-navy text-white px-6 py-3 rounded-xl font-semibold flex items-center justify-center gap-2 opacity-50 cursor-not-allowed">Coming Soon</button>
              )}
              {STRIPE_LINKS.SUPPORT_JACOB_GIFT_25 ? (
                <a
                  href={STRIPE_LINKS.SUPPORT_JACOB_GIFT_25}
                  className="w-full btn-secondary px-6 py-3 rounded-xl block text-center"
                >
                  Give $25 Gift
                </a>
              ) : (
                <button disabled className="w-full btn-secondary px-6 py-3 rounded-xl opacity-50 cursor-not-allowed">Coming Soon</button>
              )}
            </div>
          </div>
        </div>

        <div className="mt-12 text-center">
          <p className="text-gray-500 max-w-2xl mx-auto text-sm mb-6">
            Every contribution helps Jacob focus on what matters most — school, training, and achieving his goals.
          </p>
          <div className="inline-flex flex-col sm:flex-row items-center gap-3 bg-[#0a0e1a] border border-white/10 rounded-2xl px-6 py-4">
            <div className="text-left">
              <p className="text-white font-bold text-sm">Want to support Jacob directly?</p>
              <p className="text-gray-400 text-xs mt-0.5">Visit his profile to choose your amount and see his full story.</p>
            </div>
            <button
              onClick={() => onNavigate?.('jacob-fouse')}
              className="flex-shrink-0 inline-flex items-center gap-2 bg-amber-500 hover:bg-amber-400 text-white font-black text-xs px-5 py-2.5 rounded-xl transition-all duration-200 shadow-[0_0_16px_rgba(245,158,11,0.35)] hover:shadow-[0_0_28px_rgba(245,158,11,0.55)] uppercase tracking-wide whitespace-nowrap"
            >
              <Heart className="w-3.5 h-3.5" fill="white" />
              Jacob's Profile
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}

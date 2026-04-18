import { ArrowRight, Share2 } from 'lucide-react';
import type { Athlete } from '../types/athlete';
import { STRIPE_LINKS } from '../config/stripeLinks';

interface CTAStripProps {
  athlete: Athlete;
}

export default function CTAStrip({ athlete }: CTAStripProps) {
  const supportLink = athlete.stripe_payment_link || STRIPE_LINKS.SUPPORT_JACOB_5;

  return (
    <section className="py-20 bg-gradient-to-r from-navy via-navy-light to-navy text-white">
      <div className="max-w-4xl mx-auto px-6 lg:px-8 text-center">
        <h2 className="text-4xl md:text-5xl font-bold mb-6">
          Ready to Back the Journey?
        </h2>
        <p className="text-xl text-gray-300 mb-10 max-w-2xl mx-auto">
          Join {athlete.first_name}'s support team today and help power their season from training to game day.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          {supportLink ? (
            <a
              href={supportLink}
              className="group btn-primary text-lg px-10 py-4 flex items-center gap-2 hover:scale-105"
            >
              Join {athlete.first_name}'s $5 Support Team
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </a>
          ) : (
            <button disabled className="group btn-primary text-lg px-10 py-4 flex items-center gap-2 opacity-50 cursor-not-allowed">
              Support Coming Soon
            </button>
          )}

          <button className="group bg-white/10 hover:bg-white/20 text-white px-10 py-4 rounded-lg font-semibold text-lg transition-all duration-200 shadow-md hover:shadow-lg border-2 border-white/20 hover:border-white/40 flex items-center gap-2">
            <Share2 className="w-5 h-5" />
            Share This Page
          </button>
        </div>
      </div>
    </section>
  );
}

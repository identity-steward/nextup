import { ArrowRight } from 'lucide-react';
import { useEffect, useState } from 'react';
import type { Athlete } from '../types/athlete';
import { STRIPE_LINKS } from '../config/stripeLinks';

interface StickyСTAProps {
  athlete: Athlete;
}

export default function StickyCTA({ athlete }: StickyСTAProps) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const heroSection = document.querySelector('section');
      if (heroSection) {
        const heroBottom = heroSection.getBoundingClientRect().bottom;
        setIsVisible(heroBottom < 0);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 transform transition-transform duration-300 ease-in-out">
      <div className="bg-navy shadow-2xl border-t-2 border-gold">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between gap-3">
          <div className="flex-1 min-w-0">
            <p className="text-white font-semibold text-sm md:text-base truncate">
              Join {athlete.first_name}'s $5 Support Team
            </p>
            <p className="text-gray-300 text-xs hidden sm:block">
              Help cover fees, travel & training
            </p>
          </div>
          {(athlete.stripe_payment_link || STRIPE_LINKS.SUPPORT_JACOB_5) ? (
            <a
              href={athlete.stripe_payment_link || STRIPE_LINKS.SUPPORT_JACOB_5!}
              className="group btn-primary px-4 md:px-6 py-2.5 text-sm md:text-base flex items-center gap-2 whitespace-nowrap flex-shrink-0"
            >
              Support Now
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </a>
          ) : (
            <span className="px-4 md:px-6 py-2.5 text-sm text-gray-400 whitespace-nowrap flex-shrink-0">Coming soon</span>
          )}
        </div>
      </div>
    </div>
  );
}

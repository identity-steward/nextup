import { Heart, CheckCircle, ArrowRight, Clock } from 'lucide-react';
import { useEffect, useState } from 'react';

interface ThankYouPageProps {
  onNavigate: (page: string, slug?: string) => void;
}

export default function ThankYouPage({ onNavigate }: ThankYouPageProps) {
  const [athleteSlug, setAthleteSlug] = useState<string | null>(null);
  const [planName, setPlanName] = useState<string | null>(null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const slug = params.get('athlete');
    const plan = params.get('plan');
    if (slug) setAthleteSlug(slug);
    if (plan) setPlanName(plan.replace(/_/g, ' '));
  }, []);

  const handleViewProfile = () => {
    if (athleteSlug) {
      onNavigate('jacob-fouse');
    } else {
      onNavigate('athletes');
    }
  };

  return (
    <div className="min-h-screen bg-[#111318] flex flex-col items-center justify-center px-6 py-24 relative overflow-hidden">

      {/* Background glow */}
      <div
        className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[500px] pointer-events-none"
        style={{ background: 'radial-gradient(ellipse at center, rgba(245,158,11,0.10) 0%, transparent 65%)' }}
      />

      <div className="relative max-w-lg w-full text-center">

        {/* Success icon */}
        <div className="flex justify-center mb-8">
          <div
            className="w-24 h-24 rounded-full flex items-center justify-center"
            style={{
              background: 'linear-gradient(135deg, rgba(245,158,11,0.15), rgba(245,158,11,0.05))',
              border: '1px solid rgba(245,158,11,0.3)',
              boxShadow: '0 0 60px rgba(245,158,11,0.2)',
            }}
          >
            <CheckCircle className="w-12 h-12 text-amber-400" />
          </div>
        </div>

        {/* Headline */}
        <h1 className="text-4xl md:text-5xl font-black text-white leading-tight tracking-tight mb-4">
          You're In.
          <br />
          <span
            className="text-transparent bg-clip-text"
            style={{ backgroundImage: 'linear-gradient(90deg, #fbbf24, #f59e0b)' }}
          >
            Thank You.
          </span>
        </h1>

        {planName && (
          <p className="text-amber-400 text-sm font-bold uppercase tracking-widest mb-4">
            {planName}
          </p>
        )}

        <p className="text-white/55 text-lg leading-relaxed mb-4 max-w-sm mx-auto">
          Your support means everything. Every contribution goes directly to helping an athlete chase their goals.
        </p>

        {/* Sync note */}
        <div className="inline-flex items-center gap-2 bg-white/5 border border-white/10 rounded-full px-5 py-2.5 mb-10">
          <Clock className="w-3.5 h-3.5 text-white/40" />
          <p className="text-white/40 text-xs">
            Supporter status may take a few seconds to sync — refresh if needed.
          </p>
        </div>

        {/* What happens next */}
        <div
          className="rounded-2xl p-6 mb-8 text-left"
          style={{
            background: '#161b24',
            border: '1px solid rgba(245,158,11,0.15)',
          }}
        >
          <p className="text-amber-400 text-[10px] font-black uppercase tracking-[0.18em] mb-4">What happens next</p>
          <ul className="space-y-3">
            {[
              'You\'ll receive a Stripe receipt at your email',
              'Your supporter status will be active within moments',
              'The athlete will see your support reflected on their profile',
              'You\'ll get updates as the season progresses',
            ].map((item, i) => (
              <li key={i} className="flex items-start gap-3">
                <div className="w-5 h-5 rounded-full bg-amber-500/15 border border-amber-500/25 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <Heart className="w-2.5 h-2.5 text-amber-400" fill="currentColor" />
                </div>
                <span className="text-white/50 text-sm leading-relaxed">{item}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* CTAs */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button
            onClick={handleViewProfile}
            className="group relative inline-flex items-center justify-center gap-2.5 text-white font-black text-base px-8 py-4 rounded-2xl transition-all duration-300 uppercase tracking-[0.06em] overflow-hidden active:scale-[0.98]"
            style={{
              background: 'linear-gradient(135deg, #d97706, #f59e0b)',
              boxShadow: '0 0 40px rgba(245,158,11,0.4), 0 6px 20px rgba(0,0,0,0.5)',
            }}
          >
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/15 to-transparent translate-x-[-200%] group-hover:translate-x-[200%] transition-transform duration-700" />
            <Heart className="w-4 h-4 flex-shrink-0" fill="white" />
            View Athlete Profile
          </button>

          <button
            onClick={() => onNavigate('home')}
            className="inline-flex items-center justify-center gap-2 bg-white/6 hover:bg-white/10 border border-white/12 hover:border-white/22 text-white/55 hover:text-white font-semibold text-sm px-8 py-4 rounded-2xl transition-all duration-300"
          >
            Back to Home
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}

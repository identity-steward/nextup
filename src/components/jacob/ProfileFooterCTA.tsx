import { Heart, ArrowRight, Clock } from 'lucide-react';

interface ProfileFooterCTAProps {
  onSupportClick: () => void;
  onNavigate?: (page: string) => void;
}

export default function ProfileFooterCTA({ onSupportClick, onNavigate }: ProfileFooterCTAProps) {
  return (
    <section className="relative py-28 overflow-hidden" style={{ background: '#0e1016' }}>
      <div className="absolute top-0 left-0 right-0 h-px" style={{ background: 'linear-gradient(90deg, transparent, rgba(245,158,11,0.4), transparent)' }} />

      {/* Background image */}
      <div className="absolute inset-0">
        <img
          src="https://images.pexels.com/photos/1752757/pexels-photo-1752757.jpeg?auto=compress&cs=tinysrgb&w=1200"
          alt=""
          className="w-full h-full object-cover object-center"
          style={{ filter: 'brightness(0.07) saturate(0.3)' }}
        />
      </div>

      {/* Warm center glow */}
      <div
        className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[500px] pointer-events-none"
        style={{ background: 'radial-gradient(ellipse at center, rgba(245,158,11,0.10) 0%, transparent 65%)' }}
      />

      <div className="relative max-w-xl mx-auto px-6 lg:px-8 text-center">

        {/* Eyebrow */}
        <div className="inline-flex items-center gap-2 bg-amber-500/10 border border-amber-500/20 rounded-full px-4 py-2 mb-8">
          <Clock className="w-3.5 h-3.5 text-amber-400" />
          <span className="text-amber-300 text-[11px] font-black uppercase tracking-[0.18em]">April 18–19 Tournament</span>
        </div>

        {/* Headline */}
        <h2 className="text-5xl md:text-6xl font-black text-white leading-[0.9] tracking-tight mb-6">
          Be Early.
          <br />
          <span className="text-transparent bg-clip-text" style={{ backgroundImage: 'linear-gradient(90deg, #fbbf24, #f59e0b, #d97706)' }}>
            Support the Journey.
          </span>
        </h2>

        {/* Body */}
        <p className="text-white/40 text-lg leading-relaxed mb-3 max-w-sm mx-auto">
          The players people talk about later were supported early.
        </p>
        <p className="text-white/25 text-base leading-relaxed mb-12 max-w-xs mx-auto">
          Jacob is at that stage right now. Don't miss it.
        </p>

        {/* CTAs */}
        <div className="flex flex-col sm:flex-row justify-center gap-4">
          <button
            onClick={onSupportClick}
            className="group relative inline-flex items-center justify-center gap-2.5 text-white font-black text-base px-10 py-5 rounded-2xl transition-all duration-300 uppercase tracking-[0.08em] overflow-hidden active:scale-[0.98] w-full sm:w-auto"
            style={{
              background: 'linear-gradient(135deg, #d97706, #f59e0b)',
              boxShadow: '0 0 56px rgba(245,158,11,0.5), 0 6px 24px rgba(0,0,0,0.5)',
            }}
          >
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/15 to-transparent translate-x-[-200%] group-hover:translate-x-[200%] transition-transform duration-700" />
            <Heart className="w-5 h-5 flex-shrink-0" fill="white" />
            Support Jacob
          </button>
          <button
            onClick={() => onNavigate?.('athletes')}
            className="inline-flex items-center justify-center gap-2 bg-white/6 hover:bg-white/10 border border-white/12 hover:border-white/22 text-white/55 hover:text-white font-semibold text-sm px-8 py-5 rounded-2xl transition-all duration-300 w-full sm:w-auto"
          >
            Browse Athletes
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        {/* Quiet note */}
        <p className="text-white/15 text-xs mt-8">
          Every contribution goes directly toward Jacob's training and tournament travel.
        </p>
      </div>
    </section>
  );
}

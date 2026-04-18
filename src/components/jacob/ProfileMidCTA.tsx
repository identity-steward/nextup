import { Heart, Shield, CheckCircle } from 'lucide-react';

interface ProfileMidCTAProps {
  raised: number;
  goal: number;
  progressPct: number;
  onSupportClick: () => void;
}

export default function ProfileMidCTA({ raised, goal, progressPct, onSupportClick }: ProfileMidCTAProps) {
  return (
    <section className="relative py-14 overflow-hidden" style={{ background: '#07090f' }}>
      <div className="absolute top-0 left-0 right-0 h-px" style={{ background: 'linear-gradient(90deg, transparent, rgba(245,158,11,0.3), transparent)' }} />
      <div className="absolute bottom-0 left-0 right-0 h-px" style={{ background: 'linear-gradient(90deg, transparent, rgba(245,158,11,0.2), transparent)' }} />

      {/* Background glow */}
      <div
        className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[200px] pointer-events-none"
        style={{ background: 'radial-gradient(ellipse at center, rgba(245,158,11,0.07) 0%, transparent 70%)' }}
      />

      <div className="relative max-w-3xl mx-auto px-6 lg:px-8">
        <div className="flex flex-col md:flex-row items-center gap-8 md:gap-12">

          {/* Left — Text */}
          <div className="flex-1 text-center md:text-left">
            <p className="text-amber-400 text-[10px] font-black uppercase tracking-[0.2em] mb-2">April 18–19 Tournament</p>
            <h3 className="text-2xl md:text-3xl font-black text-white leading-tight mb-2">
              Help Jacob Compete
            </h3>
            <p className="text-white/40 text-sm leading-relaxed">
              Every contribution brings him closer to the courts that matter.
            </p>

            {/* Progress inline */}
            <div className="mt-4 max-w-xs mx-auto md:mx-0">
              <div className="flex justify-between text-[11px] mb-1.5">
                <span className="text-amber-400 font-bold">${raised} raised</span>
                <span className="text-white/25">of ${goal}</span>
              </div>
              <div className="h-1.5 bg-white/8 rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full"
                  style={{
                    width: `${progressPct}%`,
                    background: 'linear-gradient(90deg, #d97706, #fbbf24)',
                  }}
                />
              </div>
            </div>
          </div>

          {/* Right — CTA + trust */}
          <div className="flex flex-col items-center gap-3 w-full md:w-auto flex-shrink-0">
            <button
              onClick={onSupportClick}
              className="group relative inline-flex items-center justify-center gap-2.5 text-white font-black text-base px-10 py-5 rounded-2xl transition-all duration-300 uppercase tracking-[0.08em] overflow-hidden w-full md:w-auto active:scale-[0.98]"
              style={{
                background: 'linear-gradient(135deg, #f59e0b, #d97706)',
                boxShadow: '0 0 40px rgba(245,158,11,0.5), 0 4px 20px rgba(0,0,0,0.4)',
              }}
            >
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/15 to-transparent translate-x-[-200%] group-hover:translate-x-[200%] transition-transform duration-700" />
              <Heart className="w-5 h-5 flex-shrink-0" fill="white" />
              Support Jacob
            </button>

            {/* Trust micro-row */}
            <div className="flex items-center gap-3 text-[11px] text-white/25">
              <span className="flex items-center gap-1">
                <Shield className="w-3 h-3 text-emerald-500/60" />
                Secure
              </span>
              <span className="w-1 h-1 rounded-full bg-white/15" />
              <span className="flex items-center gap-1">
                <CheckCircle className="w-3 h-3 text-emerald-500/60" />
                Family-approved
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

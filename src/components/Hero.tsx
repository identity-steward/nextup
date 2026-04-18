import { ArrowRight, Users } from 'lucide-react';

interface HeroProps {
  onNavigate?: (page: string, slug?: string) => void;
}

export default function Hero({ onNavigate }: HeroProps) {
  return (
    <section className="relative min-h-screen flex items-center overflow-hidden bg-[#0a0e1a]">
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage:
            'url(https://images.pexels.com/photos/2834917/pexels-photo-2834917.jpeg?auto=compress&cs=tinysrgb&w=1920&q=80)',
        }}
      />
      <div className="absolute inset-0 bg-gradient-to-r from-[#0a0e1a]/95 via-[#0a0e1a]/80 to-[#0a0e1a]/50" />
      <div className="absolute inset-0 bg-gradient-to-t from-[#0a0e1a] via-transparent to-transparent" />

      <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-transparent via-sky-500 to-transparent opacity-60" />
      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-sky-500/40 to-transparent" />

      <div className="relative z-10 max-w-7xl mx-auto px-6 lg:px-8 w-full pt-28 pb-20">
        <div className="max-w-3xl">
          <div className="inline-flex items-center gap-2 bg-sky-500/15 border border-sky-500/30 text-sky-400 px-4 py-2 rounded-full text-xs font-bold uppercase tracking-widest mb-8">
            <span className="w-2 h-2 rounded-full bg-sky-400 animate-pulse" />
            Youth Athlete Network
          </div>

          <h1 className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-black text-white leading-[0.92] tracking-tight mb-7">
            Support Real Memphis
            <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-sky-400 to-blue-500">
              Athletes Building
            </span>
            <br />
            Their Future
          </h1>

          <p className="text-lg md:text-xl text-gray-300 leading-relaxed mb-5 max-w-xl">
            From training to tournaments—be part of their journey.
          </p>

          <p className="text-sm text-gray-400 leading-relaxed mb-10 max-w-xl border-l-2 border-sky-500/50 pl-4">
            Parent-managed profiles. Safe visibility. Support goes directly toward training, travel, and development.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
            <button
              onClick={() => onNavigate?.('jacob-fouse')}
              className="group flex items-center gap-2 bg-amber-500 hover:bg-amber-400 text-white font-black text-base px-9 py-4 rounded-lg transition-all duration-200 hover:scale-105 hover:shadow-[0_0_40px_rgba(245,158,11,0.55)] uppercase tracking-wide ring-2 ring-amber-400/30 ring-offset-2 ring-offset-transparent"
            >
              Support Jacob Now
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </button>

            <button
              onClick={() => onNavigate?.('join')}
              className="group flex items-center gap-2 bg-white/10 hover:bg-white/20 border border-white/20 hover:border-white/40 text-white font-bold text-base px-8 py-4 rounded-lg transition-all duration-200 uppercase tracking-wide"
            >
              <Users className="w-5 h-5" />
              Start Athlete Profile
            </button>
          </div>
        </div>

        <div className="absolute right-6 lg:right-16 bottom-12 hidden lg:flex flex-col gap-3 items-end">
          {['Basketball', 'Football', 'Track & Field', 'Soccer'].map((sport) => (
            <div
              key={sport}
              className="text-xs font-bold uppercase tracking-widest text-gray-500 hover:text-sky-400 transition-colors cursor-default"
            >
              {sport}
            </div>
          ))}
        </div>
      </div>

      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 animate-bounce">
        <div className="w-px h-8 bg-gradient-to-b from-sky-500/60 to-transparent" />
        <div className="w-1.5 h-1.5 rounded-full bg-sky-500/60" />
      </div>
    </section>
  );
}

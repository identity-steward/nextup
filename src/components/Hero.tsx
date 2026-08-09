import { ArrowRight, ArrowDown } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Hero() {
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

      <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-transparent via-gold/40 to-transparent opacity-60" />
      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-gold/40 to-transparent" />

      <div className="relative z-10 max-w-7xl mx-auto px-6 lg:px-8 w-full pt-28 pb-20">
        <div className="max-w-3xl">
          <div className="inline-flex items-center gap-2 bg-gold/15 border border-gold/30 text-gold px-4 py-2 rounded-full text-xs font-bold uppercase tracking-widest mb-8">
            <span className="w-2 h-2 rounded-full bg-gold animate-pulse" />
            NextUp Memphis
          </div>

          <h1 className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-black text-white leading-[0.92] tracking-tight mb-7">
            You don't have to
            <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-gold to-amber-400">
              know the system.
            </span>
          </h1>

          <p className="text-2xl md:text-3xl text-gray-200 leading-relaxed mb-5 max-w-xl font-medium">
            Start with what's happening.
          </p>

          <p className="text-sm text-gray-400 leading-relaxed mb-10 max-w-xl border-l-2 border-gold/50 pl-4">
            NextUp helps people understand what's happening, identify possible
            next steps, connect with the systems and opportunities that can
            help, and keep track of what happens next.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
            <Link
              to="/start"
              className="group flex items-center gap-2 bg-gold hover:bg-amber-400 text-navy font-black text-base px-9 py-4 rounded-lg transition-all duration-200 hover:scale-105 hover:shadow-[0_0_40px_rgba(212,175,55,0.55)] uppercase tracking-wide ring-2 ring-gold/30 ring-offset-2 ring-offset-transparent"
            >
              Start My NextUp
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>

            <Link
              to="/how-it-works"
              className="group flex items-center gap-2 bg-white/10 hover:bg-white/20 border border-white/20 hover:border-white/40 text-white font-bold text-base px-8 py-4 rounded-lg transition-all duration-200 uppercase tracking-wide"
            >
              See How It Works
              <ArrowDown className="w-5 h-5 group-hover:translate-y-1 transition-transform" />
            </Link>
          </div>
        </div>
      </div>

      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 animate-bounce">
        <div className="w-px h-8 bg-gradient-to-b from-gold/60 to-transparent" />
        <div className="w-1.5 h-1.5 rounded-full bg-gold/60" />
      </div>
    </section>
  );
}

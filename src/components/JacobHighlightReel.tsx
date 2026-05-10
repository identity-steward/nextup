import { Heart, ArrowRight, BadgeCheck } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function JacobHighlightReel() {
  return (
    <section className="py-14 bg-[#0a0e1a] border-t border-white/5">
      <div className="max-w-2xl mx-auto px-6 lg:px-8">

        <div className="flex items-center gap-3 mb-5">
          <div className="w-px h-8 bg-sky-500 flex-shrink-0" />
          <div>
            <p className="text-sky-400 text-xs font-black uppercase tracking-widest mb-0.5">Game Highlights</p>
            <h2 className="text-2xl md:text-3xl font-black text-white leading-tight">Watch Jacob in Action</h2>
          </div>
        </div>

        <p className="text-gray-400 text-sm mb-6 pl-4">
          Already getting recognition — now help him go further.
        </p>

        <div className="relative mb-6">
          <div className="absolute -inset-2 bg-sky-500/5 rounded-3xl blur-xl pointer-events-none" />
          <div className="relative rounded-2xl overflow-hidden border border-white/10 shadow-[0_4px_40px_rgba(0,0,0,0.6),0_0_0_1px_rgba(14,165,233,0.07)] bg-[#060910]">
            <div className="flex items-center justify-between px-4 py-2.5 border-b border-white/8 bg-white/[0.02]">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-sky-400 animate-pulse" />
                <span className="text-xs font-bold text-white/60 uppercase tracking-widest">NextPro Highlight</span>
              </div>
              <div className="flex items-center gap-1.5">
                <BadgeCheck className="w-3.5 h-3.5 text-sky-400" />
                <span className="text-xs text-white/30">Memphis AAU Circuit</span>
              </div>
            </div>

            <div className="relative" style={{ paddingBottom: '177.78%' }}>
              <iframe
                src="https://www.instagram.com/reel/DV4BcPgEdOk/embed/"
                className="absolute inset-0 w-full h-full"
                frameBorder="0"
                scrolling="no"
                allowTransparency
                allowFullScreen
                title="Jacob basketball highlights"
                loading="lazy"
              />
            </div>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <Link
            to="/athletes/jacob-fouse"
            className="flex-1 inline-flex items-center justify-center gap-2 bg-amber-500 hover:bg-amber-400 text-white font-black text-sm px-8 py-3.5 rounded-xl transition-all duration-200 shadow-[0_0_24px_rgba(245,158,11,0.4)] hover:shadow-[0_0_40px_rgba(245,158,11,0.6)] uppercase tracking-wide"
          >
            <Heart className="w-4 h-4" fill="white" />
            Support Jacob
          </Link>
          <Link
            to="/athletes/jacob-fouse"
            className="inline-flex items-center justify-center gap-2 bg-white/[0.05] hover:bg-white/[0.09] border border-white/10 hover:border-white/20 text-white/70 hover:text-white font-semibold text-sm px-6 py-3.5 rounded-xl transition-all duration-200"
          >
            View Profile
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </section>
  );
}

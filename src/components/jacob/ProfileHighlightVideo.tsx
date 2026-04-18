import { Play, ExternalLink, Eye } from 'lucide-react';

export default function ProfileHighlightVideo() {
  return (
    <section id="highlights" className="relative py-24 scroll-mt-16 overflow-hidden" style={{ background: '#07090f' }}>

      <div className="absolute top-0 left-0 right-0 h-px" style={{ background: 'linear-gradient(90deg, transparent, rgba(56,189,248,0.4), transparent)' }} />

      {/* Ambient glow */}
      <div
        className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[1000px] h-[600px] pointer-events-none"
        style={{ background: 'radial-gradient(ellipse at center, rgba(14,165,233,0.09) 0%, transparent 65%)' }}
      />

      <div className="relative max-w-5xl mx-auto px-6 lg:px-8">

        {/* Section header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-14">
          <div>
            <p className="text-sky-400 text-[10px] font-black uppercase tracking-[0.2em] mb-3">
              Spotlight Reel
            </p>
            <h2 className="text-4xl md:text-5xl font-black text-white leading-none tracking-tight">
              See Why People
              <br />
              <span className="text-transparent bg-clip-text" style={{ backgroundImage: 'linear-gradient(90deg, #38bdf8, #0ea5e9)' }}>
                Are Watching
              </span>
            </h2>
            <p className="text-white/35 text-sm mt-4 max-w-sm leading-relaxed">
              This is Jacob on the court — no hype, just game. Judge for yourself.
            </p>
          </div>
          <div className="flex items-center gap-2 text-white/25 text-xs font-bold uppercase tracking-wider shrink-0">
            <Eye className="w-3.5 h-3.5 text-sky-400/60" />
            Memphis AAU Circuit &nbsp;&bull;&nbsp; 2025
          </div>
        </div>

        {/* Main video card */}
        <div className="grid lg:grid-cols-[1fr_300px] gap-6 items-start">

          {/* Video embed */}
          <div className="relative group">
            {/* Hover halo */}
            <div
              className="absolute -inset-6 rounded-3xl pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-700"
              style={{ background: 'radial-gradient(ellipse at center, rgba(14,165,233,0.1) 0%, transparent 70%)' }}
            />

            {/* Corner brackets */}
            <div className="absolute -top-3 -left-3 w-6 h-6 border-t-2 border-l-2 border-sky-500/40 rounded-tl z-10" />
            <div className="absolute -top-3 -right-3 w-6 h-6 border-t-2 border-r-2 border-sky-500/40 rounded-tr z-10" />
            <div className="absolute -bottom-3 -left-3 w-6 h-6 border-b-2 border-l-2 border-sky-500/25 rounded-bl z-10" />
            <div className="absolute -bottom-3 -right-3 w-6 h-6 border-b-2 border-r-2 border-sky-500/25 rounded-br z-10" />

            <div
              className="relative rounded-2xl overflow-hidden"
              style={{
                border: '1px solid rgba(56,189,248,0.14)',
                boxShadow: '0 0 0 1px rgba(255,255,255,0.03), 0 32px 80px rgba(0,0,0,0.85), 0 0 40px rgba(14,165,233,0.06)',
                background: '#060810',
              }}
            >
              {/* Chrome bar */}
              <div className="flex items-center justify-between px-5 py-4 border-b border-white/8 bg-white/[0.025]">
                <div className="flex items-center gap-3">
                  <div className="flex gap-1.5">
                    <div className="w-2.5 h-2.5 rounded-full bg-rose-500/60" />
                    <div className="w-2.5 h-2.5 rounded-full bg-amber-500/60" />
                    <div className="w-2.5 h-2.5 rounded-full bg-emerald-500/60" />
                  </div>
                  <div className="w-px h-4 bg-white/8" />
                  <div className="flex items-center gap-2">
                    <Play className="w-3 h-3 text-sky-400" fill="rgba(56,189,248,0.8)" />
                    <span className="text-[11px] font-black text-white/60 uppercase tracking-[0.14em]">Official Highlight — Jacob Fouse</span>
                  </div>
                </div>
                <button className="flex items-center gap-1.5 text-white/20 hover:text-white/50 transition-colors text-[10px] font-bold uppercase tracking-wider">
                  <ExternalLink className="w-3 h-3" />
                  Open
                </button>
              </div>

              {/* Embed */}
              <div className="relative" style={{ paddingBottom: '177.78%' }}>
                <iframe
                  src="https://www.instagram.com/reel/DV4BcPgEdOk/embed/"
                  className="absolute inset-0 w-full h-full"
                  frameBorder="0"
                  scrolling="no"
                  allowTransparency
                  allowFullScreen
                  title="Jacob Fouse basketball highlights"
                  loading="lazy"
                />
              </div>
            </div>
          </div>

          {/* Side panel */}
          <div className="flex flex-col gap-4">

            {/* Scouting context */}
            <div className="bg-white/[0.04] border border-white/8 rounded-2xl p-5 hover:border-white/12 transition-colors">
              <p className="text-[10px] text-white/30 uppercase tracking-[0.14em] mb-3">Game Context</p>
              <p className="text-white font-black text-lg leading-tight mb-1">Spring AAU Run</p>
              <p className="text-white/35 text-sm mb-4">Memphis, TN &nbsp;&bull;&nbsp; 2025 Season</p>
              <div className="space-y-2.5">
                {[
                  { label: 'Circuit', value: 'AAU Basketball' },
                  { label: 'Level', value: '8th Grade' },
                  { label: 'Role', value: 'Starting Guard' },
                ].map(({ label, value }) => (
                  <div key={label} className="flex items-center justify-between">
                    <span className="text-white/30 text-xs">{label}</span>
                    <span className="text-white text-xs font-bold">{value}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* What to look for */}
            <div className="bg-sky-500/6 border border-sky-500/18 rounded-2xl p-5">
              <p className="text-sky-400 text-[10px] font-black uppercase tracking-[0.14em] mb-3">What to Watch</p>
              <ul className="space-y-3">
                {[
                  { label: 'Handle in traffic', note: 'Pull-up mid-range under pressure' },
                  { label: 'Court vision', note: 'Look for the no-look passes' },
                  { label: 'On-ball defense', note: 'Intensity and positioning' },
                ].map(({ label, note }) => (
                  <li key={label} className="flex items-start gap-2.5">
                    <span className="w-1 h-1 rounded-full bg-sky-400 mt-2 flex-shrink-0" />
                    <div>
                      <p className="text-white/70 text-xs font-bold">{label}</p>
                      <p className="text-white/30 text-[11px]">{note}</p>
                    </div>
                  </li>
                ))}
              </ul>
            </div>

            {/* Live note */}
            <div className="border border-dashed border-white/8 rounded-2xl p-5 text-center">
              <p className="text-white/20 text-xs leading-relaxed">
                New clips added as the season progresses
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

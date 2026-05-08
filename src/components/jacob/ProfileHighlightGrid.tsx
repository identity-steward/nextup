import { Play, Calendar, Dumbbell, Trophy, ArrowRight } from 'lucide-react';

const highlights = [
  {
    type: 'Game Clip',
    label: 'Quarterfinal Win',
    title: 'Spring Invitational — Quarterfinal',
    meta: 'Apr 10, 2025 · Memphis, TN',
    stat: '22 PTS · 6 AST',
    description: 'Knocked down 3 from deep in the second half to seal the win for his squad.',
    icon: Play,
    accent: 'sky' as const,
    img: 'https://images.pexels.com/photos/1752757/pexels-photo-1752757.jpeg?auto=compress&cs=tinysrgb&w=800',
    featured: true,
  },
  {
    type: 'Tournament',
    label: 'Regional Qualifier',
    title: 'AAU Circuit — Regional Qualifier',
    meta: 'Mar 29, 2025 · Nashville, TN',
    stat: 'Round of 16',
    description: 'Helped his squad advance with back-to-back strong defensive performances.',
    icon: Trophy,
    accent: 'amber' as const,
    img: 'https://images.pexels.com/photos/974506/pexels-photo-974506.jpeg?auto=compress&cs=tinysrgb&w=800',
    featured: false,
  },
  {
    type: 'Upcoming',
    label: 'Next Event',
    title: 'Memphis AAU Spring Invitational',
    meta: 'Apr 18–19, 2025 · Memphis, TN',
    stat: 'Registered',
    description: 'Scouts and college program evaluators expected in attendance.',
    icon: Calendar,
    accent: 'rose' as const,
    img: 'https://images.pexels.com/photos/3755440/pexels-photo-3755440.jpeg?auto=compress&cs=tinysrgb&w=800',
    featured: false,
  },
  {
    type: 'Training',
    label: 'Development Camp',
    title: 'Pre-Season Development Camp',
    meta: 'Mar 1–15, 2025 · Memphis, TN',
    stat: '2-Week Intensive',
    description: 'Focused on guard positioning, shooting mechanics, and advanced footwork.',
    icon: Dumbbell,
    accent: 'emerald' as const,
    img: 'https://images.pexels.com/photos/1752757/pexels-photo-1752757.jpeg?auto=compress&cs=tinysrgb&w=800',
    featured: false,
  },
];

const accentConfig = {
  sky: {
    badge: 'bg-sky-500/20 border-sky-500/30 text-sky-300',
    stat: 'text-sky-400',
    hover: 'group-hover:border-sky-500/30',
    overlay: 'from-sky-500/10',
  },
  amber: {
    badge: 'bg-amber-500/20 border-amber-500/30 text-amber-300',
    stat: 'text-amber-400',
    hover: 'group-hover:border-amber-500/30',
    overlay: 'from-amber-500/10',
  },
  rose: {
    badge: 'bg-rose-500/20 border-rose-500/30 text-rose-300',
    stat: 'text-rose-400',
    hover: 'group-hover:border-rose-500/30',
    overlay: 'from-rose-500/10',
  },
  emerald: {
    badge: 'bg-emerald-500/20 border-emerald-500/30 text-emerald-300',
    stat: 'text-emerald-400',
    hover: 'group-hover:border-emerald-500/30',
    overlay: 'from-emerald-500/10',
  },
};

export default function ProfileHighlightGrid() {
  const [featured, ...rest] = highlights;
  const fc = accentConfig[featured.accent];
  const FeaturedIcon = featured.icon;

  return (
    <section className="relative py-20 overflow-hidden" style={{ background: '#1e2230' }}>
      <div className="absolute top-0 left-0 right-0 h-px" style={{ background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.1), transparent)' }} />

      <div className="relative max-w-5xl mx-auto px-6 lg:px-8">

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-12">
          <div>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-0.5 h-8 rounded-full" style={{ background: 'linear-gradient(to bottom, #38bdf8, rgba(14,165,233,0.2))', boxShadow: '0 0 10px rgba(56,189,248,0.5)' }} />
              <p className="text-sky-400 text-[10px] font-black uppercase tracking-[0.2em]">Recent Activity</p>
            </div>
            <h2 className="text-4xl md:text-5xl font-black text-white leading-none tracking-tight">
              Highlight
              <br />
              <span className="text-white/25">Reel</span>
            </h2>
          </div>
          <button className="inline-flex items-center gap-2 text-white/30 hover:text-white/60 text-xs font-bold uppercase tracking-wider transition-colors shrink-0">
            View All
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Grid layout — featured large + 3 smaller */}
        <div className="grid lg:grid-cols-[1.6fr_1fr] gap-4 lg:gap-5">

          {/* Featured card */}
          <div className={`group relative rounded-2xl overflow-hidden border border-white/8 ${fc.hover} transition-all duration-300 cursor-pointer`}
            style={{ boxShadow: '0 8px 40px rgba(0,0,0,0.5)' }}
          >
            {/* Image */}
            <div className="relative h-72 lg:h-80 overflow-hidden">
              <img
                src={featured.img}
                alt={featured.title}
                className="w-full h-full object-cover group-hover:scale-[1.04] transition-transform duration-700"
                style={{ filter: 'brightness(0.55) saturate(0.7)' }}
              />
              <div className={`absolute inset-0 bg-gradient-to-t ${fc.overlay} via-transparent to-transparent opacity-60`} />
              <div className="absolute inset-0 bg-gradient-to-t from-[#1e2230] via-[#1e2230]/30 to-transparent" />

              {/* Play button overlay */}
              <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <div className="w-16 h-16 rounded-full bg-white/15 backdrop-blur-sm border border-white/25 flex items-center justify-center">
                  <Play className="w-7 h-7 text-white ml-1" fill="white" />
                </div>
              </div>

              {/* Type badge */}
              <div className="absolute top-4 left-4">
                <span className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-wider border backdrop-blur-sm ${fc.badge}`}>
                  <FeaturedIcon className="w-3 h-3" />
                  {featured.type}
                </span>
              </div>

              {/* Stat badge */}
              <div className="absolute top-4 right-4">
                <span className="inline-flex items-center bg-[#1e2230]/80 backdrop-blur-sm border border-white/15 text-white text-xs font-black px-3 py-1.5 rounded-xl">
                  {featured.stat}
                </span>
              </div>
            </div>

            {/* Content */}
            <div className="p-5 bg-white/[0.02]">
              <p className="text-[10px] text-white/25 mb-1.5 uppercase tracking-wider">{featured.meta}</p>
              <h3 className="text-white font-black text-lg leading-tight mb-2">{featured.title}</h3>
              <p className="text-white/40 text-sm leading-relaxed">{featured.description}</p>
            </div>
          </div>

          {/* Right column — 3 stacked cards */}
          <div className="flex flex-col gap-4 lg:gap-5">
            {rest.map(({ type, title, meta, stat, description, icon: Icon, accent, img }) => {
              const c = accentConfig[accent];
              return (
                <div
                  key={title}
                  className={`group relative rounded-2xl overflow-hidden border border-white/8 ${c.hover} transition-all duration-300 cursor-pointer flex flex-col`}
                  style={{ boxShadow: '0 4px 20px rgba(0,0,0,0.4)' }}
                >
                  {/* Thumbnail strip */}
                  <div className="relative h-28 overflow-hidden flex-shrink-0">
                    <img
                      src={img}
                      alt={title}
                      className="w-full h-full object-cover group-hover:scale-[1.06] transition-transform duration-600"
                      style={{ filter: 'brightness(0.45) saturate(0.6)' }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-r from-[#1e2230]/70 via-transparent to-transparent" />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#1e2230] via-transparent to-transparent" />

                    {/* Type badge */}
                    <div className="absolute top-3 left-3">
                      <span className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-lg text-[9px] font-black uppercase tracking-wider border backdrop-blur-sm ${c.badge}`}>
                        <Icon className="w-2.5 h-2.5" />
                        {type}
                      </span>
                    </div>

                    {/* Stat */}
                    <div className="absolute bottom-3 right-3">
                      <span className={`text-xs font-black ${c.stat}`}>{stat}</span>
                    </div>
                  </div>

                  {/* Content */}
                  <div className="p-4 bg-white/[0.02] flex-1">
                    <p className="text-[10px] text-white/20 mb-1 uppercase tracking-wider">{meta}</p>
                    <h3 className="text-white font-bold text-sm leading-snug mb-1.5">{title}</h3>
                    <p className="text-white/35 text-xs leading-relaxed line-clamp-2">{description}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}

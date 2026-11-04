import { Play, Calendar, Dumbbell, Trophy, ArrowRight } from 'lucide-react';
import type { Athlete } from '../../types/athlete';

interface ApprovedMediaItem {
  id: string;
  media_type: string;
  signedUrl: string | null;
  caption: string | null;
  featured: boolean;
}

interface ProfileHighlightGridProps {
  media: ApprovedMediaItem[];
  athlete: Athlete;
}

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

const ICONS = {
  photo: Play,
  video: Play,
  default: Dumbbell,
} as const;

export default function ProfileHighlightGrid({ media, athlete: _athlete }: ProfileHighlightGridProps) {
  if (media.length === 0) {
    return (
      <section className="relative py-20 overflow-hidden" style={{ background: '#1e2230' }}>
        <div className="relative max-w-5xl mx-auto px-6 lg:px-8 text-center">
          <div className="flex items-center gap-3 mb-4 justify-center">
            <div className="w-0.5 h-8 rounded-full" style={{ background: 'linear-gradient(to bottom, #38bdf8, rgba(14,165,233,0.2))', boxShadow: '0 0 10px rgba(56,189,248,0.5)' }} />
            <p className="text-sky-400 text-[10px] font-black uppercase tracking-[0.2em]">Recent Activity</p>
          </div>
          <h2 className="text-4xl md:text-5xl font-black text-white leading-none tracking-tight mb-4">
            Highlight
            <br />
            <span className="text-white/25">Reel</span>
          </h2>
          <p className="text-white/30 text-sm max-w-md mx-auto leading-relaxed mt-6 border border-dashed border-white/10 rounded-2xl p-8">
            Highlight clips and photos will appear here once approved media is available.
          </p>
        </div>
      </section>
    );
  }

  const items = media.slice(0, 4).map((m, i) => {
    const Icon = ICONS[m.media_type as keyof typeof ICONS] ?? ICONS.default;
    const accents = ['sky', 'amber', 'rose', 'emerald'] as const;
    const accent = accents[i % accents.length];
    return {
      id: m.id,
      type: m.media_type === 'video' ? 'Video Clip' : 'Photo',
      title: m.caption ?? `${m.media_type} highlight`,
      signedUrl: m.signedUrl,
      media_type: m.media_type,
      featured: m.featured,
      icon: Icon,
      accent,
    };
  });

  const [featured, ...rest] = items;
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
        </div>

        {/* Grid layout — featured large + smaller cards */}
        <div className={`grid gap-4 lg:gap-5 ${rest.length > 0 ? 'lg:grid-cols-[1.6fr_1fr]' : ''}`}>

          {/* Featured card */}
          <div className={`group relative rounded-2xl overflow-hidden border border-white/8 ${fc.hover} transition-all duration-300`} style={{ boxShadow: '0 8px 40px rgba(0,0,0,0.5)' }}>
            <div className="relative h-72 lg:h-80 overflow-hidden">
              {featured.signedUrl ? (
                featured.media_type === 'video' ? (
                  <video src={featured.signedUrl} className="w-full h-full object-cover group-hover:scale-[1.04] transition-transform duration-700" style={{ filter: 'brightness(0.55) saturate(0.7)' }} />
                ) : (
                  <img src={featured.signedUrl} alt={featured.title} className="w-full h-full object-cover group-hover:scale-[1.04] transition-transform duration-700" style={{ filter: 'brightness(0.55) saturate(0.7)' }} />
                )
              ) : (
                <div className="w-full h-full bg-white/5 flex items-center justify-center">
                  <Play className="w-8 h-8 text-white/20" />
                </div>
              )}
              <div className={`absolute inset-0 bg-gradient-to-t ${fc.overlay} via-transparent to-transparent opacity-60`} />
              <div className="absolute inset-0 bg-gradient-to-t from-[#1e2230] via-[#1e2230]/30 to-transparent" />

              {featured.media_type === 'video' && (
                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <div className="w-16 h-16 rounded-full bg-white/15 backdrop-blur-sm border border-white/25 flex items-center justify-center">
                    <Play className="w-7 h-7 text-white ml-1" fill="white" />
                  </div>
                </div>
              )}

              <div className="absolute top-4 left-4">
                <span className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-wider border backdrop-blur-sm ${fc.badge}`}>
                  <FeaturedIcon className="w-3 h-3" />
                  {featured.type}
                </span>
              </div>
            </div>

            <div className="p-5 bg-white/[0.02]">
              <h3 className="text-white font-black text-lg leading-tight">{featured.title}</h3>
            </div>
          </div>

          {/* Right column — smaller cards */}
          {rest.length > 0 && (
            <div className="flex flex-col gap-4 lg:gap-5">
              {rest.map(({ id, type, title, signedUrl, media_type, accent }) => {
                const c = accentConfig[accent];
                const Icon = ICONS[media_type as keyof typeof ICONS] ?? ICONS.default;
                return (
                  <div
                    key={id}
                    className={`group relative rounded-2xl overflow-hidden border border-white/8 ${c.hover} transition-all duration-300 flex flex-col`}
                    style={{ boxShadow: '0 4px 20px rgba(0,0,0,0.4)' }}
                  >
                    <div className="relative h-28 overflow-hidden flex-shrink-0">
                      {signedUrl ? (
                        media_type === 'video' ? (
                          <video src={signedUrl} className="w-full h-full object-cover group-hover:scale-[1.06] transition-transform duration-600" style={{ filter: 'brightness(0.45) saturate(0.6)' }} />
                        ) : (
                          <img src={signedUrl} alt={title} className="w-full h-full object-cover group-hover:scale-[1.06] transition-transform duration-600" style={{ filter: 'brightness(0.45) saturate(0.6)' }} />
                        )
                      ) : (
                        <div className="w-full h-full bg-white/5" />
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-[#1e2230] via-transparent to-transparent" />

                      <div className="absolute top-3 left-3">
                        <span className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-lg text-[9px] font-black uppercase tracking-wider border backdrop-blur-sm ${c.badge}`}>
                          <Icon className="w-2.5 h-2.5" />
                          {type}
                        </span>
                      </div>
                    </div>

                    <div className="p-4 bg-white/[0.02] flex-1">
                      <h3 className="text-white font-bold text-sm leading-snug">{title}</h3>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

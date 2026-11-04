import { useEffect, useState } from 'react';
import { Award, BookOpen, Heart, Shield, Users, Zap, Star, TrendingUp } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import type { Athlete } from '../../types/athlete';
import type { AthleteTag, VisibilityTag } from '../../types/traits';
import { sortedTraits, getCategoryMeta } from '../../types/traits';

interface ProfileAttributesProps {
  athlete: Athlete;
}

const CATEGORY_ICON: Record<string, LucideIcon> = {
  character: Shield,
  performance: Zap,
  academic: BookOpen,
  leadership_role: TrendingUp,
  community: Users,
  wellness: Heart,
  creative: Star,
};

const CATEGORY_COLOR: Record<string, 'sky' | 'amber' | 'emerald' | 'rose'> = {
  character: 'sky',
  performance: 'amber',
  academic: 'emerald',
  leadership_role: 'rose',
  community: 'sky',
  wellness: 'rose',
  creative: 'amber',
};

const colorMap = {
  sky: {
    icon: 'text-sky-400',
    iconBg: 'bg-sky-500/10 border-sky-500/20',
    glow: 'group-hover:border-sky-500/30',
    accent: 'rgba(14,165,233,0.12)',
  },
  amber: {
    icon: 'text-amber-400',
    iconBg: 'bg-amber-500/10 border-amber-500/20',
    glow: 'group-hover:border-amber-500/30',
    accent: 'rgba(245,158,11,0.12)',
  },
  emerald: {
    icon: 'text-emerald-400',
    iconBg: 'bg-emerald-500/10 border-emerald-500/20',
    glow: 'group-hover:border-emerald-500/30',
    accent: 'rgba(16,185,129,0.12)',
  },
  rose: {
    icon: 'text-rose-400',
    iconBg: 'bg-rose-500/10 border-rose-500/20',
    glow: 'group-hover:border-rose-500/30',
    accent: 'rgba(244,63,94,0.12)',
  },
} as const;

export default function ProfileAttributes({ athlete }: ProfileAttributesProps) {
  const [tags, setTags] = useState<VisibilityTag[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;

    (async () => {
      const result = await supabase
        .from('athlete_tags')
        .select('visibility_tags(id, slug, label, category, sort_order)')
        .eq('athlete_id', athlete.id);

      if (!active || !result || result.error || !result.data) { setLoading(false); return; }

      setTags(sortedTraits(result.data as unknown as AthleteTag[]));
      setLoading(false);
    })();

    return () => { active = false; };
  }, [athlete.id]);

  if (!loading && tags.length === 0) return null;

  return (
    <section className="relative py-20 overflow-hidden" style={{ background: '#1c2028' }}>
      <div className="absolute top-0 left-0 right-0 h-px" style={{ background: 'linear-gradient(90deg, transparent, rgba(16,185,129,0.3), transparent)' }} />
      <div
        className="absolute right-0 top-1/2 -translate-y-1/2 w-[500px] h-[600px] pointer-events-none"
        style={{ background: 'radial-gradient(ellipse at right, rgba(16,185,129,0.04) 0%, transparent 65%)' }}
      />

      <div className="relative max-w-5xl mx-auto px-6 lg:px-8">

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-12">
          <div>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-0.5 h-8 rounded-full" style={{ background: 'linear-gradient(to bottom, #34d399, rgba(16,185,129,0.2))', boxShadow: '0 0 10px rgba(16,185,129,0.5)' }} />
              <p className="text-emerald-400 text-[10px] font-black uppercase tracking-[0.2em]">Athlete Profile</p>
            </div>
            <h2 className="text-4xl md:text-5xl font-black text-white leading-none tracking-tight">
              Strengths
              <br />
              <span className="text-white/25">&amp; Traits</span>
            </h2>
          </div>
          <p className="text-white/20 text-sm max-w-xs text-right hidden sm:block">
            Verified traits from NextUp's assessment
          </p>
        </div>

        {loading ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="bg-white/[0.03] border border-white/8 rounded-2xl p-6 animate-pulse">
                <div className="w-10 h-10 rounded-xl bg-white/10 mb-4" />
                <div className="h-4 bg-white/10 rounded w-1/2 mb-2" />
                <div className="h-3 bg-white/10 rounded w-1/3" />
              </div>
            ))}
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {tags.map((tag) => {
              const category = tag.category || 'character';
              const Icon = CATEGORY_ICON[category] ?? Award;
              const colorKey = CATEGORY_COLOR[category] ?? 'sky';
              const c = colorMap[colorKey];
              const meta = getCategoryMeta(category);

              return (
                <div
                  key={tag.id}
                  className={`group relative bg-white/[0.03] border border-white/8 ${c.glow} rounded-2xl p-6 transition-all duration-300 hover:bg-white/[0.05] overflow-hidden`}
                >
                  <div
                    className="absolute top-0 right-0 w-24 h-24 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500 -translate-y-1/2 translate-x-1/2"
                    style={{ background: `radial-gradient(circle, ${c.accent} 0%, transparent 70%)` }}
                  />

                  <div className={`w-10 h-10 rounded-xl border flex items-center justify-center mb-4 ${c.iconBg}`}>
                    <Icon className={`w-5 h-5 ${c.icon}`} />
                  </div>

                  <div className="flex items-start justify-between gap-2 mb-2">
                    <h3 className="text-white font-black text-base leading-tight">{tag.label}</h3>
                    <span className={`text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full border flex-shrink-0 ${c.iconBg} ${c.icon}`}>
                      {meta.label}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}

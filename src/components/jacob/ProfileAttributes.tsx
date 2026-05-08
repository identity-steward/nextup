import { Eye, Flame, Zap, BookOpen, Target, Trophy } from 'lucide-react';

const attributes = [
  {
    icon: Eye,
    label: 'Court Vision',
    description: 'Reads the floor and makes smart passes under pressure',
    metric: 'Elite',
    color: 'sky',
  },
  {
    icon: Flame,
    label: 'Ball Handling',
    description: 'Strong handles in both half-court and transition sets',
    metric: 'Advanced',
    color: 'amber',
  },
  {
    icon: Zap,
    label: 'Athleticism',
    description: 'Explosive first step with above-the-rim finishing ability',
    metric: 'High',
    color: 'emerald',
  },
  {
    icon: BookOpen,
    label: 'Work Ethic',
    description: 'Trains daily — gym before school, gym after practice',
    metric: 'Exceptional',
    color: 'rose',
  },
  {
    icon: Target,
    label: 'Coachability',
    description: 'Takes feedback quickly and applies it in live game situations',
    metric: 'Elite',
    color: 'sky',
  },
  {
    icon: Trophy,
    label: 'Competitive Drive',
    description: 'Consistent performer in high-pressure tournament settings',
    metric: 'Proven',
    color: 'amber',
  },
];

const colorMap = {
  sky: {
    icon: 'text-sky-400',
    iconBg: 'bg-sky-500/10 border-sky-500/20',
    metric: 'text-sky-400 bg-sky-500/10 border-sky-500/20',
    bar: 'bg-sky-500',
    glow: 'group-hover:border-sky-500/30',
  },
  amber: {
    icon: 'text-amber-400',
    iconBg: 'bg-amber-500/10 border-amber-500/20',
    metric: 'text-amber-400 bg-amber-500/10 border-amber-500/20',
    bar: 'bg-amber-500',
    glow: 'group-hover:border-amber-500/30',
  },
  emerald: {
    icon: 'text-emerald-400',
    iconBg: 'bg-emerald-500/10 border-emerald-500/20',
    metric: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
    bar: 'bg-emerald-500',
    glow: 'group-hover:border-emerald-500/30',
  },
  rose: {
    icon: 'text-rose-400',
    iconBg: 'bg-rose-500/10 border-rose-500/20',
    metric: 'text-rose-400 bg-rose-500/10 border-rose-500/20',
    bar: 'bg-rose-500',
    glow: 'group-hover:border-rose-500/30',
  },
};

const barWidths: Record<string, string> = {
  Elite: 'w-[95%]',
  Advanced: 'w-[85%]',
  High: 'w-[80%]',
  Exceptional: 'w-[98%]',
  Proven: 'w-[88%]',
};

export default function ProfileAttributes() {
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
            Assessed from game film and coach feedback
          </p>
        </div>

        {/* Attribute cards grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {attributes.map(({ icon: Icon, label, description, metric, color }) => {
            const c = colorMap[color as keyof typeof colorMap];
            return (
              <div
                key={label}
                className={`group relative bg-white/[0.03] border border-white/8 ${c.glow} rounded-2xl p-6 transition-all duration-300 hover:bg-white/[0.05] overflow-hidden`}
              >
                {/* Background accent */}
                <div className={`absolute top-0 right-0 w-24 h-24 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500 -translate-y-1/2 translate-x-1/2`}
                  style={{ background: `radial-gradient(circle, ${color === 'sky' ? 'rgba(14,165,233,0.12)' : color === 'amber' ? 'rgba(245,158,11,0.12)' : color === 'emerald' ? 'rgba(16,185,129,0.12)' : 'rgba(244,63,94,0.12)'} 0%, transparent 70%)` }}
                />

                {/* Icon */}
                <div className={`w-10 h-10 rounded-xl border flex items-center justify-center mb-4 ${c.iconBg}`}>
                  <Icon className={`w-5 h-5 ${c.icon}`} />
                </div>

                {/* Content */}
                <div className="flex items-start justify-between gap-2 mb-2">
                  <h3 className="text-white font-black text-base leading-tight">{label}</h3>
                  <span className={`text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full border flex-shrink-0 ${c.metric}`}>
                    {metric}
                  </span>
                </div>

                <p className="text-white/40 text-sm leading-relaxed mb-4">{description}</p>

                {/* Rating bar */}
                <div className="h-1 bg-white/6 rounded-full overflow-hidden">
                  <div className={`h-full rounded-full ${c.bar} ${barWidths[metric] ?? 'w-3/4'} transition-all duration-700`} />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

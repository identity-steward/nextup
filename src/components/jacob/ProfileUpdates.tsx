import { Play, Star, Calendar } from 'lucide-react';

const updates = [
  {
    type: 'highlight',
    date: 'Apr 10, 2025',
    title: 'New Reel Posted',
    body: 'Jacob dropped a new game highlights reel — showcasing his handles and court vision from the spring AAU run.',
    icon: Play,
    accent: 'sky' as const,
  },
  {
    type: 'milestone',
    date: 'Apr 4, 2025',
    title: 'First 12 Supporters',
    body: 'The community showed up — Jacob crossed 12 supporters and $120 raised toward his April tournament travel.',
    icon: Star,
    accent: 'amber' as const,
  },
  {
    type: 'event',
    date: 'Apr 18–19, 2025',
    title: 'Upcoming Tournament',
    body: 'Jacob is registered and competing in the Memphis AAU Spring Invitational. Travel and fees are the current goal.',
    icon: Calendar,
    accent: 'rose' as const,
  },
];

const accentClasses = {
  sky: {
    badge: 'bg-sky-500/15 border-sky-500/25 text-sky-400',
    icon: 'bg-sky-500/10 border border-sky-500/20 text-sky-400',
  },
  amber: {
    badge: 'bg-amber-500/15 border-amber-500/25 text-amber-400',
    icon: 'bg-amber-500/10 border border-amber-500/20 text-amber-400',
  },
  rose: {
    badge: 'bg-rose-500/15 border-rose-500/25 text-rose-400',
    icon: 'bg-rose-500/10 border border-rose-500/20 text-rose-400',
  },
};

export default function ProfileUpdates() {
  return (
    <section className="relative py-14 border-t overflow-hidden" style={{ background: '#111318', borderColor: 'rgba(255,255,255,0.05)' }}>
      <div className="max-w-2xl mx-auto px-6 lg:px-8">
        <div className="flex items-center gap-3 mb-8">
          <div className="w-px h-8 bg-amber-500" />
          <div>
            <p className="text-amber-400 text-xs font-black uppercase tracking-widest mb-0.5">Live Updates</p>
            <h2 className="text-2xl md:text-3xl font-black text-white leading-tight">Follow Jacob's Journey</h2>
          </div>
        </div>

        <div className="space-y-3">
          {updates.map((u, i) => {
            const Icon = u.icon;
            const classes = accentClasses[u.accent];
            return (
              <div
                key={i}
                className="flex gap-4 bg-white/[0.03] border border-white/7 hover:border-white/12 rounded-xl p-5 transition-colors"
              >
                <div className={`flex-shrink-0 w-9 h-9 rounded-lg flex items-center justify-center ${classes.icon}`}>
                  <Icon className="w-4 h-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1.5">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider border ${classes.badge}`}>
                      {u.type}
                    </span>
                    <span className="text-white/20 text-[11px]">{u.date}</span>
                  </div>
                  <h3 className="text-white font-bold text-sm mb-1">{u.title}</h3>
                  <p className="text-gray-500 text-sm leading-relaxed">{u.body}</p>
                </div>
              </div>
            );
          })}
        </div>

        <div className="mt-4 border border-dashed border-white/8 rounded-xl p-5 text-center">
          <p className="text-white/20 text-xs">More updates as Jacob competes this April</p>
        </div>
      </div>
    </section>
  );
}

import { useState, useEffect } from 'react';
import {
  Star, Award, Zap, BookOpen, Shield, Users, Heart, Layers,
  AlertTriangle, FileText, ShieldCheck
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { JourneyService } from '../../services/journeyService';
import { getEntryTypeMeta, formatEntryDate } from '../../types/journey';
import type { JourneyEntry } from '../../types/journey';

const ICON_MAP: Record<string, LucideIcon> = {
  Star, Award, Zap, BookOpen, Shield, Users, Heart, Layers, AlertTriangle, FileText,
};

function EntryTypeIcon({ type }: { type: string }) {
  const meta = getEntryTypeMeta(type);
  const Icon = ICON_MAP[meta.iconName] ?? FileText;
  return <Icon className="w-4 h-4" />;
}

interface Props {
  slug: string;
}

export default function ProfileUpdates({ slug }: Props) {
  const [entries, setEntries] = useState<JourneyEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!slug) { setLoading(false); return; }

    (async () => {
      const { data: athlete } = await supabase
        .from('athletes')
        .select('id')
        .eq('slug', slug)
        .maybeSingle();

      if (!athlete) { setLoading(false); return; }

      const data = await JourneyService.getPublicEntries(athlete.id, 3);
      setEntries(data);
      setLoading(false);
    })();
  }, [slug]);

  return (
    <section
      className="relative py-14 border-t overflow-hidden"
      style={{ background: '#1c2028', borderColor: 'rgba(255,255,255,0.05)' }}
    >
      <div className="max-w-2xl mx-auto px-6 lg:px-8">
        <div className="flex items-center gap-3 mb-8">
          <div className="w-px h-8 bg-amber-500" />
          <div>
            <p className="text-amber-400 text-xs font-black uppercase tracking-widest mb-0.5">Development Record</p>
            <h2 className="text-2xl md:text-3xl font-black text-white leading-tight">Follow Jacob's Journey</h2>
          </div>
        </div>

        {loading ? (
          <div className="space-y-3">
            {[0, 1, 2].map(i => (
              <div key={i} className="flex gap-4 bg-white/[0.03] border border-white/7 rounded-xl p-5 animate-pulse">
                <div className="w-9 h-9 rounded-lg bg-white/10 shrink-0" />
                <div className="flex-1 space-y-2">
                  <div className="h-3 bg-white/10 rounded w-1/3" />
                  <div className="h-4 bg-white/10 rounded w-2/3" />
                  <div className="h-3 bg-white/10 rounded w-full" />
                </div>
              </div>
            ))}
          </div>
        ) : entries.length === 0 ? (
          <div className="border border-dashed border-white/8 rounded-xl p-8 text-center">
            <p className="text-white/30 text-sm">Journey entries coming soon.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {entries.map(entry => {
              const meta = getEntryTypeMeta(entry.entry_type);
              const dateStr = formatEntryDate(entry.date_occurred, entry.created_at);

              return (
                <div
                  key={entry.id}
                  className="flex gap-4 bg-white/[0.03] border border-white/7 hover:border-white/12 rounded-xl p-5 transition-colors"
                >
                  <div className={`flex-shrink-0 w-9 h-9 rounded-lg flex items-center justify-center ${meta.iconBg} ${meta.iconText}`}>
                    <EntryTypeIcon type={entry.entry_type} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider border ${meta.badgeBg} ${meta.badgeBorder} ${meta.badgeText}`}>
                        {meta.label}
                      </span>
                      {entry.verified && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider border bg-emerald-500/10 border-emerald-500/25 text-emerald-400">
                          <ShieldCheck className="w-2.5 h-2.5" />
                          Verified
                        </span>
                      )}
                      {dateStr && (
                        <span className="text-white/20 text-[11px]">{dateStr}</span>
                      )}
                    </div>
                    <h3 className="text-white font-bold text-sm mb-1">{entry.title}</h3>
                    {entry.body && (
                      <p className="text-gray-500 text-sm leading-relaxed">{entry.body}</p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {!loading && entries.length > 0 && (
          <div className="mt-4 border border-dashed border-white/8 rounded-xl p-5 text-center">
            <p className="text-white/20 text-xs">Documenting growth as it happens — verified by NextUp</p>
          </div>
        )}
      </div>
    </section>
  );
}

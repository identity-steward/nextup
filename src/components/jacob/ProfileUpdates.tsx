import { useState, useEffect } from 'react';
import {
  Star, Award, Zap, BookOpen, Shield, Users, Heart, Layers,
  AlertTriangle, FileText, ShieldCheck, Play
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

interface EvidenceMedia {
  id: string;
  media_type: string;
  public_url: string | null;
  caption: string | null;
}

interface Props {
  athleteId: string;
  athleteName: string;
  limit?: number;
}

export default function ProfileUpdates({ athleteId, athleteName, limit = 3 }: Props) {
  const [entries, setEntries] = useState<JourneyEntry[]>([]);
  const [evidenceMap, setEvidenceMap] = useState<Record<string, EvidenceMedia>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!athleteId) { setLoading(false); return; }

    (async () => {
      const data = await JourneyService.getPublicEntries(athleteId, limit);
      setEntries(data);

      // Fetch linked evidence media for entries that have evidence_media_id
      const mediaIds = data
        .map(e => e.evidence_media_id)
        .filter((id): id is string => id !== null);

      if (mediaIds.length > 0) {
        const { data: mediaData } = await supabase
          .from('media_uploads')
          .select('id, media_type, public_url, caption')
          .in('id', mediaIds)
          .eq('status', 'approved')
          .neq('consent_status', 'revoked')
          .in('usage_scope', ['platform', 'public']);

        if (mediaData) {
          const map: Record<string, EvidenceMedia> = {};
          for (const m of mediaData as EvidenceMedia[]) {
            map[m.id] = m;
          }
          setEvidenceMap(map);
        }
      }

      setLoading(false);
    })();
  }, [athleteId, limit]);

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
            <h2 className="text-2xl md:text-3xl font-black text-white leading-tight">
              {athleteName}'s Journey
            </h2>
          </div>
        </div>

        {loading ? (
          <div className="space-y-3">
            {Array.from({ length: limit }).map((_, i) => (
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
              const evidence = entry.evidence_media_id ? evidenceMap[entry.evidence_media_id] : null;

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
                      {entry.verified && entry.verified_by && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider border bg-emerald-500/10 border-emerald-500/25 text-emerald-400">
                          <ShieldCheck className="w-2.5 h-2.5" />
                          {entry.verified_by === 'NextUp Admin' ? 'Verified by NextUp' : `Verified by ${entry.verified_by}`}
                        </span>
                      )}
                      {entry.source_type && entry.source_type !== 'admin' && (
                        <span className="text-white/30 text-[10px] font-medium capitalize">
                          {entry.source_type === 'youth' ? 'Youth reported' :
                           entry.source_type === 'family' ? 'Family reported' :
                           entry.source_type === 'navigator' ? 'NextUp reported' :
                           entry.source_type === 'partner' ? 'Partner reported' :
                           entry.source_type === 'system' ? 'System record' :
                           entry.source_type}
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
                    {evidence && evidence.public_url && (
                      <div className="mt-3 rounded-lg overflow-hidden border border-white/10 max-w-xs">
                        {evidence.media_type === 'photo' ? (
                          <img
                            src={evidence.public_url}
                            alt={evidence.caption ?? ''}
                            className="w-full h-auto"
                          />
                        ) : (
                          <div className="flex items-center gap-2 bg-white/[0.05] px-3 py-2.5">
                            <Play className="w-4 h-4 text-amber-400 shrink-0" fill="currentColor" />
                            <span className="text-white/60 text-xs font-medium">
                              {evidence.caption ?? 'Highlight video'}
                            </span>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {!loading && entries.length > 0 && (
          <div className="mt-4 border border-dashed border-white/8 rounded-xl p-5 text-center">
            <p className="text-white/20 text-xs">Documenting growth as it happens</p>
          </div>
        )}
      </div>
    </section>
  );
}

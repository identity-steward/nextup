import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import type { AthleteTag } from '../../types/traits';
import { sortedTraits } from '../../types/traits';
import TraitBadge from '../TraitBadge';

interface ProfileTraitsProps {
  athleteId?: string;
  slug?: string;
}

export default function ProfileTraits({ athleteId, slug = 'jacob-f' }: ProfileTraitsProps) {
  const [traits, setTraits] = useState<ReturnType<typeof sortedTraits>>([]);

  useEffect(() => {
    const fetchTraits = async () => {
      let aid = athleteId;
      if (!aid) {
        const { data: athlete } = await supabase
          .from('athletes')
          .select('id')
          .eq('slug', slug)
          .maybeSingle();
        if (!athlete) return;
        aid = athlete.id;
      }
      const result = await supabase
        .from('athlete_tags')
        .select('visibility_tags(id, slug, label, category, sort_order)')
        .eq('athlete_id', aid);
      if (!result || result.error || !result.data) return;
      setTraits(sortedTraits(result.data as unknown as AthleteTag[]));
    };
    fetchTraits();
  }, [athleteId, slug]);

  if (traits.length === 0) return null;

  return (
    <section className="relative py-14 overflow-hidden" style={{ background: '#1e2230' }}>
      <div className="absolute top-0 left-0 right-0 h-px" style={{ background: 'linear-gradient(90deg, transparent, rgba(56,189,248,0.15), transparent)' }} />

      <div className="relative max-w-5xl mx-auto px-6 lg:px-8">
        <div className="flex items-center gap-3 mb-6">
          <div
            className="w-0.5 h-8 rounded-full"
            style={{ background: 'linear-gradient(to bottom, #38bdf8, rgba(14,165,233,0.2))', boxShadow: '0 0 10px rgba(56,189,248,0.5)' }}
          />
          <p className="text-sky-400 text-[10px] font-black uppercase tracking-[0.2em]">Character &amp; Traits</p>
        </div>

        <div className="flex flex-wrap gap-2">
          {traits.map(trait => (
            <TraitBadge key={trait.id} trait={trait} />
          ))}
        </div>
      </div>
    </section>
  );
}

import type { AthleteTag } from '../types/traits';
import { getCategoryMeta, groupTraitsByCategory } from '../types/traits';
import TraitBadge from './TraitBadge';

interface TraitSectionProps {
  athleteTags: AthleteTag[];
}

export default function TraitSection({ athleteTags }: TraitSectionProps) {
  if (!athleteTags || athleteTags.length === 0) return null;

  const grouped = groupTraitsByCategory(athleteTags);
  if (grouped.size === 0) return null;

  const singleCategory = grouped.size === 1;

  return (
    <section className="py-10 bg-white border-t border-gray-100">
      <div className="max-w-4xl mx-auto px-6 lg:px-8">
        <h2 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-5">
          Character &amp; Traits
        </h2>

        {singleCategory ? (
          <div className="flex flex-wrap gap-2">
            {Array.from(grouped.values())[0].map(trait => (
              <TraitBadge key={trait.id} trait={trait} />
            ))}
          </div>
        ) : (
          <div className="space-y-5">
            {Array.from(grouped.entries()).map(([category, traits]) => {
              const meta = getCategoryMeta(category);
              return (
                <div key={category}>
                  <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
                    {meta.label}
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {traits.map(trait => (
                      <TraitBadge key={trait.id} trait={trait} />
                    ))}
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

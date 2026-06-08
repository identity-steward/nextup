export type TraitCategory =
  | 'character'
  | 'performance'
  | 'academic'
  | 'leadership_role'
  | 'community'
  | 'wellness'
  | 'creative';

export interface VisibilityTag {
  id: string;
  slug: string;
  label: string;
  category: TraitCategory | string;
  sort_order?: number;
}

export interface AthleteTag {
  visibility_tags: VisibilityTag | null;
}

interface CategoryMeta {
  label: string;
  dotColor: string;
  badgeBg: string;
  badgeText: string;
  badgeBorder: string;
}

const CATEGORY_META: Record<string, CategoryMeta> = {
  character: {
    label: 'Character',
    dotColor: 'bg-navy',
    badgeBg: 'bg-navy/8',
    badgeText: 'text-navy',
    badgeBorder: 'border-navy/20',
  },
  performance: {
    label: 'Performance',
    dotColor: 'bg-sky-500',
    badgeBg: 'bg-sky-50',
    badgeText: 'text-sky-700',
    badgeBorder: 'border-sky-200',
  },
  academic: {
    label: 'Academic',
    dotColor: 'bg-emerald-500',
    badgeBg: 'bg-emerald-50',
    badgeText: 'text-emerald-700',
    badgeBorder: 'border-emerald-200',
  },
  leadership_role: {
    label: 'Leadership',
    dotColor: 'bg-gold',
    badgeBg: 'bg-amber-50',
    badgeText: 'text-amber-800',
    badgeBorder: 'border-amber-200',
  },
  community: {
    label: 'Community',
    dotColor: 'bg-violet-500',
    badgeBg: 'bg-violet-50',
    badgeText: 'text-violet-700',
    badgeBorder: 'border-violet-200',
  },
  wellness: {
    label: 'Wellness',
    dotColor: 'bg-rose-400',
    badgeBg: 'bg-rose-50',
    badgeText: 'text-rose-700',
    badgeBorder: 'border-rose-200',
  },
  creative: {
    label: 'Creative',
    dotColor: 'bg-orange-400',
    badgeBg: 'bg-orange-50',
    badgeText: 'text-orange-700',
    badgeBorder: 'border-orange-200',
  },
};

const FALLBACK_META: CategoryMeta = {
  label: 'Trait',
  dotColor: 'bg-gray-400',
  badgeBg: 'bg-gray-50',
  badgeText: 'text-gray-700',
  badgeBorder: 'border-gray-200',
};

export function getCategoryMeta(category?: string): CategoryMeta {
  if (!category) return FALLBACK_META;
  return CATEGORY_META[category] ?? FALLBACK_META;
}

export function sortedTraits(tags: AthleteTag[]): VisibilityTag[] {
  return tags
    .map(t => t.visibility_tags)
    .filter((vt): vt is VisibilityTag => vt !== null)
    .sort((a, b) => {
      const aOrder = a.sort_order ?? 999;
      const bOrder = b.sort_order ?? 999;
      if (aOrder !== bOrder) return aOrder - bOrder;
      return a.label.localeCompare(b.label);
    });
}

export function groupTraitsByCategory(tags: AthleteTag[]): Map<string, VisibilityTag[]> {
  const traits = sortedTraits(tags);
  const grouped = new Map<string, VisibilityTag[]>();
  for (const trait of traits) {
    const cat = trait.category || 'other';
    const existing = grouped.get(cat) ?? [];
    existing.push(trait);
    grouped.set(cat, existing);
  }
  return grouped;
}

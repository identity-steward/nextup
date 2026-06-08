import type { VisibilityTag } from '../types/traits';
import { getCategoryMeta } from '../types/traits';

interface TraitBadgeProps {
  trait: VisibilityTag;
  size?: 'sm' | 'md';
}

export default function TraitBadge({ trait, size = 'md' }: TraitBadgeProps) {
  if (!trait.label) return null;

  const meta = getCategoryMeta(trait.category);
  const sizeClasses = size === 'sm'
    ? 'gap-1 px-2 py-0.5 text-xs'
    : 'gap-1.5 px-3 py-1 text-xs';
  const dotSize = size === 'sm' ? 'w-1.5 h-1.5' : 'w-2 h-2';

  return (
    <span
      className={`inline-flex items-center rounded-full border font-semibold whitespace-nowrap ${meta.badgeBg} ${meta.badgeText} ${meta.badgeBorder} ${sizeClasses}`}
    >
      <span className={`rounded-full flex-shrink-0 ${meta.dotColor} ${dotSize}`} />
      {trait.label}
    </span>
  );
}

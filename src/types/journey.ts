export type EntryType =
  | 'milestone'
  | 'achievement'
  | 'performance'
  | 'academic'
  | 'leadership'
  | 'community'
  | 'wellness'
  | 'creative'
  | 'challenge';

export interface JourneyEntry {
  id: string;
  athlete_id: string;
  title: string;
  body: string | null;
  entry_type: EntryType | string;
  date_occurred: string | null;
  visibility: 'public' | 'private';
  status: 'pending' | 'approved' | 'rejected';
  verified: boolean;
  verified_by: string | null;
  verification_source: string | null;
  admin_notes: string | null;
  created_by: string | null;
  created_by_role: 'admin' | 'parent' | 'athlete' | null;
  evidence_media_id: string | null;
  evidence_tag_id: string | null;
  reviewed_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface EntryTypeMeta {
  label: string;
  iconName: string;
  // Dark-theme classes (used on athlete profile dark sections)
  badgeBg: string;
  badgeBorder: string;
  badgeText: string;
  iconBg: string;
  iconText: string;
  // Light-theme classes (used in admin UI)
  lightBg: string;
  lightBorder: string;
  lightText: string;
}

export const ENTRY_TYPES: EntryType[] = [
  'milestone',
  'achievement',
  'performance',
  'academic',
  'leadership',
  'community',
  'wellness',
  'creative',
  'challenge',
];

const ENTRY_TYPE_META_MAP: Record<string, EntryTypeMeta> = {
  milestone: {
    label: 'Milestone',
    iconName: 'Star',
    badgeBg: 'bg-amber-500/15',
    badgeBorder: 'border-amber-500/25',
    badgeText: 'text-amber-400',
    iconBg: 'bg-amber-500/10 border border-amber-500/20',
    iconText: 'text-amber-400',
    lightBg: 'bg-amber-50',
    lightBorder: 'border-amber-200',
    lightText: 'text-amber-800',
  },
  achievement: {
    label: 'Achievement',
    iconName: 'Award',
    badgeBg: 'bg-yellow-500/15',
    badgeBorder: 'border-yellow-500/25',
    badgeText: 'text-yellow-300',
    iconBg: 'bg-yellow-500/10 border border-yellow-500/20',
    iconText: 'text-yellow-300',
    lightBg: 'bg-yellow-50',
    lightBorder: 'border-yellow-200',
    lightText: 'text-yellow-800',
  },
  performance: {
    label: 'Performance',
    iconName: 'Zap',
    badgeBg: 'bg-sky-500/15',
    badgeBorder: 'border-sky-500/25',
    badgeText: 'text-sky-400',
    iconBg: 'bg-sky-500/10 border border-sky-500/20',
    iconText: 'text-sky-400',
    lightBg: 'bg-sky-50',
    lightBorder: 'border-sky-200',
    lightText: 'text-sky-800',
  },
  academic: {
    label: 'Academic',
    iconName: 'BookOpen',
    badgeBg: 'bg-emerald-500/15',
    badgeBorder: 'border-emerald-500/25',
    badgeText: 'text-emerald-400',
    iconBg: 'bg-emerald-500/10 border border-emerald-500/20',
    iconText: 'text-emerald-400',
    lightBg: 'bg-emerald-50',
    lightBorder: 'border-emerald-200',
    lightText: 'text-emerald-800',
  },
  leadership: {
    label: 'Leadership',
    iconName: 'Shield',
    badgeBg: 'bg-orange-500/15',
    badgeBorder: 'border-orange-500/25',
    badgeText: 'text-orange-400',
    iconBg: 'bg-orange-500/10 border border-orange-500/20',
    iconText: 'text-orange-400',
    lightBg: 'bg-orange-50',
    lightBorder: 'border-orange-200',
    lightText: 'text-orange-800',
  },
  community: {
    label: 'Community',
    iconName: 'Users',
    badgeBg: 'bg-violet-500/15',
    badgeBorder: 'border-violet-500/25',
    badgeText: 'text-violet-400',
    iconBg: 'bg-violet-500/10 border border-violet-500/20',
    iconText: 'text-violet-400',
    lightBg: 'bg-violet-50',
    lightBorder: 'border-violet-200',
    lightText: 'text-violet-800',
  },
  wellness: {
    label: 'Wellness',
    iconName: 'Heart',
    badgeBg: 'bg-rose-500/15',
    badgeBorder: 'border-rose-500/25',
    badgeText: 'text-rose-400',
    iconBg: 'bg-rose-500/10 border border-rose-500/20',
    iconText: 'text-rose-400',
    lightBg: 'bg-rose-50',
    lightBorder: 'border-rose-200',
    lightText: 'text-rose-800',
  },
  creative: {
    label: 'Creative',
    iconName: 'Layers',
    badgeBg: 'bg-teal-500/15',
    badgeBorder: 'border-teal-500/25',
    badgeText: 'text-teal-400',
    iconBg: 'bg-teal-500/10 border border-teal-500/20',
    iconText: 'text-teal-400',
    lightBg: 'bg-teal-50',
    lightBorder: 'border-teal-200',
    lightText: 'text-teal-800',
  },
  challenge: {
    label: 'Challenge',
    iconName: 'AlertTriangle',
    badgeBg: 'bg-red-500/15',
    badgeBorder: 'border-red-500/25',
    badgeText: 'text-red-400',
    iconBg: 'bg-red-500/10 border border-red-500/20',
    iconText: 'text-red-400',
    lightBg: 'bg-red-50',
    lightBorder: 'border-red-200',
    lightText: 'text-red-800',
  },
};

const FALLBACK_ENTRY_META: EntryTypeMeta = {
  label: 'Entry',
  iconName: 'FileText',
  badgeBg: 'bg-gray-500/15',
  badgeBorder: 'border-gray-500/25',
  badgeText: 'text-gray-400',
  iconBg: 'bg-gray-500/10 border border-gray-500/20',
  iconText: 'text-gray-400',
  lightBg: 'bg-gray-50',
  lightBorder: 'border-gray-200',
  lightText: 'text-gray-700',
};

export function getEntryTypeMeta(type?: string): EntryTypeMeta {
  if (!type) return FALLBACK_ENTRY_META;
  return ENTRY_TYPE_META_MAP[type] ?? FALLBACK_ENTRY_META;
}

export function formatEntryDate(dateStr: string | null, fallback?: string): string {
  const raw = dateStr ?? fallback;
  if (!raw) return '';
  const d = new Date(raw.includes('T') ? raw : raw + 'T00:00:00');
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

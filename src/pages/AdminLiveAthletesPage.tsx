import { useEffect, useState, useMemo } from 'react';
import { DashboardLayout } from '../components/DashboardLayout';
import { CheckCircle, Clock, XCircle, Tag, RefreshCw, ExternalLink, Star, Shield, ChevronDown } from 'lucide-react';
import { Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';

interface VisibilityTag {
  id: string;
  slug: string;
  label: string;
  category: string;
  sort_order: number;
}

interface AthleteRow {
  id: string;
  first_name: string;
  last_initial: string;
  sport: string;
  grade: string;
  school: string | null;
  city: string | null;
  slug: string;
  profile_status: string;
  profile_tier: string;
  is_active: boolean;
  source_type: string | null;
  event_code_used: string | null;
  created_at: string;
  tags: VisibilityTag[];
  consent_status?: string | null;
  sab_code?: string | null;
}

const CATEGORY_DISPLAY: Record<string, { label: string; selectedClass: string; dotClass: string }> = {
  character:      { label: 'Character',      selectedClass: 'bg-[#1a1f3a] text-white border-[#1a1f3a]',          dotClass: 'bg-[#1a1f3a]' },
  performance:    { label: 'Performance',    selectedClass: 'bg-sky-600 text-white border-sky-600',               dotClass: 'bg-sky-500' },
  academic:       { label: 'Academic',       selectedClass: 'bg-emerald-600 text-white border-emerald-600',       dotClass: 'bg-emerald-500' },
  community:      { label: 'Community',      selectedClass: 'bg-violet-600 text-white border-violet-600',         dotClass: 'bg-violet-500' },
  creative:       { label: 'Creative',       selectedClass: 'bg-orange-500 text-white border-orange-500',         dotClass: 'bg-orange-400' },
  leadership_role:{ label: 'Leadership',     selectedClass: 'bg-amber-600 text-white border-amber-600',           dotClass: 'bg-amber-500' },
  wellness:       { label: 'Wellness',       selectedClass: 'bg-rose-500 text-white border-rose-500',             dotClass: 'bg-rose-400' },
};

const CATEGORY_ORDER = ['character', 'performance', 'academic', 'community', 'creative', 'leadership_role', 'wellness'];

const STATUS_OPTIONS = ['pending', 'active', 'hidden', 'rejected'] as const;
const TIER_OPTIONS = ['basic', 'premium'] as const;

const statusStyle: Record<string, string> = {
  pending: 'bg-amber-50 text-amber-700 border-amber-200',
  active: 'bg-green-50 text-green-700 border-green-200',
  approved: 'bg-green-50 text-green-700 border-green-200',
  verified_event: 'bg-sky-50 text-sky-700 border-sky-200',
  hidden: 'bg-gray-100 text-gray-500 border-gray-200',
  rejected: 'bg-red-50 text-red-700 border-red-200',
};

const statusIcon: Record<string, React.ReactNode> = {
  pending: <Clock className="w-3 h-3" />,
  active: <CheckCircle className="w-3 h-3" />,
  approved: <CheckCircle className="w-3 h-3" />,
  verified_event: <Shield className="w-3 h-3" />,
  hidden: <XCircle className="w-3 h-3" />,
  rejected: <XCircle className="w-3 h-3" />,
};

export function AdminLiveAthletesPage() {
  const { user } = useAuth();
  const [athletes, setAthletes] = useState<AthleteRow[]>([]);
  const [availableTags, setAvailableTags] = useState<VisibilityTag[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'active' | 'hidden' | 'rejected'>('all');
  const [search, setSearch] = useState('');
  const [saving, setSaving] = useState<string | null>(null);

  // Per-athlete pending edits
  const [pendingStatus, setPendingStatus] = useState<Record<string, string>>({});
  const [pendingTier, setPendingTier] = useState<Record<string, string>>({});
  const [pendingTags, setPendingTags] = useState<Record<string, string[]>>({});
  // Track which category sections are expanded per athlete
  const [expandedCats, setExpandedCats] = useState<Record<string, Set<string>>>({});

  const groupedTags = useMemo(() => {
    const map = new Map<string, VisibilityTag[]>();
    for (const cat of CATEGORY_ORDER) map.set(cat, []);
    for (const tag of availableTags) {
      const bucket = map.get(tag.category) ?? [];
      bucket.push(tag);
      map.set(tag.category, bucket);
    }
    // Remove empty categories
    for (const [cat, tags] of map.entries()) {
      if (tags.length === 0) map.delete(cat);
    }
    return map;
  }, [availableTags]);

  const toggleCategory = (athleteId: string, cat: string) => {
    setExpandedCats(prev => {
      const current = new Set(prev[athleteId] ?? []);
      current.has(cat) ? current.delete(cat) : current.add(cat);
      return { ...prev, [athleteId]: current };
    });
  };

  useEffect(() => {
    loadTags();
    load();
  }, []);

  useEffect(() => { load(); }, [statusFilter]);

  const loadTags = async () => {
    const { data } = await supabase
      .from('visibility_tags')
      .select('id, slug, label, category, sort_order')
      .order('category')
      .order('sort_order');
    setAvailableTags((data || []) as VisibilityTag[]);
  };

  const load = async () => {
    setLoading(true);

    let query = supabase
      .from('athletes')
      .select('id, first_name, last_initial, sport, grade, school, city, slug, profile_status, profile_tier, is_active, source_type, event_code_used, created_at')
      .order('created_at', { ascending: false })
      .limit(200);

    if (statusFilter !== 'all') query = query.eq('profile_status', statusFilter);

    const { data: athleteData } = await query;
    if (!athleteData) { setAthletes([]); setLoading(false); return; }

    const ids = athleteData.map(a => a.id);

    // Load consent status per athlete
    const { data: consentData } = await supabase
      .from('consents')
      .select('athlete_id, consent_status')
      .in('athlete_id', ids);
    const consentMap: Record<string, string> = {};
    (consentData || []).forEach(c => { consentMap[c.athlete_id] = c.consent_status; });

    // Load SAB codes per athlete (first one)
    const { data: sabData } = await supabase
      .from('sab_ids')
      .select('athlete_id, sab_code')
      .in('athlete_id', ids)
      .order('created_at', { ascending: true });
    const sabMap: Record<string, string> = {};
    (sabData || []).forEach(s => { if (!sabMap[s.athlete_id]) sabMap[s.athlete_id] = s.sab_code; });
    const { data: tagData } = await supabase
      .from('athlete_tags')
      .select('athlete_id, visibility_tags(id, slug, label)')
      .in('athlete_id', ids);

    const tagsMap: Record<string, VisibilityTag[]> = {};
    (tagData || []).forEach((row: { athlete_id: string; visibility_tags: VisibilityTag | null }) => {
      if (!tagsMap[row.athlete_id]) tagsMap[row.athlete_id] = [];
      if (row.visibility_tags) tagsMap[row.athlete_id].push(row.visibility_tags);
    });

    const rows: AthleteRow[] = athleteData.map(a => ({
      ...a,
      tags: tagsMap[a.id] || [],
      consent_status: consentMap[a.id] ?? null,
      sab_code: sabMap[a.id] ?? null,
    }));

    setAthletes(rows);

    // Init pending state from current DB values
    const ps: Record<string, string> = {};
    const pt: Record<string, string> = {};
    const ptags: Record<string, string[]> = {};
    rows.forEach(a => {
      ps[a.id] = a.profile_status;
      pt[a.id] = a.profile_tier;
      ptags[a.id] = a.tags.map(t => t.id);
    });
    setPendingStatus(ps);
    setPendingTier(pt);
    setPendingTags(ptags);

    setLoading(false);
  };

  const toggleTag = (athleteId: string, tagId: string) => {
    setPendingTags(prev => {
      const current = prev[athleteId] || [];
      return {
        ...prev,
        [athleteId]: current.includes(tagId)
          ? current.filter(t => t !== tagId)
          : [...current, tagId],
      };
    });
  };

  const saveAthlete = async (athlete: AthleteRow) => {
    setSaving(athlete.id);

    const newStatus = pendingStatus[athlete.id] ?? athlete.profile_status;
    const newTier = pendingTier[athlete.id] ?? athlete.profile_tier;
    const newTagIds = pendingTags[athlete.id] ?? athlete.tags.map(t => t.id);
    // is_active is synced by DB trigger on profile_status change, but set it here for safety
    const isActive = newStatus === 'active';

    // Update athlete row (trigger will also sync is_active)
    await supabase
      .from('athletes')
      .update({ profile_status: newStatus, profile_tier: newTier, is_active: isActive })
      .eq('id', athlete.id);

    // Sync tags: delete all then reinsert
    await supabase.from('athlete_tags').delete().eq('athlete_id', athlete.id);
    if (newTagIds.length > 0) {
      await supabase.from('athlete_tags').insert(
        newTagIds.map(tagId => ({ athlete_id: athlete.id, tag_id: tagId, assigned_by: user?.id }))
      );
    }

    setSaving(null);
    await load();
  };

  const filtered = athletes.filter(a => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return `${a.first_name} ${a.last_initial} ${a.sport} ${a.school || ''} ${a.city || ''}`.toLowerCase().includes(q);
  });

  const pendingCount = athletes.filter(a => a.profile_status === 'pending').length;

  return (
    <DashboardLayout title="Athletes">
      <div className="space-y-5">
        {/* Filters */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex gap-1 bg-white border border-gray-200 rounded-xl p-1">
            {(['all', 'pending', 'active', 'hidden', 'rejected'] as const).map(f => (
              <button
                key={f}
                onClick={() => setStatusFilter(f)}
                className={`px-4 py-1.5 rounded-lg text-sm font-semibold capitalize transition-all ${
                  statusFilter === f ? 'bg-[#1a1f3a] text-white' : 'text-gray-500 hover:text-[#1a1f3a]'
                }`}
              >
                {f.charAt(0).toUpperCase() + f.slice(1)}
                {f === 'pending' && pendingCount > 0 && (
                  <span className="ml-1.5 bg-amber-500 text-white text-[10px] font-black px-1.5 py-0.5 rounded-full">{pendingCount}</span>
                )}
              </button>
            ))}
          </div>
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search athletes..."
            className="flex-1 min-w-[180px] px-4 py-2 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-[#c5a572]"
          />
          <button onClick={load} className="p-2 rounded-xl border border-gray-200 hover:border-gray-300 text-gray-500 hover:text-[#1a1f3a] transition-colors">
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>

        {loading ? (
          <div className="flex justify-center py-20">
            <div className="w-8 h-8 border-4 border-[#c5a572] border-t-transparent rounded-full animate-spin" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="bg-white rounded-2xl border border-gray-200 p-10 text-center">
            <p className="text-gray-400 text-sm">No athletes found.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {filtered.map(athlete => (
              <div key={athlete.id} className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5">
                {/* Header row */}
                <div className="flex items-start justify-between gap-4 mb-4">
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="font-bold text-[#1a1f3a] text-base">
                        {athlete.first_name} {athlete.last_initial}.
                      </h3>
                      <span className="text-xs font-semibold text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full">
                        {athlete.sport}
                      </span>
                      {athlete.profile_tier === 'premium' && (
                        <span className="inline-flex items-center gap-1 text-xs font-bold text-amber-700 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-full">
                          <Star className="w-3 h-3" /> Premium
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-gray-400 mt-0.5">
                      {athlete.grade}{athlete.school ? ` · ${athlete.school}` : ''}{athlete.city ? ` · ${athlete.city}` : ''}
                    </p>
                    <div className="flex flex-wrap items-center gap-2 mt-1.5">
                      {athlete.source_type && (
                        <span className="text-[10px] font-semibold text-gray-400 bg-gray-50 border border-gray-200 px-2 py-0.5 rounded-full uppercase tracking-wide">
                          {athlete.source_type.replace(/_/g, ' ')}
                        </span>
                      )}
                      {athlete.event_code_used && (
                        <span className="text-[10px] font-bold text-sky-600 bg-sky-50 border border-sky-200 px-2 py-0.5 rounded-full">
                          {athlete.event_code_used}
                        </span>
                      )}
                      {athlete.consent_status && (
                        <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${
                          athlete.consent_status === 'accepted'
                            ? 'text-green-700 bg-green-50 border-green-200'
                            : athlete.consent_status === 'revoked'
                              ? 'text-red-700 bg-red-50 border-red-200'
                              : 'text-amber-700 bg-amber-50 border-amber-200'
                        }`}>
                          Consent: {athlete.consent_status}
                        </span>
                      )}
                      {athlete.sab_code && (
                        <span className="text-[10px] font-mono text-gray-400">
                          {athlete.sab_code}
                        </span>
                      )}
                    </div>
                    <p className="text-[10px] text-gray-300 mt-0.5">
                      Joined {new Date(athlete.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className={`inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full border ${statusStyle[athlete.profile_status] || statusStyle.pending}`}>
                      {statusIcon[athlete.profile_status]}
                      {athlete.profile_status === 'verified_event' ? 'Event Verified' : athlete.profile_status.charAt(0).toUpperCase() + athlete.profile_status.slice(1)}
                    </span>
                    <Link
                      to={`/athletes/${athlete.slug}`}
                      target="_blank"
                      className="p-1.5 rounded-lg border border-gray-200 hover:border-gray-300 text-gray-400 hover:text-[#1a1f3a] transition-colors"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>

                {/* Edit controls */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="block text-xs font-semibold text-gray-500 mb-1.5">Profile Status</label>
                    <select
                      value={pendingStatus[athlete.id] ?? athlete.profile_status}
                      onChange={e => setPendingStatus(prev => ({ ...prev, [athlete.id]: e.target.value }))}
                      className="w-full px-3 py-2 rounded-xl border-2 border-gray-200 focus:border-[#c5a572] focus:outline-none text-sm text-[#1a1f3a]"
                    >
                      {STATUS_OPTIONS.map(s => (
                        <option key={s} value={s}>
                          {s === 'verified_event' ? 'Event Verified' : s.charAt(0).toUpperCase() + s.slice(1)}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-500 mb-1.5">Profile Tier</label>
                    <select
                      value={pendingTier[athlete.id] ?? athlete.profile_tier}
                      onChange={e => setPendingTier(prev => ({ ...prev, [athlete.id]: e.target.value }))}
                      className="w-full px-3 py-2 rounded-xl border-2 border-gray-200 focus:border-[#c5a572] focus:outline-none text-sm text-[#1a1f3a]"
                    >
                      {TIER_OPTIONS.map(t => (
                        <option key={t} value={t}>{t.charAt(0).toUpperCase() + t.slice(1)}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Tag picker — grouped by category */}
                {availableTags.length > 0 && (
                  <div className="mb-4">
                    <div className="flex items-center gap-1.5 mb-2">
                      <Tag className="w-3 h-3 text-gray-400" />
                      <span className="text-xs font-semibold text-gray-500">Character &amp; Traits</span>
                      {(pendingTags[athlete.id] ?? []).length > 0 && (
                        <span className="ml-1 bg-[#1a1f3a] text-white text-[10px] font-black px-1.5 py-0.5 rounded-full">
                          {(pendingTags[athlete.id] ?? []).length} assigned
                        </span>
                      )}
                    </div>
                    <div className="border border-gray-200 rounded-xl overflow-hidden divide-y divide-gray-100">
                      {Array.from(groupedTags.entries()).map(([cat, tags]) => {
                        const meta = CATEGORY_DISPLAY[cat] ?? { label: cat, selectedClass: 'bg-gray-700 text-white border-gray-700', dotClass: 'bg-gray-400' };
                        const expanded = expandedCats[athlete.id]?.has(cat) ?? false;
                        const assignedInCat = tags.filter(t => (pendingTags[athlete.id] ?? []).includes(t.id)).length;
                        return (
                          <div key={cat}>
                            <button
                              type="button"
                              onClick={() => toggleCategory(athlete.id, cat)}
                              className="w-full flex items-center justify-between px-3 py-2 bg-gray-50 hover:bg-gray-100 transition-colors text-left"
                            >
                              <div className="flex items-center gap-2">
                                <span className={`w-2 h-2 rounded-full flex-shrink-0 ${meta.dotClass}`} />
                                <span className="text-xs font-bold text-gray-600">{meta.label}</span>
                                <span className="text-[10px] text-gray-400">{tags.length} tags</span>
                                {assignedInCat > 0 && (
                                  <span className="text-[10px] font-bold text-sky-600">{assignedInCat} on</span>
                                )}
                              </div>
                              <ChevronDown className={`w-3.5 h-3.5 text-gray-400 transition-transform duration-200 ${expanded ? 'rotate-180' : ''}`} />
                            </button>
                            {expanded && (
                              <div className="px-3 py-2.5 flex flex-wrap gap-1.5 bg-white">
                                {tags.map(tag => {
                                  const selected = (pendingTags[athlete.id] ?? []).includes(tag.id);
                                  return (
                                    <button
                                      key={tag.id}
                                      type="button"
                                      onClick={() => toggleTag(athlete.id, tag.id)}
                                      className={`px-2.5 py-1 rounded-full text-xs font-semibold border transition-all duration-150 ${
                                        selected
                                          ? meta.selectedClass
                                          : 'bg-white text-gray-500 border-gray-200 hover:border-gray-400 hover:text-gray-700'
                                      }`}
                                    >
                                      {tag.label}
                                    </button>
                                  );
                                })}
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Save button */}
                <button
                  onClick={() => saveAthlete(athlete)}
                  disabled={saving === athlete.id}
                  className="flex items-center gap-1.5 bg-[#1a1f3a] hover:bg-[#252b4a] disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold px-5 py-2 rounded-xl text-sm transition-colors"
                >
                  {saving === athlete.id ? (
                    <><div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />Saving...</>
                  ) : (
                    <><CheckCircle className="w-3.5 h-3.5" />Save Changes</>
                  )}
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}

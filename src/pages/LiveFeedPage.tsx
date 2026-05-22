import { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Zap, Camera, Video, Star, ArrowRight, Tag } from 'lucide-react';
import { supabase } from '../lib/supabase';

interface VisibilityTag {
  slug: string;
  label: string;
}

interface MediaTag {
  tag_id: string;
  visibility_tags: VisibilityTag | null;
}

interface Athlete {
  id: string;
  first_name: string;
  last_initial: string;
  sport: string | null;
  slug: string;
  school: string | null;
  city: string | null;
  profile_tier: string | null;
}

interface FeedItem {
  id: string;
  media_type: string;
  public_url: string | null;
  caption: string | null;
  source_type: string | null;
  event_code: string | null;
  featured: boolean;
  created_at: string;
  athlete: Athlete;
  media_tags: MediaTag[];
}

const SPORT_COLORS: Record<string, string> = {
  basketball: 'bg-orange-500/20 text-orange-400 border-orange-500/30',
  football: 'bg-green-500/20 text-green-400 border-green-500/30',
  'track & field': 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  soccer: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
  baseball: 'bg-red-500/20 text-red-400 border-red-500/30',
  volleyball: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
};

function getSportColor(sport: string | null): string {
  if (!sport) return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
  return SPORT_COLORS[sport.toLowerCase()] ?? 'bg-amber-500/20 text-amber-400 border-amber-500/30';
}

function SkeletonCard() {
  return (
    <div className="bg-[#111827] rounded-2xl overflow-hidden animate-pulse">
      <div className="aspect-[16/9] bg-gray-800" />
      <div className="p-5 space-y-3">
        <div className="flex items-center gap-2">
          <div className="h-4 bg-gray-700 rounded-full w-24" />
          <div className="h-4 bg-gray-700 rounded-full w-16" />
        </div>
        <div className="h-5 bg-gray-700 rounded w-3/4" />
        <div className="h-3 bg-gray-800 rounded w-1/2" />
        <div className="h-3 bg-gray-800 rounded w-full" />
        <div className="h-8 bg-gray-700 rounded-xl mt-4" />
      </div>
    </div>
  );
}

function FeedCard({ item }: { item: FeedItem }) {
  const tags = item.media_tags
    .map(mt => mt.visibility_tags)
    .filter((t): t is VisibilityTag => t !== null);

  const isPremium = item.athlete.profile_tier === 'premium';

  return (
    <div
      className={`bg-[#111827] rounded-2xl overflow-hidden flex flex-col transition-all duration-300 hover:scale-[1.01] hover:shadow-2xl ${
        item.featured
          ? 'border-2 border-amber-400/60 shadow-lg shadow-amber-400/10'
          : 'border border-gray-800'
      }`}
    >
      {/* Media preview */}
      <div className="relative aspect-[16/9] bg-[#0d1520] overflow-hidden">
        {item.media_type === 'photo' && item.public_url ? (
          <img
            src={item.public_url}
            alt={item.caption ?? 'Athlete media'}
            className="w-full h-full object-cover"
          />
        ) : item.media_type === 'video' && item.public_url ? (
          <div className="w-full h-full flex flex-col items-center justify-center gap-3 bg-[#0d1520]">
            <Video className="w-10 h-10 text-gray-600" />
            <span className="text-xs text-gray-500 font-medium">Video</span>
          </div>
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center gap-3 bg-[#0d1520]">
            {item.media_type === 'video' ? (
              <Video className="w-10 h-10 text-gray-600" />
            ) : (
              <Camera className="w-10 h-10 text-gray-600" />
            )}
            <span className="text-xs text-gray-500 font-medium">No preview</span>
          </div>
        )}

        {/* Featured badge */}
        {item.featured && (
          <div className="absolute top-3 right-3 flex items-center gap-1 bg-amber-400 text-[#080f19] text-[10px] font-black px-2.5 py-1 rounded-full uppercase tracking-wide">
            <Zap className="w-3 h-3" />
            Featured
          </div>
        )}

        {/* Source badge */}
        {(item.event_code || item.source_type === 'creator_upload') && (
          <div className="absolute top-3 left-3">
            {item.event_code ? (
              <span className="bg-gray-900/80 text-gray-300 text-[10px] font-bold px-2.5 py-1 rounded-full border border-gray-700 backdrop-blur-sm uppercase tracking-wide">
                {item.event_code}
              </span>
            ) : (
              <span className="bg-gray-900/80 text-amber-400 text-[10px] font-bold px-2.5 py-1 rounded-full border border-amber-400/30 backdrop-blur-sm uppercase tracking-wide">
                Creator
              </span>
            )}
          </div>
        )}
      </div>

      {/* Card body */}
      <div className="p-5 flex flex-col flex-1 gap-3">
        {/* Athlete name + sport */}
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-white font-bold text-base leading-tight">
            {item.athlete.first_name} {item.athlete.last_initial}.
          </span>
          {isPremium && (
            <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400 shrink-0" aria-label="Premium athlete" />
          )}
          {item.athlete.sport && (
            <span
              className={`text-[11px] font-semibold px-2.5 py-0.5 rounded-full border ${getSportColor(item.athlete.sport)}`}
            >
              {item.athlete.sport}
            </span>
          )}
        </div>

        {/* School / city */}
        {(item.athlete.school || item.athlete.city) && (
          <p className="text-gray-500 text-xs leading-snug">
            {[item.athlete.school, item.athlete.city].filter(Boolean).join(' · ')}
          </p>
        )}

        {/* Caption */}
        {item.caption && (
          <p className="text-gray-400 text-sm leading-relaxed line-clamp-2 italic">
            "{item.caption}"
          </p>
        )}

        {/* Tags */}
        {tags.length > 0 && (
          <div className="flex items-center gap-1.5 flex-wrap">
            <Tag className="w-3 h-3 text-amber-500/60 shrink-0" />
            {tags.map(tag => (
              <span
                key={tag.slug}
                className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-amber-400/10 text-amber-400 border border-amber-400/20"
              >
                {tag.label}
              </span>
            ))}
          </div>
        )}

        {/* View Profile CTA */}
        <div className="mt-auto pt-2">
          <Link
            to={`/athletes/${item.athlete.slug}`}
            className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl bg-amber-400/10 hover:bg-amber-400/20 text-amber-400 font-semibold text-sm border border-amber-400/20 hover:border-amber-400/40 transition-all duration-200 group"
          >
            View Profile
            <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function LiveFeedPage() {
  const [items, setItems] = useState<FeedItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [sportFilter, setSportFilter] = useState('All Sports');
  const [typeFilter, setTypeFilter] = useState<'All' | 'Photos' | 'Videos'>('All');

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      const { data } = await supabase
        .from('media_uploads')
        .select(`
          id, media_type, public_url, caption, source_type, event_code, featured, created_at,
          athlete:athletes!inner(id, first_name, last_initial, sport, slug, school, city, profile_tier),
          media_tags(tag_id, visibility_tags(slug, label))
        `)
        .eq('status', 'approved')
        .order('created_at', { ascending: false })
        .limit(50);

      if (data) {
        setItems(data as unknown as FeedItem[]);
      }
      setLoading(false);
    };

    load();
  }, []);

  // Derive sport options from loaded items
  const sportOptions = useMemo(() => {
    const sports = new Set<string>();
    items.forEach(item => {
      if (item.athlete.sport) sports.add(item.athlete.sport);
    });
    return ['All Sports', ...Array.from(sports).sort()];
  }, [items]);

  const filtered = useMemo(() => {
    return items.filter(item => {
      const matchesSport =
        sportFilter === 'All Sports' ||
        item.athlete.sport?.toLowerCase() === sportFilter.toLowerCase();
      const matchesType =
        typeFilter === 'All' ||
        (typeFilter === 'Photos' && item.media_type === 'photo') ||
        (typeFilter === 'Videos' && item.media_type === 'video');
      return matchesSport && matchesType;
    });
  }, [items, sportFilter, typeFilter]);

  // Featured items first, then rest
  const sorted = useMemo(
    () => [...filtered].sort((a, b) => (b.featured ? 1 : 0) - (a.featured ? 1 : 0)),
    [filtered]
  );

  return (
    <div className="min-h-screen bg-[#0d1520] pt-20">
      {/* Hero */}
      <section className="bg-[#080f19] py-16 border-b border-gray-800">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 text-center">
          <div className="inline-flex items-center gap-2 bg-amber-400/10 text-amber-400 px-4 py-2 rounded-full text-sm font-semibold mb-6 border border-amber-400/20">
            <Zap className="w-4 h-4" />
            Spotlight
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
            NextUp Spotlight
          </h1>
          <p className="text-xl text-gray-400 max-w-2xl mx-auto leading-relaxed">
            Approved photos and highlights from Memphis athletes. Real moments, real visibility.
          </p>
        </div>
      </section>

      {/* Filter bar */}
      <section className="bg-[#0d1520] border-b border-gray-800 sticky top-20 z-30">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 py-4">
          <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
            {/* Sport dropdown */}
            <select
              value={sportFilter}
              onChange={e => setSportFilter(e.target.value)}
              className="px-4 py-2.5 rounded-xl border border-gray-700 bg-[#111827] text-gray-300 text-sm focus:border-amber-400 focus:outline-none"
            >
              {sportOptions.map(s => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>

            {/* Type filter pills */}
            <div className="flex gap-1 bg-[#111827] border border-gray-700 rounded-xl p-1">
              {(['All', 'Photos', 'Videos'] as const).map(type => (
                <button
                  key={type}
                  onClick={() => setTypeFilter(type)}
                  className={`px-4 py-1.5 rounded-lg text-sm font-semibold transition-all ${
                    typeFilter === type
                      ? 'bg-amber-400 text-[#080f19]'
                      : 'text-gray-400 hover:text-white'
                  }`}
                >
                  {type}
                </button>
              ))}
            </div>

            {!loading && (
              <p className="text-xs text-gray-600 sm:ml-auto">
                {sorted.length} item{sorted.length !== 1 ? 's' : ''}
              </p>
            )}
          </div>
        </div>
      </section>

      {/* Grid */}
      <section className="py-12">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              <SkeletonCard />
              <SkeletonCard />
              <SkeletonCard />
            </div>
          ) : sorted.length === 0 ? (
            <div className="text-center py-24">
              <Camera className="w-14 h-14 text-gray-700 mx-auto mb-5" />
              <h2 className="text-xl font-bold text-white mb-3">Nothing here yet</h2>
              <p className="text-gray-500 mb-8 max-w-sm mx-auto leading-relaxed">
                {items.length === 0
                  ? 'No approved media yet. Check back soon as athletes share their highlights.'
                  : 'No media matches your current filters. Try adjusting your selection.'}
              </p>
              {items.length === 0 ? (
                <Link
                  to="/signup"
                  className="inline-flex items-center gap-2 bg-amber-400 hover:bg-amber-300 text-[#080f19] font-bold px-8 py-3 rounded-xl transition-colors"
                >
                  Join NextUp
                  <ArrowRight className="w-4 h-4" />
                </Link>
              ) : (
                <button
                  onClick={() => { setSportFilter('All Sports'); setTypeFilter('All'); }}
                  className="text-amber-400 hover:text-amber-300 font-semibold text-sm underline underline-offset-2"
                >
                  Clear filters
                </button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {sorted.map(item => (
                <FeedCard key={item.id} item={item} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Bottom CTA */}
      {!loading && sorted.length > 0 && (
        <section className="py-16 bg-[#080f19] border-t border-gray-800">
          <div className="max-w-2xl mx-auto px-6 lg:px-8 text-center">
            <Zap className="w-10 h-10 text-amber-400 mx-auto mb-4" />
            <h2 className="text-2xl md:text-3xl font-bold text-white mb-3">
              Get Your Athlete Featured
            </h2>
            <p className="text-gray-400 mb-8 leading-relaxed">
              Submit media for your athlete and get approved content featured on the NextUp Spotlight.
            </p>
            <Link
              to="/signup"
              className="inline-flex items-center gap-2 bg-amber-400 hover:bg-amber-300 text-[#080f19] font-bold px-10 py-4 rounded-xl text-lg transition-colors"
            >
              Get Started
              <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
        </section>
      )}
    </div>
  );
}

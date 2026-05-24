import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Zap, Camera, Video, Star, ArrowRight, Tag, Loader2, Users, MessageCircle, Shield, Heart, BookOpen, Flame, Video as LucideIcon } from 'lucide-react';
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

const PAGE_SIZE = 12;

const TAG_ICONS: Record<string, LucideIcon> = {
  leadership: Users,
  hustle: Zap,
  communication: MessageCircle,
  composure: Shield,
  confidence: Star,
  teamwork: Heart,
  coachable: BookOpen,
  energy: Flame,
};

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
    <div className="bg-[#111827] rounded-2xl overflow-hidden animate-pulse border border-gray-800">
      <div className="aspect-[4/5] bg-gray-800" />
      <div className="p-5 space-y-3">
        <div className="flex items-center gap-2">
          <div className="h-4 bg-gray-700 rounded-full w-24" />
          <div className="h-4 bg-gray-700 rounded-full w-16" />
        </div>
        <div className="h-3 bg-gray-800 rounded w-1/2" />
        <div className="h-3 bg-gray-800 rounded w-full" />
        <div className="h-3 bg-gray-800 rounded w-3/4" />
        <div className="h-10 bg-gray-700 rounded-xl mt-4" />
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
    <article
      className={`bg-[#111827] rounded-2xl overflow-hidden flex flex-col transition-shadow duration-300 hover:shadow-2xl hover:shadow-black/40 ${
        item.featured
          ? 'border-2 border-amber-400/60 shadow-lg shadow-amber-400/10'
          : 'border border-gray-800'
      }`}
    >
      {/* Media */}
      <div className="relative bg-[#0d1520] overflow-hidden">
        {item.media_type === 'photo' && item.public_url ? (
          <div className="aspect-[4/5]">
            <img
              src={item.public_url}
              alt={item.caption ?? 'Athlete media'}
              loading="lazy"
              className="w-full h-full object-cover"
            />
          </div>
        ) : item.media_type === 'video' && item.public_url ? (
          <div className="aspect-video">
            <video
              src={item.public_url}
              controls
              playsInline
              preload="metadata"
              className="w-full h-full object-cover bg-[#0d1520]"
            />
          </div>
        ) : (
          <div className="aspect-[4/5] flex flex-col items-center justify-center gap-3">
            {item.media_type === 'video' ? (
              <Video className="w-12 h-12 text-gray-700" />
            ) : (
              <Camera className="w-12 h-12 text-gray-700" />
            )}
            <span className="text-xs text-gray-600 font-medium">No preview</span>
          </div>
        )}

        {/* Featured badge */}
        {item.featured && (
          <div className="absolute top-3 right-3 flex items-center gap-1 bg-amber-400 text-[#080f19] text-[10px] font-black px-2.5 py-1 rounded-full uppercase tracking-wide shadow-md">
            <Zap className="w-3 h-3" />
            Featured
          </div>
        )}

        {/* Source / event badge */}
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
        {/* Athlete name + sport + premium */}
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

        {/* Caption — full text, no clamp */}
        {item.caption && (
          <p className="text-gray-400 text-sm leading-relaxed italic">
            "{item.caption}"
          </p>
        )}

        {/* Trait / development tags */}
        {tags.length > 0 && (
          <div className="flex items-center gap-1.5 flex-wrap">
            {tags.map(tag => {
              const Icon = TAG_ICONS[tag.slug] ?? Tag;
              return (
                <span
                  key={tag.slug}
                  className="inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full bg-amber-400/10 text-amber-400 border border-amber-400/20"
                >
                  <Icon className="w-3 h-3 shrink-0" />
                  {tag.label}
                </span>
              );
            })}
          </div>
        )}

        {/* View Profile CTA */}
        <div className="mt-auto pt-3">
          <Link
            to={`/athletes/${item.athlete.slug}`}
            className="flex items-center justify-center gap-2 w-full py-3 rounded-xl bg-amber-400/10 hover:bg-amber-400/20 text-amber-400 font-semibold text-sm border border-amber-400/20 hover:border-amber-400/40 transition-all duration-200 group"
          >
            View Profile
            <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
          </Link>
        </div>
      </div>
    </article>
  );
}

async function fetchPage(
  cursor: string | null,
  sportFilter: string,
  typeFilter: 'All' | 'Photos' | 'Videos',
): Promise<FeedItem[]> {
  let query = supabase
    .from('media_uploads')
    .select(`
      id, media_type, public_url, caption, source_type, event_code, featured, created_at,
      athlete:athletes!inner(id, first_name, last_initial, sport, slug, school, city, profile_tier),
      media_tags(tag_id, visibility_tags(slug, label))
    `)
    .eq('status', 'approved')
    .order('featured', { ascending: false })
    .order('created_at', { ascending: false })
    .limit(PAGE_SIZE);

  if (cursor) {
    query = query.lt('created_at', cursor);
  }

  if (sportFilter !== 'All Sports') {
    query = query.eq('athlete.sport', sportFilter);
  }

  if (typeFilter === 'Photos') {
    query = query.eq('media_type', 'photo');
  } else if (typeFilter === 'Videos') {
    query = query.eq('media_type', 'video');
  }

  const { data } = await query;
  return (data ?? []) as unknown as FeedItem[];
}

export default function LiveFeedPage() {
  const [items, setItems] = useState<FeedItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [sportFilter, setSportFilter] = useState('All Sports');
  const [typeFilter, setTypeFilter] = useState<'All' | 'Photos' | 'Videos'>('All');

  // All unique sports seen across all loaded items (persists across pages for stable dropdown)
  const [knownSports, setKnownSports] = useState<string[]>([]);

  const cursorRef = useRef<string | null>(null);
  const sentinelRef = useRef<HTMLDivElement | null>(null);
  const observerRef = useRef<IntersectionObserver | null>(null);

  // Initial / filter-reset load
  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      setLoading(true);
      setItems([]);
      setHasMore(true);
      cursorRef.current = null;

      const page = await fetchPage(null, sportFilter, typeFilter);

      if (cancelled) return;

      setItems(page);
      setHasMore(page.length === PAGE_SIZE);
      cursorRef.current = page.length > 0 ? page[page.length - 1].created_at : null;

      // Accumulate known sports for stable dropdown
      setKnownSports(prev => {
        const set = new Set(prev);
        page.forEach(item => { if (item.athlete.sport) set.add(item.athlete.sport); });
        return Array.from(set).sort();
      });

      setLoading(false);
    };

    load();
    return () => { cancelled = true; };
  }, [sportFilter, typeFilter]);

  const loadMore = useCallback(async () => {
    if (loadingMore || !hasMore || !cursorRef.current) return;

    setLoadingMore(true);
    const page = await fetchPage(cursorRef.current, sportFilter, typeFilter);

    setItems(prev => [...prev, ...page]);
    setHasMore(page.length === PAGE_SIZE);
    cursorRef.current = page.length > 0 ? page[page.length - 1].created_at : null;

    setKnownSports(prev => {
      const set = new Set(prev);
      page.forEach(item => { if (item.athlete.sport) set.add(item.athlete.sport); });
      return Array.from(set).sort();
    });

    setLoadingMore(false);
  }, [loadingMore, hasMore, sportFilter, typeFilter]);

  // IntersectionObserver wired to sentinel
  useEffect(() => {
    if (observerRef.current) observerRef.current.disconnect();

    observerRef.current = new IntersectionObserver(
      entries => {
        if (entries[0].isIntersecting) loadMore();
      },
      { rootMargin: '200px' },
    );

    if (sentinelRef.current) observerRef.current.observe(sentinelRef.current);

    return () => { observerRef.current?.disconnect(); };
  }, [loadMore]);

  const sportOptions = useMemo(
    () => ['All Sports', ...knownSports],
    [knownSports],
  );

  const isEmpty = !loading && items.length === 0;

  return (
    <div className="min-h-screen bg-[#0d1520] pt-20">
      {/* Hero */}
      <section className="bg-[#080f19] py-14 border-b border-gray-800">
        <div className="max-w-xl mx-auto px-6 text-center">
          <div className="inline-flex items-center gap-2 bg-amber-400/10 text-amber-400 px-4 py-2 rounded-full text-sm font-semibold mb-5 border border-amber-400/20">
            <Zap className="w-4 h-4" />
            Spotlight
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-3 leading-tight">
            NextUp Spotlight
          </h1>
          <p className="text-lg text-gray-400 leading-relaxed">
            Curated photos and highlights from Memphis athletes. Real moments, real visibility.
          </p>
        </div>
      </section>

      {/* Sticky filter bar */}
      <section className="bg-[#0d1520]/95 backdrop-blur-sm border-b border-gray-800 sticky top-20 z-30">
        <div className="max-w-xl mx-auto px-4 py-3">
          <div className="flex gap-2 items-center">
            {/* Sport dropdown */}
            <select
              value={sportFilter}
              onChange={e => setSportFilter(e.target.value)}
              className="flex-1 min-w-0 px-3 py-2 rounded-xl border border-gray-700 bg-[#111827] text-gray-300 text-sm focus:border-amber-400 focus:outline-none"
            >
              {sportOptions.map(s => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>

            {/* Type filter pills */}
            <div className="flex gap-1 bg-[#111827] border border-gray-700 rounded-xl p-1 shrink-0">
              {(['All', 'Photos', 'Videos'] as const).map(type => (
                <button
                  key={type}
                  onClick={() => setTypeFilter(type)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                    typeFilter === type
                      ? 'bg-amber-400 text-[#080f19]'
                      : 'text-gray-400 hover:text-white'
                  }`}
                >
                  {type}
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Feed */}
      <section className="py-8 px-4">
        <div className="max-w-[520px] mx-auto flex flex-col gap-6">
          {loading ? (
            <>
              <SkeletonCard />
              <SkeletonCard />
              <SkeletonCard />
            </>
          ) : isEmpty ? (
            <div className="text-center py-24">
              <Camera className="w-14 h-14 text-gray-700 mx-auto mb-5" />
              <h2 className="text-xl font-bold text-white mb-3">Nothing here yet</h2>
              <p className="text-gray-500 mb-8 max-w-sm mx-auto leading-relaxed">
                No media matches your current filters. Try adjusting your selection.
              </p>
              <button
                onClick={() => { setSportFilter('All Sports'); setTypeFilter('All'); }}
                className="text-amber-400 hover:text-amber-300 font-semibold text-sm underline underline-offset-2"
              >
                Clear filters
              </button>
            </div>
          ) : (
            <>
              {items.map(item => (
                <FeedCard key={item.id} item={item} />
              ))}

              {/* Bottom loading spinner */}
              {loadingMore && (
                <div className="flex justify-center py-6">
                  <Loader2 className="w-6 h-6 text-amber-400 animate-spin" />
                </div>
              )}

              {/* End of feed */}
              {!hasMore && !loadingMore && (
                <div className="text-center py-10 border-t border-gray-800">
                  <p className="text-gray-600 text-sm font-medium mb-1">You've seen everything.</p>
                  <p className="text-gray-700 text-xs">More highlights added as athletes share their moments.</p>
                  <Link
                    to="/signup"
                    className="inline-flex items-center gap-2 mt-6 bg-amber-400 hover:bg-amber-300 text-[#080f19] font-bold px-8 py-3 rounded-xl text-sm transition-colors"
                  >
                    Get Your Athlete Featured
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              )}

              {/* Sentinel — triggers loadMore via IntersectionObserver */}
              {hasMore && <div ref={sentinelRef} className="h-1" aria-hidden="true" />}
            </>
          )}
        </div>
      </section>
    </div>
  );
}

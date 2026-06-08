import { useState, useEffect, useMemo } from 'react';
import { Users, MapPin, ArrowRight, Search } from 'lucide-react';
import { Link } from 'react-router-dom';
import { AthleteService } from '../services/athleteService';
import type { Athlete } from '../types/athlete';
import { supabase } from '../lib/supabase';
import TraitBadge from '../components/TraitBadge';
import type { VisibilityTag } from '../types/traits';
import { sortedTraits } from '../types/traits';

const SPORTS = ['All Sports', 'Basketball', 'Football', 'Track & Field', 'Soccer', 'Baseball', 'Volleyball', 'Other'];

export default function AthletesPage() {
  const [athletes, setAthletes] = useState<Athlete[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [sport, setSport] = useState('All Sports');
  const [traitMap, setTraitMap] = useState<Map<string, VisibilityTag[]>>(new Map());

  useEffect(() => {
    AthleteService.getAllAthletes().then(data => {
      setAthletes(data);
      setLoading(false);
    });

    supabase
      .from('athlete_tags')
      .select('athlete_id, visibility_tags(id, slug, label, category, sort_order)')
      .then(({ data }) => {
        if (!data) return;
        const map = new Map<string, VisibilityTag[]>();
        for (const row of (data as unknown as { athlete_id: string; visibility_tags: VisibilityTag | null }[])) {
          if (!row.visibility_tags) continue;
          const existing = map.get(row.athlete_id) ?? [];
          existing.push(row.visibility_tags);
          map.set(row.athlete_id, existing);
        }
        // Sort each athlete's traits by sort_order
        for (const [id, tags] of map.entries()) {
          map.set(id, sortedTraits(tags.map(vt => ({ visibility_tags: vt }))));
        }
        setTraitMap(map);
      });
  }, []);

  const filtered = useMemo(() => {
    return athletes.filter(a => {
      const matchesSport = sport === 'All Sports' || a.sport?.toLowerCase().includes(sport.toLowerCase());
      const q = search.toLowerCase();
      const matchesSearch = !q || (
        a.first_name?.toLowerCase().includes(q) ||
        a.last_initial?.toLowerCase().includes(q) ||
        a.school?.toLowerCase().includes(q) ||
        a.sport?.toLowerCase().includes(q) ||
        a.position?.toLowerCase().includes(q)
      );
      return matchesSport && matchesSearch;
    });
  }, [athletes, search, sport]);

  const getProfilePath = (athlete: Athlete) =>
    athlete.slug === 'jacob-f' ? '/athletes/jacob-fouse' : `/athletes/${athlete.slug}`;

  return (
    <div className="min-h-screen bg-gray-50 pt-20">
      {/* Hero */}
      <section className="bg-navy text-white py-16">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="flex items-center gap-2 mb-4">
            <Users className="w-8 h-8 text-gold" />
            <h1 className="text-4xl md:text-5xl font-bold">NextUp Memphis Athletes</h1>
          </div>
          <p className="text-xl text-gray-300 max-w-3xl">
            Explore the journeys, highlights, and stories of young athletes across the city.
          </p>
        </div>
      </section>

      {/* Search & Filter */}
      <section className="bg-white border-b border-gray-200 sticky top-20 z-30">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 py-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search by name, sport, school..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="w-full pl-9 pr-4 py-2.5 rounded-lg border border-gray-200 focus:border-gold focus:outline-none text-sm"
              />
            </div>
            <select
              value={sport}
              onChange={e => setSport(e.target.value)}
              className="px-4 py-2.5 rounded-lg border border-gray-200 focus:border-gold focus:outline-none text-sm text-gray-700 bg-white"
            >
              {SPORTS.map(s => <option key={s}>{s}</option>)}
            </select>
          </div>
          {(search || sport !== 'All Sports') && (
            <p className="text-xs text-gray-400 mt-2">
              {filtered.length} athlete{filtered.length !== 1 ? 's' : ''} found
              {search && ` for "${search}"`}
              {sport !== 'All Sports' && ` in ${sport}`}
            </p>
          )}
        </div>
      </section>

      {/* Athlete Grid */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          {loading ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[1, 2, 3, 4, 5, 6].map(i => (
                <div key={i} className="bg-white rounded-xl shadow-lg overflow-hidden animate-pulse">
                  <div className="aspect-[4/5] bg-gray-200" />
                  <div className="p-6 space-y-3">
                    <div className="h-4 bg-gray-200 rounded w-3/4" />
                    <div className="h-3 bg-gray-100 rounded w-1/2" />
                  </div>
                </div>
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-20">
              <p className="text-gray-500 text-xl mb-4">
                {athletes.length === 0 ? 'No athletes yet. Check back soon!' : 'No athletes match your search.'}
              </p>
              {(search || sport !== 'All Sports') && (
                <button
                  onClick={() => { setSearch(''); setSport('All Sports'); }}
                  className="text-gold hover:underline font-medium text-sm"
                >
                  Clear filters
                </button>
              )}
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filtered.map((athlete) => (
                <div
                  key={athlete.id}
                  className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-2xl transition-all duration-300 group"
                >
                  <div className="aspect-[4/5] overflow-hidden bg-gray-200">
                    <img
                      src={athlete.image_url || 'https://images.pexels.com/photos/2834914/pexels-photo-2834914.jpeg?auto=compress&cs=tinysrgb&w=800'}
                      alt={`${athlete.first_name} ${athlete.last_initial}`}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                  <div className="p-6">
                    <div className="flex items-center gap-2 text-gray-500 text-sm mb-2">
                      <MapPin className="w-4 h-4" />
                      <span>{athlete.city || 'Memphis, TN'}</span>
                    </div>
                    <h3 className="text-2xl font-bold text-navy mb-1">
                      {athlete.first_name} {athlete.last_initial}.
                    </h3>
                    <p className="text-gray-600 mb-1">{athlete.position} • {athlete.grade}</p>
                    <p className="text-gold font-semibold text-sm mb-3">{athlete.descriptor}</p>
                    {(() => {
                      const traits = traitMap.get(athlete.id) ?? [];
                      if (traits.length === 0) return null;
                      const visible = traits.slice(0, 3);
                      const extra = traits.length - visible.length;
                      return (
                        <div className="flex flex-wrap gap-1.5 mb-4">
                          {visible.map(trait => (
                            <TraitBadge key={trait.id} trait={trait} size="sm" />
                          ))}
                          {extra > 0 && (
                            <span className="inline-flex items-center rounded-full border border-gray-200 bg-gray-50 text-gray-500 text-xs font-semibold px-2 py-0.5">
                              +{extra} more
                            </span>
                          )}
                        </div>
                      );
                    })()}
                    <Link
                      to={getProfilePath(athlete)}
                      className="btn-primary w-full flex items-center justify-center gap-2"
                    >
                      View Profile
                      <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* CTA Strip */}
      <section className="py-16 bg-navy text-white">
        <div className="max-w-3xl mx-auto px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Want to be featured?</h2>
          <p className="text-xl text-gray-300 mb-8">
            Sign up to get your athlete profile, highlights, and exposure opportunities.
          </p>
          <Link
            to="/signup"
            className="btn-primary text-lg px-10 py-4 inline-flex items-center gap-2"
          >
            Get Started
            <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </section>
    </div>
  );
}

import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, MapPin } from 'lucide-react';
import { supabase } from '../lib/supabase';
import type { Athlete } from '../types/athlete';

export function AthletesPage() {
  const [athletes, setAthletes] = useState<Athlete[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;

    (async () => {
      const { data, error: queryError } = await supabase
        .from('athletes')
        .select('*')
        .eq('profile_status', 'active')
        .order('created_at', { ascending: false });

      if (!active) return;
      if (queryError) {
        setError('Athlete profiles are temporarily unavailable. Please try again shortly.');
      } else {
        setAthletes((data ?? []) as Athlete[]);
      }
      setLoading(false);
    })();

    return () => {
      active = false;
    };
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 py-16">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="max-w-3xl mb-12">
          <p className="text-xs font-bold uppercase tracking-widest text-blue-600 mb-3">Youth &amp; Opportunity</p>
          <h1 className="text-4xl sm:text-5xl font-black text-navy-900 tracking-tight mb-4">Athlete stories worth recognizing.</h1>
          <p className="text-lg text-gray-600 leading-relaxed">Explore public profiles that make the skills, character, and experiences behind each performance visible.</p>
        </div>

        {loading && <div className="rounded-2xl bg-white border border-gray-200 p-10 text-center text-gray-500">Loading athlete profiles...</div>}

        {!loading && error && (
          <div className="rounded-2xl bg-red-50 border border-red-200 p-8 text-center text-red-800">{error}</div>
        )}

        {!loading && !error && athletes.length === 0 && (
          <div className="rounded-2xl bg-white border border-gray-200 p-10 text-center text-gray-500">No published athlete profiles are available yet.</div>
        )}

        {!loading && !error && athletes.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {athletes.map((athlete) => (
              <Link key={athlete.id} to={`/youth/${athlete.slug}`} className="group bg-white rounded-2xl overflow-hidden border border-gray-200 hover:border-blue-300 hover:shadow-xl transition-all duration-300">
                <div className="aspect-[4/3] bg-navy-900 overflow-hidden">
                  {athlete.image_url ? (
                    <img src={athlete.image_url} alt={`${athlete.first_name} ${athlete.last_initial}`} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-blue-200 font-bold">NextUp Athlete</div>
                  )}
                </div>
                <div className="p-6">
                  <div className="flex items-center justify-between gap-3 mb-3">
                    <span className="text-xs font-bold uppercase tracking-widest text-blue-600">{athlete.sport}</span>
                    <ArrowRight className="w-4 h-4 text-blue-600 group-hover:translate-x-1 transition-transform" />
                  </div>
                  <h2 className="text-2xl font-black text-navy-900 mb-2">{athlete.first_name} {athlete.last_initial}.</h2>
                  <p className="text-sm text-gray-600 mb-3">{athlete.position} · {athlete.grade}</p>
                  {athlete.city && <p className="flex items-center gap-2 text-sm text-gray-500"><MapPin className="w-4 h-4" />{athlete.city}</p>}
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

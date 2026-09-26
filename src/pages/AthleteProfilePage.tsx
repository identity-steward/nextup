import { useParams } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { AthleteService } from '../services/athleteService';
import type { Athlete } from '../types/athlete';

export function AthleteProfilePage() {
  const { slug } = useParams<{ slug: string }>();
  const [athlete, setAthlete] = useState<Athlete | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!slug) return;
    AthleteService.getAthleteBySlug(slug).then((data) => {
      setAthlete(data);
      setLoading(false);
    });
  }, [slug]);

  if (loading) return <div className="min-h-screen flex items-center justify-center"><div className="w-8 h-8 border-4 border-amber-500 border-t-transparent rounded-full animate-spin" /></div>;
  if (!athlete) return <div className="min-h-screen flex items-center justify-center text-gray-400">Athlete not found.</div>;

  return (
    <div className="min-h-screen bg-white">
      <div className="bg-[#0f1923] text-white py-16">
        <div className="max-w-4xl mx-auto px-6">
          <h1 className="text-4xl font-black mb-2">{athlete.first_name} {athlete.last_initial}.</h1>
          <p className="text-gray-300">{athlete.sport} · {athlete.school || athlete.city || ''}</p>
        </div>
      </div>
      <div className="max-w-4xl mx-auto px-6 py-8">
        <p className="text-gray-600">{athlete.bio}</p>
      </div>
    </div>
  );
}

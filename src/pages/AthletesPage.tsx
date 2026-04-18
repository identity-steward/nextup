import { useState, useEffect } from 'react';
import { Users, MapPin, ArrowRight, UserPlus } from 'lucide-react';
import { AthleteService } from '../services/athleteService';
import type { Athlete } from '../types/athlete';

interface AthletesPageProps {
  onNavigate?: (page: string, slug?: string) => void;
}

export default function AthletesPage({ onNavigate }: AthletesPageProps) {
  const [athletes, setAthletes] = useState<Athlete[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadAthletes = async () => {
      const data = await AthleteService.getAllAthletes();
      setAthletes(data);
      setLoading(false);
    };

    loadAthletes();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 pt-20">
        <div className="text-navy text-xl">Loading athletes...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pt-20">
      <section className="bg-navy text-white py-16">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="flex items-center gap-2 mb-4">
            <Users className="w-8 h-8 text-gold" />
            <h1 className="text-4xl md:text-5xl font-bold">Meet the NextUp Memphis Athletes</h1>
          </div>
          <p className="text-xl text-gray-300 max-w-3xl">
            Explore the journeys, highlights, and stories of young athletes across the city.
          </p>
        </div>
      </section>

      <section className="py-16">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          {athletes.length === 0 ? (
            <div className="text-center py-20">
              <p className="text-gray-600 text-xl">No athletes found. Check back soon!</p>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {athletes.map((athlete) => (
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
                    <div className="flex items-center gap-2 text-gray-600 text-sm mb-2">
                      <MapPin className="w-4 h-4" />
                      <span>{athlete.city}</span>
                    </div>
                    <h3 className="text-2xl font-bold text-navy mb-1">
                      {athlete.first_name} {athlete.last_initial}
                    </h3>
                    <p className="text-gray-600 mb-1">{athlete.position} • {athlete.grade}</p>
                    <p className="text-gold font-semibold text-sm mb-4">{athlete.descriptor}</p>
                    <button
                      onClick={() => onNavigate?.('athlete-profile', athlete.slug)}
                      className="btn-primary w-full flex items-center justify-center gap-2"
                    >
                      View Profile
                      <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      <section className="py-16 bg-gradient-to-br from-navy via-navy-light to-navy text-white">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Get Featured on NextUp</h2>
            <p className="text-xl text-gray-300 max-w-2xl mx-auto">
              Sign up to get your athlete profile, highlights, and exposure opportunities.
            </p>
          </div>

          <div className="rounded-[28px] border border-white/10 bg-white p-2 sm:p-3 md:p-4 shadow-2xl">
            <div className="overflow-hidden rounded-[22px] bg-slate-50">
              <iframe
                src="https://tally.so/embed/Ek0MxA?alignLeft=1&hideTitle=1&transparentBackground=1&dynamicHeight=1"
                width="100%"
                height="1100"
                frameBorder="0"
                marginHeight={0}
                marginWidth={0}
                title="Get Featured on NextUp"
                className="block w-full"
                style={{ minHeight: '1100px' }}
              />
            </div>
          </div>
        </div>
      </section>

      <section className="py-16 bg-navy text-white">
        <div className="max-w-4xl mx-auto px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Need more information?</h2>
          <p className="text-xl text-gray-300 mb-8">
            Learn about our pricing and what's included with your athlete's profile page.
          </p>
          <button
            onClick={() => onNavigate?.('create')}
            className="btn-primary text-lg px-10 py-4 inline-flex items-center gap-2"
          >
            Learn More
            <ArrowRight className="w-5 h-5" />
          </button>
        </div>
      </section>
    </div>
  );
}

import { useState, useEffect } from 'react';
import { ArrowLeft } from 'lucide-react';
import { AthleteService } from '../services/athleteService';
import type { Athlete } from '../types/athlete';
import AthleteProfileTemplate from '../components/AthleteProfileTemplate';

interface AthleteProfilePageProps {
  slug?: string;
  onNavigate?: (page: string) => void;
}

export default function AthleteProfilePage({ slug, onNavigate }: AthleteProfilePageProps) {
  const [athlete, setAthlete] = useState<Athlete | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadAthlete = async () => {
      if (!slug) {
        setLoading(false);
        return;
      }

      const data = await AthleteService.getAthleteBySlug(slug);
      setAthlete(data);
      setLoading(false);
    };

    loadAthlete();
  }, [slug]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 pt-20">
        <div className="text-navy text-xl">Loading athlete profile...</div>
      </div>
    );
  }

  if (!athlete) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 pt-20">
        <div className="text-center">
          <p className="text-navy text-xl mb-4">Athlete not found</p>
          <button
            onClick={() => onNavigate?.('athletes')}
            className="btn-primary inline-flex items-center gap-2"
          >
            <ArrowLeft className="w-5 h-5" />
            Back to Athletes
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="pt-20">
      <AthleteProfileTemplate
        athlete={athlete}
        onBack={() => onNavigate?.('athletes')}
      />
    </div>
  );
}

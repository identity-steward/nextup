import { useState, useEffect } from 'react';
import { ArrowLeft } from 'lucide-react';
import { useParams, useNavigate } from 'react-router-dom';
import { AthleteService } from '../services/athleteService';
import type { Athlete } from '../types/athlete';
import AthleteProfileTemplate from '../components/AthleteProfileTemplate';
import { supabase } from '../lib/supabase';

interface ApprovedMedia {
  id: string;
  media_type: string;
  public_url: string | null;
  caption: string | null;
  featured: boolean;
  created_at: string;
}

interface AthleteTag {
  visibility_tags: { id: string; slug: string; label: string } | null;
}

export default function AthleteProfilePage() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const [athlete, setAthlete] = useState<Athlete | null>(null);
  const [approvedMedia, setApprovedMedia] = useState<ApprovedMedia[]>([]);
  const [athleteTags, setAthleteTags] = useState<AthleteTag[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadAthlete = async () => {
      if (!slug) {
        setLoading(false);
        return;
      }
      const data = await AthleteService.getAthleteBySlug(slug);
      setAthlete(data);

      if (data) {
        const [{ data: mediaData }, { data: tagData }] = await Promise.all([
          supabase
            .from('media_uploads')
            .select('id, media_type, public_url, caption, featured, created_at, media_tags(tag_id, visibility_tags(slug, label))')
            .eq('athlete_id', data.id)
            .eq('status', 'approved')
            .order('featured', { ascending: false })
            .order('created_at', { ascending: false })
            .limit(12),
          supabase
            .from('athlete_tags')
            .select('visibility_tags(id, slug, label)')
            .eq('athlete_id', data.id),
        ]);

        setApprovedMedia((mediaData as ApprovedMedia[]) ?? []);
        setAthleteTags((tagData as AthleteTag[]) ?? []);
      }

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
            onClick={() => navigate('/athletes')}
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
        onBack={() => navigate('/athletes')}
        approvedMedia={approvedMedia}
        athleteTags={athleteTags}
      />
    </div>
  );
}

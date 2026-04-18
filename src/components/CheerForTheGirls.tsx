import { useEffect, useState } from 'react';
import { ArrowRight, Heart, Users } from 'lucide-react';
import { AthleteService } from '../services/athleteService';
import type { Athlete } from '../types/athlete';

interface CheerForTheGirlsProps {
  onNavigate?: (page: string, slug?: string) => void;
}

const PLACEHOLDERS: Partial<Athlete>[] = [
  {
    id: 'placeholder-1',
    first_name: 'Aaliyah',
    last_initial: 'M',
    sport: 'Basketball',
    grade: '9th Grade',
    school: 'Whitehaven High School',
    city: 'Memphis, TN',
    descriptor: 'Point guard with court vision beyond her years',
    supporters_count: 0,
    slug: '',
    image_url: 'https://images.pexels.com/photos/3621104/pexels-photo-3621104.jpeg?auto=compress&cs=tinysrgb&w=600',
  },
  {
    id: 'placeholder-2',
    first_name: 'Destiny',
    last_initial: 'R',
    sport: 'Track',
    grade: '10th Grade',
    school: 'Southwind High School',
    city: 'Memphis, TN',
    descriptor: 'Regional 400m qualifier with D1 potential',
    supporters_count: 0,
    slug: '',
    image_url: 'https://images.pexels.com/photos/5086489/pexels-photo-5086489.jpeg?auto=compress&cs=tinysrgb&w=600',
  },
  {
    id: 'placeholder-3',
    first_name: 'Imani',
    last_initial: 'T',
    sport: 'Soccer',
    grade: '8th Grade',
    school: 'Kirby Middle School',
    city: 'Memphis, TN',
    descriptor: 'Midfielder and team captain since 6th grade',
    supporters_count: 0,
    slug: '',
    image_url: 'https://images.pexels.com/photos/7318948/pexels-photo-7318948.jpeg?auto=compress&cs=tinysrgb&w=600',
  },
];

const SPORT_ACCENT: Record<string, string> = {
  Basketball: '#38bdf8',
  Track: '#f97316',
  Soccer: '#4ade80',
  Football: '#f97316',
  Baseball: '#facc15',
  default: '#38bdf8',
};

function GirlAthleteCard({
  athlete,
  isPlaceholder,
  onNavigate,
}: {
  athlete: Partial<Athlete>;
  isPlaceholder: boolean;
  onNavigate?: (page: string, slug?: string) => void;
}) {
  const accent = SPORT_ACCENT[athlete.sport ?? ''] ?? SPORT_ACCENT.default;

  const handleViewProfile = () => {
    if (!isPlaceholder && athlete.slug) {
      onNavigate?.('athlete-profile', athlete.slug);
    }
  };

  const handleCheer = () => {
    if (!isPlaceholder && athlete.slug) {
      onNavigate?.('support', athlete.slug);
    } else {
      onNavigate?.('join');
    }
  };

  return (
    <div
      className="relative rounded-2xl overflow-hidden flex flex-col"
      style={{
        background: 'linear-gradient(160deg, #0d1a26 0%, #080f19 60%, #050b10 100%)',
        border: `1px solid ${accent}22`,
        boxShadow: `0 16px 48px rgba(0,0,0,0.7), 0 0 32px ${accent}08`,
      }}
    >
      <div
        className="absolute top-0 left-0 right-0 h-px"
        style={{ background: `linear-gradient(90deg, transparent, ${accent}60, transparent)` }}
      />

      <div className="relative aspect-[4/3] overflow-hidden bg-gray-900">
        {athlete.image_url ? (
          <img
            src={athlete.image_url}
            alt={`${athlete.first_name} ${athlete.last_initial}`}
            className="w-full h-full object-cover object-top"
          />
        ) : (
          <div
            className="w-full h-full flex items-center justify-center"
            style={{ background: `linear-gradient(135deg, ${accent}18, #040a12)` }}
          >
            <Users className="w-16 h-16 text-white/10" />
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-[#080f19] via-transparent to-transparent" />

        <div className="absolute top-3 left-3">
          <span
            className="text-[10px] font-black uppercase tracking-[0.14em] px-2.5 py-1 rounded-full"
            style={{
              background: 'rgba(0,0,0,0.6)',
              border: `1px solid ${accent}30`,
              color: accent,
              backdropFilter: 'blur(8px)',
            }}
          >
            {athlete.sport}
          </span>
        </div>

        {isPlaceholder && (
          <div className="absolute top-3 right-3">
            <span className="text-[9px] font-bold uppercase tracking-widest px-2 py-1 rounded-full bg-white/10 border border-white/15 text-white/40">
              Coming Soon
            </span>
          </div>
        )}
      </div>

      <div className="p-5 flex flex-col flex-1">
        <div className="mb-3">
          <h3 className="text-[18px] font-black text-white leading-tight tracking-tight">
            {athlete.first_name} {athlete.last_initial}.
          </h3>
          <p className="text-[12px] text-white/40 mt-0.5">
            {athlete.grade} &bull; {athlete.school || athlete.city}
          </p>
        </div>

        {athlete.descriptor && (
          <p className="text-[12px] text-white/55 leading-snug mb-4 flex-1">
            {athlete.descriptor}
          </p>
        )}

        {!isPlaceholder && (athlete.supporters_count ?? 0) > 0 && (
          <div className="flex items-center gap-1.5 mb-3">
            <Users className="w-3 h-3 text-white/30" />
            <span className="text-[10px] text-white/30">{athlete.supporters_count} supporters</span>
          </div>
        )}

        <div className="flex gap-2 mt-auto pt-2">
          <button
            onClick={handleViewProfile}
            disabled={isPlaceholder}
            className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-[11.5px] font-bold uppercase tracking-wide transition-all duration-200"
            style={
              isPlaceholder
                ? { background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.2)', cursor: 'default' }
                : { background: `${accent}12`, border: `1px solid ${accent}28`, color: accent }
            }
          >
            View Profile
            <ArrowRight className="w-3 h-3" />
          </button>
          <button
            onClick={handleCheer}
            className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-[11.5px] font-black uppercase tracking-wide transition-all duration-200"
            style={{
              background: isPlaceholder ? 'rgba(255,255,255,0.04)' : 'linear-gradient(135deg, #f59e0b, #d97706)',
              border: isPlaceholder ? '1px solid rgba(255,255,255,0.08)' : 'none',
              color: isPlaceholder ? 'rgba(255,255,255,0.2)' : 'white',
              cursor: isPlaceholder ? 'default' : 'pointer',
              boxShadow: isPlaceholder ? 'none' : '0 0 16px rgba(245,158,11,0.3)',
            }}
          >
            <Heart className="w-3 h-3" fill={isPlaceholder ? 'none' : 'white'} />
            Cheer Her On
          </button>
        </div>
      </div>
    </div>
  );
}

export default function CheerForTheGirls({ onNavigate }: CheerForTheGirlsProps) {
  const [athletes, setAthletes] = useState<Partial<Athlete>[]>([]);
  const [loading, setLoading] = useState(true);
  const [usingPlaceholders, setUsingPlaceholders] = useState(false);

  useEffect(() => {
    AthleteService.getFemaleAthletes(3).then((data) => {
      if (data.length >= 1) {
        setAthletes(data);
        setUsingPlaceholders(false);
      } else {
        setAthletes(PLACEHOLDERS);
        setUsingPlaceholders(true);
      }
      setLoading(false);
    });
  }, []);

  return (
    <section className="py-24 bg-[#080f19]">
      <div className="max-w-5xl mx-auto px-6 lg:px-8">
        <div className="mb-12 text-center">
          <div className="inline-flex items-center gap-2 bg-rose-500/12 border border-rose-500/25 text-rose-400 px-3 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest mb-5">
            <span className="w-1.5 h-1.5 rounded-full bg-rose-400 animate-pulse" />
            Cheerleaders
          </div>
          <h2 className="text-4xl md:text-5xl font-black text-white leading-tight mb-4">
            Cheerleaders Spotlight
          </h2>
          <p className="text-gray-400 text-base md:text-lg max-w-2xl mx-auto mb-3 leading-relaxed">
            Highlighting cheerleaders bringing energy, discipline, and leadership to every game and event.
          </p>
          <p className="text-white/30 text-sm max-w-xl mx-auto">
            From middle school squads to varsity sidelines, these athletes deserve visibility, support, and a platform to shine.
          </p>
        </div>

        {loading && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[0, 1, 2].map((i) => (
              <div key={i} className="rounded-2xl bg-white/5 border border-white/5 h-80 animate-pulse" />
            ))}
          </div>
        )}

        {!loading && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {athletes.map((athlete) => (
              <GirlAthleteCard
                key={athlete.id}
                athlete={athlete}
                isPlaceholder={usingPlaceholders}
                onNavigate={onNavigate}
              />
            ))}
          </div>
        )}

        <div
          className="mt-12 rounded-2xl p-8 text-center"
          style={{
            background: 'linear-gradient(135deg, rgba(245,158,11,0.06), rgba(248,113,113,0.04))',
            border: '1px solid rgba(255,255,255,0.07)',
          }}
        >
          <p className="text-white/60 text-sm font-semibold mb-4">
            Know a girls athlete who should be featured?
          </p>
          <button
            onClick={() => onNavigate?.('parent-intake')}
            className="inline-flex items-center gap-2 bg-amber-500 hover:bg-amber-400 text-white font-black text-sm py-3 px-7 rounded-xl transition-all duration-200 uppercase tracking-wide shadow-[0_0_20px_rgba(245,158,11,0.3)] hover:shadow-[0_0_32px_rgba(245,158,11,0.5)]"
          >
            <Heart className="w-4 h-4" fill="white" />
            Nominate an Athlete
          </button>
        </div>
      </div>
    </section>
  );
}

import { ArrowRight, Heart, Star, Users, Flame } from 'lucide-react';
import { useState, useEffect } from 'react';
import { AthleteService } from '../services/athleteService';
import type { Athlete } from '../types/athlete';

interface FeaturedAthletesPreviewProps {
  onNavigate?: (page: string, slug?: string) => void;
}

const JACOB_STORY = 'Jacob is a Memphis 8th grader competing in AAU basketball this Spring. He needs support to cover uniform and travel for the MADE Hoops regional and upcoming tournaments.';
const JACOB_GOAL_LABEL = 'AAU regional travel';

function ProgressBar({ raised, goal, goalLabel }: { raised: number; goal: number; goalLabel: string }) {
  const pct = Math.min(Math.round((raised / goal) * 100), 100);
  return (
    <div className="mb-6">
      <div className="flex justify-between items-center mb-2">
        <span className="text-amber-400 text-sm font-bold uppercase tracking-wide">
          Goal: ${goal} for {goalLabel}
        </span>
        <span className="text-amber-400 text-sm font-black">{pct}%</span>
      </div>
      <div className="h-3 rounded-full bg-white/10 overflow-hidden">
        <div
          className="h-full rounded-full bg-gradient-to-r from-amber-400 to-amber-500 transition-all duration-700"
          style={{ width: `${pct}%` }}
        />
      </div>
      <div className="flex items-center justify-between mt-2">
        <p className="text-white font-black text-base">${raised} raised</p>
        <p className="text-gray-400 text-sm font-medium">${goal - raised} still needed</p>
      </div>
    </div>
  );
}

function JacobCard({ athlete, onNavigate }: { athlete: Athlete; onNavigate?: (page: string, slug?: string) => void }) {
  const raised = athlete.season_amount_raised ?? 120;
  const goal = athlete.season_goal_amount ?? 750;
  const supporters = athlete.supporters_count ?? 12;
  const goalLabel = athlete.next_goal_description || JACOB_GOAL_LABEL;

  return (
    <div className="relative rounded-2xl overflow-hidden border-2 border-sky-500/50 shadow-[0_0_60px_rgba(14,165,233,0.18)] bg-gradient-to-br from-sky-950/60 via-[#0a0e1a] to-[#0a0e1a]">
      <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-sky-400 to-transparent" />

      <div className="grid md:grid-cols-2 gap-0">
        <div className="relative aspect-[4/3] md:aspect-auto md:min-h-[460px] overflow-hidden bg-gray-900">
          {athlete.image_url ? (
            <img
              src={athlete.image_url}
              alt={`${athlete.first_name} ${athlete.last_initial}`}
              className="w-full h-full object-cover object-top"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-sky-800 to-[#0a0e1a] flex items-center justify-center">
              <Users className="w-24 h-24 text-sky-700" />
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-transparent to-[#0a0e1a] hidden md:block" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0a0e1a] via-transparent to-transparent md:hidden" />

          <div className="absolute top-4 left-4 flex flex-col gap-2">
            <span className="flex items-center gap-1.5 bg-sky-500 text-white text-xs font-black uppercase tracking-wide px-3 py-1.5 rounded-full shadow-lg">
              <Star className="w-3.5 h-3.5" fill="white" />
              Featured Athlete
            </span>
            <span className="flex items-center gap-1.5 bg-red-500/90 backdrop-blur-sm text-white text-xs font-bold px-3 py-1.5 rounded-full">
              <Flame className="w-3.5 h-3.5" />
              Competing April 18–19
            </span>
          </div>
        </div>

        <div className="p-8 md:p-10 flex flex-col justify-center">
          <h3 className="text-4xl md:text-5xl font-black text-white leading-none mb-1">
            {athlete.first_name} {athlete.last_initial}.
          </h3>
          <p className="text-sky-400 font-bold text-lg mb-1">
            {athlete.sport} &bull; {athlete.position}
          </p>
          <p className="text-gray-500 text-sm mb-6">
            {athlete.city || 'Memphis, TN'} &bull; {athlete.grade}
          </p>

          <div className="flex items-center gap-2 mb-6 text-sm">
            <span className="flex items-center gap-1.5 bg-sky-500/15 border border-sky-500/25 text-sky-300 px-3 py-1.5 rounded-full font-bold">
              <Users className="w-3.5 h-3.5" />
              {supporters} supporters
            </span>
          </div>

          <p className="text-gray-200 text-base leading-relaxed mb-6 border-l-2 border-sky-400 pl-4">
            {JACOB_STORY}
          </p>

          <ProgressBar raised={raised} goal={goal} goalLabel={goalLabel} />

          <div className="flex flex-col sm:flex-row gap-3">
            <button
              onClick={() => onNavigate?.('jacob-fouse')}
              className="flex-1 flex items-center justify-center gap-2 bg-amber-500 hover:bg-amber-400 text-white font-black text-base py-4 rounded-xl transition-all duration-200 shadow-[0_0_28px_rgba(245,158,11,0.45)] hover:shadow-[0_0_44px_rgba(245,158,11,0.65)] uppercase tracking-wide"
            >
              <Heart className="w-5 h-5" fill="white" />
              Support Jacob
            </button>
            <button
              onClick={() => onNavigate?.('jacob-fouse')}
              className="flex items-center justify-center gap-2 bg-white/8 hover:bg-white/12 border border-white/15 hover:border-sky-500/40 text-gray-400 hover:text-white font-semibold text-sm px-6 py-4 rounded-xl transition-all duration-200"
            >
              View Profile
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function FeaturedAthletesPreview({ onNavigate }: FeaturedAthletesPreviewProps) {
  const [jacob, setJacob] = useState<Athlete | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      const featured = await AthleteService.getFeaturedAthlete();
      setJacob(featured);
      setLoading(false);
    };
    load();
  }, []);

  return (
    <section id="athletes" className="py-24 bg-[#0d1120]">
      <div className="max-w-5xl mx-auto px-6 lg:px-8">
        <div className="mb-10 text-center">
          <div className="inline-flex items-center gap-2 bg-sky-500/15 border border-sky-500/30 text-sky-400 px-3 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest mb-5">
            <span className="w-1.5 h-1.5 rounded-full bg-sky-400 animate-pulse" />
            Live — Memphis Events
          </div>
          <h2 className="text-4xl md:text-5xl font-black text-white leading-tight mb-3">
            Support Memphis Athletes<br />Right Now
          </h2>
          <p className="text-gray-400 text-lg max-w-xl mx-auto">
            Real players. Real goals. Help fund their next step—directly.
          </p>
        </div>

        {!loading && jacob && (
          <p className="text-amber-400 font-black text-base mb-6 tracking-wide text-center">
            Start by supporting {jacob.first_name} ↓
          </p>
        )}

        {loading && (
          <div className="rounded-2xl border border-white/5 bg-[#0a0e1a] h-64 animate-pulse" />
        )}

        {!loading && jacob && (
          <JacobCard athlete={jacob} onNavigate={onNavigate} />
        )}

        {!loading && !jacob && (
          <div className="text-center py-20 text-gray-500">
            No featured athlete yet. Check back soon.
          </div>
        )}

        <div className="mt-10 text-center">
          <button
            onClick={() => onNavigate?.('athletes')}
            className="inline-flex items-center gap-2 text-sky-400 hover:text-sky-300 font-semibold transition-colors text-sm"
          >
            View All Athletes
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </section>
  );
}

import { Heart, Play, MapPin, ArrowDown, Clock, Trophy, Users, ChevronRight } from 'lucide-react';
import AthleteCard from '../AthleteCard';
import SupporterBadge from '../SupporterBadge';

interface ProfileHeroProps {
  raised: number;
  goal: number;
  supporters: number;
  progressPct: number;
  stillNeeded: number;
  onSupportClick: () => void;
  onHighlightsClick: () => void;
}

export default function ProfileHero({
  raised,
  goal,
  supporters,
  progressPct,
  stillNeeded,
  onSupportClick,
  onHighlightsClick,
}: ProfileHeroProps) {
  return (
    <section
      className="relative min-h-screen flex flex-col overflow-hidden"
      style={{ background: '#181c24' }}
    >
      {/* Neon top edge */}
      <div
        className="absolute top-0 left-0 right-0 h-px z-10"
        style={{
          background:
            'linear-gradient(90deg, transparent 0%, rgba(56,189,248,0.5) 25%, rgba(148,233,255,1) 50%, rgba(56,189,248,0.5) 75%, transparent 100%)',
        }}
      />

      {/* Ambient glow — right side (behind card) */}
      <div
        className="absolute right-0 top-0 w-[800px] h-[900px] pointer-events-none"
        style={{
          background:
            'radial-gradient(ellipse at top right, rgba(14,165,233,0.08) 0%, transparent 55%)',
        }}
      />

      {/* Subtle grid */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage:
            'linear-gradient(rgba(56,189,248,1) 1px, transparent 1px), linear-gradient(90deg, rgba(56,189,248,1) 1px, transparent 1px)',
          backgroundSize: '64px 64px',
          opacity: 0.012,
        }}
      />

      {/* ── MAIN CONTENT ── */}
      <div className="relative flex-1 flex items-center z-10">
        <div className="w-full max-w-7xl mx-auto px-6 lg:px-12 py-20 lg:py-28">
          <div className="grid lg:grid-cols-[1fr_420px] gap-12 lg:gap-20 items-center">

            {/* ── LEFT: Athlete Identity Narrative ── */}
            <div className="order-2 lg:order-1 flex flex-col">

              {/* Breadcrumb context */}
              <div className="flex items-center gap-1.5 mb-6 text-white/22 text-[10.5px] font-bold uppercase tracking-[0.18em]">
                <span>NextUp Network</span>
                <ChevronRight className="w-3 h-3" />
                <span>Basketball</span>
                <ChevronRight className="w-3 h-3" />
                <span className="text-sky-400/60">Jacob Fouse</span>
              </div>

              {/* Name — the centerpiece */}
              <h1
                className="font-black leading-[0.82] tracking-[-0.04em] select-none mb-5"
                style={{ fontVariantNumeric: 'tabular-nums' }}
              >
                <span className="block text-white" style={{ fontSize: 'clamp(3.2rem, 9vw, 7rem)' }}>
                  JACOB
                </span>
                <span
                  className="block text-transparent bg-clip-text"
                  style={{
                    fontSize: 'clamp(3.2rem, 9vw, 7rem)',
                    backgroundImage: 'linear-gradient(120deg, #38bdf8 0%, #7dd3fc 45%, #0ea5e9 100%)',
                  }}
                >
                  FOUSE
                </span>
              </h1>

              {/* Supporter badge — only visible to active supporters */}
              <SupporterBadge athleteSlug="jacob-fouse" className="mb-4 self-start" />

              {/* Real athlete metadata row */}
              <div className="flex flex-wrap items-center gap-x-4 gap-y-2 mb-7">
                <div className="flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-sky-400/50" />
                  <span className="text-white/40 text-xs font-bold">Memphis, TN</span>
                </div>
                <div className="w-px h-3 bg-white/10" />
                <span className="text-white/40 text-xs font-bold">8th Grade</span>
                <div className="w-px h-3 bg-white/10" />
                <span className="text-white/40 text-xs font-bold">Point Guard</span>
                <div className="w-px h-3 bg-white/10" />
                <span className="text-white/40 text-xs font-bold">Class of 2029</span>
              </div>

              {/* Season snapshot — feels like a real platform data block */}
              <div
                className="grid grid-cols-3 gap-3 mb-7 max-w-sm"
              >
                {[
                  { label: 'This Season', value: '14.2 PPG', sub: '8th grade league' },
                  { label: 'Season Record', value: '11–4', sub: 'Spring 2025' },
                  { label: 'AAU Team', value: 'Mid-South', sub: '13U squad' },
                ].map(({ label, value, sub }) => (
                  <div
                    key={label}
                    className="px-3 py-2.5 rounded-xl"
                    style={{
                      background: 'rgba(255,255,255,0.03)',
                      border: '1px solid rgba(255,255,255,0.07)',
                    }}
                  >
                    <p className="text-[8.5px] text-white/20 uppercase tracking-[0.14em] mb-1">{label}</p>
                    <p className="text-[12px] font-black text-white leading-tight">{value}</p>
                    <p className="text-[8px] text-white/18 mt-0.5">{sub}</p>
                  </div>
                ))}
              </div>

              {/* Coach note — adds real human credibility */}
              <div
                className="relative mb-7 px-4 py-3.5 rounded-2xl max-w-sm"
                style={{
                  background: 'rgba(56,189,248,0.04)',
                  border: '1px solid rgba(56,189,248,0.12)',
                }}
              >
                <div className="flex items-start gap-3">
                  <div
                    className="w-7 h-7 rounded-full flex-shrink-0 flex items-center justify-center text-[10px] font-black text-black mt-0.5"
                    style={{ background: 'linear-gradient(135deg, #38bdf8, #0ea5e9)' }}
                  >
                    C
                  </div>
                  <div>
                    <p className="text-[11px] text-white/55 leading-relaxed">
                      "Jacob has elite court vision for his age. He makes everyone around him better — that's rare at 13."
                    </p>
                    <p className="text-[9.5px] text-white/22 mt-1.5 font-bold uppercase tracking-[0.1em]">
                      Coach D. Williams · Mid-South 13U
                    </p>
                  </div>
                </div>
              </div>

              {/* Tournament fundraise context — honest and specific */}
              <div
                className="mb-7 p-4 rounded-2xl max-w-sm"
                style={{
                  background: 'rgba(245,158,11,0.045)',
                  border: '1px solid rgba(245,158,11,0.14)',
                }}
              >
                <div className="flex items-center gap-2 mb-3">
                  <Trophy className="w-3.5 h-3.5 text-amber-400/80" />
                  <p className="text-amber-300/80 text-[10.5px] font-black uppercase tracking-[0.12em]">
                    Memphis Regional Tournament
                  </p>
                </div>
                <p className="text-[11px] text-white/35 leading-relaxed mb-3">
                  Jacob's team qualified for regionals but needs help covering the $500 entry fee and travel costs. His family is covering the rest.
                </p>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-baseline gap-1.5">
                    <span className="text-[19px] font-black text-white tabular-nums">${raised}</span>
                    <span className="text-[10px] text-white/22">of ${goal}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Users className="w-3 h-3 text-white/20" />
                    <span className="text-[10px] text-white/22">{supporters} people pitched in</span>
                  </div>
                </div>
                <div className="h-[4px] rounded-full overflow-hidden mb-2" style={{ background: 'rgba(255,255,255,0.055)' }}>
                  <div
                    className="h-full rounded-full"
                    style={{
                      width: `${progressPct}%`,
                      background: 'linear-gradient(90deg, #b45309, #f59e0b, #fcd34d)',
                      boxShadow: '0 0 7px rgba(245,158,11,0.5)',
                    }}
                  />
                </div>
                <div className="flex items-center gap-1.5">
                  <Clock className="w-2.5 h-2.5 text-amber-400/50" />
                  <p className="text-[9.5px] text-amber-300/45">
                    ${stillNeeded} still needed to reach the goal
                  </p>
                </div>
              </div>

              {/* CTAs */}
              <div className="flex flex-row gap-3 mb-5 max-w-sm">
                <button
                  onClick={onSupportClick}
                  className="group relative flex-1 inline-flex items-center justify-center gap-2 text-white font-black text-sm py-3.5 rounded-2xl transition-all duration-300 uppercase tracking-[0.08em] overflow-hidden active:scale-[0.97]"
                  style={{
                    background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
                    boxShadow: '0 0 28px rgba(245,158,11,0.42), 0 4px 16px rgba(0,0,0,0.45)',
                  }}
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent translate-x-[-200%] group-hover:translate-x-[200%] transition-transform duration-700" />
                  <Heart className="w-4 h-4 flex-shrink-0" fill="white" />
                  Support Jacob
                </button>
                <button
                  onClick={onHighlightsClick}
                  className="inline-flex items-center justify-center gap-2 font-semibold text-sm px-5 py-3.5 rounded-2xl transition-all duration-200 whitespace-nowrap"
                  style={{
                    background: 'rgba(56,189,248,0.06)',
                    border: '1px solid rgba(56,189,248,0.18)',
                    color: 'rgba(56,189,248,0.65)',
                  }}
                >
                  <Play className="w-3.5 h-3.5" fill="rgba(56,189,248,0.7)" style={{ color: 'rgba(56,189,248,0.7)' }} />
                  Highlights
                </button>
              </div>

              {/* Social proof micro-line */}
              <p className="text-[10.5px] text-white/18 max-w-sm">
                Payments are processed securely. 100% goes directly toward tournament costs.
              </p>

            </div>

            {/* ── RIGHT: Athlete Identity Card ── */}
            <div className="order-1 lg:order-2 flex justify-center lg:justify-end">
              <div className="w-full max-w-[400px]">
                <AthleteCard
                  name="Jacob Fouse"
                  firstName="Jacob"
                  lastName="Fouse"
                  sport="Basketball"
                  position="Point Guard"
                  location="Memphis, TN"
                  grade="8th Grade"
                  classYear="Class of 2029"
                  school="Whitehaven Middle"
                  team="Mid-South 13U AAU"
                  jerseyNumber="3"
                  stats={[
                    { label: 'PPG', value: '14.2', primary: true, sublabel: 'season avg' },
                    { label: 'APG', value: '6.1', sublabel: 'season avg' },
                    { label: 'SPG', value: '2.4', sublabel: 'season avg' },
                    { label: 'W–L', value: '11–4', sublabel: 'Spring 2025' },
                  ]}
                  recruitingStatus="open"
                  raised={raised}
                  goal={goal}
                  supporters={supporters}
                  progressPct={progressPct}
                  eventLabel="Memphis Regional Tournament"
                  eventDate="Memphis Regional Tournament"
                  verified={true}
                  tags={['Guard', 'AAU', 'In Season']}
                  recentNote="24 pts, 9 ast, 4 stl — last game vs. Southaven Elite (Apr 6)"
                  onSupportClick={onSupportClick}
                  onHighlightsClick={onHighlightsClick}
                />
              </div>
            </div>

          </div>
        </div>
      </div>

      {/* Scroll indicator */}
      <div className="relative z-10 flex justify-center pb-10">
        <div className="flex flex-col items-center gap-1.5 opacity-[0.12] cursor-default select-none">
          <p className="text-[9px] text-white uppercase tracking-[0.28em]">Scroll</p>
          <ArrowDown className="w-3.5 h-3.5 text-white animate-bounce" />
        </div>
      </div>

      {/* Bottom fade-out */}
      <div
        className="absolute bottom-0 left-0 right-0 h-32 pointer-events-none"
        style={{ background: 'linear-gradient(to top, #111318, transparent)' }}
      />
    </section>
  );
}

import { MapPin, BadgeCheck, Heart, Play, TrendingUp, Calendar, Activity, Lock, Users, ChevronRight } from 'lucide-react';

export interface AthleteCardStat {
  label: string;
  value: string;
  primary?: boolean;
  sublabel?: string;
}

export interface AthleteCardProps {
  name: string;
  firstName: string;
  lastName: string;
  sport: string;
  position: string;
  location: string;
  grade: string;
  classYear: string;
  school?: string;
  team?: string;
  jerseyNumber?: string;
  stats?: AthleteCardStat[];
  recruitingStatus?: 'open' | 'committed' | 'closed';
  raised?: number;
  goal?: number;
  supporters?: number;
  progressPct?: number;
  eventLabel?: string;
  eventDate?: string;
  verified?: boolean;
  tags?: string[];
  recentNote?: string;
  onSupportClick?: () => void;
  onHighlightsClick?: () => void;
  variant?: 'hero' | 'directory' | 'compact';
}

const SPORT_COLORS: Record<string, string> = {
  Basketball: '#38bdf8',
  Football: '#f97316',
  Soccer: '#4ade80',
  Baseball: '#facc15',
  Track: '#e879f9',
  default: '#38bdf8',
};

function SportPanel({
  sport,
  jerseyNumber,
  name,
  position,
  school,
  team,
}: {
  sport: string;
  jerseyNumber?: string;
  name: string;
  position: string;
  school?: string;
  team?: string;
}) {
  const accentColor = SPORT_COLORS[sport] ?? SPORT_COLORS.default;

  return (
    <div
      className="relative mx-5 mt-5 rounded-2xl overflow-hidden flex flex-col justify-between"
      style={{
        height: '168px',
        background: `linear-gradient(145deg, #091624 0%, #060e18 60%, #040a12 100%)`,
        border: `1px solid ${accentColor}1a`,
      }}
    >
      {/* Ambient glow — left */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{ background: `radial-gradient(ellipse at 0% 100%, ${accentColor}18 0%, transparent 55%)` }}
      />

      {/* Half-court arc — decorative */}
      <svg className="absolute inset-0 w-full h-full" viewBox="0 0 380 168" fill="none" preserveAspectRatio="none">
        <circle cx="190" cy="168" r="88" stroke={accentColor} strokeWidth="1.5" strokeOpacity="0.06" />
        <circle cx="190" cy="168" r="44" stroke={accentColor} strokeWidth="1" strokeOpacity="0.08" />
        <line x1="0" y1="0" x2="380" y2="0" stroke={accentColor} strokeWidth="1" strokeOpacity="0.06" />
        <rect x="142" y="0" width="96" height="44" rx="4" stroke={accentColor} strokeWidth="1" strokeOpacity="0.06" />
        <circle cx="190" cy="44" r="5" fill={accentColor} fillOpacity="0.1" />
        <line x1="0" y1="84" x2="380" y2="84" stroke={accentColor} strokeWidth="0.5" strokeOpacity="0.04" />
      </svg>

      {/* Top row: jersey number — large, ghosted */}
      <div className="relative flex items-start justify-between px-5 pt-4">
        {jerseyNumber && (
          <span
            className="font-black leading-none select-none"
            style={{
              fontSize: '4.5rem',
              letterSpacing: '-0.04em',
              background: `linear-gradient(160deg, ${accentColor}55 0%, ${accentColor}18 100%)`,
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              lineHeight: 0.85,
            }}
          >
            {jerseyNumber}
          </span>
        )}

        {/* Sport badge — top right */}
        <div
          className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl mt-1"
          style={{
            background: 'rgba(0,0,0,0.55)',
            border: `1px solid ${accentColor}22`,
            backdropFilter: 'blur(8px)',
          }}
        >
          <span
            className="w-1.5 h-1.5 rounded-full flex-shrink-0"
            style={{ background: accentColor, boxShadow: `0 0 5px ${accentColor}` }}
          />
          <span className="text-[10px] font-black uppercase tracking-[0.14em]" style={{ color: accentColor }}>
            {sport}
          </span>
        </div>
      </div>

      {/* Bottom row: position + school/team info */}
      <div className="relative flex items-end justify-between px-5 pb-4">
        <div>
          <p className="text-[9px] text-white/22 uppercase tracking-[0.16em] mb-0.5">Position</p>
          <p className="text-[15px] font-black text-white leading-tight tracking-[-0.01em]">{position}</p>
        </div>
        {(school || team) && (
          <div className="text-right">
            {school && <p className="text-[10px] font-bold text-white/40 leading-tight">{school}</p>}
            {team && <p className="text-[9px] text-white/20 leading-tight mt-0.5">{team}</p>}
          </div>
        )}
      </div>
    </div>
  );
}

function StatRow({ stats, accentColor }: { stats: AthleteCardStat[]; accentColor: string }) {
  return (
    <div className="mx-5 grid rounded-xl overflow-hidden" style={{
      gridTemplateColumns: `repeat(${stats.length}, 1fr)`,
      background: 'rgba(255,255,255,0.022)',
      border: '1px solid rgba(255,255,255,0.05)',
    }}>
      {stats.map(({ label, value, primary, sublabel }, i) => (
        <div
          key={label}
          className="flex flex-col items-center py-3"
          style={{ borderRight: i < stats.length - 1 ? '1px solid rgba(255,255,255,0.045)' : undefined }}
        >
          <span
            className="text-[14px] font-black leading-none tabular-nums"
            style={{
              color: primary ? accentColor : 'rgba(255,255,255,0.85)',
              textShadow: primary ? `0 0 14px ${accentColor}60` : undefined,
            }}
          >
            {value}
          </span>
          <span className="text-[8.5px] font-bold text-white/22 uppercase tracking-[0.12em] mt-1">{label}</span>
          {sublabel && <span className="text-[8px] text-white/14 mt-0.5">{sublabel}</span>}
        </div>
      ))}
    </div>
  );
}

function RecruitingBadge({ status }: { status: 'open' | 'committed' | 'closed' }) {
  const map = {
    open: { label: 'Recruiting Open', color: '#4ade80', border: 'rgba(74,222,128,0.3)' },
    committed: { label: 'Committed', color: '#38bdf8', border: 'rgba(56,189,248,0.3)' },
    closed: { label: 'Not Recruiting', color: 'rgba(255,255,255,0.25)', border: 'rgba(255,255,255,0.1)' },
  };
  const { label, color, border } = map[status];
  return (
    <div
      className="absolute -top-3 -right-3 rounded-xl px-3 py-1.5 z-20"
      style={{
        background: 'linear-gradient(135deg, #0d1e2e, #091522)',
        border: `1px solid ${border}`,
        boxShadow: `0 6px 24px rgba(0,0,0,0.7)`,
      }}
    >
      <div className="flex items-center gap-1.5">
        <TrendingUp className="w-2.5 h-2.5" style={{ color }} />
        <p className="text-[10px] font-black uppercase tracking-[0.1em]" style={{ color }}>{label}</p>
      </div>
    </div>
  );
}

function SupporterAvatars({ count }: { count: number }) {
  const colors = ['#f59e0b', '#38bdf8', '#4ade80', '#f97316', '#e879f9'];
  const shown = Math.min(count, 5);
  return (
    <div className="flex items-center gap-2">
      <div className="flex -space-x-2">
        {Array.from({ length: shown }).map((_, i) => (
          <div
            key={i}
            className="w-5 h-5 rounded-full border border-black flex items-center justify-center text-[7px] font-black text-black"
            style={{ background: colors[i % colors.length], zIndex: shown - i }}
          >
            {String.fromCharCode(65 + i)}
          </div>
        ))}
      </div>
      <span className="text-[10px] text-white/30">
        {count > shown ? `+${count - shown} more` : ''} backing Jacob
      </span>
    </div>
  );
}

export default function AthleteCard({
  name,
  sport,
  position,
  location,
  grade,
  classYear,
  school,
  team,
  jerseyNumber,
  stats = [
    { label: 'PPG', value: '14.2', primary: true },
    { label: 'APG', value: '6.1' },
    { label: 'SPG', value: '2.4' },
  ],
  recruitingStatus = 'open',
  raised,
  goal,
  supporters,
  progressPct,
  eventLabel,
  eventDate,
  verified = true,
  tags = [],
  recentNote,
  onSupportClick,
  onHighlightsClick,
}: AthleteCardProps) {
  const accentColor = SPORT_COLORS[sport] ?? SPORT_COLORS.default;
  const showProgress = raised !== undefined && goal !== undefined && progressPct !== undefined;

  return (
    <div className="relative w-full">
      {/* Halo glow */}
      <div
        className="absolute -inset-10 pointer-events-none"
        style={{ background: `radial-gradient(ellipse at 50% 40%, ${accentColor}12 0%, transparent 65%)` }}
      />

      {recruitingStatus && <RecruitingBadge status={recruitingStatus} />}

      {/* Card shell */}
      <div
        className="relative rounded-3xl overflow-visible"
        style={{
          background: 'linear-gradient(160deg, #0d1a26 0%, #080f19 50%, #050b10 100%)',
          border: `1px solid ${accentColor}22`,
          boxShadow: `0 0 0 1px rgba(255,255,255,0.03), 0 32px 80px rgba(0,0,0,0.9), 0 0 48px ${accentColor}0c`,
        }}
      >
        {/* Top neon scan-line */}
        <div
          className="absolute top-0 left-0 right-0 h-px rounded-t-3xl z-10"
          style={{ background: `linear-gradient(90deg, transparent 0%, ${accentColor}50 25%, ${accentColor}dd 50%, ${accentColor}50 75%, transparent 100%)` }}
        />

        {/* ── HEADER BAR ── */}
        <div
          className="flex items-center justify-between px-5 pt-4 pb-3"
          style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}
        >
          <div className="flex items-center gap-2">
            <div
              className="w-5 h-5 rounded-md flex items-center justify-center flex-shrink-0"
              style={{ background: `${accentColor}18`, border: `1px solid ${accentColor}28` }}
            >
              <Activity className="w-2.5 h-2.5" style={{ color: accentColor }} />
            </div>
            <span className="text-[9.5px] font-black text-white/22 uppercase tracking-[0.22em]">NextUp Network</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" style={{ boxShadow: '0 0 4px rgba(52,211,153,0.9)' }} />
            <span className="text-[9.5px] font-black text-emerald-400/80 tracking-wider">Profile Active</span>
          </div>
        </div>

        {/* ── SPORT PANEL ── */}
        <SportPanel
          sport={sport}
          jerseyNumber={jerseyNumber}
          name={name}
          position={position}
          school={school}
          team={team}
        />

        {/* ── IDENTITY BLOCK ── */}
        <div className="px-5 pt-4 pb-2">
          <div className="flex items-start justify-between gap-2 mb-1.5">
            <div className="min-w-0">
              <h3 className="text-[18px] font-black text-white leading-tight tracking-[-0.025em] truncate">{name}</h3>
              <div className="flex items-center gap-1.5 mt-0.5">
                <MapPin className="w-2.5 h-2.5 flex-shrink-0" style={{ color: `${accentColor}70` }} />
                <span className="text-[10.5px] text-white/30 truncate">{location} &bull; {grade}</span>
              </div>
            </div>
            {verified && (
              <div
                className="flex-shrink-0 flex items-center gap-1 px-2 py-1 rounded-lg"
                style={{ background: `${accentColor}10`, border: `1px solid ${accentColor}22` }}
              >
                <BadgeCheck className="w-2.5 h-2.5" style={{ color: accentColor }} />
                <span className="text-[8.5px] font-black uppercase tracking-[0.1em]" style={{ color: accentColor }}>Verified</span>
              </div>
            )}
          </div>

          {/* Tag chips */}
          <div className="flex flex-wrap gap-1.5 mt-2.5 mb-3">
            {tags.map((tag) => (
              <span
                key={tag}
                className="text-[9px] font-black px-2 py-0.5 rounded-md uppercase tracking-[0.1em]"
                style={{
                  background: `${accentColor}0c`,
                  border: `1px solid ${accentColor}1e`,
                  color: `${accentColor}b0`,
                }}
              >
                {tag}
              </span>
            ))}
            <span
              className="text-[9px] font-bold px-2 py-0.5 rounded-md uppercase tracking-[0.1em]"
              style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)', color: 'rgba(255,255,255,0.3)' }}
            >
              {classYear}
            </span>
          </div>

          {/* Recent note — inline scout context */}
          {recentNote && (
            <div
              className="flex items-start gap-2 px-3 py-2 rounded-xl mb-3"
              style={{ background: 'rgba(255,255,255,0.025)', border: '1px solid rgba(255,255,255,0.055)' }}
            >
              <ChevronRight className="w-3 h-3 text-white/18 flex-shrink-0 mt-0.5" />
              <p className="text-[10px] text-white/38 leading-snug italic">{recentNote}</p>
            </div>
          )}
        </div>

        {/* ── DIVIDER ── */}
        <div className="mx-5 h-px mb-3.5" style={{ background: `linear-gradient(90deg, transparent, ${accentColor}18, transparent)` }} />

        {/* ── STAT ROW ── */}
        <StatRow stats={stats} accentColor={accentColor} />

        {/* ── FUNDRAISING BLOCK ── */}
        {showProgress && (
          <div className="px-5 pt-4 pb-1">
            <div
              className="rounded-2xl overflow-hidden"
              style={{ background: 'rgba(245,158,11,0.04)', border: '1px solid rgba(245,158,11,0.1)' }}
            >
              {/* Event header */}
              <div
                className="flex items-center gap-2 px-3.5 py-2.5"
                style={{ borderBottom: '1px solid rgba(245,158,11,0.08)' }}
              >
                <Calendar className="w-3 h-3 text-amber-400/70 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-[10px] font-black text-amber-300/80 uppercase tracking-[0.1em] truncate">
                    {eventLabel ?? 'Tournament'}
                  </p>
                  {eventDate && <p className="text-[9px] text-white/20 mt-0">{eventDate}</p>}
                </div>
                {supporters !== undefined && (
                  <span className="text-[9px] text-white/20 flex-shrink-0">{supporters} backers</span>
                )}
              </div>

              {/* Amounts */}
              <div className="px-3.5 pt-3 pb-2">
                <div className="flex items-baseline justify-between mb-2">
                  <div>
                    <span className="text-[17px] font-black text-white tabular-nums">${raised?.toLocaleString()}</span>
                    <span className="text-[10px] text-white/20 ml-1.5">raised</span>
                  </div>
                  <span className="text-[10px] text-white/20">of ${goal?.toLocaleString()} goal</span>
                </div>

                {/* Progress bar */}
                <div className="h-[4px] rounded-full overflow-hidden mb-2.5" style={{ background: 'rgba(255,255,255,0.055)' }}>
                  <div
                    className="h-full rounded-full relative overflow-hidden"
                    style={{
                      width: `${Math.min(progressPct!, 100)}%`,
                      background: 'linear-gradient(90deg, #b45309, #f59e0b, #fcd34d)',
                      boxShadow: '0 0 6px rgba(245,158,11,0.6)',
                      transition: 'width 1s ease',
                    }}
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent" style={{ animation: 'shimmer 2s infinite' }} />
                  </div>
                </div>

                {/* Supporter avatars */}
                {supporters !== undefined && supporters > 0 && (
                  <SupporterAvatars count={supporters} />
                )}
              </div>
            </div>
          </div>
        )}

        {/* ── CTA BUTTONS ── */}
        {(onSupportClick || onHighlightsClick) && (
          <div className="p-5 pt-3.5 flex flex-col gap-2">
            {onSupportClick && (
              <button
                onClick={onSupportClick}
                className="group relative w-full inline-flex items-center justify-center gap-2 text-white font-black text-[12.5px] py-3.5 rounded-xl transition-all duration-300 uppercase tracking-[0.1em] overflow-hidden active:scale-[0.98]"
                style={{
                  background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
                  boxShadow: '0 0 24px rgba(245,158,11,0.35), 0 4px 12px rgba(0,0,0,0.4)',
                }}
              >
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent translate-x-[-200%] group-hover:translate-x-[200%] transition-transform duration-600" />
                <Heart className="w-3.5 h-3.5 flex-shrink-0" fill="white" />
                Support {name.split(' ')[0]}
              </button>
            )}
            {onHighlightsClick && (
              <button
                onClick={onHighlightsClick}
                className="w-full inline-flex items-center justify-center gap-2 font-semibold text-[12px] py-2.5 rounded-xl transition-all duration-200"
                style={{
                  background: `${accentColor}08`,
                  border: `1px solid ${accentColor}1e`,
                  color: `${accentColor}99`,
                }}
              >
                <Play className="w-3 h-3" fill={`${accentColor}99`} style={{ color: accentColor }} />
                Watch Highlights
              </button>
            )}
          </div>
        )}

        {/* ── FOOTER TRUST ── */}
        <div
          className="flex items-center justify-center gap-4 px-5 py-2.5"
          style={{ borderTop: '1px solid rgba(255,255,255,0.035)', background: 'rgba(0,0,0,0.12)' }}
        >
          {[
            { icon: Lock, label: 'Secure payments' },
            { icon: Users, label: 'Family-run' },
          ].map(({ icon: Icon, label }) => (
            <div key={label} className="flex items-center gap-1.5 text-white/15 text-[9.5px]">
              <Icon className="w-2.5 h-2.5 text-emerald-500/35" />
              {label}
            </div>
          ))}
          <div className="flex items-center gap-1.5 text-white/15 text-[9.5px]">
            <BadgeCheck className="w-2.5 h-2.5" style={{ color: `${accentColor}45` }} />
            NextUp verified
          </div>
        </div>
      </div>
    </div>
  );
}

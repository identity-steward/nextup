import { BadgeCheck, MapPin, Instagram, Youtube, Twitter, Star, Heart, UserPlus, Ruler, Weight } from 'lucide-react';

export interface AthleteIDCardProps {
  name: string;
  firstName?: string;
  lastName?: string;
  school: string;
  city: string;
  state: string;
  position: string;
  classYear: string;
  height: string;
  weight: string;
  profileImage?: string;
  badges?: ('creator' | 'top-prospect' | 'verified')[];
  socials?: {
    instagram?: string;
    youtube?: string;
    twitter?: string;
  };
  stats?: {
    followers?: string | number;
    videoViews?: string | number;
    offers?: string | number;
    points?: string | number;
  };
  onFollow?: () => void;
  onSupport?: () => void;
}

const DEFAULT_IMAGE = 'https://images.pexels.com/photos/2834914/pexels-photo-2834914.jpeg?auto=compress&cs=tinysrgb&w=800';

function StatPill({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="flex flex-col items-center gap-0.5 min-w-0">
      <span
        className="text-lg font-black text-white leading-none tabular-nums"
        style={{ textShadow: '0 0 20px rgba(56,189,248,0.6)' }}
      >
        {value ?? '—'}
      </span>
      <span className="text-[9px] font-bold text-white/30 uppercase tracking-[0.15em] whitespace-nowrap">{label}</span>
    </div>
  );
}

export default function AthleteIDCard({
  name,
  firstName,
  lastName,
  school,
  city,
  state,
  position,
  classYear,
  height,
  weight,
  profileImage = DEFAULT_IMAGE,
  badges = ['verified', 'creator', 'top-prospect'],
  socials = {},
  stats = {},
  onFollow,
  onSupport,
}: AthleteIDCardProps) {
  const [first, last] = firstName && lastName
    ? [firstName, lastName]
    : name.split(' ');

  return (
    <div
      className="relative w-full max-w-[640px] rounded-3xl overflow-hidden select-none"
      style={{
        background: 'linear-gradient(145deg, #06090f 0%, #0b1120 50%, #07090e 100%)',
        boxShadow: `
          0 0 0 1px rgba(56,189,248,0.18),
          0 0 40px rgba(14,165,233,0.12),
          0 0 80px rgba(14,165,233,0.06),
          0 40px 100px rgba(0,0,0,0.9),
          inset 0 1px 0 rgba(255,255,255,0.06)
        `,
      }}
    >
      {/* Neon top edge */}
      <div
        className="absolute top-0 left-0 right-0 h-px z-10"
        style={{ background: 'linear-gradient(90deg, transparent 0%, rgba(56,189,248,0.6) 35%, rgba(14,165,233,0.9) 50%, rgba(56,189,248,0.6) 65%, transparent 100%)' }}
      />

      {/* Corner accent — top right */}
      <div
        className="absolute top-0 right-0 w-48 h-48 pointer-events-none"
        style={{ background: 'radial-gradient(circle at top right, rgba(14,165,233,0.12) 0%, transparent 65%)' }}
      />

      {/* Corner accent — bottom left */}
      <div
        className="absolute bottom-0 left-0 w-48 h-48 pointer-events-none"
        style={{ background: 'radial-gradient(circle at bottom left, rgba(14,165,233,0.07) 0%, transparent 65%)' }}
      />

      {/* Grid lines — subtle futuristic texture */}
      <div
        className="absolute inset-0 pointer-events-none opacity-[0.025]"
        style={{
          backgroundImage: 'linear-gradient(rgba(56,189,248,1) 1px, transparent 1px), linear-gradient(90deg, rgba(56,189,248,1) 1px, transparent 1px)',
          backgroundSize: '40px 40px',
        }}
      />

      {/* NextUp wordmark */}
      <div className="absolute top-5 left-6 z-20 flex items-center gap-2">
        <div
          className="w-5 h-5 rounded-md flex items-center justify-center"
          style={{ background: 'linear-gradient(135deg, #0ea5e9, #38bdf8)', boxShadow: '0 0 12px rgba(14,165,233,0.6)' }}
        >
          <span className="text-white font-black text-[9px] tracking-tight">N</span>
        </div>
        <span className="text-white/35 text-[10px] font-black uppercase tracking-[0.2em]">NextUp Network</span>
      </div>

      {/* ID label */}
      <div className="absolute top-5 right-6 z-20">
        <span className="text-white/15 text-[10px] font-black uppercase tracking-[0.2em]">Athlete ID</span>
      </div>

      {/* Main layout */}
      <div className="relative z-10 flex flex-col sm:flex-row gap-0 pt-16 pb-0">

        {/* LEFT — Image */}
        <div className="relative sm:w-[42%] flex-shrink-0">
          {/* Image frame with glow */}
          <div className="relative mx-6 sm:mx-0 sm:ml-6 sm:mr-0 mb-4 sm:mb-0">
            <div
              className="absolute inset-0 rounded-2xl sm:rounded-r-none sm:rounded-l-2xl"
              style={{
                background: 'linear-gradient(180deg, rgba(14,165,233,0.15) 0%, transparent 60%)',
                boxShadow: 'inset 0 0 0 1px rgba(56,189,248,0.15)',
              }}
            />
            <div className="relative overflow-hidden rounded-2xl sm:rounded-r-none sm:rounded-l-2xl aspect-[3/4]">
              <img
                src={profileImage}
                alt={name}
                className="w-full h-full object-cover object-top"
                style={{ filter: 'contrast(1.05) saturate(0.9)' }}
              />
              {/* Gradient overlay on image bottom */}
              <div
                className="absolute bottom-0 left-0 right-0 h-1/3"
                style={{ background: 'linear-gradient(to top, rgba(6,9,15,0.85) 0%, transparent 100%)' }}
              />
              {/* Position badge on image */}
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2">
                <div
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full"
                  style={{
                    background: 'rgba(6,9,15,0.85)',
                    border: '1px solid rgba(56,189,248,0.35)',
                    backdropFilter: 'blur(12px)',
                    boxShadow: '0 0 20px rgba(14,165,233,0.2)',
                  }}
                >
                  <span
                    className="text-[11px] font-black text-sky-300 uppercase tracking-[0.15em]"
                    style={{ textShadow: '0 0 10px rgba(56,189,248,0.8)' }}
                  >
                    {position}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT — Info */}
        <div className="flex-1 px-6 pb-6 sm:px-5 sm:pb-6 flex flex-col gap-4">

          {/* Name */}
          <div className="mt-1">
            <p className="text-[11px] font-black text-sky-400/70 uppercase tracking-[0.2em] mb-1">{classYear}</p>
            <h2 className="font-black leading-[0.85] tracking-[-0.03em]">
              <span className="block text-white/80 text-3xl sm:text-4xl">{first}</span>
              <span
                className="block text-transparent bg-clip-text text-4xl sm:text-5xl"
                style={{ backgroundImage: 'linear-gradient(120deg, #38bdf8 0%, #7dd3fc 60%, #0ea5e9 100%)', textShadow: 'none' }}
              >
                {last}
              </span>
            </h2>
          </div>

          {/* Verification + school row */}
          <div className="flex flex-col gap-2">
            <div
              className="inline-flex items-center gap-1.5 self-start px-2.5 py-1 rounded-md"
              style={{
                background: 'rgba(14,165,233,0.1)',
                border: '1px solid rgba(56,189,248,0.25)',
              }}
            >
              <BadgeCheck className="w-3.5 h-3.5 text-sky-400" fill="rgba(14,165,233,0.25)" />
              <span className="text-sky-300 text-[10px] font-black uppercase tracking-[0.14em]">NextUp Verified</span>
            </div>

            <div className="flex items-center gap-1.5 text-white/35">
              <MapPin className="w-3 h-3 flex-shrink-0 text-sky-500/50" />
              <span className="text-xs font-semibold">{school}</span>
              <span className="text-white/15">·</span>
              <span className="text-xs">{city}, {state}</span>
            </div>
          </div>

          {/* Measurements */}
          <div className="grid grid-cols-2 gap-2">
            {[
              { icon: Ruler, label: 'Height', value: height },
              { icon: Weight, label: 'Weight', value: weight },
            ].map(({ icon: Icon, label, value }) => (
              <div
                key={label}
                className="flex items-center gap-2.5 rounded-xl px-3 py-2.5"
                style={{
                  background: 'rgba(255,255,255,0.03)',
                  border: '1px solid rgba(255,255,255,0.06)',
                }}
              >
                <div
                  className="w-6 h-6 rounded-lg flex items-center justify-center flex-shrink-0"
                  style={{ background: 'rgba(14,165,233,0.1)', border: '1px solid rgba(56,189,248,0.2)' }}
                >
                  <Icon className="w-3 h-3 text-sky-400" />
                </div>
                <div>
                  <p className="text-[9px] text-white/20 uppercase tracking-[0.12em]">{label}</p>
                  <p className="text-white text-xs font-black">{value}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Badges */}
          {badges.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {badges.includes('creator') && (
                <span
                  className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[10px] font-black uppercase tracking-[0.12em] text-amber-300"
                  style={{
                    background: 'rgba(245,158,11,0.08)',
                    border: '1px solid rgba(245,158,11,0.22)',
                  }}
                >
                  <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                  NextUp Creator
                </span>
              )}
              {badges.includes('top-prospect') && (
                <span
                  className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[10px] font-black uppercase tracking-[0.12em] text-emerald-300"
                  style={{
                    background: 'rgba(16,185,129,0.08)',
                    border: '1px solid rgba(16,185,129,0.22)',
                  }}
                >
                  <BadgeCheck className="w-3 h-3 text-emerald-400" />
                  Top Prospect
                </span>
              )}
            </div>
          )}

          {/* Socials */}
          {(socials.instagram || socials.youtube || socials.twitter) && (
            <div className="flex items-center gap-3">
              <span className="text-white/15 text-[9px] uppercase tracking-[0.15em] font-bold">Socials</span>
              <div className="flex items-center gap-2">
                {socials.instagram && (
                  <a
                    href={`https://instagram.com/${socials.instagram.replace('@', '')}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-7 h-7 rounded-lg flex items-center justify-center transition-all duration-200 hover:scale-110"
                    style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}
                  >
                    <Instagram className="w-3.5 h-3.5 text-white/50 hover:text-white/80" />
                  </a>
                )}
                {socials.youtube && (
                  <a
                    href={`https://youtube.com/@${socials.youtube.replace('@', '')}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-7 h-7 rounded-lg flex items-center justify-center transition-all duration-200 hover:scale-110"
                    style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}
                  >
                    <Youtube className="w-3.5 h-3.5 text-white/50 hover:text-white/80" />
                  </a>
                )}
                {socials.twitter && (
                  <a
                    href={`https://twitter.com/${socials.twitter.replace('@', '')}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-7 h-7 rounded-lg flex items-center justify-center transition-all duration-200 hover:scale-110"
                    style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}
                  >
                    <Twitter className="w-3.5 h-3.5 text-white/50 hover:text-white/80" />
                  </a>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Stats row */}
      <div
        className="relative z-10 mx-4 mb-4 rounded-2xl overflow-hidden"
        style={{
          background: 'rgba(255,255,255,0.025)',
          border: '1px solid rgba(56,189,248,0.1)',
          backdropFilter: 'blur(12px)',
        }}
      >
        <div
          className="absolute top-0 left-0 right-0 h-px"
          style={{ background: 'linear-gradient(90deg, transparent, rgba(56,189,248,0.3), transparent)' }}
        />
        <div className="grid grid-cols-4 divide-x divide-white/5 px-2 py-4">
          <StatPill label="Followers" value={stats.followers ?? '—'} />
          <StatPill label="Video Views" value={stats.videoViews ?? '—'} />
          <StatPill label="Offers" value={stats.offers ?? '—'} />
          <StatPill label="Points" value={stats.points ?? '—'} />
        </div>
      </div>

      {/* CTA row */}
      <div className="relative z-10 flex gap-3 px-4 pb-5">
        <button
          onClick={onFollow}
          className="flex-1 relative group inline-flex items-center justify-center gap-2 font-black text-sm uppercase tracking-[0.1em] py-3.5 rounded-2xl overflow-hidden transition-all duration-300 active:scale-[0.97] text-white"
          style={{
            background: 'linear-gradient(135deg, #0284c7, #0ea5e9, #38bdf8)',
            boxShadow: '0 0 30px rgba(14,165,233,0.45), 0 4px 20px rgba(0,0,0,0.5)',
          }}
        >
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/15 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
          <UserPlus className="w-4 h-4 flex-shrink-0" />
          Follow
        </button>
        <button
          onClick={onSupport}
          className="flex-1 inline-flex items-center justify-center gap-2 font-black text-sm uppercase tracking-[0.1em] py-3.5 rounded-2xl transition-all duration-300 active:scale-[0.97]"
          style={{
            background: 'rgba(255,255,255,0.05)',
            border: '1px solid rgba(255,255,255,0.1)',
            color: 'rgba(255,255,255,0.65)',
          }}
        >
          <Heart className="w-4 h-4 flex-shrink-0" />
          Support
        </button>
      </div>

      {/* Bottom neon edge */}
      <div
        className="absolute bottom-0 left-0 right-0 h-px"
        style={{ background: 'linear-gradient(90deg, transparent 0%, rgba(14,165,233,0.3) 50%, transparent 100%)' }}
      />
    </div>
  );
}

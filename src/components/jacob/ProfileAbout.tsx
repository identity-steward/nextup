import { MapPin, Award, Shield, Users, TrendingUp } from 'lucide-react';

const quickStats = [
  { label: 'Hometown', value: 'Memphis, TN', icon: MapPin },
  { label: 'Sport', value: 'Basketball', icon: Award },
  { label: 'Position', value: 'Guard', icon: Shield },
  { label: 'Grade', value: '8th Grade', icon: Users },
];

export default function ProfileAbout() {
  return (
    <section className="relative py-20 overflow-hidden" style={{ background: '#070a10' }}>
      <div className="absolute top-0 left-0 right-0 h-px" style={{ background: 'linear-gradient(90deg, transparent, rgba(56,189,248,0.25), transparent)' }} />

      {/* Left ambient glow */}
      <div
        className="absolute left-0 top-1/2 -translate-y-1/2 w-[500px] h-[500px] pointer-events-none"
        style={{ background: 'radial-gradient(ellipse at left, rgba(14,165,233,0.06) 0%, transparent 65%)', transform: 'translate(-30%, -50%)' }}
      />
      <div
        className="absolute right-0 top-0 w-[400px] h-[400px] pointer-events-none"
        style={{ background: 'radial-gradient(circle, rgba(14,165,233,0.04) 0%, transparent 70%)', transform: 'translate(30%, -20%)' }}
      />

      <div className="relative max-w-5xl mx-auto px-6 lg:px-8">
        <div className="grid lg:grid-cols-[1fr_300px] gap-12 lg:gap-20 items-start">

          {/* Left — Story */}
          <div>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-0.5 h-8 rounded-full" style={{ background: 'linear-gradient(to bottom, #38bdf8, rgba(14,165,233,0.2))', boxShadow: '0 0 10px rgba(56,189,248,0.5)' }} />
              <p className="text-sky-400 text-[10px] font-black uppercase tracking-[0.2em]">His Story</p>
            </div>
            <h2 className="text-4xl md:text-5xl font-black text-white leading-none tracking-tight mb-8">
              Discipline Before
              <br />
              <span className="text-white/25">the Recognition</span>
            </h2>

            {/* Opening line */}
            <p className="text-white text-xl font-semibold leading-relaxed mb-5">
              Jacob Fouse is an 8th grade guard from Memphis putting in the daily work long before anyone is watching.
            </p>

            {/* Body narrative */}
            <div className="space-y-4">
              <p className="text-white/45 text-base leading-relaxed">
                He trains year-round, competes on the AAU circuit, and approaches the game with a level of focus you don't often see at this age. Not just skilled — self-aware. He studies the game, works his weaknesses, and shows up every day with something to prove.
              </p>
              <p className="text-white/45 text-base leading-relaxed">
                He's not waiting for his moment. He's building it. Tournament by tournament, rep by rep, one consistent performance at a time.
              </p>
            </div>

            {/* Trait callouts */}
            <div className="grid grid-cols-3 gap-3 mt-9">
              {[
                { icon: TrendingUp, label: 'Growth mindset', sub: 'Outworks everyone in the room' },
                { icon: Shield, label: 'Disciplined', sub: 'Consistent in practice & class' },
                { icon: Award, label: 'Competitive', sub: 'Rises to bigger stages' },
              ].map(({ icon: Icon, label, sub }) => (
                <div
                  key={label}
                  className="bg-white/[0.04] border border-white/8 rounded-2xl p-4 hover:border-sky-500/25 hover:bg-white/[0.06] transition-all duration-300"
                >
                  <div className="w-7 h-7 rounded-lg bg-sky-500/10 border border-sky-500/20 flex items-center justify-center mb-3">
                    <Icon className="w-3.5 h-3.5 text-sky-400" />
                  </div>
                  <p className="text-white text-[11px] font-black leading-tight mb-1">{label}</p>
                  <p className="text-white/25 text-[10px] leading-snug">{sub}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Right — Quick info cards */}
          <div className="grid grid-cols-2 gap-3">
            {quickStats.map(({ label, value, icon: Icon }) => (
              <div
                key={label}
                className="group relative bg-white/[0.04] border border-white/8 hover:border-sky-500/30 rounded-2xl p-5 transition-all duration-300 hover:bg-white/[0.06] overflow-hidden"
              >
                <div
                  className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                  style={{ background: 'radial-gradient(circle at 50% 0%, rgba(14,165,233,0.07) 0%, transparent 70%)' }}
                />
                <div className="w-8 h-8 rounded-xl bg-sky-500/10 border border-sky-500/20 flex items-center justify-center mb-3">
                  <Icon className="w-4 h-4 text-sky-400" />
                </div>
                <p className="text-[10px] text-white/25 uppercase tracking-[0.14em] mb-1">{label}</p>
                <p className="text-white font-black text-sm">{value}</p>
              </div>
            ))}

            {/* Momentum card — spans full width */}
            <div className="col-span-2 bg-gradient-to-br from-sky-500/8 to-transparent border border-sky-500/20 rounded-2xl p-5">
              <p className="text-sky-400 text-[10px] font-black uppercase tracking-[0.14em] mb-2">Right Now</p>
              <p className="text-white font-black text-sm leading-snug">Competing this April</p>
              <p className="text-white/35 text-xs mt-1 leading-relaxed">
                Spring AAU tournament season. This is the run where exposure starts to compound.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

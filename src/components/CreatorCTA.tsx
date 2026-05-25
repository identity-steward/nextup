import { Video, Camera, PenTool, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

const roles = [
  { icon: Video, label: 'Videographer' },
  { icon: Camera, label: 'Photographer' },
  { icon: PenTool, label: 'Editor' },
];

export default function CreatorCTA() {
  return (
    <section className="py-24 bg-navy relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_rgba(212,175,55,0.12)_0%,_transparent_60%)] pointer-events-none" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,_rgba(212,175,55,0.07)_0%,_transparent_60%)] pointer-events-none" />

      <div className="max-w-6xl mx-auto px-6 lg:px-8 relative">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          <div>
            <div className="inline-flex items-center gap-2 bg-gold/20 border border-gold/30 text-gold px-3 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest mb-6">
              <Video className="w-3.5 h-3.5" />
              Creators
            </div>
            <h2 className="text-4xl md:text-5xl font-black text-white leading-tight mb-6">
              Become a<br />
              <span className="text-gold">NextUp Creator</span>
            </h2>
            <p className="text-gray-300 text-lg leading-relaxed mb-8">
              NextUp creators are developmental documentarians. You capture leadership, composure, resilience, and growth — not just highlights. Your work builds the athlete's Journey and powers the Spotlight.
            </p>
            <div className="flex flex-wrap gap-3 mb-10">
              {roles.map(({ icon: Icon, label }) => (
                <div
                  key={label}
                  className="flex items-center gap-2 bg-white/10 border border-white/10 text-gray-200 px-4 py-2 rounded-full text-sm font-medium"
                >
                  <Icon className="w-4 h-4 text-gold" />
                  {label}
                </div>
              ))}
            </div>
            <Link
              to="/creator"
              className="btn-primary px-8 py-4 text-base font-bold inline-flex items-center gap-2 group"
            >
              Apply as Creator
              <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
            </Link>
          </div>

          <div className="hidden lg:block">
            <div className="relative">
              <div className="absolute -top-6 -left-6 w-64 h-64 bg-gold/10 rounded-3xl rotate-6" />
              <div className="relative bg-white/5 border border-white/10 rounded-3xl p-8 backdrop-blur-sm">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 rounded-full bg-gold/20 flex items-center justify-center">
                    <Video className="w-5 h-5 text-gold" />
                  </div>
                  <div>
                    <p className="text-white font-bold text-sm">Creator Network</p>
                    <p className="text-gray-400 text-xs">Memphis & surrounding areas</p>
                  </div>
                </div>
                <div className="space-y-3">
                  {[
                    'Document athletes at games and tournaments',
                    'Capture developmental moments — leadership, hustle, composure',
                    'Build your creator portfolio',
                    'Contribute to every athlete\'s Journey',
                  ].map((item) => (
                    <div key={item} className="flex items-center gap-3">
                      <div className="w-1.5 h-1.5 rounded-full bg-gold shrink-0" />
                      <span className="text-gray-300 text-sm">{item}</span>
                    </div>
                  ))}
                </div>
                <div className="mt-8 pt-6 border-t border-white/10">
                  <p className="text-gray-400 text-xs">Applications reviewed on a rolling basis</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

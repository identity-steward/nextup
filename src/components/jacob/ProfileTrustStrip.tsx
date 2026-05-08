import { Shield, CheckCircle, BadgeCheck } from 'lucide-react';

const trustItems = [
  { icon: Shield, text: 'Parent-managed profile', sub: 'A verified guardian manages this account' },
  { icon: CheckCircle, text: 'Funds athlete development', sub: 'Travel, training & tournament fees only' },
  { icon: BadgeCheck, text: 'NextUp Verified Athlete', sub: 'Reviewed and approved by NextUp' },
];

export default function ProfileTrustStrip() {
  return (
    <section className="py-8 border-t" style={{ background: '#111318', borderColor: 'rgba(255,255,255,0.05)' }}>
      <div className="max-w-3xl mx-auto px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-center gap-6 sm:gap-10">
          {trustItems.map(({ icon: Icon, text, sub }) => (
            <div key={text} className="flex items-start gap-3">
              <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-emerald-500/8 border border-emerald-500/15 flex items-center justify-center mt-0.5">
                <Icon className="w-3.5 h-3.5 text-emerald-400" />
              </div>
              <div>
                <p className="text-white/70 font-bold text-xs">{text}</p>
                <p className="text-white/25 text-[11px] mt-0.5">{sub}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

import { Shield, CheckCircle, BadgeCheck } from 'lucide-react';
import type { Athlete } from '../../types/athlete';

interface ProfileTrustStripProps {
  athlete: Athlete;
}

export default function ProfileTrustStrip({ athlete }: ProfileTrustStripProps) {
  const isVerified = athlete.identity_confirmed_at != null;

  const trustItems = [
    { icon: Shield, text: 'NextUp reviewed', sub: 'Profile reviewed before publishing' },
    { icon: CheckCircle, text: 'Athlete development', sub: 'Funds support training, travel & fees' },
    { icon: BadgeCheck, text: isVerified ? 'Identity verified' : 'Profile active', sub: isVerified ? 'Identity confirmed by NextUp' : 'Published and visible on NextUp' },
  ];

  return (
    <section className="py-8 border-t" style={{ background: '#1c2028', borderColor: 'rgba(255,255,255,0.05)' }}>
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

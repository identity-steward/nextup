import { Info, Pencil } from 'lucide-react';

interface ProfileDisclaimerStripProps {
  onRequestUpdate: () => void;
}

export default function ProfileDisclaimerStrip({ onRequestUpdate }: ProfileDisclaimerStripProps) {
  return (
    <div
      className="py-4 px-6"
      style={{ background: '#111318', borderTop: '1px solid rgba(255,255,255,0.05)' }}
    >
      <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="flex items-start gap-2.5">
          <Info className="w-3.5 h-3.5 text-white/25 flex-shrink-0 mt-0.5" />
          <p className="text-white/25 text-[11px] leading-relaxed max-w-xl">
            Athlete information is submitted or confirmed by the athlete, parent/guardian, coach, or authorized representative. NextUp reviews submissions before publishing.
          </p>
        </div>
        <button
          onClick={onRequestUpdate}
          className="flex-shrink-0 inline-flex items-center gap-1.5 text-white/35 hover:text-white/70 text-[11px] font-bold uppercase tracking-[0.12em] transition-colors duration-200 whitespace-nowrap"
        >
          <Pencil className="w-3 h-3" />
          Request Update
        </button>
      </div>
    </div>
  );
}

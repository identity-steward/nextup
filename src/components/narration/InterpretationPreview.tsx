import NarrationPreservationBanner from './NarrationPreservationBanner';
import type { PersonNarration } from '../../types/narration';

interface InterpretationPreviewProps {
  narration: PersonNarration;
}

export default function InterpretationPreview({ narration }: InterpretationPreviewProps) {
  return (
    <div className="space-y-6">
      <NarrationPreservationBanner />

      <div className="bg-white rounded-2xl shadow-lg p-6 md:p-8">
        <h3 className="text-sm font-bold uppercase tracking-wider text-gray-400 mb-3">
          Your Words
        </h3>
        <div className="bg-gray-50 rounded-xl p-5 border-l-4 border-navy">
          <p className="text-gray-800 leading-relaxed whitespace-pre-wrap">
            {narration.original_text}
          </p>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-lg p-6 md:p-8">
        <h3 className="text-sm font-bold uppercase tracking-wider text-gold mb-3">
          NextUp's Understanding
        </h3>
        <div className="bg-gold/5 rounded-xl p-5 border-l-4 border-gold">
          <p className="text-gray-800 leading-relaxed whitespace-pre-wrap">
            {narration.proposed_interpretation}
          </p>
        </div>
      </div>

      <div className="bg-blue-50 border border-blue-100 rounded-xl p-4">
        <p className="text-sm text-gray-600 leading-relaxed text-center">
          This helps organize possible next steps. It does not determine
          eligibility for a program.
        </p>
      </div>
    </div>
  );
}

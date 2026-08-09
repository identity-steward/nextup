import { Shield } from 'lucide-react';

export default function NarrationPreservationBanner() {
  return (
    <div className="bg-navy/5 border border-navy/10 rounded-xl p-4 mb-6 flex items-start gap-3">
      <Shield className="w-5 h-5 text-navy flex-shrink-0 mt-0.5" />
      <p className="text-sm text-gray-600 leading-relaxed">
        Your words are preserved exactly as you wrote them. NextUp's
        understanding is kept separate and can be changed.
      </p>
    </div>
  );
}

import { CircleDot } from 'lucide-react';
import type { Need } from '../../types/narration';

interface NeedListProps {
  needs: Need[];
}

const statusColors: Record<string, string> = {
  confirmed: 'bg-blue-50 text-blue-700 border-blue-200',
  active: 'bg-gold/10 text-navy border-gold/30',
  met: 'bg-green-50 text-green-700 border-green-200',
  unmet: 'bg-red-50 text-red-700 border-red-200',
  chose_differently: 'bg-gray-50 text-gray-600 border-gray-200',
};

export default function NeedList({ needs }: NeedListProps) {
  if (needs.length === 0) {
    return (
      <div className="bg-white rounded-2xl shadow-sm p-6">
        <h3 className="font-bold text-navy mb-2">What We're Working On</h3>
        <p className="text-gray-400 text-sm">Nothing confirmed yet.</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow-sm p-6">
      <h3 className="font-bold text-navy mb-4">What We're Working On</h3>
      <div className="space-y-3">
        {needs.map((need) => (
          <div
            key={need.id}
            className="flex items-start gap-3 p-3 rounded-xl border border-gray-100 hover:border-gray-200 transition-colors"
          >
            <CircleDot className="w-5 h-5 text-gold flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="font-medium text-navy text-sm">{need.title}</p>
              {need.description && (
                <p className="text-gray-500 text-xs mt-1 leading-relaxed">{need.description}</p>
              )}
              <span className={`inline-block mt-2 text-xs font-medium px-2 py-0.5 rounded-full border ${statusColors[need.status] ?? statusColors.confirmed}`}>
                {need.status.replace('_', ' ')}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

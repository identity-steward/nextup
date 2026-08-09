import { Compass, ArrowRight } from 'lucide-react';
import type { PathwayWithRelations } from '../../types/pathway';

interface PathwayCardProps {
  pathway: PathwayWithRelations;
  onClick?: () => void;
}

const STATUS_LABELS: Record<string, string> = {
  possible: 'Possible',
  active: 'Active',
  waiting: 'Waiting',
  blocked: 'Blocked',
  completed: 'Navigation complete',
  closed: 'Closed',
  unknown: 'Unknown',
};

const STATUS_COLORS: Record<string, string> = {
  possible: 'bg-blue-50 text-blue-700 border-blue-200',
  active: 'bg-green-50 text-green-700 border-green-200',
  waiting: 'bg-amber-50 text-amber-700 border-amber-200',
  blocked: 'bg-red-50 text-red-700 border-red-200',
  completed: 'bg-teal-50 text-teal-700 border-teal-200',
  closed: 'bg-gray-50 text-gray-600 border-gray-200',
  unknown: 'bg-gray-50 text-gray-500 border-gray-200',
};

function getNextAction(pathway: PathwayWithRelations): string {
  if (pathway.status === 'blocked') return 'Review what is blocking this pathway';
  if (!pathway.service_id) return 'Identify what may help';
  if (!pathway.provider_id) return 'Identify who provides this';
  if (pathway.referrals && pathway.referrals.length > 0) {
    const latest = pathway.referrals[0];
    if (latest.status === 'draft') return 'Review referral draft';
    if (latest.status === 'ready') return 'Approve sharing to send referral';
    if (latest.status === 'sent') return 'Waiting for response';
    if (latest.status === 'received' || latest.status === 'acknowledged') return 'Waiting for screening';
    if (latest.status === 'accepted') return 'Schedule intake';
    if (latest.status === 'intake_scheduled') return 'Attend intake appointment';
    if (latest.status === 'service_initiated') return 'Service in progress';
  }
  if (!pathway.funding_option_id) return 'Review possible funding';
  return 'Review pathway';
}

export default function PathwayCard({ pathway, onClick }: PathwayCardProps) {
  const statusLabel = STATUS_LABELS[pathway.status] ?? pathway.status;
  const statusColor = STATUS_COLORS[pathway.status] ?? STATUS_COLORS.unknown;
  const nextAction = getNextAction(pathway);
  const needTitle = pathway.need?.title ?? 'Your need';

  return (
    <button
      onClick={onClick}
      className="w-full text-left bg-white rounded-2xl shadow-sm border border-gray-100 p-5 hover:shadow-md hover:border-gray-200 transition-all"
    >
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex items-center gap-2">
          <div className="w-9 h-9 bg-gold/10 rounded-lg flex items-center justify-center">
            <Compass className="w-5 h-5 text-gold" />
          </div>
          <div>
            <p className="text-xs text-gray-400 uppercase tracking-wide font-medium">What you told us</p>
            <p className="text-sm font-medium text-navy">{needTitle}</p>
          </div>
        </div>
        <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border flex-shrink-0 ${statusColor}`}>
          {statusLabel}
        </span>
      </div>

      {pathway.service && (
        <p className="text-sm text-gray-600 mb-2">
          <span className="text-gray-400">What may help: </span>
          {pathway.service.name}
        </p>
      )}

      {pathway.provider && (
        <p className="text-sm text-gray-600 mb-3">
          <span className="text-gray-400">Who provides it: </span>
          {pathway.provider.organization_name}
        </p>
      )}

      <div className="flex items-center gap-1.5 text-sm text-gold font-medium mt-2 pt-2 border-t border-gray-50">
        <ArrowRight className="w-4 h-4" />
        <span>Next: {nextAction}</span>
      </div>
    </button>
  );
}

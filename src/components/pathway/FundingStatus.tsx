import { AlertCircle, CheckCircle, HelpCircle, XCircle, Clock } from 'lucide-react';
import type { FundingApplicabilityStatus, FundingAssertionType, FundingPaymentStatus } from '../../types/pathway';

interface FundingStatusProps {
  applicability: FundingApplicabilityStatus;
  assertion: FundingAssertionType;
  payment: FundingPaymentStatus;
  sourceAuthority?: string | null;
  hasUnresolvedBlockingGates?: boolean;
}

const APPLICABILITY_LABELS: Record<FundingApplicabilityStatus, string> = {
  unknown: 'Unknown',
  may_apply: 'May apply',
  needs_verification: 'Needs verification',
  confirmed_applicable: 'Confirmed applicable',
  not_applicable: 'Not applicable',
};

const ASSERTION_LABELS: Record<FundingAssertionType, string> = {
  possible: 'Possible',
  verified: 'Verified',
  approved: 'Approved',
  denied: 'Denied',
  paid: 'Paid',
  exhausted: 'Exhausted',
  unknown: 'Unknown',
};

const PAYMENT_LABELS: Record<FundingPaymentStatus, string> = {
  not_started: 'Not started',
  pending: 'Pending',
  approved: 'Approved',
  denied: 'Denied',
  paid: 'Paid',
  reimbursed: 'Reimbursed',
  partially_paid: 'Partially paid',
  unknown: 'Unknown',
};

function getBadgeStyle(applicability: FundingApplicabilityStatus, hasUnresolvedGates: boolean): string {
  if (hasUnresolvedGates) return 'bg-amber-50 text-amber-800 border-amber-200';
  switch (applicability) {
    case 'confirmed_applicable': return 'bg-green-50 text-green-800 border-green-200';
    case 'not_applicable': return 'bg-red-50 text-red-800 border-red-200';
    case 'needs_verification': return 'bg-amber-50 text-amber-800 border-amber-200';
    case 'may_apply': return 'bg-blue-50 text-blue-800 border-blue-200';
    default: return 'bg-gray-50 text-gray-600 border-gray-200';
  }
}

function getIcon(applicability: FundingApplicabilityStatus, hasUnresolvedGates: boolean) {
  if (hasUnresolvedGates) return <AlertCircle className="w-4 h-4" />;
  switch (applicability) {
    case 'confirmed_applicable': return <CheckCircle className="w-4 h-4" />;
    case 'not_applicable': return <XCircle className="w-4 h-4" />;
    case 'needs_verification': return <AlertCircle className="w-4 h-4" />;
    case 'may_apply': return <Clock className="w-4 h-4" />;
    default: return <HelpCircle className="w-4 h-4" />;
  }
}

export default function FundingStatus({ applicability, assertion, payment, sourceAuthority, hasUnresolvedBlockingGates }: FundingStatusProps) {
  const badgeStyle = getBadgeStyle(applicability, hasUnresolvedBlockingGates ?? false);
  const icon = getIcon(applicability, hasUnresolvedBlockingGates ?? false);

  return (
    <div className="space-y-2">
      <div className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium border ${badgeStyle}`}>
        {icon}
        {hasUnresolvedBlockingGates ? 'Needs verification' : APPLICABILITY_LABELS[applicability]}
      </div>

      <div className="text-xs text-gray-500 space-y-0.5">
        <p>Funding status: {ASSERTION_LABELS[assertion]}</p>
        <p>Payment status: {PAYMENT_LABELS[payment]}</p>
        {sourceAuthority && <p className="text-gray-400">Source: {sourceAuthority}</p>}
      </div>

      {hasUnresolvedBlockingGates && (
        <p className="text-xs text-amber-700 leading-relaxed">
          This may be a possible funding pathway. Confirm with the official program, plan, or provider.
        </p>
      )}
    </div>
  );
}

import { Send, Inbox, CheckCircle, ClipboardCheck, UserCheck, Activity, XCircle, UserX, Ban, Clock, HelpCircle, MailOpen } from 'lucide-react';
import type { ReferralStatus, ReferralStatusSource } from '../../types/pathway';

interface ReferralStatusCardProps {
  status: ReferralStatus;
  statusSource: ReferralStatusSource;
  statusReason?: string | null;
  sentAt?: string | null;
  receivedAt?: string | null;
  acknowledgedAt?: string | null;
  recipientName: string;
}

const STATUS_META: Record<ReferralStatus, { label: string; icon: typeof Send; color: string }> = {
  draft: { label: 'Draft', icon: ClipboardCheck, color: 'bg-gray-50 text-gray-700 border-gray-200' },
  ready: { label: 'Ready to send', icon: Clock, color: 'bg-blue-50 text-blue-700 border-blue-200' },
  sent: { label: 'Sent', icon: Send, color: 'bg-blue-50 text-blue-700 border-blue-200' },
  received: { label: 'Received', icon: Inbox, color: 'bg-teal-50 text-teal-700 border-teal-200' },
  acknowledged: { label: 'Acknowledged', icon: MailOpen, color: 'bg-teal-50 text-teal-700 border-teal-200' },
  screening: { label: 'Under screening', icon: ClipboardCheck, color: 'bg-indigo-50 text-indigo-700 border-indigo-200' },
  accepted: { label: 'Accepted', icon: CheckCircle, color: 'bg-green-50 text-green-700 border-green-200' },
  declined: { label: 'Declined by provider', icon: XCircle, color: 'bg-red-50 text-red-700 border-red-200' },
  intake_scheduled: { label: 'Intake scheduled', icon: Clock, color: 'bg-green-50 text-green-700 border-green-200' },
  service_initiated: { label: 'Service initiated', icon: Activity, color: 'bg-green-50 text-green-700 border-green-200' },
  completed: { label: 'Completed', icon: CheckCircle, color: 'bg-green-50 text-green-700 border-green-200' },
  unable_to_contact: { label: 'Unable to contact', icon: HelpCircle, color: 'bg-amber-50 text-amber-700 border-amber-200' },
  person_declined: { label: 'You chose another option', icon: UserX, color: 'bg-gray-50 text-gray-700 border-gray-200' },
  cancelled: { label: 'Cancelled', icon: Ban, color: 'bg-gray-50 text-gray-700 border-gray-200' },
  expired: { label: 'Expired', icon: Clock, color: 'bg-gray-50 text-gray-700 border-gray-200' },
  unknown: { label: 'Status unknown', icon: HelpCircle, color: 'bg-gray-50 text-gray-600 border-gray-200' },
};

const SOURCE_LABELS: Record<ReferralStatusSource, string> = {
  person_reported: 'Reported by you',
  navigator_reported: 'Reported by navigator',
  provider_confirmed: 'Confirmed by provider',
  system_observed: 'System observed',
  unknown: 'Source unknown',
};

export default function ReferralStatusCard({ status, statusSource, statusReason, sentAt, receivedAt, acknowledgedAt, recipientName }: ReferralStatusCardProps) {
  const meta = STATUS_META[status] ?? STATUS_LABELS_FALLBACK;
  const Icon = meta.icon;

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-4 space-y-3">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs text-gray-400 uppercase tracking-wide font-medium">Connection to {recipientName}</p>
          <div className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium border mt-1.5 ${meta.color}`}>
            <Icon className="w-4 h-4" />
            {meta.label}
          </div>
        </div>
      </div>

      <div className="text-xs text-gray-500 space-y-1">
        <p className="flex items-center gap-1.5">
          <UserCheck className="w-3.5 h-3.5 text-gray-400" />
          {SOURCE_LABELS[statusSource]}
        </p>
        {sentAt && <p>Sent: {new Date(sentAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</p>}
        {receivedAt && <p>Received: {new Date(receivedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</p>}
        {acknowledgedAt && <p>Acknowledged: {new Date(acknowledgedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</p>}
        {statusReason && <p className="text-gray-400 italic">{statusReason}</p>}
      </div>

      {(status === 'sent' || status === 'unable_to_contact') && (
        <p className="text-xs text-gray-400 leading-relaxed">
          {status === 'sent' && 'Waiting for the receiving organization to confirm receipt.'}
          {status === 'unable_to_contact' && 'No response received yet. Your navigator can follow up.'}
        </p>
      )}
    </div>
  );
}

const STATUS_LABELS_FALLBACK = STATUS_META.unknown;

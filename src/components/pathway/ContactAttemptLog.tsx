import { Phone, Mail, Globe, Users, MessageSquare, MoreHorizontal, Clock } from 'lucide-react';
import type { ContactAttempt, ContactMethod, ContactResult } from '../../types/pathway';

interface ContactAttemptLogProps {
  attempts: ContactAttempt[];
}

const METHOD_ICONS: Record<ContactMethod, typeof Phone> = {
  email: Mail,
  phone: Phone,
  secure_portal: Globe,
  in_person: Users,
  text: MessageSquare,
  other: MoreHorizontal,
};

const RESULT_LABELS: Record<ContactResult, string> = {
  no_response: 'No response',
  message_left: 'Message left',
  reached: 'Reached',
  scheduled_follow_up: 'Follow-up scheduled',
  wrong_contact: 'Wrong contact',
  contact_information_invalid: 'Contact info invalid',
  other: 'Other',
};

export default function ContactAttemptLog({ attempts }: ContactAttemptLogProps) {
  if (attempts.length === 0) {
    return (
      <div className="text-sm text-gray-400 italic">
        No contact attempts recorded yet.
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {attempts.map((attempt) => {
        const Icon = METHOD_ICONS[attempt.method] ?? MoreHorizontal;
        return (
          <div key={attempt.id} className="flex items-start gap-3 bg-gray-50 rounded-lg p-3">
            <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center flex-shrink-0 border border-gray-200">
              <Icon className="w-4 h-4 text-gray-500" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between gap-2">
                <p className="text-sm font-medium text-navy">
                  {RESULT_LABELS[attempt.result]}
                </p>
                <span className="text-xs text-gray-400 flex-shrink-0">
                  {new Date(attempt.attempted_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                </span>
              </div>
              <p className="text-xs text-gray-500 mt-0.5">
                {attempt.method.replace(/_/g, ' ')} &middot; {attempt.initiator} &rarr; {attempt.intended_recipient}
              </p>
              {attempt.follow_up_at && (
                <p className="text-xs text-amber-600 mt-1 flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  Follow-up: {new Date(attempt.follow_up_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                </p>
              )}
              {attempt.notes && (
                <p className="text-xs text-gray-400 mt-1 italic">{attempt.notes}</p>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

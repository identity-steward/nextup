import { ArrowRight, MessageCircle, Clock, Eye, CheckCircle, XCircle, PenLine } from 'lucide-react';
import type { NarrationStatus } from '../../types/narration';

interface NextActionCardProps {
  narrationStatus: NarrationStatus | 'none' | 'draft';
  onAction?: () => void;
}

export default function NextActionCard({ narrationStatus, onAction }: NextActionCardProps) {
  const config: Record<string, { icon: typeof ArrowRight; title: string; description: string; action: string; color: string }> = {
    none: {
      icon: MessageCircle,
      title: 'Tell us what\u2019s happening.',
      description: 'Start your story. You don\u2019t need to know what program you need.',
      action: 'Tell Your Story',
      color: 'gold',
    },
    draft: {
      icon: PenLine,
      title: 'Finish your story.',
      description: 'You started telling us what\u2019s happening. Pick up where you left off.',
      action: 'Continue',
      color: 'gold',
    },
    submitted: {
      icon: Clock,
      title: 'We\u2019re reviewing what you shared.',
      description: 'Someone will read your story and organize what we heard. Check back soon.',
      action: '',
      color: 'blue',
    },
    proposed: {
      icon: Eye,
      title: 'Review what we heard.',
      description: 'NextUp has organized your story. See if it sounds right.',
      action: 'Review Now',
      color: 'gold',
    },
    confirmed: {
      icon: CheckCircle,
      title: 'Your story is organized.',
      description: 'Pathways are coming next.',
      action: '',
      color: 'green',
    },
    modified: {
      icon: CheckCircle,
      title: 'Your story is organized.',
      description: 'You made changes to what NextUp understood. Pathways are coming next.',
      action: '',
      color: 'green',
    },
    rejected: {
      icon: XCircle,
      title: 'Let\u2019s make sure we understand correctly.',
      description: 'You let us know the interpretation didn\u2019t capture it. We\u2019ll try again.',
      action: '',
      color: 'gray',
    },
  };

  const c = config[narrationStatus] ?? config.none;
  const Icon = c.icon;

  const colorMap: Record<string, string> = {
    gold: 'from-gold/10 to-gold/5 border-gold/30',
    blue: 'from-blue-50 to-blue-25 border-blue-100',
    green: 'from-green-50 to-green-25 border-green-100',
    gray: 'from-gray-50 to-gray-25 border-gray-200',
  };

  return (
    <div className={`bg-gradient-to-br ${colorMap[c.color]} border-2 rounded-2xl p-6 md:p-8`}>
      <div className="flex items-start gap-4">
        <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center flex-shrink-0 shadow-sm">
          <Icon className="w-6 h-6 text-navy" />
        </div>
        <div className="flex-1">
          <h3 className="text-lg font-bold text-navy mb-1">{c.title}</h3>
          <p className="text-gray-600 text-sm leading-relaxed mb-4">{c.description}</p>
          {c.action && onAction && (
            <button
              onClick={onAction}
              className="inline-flex items-center gap-2 bg-navy hover:bg-navy-light text-white font-semibold px-5 py-2.5 rounded-lg transition-colors text-sm"
            >
              {c.action}
              <ArrowRight className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

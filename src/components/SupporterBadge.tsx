import { Heart } from 'lucide-react';
import { useEffect, useState } from 'react';
import { hasActiveSupport } from '../services/supporterService';
import { useAuth } from '../context/AuthContext';

interface SupporterBadgeProps {
  athleteSlug?: string;
  className?: string;
}

export default function SupporterBadge({ athleteSlug, className = '' }: SupporterBadgeProps) {
  const { user } = useAuth();
  const [active, setActive] = useState(false);

  useEffect(() => {
    if (!user) return;
    hasActiveSupport(athleteSlug).then(setActive);
  }, [user, athleteSlug]);

  if (!active) return null;

  return (
    <span
      className={`inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-full ${className}`}
      style={{
        background: 'linear-gradient(135deg, rgba(245,158,11,0.15), rgba(245,158,11,0.08))',
        border: '1px solid rgba(245,158,11,0.35)',
        color: '#f59e0b',
      }}
    >
      <Heart className="w-3 h-3" fill="currentColor" />
      Supporter Active
    </span>
  );
}

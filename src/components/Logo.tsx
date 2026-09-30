import { Link } from 'react-router-dom';

interface LogoProps {
  size?: 'sm' | 'md' | 'lg';
  showWordmark?: boolean;
  variant?: 'dark' | 'light';
}

export function Logo({ size = 'md', showWordmark = true, variant = 'dark' }: LogoProps) {
  const dimensions = { sm: 'w-7 h-7', md: 'w-9 h-9', lg: 'w-12 h-12' };
  const textSize = { sm: 'text-base', md: 'text-lg', lg: 'text-2xl' };
  const wordmarkColor = variant === 'dark' ? 'text-white' : 'text-navy-900';

  return (
    <Link to="/" className="flex items-center gap-2.5 group">
      <img
        src="/nextup-logo.svg"
        alt="NextUp Network"
        className={`${dimensions[size]} rounded-lg transition-transform group-hover:scale-105`}
      />
      {showWordmark && (
        <span className={`font-extrabold tracking-tight ${textSize[size]} ${wordmarkColor}`}>
          NextUp
        </span>
      )}
    </Link>
  );
}

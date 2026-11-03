import { Link } from 'react-router-dom';

interface LogoProps {
  size?: 'sm' | 'md' | 'lg';
  showWordmark?: boolean;
  variant?: 'dark' | 'light';
}

export function Logo({ size = 'md', showWordmark = true, variant = 'dark' }: LogoProps) {
  const dimensions = { sm: 'w-24 h-12', md: 'w-32 h-14', lg: 'w-40 h-16' };
  const containerPadding = { sm: 'px-2', md: 'px-2.5', lg: 'px-3' };
  const background = variant === 'dark' ? 'bg-white' : 'bg-white';

  return (
    <Link to="/" className="flex items-center group" aria-label="NextUp Network home">
      <span className={`${dimensions[size]} ${containerPadding[size]} ${background} rounded-lg flex items-center justify-center overflow-hidden transition-transform group-hover:scale-[1.02]`}>
        <img
          src="/DF407E88-4653-40E6-A9D4-3AF684ABB2C6.png"
          alt="NextUp Network"
          className="w-full h-full object-contain"
        />
      </span>
    </Link>
  );
}

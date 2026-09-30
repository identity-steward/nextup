import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, ArrowRight } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { Logo } from './Logo';

const publicNav = [
  { label: 'Explore', path: '/youth' },
  { label: 'Spotlight', path: '/youth/jacob-fouse' },
  { label: 'How It Works', path: '/how-it-works' },
  { label: 'About', path: '/about' },
];

const authNav = [
  { label: 'Home', path: '/app' },
  { label: 'My Journey', path: '/app/story' },
  { label: 'Pathways', path: '/app/pathways' },
  { label: 'Sharing', path: '/app/share' },
  { label: 'Spotlight', path: '/youth/jacob-fouse' },
  { label: 'Profile', path: '/profile-setup' },
];

export function Header() {
  const { user } = useAuth();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => { setMobileOpen(false); }, [location.pathname]);

  const nav = user ? authNav : publicNav;
  const isAdmin = user && (user as { app_metadata?: { role?: string } })?.app_metadata?.role === 'admin';

  return (
    <header className={`sticky top-0 z-50 transition-all duration-300 ${scrolled ? 'bg-navy-900/95 backdrop-blur-md border-b border-white/10' : 'bg-navy-900 border-b border-white/5'}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 lg:h-20">
          <Logo size="md" variant="light" />

          <nav className="hidden lg:flex items-center gap-1">
            {nav.map((item) => {
              const active = location.pathname === item.path;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`px-4 py-2 text-sm font-semibold rounded-lg transition-colors ${
                    active ? 'text-white bg-white/10' : 'text-navy-200 hover:text-white hover:bg-white/5'
                  }`}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>

          <div className="hidden lg:flex items-center gap-3">
            {user ? (
              <Link
                to={isAdmin ? '/admin' : '/app'}
                className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white font-bold text-sm px-5 py-2.5 rounded-lg transition-all hover:glow-blue-sm"
              >
                Dashboard
                <ArrowRight className="w-4 h-4" />
              </Link>
            ) : (
              <>
                <Link
                  to="/signin"
                  className="text-sm font-semibold text-navy-200 hover:text-white px-4 py-2.5 rounded-lg transition-colors"
                >
                  Sign In
                </Link>
                <Link
                  to="/start"
                  className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white font-bold text-sm px-5 py-2.5 rounded-lg transition-all hover:glow-blue-sm"
                >
                  Get Started
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </>
            )}
          </div>

          <button
            className="lg:hidden text-white p-2"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label="Toggle menu"
          >
            {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {mobileOpen && (
        <div className="lg:hidden bg-navy-900 border-t border-white/10 animate-slide-down">
          <nav className="max-w-7xl mx-auto px-4 py-4 space-y-1">
            {nav.map((item) => {
              const active = location.pathname === item.path;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`block px-4 py-3 text-sm font-semibold rounded-lg transition-colors ${
                    active ? 'text-white bg-white/10' : 'text-navy-200 hover:text-white hover:bg-white/5'
                  }`}
                >
                  {item.label}
                </Link>
              );
            })}
            <div className="pt-3 border-t border-white/10 space-y-2">
              {user ? (
                <Link
                  to={isAdmin ? '/admin' : '/app'}
                  className="flex items-center justify-center gap-2 bg-blue-600 text-white font-bold text-sm px-5 py-3 rounded-lg"
                >
                  Dashboard
                  <ArrowRight className="w-4 h-4" />
                </Link>
              ) : (
                <>
                  <Link to="/signin" className="block text-center text-sm font-semibold text-navy-200 px-4 py-3 rounded-lg border border-white/15">
                    Sign In
                  </Link>
                  <Link to="/start" className="flex items-center justify-center gap-2 bg-blue-600 text-white font-bold text-sm px-5 py-3 rounded-lg">
                    Get Started
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </>
              )}
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}

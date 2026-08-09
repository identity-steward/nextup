import { Menu, X, LayoutDashboard } from 'lucide-react';
import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { session, isAdmin, signOut } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const close = () => setIsMenuOpen(false);
  const currentPath = location.pathname;

  const dashboardPath = isAdmin ? '/admin' : '/dashboard';
  const dashboardLabel = isAdmin ? 'Admin' : 'My Dashboard';

  const navItems = [
    { path: '/how-it-works', label: 'How It Works' },
    { path: '/youth', label: 'Youth' },
    { path: '/partners', label: 'Partners' },
    { path: '/about', label: 'About' },
    { path: '/start', label: 'Start My NextUp' },
  ];

  const isActive = (path: string) => {
    if (path === '/youth') return currentPath === '/youth' || currentPath.startsWith('/athletes');
    if (path === '/partners') return currentPath === '/partners' || currentPath === '/sponsors' || currentPath === '/support';
    return currentPath.startsWith(path);
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-md border-b border-gray-200 shadow-sm">
      <nav className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          <Link
            to="/"
            className="flex items-center gap-2 hover:opacity-80 transition-opacity"
          >
            <img src="/NextUp_Network_logo_design.png" alt="NextUp Network Logo" className="h-10 w-auto" />
          </Link>

          <div className="hidden lg:flex items-center gap-8">
            {navItems.map(item => (
              <Link
                key={item.path}
                to={item.path}
                className={`font-medium transition-colors duration-200 flex items-center gap-1.5 ${
                  isActive(item.path)
                    ? 'text-gold font-semibold'
                    : 'text-gray-700 hover:text-gold'
                }`}
              >
                {item.label}
              </Link>
            ))}
          </div>

          <div className="hidden lg:flex items-center gap-4">
            {session ? (
              <>
                <Link
                  to={dashboardPath}
                  className="inline-flex items-center gap-1.5 text-navy hover:text-gold font-medium transition-colors duration-200"
                >
                  <LayoutDashboard className="w-4 h-4" />
                  {dashboardLabel}
                </Link>
                <button
                  onClick={async () => { await signOut(); navigate('/'); }}
                  className="text-gray-500 hover:text-navy font-medium transition-colors duration-200 text-sm"
                >
                  Sign Out
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/signin"
                  className="text-navy hover:text-gold font-medium transition-colors duration-200"
                >
                  Sign In
                </Link>
                <Link to="/start" className="btn-primary">
                  Start My NextUp
                </Link>
              </>
            )}
          </div>

          <button
            className="lg:hidden"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? (
              <X className="w-6 h-6 text-navy" />
            ) : (
              <Menu className="w-6 h-6 text-navy" />
            )}
          </button>
        </div>

        {isMenuOpen && (
          <div className="lg:hidden py-6 border-t border-gray-200">
            <div className="flex flex-col gap-4">
              {navItems.map(item => (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={close}
                  className={`font-medium transition-colors duration-200 py-2 text-left flex items-center gap-1.5 ${
                    isActive(item.path)
                      ? 'text-gold font-semibold'
                      : 'text-gray-700 hover:text-gold'
                  }`}
                >
                  {item.label}
                </Link>
              ))}
              <div className="pt-4 border-t border-gray-200 flex flex-col gap-3">
                {session ? (
                  <>
                    <Link
                      to={dashboardPath}
                      onClick={close}
                      className="inline-flex items-center gap-1.5 text-navy hover:text-gold font-medium transition-colors duration-200 text-left py-2"
                    >
                      <LayoutDashboard className="w-4 h-4" />
                      {dashboardLabel}
                    </Link>
                    <button
                      onClick={async () => { await signOut(); navigate('/'); close(); }}
                      className="text-gray-500 hover:text-navy font-medium text-left py-2"
                    >
                      Sign Out
                    </button>
                  </>
                ) : (
                  <>
                    <Link
                      to="/signin"
                      onClick={close}
                      className="text-navy hover:text-gold font-medium transition-colors duration-200 text-left py-2"
                    >
                      Sign In
                    </Link>
                    <Link to="/start" onClick={close} className="btn-primary">
                      Start My NextUp
                    </Link>
                  </>
                )}
              </div>
            </div>
          </div>
        )}
      </nav>
    </header>
  );
}

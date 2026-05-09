import { Menu, X, LayoutDashboard } from 'lucide-react';
import { useState } from 'react';
import { useAuth } from '../context/AuthContext';

interface HeaderProps {
  onNavigate?: (page: string) => void;
  currentPage?: string;
}

export default function Header({ onNavigate, currentPage = 'home' }: HeaderProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { session, isAdmin, signOut } = useAuth();

  const handleNavigation = (page: string) => {
    if (onNavigate) {
      onNavigate(page);
      setIsMenuOpen(false);
    }
  };

  const dashboardPage = isAdmin ? 'admin-dashboard' : 'athlete-dashboard';
  const dashboardLabel = isAdmin ? 'Admin' : 'My Dashboard';

  const navItems = [
    { id: 'home', label: 'Home' },
    { id: 'athletes', label: 'Athletes' },
    { id: 'creators', label: 'Creators' },
    { id: 'create', label: 'Create Athlete Page' },
    { id: 'sponsors', label: 'Sponsors' },
    { id: 'about', label: 'About' },
    { id: 'schools', label: 'For Schools' },
  ];

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-md border-b border-gray-200 shadow-sm">
      <nav className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          <button
            onClick={() => handleNavigation('home')}
            className="flex items-center gap-2 hover:opacity-80 transition-opacity"
          >
            <img src="/NextUp_Network_logo_design.png" alt="NextUp Network Logo" className="h-10 w-auto" />
          </button>

          <div className="hidden lg:flex items-center gap-8">
            {navItems.map(item => (
              <button
                key={item.id}
                onClick={() => handleNavigation(item.id)}
                className={`font-medium transition-colors duration-200 ${
                  currentPage === item.id
                    ? 'text-gold font-semibold'
                    : 'text-gray-700 hover:text-gold'
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>

          <div className="hidden lg:flex items-center gap-4">
            {session ? (
              <>
                <button
                  onClick={() => handleNavigation(dashboardPage)}
                  className="inline-flex items-center gap-1.5 text-navy hover:text-gold font-medium transition-colors duration-200"
                >
                  <LayoutDashboard className="w-4 h-4" />
                  {dashboardLabel}
                </button>
                <button
                  onClick={async () => { await signOut(); handleNavigation('home'); }}
                  className="text-gray-500 hover:text-navy font-medium transition-colors duration-200 text-sm"
                >
                  Sign Out
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={() => handleNavigation('signin')}
                  className="text-navy hover:text-gold font-medium transition-colors duration-200"
                >
                  Sign In
                </button>
                <button
                  onClick={() => handleNavigation('athletes')}
                  className="btn-primary"
                >
                  Get Started
                </button>
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
                <button
                  key={item.id}
                  onClick={() => handleNavigation(item.id)}
                  className={`font-medium transition-colors duration-200 py-2 text-left ${
                    currentPage === item.id
                      ? 'text-gold font-semibold'
                      : 'text-gray-700 hover:text-gold'
                  }`}
                >
                  {item.label}
                </button>
              ))}
              <div className="pt-4 border-t border-gray-200 flex flex-col gap-3">
                {session ? (
                  <>
                    <button
                      onClick={() => handleNavigation(dashboardPage)}
                      className="inline-flex items-center gap-1.5 text-navy hover:text-gold font-medium transition-colors duration-200 text-left py-2"
                    >
                      <LayoutDashboard className="w-4 h-4" />
                      {dashboardLabel}
                    </button>
                    <button
                      onClick={async () => { await signOut(); handleNavigation('home'); }}
                      className="text-gray-500 hover:text-navy font-medium text-left py-2"
                    >
                      Sign Out
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      onClick={() => handleNavigation('signin')}
                      className="text-navy hover:text-gold font-medium transition-colors duration-200 text-left py-2"
                    >
                      Sign In
                    </button>
                    <button
                      onClick={() => handleNavigation('athletes')}
                      className="btn-primary"
                    >
                      Get Started
                    </button>
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

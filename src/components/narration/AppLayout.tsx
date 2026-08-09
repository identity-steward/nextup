import { ReactNode } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Home, MessageCircle, Compass, Share2, CheckCircle, Shield, LogOut, Menu } from 'lucide-react';
import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';

interface AppLayoutProps {
  children: ReactNode;
  title?: string;
}

export default function AppLayout({ children, title }: AppLayoutProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const { signOut } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const navItems = [
    { path: '/app', label: 'My NextUp', icon: Home },
    { path: '/app/story', label: 'Tell Your Story', icon: MessageCircle },
    { path: '/app/pathways', label: 'Pathways', icon: Compass },
    { path: '/app/share', label: 'Share', icon: Share2 },
    { path: '/app/outcome', label: 'What Happened', icon: CheckCircle },
    { path: '/app/privacy', label: 'Privacy', icon: Shield },
  ];

  const isActive = (path: string) => location.pathname === path;

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Top bar */}
      <header className="bg-navy text-white sticky top-0 z-30">
        <div className="max-w-5xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link to="/app" className="flex items-center gap-2">
            <img src="/NextUp_Network_logo_design.png" alt="NextUp" className="h-8 w-auto" />
            <span className="font-bold text-sm hidden sm:inline">My NextUp</span>
          </Link>
          <div className="flex items-center gap-4">
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="lg:hidden"
            >
              <Menu className="w-6 h-6" />
            </button>
            <button
              onClick={async () => { await signOut(); navigate('/'); }}
              className="text-gray-300 hover:text-gold transition-colors text-sm flex items-center gap-1.5"
            >
              <LogOut className="w-4 h-4" />
              <span className="hidden sm:inline">Sign Out</span>
            </button>
          </div>
        </div>
      </header>

      {/* Desktop sidebar */}
      <div className="flex-1 max-w-5xl mx-auto w-full flex">
        <aside className="hidden lg:block w-56 flex-shrink-0 border-r border-gray-200 p-4">
          <nav className="space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                    isActive(item.path)
                      ? 'bg-gold/15 text-navy'
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </aside>

        {/* Mobile menu */}
        {menuOpen && (
          <div className="lg:hidden fixed inset-0 z-40 bg-black/30" onClick={() => setMenuOpen(false)}>
            <div className="absolute top-0 left-0 w-64 h-full bg-white shadow-xl p-4" onClick={(e) => e.stopPropagation()}>
              <nav className="space-y-1">
                {navItems.map((item) => {
                  const Icon = item.icon;
                  return (
                    <Link
                      key={item.path}
                      to={item.path}
                      onClick={() => setMenuOpen(false)}
                      className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                        isActive(item.path)
                          ? 'bg-gold/15 text-navy'
                          : 'text-gray-600 hover:bg-gray-100'
                      }`}
                    >
                      <Icon className="w-5 h-5" />
                      {item.label}
                    </Link>
                  );
                })}
              </nav>
            </div>
          </div>
        )}

        {/* Main content */}
        <main className="flex-1 p-4 lg:p-8 min-w-0">
          {title && <h1 className="text-2xl font-bold text-navy mb-6">{title}</h1>}
          {children}
        </main>
      </div>

      {/* Mobile bottom nav */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 flex z-30">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <Link
              key={item.path}
              to={item.path}
              className={`flex-1 flex flex-col items-center gap-1 py-3 text-xs font-medium transition-colors ${
                isActive(item.path) ? 'text-gold' : 'text-gray-500'
              }`}
            >
              <Icon className="w-5 h-5" />
              {item.label}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}

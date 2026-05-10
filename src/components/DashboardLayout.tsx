import React, { useState } from 'react';
import { Menu, X, Home, Users, Video, School, CreditCard, Heart, Settings, LogOut, Zap, CreditCard as Edit3, Camera, Tag } from 'lucide-react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

interface DashboardLayoutProps {
  children: React.ReactNode;
  title?: string;
}

const navigation = [
  { name: 'Dashboard', icon: Home, path: '/admin' },
  { name: 'Athletes', icon: Tag, path: '/admin/live-athletes' },
  { name: 'Athlete Signups', icon: Users, path: '/admin/athletes' },
  { name: 'Parent Intake', icon: Heart, path: '/admin/intake' },
  { name: 'Profile Updates', icon: Edit3, path: '/admin/profile-updates' },
  { name: 'Media Review', icon: Camera, path: '/admin/media' },
  { name: 'Creator Applications', icon: Video, path: '/admin/creators' },
  { name: 'Team Inquiries', icon: School, path: '/admin/teams' },
  { name: 'Media Pass Requests', icon: CreditCard, path: '/admin/media-passes' },
  { name: 'Supporter Signups', icon: Heart, path: '/admin/supporters' },
  { name: 'Agent Ops', icon: Zap, path: '/admin/agent-ops' },
];

export function DashboardLayout({ children, title }: DashboardLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <div className="min-h-screen bg-gray-50">
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <aside className={`
        fixed top-0 left-0 z-50 h-full w-64 bg-[#1a1f3a] text-white transform transition-transform duration-300 ease-in-out
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
        lg:translate-x-0
      `}>
        <div className="flex flex-col h-full">
          <div className="flex items-center justify-between p-6 border-b border-gray-700">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-gradient-to-r from-[#c5a572] to-[#d4af37] rounded-lg flex items-center justify-center">
                <span className="text-[#1a1f3a] font-bold text-lg">N</span>
              </div>
              <span className="text-xl font-bold">NextUp Admin</span>
            </div>
            <button
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden text-gray-400 hover:text-white"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
            {navigation.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.name}
                  to={item.path}
                  onClick={() => setSidebarOpen(false)}
                  className={`
                    w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors text-left
                    ${isActive
                      ? 'bg-gradient-to-r from-[#c5a572] to-[#d4af37] text-[#1a1f3a] font-semibold'
                      : 'text-gray-300 hover:bg-gray-800 hover:text-white'
                    }
                  `}
                >
                  <Icon className="w-5 h-5" />
                  <span>{item.name}</span>
                </Link>
              );
            })}
          </nav>

          <div className="p-4 border-t border-gray-700 space-y-1">
            <Link
              to="/"
              className="w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-gray-300 hover:bg-gray-800 hover:text-white transition-colors"
            >
              <Settings className="w-5 h-5" />
              <span>Back to Site</span>
            </Link>
            <button
              onClick={async () => { await signOut(); navigate('/'); }}
              className="w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-gray-300 hover:bg-gray-800 hover:text-white transition-colors"
            >
              <LogOut className="w-5 h-5" />
              <span>Sign Out</span>
            </button>
          </div>
        </div>
      </aside>

      <div className="lg:pl-64">
        <header className="sticky top-0 z-30 bg-white border-b border-gray-200 shadow-sm">
          <div className="flex items-center justify-between px-4 py-4 lg:px-8">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setSidebarOpen(true)}
                className="lg:hidden text-gray-600 hover:text-gray-900"
              >
                <Menu className="w-6 h-6" />
              </button>
              <h1 className="text-2xl font-bold text-[#1a1f3a]">{title || 'Dashboard'}</h1>
            </div>

            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-3 pl-4 border-l border-gray-200">
                <div className="w-10 h-10 bg-gradient-to-r from-[#c5a572] to-[#d4af37] rounded-full flex items-center justify-center">
                  <span className="text-white font-semibold text-sm">
                    {user?.email?.[0]?.toUpperCase() ?? 'A'}
                  </span>
                </div>
                <div className="hidden md:block">
                  <p className="text-sm font-semibold text-gray-900">Admin</p>
                  <p className="text-xs text-gray-500 truncate max-w-[160px]">{user?.email}</p>
                </div>
              </div>
            </div>
          </div>
        </header>

        <main className="p-4 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}

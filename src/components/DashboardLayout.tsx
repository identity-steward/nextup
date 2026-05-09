import React, { useState } from 'react';
import { Menu, X, Home, Users, Video, School, CreditCard, Heart, Bell, Settings, LogOut, Zap, CreditCard as Edit3, Camera } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface DashboardLayoutProps {
  children: React.ReactNode;
  title?: string;
  currentPage?: string;
  onNavigate?: (page: string) => void;
}

export function DashboardLayout({ children, title, currentPage, onNavigate }: DashboardLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user, signOut } = useAuth();

  const pageTitle = title || currentPage || 'Dashboard';

  const navigation = [
    { name: 'Dashboard', icon: Home, page: 'admin-dashboard' },
    { name: 'Athlete Signups', icon: Users, page: 'admin-athletes' },
    { name: 'Parent Intake', icon: Heart, page: 'admin-parent-intake' },
    { name: 'Profile Updates', icon: Edit3, page: 'admin-profile-updates' },
    { name: 'Media Review', icon: Camera, page: 'admin-media' },
    { name: 'Creator Applications', icon: Video, page: 'admin-creators' },
    { name: 'Team Inquiries', icon: School, page: 'admin-teams' },
    { name: 'Media Pass Requests', icon: CreditCard, page: 'admin-media-passes' },
    { name: 'Supporter Signups', icon: Heart, page: 'admin-supporters' },
    { name: 'Agent Ops', icon: Zap, page: 'admin-agent-ops' },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile sidebar backdrop */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed top-0 left-0 z-50 h-full w-64 bg-[#1a1f3a] text-white transform transition-transform duration-300 ease-in-out
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
        lg:translate-x-0
      `}>
        <div className="flex flex-col h-full">
          {/* Logo */}
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

          {/* Navigation */}
          <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
            {navigation.map((item) => {
              const Icon = item.icon;
              const isActive = pageTitle === item.name;
              return (
                <button
                  key={item.name}
                  onClick={() => { onNavigate?.(item.page); setSidebarOpen(false); }}
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
                </button>
              );
            })}
          </nav>

          {/* Bottom section */}
          <div className="p-4 border-t border-gray-700 space-y-1">
            <button
              onClick={() => { onNavigate?.('home'); }}
              className="w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-gray-300 hover:bg-gray-800 hover:text-white transition-colors"
            >
              <Settings className="w-5 h-5" />
              <span>Back to Site</span>
            </button>
            <button
              onClick={async () => { await signOut(); onNavigate?.('home'); }}
              className="w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-gray-300 hover:bg-gray-800 hover:text-white transition-colors"
            >
              <LogOut className="w-5 h-5" />
              <span>Sign Out</span>
            </button>
          </div>
        </div>
      </aside>

      {/* Main content area */}
      <div className="lg:pl-64">
        {/* Top bar */}
        <header className="sticky top-0 z-30 bg-white border-b border-gray-200 shadow-sm">
          <div className="flex items-center justify-between px-4 py-4 lg:px-8">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setSidebarOpen(true)}
                className="lg:hidden text-gray-600 hover:text-gray-900"
              >
                <Menu className="w-6 h-6" />
              </button>
              <h1 className="text-2xl font-bold text-[#1a1f3a]">{pageTitle}</h1>
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

        {/* Main content */}
        <main className="p-4 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}

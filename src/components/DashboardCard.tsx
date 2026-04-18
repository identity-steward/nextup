import React from 'react';

interface DashboardCardProps {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  action?: {
    label: string;
    onClick: () => void;
  };
  className?: string;
}

export function DashboardCard({ title, subtitle, children, action, className = '' }: DashboardCardProps) {
  return (
    <div className={`bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden ${className}`}>
      <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
          {subtitle && <p className="text-sm text-gray-500 mt-1">{subtitle}</p>}
        </div>
        {action && (
          <button
            onClick={action.onClick}
            className="px-4 py-2 text-sm font-medium text-[#1a1f3a] hover:text-[#c5a572] transition-colors"
          >
            {action.label}
          </button>
        )}
      </div>
      <div className="p-6">
        {children}
      </div>
    </div>
  );
}

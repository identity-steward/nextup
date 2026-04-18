import React from 'react';
import { Video as LucideIcon } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  change?: {
    value: string;
    positive: boolean;
  };
  color?: 'blue' | 'green' | 'purple' | 'gold' | 'red' | 'orange';
}

const colorClasses = {
  blue: {
    bg: 'bg-blue-50',
    icon: 'bg-blue-500',
    text: 'text-blue-600',
  },
  green: {
    bg: 'bg-green-50',
    icon: 'bg-green-500',
    text: 'text-green-600',
  },
  purple: {
    bg: 'bg-purple-50',
    icon: 'bg-purple-500',
    text: 'text-purple-600',
  },
  gold: {
    bg: 'bg-yellow-50',
    icon: 'bg-gradient-to-r from-[#c5a572] to-[#d4af37]',
    text: 'text-[#c5a572]',
  },
  red: {
    bg: 'bg-red-50',
    icon: 'bg-red-500',
    text: 'text-red-600',
  },
  orange: {
    bg: 'bg-orange-50',
    icon: 'bg-orange-500',
    text: 'text-orange-600',
  },
};

export function StatCard({ title, value, icon: Icon, change, color = 'blue' }: StatCardProps) {
  const colors = colorClasses[color];

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-600 mb-1">{title}</p>
          <p className="text-3xl font-bold text-gray-900">{value}</p>
          {change && (
            <p className={`text-sm mt-2 flex items-center ${change.positive ? 'text-green-600' : 'text-red-600'}`}>
              <span className="font-semibold">{change.positive ? '+' : ''}{change.value}</span>
              <span className="ml-1 text-gray-500">vs last month</span>
            </p>
          )}
        </div>
        <div className={`${colors.icon} w-14 h-14 rounded-lg flex items-center justify-center`}>
          <Icon className="w-7 h-7 text-white" />
        </div>
      </div>
    </div>
  );
}

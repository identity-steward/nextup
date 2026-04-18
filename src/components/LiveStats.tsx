import { Users, DollarSign, Award, Eye, TrendingUp } from 'lucide-react';
import type { Athlete } from '../types/athlete';

interface LiveStatsProps {
  athlete: Athlete;
}

export default function LiveStats({ athlete }: LiveStatsProps) {
  const stats = [
    {
      icon: Users,
      value: athlete.supporters_count.toString(),
      label: 'Supporters Active',
      color: 'from-blue-500 to-blue-600',
      bgColor: 'bg-blue-50',
      iconColor: 'text-blue-600',
    },
    {
      icon: DollarSign,
      value: `$${athlete.monthly_funding}`,
      label: 'Monthly Funding',
      color: 'from-green-500 to-green-600',
      bgColor: 'bg-green-50',
      iconColor: 'text-green-600',
    },
    {
      icon: Award,
      value: '2',
      label: 'Athletes Onboarded',
      color: 'from-gold to-gold-dark',
      bgColor: 'bg-gold/10',
      iconColor: 'text-gold',
    },
    {
      icon: Eye,
      value: athlete.views_count.toLocaleString(),
      label: 'Highlight Views',
      color: 'from-purple-500 to-purple-600',
      bgColor: 'bg-purple-50',
      iconColor: 'text-purple-600',
    },
  ];

  return (
    <section className="py-20 bg-gray-50">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 bg-gold/20 text-gold-dark px-4 py-2 rounded-full text-sm font-semibold mb-6 border border-gold/30">
            <TrendingUp className="w-4 h-4" />
            Real-Time Impact
          </div>
          <h2 className="text-4xl md:text-5xl font-bold text-navy mb-4">
            NextUp Memphis Live Impact Stats
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Watch the community grow and see the direct impact of youth athlete support.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat, index) => (
            <div
              key={index}
              className="bg-white rounded-2xl p-8 shadow-lg border-2 border-gray-200 hover:border-gold/30 transition-all duration-300 hover:shadow-xl text-center"
            >
              <div className={`w-16 h-16 ${stat.bgColor} rounded-2xl flex items-center justify-center mx-auto mb-4`}>
                <stat.icon className={`w-8 h-8 ${stat.iconColor}`} />
              </div>
              <div className="text-4xl font-bold text-navy mb-2">{stat.value}</div>
              <div className="text-sm font-medium text-gray-600">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

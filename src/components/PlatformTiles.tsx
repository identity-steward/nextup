import { UserPlus, Users, Handshake, ArrowRight } from 'lucide-react';

interface PlatformTilesProps {
  onNavigate?: (page: string) => void;
}

export default function PlatformTiles({ onNavigate }: PlatformTilesProps) {
  const tiles = [
    {
      icon: UserPlus,
      title: 'For Parents',
      description: 'Create a support page for your athlete in minutes',
      cta: 'Create Athlete Page',
      page: 'create',
      gradient: 'from-blue-500 to-blue-600',
    },
    {
      icon: Users,
      title: 'Meet the Athletes',
      description: 'Browse profiles and support Memphis youth athletes',
      cta: 'View Profiles',
      page: 'athletes',
      gradient: 'from-gold to-gold-dark',
    },
    {
      icon: Handshake,
      title: 'Sponsors',
      description: 'Partner with NextUp to support youth sports',
      cta: 'Support Youth Sports',
      page: 'sponsors',
      gradient: 'from-navy to-navy-light',
    },
  ];

  return (
    <section className="py-20 bg-gray-50">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="grid md:grid-cols-3 gap-8">
          {tiles.map((tile, index) => (
            <div
              key={index}
              className="group bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden"
            >
              <div className={`bg-gradient-to-r ${tile.gradient} p-8 text-white`}>
                <tile.icon className="w-12 h-12 mb-4" />
                <h3 className="text-2xl font-bold mb-2">{tile.title}</h3>
              </div>
              <div className="p-8">
                <p className="text-gray-600 mb-6 leading-relaxed">
                  {tile.description}
                </p>
                <button
                  onClick={() => onNavigate?.(tile.page)}
                  className="flex items-center gap-2 text-navy font-semibold hover:text-gold transition-colors group"
                >
                  {tile.cta}
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

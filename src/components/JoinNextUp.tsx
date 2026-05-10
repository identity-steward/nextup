import { UserPlus, Video, Handshake, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

const paths = [
  { icon: UserPlus, title: 'Athlete', description: 'Create Profile', to: '/signup' },
  { icon: Video, title: 'Creator', description: 'Join Media Team', to: '/creator' },
  { icon: Handshake, title: 'Partner', description: 'Connect Program', to: '/sponsors' },
];

export default function JoinNextUp() {
  return (
    <section className="py-24 bg-gradient-to-br from-navy via-navy-light to-navy">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
            Choose Your Role in the Network
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {paths.map((path, index) => {
            const Icon = path.icon;
            return (
              <div
                key={index}
                className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 hover:bg-white/20 transition-all duration-300 border-2 border-white/10 hover:border-gold/50 flex flex-col items-center text-center"
              >
                <div className="w-20 h-20 bg-gold/20 rounded-2xl flex items-center justify-center mb-6">
                  <Icon className="w-10 h-10 text-gold" />
                </div>
                <h3 className="text-2xl font-bold text-white mb-2">{path.title}</h3>
                <p className="text-gray-300 mb-6">{path.description}</p>
                <Link
                  to={path.to}
                  className="btn-primary px-6 py-3 flex items-center gap-2"
                >
                  Get Started
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

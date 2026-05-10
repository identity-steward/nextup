import { useState, useEffect } from 'react';
import { Camera, Instagram, ArrowRight, Briefcase } from 'lucide-react';
import { Link } from 'react-router-dom';
import { CreatorService } from '../services/creatorService';
import type { Creator } from '../types/creator';

export default function CreatorsPage() {
  const [creators, setCreators] = useState<Creator[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    CreatorService.getAllCreators().then(data => {
      setCreators(data);
      setLoading(false);
    });
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 pt-20">
      <section className="bg-navy text-white py-16">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="flex items-center gap-2 mb-4">
            <Camera className="w-8 h-8 text-gold" />
            <h1 className="text-4xl md:text-5xl font-bold">Meet the NextUp Creators</h1>
          </div>
          <p className="text-xl text-gray-300 max-w-3xl mb-8">
            These digital creators capture the moments, highlights, and stories that power our athletes' journeys.
          </p>
          <Link to="/contact" className="btn-primary inline-flex items-center gap-2">
            Become a Featured Creator
            <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </section>

      <section className="py-16">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          {loading ? (
            <div className="text-center py-20 text-navy text-xl">Loading creators...</div>
          ) : creators.length === 0 ? (
            <div className="text-center py-20">
              <p className="text-gray-600 text-xl">No creators found. Check back soon!</p>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {creators.map((creator) => (
                <div
                  key={creator.id}
                  className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-2xl transition-all duration-300 group"
                >
                  <div className="aspect-square overflow-hidden bg-gray-200">
                    <img
                      src={creator.image_url || 'https://images.pexels.com/photos/1262302/pexels-photo-1262302.jpeg?auto=compress&cs=tinysrgb&w=800'}
                      alt={creator.display_name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                  <div className="p-6">
                    <div className="flex items-center gap-2 text-gray-600 text-sm mb-2">
                      <Briefcase className="w-4 h-4" />
                      <span>{creator.location}</span>
                    </div>
                    <h3 className="text-2xl font-bold text-navy mb-1">{creator.display_name}</h3>
                    <p className="text-gray-600 mb-2">{creator.tagline}</p>
                    <p className="text-gold font-semibold text-sm mb-4">{creator.specialties}</p>
                    {creator.instagram_handle && (
                      <div className="flex items-center gap-2 text-gray-500 text-sm mb-4">
                        <Instagram className="w-4 h-4" />
                        <span>{creator.instagram_handle}</span>
                      </div>
                    )}
                    <Link
                      to={`/creators/${creator.slug}`}
                      className="btn-primary w-full flex items-center justify-center gap-2"
                    >
                      View Profile
                      <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      <section className="py-12 bg-white">
        <div className="max-w-4xl mx-auto px-6 lg:px-8">
          <div className="bg-gradient-to-br from-gold/10 to-gold/20 rounded-2xl p-8 border border-gold/30">
            <h3 className="text-2xl font-bold text-navy mb-4">What Creators Get</h3>
            <p className="text-gray-700 text-lg leading-relaxed mb-6">
              Creators get exposure to families and schools, inbound highlight work, and opportunities
              to collaborate with sponsors and teams through NextUp Memphis.
            </p>
            <Link to="/contact" className="btn-primary inline-flex items-center gap-2">
              Apply to Be a Creator
              <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
        </div>
      </section>

      <section className="py-8 bg-gray-50">
        <div className="max-w-4xl mx-auto px-6 lg:px-8">
          <p className="text-sm text-gray-600 text-center leading-relaxed">
            NextUp Memphis showcases independent creators. All bookings and payments are handled
            directly between families and creators unless otherwise arranged through official sponsorships.
          </p>
        </div>
      </section>
    </div>
  );
}

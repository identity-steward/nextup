import { Camera, ArrowRight, Instagram } from 'lucide-react';
import { Link } from 'react-router-dom';
import type { Creator } from '../types/creator';

interface FeaturedCreatorProps {
  creator: Creator;
}

export default function FeaturedCreator({ creator }: FeaturedCreatorProps) {
  return (
    <section className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 bg-gold/20 text-gold-dark px-4 py-2 rounded-full text-sm font-semibold mb-6 border border-gold/30">
            <Camera className="w-4 h-4" />
            Featured Creator
          </div>
          <h2 className="text-4xl md:text-5xl font-bold text-navy mb-4">
            Featured Creator: {creator.display_name}
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Partnering with NextUp Memphis to capture real moments for our athletes and families.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-12 items-center max-w-5xl mx-auto">
          <div className="relative">
            <div className="aspect-square rounded-2xl overflow-hidden shadow-2xl border-4 border-gold/30">
              <img
                src={creator.image_url || 'https://images.pexels.com/photos/1262302/pexels-photo-1262302.jpeg?auto=compress&cs=tinysrgb&w=800'}
                alt={creator.display_name}
                className="w-full h-full object-cover"
              />
            </div>
          </div>

          <div>
            <h3 className="text-3xl font-bold text-navy mb-3">{creator.display_name}</h3>
            <p className="text-lg text-gray-600 mb-4">{creator.tagline}</p>
            <p className="text-gray-700 leading-relaxed mb-6">{creator.bio}</p>

            <div className="flex flex-wrap gap-3 mb-6">
              {creator.service_game_highlights && (
                <span className="px-3 py-1 bg-gold/20 text-gold-dark rounded-full text-sm font-semibold border border-gold/30">
                  Game Highlights
                </span>
              )}
              {creator.service_season_package && (
                <span className="px-3 py-1 bg-navy/10 text-navy rounded-full text-sm font-semibold border border-navy/20">
                  Season Packages
                </span>
              )}
              {creator.service_custom_story && (
                <span className="px-3 py-1 bg-gold/20 text-gold-dark rounded-full text-sm font-semibold border border-gold/30">
                  Custom Stories
                </span>
              )}
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
              <Link
                to={`/creators/${creator.slug}`}
                className="btn-primary flex items-center gap-2 justify-center"
              >
                View Full Profile
                <ArrowRight className="w-5 h-5" />
              </Link>
              <Link
                to="/creators"
                className="btn-secondary flex items-center gap-2 justify-center"
              >
                Meet All Creators
                <Camera className="w-5 h-5" />
              </Link>
            </div>

            {creator.instagram_handle && (
              <div className="mt-6 flex items-center gap-2 text-gray-600">
                <Instagram className="w-5 h-5 text-gold" />
                <a
                  href={`https://instagram.com/${creator.instagram_handle.replace('@', '')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-gold transition-colors"
                >
                  {creator.instagram_handle}
                </a>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

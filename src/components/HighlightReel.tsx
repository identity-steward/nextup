import { Play, Eye, Users, UserPlus } from 'lucide-react';
import type { Athlete } from '../types/athlete';

interface HighlightReelProps {
  athlete: Athlete;
}

export default function HighlightReel({ athlete }: HighlightReelProps) {
  return (
    <section className="py-20 bg-navy text-white">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            Watch {athlete.first_name} in Action
          </h2>
          <p className="text-xl text-gray-300 max-w-2xl mx-auto">
            A collection of real moments — effort, discipline, and the plays that don't show up on the stat sheet. Every view helps grow his circle of supporters.
          </p>
        </div>

        <div className="max-w-4xl mx-auto">
          <div className="aspect-video bg-navy-light rounded-2xl overflow-hidden shadow-2xl border-4 border-gold/20 relative group">
            <div className="absolute inset-0 flex items-center justify-center bg-black/40">
              <button className="w-20 h-20 bg-gold hover:bg-gold-light rounded-full flex items-center justify-center transition-all duration-200 transform group-hover:scale-110 shadow-xl">
                <Play className="w-10 h-10 text-navy ml-1" fill="currentColor" />
              </button>
            </div>
            <img
              src={athlete.image_url || 'https://images.pexels.com/photos/2834914/pexels-photo-2834914.jpeg?auto=compress&cs=tinysrgb&w=1200'}
              alt={`${athlete.first_name} Highlights`}
              className="w-full h-full object-cover"
            />
          </div>

          <div className="grid grid-cols-3 gap-6 mt-8">
            <div className="bg-navy-light rounded-xl p-6 text-center border border-gold/20">
              <div className="flex items-center justify-center gap-2 mb-2">
                <Eye className="w-5 h-5 text-gold" />
                <span className="text-3xl font-bold text-white">{athlete.views_count.toLocaleString()}</span>
              </div>
              <p className="text-sm text-gray-400 font-medium">Views</p>
            </div>

            <div className="bg-navy-light rounded-xl p-6 text-center border border-gold/20">
              <div className="flex items-center justify-center gap-2 mb-2">
                <Users className="w-5 h-5 text-gold" />
                <span className="text-3xl font-bold text-white">{athlete.supporters_count}</span>
              </div>
              <p className="text-sm text-gray-400 font-medium">Supporters</p>
            </div>

            <div className="bg-navy-light rounded-xl p-6 text-center border border-gold/20">
              <div className="flex items-center justify-center gap-2 mb-2">
                <UserPlus className="w-5 h-5 text-gold" />
                <span className="text-3xl font-bold text-white">{athlete.followers_count}</span>
              </div>
              <p className="text-sm text-gray-400 font-medium">Followers</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

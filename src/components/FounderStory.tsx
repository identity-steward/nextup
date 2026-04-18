import { Heart } from 'lucide-react';

export default function FounderStory() {
  return (
    <section className="py-24 bg-gray-50">
      <div className="max-w-4xl mx-auto px-6 lg:px-8">
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 bg-gold/20 text-gold-dark px-4 py-2 rounded-full text-sm font-semibold mb-6 border border-gold/30">
            <Heart className="w-4 h-4" />
            Our Story
          </div>
          <h2 className="text-4xl md:text-5xl font-bold text-navy mb-6">
            Why NextUp Started
          </h2>
        </div>

        <div className="bg-white rounded-3xl shadow-lg p-8 md:p-12 border-2 border-gray-100">
          <p className="text-xl text-gray-700 leading-relaxed mb-6">
            Too many young athletes are putting in real work but their journey is never captured.
          </p>
          <p className="text-xl text-gray-700 leading-relaxed">
            NextUpMemphis was created to document that journey early — through highlights, profiles, and storytelling — so every athlete has a record of their growth.
          </p>
        </div>
      </div>
    </section>
  );
}

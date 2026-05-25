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
            Why NextUp Exists
          </h2>
        </div>

        <div className="bg-white rounded-3xl shadow-lg p-8 md:p-12 border-2 border-gray-100">
          <p className="text-xl text-gray-700 leading-relaxed mb-6">
            Too many young athletes are putting in real work — developing character, leadership, and resilience — and none of it gets documented.
          </p>
          <p className="text-xl text-gray-700 leading-relaxed">
            NextUp Memphis was built to change that. Through developmental storytelling, creator documentation, and athlete-owned profiles, every player has a record of who they were becoming — not just what they scored.
          </p>
        </div>
      </div>
    </section>
  );
}

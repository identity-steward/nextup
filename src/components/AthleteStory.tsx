import { ArrowRight, Heart, User } from 'lucide-react';
import type { Athlete } from '../types/athlete';

interface AthleteStoryProps {
  athlete: Athlete;
}

export default function AthleteStory({ athlete }: AthleteStoryProps) {
  return (
    <section id="story" className="py-24 bg-gray-50 scroll-mt-20">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <div className="inline-flex items-center gap-2 bg-gold/20 text-gold-dark px-4 py-2 rounded-full text-sm font-semibold mb-8 border border-gold/30">
            <User className="w-4 h-4" />
            Meet {athlete.first_name}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="relative">
              <div className="relative bg-gradient-to-br from-gold/10 via-white to-navy/5 p-8 rounded-3xl">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(242,193,78,0.15),transparent_50%),radial-gradient(circle_at_70%_80%,rgba(10,26,51,0.1),transparent_50%)] rounded-3xl"></div>

                <div className="relative aspect-[3/4] max-w-sm mx-auto rounded-2xl overflow-hidden shadow-2xl ring-4 ring-white/50">
                  <img
                    src={athlete.image_url || '/Untitled design.png'}
                    alt={`${athlete.first_name} - NextUp Memphis Athlete`}
                    className="w-full h-full object-contain bg-white"
                    style={{ imageRendering: 'crisp-edges' }}
                  />
                </div>
              </div>

              <div className="absolute -bottom-6 -right-6 bg-white rounded-2xl shadow-xl px-6 py-4 border-2 border-gold/30">
                <div className="flex items-center gap-3">
                  <Heart className="w-5 h-5 text-gold fill-gold" />
                  <div>
                    <div className="text-2xl font-bold text-navy">{athlete.supporters_count}</div>
                    <div className="text-sm text-gray-600">Supporters</div>
                  </div>
                </div>
              </div>
            </div>

            <div>
              <h2 className="text-4xl md:text-5xl font-bold text-navy mb-6 leading-tight">
                Meet {athlete.first_name}
              </h2>

              <div className="space-y-4 text-lg text-gray-700 leading-relaxed mb-8">
                <p>
                  {athlete.bio}
                </p>
              </div>

              <a
                href="#"
                className="inline-flex items-center gap-2 text-gold hover:text-gold-dark font-semibold text-lg group transition-colors"
              >
                See how your support helps
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </a>

              <div className="mt-10 grid grid-cols-3 gap-6">
                {athlete.gpa && (
                  <div className="bg-gradient-to-br from-gold/10 to-gold/20 rounded-2xl p-6 text-center border border-gold/30">
                    <div className="text-3xl font-bold text-navy mb-2">{athlete.gpa}</div>
                    <div className="text-sm text-gray-700 font-medium">GPA</div>
                  </div>
                )}
                <div className="bg-gradient-to-br from-navy/5 to-navy/10 rounded-2xl p-6 text-center border border-navy/20">
                  <div className="text-xl font-bold text-navy mb-2">{athlete.position}</div>
                  <div className="text-sm text-gray-700 font-medium">Position</div>
                </div>
                <div className="bg-gradient-to-br from-gold/10 to-gold/20 rounded-2xl p-6 text-center border border-gold/30">
                  <div className="text-3xl font-bold text-navy mb-2">{athlete.years_playing}</div>
                  <div className="text-sm text-gray-700 font-medium">Years Playing</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

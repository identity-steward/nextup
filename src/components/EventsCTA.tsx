import { Trophy, MapPin, Calendar, ArrowRight, Star } from 'lucide-react';

const upcomingEvents = [
  {
    sport: 'Basketball',
    name: 'Spring Showcase Tournament',
    location: 'Memphis, TN',
    date: 'Coming Soon',
  },
  {
    sport: 'Football',
    name: '7-on-7 Summer League',
    location: 'Memphis, TN',
    date: 'Coming Soon',
  },
  {
    sport: 'Track & Field',
    name: 'Regional Championships',
    location: 'Memphis, TN',
    date: 'Coming Soon',
  },
];

interface EventsCTAProps {
  onNavigate?: (page: string) => void;
}

export default function EventsCTA({ onNavigate }: EventsCTAProps) {
  return (
    <section className="py-24 bg-gray-50 border-t border-gray-100">
      <div className="max-w-6xl mx-auto px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-16 items-start">
          <div className="lg:sticky lg:top-24">
            <div className="inline-flex items-center gap-2 bg-navy/10 border border-navy/20 text-navy px-3 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest mb-6">
              <Trophy className="w-3.5 h-3.5" />
              Events
            </div>
            <h2 className="text-4xl md:text-5xl font-black text-navy leading-tight mb-6">
              From Tournaments<br />
              <span className="text-gold-dark">to Opportunity</span>
            </h2>
            <p className="text-gray-500 text-lg leading-relaxed mb-8">
              We capture athletes live at games and events, turning real moments into lasting opportunities. One game-changing play, one story told right — that's how careers begin.
            </p>
            <button
              onClick={() => onNavigate?.('join')}
              className="btn-primary px-8 py-4 text-base font-bold inline-flex items-center gap-2 group"
            >
              Get Featured
              <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
            </button>
          </div>

          <div>
            <div className="flex items-center justify-between mb-6">
              <p className="text-navy font-bold text-sm uppercase tracking-wider">Upcoming Events</p>
              <span className="text-xs text-gray-400 bg-gray-200 px-3 py-1 rounded-full">Schedule being finalized</span>
            </div>

            <div className="space-y-4">
              {upcomingEvents.map((event) => (
                <div
                  key={event.name}
                  className="bg-white border border-gray-200 rounded-2xl p-6 hover:border-gold/40 hover:shadow-md transition-all duration-200 group"
                >
                  <div className="flex items-start gap-4">
                    <div className="w-11 h-11 bg-navy/5 rounded-xl flex items-center justify-center shrink-0">
                      <Trophy className="w-5 h-5 text-navy" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs font-bold text-gold-dark uppercase tracking-wider">{event.sport}</span>
                      </div>
                      <p className="font-bold text-navy text-base leading-snug mb-2">{event.name}</p>
                      <div className="flex flex-wrap gap-3">
                        <span className="flex items-center gap-1 text-gray-400 text-xs">
                          <MapPin className="w-3.5 h-3.5" />
                          {event.location}
                        </span>
                        <span className="flex items-center gap-1 text-gray-400 text-xs">
                          <Calendar className="w-3.5 h-3.5" />
                          {event.date}
                        </span>
                      </div>
                    </div>
                    <div className="shrink-0">
                      <span className="inline-flex items-center gap-1 text-xs font-semibold text-gray-400 bg-gray-100 px-2.5 py-1 rounded-full">
                        <Star className="w-3 h-3" />
                        Spots open
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <p className="text-center text-gray-400 text-sm mt-6">
              Events added as they're confirmed. Register your athlete to be notified.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

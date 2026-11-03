import { CircleUser as UserCircle, Video, CreditCard, FileText, Award } from 'lucide-react';

const offerings = [
  { icon: UserCircle, label: 'Athlete Profiles', status: 'operational' as const },
  { icon: Video, label: 'Highlight Reels', status: 'operational' as const },
  { icon: CreditCard, label: 'Athlete Cards', status: 'planned' as const },
  { icon: FileText, label: 'Scouting Reports', status: 'planned' as const },
  { icon: Award, label: 'Athlete Passports', status: 'planned' as const },
];

export default function WhatWeOffer() {
  return (
    <section className="py-24 bg-white">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-navy mb-6">
            What We Offer
          </h2>
          <p className="text-gray-500 text-lg">
            Athlete Profiles and Highlight Reels are available today. Athlete Cards,
            Scouting Reports, and Athlete Passports are in development.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 max-w-6xl mx-auto">
          {offerings.map((offering, index) => {
            const Icon = offering.icon;
            return (
              <div
                key={index}
                className={`rounded-2xl p-6 transition-all duration-300 flex flex-col items-center text-center ${
                  offering.status === 'operational'
                    ? 'bg-navy/5 hover:bg-navy/10'
                    : 'bg-gray-50 border border-gray-200'
                }`}
              >
                <div className={`w-16 h-16 rounded-xl flex items-center justify-center mb-4 ${
                  offering.status === 'operational'
                    ? 'bg-gold/20'
                    : 'bg-gray-200'
                }`}>
                  <Icon className={`w-8 h-8 ${
                    offering.status === 'operational' ? 'text-gold' : 'text-gray-400'
                  }`} />
                </div>
                <p className="text-lg font-semibold text-navy mb-2">{offering.label}</p>
                <span className={`text-xs font-semibold px-2 py-1 rounded ${
                  offering.status === 'operational'
                    ? 'text-blue-700 bg-blue-50'
                    : 'text-gray-500 bg-gray-100'
                }`}>
                  {offering.status === 'operational' ? 'Available' : 'Planned'}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

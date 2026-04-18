import { CircleUser as UserCircle, Video, CreditCard, FileText, Award } from 'lucide-react';

const offerings = [
  { icon: UserCircle, label: 'Athlete Profiles' },
  { icon: Video, label: 'Highlight Reels' },
  { icon: CreditCard, label: 'Athlete Cards' },
  { icon: FileText, label: 'Scouting Reports' },
  { icon: Award, label: 'Athlete Passports' },
];

export default function WhatWeOffer() {
  return (
    <section className="py-24 bg-white">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-navy mb-6">
            What We Offer
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 max-w-6xl mx-auto">
          {offerings.map((offering, index) => {
            const Icon = offering.icon;
            return (
              <div
                key={index}
                className="bg-navy/5 rounded-2xl p-6 hover:bg-navy/10 transition-all duration-300 flex flex-col items-center text-center"
              >
                <div className="w-16 h-16 bg-gold/20 rounded-xl flex items-center justify-center mb-4">
                  <Icon className="w-8 h-8 text-gold" />
                </div>
                <p className="text-lg font-semibold text-navy">{offering.label}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

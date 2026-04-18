import { Search, DollarSign, Bell } from 'lucide-react';

const steps = [
  {
    number: '01',
    icon: Search,
    title: 'Discover Athletes',
    description: 'Find real athletes in your city competing right now. Browse profiles, watch highlights, and connect with the next generation.',
  },
  {
    number: '02',
    icon: DollarSign,
    title: 'Support Directly',
    description: 'Join their support team or make a direct contribution toward training, travel, and development. Every dollar goes to the athlete.',
  },
  {
    number: '03',
    icon: Bell,
    title: 'Follow Their Journey',
    description: 'Get updates, highlights, and real progress reports as the athletes you support grow and compete throughout the season.',
  },
];

export default function HowItWorks() {
  return (
    <section className="py-24 bg-white">
      <div className="max-w-6xl mx-auto px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 bg-navy/8 border border-navy/15 text-navy px-3 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest mb-5">
            Simple Process
          </div>
          <h2 className="text-4xl md:text-5xl font-black text-navy mb-5 leading-tight">
            How It Works
          </h2>
          <p className="text-gray-500 text-lg">
            Three steps to become part of an athlete's journey.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
          <div className="hidden md:block absolute top-14 left-[calc(33%+1rem)] right-[calc(33%+1rem)] h-px bg-gradient-to-r from-gold/40 via-gold to-gold/40" />

          {steps.map((step) => {
            const Icon = step.icon;
            return (
              <div key={step.number} className="relative flex flex-col items-center text-center group">
                <div className="relative mb-6">
                  <div className="w-28 h-28 bg-navy rounded-3xl flex items-center justify-center shadow-lg group-hover:shadow-xl group-hover:scale-105 transition-all duration-300">
                    <Icon className="w-12 h-12 text-white" />
                  </div>
                  <span className="absolute -top-3 -right-3 w-8 h-8 bg-gold rounded-full flex items-center justify-center text-navy text-xs font-black">
                    {step.number.replace('0', '')}
                  </span>
                </div>
                <h3 className="text-xl font-black text-navy mb-3">{step.title}</h3>
                <p className="text-gray-500 leading-relaxed text-sm max-w-xs">{step.description}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

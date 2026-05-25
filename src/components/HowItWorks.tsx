import { UserPlus, Camera, TrendingUp } from 'lucide-react';

const steps = [
  {
    number: '01',
    icon: UserPlus,
    title: 'Create Your Profile',
    description: 'Build a parent-managed athlete profile with bio, sport, school, and grade. Your story starts here — on your terms.',
  },
  {
    number: '02',
    icon: Camera,
    title: 'Capture the Moments',
    description: 'NextUp creators document your athlete at games and tournaments — leadership, composure, hustle, and growth. Real moments, real context.',
  },
  {
    number: '03',
    icon: TrendingUp,
    title: 'Build Your Journey',
    description: 'Every documented moment adds to your athlete\'s Journey — a longitudinal record of development that grows with them over time.',
  },
];

export default function HowItWorks() {
  return (
    <section className="py-24 bg-white">
      <div className="max-w-6xl mx-auto px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 bg-navy/8 border border-navy/15 text-navy px-3 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest mb-5">
            How It Works
          </div>
          <h2 className="text-4xl md:text-5xl font-black text-navy mb-5 leading-tight">
            How It Works
          </h2>
          <p className="text-gray-500 text-lg">
            From first profile to documented legacy — three steps.
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

import { Eye, Compass, Send, BookOpen } from 'lucide-react';

const steps = [
  {
    number: '01',
    icon: Eye,
    title: 'Recognition',
    question: 'What is happening?',
    description:
      'Start with the person\u2019s own words. You don\u2019t need to know the name of a program, a form number, or which office to call.',
  },
  {
    number: '02',
    icon: Compass,
    title: 'Navigation',
    question: 'Where could we go next?',
    description:
      'Identify possible pathways without pretending to determine eligibility. NextUp shows you the doors \u2014 not just the forms.',
  },
  {
    number: '03',
    icon: Send,
    title: 'Conveyance',
    question: 'How do we get there?',
    description:
      'Move the right question or information to the right destination. NextUp helps you reach the people and systems positioned to respond.',
  },
  {
    number: '04',
    icon: BookOpen,
    title: 'Learning',
    question: 'What happened along the way?',
    description:
      'Track progress, barriers, outcomes, and what remains unknown. Your record grows with you, not instead of you.',
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
            The Four-Part Model
          </h2>
          <p className="text-gray-500 text-lg">
            The right information. The right destination. The right time.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 relative">
          <div className="hidden lg:block absolute top-14 left-[calc(25%+1rem)] right-[calc(25%+1rem)] h-px bg-gradient-to-r from-gold/40 via-gold to-gold/40" />

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
                <h3 className="text-xl font-black text-navy mb-1">{step.title}</h3>
                <p className="text-gold font-semibold text-sm mb-3 italic">{step.question}</p>
                <p className="text-gray-500 leading-relaxed text-sm max-w-xs">{step.description}</p>
              </div>
            );
          })}
        </div>

        <div className="mt-16 text-center">
          <div className="inline-block bg-navy rounded-2xl px-8 py-6">
            <p className="text-white text-lg leading-relaxed font-medium">
              People narrate.{'  '}NextUp translates.{'  '}Authorities determine.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

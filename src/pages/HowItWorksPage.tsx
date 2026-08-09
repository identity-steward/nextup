import { MessageCircle, Brain, Compass, BookOpen } from 'lucide-react';
import HowItWorks from '../components/HowItWorks';

export default function HowItWorksPage() {
  const stages = [
    {
      number: '01',
      icon: MessageCircle,
      title: 'Tell',
      description:
        'Start with what\u2019s happening in your own words. You don\u2019t need to know the name of a program, a form number, or which office to call.',
    },
    {
      number: '02',
      icon: Brain,
      title: 'Understand',
      description:
        'NextUp helps organize what it heard so you can confirm or correct it. You see the picture before anyone else does.',
    },
    {
      number: '03',
      icon: Compass,
      title: 'Navigate',
      description:
        'See possible next steps and who actually controls them. NextUp shows you the doors \u2014 not just the forms.',
    },
    {
      number: '04',
      icon: BookOpen,
      title: 'Learn',
      description:
        'Keep track of what happened and what comes next. Your record grows with you, not instead of you.',
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50 pt-20">
      <section className="bg-gradient-to-br from-navy via-navy-light to-navy text-white py-20">
        <div className="max-w-4xl mx-auto px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-6">
            How It Works
          </h1>
          <p className="text-xl text-gray-300 max-w-2xl mx-auto">
            You don\u2019t have to know the system. Start with what\u2019s happening.
          </p>
        </div>
      </section>

      <section className="py-20">
        <div className="max-w-6xl mx-auto px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 relative">
            <div className="hidden lg:block absolute top-14 left-[calc(25%+1rem)] right-[calc(25%+1rem)] h-px bg-gradient-to-r from-gold/40 via-gold to-gold/40" />

            {stages.map((stage) => {
              const Icon = stage.icon;
              return (
                <div
                  key={stage.number}
                  className="relative flex flex-col items-center text-center group"
                >
                  <div className="relative mb-6">
                    <div className="w-28 h-28 bg-navy rounded-3xl flex items-center justify-center shadow-lg group-hover:shadow-xl group-hover:scale-105 transition-all duration-300">
                      <Icon className="w-12 h-12 text-white" />
                    </div>
                    <span className="absolute -top-3 -right-3 w-8 h-8 bg-gold rounded-full flex items-center justify-center text-navy text-xs font-black">
                      {stage.number.replace('0', '')}
                    </span>
                  </div>
                  <h3 className="text-xl font-black text-navy mb-3">{stage.title}</h3>
                  <p className="text-gray-500 leading-relaxed text-sm max-w-xs">
                    {stage.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <section className="py-20 bg-navy text-white">
        <div className="max-w-4xl mx-auto px-6 lg:px-8 text-center">
          <h2 className="text-2xl md:text-3xl font-bold mb-8">
            The Governing Principle
          </h2>
          <div className="space-y-2 text-lg md:text-xl text-gray-200 leading-relaxed">
            <p>People narrate.</p>
            <p>NextUp translates.</p>
            <p>Authorities determine.</p>
          </div>
        </div>
      </section>

      <section className="py-20 bg-white">
        <div className="max-w-5xl mx-auto px-6 lg:px-8">
          <div className="bg-gray-50 rounded-2xl p-8 md:p-12">
            <h2 className="text-2xl md:text-3xl font-bold text-navy mb-6 text-center">
              Life doesn\u2019t happen one program at a time.
            </h2>
            <div className="space-y-3 max-w-2xl mx-auto text-center">
              {[
                'Housing can affect school.',
                'School can affect transportation.',
                'Transportation can affect work.',
                'Work can affect income.',
                'Income can affect opportunity.',
              ].map((line, i) => (
                <p key={i} className="text-lg text-gray-600 leading-relaxed">
                  {line}
                </p>
              ))}
              <p className="text-xl font-bold text-navy pt-4">
                NextUp helps connect the dots.
              </p>
            </div>
          </div>
        </div>
      </section>

      <HowItWorks />
    </div>
  );
}

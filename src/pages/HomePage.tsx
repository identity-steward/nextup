import { useRef } from 'react';
import Hero from '../components/Hero';
import JacobHighlightReel from '../components/JacobHighlightReel';
import HowItWorks from '../components/HowItWorks';
import FeaturedAthletesPreview from '../components/FeaturedAthletesPreview';
import FounderStory from '../components/FounderStory';
import FAQ from '../components/FAQ';
import { FEATURE_FLAGS } from '../config/features';

function RecognitionSection() {
  const lines = [
    'Housing can affect school.',
    'School can affect transportation.',
    'Transportation can affect work.',
    'Work can affect income.',
    'Income can affect opportunity.',
  ];

  return (
    <section className="py-24 bg-white">
      <div className="max-w-5xl mx-auto px-6 lg:px-8">
        <div className="bg-gray-50 rounded-3xl p-8 md:p-14">
          <h2 className="text-3xl md:text-4xl font-black text-navy mb-8 text-center leading-tight">
            Life doesn't happen one program at a time.
          </h2>
          <div className="space-y-3 max-w-2xl mx-auto text-center">
            {lines.map((line, i) => (
              <p
                key={i}
                className="text-lg md:text-xl text-gray-600 leading-relaxed"
                style={{ animationDelay: `${i * 100}ms` }}
              >
                {line}
              </p>
            ))}
            <p className="text-xl md:text-2xl font-bold text-navy pt-6">
              NextUp helps connect the dots.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

export default function HomePage() {
  const athletesRef = useRef<HTMLDivElement>(null);

  return (
    <>
      <Hero />
      <RecognitionSection />
      <HowItWorks />

      <div ref={athletesRef}>
        <FeaturedAthletesPreview />
      </div>

      <JacobHighlightReel />

      <FounderStory />

      <FAQ />

      {/* Preserved sections hidden during Phase 1 pilot via feature flags.
          Components are not deleted — just not rendered while flags are off. */}
      {FEATURE_FLAGS.LIVE_FEED && null}
      {FEATURE_FLAGS.CREATORS && null}
      {FEATURE_FLAGS.PUBLIC_STRIPE_SUPPORT && null}
      {FEATURE_FLAGS.SCHOOLS && null}
      {FEATURE_FLAGS.AGENT_OPS && null}
    </>
  );
}

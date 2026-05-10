import { useRef } from 'react';
import Hero from '../components/Hero';
import EventUrgencyBanner from '../components/EventUrgencyBanner';
import JacobHighlightReel from '../components/JacobHighlightReel';
import HowItWorks from '../components/HowItWorks';
import FeaturedAthletesPreview from '../components/FeaturedAthletesPreview';
import CheerForTheGirls from '../components/CheerForTheGirls';
import CreatorCTA from '../components/CreatorCTA';
import EventsCTA from '../components/EventsCTA';
import JoinNextUp from '../components/JoinNextUp';
import SupporterTier from '../components/SupporterTier';
import FounderStory from '../components/FounderStory';
import FAQ from '../components/FAQ';

export default function HomePage() {
  const athletesRef = useRef<HTMLDivElement>(null);

  const scrollToAthletes = () => {
    athletesRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <>
      <Hero />
      <JacobHighlightReel />
      <div ref={athletesRef}>
        <FeaturedAthletesPreview />
      </div>
      <CheerForTheGirls />
      <HowItWorks />
      <SupporterTier />
      <EventUrgencyBanner onScrollToAthletes={scrollToAthletes} />
      <EventsCTA />
      <JoinNextUp />
      <CreatorCTA />
      <FounderStory />
      <FAQ />
    </>
  );
}

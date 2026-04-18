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

interface HomePageProps {
  onNavigate?: (page: string, slug?: string) => void;
}

export default function HomePage({ onNavigate }: HomePageProps) {
  const athletesRef = useRef<HTMLDivElement>(null);

  const scrollToAthletes = () => {
    athletesRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <>
      <Hero onNavigate={onNavigate} />
      <JacobHighlightReel onNavigate={onNavigate} />
      <div ref={athletesRef}>
        <FeaturedAthletesPreview onNavigate={onNavigate} />
      </div>
      <CheerForTheGirls onNavigate={onNavigate} />
      <HowItWorks />
      <SupporterTier onNavigate={onNavigate} />
      <EventUrgencyBanner onScrollToAthletes={scrollToAthletes} />
      <EventsCTA onNavigate={onNavigate} />
      <JoinNextUp onNavigate={onNavigate} />
      <CreatorCTA onNavigate={onNavigate} />
      <FounderStory />
      <FAQ />
    </>
  );
}

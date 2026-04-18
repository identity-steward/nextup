import ProfileHero from '../components/jacob/ProfileHero';
import ProfileHighlightVideo from '../components/jacob/ProfileHighlightVideo';
import ProfileAbout from '../components/jacob/ProfileAbout';
import ProfileAttributes from '../components/jacob/ProfileAttributes';
import ProfileMidCTA from '../components/jacob/ProfileMidCTA';
import ProfileHighlightGrid from '../components/jacob/ProfileHighlightGrid';
import ProfileSupport from '../components/jacob/ProfileSupport';
import ProfileUpdates from '../components/jacob/ProfileUpdates';
import ProfileShare from '../components/jacob/ProfileShare';
import ProfileTrustStrip from '../components/jacob/ProfileTrustStrip';
import ProfileFooterCTA from '../components/jacob/ProfileFooterCTA';

interface JacobFousePageProps {
  onNavigate?: (page: string, slug?: string) => void;
}

const GOAL = 500;
const RAISED = 120;
const SUPPORTERS = 12;
const STILL_NEEDED = GOAL - RAISED;
const PROGRESS_PCT = Math.round((RAISED / GOAL) * 100);

export default function JacobFousePage({ onNavigate }: JacobFousePageProps) {
  const scrollToSupport = () => {
    document.getElementById('support')?.scrollIntoView({ behavior: 'smooth' });
  };

  const scrollToHighlights = () => {
    document.getElementById('highlights')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-[#07090f] pt-16">

      {/* 1. Hero */}
      <ProfileHero
        raised={RAISED}
        goal={GOAL}
        supporters={SUPPORTERS}
        progressPct={PROGRESS_PCT}
        stillNeeded={STILL_NEEDED}
        onSupportClick={scrollToSupport}
        onHighlightsClick={scrollToHighlights}
      />

      {/* 2. Featured Highlight Video */}
      <ProfileHighlightVideo />

      {/* 3. About */}
      <ProfileAbout />

      {/* 4. Attributes */}
      <ProfileAttributes />

      {/* 5. Mid-page CTA */}
      <ProfileMidCTA
        raised={RAISED}
        goal={GOAL}
        progressPct={PROGRESS_PCT}
        onSupportClick={scrollToSupport}
      />

      {/* 6. Highlight Grid */}
      <ProfileHighlightGrid />

      {/* 7. Support */}
      <ProfileSupport
        raised={RAISED}
        goal={GOAL}
        supporters={SUPPORTERS}
        progressPct={PROGRESS_PCT}
        stillNeeded={STILL_NEEDED}
      />

      {/* 7. Journey Updates */}
      <ProfileUpdates />

      {/* 8. Share */}
      <ProfileShare />

      {/* 9. Trust */}
      <ProfileTrustStrip />

      {/* 10. Footer CTA */}
      <ProfileFooterCTA onSupportClick={scrollToSupport} onNavigate={onNavigate} />

    </div>
  );
}

import { useState } from 'react';
import ProfileHero from '../components/jacob/ProfileHero';
import ProfileHighlightVideo from '../components/jacob/ProfileHighlightVideo';
import ProfileAbout from '../components/jacob/ProfileAbout';
import ProfileTraits from '../components/jacob/ProfileTraits';
import ProfileAttributes from '../components/jacob/ProfileAttributes';
import ProfileMidCTA from '../components/jacob/ProfileMidCTA';
import ProfileHighlightGrid from '../components/jacob/ProfileHighlightGrid';
import ProfileSupport from '../components/jacob/ProfileSupport';
import ProfileUpdates from '../components/jacob/ProfileUpdates';
import ProfileShare from '../components/jacob/ProfileShare';
import ProfileTrustStrip from '../components/jacob/ProfileTrustStrip';
import ProfileFooterCTA from '../components/jacob/ProfileFooterCTA';
import ProfileDisclaimerStrip from '../components/jacob/ProfileDisclaimerStrip';
import ProfileUpdateModal from '../components/jacob/ProfileUpdateModal';

const GOAL = 500;
const RAISED = 120;
const SUPPORTERS = 12;
const STILL_NEEDED = GOAL - RAISED;
const PROGRESS_PCT = Math.round((RAISED / GOAL) * 100);

export default function JacobFousePage() {
  const [showUpdateModal, setShowUpdateModal] = useState(false);

  const scrollToSupport = () => {
    document.getElementById('support')?.scrollIntoView({ behavior: 'smooth' });
  };

  const scrollToHighlights = () => {
    document.getElementById('highlights')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-[#1c2028] pt-16">

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

      {/* 4. Character Traits */}
      <ProfileTraits />

      {/* 5. Attributes */}
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

      {/* 8. Journey Updates */}
      <ProfileUpdates />

      {/* 9. Share */}
      <ProfileShare />

      {/* 10. Trust */}
      <ProfileTrustStrip />

      {/* 11. Disclaimer strip with update request link */}
      <ProfileDisclaimerStrip onRequestUpdate={() => setShowUpdateModal(true)} />

      {/* 12. Footer CTA */}
      <ProfileFooterCTA onSupportClick={scrollToSupport} />

      {/* Profile update modal */}
      {showUpdateModal && (
        <ProfileUpdateModal
          athleteSlug="jacob-fouse"
          athleteName="Jacob Fouse"
          onClose={() => setShowUpdateModal(false)}
        />
      )}

    </div>
  );
}

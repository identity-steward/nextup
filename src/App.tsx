import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { isSupabaseConfigured } from './lib/supabase';
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { ProtectedRoute } from './components/ProtectedRoute';

import { HomePage } from './pages/HomePage';
import { HowItWorksPage } from './pages/HowItWorksPage';
import { AthletesPage } from './pages/AthletesPage';
import { JacobFousePage } from './pages/JacobFousePage';
import { AthleteProfilePage } from './pages/AthleteProfilePage';
import { FamiliesPage } from './pages/FamiliesPage';
import { AboutPage } from './pages/AboutPage';
import { PrivacyTrustPage } from './pages/PrivacyTrustPage';
import { StartPage } from './pages/StartPage';
import { ContactPage } from './pages/ContactPage';
import { SignInPage } from './pages/SignInPage';
import { SignupPage } from './pages/SignupPage';
import { JoinPage } from './pages/JoinPage';
import { ParentIntakePage } from './pages/ParentIntakePage';
import { LiveFeedPage } from './pages/LiveFeedPage';
import { CreatorsPage } from './pages/CreatorsPage';
import { CreatorProfilePage } from './pages/CreatorProfilePage';
import { ForSchoolsPage } from './pages/ForSchoolsPage';
import { HackathonDemoPage } from './pages/HackathonDemoPage';
import { ThankYouPage } from './pages/ThankYouPage';
import { CreatorPage } from './pages/CreatorPage';
import { StoryPage } from './pages/StoryPage';
import { SharePage } from './pages/SharePage';
import { PrivacyPage } from './pages/PrivacyPage';
import { PathwaysPage } from './pages/PathwaysPage';
import { OutcomePage } from './pages/OutcomePage';
import { AppDashboardPage } from './pages/AppDashboardPage';
import { ProfileSetupPage } from './pages/ProfileSetupPage';
import { AthleteDashboardPage } from './pages/AthleteDashboardPage';

import { AdminDashboardPage } from './pages/AdminDashboardPage';
import { AdminAthletesPage } from './pages/AdminAthletesPage';
import { AdminParentIntakePage } from './pages/AdminParentIntakePage';
import { AdminAgentOpsPage } from './pages/AdminAgentOpsPage';
import { AdminProfileUpdatesPage } from './pages/AdminProfileUpdatesPage';
import { AdminMediaPage } from './pages/AdminMediaPage';
import { AdminLiveAthletesPage } from './pages/AdminLiveAthletesPage';
import { AdminJourneyEntriesPage } from './pages/AdminJourneyEntriesPage';
import { AdminNarrationPage } from './pages/AdminNarrationPage';
import { AdminTrustPage } from './pages/AdminTrustPage';
import { AdminPathwaysPage } from './pages/AdminPathwaysPage';
import { AdminOutcomesPage } from './pages/AdminOutcomesPage';
import { AdminIdentityReviewPage } from './pages/AdminIdentityReviewPage';
import { AdminYouthRelationshipPage } from './pages/AdminYouthRelationshipPage';
import { NavigatorWorkflowPage } from './pages/NavigatorWorkflowPage';

function AppContent() {
  return (
    <div className="min-h-screen bg-white">
      <Header />
      <main>
        {!isSupabaseConfigured && (
          <div className="bg-amber-50 border-b border-amber-200 text-amber-900 pt-24">
            <div className="max-w-7xl mx-auto px-6 lg:px-8 py-3 text-sm">
              Running in local preview mode. Configure Supabase in .env to enable sign-in and form submissions.
            </div>
          </div>
        )}
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/how-it-works" element={<HowItWorksPage />} />
          <Route path="/youth" element={<AthletesPage />} />
          <Route path="/youth/jacob-fouse" element={<JacobFousePage />} />
          <Route path="/youth/:slug" element={<AthleteProfilePage />} />
          <Route path="/families" element={<FamiliesPage />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/privacy" element={<PrivacyTrustPage />} />
          <Route path="/start" element={<StartPage />} />
          <Route path="/contact" element={<ContactPage />} />
          <Route path="/signin" element={<SignInPage />} />

          <Route path="/athletes" element={<Navigate to="/youth" replace />} />
          <Route path="/athletes/jacob-fouse" element={<Navigate to="/youth/jacob-fouse" replace />} />
          <Route path="/athletes/:slug" element={<Navigate to="/youth/:slug" replace />} />
          <Route path="/signup" element={<SignupPage />} />
          <Route path="/signup/player" element={<JoinPage />} />
          <Route path="/signup/parent" element={<ParentIntakePage />} />
          <Route path="/live-feed" element={<LiveFeedPage />} />
          <Route path="/creators" element={<CreatorsPage />} />
          <Route path="/creators/:slug" element={<CreatorProfilePage />} />
          <Route path="/schools" element={<ForSchoolsPage />} />
          <Route path="/demo" element={<HackathonDemoPage />} />
          <Route path="/thank-you" element={<ThankYouPage />} />
          <Route path="/creator" element={<CreatorPage />} />
          <Route path="/join" element={<Navigate to="/start" replace />} />
          <Route path="/parent-intake" element={<Navigate to="/signup/parent" replace />} />

          <Route path="/app" element={<ProtectedRoute><AppDashboardPage /></ProtectedRoute>} />
          <Route path="/app/story" element={<ProtectedRoute><StoryPage /></ProtectedRoute>} />
          <Route path="/app/share" element={<ProtectedRoute><SharePage /></ProtectedRoute>} />
          <Route path="/app/privacy" element={<ProtectedRoute><PrivacyPage /></ProtectedRoute>} />
          <Route path="/app/pathways" element={<ProtectedRoute><PathwaysPage /></ProtectedRoute>} />
          <Route path="/app/outcome" element={<ProtectedRoute><OutcomePage /></ProtectedRoute>} />

          <Route path="/profile-setup" element={<ProtectedRoute><ProfileSetupPage /></ProtectedRoute>} />
          <Route path="/dashboard" element={<ProtectedRoute><AthleteDashboardPage /></ProtectedRoute>} />

          <Route path="/admin" element={<ProtectedRoute requireAdmin><AdminDashboardPage /></ProtectedRoute>} />
          <Route path="/admin/athletes" element={<ProtectedRoute requireAdmin><AdminAthletesPage /></ProtectedRoute>} />
          <Route path="/admin/intake" element={<ProtectedRoute requireAdmin><AdminParentIntakePage /></ProtectedRoute>} />
          <Route path="/admin/agent-ops" element={<ProtectedRoute requireAdmin><AdminAgentOpsPage /></ProtectedRoute>} />
          <Route path="/admin/profile-updates" element={<ProtectedRoute requireAdmin><AdminProfileUpdatesPage /></ProtectedRoute>} />
          <Route path="/admin/media" element={<ProtectedRoute requireAdmin><AdminMediaPage /></ProtectedRoute>} />
          <Route path="/admin/live-athletes" element={<ProtectedRoute requireAdmin><AdminLiveAthletesPage /></ProtectedRoute>} />
          <Route path="/admin/journey" element={<ProtectedRoute requireAdmin><AdminJourneyEntriesPage /></ProtectedRoute>} />
          <Route path="/admin/narration" element={<ProtectedRoute requireAdmin><AdminNarrationPage /></ProtectedRoute>} />
          <Route path="/admin/trust" element={<ProtectedRoute requireAdmin><AdminTrustPage /></ProtectedRoute>} />
          <Route path="/admin/pathways" element={<ProtectedRoute requireAdmin><AdminPathwaysPage /></ProtectedRoute>} />
          <Route path="/admin/outcomes" element={<ProtectedRoute requireAdmin><AdminOutcomesPage /></ProtectedRoute>} />
          <Route path="/admin/identity-review" element={<ProtectedRoute requireAdmin><AdminIdentityReviewPage /></ProtectedRoute>} />
          <Route path="/admin/youth-relationships" element={<ProtectedRoute requireAdmin><AdminYouthRelationshipPage /></ProtectedRoute>} />
          <Route path="/admin/navigator" element={<ProtectedRoute requireNavigator><NavigatorWorkflowPage /></ProtectedRoute>} />

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
      <Footer />
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

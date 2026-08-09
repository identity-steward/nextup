import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Header from './components/Header';
import Footer from './components/Footer';
import ProtectedRoute from './components/ProtectedRoute';
import { AuthProvider } from './context/AuthContext';
import HomePage from './pages/HomePage';
import AthletesPage from './pages/AthletesPage';
import SignupPage from './pages/SignupPage';
import JoinPage from './pages/JoinPage';
import CreatorPage from './pages/CreatorPage';
import AboutPage from './pages/AboutPage';
import ForSchoolsPage from './pages/ForSchoolsPage';
import HackathonDemoPage from './pages/HackathonDemoPage';
import CreatorsPage from './pages/CreatorsPage';
import CreatorProfilePage from './pages/CreatorProfilePage';
import SignInPage from './pages/SignInPage';
import AthleteProfilePage from './pages/AthleteProfilePage';
import ContactPage from './pages/ContactPage';
import ParentIntakePage from './pages/ParentIntakePage';
import { isSupabaseConfigured } from './lib/supabase';
import JacobFousePage from './pages/JacobFousePage';
import LiveFeedPage from './pages/LiveFeedPage';
import ProfileSetupPage from './pages/ProfileSetupPage';
import StartPage from './pages/StartPage';
import PartnersPage from './pages/PartnersPage';
import PrivacyTrustPage from './pages/PrivacyTrustPage';
import HowItWorksPage from './pages/HowItWorksPage';

import { AdminDashboardPage } from './pages/AdminDashboardPage';
import { AdminAthletesPage } from './pages/AdminAthletesPage';
import { AdminParentIntakePage } from './pages/AdminParentIntakePage';
import { AdminAgentOpsPage } from './pages/AdminAgentOpsPage';
import { AdminProfileUpdatesPage } from './pages/AdminProfileUpdatesPage';
import { AdminMediaPage } from './pages/AdminMediaPage';
import { AdminLiveAthletesPage } from './pages/AdminLiveAthletesPage';
import { AdminJourneyEntriesPage } from './pages/AdminJourneyEntriesPage';
import AthleteDashboardPage from './pages/AthleteDashboardPage';
import ThankYouPage from './pages/ThankYouPage';
import AppDashboardPage from './pages/AppDashboardPage';
import StoryPage from './pages/StoryPage';
import AdminNarrationPage from './pages/AdminNarrationPage';
import SharePage from './pages/SharePage';
import PrivacyPage from './pages/PrivacyPage';
import AdminTrustPage from './pages/AdminTrustPage';
import PathwaysPage from './pages/PathwaysPage';
import AdminPathwaysPage from './pages/AdminPathwaysPage';
import OutcomePage from './pages/OutcomePage';
import AdminOutcomesPage from './pages/AdminOutcomesPage';

function AppContent() {
  return (
    <div className="min-h-screen bg-white">
      <Header />
      <main>
        {!isSupabaseConfigured && (
          <div className="bg-amber-50 border-b border-amber-200 text-amber-900 pt-24">
            <div className="max-w-7xl mx-auto px-6 lg:px-8 py-3 text-sm">
              Running in local preview mode. Configure <code>VITE_SUPABASE_URL</code> and <code>VITE_SUPABASE_ANON_KEY</code> in <code>.env</code> to enable sign-in and form submissions.
            </div>
          </div>
        )}
        <Routes>
          {/* Public — Phase 1 simplified navigation */}
          <Route path="/" element={<HomePage />} />
          <Route path="/how-it-works" element={<HowItWorksPage />} />
          <Route path="/youth" element={<AthletesPage />} />
          <Route path="/youth/jacob-fouse" element={<JacobFousePage />} />
          <Route path="/youth/:slug" element={<AthleteProfilePage />} />
          <Route path="/partners" element={<PartnersPage />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/method" element={<Navigate to="/about" replace />} />
          <Route path="/privacy" element={<PrivacyTrustPage />} />
          <Route path="/start" element={<StartPage />} />
          <Route path="/contact" element={<ContactPage />} />
          <Route path="/signin" element={<SignInPage />} />

          {/* Preserved routes — kept functional, not in public nav */}
          <Route path="/athletes" element={<Navigate to="/youth" replace />} />
          <Route path="/athletes/jacob-fouse" element={<Navigate to="/youth/jacob-fouse" replace />} />
          <Route path="/athletes/:slug" element={<Navigate to="/youth/:slug" replace />} />
          <Route path="/signup" element={<SignupPage />} />
          <Route path="/signup/player" element={<JoinPage />} />
          <Route path="/signup/parent" element={<ParentIntakePage />} />
          <Route path="/live-feed" element={<LiveFeedPage />} />
          <Route path="/creators" element={<CreatorsPage />} />
          <Route path="/creators/:slug" element={<CreatorProfilePage />} />
          <Route path="/sponsors" element={<Navigate to="/partners" replace />} />
          <Route path="/support" element={<Navigate to="/partners" replace />} />
          <Route path="/schools" element={<ForSchoolsPage />} />
          <Route path="/demo" element={<HackathonDemoPage />} />
          <Route path="/thank-you" element={<ThankYouPage />} />
          <Route path="/creator" element={<CreatorPage />} />

          {/* Legacy redirects */}
          <Route path="/join" element={<Navigate to="/start" replace />} />
          <Route path="/parent-intake" element={<Navigate to="/signup/parent" replace />} />

          {/* Phase 2 — Private person-centered app */}
          <Route
            path="/app"
            element={
              <ProtectedRoute>
                <AppDashboardPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/app/story"
            element={
              <ProtectedRoute>
                <StoryPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/app/share"
            element={
              <ProtectedRoute>
                <SharePage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/app/privacy"
            element={
              <ProtectedRoute>
                <PrivacyPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/app/pathways"
            element={
              <ProtectedRoute>
                <PathwaysPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/app/outcome"
            element={
              <ProtectedRoute>
                <OutcomePage />
              </ProtectedRoute>
            }
          />

          {/* Protected */}
          <Route
            path="/profile-setup"
            element={
              <ProtectedRoute>
                <ProfileSetupPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <AthleteDashboardPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin"
            element={
              <ProtectedRoute requireAdmin>
                <AdminDashboardPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/athletes"
            element={
              <ProtectedRoute requireAdmin>
                <AdminAthletesPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/intake"
            element={
              <ProtectedRoute requireAdmin>
                <AdminParentIntakePage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/agent-ops"
            element={
              <ProtectedRoute requireAdmin>
                <AdminAgentOpsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/profile-updates"
            element={
              <ProtectedRoute requireAdmin>
                <AdminProfileUpdatesPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/media"
            element={
              <ProtectedRoute requireAdmin>
                <AdminMediaPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/live-athletes"
            element={
              <ProtectedRoute requireAdmin>
                <AdminLiveAthletesPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/journey"
            element={
              <ProtectedRoute requireAdmin>
                <AdminJourneyEntriesPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/narration"
            element={
              <ProtectedRoute requireAdmin>
                <AdminNarrationPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/trust"
            element={
              <ProtectedRoute requireAdmin>
                <AdminTrustPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/pathways"
            element={
              <ProtectedRoute requireAdmin>
                <AdminPathwaysPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/outcomes"
            element={
              <ProtectedRoute requireAdmin>
                <AdminOutcomesPage />
              </ProtectedRoute>
            }
          />

          {/* Catch-all */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
      <Footer />
    </div>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;

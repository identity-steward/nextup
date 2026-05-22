import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Header from './components/Header';
import Footer from './components/Footer';
import ProtectedRoute from './components/ProtectedRoute';
import { ScrollToTop } from './components/ScrollToTop';
import { AuthProvider } from './context/AuthContext';
import HomePage from './pages/HomePage';
import AthletesPage from './pages/AthletesPage';
import SignupPage from './pages/SignupPage';
import JoinPage from './pages/JoinPage';
import CreatorPage from './pages/CreatorPage';
import SponsorsPage from './pages/SponsorsPage';
import AboutPage from './pages/AboutPage';
import ForSchoolsPage from './pages/ForSchoolsPage';
import HackathonDemoPage from './pages/HackathonDemoPage';
import CreatorsPage from './pages/CreatorsPage';
import CreatorProfilePage from './pages/CreatorProfilePage';
import SignInPage from './pages/SignInPage';
import AthleteProfilePage from './pages/AthleteProfilePage';
import SupportPage from './pages/SupportPage';
import ContactPage from './pages/ContactPage';
import ParentIntakePage from './pages/ParentIntakePage';
import { isSupabaseConfigured } from './lib/supabase';
import JacobFousePage from './pages/JacobFousePage';
import SpotlightPage from './pages/LiveFeedPage';
import ProfileSetupPage from './pages/ProfileSetupPage';

import { AdminDashboardPage } from './pages/AdminDashboardPage';
import { AdminAthletesPage } from './pages/AdminAthletesPage';
import { AdminParentIntakePage } from './pages/AdminParentIntakePage';
import { AdminAgentOpsPage } from './pages/AdminAgentOpsPage';
import { AdminProfileUpdatesPage } from './pages/AdminProfileUpdatesPage';
import { AdminMediaPage } from './pages/AdminMediaPage';
import { AdminLiveAthletesPage } from './pages/AdminLiveAthletesPage';
import AthleteDashboardPage from './pages/AthleteDashboardPage';
import ThankYouPage from './pages/ThankYouPage';

function AppContent() {
  return (
    <div className="min-h-screen bg-white">
      <ScrollToTop />
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
          {/* Public */}
          <Route path="/" element={<HomePage />} />
          <Route path="/athletes" element={<AthletesPage />} />
          <Route path="/athletes/jacob-fouse" element={<JacobFousePage />} />
          <Route path="/athletes/:slug" element={<AthleteProfilePage />} />
          <Route path="/signup" element={<SignupPage />} />
          <Route path="/signup/player" element={<JoinPage />} />
          <Route path="/signup/parent" element={<ParentIntakePage />} />
          <Route path="/spotlight" element={<SpotlightPage />} />
          <Route path="/live-feed" element={<Navigate to="/spotlight" replace />} />
          <Route path="/creators" element={<CreatorsPage />} />
          <Route path="/creators/:slug" element={<CreatorProfilePage />} />
          <Route path="/sponsors" element={<SponsorsPage />} />
          <Route path="/support" element={<SupportPage />} />
          <Route path="/contact" element={<ContactPage />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/schools" element={<ForSchoolsPage />} />
          <Route path="/demo" element={<HackathonDemoPage />} />
          <Route path="/thank-you" element={<ThankYouPage />} />
          <Route path="/creator" element={<CreatorPage />} />

          {/* Legacy redirects */}
          <Route path="/join" element={<Navigate to="/signup/player" replace />} />
          <Route path="/parent-intake" element={<Navigate to="/signup/parent" replace />} />

          {/* Auth */}
          <Route path="/signin" element={<SignInPage />} />

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

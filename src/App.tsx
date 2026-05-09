import { useState, useEffect } from 'react';
import Header from './components/Header';
import Footer from './components/Footer';
import ProtectedRoute from './components/ProtectedRoute';
import { AuthProvider } from './context/AuthContext';
import HomePage from './pages/HomePage';
import AthletesPage from './pages/AthletesPage';
import JoinPage from './pages/JoinPage';
import CreatorPage from './pages/CreatorPage';
import CreateAthletePage from './pages/CreateAthletePage';
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

import { AdminDashboardPage } from './pages/AdminDashboardPage';
import { AdminAthletesPage } from './pages/AdminAthletesPage';
import { AdminParentIntakePage } from './pages/AdminParentIntakePage';
import { AdminAgentOpsPage } from './pages/AdminAgentOpsPage';
import { AdminProfileUpdatesPage } from './pages/AdminProfileUpdatesPage';
import { AdminMediaPage } from './pages/AdminMediaPage';
import AthleteDashboardPage from './pages/AthleteDashboardPage';
import ThankYouPage from './pages/ThankYouPage';

function AppContent() {
  const initialPage = (() => {
    const params = new URLSearchParams(window.location.search);
    return params.get('page') || 'home';
  })();

  const [currentPage, setCurrentPage] = useState(initialPage);
  const [pageSlug, setPageSlug] = useState<string>();

  const handleNavigate = (page: string, slug?: string) => {
    setCurrentPage(page);
    setPageSlug(slug);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [currentPage]);

  const renderPage = () => {
  switch (currentPage) {
    case 'home':
      return <HomePage onNavigate={handleNavigate} />;
    case 'athletes':
      return <AthletesPage onNavigate={handleNavigate} />;
    case 'athlete-profile':
      return <AthleteProfilePage slug={pageSlug} onNavigate={handleNavigate} />;
    case 'jacob-fouse':
      return <JacobFousePage onNavigate={handleNavigate} />;
    case 'join':
      return <JoinPage onNavigate={handleNavigate} />;
    case 'signin':
      return <SignInPage onNavigate={handleNavigate} />;
    case 'creator':
      return <CreatorPage />;
    case 'creators':
      return <CreatorsPage onNavigate={handleNavigate} />;
    case 'creator-profile':
      return <CreatorProfilePage slug={pageSlug} onNavigate={handleNavigate} />;
    case 'create':
      return <CreateAthletePage onNavigate={handleNavigate} />;
    case 'sponsors':
      return <SponsorsPage onNavigate={handleNavigate} />;
    case 'support':
      return <SupportPage onNavigate={handleNavigate} />;
    case 'contact':
      return <ContactPage onNavigate={handleNavigate} />;
    case 'parent-intake':
      return <ParentIntakePage onNavigate={handleNavigate} />;
    case 'about':
      return <AboutPage />;
    case 'schools':
      return <ForSchoolsPage onNavigate={handleNavigate} />;
    case 'demo':
      return <HackathonDemoPage onNavigate={handleNavigate} />;
    case 'thank-you':
      return <ThankYouPage onNavigate={handleNavigate} />;
    case 'athlete-dashboard':
      return (
        <ProtectedRoute onNavigate={handleNavigate}>
          <AthleteDashboardPage onNavigate={handleNavigate} />
        </ProtectedRoute>
      );
    case 'admin-dashboard':
      return (
        <ProtectedRoute onNavigate={handleNavigate} requireAdmin>
          <AdminDashboardPage onNavigate={handleNavigate} />
        </ProtectedRoute>
      );
    case 'admin-athletes':
      return (
        <ProtectedRoute onNavigate={handleNavigate} requireAdmin>
          <AdminAthletesPage onNavigate={handleNavigate} />
        </ProtectedRoute>
      );
    case 'admin-parent-intake':
      return (
        <ProtectedRoute onNavigate={handleNavigate} requireAdmin>
          <AdminParentIntakePage onNavigate={handleNavigate} />
        </ProtectedRoute>
      );
    case 'admin-agent-ops':
      return (
        <ProtectedRoute onNavigate={handleNavigate} requireAdmin>
          <AdminAgentOpsPage onNavigate={handleNavigate} />
        </ProtectedRoute>
      );
    case 'admin-profile-updates':
      return (
        <ProtectedRoute onNavigate={handleNavigate} requireAdmin>
          <AdminProfileUpdatesPage onNavigate={handleNavigate} />
        </ProtectedRoute>
      );
    case 'admin-media':
      return (
        <ProtectedRoute onNavigate={handleNavigate} requireAdmin>
          <AdminMediaPage onNavigate={handleNavigate} />
        </ProtectedRoute>
      );
    default:
      return <HomePage onNavigate={handleNavigate} />;
  }
};

  return (
    <div className="min-h-screen bg-white">
      <Header onNavigate={handleNavigate} currentPage={currentPage} />
      <main>
        {!isSupabaseConfigured && (
          <div className="bg-amber-50 border-b border-amber-200 text-amber-900 pt-24">
            <div className="max-w-7xl mx-auto px-6 lg:px-8 py-3 text-sm">
              Running in local preview mode. Configure `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` in `.env` to enable sign-in and form submissions.
            </div>
          </div>
        )}
        {renderPage()}
      </main>
      <Footer onNavigate={handleNavigate} />
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;

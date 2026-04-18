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

import { AdminDashboardPage } from './pages/AdminDashboardPage';
import { AdminAthletesPage } from './pages/AdminAthletesPage';
import { AdminParentIntakePage } from './pages/AdminParentIntakePage';
import { AdminAgentOpsPage } from './pages/AdminAgentOpsPage';
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
    case 'admin-dashboard':
      return (
        <ProtectedRoute onNavigate={handleNavigate} requireAdmin>
          <AdminDashboardPage />
        </ProtectedRoute>
      );
    case 'admin-athletes':
      return (
        <ProtectedRoute onNavigate={handleNavigate} requireAdmin>
          <AdminAthletesPage />
        </ProtectedRoute>
      );
    case 'admin-parent-intake':
      return (
        <ProtectedRoute onNavigate={handleNavigate} requireAdmin>
          <AdminParentIntakePage />
        </ProtectedRoute>
      );
    case 'admin-agent-ops':
      return (
        <ProtectedRoute onNavigate={handleNavigate} requireAdmin>
          <AdminAgentOpsPage />
        </ProtectedRoute>
      );
    default:
      return <HomePage onNavigate={handleNavigate} />;
  }
};

  return (
    <div className="min-h-screen bg-white">
      <Header onNavigate={handleNavigate} currentPage={currentPage} />
      <main>{renderPage()}</main>
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

import { ReactNode } from 'react';
import { useAuth } from '../context/AuthContext';

interface ProtectedRouteProps {
  children: ReactNode;
  onNavigate: (page: string) => void;
  requireAdmin?: boolean;
}

export default function ProtectedRoute({ children, onNavigate, requireAdmin = false }: ProtectedRouteProps) {
  const { session, user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="w-8 h-8 border-4 border-gold border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!session) {
    onNavigate('signin');
    return null;
  }

  if (requireAdmin) {
    const role = user?.app_metadata?.role;
    if (role !== 'admin') {
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <div className="bg-white rounded-2xl shadow-lg p-10 max-w-md w-full text-center border border-gray-100">
            <div className="w-14 h-14 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-7 h-7 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
              </svg>
            </div>
            <h2 className="text-xl font-bold text-navy mb-2">Access Restricted</h2>
            <p className="text-gray-500 text-sm mb-6">You don't have permission to view this page. Admin access required.</p>
            <button
              onClick={() => onNavigate('home')}
              className="btn-primary px-6 py-2.5 text-sm"
            >
              Back to Home
            </button>
          </div>
        </div>
      );
    }
  }

  return <>{children}</>;
}

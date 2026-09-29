import type { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

interface ProtectedRouteProps {
  children: ReactNode;
  requireAdmin?: boolean;
  requireNavigator?: boolean;
}

export function ProtectedRoute({ children, requireAdmin, requireNavigator }: ProtectedRouteProps) {
  const { user, loading, isAdmin, isNavigator } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-amber-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/signin" replace />;
  }

  if (requireAdmin && !isAdmin) {
    return <Navigate to="/dashboard" replace />;
  }

  if (requireNavigator && !isAdmin && !isNavigator) {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
}

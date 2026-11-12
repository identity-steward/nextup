import { Link } from 'react-router-dom';
import { Shield } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export function AthleteDashboardPage() {
  const { isAdmin } = useAuth();

  return (
    <div className="min-h-screen bg-gray-50 pt-20">
      <div className="max-w-4xl mx-auto px-6 py-8">
        <h1 className="text-2xl font-bold text-[#1a1f3a] mb-4">Athlete Dashboard</h1>
        <p className="text-gray-500 text-sm mb-6">Your athlete dashboard.</p>

        {isAdmin && (
          <Link
            to="/admin"
            className="inline-flex items-center gap-2 bg-[#1a1f3a] hover:bg-[#2a2f4a] text-white font-semibold text-sm px-5 py-3 rounded-xl transition-colors"
          >
            <Shield className="w-4 h-4" />
            Administrator Dashboard
          </Link>
        )}
      </div>
    </div>
  );
}

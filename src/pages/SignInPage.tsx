import { useState, FormEvent } from 'react';
import { LogIn, UserPlus } from 'lucide-react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { supabase } from '../lib/supabase';

export default function SignInPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const { data, error } = await supabase.auth.signInWithPassword({ email, password });

    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }

    const appRole = data.user?.app_metadata?.role;
    if (appRole === 'admin') {
      navigate('/admin');
      return;
    }

    const params = new URLSearchParams(location.search);
    const nextParam = params.get('next');
    const fromState = (location.state as { from?: { pathname?: string } } | null)?.from?.pathname;
    const safeNext = (nextParam ?? fromState ?? '').startsWith('/') ? (nextParam ?? fromState ?? '') : '';

    const { data: profileData } = await supabase
      .from('user_profiles')
      .select('role')
      .eq('id', data.user.id)
      .maybeSingle();

    if (profileData?.role === 'admin') {
      navigate('/admin');
    } else if (safeNext) {
      navigate(safeNext);
    } else if (profileData?.role === 'parent') {
      navigate('/parent-dashboard');
    } else {
      navigate('/dashboard');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-navy via-navy-light to-navy pt-32 pb-24">
      <div className="max-w-md mx-auto px-6">
        <div className="bg-white rounded-3xl shadow-2xl p-8 md:p-12">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-gold/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <LogIn className="w-8 h-8 text-gold" />
            </div>
            <h1 className="text-3xl font-bold text-navy mb-2">Welcome Back</h1>
            <p className="text-gray-600">Sign in to your NextUp account</p>
          </div>

          <form className="space-y-6" onSubmit={handleSubmit}>
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 text-sm">
                {error}
              </div>
            )}

            <div>
              <label className="block text-sm font-semibold text-navy mb-2">
                Email Address
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-gold focus:outline-none transition-colors"
                placeholder="you@example.com"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-sm font-semibold text-navy">
                  Password
                </label>
                <Link
                  to="/forgot-password"
                  className="text-xs font-semibold text-gold hover:text-gold-dark transition-colors"
                >
                  Forgot password?
                </Link>
              </div>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-gold focus:outline-none transition-colors"
                placeholder="Enter your password"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full btn-primary py-3 text-lg disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>

          <div className="mt-8 pt-6 border-t border-gray-200 space-y-3 text-center">
            <p className="text-gray-500 text-sm">
              Are you an athlete or parent?{' '}
              <Link
                to="/signup"
                className="text-gold font-semibold hover:text-gold-dark transition-colors inline-flex items-center gap-1"
              >
                <UserPlus className="w-3.5 h-3.5" />
                Get started free
              </Link>
            </p>
            <p className="text-gray-400 text-xs">
              Once your profile is approved, we'll send your login credentials.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

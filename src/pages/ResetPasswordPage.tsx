import { useState, useEffect } from 'react';
import { ShieldCheck, ArrowLeft } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';

type PageState = 'waiting' | 'ready' | 'expired' | 'success';

export default function ResetPasswordPage() {
  const navigate = useNavigate();
  const [pageState, setPageState] = useState<PageState>('waiting');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'PASSWORD_RECOVERY') {
        setPageState('ready');
      }
    });

    // If Supabase has already processed the URL hash before this component mounted,
    // check for an existing recovery session.
    (async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        setPageState('ready');
      } else {
        // Give onAuthStateChange time to fire; if nothing after 3s, treat as expired.
        const timer = setTimeout(() => {
          setPageState(prev => prev === 'waiting' ? 'expired' : prev);
        }, 3000);
        return () => clearTimeout(timer);
      }
    })();

    return () => subscription.unsubscribe();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (password !== confirm) {
      setError('Passwords do not match.');
      return;
    }
    if (password.length < 8) {
      setError('Password must be at least 8 characters.');
      return;
    }

    setLoading(true);
    const { error } = await supabase.auth.updateUser({ password });
    setLoading(false);

    if (error) {
      setError(error.message);
      return;
    }

    setPageState('success');
    setTimeout(() => navigate('/signin'), 2500);
  };

  if (pageState === 'waiting') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-navy via-navy-light to-navy pt-32 pb-24 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-gold border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (pageState === 'expired') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-navy via-navy-light to-navy pt-32 pb-24">
        <div className="max-w-md mx-auto px-6">
          <div className="bg-white rounded-3xl shadow-2xl p-8 md:p-12 text-center">
            <div className="w-16 h-16 bg-red-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <ShieldCheck className="w-8 h-8 text-red-500" />
            </div>
            <h1 className="text-2xl font-bold text-navy mb-3">Link expired</h1>
            <p className="text-gray-600 text-sm leading-relaxed mb-8">
              This password reset link is invalid or has expired. Reset links are only valid for 1 hour.
            </p>
            <Link
              to="/forgot-password"
              className="btn-primary px-6 py-3 text-sm inline-block mb-4"
            >
              Request a new link
            </Link>
            <div className="mt-2">
              <Link
                to="/signin"
                className="inline-flex items-center gap-2 text-sm font-semibold text-gray-500 hover:text-navy transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                Back to sign in
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (pageState === 'success') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-navy via-navy-light to-navy pt-32 pb-24">
        <div className="max-w-md mx-auto px-6">
          <div className="bg-white rounded-3xl shadow-2xl p-8 md:p-12 text-center">
            <div className="w-16 h-16 bg-green-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <ShieldCheck className="w-8 h-8 text-green-600" />
            </div>
            <h1 className="text-2xl font-bold text-navy mb-3">Password updated</h1>
            <p className="text-gray-600 text-sm">
              Your password has been changed. Redirecting you to sign in...
            </p>
          </div>
        </div>
      </div>
    );
  }

  // pageState === 'ready'
  return (
    <div className="min-h-screen bg-gradient-to-br from-navy via-navy-light to-navy pt-32 pb-24">
      <div className="max-w-md mx-auto px-6">
        <div className="bg-white rounded-3xl shadow-2xl p-8 md:p-12">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-gold/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <ShieldCheck className="w-8 h-8 text-gold" />
            </div>
            <h1 className="text-3xl font-bold text-navy mb-2">Set new password</h1>
            <p className="text-gray-600 text-sm">Choose a strong password for your account.</p>
          </div>

          <form className="space-y-6" onSubmit={handleSubmit}>
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 text-sm">
                {error}
              </div>
            )}

            <div>
              <label className="block text-sm font-semibold text-navy mb-2">
                New Password
              </label>
              <input
                type="password"
                required
                minLength={8}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-gold focus:outline-none transition-colors"
                placeholder="At least 8 characters"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-navy mb-2">
                Confirm Password
              </label>
              <input
                type="password"
                required
                minLength={8}
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-gold focus:outline-none transition-colors"
                placeholder="Repeat your password"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full btn-primary py-3 text-lg disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {loading ? 'Updating...' : 'Update Password'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

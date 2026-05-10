import { useState } from 'react';
import { UserPlus, ArrowRight, AlertCircle, Eye, EyeOff, Tag, CheckCircle } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';

export default function JoinPage() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
    eventCode: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [showError, setShowError] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [codeStatus, setCodeStatus] = useState<'idle' | 'valid' | 'invalid'>('idle');
  const [codeChecking, setCodeChecking] = useState(false);

  const set = (field: string, value: string) =>
    setFormData(prev => ({ ...prev, [field]: value }));

  const checkEventCode = async (code: string) => {
    if (!code.trim()) { setCodeStatus('idle'); return; }
    setCodeChecking(true);
    const { data } = await supabase.rpc('validate_event_code', { p_code: code.trim() });
    setCodeStatus(data ? 'valid' : 'invalid');
    setCodeChecking(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setShowError(false);
    setErrorMessage('');

    if (!formData.firstName.trim() || !formData.lastName.trim()) {
      setShowError(true); setErrorMessage('First and last name are required.'); return;
    }
    if (formData.password.length < 8) {
      setShowError(true); setErrorMessage('Password must be at least 8 characters.'); return;
    }
    if (formData.password !== formData.confirmPassword) {
      setShowError(true); setErrorMessage('Passwords do not match.'); return;
    }

    setSubmitting(true);

    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: formData.email,
      password: formData.password,
      options: {
        data: {
          role: 'athlete',
          display_name: `${formData.firstName.trim()} ${formData.lastName.trim()}`,
        },
      },
    });

    if (authError || !authData.user) {
      setShowError(true);
      setErrorMessage(authError?.message || 'Signup failed. Please try again.');
      setSubmitting(false);
      return;
    }

    if (formData.eventCode.trim()) {
      sessionStorage.setItem('signup_event_code', formData.eventCode.trim());
    }
    sessionStorage.setItem('signup_first_name', formData.firstName.trim());
    sessionStorage.setItem('signup_last_name', formData.lastName.trim());
    sessionStorage.setItem('signup_role', 'athlete');

    navigate('/profile-setup');
  };

  const inputCls = 'w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-amber-500 focus:outline-none transition-colors text-sm text-gray-900';

  return (
    <div className="min-h-screen bg-gray-50 pt-20">
      <section className="bg-[#0f1923] text-white py-14">
        <div className="max-w-xl mx-auto px-6 text-center">
          <div className="inline-flex items-center gap-2 bg-amber-500/20 text-amber-400 px-4 py-2 rounded-full text-xs font-bold uppercase tracking-widest mb-5 border border-amber-500/30">
            <UserPlus className="w-3.5 h-3.5" />
            Player Signup
          </div>
          <h1 className="text-4xl font-black mb-3">Create Your Player Account</h1>
          <p className="text-gray-400 text-base">
            Build your free athlete profile and start getting discovered.
          </p>
        </div>
      </section>

      <section className="py-12">
        <div className="max-w-lg mx-auto px-6">
          {showError && (
            <div className="bg-red-50 border-2 border-red-200 rounded-xl p-4 mb-6 flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-500 mt-0.5 flex-shrink-0" />
              <p className="text-red-800 text-sm font-medium">{errorMessage}</p>
            </div>
          )}

          <div className="bg-white rounded-3xl shadow-lg border border-gray-100 p-8">
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-800 mb-1.5">First Name *</label>
                  <input
                    type="text"
                    required
                    value={formData.firstName}
                    onChange={e => set('firstName', e.target.value)}
                    className={inputCls}
                    placeholder="Marcus"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-800 mb-1.5">Last Name *</label>
                  <input
                    type="text"
                    required
                    value={formData.lastName}
                    onChange={e => set('lastName', e.target.value)}
                    className={inputCls}
                    placeholder="Johnson"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-800 mb-1.5">Email *</label>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={e => set('email', e.target.value)}
                  className={inputCls}
                  placeholder="you@email.com"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-800 mb-1.5">Password *</label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={formData.password}
                    onChange={e => set('password', e.target.value)}
                    className={`${inputCls} pr-11`}
                    placeholder="Min 8 characters"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(p => !p)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-800 mb-1.5">Confirm Password *</label>
                <input
                  type="password"
                  required
                  value={formData.confirmPassword}
                  onChange={e => set('confirmPassword', e.target.value)}
                  className={inputCls}
                  placeholder="Re-enter password"
                />
              </div>

              <div className="border-t border-gray-100 pt-4">
                <label className="block text-sm font-semibold text-gray-800 mb-1.5">
                  Event / Tournament Code
                  <span className="ml-2 text-xs font-normal text-gray-400">(optional)</span>
                </label>
                <div className="relative">
                  <Tag className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    value={formData.eventCode}
                    onChange={e => {
                      set('eventCode', e.target.value);
                      setCodeStatus('idle');
                    }}
                    onBlur={() => checkEventCode(formData.eventCode)}
                    className={`${inputCls} pl-10 pr-10 uppercase tracking-widest`}
                    placeholder="e.g. NEXTUP2026"
                  />
                  {codeChecking && (
                    <div className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 border-2 border-amber-400 border-t-transparent rounded-full animate-spin" />
                  )}
                  {!codeChecking && codeStatus === 'valid' && (
                    <CheckCircle className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-green-500" />
                  )}
                  {!codeChecking && codeStatus === 'invalid' && (
                    <AlertCircle className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-red-400" />
                  )}
                </div>
                {codeStatus === 'valid' && (
                  <p className="text-green-600 text-xs mt-1.5 font-medium">Valid code — your profile will be verified automatically.</p>
                )}
                {codeStatus === 'invalid' && (
                  <p className="text-red-500 text-xs mt-1.5">Code not recognized. Profile will be reviewed by our team.</p>
                )}
                {codeStatus === 'idle' && (
                  <p className="text-gray-400 text-xs mt-1.5">Valid codes give instant approval. Others are reviewed within 48 hours.</p>
                )}
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full bg-amber-500 hover:bg-amber-400 disabled:opacity-50 disabled:cursor-not-allowed text-white font-black py-4 rounded-xl text-base flex items-center justify-center gap-2 transition-all duration-200 shadow-[0_0_20px_rgba(245,158,11,0.25)] hover:shadow-[0_0_28px_rgba(245,158,11,0.4)] mt-2"
              >
                {submitting ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Creating Account...
                  </>
                ) : (
                  <>
                    Create Account
                    <ArrowRight className="w-5 h-5" />
                  </>
                )}
              </button>
            </form>

            <div className="mt-6 space-y-2 text-center">
              <p className="text-sm text-gray-500">
                Already have an account?{' '}
                <Link to="/signin" className="text-amber-600 font-semibold hover:underline">Sign in</Link>
              </p>
              <p className="text-sm text-gray-500">
                Are you a parent?{' '}
                <Link to="/signup/parent" className="text-amber-600 font-semibold hover:underline">Parent signup here</Link>
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

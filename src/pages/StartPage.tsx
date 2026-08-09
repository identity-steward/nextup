import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowRight, MessageCircle, Compass } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { getPersonForUser, getOrCreatePerson, createHousehold } from '../services/narrationService';

export default function StartPage() {
  const { session, user } = useAuth();
  const navigate = useNavigate();
  const [checking, setChecking] = useState(false);
  const [firstName, setFirstName] = useState('');
  const [showNameInput, setShowNameInput] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const hasSession = !!session;

  useEffect(() => {
    if (hasSession) {
      // Check if person already exists
      (async () => {
        if (!user?.id) return;
        const person = await getPersonForUser(user.id);
        if (person) {
          // Person exists — go to app
          navigate('/app');
        }
      })();
    }
  }, [hasSession, user?.id, navigate]);

  const handleStart = async () => {
    if (!hasSession) {
      navigate('/signin', { state: { from: '/start' } });
      return;
    }

    if (!user?.id) return;

    // Check if person already exists
    const existing = await getPersonForUser(user.id);
    if (existing) {
      navigate('/app');
      return;
    }

    // Need first name to create person
    if (!showNameInput) {
      setShowNameInput(true);
      return;
    }

    if (firstName.trim().length === 0) return;

    setChecking(true);
    setError(null);
    try {
      const person = await getOrCreatePerson(user.id, firstName.trim());
      const household = await createHousehold(person.id);
      void household;
      navigate('/app');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      setChecking(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 pt-20">
      <section className="bg-gradient-to-br from-navy via-navy-light to-navy text-white py-20">
        <div className="max-w-4xl mx-auto px-6 lg:px-8 text-center">
          <div className="inline-flex items-center gap-2 bg-gold/20 text-gold px-4 py-2 rounded-full text-sm font-semibold mb-6 border border-gold/30">
            <Compass className="w-4 h-4" />
            Start My NextUp
          </div>
          <h1 className="text-4xl md:text-5xl font-bold mb-6">
            Start My NextUp
          </h1>
          <p className="text-2xl text-gray-200 max-w-2xl mx-auto mb-4">
            What's happening?
          </p>
          <p className="text-lg text-gray-400 max-w-2xl mx-auto">
            You don't have to know what program you need. Start wherever makes sense.
          </p>
        </div>
      </section>

      <section className="py-16">
        <div className="max-w-2xl mx-auto px-6 lg:px-8">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl p-4 text-sm mb-6">
              {error}
            </div>
          )}

          {!hasSession && (
            <div className="bg-white rounded-2xl shadow-lg p-8 md:p-12 text-center mb-6">
              <MessageCircle className="w-12 h-12 text-gold mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-navy mb-3">
                Tell us what's happening.
              </h2>
              <p className="text-gray-600 leading-relaxed mb-8">
                NextUp starts with your story. You'll need an account so your
                story stays yours. It's quick.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <button
                  onClick={handleStart}
                  className="inline-flex items-center justify-center gap-2 bg-gold hover:bg-amber-400 text-navy font-black px-8 py-4 rounded-xl transition-all uppercase tracking-wide"
                >
                  Get Started
                  <ArrowRight className="w-5 h-5" />
                </button>
                <Link
                  to="/signin"
                  className="inline-flex items-center justify-center gap-2 bg-gray-100 hover:bg-gray-200 text-navy font-semibold px-8 py-4 rounded-xl transition-colors"
                >
                  Sign In
                </Link>
              </div>
            </div>
          )}

          {hasSession && !showNameInput && (
            <div className="bg-white rounded-2xl shadow-lg p-8 md:p-12 text-center">
              <MessageCircle className="w-12 h-12 text-gold mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-navy mb-3">
                What's happening?
              </h2>
              <p className="text-gray-600 leading-relaxed mb-8">
                You're signed in. Tell us what's going on and we'll help
                organize what may come next.
              </p>
              <button
                onClick={handleStart}
                className="inline-flex items-center justify-center gap-2 bg-gold hover:bg-amber-400 text-navy font-black px-8 py-4 rounded-xl transition-all uppercase tracking-wide"
              >
                Start
                <ArrowRight className="w-5 h-5" />
              </button>
            </div>
          )}

          {hasSession && showNameInput && (
            <div className="bg-white rounded-2xl shadow-lg p-8 md:p-12">
              <h2 className="text-2xl font-bold text-navy mb-2">What should we call you?</h2>
              <p className="text-gray-500 mb-6 text-sm">
                Just your first name is fine. You don't need to fill out a long form.
              </p>
              <input
                type="text"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                placeholder="First name"
                autoFocus
                className="w-full rounded-xl border-2 border-gray-200 focus:border-gold p-4 text-lg mb-4"
                onKeyDown={(e) => { if (e.key === 'Enter' && !checking) handleStart(); }}
              />
              <button
                onClick={handleStart}
                disabled={checking || firstName.trim().length === 0}
                className="w-full inline-flex items-center justify-center gap-2 bg-gold hover:bg-amber-400 text-navy font-black px-8 py-4 rounded-xl transition-all uppercase tracking-wide disabled:opacity-50"
              >
                {checking ? 'Setting up...' : 'Continue'}
                {!checking && <ArrowRight className="w-5 h-5" />}
              </button>
            </div>
          )}

          <p className="text-center text-gray-400 text-sm mt-8">
            Want to learn more?{' '}
            <Link to="/how-it-works" className="text-gold hover:underline font-medium">
              See How It Works
            </Link>
          </p>
        </div>
      </section>
    </div>
  );
}

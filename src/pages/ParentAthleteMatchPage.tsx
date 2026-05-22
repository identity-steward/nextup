import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Users, ArrowRight, Plus, User } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';

interface AthleteMatch {
  id: string;
  slug: string;
  first_name: string;
  last_initial: string;
  sport: string;
  grade: string;
  school: string | null;
  city: string | null;
  image_url: string | null;
  managed_by_parent_id: string | null;
}

type PageState = 'checking' | 'no_matches' | 'matches_found' | 'confirming';

export default function ParentAthleteMatchPage() {
  const navigate = useNavigate();
  const { user, refreshProfile } = useAuth();
  const [pageState, setPageState] = useState<PageState>('checking');
  const [matches, setMatches] = useState<AthleteMatch[]>([]);
  const [error, setError] = useState('');

  const firstName = sessionStorage.getItem('signup_first_name') || '';
  const lastName = sessionStorage.getItem('signup_last_name') || '';
  const signupRole = sessionStorage.getItem('signup_role') || '';

  useEffect(() => {
    if (signupRole !== 'parent' || !firstName || !lastName) {
      navigate('/signup', { replace: true });
      return;
    }
    if (!user) return;
    runCheck();
  }, [user]);

  const runCheck = async () => {
    setPageState('checking');
    const lastInitial = lastName.trim().charAt(0).toUpperCase();

    const { data, error: queryError } = await supabase
      .from('athletes')
      .select('id, slug, first_name, last_initial, sport, grade, school, city, image_url, managed_by_parent_id')
      .ilike('first_name', firstName.trim())
      .ilike('last_initial', lastInitial)
      .in('profile_status', ['active', 'approved', 'verified_event']);

    if (queryError) {
      // On error, fall through to profile setup rather than blocking the user
      navigate('/profile-setup', { replace: true });
      return;
    }

    if (!data || data.length === 0) {
      navigate('/profile-setup', { replace: true });
      return;
    }

    setMatches(data as AthleteMatch[]);
    setPageState('matches_found');
  };

  const handleConfirmMatch = async (matched: AthleteMatch) => {
    if (!user) return;
    setPageState('confirming');
    setError('');

    // Link parent's user_profiles row to the matched athlete
    const { error: profileError } = await supabase
      .from('user_profiles')
      .upsert({ id: user.id, athlete_id: matched.id, role: 'parent' }, { onConflict: 'id' });

    if (profileError) {
      // Fallback: plain update
      const { error: retryError } = await supabase
        .from('user_profiles')
        .update({ athlete_id: matched.id, role: 'parent' })
        .eq('id', user.id);

      if (retryError) {
        setError('Failed to link your account. Please try again or contact support.');
        setPageState('matches_found');
        return;
      }
    }

    // Set managed_by_parent_id only if currently unset
    if (!matched.managed_by_parent_id) {
      await supabase
        .from('athletes')
        .update({ managed_by_parent_id: user.id })
        .eq('id', matched.id)
        .is('managed_by_parent_id', null);
    }

    // Clear signup sessionStorage
    ['signup_event_code', 'signup_first_name', 'signup_last_name', 'signup_role'].forEach(k =>
      sessionStorage.removeItem(k)
    );

    await refreshProfile();
    navigate('/parent-dashboard', { replace: true });
  };

  const handleCreateNew = () => {
    navigate('/profile-setup', { replace: true });
  };

  if (pageState === 'checking') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 pt-20">
        <div className="text-center">
          <div className="w-10 h-10 border-4 border-sky-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-500 text-sm">Checking for existing profiles...</p>
        </div>
      </div>
    );
  }

  if (pageState === 'confirming') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 pt-20">
        <div className="text-center">
          <div className="w-10 h-10 border-4 border-sky-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-500 text-sm">Linking your account...</p>
        </div>
      </div>
    );
  }

  const displayName = `${firstName} ${lastName.charAt(0).toUpperCase()}.`;

  return (
    <div className="min-h-screen bg-gray-50 pt-20">
      <section className="bg-[#0f1923] text-white py-14">
        <div className="max-w-xl mx-auto px-6 text-center">
          <div className="inline-flex items-center gap-2 bg-sky-500/20 text-sky-400 px-4 py-2 rounded-full text-xs font-bold uppercase tracking-widest mb-5 border border-sky-500/30">
            <Users className="w-3.5 h-3.5" />
            Athlete Found
          </div>
          <h1 className="text-3xl font-black mb-3">
            We found {matches.length === 1 ? 'a profile' : 'profiles'} for {firstName}
          </h1>
          <p className="text-gray-400 text-base">
            {matches.length === 1
              ? 'Is this your athlete? Linking to an existing profile keeps all their information together.'
              : 'Is one of these your athlete? Linking to an existing profile keeps all their information together.'}
          </p>
        </div>
      </section>

      <section className="py-12">
        <div className="max-w-lg mx-auto px-6 space-y-4">
          {error && (
            <div className="bg-red-50 border-2 border-red-200 rounded-xl p-4 flex items-start gap-3">
              <span className="text-red-500 text-sm font-medium">{error}</span>
            </div>
          )}

          {matches.map(match => (
            <div key={match.id} className="bg-white rounded-2xl border-2 border-gray-100 p-6 shadow-sm">
              <div className="flex items-start gap-4">
                <div className="w-16 h-16 rounded-xl bg-navy/10 overflow-hidden shrink-0">
                  {match.image_url ? (
                    <img src={match.image_url} alt={match.first_name} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <User className="w-7 h-7 text-navy/30" />
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-lg font-bold text-navy">
                    {match.first_name} {match.last_initial}.
                  </h3>
                  <p className="text-sky-600 font-semibold text-sm">{match.sport}</p>
                  <div className="mt-2 space-y-0.5 text-sm text-gray-500">
                    {match.grade && <p>{match.grade}</p>}
                    {match.school && <p>{match.school}</p>}
                    {match.city && <p>{match.city}</p>}
                  </div>
                </div>
              </div>

              <div className="mt-5 flex flex-col sm:flex-row gap-3">
                <button
                  onClick={() => handleConfirmMatch(match)}
                  className="flex-1 bg-navy hover:bg-navy/90 text-white font-bold py-3 px-5 rounded-xl text-sm flex items-center justify-center gap-2 transition-colors"
                >
                  Yes, this is {match.first_name}
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}

          <div className="bg-white rounded-2xl border-2 border-dashed border-gray-200 p-6">
            <p className="text-gray-600 text-sm font-semibold mb-1">
              Not seeing your athlete above?
            </p>
            <p className="text-gray-400 text-sm mb-4">
              Create a new profile for {displayName} and our team will review it within 48 hours.
            </p>
            <button
              onClick={handleCreateNew}
              className="inline-flex items-center gap-2 bg-gray-100 hover:bg-gray-200 text-gray-800 font-bold py-2.5 px-5 rounded-xl text-sm transition-colors"
            >
              <Plus className="w-4 h-4" />
              Create a new athlete profile
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}

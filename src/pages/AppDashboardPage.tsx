import { useState, useEffect, useCallback } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Loader2, Lock, Compass, Share2, CheckCircle, ArrowRight } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import AppLayout from '../components/narration/AppLayout';
import HouseholdSummary from '../components/narration/HouseholdSummary';
import NeedList from '../components/narration/NeedList';
import NextActionCard from '../components/narration/NextActionCard';
import {
  getPersonForUser,
  getHouseholdForPerson,
  getLatestNarration,
  getNeeds,
} from '../services/narrationService';
import { getPathwaysForPerson, getReferralsForHousehold } from '../services/pathwayService';
import { getOutcomesForPerson } from '../services/outcomeService';
import type {
  Person,
  HouseholdWithMembers,
  PersonNarration,
  Need,
  NarrationStatus,
} from '../types/narration';
import type { PathwayWithRelations, ReferralWithRelations } from '../types/pathway';
import type { OutcomeWithRelations } from '../types/outcome';

export default function AppDashboardPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [person, setPerson] = useState<Person | null>(null);
  const [household, setHousehold] = useState<HouseholdWithMembers | null>(null);
  const [narration, setNarration] = useState<PersonNarration | null>(null);
  const [needs, setNeeds] = useState<Need[]>([]);
  const [pathways, setPathways] = useState<PathwayWithRelations[]>([]);
  const [referrals, setReferrals] = useState<ReferralWithRelations[]>([]);
  const [outcomes, setOutcomes] = useState<OutcomeWithRelations[]>([]);
  const [loading, setLoading] = useState(true);

  const loadData = useCallback(async () => {
    if (!user?.id) return;
    try {
      const p = await getPersonForUser(user.id);
      if (!p) {
        navigate('/start');
        return;
      }
      setPerson(p);
      const [h, n, nds, pws] = await Promise.all([
        getHouseholdForPerson(p.id),
        getLatestNarration(p.id),
        getNeeds(p.id),
        getPathwaysForPerson(p.id),
      ]);
      setHousehold(h);
      setNarration(n);
      setNeeds(nds);
      setPathways(pws);

      const [ocs] = await Promise.all([
        h ? getOutcomesForPerson(p.id) : Promise.resolve([]),
      ]);
      setOutcomes(ocs);

      if (h) {
        const rfs = await getReferralsForHousehold(h.id);
        setReferrals(rfs);
      }
    } catch (err) {
      console.error('Failed to load dashboard:', err);
    } finally {
      setLoading(false);
    }
  }, [user?.id, navigate]);

  useEffect(() => { void loadData(); }, [loadData]);

  if (loading) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-gold" />
        </div>
      </AppLayout>
    );
  }

  if (!person) return null;

  const narrationStatus: NarrationStatus | 'none' | 'draft' =
    !narration ? 'none' : narration.status === 'draft' ? 'draft' : narration.status;

  return (
    <AppLayout>
      <div className="max-w-3xl mx-auto space-y-6 pb-20 lg:pb-0">
        {/* Greeting */}
        <div>
          <h1 className="text-3xl font-bold text-navy mb-2">My NextUp</h1>
          <p className="text-gray-500 leading-relaxed">
            This is your space. Here you can tell us what's happening, see what
            we heard, and keep track of what comes next.
          </p>
        </div>

        {/* Next Action */}
        <NextActionCard
          narrationStatus={narrationStatus}
          onAction={() => navigate('/app/story')}
        />

        {/* Household */}
        <HouseholdSummary household={household} />

        {/* What You've Told Us */}
        <div className="bg-white rounded-2xl shadow-sm p-6">
          <h3 className="font-bold text-navy mb-2">What You've Told Us</h3>
          {narration ? (
            <div>
              <p className="text-gray-600 text-sm leading-relaxed mb-3">
                {narration.confirmed_interpretation ?? narration.proposed_interpretation ?? narration.original_text}
              </p>
              <button
                onClick={() => navigate('/app/story')}
                className="text-sm text-gold hover:underline font-medium"
              >
                View your story
              </button>
            </div>
          ) : (
            <p className="text-gray-400 text-sm">
              You haven't told us your story yet.
            </p>
          )}
        </div>

        {/* What We're Working On */}
        <NeedList needs={needs} />

        {/* Pathways & Sharing */}
        <div className="grid sm:grid-cols-2 gap-4">
          <button
            onClick={() => navigate('/app/pathways')}
            className="flex items-center gap-3 bg-white rounded-2xl shadow-sm p-5 hover:shadow-md transition-all text-left border border-gray-100"
          >
            <div className="w-10 h-10 bg-gold/10 rounded-lg flex items-center justify-center">
              <Compass className="w-5 h-5 text-gold" />
            </div>
            <div className="flex-1">
              <p className="font-medium text-navy text-sm">Pathways</p>
              <p className="text-xs text-gray-400">
                {pathways.filter((p) => !['closed', 'completed'].includes(p.status)).length} active pathway{pathways.filter((p) => !['closed', 'completed'].includes(p.status)).length !== 1 ? 's' : ''}
              </p>
            </div>
            <ArrowRight className="w-4 h-4 text-gray-300" />
          </button>
          <button
            onClick={() => navigate('/app/share')}
            className="flex items-center gap-3 bg-white rounded-2xl shadow-sm p-5 hover:shadow-md transition-all text-left border border-gray-100"
          >
            <div className="w-10 h-10 bg-gold/10 rounded-lg flex items-center justify-center">
              <Share2 className="w-5 h-5 text-gold" />
            </div>
            <div className="flex-1">
              <p className="font-medium text-navy text-sm">Sharing</p>
              <p className="text-xs text-gray-400">Share with permission</p>
            </div>
            <ArrowRight className="w-4 h-4 text-gray-300" />
          </button>
        </div>

        {/* Open Referrals */}
        {referrals.filter((r) => !['completed', 'cancelled', 'expired', 'person_declined', 'declined', 'closed'].includes(r.status)).length > 0 && (
          <div className="bg-white rounded-2xl shadow-sm p-5">
            <h3 className="font-bold text-navy mb-3 text-sm">Open Referrals</h3>
            <div className="space-y-2">
              {referrals.filter((r) => !['completed', 'cancelled', 'expired', 'person_declined', 'declined', 'closed'].includes(r.status)).map((r) => (
                <div key={r.id} className="flex items-center justify-between gap-3 text-sm">
                  <span className="text-gray-600">{r.recipient_name}</span>
                  <span className="text-xs text-gray-400 capitalize">{r.status.replace(/_/g, ' ')}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* What Happened? */}
        <button
          onClick={() => navigate('/app/outcome')}
          className="w-full flex items-center gap-3 bg-white rounded-2xl shadow-sm p-5 hover:shadow-md transition-all text-left border border-gray-100"
        >
          <div className="w-10 h-10 bg-gold/10 rounded-lg flex items-center justify-center">
            <CheckCircle className="w-5 h-5 text-gold" />
          </div>
          <div className="flex-1">
            <p className="font-medium text-navy text-sm">What Happened?</p>
            <p className="text-xs text-gray-400">
              {outcomes.length > 0
                ? `${outcomes.length} outcome${outcomes.length !== 1 ? 's' : ''} shared`
                : 'Tell us what happened with your connections'}
            </p>
          </div>
          <ArrowRight className="w-4 h-4 text-gray-300" />
        </button>

        {/* Latest Outcome Feedback */}
        {outcomes.length > 0 && (() => {
          const latest = outcomes[0];
          const msg = latest.next_action ?? 'Check back for updates.';
          const connectedLabel = latest.connected_status.replace(/_/g, ' ');
          return (
            <div className="bg-navy/5 rounded-2xl p-5">
              <h3 className="font-bold text-navy mb-2 text-sm">Latest Update</h3>
              <p className="text-sm text-gray-600 leading-relaxed">{msg}</p>
              <p className="text-xs text-gray-400 mt-2">
                Connection: {connectedLabel}
                {latest.referral && ` · ${latest.referral.recipient_name}`}
              </p>
            </div>
          );
        })()}

        {/* Coming Later */}
        <div className="bg-gray-50 rounded-2xl p-6 border border-gray-100">
          <h3 className="font-bold text-navy mb-4">Coming Later</h3>
          <div className="text-sm text-gray-400">
            Community learning features may be added after Pilot 001.
          </div>
        </div>

        {/* Privacy reminder */}
        <div className="flex items-start gap-3 bg-navy/5 rounded-xl p-4">
          <Lock className="w-5 h-5 text-navy flex-shrink-0 mt-0.5" />
          <p className="text-sm text-gray-600 leading-relaxed">
            Your story is private. NextUp doesn't share it without your
            involvement.{' '}
            <Link to="/app/privacy" className="text-gold hover:underline font-medium">
              Learn about Privacy &amp; Trust
            </Link>
          </p>
        </div>
      </div>
    </AppLayout>
  );
}

import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import AppLayout from '../components/narration/AppLayout';
import NarrationInput from '../components/narration/NarrationInput';
import InterpretationPreview from '../components/narration/InterpretationPreview';
import ConfirmModifyReject from '../components/narration/ConfirmModifyReject';
import NeedReview from '../components/narration/NeedReview';
import { Loader2 } from 'lucide-react';
import {
  getPersonForUser,
  getHouseholdForPerson,
  getLatestNarration,
  confirmNarration,
  rejectNarration,
  parseInterpretationToProposedNeeds,
  createReviewedNeeds,
  type ProposedNeed,
} from '../services/narrationService';
import type { Person, HouseholdWithMembers, PersonNarration } from '../types/narration';

type StoryStep = 'input' | 'submitted' | 'proposed' | 'need_review' | 'confirmed' | 'modified' | 'rejected';

export default function StoryPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [person, setPerson] = useState<Person | null>(null);
  const [household, setHousehold] = useState<HouseholdWithMembers | null>(null);
  const [narration, setNarration] = useState<PersonNarration | null>(null);
  const [loading, setLoading] = useState(true);
  const [proposedNeeds, setProposedNeeds] = useState<ProposedNeed[]>([]);

  const loadData = useCallback(async () => {
    if (!user?.id) return;
    try {
      const p = await getPersonForUser(user.id);
      if (!p) {
        navigate('/start');
        return;
      }
      setPerson(p);
      const h = await getHouseholdForPerson(p.id);
      setHousehold(h);
      const n = await getLatestNarration(p.id);
      setNarration(n);
    } catch (err) {
      console.error('Failed to load story data:', err);
    } finally {
      setLoading(false);
    }
  }, [user?.id, navigate]);

  useEffect(() => { void loadData(); }, [loadData]);

  const step: StoryStep = (() => {
    if (!narration) return 'input';
    if (narration.status === 'draft') return 'input';
    if (narration.status === 'submitted') return 'submitted';
    if (narration.status === 'proposed') return 'proposed';
    if (narration.status === 'confirmed') return 'confirmed';
    if (narration.status === 'modified') return 'modified';
    if (narration.status === 'rejected') return 'rejected';
    return 'input';
  })();

  const handleConfirmed = async (interpretation: string, _modified: boolean) => {
    if (!narration || !person) return;
    const updated = await confirmNarration(narration.id, interpretation, _modified);
    setNarration(updated);
    const parsed = parseInterpretationToProposedNeeds(interpretation);
    setProposedNeeds(parsed);
  };

  const handleNeedsConfirmed = async (reviewedNeeds: ProposedNeed[]) => {
    if (!narration || !person) return;
    await createReviewedNeeds(
      person.id,
      household?.id ?? null,
      narration.id,
      reviewedNeeds,
    );
    navigate('/app');
  };

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

  const showInterpretation = step === 'proposed' && !!narration?.proposed_interpretation;
  const showNeedReview = (step === 'confirmed' || step === 'modified') && proposedNeeds.length > 0;

  return (
    <AppLayout title="Tell Your Story">
      <div className="max-w-3xl mx-auto space-y-6 pb-20 lg:pb-0">
        {step === 'input' && (
          <NarrationInput
            personId={person.id}
            householdId={household?.id ?? null}
            existingNarration={narration}
            onSubmitted={(n) => setNarration(n)}
            onDraftSaved={(n) => setNarration(n)}
          />
        )}

        {step === 'submitted' && (
          <div className="bg-white rounded-2xl shadow-lg p-6 md:p-8 text-center">
            <h2 className="text-xl font-bold text-navy mb-2">We're reviewing what you shared.</h2>
            <p className="text-gray-500 leading-relaxed">
              Someone will read your story and organize what we heard. Check back soon.
            </p>
          </div>
        )}

        {(step === 'confirmed' || step === 'modified') && !showNeedReview && (
          <div className="space-y-6">
            <InterpretationPreview narration={narration!} />
            <div className="bg-green-50 border border-green-100 rounded-xl p-4 text-center">
              <p className="text-green-700 font-medium">
                Your story is organized. Pathways are coming next.
              </p>
            </div>
          </div>
        )}

        {step === 'rejected' && (
          <div className="space-y-6">
            <InterpretationPreview narration={narration!} />
            <div className="bg-gray-50 border border-gray-100 rounded-xl p-4 text-center">
              <p className="text-gray-600 leading-relaxed">
                You let us know the interpretation didn't capture it. We'll try again.
              </p>
            </div>
          </div>
        )}

        {showInterpretation && narration && (
          <>
            <InterpretationPreview narration={narration} />
            <ConfirmModifyReject
              narration={narration}
              onConfirm={(interp) => handleConfirmed(interp, false)}
              onModify={(interp) => handleConfirmed(interp, true)}
              onReject={async () => {
                const updated = await rejectNarration(narration.id);
                setNarration(updated);
                navigate('/app');
              }}
            />
          </>
        )}

        {showNeedReview && (
          <>
            <InterpretationPreview narration={narration!} />
            <NeedReview
              proposedNeeds={proposedNeeds}
              onConfirm={handleNeedsConfirmed}
              onBack={() => {
                setProposedNeeds([]);
                navigate('/app');
              }}
            />
          </>
        )}
      </div>
    </AppLayout>
  );
}

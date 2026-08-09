import { useState, useEffect, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Loader2, CheckCircle, ArrowRight, ArrowLeft, MessageCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import AppLayout from '../components/narration/AppLayout';
import { getPersonForUser, getHouseholdForPerson } from '../services/narrationService';
import { getReferralsForHousehold } from '../services/pathwayService';
import { createOutcome, createBarrierEvent, PERSON_BARRIER_OPTIONS, generateNextAction } from '../services/outcomeService';
import type { Person } from '../types/narration';
import type { ReferralWithRelations } from '../types/pathway';
import type { ConnectedStatus, ServiceReceivedStatus, HelpfulnessStatus } from '../types/outcome';

type Step = 'select-referral' | 'connected' | 'service-received' | 'helpfulness' | 'barriers' | 'done';

export default function OutcomePage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [person, setPerson] = useState<Person | null>(null);
  const [referrals, setReferrals] = useState<ReferralWithRelations[]>([]);
  const [loading, setLoading] = useState(true);
  const [step, setStep] = useState<Step>('select-referral');
  const [selectedReferral, setSelectedReferral] = useState<ReferralWithRelations | null>(null);
  const [connected, setConnected] = useState<ConnectedStatus | null>(null);
  const [serviceReceived, setServiceReceived] = useState<ServiceReceivedStatus | null>(null);
  const [helpfulness, setHelpfulness] = useState<HelpfulnessStatus | null>(null);
  const [selectedBarriers, setSelectedBarriers] = useState<number[]>([]);
  const [saving, setSaving] = useState(false);
  const [outcomeId, setOutcomeId] = useState<string | null>(null);

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
      if (!h) {
        navigate('/start');
        return;
      }
      const rfs = await getReferralsForHousehold(h.id);
      // Only show referrals that have been sent or beyond
      const eligible = rfs.filter((r) =>
        !['draft', 'ready'].includes(r.status)
      );
      setReferrals(eligible);

      // Check for preselected referral from navigation state
      const state = location.state as { referralId?: string } | null;
      if (state?.referralId) {
        const preselected = eligible.find((r) => r.id === state.referralId);
        if (preselected) {
          setSelectedReferral(preselected);
          setStep('connected');
        }
      }
    } catch (err) {
      console.error('Failed to load outcome data:', err);
    } finally {
      setLoading(false);
    }
  }, [user?.id, navigate, location.state]);

  useEffect(() => { void loadData(); }, [loadData]);

  const handleConnected = (status: ConnectedStatus) => {
    setConnected(status);
    if (status === 'yes') {
      setStep('service-received');
    } else {
      // Skip service received and helpfulness for no/not_yet/chose_differently
      setStep('barriers');
    }
  };

  const handleServiceReceived = (status: ServiceReceivedStatus) => {
    setServiceReceived(status);
    if (status === 'yes' || status === 'partially') {
      setStep('helpfulness');
    } else {
      // Skip helpfulness if not received
      setStep('barriers');
    }
  };

  const handleHelpfulness = (status: HelpfulnessStatus) => {
    setHelpfulness(status);
    setStep('barriers');
  };

  const toggleBarrier = (index: number) => {
    setSelectedBarriers((prev) =>
      prev.includes(index) ? prev.filter((i) => i !== index) : [...prev, index]
    );
  };

  const handleSave = async () => {
    if (!selectedReferral || !connected || !person) return;
    setSaving(true);
    try {
      const outcome = await createOutcome({
        household_id: selectedReferral.household_id,
        person_id: selectedReferral.person_id,
        referral_id: selectedReferral.id,
        pathway_id: selectedReferral.pathway_id,
        connected_status: connected,
        service_received_status: serviceReceived ?? undefined,
        helpfulness_status: helpfulness ?? undefined,
      });
      setOutcomeId(outcome.id);

      // Create barrier events for selected barriers
      for (const idx of selectedBarriers) {
        const option = PERSON_BARRIER_OPTIONS[idx];
        await createBarrierEvent({
          household_id: selectedReferral.household_id,
          person_id: selectedReferral.person_id,
          referral_id: selectedReferral.id,
          outcome_id: outcome.id,
          pathway_id: selectedReferral.pathway_id,
          access_stage: option.access_stage,
          barrier_type: option.barrier_type,
        });
      }

      setStep('done');
    } catch (err) {
      console.error('Failed to save outcome:', err);
    } finally {
      setSaving(false);
    }
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

  return (
    <AppLayout title="What Happened?">
      <div className="max-w-2xl mx-auto pb-20 lg:pb-0">
        {/* Step: Select referral */}
        {step === 'select-referral' && (
          <div className="space-y-4">
            <div>
              <h1 className="text-2xl font-bold text-navy mb-2">What Happened?</h1>
              <p className="text-gray-500 leading-relaxed">
                Tell us what happened with a connection we made for you. This helps us understand what's working and what to try next.
              </p>
            </div>

            {referrals.length === 0 ? (
              <div className="bg-white rounded-2xl shadow-sm p-6 text-center">
                <div className="w-12 h-12 bg-gray-50 rounded-xl flex items-center justify-center mx-auto mb-4">
                  <MessageCircle className="w-6 h-6 text-gray-300" />
                </div>
                <p className="text-sm text-gray-500">
                  You don't have any active connections yet. Once a referral has been sent, you can tell us what happened here.
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                <p className="text-sm font-medium text-navy">Which connection would you like to update?</p>
                {referrals.map((r) => (
                  <button
                    key={r.id}
                    onClick={() => {
                      setSelectedReferral(r);
                      setStep('connected');
                    }}
                    className="w-full text-left bg-white rounded-xl shadow-sm p-4 hover:shadow-md transition-all border border-gray-100"
                  >
                    <p className="font-medium text-navy text-sm">{r.recipient_name}</p>
                    <p className="text-xs text-gray-400 mt-1 capitalize">
                      {r.status.replace(/_/g, ' ')}
                      {r.sent_at && ` · Sent ${new Date(r.sent_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`}
                    </p>
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Step: Connected */}
        {step === 'connected' && selectedReferral && (
          <QuestionStep
            title="Did you connect?"
            subtitle={`With ${selectedReferral.recipient_name}`}
            onBack={() => { setStep('select-referral'); setConnected(null); }}
          >
            <ChoiceButton label="Yes" onClick={() => handleConnected('yes')} />
            <ChoiceButton label="No" onClick={() => handleConnected('no')} />
            <ChoiceButton label="Not yet" onClick={() => handleConnected('not_yet')} />
            <ChoiceButton label="Chose differently" onClick={() => handleConnected('chose_differently')} />
          </QuestionStep>
        )}

        {/* Step: Service received */}
        {step === 'service-received' && selectedReferral && (
          <QuestionStep
            title="Did you receive the service?"
            onBack={() => { setStep('connected'); setServiceReceived(null); }}
          >
            <ChoiceButton label="Yes" onClick={() => handleServiceReceived('yes')} />
            <ChoiceButton label="No" onClick={() => handleServiceReceived('no')} />
            <ChoiceButton label="Partially" onClick={() => handleServiceReceived('partially')} />
            <ChoiceButton label="Still waiting" onClick={() => handleServiceReceived('still_waiting')} />
          </QuestionStep>
        )}

        {/* Step: Helpfulness */}
        {step === 'helpfulness' && selectedReferral && (
          <QuestionStep
            title="Did it help?"
            onBack={() => { setStep('service-received'); setHelpfulness(null); }}
          >
            <ChoiceButton label="Yes" onClick={() => handleHelpfulness('yes')} />
            <ChoiceButton label="No" onClick={() => handleHelpfulness('no')} />
            <ChoiceButton label="Too early to tell" onClick={() => handleHelpfulness('too_early_to_tell')} />
            <ChoiceButton label="Not yet" onClick={() => handleHelpfulness('not_yet')} />
          </QuestionStep>
        )}

        {/* Step: Barriers */}
        {step === 'barriers' && selectedReferral && (
          <div className="space-y-5">
            <div>
              <h2 className="text-xl font-bold text-navy mb-2">What got in the way?</h2>
              <p className="text-sm text-gray-500">
                Select anything that made this harder than it needed to be. You can skip this if nothing got in the way.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3">
              {PERSON_BARRIER_OPTIONS.map((option, idx) => (
                <button
                  key={idx}
                  onClick={() => toggleBarrier(idx)}
                  className={`text-left p-4 rounded-xl border transition-all text-sm font-medium ${
                    selectedBarriers.includes(idx)
                      ? 'bg-gold/10 border-gold text-navy'
                      : 'bg-white border-gray-200 text-gray-600 hover:border-gray-300'
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setStep('done')}
                className="flex-1 py-3 rounded-xl border border-gray-200 text-gray-500 font-medium hover:bg-gray-50 transition-colors text-sm"
              >
                Skip for now
              </button>
              <button
                onClick={() => setStep('done')}
                disabled={selectedBarriers.length === 0}
                className="flex-1 py-3 rounded-xl bg-gold hover:bg-amber-400 disabled:opacity-40 disabled:cursor-not-allowed text-navy font-bold transition-colors text-sm uppercase tracking-wide"
              >
                {selectedBarriers.length > 0 ? 'Continue' : 'Continue'}
              </button>
            </div>
          </div>
        )}

        {/* Step: Done / Saving */}
        {step === 'done' && (
          <div className="space-y-5">
            {!outcomeId && !saving && (
              <div className="space-y-4">
                <div className="bg-white rounded-2xl shadow-sm p-5 space-y-3">
                  <h2 className="font-bold text-navy">Review your answers</h2>
                  <div className="text-sm text-gray-600 space-y-1.5">
                    <p><span className="text-gray-400">Connection:</span> {connected?.replace(/_/g, ' ')}</p>
                    {serviceReceived && <p><span className="text-gray-400">Service received:</span> {serviceReceived.replace(/_/g, ' ')}</p>}
                    {helpfulness && <p><span className="text-gray-400">Helpful:</span> {helpfulness.replace(/_/g, ' ')}</p>}
                    {selectedBarriers.length > 0 && (
                      <p><span className="text-gray-400">What got in the way:</span> {selectedBarriers.map((i) => PERSON_BARRIER_OPTIONS[i].label).join(', ')}</p>
                    )}
                  </div>
                </div>
                <button
                  onClick={handleSave}
                  className="w-full py-3 rounded-xl bg-gold hover:bg-amber-400 text-navy font-bold transition-colors text-sm uppercase tracking-wide"
                >
                  Save
                </button>
              </div>
            )}

            {saving && (
              <div className="flex flex-col items-center justify-center py-20">
                <Loader2 className="w-8 h-8 animate-spin text-gold mb-4" />
                <p className="text-sm text-gray-500">Saving your answers...</p>
              </div>
            )}

            {outcomeId && (
              <div className="space-y-5">
                <div className="bg-white rounded-2xl shadow-sm p-6 text-center">
                  <div className="w-12 h-12 bg-green-50 rounded-xl flex items-center justify-center mx-auto mb-4">
                    <CheckCircle className="w-6 h-6 text-green-600" />
                  </div>
                  <h2 className="font-bold text-navy mb-2">Thank you for sharing</h2>
                  <p className="text-sm text-gray-500 leading-relaxed mb-4">
                    {generateNextAction(connected ?? 'unknown', serviceReceived ?? 'unknown', helpfulness ?? 'unknown')}
                  </p>
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={() => navigate('/app')}
                    className="flex-1 py-3 rounded-xl border border-gray-200 text-gray-500 font-medium hover:bg-gray-50 transition-colors text-sm"
                  >
                    Back to My NextUp
                  </button>
                  <button
                    onClick={() => {
                      setStep('select-referral');
                      setSelectedReferral(null);
                      setConnected(null);
                      setServiceReceived(null);
                      setHelpfulness(null);
                      setSelectedBarriers([]);
                      setOutcomeId(null);
                    }}
                    className="flex-1 py-3 rounded-xl bg-gold hover:bg-amber-400 text-navy font-bold transition-colors text-sm uppercase tracking-wide"
                  >
                    Update another
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </AppLayout>
  );
}

// ============================================================
// Question Step wrapper
// ============================================================

function QuestionStep({ title, subtitle, onBack, children }: {
  title: string;
  subtitle?: string;
  onBack: () => void;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-5">
      <button
        onClick={onBack}
        className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-navy transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Back
      </button>

      <div>
        <h2 className="text-xl font-bold text-navy mb-1">{title}</h2>
        {subtitle && <p className="text-sm text-gray-500">{subtitle}</p>}
      </div>

      <div className="space-y-3">
        {children}
      </div>
    </div>
  );
}

function ChoiceButton({ label, onClick }: { label: string; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="w-full text-left p-4 rounded-xl bg-white border border-gray-200 hover:border-gold hover:bg-gold/5 transition-all text-sm font-medium text-navy flex items-center justify-between group"
    >
      {label}
      <ArrowRight className="w-4 h-4 text-gray-300 group-hover:text-gold transition-colors" />
    </button>
  );
}

import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Loader2, ArrowRight, ArrowLeft, ShieldAlert, Check, X, Lock, ClipboardCheck } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import AppLayout from '../components/narration/AppLayout';
import {
  getPersonForUser,
  getHouseholdForPerson,
} from '../services/narrationService';
import {
  buildDisclosurePreview,
  prepareDisclosure,
  createConsentGrant,
  createEscalation,
} from '../services/trustService';
import type { Person, HouseholdWithMembers } from '../types/narration';
import type { DisclosurePreview, HardStopResult } from '../types/trust';

type Step = 'who' | 'why' | 'what' | 'review' | 'sending' | 'prepared' | 'blocked';

const AVAILABLE_FIELDS = [
  'Student name',
  'School',
  'Grade level',
  'Transportation need',
  'Housing situation',
  'Program interest',
  'Contact information',
  'Age',
];

export default function SharePage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [person, setPerson] = useState<Person | null>(null);
  const [household, setHousehold] = useState<HouseholdWithMembers | null>(null);
  const [loading, setLoading] = useState(true);
  const [step, setStep] = useState<Step>('who');
  const [recipientName, setRecipientName] = useState('');
  const [recipientType, setRecipientType] = useState('');
  const [purpose, setPurpose] = useState('');
  const [selectedFields, setSelectedFields] = useState<string[]>([]);
  const [preview, setPreview] = useState<DisclosurePreview | null>(null);
  const [approving, setApproving] = useState(false);
  const [error, setError] = useState<string | null>(null);

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
    } catch (err) {
      console.error('Failed to load share data:', err);
    } finally {
      setLoading(false);
    }
  }, [user?.id, navigate]);

  useEffect(() => { void loadData(); }, [loadData]);

  const handleReview = async () => {
    if (!person || !household || selectedFields.length === 0) return;
    setApproving(true);
    setError(null);
    try {
      const p = await buildDisclosurePreview(
        household.id,
        person.id,
        person.is_youth,
        recipientName,
        purpose,
        selectedFields,
        'general_navigation',
        'share_information',
      );
      setPreview(p);
      if (p.hardStops.some((s: HardStopResult) => s.blocked)) {
        setStep('blocked');
      } else {
        setStep('review');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not build preview');
      setStep('what');
    }
  };

  const handleApprove = async () => {
    if (!person || !household || !preview || !user?.id) return;
    setApproving(true);
    setError(null);
    try {
      const consent = await createConsentGrant(
        person.id,
        person.id,
        household.id,
        recipientName,
        purpose,
        selectedFields,
        { recipientType: recipientType || undefined },
      );

      await prepareDisclosure({
        householdId: household.id,
        subjectPersonId: person.id,
        senderUserId: user.id,
        recipientName,
        purpose,
        dataFields: selectedFields,
        consentGrantId: consent.id,
        claimAttributions: { source: 'Family\'s own description. Not verified by NextUp.' },
      });

      setStep('prepared');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not prepare sharing request');
    } finally {
      setApproving(false);
    }
  };

  const handleHardStopEscalate = async () => {
    if (!person || !household || !preview || !user?.id) return;
    const stop = preview.hardStops.find((s) => s.blocked);
    if (!stop) return;
    try {
      await createEscalation(
        household.id,
        stop.escalationTrigger ?? 'authority_unresolved',
        `Share with ${recipientName} for ${purpose}`,
        'Navigator review',
        person.id,
        user.id,
      );
    } catch (err) {
      console.error('Failed to create escalation:', err);
    }
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

  if (!person || !household) {
    return (
      <AppLayout>
        <p className="text-gray-500">You need a household set up before sharing.</p>
      </AppLayout>
    );
  }

  const stepOrder: Step[] = ['who', 'why', 'what', 'review', 'prepared', 'blocked'];
  void stepOrder;

  return (
    <AppLayout title="Share With Permission">
      <div className="max-w-2xl mx-auto pb-20 lg:pb-0">
        {/* Progress indicator */}
        {(step === 'who' || step === 'why' || step === 'what' || step === 'review') && (
          <div className="flex items-center gap-2 mb-8">
            {['Who', 'Why', 'What', 'Review'].map((label, i) => {
              const stepMap: Step[] = ['who', 'why', 'what', 'review'];
              const isActive = stepMap[i] === step;
              const isPast = stepMap.indexOf(step) > i;
              return (
                <div key={label} className="flex items-center gap-2 flex-1">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-colors ${
                    isActive ? 'bg-gold text-navy' : isPast ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-400'
                  }`}>
                    {isPast ? <Check className="w-4 h-4" /> : i + 1}
                  </div>
                  <span className={`text-sm font-medium ${isActive ? 'text-navy' : 'text-gray-400'}`}>{label}</span>
                  {i < 3 && <div className="flex-1 h-px bg-gray-200" />}
                </div>
              );
            })}
          </div>
        )}

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl p-4 text-sm mb-6">
            {error}
          </div>
        )}

        {/* WHO */}
        {step === 'who' && (
          <div className="bg-white rounded-2xl shadow-lg p-6 md:p-8">
            <h2 className="text-xl font-bold text-navy mb-2">Who is this going to?</h2>
            <p className="text-gray-500 mb-6 text-sm leading-relaxed">
              Tell us who you want to share information with.
            </p>
            <input
              type="text"
              value={recipientName}
              onChange={(e) => setRecipientName(e.target.value)}
              placeholder="e.g., Crosstown support contact"
              autoFocus
              className="w-full rounded-xl border-2 border-gray-200 focus:border-gold p-4 text-lg mb-4"
              onKeyDown={(e) => { if (e.key === 'Enter' && recipientName.trim()) setStep('why'); }}
            />
            <input
              type="text"
              value={recipientType}
              onChange={(e) => setRecipientType(e.target.value)}
              placeholder="Type (optional, e.g., School, Coach, Program)"
              className="w-full rounded-xl border-2 border-gray-200 focus:border-gold p-4 text-sm mb-6"
            />
            <button
              onClick={() => setStep('why')}
              disabled={recipientName.trim().length === 0}
              className="flex items-center gap-2 bg-gold hover:bg-amber-400 text-navy font-black px-6 py-3 rounded-xl transition-colors disabled:opacity-50 uppercase tracking-wide"
            >
              Continue
              <ArrowRight className="w-5 h-5" />
            </button>
          </div>
        )}

        {/* WHY */}
        {step === 'why' && (
          <div className="bg-white rounded-2xl shadow-lg p-6 md:p-8">
            <h2 className="text-xl font-bold text-navy mb-2">Why are we sharing it?</h2>
            <p className="text-gray-500 mb-6 text-sm leading-relaxed">
              What is the purpose of sharing this information?
            </p>
            <textarea
              value={purpose}
              onChange={(e) => setPurpose(e.target.value)}
              placeholder="e.g., Transportation inquiry"
              rows={3}
              autoFocus
              className="w-full rounded-xl border-2 border-gray-200 focus:border-gold p-4 text-lg mb-6 resize-y"
            />
            <div className="flex gap-3">
              <button
                onClick={() => setStep('what')}
                disabled={purpose.trim().length === 0}
                className="flex items-center gap-2 bg-gold hover:bg-amber-400 text-navy font-black px-6 py-3 rounded-xl transition-colors disabled:opacity-50 uppercase tracking-wide"
              >
                Continue
                <ArrowRight className="w-5 h-5" />
              </button>
              <button
                onClick={() => setStep('who')}
                className="flex items-center gap-2 bg-gray-100 hover:bg-gray-200 text-navy font-semibold px-6 py-3 rounded-xl transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
                Back
              </button>
            </div>
          </div>
        )}

        {/* WHAT */}
        {step === 'what' && (
          <div className="bg-white rounded-2xl shadow-lg p-6 md:p-8">
            <h2 className="text-xl font-bold text-navy mb-2">What do you want to share?</h2>
            <p className="text-gray-500 mb-6 text-sm leading-relaxed">
              Select the information you want to share with {recipientName}.
            </p>
            <div className="grid sm:grid-cols-2 gap-3 mb-6">
              {AVAILABLE_FIELDS.map((field) => (
                <button
                  key={field}
                  onClick={() => {
                    setSelectedFields((prev) =>
                      prev.includes(field) ? prev.filter((f) => f !== field) : [...prev, field],
                    );
                  }}
                  className={`flex items-center gap-2 p-3 rounded-xl border-2 text-left text-sm font-medium transition-all ${
                    selectedFields.includes(field)
                      ? 'border-gold bg-gold/10 text-navy'
                      : 'border-gray-200 text-gray-600 hover:border-gray-300'
                  }`}
                >
                  <div className={`w-5 h-5 rounded border-2 flex items-center justify-center flex-shrink-0 ${
                    selectedFields.includes(field) ? 'border-gold bg-gold' : 'border-gray-300'
                  }`}>
                    {selectedFields.includes(field) && <Check className="w-3 h-3 text-navy" />}
                  </div>
                  {field}
                </button>
              ))}
            </div>
            <div className="flex gap-3">
              <button
                onClick={handleReview}
                disabled={approving || selectedFields.length === 0}
                className="flex items-center gap-2 bg-gold hover:bg-amber-400 text-navy font-black px-6 py-3 rounded-xl transition-colors disabled:opacity-50 uppercase tracking-wide"
              >
                {approving ? <Loader2 className="w-5 h-5 animate-spin" /> : <ArrowRight className="w-5 h-5" />}
                Review
              </button>
              <button
                onClick={() => setStep('why')}
                className="flex items-center gap-2 bg-gray-100 hover:bg-gray-200 text-navy font-semibold px-6 py-3 rounded-xl transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
                Back
              </button>
            </div>
          </div>
        )}

        {/* REVIEW */}
        {step === 'review' && preview && (
          <div className="space-y-4">
            <div className="bg-white rounded-2xl shadow-lg p-6 md:p-8">
              <h2 className="text-xl font-bold text-navy mb-4">Review before approving</h2>
              <div className="space-y-4">
                <div>
                  <p className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-1">Sharing with</p>
                  <p className="text-navy font-medium">{preview.recipientName}</p>
                </div>
                <div>
                  <p className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-1">Purpose</p>
                  <p className="text-navy font-medium">{preview.purpose}</p>
                </div>
                <div>
                  <p className="text-xs font-bold uppercase tracking-wider text-green-600 mb-2">Will share</p>
                  <div className="space-y-1">
                    {preview.willShare.map((f) => (
                      <div key={f} className="flex items-center gap-2 text-sm text-gray-700">
                        <Check className="w-4 h-4 text-green-600" />
                        {f}
                      </div>
                    ))}
                  </div>
                </div>
                <div>
                  <p className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-2">Will not share</p>
                  {AVAILABLE_FIELDS.filter((f) => !preview.willShare.includes(f)).map((f) => (
                    <div key={f} className="flex items-center gap-2 text-sm text-gray-400">
                      <X className="w-4 h-4" />
                      {f}
                    </div>
                  ))}
                </div>
              </div>
              <div className="bg-blue-50 border border-blue-100 rounded-xl p-3 mt-4">
                <p className="text-xs text-gray-600 leading-relaxed">
                  Family's own description. Not verified by NextUp.
                </p>
              </div>
            </div>
            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={handleApprove}
                disabled={approving}
                className="flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 text-white font-bold px-6 py-3 rounded-xl transition-colors disabled:opacity-50"
              >
                {approving ? <Loader2 className="w-5 h-5 animate-spin" /> : <ClipboardCheck className="w-5 h-5" />}
                Approve Sharing
              </button>
              <button
                onClick={() => setStep('what')}
                className="bg-gray-100 hover:bg-gray-200 text-navy font-semibold px-6 py-3 rounded-xl transition-colors"
              >
                Change What Is Shared
              </button>
              <button
                onClick={() => navigate('/app')}
                className="bg-gray-50 hover:bg-gray-100 text-gray-600 font-medium px-6 py-3 rounded-xl transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {/* BLOCKED */}
        {step === 'blocked' && preview && (
          <div className="bg-white rounded-2xl shadow-lg p-6 md:p-8">
            <div className="flex items-start gap-4 mb-6">
              <div className="w-12 h-12 bg-amber-50 rounded-xl flex items-center justify-center flex-shrink-0">
                <ShieldAlert className="w-6 h-6 text-amber-600" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-navy mb-2">A navigator needs to review this before anything is shared.</h2>
                {preview.hardStops.filter((s) => s.blocked).map((s, i) => (
                  <p key={i} className="text-gray-600 leading-relaxed text-sm mb-2">{s.reason}</p>
                ))}
              </div>
            </div>
            <div className="bg-navy/5 rounded-xl p-4 mb-6">
              <p className="text-sm text-gray-600 leading-relaxed">
                This doesn't mean we can't move forward. It means we need to confirm
                a few things first. A navigator will reach out to help.
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={handleHardStopEscalate}
                className="flex items-center justify-center gap-2 bg-navy hover:bg-navy-light text-white font-semibold px-6 py-3 rounded-xl transition-colors"
              >
                Send to Navigator Review
              </button>
              <button
                onClick={() => navigate('/app')}
                className="bg-gray-100 hover:bg-gray-200 text-navy font-medium px-6 py-3 rounded-xl transition-colors"
              >
                Not Now
              </button>
            </div>
          </div>
        )}

        {/* PREPARED */}
        {step === 'prepared' && (
          <div className="bg-white rounded-2xl shadow-lg p-6 md:p-8 text-center">
            <div className="w-16 h-16 bg-amber-50 rounded-full flex items-center justify-center mx-auto mb-4">
              <ClipboardCheck className="w-8 h-8 text-amber-600" />
            </div>
            <h2 className="text-xl font-bold text-navy mb-2">Your sharing request is ready.</h2>
            <p className="text-gray-500 leading-relaxed mb-6">
              You approved sharing information with {recipientName} for {purpose}.
              A navigator will help complete the delivery. This has been
              logged in your sharing history as prepared, not sent.
            </p>
            <div className="flex items-center justify-center gap-2 text-sm text-gray-400 mb-6">
              <Lock className="w-4 h-4" />
              Family's own description. Not verified by NextUp.
            </div>
            <button
              onClick={() => navigate('/app/privacy')}
              className="text-gold hover:underline font-medium text-sm"
            >
              View sharing history
            </button>
          </div>
        )}
      </div>
    </AppLayout>
  );
}

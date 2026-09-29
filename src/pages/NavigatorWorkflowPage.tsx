import { useState, useEffect, useCallback } from 'react';
import {
  Compass, FileText, ShieldCheck, Send, CheckCircle2, AlertCircle,
  ChevronRight, Loader2, ArrowRight, Plus, X,
  Building2, Clock,
} from 'lucide-react';
import { DashboardLayout } from '../components/DashboardLayout';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabase';
import type { HouseholdWithMembers, Need } from '../types/narration';
import type { PathwayWithRelations, Referral, ReferralStatus, PathwayStatus } from '../types/pathway';
import type { AuthorityToAct, ConsentGrant, Disclosure, DisclosureStatus, VerificationStatus } from '../types/trust';
import * as pathwayService from '../services/pathwayService';
import * as trustService from '../services/trustService';
import * as narrationService from '../services/narrationService';

type WorkflowStep = 'select' | 'needs' | 'pathway' | 'authority' | 'consent' | 'disclosure' | 'referral';

interface SelectedContext {
  householdId: string;
  householdName: string;
  personId: string;
  personName: string;
  needId: string;
  needTitle: string;
  pathwayId: string;
  authorityId: string;
  consentId: string;
  disclosureId: string;
  referralId: string;
}

export function NavigatorWorkflowPage() {
  const { user } = useAuth();
  const [step, setStep] = useState<WorkflowStep>('select');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const [assignments, setAssignments] = useState<{ household_id: string; household_name: string }[]>([]);
  const [household, setHousehold] = useState<HouseholdWithMembers | null>(null);
  const [needs, setNeeds] = useState<Need[]>([]);
  const [pathways, setPathways] = useState<PathwayWithRelations[]>([]);
  const [authorities, setAuthorities] = useState<AuthorityToAct[]>([]);
  const [consents, setConsents] = useState<ConsentGrant[]>([]);
  const [disclosures, setDisclosures] = useState<Disclosure[]>([]);
  const [referrals, setReferrals] = useState<Referral[]>([]);

  const [ctx, setCtx] = useState<Partial<SelectedContext>>({});

  const loadAssignments = useCallback(async () => {
    if (!user?.id) return;
    setLoading(true);
    setError(null);
    try {
      const { data, error } = await supabase
        .from('navigator_assignments')
        .select('household_id, household:households(name)')
        .eq('navigator_user_id', user.id)
        .eq('assignment_status', 'active');
      if (error) throw error;
      const mapped = (data ?? []).map((a: { household_id: string; household: { name: string | null }[] }) => ({
        household_id: a.household_id,
        household_name: a.household[0]?.name ?? 'Household',
      }));
      setAssignments(mapped);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load assignments');
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  useEffect(() => { loadAssignments(); }, [loadAssignments]);

  const selectHousehold = async (householdId: string, householdName: string) => {
    setLoading(true);
    setError(null);
    try {
      const hw = await narrationService.getHouseholdWithMembers(householdId);
      if (!hw) throw new Error('Household not found');
      setHousehold(hw);
      setCtx({ householdId, householdName });

      const members = hw.members;
      if (members.length === 0) throw new Error('No members in household');

      const allNeeds: Need[] = [];
      for (const m of members) {
        const memberNeeds = await narrationService.getNeeds(m.person_id);
        allNeeds.push(...memberNeeds.filter((n) => n.status === 'confirmed'));
      }
      setNeeds(allNeeds);
      setStep('needs');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load household');
    } finally {
      setLoading(false);
    }
  };

  const selectNeed = async (need: Need) => {
    setLoading(true);
    setError(null);
    try {
      setCtx((c) => ({ ...c, needId: need.id, needTitle: need.title, personId: need.person_id }));
      const pws = await pathwayService.getPathwaysForPerson(need.person_id);
      setPathways(pws);
      setStep('pathway');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load pathways');
    } finally {
      setLoading(false);
    }
  };

  const createPathway = async () => {
    if (!ctx.householdId || !ctx.personId || !ctx.needId) return;
    setLoading(true);
    setError(null);
    try {
      const pw = await pathwayService.createPathway({
        household_id: ctx.householdId,
        person_id: ctx.personId,
        need_id: ctx.needId,
        status: 'possible',
        created_by: user?.id,
      });
      setCtx((c) => ({ ...c, pathwayId: pw.id }));
      const pws = await pathwayService.getPathwaysForPerson(ctx.personId);
      setPathways(pws);
      const auths = await trustService.getAuthorityRecords(ctx.householdId);
      setAuthorities(auths);
      setStep('authority');
      setSuccess('Pathway created.');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to create pathway');
    } finally {
      setLoading(false);
    }
  };

  const selectPathway = async (pathwayId: string) => {
    if (!ctx.householdId) return;
    setLoading(true);
    setError(null);
    try {
      setCtx((c) => ({ ...c, pathwayId }));
      const auths = await trustService.getAuthorityRecords(ctx.householdId);
      setAuthorities(auths);
      setStep('authority');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load authority records');
    } finally {
      setLoading(false);
    }
  };

  const [authForm, setAuthForm] = useState({
    dataCategory: 'education',
    actionType: 'share',
    verificationStatus: 'asserted' as VerificationStatus,
    authorityBasis: '',
    legalInstrumentAsserted: false,
    disputed: false,
    effectiveAt: '',
    reviewAt: '',
    expiresAt: '',
    notes: '',
  });

  const createAuthority = async () => {
    if (!ctx.householdId || !ctx.personId) return;
    setLoading(true);
    setError(null);
    setSuccess(null);
    try {
      const auth = await trustService.createAuthority(
        ctx.personId,
        ctx.householdId,
        authForm.dataCategory,
        authForm.actionType,
        authForm.verificationStatus,
        {
          authorityBasis: authForm.authorityBasis || undefined,
          legalInstrumentAsserted: authForm.legalInstrumentAsserted,
          disputed: authForm.disputed,
          effectiveAt: authForm.effectiveAt || undefined,
          reviewAt: authForm.reviewAt || undefined,
          expiresAt: authForm.expiresAt || undefined,
          notes: authForm.notes || undefined,
        },
      );
      setAuthorities((prev) => [auth, ...prev]);
      setCtx((c) => ({ ...c, authorityId: auth.id }));

      const hardStop = trustService.checkAuthorityHardStops(auth);
      if (hardStop.blocked) {
        setError(`Authority created but is hard-stopped: ${hardStop.reason}`);
        return;
      }

      const cs = await trustService.getConsentGrants(ctx.householdId);
      setConsents(cs);
      setStep('consent');
      setSuccess('Authority created and valid.');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to create authority');
    } finally {
      setLoading(false);
    }
  };

  const selectAuthority = async (authorityId: string) => {
    if (!ctx.householdId) return;
    setLoading(true);
    setError(null);
    try {
      const auth = authorities.find((a) => a.id === authorityId);
      if (!auth) throw new Error('Authority not found');
      const hardStop = trustService.checkAuthorityHardStops(auth);
      if (hardStop.blocked) {
        setError(`This authority is hard-stopped: ${hardStop.reason}`);
        return;
      }
      setCtx((c) => ({ ...c, authorityId }));
      const cs = await trustService.getConsentGrants(ctx.householdId);
      setConsents(cs);
      setStep('consent');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to select authority');
    } finally {
      setLoading(false);
    }
  };

  const [consentForm, setConsentForm] = useState({
    recipientName: '',
    recipientType: '',
    purpose: '',
    dataCategories: 'education',
    expiresAt: '',
  });

  const createConsent = async () => {
    if (!ctx.householdId || !ctx.personId || !ctx.authorityId) return;
    setLoading(true);
    setError(null);
    setSuccess(null);
    try {
      const consent = await trustService.createConsentGrant(
        ctx.personId,
        ctx.personId,
        ctx.householdId,
        consentForm.recipientName,
        consentForm.purpose,
        consentForm.dataCategories.split(',').map((s) => s.trim()).filter(Boolean),
        {
          recipientType: consentForm.recipientType || undefined,
          expiresAt: consentForm.expiresAt || undefined,
          authorityToActId: ctx.authorityId,
        },
      );
      setConsents((prev) => [consent, ...prev]);
      setCtx((c) => ({ ...c, consentId: consent.id }));
      const discs = await trustService.getDisclosures(ctx.householdId);
      setDisclosures(discs);
      setStep('disclosure');
      setSuccess('Consent grant created.');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to create consent grant');
    } finally {
      setLoading(false);
    }
  };

  const selectConsent = async (consentId: string) => {
    if (!ctx.householdId) return;
    setCtx((c) => ({ ...c, consentId }));
    const discs = await trustService.getDisclosures(ctx.householdId);
    setDisclosures(discs);
    setStep('disclosure');
  };

  const [disclosureForm, setDisclosureForm] = useState({
    recipientName: '',
    purpose: '',
    dataFields: 'education',
  });

  const prepareDisclosure = async () => {
    if (!ctx.householdId || !ctx.personId) return;
    setLoading(true);
    setError(null);
    setSuccess(null);
    try {
      const disc = await trustService.prepareDisclosure({
        householdId: ctx.householdId,
        subjectPersonId: ctx.personId,
        senderUserId: user?.id ?? '',
        recipientName: disclosureForm.recipientName,
        purpose: disclosureForm.purpose,
        dataFields: disclosureForm.dataFields.split(',').map((s) => s.trim()).filter(Boolean),
        consentGrantId: ctx.consentId || undefined,
      });
      setDisclosures((prev) => [disc, ...prev]);
      setCtx((c) => ({ ...c, disclosureId: disc.id }));
      setSuccess('Disclosure prepared.');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to prepare disclosure');
    } finally {
      setLoading(false);
    }
  };

  const selectDisclosure = (disclosureId: string) => {
    setCtx((c) => ({ ...c, disclosureId }));
  };

  const startDelivery = async (disclosureId: string) => {
    setLoading(true);
    setError(null);
    setSuccess(null);
    try {
      await trustService.startDelivery(disclosureId);
      const discs = await trustService.getDisclosures(ctx.householdId!);
      setDisclosures(discs);
      setSuccess('Delivery started.');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to start delivery');
    } finally {
      setLoading(false);
    }
  };

  const [deliveryForm, setDeliveryForm] = useState({
    deliveryMethod: 'email',
    deliveryNotes: '',
    deliveryReference: '',
  });

  const confirmDelivery = async (disclosureId: string) => {
    if (!user?.id) return;
    setLoading(true);
    setError(null);
    setSuccess(null);
    try {
      await trustService.confirmDelivery(disclosureId, {
        deliveredByUserId: user.id,
        deliveryMethod: deliveryForm.deliveryMethod,
        deliveryNotes: deliveryForm.deliveryNotes || undefined,
        deliveryReference: deliveryForm.deliveryReference || undefined,
      });
      const discs = await trustService.getDisclosures(ctx.householdId!);
      setDisclosures(discs);
      setSuccess('Delivery confirmed. Disclosure is now sent.');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to confirm delivery');
    } finally {
      setLoading(false);
    }
  };

  const [referralForm, setReferralForm] = useState({
    recipientName: '',
    recipientType: '',
  });

  const createReferral = async () => {
    if (!ctx.householdId || !ctx.personId || !ctx.pathwayId) return;
    setLoading(true);
    setError(null);
    setSuccess(null);
    try {
      const referral = await pathwayService.createReferralDraft({
        household_id: ctx.householdId,
        person_id: ctx.personId,
        pathway_id: ctx.pathwayId,
        sender_user_id: user?.id,
        recipient_name: referralForm.recipientName,
        recipient_type: referralForm.recipientType || undefined,
      });
      setReferrals((prev) => [referral, ...prev]);
      setCtx((c) => ({ ...c, referralId: referral.id }));
      setStep('referral');
      setSuccess('Referral draft created.');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to create referral');
    } finally {
      setLoading(false);
    }
  };

  const loadReferralsForPathway = async () => {
    if (!ctx.pathwayId) return;
    const refs = await pathwayService.getReferralsForPathway(ctx.pathwayId);
    setReferrals(refs);
    setStep('referral');
  };

  const linkDisclosureAndAdvance = async (referralId: string, disclosureId: string) => {
    setLoading(true);
    setError(null);
    setSuccess(null);
    try {
      await pathwayService.linkReferralToDisclosure(referralId, disclosureId);
      await pathwayService.updateReferralStatus(referralId, 'ready', 'navigator_reported');
      const refs = await pathwayService.getReferralsForPathway(ctx.pathwayId!);
      setReferrals(refs);
      setSuccess('Disclosure linked. Referral is now ready.');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to link disclosure');
    } finally {
      setLoading(false);
    }
  };

  const sendReferral = async (referralId: string) => {
    setLoading(true);
    setError(null);
    setSuccess(null);
    try {
      await pathwayService.updateReferralStatus(referralId, 'sent', 'navigator_reported');
      const refs = await pathwayService.getReferralsForPathway(ctx.pathwayId!);
      setReferrals(refs);
      setSuccess('Referral sent.');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to send referral');
    } finally {
      setLoading(false);
    }
  };

  const reset = () => {
    setStep('select');
    setCtx({});
    setHousehold(null);
    setNeeds([]);
    setPathways([]);
    setAuthorities([]);
    setConsents([]);
    setDisclosures([]);
    setReferrals([]);
    setError(null);
    setSuccess(null);
  };

  const stepOrder: WorkflowStep[] = ['select', 'needs', 'pathway', 'authority', 'consent', 'disclosure', 'referral'];
  const stepIndex = stepOrder.indexOf(step);
  const stepLabels = ['Household', 'Needs', 'Pathway', 'Authority', 'Consent', 'Disclosure', 'Referral'];

  return (
    <DashboardLayout title="Navigator Workflow">
      <div className="max-w-5xl mx-auto space-y-6">
        {/* Progress Bar */}
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            {stepLabels.map((label, i) => (
              <div key={label} className="flex items-center">
                <div className={`flex items-center space-x-2 ${i <= stepIndex ? 'text-[#1a1f3a]' : 'text-gray-400'}`}>
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold ${i < stepIndex ? 'bg-green-500 text-white' : i === stepIndex ? 'bg-[#c5a572] text-white' : 'bg-gray-200 text-gray-400'}`}>
                    {i < stepIndex ? <CheckCircle2 className="w-5 h-5" /> : i + 1}
                  </div>
                  <span className="text-sm font-medium hidden sm:inline">{label}</span>
                </div>
                {i < stepLabels.length - 1 && <ChevronRight className="w-4 h-4 mx-1 text-gray-300 hidden sm:block" />}
              </div>
            ))}
          </div>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start space-x-3">
            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="text-sm font-medium text-red-900">Action failed</p>
              <p className="text-sm text-red-700 mt-1">{error}</p>
            </div>
            <button onClick={() => setError(null)} className="text-red-400 hover:text-red-600"><X className="w-5 h-5" /></button>
          </div>
        )}

        {success && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-start space-x-3">
            <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="text-sm font-medium text-green-900">{success}</p>
            </div>
            <button onClick={() => setSuccess(null)} className="text-green-400 hover:text-green-600"><X className="w-5 h-5" /></button>
          </div>
        )}

        {/* Step 1: Select Household */}
        {step === 'select' && (
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <div className="flex items-center space-x-3 mb-4">
              <Compass className="w-6 h-6 text-[#c5a572]" />
              <h2 className="text-lg font-bold text-[#1a1f3a]">Select Household</h2>
            </div>
            <p className="text-sm text-gray-600 mb-4">Choose the household you are assigned to as a navigator.</p>
            {loading ? (
              <div className="flex items-center space-x-2 text-gray-500"><Loader2 className="w-5 h-5 animate-spin" /><span>Loading assignments...</span></div>
            ) : assignments.length === 0 ? (
              <p className="text-sm text-gray-500">No active navigator assignments found.</p>
            ) : (
              <div className="space-y-2">
                {assignments.map((a) => (
                  <button key={a.household_id} onClick={() => selectHousehold(a.household_id, a.household_name)}
                    className="w-full flex items-center justify-between p-4 rounded-lg border border-gray-200 hover:border-[#c5a572] hover:bg-amber-50/30 transition-colors text-left">
                    <div className="flex items-center space-x-3">
                      <Building2 className="w-5 h-5 text-gray-400" />
                      <span className="font-medium text-gray-900">{a.household_name}</span>
                    </div>
                    <ArrowRight className="w-5 h-5 text-gray-400" />
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Step 2: Select Confirmed Need */}
        {step === 'needs' && (
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-3">
                <FileText className="w-6 h-6 text-[#c5a572]" />
                <h2 className="text-lg font-bold text-[#1a1f3a]">Confirmed Needs</h2>
              </div>
              <button onClick={reset} className="text-sm text-gray-500 hover:text-gray-700">Start over</button>
            </div>
            <p className="text-sm text-gray-600 mb-4">Select a confirmed need to build a pathway from.</p>
            {needs.length === 0 ? (
              <p className="text-sm text-gray-500">No confirmed needs found for this household.</p>
            ) : (
              <div className="space-y-2">
                {needs.map((n) => (
                  <button key={n.id} onClick={() => selectNeed(n)}
                    className="w-full flex items-center justify-between p-4 rounded-lg border border-gray-200 hover:border-[#c5a572] hover:bg-amber-50/30 transition-colors text-left">
                    <div>
                      <p className="font-medium text-gray-900">{n.title}</p>
                      {n.description && <p className="text-sm text-gray-500 mt-1">{n.description}</p>}
                    </div>
                    <ArrowRight className="w-5 h-5 text-gray-400 flex-shrink-0 ml-4" />
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Step 3: Pathway */}
        {step === 'pathway' && (
          <div className="space-y-4">
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <Compass className="w-6 h-6 text-[#c5a572]" />
                  <h2 className="text-lg font-bold text-[#1a1f3a]">Pathway</h2>
                </div>
                <button onClick={reset} className="text-sm text-gray-500 hover:text-gray-700">Start over</button>
              </div>
              <p className="text-sm text-gray-600 mb-4">Need: <span className="font-medium text-gray-900">{ctx.needTitle}</span></p>

              {pathways.filter((p) => p.need_id === ctx.needId).length > 0 && (
                <div className="mb-4">
                  <p className="text-sm font-medium text-gray-700 mb-2">Existing pathways for this need:</p>
                  <div className="space-y-2">
                    {pathways.filter((p) => p.need_id === ctx.needId).map((p) => (
                      <button key={p.id} onClick={() => selectPathway(p.id)}
                        className="w-full flex items-center justify-between p-3 rounded-lg border border-gray-200 hover:border-[#c5a572] transition-colors text-left">
                        <div className="flex items-center space-x-3">
                          <PathwayStatusBadge status={p.status} />
                          <span className="text-sm text-gray-600">Created {new Date(p.created_at).toLocaleDateString()}</span>
                        </div>
                        <ArrowRight className="w-4 h-4 text-gray-400" />
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <button onClick={createPathway} disabled={loading}
                className="flex items-center space-x-2 px-4 py-3 rounded-lg bg-[#1a1f3a] text-white font-medium hover:bg-[#252b4a] disabled:opacity-50 transition-colors">
                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Plus className="w-5 h-5" />}
                <span>Create New Pathway</span>
              </button>
            </div>
          </div>
        )}

        {/* Step 4: Authority */}
        {step === 'authority' && (
          <div className="space-y-4">
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <ShieldCheck className="w-6 h-6 text-[#c5a572]" />
                  <h2 className="text-lg font-bold text-[#1a1f3a]">Authority to Act</h2>
                </div>
                <button onClick={reset} className="text-sm text-gray-500 hover:text-gray-700">Start over</button>
              </div>

              {authorities.filter((a) => a.subject_person_id === ctx.personId).length > 0 && (
                <div className="mb-6">
                  <p className="text-sm font-medium text-gray-700 mb-2">Existing authorities for this person:</p>
                  <div className="space-y-2">
                    {authorities.filter((a) => a.subject_person_id === ctx.personId).map((a) => {
                      const hs = trustService.checkAuthorityHardStops(a);
                      return (
                        <button key={a.id} onClick={() => selectAuthority(a.id)}
                          className="w-full flex items-center justify-between p-3 rounded-lg border border-gray-200 hover:border-[#c5a572] transition-colors text-left">
                          <div className="flex items-center space-x-3">
                            <div className={`w-2 h-2 rounded-full ${hs.blocked ? 'bg-red-500' : 'bg-green-500'}`} />
                            <span className="text-sm text-gray-700">{a.data_category} / {a.action_type}</span>
                            <span className="text-xs text-gray-400">{a.verification_status}</span>
                          </div>
                          <ArrowRight className="w-4 h-4 text-gray-400" />
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              <div className="border-t border-gray-200 pt-4">
                <p className="text-sm font-medium text-gray-700 mb-3">Create new authority</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <FormField label="Data Category">
                    <input value={authForm.dataCategory} onChange={(e) => setAuthForm((f) => ({ ...f, dataCategory: e.target.value }))}
                      className="form-input" placeholder="education" />
                  </FormField>
                  <FormField label="Action Type">
                    <input value={authForm.actionType} onChange={(e) => setAuthForm((f) => ({ ...f, actionType: e.target.value }))}
                      className="form-input" placeholder="share" />
                  </FormField>
                  <FormField label="Verification Status">
                    <select value={authForm.verificationStatus} onChange={(e) => setAuthForm((f) => ({ ...f, verificationStatus: e.target.value as VerificationStatus }))}
                      className="form-input">
                      <option value="asserted">Asserted</option>
                      <option value="documented">Documented</option>
                      <option value="unknown">Unknown</option>
                    </select>
                    <p className="text-xs text-gray-400 mt-1">Verified-by-qualified-authority and disputed are reviewer-qualified states, not navigator-selectable.</p>
                  </FormField>
                  <FormField label="Authority Basis">
                    <input value={authForm.authorityBasis} onChange={(e) => setAuthForm((f) => ({ ...f, authorityBasis: e.target.value }))}
                      className="form-input" placeholder="Parental consent" />
                  </FormField>
                  <FormField label="Effective At">
                    <input type="date" value={authForm.effectiveAt} onChange={(e) => setAuthForm((f) => ({ ...f, effectiveAt: e.target.value }))}
                      className="form-input" />
                  </FormField>
                  <FormField label="Review At">
                    <input type="date" value={authForm.reviewAt} onChange={(e) => setAuthForm((f) => ({ ...f, reviewAt: e.target.value }))}
                      className="form-input" />
                  </FormField>
                  <FormField label="Expires At">
                    <input type="date" value={authForm.expiresAt} onChange={(e) => setAuthForm((f) => ({ ...f, expiresAt: e.target.value }))}
                      className="form-input" />
                  </FormField>
                  <div className="flex items-center space-x-6 pt-6">
                    <label className="flex items-center space-x-2">
                      <input type="checkbox" checked={authForm.legalInstrumentAsserted} onChange={(e) => setAuthForm((f) => ({ ...f, legalInstrumentAsserted: e.target.checked }))}
                        className="rounded border-gray-300" />
                      <span className="text-sm text-gray-700">Legal instrument asserted</span>
                    </label>
                    <label className="flex items-center space-x-2">
                      <input type="checkbox" checked={authForm.disputed} onChange={(e) => setAuthForm((f) => ({ ...f, disputed: e.target.checked }))}
                        className="rounded border-gray-300" />
                      <span className="text-sm text-gray-700">Disputed</span>
                    </label>
                  </div>
                  <div className="col-span-1 sm:col-span-2">
                    <FormField label="Notes">
                      <textarea value={authForm.notes} onChange={(e) => setAuthForm((f) => ({ ...f, notes: e.target.value }))}
                        className="form-input" rows={2} />
                    </FormField>
                  </div>
                </div>
                <button onClick={createAuthority} disabled={loading}
                  className="mt-4 flex items-center space-x-2 px-4 py-3 rounded-lg bg-[#1a1f3a] text-white font-medium hover:bg-[#252b4a] disabled:opacity-50 transition-colors">
                  {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Plus className="w-5 h-5" />}
                  <span>Create Authority</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Step 5: Consent */}
        {step === 'consent' && (
          <div className="space-y-4">
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <FileText className="w-6 h-6 text-[#c5a572]" />
                  <h2 className="text-lg font-bold text-[#1a1f3a]">Consent Grant</h2>
                </div>
                <button onClick={reset} className="text-sm text-gray-500 hover:text-gray-700">Start over</button>
              </div>

              {consents.length > 0 && (
                <div className="mb-6">
                  <p className="text-sm font-medium text-gray-700 mb-2">Existing active consent grants:</p>
                  <div className="space-y-2">
                    {consents.filter((c) => c.status === 'active').map((c) => (
                      <button key={c.id} onClick={() => selectConsent(c.id)}
                        className="w-full flex items-center justify-between p-3 rounded-lg border border-gray-200 hover:border-[#c5a572] transition-colors text-left">
                        <div className="flex items-center space-x-3">
                          <CheckCircle2 className="w-4 h-4 text-green-500" />
                          <span className="text-sm text-gray-700">{c.recipient_name} — {c.purpose}</span>
                        </div>
                        <ArrowRight className="w-4 h-4 text-gray-400" />
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <div className="border-t border-gray-200 pt-4">
                <p className="text-sm font-medium text-gray-700 mb-3">Create new consent grant</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <FormField label="Recipient Name">
                    <input value={consentForm.recipientName} onChange={(e) => setConsentForm((f) => ({ ...f, recipientName: e.target.value }))}
                      className="form-input" placeholder="Lincoln High School" />
                  </FormField>
                  <FormField label="Recipient Type">
                    <input value={consentForm.recipientType} onChange={(e) => setConsentForm((f) => ({ ...f, recipientType: e.target.value }))}
                      className="form-input" placeholder="School" />
                  </FormField>
                  <FormField label="Purpose">
                    <input value={consentForm.purpose} onChange={(e) => setConsentForm((f) => ({ ...f, purpose: e.target.value }))}
                      className="form-input" placeholder="Share transcript for enrollment" />
                  </FormField>
                  <FormField label="Data Categories (comma-separated)">
                    <input value={consentForm.dataCategories} onChange={(e) => setConsentForm((f) => ({ ...f, dataCategories: e.target.value }))}
                      className="form-input" placeholder="education, enrollment" />
                  </FormField>
                  <FormField label="Expires At">
                    <input type="date" value={consentForm.expiresAt} onChange={(e) => setConsentForm((f) => ({ ...f, expiresAt: e.target.value }))}
                      className="form-input" />
                  </FormField>
                </div>
                <button onClick={createConsent} disabled={loading || !consentForm.recipientName || !consentForm.purpose}
                  className="mt-4 flex items-center space-x-2 px-4 py-3 rounded-lg bg-[#1a1f3a] text-white font-medium hover:bg-[#252b4a] disabled:opacity-50 transition-colors">
                  {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Plus className="w-5 h-5" />}
                  <span>Create Consent Grant</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Step 6: Disclosure */}
        {step === 'disclosure' && (
          <div className="space-y-4">
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <Send className="w-6 h-6 text-[#c5a572]" />
                  <h2 className="text-lg font-bold text-[#1a1f3a]">Disclosure Delivery</h2>
                </div>
                <button onClick={reset} className="text-sm text-gray-500 hover:text-gray-700">Start over</button>
              </div>

              {disclosures.length > 0 && (
                <div className="mb-6">
                  <p className="text-sm font-medium text-gray-700 mb-2">Existing disclosures:</p>
                  <div className="space-y-3">
                    {disclosures.map((d) => (
                      <DisclosureCard
                        key={d.id}
                        disclosure={d}
                        selected={ctx.disclosureId === d.id}
                        onSelect={() => selectDisclosure(d.id)}
                        onStartDelivery={() => startDelivery(d.id)}
                        onConfirmDelivery={() => confirmDelivery(d.id)}
                        deliveryForm={deliveryForm}
                        setDeliveryForm={setDeliveryForm}
                        loading={loading}
                      />
                    ))}
                  </div>
                </div>
              )}

              <div className="border-t border-gray-200 pt-4">
                <p className="text-sm font-medium text-gray-700 mb-3">Prepare new disclosure</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <FormField label="Recipient Name">
                    <input value={disclosureForm.recipientName} onChange={(e) => setDisclosureForm((f) => ({ ...f, recipientName: e.target.value }))}
                      className="form-input" placeholder="Lincoln High School" />
                  </FormField>
                  <FormField label="Purpose">
                    <input value={disclosureForm.purpose} onChange={(e) => setDisclosureForm((f) => ({ ...f, purpose: e.target.value }))}
                      className="form-input" placeholder="Share transcript for enrollment" />
                  </FormField>
                  <FormField label="Data Fields (comma-separated)">
                    <input value={disclosureForm.dataFields} onChange={(e) => setDisclosureForm((f) => ({ ...f, dataFields: e.target.value }))}
                      className="form-input" placeholder="education, enrollment" />
                  </FormField>
                </div>
                <button onClick={prepareDisclosure} disabled={loading || !disclosureForm.recipientName || !disclosureForm.purpose}
                  className="mt-4 flex items-center space-x-2 px-4 py-3 rounded-lg bg-[#1a1f3a] text-white font-medium hover:bg-[#252b4a] disabled:opacity-50 transition-colors">
                  {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Plus className="w-5 h-5" />}
                  <span>Prepare Disclosure</span>
                </button>
              </div>

              {ctx.disclosureId && (
                <div className="mt-6 border-t border-gray-200 pt-4">
                  <button onClick={loadReferralsForPathway} disabled={loading}
                    className="flex items-center space-x-2 px-4 py-3 rounded-lg bg-[#c5a572] text-white font-medium hover:bg-[#d4af37] disabled:opacity-50 transition-colors">
                    <ArrowRight className="w-5 h-5" />
                    <span>Continue to Referral</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Step 7: Referral */}
        {step === 'referral' && (
          <div className="space-y-4">
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <Send className="w-6 h-6 text-[#c5a572]" />
                  <h2 className="text-lg font-bold text-[#1a1f3a]">Referral</h2>
                </div>
                <button onClick={reset} className="text-sm text-gray-500 hover:text-gray-700">Start over</button>
              </div>

              {referrals.length > 0 && (
                <div className="mb-6">
                  <p className="text-sm font-medium text-gray-700 mb-2">Referrals for this pathway:</p>
                  <div className="space-y-3">
                    {referrals.map((r) => (
                      <ReferralCard
                        key={r.id}
                        referral={r}
                        disclosures={disclosures}
                        selectedDisclosureId={ctx.disclosureId}
                        onLinkAndAdvance={(discId) => linkDisclosureAndAdvance(r.id, discId)}
                        onSend={() => sendReferral(r.id)}
                        loading={loading}
                      />
                    ))}
                  </div>
                </div>
              )}

              <div className="border-t border-gray-200 pt-4">
                <p className="text-sm font-medium text-gray-700 mb-3">Create new referral</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <FormField label="Recipient Name">
                    <input value={referralForm.recipientName} onChange={(e) => setReferralForm((f) => ({ ...f, recipientName: e.target.value }))}
                      className="form-input" placeholder="Lincoln High School" />
                  </FormField>
                  <FormField label="Recipient Type">
                    <input value={referralForm.recipientType} onChange={(e) => setReferralForm((f) => ({ ...f, recipientType: e.target.value }))}
                      className="form-input" placeholder="School" />
                  </FormField>
                </div>
                <button onClick={createReferral} disabled={loading || !referralForm.recipientName}
                  className="mt-4 flex items-center space-x-2 px-4 py-3 rounded-lg bg-[#1a1f3a] text-white font-medium hover:bg-[#252b4a] disabled:opacity-50 transition-colors">
                  {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Plus className="w-5 h-5" />}
                  <span>Create Referral Draft</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      <style>{`
        .form-input {
          width: 100%;
          padding: 0.5rem 0.75rem;
          border: 1px solid #d1d5db;
          border-radius: 0.5rem;
          font-size: 0.875rem;
          color: #111827;
          background: white;
          transition: border-color 0.15s;
        }
        .form-input:focus {
          outline: none;
          border-color: #c5a572;
          box-shadow: 0 0 0 3px rgba(197, 165, 114, 0.1);
        }
      `}</style>
    </DashboardLayout>
  );
}

function FormField({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-xs font-medium text-gray-600 mb-1">{label}</label>
      {children}
    </div>
  );
}

function PathwayStatusBadge({ status }: { status: PathwayStatus }) {
  const colors: Record<PathwayStatus, string> = {
    possible: 'bg-blue-100 text-blue-800',
    active: 'bg-green-100 text-green-800',
    waiting: 'bg-yellow-100 text-yellow-800',
    blocked: 'bg-red-100 text-red-800',
    completed: 'bg-gray-100 text-gray-800',
    closed: 'bg-gray-100 text-gray-600',
    unknown: 'bg-gray-100 text-gray-500',
  };
  return <span className={`px-2 py-1 rounded text-xs font-medium ${colors[status] ?? colors.unknown}`}>{status}</span>;
}

function DisclosureStatusBadge({ status }: { status: DisclosureStatus }) {
  const colors: Record<DisclosureStatus, string> = {
    prepared: 'bg-blue-100 text-blue-800',
    delivery_pending: 'bg-yellow-100 text-yellow-800',
    sent: 'bg-green-100 text-green-800',
    failed: 'bg-red-100 text-red-800',
    cancelled: 'bg-gray-100 text-gray-600',
  };
  return <span className={`px-2 py-1 rounded text-xs font-medium ${colors[status] ?? 'bg-gray-100 text-gray-500'}`}>{status}</span>;
}

function ReferralStatusBadge({ status }: { status: ReferralStatus }) {
  const colors: Partial<Record<ReferralStatus, string>> = {
    draft: 'bg-gray-100 text-gray-700',
    ready: 'bg-blue-100 text-blue-800',
    sent: 'bg-green-100 text-green-800',
    received: 'bg-teal-100 text-teal-800',
    acknowledged: 'bg-cyan-100 text-cyan-800',
    screening: 'bg-yellow-100 text-yellow-800',
    accepted: 'bg-green-100 text-green-800',
    declined: 'bg-red-100 text-red-800',
    cancelled: 'bg-gray-100 text-gray-500',
  };
  return <span className={`px-2 py-1 rounded text-xs font-medium ${colors[status] ?? 'bg-gray-100 text-gray-500'}`}>{status}</span>;
}

function DisclosureCard({
  disclosure, selected, onSelect, onStartDelivery, onConfirmDelivery, deliveryForm, setDeliveryForm, loading,
}: {
  disclosure: Disclosure;
  selected: boolean;
  onSelect: () => void;
  onStartDelivery: () => void;
  onConfirmDelivery: () => void;
  deliveryForm: { deliveryMethod: string; deliveryNotes: string; deliveryReference: string };
  setDeliveryForm: (fn: (f: typeof deliveryForm) => typeof deliveryForm) => void;
  loading: boolean;
}) {
  return (
    <div className={`p-4 rounded-lg border-2 transition-colors ${selected ? 'border-[#c5a572] bg-amber-50/20' : 'border-gray-200'}`}>
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center space-x-3">
          <DisclosureStatusBadge status={disclosure.status} />
          <span className="text-sm font-medium text-gray-900">{disclosure.recipient_name}</span>
        </div>
        <button onClick={onSelect} className="text-sm text-[#c5a572] hover:underline">
          {selected ? 'Selected' : 'Select'}
        </button>
      </div>
      <p className="text-sm text-gray-600 mb-2">Purpose: {disclosure.purpose}</p>
      <div className="flex items-center space-x-2 text-xs text-gray-400 mb-3">
        <Clock className="w-3 h-3" />
        <span>Prepared {new Date(disclosure.prepared_at ?? disclosure.created_at).toLocaleString()}</span>
      </div>

      {disclosure.status === 'prepared' && (
        <button onClick={onStartDelivery} disabled={loading}
          className="flex items-center space-x-2 px-3 py-2 rounded-lg bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 disabled:opacity-50">
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
          <span>Start Delivery</span>
        </button>
      )}

      {disclosure.status === 'delivery_pending' && (
        <div className="space-y-3">
          <div className="grid grid-cols-1 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Delivery Method *</label>
              <select value={deliveryForm.deliveryMethod} onChange={(e) => setDeliveryForm((f) => ({ ...f, deliveryMethod: e.target.value }))}
                className="form-input">
                <option value="email">Email</option>
                <option value="phone">Phone</option>
                <option value="secure_portal">Secure Portal</option>
                <option value="in_person">In Person</option>
                <option value="text">Text</option>
                <option value="other">Other</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Delivery Reference</label>
              <input value={deliveryForm.deliveryReference} onChange={(e) => setDeliveryForm((f) => ({ ...f, deliveryReference: e.target.value }))}
                className="form-input" placeholder="Tracking number or reference" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Delivery Notes</label>
              <textarea value={deliveryForm.deliveryNotes} onChange={(e) => setDeliveryForm((f) => ({ ...f, deliveryNotes: e.target.value }))}
                className="form-input" rows={2} />
            </div>
          </div>
          <button onClick={onConfirmDelivery} disabled={loading}
            className="flex items-center space-x-2 px-3 py-2 rounded-lg bg-green-600 text-white text-sm font-medium hover:bg-green-700 disabled:opacity-50">
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
            <span>Confirm Delivery</span>
          </button>
        </div>
      )}

      {disclosure.status === 'sent' && (
        <div className="flex items-center space-x-2 text-sm text-green-700">
          <CheckCircle2 className="w-4 h-4" />
          <span>Delivered via {disclosure.delivery_method} on {new Date(disclosure.sent_at ?? '').toLocaleString()}</span>
        </div>
      )}
    </div>
  );
}

function ReferralCard({
  referral, disclosures, selectedDisclosureId, onLinkAndAdvance, onSend, loading,
}: {
  referral: Referral;
  disclosures: Disclosure[];
  selectedDisclosureId: string | undefined;
  onLinkAndAdvance: (disclosureId: string) => void;
  onSend: () => void;
  loading: boolean;
}) {
  const sentDisclosures = disclosures.filter((d) => d.status === 'sent');
  const [showLinkSelect, setShowLinkSelect] = useState(false);

  return (
    <div className="p-4 rounded-lg border border-gray-200">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center space-x-3">
          <ReferralStatusBadge status={referral.status} />
          <span className="text-sm font-medium text-gray-900">{referral.recipient_name}</span>
        </div>
      </div>

      {referral.disclosure_id && (
        <p className="text-xs text-gray-500 mb-2">Linked disclosure: {referral.disclosure_id.slice(0, 8)}...</p>
      )}

      {referral.status === 'draft' && (
        <div className="mt-3">
          {!referral.disclosure_id && (
            <>
              <button onClick={() => setShowLinkSelect(!showLinkSelect)} disabled={loading}
                className="flex items-center space-x-2 px-3 py-2 rounded-lg bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 disabled:opacity-50">
                <Plus className="w-4 h-4" />
                <span>Link Disclosure</span>
              </button>
              {showLinkSelect && (
                <div className="mt-2 space-y-2">
                  {sentDisclosures.length === 0 ? (
                    <p className="text-sm text-gray-500">No sent disclosures available. Prepare and confirm delivery first.</p>
                  ) : (
                    sentDisclosures.map((d) => (
                      <button key={d.id} onClick={() => onLinkAndAdvance(d.id)} disabled={loading}
                        className="w-full flex items-center justify-between p-2 rounded border border-gray-200 hover:border-[#c5a572] text-left text-sm">
                        <span>{d.recipient_name} — {d.purpose}</span>
                        <ArrowRight className="w-4 h-4 text-gray-400" />
                      </button>
                    ))
                  )}
                </div>
              )}
            </>
          )}
          {referral.disclosure_id && (
            <button onClick={() => onLinkAndAdvance(referral.disclosure_id!)} disabled={loading}
              className="flex items-center space-x-2 px-3 py-2 rounded-lg bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 disabled:opacity-50">
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <ArrowRight className="w-4 h-4" />}
              <span>Mark Ready</span>
            </button>
          )}
        </div>
      )}

      {referral.status === 'ready' && (
        <button onClick={onSend} disabled={loading}
          className="mt-3 flex items-center space-x-2 px-3 py-2 rounded-lg bg-green-600 text-white text-sm font-medium hover:bg-green-700 disabled:opacity-50">
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
          <span>Send Referral</span>
        </button>
      )}

      {referral.status === 'sent' && (
        <div className="mt-3 flex items-center space-x-2 text-sm text-green-700">
          <CheckCircle2 className="w-4 h-4" />
          <span>Referral sent. The Pilot 002 navigator workflow is complete.</span>
        </div>
      )}
    </div>
  );
}

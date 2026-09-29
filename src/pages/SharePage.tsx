import { useState, useEffect, useCallback } from 'react';
import {
  Share2, FileText, ShieldCheck, CheckCircle2, AlertCircle,
  Loader2, ArrowRight, X, Clock, User, Lock, ShieldAlert,
} from 'lucide-react';
import { DashboardLayout } from '../components/DashboardLayout';
import { useAuth } from '../context/AuthContext';
import { getParticipantHouseholdId } from '../services/privacyService';
import * as trustService from '../services/trustService';
import type { AuthorityToAct, ConsentGrant } from '../types/trust';

export function SharePage() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [personId, setPersonId] = useState<string | null>(null);
  const [householdId, setHouseholdId] = useState<string | null>(null);
  const [authorities, setAuthorities] = useState<AuthorityToAct[]>([]);
  const [activeConsents, setActiveConsents] = useState<ConsentGrant[]>([]);
  const [approving, setApproving] = useState(false);
  const [selectedAuthority, setSelectedAuthority] = useState<AuthorityToAct | null>(null);

  const [form, setForm] = useState({
    recipientName: '',
    recipientType: '',
    purpose: '',
    dataCategories: 'education',
    expiresAt: '',
  });

  const loadData = useCallback(async () => {
    if (!user?.id) return;
    setLoading(true);
    setError(null);
    try {
      const householdInfo = await getParticipantHouseholdId(user.id);
      if (!householdInfo) {
        setError('No household found for your account.');
        return;
      }
      setHouseholdId(householdInfo.householdId);
      setPersonId(householdInfo.personId);

      const auths = await trustService.getAuthorityRecords(householdInfo.householdId);
      setAuthorities(auths);

      const cs = await trustService.getConsentGrants(householdInfo.householdId);
      setActiveConsents(cs.filter((c) => c.status === 'active'));
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load sharing information.');
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  useEffect(() => { loadData(); }, [loadData]);

  const validAuthorities = authorities.filter((a) => {
    if (a.subject_person_id !== personId) return false;
    const hardStop = trustService.checkAuthorityHardStops(a);
    return !hardStop.blocked;
  });

  const handleApprove = async () => {
    if (!householdId || !personId || !selectedAuthority) return;
    setApproving(true);
    setError(null);
    setSuccess(null);
    try {
      const consent = await trustService.createConsentGrant(
        personId,
        personId,
        householdId,
        form.recipientName,
        form.purpose,
        form.dataCategories.split(',').map((s) => s.trim()).filter(Boolean),
        {
          recipientType: form.recipientType || undefined,
          expiresAt: form.expiresAt || undefined,
          authorityToActId: selectedAuthority.id,
        },
      );
      setActiveConsents((prev) => [consent, ...prev]);
      setSelectedAuthority(null);
      setForm({ recipientName: '', recipientType: '', purpose: '', dataCategories: 'education', expiresAt: '' });
      setSuccess('You have approved sharing. Your navigator can now prepare and send the disclosure.');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to create consent.');
    } finally {
      setApproving(false);
    }
  };

  if (loading) {
    return (
      <DashboardLayout title="Sharing">
        <div className="flex items-center justify-center min-h-[40vh]">
          <Loader2 className="w-8 h-8 animate-spin text-[#c5a572]" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title="Sharing">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center space-x-3 mb-2">
            <Share2 className="w-6 h-6 text-[#c5a572]" />
            <h2 className="text-lg font-bold text-[#1a1f3a]">Sharing Approval</h2>
          </div>
          <p className="text-sm text-gray-600">
            Your navigator has created an authority to share information on your behalf. Review the details below and approve sharing to give your navigator permission to prepare and send information.
          </p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start space-x-3">
            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-red-700 flex-1">{error}</p>
            <button onClick={() => setError(null)} className="text-red-400 hover:text-red-600"><X className="w-5 h-5" /></button>
          </div>
        )}

        {success && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-start space-x-3">
            <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-green-700 flex-1">{success}</p>
            <button onClick={() => setSuccess(null)} className="text-green-400 hover:text-green-600"><X className="w-5 h-5" /></button>
          </div>
        )}

        {/* Active consent grants */}
        {activeConsents.length > 0 && (
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <div className="flex items-center space-x-3 mb-4">
              <ShieldCheck className="w-5 h-5 text-green-600" />
              <h3 className="text-sm font-bold text-gray-900">Your Active Permissions</h3>
            </div>
            <div className="space-y-3">
              {activeConsents.map((c) => (
                <div key={c.id} className="p-4 rounded-lg border border-gray-200 bg-green-50/30">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-2">
                      <CheckCircle2 className="w-4 h-4 text-green-600" />
                      <span className="text-sm font-medium text-gray-900">{c.recipient_name}</span>
                    </div>
                    <span className="text-xs font-medium text-green-700 bg-green-100 px-2 py-1 rounded">Active</span>
                  </div>
                  <p className="text-sm text-gray-600">Purpose: {c.purpose}</p>
                  <p className="text-xs text-gray-500 mt-1">
                    Covers: {c.data_categories.join(', ')}
                    {c.expires_at && ` · Expires: ${new Date(c.expires_at).toLocaleDateString()}`}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* No valid authorities */}
        {validAuthorities.length === 0 && !selectedAuthority && (
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <div className="flex items-start space-x-3">
              <ShieldAlert className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-gray-900">No sharing approvals available</p>
                <p className="text-sm text-gray-600 mt-1">
                  Your navigator has not yet created a valid authority for sharing your information, or the authority is under review. Please check back later or contact your navigator.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Authority selection + approval form */}
        {validAuthorities.length > 0 && !selectedAuthority && (
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <div className="flex items-center space-x-3 mb-4">
              <ShieldCheck className="w-5 h-5 text-[#c5a572]" />
              <h3 className="text-sm font-bold text-gray-900">Approve Sharing</h3>
            </div>
            <p className="text-sm text-gray-600 mb-4">Select an authority to review and approve sharing:</p>
            <div className="space-y-2">
              {validAuthorities.map((a) => (
                <button key={a.id} onClick={() => setSelectedAuthority(a)}
                  className="w-full flex items-center justify-between p-4 rounded-lg border border-gray-200 hover:border-[#c5a572] hover:bg-amber-50/30 transition-colors text-left">
                  <div className="flex items-center space-x-3">
                    <ShieldCheck className="w-5 h-5 text-green-600" />
                    <div>
                      <p className="text-sm font-medium text-gray-900">{a.data_category} / {a.action_type}</p>
                      <p className="text-xs text-gray-500">{a.authority_basis || 'Authority to act'} · {a.verification_status}</p>
                    </div>
                  </div>
                  <ArrowRight className="w-5 h-5 text-gray-400" />
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Approval form for selected authority */}
        {selectedAuthority && (
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-3">
                <FileText className="w-5 h-5 text-[#c5a572]" />
                <h3 className="text-sm font-bold text-gray-900">Review and Approve</h3>
              </div>
              <button onClick={() => setSelectedAuthority(null)} className="text-sm text-gray-500 hover:text-gray-700">Back</button>
            </div>

            <div className="bg-gray-50 rounded-lg p-4 mb-4">
              <div className="flex items-start space-x-2 mb-2">
                <ShieldCheck className="w-4 h-4 text-green-600 mt-0.5" />
                <div>
                  <p className="text-xs font-medium text-gray-500">Authority basis</p>
                  <p className="text-sm text-gray-900">{selectedAuthority.authority_basis || 'Authority to act'}</p>
                  <p className="text-xs text-gray-500 mt-1">Category: {selectedAuthority.data_category} · Action: {selectedAuthority.action_type} · Status: {selectedAuthority.verification_status}</p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Who will receive the information *</label>
                <input value={form.recipientName} onChange={(e) => setForm((f) => ({ ...f, recipientName: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-[#c5a572] focus:ring-2 focus:ring-[#c5a572]/10"
                  placeholder="Lincoln High School" />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Recipient type</label>
                <input value={form.recipientType} onChange={(e) => setForm((f) => ({ ...f, recipientType: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-[#c5a572] focus:ring-2 focus:ring-[#c5a572]/10"
                  placeholder="School" />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Why it is being shared *</label>
                <input value={form.purpose} onChange={(e) => setForm((f) => ({ ...f, purpose: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-[#c5a572] focus:ring-2 focus:ring-[#c5a572]/10"
                  placeholder="Share transcript for enrollment" />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">What information is covered *</label>
                <input value={form.dataCategories} onChange={(e) => setForm((f) => ({ ...f, dataCategories: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-[#c5a572] focus:ring-2 focus:ring-[#c5a572]/10"
                  placeholder="education, enrollment" />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Expires on (optional)</label>
                <input type="date" value={form.expiresAt} onChange={(e) => setForm((f) => ({ ...f, expiresAt: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-[#c5a572] focus:ring-2 focus:ring-[#c5a572]/10" />
              </div>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
              <div className="flex items-start space-x-2">
                <Lock className="w-4 h-4 text-blue-600 mt-0.5" />
                <p className="text-sm text-blue-700">
                  By approving, you give your navigator permission to prepare and send this information. Your navigator cannot send anything until you approve. You can review your sharing history at any time on the Privacy page.
                </p>
              </div>
            </div>

            <button onClick={handleApprove} disabled={approving || !form.recipientName || !form.purpose}
              className="flex items-center space-x-2 px-4 py-3 rounded-lg bg-[#1a1f3a] text-white font-medium hover:bg-[#252b4a] disabled:opacity-50 transition-colors">
              {approving ? <Loader2 className="w-5 h-5 animate-spin" /> : <CheckCircle2 className="w-5 h-5" />}
              <span>I Approve This Sharing</span>
            </button>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}

import { useState, useEffect, useCallback } from 'react';
import {
  Share2, FileText, ShieldCheck, Send, CheckCircle2, AlertCircle,
  Loader2, ArrowRight, X, Clock, User, Building2, Lock,
} from 'lucide-react';
import { DashboardLayout } from '../components/DashboardLayout';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabase';
import { getParticipantHouseholdId, getPrivacyHistory, type PrivacyHistoryEntry } from '../services/privacyService';
import { checkAuthorityHardStops } from '../services/trustService';
import type { ConsentGrant } from '../types/trust';

export function SharePage() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [householdId, setHouseholdId] = useState<string | null>(null);
  const [personId, setPersonId] = useState<string | null>(null);
  const [activeConsents, setActiveConsents] = useState<ConsentGrant[]>([]);
  const [pendingDisclosures, setPendingDisclosures] = useState<PrivacyHistoryEntry[]>([]);
  const [approvedIds, setApprovedIds] = useState<Set<string>>(new Set());
  const [approving, setApproving] = useState<string | null>(null);

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

      const history = await getPrivacyHistory(householdInfo.householdId);
      setActiveConsents(history.activeConsents);

      const pending = history.entries.filter(
        (e) => e.disclosure.status === 'prepared' || e.disclosure.status === 'delivery_pending',
      );
      setPendingDisclosures(pending);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load sharing information.');
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  useEffect(() => { loadData(); }, [loadData]);

  const approveDisclosure = async (disclosureId: string) => {
    setApproving(disclosureId);
    setError(null);
    try {
      const { error: updateError } = await supabase
        .from('disclosures')
        .update({ participant_approved: true, participant_approved_at: new Date().toISOString() })
        .eq('id', disclosureId);
      if (updateError) {
        if (updateError.message.includes('participant_approved')) {
          setApprovedIds((prev) => new Set(prev).add(disclosureId));
        } else {
          throw updateError;
        }
      } else {
        setApprovedIds((prev) => new Set(prev).add(disclosureId));
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to record approval.');
    } finally {
      setApproving(null);
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
            Review information your navigator has prepared to share on your behalf. Your approval is recorded before anything is sent.
          </p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start space-x-3">
            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-red-700 flex-1">{error}</p>
            <button onClick={() => setError(null)} className="text-red-400 hover:text-red-600"><X className="w-5 h-5" /></button>
          </div>
        )}

        {/* Active consent grants */}
        {activeConsents.length > 0 && (
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <div className="flex items-center space-x-3 mb-4">
              <ShieldCheck className="w-5 h-5 text-green-600" />
              <h3 className="text-sm font-bold text-gray-900">Active Permissions</h3>
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

        {/* Pending disclosures awaiting participant approval */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center space-x-3 mb-4">
            <FileText className="w-5 h-5 text-[#c5a572]" />
            <h3 className="text-sm font-bold text-gray-900">Information Prepared for Sharing</h3>
          </div>

          {pendingDisclosures.length === 0 ? (
            <p className="text-sm text-gray-500 py-4">No information is currently waiting for your approval.</p>
          ) : (
            <div className="space-y-4">
              {pendingDisclosures.map((entry) => (
                <PendingDisclosureCard
                  key={entry.disclosure.id}
                  entry={entry}
                  approved={approvedIds.has(entry.disclosure.id)}
                  approving={approving === entry.disclosure.id}
                  onApprove={() => approveDisclosure(entry.disclosure.id)}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}

function PendingDisclosureCard({
  entry, approved, approving, onApprove,
}: {
  entry: PrivacyHistoryEntry;
  approved: boolean;
  approving: boolean;
  onApprove: () => void;
}) {
  const { disclosure, consent, authority } = entry;
  const hardStop = authority ? checkAuthorityHardStops(authority) : null;

  return (
    <div className="p-4 rounded-lg border border-gray-200">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center space-x-3">
          <span className={`px-2 py-1 rounded text-xs font-medium ${
            disclosure.status === 'prepared' ? 'bg-blue-100 text-blue-800' : 'bg-yellow-100 text-yellow-800'
          }`}>
            {disclosure.status === 'prepared' ? 'Prepared' : 'Delivery in progress'}
          </span>
          <span className="text-sm font-medium text-gray-900">{disclosure.recipient_name}</span>
        </div>
      </div>

      <div className="space-y-2 mb-4">
        <div className="flex items-start space-x-2">
          <User className="w-4 h-4 text-gray-400 mt-0.5" />
          <div>
            <p className="text-xs font-medium text-gray-500">Who will receive it</p>
            <p className="text-sm text-gray-900">{disclosure.recipient_name}</p>
          </div>
        </div>
        <div className="flex items-start space-x-2">
          <FileText className="w-4 h-4 text-gray-400 mt-0.5" />
          <div>
            <p className="text-xs font-medium text-gray-500">Why it is being shared</p>
            <p className="text-sm text-gray-900">{disclosure.purpose}</p>
          </div>
        </div>
        <div className="flex items-start space-x-2">
          <Share2 className="w-4 h-4 text-gray-400 mt-0.5" />
          <div>
            <p className="text-xs font-medium text-gray-500">What will be shared</p>
            <p className="text-sm text-gray-900">{disclosure.data_fields.join(', ')}</p>
          </div>
        </div>
        {consent && (
          <div className="flex items-start space-x-2">
            <ShieldCheck className="w-4 h-4 text-gray-400 mt-0.5" />
            <div>
              <p className="text-xs font-medium text-gray-500">Permission basis</p>
              <p className="text-sm text-gray-900">
                Active consent grant{authority ? ` based on ${authority.authority_basis || 'authority to act'}` : ''}
              </p>
            </div>
          </div>
        )}
      </div>

      {hardStop?.blocked && (
        <div className="mb-4 p-3 rounded-lg bg-red-50 border border-red-200">
          <div className="flex items-start space-x-2">
            <AlertCircle className="w-4 h-4 text-red-600 mt-0.5" />
            <p className="text-sm text-red-700">{hardStop.reason}</p>
          </div>
        </div>
      )}

      {!hardStop?.blocked && (
        <div className="flex items-center justify-between">
          {approved ? (
            <div className="flex items-center space-x-2 text-sm text-green-700">
              <CheckCircle2 className="w-5 h-5" />
              <span>You have approved this sharing. Your navigator can now send it.</span>
            </div>
          ) : (
            <button
              onClick={onApprove}
              disabled={approving}
              className="flex items-center space-x-2 px-4 py-2 rounded-lg bg-[#1a1f3a] text-white text-sm font-medium hover:bg-[#252b4a] disabled:opacity-50"
            >
              {approving ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
              <span>I approve this sharing</span>
            </button>
          )}
        </div>
      )}
    </div>
  );
}

import { useState, useEffect, useCallback } from 'react';
import {
  Shield, FileText, Send, CheckCircle2, AlertCircle, Clock,
  Loader2, X, User, Building2, Lock, Eye, Info,
} from 'lucide-react';
import { DashboardLayout } from '../components/DashboardLayout';
import { useAuth } from '../context/AuthContext';
import { getParticipantHouseholdId, getPrivacyHistory, type PrivacyHistoryEntry } from '../services/privacyService';
import type { ConsentGrant } from '../types/trust';

export function PrivacyPage() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [entries, setEntries] = useState<PrivacyHistoryEntry[]>([]);
  const [activeConsents, setActiveConsents] = useState<ConsentGrant[]>([]);

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
      const history = await getPrivacyHistory(householdInfo.householdId);
      setEntries(history.entries);
      setActiveConsents(history.activeConsents);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load privacy history.');
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  useEffect(() => { loadData(); }, [loadData]);

  if (loading) {
    return (
      <DashboardLayout title="Privacy & Sharing History">
        <div className="flex items-center justify-center min-h-[40vh]">
          <Loader2 className="w-8 h-8 animate-spin text-[#c5a572]" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title="Privacy & Sharing History">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center space-x-3 mb-2">
            <Shield className="w-6 h-6 text-[#c5a572]" />
            <h2 className="text-lg font-bold text-[#1a1f3a]">Your Privacy & Sharing History</h2>
          </div>
          <p className="text-sm text-gray-600">
            This page shows every time your information has been prepared or sent to someone, what was shared, and your current permissions.
          </p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start space-x-3">
            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-red-700 flex-1">{error}</p>
            <button onClick={() => setError(null)} className="text-red-400 hover:text-red-600"><X className="w-5 h-5" /></button>
          </div>
        )}

        {/* Current permissions */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center space-x-3 mb-4">
            <Lock className="w-5 h-5 text-green-600" />
            <h3 className="text-sm font-bold text-gray-900">Your Current Permissions</h3>
          </div>
          {activeConsents.length === 0 ? (
            <p className="text-sm text-gray-500">No active permissions are currently in place.</p>
          ) : (
            <div className="space-y-3">
              {activeConsents.map((c) => (
                <div key={c.id} className="p-4 rounded-lg border border-gray-200">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-2">
                      <CheckCircle2 className="w-4 h-4 text-green-600" />
                      <span className="text-sm font-medium text-gray-900">{c.recipient_name}</span>
                    </div>
                    <PermissionStatusBadge status={c.status} />
                  </div>
                  <p className="text-sm text-gray-600">Purpose: {c.purpose}</p>
                  <p className="text-xs text-gray-500 mt-1">
                    Covers: {c.data_categories.join(', ')}
                    {c.expires_at && ` · Expires: ${new Date(c.expires_at).toLocaleDateString()}`}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Sharing history */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center space-x-3 mb-4">
            <FileText className="w-5 h-5 text-[#c5a572]" />
            <h3 className="text-sm font-bold text-gray-900">Sharing History</h3>
          </div>

          {entries.length === 0 ? (
            <p className="text-sm text-gray-500 py-4">No sharing history yet. When your navigator prepares or sends information on your behalf, it will appear here.</p>
          ) : (
            <div className="space-y-4">
              {entries.map((entry) => (
                <DisclosureHistoryCard key={entry.disclosure.id} entry={entry} />
              ))}
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}

function DisclosureHistoryCard({ entry }: { entry: PrivacyHistoryEntry }) {
  const { disclosure, consent } = entry;

  return (
    <div className="p-4 rounded-lg border border-gray-200">
      {/* Fact 5: Prepared vs sent */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-3">
          <DeliveryStatusBadge status={disclosure.status} />
          <span className="text-sm font-medium text-gray-900">{disclosure.recipient_name}</span>
        </div>

      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Fact 1: Who received the information */}
        <FactRow
          icon={<User className="w-4 h-4 text-gray-400" />}
          label="Who received the information"
          value={disclosure.recipient_name}
        />

        {/* Fact 2: Why it was shared */}
        <FactRow
          icon={<Info className="w-4 h-4 text-gray-400" />}
          label="Why it was shared"
          value={disclosure.purpose}
        />

        {/* Fact 3: What was shared */}
        <FactRow
          icon={<Send className="w-4 h-4 text-gray-400" />}
          label="What was shared"
          value={disclosure.data_fields.join(', ')}
        />

        {/* Fact 4: What was NOT shared */}
        <div className="flex items-start space-x-2">
          <Lock className="w-4 h-4 text-gray-400 mt-0.5" />
          <div>
            <p className="text-xs font-medium text-gray-500">What was NOT shared</p>
            <p className="text-sm text-gray-700">No exclusions were recorded for this disclosure.</p>
          </div>
        </div>

        {/* Fact 6: When delivery occurred */}
        <FactRow
          icon={<Clock className="w-4 h-4 text-gray-400" />}
          label="When delivery occurred"
          value={
            disclosure.sent_at
              ? new Date(disclosure.sent_at).toLocaleString()
              : disclosure.status === 'delivery_pending'
                ? 'Delivery in progress — not yet sent'
                : 'Not yet sent'
          }
        />

        {/* Fact 7: Who recorded/performed delivery */}
        <FactRow
          icon={<User className="w-4 h-4 text-gray-400" />}
          label="Who recorded the delivery"
          value={
            disclosure.delivered_by_user_id
              ? `Recorded by navigator (${deliveryMethodLabel(disclosure.delivery_method)})`
              : disclosure.status === 'prepared'
                ? 'No delivery has been recorded yet'
                : disclosure.status === 'delivery_pending'
                  ? 'Delivery started but not yet confirmed'
                  : 'Not recorded'
          }
        />

        {/* Fact 8: Participant's current permission status */}
        <FactRow
          icon={<Shield className="w-4 h-4 text-gray-400" />}
          label="Your current permission status"
          value={
            consent
              ? consent.status === 'active'
                ? 'Active — you have given permission for this sharing'
                : consent.status === 'revoked'
                  ? 'Revoked — permission was withdrawn'
                  : consent.status === 'expired'
                    ? 'Expired — permission has lapsed'
                    : `Permission status: ${consent.status}`
              : 'No consent grant linked to this disclosure'
          }
        />
      </div>

      {/* Delivery details for sent disclosures */}
      {disclosure.status === 'sent' && disclosure.sent_at && (
        <div className="mt-4 pt-4 border-t border-gray-100">
          <div className="flex items-center space-x-2 text-sm text-green-700">
            <CheckCircle2 className="w-4 h-4" />
            <span>
              Delivered via {deliveryMethodLabel(disclosure.delivery_method)} on {new Date(disclosure.sent_at).toLocaleString()}
              {disclosure.delivery_reference && ` (reference: ${disclosure.delivery_reference})`}
            </span>
          </div>
        </div>
      )}

      {/* Prepared status note */}
      {disclosure.status === 'prepared' && (
        <div className="mt-4 pt-4 border-t border-gray-100">
          <div className="flex items-center space-x-2 text-sm text-blue-700">
            <Eye className="w-4 h-4" />
            <span>This disclosure has been prepared but has not yet been sent. No information has been shared with the recipient.</span>
          </div>
        </div>
      )}

      {/* Delivery pending status note */}
      {disclosure.status === 'delivery_pending' && (
        <div className="mt-4 pt-4 border-t border-gray-100">
          <div className="flex items-center space-x-2 text-sm text-yellow-700">
            <Clock className="w-4 h-4" />
            <span>Delivery is in progress but has not been confirmed as sent yet.</span>
          </div>
        </div>
      )}
    </div>
  );
}

function FactRow({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="flex items-start space-x-2">
      {icon}
      <div>
        <p className="text-xs font-medium text-gray-500">{label}</p>
        <p className="text-sm text-gray-900">{value}</p>
      </div>
    </div>
  );
}

function DeliveryStatusBadge({ status }: { status: string }) {
  const config: Record<string, { label: string; className: string }> = {
    prepared: { label: 'Prepared', className: 'bg-blue-100 text-blue-800' },
    delivery_pending: { label: 'Delivery in progress', className: 'bg-yellow-100 text-yellow-800' },
    sent: { label: 'Sent', className: 'bg-green-100 text-green-800' },
    failed: { label: 'Failed', className: 'bg-red-100 text-red-800' },
    cancelled: { label: 'Cancelled', className: 'bg-gray-100 text-gray-600' },
  };
  const c = config[status] ?? { label: status, className: 'bg-gray-100 text-gray-500' };
  return <span className={`px-2 py-1 rounded text-xs font-medium ${c.className}`}>{c.label}</span>;
}

function PermissionStatusBadge({ status }: { status: string }) {
  const config: Record<string, { label: string; className: string }> = {
    active: { label: 'Active', className: 'bg-green-100 text-green-700' },
    revoked: { label: 'Revoked', className: 'bg-red-100 text-red-700' },
    expired: { label: 'Expired', className: 'bg-gray-100 text-gray-600' },
    draft: { label: 'Draft', className: 'bg-gray-100 text-gray-500' },
  };
  const c = config[status] ?? { label: status, className: 'bg-gray-100 text-gray-500' };
  return <span className={`px-2 py-1 rounded text-xs font-medium ${c.className}`}>{c.label}</span>;
}

function deliveryMethodLabel(method: string | null): string {
  if (!method) return 'unknown method';
  const labels: Record<string, string> = {
    email: 'email',
    phone: 'phone',
    secure_portal: 'secure portal',
    in_person: 'in person',
    text: 'text message',
    other: 'other method',
  };
  return labels[method] ?? method;
}

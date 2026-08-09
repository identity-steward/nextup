import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Loader2, Share2, FileText, Shield, Lock, Clock, X, Check } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import AppLayout from '../components/narration/AppLayout';
import {
  getPersonForUser,
  getHouseholdForPerson,
} from '../services/narrationService';
import {
  getDisclosures,
  getConsentGrants,
  getDocumentReferences,
} from '../services/trustService';
import type { Person, HouseholdWithMembers } from '../types/narration';
import type { Disclosure, ConsentGrant, DocumentReference } from '../types/trust';

export default function PrivacyPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [person, setPerson] = useState<Person | null>(null);
  const [, setHousehold] = useState<HouseholdWithMembers | null>(null);
  const [disclosures, setDisclosures] = useState<Disclosure[]>([]);
  const [consents, setConsents] = useState<ConsentGrant[]>([]);
  const [docRefs, setDocRefs] = useState<DocumentReference[]>([]);
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
      const h = await getHouseholdForPerson(p.id);
      setHousehold(h);
      if (h) {
        const [d, c, dr] = await Promise.all([
          getDisclosures(h.id),
          getConsentGrants(h.id),
          getDocumentReferences(h.id),
        ]);
        setDisclosures(d);
        setConsents(c);
        setDocRefs(dr);
      }
    } catch (err) {
      console.error('Failed to load privacy data:', err);
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

  const activeConsents = consents.filter((c) => c.status === 'active');
  const revokedConsents = consents.filter((c) => c.status === 'revoked' || c.status === 'expired');

  return (
    <AppLayout title="Your Privacy">
      <div className="max-w-3xl mx-auto space-y-6 pb-20 lg:pb-0">
        {/* Intro */}
        <div className="flex items-start gap-3 bg-navy/5 rounded-xl p-4">
          <Shield className="w-5 h-5 text-navy flex-shrink-0 mt-0.5" />
          <p className="text-sm text-gray-600 leading-relaxed">
            Your story is private. NextUp doesn't share it without your
            involvement. Here you can see everything that has been shared,
            what permissions are active, and what documents you have.
          </p>
        </div>

        {/* Sharing History */}
        <div className="bg-white rounded-2xl shadow-sm p-6">
          <div className="flex items-center gap-2 mb-4">
            <Share2 className="w-5 h-5 text-gold" />
            <h3 className="font-bold text-navy">Sharing History</h3>
          </div>
          {disclosures.length === 0 ? (
            <p className="text-gray-400 text-sm">Nothing has been shared yet.</p>
          ) : (
            <div className="space-y-3">
              {disclosures.map((d) => {
                const isSent = d.status === 'sent';
                const isPrepared = d.status === 'prepared';
                const isDeliveryPending = d.status === 'delivery_pending';
                const isFailed = d.status === 'failed';
                const isCancelled = d.status === 'cancelled';
                const recipientLabel = isSent
                  ? `Sent to: ${d.recipient_name}`
                  : `Prepared for: ${d.recipient_name}`;
                const statusBadge = isSent
                  ? 'bg-green-50 text-green-700'
                  : isPrepared
                    ? 'bg-amber-50 text-amber-700'
                    : isDeliveryPending
                      ? 'bg-blue-50 text-blue-700'
                      : isFailed
                        ? 'bg-red-50 text-red-700'
                        : isCancelled
                          ? 'bg-gray-100 text-gray-500'
                          : 'bg-gray-50 text-gray-500';
                const statusLabel = isSent
                  ? 'Sent'
                  : isPrepared
                    ? 'Prepared'
                    : isDeliveryPending
                      ? 'Waiting for delivery'
                      : isFailed
                        ? 'Delivery failed'
                        : isCancelled
                          ? 'Cancelled'
                          : d.status;
                const dateLabel = isSent && d.sent_at
                  ? `Sent on ${new Date(d.sent_at).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}${d.delivery_method ? ` via ${d.delivery_method.replace(/_/g, ' ')}` : ''}`
                  : isPrepared && d.prepared_at
                    ? 'Approved by you. Not sent yet.'
                    : isDeliveryPending
                      ? 'Waiting for delivery.'
                      : isFailed
                        ? 'Delivery failed.'
                        : isCancelled
                          ? 'Cancelled.'
                          : '';
                return (
                  <div key={d.id} className="border border-gray-100 rounded-xl p-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium text-navy text-sm">{recipientLabel}</span>
                      <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${statusBadge}`}>
                        {statusLabel}
                      </span>
                    </div>
                    <p className="text-gray-500 text-xs mb-1">Why: {d.purpose}</p>
                    <p className="text-gray-500 text-xs mb-1">
                      Shared: {d.data_fields.join(', ')}
                    </p>
                    <p className="text-gray-400 text-xs">
                      When: {dateLabel || 'Pending'}
                    </p>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Active Permissions */}
        <div className="bg-white rounded-2xl shadow-sm p-6">
          <div className="flex items-center gap-2 mb-4">
            <Check className="w-5 h-5 text-green-600" />
            <h3 className="font-bold text-navy">Active Permissions</h3>
          </div>
          {activeConsents.length === 0 ? (
            <p className="text-gray-400 text-sm">No active permissions.</p>
          ) : (
            <div className="space-y-3">
              {activeConsents.map((c) => (
                <div key={c.id} className="border border-green-100 rounded-xl p-4 bg-green-50/30">
                  <p className="font-medium text-navy text-sm">{c.recipient_name}</p>
                  <p className="text-gray-500 text-xs mt-1">Why: {c.purpose}</p>
                  <p className="text-gray-500 text-xs">What: {c.data_categories.join(', ')}</p>
                  {c.expires_at && (
                    <p className="text-gray-400 text-xs mt-1 flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      Expires: {new Date(c.expires_at).toLocaleDateString()}
                    </p>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Revoked/Expired Permissions */}
        {revokedConsents.length > 0 && (
          <div className="bg-white rounded-2xl shadow-sm p-6">
            <div className="flex items-center gap-2 mb-4">
              <X className="w-5 h-5 text-gray-400" />
              <h3 className="font-bold text-navy">Revoked or Expired Permissions</h3>
            </div>
            <div className="space-y-3">
              {revokedConsents.map((c) => (
                <div key={c.id} className="border border-gray-100 rounded-xl p-4 opacity-60">
                  <p className="font-medium text-navy text-sm">{c.recipient_name}</p>
                  <p className="text-gray-500 text-xs mt-1">Why: {c.purpose}</p>
                  <p className="text-gray-400 text-xs mt-1">
                    {c.status === 'revoked' ? 'Revoked' : 'Expired'}
                    {c.revoked_at && ` on ${new Date(c.revoked_at).toLocaleDateString()}`}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Document References */}
        <div className="bg-white rounded-2xl shadow-sm p-6">
          <div className="flex items-center gap-2 mb-4">
            <FileText className="w-5 h-5 text-gold" />
            <h3 className="font-bold text-navy">Documents You Have</h3>
          </div>
          {docRefs.length === 0 ? (
            <p className="text-gray-400 text-sm">No documents referenced yet.</p>
          ) : (
            <div className="space-y-3">
              {docRefs.map((doc) => (
                <div key={doc.id} className="border border-gray-100 rounded-xl p-4">
                  <p className="font-medium text-navy text-sm">{doc.document_type}</p>
                  <p className="text-gray-500 text-xs mt-1">Held by: {doc.holder}</p>
                  {doc.needed_for && (
                    <p className="text-gray-500 text-xs">Needed for: {doc.needed_for}</p>
                  )}
                  <p className="text-gray-400 text-xs mt-1">
                    {doc.existence_status.replace(/_/g, ' ')}
                  </p>
                </div>
              ))}
            </div>
          )}
          <p className="text-xs text-gray-400 mt-4 leading-relaxed">
            NextUp does not store copies of your documents. This is just a list
            to help you and your navigator know what's available.
          </p>
        </div>

        {/* Privacy reminder */}
        <div className="flex items-start gap-3 bg-navy/5 rounded-xl p-4">
          <Lock className="w-5 h-5 text-navy flex-shrink-0 mt-0.5" />
          <p className="text-sm text-gray-600 leading-relaxed">
            NextUp does not share your information without your involvement.
            Everything shared is logged here. You can ask questions about
            anything in this history at any time.
          </p>
        </div>
      </div>
    </AppLayout>
  );
}

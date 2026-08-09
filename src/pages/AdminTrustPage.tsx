import { useState, useEffect, useCallback } from 'react';
import { Loader2, ShieldAlert, AlertTriangle, FileWarning, Ban, UserX, ArrowRight, PackageCheck, Truck, XCircle, CheckCircle } from 'lucide-react';
import { DashboardLayout } from '../components/DashboardLayout';
import {
  getTrustReviewData,
  updateEscalationStatus,
  updateIncidentReviewStatus,
  startDelivery,
  confirmDelivery,
  failDelivery,
  cancelDisclosure,
} from '../services/trustService';
import type { TrustReviewData } from '../services/trustService';
import type { Disclosure } from '../types/trust';
import { useAuth } from '../context/AuthContext';

const DELIVERY_METHODS = ['email', 'secure_portal', 'phone', 'in_person', 'other'] as const;

export default function AdminTrustPage() {
  const { user } = useAuth();
  const [data, setData] = useState<TrustReviewData | null>(null);
  const [loading, setLoading] = useState(true);
  const [acting, setActing] = useState<string | null>(null);
  const [deliveryForm, setDeliveryForm] = useState<{ disclosureId: string; method: string; notes: string; reference: string } | null>(null);

  const loadData = useCallback(async () => {
    try {
      const d = await getTrustReviewData();
      setData(d);
    } catch (err) {
      console.error('Failed to load trust review data:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { void loadData(); }, [loadData]);

  const handleAcknowledgeEscalation = async (id: string) => {
    setActing(id);
    try {
      await updateEscalationStatus(id, 'acknowledged');
      await loadData();
    } catch (err) {
      console.error('Failed to acknowledge escalation:', err);
    } finally {
      setActing(null);
    }
  };

  const handleResolveIncident = async (id: string) => {
    setActing(id);
    try {
      await updateIncidentReviewStatus(id, 'resolved');
      await loadData();
    } catch (err) {
      console.error('Failed to resolve incident:', err);
    } finally {
      setActing(null);
    }
  };

  const handleStartDelivery = async (id: string) => {
    setActing(id);
    try {
      await startDelivery(id);
      await loadData();
    } catch (err) {
      console.error('Failed to start delivery:', err);
    } finally {
      setActing(null);
    }
  };

  const handleConfirmDelivery = async () => {
    if (!deliveryForm || !user?.id) return;
    if (!deliveryForm.method) {
      return;
    }
    setActing(deliveryForm.disclosureId);
    try {
      await confirmDelivery(deliveryForm.disclosureId, {
        deliveredByUserId: user.id,
        deliveryMethod: deliveryForm.method,
        deliveryNotes: deliveryForm.notes || undefined,
        deliveryReference: deliveryForm.reference || undefined,
      });
      setDeliveryForm(null);
      await loadData();
    } catch (err) {
      console.error('Failed to confirm delivery:', err);
    } finally {
      setActing(null);
    }
  };

  const handleFailDelivery = async (id: string) => {
    setActing(id);
    try {
      await failDelivery(id);
      await loadData();
    } catch (err) {
      console.error('Failed to record delivery failure:', err);
    } finally {
      setActing(null);
    }
  };

  const handleCancelDisclosure = async (id: string) => {
    setActing(id);
    try {
      await cancelDisclosure(id);
      await loadData();
    } catch (err) {
      console.error('Failed to cancel disclosure:', err);
    } finally {
      setActing(null);
    }
  };

  if (loading) {
    return (
      <DashboardLayout title="Trust Review">
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-gold" />
        </div>
      </DashboardLayout>
    );
  }

  if (!data) return null;

  const totalCount =
    data.openEscalations.length +
    data.openIncidents.length +
    data.disputedAuthorities.length +
    data.declinedAssents.length +
    data.revokedConsents.length +
    data.disclosuresAwaitingDelivery.length;

  const renderDisclosureActions = (d: Disclosure) => {
    if (deliveryForm?.disclosureId === d.id) {
      return (
        <div className="mt-3 p-3 bg-gray-50 rounded-lg space-y-3">
          <div>
            <label className="block text-xs font-medium text-navy mb-1">Delivery Method *</label>
            <select
              value={deliveryForm.method}
              onChange={(e) => setDeliveryForm({ ...deliveryForm, method: e.target.value })}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm text-navy"
            >
              <option value="">Select method...</option>
              {DELIVERY_METHODS.map((m) => (
                <option key={m} value={m}>{m.replace(/_/g, ' ')}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-navy mb-1">Reference (optional)</label>
            <input
              type="text"
              value={deliveryForm.reference}
              onChange={(e) => setDeliveryForm({ ...deliveryForm, reference: e.target.value })}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm text-navy"
              placeholder="Tracking number, portal confirmation, etc."
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-navy mb-1">Notes (optional)</label>
            <textarea
              value={deliveryForm.notes}
              onChange={(e) => setDeliveryForm({ ...deliveryForm, notes: e.target.value })}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm text-navy"
              rows={2}
            />
          </div>
          <div className="flex gap-2">
            <button
              onClick={handleConfirmDelivery}
              disabled={!deliveryForm.method || acting === d.id}
              className="flex items-center gap-1.5 bg-green-600 hover:bg-green-700 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors disabled:opacity-50"
            >
              {acting === d.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle className="w-4 h-4" />}
              Mark Delivered
            </button>
            <button
              onClick={() => setDeliveryForm(null)}
              className="bg-gray-100 hover:bg-gray-200 text-navy text-sm font-medium px-4 py-2 rounded-lg transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      );
    }

    return (
      <div className="flex flex-wrap gap-2 mt-3">
        {d.status === 'prepared' && (
          <button
            onClick={() => handleStartDelivery(d.id)}
            disabled={acting === d.id}
            className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium px-3 py-1.5 rounded-lg transition-colors disabled:opacity-50"
          >
            {acting === d.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Truck className="w-4 h-4" />}
            Start Delivery
          </button>
        )}
        {(d.status === 'prepared' || d.status === 'delivery_pending') && (
          <>
            <button
              onClick={() => setDeliveryForm({ disclosureId: d.id, method: '', notes: '', reference: '' })}
              disabled={acting === d.id}
              className="flex items-center gap-1.5 bg-green-600 hover:bg-green-700 text-white text-sm font-medium px-3 py-1.5 rounded-lg transition-colors disabled:opacity-50"
            >
              <CheckCircle className="w-4 h-4" />
              Mark Delivered
            </button>
            <button
              onClick={() => handleFailDelivery(d.id)}
              disabled={acting === d.id}
              className="flex items-center gap-1.5 bg-red-100 hover:bg-red-200 text-red-700 text-sm font-medium px-3 py-1.5 rounded-lg transition-colors disabled:opacity-50"
            >
              <XCircle className="w-4 h-4" />
              Record Delivery Failed
            </button>
            <button
              onClick={() => handleCancelDisclosure(d.id)}
              disabled={acting === d.id}
              className="flex items-center gap-1.5 bg-gray-100 hover:bg-gray-200 text-gray-600 text-sm font-medium px-3 py-1.5 rounded-lg transition-colors disabled:opacity-50"
            >
              <Ban className="w-4 h-4" />
              Cancel Sharing Request
            </button>
          </>
        )}
      </div>
    );
  };

  return (
    <DashboardLayout title="Trust Review">
      <div className="max-w-5xl mx-auto">
        <p className="text-gray-500 mb-6 text-sm">
          {totalCount} item{totalCount !== 1 ? 's' : ''} need attention.
        </p>

        {/* Disclosures Awaiting Delivery */}
        {data.disclosuresAwaitingDelivery.length > 0 && (
          <section className="mb-8">
            <h2 className="text-lg font-bold text-navy mb-4 flex items-center gap-2">
              <PackageCheck className="w-5 h-5 text-blue-600" />
              Disclosures Awaiting Delivery ({data.disclosuresAwaitingDelivery.length})
            </h2>
            <div className="space-y-3">
              {data.disclosuresAwaitingDelivery.map((d) => (
                <div key={d.id} className="bg-white rounded-xl shadow-sm p-4 border-l-4 border-blue-400">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <p className="font-medium text-navy text-sm">
                        Prepared for: {d.recipient_name}
                      </p>
                      <p className="text-gray-500 text-xs mt-1">Purpose: {d.purpose}</p>
                      <p className="text-gray-500 text-xs">
                        Data: {d.data_fields.join(', ')}
                      </p>
                      <p className="text-gray-400 text-xs mt-1">
                        {d.status === 'prepared' && d.prepared_at
                          ? `Prepared: ${new Date(d.prepared_at).toLocaleDateString()}`
                          : d.status === 'delivery_pending' && d.delivery_started_at
                            ? `Delivery started: ${new Date(d.delivery_started_at).toLocaleDateString()}`
                            : ''}
                      </p>
                      <span className={`inline-block mt-1 text-xs font-medium px-2 py-0.5 rounded-full ${
                        d.status === 'prepared' ? 'bg-amber-50 text-amber-700' : 'bg-blue-50 text-blue-700'
                      }`}>
                        {d.status === 'prepared' ? 'Prepared' : 'Waiting for delivery'}
                      </span>
                    </div>
                  </div>
                  {renderDisclosureActions(d)}
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Escalations */}
        {data.openEscalations.length > 0 && (
          <section className="mb-8">
            <h2 className="text-lg font-bold text-navy mb-4 flex items-center gap-2">
              <ShieldAlert className="w-5 h-5 text-amber-600" />
              Escalations ({data.openEscalations.length})
            </h2>
            <div className="space-y-3">
              {data.openEscalations.map((esc) => (
                <div key={esc.id} className="bg-white rounded-xl shadow-sm p-4 border-l-4 border-amber-400">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <p className="font-medium text-navy text-sm">{esc.affected_action ?? 'Action needed'}</p>
                      <p className="text-gray-500 text-xs mt-1">
                        Trigger: {esc.trigger_type.replace(/_/g, ' ')}
                      </p>
                      {esc.destination && (
                        <p className="text-gray-500 text-xs">Destination: {esc.destination}</p>
                      )}
                      <p className="text-gray-400 text-xs mt-1">
                        {new Date(esc.created_at).toLocaleDateString()}
                      </p>
                    </div>
                    {esc.status === 'open' && (
                      <button
                        onClick={() => handleAcknowledgeEscalation(esc.id)}
                        disabled={acting === esc.id}
                        className="flex items-center gap-1.5 bg-navy hover:bg-navy-light text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors disabled:opacity-50 flex-shrink-0"
                      >
                        {acting === esc.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <ArrowRight className="w-4 h-4" />}
                        Acknowledge
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Incidents */}
        {data.openIncidents.length > 0 && (
          <section className="mb-8">
            <h2 className="text-lg font-bold text-navy mb-4 flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-red-600" />
              Incidents ({data.openIncidents.length})
            </h2>
            <div className="space-y-3">
              {data.openIncidents.map((inc) => (
                <div key={inc.id} className="bg-white rounded-xl shadow-sm p-4 border-l-4 border-red-400">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <p className="font-medium text-navy text-sm">
                        {inc.incident_type.replace(/_/g, ' ')}
                      </p>
                      <p className="text-gray-500 text-xs mt-1">
                        Severity: <span className={`font-medium ${
                          inc.severity === 'critical' ? 'text-red-600' :
                          inc.severity === 'high' ? 'text-orange-600' :
                          inc.severity === 'moderate' ? 'text-amber-600' : 'text-gray-500'
                        }`}>{inc.severity}</span>
                      </p>
                      {inc.information_involved && (
                        <p className="text-gray-500 text-xs mt-1">{inc.information_involved}</p>
                      )}
                      <p className="text-gray-400 text-xs mt-1">
                        {new Date(inc.discovered_at).toLocaleDateString()}
                      </p>
                    </div>
                    <button
                      onClick={() => handleResolveIncident(inc.id)}
                      disabled={acting === inc.id}
                      className="flex items-center gap-1.5 bg-green-600 hover:bg-green-700 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors disabled:opacity-50 flex-shrink-0"
                    >
                      {acting === inc.id ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                      Resolve
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Disputed Authorities */}
        {data.disputedAuthorities.length > 0 && (
          <section className="mb-8">
            <h2 className="text-lg font-bold text-navy mb-4 flex items-center gap-2">
              <FileWarning className="w-5 h-5 text-orange-600" />
              Disputed Authorities ({data.disputedAuthorities.length})
            </h2>
            <div className="space-y-3">
              {data.disputedAuthorities.map((auth) => (
                <div key={auth.id} className="bg-white rounded-xl shadow-sm p-4 border-l-4 border-orange-400">
                  <p className="font-medium text-navy text-sm">
                    {auth.data_category} / {auth.action_type}
                  </p>
                  <p className="text-gray-500 text-xs mt-1">
                    Verification: {auth.verification_status.replace(/_/g, ' ')}
                  </p>
                  {auth.legal_instrument_asserted && (
                    <p className="text-orange-600 text-xs mt-1 font-medium">
                      Legal instrument asserted
                    </p>
                  )}
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Declined Youth Assents */}
        {data.declinedAssents.length > 0 && (
          <section className="mb-8">
            <h2 className="text-lg font-bold text-navy mb-4 flex items-center gap-2">
              <UserX className="w-5 h-5 text-gray-600" />
              Youth Assent Declined ({data.declinedAssents.length})
            </h2>
            <div className="space-y-3">
              {data.declinedAssents.map((ya) => (
                <div key={ya.id} className="bg-white rounded-xl shadow-sm p-4 border-l-4 border-gray-400">
                  <p className="font-medium text-navy text-sm">
                    {ya.data_category} / {ya.action_type}
                  </p>
                  {ya.recipient_label && (
                    <p className="text-gray-500 text-xs mt-1">Recipient: {ya.recipient_label}</p>
                  )}
                  <p className="text-gray-400 text-xs mt-1">
                    {new Date(ya.created_at).toLocaleDateString()}
                  </p>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Revoked Consents */}
        {data.revokedConsents.length > 0 && (
          <section className="mb-8">
            <h2 className="text-lg font-bold text-navy mb-4 flex items-center gap-2">
              <Ban className="w-5 h-5 text-gray-500" />
              Revoked Consents ({data.revokedConsents.length})
            </h2>
            <div className="space-y-3">
              {data.revokedConsents.map((c) => (
                <div key={c.id} className="bg-white rounded-xl shadow-sm p-4 border-l-4 border-gray-300">
                  <p className="font-medium text-navy text-sm">{c.recipient_name}</p>
                  <p className="text-gray-500 text-xs mt-1">Purpose: {c.purpose}</p>
                  <p className="text-gray-400 text-xs mt-1">
                    Revoked: {c.revoked_at ? new Date(c.revoked_at).toLocaleDateString() : 'Unknown'}
                  </p>
                </div>
              ))}
            </div>
          </section>
        )}

        {totalCount === 0 && (
          <div className="bg-white rounded-xl shadow-sm p-8 text-center">
            <ShieldAlert className="w-10 h-10 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-400">No items need attention right now.</p>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}

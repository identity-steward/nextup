import { useState, useEffect, useCallback } from 'react';
import { Loader2, CheckCircle, AlertCircle, Clock, Phone, Building2, ShieldAlert, ArrowRight } from 'lucide-react';
import { DashboardLayout } from '../components/DashboardLayout';
import { getOutcomeReviewData } from '../services/outcomeService';
import type { OutcomeReviewData } from '../types/outcome';

export default function AdminOutcomesPage() {
  const [data, setData] = useState<OutcomeReviewData | null>(null);
  const [loading, setLoading] = useState(true);

  const loadData = useCallback(async () => {
    try {
      const d = await getOutcomeReviewData();
      setData(d);
    } catch (err) {
      console.error('Failed to load outcome review data:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { void loadData(); }, [loadData]);

  if (loading) {
    return (
      <DashboardLayout title="Outcome Review">
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-gold" />
        </div>
      </DashboardLayout>
    );
  }

  if (!data) return null;

  const totalCount =
    data.outcomesNeedingFollowUp.length +
    data.noResponseOutcomes.length +
    data.barriersRequiringNavigatorAction.length +
    data.barriersRequiringExternalDecision.length +
    data.nextUpCausedBarriers.length +
    data.openPathwaysWithoutRecentOutcome.length;

  return (
    <DashboardLayout title="Outcome Review">
      <div className="max-w-5xl mx-auto">
        <p className="text-gray-500 mb-6 text-sm">
          {totalCount} item{totalCount !== 1 ? 's' : ''} need attention.
        </p>

        {/* Outcomes needing follow-up */}
        {data.outcomesNeedingFollowUp.length > 0 && (
          <section className="mb-8">
            <h2 className="text-lg font-bold text-navy mb-4 flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-amber-600" />
              Outcomes needing follow-up ({data.outcomesNeedingFollowUp.length})
            </h2>
            <div className="space-y-2">
              {data.outcomesNeedingFollowUp.map((o) => (
                <div key={o.id} className="bg-white rounded-xl shadow-sm p-4 border-l-4 border-amber-400">
                  <p className="font-medium text-navy text-sm">{o.referral?.recipient_name ?? 'Unknown recipient'}</p>
                  <p className="text-gray-500 text-xs mt-1">
                    Connected: {o.connected_status.replace(/_/g, ' ')} &middot;
                    Service: {o.service_received_status.replace(/_/g, ' ')} &middot;
                    Helpful: {o.helpfulness_status.replace(/_/g, ' ')}
                  </p>
                  {o.next_action && <p className="text-gold text-xs mt-1">Next: {o.next_action}</p>}
                </div>
              ))}
            </div>
          </section>
        )}

        {/* No response / still waiting */}
        {data.noResponseOutcomes.length > 0 && (
          <section className="mb-8">
            <h2 className="text-lg font-bold text-navy mb-4 flex items-center gap-2">
              <Clock className="w-5 h-5 text-blue-600" />
              No response / still waiting ({data.noResponseOutcomes.length})
            </h2>
            <div className="space-y-2">
              {data.noResponseOutcomes.map((o) => (
                <div key={o.id} className="bg-white rounded-xl shadow-sm p-4 border-l-4 border-blue-400">
                  <p className="font-medium text-navy text-sm">{o.referral?.recipient_name ?? 'Unknown recipient'}</p>
                  <p className="text-gray-500 text-xs mt-1">
                    Connected: {o.connected_status.replace(/_/g, ' ')}
                  </p>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Barriers requiring navigator action */}
        {data.barriersRequiringNavigatorAction.length > 0 && (
          <section className="mb-8">
            <h2 className="text-lg font-bold text-navy mb-4 flex items-center gap-2">
              <Phone className="w-5 h-5 text-amber-600" />
              Barriers requiring navigator action ({data.barriersRequiringNavigatorAction.length})
            </h2>
            <div className="space-y-2">
              {data.barriersRequiringNavigatorAction.map((b) => (
                <div key={b.id} className="bg-white rounded-xl shadow-sm p-4 border-l-4 border-amber-400">
                  <p className="font-medium text-navy text-sm">{b.barrier_type.replace(/_/g, ' ')}</p>
                  <p className="text-gray-500 text-xs mt-1">
                    Stage: {b.access_stage.replace(/_/g, ' ')} &middot;
                    Remediability: {b.remediability.replace(/_/g, ' ')}
                  </p>
                  {b.referral && <p className="text-gray-400 text-xs mt-0.5">Referral: {b.referral.recipient_name}</p>}
                  {b.next_action && <p className="text-gold text-xs mt-1">Next: {b.next_action}</p>}
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Barriers requiring external decision */}
        {data.barriersRequiringExternalDecision.length > 0 && (
          <section className="mb-8">
            <h2 className="text-lg font-bold text-navy mb-4 flex items-center gap-2">
              <Building2 className="w-5 h-5 text-purple-600" />
              Barriers requiring external decision ({data.barriersRequiringExternalDecision.length})
            </h2>
            <div className="space-y-2">
              {data.barriersRequiringExternalDecision.map((b) => (
                <div key={b.id} className="bg-white rounded-xl shadow-sm p-4 border-l-4 border-purple-400">
                  <p className="font-medium text-navy text-sm">{b.barrier_type.replace(/_/g, ' ')}</p>
                  <p className="text-gray-500 text-xs mt-1">
                    Stage: {b.access_stage.replace(/_/g, ' ')} &middot;
                    Locus: {b.locus.replace(/_/g, ' ')}
                  </p>
                  {b.referral && <p className="text-gray-400 text-xs mt-0.5">Referral: {b.referral.recipient_name}</p>}
                </div>
              ))}
            </div>
          </section>
        )}

        {/* NextUp-caused barriers */}
        {data.nextUpCausedBarriers.length > 0 && (
          <section className="mb-8">
            <h2 className="text-lg font-bold text-navy mb-4 flex items-center gap-2">
              <ShieldAlert className="w-5 h-5 text-red-600" />
              Possible NextUp-caused issue ({data.nextUpCausedBarriers.length})
            </h2>
            <div className="space-y-2">
              {data.nextUpCausedBarriers.map((b) => (
                <div key={b.id} className="bg-red-50 rounded-xl shadow-sm p-4 border-l-4 border-red-400">
                  <p className="font-medium text-navy text-sm">{b.barrier_type.replace(/_/g, ' ')}</p>
                  <p className="text-gray-500 text-xs mt-1">
                    Stage: {b.access_stage.replace(/_/g, ' ')} &middot;
                    Verification: {b.verification_status.replace(/_/g, ' ')}
                  </p>
                  {b.referral && <p className="text-gray-400 text-xs mt-0.5">Referral: {b.referral.recipient_name}</p>}
                  {!b.incident_id && (
                    <p className="text-red-600 text-xs mt-2 flex items-center gap-1">
                      <ArrowRight className="w-3 h-3" />
                      Consider creating an Incident
                    </p>
                  )}
                  {b.incident_id && (
                    <p className="text-green-600 text-xs mt-2 flex items-center gap-1">
                      <CheckCircle className="w-3 h-3" />
                      Linked to Incident
                    </p>
                  )}
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Open pathways without recent outcome */}
        {data.openPathwaysWithoutRecentOutcome.length > 0 && (
          <section className="mb-8">
            <h2 className="text-lg font-bold text-navy mb-4 flex items-center gap-2">
              <Clock className="w-5 h-5 text-gray-500" />
              Open pathways without recent outcome ({data.openPathwaysWithoutRecentOutcome.length})
            </h2>
            <div className="space-y-2">
              {data.openPathwaysWithoutRecentOutcome.map((p) => (
                <div key={p.pathway_id} className="bg-white rounded-xl shadow-sm p-4 border-l-4 border-gray-300">
                  <p className="font-medium text-navy text-sm">{p.need_title}</p>
                  <p className="text-gray-500 text-xs mt-1">
                    Last referral: {p.last_referral_status.replace(/_/g, ' ')} &middot;
                    {p.days_since_referral} days ago
                  </p>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Empty state */}
        {totalCount === 0 && (
          <div className="bg-white rounded-2xl shadow-sm p-8 text-center">
            <div className="w-12 h-12 bg-green-50 rounded-xl flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-6 h-6 text-green-600" />
            </div>
            <p className="text-navy font-medium">All caught up</p>
            <p className="text-sm text-gray-500 mt-1">No outcomes need attention right now.</p>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}

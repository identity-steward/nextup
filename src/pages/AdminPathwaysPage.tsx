import { useState, useEffect, useCallback } from 'react';
import { Loader2, AlertCircle, Compass, FileText, Building2, DollarSign, Send, Clock, Phone } from 'lucide-react';
import { DashboardLayout } from '../components/DashboardLayout';
import { getPathwayReviewData } from '../services/pathwayService';
import type { PathwayReviewData } from '../types/pathway';

export default function AdminPathwaysPage() {
  const [data, setData] = useState<PathwayReviewData | null>(null);
  const [loading, setLoading] = useState(true);

  const loadData = useCallback(async () => {
    try {
      const d = await getPathwayReviewData();
      setData(d);
    } catch (err) {
      console.error('Failed to load pathway review data:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { void loadData(); }, [loadData]);

  if (loading) {
    return (
      <DashboardLayout title="Pathway Review">
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-gold" />
        </div>
      </DashboardLayout>
    );
  }

  if (!data) return null;

  const totalCount =
    data.needsWithoutPathways.length +
    data.draftPathways.length +
    data.staleProviders.length +
    data.staleServices.length +
    data.fundingGatesNeedingVerification.length +
    data.referralsWaitingForAction.length +
    data.referralsNoResponse.length +
    data.contactAttemptsNeedingFollowUp.length;

  return (
    <DashboardLayout title="Pathway Review">
      <div className="max-w-5xl mx-auto">
        <p className="text-gray-500 mb-6 text-sm">
          {totalCount} item{totalCount !== 1 ? 's' : ''} need attention.
        </p>

        {/* Needs without pathways */}
        {data.needsWithoutPathways.length > 0 && (
          <section className="mb-8">
            <h2 className="text-lg font-bold text-navy mb-4 flex items-center gap-2">
              <Compass className="w-5 h-5 text-blue-600" />
              Needs without pathways ({data.needsWithoutPathways.length})
            </h2>
            <div className="space-y-2">
              {data.needsWithoutPathways.map((need) => (
                <div key={need.id} className="bg-white rounded-xl shadow-sm p-4 border-l-4 border-blue-400">
                  <p className="font-medium text-navy text-sm">{need.title}</p>
                  <p className="text-gray-400 text-xs mt-1">Needs a pathway to be created</p>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Draft pathways */}
        {data.draftPathways.length > 0 && (
          <section className="mb-8">
            <h2 className="text-lg font-bold text-navy mb-4 flex items-center gap-2">
              <FileText className="w-5 h-5 text-amber-600" />
              Draft pathways ({data.draftPathways.length})
            </h2>
            <div className="space-y-2">
              {data.draftPathways.map((pw) => (
                <div key={pw.id} className="bg-white rounded-xl shadow-sm p-4 border-l-4 border-amber-400">
                  <p className="font-medium text-navy text-sm">{pw.need?.title ?? 'Unknown need'}</p>
                  <p className="text-gray-500 text-xs mt-1">
                    Status: {pw.status}
                    {pw.service ? ` &middot; ${pw.service.name}` : ' &middot; No service identified'}
                    {pw.provider ? ` &middot; ${pw.provider.organization_name}` : ' &middot; No provider identified'}
                  </p>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Stale provider/service info */}
        {(data.staleProviders.length > 0 || data.staleServices.length > 0) && (
          <section className="mb-8">
            <h2 className="text-lg font-bold text-navy mb-4 flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-orange-600" />
              Stale catalog info ({data.staleProviders.length + data.staleServices.length})
            </h2>
            <div className="space-y-2">
              {data.staleServices.map((s) => (
                <div key={s.id} className="bg-white rounded-xl shadow-sm p-4 border-l-4 border-orange-400">
                  <div className="flex items-center gap-2">
                    <FileText className="w-4 h-4 text-gray-400" />
                    <p className="font-medium text-navy text-sm">{s.name}</p>
                  </div>
                  <p className="text-orange-600 text-xs mt-1">Needs re-check</p>
                </div>
              ))}
              {data.staleProviders.map((p) => (
                <div key={p.id} className="bg-white rounded-xl shadow-sm p-4 border-l-4 border-orange-400">
                  <div className="flex items-center gap-2">
                    <Building2 className="w-4 h-4 text-gray-400" />
                    <p className="font-medium text-navy text-sm">{p.organization_name}</p>
                  </div>
                  <p className="text-orange-600 text-xs mt-1">Needs re-check</p>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Funding gates needing verification */}
        {data.fundingGatesNeedingVerification.length > 0 && (
          <section className="mb-8">
            <h2 className="text-lg font-bold text-navy mb-4 flex items-center gap-2">
              <DollarSign className="w-5 h-5 text-amber-600" />
              Funding gates needing verification ({data.fundingGatesNeedingVerification.length})
            </h2>
            <div className="space-y-2">
              {data.fundingGatesNeedingVerification.map((gate) => (
                <div key={gate.id} className="bg-white rounded-xl shadow-sm p-4 border-l-4 border-amber-400">
                  <p className="font-medium text-navy text-sm">{gate.gate_type}</p>
                  <p className="text-gray-500 text-xs mt-1">
                    Status: {gate.status}
                    {gate.funding_option ? ` &middot; ${gate.funding_option.payer_or_funder_name ?? gate.funding_option.mechanism_type}` : ''}
                  </p>
                  <p className="text-amber-600 text-xs mt-1">Blocking gate unresolved</p>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Referrals waiting for action */}
        {data.referralsWaitingForAction.length > 0 && (
          <section className="mb-8">
            <h2 className="text-lg font-bold text-navy mb-4 flex items-center gap-2">
              <Send className="w-5 h-5 text-blue-600" />
              Referrals waiting for action ({data.referralsWaitingForAction.length})
            </h2>
            <div className="space-y-2">
              {data.referralsWaitingForAction.map((r) => (
                <div key={r.id} className="bg-white rounded-xl shadow-sm p-4 border-l-4 border-blue-400">
                  <p className="font-medium text-navy text-sm">{r.recipient_name}</p>
                  <p className="text-gray-500 text-xs mt-1">
                    Status: {r.status} &middot; Source: {r.status_source}
                  </p>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Referrals with no response */}
        {data.referralsNoResponse.length > 0 && (
          <section className="mb-8">
            <h2 className="text-lg font-bold text-navy mb-4 flex items-center gap-2">
              <Clock className="w-5 h-5 text-amber-600" />
              Referrals with no response ({data.referralsNoResponse.length})
            </h2>
            <div className="space-y-2">
              {data.referralsNoResponse.map((r) => (
                <div key={r.id} className="bg-white rounded-xl shadow-sm p-4 border-l-4 border-amber-400">
                  <p className="font-medium text-navy text-sm">{r.recipient_name}</p>
                  <p className="text-gray-500 text-xs mt-1">
                    Status: {r.status}
                    {r.sent_at && ` &middot; Sent: ${new Date(r.sent_at).toLocaleDateString()}`}
                  </p>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Contact attempts needing follow-up */}
        {data.contactAttemptsNeedingFollowUp.length > 0 && (
          <section className="mb-8">
            <h2 className="text-lg font-bold text-navy mb-4 flex items-center gap-2">
              <Phone className="w-5 h-5 text-red-600" />
              Contact attempts needing follow-up ({data.contactAttemptsNeedingFollowUp.length})
            </h2>
            <div className="space-y-2">
              {data.contactAttemptsNeedingFollowUp.map((ca) => (
                <div key={ca.id} className="bg-white rounded-xl shadow-sm p-4 border-l-4 border-red-400">
                  <p className="font-medium text-navy text-sm">{ca.intended_recipient}</p>
                  <p className="text-gray-500 text-xs mt-1">
                    {ca.method} &middot; {ca.result}
                  </p>
                  {ca.follow_up_at && (
                    <p className="text-red-600 text-xs mt-1">
                      Follow-up due: {new Date(ca.follow_up_at).toLocaleDateString()}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Empty state */}
        {totalCount === 0 && (
          <div className="bg-white rounded-2xl shadow-sm p-8 text-center">
            <div className="w-12 h-12 bg-green-50 rounded-xl flex items-center justify-center mx-auto mb-4">
              <Compass className="w-6 h-6 text-green-600" />
            </div>
            <p className="text-navy font-medium">All caught up</p>
            <p className="text-sm text-gray-500 mt-1">No pathways need attention right now.</p>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}

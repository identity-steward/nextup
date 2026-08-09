import { Building2, FileText, ShieldCheck, DollarSign, AlertCircle, Clock, ArrowLeft, Share2 } from 'lucide-react';
import type { PathwayWithRelations } from '../../types/pathway';
import { isStale, hasUnresolvedBlockingGates } from '../../services/pathwayService';
import FundingStatus from './FundingStatus';
import ReferralStatusCard from './ReferralStatusCard';
import ContactAttemptLog from './ContactAttemptLog';

interface PathwayDetailProps {
  pathway: PathwayWithRelations;
  onBack?: () => void;
  onShare?: (pathwayId: string) => void;
  contactAttempts?: Record<string, { attempts: import('../../types/pathway').ContactAttempt[] }>;
}

export default function PathwayDetail({ pathway, onBack, onShare, contactAttempts }: PathwayDetailProps) {
  const needTitle = pathway.need?.title ?? 'Your need';
  const needDescription = pathway.need?.description;
  const providerStale = pathway.provider ? isStale(pathway.provider.source_checked_at) : false;
  const serviceStale = pathway.service ? isStale(pathway.service.source_checked_at) : false;
  const unresolvedGates = pathway.funding_gates ? hasUnresolvedBlockingGates(pathway.funding_gates) : false;
  const latestReferral = pathway.referrals?.[0];

  return (
    <div className="space-y-5">
      {onBack && (
        <button
          onClick={onBack}
          className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-navy transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to pathways
        </button>
      )}

      {/* WHAT YOU TOLD US */}
      <section className="bg-white rounded-2xl shadow-sm p-5">
        <h3 className="text-xs text-gray-400 uppercase tracking-wide font-medium mb-2">What you told us</h3>
        <p className="text-navy font-medium">{needTitle}</p>
        {needDescription && <p className="text-sm text-gray-500 mt-1">{needDescription}</p>}
      </section>

      {/* WHAT MAY HELP */}
      {pathway.service && (
        <section className="bg-white rounded-2xl shadow-sm p-5">
          <h3 className="text-xs text-gray-400 uppercase tracking-wide font-medium mb-2 flex items-center gap-1.5">
            <FileText className="w-3.5 h-3.5" />
            What may help
          </h3>
          <p className="text-navy font-medium">{pathway.service.name}</p>
          {pathway.service.description && <p className="text-sm text-gray-500 mt-1">{pathway.service.description}</p>}
          {serviceStale && (
            <p className="text-xs text-amber-600 mt-2 flex items-center gap-1">
              <AlertCircle className="w-3.5 h-3.5" />
              Needs re-check
            </p>
          )}
        </section>
      )}

      {/* WHO PROVIDES IT */}
      {pathway.provider && (
        <section className="bg-white rounded-2xl shadow-sm p-5">
          <h3 className="text-xs text-gray-400 uppercase tracking-wide font-medium mb-2 flex items-center gap-1.5">
            <Building2 className="w-3.5 h-3.5" />
            Who provides it
          </h3>
          <p className="text-navy font-medium">{pathway.provider.organization_name}</p>
          {pathway.provider.location && <p className="text-sm text-gray-500 mt-0.5">{pathway.provider.location}</p>}
          {pathway.provider.contact_phone && <p className="text-sm text-gray-500">{pathway.provider.contact_phone}</p>}
          {providerStale && (
            <p className="text-xs text-amber-600 mt-2 flex items-center gap-1">
              <AlertCircle className="w-3.5 h-3.5" />
              Needs re-check
            </p>
          )}
        </section>
      )}

      {/* WHO CONTROLS THE NEXT STEP */}
      {pathway.eligibility_pathway && (
        <section className="bg-white rounded-2xl shadow-sm p-5">
          <h3 className="text-xs text-gray-400 uppercase tracking-wide font-medium mb-2 flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5" />
            Who controls the next step
          </h3>
          <p className="text-navy font-medium">{pathway.eligibility_pathway.program_name}</p>
          <p className="text-sm text-gray-500 mt-0.5">
            Decision made by {pathway.eligibility_pathway.decision_owner ?? pathway.eligibility_pathway.authority_name}
          </p>
          {pathway.eligibility_pathway.criteria_summary && (
            <p className="text-sm text-gray-500 mt-2">{pathway.eligibility_pathway.criteria_summary}</p>
          )}
        </section>
      )}

      {/* WHAT IT MIGHT COST / WHO MIGHT PAY */}
      {pathway.funding_option && (
        <section className="bg-white rounded-2xl shadow-sm p-5">
          <h3 className="text-xs text-gray-400 uppercase tracking-wide font-medium mb-3 flex items-center gap-1.5">
            <DollarSign className="w-3.5 h-3.5" />
            What it might cost &amp; who might pay
          </h3>
          <FundingStatus
            applicability={pathway.funding_option.applicability_status}
            assertion={pathway.funding_option.assertion_type}
            payment={pathway.funding_option.payment_status}
            sourceAuthority={pathway.funding_option.source_authority}
            hasUnresolvedBlockingGates={unresolvedGates}
          />
          {pathway.funding_gates && pathway.funding_gates.length > 0 && (
            <div className="mt-3 space-y-1.5">
              <p className="text-xs text-gray-400 font-medium">Requirements:</p>
              {pathway.funding_gates.map((gate) => (
                <div key={gate.id} className="flex items-start gap-2 text-xs">
                  <span className={`w-1.5 h-1.5 rounded-full mt-1.5 flex-shrink-0 ${
                    gate.status === 'met' || gate.status === 'not_applicable' ? 'bg-green-500' :
                    gate.status === 'not_met' ? 'bg-red-500' :
                    'bg-amber-500'
                  }`} />
                  <span className="text-gray-600">
                    {gate.gate_type}
                    {gate.blocking && gate.status !== 'met' && gate.status !== 'not_applicable' && (
                      <span className="text-amber-600"> — needs verification</span>
                    )}
                  </span>
                </div>
              ))}
            </div>
          )}
        </section>
      )}

      {/* WHAT STILL NEEDS VERIFICATION */}
      {(serviceStale || providerStale || unresolvedGates || !pathway.service_id || !pathway.provider_id) && (
        <section className="bg-amber-50 rounded-2xl p-5 border border-amber-100">
          <h3 className="text-xs text-amber-700 uppercase tracking-wide font-medium mb-2 flex items-center gap-1.5">
            <AlertCircle className="w-3.5 h-3.5" />
            What still needs verification
          </h3>
          <ul className="text-sm text-amber-800 space-y-1">
            {!pathway.service_id && <li>What may help has not been identified yet</li>}
            {!pathway.provider_id && <li>Who provides it has not been identified yet</li>}
            {serviceStale && <li>Service information needs re-check</li>}
            {providerStale && <li>Provider information needs re-check</li>}
            {unresolvedGates && <li>Funding requirements need verification</li>}
          </ul>
        </section>
      )}

      {/* YOUR NEXT ACTION */}
      <section className="bg-navy/5 rounded-2xl p-5">
        <h3 className="text-xs text-navy uppercase tracking-wide font-medium mb-2 flex items-center gap-1.5">
          <Clock className="w-3.5 h-3.5" />
          Your next action
        </h3>
        {latestReferral ? (
          <div className="space-y-3">
            <ReferralStatusCard
              status={latestReferral.status}
              statusSource={latestReferral.status_source}
              statusReason={latestReferral.status_reason}
              sentAt={latestReferral.sent_at}
              receivedAt={latestReferral.received_at}
              acknowledgedAt={latestReferral.acknowledged_at}
              recipientName={latestReferral.recipient_name}
            />
            {contactAttempts?.[latestReferral.id] && (
              <div>
                <p className="text-xs text-gray-400 font-medium mb-2">Contact history</p>
                <ContactAttemptLog attempts={contactAttempts[latestReferral.id].attempts} />
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-2">
            <p className="text-sm text-navy">
              {pathway.status === 'blocked'
                ? 'Your navigator is reviewing what is blocking this pathway.'
                : 'Your navigator is reviewing what may help.'}
            </p>
            {onShare && (
              <button
                onClick={() => onShare(pathway.id)}
                className="flex items-center gap-1.5 text-sm text-gold hover:underline font-medium"
              >
                <Share2 className="w-4 h-4" />
                Share information to start a connection
              </button>
            )}
          </div>
        )}
      </section>
    </div>
  );
}

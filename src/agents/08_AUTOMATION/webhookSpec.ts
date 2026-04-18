export interface WebhookSpec {
  endpoint: string;
  method: 'POST';
  triggerSource: string;
  payloadShape: Record<string, string>;
  description: string;
  agentFolder: string;
}

export const WEBHOOK_SPECS: WebhookSpec[] = [
  {
    endpoint: '/functions/v1/intake-agent',
    method: 'POST',
    triggerSource: 'athlete_signups | parent_intake | creator_applications | team_inquiries | supporter_signups',
    payloadShape: { source: 'string (table name)', record_id: 'uuid' },
    description: 'Manual trigger for Intake Agent to re-process any intake record by ID.',
    agentFolder: '01_INTAKE',
  },
  {
    endpoint: '/functions/v1/profile-agent',
    method: 'POST',
    triggerSource: 'athletes | creators',
    payloadShape: { source: 'string (table name)', record_id: 'uuid' },
    description: 'Trigger Profile Agent to re-audit a specific athlete or creator profile.',
    agentFolder: '02_PROFILES',
  },
  {
    endpoint: '/functions/v1/content-agent',
    method: 'POST',
    triggerSource: 'media_pass_requests | testimonials',
    payloadShape: { source: 'string (table name)', record_id: 'uuid' },
    description: 'Trigger Content Agent to process or re-moderate a specific record.',
    agentFolder: '03_CONTENT',
  },
  {
    endpoint: '/functions/v1/supporter-agent',
    method: 'POST',
    triggerSource: 'supporter_signups',
    payloadShape: { record_id: 'uuid' },
    description: 'Manually trigger Supporter Agent for a specific signup.',
    agentFolder: '04_SUPPORTERS',
  },
  {
    endpoint: '/functions/v1/outreach-agent',
    method: 'POST',
    triggerSource: 'team_inquiries | athletes',
    payloadShape: { source: 'string (table name)', record_id: 'uuid' },
    description: 'Trigger Outreach Agent for a team inquiry or athlete outreach audit.',
    agentFolder: '05_PARTNERS',
  },
  {
    endpoint: '/functions/v1/run-all-agents',
    method: 'POST',
    triggerSource: 'manual / scheduled cron',
    payloadShape: { scope: 'all | intake | profiles | content | supporters | outreach' },
    description: 'Run all pending agent queues. Used for nightly batch processing or manual admin triggers.',
    agentFolder: '08_AUTOMATION',
  },
];

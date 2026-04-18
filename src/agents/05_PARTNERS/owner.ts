export const OUTREACH_AGENT_OWNER = {
  id: '05_PARTNERS',
  name: 'Outreach Agent',
  description: 'Routes team inquiries, audits active athlete profiles for outreach readiness, and manages partner pipeline.',
  tables: ['team_inquiries', 'athletes'],
  defaultPriority: 'high',
} as const;

export const EVENTS_AGENT_OWNERS = {
  id: '06_EVENTS',
  name: 'Events (Content Agent + Outreach Agent)',
  description: 'Joint ownership for media pass requests — Content Agent handles access credentials, Outreach Agent coordinates coverage logistics.',
  tables: ['media_pass_requests'],
  agents: ['Content Agent', 'Outreach Agent'],
  defaultPriority: 'high',
} as const;

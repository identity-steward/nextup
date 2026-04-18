export const ADMIN_AGENT_OWNER = {
  id: '07_ADMIN',
  name: 'Admin Feed (All Agents)',
  description: 'Aggregates task queues, audit logs, and manual review flags from all agent flows. Powers the admin dashboard.',
  tables: ['tasks', 'audit_logs', 'needs_manual_review'],
  agents: ['Intake Agent', 'Profile Agent', 'Content Agent', 'Supporter Agent', 'Outreach Agent'],
  defaultPriority: 'normal',
} as const;

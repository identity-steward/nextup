export const SUPPORTER_AGENT_OWNER = {
  id: '04_SUPPORTERS',
  name: 'Supporter Agent',
  description: 'Activates supporter signups, classifies tier, creates follow-up tasks, and links supporters to athletes.',
  tables: ['supporter_signups', 'supporters'],
  defaultPriority: 'normal',
} as const;

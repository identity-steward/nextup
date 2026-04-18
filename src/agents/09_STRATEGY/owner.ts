export const STRATEGY_OWNER = {
  id: '09_STRATEGY',
  name: 'Strategy Layer',
  description: 'Founder planning, campaign scorecards, growth roadmap, and platform health metrics. No direct agent ownership — reads from all tables for reporting.',
  tables: [],
  agents: ['all — read-only reporting'],
  defaultPriority: 'low',
} as const;

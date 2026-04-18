export const PROFILE_AGENT_OWNER = {
  id: '02_PROFILES',
  name: 'Profile Agent',
  description: 'Audits athlete and creator profiles for completeness and quality.',
  tables: ['athletes', 'creators'],
  defaultPriority: 'normal',
} as const;

export const INTAKE_AGENT_OWNER = {
  id: '01_INTAKE',
  name: 'Intake Agent',
  description: 'Validates, classifies, and routes all inbound form submissions.',
  tables: [
    'athlete_signups',
    'parent_intake',
    'creator_applications',
    'team_inquiries',
    'supporter_signups',
  ],
  defaultPriority: 'normal',
} as const;

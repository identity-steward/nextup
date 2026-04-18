export interface TriggerSpec {
  folder: string;
  agent: string;
  table: string;
  event: 'INSERT' | 'UPDATE' | 'DELETE' | 'INSERT+UPDATE';
  action: string;
  producesTask: boolean;
  producesAuditLog: boolean;
  mayFlagForReview: boolean;
}

export const TRIGGER_REGISTRY: TriggerSpec[] = [
  {
    folder: '01_INTAKE',
    agent: 'Intake Agent',
    table: 'athlete_signups',
    event: 'INSERT',
    action: 'processAthleteSignup → validate, set status, create task',
    producesTask: true,
    producesAuditLog: true,
    mayFlagForReview: true,
  },
  {
    folder: '01_INTAKE',
    agent: 'Intake Agent',
    table: 'parent_intake',
    event: 'INSERT',
    action: 'processParentIntake → validate consent/bio, set status, create task',
    producesTask: true,
    producesAuditLog: true,
    mayFlagForReview: true,
  },
  {
    folder: '01_INTAKE',
    agent: 'Intake Agent',
    table: 'creator_applications',
    event: 'INSERT',
    action: 'processCreatorApplication → validate portfolio/experience, set status, create task',
    producesTask: true,
    producesAuditLog: true,
    mayFlagForReview: true,
  },
  {
    folder: '01_INTAKE',
    agent: 'Intake Agent + Outreach Agent',
    table: 'team_inquiries',
    event: 'INSERT',
    action: 'processTeamInquiry → classify by athlete count, create outreach task',
    producesTask: true,
    producesAuditLog: true,
    mayFlagForReview: true,
  },
  {
    folder: '01_INTAKE',
    agent: 'Intake Agent + Supporter Agent',
    table: 'supporter_signups',
    event: 'INSERT',
    action: 'processSupporterSignup → classify tier, activate, create follow-up task',
    producesTask: true,
    producesAuditLog: true,
    mayFlagForReview: true,
  },
  {
    folder: '02_PROFILES',
    agent: 'Profile Agent',
    table: 'athletes',
    event: 'INSERT+UPDATE',
    action: 'auditAthlete → check completeness, create improvement task if gaps found',
    producesTask: true,
    producesAuditLog: true,
    mayFlagForReview: true,
  },
  {
    folder: '02_PROFILES',
    agent: 'Profile Agent',
    table: 'creators',
    event: 'INSERT+UPDATE',
    action: 'auditCreator → check completeness, create improvement task if gaps found',
    producesTask: true,
    producesAuditLog: true,
    mayFlagForReview: true,
  },
  {
    folder: '03_CONTENT',
    agent: 'Content Agent',
    table: 'media_pass_requests',
    event: 'INSERT',
    action: 'processMediaPassRequest → validate credentials, create review task + outreach follow-up',
    producesTask: true,
    producesAuditLog: true,
    mayFlagForReview: true,
  },
  {
    folder: '03_CONTENT',
    agent: 'Content Agent',
    table: 'testimonials',
    event: 'INSERT',
    action: 'moderateTestimonial → spam/length check, auto-approve or flag for manual review',
    producesTask: true,
    producesAuditLog: true,
    mayFlagForReview: true,
  },
  {
    folder: '04_SUPPORTERS',
    agent: 'Supporter Agent',
    table: 'supporter_signups',
    event: 'INSERT',
    action: 'processSupporterSignup → tier classification, athlete match task if preferred_athlete set',
    producesTask: true,
    producesAuditLog: true,
    mayFlagForReview: false,
  },
  {
    folder: '05_PARTNERS',
    agent: 'Outreach Agent',
    table: 'team_inquiries',
    event: 'INSERT',
    action: 'processTeamInquiry → priority outreach task by team size',
    producesTask: true,
    producesAuditLog: true,
    mayFlagForReview: true,
  },
  {
    folder: '05_PARTNERS',
    agent: 'Outreach Agent',
    table: 'athletes',
    event: 'INSERT+UPDATE',
    action: 'auditAthleteForOutreach → check photo, video, payment link, bio, social handles',
    producesTask: true,
    producesAuditLog: true,
    mayFlagForReview: true,
  },
  {
    folder: '06_EVENTS',
    agent: 'Content Agent + Outreach Agent',
    table: 'media_pass_requests',
    event: 'INSERT',
    action: 'Joint: content validates pass, outreach coordinates coverage logistics',
    producesTask: true,
    producesAuditLog: true,
    mayFlagForReview: true,
  },
];

export function getTriggersByFolder(folder: string): TriggerSpec[] {
  return TRIGGER_REGISTRY.filter((t) => t.folder === folder);
}

export function getTriggersByTable(table: string): TriggerSpec[] {
  return TRIGGER_REGISTRY.filter((t) => t.table === table);
}

import { IntakeAgentService } from './intakeAgentService';
import { SupporterAgentService } from './supporterAgentService';
import { OutreachAgentService } from './outreachAgentService';
import { ProfileAgentService } from './profileAgentService';
import { ContentAgentService } from './contentAgentService';
import type { AgentResult } from '../types/agent';

export interface AgentRunSummary {
  intake: {
    athleteSignups: AgentResult[];
    parentIntakes: AgentResult[];
    creatorApplications: AgentResult[];
  };
  supporters: AgentResult[];
  outreach: {
    teamInquiries: AgentResult[];
    athleteAudits: AgentResult[];
  };
  profiles: {
    athletes: AgentResult[];
    creators: AgentResult[];
  };
  content: {
    mediaRequests: AgentResult[];
    testimonials: AgentResult[];
  };
  completedAt: string;
}

export class AgentRunner {
  static async runAll(): Promise<AgentRunSummary> {
    const [intake, supporters, outreachInquiries, outreachAthletes, profileAthletes, profileCreators, mediaRequests, testimonials] =
      await Promise.all([
        IntakeAgentService.processPendingRecords(),
        SupporterAgentService.processPendingSupporters(),
        OutreachAgentService.processPendingInquiries(),
        OutreachAgentService.auditAllActiveAthletes(),
        ProfileAgentService.auditAllAthletes(),
        ProfileAgentService.auditAllCreators(),
        ContentAgentService.processPendingMediaRequests(),
        ContentAgentService.moderatePendingTestimonials(),
      ]);

    return {
      intake,
      supporters,
      outreach: {
        teamInquiries: outreachInquiries,
        athleteAudits: outreachAthletes,
      },
      profiles: {
        athletes: profileAthletes,
        creators: profileCreators,
      },
      content: {
        mediaRequests,
        testimonials,
      },
      completedAt: new Date().toISOString(),
    };
  }

  static async runIntakeOnly(): Promise<ReturnType<typeof IntakeAgentService.processPendingRecords>> {
    return IntakeAgentService.processPendingRecords();
  }

  static async runSupporterOnly(): Promise<AgentResult[]> {
    return SupporterAgentService.processPendingSupporters();
  }

  static async runOutreachOnly(): Promise<{ teamInquiries: AgentResult[]; athleteAudits: AgentResult[] }> {
    const [teamInquiries, athleteAudits] = await Promise.all([
      OutreachAgentService.processPendingInquiries(),
      OutreachAgentService.auditAllActiveAthletes(),
    ]);
    return { teamInquiries, athleteAudits };
  }

  static async runProfilesOnly(): Promise<{ athletes: AgentResult[]; creators: AgentResult[] }> {
    const [athletes, creators] = await Promise.all([
      ProfileAgentService.auditAllAthletes(),
      ProfileAgentService.auditAllCreators(),
    ]);
    return { athletes, creators };
  }

  static async runContentOnly(): Promise<{ mediaRequests: AgentResult[]; testimonials: AgentResult[] }> {
    const [mediaRequests, testimonials] = await Promise.all([
      ContentAgentService.processPendingMediaRequests(),
      ContentAgentService.moderatePendingTestimonials(),
    ]);
    return { mediaRequests, testimonials };
  }
}

import { Home, Users } from 'lucide-react';
import type { HouseholdWithMembers, HouseholdMembership } from '../../types/narration';

interface HouseholdSummaryProps {
  household: HouseholdWithMembers | null;
}

export default function HouseholdSummary({ household }: HouseholdSummaryProps) {
  if (!household) {
    return (
      <div className="bg-white rounded-2xl shadow-sm p-6">
        <div className="flex items-center gap-2 mb-2">
          <Home className="w-5 h-5 text-gold" />
          <h3 className="font-bold text-navy">Household</h3>
        </div>
        <p className="text-gray-400 text-sm">No household set up yet.</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow-sm p-6">
      <div className="flex items-center gap-2 mb-4">
        <Home className="w-5 h-5 text-gold" />
        <h3 className="font-bold text-navy">Household</h3>
      </div>
      <div className="space-y-3">
        {household.members.map((member: HouseholdMembership) => (
          <div key={member.id} className="flex items-center gap-3">
            <div className="w-10 h-10 bg-navy/10 rounded-full flex items-center justify-center flex-shrink-0">
              <Users className="w-5 h-5 text-navy" />
            </div>
            <div>
              <p className="font-medium text-navy text-sm">
                {member.person?.first_name ?? 'Unknown'}
                {member.person?.last_name ? ` ${member.person.last_name}` : ''}
              </p>
              <p className="text-xs text-gray-400 capitalize">
                {member.relationship_role}
              </p>
            </div>
          </div>
        ))}
      </div>
      <p className="text-xs text-gray-400 mt-4 leading-relaxed">
        Household membership helps organize your story. It does not establish
        custody, guardianship, or legal authority.
      </p>
    </div>
  );
}

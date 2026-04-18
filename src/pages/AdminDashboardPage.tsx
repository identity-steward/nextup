import React, { useEffect, useState } from 'react';
import { DashboardLayout } from '../components/DashboardLayout';
import { StatCard } from '../components/StatCard';
import { DataTable, TableColumn } from '../components/DataTable';
import { DashboardCard } from '../components/DashboardCard';
import { Users, Video, School, CreditCard, Heart, TrendingUp } from 'lucide-react';
import { supabase } from '../lib/supabase';

interface Counts {
  athleteSignups: number;
  parentIntakes: number;
  creatorApps: number;
  teamInquiries: number;
  mediaPasses: number;
  supporterSignups: number;
}

export function AdminDashboardPage() {
  const [counts, setCounts] = useState<Counts>({
    athleteSignups: 0,
    parentIntakes: 0,
    creatorApps: 0,
    teamInquiries: 0,
    mediaPasses: 0,
    supporterSignups: 0,
  });
  const [recentAthletes, setRecentAthletes] = useState<Record<string, unknown>[]>([]);
  const [recentIntakes, setRecentIntakes] = useState<Record<string, unknown>[]>([]);
  const [recentCreators, setRecentCreators] = useState<Record<string, unknown>[]>([]);
  const [recentTeamInquiries, setRecentTeamInquiries] = useState<Record<string, unknown>[]>([]);
  const [recentMediaPasses, setRecentMediaPasses] = useState<Record<string, unknown>[]>([]);
  const [recentSupporters, setRecentSupporters] = useState<Record<string, unknown>[]>([]);

  useEffect(() => {
    async function load() {
      const [
        { count: aCount }, { count: piCount }, { count: caCount },
        { count: tiCount }, { count: mpCount }, { count: ssCount },
        { data: athletes }, { data: intakes }, { data: creators },
        { data: inquiries }, { data: passes }, { data: supporters },
      ] = await Promise.all([
        supabase.from('athlete_signups').select('*', { count: 'exact', head: true }),
        supabase.from('parent_intake').select('*', { count: 'exact', head: true }),
        supabase.from('creator_applications').select('*', { count: 'exact', head: true }),
        supabase.from('team_inquiries').select('*', { count: 'exact', head: true }),
        supabase.from('media_pass_requests').select('*', { count: 'exact', head: true }),
        supabase.from('supporter_signups').select('*', { count: 'exact', head: true }),
        supabase.from('athlete_signups').select('athlete_first_name,athlete_last_name,athlete_sport,athlete_school,status,created_at').order('created_at', { ascending: false }).limit(5),
        supabase.from('parent_intake').select('parent_first_name,parent_last_name,athlete_first_name,athlete_last_name,parent_email,status,created_at').order('created_at', { ascending: false }).limit(5),
        supabase.from('creator_applications').select('first_name,last_name,email,status,created_at').order('created_at', { ascending: false }).limit(5),
        supabase.from('team_inquiries').select('team_name,contact_first_name,contact_last_name,sport,status,created_at').order('created_at', { ascending: false }).limit(5),
        supabase.from('media_pass_requests').select('first_name,last_name,organization,event_details,status,created_at').order('created_at', { ascending: false }).limit(5),
        supabase.from('supporter_signups').select('first_name,last_name,email,support_type,status,created_at').order('created_at', { ascending: false }).limit(5),
      ]);

      setCounts({
        athleteSignups: aCount ?? 0,
        parentIntakes: piCount ?? 0,
        creatorApps: caCount ?? 0,
        teamInquiries: tiCount ?? 0,
        mediaPasses: mpCount ?? 0,
        supporterSignups: ssCount ?? 0,
      });
      if (athletes) setRecentAthletes(athletes as Record<string, unknown>[]);
      if (intakes) setRecentIntakes(intakes as Record<string, unknown>[]);
      if (creators) setRecentCreators(creators as Record<string, unknown>[]);
      if (inquiries) setRecentTeamInquiries(inquiries as Record<string, unknown>[]);
      if (passes) setRecentMediaPasses(passes as Record<string, unknown>[]);
      if (supporters) setRecentSupporters(supporters as Record<string, unknown>[]);
    }
    load();
  }, []);

  const statusBadge = (value: string) => (
    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
      value === 'pending' ? 'bg-yellow-100 text-yellow-800' :
      value === 'approved' ? 'bg-green-100 text-green-800' :
      value === 'reviewed' ? 'bg-blue-100 text-blue-800' :
      'bg-gray-100 text-gray-800'
    }`}>
      {value.charAt(0).toUpperCase() + value.slice(1)}
    </span>
  );

  const dateCell = (v: unknown) => new Date(v as string).toLocaleDateString();

  const athleteColumns: TableColumn[] = [
    { key: 'name', label: 'Name', render: (_v, row) => `${(row as Record<string, string>).athlete_first_name} ${(row as Record<string, string>).athlete_last_name}` },
    { key: 'athlete_sport', label: 'Sport' },
    { key: 'athlete_school', label: 'School', render: (v) => v || '—' },
    { key: 'created_at', label: 'Signup Date', render: dateCell },
    { key: 'status', label: 'Status', render: statusBadge },
  ];

  const intakeColumns: TableColumn[] = [
    { key: 'parentName', label: 'Parent', render: (_v, row) => `${(row as Record<string, string>).parent_first_name} ${(row as Record<string, string>).parent_last_name}` },
    { key: 'athleteName', label: 'Athlete', render: (_v, row) => `${(row as Record<string, string>).athlete_first_name} ${(row as Record<string, string>).athlete_last_name}` },
    { key: 'parent_email', label: 'Email' },
    { key: 'created_at', label: 'Submitted', render: dateCell },
    { key: 'status', label: 'Status', render: statusBadge },
  ];

  const creatorColumns: TableColumn[] = [
    { key: 'name', label: 'Name', render: (_v, row) => `${(row as Record<string, string>).first_name} ${(row as Record<string, string>).last_name}` },
    { key: 'email', label: 'Email' },
    { key: 'created_at', label: 'Applied', render: dateCell },
    { key: 'status', label: 'Status', render: statusBadge },
  ];

  const teamColumns: TableColumn[] = [
    { key: 'team_name', label: 'Team/School' },
    { key: 'contact', label: 'Contact', render: (_v, row) => `${(row as Record<string, string>).contact_first_name} ${(row as Record<string, string>).contact_last_name}` },
    { key: 'sport', label: 'Sport' },
    { key: 'created_at', label: 'Inquiry Date', render: dateCell },
    { key: 'status', label: 'Status', render: statusBadge },
  ];

  const mediaColumns: TableColumn[] = [
    { key: 'requester', label: 'Requester', render: (_v, row) => `${(row as Record<string, string>).first_name} ${(row as Record<string, string>).last_name}` },
    { key: 'organization', label: 'Organization' },
    { key: 'event_details', label: 'Event' },
    { key: 'created_at', label: 'Request Date', render: dateCell },
    { key: 'status', label: 'Status', render: statusBadge },
  ];

  const supporterColumns: TableColumn[] = [
    { key: 'name', label: 'Name', render: (_v, row) => `${(row as Record<string, string>).first_name} ${(row as Record<string, string>).last_name}` },
    { key: 'email', label: 'Email' },
    { key: 'support_type', label: 'Tier' },
    { key: 'created_at', label: 'Signup Date', render: dateCell },
    { key: 'status', label: 'Status', render: statusBadge },
  ];

  return (
    <DashboardLayout currentPage="Dashboard">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6 mb-8">
        <StatCard title="Athlete Signups" value={String(counts.athleteSignups)} icon={Users} color="blue" />
        <StatCard title="Parent Intakes" value={String(counts.parentIntakes)} icon={Heart} color="green" />
        <StatCard title="Creator Apps" value={String(counts.creatorApps)} icon={Video} color="blue" />
        <StatCard title="Team Inquiries" value={String(counts.teamInquiries)} icon={School} color="gold" />
        <StatCard title="Media Passes" value={String(counts.mediaPasses)} icon={CreditCard} color="orange" />
        <StatCard title="Supporters" value={String(counts.supporterSignups)} icon={TrendingUp} color="green" />
      </div>

      <div className="space-y-8">
        <DataTable title="Recent Athlete Signups" columns={athleteColumns} data={recentAthletes} onRowAction={(row) => console.log('View athlete:', row)} />
        <DataTable title="Recent Parent Intake Forms" columns={intakeColumns} data={recentIntakes} onRowAction={(row) => console.log('View intake:', row)} />
        <DataTable title="Recent Creator Applications" columns={creatorColumns} data={recentCreators} onRowAction={(row) => console.log('View creator:', row)} />
        <DataTable title="Recent Team Inquiries" columns={teamColumns} data={recentTeamInquiries} onRowAction={(row) => console.log('View team inquiry:', row)} />
        <DataTable title="Recent Media Pass Requests" columns={mediaColumns} data={recentMediaPasses} onRowAction={(row) => console.log('View media pass:', row)} />
        <DataTable title="Recent Supporter Signups" columns={supporterColumns} data={recentSupporters} onRowAction={(row) => console.log('View supporter:', row)} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-8">
        <DashboardCard
          title="Quick Actions"
          subtitle="Common administrative tasks"
          action={{ label: 'View All', onClick: () => {} }}
        >
          <div className="space-y-3">
            <button className="w-full text-left px-4 py-3 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors">
              <p className="font-semibold text-gray-900">Approve Pending Athletes</p>
              <p className="text-sm text-gray-600 mt-1">{counts.athleteSignups} total signups to review</p>
            </button>
            <button className="w-full text-left px-4 py-3 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors">
              <p className="font-semibold text-gray-900">Review Creator Applications</p>
              <p className="text-sm text-gray-600 mt-1">{counts.creatorApps} applications received</p>
            </button>
            <button className="w-full text-left px-4 py-3 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors">
              <p className="font-semibold text-gray-900">Process Media Passes</p>
              <p className="text-sm text-gray-600 mt-1">{counts.mediaPasses} pass requests received</p>
            </button>
          </div>
        </DashboardCard>

        <DashboardCard
          title="Submission Summary"
          subtitle="All-time totals across every form"
          action={{ label: 'Refresh', onClick: () => window.location.reload() }}
        >
          <div className="space-y-3">
            {[
              { label: 'Athlete Signups', count: counts.athleteSignups, color: 'bg-blue-500' },
              { label: 'Parent Intake Forms', count: counts.parentIntakes, color: 'bg-green-500' },
              { label: 'Creator Applications', count: counts.creatorApps, color: 'bg-sky-500' },
              { label: 'Team Inquiries', count: counts.teamInquiries, color: 'bg-amber-500' },
              { label: 'Media Pass Requests', count: counts.mediaPasses, color: 'bg-orange-500' },
              { label: 'Supporter Signups', count: counts.supporterSignups, color: 'bg-emerald-500' },
            ].map(({ label, count, color }) => (
              <div key={label} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full ${color}`} />
                  <span className="text-sm text-gray-700">{label}</span>
                </div>
                <span className="text-sm font-semibold text-gray-900">{count}</span>
              </div>
            ))}
          </div>
        </DashboardCard>
      </div>
    </DashboardLayout>
  );
}

import React, { useEffect, useState } from 'react';
import { DashboardLayout } from '../components/DashboardLayout';
import { StatCard } from '../components/StatCard';
import { DataTable, TableColumn } from '../components/DataTable';
import { Users, CheckCircle, Clock, XCircle } from 'lucide-react';
import { supabase } from '../lib/supabase';

interface AthleteSignup {
  id: string;
  athlete_first_name: string;
  athlete_last_name: string;
  athlete_sport: string;
  athlete_grade: string;
  athlete_school: string | null;
  parent_email: string;
  status: string;
  created_at: string;
}

interface AdminAthletesPageProps {
  onNavigate?: (page: string) => void;
}

export function AdminAthletesPage({ onNavigate }: AdminAthletesPageProps) {
  const [signups, setSignups] = useState<AthleteSignup[]>([]);
  const [filtered, setFiltered] = useState<AthleteSignup[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [sportFilter, setSportFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [gradeFilter, setGradeFilter] = useState('');

  useEffect(() => {
    async function load() {
      const { data, error } = await supabase
        .from('athlete_signups')
        .select('*')
        .order('created_at', { ascending: false });
      if (!error && data) setSignups(data);
      setLoading(false);
    }
    load();
  }, []);

  useEffect(() => {
    let result = signups;
    if (search) {
      const q = search.toLowerCase();
      result = result.filter(r =>
        `${r.athlete_first_name} ${r.athlete_last_name}`.toLowerCase().includes(q)
      );
    }
    if (sportFilter) {
      result = result.filter(r => r.athlete_sport.toLowerCase().includes(sportFilter.toLowerCase()));
    }
    if (statusFilter) {
      result = result.filter(r => r.status === statusFilter);
    }
    if (gradeFilter) {
      result = result.filter(r => r.athlete_grade === gradeFilter);
    }
    setFiltered(result);
  }, [signups, search, sportFilter, statusFilter, gradeFilter]);

  const total = signups.length;
  const approved = signups.filter(s => s.status === 'approved').length;
  const pending = signups.filter(s => s.status === 'pending').length;
  const rejected = signups.filter(s => s.status === 'rejected').length;

  const columns: TableColumn[] = [
    {
      key: 'name',
      label: 'Name',
      render: (_v, row) => `${(row as AthleteSignup).athlete_first_name} ${(row as AthleteSignup).athlete_last_name}`,
    },
    { key: 'athlete_sport', label: 'Sport' },
    { key: 'athlete_grade', label: 'Grade' },
    {
      key: 'athlete_school',
      label: 'School',
      render: (v) => v || '—',
    },
    { key: 'parent_email', label: 'Email' },
    {
      key: 'created_at',
      label: 'Signup Date',
      render: (v) => new Date(v).toLocaleDateString(),
    },
    {
      key: 'status',
      label: 'Status',
      render: (value) => (
        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
          value === 'pending' ? 'bg-yellow-100 text-yellow-800' :
          value === 'approved' ? 'bg-green-100 text-green-800' :
          'bg-red-100 text-red-800'
        }`}>
          {value.charAt(0).toUpperCase() + value.slice(1)}
        </span>
      ),
    },
  ];

  return (
    <DashboardLayout title="Athlete Signups" onNavigate={onNavigate}>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard title="Total Signups" value={String(total)} icon={Users} color="blue" />
        <StatCard title="Approved" value={String(approved)} icon={CheckCircle} color="green" />
        <StatCard title="Pending Review" value={String(pending)} icon={Clock} color="gold" />
        <StatCard title="Rejected" value={String(rejected)} icon={XCircle} color="red" />
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Search</label>
            <input
              type="text"
              placeholder="Search by name..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#c5a572] focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Sport</label>
            <input
              type="text"
              placeholder="Filter by sport..."
              value={sportFilter}
              onChange={(e) => setSportFilter(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#c5a572] focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#c5a572] focus:border-transparent"
            >
              <option value="">All Status</option>
              <option value="pending">Pending</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Grade</label>
            <select
              value={gradeFilter}
              onChange={(e) => setGradeFilter(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#c5a572] focus:border-transparent"
            >
              <option value="">All Grades</option>
              <option value="9th Grade">9th Grade</option>
              <option value="10th Grade">10th Grade</option>
              <option value="11th Grade">11th Grade</option>
              <option value="12th Grade">12th Grade</option>
            </select>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-16">
          <div className="w-8 h-8 border-4 border-[#c5a572] border-t-transparent rounded-full animate-spin" />
        </div>
      ) : (
        <DataTable
          columns={columns}
          data={filtered}
          onRowAction={(row) => console.log('View athlete signup:', row)}
        />
      )}
    </DashboardLayout>
  );
}

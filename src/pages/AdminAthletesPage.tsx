import React, { useEffect, useState } from 'react';
import { DashboardLayout } from '../components/DashboardLayout';
import { StatCard } from '../components/StatCard';
import { DataTable, TableColumn } from '../components/DataTable';
import { Users, CheckCircle, Clock, XCircle, ChevronDown, ChevronUp, Info } from 'lucide-react';
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

export function AdminAthletesPage() {
  const [signups, setSignups] = useState<AthleteSignup[]>([]);
  const [filtered, setFiltered] = useState<AthleteSignup[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [sportFilter, setSportFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [gradeFilter, setGradeFilter] = useState('');
  const [expanded, setExpanded] = useState<string | null>(null);
  const [processing, setProcessing] = useState<string | null>(null);

  const load = async () => {
    const { data, error } = await supabase
      .from('athlete_signups')
      .select('*')
      .order('created_at', { ascending: false });
    if (!error && data) setSignups(data);
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, []);

  const review = async (id: string, action: 'approved' | 'rejected') => {
    setProcessing(id);
    await supabase
      .from('athlete_signups')
      .update({ status: action, updated_at: new Date().toISOString() })
      .eq('id', id);
    setExpanded(null);
    setProcessing(null);
    await load();
  };

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
    { key: 'athlete_grade', label: 'Level' },
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
    {
      key: 'id',
      label: 'Actions',
      render: (_v, row) => {
        const r = row as AthleteSignup;
        const isOpen = expanded === r.id;
        return (
          <button
            onClick={(e) => { e.stopPropagation(); setExpanded(isOpen ? null : r.id); }}
            className="flex items-center gap-1 text-xs font-semibold text-gray-500 hover:text-navy transition-colors px-2 py-1 rounded-lg hover:bg-gray-100"
          >
            Review {isOpen ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </button>
        );
      },
    },
  ];

  return (
    <DashboardLayout title="Parent Intake Queue">
      <div className="flex items-start gap-3 bg-sky-50 border border-sky-200 rounded-xl px-5 py-3.5 mb-6 text-sm text-sky-800">
        <Info className="w-4 h-4 shrink-0 mt-0.5 text-sky-500" />
        <p>
          Approving an intake submission does <span className="font-bold">not</span> make an athlete publicly visible.
          Public athlete visibility is managed in <span className="font-bold">Live Athletes</span>.
        </p>
      </div>
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
        <>
          <DataTable
            columns={columns}
            data={filtered}
            onRowAction={() => {}}
          />
          {expanded && (() => {
            const req = signups.find(s => s.id === expanded);
            if (!req) return null;
            return (
              <div className="mt-4 bg-white rounded-xl border border-gray-200 shadow-sm p-6">
                <h3 className="font-bold text-navy text-base mb-4">
                  Review Intake: {req.athlete_first_name} {req.athlete_last_name}
                </h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-6">
                  {[
                    { label: 'Sport', value: req.athlete_sport },
                    { label: 'Level', value: req.athlete_grade || '—' },
                    { label: 'School', value: req.athlete_school || '—' },
                    { label: 'Parent Email', value: req.parent_email },
                    { label: 'Submitted', value: new Date(req.created_at).toLocaleDateString() },
                    { label: 'Status', value: req.status },
                  ].map(({ label, value }) => (
                    <div key={label} className="bg-gray-50 rounded-xl px-4 py-3">
                      <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-1">{label}</p>
                      <p className="text-sm text-navy font-medium">{value}</p>
                    </div>
                  ))}
                </div>
                {req.status === 'pending' && (
                  <div className="flex gap-3">
                    <button
                      onClick={() => review(req.id, 'approved')}
                      disabled={processing === req.id}
                      className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white font-bold px-5 py-2.5 rounded-xl transition-colors disabled:opacity-50 text-sm"
                    >
                      <CheckCircle className="w-4 h-4" />
                      {processing === req.id ? 'Saving...' : 'Approve'}
                    </button>
                    <button
                      onClick={() => review(req.id, 'rejected')}
                      disabled={processing === req.id}
                      className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white font-bold px-5 py-2.5 rounded-xl transition-colors disabled:opacity-50 text-sm"
                    >
                      <XCircle className="w-4 h-4" />
                      Reject
                    </button>
                    <button
                      onClick={() => setExpanded(null)}
                      className="px-5 py-2.5 border border-gray-200 rounded-xl text-sm font-semibold text-gray-500 hover:text-navy transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                )}
                {req.status !== 'pending' && (
                  <p className="text-sm text-gray-500">
                    This signup has already been <span className="font-semibold">{req.status}</span>.
                  </p>
                )}
              </div>
            );
          })()}
        </>
      )}
    </DashboardLayout>
  );
}

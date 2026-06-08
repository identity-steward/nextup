import { useEffect, useState } from 'react';
import { DashboardLayout } from '../components/DashboardLayout';
import { StatCard } from '../components/StatCard';
import { DataTable, TableColumn } from '../components/DataTable';
import { Heart, CheckCircle, Clock } from 'lucide-react';
import { supabase } from '../lib/supabase';

interface ParentIntake {
  id: string;
  parent_first_name: string;
  parent_last_name: string;
  parent_email: string;
  parent_phone: string;
  athlete_first_name: string;
  athlete_last_name: string;
  athlete_sport: string;
  status: string;
  created_at: string;
}

export function AdminParentIntakePage() {
  const [intakes, setIntakes] = useState<ParentIntake[]>([]);
  const [filtered, setFiltered] = useState<ParentIntake[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  useEffect(() => {
    async function load() {
      const { data, error } = await supabase
        .from('parent_intake')
        .select('*')
        .order('created_at', { ascending: false });
      if (!error && data) setIntakes(data);
      setLoading(false);
    }
    load();
  }, []);

  useEffect(() => {
    let result = intakes;
    if (search) {
      const q = search.toLowerCase();
      result = result.filter(r =>
        `${r.parent_first_name} ${r.parent_last_name} ${r.athlete_first_name} ${r.athlete_last_name}`.toLowerCase().includes(q)
      );
    }
    if (statusFilter === 'reviewed') {
      result = result.filter(r => r.status !== 'pending');
    } else if (statusFilter === 'pending') {
      result = result.filter(r => r.status === 'pending');
    }
    setFiltered(result);
  }, [intakes, search, statusFilter]);

  const total = intakes.length;
  const reviewed = intakes.filter(i => i.status !== 'pending').length;
  const pending = intakes.filter(i => i.status === 'pending').length;

  const columns: TableColumn[] = [
    {
      key: 'parentName',
      label: 'Parent Name',
      render: (_v, row) => `${(row as ParentIntake).parent_first_name} ${(row as ParentIntake).parent_last_name}`,
    },
    {
      key: 'athleteName',
      label: 'Athlete Name',
      render: (_v, row) => `${(row as ParentIntake).athlete_first_name} ${(row as ParentIntake).athlete_last_name}`,
    },
    { key: 'parent_email', label: 'Email' },
    { key: 'parent_phone', label: 'Phone' },
    { key: 'athlete_sport', label: 'Sport' },
    {
      key: 'created_at',
      label: 'Submitted',
      render: (v) => new Date(v).toLocaleDateString(),
    },
    {
      key: 'status',
      label: 'Status',
      render: (value) => (
        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
          value === 'pending' ? 'bg-gray-100 text-gray-800' : 'bg-green-100 text-green-800'
        }`}>
          {value === 'pending' ? 'Pending' : 'Reviewed'}
        </span>
      ),
    },
  ];

  return (
    <DashboardLayout title="Parent Intake">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <StatCard title="Total Submissions" value={String(total)} icon={Heart} color="green" />
        <StatCard title="Reviewed" value={String(reviewed)} icon={CheckCircle} color="blue" />
        <StatCard title="Pending Review" value={String(pending)} icon={Clock} color="gold" />
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Search</label>
            <input
              type="text"
              placeholder="Search by parent or athlete name..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#c5a572] focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Review Status</label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#c5a572] focus:border-transparent"
            >
              <option value="">All</option>
              <option value="reviewed">Reviewed</option>
              <option value="pending">Pending Review</option>
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
          onRowAction={(row) => console.log('View intake:', row)}
        />
      )}
    </DashboardLayout>
  );
}

import { useEffect, useState, useCallback } from 'react';
import { DashboardLayout } from '../components/DashboardLayout';
import {
  AthleteSignupService,
  SIGNUP_STATUSES,
  SIGNUP_STATUS_LABELS,
  type AthleteSignupRecord,
  type AthleteSignupStatus,
} from '../services/athleteSignupService';
import { ShieldAlert, Inbox } from 'lucide-react';
import {
  Search, RefreshCw, Mail, Phone, Clock, CheckCircle2,
  AlertTriangle, FileText, User, Calendar, MessageSquare, Trophy,
} from 'lucide-react';

const STATUS_STYLES: Record<AthleteSignupStatus, string> = {
  pending: 'text-amber-700 bg-amber-50 border-amber-200',
  reviewed: 'text-blue-700 bg-blue-50 border-blue-200',
  approved: 'text-emerald-700 bg-emerald-50 border-emerald-200',
  rejected: 'text-red-700 bg-red-50 border-red-200',
};

export function AdminAthletesPage() {
  const [records, setRecords] = useState<AthleteSignupRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<AthleteSignupStatus | 'all'>('all');
  const [editingNotesId, setEditingNotesId] = useState<string | null>(null);
  const [notesDraft, setNotesDraft] = useState('');
  const [acting, setActing] = useState(false);
  const [actionError, setActionError] = useState('');
  const [queryError, setQueryError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setQueryError(null);
    const { data, error } = await AthleteSignupService.getAll();
    if (error) {
      setRecords([]);
      setQueryError(error);
    } else {
      setRecords(data);
    }
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const filtered = records.filter((r) => {
    if (statusFilter !== 'all' && r.status !== statusFilter) return false;
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return `${r.parent_first_name} ${r.parent_last_name} ${r.parent_email} ${r.athlete_first_name} ${r.athlete_last_name} ${r.athlete_sport}`.toLowerCase().includes(q);
  });

  const counts = {
    pending: records.filter(r => r.status === 'pending').length,
    reviewed: records.filter(r => r.status === 'reviewed').length,
    approved: records.filter(r => r.status === 'approved').length,
    rejected: records.filter(r => r.status === 'rejected').length,
  };

  const handleStatusChange = async (id: string, status: AthleteSignupStatus) => {
    setActing(true);
    setActionError('');
    const ok = await AthleteSignupService.updateStatus(id, status);
    setActing(false);
    if (ok) {
      setRecords(prev => prev.map(r => r.id === id ? { ...r, status } : r));
    } else {
      setActionError('Failed to update status. You may lack permission.');
    }
  };

  const handleSaveNotes = async (id: string) => {
    setActing(true);
    setActionError('');
    const ok = await AthleteSignupService.updateNotes(id, notesDraft);
    setActing(false);
    if (ok) {
      setRecords(prev => prev.map(r => r.id === id ? { ...r, notes: notesDraft } : r));
      setEditingNotesId(null);
    } else {
      setActionError('Failed to save notes.');
    }
  };

  const startEditNotes = (record: AthleteSignupRecord) => {
    setEditingNotesId(record.id);
    setNotesDraft(record.notes ?? '');
  };

  const formatDate = (iso: string) =>
    new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

  return (
    <DashboardLayout title="Athlete Signups">
      <div className="space-y-5">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="bg-white rounded-2xl border border-gray-200 p-5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-amber-50 rounded-xl flex items-center justify-center">
                <Clock className="w-5 h-5 text-amber-500" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{counts.pending}</p>
                <p className="text-xs text-gray-500 font-medium">Pending</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-2xl border border-gray-200 p-5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center">
                <FileText className="w-5 h-5 text-blue-500" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{counts.reviewed}</p>
                <p className="text-xs text-gray-500 font-medium">Reviewed</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-2xl border border-gray-200 p-5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-emerald-50 rounded-xl flex items-center justify-center">
                <CheckCircle2 className="w-5 h-5 text-emerald-500" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{counts.approved}</p>
                <p className="text-xs text-gray-500 font-medium">Approved</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-2xl border border-gray-200 p-5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-red-50 rounded-xl flex items-center justify-center">
                <AlertTriangle className="w-5 h-5 text-red-500" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{counts.rejected}</p>
                <p className="text-xs text-gray-500 font-medium">Rejected</p>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
          <p className="text-sm text-blue-800">
            <strong>Manual review queue.</strong> Contact the parent using the information below, then update the review status.
            No athlete profiles, households, or consent records are created automatically.
            "Approved" is an administrative status only — it does not constitute guardian verification or media consent.
          </p>
        </div>

        {actionError && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-3 text-sm text-red-700">
            {actionError}
          </div>
        )}

        <div className="flex gap-3 items-center flex-wrap">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search by parent, athlete, or email..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none text-sm"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as AthleteSignupStatus | 'all')}
            className="px-4 py-2.5 border border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none text-sm font-medium text-gray-700"
          >
            <option value="all">All statuses</option>
            {SIGNUP_STATUSES.map(s => (
              <option key={s} value={s}>{SIGNUP_STATUS_LABELS[s]}</option>
            ))}
          </select>
          <button
            onClick={load}
            className="p-2.5 rounded-xl border border-gray-200 hover:border-gray-300 text-gray-500 transition-colors"
            title="Refresh"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>

        {loading ? (
          <div className="flex justify-center py-20">
            <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : queryError ? (
          <div className="bg-red-50 border border-red-200 rounded-2xl p-8 text-center">
            <ShieldAlert className="w-8 h-8 text-red-400 mx-auto mb-3" />
            <p className="text-sm font-semibold text-red-800 mb-1">Unable to load athlete signups</p>
            <p className="text-xs text-red-600">
              {queryError.includes('permission') || queryError.includes('policy') || queryError.includes('RLS')
                ? 'Your account may not have administrator access to view these records.'
                : `A database error occurred: ${queryError}`}
            </p>
            <p className="text-xs text-red-500 mt-2">Check the browser console for technical details.</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="bg-white rounded-2xl border border-gray-200 p-10 text-center">
            <Inbox className="w-8 h-8 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-400 text-sm">No athlete signups found.</p>
            <p className="text-gray-300 text-xs mt-1">New submissions will appear here for review.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {filtered.map((record) => (
              <div key={record.id} className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
                <div className="p-5">
                  <div className="flex items-start justify-between gap-4 mb-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap mb-1">
                        <h3 className="font-bold text-gray-900 text-base">
                          {record.athlete_first_name} {record.athlete_last_name}
                        </h3>
                        <span className={`inline-flex items-center gap-1 text-xs font-bold px-2 py-0.5 rounded-full border ${STATUS_STYLES[record.status]}`}>
                          {SIGNUP_STATUS_LABELS[record.status]}
                        </span>
                      </div>
                      <p className="text-xs text-gray-400 flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        Submitted {formatDate(record.created_at)}
                      </p>
                    </div>
                  </div>

                  <div className="grid sm:grid-cols-2 gap-4 mb-4">
                    <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
                      <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">Parent / Guardian</p>
                      <div className="space-y-1.5 text-sm">
                        <p className="text-gray-900 font-medium flex items-center gap-2">
                          <User className="w-3.5 h-3.5 text-gray-400" />
                          {record.parent_first_name} {record.parent_last_name}
                        </p>
                        <p className="text-gray-600 flex items-center gap-2">
                          <Mail className="w-3.5 h-3.5 text-gray-400" />
                          {record.parent_email}
                        </p>
                        <p className="text-gray-600 flex items-center gap-2">
                          <Phone className="w-3.5 h-3.5 text-gray-400" />
                          {record.parent_phone}
                        </p>
                      </div>
                    </div>
                    <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
                      <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">Young Person</p>
                      <div className="space-y-1.5 text-sm">
                        <p className="text-gray-900 font-medium flex items-center gap-2">
                          <Trophy className="w-3.5 h-3.5 text-gray-400" />
                          {record.athlete_sport}
                        </p>
                        <p className="text-gray-600">{record.athlete_grade}</p>
                        {record.athlete_school && <p className="text-gray-600">{record.athlete_school}</p>}
                        {record.athlete_team && <p className="text-gray-600">{record.athlete_team}</p>}
                      </div>
                    </div>
                  </div>

                  {editingNotesId === record.id ? (
                    <div className="mb-4">
                      <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1.5">
                        Admin Notes
                      </label>
                      <textarea
                        rows={3}
                        value={notesDraft}
                        onChange={(e) => setNotesDraft(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:border-blue-500 focus:outline-none text-sm"
                        placeholder="Record what was done, who contacted the parent, what was verified..."
                      />
                      <div className="flex gap-2 mt-2">
                        <button
                          onClick={() => handleSaveNotes(record.id)}
                          disabled={acting}
                          className="px-4 py-1.5 rounded-lg bg-[#1a1f3a] hover:bg-[#2a2f4a] text-white font-semibold text-sm transition-colors disabled:opacity-50"
                        >
                          {acting ? 'Saving...' : 'Save Notes'}
                        </button>
                        <button
                          onClick={() => setEditingNotesId(null)}
                          disabled={acting}
                          className="px-4 py-1.5 rounded-lg border border-gray-200 hover:border-gray-300 text-gray-600 font-semibold text-sm transition-colors"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="mb-4">
                      <div className="flex items-center justify-between">
                        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide">Admin Notes</p>
                        <button
                          onClick={() => startEditNotes(record)}
                          className="text-xs text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1"
                        >
                          <MessageSquare className="w-3 h-3" />
                          {record.notes ? 'Edit' : 'Add'}
                        </button>
                      </div>
                      {record.notes ? (
                        <p className="text-sm text-gray-600 mt-1">{record.notes}</p>
                      ) : (
                        <p className="text-sm text-gray-300 mt-1 italic">No notes yet.</p>
                      )}
                    </div>
                  )}

                  <div className="flex items-center gap-2 pt-3 border-t border-gray-100">
                    <span className="text-xs font-semibold text-gray-500 mr-2">Set status:</span>
                    {SIGNUP_STATUSES.map(s => (
                      <button
                        key={s}
                        onClick={() => handleStatusChange(record.id, s)}
                        disabled={acting || record.status === s}
                        className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-colors ${
                          record.status === s
                            ? STATUS_STYLES[s]
                            : 'border-gray-200 text-gray-500 hover:border-gray-300 hover:bg-gray-50'
                        } disabled:opacity-50`}
                      >
                        {SIGNUP_STATUS_LABELS[s]}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}

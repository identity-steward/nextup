import { useEffect, useState, useCallback } from 'react';
import { DashboardLayout } from '../components/DashboardLayout';
import {
  ParentIntakeService,
  REVIEWABLE_STATUSES,
  STATUS_LABELS,
  type ParentIntakeRecord,
  type ParentIntakeStatus,
} from '../services/parentIntakeService';
import {
  Search, RefreshCw, Mail, Phone, Clock, CheckCircle2,
  AlertTriangle, FileText, User, Calendar, MessageSquare,
} from 'lucide-react';

const STATUS_STYLES: Record<ParentIntakeStatus, string> = {
  pending: 'text-amber-700 bg-amber-50 border-amber-200',
  contacted: 'text-blue-700 bg-blue-50 border-blue-200',
  needs_verification: 'text-orange-700 bg-orange-50 border-orange-200',
  reviewed: 'text-green-700 bg-green-50 border-green-200',
  approved: 'text-emerald-700 bg-emerald-50 border-emerald-200',
  rejected: 'text-red-700 bg-red-50 border-red-200',
};

export function AdminParentIntakePage() {
  const [records, setRecords] = useState<ParentIntakeRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<ParentIntakeStatus | 'all'>('all');
  const [editingNotesId, setEditingNotesId] = useState<string | null>(null);
  const [notesDraft, setNotesDraft] = useState('');
  const [acting, setActing] = useState(false);
  const [actionError, setActionError] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    const data = await ParentIntakeService.getAll();
    setRecords(data);
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
    contacted: records.filter(r => r.status === 'contacted').length,
    needs_verification: records.filter(r => r.status === 'needs_verification').length,
    reviewed: records.filter(r => r.status === 'reviewed').length,
  };

  const handleStatusChange = async (id: string, status: ParentIntakeStatus) => {
    setActing(true);
    setActionError('');
    const ok = await ParentIntakeService.updateStatus(id, status);
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
    const ok = await ParentIntakeService.updateNotes(id, notesDraft);
    setActing(false);
    if (ok) {
      setRecords(prev => prev.map(r => r.id === id ? { ...r, notes: notesDraft } : r));
      setEditingNotesId(null);
    } else {
      setActionError('Failed to save notes.');
    }
  };

  const startEditNotes = (record: ParentIntakeRecord) => {
    setEditingNotesId(record.id);
    setNotesDraft(record.notes ?? '');
  };

  const formatDate = (iso: string) =>
    new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

  return (
    <DashboardLayout title="Parent Intake">
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
                <Mail className="w-5 h-5 text-blue-500" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{counts.contacted}</p>
                <p className="text-xs text-gray-500 font-medium">Contacted</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-2xl border border-gray-200 p-5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-orange-50 rounded-xl flex items-center justify-center">
                <AlertTriangle className="w-5 h-5 text-orange-500" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{counts.needs_verification}</p>
                <p className="text-xs text-gray-500 font-medium">Needs Verification</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-2xl border border-gray-200 p-5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-green-50 rounded-xl flex items-center justify-center">
                <CheckCircle2 className="w-5 h-5 text-green-500" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{counts.reviewed}</p>
                <p className="text-xs text-gray-500 font-medium">Reviewed</p>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
          <p className="text-sm text-blue-800">
            <strong>Manual review queue.</strong> Contact the parent using the information below, then update the review status.
            No athlete profiles, households, authority records, or consent records are created automatically.
            "Reviewed" is an administrative status only — it does not constitute guardian verification or media consent.
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
            onChange={(e) => setStatusFilter(e.target.value as ParentIntakeStatus | 'all')}
            className="px-4 py-2.5 border border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none text-sm font-medium text-gray-700"
          >
            <option value="all">All statuses</option>
            {REVIEWABLE_STATUSES.map(s => (
              <option key={s} value={s}>{STATUS_LABELS[s]}</option>
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
        ) : filtered.length === 0 ? (
          <div className="bg-white rounded-2xl border border-gray-200 p-10 text-center">
            <p className="text-gray-400 text-sm">No intake submissions found.</p>
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
                          {record.parent_first_name} {record.parent_last_name}
                        </h3>
                        <span className={`inline-flex items-center gap-1 text-xs font-bold px-2 py-0.5 rounded-full border ${STATUS_STYLES[record.status]}`}>
                          {STATUS_LABELS[record.status]}
                        </span>
                        {record.consent_given && (
                          <span className="inline-flex items-center gap-1 text-xs font-bold text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full">
                            <CheckCircle2 className="w-3 h-3" /> Consent checked
                          </span>
                        )}
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
                        <p className="text-gray-900 font-medium">
                          {record.athlete_first_name} {record.athlete_last_name}
                        </p>
                        <p className="text-gray-600">
                          {record.athlete_sport}
                          {record.athlete_age ? ` · Age ${record.athlete_age}` : ''}
                        </p>
                        {record.athlete_school && <p className="text-gray-600">{record.athlete_school}</p>}
                        {record.city && <p className="text-gray-600">{record.city}</p>}
                      </div>
                    </div>
                  </div>

                  {record.athlete_bio && (
                    <div className="mb-3">
                      <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1">Bio</p>
                      <p className="text-sm text-gray-600 leading-relaxed">{record.athlete_bio}</p>
                    </div>
                  )}

                  {record.support_needed && (
                    <div className="mb-3">
                      <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1">Support Needed</p>
                      <p className="text-sm text-gray-600 leading-relaxed">{record.support_needed}</p>
                    </div>
                  )}

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
                    {REVIEWABLE_STATUSES.map(s => (
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
                        {STATUS_LABELS[s]}
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

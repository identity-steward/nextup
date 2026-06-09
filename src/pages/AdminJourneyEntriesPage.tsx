import { useState, useEffect } from 'react';
import { DashboardLayout } from '../components/DashboardLayout';
import {
  CheckCircle, XCircle, Clock, ChevronDown, ChevronUp, RefreshCw,
  Plus, X, Star, Award, Zap, BookOpen, Shield, Users, Heart, Layers,
  AlertTriangle, FileText, ShieldCheck
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { JourneyService } from '../services/journeyService';
import { ENTRY_TYPES, getEntryTypeMeta, formatEntryDate } from '../types/journey';
import type { JourneyEntry, EntryType } from '../types/journey';

// ----- icon map -----
const ICON_MAP: Record<string, LucideIcon> = {
  Star, Award, Zap, BookOpen, Shield, Users, Heart, Layers, AlertTriangle, FileText,
};
function EntryIcon({ type, className }: { type: string; className?: string }) {
  const meta = getEntryTypeMeta(type);
  const Icon = ICON_MAP[meta.iconName] ?? FileText;
  return <Icon className={className} />;
}

// ----- types -----
interface AthleteListItem {
  id: string;
  first_name: string;
  last_initial: string;
  slug: string;
}

interface EntryWithAthlete extends JourneyEntry {
  athletes?: { first_name: string; last_initial: string; slug: string } | null;
}

interface CreateForm {
  athlete_id: string;
  title: string;
  entry_type: EntryType | '';
  date_occurred: string;
  body: string;
  visibility: 'public' | 'private';
  status: 'pending' | 'approved';
  verified: boolean;
  verified_by: string;
  created_by_role: 'admin';
}

interface ReviewState {
  visibility: 'public' | 'private';
  verified: boolean;
  verified_by: string;
  admin_notes: string;
}

const BLANK_FORM: CreateForm = {
  athlete_id: '',
  title: '',
  entry_type: '',
  date_occurred: '',
  body: '',
  visibility: 'public',
  status: 'approved',
  verified: true,
  verified_by: '',
  created_by_role: 'admin',
};

const STATUS_FILTERS = ['all', 'pending', 'approved', 'rejected'] as const;
type StatusFilter = typeof STATUS_FILTERS[number];

export function AdminJourneyEntriesPage() {
  const [entries, setEntries] = useState<EntryWithAthlete[]>([]);
  const [athletes, setAthletes] = useState<AthleteListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('pending');
  const [expanded, setExpanded] = useState<string | null>(null);
  const [processing, setProcessing] = useState<string | null>(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [form, setForm] = useState<CreateForm>(BLANK_FORM);
  const [formError, setFormError] = useState('');
  const [saving, setSaving] = useState(false);
  const [reviewStates, setReviewStates] = useState<Record<string, ReviewState>>({});

  useEffect(() => { load(); }, [statusFilter]);
  useEffect(() => { loadAthletes(); }, []);

  const load = async () => {
    setLoading(true);
    const data = await JourneyService.getAllEntries(statusFilter);
    setEntries(data as EntryWithAthlete[]);
    setLoading(false);
  };

  const loadAthletes = async () => {
    const data = await JourneyService.getAthletesList();
    setAthletes(data);
  };

  const pendingCount = entries.filter(e => e.status === 'pending').length;

  const getReviewState = (id: string, entry: EntryWithAthlete): ReviewState => {
    if (reviewStates[id]) return reviewStates[id];
    return {
      visibility: entry.visibility ?? 'public',
      verified: entry.verified ?? false,
      verified_by: entry.verified_by ?? '',
      admin_notes: entry.admin_notes ?? '',
    };
  };

  const setReviewField = (id: string, entry: EntryWithAthlete, field: keyof ReviewState, value: string | boolean) => {
    setReviewStates(prev => ({
      ...prev,
      [id]: { ...getReviewState(id, entry), [field]: value },
    }));
  };

  const handleReview = async (id: string, action: 'approved' | 'rejected') => {
    const entry = entries.find(e => e.id === id);
    if (!entry) return;
    setProcessing(id);
    const rs = getReviewState(id, entry);
    await JourneyService.reviewEntry(id, action, rs.visibility, rs.verified, rs.verified_by || null, rs.admin_notes || null);
    setProcessing(null);
    setExpanded(null);
    await load();
  };

  const handleCreate = async () => {
    if (!form.athlete_id) { setFormError('Select an athlete.'); return; }
    if (!form.title.trim()) { setFormError('Title is required.'); return; }
    if (!form.entry_type) { setFormError('Select an entry type.'); return; }
    setFormError('');
    setSaving(true);

    const result = await JourneyService.createEntry({
      athlete_id: form.athlete_id,
      title: form.title.trim(),
      body: form.body.trim() || null,
      entry_type: form.entry_type,
      date_occurred: form.date_occurred || null,
      visibility: form.visibility,
      status: form.status,
      verified: form.verified,
      verified_by: form.verified_by.trim() || null,
      verification_source: null,
      admin_notes: null,
      created_by: null,
      created_by_role: form.created_by_role,
      evidence_media_id: null,
      evidence_tag_id: null,
      reviewed_at: form.status === 'approved' ? new Date().toISOString() : null,
    });

    setSaving(false);
    if (result) {
      setShowCreateForm(false);
      setForm(BLANK_FORM);
      if (statusFilter === 'all' || statusFilter === form.status) {
        await load();
      }
    } else {
      setFormError('Failed to save. Try again.');
    }
  };

  return (
    <DashboardLayout title="Journey Entries">
      <div className="space-y-6">

        {/* Header actions */}
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <div className="flex items-center gap-3 flex-wrap">
            <div className="flex gap-1 bg-white border border-gray-200 rounded-xl p-1">
              {STATUS_FILTERS.map(f => (
                <button
                  key={f}
                  onClick={() => setStatusFilter(f)}
                  className={`px-4 py-1.5 rounded-lg text-sm font-semibold capitalize transition-all ${
                    statusFilter === f ? 'bg-[#1a1f3a] text-white' : 'text-gray-500 hover:text-[#1a1f3a]'
                  }`}
                >
                  {f}
                  {f === 'pending' && pendingCount > 0 && (
                    <span className="ml-1.5 bg-amber-500 text-white text-[10px] font-black px-1.5 py-0.5 rounded-full">
                      {pendingCount}
                    </span>
                  )}
                </button>
              ))}
            </div>
            <button
              onClick={load}
              className="p-2 rounded-xl border border-gray-200 hover:border-gray-300 text-gray-500 hover:text-[#1a1f3a] transition-colors"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>
          <button
            onClick={() => { setShowCreateForm(true); setFormError(''); }}
            className="flex items-center gap-2 bg-gradient-to-r from-[#c5a572] to-[#d4af37] text-[#1a1f3a] font-bold px-5 py-2.5 rounded-xl hover:opacity-90 transition-opacity text-sm"
          >
            <Plus className="w-4 h-4" />
            New Entry
          </button>
        </div>

        {/* Create Entry Form */}
        {showCreateForm && (
          <div className="bg-white rounded-2xl border-2 border-[#d4af37]/40 shadow-lg overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-amber-50/50">
              <h3 className="font-bold text-[#1a1f3a] text-base">Create Journey Entry</h3>
              <button onClick={() => { setShowCreateForm(false); setForm(BLANK_FORM); }} className="text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div className="grid sm:grid-cols-2 gap-4">
                {/* Athlete */}
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">Athlete *</label>
                  <select
                    value={form.athlete_id}
                    onChange={e => setForm(p => ({ ...p, athlete_id: e.target.value }))}
                    className="w-full px-3 py-2.5 rounded-xl border-2 border-gray-200 focus:border-[#d4af37] focus:outline-none text-sm text-[#1a1f3a] transition-colors"
                  >
                    <option value="">Select athlete…</option>
                    {athletes.map(a => (
                      <option key={a.id} value={a.id}>
                        {a.first_name} {a.last_initial}. ({a.slug})
                      </option>
                    ))}
                  </select>
                </div>
                {/* Entry Type */}
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">Entry Type *</label>
                  <select
                    value={form.entry_type}
                    onChange={e => setForm(p => ({ ...p, entry_type: e.target.value as EntryType }))}
                    className="w-full px-3 py-2.5 rounded-xl border-2 border-gray-200 focus:border-[#d4af37] focus:outline-none text-sm text-[#1a1f3a] transition-colors"
                  >
                    <option value="">Select type…</option>
                    {ENTRY_TYPES.map(t => (
                      <option key={t} value={t}>{getEntryTypeMeta(t).label}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Title */}
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">Title *</label>
                <input
                  type="text"
                  value={form.title}
                  onChange={e => setForm(p => ({ ...p, title: e.target.value }))}
                  placeholder="e.g. Elected Team Captain"
                  className="w-full px-3 py-2.5 rounded-xl border-2 border-gray-200 focus:border-[#d4af37] focus:outline-none text-sm text-[#1a1f3a] transition-colors"
                />
              </div>

              {/* Body */}
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">Body (optional)</label>
                <textarea
                  rows={3}
                  value={form.body}
                  onChange={e => setForm(p => ({ ...p, body: e.target.value }))}
                  placeholder="Narrative description of this development moment…"
                  className="w-full px-3 py-2.5 rounded-xl border-2 border-gray-200 focus:border-[#d4af37] focus:outline-none text-sm text-[#1a1f3a] transition-colors resize-none"
                />
              </div>

              <div className="grid sm:grid-cols-3 gap-4">
                {/* Date */}
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">Date Occurred</label>
                  <input
                    type="date"
                    value={form.date_occurred}
                    onChange={e => setForm(p => ({ ...p, date_occurred: e.target.value }))}
                    className="w-full px-3 py-2.5 rounded-xl border-2 border-gray-200 focus:border-[#d4af37] focus:outline-none text-sm text-[#1a1f3a] transition-colors"
                  />
                </div>
                {/* Visibility */}
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">Visibility</label>
                  <select
                    value={form.visibility}
                    onChange={e => setForm(p => ({ ...p, visibility: e.target.value as 'public' | 'private' }))}
                    className="w-full px-3 py-2.5 rounded-xl border-2 border-gray-200 focus:border-[#d4af37] focus:outline-none text-sm text-[#1a1f3a] transition-colors"
                  >
                    <option value="public">Public</option>
                    <option value="private">Private</option>
                  </select>
                </div>
                {/* Status */}
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">Status</label>
                  <select
                    value={form.status}
                    onChange={e => setForm(p => ({ ...p, status: e.target.value as 'pending' | 'approved' }))}
                    className="w-full px-3 py-2.5 rounded-xl border-2 border-gray-200 focus:border-[#d4af37] focus:outline-none text-sm text-[#1a1f3a] transition-colors"
                  >
                    <option value="approved">Approved</option>
                    <option value="pending">Pending</option>
                  </select>
                </div>
              </div>

              {/* Verified */}
              <div className="flex items-center gap-4">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={form.verified}
                    onChange={e => setForm(p => ({ ...p, verified: e.target.checked }))}
                    className="w-4 h-4 accent-amber-500 rounded"
                  />
                  <span className="text-sm font-semibold text-[#1a1f3a]">Mark as verified</span>
                </label>
                {form.verified && (
                  <input
                    type="text"
                    value={form.verified_by}
                    onChange={e => setForm(p => ({ ...p, verified_by: e.target.value }))}
                    placeholder="Verified by (e.g. Coach Williams)"
                    className="flex-1 px-3 py-2 rounded-xl border-2 border-gray-200 focus:border-[#d4af37] focus:outline-none text-sm text-[#1a1f3a] transition-colors"
                  />
                )}
              </div>

              {formError && (
                <p className="text-sm text-red-600 font-semibold">{formError}</p>
              )}

              <div className="flex gap-3 pt-2">
                <button
                  onClick={handleCreate}
                  disabled={saving}
                  className="flex items-center gap-2 bg-[#1a1f3a] hover:bg-[#252b4a] text-white font-bold px-6 py-2.5 rounded-xl transition-colors disabled:opacity-50 text-sm"
                >
                  <CheckCircle className="w-4 h-4" />
                  {saving ? 'Saving…' : 'Save Entry'}
                </button>
                <button
                  onClick={() => { setShowCreateForm(false); setForm(BLANK_FORM); }}
                  className="px-6 py-2.5 rounded-xl border border-gray-200 text-gray-600 font-semibold hover:bg-gray-50 transition-colors text-sm"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Entry List */}
        {loading ? (
          <div className="flex justify-center py-20">
            <div className="w-8 h-8 border-4 border-[#d4af37] border-t-transparent rounded-full animate-spin" />
          </div>
        ) : entries.length === 0 ? (
          <div className="bg-white rounded-2xl border border-gray-200 p-10 text-center">
            <FileText className="w-10 h-10 text-gray-200 mx-auto mb-3" />
            <p className="text-gray-500 text-sm">
              No {statusFilter === 'all' ? '' : statusFilter} journey entries.
            </p>
            <p className="text-gray-400 text-xs mt-1">Click "New Entry" to document the first development moment.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {entries.map(entry => {
              const isOpen = expanded === entry.id;
              const meta = getEntryTypeMeta(entry.entry_type);
              const athleteName = entry.athletes
                ? `${entry.athletes.first_name} ${entry.athletes.last_initial}.`
                : '—';
              const rs = getReviewState(entry.id, entry);

              return (
                <div key={entry.id} className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
                  {/* Row */}
                  <div
                    className="flex items-center gap-4 px-6 py-4 cursor-pointer hover:bg-gray-50 transition-colors"
                    onClick={() => setExpanded(isOpen ? null : entry.id)}
                  >
                    {/* Type badge */}
                    <span className={`hidden sm:inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider border ${meta.lightBg} ${meta.lightText} ${meta.lightBorder}`}>
                      {meta.label}
                    </span>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="font-bold text-[#1a1f3a] text-sm truncate">{entry.title}</p>
                        {entry.verified && (
                          <ShieldCheck className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                        )}
                      </div>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-xs text-gray-500 font-semibold">{athleteName}</span>
                        {entry.date_occurred && (
                          <>
                            <span className="text-gray-300 text-xs">·</span>
                            <span className="text-xs text-gray-400">{formatEntryDate(entry.date_occurred)}</span>
                          </>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-3 shrink-0">
                      {entry.status === 'pending' && (
                        <span className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full border bg-amber-50 text-amber-700 border-amber-200">
                          <Clock className="w-3 h-3" /> Pending
                        </span>
                      )}
                      {entry.status === 'approved' && (
                        <span className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full border bg-green-50 text-green-700 border-green-200">
                          <CheckCircle className="w-3 h-3" /> Approved
                        </span>
                      )}
                      {entry.status === 'rejected' && (
                        <span className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full border bg-red-50 text-red-700 border-red-200">
                          <XCircle className="w-3 h-3" /> Rejected
                        </span>
                      )}
                      {entry.visibility === 'public' && entry.status === 'approved' && (
                        <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">Public</span>
                      )}
                      {isOpen ? <ChevronUp className="w-4 h-4 text-gray-400" /> : <ChevronDown className="w-4 h-4 text-gray-400" />}
                    </div>
                  </div>

                  {/* Expanded */}
                  {isOpen && (
                    <div className="px-6 pb-6 border-t border-gray-100 pt-4 space-y-4">
                      {/* Body */}
                      {entry.body && (
                        <div className="bg-gray-50 rounded-xl px-4 py-3">
                          <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-1">Narrative</p>
                          <p className="text-sm text-[#1a1f3a] leading-relaxed">{entry.body}</p>
                        </div>
                      )}

                      {/* Meta row */}
                      <div className="flex flex-wrap gap-3 text-xs text-gray-500">
                        {entry.entry_type && (
                          <span>Type: <span className="font-semibold text-gray-700">{getEntryTypeMeta(entry.entry_type).label}</span></span>
                        )}
                        {entry.date_occurred && (
                          <span>Date: <span className="font-semibold text-gray-700">{formatEntryDate(entry.date_occurred)}</span></span>
                        )}
                        {entry.created_by_role && (
                          <span>Submitted by: <span className="font-semibold text-gray-700 capitalize">{entry.created_by_role}</span></span>
                        )}
                        {entry.verified_by && (
                          <span>Verified by: <span className="font-semibold text-gray-700">{entry.verified_by}</span></span>
                        )}
                      </div>

                      {/* Existing admin notes */}
                      {entry.admin_notes && entry.status !== 'pending' && (
                        <div className="bg-gray-50 rounded-xl px-4 py-3">
                          <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-1">Admin Notes</p>
                          <p className="text-sm text-[#1a1f3a]">{entry.admin_notes}</p>
                        </div>
                      )}

                      {/* Review controls for pending entries */}
                      {entry.status === 'pending' && (
                        <div className="space-y-3 border-t border-gray-100 pt-4">
                          <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">Review Settings</p>

                          <div className="grid sm:grid-cols-2 gap-3">
                            {/* Visibility */}
                            <div>
                              <label className="block text-xs font-semibold text-gray-500 mb-1">Visibility if approved</label>
                              <select
                                value={rs.visibility}
                                onChange={e => setReviewField(entry.id, entry, 'visibility', e.target.value)}
                                className="w-full px-3 py-2 rounded-xl border-2 border-gray-200 focus:border-[#d4af37] focus:outline-none text-sm text-[#1a1f3a] transition-colors"
                              >
                                <option value="public">Public — visible on profile</option>
                                <option value="private">Private — family only</option>
                              </select>
                            </div>

                            {/* Verified */}
                            <div className="flex flex-col justify-end gap-2">
                              <label className="flex items-center gap-2 cursor-pointer">
                                <input
                                  type="checkbox"
                                  checked={rs.verified}
                                  onChange={e => setReviewField(entry.id, entry, 'verified', e.target.checked)}
                                  className="w-4 h-4 accent-amber-500 rounded"
                                />
                                <span className="text-sm font-semibold text-[#1a1f3a]">Mark as verified</span>
                              </label>
                              {rs.verified && (
                                <input
                                  type="text"
                                  value={rs.verified_by}
                                  onChange={e => setReviewField(entry.id, entry, 'verified_by', e.target.value)}
                                  placeholder="Verified by…"
                                  className="px-3 py-2 rounded-xl border-2 border-gray-200 focus:border-[#d4af37] focus:outline-none text-sm text-[#1a1f3a] transition-colors"
                                />
                              )}
                            </div>
                          </div>

                          {/* Admin notes */}
                          <div>
                            <label className="block text-xs font-semibold text-gray-500 mb-1">Admin Notes (optional)</label>
                            <textarea
                              rows={2}
                              value={rs.admin_notes}
                              onChange={e => setReviewField(entry.id, entry, 'admin_notes', e.target.value)}
                              className="w-full px-3 py-2.5 rounded-xl border-2 border-gray-200 focus:border-[#d4af37] focus:outline-none text-sm text-[#1a1f3a] transition-colors resize-none"
                              placeholder="Internal notes…"
                            />
                          </div>

                          <div className="flex gap-3">
                            <button
                              onClick={() => handleReview(entry.id, 'approved')}
                              disabled={processing === entry.id}
                              className="flex-1 flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 text-white font-bold px-5 py-2.5 rounded-xl transition-colors disabled:opacity-50 text-sm"
                            >
                              <CheckCircle className="w-4 h-4" />
                              {processing === entry.id ? 'Saving…' : 'Approve'}
                            </button>
                            <button
                              onClick={() => handleReview(entry.id, 'rejected')}
                              disabled={processing === entry.id}
                              className="flex-1 flex items-center justify-center gap-2 bg-red-600 hover:bg-red-700 text-white font-bold px-5 py-2.5 rounded-xl transition-colors disabled:opacity-50 text-sm"
                            >
                              <XCircle className="w-4 h-4" />
                              Reject
                            </button>
                          </div>
                        </div>
                      )}

                      {entry.status !== 'pending' && entry.reviewed_at && (
                        <p className="text-xs text-gray-400">
                          Reviewed {new Date(entry.reviewed_at).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                        </p>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}

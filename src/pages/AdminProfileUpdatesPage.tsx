import { useState, useEffect } from 'react';
import { DashboardLayout } from '../components/DashboardLayout';
import { CheckCircle, XCircle, Clock, User, ChevronDown, ChevronUp, RefreshCw } from 'lucide-react';
import { supabase } from '../lib/supabase';

interface UpdateRequest {
  id: string;
  athlete_slug: string;
  submitted_by_name: string;
  submitted_by_role: string;
  submitted_by_email: string;
  status: string;
  created_at: string;
  reviewed_at: string | null;
  admin_notes: string | null;
  field_correction_notes: string | null;
  field_bio: string | null;
  field_class_year: string | null;
  field_school: string | null;
  field_team: string | null;
  field_position: string | null;
  field_city_state: string | null;
  field_social_instagram: string | null;
  field_social_twitter: string | null;
  highlight_video_url: string | null;
}

const STATUS_FILTERS = ['all', 'pending', 'approved', 'rejected'] as const;
type StatusFilter = typeof STATUS_FILTERS[number];

interface AdminProfileUpdatesPageProps {
  onNavigate?: (page: string) => void;
}

export function AdminProfileUpdatesPage({ onNavigate }: AdminProfileUpdatesPageProps) {
  const [requests, setRequests] = useState<UpdateRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('pending');
  const [expanded, setExpanded] = useState<string | null>(null);
  const [adminNotes, setAdminNotes] = useState<Record<string, string>>({});
  const [processing, setProcessing] = useState<string | null>(null);

  useEffect(() => {
    load();
  }, [statusFilter]);

  const load = async () => {
    setLoading(true);
    let query = supabase
      .from('profile_update_requests')
      .select('id,athlete_slug,submitted_by_name,submitted_by_role,submitted_by_email,status,created_at,reviewed_at,admin_notes,field_correction_notes,field_bio,field_class_year,field_school,field_team,field_position,field_city_state,field_social_instagram,field_social_twitter,highlight_video_url')
      .order('created_at', { ascending: false })
      .limit(100);

    if (statusFilter !== 'all') {
      query = query.eq('status', statusFilter);
    }

    const { data } = await query;
    setRequests((data || []) as UpdateRequest[]);
    setLoading(false);
  };

  const review = async (id: string, action: 'approved' | 'rejected') => {
    setProcessing(id);
    const req = requests.find(r => r.id === id);
    if (!req) { setProcessing(null); return; }

    // Update the request status
    await supabase
      .from('profile_update_requests')
      .update({
        status: action,
        admin_notes: adminNotes[id] || null,
        reviewed_at: new Date().toISOString(),
      })
      .eq('id', id);

    // If approved, apply changes to the athletes table
    if (action === 'approved') {
      const patch: Record<string, string | null> = {};
      if (req.field_bio !== null) patch.bio = req.field_bio;
      if (req.field_class_year !== null) patch.grade = req.field_class_year;
      if (req.field_school !== null) patch.school = req.field_school;
      if (req.field_team !== null) patch.team_name = req.field_team;
      if (req.field_position !== null) patch.position = req.field_position;
      if (req.field_city_state !== null) patch.city = req.field_city_state;
      if (req.field_social_instagram !== null) patch.instagram_handle = req.field_social_instagram;
      if (req.field_social_twitter !== null) patch.twitter_handle = req.field_social_twitter;
      if (req.highlight_video_url !== null) patch.highlight_video_url = req.highlight_video_url;

      if (Object.keys(patch).length > 0) {
        await supabase
          .from('athletes')
          .update(patch)
          .eq('slug', req.athlete_slug);
      }
    }

    setProcessing(null);
    setExpanded(null);
    await load();
  };

  const counts = {
    all: requests.length,
    pending: requests.filter(r => r.status === 'pending').length,
  };

  const fieldLabels: Record<string, string> = {
    field_bio: 'Bio',
    field_class_year: 'Grade / Class Year',
    field_school: 'School',
    field_team: 'Team',
    field_position: 'Position',
    field_city_state: 'City / State',
    field_social_instagram: 'Instagram',
    field_social_twitter: 'Twitter / X',
    highlight_video_url: 'Highlight Video URL',
    field_correction_notes: 'Notes from Submitter',
  };

  const changedFields = (req: UpdateRequest) =>
    Object.entries(fieldLabels).filter(([key]) => req[key as keyof UpdateRequest] !== null);

  return (
    <DashboardLayout title="Profile Update Requests" onNavigate={onNavigate}>
      <div className="space-y-6">
        {/* Filter + refresh */}
        <div className="flex items-center gap-3 flex-wrap">
          <div className="flex gap-1 bg-white border border-gray-200 rounded-xl p-1">
            {STATUS_FILTERS.map(f => (
              <button
                key={f}
                onClick={() => setStatusFilter(f)}
                className={`px-4 py-1.5 rounded-lg text-sm font-semibold capitalize transition-all ${
                  statusFilter === f ? 'bg-navy text-white' : 'text-gray-500 hover:text-navy'
                }`}
              >
                {f}
                {f === 'pending' && counts.pending > 0 && (
                  <span className="ml-1.5 bg-amber-500 text-white text-[10px] font-black px-1.5 py-0.5 rounded-full">{counts.pending}</span>
                )}
              </button>
            ))}
          </div>
          <button onClick={load} className="p-2 rounded-xl border border-gray-200 hover:border-gray-300 text-gray-500 hover:text-navy transition-colors">
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>

        {loading ? (
          <div className="flex justify-center py-20">
            <div className="w-8 h-8 border-4 border-gold border-t-transparent rounded-full animate-spin" />
          </div>
        ) : requests.length === 0 ? (
          <div className="bg-white rounded-2xl border border-gray-200 p-10 text-center">
            <CheckCircle className="w-10 h-10 text-green-300 mx-auto mb-3" />
            <p className="text-gray-500 text-sm">No {statusFilter === 'all' ? '' : statusFilter} requests.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {requests.map(req => {
              const fields = changedFields(req);
              const isOpen = expanded === req.id;

              return (
                <div key={req.id} className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
                  {/* Header row */}
                  <div
                    className="flex items-center gap-4 px-6 py-4 cursor-pointer hover:bg-gray-50 transition-colors"
                    onClick={() => setExpanded(isOpen ? null : req.id)}
                  >
                    <div className="w-9 h-9 rounded-xl bg-navy/5 flex items-center justify-center shrink-0">
                      <User className="w-4.5 h-4.5 text-navy/50" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="font-bold text-navy text-sm">{req.athlete_slug}</p>
                        <span className="text-gray-300 text-xs">•</span>
                        <p className="text-gray-500 text-xs">{req.submitted_by_name} ({req.submitted_by_role})</p>
                      </div>
                      <p className="text-xs text-gray-400 mt-0.5">{new Date(req.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</p>
                    </div>
                    <div className="flex items-center gap-3 shrink-0">
                      <span className="text-xs text-gray-400">{fields.length} field{fields.length !== 1 ? 's' : ''}</span>
                      {req.status === 'pending' && (
                        <span className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full border bg-amber-50 text-amber-700 border-amber-200">
                          <Clock className="w-3 h-3" /> Pending
                        </span>
                      )}
                      {req.status === 'approved' && (
                        <span className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full border bg-green-50 text-green-700 border-green-200">
                          <CheckCircle className="w-3 h-3" /> Approved
                        </span>
                      )}
                      {req.status === 'rejected' && (
                        <span className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full border bg-red-50 text-red-700 border-red-200">
                          <XCircle className="w-3 h-3" /> Rejected
                        </span>
                      )}
                      {isOpen ? <ChevronUp className="w-4 h-4 text-gray-400" /> : <ChevronDown className="w-4 h-4 text-gray-400" />}
                    </div>
                  </div>

                  {/* Expanded detail */}
                  {isOpen && (
                    <div className="px-6 pb-6 border-t border-gray-100 pt-4 space-y-4">
                      {/* Fields */}
                      <div className="grid sm:grid-cols-2 gap-3">
                        {fields.map(([key, label]) => (
                          <div key={key} className="bg-gray-50 rounded-xl px-4 py-3">
                            <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-1">{label}</p>
                            <p className="text-sm text-navy break-words">{String(req[key as keyof UpdateRequest])}</p>
                          </div>
                        ))}
                      </div>

                      {/* Contact info */}
                      <div className="text-xs text-gray-400">
                        Submitted by <span className="font-semibold text-gray-600">{req.submitted_by_email}</span>
                      </div>

                      {/* Existing admin notes */}
                      {req.admin_notes && (
                        <div className="bg-gray-50 rounded-xl px-4 py-3">
                          <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-1">Previous Admin Notes</p>
                          <p className="text-sm text-navy">{req.admin_notes}</p>
                        </div>
                      )}

                      {/* Review actions (only if pending) */}
                      {req.status === 'pending' && (
                        <div className="space-y-3">
                          <div>
                            <label className="block text-xs font-semibold text-navy mb-1.5">Admin Notes (optional)</label>
                            <textarea
                              rows={2}
                              value={adminNotes[req.id] || ''}
                              onChange={e => setAdminNotes(prev => ({ ...prev, [req.id]: e.target.value }))}
                              className="w-full px-3 py-2.5 rounded-xl border-2 border-gray-200 focus:border-gold focus:outline-none text-sm text-navy transition-colors"
                              placeholder="Notes back to the athlete/parent..."
                            />
                          </div>
                          <div className="flex gap-3">
                            <button
                              onClick={() => review(req.id, 'approved')}
                              disabled={processing === req.id}
                              className="flex-1 flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 text-white font-bold px-5 py-2.5 rounded-xl transition-colors disabled:opacity-50 text-sm"
                            >
                              <CheckCircle className="w-4 h-4" />
                              {processing === req.id ? 'Applying...' : 'Approve & Apply'}
                            </button>
                            <button
                              onClick={() => review(req.id, 'rejected')}
                              disabled={processing === req.id}
                              className="flex-1 flex items-center justify-center gap-2 bg-red-600 hover:bg-red-700 text-white font-bold px-5 py-2.5 rounded-xl transition-colors disabled:opacity-50 text-sm"
                            >
                              <XCircle className="w-4 h-4" />
                              Reject
                            </button>
                          </div>
                        </div>
                      )}

                      {req.status !== 'pending' && req.reviewed_at && (
                        <p className="text-xs text-gray-400">
                          Reviewed on {new Date(req.reviewed_at).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
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

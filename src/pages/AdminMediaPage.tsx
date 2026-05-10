import { useState, useEffect } from 'react';
import { DashboardLayout } from '../components/DashboardLayout';
import { CheckCircle, XCircle, Clock, Camera, Video, RefreshCw, ExternalLink } from 'lucide-react';
import { supabase } from '../lib/supabase';

interface MediaItem {
  id: string;
  athlete_id: string;
  uploader_id: string;
  media_type: string;
  bucket: string;
  storage_path: string;
  public_url: string | null;
  file_name: string;
  file_size_bytes: number | null;
  caption: string | null;
  status: string;
  admin_notes: string | null;
  created_at: string;
  reviewed_at: string | null;
  athlete_slug?: string;
  athlete_name?: string;
}

const STATUS_FILTERS = ['all', 'pending', 'approved', 'rejected'] as const;
type StatusFilter = typeof STATUS_FILTERS[number];

function formatBytes(bytes: number | null): string {
  if (!bytes) return '';
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function AdminMediaPage() {
  const [items, setItems] = useState<MediaItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('pending');
  const [adminNotes, setAdminNotes] = useState<Record<string, string>>({});
  const [assignSlug, setAssignSlug] = useState<Record<string, string>>({});
  const [processing, setProcessing] = useState<string | null>(null);

  useEffect(() => {
    load();
  }, [statusFilter]);

  const load = async () => {
    setLoading(true);
    let query = supabase
      .from('media_uploads')
      .select('id,athlete_id,uploader_id,media_type,bucket,storage_path,public_url,file_name,file_size_bytes,caption,status,admin_notes,created_at,reviewed_at')
      .order('created_at', { ascending: false })
      .limit(100);

    if (statusFilter !== 'all') {
      query = query.eq('status', statusFilter);
    }

    const { data: mediaData } = await query;
    if (!mediaData) { setItems([]); setLoading(false); return; }

    // Fetch athlete slugs/names for context
    const athleteIds = [...new Set(mediaData.map(m => m.athlete_id))];
    const { data: athleteData } = await supabase
      .from('athletes')
      .select('id, slug, first_name, last_initial')
      .in('id', athleteIds);

    const athleteMap = Object.fromEntries((athleteData || []).map(a => [a.id, a]));

    const enriched: MediaItem[] = mediaData.map(m => ({
      ...m,
      athlete_slug: athleteMap[m.athlete_id]?.slug,
      athlete_name: athleteMap[m.athlete_id]
        ? `${athleteMap[m.athlete_id].first_name} ${athleteMap[m.athlete_id].last_initial}.`
        : m.athlete_id,
    }));

    setItems(enriched);
    setLoading(false);
  };

  const review = async (id: string, action: 'approved' | 'rejected') => {
    setProcessing(id);
    await supabase
      .from('media_uploads')
      .update({
        status: action,
        admin_notes: adminNotes[id] || null,
        reviewed_at: new Date().toISOString(),
      })
      .eq('id', id);

    setProcessing(null);
    await load();
  };

  const pendingCount = items.filter(i => i.status === 'pending').length;

  return (
    <DashboardLayout title="Media Review">
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
                {f === 'pending' && pendingCount > 0 && (
                  <span className="ml-1.5 bg-amber-500 text-white text-[10px] font-black px-1.5 py-0.5 rounded-full">{pendingCount}</span>
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
        ) : items.length === 0 ? (
          <div className="bg-white rounded-2xl border border-gray-200 p-10 text-center">
            <CheckCircle className="w-10 h-10 text-green-300 mx-auto mb-3" />
            <p className="text-gray-500 text-sm">No {statusFilter === 'all' ? '' : statusFilter} media uploads.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {items.map(item => (
              <div key={item.id} className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
                <div className="flex items-start gap-4 p-5">
                  {/* Preview thumbnail or icon */}
                  <div className="w-20 h-20 rounded-xl bg-gray-100 overflow-hidden shrink-0 flex items-center justify-center">
                    {item.media_type === 'photo' && item.public_url ? (
                      <img src={item.public_url} alt={item.file_name} className="w-full h-full object-cover" />
                    ) : item.media_type === 'photo' ? (
                      <Camera className="w-7 h-7 text-gray-300" />
                    ) : (
                      <Video className="w-7 h-7 text-gray-300" />
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2 flex-wrap">
                      <div>
                        <p className="font-bold text-navy text-sm truncate">{item.file_name}</p>
                        <p className="text-xs text-gray-400 mt-0.5">
                          {item.athlete_name} — {item.media_type}
                          {item.file_size_bytes ? ` · ${formatBytes(item.file_size_bytes)}` : ''}
                        </p>
                        {item.caption && <p className="text-xs text-gray-500 mt-1 italic">"{item.caption}"</p>}
                        <p className="text-xs text-gray-300 mt-1">{new Date(item.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</p>
                      </div>
                      <div className="shrink-0 flex items-center gap-2">
                        {item.public_url && (
                          <a href={item.public_url} target="_blank" rel="noopener noreferrer"
                            className="p-1.5 rounded-lg border border-gray-200 hover:border-gray-300 text-gray-400 hover:text-navy transition-colors">
                            <ExternalLink className="w-3.5 h-3.5" />
                          </a>
                        )}
                        {item.status === 'pending' && (
                          <span className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full border bg-amber-50 text-amber-700 border-amber-200">
                            <Clock className="w-3 h-3" /> Pending
                          </span>
                        )}
                        {item.status === 'approved' && (
                          <span className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full border bg-green-50 text-green-700 border-green-200">
                            <CheckCircle className="w-3 h-3" /> Approved
                          </span>
                        )}
                        {item.status === 'rejected' && (
                          <span className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full border bg-red-50 text-red-700 border-red-200">
                            <XCircle className="w-3 h-3" /> Rejected
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Review actions */}
                    {item.status === 'pending' && (
                      <div className="mt-4 space-y-3">
                        <textarea
                          rows={1}
                          value={adminNotes[item.id] || ''}
                          onChange={e => setAdminNotes(prev => ({ ...prev, [item.id]: e.target.value }))}
                          className="w-full px-3 py-2 rounded-xl border-2 border-gray-200 focus:border-gold focus:outline-none text-sm text-navy transition-colors"
                          placeholder="Admin notes (optional)..."
                        />
                        <div className="flex gap-2">
                          <button
                            onClick={() => review(item.id, 'approved')}
                            disabled={processing === item.id}
                            className="flex-1 flex items-center justify-center gap-1.5 bg-green-600 hover:bg-green-700 text-white font-bold px-4 py-2 rounded-xl transition-colors disabled:opacity-50 text-sm"
                          >
                            <CheckCircle className="w-3.5 h-3.5" />
                            {processing === item.id ? 'Working...' : 'Approve'}
                          </button>
                          <button
                            onClick={() => review(item.id, 'rejected')}
                            disabled={processing === item.id}
                            className="flex-1 flex items-center justify-center gap-1.5 bg-red-600 hover:bg-red-700 text-white font-bold px-4 py-2 rounded-xl transition-colors disabled:opacity-50 text-sm"
                          >
                            <XCircle className="w-3.5 h-3.5" />
                            Reject
                          </button>
                        </div>
                      </div>
                    )}
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

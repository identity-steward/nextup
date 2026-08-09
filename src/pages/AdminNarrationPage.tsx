import { useState, useEffect, useCallback } from 'react';
import { Loader2, MessageSquare, Send, Clock, CheckCircle, XCircle } from 'lucide-react';
import { DashboardLayout } from '../components/DashboardLayout';
import { getSubmittedNarrations, proposeInterpretation } from '../services/narrationService';
import type { PersonNarration, Person } from '../types/narration';

interface NarrationWithPerson extends PersonNarration {
  person: Person;
}

const statusStyles: Record<string, { icon: typeof Clock; color: string; label: string }> = {
  draft: { icon: Clock, color: 'text-gray-400', label: 'Draft' },
  submitted: { icon: Clock, color: 'text-blue-600', label: 'Submitted' },
  proposed: { icon: Send, color: 'text-gold', label: 'Proposed' },
  confirmed: { icon: CheckCircle, color: 'text-green-600', label: 'Confirmed' },
  modified: { icon: CheckCircle, color: 'text-green-600', label: 'Modified' },
  rejected: { icon: XCircle, color: 'text-gray-500', label: 'Rejected' },
};

export default function AdminNarrationPage() {
  const [narrations, setNarrations] = useState<NarrationWithPerson[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<NarrationWithPerson | null>(null);
  const [interpretation, setInterpretation] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    try {
      const data = await getSubmittedNarrations();
      setNarrations(data);
    } catch (err) {
      console.error('Failed to load narrations:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { void loadData(); }, [loadData]);

  const handleSelect = (n: NarrationWithPerson) => {
    setSelected(n);
    setInterpretation(n.proposed_interpretation ?? '');
    setError(null);
  };

  const handlePropose = async () => {
    if (!selected || interpretation.trim().length === 0) return;
    setSaving(true);
    setError(null);
    try {
      await proposeInterpretation(selected.id, interpretation.trim());
      await loadData();
      setSelected(null);
      setInterpretation('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not save interpretation');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <DashboardLayout title="Narration Review">
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-gold" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title="Narration Review">
      <div className="max-w-6xl mx-auto">
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl p-4 text-sm mb-6">
            {error}
          </div>
        )}

        <div className="grid lg:grid-cols-2 gap-6">
          {/* List */}
          <div>
            <h2 className="text-lg font-bold text-navy mb-4">
              Narrations Awaiting Review ({narrations.length})
            </h2>
            {narrations.length === 0 ? (
              <div className="bg-white rounded-xl shadow-sm p-8 text-center">
                <MessageSquare className="w-10 h-10 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-400">No narrations awaiting review.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {narrations.map((n) => {
                  const s = statusStyles[n.status] ?? statusStyles.submitted;
                  const Icon = s.icon;
                  return (
                    <button
                      key={n.id}
                      onClick={() => handleSelect(n)}
                      className={`w-full text-left bg-white rounded-xl shadow-sm p-4 hover:shadow-md transition-all border-2 ${
                        selected?.id === n.id ? 'border-gold' : 'border-transparent'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-medium text-navy text-sm">
                          {n.person.first_name}
                          {n.person.last_name ? ` ${n.person.last_name}` : ''}
                        </span>
                        <span className={`flex items-center gap-1 text-xs font-medium ${s.color}`}>
                          <Icon className="w-3.5 h-3.5" />
                          {s.label}
                        </span>
                      </div>
                      <p className="text-gray-500 text-xs leading-relaxed line-clamp-2">
                        {n.original_text}
                      </p>
                      <p className="text-gray-400 text-xs mt-2">
                        {n.submitted_at ? new Date(n.submitted_at).toLocaleDateString() : 'Not submitted'}
                      </p>
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Detail / Review */}
          <div>
            {selected ? (
              <div className="bg-white rounded-xl shadow-sm p-6 sticky top-24">
                <h2 className="text-lg font-bold text-navy mb-4">Review Narration</h2>

                <div className="mb-4">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-2">
                    Person
                  </h3>
                  <p className="text-navy font-medium">
                    {selected.person.first_name}
                    {selected.person.last_name ? ` ${selected.person.last_name}` : ''}
                  </p>
                </div>

                <div className="mb-4">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-2">
                    Original Narration
                  </h3>
                  <div className="bg-gray-50 rounded-lg p-4 border-l-4 border-navy">
                    <p className="text-gray-800 leading-relaxed whitespace-pre-wrap text-sm">
                      {selected.original_text}
                    </p>
                  </div>
                </div>

                <div className="mb-4">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-gold mb-2">
                    Proposed Interpretation
                  </h3>
                  <textarea
                    value={interpretation}
                    onChange={(e) => setInterpretation(e.target.value)}
                    rows={6}
                    placeholder="Organize what you heard into clear, plain-language needs..."
                    className="w-full rounded-lg border-2 border-gray-200 focus:border-gold p-3 text-sm text-gray-800 leading-relaxed resize-y"
                  />
                </div>

                <div className="bg-blue-50 border border-blue-100 rounded-lg p-3 mb-4">
                  <p className="text-xs text-gray-600 leading-relaxed">
                    This interpretation will be shown to the person for
                    confirmation. It does not determine eligibility. Keep it
                    in plain language.
                  </p>
                </div>

                <button
                  onClick={handlePropose}
                  disabled={saving || interpretation.trim().length === 0}
                  className="w-full flex items-center justify-center gap-2 bg-gold hover:bg-amber-400 text-navy font-black px-6 py-3 rounded-xl transition-colors disabled:opacity-50 uppercase tracking-wide"
                >
                  {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
                  Send to Person
                </button>
              </div>
            ) : (
              <div className="bg-white rounded-xl shadow-sm p-8 text-center">
                <MessageSquare className="w-10 h-10 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-400">Select a narration to review.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}

import { useState } from 'react';
import { Check, Plus, Trash2, Edit, Loader2, ListChecks } from 'lucide-react';
import type { ProposedNeed } from '../../services/narrationService';

interface NeedReviewProps {
  proposedNeeds: ProposedNeed[];
  onConfirm: (reviewedNeeds: ProposedNeed[]) => Promise<void>;
  onBack: () => void;
}

export default function NeedReview({ proposedNeeds, onConfirm, onBack }: NeedReviewProps) {
  const [needs, setNeeds] = useState<ProposedNeed[]>(proposedNeeds.map((n) => ({ ...n })));
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [adding, setAdding] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newDescription, setNewDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleRemove = (index: number) => {
    setNeeds(needs.filter((_, i) => i !== index));
  };

  const handleStartEdit = (index: number) => {
    setEditingIndex(index);
    setEditTitle(needs[index].title);
    setEditDescription(needs[index].description ?? '');
  };

  const handleSaveEdit = () => {
    if (editingIndex === null || editTitle.trim().length === 0) return;
    const updated = [...needs];
    updated[editingIndex] = {
      title: editTitle.trim(),
      description: editDescription.trim().length > 0 ? editDescription.trim() : null,
    };
    setNeeds(updated);
    setEditingIndex(null);
  };

  const handleAdd = () => {
    if (newTitle.trim().length === 0) return;
    setNeeds([...needs, { title: newTitle.trim(), description: newDescription.trim().length > 0 ? newDescription.trim() : null }]);
    setNewTitle('');
    setNewDescription('');
    setAdding(false);
  };

  const handleConfirm = async () => {
    if (needs.length === 0) return;
    setLoading(true);
    setError(null);
    try {
      await onConfirm(needs);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-lg p-6 md:p-8">
      <div className="flex items-center gap-3 mb-2">
        <ListChecks className="w-6 h-6 text-gold" />
        <h2 className="text-xl font-bold text-navy">Here are the needs we'll use to organize your NextUp.</h2>
      </div>
      <p className="text-gray-500 mb-6 leading-relaxed">
        Review these before we create them. You can edit, remove, or add to this list.
      </p>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg p-3 text-sm mb-4">
          {error}
        </div>
      )}

      <div className="space-y-3 mb-4">
        {needs.length === 0 && (
          <p className="text-gray-400 text-sm text-center py-4">No needs in the list. Add one below.</p>
        )}
        {needs.map((need, index) => (
          <div key={index} className="flex items-start gap-3 p-3 rounded-xl border border-gray-100 hover:border-gray-200 transition-colors">
            <div className="w-8 h-8 bg-gold/10 rounded-lg flex items-center justify-center flex-shrink-0">
              <span className="text-sm font-bold text-gold">{index + 1}</span>
            </div>
            {editingIndex === index ? (
              <div className="flex-1 space-y-2">
                <input
                  type="text"
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  className="w-full rounded-lg border-2 border-gray-200 focus:border-gold px-3 py-2 text-sm"
                  autoFocus
                />
                <textarea
                  value={editDescription}
                  onChange={(e) => setEditDescription(e.target.value)}
                  placeholder="Description (optional)"
                  rows={2}
                  className="w-full rounded-lg border-2 border-gray-200 focus:border-gold px-3 py-2 text-sm resize-y"
                />
                <div className="flex gap-2">
                  <button
                    onClick={handleSaveEdit}
                    disabled={editTitle.trim().length === 0}
                    className="flex items-center gap-1 bg-gold hover:bg-amber-400 text-navy font-semibold px-3 py-1.5 rounded-lg text-sm transition-colors disabled:opacity-50"
                  >
                    <Check className="w-4 h-4" /> Save
                  </button>
                  <button
                    onClick={() => setEditingIndex(null)}
                    className="bg-gray-100 hover:bg-gray-200 text-navy font-medium px-3 py-1.5 rounded-lg text-sm transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-navy text-sm">{need.title}</p>
                  {need.description && (
                    <p className="text-gray-500 text-xs mt-1 leading-relaxed">{need.description}</p>
                  )}
                </div>
                <button
                  onClick={() => handleStartEdit(index)}
                  disabled={loading}
                  className="text-gray-400 hover:text-gold transition-colors p-1"
                >
                  <Edit className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleRemove(index)}
                  disabled={loading}
                  className="text-gray-400 hover:text-red-500 transition-colors p-1"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </>
            )}
          </div>
        ))}
      </div>

      {adding ? (
        <div className="space-y-2 p-3 rounded-xl border-2 border-gold/30 bg-gold/5">
          <input
            type="text"
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
            placeholder="What do you need?"
            className="w-full rounded-lg border-2 border-gray-200 focus:border-gold px-3 py-2 text-sm"
            autoFocus
          />
          <textarea
            value={newDescription}
            onChange={(e) => setNewDescription(e.target.value)}
            placeholder="Description (optional)"
            rows={2}
            className="w-full rounded-lg border-2 border-gray-200 focus:border-gold px-3 py-2 text-sm resize-y"
          />
          <div className="flex gap-2">
            <button
              onClick={handleAdd}
              disabled={newTitle.trim().length === 0}
              className="flex items-center gap-1 bg-gold hover:bg-amber-400 text-navy font-semibold px-3 py-1.5 rounded-lg text-sm transition-colors disabled:opacity-50"
            >
              <Plus className="w-4 h-4" /> Add
            </button>
            <button
              onClick={() => { setAdding(false); setNewTitle(''); setNewDescription(''); }}
              className="bg-gray-100 hover:bg-gray-200 text-navy font-medium px-3 py-1.5 rounded-lg text-sm transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      ) : (
        !loading && (
          <button
            onClick={() => setAdding(true)}
            className="flex items-center gap-1.5 text-gold hover:text-amber-500 font-medium text-sm transition-colors"
          >
            <Plus className="w-4 h-4" /> Add a need
          </button>
        )
      )}

      <div className="flex flex-col sm:flex-row gap-3 mt-6 pt-6 border-t border-gray-100">
        <button
          onClick={handleConfirm}
          disabled={loading || needs.length === 0}
          className="flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 text-white font-bold px-6 py-3 rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Check className="w-5 h-5" />}
          Confirm Needs
        </button>
        <button
          onClick={onBack}
          disabled={loading}
          className="bg-gray-100 hover:bg-gray-200 text-navy font-semibold px-6 py-3 rounded-xl transition-colors disabled:opacity-50"
        >
          Back
        </button>
      </div>
    </div>
  );
}

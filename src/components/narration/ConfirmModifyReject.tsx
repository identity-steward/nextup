import { useState } from 'react';
import { Check, Edit, X, Loader2 } from 'lucide-react';
import type { PersonNarration } from '../../types/narration';

interface ConfirmModifyRejectProps {
  narration: PersonNarration;
  onConfirm: (interpretation: string) => Promise<void>;
  onModify: (interpretation: string) => Promise<void>;
  onReject: () => Promise<void>;
}

export default function ConfirmModifyReject({
  narration,
  onConfirm,
  onModify,
  onReject,
}: ConfirmModifyRejectProps) {
  const [mode, setMode] = useState<'choose' | 'editing'>('choose');
  const [modifiedText, setModifiedText] = useState(narration.proposed_interpretation ?? '');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleConfirm = async () => {
    setLoading(true);
    setError(null);
    try {
      await onConfirm(narration.proposed_interpretation ?? '');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  const handleModifySubmit = async () => {
    setLoading(true);
    setError(null);
    try {
      await onModify(modifiedText);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  const handleReject = async () => {
    setLoading(true);
    setError(null);
    try {
      await onReject();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl p-4 text-sm">
        {error}
      </div>
    );
  }

  if (mode === 'editing') {
    return (
      <div className="bg-white rounded-2xl shadow-lg p-6 md:p-8">
        <h3 className="text-lg font-bold text-navy mb-2">What would you change?</h3>
        <p className="text-sm text-gray-500 mb-4">
          Edit NextUp's understanding below. Your original words stay unchanged.
        </p>
        <textarea
          value={modifiedText}
          onChange={(e) => setModifiedText(e.target.value)}
          rows={6}
          className="w-full rounded-xl border-2 border-gray-200 focus:border-gold p-4 text-gray-800 leading-relaxed resize-y"
        />
        <div className="flex gap-3 mt-4">
          <button
            onClick={handleModifySubmit}
            disabled={loading || modifiedText.trim().length === 0}
            className="flex items-center gap-2 bg-gold hover:bg-amber-400 text-navy font-black px-6 py-3 rounded-xl transition-colors disabled:opacity-50 uppercase tracking-wide"
          >
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Check className="w-5 h-5" />}
            Save Changes
          </button>
          <button
            onClick={() => setMode('choose')}
            disabled={loading}
            className="bg-gray-100 hover:bg-gray-200 text-navy font-semibold px-6 py-3 rounded-xl transition-colors"
          >
            Cancel
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow-lg p-6 md:p-8">
      <h3 className="text-xl font-bold text-navy mb-2">Does this sound right?</h3>
      <p className="text-gray-500 mb-6 leading-relaxed">
        Choose what happens next. You can confirm, change what NextUp understood,
        or let us know this doesn't capture it.
      </p>
      <div className="grid sm:grid-cols-3 gap-4">
        <button
          onClick={handleConfirm}
          disabled={loading}
          className="flex flex-col items-center gap-2 bg-green-50 hover:bg-green-100 border-2 border-green-200 hover:border-green-300 rounded-xl p-6 transition-all disabled:opacity-50"
        >
          <Check className="w-8 h-8 text-green-600" />
          <span className="font-bold text-green-700">Confirm</span>
          <span className="text-xs text-gray-500 text-center">This sounds right</span>
        </button>
        <button
          onClick={() => setMode('editing')}
          disabled={loading}
          className="flex flex-col items-center gap-2 bg-gold/10 hover:bg-gold/20 border-2 border-gold/30 hover:border-gold/50 rounded-xl p-6 transition-all disabled:opacity-50"
        >
          <Edit className="w-8 h-8 text-gold" />
          <span className="font-bold text-navy">Modify</span>
          <span className="text-xs text-gray-500 text-center">Change what we heard</span>
        </button>
        <button
          onClick={handleReject}
          disabled={loading}
          className="flex flex-col items-center gap-2 bg-gray-50 hover:bg-gray-100 border-2 border-gray-200 hover:border-gray-300 rounded-xl p-6 transition-all disabled:opacity-50"
        >
          <X className="w-8 h-8 text-gray-500" />
          <span className="font-bold text-gray-600">Reject</span>
          <span className="text-xs text-gray-500 text-center">This doesn't capture it</span>
        </button>
      </div>
      {loading && (
        <div className="flex items-center justify-center gap-2 mt-4 text-gray-500">
          <Loader2 className="w-5 h-5 animate-spin" />
          <span className="text-sm">Saving your response...</span>
        </div>
      )}
    </div>
  );
}

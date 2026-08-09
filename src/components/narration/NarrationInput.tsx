import { useState, useEffect } from 'react';
import { Loader2, Send, Save } from 'lucide-react';
import type { PersonNarration } from '../../types/narration';

interface NarrationInputProps {
  personId: string;
  householdId: string | null;
  existingNarration: PersonNarration | null;
  onSubmitted: (narration: PersonNarration) => void;
  onDraftSaved: (narration: PersonNarration) => void;
}

export default function NarrationInput({
  personId,
  householdId,
  existingNarration,
  onSubmitted,
  onDraftSaved,
}: NarrationInputProps) {
  const [text, setText] = useState('');
  const [narrationId, setNarrationId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [status, setStatus] = useState<'idle' | 'draft' | 'submitted'>('idle');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (existingNarration) {
      setText(existingNarration.original_text);
      setNarrationId(existingNarration.id);
      setStatus(existingNarration.status === 'draft' ? 'draft' : 'submitted');
    }
  }, [existingNarration]);

  const handleSaveDraft = async () => {
    if (text.trim().length === 0) return;
    setSaving(true);
    setError(null);
    try {
      const { saveNarrationDraft } = await import('../../services/narrationService');
      const narration = await saveNarrationDraft(personId, householdId, text.trim());
      setNarrationId(narration.id);
      setStatus('draft');
      onDraftSaved(narration);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not save draft');
    } finally {
      setSaving(false);
    }
  };

  const handleSubmit = async () => {
    if (text.trim().length === 0) return;
    setSubmitting(true);
    setError(null);
    try {
      const { saveNarrationDraft, submitNarration } = await import('../../services/narrationService');
      let id = narrationId;
      if (!id) {
        const draft = await saveNarrationDraft(personId, householdId, text.trim());
        id = draft.id;
        setNarrationId(id);
      }
      const submitted = await submitNarration(id);
      setStatus('submitted');
      onSubmitted(submitted);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not submit story');
    } finally {
      setSubmitting(false);
    }
  };

  const isReadOnly = status === 'submitted' || (!!existingNarration && existingNarration.status !== 'draft');

  return (
    <div className="bg-white rounded-2xl shadow-lg p-6 md:p-8">
      <h2 className="text-2xl font-bold text-navy mb-2">Tell Your Story</h2>
      <p className="text-gray-500 mb-6 leading-relaxed">
        Start wherever makes sense. You don't need to know what program you need.
      </p>

      <textarea
        value={text}
        onChange={(e) => { setText(e.target.value); if (status === 'idle') setStatus('idle'); }}
        disabled={isReadOnly}
        placeholder="What's happening?"
        rows={8}
        className="w-full rounded-xl border-2 border-gray-200 focus:border-gold p-4 text-gray-800 leading-relaxed resize-y text-lg disabled:bg-gray-50 disabled:text-gray-500 transition-colors"
        style={{ lineHeight: '1.6' }}
      />

      <div className="flex items-center justify-between mt-3">
        <span className="text-sm text-gray-400">{text.length} characters</span>
        {status === 'draft' && (
          <span className="text-sm text-gray-400">Draft saved</span>
        )}
        {status === 'submitted' && (
          <span className="text-sm text-green-600 font-medium">Submitted — we're reviewing what you shared</span>
        )}
      </div>

      {error && (
        <div className="mt-4 bg-red-50 border border-red-200 text-red-700 rounded-lg p-3 text-sm">
          {error}
        </div>
      )}

      {!isReadOnly && (
        <div className="flex flex-col sm:flex-row gap-3 mt-6">
          <button
            onClick={handleSaveDraft}
            disabled={saving || text.trim().length === 0}
            className="flex items-center justify-center gap-2 bg-gray-100 hover:bg-gray-200 text-navy font-semibold px-6 py-3 rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
            Save Draft
          </button>
          <button
            onClick={handleSubmit}
            disabled={submitting || text.trim().length === 0}
            className="flex items-center justify-center gap-2 bg-gold hover:bg-amber-400 text-navy font-black px-6 py-3 rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed uppercase tracking-wide"
          >
            {submitting ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
            Submit
          </button>
        </div>
      )}
    </div>
  );
}

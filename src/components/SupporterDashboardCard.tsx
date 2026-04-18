import { useEffect, useState } from 'react';
import { CheckCircle, Star } from 'lucide-react';
import { supabase } from '../lib/supabase';

interface SupportAccess {
  status: string;
  support_plan_id: string | null;
  ends_at: string | null;
}

export default function SupporterDashboardCard() {
  const [access, setAccess] = useState<SupportAccess | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user?.email) { setLoading(false); return; }

      const { data } = await supabase
        .from('support_access')
        .select('status, support_plan_id, ends_at')
        .eq('status', 'active')
        .maybeSingle();

      setAccess(data ?? null);
      setLoading(false);
    }
    load();
  }, []);

  if (loading || !access) return null;

  return (
    <div
      className="rounded-2xl border p-5"
      style={{
        background: 'linear-gradient(135deg, rgba(16,185,129,0.08), rgba(16,185,129,0.03))',
        borderColor: 'rgba(16,185,129,0.25)',
      }}
    >
      <div className="flex items-center gap-2 mb-3">
        <div className="w-7 h-7 rounded-lg bg-emerald-500/15 border border-emerald-500/25 flex items-center justify-center">
          <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />
        </div>
        <p className="text-emerald-400 text-xs font-black uppercase tracking-[0.14em]">Active Supporter</p>
      </div>
      <div className="flex items-center gap-2">
        <Star className="w-4 h-4 text-amber-400" fill="currentColor" />
        <p className="text-white/70 text-sm">
          Thank you for supporting Jacob's journey.
        </p>
      </div>
      {access.ends_at && (
        <p className="text-white/25 text-[11px] mt-2">
          Access through {new Date(access.ends_at).toLocaleDateString()}
        </p>
      )}
    </div>
  );
}

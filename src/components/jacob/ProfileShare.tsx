import { useState } from 'react';
import { Share2, Copy, Users, CheckCircle } from 'lucide-react';

export default function ProfileShare() {
  const [copied, setCopied] = useState(false);

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <section className="relative py-14 border-t overflow-hidden" style={{ background: '#070a10', borderColor: 'rgba(255,255,255,0.05)' }}>
      <div className="max-w-xl mx-auto px-6 lg:px-8 text-center">
        <div className="flex items-center gap-3 mb-6 justify-center">
          <Share2 className="w-4 h-4 text-sky-400" />
          <p className="text-sky-400 text-xs font-black uppercase tracking-widest">Spread the Word</p>
        </div>
        <h2 className="text-2xl md:text-3xl font-black text-white mb-2">Help Jacob Get Seen</h2>
        <p className="text-gray-500 text-sm mb-8">
          Share with family, friends, and anyone who believes in Memphis youth sports.
        </p>

        <div className="grid grid-cols-3 gap-3">
          <button
            onClick={handleCopyLink}
            className={`flex flex-col items-center gap-2.5 py-5 px-3 rounded-xl border transition-all duration-200 ${
              copied
                ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                : 'bg-white/[0.04] border-white/8 text-white/50 hover:border-sky-500/30 hover:text-white/80 hover:bg-white/7'
            }`}
          >
            {copied ? <CheckCircle className="w-5 h-5" /> : <Copy className="w-5 h-5" />}
            <span className="font-bold text-xs">{copied ? 'Copied!' : 'Copy Link'}</span>
          </button>

          <button className="flex flex-col items-center gap-2.5 py-5 px-3 rounded-xl border bg-white/[0.04] border-white/8 text-white/50 hover:border-sky-500/30 hover:text-white/80 hover:bg-white/7 transition-all duration-200">
            <Share2 className="w-5 h-5" />
            <span className="font-bold text-xs">Share Profile</span>
          </button>

          <button className="flex flex-col items-center gap-2.5 py-5 px-3 rounded-xl border bg-white/[0.04] border-white/8 text-white/50 hover:border-sky-500/30 hover:text-white/80 hover:bg-white/7 transition-all duration-200">
            <Users className="w-5 h-5" />
            <span className="font-bold text-xs">Send to Family</span>
          </button>
        </div>
      </div>
    </section>
  );
}

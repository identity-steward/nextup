import { useState } from 'react';
import { Heart, Shield, Calendar, Users, Target, CheckCircle } from 'lucide-react';
import { STRIPE_LINKS } from '../../config/stripeLinks';
import SupporterDashboardCard from '../SupporterDashboardCard';

interface ProfileSupportProps {
  raised: number;
  goal: number;
  supporters: number;
  progressPct: number;
  stillNeeded: number;
}

const AMOUNT_TO_STRIPE_LINK: Record<number, string | null> = {
  5:  STRIPE_LINKS.SUPPORT_JACOB_5,
  10: STRIPE_LINKS.SUPPORT_JACOB_10,
  25: STRIPE_LINKS.SUPPORT_JACOB_GIFT_25,
};

export default function ProfileSupport({ raised, goal, supporters, progressPct, stillNeeded }: ProfileSupportProps) {
  const [customAmount, setCustomAmount] = useState('');
  const [selectedAmount, setSelectedAmount] = useState<number | null>(10);

  const displayAmount = customAmount || selectedAmount || 10;
  const stripeLink = !customAmount && selectedAmount ? AMOUNT_TO_STRIPE_LINK[selectedAmount] ?? STRIPE_LINKS.SUPPORT_JACOB_10 : STRIPE_LINKS.SUPPORT_JACOB_10;

  return (
    <section id="support" className="relative py-20 scroll-mt-16 overflow-hidden" style={{ background: '#1c2028' }}>

      {/* Section separator */}
      <div className="absolute top-0 left-0 right-0 h-px" style={{ background: 'linear-gradient(90deg, transparent, rgba(245,158,11,0.4), transparent)' }} />

      {/* Background glow */}
      <div
        className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[600px] pointer-events-none"
        style={{ background: 'radial-gradient(ellipse at center, rgba(245,158,11,0.07) 0%, transparent 70%)' }}
      />

      <div className="relative max-w-5xl mx-auto px-6 lg:px-8">

        {/* Header */}
        <div className="mb-12 text-center lg:text-left">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-0.5 h-8 rounded-full" style={{ background: 'linear-gradient(to bottom, #fbbf24, rgba(245,158,11,0.2))', boxShadow: '0 0 10px rgba(245,158,11,0.6)' }} />
            <p className="text-amber-400 text-[10px] font-black uppercase tracking-[0.2em]">Direct Support</p>
          </div>
          <h2 className="text-4xl md:text-5xl font-black text-white leading-none tracking-tight mb-4">
            Support Jacob's
            <br />
            <span className="text-transparent bg-clip-text" style={{ backgroundImage: 'linear-gradient(90deg, #fbbf24, #f59e0b)' }}>
              Journey
            </span>
          </h2>
          <p className="text-white/55 text-base max-w-md mx-auto lg:mx-0 leading-relaxed">
            Support helps fund training, travel, and development opportunities — giving Jacob access to the stages where scouts and coaches pay attention.
          </p>
        </div>

        {/* Two-column layout */}
        <div className="grid lg:grid-cols-[1fr_400px] gap-8 items-start">

          {/* LEFT — Context & trust */}
          <div className="space-y-5">

            {/* Goal urgency banner */}
            <div className="relative overflow-hidden rounded-2xl border border-rose-500/25 bg-rose-500/8 p-5">
              <div className="absolute top-0 right-0 w-32 h-32 rounded-full opacity-20"
                style={{ background: 'radial-gradient(circle, rgba(244,63,94,0.5) 0%, transparent 70%)', transform: 'translate(40%, -40%)' }}
              />
              <div className="flex items-center gap-2 mb-2">
                <Calendar className="w-4 h-4 text-rose-400" />
                <p className="text-rose-300 text-xs font-black uppercase tracking-[0.14em]">Competing April 18–19</p>
              </div>
              <p className="text-white font-bold text-base">Memphis AAU Spring Invitational</p>
              <p className="text-white/40 text-sm mt-1">Travel fees due before tournament day</p>
            </div>

            {/* Stats row */}
            <div className="grid grid-cols-3 gap-3">
              {[
                { icon: Heart, value: `$${raised}`, label: 'Raised', color: 'text-amber-400' },
                { icon: Target, value: `$${goal}`, label: 'Goal', color: 'text-white' },
                { icon: Users, value: String(supporters), label: 'Supporters', color: 'text-emerald-400' },
              ].map(({ icon: Icon, value, label, color }) => (
                <div key={label} className="bg-white/[0.04] border border-white/8 rounded-2xl p-4 text-center hover:border-white/14 transition-colors">
                  <Icon className={`w-4 h-4 mx-auto mb-2 ${color}`} />
                  <p className={`text-xl font-black leading-none mb-1 ${color}`}>{value}</p>
                  <p className="text-[10px] text-white/25 uppercase tracking-wider">{label}</p>
                </div>
              ))}
            </div>

            {/* Progress bar */}
            <div className="bg-white/[0.04] border border-white/8 rounded-2xl p-5">
              <div className="flex items-center justify-between mb-3">
                <span className="text-white/50 text-xs font-bold uppercase tracking-wider">Progress</span>
                <span className="text-amber-400 text-sm font-black">{progressPct}% funded</span>
              </div>
              <div className="h-3 bg-white/6 rounded-full overflow-hidden mb-3">
                <div
                  className="h-full rounded-full relative overflow-hidden"
                  style={{
                    width: `${progressPct}%`,
                    background: 'linear-gradient(90deg, #d97706, #fbbf24)',
                    boxShadow: '0 0 12px rgba(245,158,11,0.6)',
                  }}
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/25 to-transparent animate-pulse" />
                </div>
              </div>
              <p className="text-white/30 text-xs">${stillNeeded} still needed to reach the goal</p>
            </div>

            {/* Supporter dashboard — only shown if user has active support */}
            <SupporterDashboardCard />

            {/* Trust signals */}
            <div className="bg-white/[0.03] border border-white/8 rounded-2xl p-5 space-y-3">
              <p className="text-white/30 text-[10px] font-black uppercase tracking-[0.16em] mb-4">Why you can trust this</p>
              {[
                { icon: Shield, label: 'Secure support', desc: 'All transactions are encrypted and protected' },
                { icon: CheckCircle, label: 'Family-approved platform', desc: 'A verified guardian manages this athlete account' },
                { icon: Heart, label: 'Built for athlete development', desc: 'Funds go directly to training, travel, and fees' },
              ].map(({ icon: Icon, label, desc }) => (
                <div key={label} className="flex items-start gap-3">
                  <div className="w-7 h-7 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Icon className="w-3.5 h-3.5 text-emerald-400" />
                  </div>
                  <div>
                    <p className="text-white/65 text-xs font-bold">{label}</p>
                    <p className="text-white/25 text-[11px] mt-0.5">{desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* RIGHT — Donation widget */}
          <div className="relative">
            {/* Card glow */}
            <div
              className="absolute -inset-4 rounded-3xl pointer-events-none"
              style={{ background: 'radial-gradient(ellipse at center, rgba(245,158,11,0.1) 0%, transparent 70%)' }}
            />

            <div
              className="relative rounded-2xl overflow-hidden"
              style={{
                background: '#222838',
                border: '1px solid rgba(245,158,11,0.18)',
                boxShadow: '0 0 0 1px rgba(255,255,255,0.03), 0 24px 80px rgba(0,0,0,0.7), 0 0 40px rgba(245,158,11,0.06)',
              }}
            >
              {/* Top neon edge on card */}
              <div className="absolute top-0 left-0 right-0 h-px" style={{ background: 'linear-gradient(90deg, transparent, rgba(245,158,11,0.5), transparent)' }} />

              {/* Card header */}
              <div className="px-6 py-4 border-b flex items-center justify-between" style={{ borderColor: 'rgba(255,255,255,0.05)', background: 'linear-gradient(90deg, rgba(245,158,11,0.06), transparent)' }}>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
                  <span className="text-white text-sm font-black">Support Jacob</span>
                </div>
                <span className="text-[10px] font-black uppercase tracking-wider text-amber-400 bg-amber-500/12 border border-amber-500/25 px-2.5 py-1 rounded-full">
                  Goal Active
                </span>
              </div>

              <div className="p-6">
                {/* Amount selector label */}
                <p className="text-white/40 text-[11px] font-black uppercase tracking-[0.16em] mb-4">Choose an amount</p>

                {/* Preset amounts */}
                <div className="grid grid-cols-3 gap-2.5 mb-3">
                  {[5, 10, 25].map((amt) => (
                    <button
                      key={amt}
                      onClick={() => { setSelectedAmount(amt); setCustomAmount(''); }}
                      className={`relative py-4 rounded-xl font-black text-xl transition-all duration-200 border ${
                        selectedAmount === amt && !customAmount
                          ? 'text-white border-amber-400/60 scale-[1.04]'
                          : 'bg-white/[0.04] border-white/8 text-white/60 hover:border-amber-500/30 hover:text-white/90'
                      }`}
                      style={selectedAmount === amt && !customAmount ? {
                        background: 'linear-gradient(135deg, #d97706, #f59e0b)',
                        boxShadow: '0 0 20px rgba(245,158,11,0.5)',
                      } : {}}
                    >
                      ${amt}
                      {amt === 10 && (
                        <span className="absolute -top-2.5 left-1/2 -translate-x-1/2 bg-amber-500 text-white text-[9px] font-black px-2 py-0.5 rounded-full uppercase tracking-wider whitespace-nowrap">
                          Popular
                        </span>
                      )}
                    </button>
                  ))}
                </div>

                {/* Custom amount */}
                <div className="relative mb-6">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-white/25 font-bold">$</span>
                  <input
                    type="number"
                    min="1"
                    placeholder="Custom amount"
                    value={customAmount}
                    onChange={(e) => { setCustomAmount(e.target.value); setSelectedAmount(null); }}
                    className="w-full bg-white/[0.04] border border-white/8 focus:border-amber-500/50 focus:bg-white/[0.06] rounded-xl pl-8 pr-4 py-3.5 text-white font-bold placeholder:text-white/20 outline-none transition-all text-sm"
                  />
                </div>

                {/* Primary CTA */}
                {stripeLink ? (
                  <a
                    href={stripeLink}
                    className="group relative w-full text-white font-black text-lg py-6 rounded-2xl transition-all duration-300 uppercase tracking-[0.08em] flex items-center justify-center gap-3 mb-3 overflow-hidden active:scale-[0.98]"
                    style={{
                      background: 'linear-gradient(135deg, #d97706, #f59e0b)',
                      boxShadow: '0 0 40px rgba(245,158,11,0.55), 0 6px 20px rgba(0,0,0,0.5)',
                    }}
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/15 to-transparent translate-x-[-200%] group-hover:translate-x-[200%] transition-transform duration-700" />
                    <Heart className="w-5 h-5 flex-shrink-0" fill="white" />
                    Support Jacob &mdash; ${displayAmount}
                  </a>
                ) : (
                  <button
                    disabled
                    className="group relative w-full text-white font-black text-lg py-6 rounded-2xl opacity-50 cursor-not-allowed uppercase tracking-[0.08em] flex items-center justify-center gap-3 mb-3"
                    style={{ background: 'linear-gradient(135deg, #d97706, #f59e0b)' }}
                  >
                    Coming Soon
                  </button>
                )}

                <p className="text-center text-[11px] text-white/25 flex items-center justify-center gap-1.5 py-1">
                  <Shield className="w-3 h-3 text-emerald-500/60" />
                  Secure &bull; Family-approved &bull; Athlete development only
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

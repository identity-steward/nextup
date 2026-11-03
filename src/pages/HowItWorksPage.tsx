import { Link } from 'react-router-dom';
import {
  Search, FileText, Network, Zap, TrendingUp, Rocket,
  ArrowRight, ChevronRight, Lock, Send, Info, User, Clock, ShieldCheck,
  Eye, Compass, BookOpen,
} from 'lucide-react';
import HowItWorks from '../components/HowItWorks';

const journeySteps = [
  { num: '01', label: 'IDENTIFY', icon: Search, desc: 'A story becomes evidence. Document what is happening.' },
  { num: '02', label: 'DOCUMENT', icon: FileText, desc: 'Evidence reveals needs, assets, and eligibility.' },
  { num: '03', label: 'CONNECT', icon: Network, desc: 'Connections to people and systems enable action.' },
  { num: '04', label: 'ACT', icon: Zap, desc: 'Authority, consent, and referrals move things forward.' },
  { num: '05', label: 'TRACK', icon: TrendingUp, desc: 'Documented outcomes build a record of momentum.' },
  { num: '06', label: 'GROW', icon: Rocket, desc: 'Accumulated outcomes open new pathways forward.' },
];

const operationalFeatures = [
  {
    icon: Search,
    title: 'Athlete Discovery',
    description: 'Browse youth athlete profiles on the Explore page. Each profile tells the story behind the performance — sport, school, traits, and goals.',
  },
  {
    icon: FileText,
    title: 'Documented Journeys',
    description: 'Athletes build a journey record over time — milestones, achievements, and updates that create a portable narrative of growth.',
  },
  {
    icon: User,
    title: 'Parent Intake',
    description: 'Parents submit a structured intake form with athlete details, support needs, and consent. Administrators review each submission manually before any next step.',
  },
  {
    icon: Lock,
    title: 'Privacy & Consent Controls',
    description: 'Guardian consent is tracked separately from profile data. Sharing is logged — what was shared, why, who received it, when, and who recorded it.',
  },
];

const plannedFeatures = [
  { icon: Compass, title: 'Navigator Workflows', desc: 'Guided pathways connecting families to resources and organizations.' },
  { icon: TrendingUp, title: 'Outcome Tracking', desc: 'Long-term tracking of documented outcomes across pathways.' },
  { icon: Rocket, title: 'Pathway Growth', desc: 'Accumulated outcomes opening new opportunities over time.' },
];

const privacyFacts = [
  { icon: Send, label: 'What was shared', value: 'See the specific information included in each disclosure.' },
  { icon: Info, label: 'Why it was shared', value: 'Understand the purpose behind every sharing event.' },
  { icon: User, label: 'Who received it', value: 'Know exactly which recipient received your information.' },
  { icon: Clock, label: 'When it was delivered', value: 'Track the timing of every delivery.' },
  { icon: ShieldCheck, label: 'Who recorded delivery', value: 'See which navigator recorded the delivery and how.' },
];

export function HowItWorksPage() {
  return (
    <div className="bg-navy-900">
      {/* Hero */}
      <section className="relative pt-32 pb-20 lg:pt-40 lg:pb-28 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-navy-950 via-navy-900 to-navy-900" />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-blue-600/10 blur-[120px] rounded-full" />

        <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center gap-2 bg-blue-600/20 border border-blue-300/35 text-blue-100 px-4 py-2 rounded-full text-xs font-bold uppercase tracking-widest mb-6">
            <Eye className="w-3.5 h-3.5" />
            How It Works
          </div>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-white tracking-tight mb-6 leading-tight">
            The right information.{' '}
            <span className="text-gradient-blue">The right destination.</span>{' '}
            The right time.
          </h1>
          <p className="text-lg sm:text-xl text-navy-200 leading-relaxed max-w-2xl mx-auto">
            NextUp helps youth athletes, families, and supporters turn stories into
            documented pathways. Here's how the model works — and what's operational today.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 items-center justify-center mt-10">
            <Link
              to="/start"
              className="group flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white font-bold text-base px-8 py-4 rounded-xl transition-all duration-200 hover:scale-105 hover:glow-blue uppercase tracking-wide"
            >
              Get Started
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link
              to="/youth"
              className="group flex items-center gap-2 bg-white/10 hover:bg-white/15 border border-white/30 hover:border-white/50 text-white font-bold text-base px-8 py-4 rounded-xl transition-all duration-200"
            >
              Explore Athletes
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
        </div>
      </section>

      {/* Four-Part Model */}
      <HowItWorks />

      {/* Six-Step Journey */}
      <section className="bg-navy-900 py-20 lg:py-28">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <p className="text-xs font-bold uppercase tracking-widest text-blue-400 mb-3">The NextUp Pathway</p>
            <h2 className="text-4xl sm:text-5xl lg:text-6xl font-black text-white tracking-tight mb-4">
              One Journey.{' '}
              <span className="text-gradient-blue">Connected.</span>
            </h2>
            <p className="text-lg text-navy-200 max-w-2xl mx-auto">
              A story becomes evidence. Evidence reveals needs and eligibility.
              Connections enable action. Documented outcomes build momentum.
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 lg:gap-6">
            {journeySteps.map((step, i) => {
              const Icon = step.icon;
              return (
                <div key={step.num} className="relative group">
                  <div className="bg-white/5 hover:bg-white/10 rounded-2xl p-6 border border-white/10 hover:border-blue-500/30 transition-all duration-300 h-full">
                    <div className="flex items-center justify-between mb-4">
                      <span className="text-xs font-bold text-blue-400">{step.num}</span>
                      <Icon className="w-6 h-6 text-navy-300 group-hover:text-blue-400 transition-colors" />
                    </div>
                    <h3 className="text-sm font-black tracking-wide text-white mb-2">{step.label}</h3>
                    <p className="text-xs text-navy-300 leading-relaxed">{step.desc}</p>
                  </div>
                  {i < journeySteps.length - 1 && (
                    <ChevronRight className="hidden lg:block absolute top-1/2 -right-4 -translate-y-1/2 w-5 h-5 text-white/15" />
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Operational Today */}
      <section className="bg-white py-20 lg:py-28">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 bg-blue-50 border border-blue-200 text-blue-700 px-3 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest mb-5">
              Operational Today
            </div>
            <h2 className="text-4xl sm:text-5xl font-black text-navy-900 tracking-tight mb-4">
              What You Can Do Right Now
            </h2>
            <p className="text-lg text-gray-500 max-w-2xl mx-auto">
              These features are live and available in the current platform.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8">
            {operationalFeatures.map((feature) => {
              const Icon = feature.icon;
              return (
                <div
                  key={feature.title}
                  className="bg-gray-50 rounded-2xl p-8 border border-gray-100 hover:border-blue-200 hover:shadow-lg transition-all duration-300"
                >
                  <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mb-5">
                    <Icon className="w-6 h-6 text-blue-600" />
                  </div>
                  <h3 className="text-xl font-bold text-navy-900 mb-3">{feature.title}</h3>
                  <p className="text-gray-600 leading-relaxed">{feature.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Planned Features */}
      <section className="bg-gray-50 py-20 lg:py-28">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 bg-navy-100 border border-navy-200 text-navy-700 px-3 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest mb-5">
              Planned
            </div>
            <h2 className="text-4xl sm:text-5xl font-black text-navy-900 tracking-tight mb-4">
              What's Coming
            </h2>
            <p className="text-lg text-gray-500 max-w-2xl mx-auto">
              These capabilities are part of the NextUp model and are in active development.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8 max-w-5xl mx-auto">
            {plannedFeatures.map((feature) => {
              const Icon = feature.icon;
              return (
                <div
                  key={feature.title}
                  className="bg-white rounded-2xl p-8 border-2 border-gray-100 hover:border-navy-200 transition-all duration-300 opacity-90"
                >
                  <div className="w-12 h-12 bg-navy-100 rounded-xl flex items-center justify-center mb-5">
                    <Icon className="w-6 h-6 text-navy-500" />
                  </div>
                  <h3 className="text-lg font-bold text-navy-900 mb-3">{feature.title}</h3>
                  <p className="text-sm text-gray-500 leading-relaxed">{feature.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Privacy & Consent */}
      <section className="bg-navy-900 py-20 lg:py-28">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-navy-800 rounded-2xl p-8 lg:p-12 border border-white/10">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
                <Lock className="w-5 h-5 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-white">You control what's shared.</h3>
            </div>
            <p className="text-navy-200 text-base leading-relaxed mb-8 max-w-2xl">
              Guardian consent is tracked separately from athlete profile data. When
              information is shared, NextUp records exactly what happened so families
              always know where their story went.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
              {privacyFacts.map((fact) => {
                const Icon = fact.icon;
                return (
                  <div key={fact.label} className="bg-white/5 rounded-xl p-4 border border-white/10">
                    <Icon className="w-5 h-5 text-blue-400 mb-3" />
                    <p className="text-xs font-bold text-white mb-1">{fact.label}</p>
                    <p className="text-xs text-navy-300 leading-relaxed">{fact.value}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* Closing CTA */}
      <section className="relative bg-navy-950 py-24 lg:py-32 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-900/20 via-navy-950 to-navy-950" />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-blue-600/10 blur-[120px] rounded-full" />

        <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-xs font-bold uppercase tracking-widest text-blue-400 mb-4">Make the architecture visible</p>
          <h2 className="text-5xl sm:text-6xl lg:text-7xl font-black text-white tracking-tight mb-6 leading-tight">
            Document. Connect.{' '}
            <span className="text-gradient-blue">Convey. Impact.</span>
          </h2>
          <p className="text-lg sm:text-xl text-navy-200 mb-10 max-w-2xl mx-auto">
            NextUp is the infrastructure helping opportunity move. Start your journey today.
          </p>
          <Link
            to="/start"
            className="inline-flex items-center gap-3 bg-blue-600 hover:bg-blue-500 text-white font-black text-lg px-10 py-5 rounded-xl transition-all duration-200 hover:scale-105 hover:glow-blue uppercase tracking-wide"
          >
            Start Your Journey
            <ArrowRight className="w-6 h-6" />
          </Link>
        </div>
      </section>
    </div>
  );
}

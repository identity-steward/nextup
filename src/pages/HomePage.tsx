import { Link } from 'react-router-dom';
import {
  ArrowRight, Search, FileText, Network, Zap, TrendingUp, Rocket,
  Users, Building2, Heart, ShieldCheck, Lock, Clock, User,
  Info, Send, PlayCircle, ChevronRight,
} from 'lucide-react';

// ─── Journey Steps ───────────────────────────────────────────────
const journeySteps = [
  { num: '01', label: 'IDENTIFY', icon: Search, desc: 'A story becomes evidence. Document what is happening.' },
  { num: '02', label: 'DOCUMENT', icon: FileText, desc: 'Evidence reveals needs, assets, and eligibility.' },
  { num: '03', label: 'CONNECT', icon: Network, desc: 'Connections to people and systems enable action.' },
  { num: '04', label: 'ACT', icon: Zap, desc: 'Authority, consent, and referrals move things forward.' },
  { num: '05', label: 'TRACK', icon: TrendingUp, desc: 'Documented outcomes build a record of momentum.' },
  { num: '06', label: 'GROW', icon: Rocket, desc: 'Accumulated outcomes open new pathways forward.' },
];

// ─── Audience Cards ──────────────────────────────────────────────
const audiences = [
  {
    icon: Users,
    title: 'Young People + Families',
    desc: 'Tell your story once. Understand what happens next. Connect to the opportunities, resources, and people positioned to help.',
    cta: 'Get Started',
    path: '/start',
  },
  {
    icon: Building2,
    title: 'Navigators + Organizations',
    desc: 'Work alongside families with clarity. Document needs, build pathways, manage sharing with consent, and track real outcomes.',
    cta: 'How It Works',
    path: '/how-it-works',
  },
  {
    icon: Heart,
    title: 'Community + Partners',
    desc: 'See where your capacity meets real need. NextUp helps opportunity reach the people ready for it.',
    cta: 'About NextUp',
    path: '/about',
  },
];

// ─── Privacy Facts ───────────────────────────────────────────────
const privacyFacts = [
  { icon: Send, label: 'What was shared', value: 'See the specific information included in each disclosure.' },
  { icon: Info, label: 'Why it was shared', value: 'Understand the purpose behind every sharing event.' },
  { icon: User, label: 'Who received it', value: 'Know exactly which recipient received your information.' },
  { icon: Clock, label: 'When it was delivered', value: 'Track the timing of every delivery.' },
  { icon: ShieldCheck, label: 'Who recorded delivery', value: 'See which navigator recorded the delivery and how.' },
];

// ─── Spotlight Cards ─────────────────────────────────────────────
const spotlightItems = [
  {
    title: 'Jacob Fouse',
    category: 'Basketball',
    desc: 'A NextUp athlete profile showcasing the journey, traits, and highlights of a real Memphis youth athlete.',
    path: '/youth/jacob-fouse',
  },
  {
    title: 'Athlete Spotlight',
    category: 'Performance',
    desc: 'Explore athlete profiles that demonstrate how NextUp turns performance into a documented pathway.',
    path: '/youth',
  },
];

export function HomePage() {
  return (
    <div className="bg-navy-900">
      {/* ═══ Section 1: Hero ═══════════════════════════════════════ */}
      <section className="relative min-h-screen flex items-center overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{
            backgroundImage:
              'url(https://images.pexels.com/photos/13980451/pexels-photo-13980451.jpeg?auto=compress&cs=tinysrgb&w=1920&q=80)',
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-r from-navy-950/95 via-navy-900/85 to-navy-900/40" />
        <div className="absolute inset-0 bg-gradient-to-t from-navy-900 via-transparent to-navy-900/30" />

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full pt-28 pb-20">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 bg-blue-600/15 border border-blue-500/30 text-blue-300 px-4 py-2 rounded-full text-xs font-bold uppercase tracking-widest mb-8">
              <span className="w-2 h-2 rounded-full bg-blue-400 animate-pulse" />
              NextUp Network
            </div>

            <h1 className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-black text-white leading-[0.92] tracking-tight mb-6">
              Help Opportunity{' '}
              <span className="text-gradient-blue">Flow.</span>
            </h1>

            <p className="text-lg sm:text-xl md:text-2xl text-gray-200 leading-relaxed mb-5 max-w-2xl font-medium">
              Your story is more than a moment. We help turn what you're doing,
              what you need, and where you're going into a pathway toward opportunity.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center mt-8">
              <Link
                to="/start"
                className="group flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white font-bold text-base px-8 py-4 rounded-xl transition-all duration-200 hover:scale-105 hover:glow-blue uppercase tracking-wide"
              >
                Get Started
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link
                to="/how-it-works"
                className="group flex items-center gap-2 bg-white/10 hover:bg-white/15 border border-white/20 hover:border-white/40 text-white font-bold text-base px-8 py-4 rounded-xl transition-all duration-200"
              >
                Explore NextUp
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
          </div>
        </div>

        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 animate-bounce">
          <div className="w-px h-8 bg-gradient-to-b from-blue-400/60 to-transparent" />
          <div className="w-1.5 h-1.5 rounded-full bg-blue-400/60" />
        </div>
      </section>

      {/* ═══ Section 2: One Journey. Connected. ════════════════════ */}
      <section className="bg-white py-20 lg:py-28">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <p className="text-xs font-bold uppercase tracking-widest text-blue-600 mb-3">The NextUp Pathway</p>
            <h2 className="text-4xl sm:text-5xl lg:text-6xl font-black text-navy-900 tracking-tight mb-4">
              One Journey.{' '}
              <span className="text-gradient-blue">Connected.</span>
            </h2>
            <p className="text-lg text-gray-500 max-w-2xl mx-auto">
              A story becomes evidence. Evidence reveals needs and eligibility.
              Connections enable action. Documented outcomes build momentum.
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 lg:gap-6">
            {journeySteps.map((step, i) => {
              const Icon = step.icon;
              return (
                <div key={step.num} className="relative group">
                  <div className="bg-gray-50 hover:bg-blue-50 rounded-2xl p-6 border border-gray-100 hover:border-blue-200 transition-all duration-300 h-full">
                    <div className="flex items-center justify-between mb-4">
                      <span className="text-xs font-bold text-blue-600">{step.num}</span>
                      <Icon className="w-6 h-6 text-navy-400 group-hover:text-blue-600 transition-colors" />
                    </div>
                    <h3 className="text-sm font-black tracking-wide text-navy-900 mb-2">{step.label}</h3>
                    <p className="text-xs text-gray-500 leading-relaxed">{step.desc}</p>
                  </div>
                  {i < journeySteps.length - 1 && (
                    <ChevronRight className="hidden lg:block absolute top-1/2 -right-4 -translate-y-1/2 w-5 h-5 text-gray-300" />
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ═══ Section 3: Performance ════════════════════════════════ */}
      <section className="bg-navy-900 py-20 lg:py-28 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            <div>
              <p className="text-xs font-bold uppercase tracking-widest text-blue-400 mb-3">Performance</p>
              <h2 className="text-4xl sm:text-5xl lg:text-6xl font-black text-white tracking-tight mb-6">
                Performance is{' '}
                <span className="text-gradient-blue">intelligence in motion.</span>
              </h2>
              <p className="text-lg text-navy-200 leading-relaxed mb-6 max-w-xl">
                Athletics is an important NextUp entry point. A game, a race, a
                performance — these are not just moments. They are evidence of
                effort, growth, and potential. NextUp helps turn that evidence
                into documented pathways toward opportunity.
              </p>
              <p className="text-sm text-navy-300 leading-relaxed mb-8 max-w-xl">
                NextUp is not only an athletics platform. The same pathway
                architecture applies to arts, activities, academics, and
                community development.
              </p>
              <Link
                to="/youth"
                className="inline-flex items-center gap-2 text-blue-400 hover:text-blue-300 font-bold text-sm uppercase tracking-wide transition-colors"
              >
                Explore Athlete Profiles
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>

            <div className="relative">
              <div
                className="aspect-[4/3] rounded-2xl bg-cover bg-center bg-no-repeat border border-white/10"
                style={{
                  backgroundImage:
                    'url(https://images.pexels.com/photos/5586408/pexels-photo-5586408.jpeg?auto=compress&cs=tinysrgb&w=1200&q=80)',
                }}
              />
              <div className="absolute -bottom-6 -left-6 bg-blue-600 text-white rounded-xl p-6 max-w-xs hidden sm:block">
                <PlayCircle className="w-8 h-8 mb-2" />
                <p className="text-sm font-semibold">Athlete profiles showcase the journey — not just the highlights.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══ Section 4: Your NextUp ═════════════════════════════════ */}
      <section className="bg-gray-50 py-20 lg:py-28">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <p className="text-xs font-bold uppercase tracking-widest text-blue-600 mb-3">Product Preview</p>
            <h2 className="text-4xl sm:text-5xl lg:text-6xl font-black text-navy-900 tracking-tight mb-4">
              Your NextUp
            </h2>
            <p className="text-lg text-gray-500 max-w-2xl mx-auto">
              Where am I? What's happening? What should I do next?
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
            {/* Pathway Card */}
            <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm">
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mb-4">
                <TrendingUp className="w-6 h-6 text-blue-600" />
              </div>
              <h3 className="text-lg font-bold text-navy-900 mb-2">Current Pathway</h3>
              <p className="text-sm text-gray-500 leading-relaxed mb-4">
                See the pathway you're on, what stage it's in, and what comes next.
              </p>
              <div className="flex items-center gap-2 text-xs font-semibold text-blue-600">
                <span className="px-2 py-1 bg-blue-50 rounded">Possible</span>
                <ChevronRight className="w-3 h-3" />
                <span className="px-2 py-1 bg-blue-50 rounded">Active</span>
              </div>
            </div>

            {/* Connection Card */}
            <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm">
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mb-4">
                <Network className="w-6 h-6 text-blue-600" />
              </div>
              <h3 className="text-lg font-bold text-navy-900 mb-2">Connections</h3>
              <p className="text-sm text-gray-500 leading-relaxed mb-4">
                See who is connected to your journey — navigators, organizations, and supporters.
              </p>
              <div className="flex items-center gap-2 text-xs text-gray-400">
                <Users className="w-4 h-4" />
                <span>Navigator assigned</span>
              </div>
            </div>

            {/* Next Step Card */}
            <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm">
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mb-4">
                <Zap className="w-6 h-6 text-blue-600" />
              </div>
              <h3 className="text-lg font-bold text-navy-900 mb-2">Next Step</h3>
              <p className="text-sm text-gray-500 leading-relaxed mb-4">
                Know exactly what to do next — no guessing, no waiting in the dark.
              </p>
              <div className="flex items-center gap-2 text-xs font-semibold text-navy-700">
                <ArrowRight className="w-4 h-4 text-blue-600" />
                <span>Approve sharing request</span>
              </div>
            </div>
          </div>

          {/* Privacy Callout */}
          <div className="bg-navy-900 rounded-2xl p-8 lg:p-12">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
                <Lock className="w-5 h-5 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-white">You control what's shared.</h3>
            </div>
            <p className="text-navy-200 text-base leading-relaxed mb-8 max-w-2xl">
              NextUp helps you understand exactly what happened with your information.
              See what was shared, why it was shared, who received it, when it was
              delivered, and who recorded the delivery.
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

      {/* ═══ Section 5: Opportunity Already Exists ═════════════════ */}
      <section className="bg-white py-20 lg:py-28">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <p className="text-xs font-bold uppercase tracking-widest text-blue-600 mb-3">Audience Architecture</p>
            <h2 className="text-4xl sm:text-5xl lg:text-6xl font-black text-navy-900 tracking-tight mb-4">
              Opportunity already exists.
            </h2>
            <p className="text-lg text-gray-500 max-w-2xl mx-auto">
              The challenge is helping it reach people.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
            {audiences.map((audience) => {
              const Icon = audience.icon;
              return (
                <div
                  key={audience.title}
                  className="group bg-gray-50 hover:bg-navy-900 rounded-2xl p-8 border border-gray-100 hover:border-navy-700 transition-all duration-300"
                >
                  <div className="w-14 h-14 bg-blue-600 group-hover:bg-blue-500 rounded-2xl flex items-center justify-center mb-6 transition-colors">
                    <Icon className="w-7 h-7 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-navy-900 group-hover:text-white mb-3 transition-colors">
                    {audience.title}
                  </h3>
                  <p className="text-sm text-gray-500 group-hover:text-navy-200 leading-relaxed mb-6 transition-colors">
                    {audience.desc}
                  </p>
                  <Link
                    to={audience.path}
                    className="inline-flex items-center gap-2 text-sm font-bold text-blue-600 group-hover:text-blue-400 transition-colors"
                  >
                    {audience.cta}
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </Link>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ═══ Section 6: Spotlight ═══════════════════════════════════ */}
      <section className="bg-navy-900 py-20 lg:py-28">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-16">
            <p className="text-xs font-bold uppercase tracking-widest text-blue-400 mb-3">Spotlight</p>
            <h2 className="text-4xl sm:text-5xl lg:text-6xl font-black text-white tracking-tight mb-4">
              Real stories. Real journeys.
            </h2>
            <p className="text-lg text-navy-200 max-w-2xl">
              NextUp stories span basketball, floor hockey, arts, activities,
              milestones, and community development.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8">
            {spotlightItems.map((item) => (
              <Link
                key={item.title}
                to={item.path}
                className="group relative overflow-hidden rounded-2xl border border-white/10 hover:border-blue-500/30 transition-all duration-300"
              >
                <div className="aspect-[16/10] bg-gradient-to-br from-navy-800 to-navy-950 flex flex-col justify-end p-8 group-hover:from-navy-700 group-hover:to-navy-900 transition-all">
                  <span className="inline-block px-3 py-1 bg-blue-600/20 text-blue-300 text-xs font-bold uppercase tracking-wide rounded-full mb-4 w-fit">
                    {item.category}
                  </span>
                  <h3 className="text-2xl font-bold text-white mb-3 group-hover:text-blue-300 transition-colors">
                    {item.title}
                  </h3>
                  <p className="text-sm text-navy-300 leading-relaxed mb-4">{item.desc}</p>
                  <div className="flex items-center gap-2 text-sm font-bold text-blue-400 group-hover:text-blue-300 transition-colors">
                    View Story
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ Section 7: Final CTA ═══════════════════════════════════ */}
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

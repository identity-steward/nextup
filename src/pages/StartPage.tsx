import { Link } from 'react-router-dom';
import { ArrowRight, Heart, UserPlus, Eye, Shield, TrendingUp, Users } from 'lucide-react';

export function StartPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero */}
      <div className="relative overflow-hidden bg-gradient-to-br from-navy-900 via-navy-800 to-navy-900 text-white">
        <div className="absolute inset-0 opacity-30" style={{
          backgroundImage: 'radial-gradient(ellipse at 70% 20%, rgba(56,189,248,0.15) 0%, transparent 50%)',
        }} />
        <div className="relative max-w-5xl mx-auto px-6 lg:px-8 pt-16 pb-20 text-center">
          <p className="text-xs font-bold uppercase tracking-widest text-blue-400 mb-3">Join NextUp</p>
          <h1 className="text-4xl sm:text-5xl font-black mb-4 leading-tight">
            Choose your next step.
          </h1>
          <p className="text-lg text-blue-200 max-w-2xl mx-auto mb-10">
            Tell us how you want to take part in making young people's journeys visible.
          </p>

          {/* Benefit pills */}
          <div className="flex flex-wrap justify-center gap-3 mb-12">
            {[
              { icon: Eye, label: 'Get seen by scouts & coaches' },
              { icon: Shield, label: 'Family-managed & reviewed' },
              { icon: TrendingUp, label: 'Track growth over time' },
              { icon: Users, label: 'Build a supporter community' },
            ].map(({ icon: Icon, label }) => (
              <div key={label} className="inline-flex items-center gap-2 bg-white/8 border border-white/12 rounded-full px-4 py-2 text-sm text-blue-100">
                <Icon className="w-4 h-4 text-blue-400" />
                {label}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Premium profile preview */}
      <div className="max-w-5xl mx-auto px-6 lg:px-8 -mt-8 relative z-10">
        <div className="bg-white rounded-2xl border border-gray-200 shadow-xl overflow-hidden">
          <div className="grid md:grid-cols-2">
            {/* Left — preview content */}
            <div className="p-8 lg:p-10 bg-gradient-to-br from-navy-900 to-navy-800 text-white">
              <div className="inline-flex items-center gap-2 bg-amber-500/15 border border-amber-500/30 rounded-full px-3 py-1 mb-4">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                <span className="text-amber-300 text-[10px] font-black uppercase tracking-widest">Premium Profile Example</span>
              </div>
              <h2 className="text-2xl font-black mb-3 leading-tight">See what a NextUp profile looks like</h2>
              <p className="text-blue-200 text-sm leading-relaxed mb-6">
                Jacob Fouse's profile shows how an athlete's story, highlights, and growth come together in one place — with support options for family, friends, and fans.
              </p>
              <div className="space-y-2.5 mb-8">
                {[
                  'Immersive hero with athlete identity card',
                  'Journey entries documenting growth over time',
                  'Highlight reels and approved media',
                  'Secure support options via Stripe',
                  'Profile update requests for accuracy',
                ].map((feature) => (
                  <div key={feature} className="flex items-start gap-2.5 text-sm text-blue-100">
                    <div className="w-1.5 h-1.5 rounded-full bg-blue-400 mt-1.5 flex-shrink-0" />
                    {feature}
                  </div>
                ))}
              </div>
              <Link
                to="/youth/jacob-f"
                className="inline-flex items-center gap-2 bg-blue-500 hover:bg-blue-400 text-white font-bold text-sm px-6 py-3 rounded-xl transition-all duration-200 group"
              >
                View Jacob's Profile
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>

            {/* Right — visual preview */}
            <div className="relative bg-navy-900 min-h-[300px] flex items-center justify-center p-8">
              <div className="absolute inset-0 opacity-20" style={{
                backgroundImage: 'linear-gradient(rgba(56,189,248,1) 1px, transparent 1px), linear-gradient(90deg, rgba(56,189,248,1) 1px, transparent 1px)',
                backgroundSize: '32px 32px',
              }} />
              <div className="relative text-center">
                <div className="w-20 h-20 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-blue-500/20 to-blue-700/20 border border-blue-500/30 flex items-center justify-center">
                  <UserPlus className="w-10 h-10 text-blue-400" />
                </div>
                <p className="text-white/40 text-xs uppercase tracking-widest mb-2">Your profile could be here</p>
                <p className="text-white font-black text-lg">Custom. Premium. Yours.</p>
                <p className="text-blue-300/50 text-xs mt-2">Built from your story, stats, and highlights</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Entry point cards */}
      <div className="max-w-4xl mx-auto px-6 lg:px-8 py-16">
        <h2 className="text-2xl font-black text-navy-900 text-center mb-2">Get started</h2>
        <p className="text-gray-500 text-center mb-10">Choose the path that fits your role.</p>
        <div className="grid md:grid-cols-2 gap-6">
          <Link to="/signup/player" className="group bg-white rounded-2xl border border-gray-200 hover:border-blue-300 hover:shadow-xl p-8 transition-all">
            <UserPlus className="w-8 h-8 text-blue-600 mb-6" />
            <h3 className="text-2xl font-black text-navy-900 mb-3">Create an athlete profile</h3>
            <p className="text-gray-600 leading-relaxed mb-6">Share an athlete's story so NextUp can review it and help build a public profile.</p>
            <span className="inline-flex items-center gap-2 text-blue-600 font-bold">Get started <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" /></span>
          </Link>
          <Link to="/signup/parent" className="group bg-navy-900 rounded-2xl border border-navy-700 hover:border-blue-400 hover:shadow-xl p-8 transition-all text-white">
            <Heart className="w-8 h-8 text-blue-300 mb-6" />
            <h3 className="text-2xl font-black mb-3">Parent or guardian intake</h3>
            <p className="text-navy-200 leading-relaxed mb-6">Tell us what your young person needs and where NextUp can help connect the journey.</p>
            <span className="inline-flex items-center gap-2 text-blue-300 font-bold">Begin intake <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" /></span>
          </Link>
        </div>

        {/* Sign-in link */}
        <p className="text-center text-gray-500 text-sm mt-8">
          Already have an account?{' '}
          <Link to="/signin" className="text-blue-600 font-bold hover:text-blue-700 transition-colors">
            Sign in
          </Link>
        </p>
      </div>

      {/* Live vs planned */}
      <div className="max-w-4xl mx-auto px-6 lg:px-8 pb-16">
        <div className="bg-white rounded-2xl border border-gray-200 p-8">
          <h3 className="text-lg font-black text-navy-900 mb-6">What's available now</h3>
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <p className="text-xs font-bold uppercase tracking-widest text-emerald-600 mb-3">Live Now</p>
              <ul className="space-y-2">
                {[
                  'Athlete profile creation and review',
                  'Parent/guardian intake form',
                  'Premium profile display with journey entries',
                  'Profile update requests',
                  'Secure support via Stripe (where configured)',
                ].map((item) => (
                  <li key={item} className="flex items-start gap-2 text-sm text-gray-700">
                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-1.5 flex-shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-widest text-amber-600 mb-3">Coming Soon</p>
              <ul className="space-y-2">
                {[
                  'Self-service profile editing for athletes',
                  'Automated profile creation from signup',
                  'Pricing tier comparison page',
                  'Direct messaging with supporters',
                ].map((item) => (
                  <li key={item} className="flex items-start gap-2 text-sm text-gray-500">
                    <div className="w-1.5 h-1.5 rounded-full bg-amber-400 mt-1.5 flex-shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

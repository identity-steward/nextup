import { Link } from 'react-router-dom';
import {
  ArrowRight, Users, Building2, Heart,
} from 'lucide-react';
import FounderStory from '../components/FounderStory';
import WhatWeOffer from '../components/WhatWeOffer';
import ImpactSection from '../components/ImpactSection';
import JoinNextUp from '../components/JoinNextUp';

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
    cta: 'Explore Athletes',
    path: '/youth',
  },
];

export function AboutPage() {
  return (
    <div className="bg-navy-900">
      {/* Hero */}
      <section className="relative pt-32 pb-20 lg:pt-40 lg:pb-28 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-navy-950 via-navy-900 to-navy-900" />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-blue-600/10 blur-[120px] rounded-full" />

        <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center gap-2 bg-blue-600/20 border border-blue-300/35 text-blue-100 px-4 py-2 rounded-full text-xs font-bold uppercase tracking-widest mb-6">
            About NextUp
          </div>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-white tracking-tight mb-6 leading-tight">
            Making youth development{' '}
            <span className="text-gradient-blue">visible and actionable.</span>
          </h1>
          <p className="text-lg sm:text-xl text-navy-200 leading-relaxed max-w-2xl mx-auto">
            NextUp Memphis is a platform that helps young athletes, families, and
            supporters document abilities, track progress, and connect opportunity
            to the people ready for it.
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
              to="/how-it-works"
              className="group flex items-center gap-2 bg-white/10 hover:bg-white/15 border border-white/30 hover:border-white/50 text-white font-bold text-base px-8 py-4 rounded-xl transition-all duration-200"
            >
              How It Works
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
        </div>
      </section>

      {/* Founder Story */}
      <FounderStory />

      {/* Mission Detail */}
      <section className="bg-white py-20 lg:py-28">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <p className="text-xs font-bold uppercase tracking-widest text-blue-600 mb-3">Our Mission</p>
            <h2 className="text-4xl sm:text-5xl font-black text-navy-900 tracking-tight mb-4">
              Visibility meets opportunity.
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-10">
            <div className="text-center">
              <div className="w-14 h-14 bg-blue-100 rounded-2xl flex items-center justify-center mx-auto mb-5">
                <Users className="w-7 h-7 text-blue-600" />
              </div>
              <h3 className="text-lg font-bold text-navy-900 mb-3">Abilities Visible</h3>
              <p className="text-sm text-gray-500 leading-relaxed">
                Athletic profiles, documented journeys, and character traits make
                what a young person can do visible to supporters and organizations.
              </p>
            </div>
            <div className="text-center">
              <div className="w-14 h-14 bg-blue-100 rounded-2xl flex items-center justify-center mx-auto mb-5">
                <ArrowRight className="w-7 h-7 text-blue-600" />
              </div>
              <h3 className="text-lg font-bold text-navy-900 mb-3">Progress Actionable</h3>
              <p className="text-sm text-gray-500 leading-relaxed">
                Journey entries, milestones, and outcomes create a portable record
                of growth that families control and supporters can follow.
              </p>
            </div>
            <div className="text-center">
              <div className="w-14 h-14 bg-blue-100 rounded-2xl flex items-center justify-center mx-auto mb-5">
                <Heart className="w-7 h-7 text-blue-600" />
              </div>
              <h3 className="text-lg font-bold text-navy-900 mb-3">Community Connected</h3>
              <p className="text-sm text-gray-500 leading-relaxed">
                NextUp is a platform — not a service provider. We connect families,
                athletes, and supporters. Independent organizations deliver their
                own programs and services.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* What We Offer */}
      <WhatWeOffer />

      {/* Impact Areas */}
      <ImpactSection />

      {/* Audience Architecture */}
      <section className="bg-white py-20 lg:py-28">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <p className="text-xs font-bold uppercase tracking-widest text-blue-600 mb-3">Who NextUp Serves</p>
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

      {/* Join NextUp */}
      <JoinNextUp />

      {/* Closing CTA */}
      <section className="relative bg-navy-950 py-24 lg:py-32 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-900/20 via-navy-950 to-navy-950" />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-blue-600/10 blur-[120px] rounded-full" />

        <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-xs font-bold uppercase tracking-widest text-blue-400 mb-4">Be part of the journey</p>
          <h2 className="text-5xl sm:text-6xl lg:text-7xl font-black text-white tracking-tight mb-6 leading-tight">
            Help opportunity{' '}
            <span className="text-gradient-blue">reach people.</span>
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

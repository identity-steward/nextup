import { Link } from 'react-router-dom';
import { ArrowRight, Heart, UserPlus } from 'lucide-react';

export function StartPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-16">
      <div className="max-w-4xl mx-auto px-6 lg:px-8">
        <div className="text-center mb-12">
          <p className="text-xs font-bold uppercase tracking-widest text-blue-600 mb-3">Join NextUp</p>
          <h1 className="text-4xl sm:text-5xl font-black text-navy-900 mb-4">Choose your next step.</h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">Tell us how you want to take part in making young people’s journeys visible.</p>
        </div>
        <div className="grid md:grid-cols-2 gap-6">
          <Link to="/signup/player" className="group bg-white rounded-2xl border border-gray-200 hover:border-blue-300 hover:shadow-xl p-8 transition-all">
            <UserPlus className="w-8 h-8 text-blue-600 mb-6" />
            <h2 className="text-2xl font-black text-navy-900 mb-3">Create an athlete profile</h2>
            <p className="text-gray-600 leading-relaxed mb-6">Share an athlete’s story so NextUp can review it and help build a public profile.</p>
            <span className="inline-flex items-center gap-2 text-blue-600 font-bold">Get started <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" /></span>
          </Link>
          <Link to="/signup/parent" className="group bg-navy-900 rounded-2xl border border-navy-700 hover:border-blue-400 hover:shadow-xl p-8 transition-all text-white">
            <Heart className="w-8 h-8 text-blue-300 mb-6" />
            <h2 className="text-2xl font-black mb-3">Parent or guardian intake</h2>
            <p className="text-navy-200 leading-relaxed mb-6">Tell us what your young person needs and where NextUp can help connect the journey.</p>
            <span className="inline-flex items-center gap-2 text-blue-300 font-bold">Begin intake <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" /></span>
          </Link>
        </div>
      </div>
    </div>
  );
}

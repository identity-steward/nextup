import { Radio, Bell, Lock } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function LiveFeedPage() {
  return (
    <div className="min-h-screen bg-gray-50 pt-20">
      <section className="bg-navy text-white py-16">
        <div className="max-w-4xl mx-auto px-6 lg:px-8 text-center">
          <div className="inline-flex items-center gap-2 bg-red-500/20 text-red-400 px-4 py-2 rounded-full text-sm font-semibold mb-6 border border-red-500/30">
            <Radio className="w-4 h-4 animate-pulse" />
            Live Feed
          </div>
          <h1 className="text-4xl md:text-5xl font-bold mb-4">NextUp Live Feed</h1>
          <p className="text-xl text-gray-300 max-w-2xl mx-auto">
            Real-time updates from games, tournaments, and athlete milestones across Memphis.
          </p>
        </div>
      </section>

      <section className="py-24">
        <div className="max-w-2xl mx-auto px-6 lg:px-8 text-center">
          <div className="bg-white rounded-3xl shadow-xl border border-gray-100 p-12">
            <div className="w-20 h-20 bg-navy/5 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <Lock className="w-10 h-10 text-navy/40" />
            </div>
            <h2 className="text-2xl font-bold text-navy mb-3">Coming Soon</h2>
            <p className="text-gray-500 leading-relaxed mb-8">
              The Live Feed is under development. Access will be available to NextUp supporters and registered athletes first.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-10 text-left">
              {[
                { label: 'Game Updates', desc: 'Live scores and highlights as they happen' },
                { label: 'Athlete Milestones', desc: 'PRs, signings, and breakthrough moments' },
                { label: 'Event Coverage', desc: 'Tournament brackets and results' },
              ].map(item => (
                <div key={item.label} className="bg-gray-50 rounded-xl p-4 border border-gray-100">
                  <p className="font-semibold text-navy text-sm mb-1">{item.label}</p>
                  <p className="text-gray-400 text-xs leading-relaxed">{item.desc}</p>
                </div>
              ))}
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/signup"
                className="btn-primary inline-flex items-center justify-center gap-2 px-8 py-3"
              >
                <Bell className="w-4 h-4" />
                Get Early Access
              </Link>
              <Link
                to="/athletes"
                className="inline-flex items-center justify-center gap-2 px-8 py-3 rounded-lg border-2 border-navy text-navy font-semibold hover:bg-navy hover:text-white transition-all duration-200"
              >
                Browse Athletes
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

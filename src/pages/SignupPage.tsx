import { ArrowRight, User, Users } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function SignupPage() {
  return (
    <div className="min-h-screen bg-gray-50 pt-20">
      <section className="bg-navy text-white py-16">
        <div className="max-w-4xl mx-auto px-6 lg:px-8 text-center">
          <div className="inline-flex items-center gap-2 bg-gold/20 text-gold px-4 py-2 rounded-full text-sm font-semibold mb-6 border border-gold/30">
            <Users className="w-4 h-4" />
            Join NextUp Memphis
          </div>
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Get Started</h1>
          <p className="text-xl text-gray-300 max-w-2xl mx-auto">
            Choose how you'd like to join the NextUp Memphis network.
          </p>
        </div>
      </section>

      <section className="py-20">
        <div className="max-w-3xl mx-auto px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-8">

            {/* Player Signup */}
            <Link
              to="/signup/player"
              className="group bg-white rounded-3xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden border-2 border-transparent hover:border-gold flex flex-col"
            >
              <div className="bg-gradient-to-br from-navy to-navy-light p-10 text-white flex flex-col items-center text-center">
                <div className="w-20 h-20 bg-white/10 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-white/20 transition-colors">
                  <User className="w-10 h-10 text-gold" />
                </div>
                <h2 className="text-2xl font-bold mb-2">Player Signup</h2>
                <p className="text-gray-300 text-sm leading-relaxed">
                  I'm an athlete ready to build my profile and get discovered.
                </p>
              </div>
              <div className="p-8 flex flex-col flex-1 justify-between">
                <ul className="space-y-3 mb-8">
                  {[
                    'Personal athlete profile page',
                    'Highlight reel showcase',
                    'Supporter community',
                    'Exposure to scouts & sponsors',
                  ].map(item => (
                    <li key={item} className="flex items-start gap-2 text-gray-600 text-sm">
                      <span className="w-5 h-5 rounded-full bg-gold/20 text-gold font-bold flex items-center justify-center flex-shrink-0 text-xs mt-0.5">✓</span>
                      {item}
                    </li>
                  ))}
                </ul>
                <div className="flex items-center justify-between text-navy font-semibold group-hover:text-gold transition-colors">
                  <span>Start Player Profile</span>
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            </Link>

            {/* Parent/Guardian Signup */}
            <Link
              to="/signup/parent"
              className="group bg-white rounded-3xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden border-2 border-transparent hover:border-gold flex flex-col"
            >
              <div className="bg-gradient-to-br from-gray-800 to-gray-900 p-10 text-white flex flex-col items-center text-center">
                <div className="w-20 h-20 bg-white/10 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-white/20 transition-colors">
                  <Users className="w-10 h-10 text-gold" />
                </div>
                <h2 className="text-2xl font-bold mb-2">Parent / Guardian</h2>
                <p className="text-gray-300 text-sm leading-relaxed">
                  I'm a parent or guardian signing up my young athlete.
                </p>
              </div>
              <div className="p-8 flex flex-col flex-1 justify-between">
                <ul className="space-y-3 mb-8">
                  {[
                    'Parent-managed profile setup',
                    'Safe, moderated visibility',
                    'Updates & milestone tracking',
                    'Direct support from community',
                  ].map(item => (
                    <li key={item} className="flex items-start gap-2 text-gray-600 text-sm">
                      <span className="w-5 h-5 rounded-full bg-gold/20 text-gold font-bold flex items-center justify-center flex-shrink-0 text-xs mt-0.5">✓</span>
                      {item}
                    </li>
                  ))}
                </ul>
                <div className="flex items-center justify-between text-navy font-semibold group-hover:text-gold transition-colors">
                  <span>Submit Parent Intake</span>
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            </Link>
          </div>

          <p className="text-center text-gray-400 text-sm mt-10">
            Already have an account?{' '}
            <Link to="/signin" className="text-gold hover:underline font-medium">
              Sign in here
            </Link>
          </p>
        </div>
      </section>
    </div>
  );
}

import { useState, useEffect } from 'react';
import { Play, CheckCircle, TrendingUp, Users } from 'lucide-react';
import { Link } from 'react-router-dom';
import LiveStats from '../components/LiveStats';
import { AthleteService } from '../services/athleteService';
import type { Athlete } from '../types/athlete';

export default function HackathonDemoPage() {
  const [athlete, setAthlete] = useState<Athlete | null>(null);

  useEffect(() => {
    const loadData = async () => {
      const featuredAthlete = await AthleteService.getFeaturedAthlete();
      setAthlete(featuredAthlete);
    };
    loadData();
  }, []);

  const traction = [
    'Platform launched and live with first athlete profile',
    '$85 in monthly recurring support commitments',
    '3,200+ highlight reel views in first week',
    '12 active supporters from Memphis community',
    'Parent-managed content system operational',
    'Mobile-responsive design across all devices',
  ];

  return (
    <div className="min-h-screen bg-white pt-20">
      <section className="bg-gradient-to-br from-navy via-navy-light to-navy text-white py-24">
        <div className="max-w-5xl mx-auto px-6 lg:px-8 text-center">
          <div className="inline-flex items-center gap-2 bg-gold/20 text-gold px-4 py-2 rounded-full text-sm font-semibold mb-8 border border-gold/30">
            <TrendingUp className="w-4 h-4" />
            Hackathon Demo
          </div>
          <h1 className="text-4xl md:text-6xl font-black mb-6 leading-tight">
            The First Community-Powered
            <br />
            <span className="text-gold">Youth Athlete Support Platform</span>
          </h1>
          <p className="text-xl text-gray-300 mb-10 max-w-3xl mx-auto">
            NextUp Memphis connects youth athletes with their communities through storytelling, highlights, and monthly support contributions.
          </p>
          <button className="btn-primary text-lg px-10 py-4 inline-flex items-center gap-2">
            <Play className="w-5 h-5" fill="currentColor" />
            Watch Demo
          </button>
        </div>
      </section>

      <section className="py-20 bg-gray-50">
        <div className="max-w-4xl mx-auto px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-navy mb-4">Platform Demo</h2>
            <p className="text-xl text-gray-600">
              See how NextUp Memphis empowers youth athletes in 20 seconds
            </p>
          </div>

          <div className="aspect-video bg-navy rounded-2xl overflow-hidden shadow-2xl border-4 border-gold/20 relative group">
            <div className="absolute inset-0 flex items-center justify-center bg-black/40">
              <button className="w-24 h-24 bg-gold hover:bg-gold-light rounded-full flex items-center justify-center transition-all duration-200 transform group-hover:scale-110 shadow-xl">
                <Play className="w-12 h-12 text-navy ml-2" fill="currentColor" />
              </button>
            </div>
            <img
              src="https://images.pexels.com/photos/2834914/pexels-photo-2834914.jpeg?auto=compress&cs=tinysrgb&w=1200"
              alt="NextUp Memphis Platform Demo"
              className="w-full h-full object-cover"
            />
          </div>
        </div>
      </section>

      {athlete && <LiveStats athlete={athlete} />}

      <section className="py-20 bg-white">
        <div className="max-w-4xl mx-auto px-6 lg:px-8">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 bg-green-100 text-green-800 px-4 py-2 rounded-full text-sm font-semibold mb-6">
              <CheckCircle className="w-4 h-4" />
              Early Traction
            </div>
            <h2 className="text-4xl font-bold text-navy mb-4">
              Platform Progress & Momentum
            </h2>
            <p className="text-xl text-gray-600">
              Real results from the first week of operation
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            {traction.map((item, index) => (
              <div
                key={index}
                className="flex items-start gap-3 bg-gray-50 rounded-xl p-6 border border-gray-200"
              >
                <CheckCircle className="w-6 h-6 text-green-600 flex-shrink-0 mt-0.5" />
                <p className="text-gray-700 font-medium">{item}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 bg-navy text-white">
        <div className="max-w-4xl mx-auto px-6 lg:px-8 text-center">
          <Users className="w-12 h-12 text-gold mx-auto mb-6" />
          <h2 className="text-3xl md:text-4xl font-bold mb-8">
            Explore the NextUp Memphis Platform
          </h2>

          <div className="grid md:grid-cols-3 gap-6">
            <Link to="/" className="btn-primary py-4 text-lg block">
              View Demo
            </Link>
            <Link
              to="/athletes"
              className="bg-white/10 hover:bg-white/20 text-white py-4 rounded-lg font-semibold text-lg transition-all duration-200 border-2 border-white/20 hover:border-white/40 block"
            >
              Meet Athletes
            </Link>
            <Link
              to="/signup"
              className="bg-white/10 hover:bg-white/20 text-white py-4 rounded-lg font-semibold text-lg transition-all duration-200 border-2 border-white/20 hover:border-white/40 block"
            >
              Get Started
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}

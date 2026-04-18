import { useState, useEffect } from 'react';
import { UserPlus, CheckCircle, DollarSign, Clock, Shield, FileText, Camera, ArrowRight } from 'lucide-react';
import { CreatorService } from '../services/creatorService';
import type { Creator } from '../types/creator';

interface CreateAthletePageProps {
  onNavigate?: (page: string, slug?: string) => void;
}

export default function CreateAthletePage({ onNavigate }: CreateAthletePageProps) {
  const [creators, setCreators] = useState<Creator[]>([]);

  useEffect(() => {
    const loadCreators = async () => {
      const data = await CreatorService.getAllCreators();
      setCreators(data.slice(0, 3));
    };

    loadCreators();
  }, []);
  const steps = [
    {
      icon: FileText,
      title: 'Complete Intake Form',
      description: 'Share your athlete\'s story, achievements, and goals',
    },
    {
      icon: Shield,
      title: 'We Build Your Page',
      description: 'Our team creates a professional support page within 48 hours',
    },
    {
      icon: CheckCircle,
      title: 'Start Sharing',
      description: 'Share with family, friends, and the Memphis community',
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50 pt-20">
      <section className="bg-gradient-to-br from-navy via-navy-light to-navy text-white py-20">
        <div className="max-w-4xl mx-auto px-6 lg:px-8 text-center">
          <div className="inline-flex items-center gap-2 bg-gold/20 text-gold px-4 py-2 rounded-full text-sm font-semibold mb-6 border border-gold/30">
            <UserPlus className="w-4 h-4" />
            For Parents
          </div>
          <h1 className="text-4xl md:text-5xl font-bold mb-6">
            Create Your Athlete's Official Support Page
          </h1>
          <p className="text-xl text-gray-300 mb-8">
            Give your athlete the platform they deserve. Connect with supporters, share highlights, and build their legacy.
          </p>
        </div>
      </section>

      <section className="py-20">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <h2 className="text-3xl md:text-4xl font-bold text-navy text-center mb-4">
            How It Works
          </h2>
          <p className="text-xl text-gray-600 text-center mb-12 max-w-2xl mx-auto">
            Getting started is simple. We handle the heavy lifting so you can focus on supporting your athlete.
          </p>

          <div className="grid md:grid-cols-3 gap-8 mb-20">
            {steps.map((step, index) => (
              <div key={index} className="relative">
                <div className="bg-white rounded-xl p-8 shadow-lg text-center h-full">
                  <div className="w-16 h-16 bg-gold/20 rounded-full flex items-center justify-center mb-6 mx-auto">
                    <step.icon className="w-8 h-8 text-gold" />
                  </div>
                  <div className="absolute -top-4 left-8 w-8 h-8 bg-navy text-white rounded-full flex items-center justify-center font-bold">
                    {index + 1}
                  </div>
                  <h3 className="text-xl font-bold text-navy mb-3">{step.title}</h3>
                  <p className="text-gray-600">{step.description}</p>
                </div>
              </div>
            ))}
          </div>

          {creators.length > 0 && (
            <div className="mb-20">
              <div className="bg-gradient-to-br from-navy/5 to-navy/10 rounded-2xl p-10 border border-navy/20">
                <div className="flex items-center gap-3 mb-6">
                  <Camera className="w-8 h-8 text-gold" />
                  <h2 className="text-3xl font-bold text-navy">Choose a Featured Creator (Optional)</h2>
                </div>
                <p className="text-lg text-gray-700 mb-8">
                  Want professional highlights for your athlete? You can choose a featured creator to capture
                  games, tournaments, and special moments.
                </p>

                <div className="grid md:grid-cols-3 gap-6 mb-6">
                  {creators.map((creator) => (
                    <div
                      key={creator.id}
                      className="bg-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer"
                      onClick={() => onNavigate?.('creator-profile', creator.slug)}
                    >
                      <div className="aspect-square rounded-lg overflow-hidden mb-4">
                        <img
                          src={creator.image_url || 'https://images.pexels.com/photos/1262302/pexels-photo-1262302.jpeg?auto=compress&cs=tinysrgb&w=400'}
                          alt={creator.display_name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <h3 className="font-bold text-navy mb-1">{creator.display_name}</h3>
                      <p className="text-sm text-gray-600">{creator.tagline}</p>
                    </div>
                  ))}
                </div>

                <button
                  onClick={() => onNavigate?.('creators')}
                  className="btn-secondary inline-flex items-center gap-2"
                >
                  View All Creators
                  <ArrowRight className="w-5 h-5" />
                </button>
              </div>
            </div>
          )}

          <div className="bg-white rounded-2xl shadow-xl p-8 md:p-12 max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold text-navy mb-8 text-center">Pricing</h2>

            <div className="grid md:grid-cols-2 gap-6 mb-8">
              <div className="border-2 border-gold rounded-xl p-6 bg-gold/5">
                <div className="flex items-center gap-3 mb-4">
                  <DollarSign className="w-8 h-8 text-gold" />
                  <div>
                    <p className="text-sm text-gray-600 font-semibold">One-Time Setup</p>
                    <p className="text-3xl font-bold text-navy">$50</p>
                  </div>
                </div>
                <p className="text-gray-600">Professional page design, photos, and initial setup</p>
              </div>

              <div className="border-2 border-navy rounded-xl p-6 bg-navy/5">
                <div className="flex items-center gap-3 mb-4">
                  <Clock className="w-8 h-8 text-navy" />
                  <div>
                    <p className="text-sm text-gray-600 font-semibold">Monthly Maintenance</p>
                    <p className="text-3xl font-bold text-navy">$10</p>
                  </div>
                </div>
                <p className="text-gray-600">Hosting, updates, and ongoing support</p>
              </div>
            </div>

            <div className="bg-gray-50 rounded-xl p-6 mb-8">
              <h3 className="font-bold text-navy mb-3">What's Included:</h3>
              <ul className="space-y-2 text-gray-700">
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                  <span>Custom athlete profile page with photos and stats</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                  <span>Video highlight integration</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                  <span>$5/month supporter sign-up system</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                  <span>Parent dashboard for updates and management</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                  <span>Secure, private, parent-controlled</span>
                </li>
              </ul>
            </div>

            <button
              onClick={() => onNavigate?.('contact')}
              className="btn-primary w-full text-lg py-4 flex items-center justify-center gap-2"
            >
              Start Athlete Intake Form
              <UserPlus className="w-5 h-5" />
            </button>
            <p className="text-center text-sm text-gray-600 mt-4">
              Questions? Email us at <a href="mailto:kenneth@flmlifestyle.com" className="text-gold hover:underline">kenneth@flmlifestyle.com</a>
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}

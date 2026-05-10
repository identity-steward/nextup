import { useState, useEffect } from 'react';
import { ArrowRight, Instagram, ExternalLink, Camera, Film, Sparkles, Check, MessageCircle } from 'lucide-react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { CreatorService } from '../services/creatorService';
import type { Creator } from '../types/creator';

export default function CreatorProfilePage() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const [creator, setCreator] = useState<Creator | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadCreator = async () => {
      if (slug) {
        const data = await CreatorService.getCreatorBySlug(slug);
        setCreator(data);
      }
      setLoading(false);
    };

    loadCreator();
  }, [slug]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 pt-20">
        <div className="text-navy text-xl">Loading creator profile...</div>
      </div>
    );
  }

  if (!creator) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 pt-20">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-navy mb-4">Creator not found</h2>
          <button onClick={() => navigate('/creators')} className="btn-primary">
            View All Creators
          </button>
        </div>
      </div>
    );
  }

  const services = [
    {
      icon: Camera,
      name: 'Game Highlights',
      description: 'Single-game highlight mix, 30–60 seconds.',
      detail: 'Perfect for social media and athlete pages.',
      enabled: creator.service_game_highlights,
    },
    {
      icon: Film,
      name: 'Season Package',
      description: 'Multiple games captured and edited into a season recap.',
      detail: 'Ideal for supporters and recruiters.',
      enabled: creator.service_season_package,
    },
    {
      icon: Sparkles,
      name: 'Custom Story Feature',
      description: 'Behind-the-scenes + interview style storytelling.',
      detail: 'Great for sponsors or special features.',
      enabled: creator.service_custom_story,
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50 pt-20">
      <section className="bg-navy text-white py-16">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="relative">
              <div className="aspect-square rounded-2xl overflow-hidden shadow-2xl border-4 border-gold/30">
                <img
                  src={creator.image_url || 'https://images.pexels.com/photos/1262302/pexels-photo-1262302.jpeg?auto=compress&cs=tinysrgb&w=800'}
                  alt={creator.display_name}
                  className="w-full h-full object-cover"
                />
              </div>
            </div>

            <div>
              <div className="inline-flex items-center gap-2 bg-gold/20 text-gold px-4 py-2 rounded-full text-sm font-semibold mb-4 border border-gold/30">
                <Camera className="w-4 h-4" />
                Featured NextUp Creator
              </div>
              <h1 className="text-4xl md:text-5xl font-bold mb-4">
                {creator.display_name}
              </h1>
              <p className="text-xl text-gray-300 mb-6">{creator.tagline}</p>
              <p className="text-lg text-gray-300 mb-8 leading-relaxed">{creator.bio}</p>

              <div className="flex flex-col sm:flex-row gap-4">
                <button className="btn-primary flex items-center gap-2 justify-center">
                  <MessageCircle className="w-5 h-5" />
                  Book Me for Highlights
                </button>
                {creator.portfolio_url && (
                  <a
                    href={creator.portfolio_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn-secondary flex items-center gap-2 justify-center"
                  >
                    View My Portfolio
                    <ExternalLink className="w-5 h-5" />
                  </a>
                )}
              </div>

              {creator.instagram_handle && (
                <div className="mt-6 flex items-center gap-2 text-gray-300">
                  <Instagram className="w-5 h-5 text-gold" />
                  <a
                    href={`https://instagram.com/${creator.instagram_handle.replace('@', '')}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-gold transition-colors"
                  >
                    {creator.instagram_handle}
                  </a>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-navy mb-4">Services & Packages</h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Professional sports content creation tailored to your athlete's needs.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {services.filter(s => s.enabled).map((service, index) => (
              <div
                key={index}
                className="bg-gradient-to-br from-gray-50 to-white rounded-xl p-8 border-2 border-gray-200 hover:border-gold/50 transition-all duration-300 shadow-lg"
              >
                <div className="w-16 h-16 bg-gold/20 rounded-2xl flex items-center justify-center mb-6">
                  <service.icon className="w-8 h-8 text-gold" />
                </div>
                <h3 className="text-2xl font-bold text-navy mb-3">{service.name}</h3>
                <p className="text-gray-700 mb-2 font-medium">{service.description}</p>
                <p className="text-gray-600 text-sm mb-6">{service.detail}</p>
                <button className="btn-primary w-full flex items-center justify-center gap-2">
                  Request This Package
                  <ArrowRight className="w-5 h-5" />
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-navy mb-4">Portfolio Preview</h2>
            <p className="text-xl text-gray-600">
              Recent work featuring AAU, school ball, and training sessions.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((item) => (
              <div key={item} className="aspect-video bg-navy-light rounded-xl overflow-hidden relative group">
                <img
                  src={`https://images.pexels.com/photos/${2834914 + item * 100}/pexels-photo-${2834914 + item * 100}.jpeg?auto=compress&cs=tinysrgb&w=800`}
                  alt={`Sample work ${item}`}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                />
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                  <Camera className="w-12 h-12 text-white" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 bg-white">
        <div className="max-w-4xl mx-auto px-6 lg:px-8">
          <div className="bg-gradient-to-br from-navy/5 to-navy/10 rounded-2xl p-10 border border-navy/20">
            <h2 className="text-3xl font-bold text-navy mb-6 text-center">
              {creator.display_name} x NextUp Memphis
            </h2>
            <div className="space-y-4 text-lg text-gray-700">
              <div className="flex items-start gap-3">
                <Check className="w-6 h-6 text-gold flex-shrink-0 mt-1" />
                <p>Produces highlight reels for athlete pages</p>
              </div>
              <div className="flex items-start gap-3">
                <Check className="w-6 h-6 text-gold flex-shrink-0 mt-1" />
                <p>Collaborates on sponsored content</p>
              </div>
              <div className="flex items-start gap-3">
                <Check className="w-6 h-6 text-gold flex-shrink-0 mt-1" />
                <p>Helps athletes and families tell their stories the right way</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-20 bg-gray-50">
        <div className="max-w-4xl mx-auto px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-navy mb-8 text-center">What People Say</h2>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="bg-white rounded-xl p-6 shadow-lg">
              <p className="text-gray-700 mb-4 italic">
                "The highlight reel captured everything perfectly. Great quality and fast turnaround."
              </p>
              <p className="text-sm text-gray-600 font-semibold">— Parent, Memphis AAU</p>
            </div>
            <div className="bg-white rounded-xl p-6 shadow-lg">
              <p className="text-gray-700 mb-4 italic">
                "Professional work that really showcased our athletes. Highly recommend."
              </p>
              <p className="text-sm text-gray-600 font-semibold">— Coach Williams</p>
            </div>
            <div className="bg-white rounded-xl p-6 shadow-lg">
              <p className="text-gray-700 mb-4 italic">
                "My son loved seeing his season highlights. Perfect for sharing with family."
              </p>
              <p className="text-sm text-gray-600 font-semibold">— Marcus J's Mom</p>
            </div>
          </div>
        </div>
      </section>

      <section className="py-20 bg-gradient-to-r from-navy via-navy-light to-navy text-white">
        <div className="max-w-4xl mx-auto px-6 lg:px-8 text-center">
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            Want {creator.display_name} to cover your season?
          </h2>
          <p className="text-xl text-gray-300 mb-10">
            Get started and build your athlete profile today.
          </p>
          <Link
            to="/signup"
            className="btn-primary text-lg px-10 py-4 inline-flex items-center gap-2"
          >
            Get Started
            <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </section>

      <section className="py-6 bg-gray-50">
        <div className="max-w-4xl mx-auto px-6 lg:px-8">
          <p className="text-sm text-gray-600 text-center">
            NextUp Memphis showcases independent creators. All bookings and payments are handled
            directly between families and creators unless otherwise arranged through official sponsorships.
          </p>
        </div>
      </section>
    </div>
  );
}

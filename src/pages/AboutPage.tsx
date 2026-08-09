import { Target, Heart, Shield, Eye, Lightbulb, Users, Compass, BookOpen, Zap, Repeat } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function AboutPage() {
  const principles = [
    {
      icon: Zap,
      title: 'Performance',
      subtitle: 'Intelligence in Motion',
      description:
        'What young people do on the field, on the court, and in their communities is a form of intelligence. NextUp sees it that way.',
    },
    {
      icon: BookOpen,
      title: 'Documentation',
      subtitle: 'Intelligence Preserved',
      description:
        'When a journey is captured, it does not disappear. NextUp helps ensure that growth and effort have a record.',
    },
    {
      icon: Compass,
      title: 'Opportunity',
      subtitle: 'Intelligence Connected',
      description:
        'A record only matters if it reaches the right people. NextUp works to connect what is documented to what is possible.',
    },
    {
      icon: Repeat,
      title: 'Sustainability',
      subtitle: 'Intelligence Repeated',
      description:
        'When the process works once, it should work again. NextUp is being built so that opportunity is not a one-time event.',
    },
  ];

  const values = [
    {
      icon: Shield,
      title: 'Protection First',
      description: 'We prioritize safety, privacy, and rights in everything we do.',
    },
    {
      icon: Heart,
      title: 'Community Focus',
      description: 'Memphis youth and families are at the center of our mission.',
    },
    {
      icon: Lightbulb,
      title: 'Innovation',
      description: 'We create modern solutions for traditional community challenges.',
    },
    {
      icon: Users,
      title: 'Collaboration',
      description: 'Success comes through partnership with families, schools, and supporters.',
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50 pt-20">
      <section className="bg-gradient-to-br from-navy via-navy-light to-navy text-white py-20">
        <div className="max-w-4xl mx-auto px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-6">
            About NextUp Memphis
          </h1>
          <p className="text-xl text-gray-300 max-w-2xl mx-auto">
            NextUp is a developing community infrastructure that helps people
            understand what's happening, identify next steps, and connect with
            the systems and opportunities that can help.
          </p>
        </div>
      </section>

      {/* Method / Governing Principle */}
      <section className="py-20 bg-white">
        <div className="max-w-4xl mx-auto px-6 lg:px-8">
          <div className="text-center mb-12">
            <div className="flex justify-center mb-6">
              <Target className="w-16 h-16 text-gold" />
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-navy mb-6">
              The Method
            </h2>
            <div className="bg-navy rounded-2xl p-8 md:p-10">
              <p className="text-white text-lg md:text-xl leading-relaxed font-medium">
                People narrate.
              </p>
              <p className="text-gold text-lg md:text-xl leading-relaxed font-medium mt-2">
                NextUp translates.
              </p>
              <p className="text-white text-lg md:text-xl leading-relaxed font-medium mt-2">
                Authorities determine.
              </p>
            </div>
          </div>

          <p className="text-xl text-gray-700 text-center leading-relaxed max-w-2xl mx-auto mb-16">
            NextUp is being built so that people can start with what's
            happening in their own words. NextUp helps organize and translate
            that into something useful. But NextUp does not make the decisions
            &mdash; the people and institutions with authority do. NextUp helps
            you navigate them.
          </p>

          <h3 className="text-2xl md:text-3xl font-bold text-navy text-center mb-10">
            What Guides Us
          </h3>
          <div className="grid md:grid-cols-2 gap-8">
            {principles.map((principle, index) => {
              const Icon = principle.icon;
              return (
                <div key={index} className="bg-gray-50 rounded-xl p-8">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-gold/20 rounded-lg flex items-center justify-center flex-shrink-0">
                      <Icon className="w-6 h-6 text-gold" />
                    </div>
                    <div>
                      <h4 className="text-lg font-bold text-navy">{principle.title}</h4>
                      <p className="text-sm text-gold font-semibold mb-2">{principle.subtitle}</p>
                      <p className="text-gray-600 leading-relaxed">{principle.description}</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* What We Do */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <h2 className="text-3xl md:text-4xl font-bold text-navy text-center mb-4">
            What We're Building
          </h2>
          <p className="text-xl text-gray-600 text-center mb-12 max-w-3xl mx-auto">
            NextUp started as a youth athlete visibility platform. It is
            evolving into something broader: a way to help people navigate
            what's happening and connect to what's next.
          </p>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-white rounded-xl p-8 text-center shadow-lg">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-6 mx-auto">
                <Users className="w-8 h-8 text-blue-600" />
              </div>
              <h3 className="text-xl font-bold text-navy mb-3">Youth &amp; Opportunity</h3>
              <p className="text-gray-600">
                We showcase the journeys, highlights, and accomplishments of
                young athletes across Memphis.
              </p>
            </div>

            <div className="bg-white rounded-xl p-8 text-center shadow-lg">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-6 mx-auto">
                <Shield className="w-8 h-8 text-green-600" />
              </div>
              <h3 className="text-xl font-bold text-navy mb-3">Privacy &amp; Trust</h3>
              <p className="text-gray-600">
                Your story does not need to become everybody's file. We design
                for consent and control.
              </p>
            </div>

            <div className="bg-white rounded-xl p-8 text-center shadow-lg">
              <div className="w-16 h-16 bg-gold/20 rounded-full flex items-center justify-center mb-6 mx-auto">
                <Compass className="w-8 h-8 text-gold" />
              </div>
              <h3 className="text-xl font-bold text-navy mb-3">Navigation</h3>
              <p className="text-gray-600">
                We're building tools to help people understand what's happening
                and see possible next steps.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Core Values */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <h2 className="text-3xl md:text-4xl font-bold text-navy text-center mb-12">
            Our Core Values
          </h2>
          <div className="grid md:grid-cols-2 gap-8">
            {values.map((value, index) => {
              const Icon = value.icon;
              return (
                <div key={index} className="bg-gray-50 rounded-xl p-8 shadow-sm">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-gold/20 rounded-lg flex items-center justify-center flex-shrink-0">
                      <Icon className="w-6 h-6 text-gold" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-navy mb-2">{value.title}</h3>
                      <p className="text-gray-600">{value.description}</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Vision */}
      <section className="py-20 bg-navy text-white">
        <div className="max-w-4xl mx-auto px-6 lg:px-8">
          <div className="flex justify-center mb-8">
            <Eye className="w-16 h-16 text-gold" />
          </div>
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-6">
            Our Vision
          </h2>
          <p className="text-xl text-gray-300 text-center leading-relaxed mb-8">
            We envision a future where every young person in Memphis has access
            to the support, resources, and recognition they need to reach their
            full potential. Where communities rally around their young people
            and invest in the next generation.
          </p>
          <p className="text-xl text-gray-300 text-center leading-relaxed">
            NextUp Memphis is more than a platform &mdash; it's a developing
            community infrastructure to help people navigate what's happening
            and connect to what's next.
          </p>
        </div>
      </section>

      {/* Founder */}
      <section className="py-20 bg-white">
        <div className="max-w-4xl mx-auto px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-navy mb-6">
            Why NextUp Started
          </h2>
          <div className="bg-gray-50 rounded-2xl p-8 md:p-12 max-w-3xl mx-auto">
            <p className="text-xl text-gray-700 leading-relaxed mb-6">
              Too many young athletes are putting in real work but their journey
              is never captured.
            </p>
            <p className="text-xl text-gray-700 leading-relaxed mb-8">
              NextUp Memphis was created to document that journey early &mdash;
              through highlights, profiles, and storytelling &mdash; so every
              athlete has a record of their growth.
            </p>
            <div className="border-t-2 border-navy/10 pt-8">
              <div className="w-24 h-24 bg-navy rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-3xl font-bold text-gold">KF</span>
              </div>
              <h3 className="text-2xl font-bold text-navy mb-2">Kenneth Fouse</h3>
              <p className="text-gray-600">Founder, NextUp Memphis</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-3xl mx-auto px-6 lg:px-8 text-center">
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/start" className="btn-primary">
              Start My NextUp
            </Link>
            <Link to="/youth" className="btn-secondary">
              Explore Youth &amp; Opportunity
            </Link>
            <Link to="/privacy" className="btn-secondary">
              Privacy &amp; Trust
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}

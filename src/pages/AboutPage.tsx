import { Target, Heart, Shield, Eye, Lightbulb, Users } from 'lucide-react';

export default function AboutPage() {
  const values = [
    {
      icon: Shield,
      title: 'Protection First',
      description: 'We prioritize athlete safety, privacy, and rights in everything we do.',
    },
    {
      icon: Heart,
      title: 'Community Focus',
      description: 'Memphis youth and families are at the center of our mission.',
    },
    {
      icon: Lightbulb,
      title: 'Innovation',
      description: 'We create modern solutions for traditional youth sports challenges.',
    },
    {
      icon: Users,
      title: 'Collaboration',
      description: 'Success comes through partnership with parents, coaches, and supporters.',
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50 pt-20">
      <section className="bg-gradient-to-br from-navy via-navy-light to-navy text-white py-20">
        <div className="max-w-4xl mx-auto px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-6">
            About NextUp Memphis
          </h1>
          <p className="text-xl text-gray-300">
            Building a platform that protects, empowers, and celebrates Memphis youth athletes.
          </p>
        </div>
      </section>

      <section className="py-20">
        <div className="max-w-4xl mx-auto px-6 lg:px-8">
          <div className="flex justify-center mb-8">
            <Target className="w-16 h-16 text-gold" />
          </div>
          <h2 className="text-3xl md:text-4xl font-bold text-navy text-center mb-6">
            Our Mission
          </h2>
          <p className="text-xl text-gray-700 text-center leading-relaxed">
            NextUp Memphis empowers youth athletes by providing a safe, parent-controlled platform where they can share their journey, connect with supporters, and access the resources they need to succeed both on and off the court.
          </p>
        </div>
      </section>

      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <h2 className="text-3xl md:text-4xl font-bold text-navy text-center mb-4">
            What We Do
          </h2>
          <p className="text-xl text-gray-600 text-center mb-12 max-w-3xl mx-auto">
            We bridge the gap between young athletes with big dreams and communities ready to support them.
          </p>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-gray-50 rounded-xl p-8 text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-6 mx-auto">
                <Users className="w-8 h-8 text-blue-600" />
              </div>
              <h3 className="text-xl font-bold text-navy mb-3">Connect Athletes & Supporters</h3>
              <p className="text-gray-600">
                We create meaningful connections between Memphis youth athletes and their communities through storytelling and engagement.
              </p>
            </div>

            <div className="bg-gray-50 rounded-xl p-8 text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-6 mx-auto">
                <Shield className="w-8 h-8 text-green-600" />
              </div>
              <h3 className="text-xl font-bold text-navy mb-3">Protect Their Story</h3>
              <p className="text-gray-600">
                Every athlete page is parent-managed and controlled, ensuring safety, privacy, and proper representation.
              </p>
            </div>

            <div className="bg-gray-50 rounded-xl p-8 text-center">
              <div className="w-16 h-16 bg-gold/20 rounded-full flex items-center justify-center mb-6 mx-auto">
                <Heart className="w-8 h-8 text-gold" />
              </div>
              <h3 className="text-xl font-bold text-navy mb-3">Fund Their Future</h3>
              <p className="text-gray-600">
                Through $5/month supporter contributions, we help families cover travel, training, equipment, and academic support.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="py-20">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <h2 className="text-3xl md:text-4xl font-bold text-navy text-center mb-12">
            Our Core Values
          </h2>

          <div className="grid md:grid-cols-2 gap-8">
            {values.map((value, index) => (
              <div key={index} className="bg-white rounded-xl p-8 shadow-lg">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-gold/20 rounded-lg flex items-center justify-center flex-shrink-0">
                    <value.icon className="w-6 h-6 text-gold" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-navy mb-2">{value.title}</h3>
                    <p className="text-gray-600">{value.description}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 bg-navy text-white">
        <div className="max-w-4xl mx-auto px-6 lg:px-8">
          <div className="flex justify-center mb-8">
            <Eye className="w-16 h-16 text-gold" />
          </div>
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-6">
            Our Vision
          </h2>
          <p className="text-xl text-gray-300 text-center leading-relaxed mb-8">
            We envision a future where every youth athlete in Memphis has access to the support, resources, and recognition they need to reach their full potential. Where families never have to choose between athletic dreams and financial reality. Where communities rally around their young athletes and invest in the next generation.
          </p>
          <p className="text-xl text-gray-300 text-center leading-relaxed">
            NextUp Memphis is more than a platform—it's a movement to protect, celebrate, and empower youth athletes across our city.
          </p>
        </div>
      </section>

      <section className="py-20 bg-white">
        <div className="max-w-4xl mx-auto px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-navy mb-6">
            Why NextUp Started
          </h2>
          <div className="bg-gray-50 rounded-2xl p-8 md:p-12 max-w-3xl mx-auto">
            <p className="text-xl text-gray-700 leading-relaxed mb-6">
              Too many young athletes are putting in real work but their journey is never captured.
            </p>
            <p className="text-xl text-gray-700 leading-relaxed mb-8">
              NextUpMemphis was created to document that journey early — through highlights, profiles, and storytelling — so every athlete has a record of their growth.
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
    </div>
  );
}

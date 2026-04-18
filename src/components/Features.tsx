import { Video, Users, Lock, TrendingUp, Award, Heart } from 'lucide-react';

const features = [
  {
    icon: Video,
    title: 'Highlight to Story Asset',
    description: 'Transform your best plays into permanent digital assets that tell your athletic journey.',
    color: 'emerald',
  },
  {
    icon: Lock,
    title: 'Rights-First Protection',
    description: 'Complete control over your digital identity with industry-leading privacy safeguards.',
    color: 'sky',
  },
  {
    icon: Users,
    title: 'Community Support',
    description: 'Connect with supporters who believe in your journey and want to see you succeed.',
    color: 'violet',
  },
  {
    icon: TrendingUp,
    title: 'Build Your Legacy',
    description: 'Create a lasting portfolio of your athletic achievements that grows with you.',
    color: 'amber',
  },
  {
    icon: Award,
    title: 'Verified Achievements',
    description: 'Document and showcase your progress with authenticated highlights and milestones.',
    color: 'rose',
  },
  {
    icon: Heart,
    title: '$5 Supporter Tier',
    description: 'Accessible support that makes a real difference for young athletes.',
    color: 'pink',
  },
];

const colorClasses = {
  emerald: 'bg-emerald-100 text-emerald-600 border-emerald-200',
  sky: 'bg-sky-100 text-sky-600 border-sky-200',
  violet: 'bg-violet-100 text-violet-600 border-violet-200',
  amber: 'bg-amber-100 text-amber-600 border-amber-200',
  rose: 'bg-rose-100 text-rose-600 border-rose-200',
  pink: 'bg-pink-100 text-pink-600 border-pink-200',
};

export default function Features() {
  return (
    <section id="highlights" className="py-24 bg-white scroll-mt-20">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            Built for Young Athletes
          </h2>
          <p className="text-xl text-gray-600 leading-relaxed">
            Every feature designed with your safety, growth, and success in mind.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <div
                key={index}
                className="group p-8 rounded-2xl border-2 border-gray-100 hover:border-gray-200 transition-all duration-300 hover:shadow-xl bg-white"
              >
                <div className={`w-14 h-14 rounded-xl flex items-center justify-center mb-5 transition-transform duration-300 group-hover:scale-110 ${colorClasses[feature.color as keyof typeof colorClasses]}`}>
                  <Icon className="w-7 h-7" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">
                  {feature.title}
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  {feature.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

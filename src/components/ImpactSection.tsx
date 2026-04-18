import { Plane, DollarSign, Dumbbell, Shield, GraduationCap, Video } from 'lucide-react';

export default function ImpactSection() {
  const impacts = [
    { icon: Plane, label: 'Travel', color: 'bg-blue-100 text-blue-600' },
    { icon: DollarSign, label: 'Team Fees', color: 'bg-green-100 text-green-600' },
    { icon: Dumbbell, label: 'Training', color: 'bg-purple-100 text-purple-600' },
    { icon: Shield, label: 'Safer Equipment', color: 'bg-red-100 text-red-600' },
    { icon: GraduationCap, label: 'Academic Support', color: 'bg-gold/20 text-gold-dark' },
    { icon: Video, label: 'Highlight Editing', color: 'bg-navy/10 text-navy' },
  ];

  return (
    <section className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-navy mb-4">
            Where Your Support Goes
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Every contribution directly impacts an athlete's journey, from the court to the classroom.
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
          {impacts.map((impact, index) => (
            <div
              key={index}
              className="bg-white rounded-xl p-6 border-2 border-gray-200 hover:border-gold transition-all duration-300 hover:shadow-lg text-center group"
            >
              <div className={`w-16 h-16 ${impact.color} rounded-xl flex items-center justify-center mb-4 mx-auto group-hover:scale-110 transition-transform`}>
                <impact.icon className="w-8 h-8" />
              </div>
              <h3 className="font-semibold text-gray-900 text-sm">{impact.label}</h3>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

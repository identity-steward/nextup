import { Check } from 'lucide-react';

export default function SupportImpact() {
  const impacts = [
    'Team fees',
    'Travel + transportation',
    'Safer equipment',
    'Training + development sessions',
  ];

  return (
    <section className="py-20 bg-white">
      <div className="max-w-4xl mx-auto px-6 lg:px-8">
        <div className="bg-gradient-to-br from-emerald-50 to-sky-50 rounded-3xl p-8 md:p-12 border border-emerald-200 shadow-lg">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2 text-center">
            Your Support Helps With
          </h2>
          <p className="text-gray-600 text-center mb-8 text-lg">
            Every gift goes directly toward real costs
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-2xl mx-auto">
            {impacts.map((impact, index) => (
              <div
                key={index}
                className="flex items-center gap-3 bg-white p-4 rounded-xl shadow-sm border border-gray-200"
              >
                <div className="w-8 h-8 bg-emerald-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <Check className="w-5 h-5 text-emerald-600" />
                </div>
                <span className="text-gray-900 font-medium">{impact}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

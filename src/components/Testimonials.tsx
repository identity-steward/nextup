import { Quote } from 'lucide-react';

const testimonials = [
  {
    quote: "This page makes it easy to stay involved from across the country.",
    author: "Uncle AD",
  },
  {
    quote: "Great way for family to back the work our players put in.",
    author: "Coach P",
  },
  {
    quote: "Love that school comes first and updates keep us connected.",
    author: "Grandparents",
  },
];

export default function Testimonials() {
  return (
    <section id="testimonials" className="py-24 bg-white scroll-mt-20">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 bg-gold/20 text-gold-dark px-4 py-2 rounded-full text-sm font-semibold mb-6 border border-gold/30">
            <Quote className="w-4 h-4" />
            What Supporters Are Saying
          </div>

          <h2 className="text-4xl md:text-5xl font-bold text-navy leading-tight">
            Trusted by Families & Communities
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {testimonials.map((testimonial, index) => (
            <div
              key={index}
              className="group relative bg-white rounded-3xl shadow-lg border-2 border-gray-200 p-8 hover:shadow-2xl hover:border-gold/30 transition-all duration-300"
            >
              <div className="absolute top-8 left-8 w-12 h-12 bg-gold/10 rounded-2xl flex items-center justify-center">
                <Quote className="w-6 h-6 text-gold" />
              </div>

              <div className="pt-16">
                <p className="text-lg text-gray-800 leading-relaxed mb-6 font-medium">
                  "{testimonial.quote}"
                </p>

                <div className="inline-block px-4 py-2 bg-gold/10 rounded-full border border-gold/20">
                  <p className="text-sm font-semibold text-navy">
                    — {testimonial.author}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

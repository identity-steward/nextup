import { HelpCircle, Plus, Minus } from 'lucide-react';
import { useState } from 'react';

const faqs = [
  {
    question: "Is this safe for my child?",
    answer: "Yes. This hub is managed by a parent/guardian. Only approved photos and clips are shared.",
  },
  {
    question: "Where does the money go?",
    answer: "Directly toward real costs—fees, travel, equipment, and training.",
  },
  {
    question: "Can I cancel anytime?",
    answer: "Absolutely. One click.",
  },
  {
    question: "Can I share this page?",
    answer: "Yes—sharing is one of the best ways to support.",
  },
  {
    question: "Is this tax-deductible?",
    answer: "Gifts are personal support and not tax-deductible at this time.",
  },
];

export default function FAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <section className="py-24 bg-gradient-to-br from-gray-50 to-white">
      <div className="max-w-4xl mx-auto px-6 lg:px-8">
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 bg-gold/20 text-gold-dark px-4 py-2 rounded-full text-sm font-semibold mb-6 border border-gold/30">
            <HelpCircle className="w-4 h-4" />
            Questions Parents Ask
          </div>

          <h2 className="text-4xl md:text-5xl font-bold text-navy leading-tight">
            Clear Answers, No Hesitation
          </h2>
        </div>

        <div className="space-y-4">
          {faqs.map((faq, index) => (
            <div
              key={index}
              className="bg-white rounded-2xl shadow-md border-2 border-gray-200 overflow-hidden transition-all duration-300 hover:shadow-lg hover:border-gold/30"
            >
              <button
                onClick={() => setOpenIndex(openIndex === index ? null : index)}
                className="w-full px-8 py-6 flex items-center justify-between text-left transition-colors hover:bg-gray-50"
              >
                <span className="text-lg font-semibold text-navy pr-4">
                  {faq.question}
                </span>
                <div className="flex-shrink-0 w-8 h-8 bg-gold/20 rounded-full flex items-center justify-center transition-transform duration-300">
                  {openIndex === index ? (
                    <Minus className="w-5 h-5 text-gold" />
                  ) : (
                    <Plus className="w-5 h-5 text-gold" />
                  )}
                </div>
              </button>

              <div
                className={`transition-all duration-300 ease-in-out ${
                  openIndex === index
                    ? 'max-h-48 opacity-100'
                    : 'max-h-0 opacity-0'
                }`}
              >
                <div className="px-8 pb-6">
                  <p className="text-gray-700 leading-relaxed">{faq.answer}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-12 text-center">
          <p className="text-gray-600">
            Have another question?{' '}
            <a
              href="mailto:info@NextUpMemphis.com"
              className="text-gold hover:text-gold-dark font-semibold transition-colors"
            >
              Contact us
            </a>
          </p>
        </div>
      </div>
    </section>
  );
}

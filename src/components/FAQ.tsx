import { HelpCircle, Plus, Minus } from 'lucide-react';
import { useState } from 'react';

const faqs = [
  {
    question: "What is NextUp?",
    answer:
      "NextUp is recognition and conveyance infrastructure. It helps people start with what's happening in their own words, understand possible next steps, and move the right information to the right destination at the right time.",
  },
  {
    question: "Is NextUp a resource directory or eligibility screener?",
    answer:
      "No. NextUp is not a resource directory, case-management system, eligibility screener, or referral platform. It helps people understand what's happening and navigate what comes next \u2014 without pretending to determine what they qualify for.",
  },
  {
    question: "Do I need to know which program I need before I start?",
    answer:
      "No. You start with what you're experiencing in your own words. You don't need to know the name of a program, a form number, or which office to call.",
  },
  {
    question: "Who controls my information?",
    answer:
      "You do. Your story is yours. NextUp helps you decide what to share, with whom, and when. Nothing moves without your say-so.",
  },
  {
    question: "Does NextUp decide if I qualify for something?",
    answer:
      "No. People narrate. NextUp translates. Authorities determine. NextUp helps you see possible pathways and reach the right destination \u2014 but the people and institutions with authority make the decisions.",
  },
  {
    question: "Is this only for athletes?",
    answer:
      "NextUp started as a youth athlete visibility platform, but it is evolving into something broader: a way to help people navigate what's happening and connect to what's next \u2014 for youth, families, and communities across Memphis.",
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
            Common Questions
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

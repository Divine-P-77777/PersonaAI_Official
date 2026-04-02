import React, { useState } from 'react';
import { ChevronDown, ChevronUp, HelpCircle } from 'lucide-react';
import JsonLd from '../seo/JsonLd';

const faqs = [
  {
    question: "What is PersonaBot?",
    answer: "PersonaBot is an AI-powered mentorship platform that allows you to interact with digital personas of industry experts, alumni, and professors. These personas are trained on real experiences and knowledge to provide personalized guidance 24/7."
  },
  {
    question: "How are the AI personas created?",
    answer: "AI personas are created using our proprietary ingestion engine. Experts upload their resumes, research papers, and documents, which our system processes to create a high-fidelity digital twin that retains their expertise and personality."
  },
  {
    question: "Is my data secure on PersonaBot?",
    answer: "Yes, security and privacy are our top priorities. All conversations and uploaded documents are encrypted. We do not share your personal data with third parties without your explicit consent."
  },
  {
    question: "Can I create my own AI persona?",
    answer: "Absolutely! Any professional or student can create their own persona by signing up, uploading their professional documents, and configuring their persona's tone and expertise areas through our intuitive dashboard."
  },
  {
    question: "What's the difference between text and voice mode?",
    answer: "Text mode allows for quick, asynchronous learning via a chat interface. Voice mode provides a more immersive, real-time conversational experience, perfect for practicing interviews or deep-dive discussions."
  }
];

export function FAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const faqData = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": faqs.map(faq => ({
      "@type": "Question",
      "name": faq.question,
      "acceptedAnswer": {
        "@type": "Answer",
        "text": faq.answer
      }
    }))
  };

  return (
    <section id="faq" className="py-24 px-4 sm:px-6 lg:px-8 bg-gray-50/50">
      <JsonLd data={faqData} />
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-orange-50 text-orange-700 rounded-full text-sm font-bold border border-orange-100 mb-6">
            <HelpCircle className="w-4 h-4" />
            Support
          </div>
          <h2 className="text-4xl md:text-5xl font-black text-gray-900 mb-4 tracking-tight">
            Frequently Asked <span className="bg-gradient-to-r from-orange-500 to-pink-500 bg-clip-text text-transparent">Questions</span>
          </h2>
          <p className="text-xl text-gray-600">Everything you need to know about PersonaBot and how it works.</p>
        </div>

        <div className="space-y-4">
          {faqs.map((faq, index) => (
            <div 
              key={index}
              className={`group border-2 transition-all duration-300 rounded-3xl overflow-hidden ${
                openIndex === index ? 'border-orange-200 bg-white shadow-xl shadow-orange-500/5' : 'border-orange-50 bg-white/50 hover:border-orange-100 hover:bg-white'
              }`}
            >
              <button
                onClick={() => setOpenIndex(openIndex === index ? null : index)}
                className="w-full p-8 flex items-center justify-between text-left"
              >
                <span className={`text-xl font-bold transition-colors ${openIndex === index ? 'text-orange-700' : 'text-gray-900 group-hover:text-orange-600'}`}>
                  {faq.question}
                </span>
                {openIndex === index ? (
                  <ChevronUp className="w-6 h-6 text-orange-600 shrink-0" />
                ) : (
                  <ChevronDown className="w-6 h-6 text-gray-500 shrink-0 group-hover:text-orange-600" />
                )}
              </button>
              <div 
                className={`transition-all duration-300 ease-in-out overflow-hidden ${
                  openIndex === index ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
                }`}
              >
                <div className="p-8 pt-0 text-lg text-gray-600 leading-relaxed border-t border-orange-50 mt-2">
                  {faq.answer}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

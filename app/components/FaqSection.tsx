'use client';

import { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import type { Faq } from '@/lib/types';

interface FaqSectionProps {
  faqs: Faq[];
}

export default function FaqSection({ faqs }: FaqSectionProps) {
  const [openId, setOpenId] = useState<number | null>(null);

  const toggleFaq = (id: number) => {
    setOpenId(openId === id ? null : id);
  };

  return (
    <section className="py-12 md:py-16 bg-surface-container px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-8">
          <h2 className="text-2xl md:text-3xl font-bold text-on-surface tracking-tight">
            Pertanyaan Umum (FAQ)
          </h2>
        </div>
        <div className="space-y-3">
          {faqs.map((faq) => {
            const isOpen = openId === faq.id;
            return (
              <div
                key={faq.id}
                className="bg-surface-container-lowest rounded-lg border border-border/30 overflow-hidden shadow-sm hover:shadow transition-all duration-300"
              >
                <button
                  onClick={() => toggleFaq(faq.id)}
                  className="w-full text-left px-5 py-4 flex justify-between items-center gap-4 hover:bg-surface-bright transition-colors focus:outline-none"
                >
                  <span className="font-semibold text-on-surface text-sm md:text-base">
                    {faq.question}
                  </span>
                  <ChevronDown
                    className={`w-4 h-4 text-secondary transition-transform duration-300 flex-shrink-0 ${
                      isOpen ? 'rotate-180 text-primary' : ''
                    }`}
                  />
                </button>
                <div
                  className={`transition-all duration-300 ease-in-out ${
                    isOpen ? 'max-h-[500px] border-t border-border/10' : 'max-h-0'
                  } overflow-hidden`}
                >
                  <div className="px-5 py-4 text-on-surface-variant text-xs md:text-sm leading-relaxed bg-surface-bright/30">
                    {faq.answer}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

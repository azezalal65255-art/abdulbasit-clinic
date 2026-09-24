import React, { useState } from 'react';
import { ChevronDown, HelpCircle } from 'lucide-react';
import { FAQS } from '../data/clinicData';
import { useClinicData } from '../context/ClinicDataContext';

export const FaqSection: React.FC = () => {
  const { faqs: contextFaqs } = useClinicData();
  const faqs = contextFaqs?.length ? contextFaqs : FAQS;

  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const toggle = (idx: number) => {
    setOpenIndex(openIndex === idx ? null : idx);
  };

  return (
    <section id="faq" className="py-16 md:py-20 bg-white border-b border-[#E2EAF0]">
      <div className="w-full max-w-4xl mx-auto px-4 sm:px-6">
        
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto mb-12">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#F0F7FC] border border-[#BED8EA] text-[#064B82] text-xs font-bold mb-3">
            <span>إجابات لاستفساراتكم</span>
          </div>
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-black text-[#064B82] mb-2">
            الأسئلة الشائعة
          </h2>
          <div className="geometric-divider">
            <span className="geometric-divider-center" />
          </div>
          <p className="text-sm sm:text-base text-[#4B6375]">
            إجابات طبية وافية لأبرز الأسئلة المتكررة حول الفحوصات والمناظير وأمراض الكبد والجهاز الهضمي
          </p>
        </div>

        {/* Accordions */}
        <div className="space-y-3.5">
          {faqs.map((faq, idx) => {
            const isOpen = openIndex === idx;
            return (
              <div
                key={idx}
                className={`border rounded-xl transition-all duration-200 overflow-hidden ${
                  isOpen
                    ? 'bg-[#F0F7FC] border-[#BED8EA] shadow-2xs'
                    : 'bg-white border-[#E2EAF0] hover:border-[#BED8EA]'
                }`}
              >
                <button
                  onClick={() => toggle(idx)}
                  className="w-full flex items-center justify-between p-4 sm:p-5 text-right font-bold text-[#064B82] hover:text-[#0872B9] transition-colors cursor-pointer gap-4"
                  aria-expanded={isOpen}
                >
                  <div className="flex items-center gap-3">
                    <HelpCircle className={`w-5 h-5 shrink-0 ${isOpen ? 'text-[#55A630]' : 'text-slate-400'}`} />
                    <span className="text-sm sm:text-base leading-snug">{faq.question}</span>
                  </div>
                  <ChevronDown
                    className={`w-5 h-5 shrink-0 text-slate-400 transition-transform duration-200 ${
                      isOpen ? 'rotate-180 text-[#0872B9]' : ''
                    }`}
                  />
                </button>

                {isOpen && (
                  <div className="px-5 pb-5 pt-1 text-sm text-[#4B6375] leading-relaxed border-t border-[#E2EAF0]/60">
                    <p>{faq.answer}</p>
                  </div>
                )}
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
};

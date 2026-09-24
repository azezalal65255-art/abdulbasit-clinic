import React from 'react';
import { X, CheckCircle, Clock, ShieldCheck, Calendar, MessageCircle } from 'lucide-react';
import { EndoscopyProcedure } from '../types';
import { CLINIC_INFO } from '../data/clinicData';

interface ProcedureModalProps {
  procedure: EndoscopyProcedure | null;
  onClose: () => void;
  onBookClick: () => void;
}

export const ProcedureModal: React.FC<ProcedureModalProps> = ({
  procedure,
  onClose,
  onBookClick,
}) => {
  if (!procedure) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div
        className="relative bg-white w-full max-w-2xl max-h-[90vh] rounded-2xl overflow-y-auto shadow-2xl border border-[#BED8EA] text-right p-6 sm:p-8"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 left-4 z-20 w-10 h-10 rounded-xl bg-white/90 hover:bg-[#E2EAF0] text-[#17354F] flex items-center justify-center border border-[#BED8EA] transition-colors cursor-pointer"
          aria-label="إغلاق"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Top Image Preview */}
        <div className="relative aspect-16/9 w-full rounded-xl overflow-hidden mb-6 bg-slate-100 border border-[#E2EAF0]">
          <img
            src={procedure.image}
            alt={procedure.title}
            className="w-full h-full object-cover"
            referrerPolicy="no-referrer"
          />
        </div>

        {/* Header */}
        <div className="mb-6 border-b border-[#E2EAF0] pb-4">
          <div className="flex items-center gap-2 mb-2">
            <span className="bg-[#F0F8EC] border border-[#C5E6B5] text-[#55A630] text-xs font-bold px-3 py-1 rounded-full">
              وحدة المناظير التخصصية
            </span>
            <span className="flex items-center gap-1 text-xs text-[#4B6375] bg-[#F0F7FC] px-3 py-1 rounded-full border border-[#BED8EA]">
              <Clock className="w-3.5 h-3.5 text-[#0872B9]" />
              المدة: {procedure.duration}
            </span>
          </div>

          <h2 className="text-2xl sm:text-3xl font-black text-[#064B82]">
            {procedure.title}
          </h2>
          <p className="text-sm text-[#4B6375] mt-2 leading-relaxed">
            {procedure.description}
          </p>
        </div>

        {/* Indications */}
        <div className="mb-6">
          <h3 className="text-base font-bold text-[#064B82] mb-3 flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-[#55A630]" />
            <span>متى يُنصح بهذا الإجراء الطبي؟</span>
          </h3>
          <ul className="space-y-2">
            {procedure.indications.map((item, idx) => (
              <li
                key={idx}
                className="flex items-start gap-2.5 p-3 rounded-xl bg-[#F8FAFC] border border-[#E2EAF0] text-xs sm:text-sm text-[#17354F]"
              >
                <CheckCircle className="w-4 h-4 text-[#55A630] shrink-0 mt-0.5" />
                <span className="leading-snug">{item}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Preparation Notes */}
        <div className="mb-8 bg-[#F0FDF4] border border-[#C5E6B5] p-4 rounded-xl">
          <h4 className="text-xs sm:text-sm font-bold text-[#55A630] mb-1">
            إرشادات وتعليمات التحضير:
          </h4>
          <p className="text-xs sm:text-sm text-[#17354F] leading-relaxed">
            {procedure.preparation}
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center gap-3 pt-4 border-t border-[#E2EAF0]">
          <button
            onClick={() => {
              onClose();
              onBookClick();
            }}
            className="w-full sm:w-auto flex-1 inline-flex items-center justify-center gap-2 bg-[#55A630] hover:bg-[#489228] text-white font-bold py-3 px-5 rounded-xl transition-all shadow-xs cursor-pointer text-sm active:scale-[0.99]"
          >
            <Calendar className="w-4 h-4" />
            <span>حجز موعد للمنظار</span>
          </button>

          <a
            href={CLINIC_INFO.social.whatsapp}
            target="_blank"
            rel="noreferrer"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-[#25D366] hover:bg-[#20ba59] text-white font-bold py-3 px-5 rounded-xl transition-all shadow-xs cursor-pointer text-sm active:scale-[0.99]"
          >
            <MessageCircle className="w-4 h-4" />
            <span>استفسار فوري عبر واتساب</span>
          </a>
        </div>

      </div>
    </div>
  );
};

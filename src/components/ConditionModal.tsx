import React from 'react';
import { X, CheckCircle2, AlertTriangle, Calendar, MessageCircle } from 'lucide-react';
import { MedicalCondition } from '../types';
import { CLINIC_INFO } from '../data/clinicData';

interface ConditionModalProps {
  condition: MedicalCondition | null;
  onClose: () => void;
  onBookClick: () => void;
  onViewFullPage?: () => void;
}

export const ConditionModal: React.FC<ConditionModalProps> = ({
  condition,
  onClose,
  onBookClick,
  onViewFullPage,
}) => {
  if (!condition) return null;

  const handleWhatsApp = () => {
    const text = `السلام عليكم، أود استشارة د. عبدالباسط عبده الحاج مقبل بخصوص حالة: (${condition.name})`;
    window.open(`https://wa.me/967${CLINIC_INFO.whatsapp}?text=${encodeURIComponent(text)}`, '_blank');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div
        className="relative bg-white w-full max-w-2xl max-h-[90vh] rounded-2xl overflow-y-auto shadow-2xl border border-[#BED8EA] text-right p-6 sm:p-8"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 left-4 z-20 w-10 h-10 rounded-xl bg-[#F0F7FC] hover:bg-[#E2EAF0] text-[#17354F] flex items-center justify-center border border-[#BED8EA] transition-colors cursor-pointer"
          aria-label="إغلاق"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Title Header */}
        <div className="mb-6 border-b border-[#E2EAF0] pb-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#F0F7FC] border border-[#BED8EA] text-[#064B82] text-xs font-bold mb-2">
            <span>دليل الحالات المرضية</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-[#064B82]">
            {condition.name}
          </h2>
          <p className="text-sm text-[#4B6375] mt-2 leading-relaxed">
            {condition.description}
          </p>
        </div>

        {/* Symptoms & Signs */}
        <div className="mb-6">
          <h3 className="text-base font-bold text-[#064B82] mb-3 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-500" />
            <span>الأعراض والعلامات الشائعة:</span>
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {condition.symptoms.map((symptom, idx) => (
              <div
                key={idx}
                className="flex items-center gap-2 p-2.5 rounded-xl bg-[#F8FAFC] border border-[#E2EAF0] text-xs sm:text-sm text-[#17354F]"
              >
                <CheckCircle2 className="w-4 h-4 text-[#55A630] shrink-0" />
                <span>{symptom}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Clinical Protocol / Treatment approach */}
        <div className="mb-8">
          <h3 className="text-base font-bold text-[#064B82] mb-3 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-[#55A630]" />
            <span>المنهج التشخيصي والعلاجي في العيادة:</span>
          </h3>
          <p className="text-xs sm:text-sm text-[#17354F] leading-relaxed bg-[#F0FDF4] border border-[#C5E6B5] p-4 rounded-xl">
            {condition.treatmentApproach}
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center gap-3 pt-4 border-t border-[#E2EAF0]">
          {onViewFullPage && (
            <button
              onClick={() => {
                onClose();
                onViewFullPage();
              }}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-[#0c3653] hover:bg-[#08253b] text-white font-bold py-3 px-4 rounded-xl transition-all shadow-xs cursor-pointer text-sm active:scale-[0.99]"
            >
              <span>الصفحة التفصيلية للحالة</span>
            </button>
          )}

          <button
            onClick={() => {
              onClose();
              onBookClick();
            }}
            className="w-full sm:w-auto flex-1 inline-flex items-center justify-center gap-2 bg-[#55A630] hover:bg-[#489228] text-white font-bold py-3 px-5 rounded-xl transition-all shadow-xs cursor-pointer text-sm active:scale-[0.99]"
          >
            <Calendar className="w-4 h-4" />
            <span>حجز موعد للكشف الطبي</span>
          </button>

          <button
            onClick={handleWhatsApp}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-[#25D366] hover:bg-[#20ba59] text-white font-bold py-3 px-5 rounded-xl transition-all shadow-xs cursor-pointer text-sm active:scale-[0.99]"
          >
            <MessageCircle className="w-4 h-4" />
            <span>استفسار عبر واتساب</span>
          </button>
        </div>

      </div>
    </div>
  );
};

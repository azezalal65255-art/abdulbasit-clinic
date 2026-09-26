import React, { useState } from 'react';
import { EndoscopyProcedure } from '../types';
import { Clock, CheckCircle2, X, Calendar, ChevronLeft, Sparkles, Stethoscope } from 'lucide-react';
import { EndoscopySlider } from './EndoscopySlider';

interface EndoscopySectionProps {
  onSelectProcedure?: (procedure: EndoscopyProcedure) => void;
  onOpenBooking?: () => void;
}

export const EndoscopySection: React.FC<EndoscopySectionProps> = ({ onSelectProcedure, onOpenBooking }) => {
  const [selectedProc, setSelectedProc] = useState<EndoscopyProcedure | null>(null);

  // The EXACT 4 cards in reference-model-1.png (Right-to-Left order):
  const procedures: EndoscopyProcedure[] = [
    {
      id: 'colonoscopy',
      title: 'منظار القولون',
      description: 'لتشخيص أمراض القولون والمستقيم والزوائد والالتهابات والنزيف وغيرها',
      image: '/images/colonoscopy_2026_1790363483272.jpg',
      indications: ['الكشف المبكر عن زوائد القولون واستئصالها', 'تقييم نزيف الجهاز الهضمي والأنيميا', 'تشخيص التهابات القولون التقرحية'],
      duration: 'من 20 إلى 30 دقيقة تقريبًا',
      prepSummary: 'نظام تحضير بملين خاص قبل الإجراء بيوم لتنظيف وتفريغ القولون بالكامل.',
    },
    {
      id: 'gastroscopy',
      title: 'منظار المعدة',
      description: 'لتشخيص أمراض المريء والمعدة والاثني عشر والقرحة والالتهابات وغيرها',
      image: '/images/upper_endoscopy_2026_1790363471039.jpg',
      indications: ['حرقة المريء المستمرة والارتجاع', 'تشخيص وعلاج القرحات والنزيف', 'صعوبة وعسر البلع وفحص الجرثومة'],
      duration: 'من 10 إلى 15 دقيقة تقريبًا',
      prepSummary: 'صيام 6 إلى 8 ساعات قبل الإجراء، ويتم تحت مهدئ خفيف وآمن دون أي شعور بالألم.',
    },
    {
      id: 'biopsy',
      title: 'أخذ الخزعات',
      description: 'أخذ عينة صغيرة لفحصها في المختبر للحصول على تشخيص أدق',
      image: '/images/med_photo_biopsy_microscope_1790359460826.jpg',
      indications: ['تأكيد الفحص النسيجي لحساسية القمح (السيلياك)', 'تحليل نشاط بكتيريا جرثومة المعدة', 'فحص طبيعة التغيرات المخاطية والزوائد'],
      duration: 'أثناء المنظار دون وقت إضافي',
      prepSummary: 'إجراء روتيني وسلس تماماً يمنح الطبيب تقريراً مجهرياً قاطعاً لتحديد العلاج الأمثل.',
    },
    {
      id: 'prep',
      title: 'التحضير للمنظار',
      description: 'تعليمات وإرشادات مهمة قبل إجراء المنظار لضمان أفضل النتائج',
      image: '/images/med_photo_prep_room_1790359507129.jpg',
      indications: ['تنظيم أدوية الضغط والسيولة والسكري', 'ساعات الصيام والتحضير الغذائي المناسب', 'تعليمات الراحة بعد الإجراء والمغادرة الآمنة'],
      duration: 'توجيه واستشارة قبل الموعد',
      prepSummary: 'نحرص على طمأنينة المريض التامة ومتابعة كافة المؤشرات الحيوية قبل وأثناء الفحص.',
    },
  ];

  const handleCardClick = (proc: EndoscopyProcedure) => {
    setSelectedProc(proc);
    if (onSelectProcedure) onSelectProcedure(proc);
  };

  return (
    <section id="endoscopy" className="py-12 md:py-16 bg-[#FAFBFD] border-b border-[#e2eaf0]" dir="rtl">
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6">
        
        {/* Section Header */}
        <div className="text-center mb-8 sm:mb-10">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-50 border border-blue-200/80 text-[#0872B9] text-xs font-bold mb-3 shadow-2xs">
            <Sparkles className="w-3.5 h-3.5 text-[#0872B9]" />
            <span>وحدة مناظير الجهاز الهضمي المتقدمة</span>
          </div>
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-black text-[#0c3653] mb-2">
            مناظير الجهاز الهضمي والتدخلات الدقيقة
          </h2>
          <div className="w-12 h-1 bg-[#0872B9] rounded-full mx-auto" />
          <p className="text-xs sm:text-sm text-slate-600 font-medium mt-3 max-w-2xl mx-auto leading-relaxed">
            تقنيات تشخيصية وعلاجية عالية الدقة بدون ألم، تحت إشراف استشاري الباطنة والكبد والمناظير وفق أحدث البروتوكولات الطبية العالمية.
          </p>
        </div>

        {/* Dynamic Animated Endoscopy Slider (Atmospheric, No Doctor Face) */}
        <EndoscopySlider onOpenBooking={onOpenBooking} />

        {/* Sub-header for procedures */}
        <div className="flex items-center justify-between mb-6 pt-2">
          <div className="flex items-center gap-2">
            <Stethoscope className="w-5 h-5 text-[#0872B9]" />
            <h3 className="text-lg sm:text-xl font-black text-[#0c3653]">
              الفحوصات والإجراءات التفصيلية للمناظير
            </h3>
          </div>
          <span className="text-xs text-slate-500 font-medium hidden sm:inline-block">
            اضغط على أي فحص للاطلاع على تفاصيل التحضير والمدة
          </span>
        </div>

        {/* 4 Photo Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 sm:gap-6">
          {procedures.map((item) => (
            <div
              key={item.id}
              className="bg-white border border-slate-200/90 hover:border-[#0872B9]/60 rounded-2xl overflow-hidden shadow-xs hover:shadow-lg transition-all duration-300 flex flex-col justify-between text-center group"
            >
              <div>
                {/* Photo */}
                <div className="relative aspect-16/10 w-full overflow-hidden bg-slate-100">
                  <img
                    src={item.image}
                    alt={item.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    referrerPolicy="no-referrer"
                    loading="lazy"
                  />
                </div>

                {/* Content */}
                <div className="p-5">
                  <h3 className="text-base sm:text-lg font-bold text-[#0c3653] mb-2">
                    {item.title}
                  </h3>
                  <p className="text-xs text-[#52748e] leading-relaxed line-clamp-3">
                    {item.description}
                  </p>
                </div>
              </div>

              {/* Action Button */}
              <div className="p-5 pt-0">
                <button
                  onClick={() => handleCardClick(item)}
                  className="w-full py-2 rounded-lg border border-[#0872B9] text-[#0872B9] hover:bg-[#0872B9] hover:text-white text-xs sm:text-sm font-bold transition-colors cursor-pointer"
                >
                  اعرف المزيد
                </button>
              </div>
            </div>
          ))}
        </div>

      </div>

      {/* ================= PROCEDURE DETAIL MODAL ================= */}
      {selectedProc && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 md:p-6 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl w-full max-w-xl max-h-[85vh] flex flex-col shadow-2xl border border-slate-200 overflow-hidden text-right">
            <div className="p-5 border-b border-slate-200 flex items-center justify-between bg-slate-50">
              <h3 className="text-lg font-black text-[#0c3653]">
                {selectedProc.title}
              </h3>
              <button
                onClick={() => setSelectedProc(null)}
                className="w-8 h-8 rounded-full bg-slate-200 hover:bg-slate-300 text-slate-700 flex items-center justify-center font-bold cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-5 sm:p-6 overflow-y-auto space-y-4 text-xs sm:text-sm">
              <p className="text-slate-600 leading-relaxed bg-slate-50 p-3 rounded-xl border border-slate-100">
                {selectedProc.description}
              </p>

              <div>
                <h4 className="font-bold text-[#0c3653] mb-2">دواعي الإجراء:</h4>
                <div className="space-y-1.5">
                  {selectedProc.indications.map((ind, idx) => (
                    <div key={idx} className="flex items-center gap-2 p-2 rounded-lg bg-emerald-50 text-emerald-900">
                      <CheckCircle2 className="w-4 h-4 text-[#2fa84f] shrink-0" />
                      <span>{ind}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <h4 className="font-bold text-[#0c3653] mb-1">المدة المتوقعة والتحضير:</h4>
                <div className="bg-blue-50/70 p-3 rounded-xl border border-blue-100 text-slate-700 space-y-1">
                  <p><strong>المدة:</strong> {selectedProc.duration}</p>
                  <p><strong>التحضير:</strong> {selectedProc.prepSummary}</p>
                </div>
              </div>

              <div className="pt-2">
                <a
                  href="#booking"
                  onClick={() => setSelectedProc(null)}
                  className="w-full py-2.5 rounded-xl bg-[#2fa84f] hover:bg-[#279144] text-white font-bold flex items-center justify-center gap-2"
                >
                  <Calendar className="w-4 h-4" />
                  <span>حجز موعد لهذا الإجراء</span>
                </a>
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};

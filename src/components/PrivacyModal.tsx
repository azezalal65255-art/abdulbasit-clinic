import React from 'react';
import { X, Shield, FileText } from 'lucide-react';
import { CLINIC_INFO } from '../data/clinicData';

interface PrivacyModalProps {
  type: 'privacy' | 'terms' | null;
  onClose: () => void;
}

export const PrivacyModal: React.FC<PrivacyModalProps> = ({ type, onClose }) => {
  if (!type) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div
        className="relative bg-white w-full max-w-2xl max-h-[85vh] rounded-2xl overflow-y-auto shadow-2xl border border-[#BED8EA] text-right p-6 sm:p-8"
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

        {type === 'privacy' ? (
          <div>
            <div className="flex items-center gap-2.5 mb-4">
              <Shield className="w-6 h-6 text-[#55A630]" />
              <h2 className="text-xl sm:text-2xl font-bold text-[#064B82]">
                سياسة الخصوصية وسرية بيانات المرضى
              </h2>
            </div>

            <div className="text-xs sm:text-sm text-[#17354F] leading-relaxed space-y-4 border-t border-[#E2EAF0] pt-4">
              <p>
                نولي في <strong>{CLINIC_INFO.clinicName}</strong> أهمية قصوى لخصوصية وسرية السجلات الطبية والبيانات الشخصية لجميع المرضى والمراجعين الكرام.
              </p>

              <h4 className="font-bold text-[#064B82]">1. جمع البيانات</h4>
              <p>
                تُجمع المعلومات الشخصية (مثل الاسم، رقم الهاتف، والبيانات الصحية الأولية) فقط لتنظيم حجز المواعيد والتواصل المباشر بشأن الفحوصات والزيارات الطبية.
              </p>

              <h4 className="font-bold text-[#064B82]">2. سرية السجلات الطبية</h4>
              <p>
                تخضع جميع الملفات والفحوصات وتقارير المناظير والتحاليل المخبرية لأعلى معايير السرية المهنية والطبية، ولا تتم مشاركتها مع أي طرف ثالث خارج إطار الرعاية الصحية المباشرة للمريض.
              </p>

              <h4 className="font-bold text-[#064B82]">3. التواصل والرسائل</h4>
              <p>
                يتم التواصل عبر الهاتف أو الواتساب المعتمد للعيادة لأغراض تذكير المواعيد وتعليمات التحضير للمناظير فقط.
              </p>
            </div>
          </div>
        ) : (
          <div>
            <div className="flex items-center gap-2.5 mb-4">
              <FileText className="w-6 h-6 text-[#0872B9]" />
              <h2 className="text-xl sm:text-2xl font-bold text-[#064B82]">
                شروط الاستخدام وإخلاء المسؤولية الطبية
              </h2>
            </div>

            <div className="text-xs sm:text-sm text-[#17354F] leading-relaxed space-y-4 border-t border-[#E2EAF0] pt-4">
              <p>
                أهلاً بكم في الموقع الرسمي لـ <strong>{CLINIC_INFO.clinicName}</strong>. يُرجى مراجعة الشروط العامة للاستخدام:
              </p>

              <h4 className="font-bold text-[#064B82]">1. المحتوى التثقيفي والتوعوي</h4>
              <p>
                جميع المعلومات الطبية والمقالات المنشورة في هذا الموقع تهدف إلى التوعية الصحية العامة، ولا تُعد بأي حال من الأحوال بديلاً عن الاستشارة الطبية المباشرة أو الفحص السريري من قِبل الطبيب المختص.
              </p>

              <h4 className="font-bold text-[#064B82]">2. طلبات المواعيد</h4>
              <p>
                إرسال نموذج حجز الموعد عبر الموقع الإلكتروني يُعد طلبًا مبدئيًا، ويصبح الموعد مؤكدًا فقط بعد تواصل إدارة العيادة هاتفياً أو عبر الواتساب لتأكيد الساعة واليوم.
              </p>

              <h4 className="font-bold text-[#064B82]">3. حالات الطوارئ</h4>
              <p>
                في حال وجود أعراض طارئة أو حادة كنزيف الجهاز الهضمي الحاد أو الآلام الشديدة المفاجئة، يجب التوجه فورًا إلى أقرب قسم طوارئ أو مستشفى مؤهل.
              </p>
            </div>
          </div>
        )}

        <div className="mt-6 pt-4 border-t border-[#E2EAF0] text-center">
          <button
            onClick={onClose}
            className="bg-[#064B82] hover:bg-[#0872B9] text-white font-bold text-xs sm:text-sm px-6 py-2.5 rounded-xl transition-all cursor-pointer active:scale-[0.99] shadow-xs"
          >
            فهمت وموافق
          </button>
        </div>

      </div>
    </div>
  );
};

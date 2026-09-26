import { PROTECTED_SUPABASE_DOCTOR_PHOTO, LOCAL_DOCTOR_PHOTO } from "../constants/clinicAssets";
import React from 'react';
import { Check, Calendar, Clock, MapPin, Phone } from 'lucide-react';
import { CLINIC_INFO } from '../data/clinicData';
import { useClinicData } from '../context/ClinicDataContext';

interface WhyChooseUsProps {
  onBookClick: () => void;
}

export const WhyChooseUs: React.FC<WhyChooseUsProps> = ({ onBookClick }) => {
  const { doctor } = useClinicData();
  const points = [
    'خبرة متخصصة في أمراض الباطنة والجهاز الهضمي والكبد.',
    'تقييم وتشخيص دقيق للحالة.',
    'رعاية شخصية ومتابعة مستمرة.',
    'الالتزام بمعايير الجودة والسلامة الطبية.',
  ];

  return (
    <section id="why-us" className="py-16 md:py-20 bg-[#F6FAFC] border-b border-[#E2EAF0]">
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6">
        
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-stretch">
          
          {/* Right Column: Why Choose Us (7 cols on desktop) */}
          <div className="lg:col-span-7 geometric-card p-6 sm:p-8 flex flex-col justify-between">
            <div className="flex flex-col sm:flex-row gap-6 items-center sm:items-start">
              
              {/* Doctor portrait thumbnail with mathematically balanced inner radius */}
              <div className="w-32 h-40 sm:w-40 sm:h-52 rounded-xl overflow-hidden bg-slate-100 shrink-0 border border-[#E2EAF0] shadow-2xs">
                <img
                  src={doctor?.photo || PROTECTED_SUPABASE_DOCTOR_PHOTO}
                  onError={(e) => { (e.currentTarget as HTMLImageElement).src = LOCAL_DOCTOR_PHOTO; }}
                  alt={doctor?.name || "د. عبدالباسط عبده الحاج مقبل"}
                  className="w-full h-full object-contain object-top bg-white"
                  referrerPolicy="no-referrer"
                />
              </div>

              {/* Text content */}
              <div className="flex-1 text-right">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#F0F7FC] border border-[#BED8EA] text-[#064B82] text-xs font-bold mb-3">
                  <span>معايير العناية الطبية</span>
                </div>
                <h2 className="text-2xl sm:text-3xl font-black text-[#064B82] mb-2">
                  لماذا تختار عيادتنا؟
                </h2>
                <div className="w-12 h-1 bg-[#55A630] rounded-full mb-4" />

                <p className="text-xs sm:text-sm text-[#4B6375] mb-6 leading-relaxed">
                  نكرس خبراتنا الأكاديمية والسريرية لتوفير تشخيص منهجي دقيق وخطط علاجية مخصصة لكل مريض، مع مراعاة أعلى بروتوكولات التعقيم والأمان الطبي.
                </p>

                {/* 4 Points */}
                <div className="space-y-3">
                  {points.map((pt, idx) => (
                    <div key={idx} className="flex items-start gap-3 text-xs sm:text-sm text-[#17354F] font-semibold">
                      <div className="w-5 h-5 rounded-full bg-[#F0F8EC] border border-[#C5E6B5] text-[#55A630] flex items-center justify-center shrink-0 mt-0.5">
                        <Check className="w-3.5 h-3.5" />
                      </div>
                      <span className="leading-snug">{pt}</span>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          </div>

          {/* Left Column: Clinic Working Hours Card (مواعيد العيادة) */}
          <div className="lg:col-span-5 geometric-card p-6 sm:p-8 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2.5">
                  <div className="w-10 h-10 rounded-xl bg-[#F0F7FC] border border-[#E2EAF0] flex items-center justify-center text-[#0872B9]">
                    <Clock className="w-5 h-5" />
                  </div>
                  <h3 className="text-xl sm:text-2xl font-bold text-[#064B82]">
                    مواعيد العيادة
                  </h3>
                </div>
                <span className="text-[11px] font-bold text-[#55A630] bg-[#F0F8EC] border border-[#C5E6B5] px-2.5 py-1 rounded-full">
                  السبت – الخميس
                </span>
              </div>

              <p className="text-xs text-[#4B6375] mb-6">
                نستقبل مراجعينا الكرام خلال الفترتين الصباحية والمسائية طوال أيام الأسبوع عدا الجمعة.
              </p>

              {/* Working Hours Table */}
              <div className="overflow-hidden rounded-xl border border-[#E2EAF0] mb-6 shadow-2xs">
                <table className="w-full text-right text-xs sm:text-sm">
                  <thead className="bg-[#F8FAFC] text-[#064B82] font-bold border-b border-[#E2EAF0]">
                    <tr>
                      <th className="p-3">الفترة</th>
                      <th className="p-3">الوقت</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#E2EAF0] text-[#17354F]">
                    <tr className="hover:bg-slate-50 transition-colors">
                      <td className="p-3 font-bold text-[#0872B9] flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-[#0872B9]" />
                        الفترة الصباحية
                      </td>
                      <td className="p-3 font-semibold">
                        {CLINIC_INFO.morningHours}
                      </td>
                    </tr>
                    <tr className="hover:bg-slate-50 transition-colors">
                      <td className="p-3 font-bold text-[#55A630] flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-[#55A630]" />
                        الفترة المسائية
                      </td>
                      <td className="p-3 font-semibold">
                        {CLINIC_INFO.eveningHours}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* Clinic Location reminder */}
              <div className="bg-[#F8FAFC] p-3 rounded-xl border border-[#E2EAF0] mb-4 flex items-start gap-2 text-xs text-[#4B6375]">
                <MapPin className="w-4 h-4 text-[#0872B9] shrink-0 mt-0.5" />
                <span>{CLINIC_INFO.address}</span>
              </div>
            </div>

            {/* Bottom Advice & CTA */}
            <div className="pt-4 border-t border-[#E2EAF0]">
              <div className="flex items-center justify-between mb-3 text-xs sm:text-sm font-bold text-[#064B82]">
                <div className="flex items-center gap-1.5">
                  <Calendar className="w-4 h-4 text-[#55A630]" />
                  <span>يفضل الحجز المسبق لتجنب الانتظار</span>
                </div>
              </div>

              <button
                id="schedule-book-btn"
                onClick={onBookClick}
                className="w-full inline-flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-sm font-bold bg-[#55A630] hover:bg-[#489228] text-white transition-all shadow-xs hover:shadow cursor-pointer active:scale-[0.99]"
              >
                <Calendar className="w-4 h-4" />
                <span>احجز موعدك الآن</span>
              </button>
            </div>
          </div>

        </div>

      </div>
    </section>
  );
};

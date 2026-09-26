import { PROTECTED_SUPABASE_DOCTOR_PHOTO, LOCAL_DOCTOR_PHOTO } from "../constants/clinicAssets";
import React, { useState } from 'react';
import { Stethoscope, Heart, Shield, Cpu, Award, X, CheckCircle2, GraduationCap } from 'lucide-react';
import { QUALIFICATIONS, CLINIC_INFO } from '../data/clinicData';
import { useClinicData } from '../context/ClinicDataContext';

export const AboutDoctorSection: React.FC = () => {
  const { doctor } = useClinicData();
  const [showQualificationsModal, setShowQualificationsModal] = useState(false);

  const doctorName = doctor?.name || CLINIC_INFO.doctorName;
  const doctorTitle = 'استشاري أمراض الباطنة والكبد والجهاز الهضمي ومناظير الجهاز الهضمي.';
  const doctorBio =
    'خبرة واسعة في تشخيص وعلاج أمراض الباطنة والكبد والجهاز الهضمي باستخدام أحدث التقنيات والمناظير الطبية.';
  const qualifications = doctor?.qualifications?.length ? doctor.qualifications : QUALIFICATIONS;

  const features = [
    {
      id: 1,
      title: 'خبرة واسعة',
      desc: 'سنوات من الخبرة في المجال الطبي',
      icon: Stethoscope,
    },
    {
      id: 2,
      title: 'رعاية شخصية',
      desc: 'اهتمام بكل مريض على حدة',
      icon: Heart,
    },
    {
      id: 3,
      title: 'أجهزة حديثة',
      desc: 'دقة عالية في الفحص والتشخيص',
      icon: Shield,
    },
    {
      id: 4,
      title: 'تقنيات حديثة',
      desc: 'أحدث الأجهزة والتقنيات الطبية',
      icon: Cpu,
    },
  ];

  return (
    <section id="about" className="py-12 md:py-16 bg-white border-b border-[#e2eaf0]" dir="rtl">
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6">
        
        {/* Soft Mint-Green Card Container matching reference-model-1.png */}
        <div className="bg-[#f2faf5] rounded-3xl p-6 sm:p-8 md:p-10 border border-[#d3ede0] shadow-xs">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            
            {/* Column 1 (Right in RTL: Doctor Portrait) */}
            <div className="lg:col-span-4 flex justify-center">
              <div className="w-64 sm:w-72 aspect-4/5 rounded-2xl overflow-hidden bg-white p-2 border border-[#c6e8d6] shadow-md">
                <img
                  src={doctor?.photo || PROTECTED_SUPABASE_DOCTOR_PHOTO}
                  onError={(e) => { (e.currentTarget as HTMLImageElement).src = LOCAL_DOCTOR_PHOTO; }}
                  alt={doctorName}
                  className="w-full h-full object-contain object-center rounded-xl"
                  referrerPolicy="no-referrer"
                />
              </div>
            </div>

            {/* Column 2 (Middle: Info & Bio) */}
            <div className="lg:col-span-4 flex flex-col items-start text-right">
              <span className="text-xs font-bold text-[#2fa84f] bg-white border border-[#c6e8d6] px-3 py-1 rounded-full mb-3 shadow-2xs">
                عن الدكتور
              </span>

              <h2 className="text-2xl sm:text-3xl font-black text-[#0c3653] leading-tight mb-2">
                {doctorName}
              </h2>

              <p className="text-xs sm:text-sm font-bold text-[#0872B9] mb-4">
                {doctorTitle}
              </p>

              <p className="text-xs sm:text-sm text-[#4b6375] leading-relaxed mb-6 font-medium">
                {doctorBio}
              </p>

              {/* Action Button */}
              <button
                onClick={() => setShowQualificationsModal(true)}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg border border-[#0872B9] text-[#0872B9] bg-white hover:bg-[#0872B9] hover:text-white text-xs sm:text-sm font-bold transition-all shadow-2xs cursor-pointer active:scale-98"
              >
                <Award className="w-4 h-4" />
                <span>أعرف المزيد عن الدكتور</span>
              </button>
            </div>

            {/* Column 3 (Left in RTL: 4 Vertical Feature Cards) */}
            <div className="lg:col-span-4 space-y-3">
              {features.map((item) => {
                const IconComponent = item.icon;
                return (
                  <div
                    key={item.id}
                    className="bg-white/95 border border-[#d3ede0] rounded-xl p-3.5 flex items-center gap-3.5 shadow-2xs hover:shadow-xs transition-shadow"
                  >
                    <div className="w-10 h-10 rounded-full bg-[#f0f9f3] text-[#2fa84f] flex items-center justify-center shrink-0 border border-[#c6e9d2]">
                      <IconComponent className="w-5 h-5 text-[#2fa84f]" />
                    </div>
                    <div className="text-right">
                      <h4 className="text-xs sm:text-sm font-bold text-[#0c3653] leading-tight">
                        {item.title}
                      </h4>
                      <p className="text-[11px] text-[#64748B] mt-0.5">
                        {item.desc}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>

          </div>
        </div>

      </div>

      {/* ================= QUALIFICATIONS MODAL (PRESERVING ALL OFFICIAL DEGREES & ACADEMIC CREDENTIALS) ================= */}
      {showQualificationsModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-xl w-full max-h-[85vh] overflow-y-auto p-6 shadow-2xl border border-slate-200 text-right">
            <div className="flex items-center justify-between pb-4 border-b border-slate-200 mb-5">
              <div className="flex items-center gap-2">
                <GraduationCap className="w-5 h-5 text-[#0872B9]" />
                <h3 className="text-lg font-black text-[#0c3653]">
                  المؤهلات العلمية والشهادات التخصصية
                </h3>
              </div>
              <button
                onClick={() => setShowQualificationsModal(false)}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center font-bold cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3.5">
              {qualifications.map((qual, idx) => (
                <div key={idx} className="p-4 rounded-xl bg-slate-50 border border-slate-200">
                  <h4 className="font-bold text-sm text-[#0c3653] mb-1">
                    {qual.degree}
                  </h4>
                  <p className="text-xs font-semibold text-[#2fa84f] mb-1.5">
                    {qual.institution}
                  </p>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    {qual.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </section>
  );
};

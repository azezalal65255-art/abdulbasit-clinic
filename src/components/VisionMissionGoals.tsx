import React from 'react';
import { Compass, Target, CheckCircle2, Award, HeartHandshake, ShieldCheck, Sparkles } from 'lucide-react';
import { soundManager } from '../utils/soundEffects';

export const VisionMissionGoals: React.FC = () => {
  const handleCardClick = () => {
    soundManager.playClickChime();
  };

  return (
    <section id="vision-mission-goals" className="py-12 sm:py-16 bg-gradient-to-b from-[#f8fafc] via-white to-[#f4f8fb] relative overflow-hidden" dir="rtl">
      {/* Subtle Background Vector Patterns */}
      <div className="absolute inset-0 pointer-events-none opacity-40">
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-[#0872B9]/5 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-1/4 w-96 h-96 bg-[#2fa84f]/5 rounded-full blur-3xl" />
      </div>

      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 relative z-10">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-10 sm:mb-14">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-50 border border-emerald-200/80 text-[#2fa84f] text-xs font-bold mb-3 shadow-2xs">
            <Sparkles className="w-3.5 h-3.5 text-[#2fa84f]" />
            <span>قيمنا الطبية وميثاق الجودة</span>
          </div>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black text-[#0c3653] tracking-tight">
            الرؤية، الرسالة، والأهداف السامية
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 font-medium mt-2 leading-relaxed max-w-2xl mx-auto">
            نلتزم بتقديم أرقى مستويات الرعاية التشخيصية والعلاجية لأمراض الباطنة والكبد ومناظير الجهاز الهضمي في اليمن، مرتكزين على أحدث المعايير العلمية العالمية.
          </p>
        </div>

        {/* 3 Vector Grid Boxes with Elegant Green Backgrounds */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8">
          
          {/* 1. الرؤية (Vision) */}
          <div
            onClick={handleCardClick}
            className="group relative bg-gradient-to-br from-[#F0FDF4] via-[#F3FCF6] to-[#DCFCE7]/70 rounded-3xl p-6 sm:p-8 border border-emerald-200/90 shadow-[0_8px_28px_rgba(16,185,129,0.10)] hover:shadow-[0_16px_38px_rgba(16,185,129,0.20)] hover:border-emerald-500/80 transition-all duration-300 transform hover:-translate-y-1.5 cursor-pointer flex flex-col justify-between overflow-hidden"
          >
            {/* Top Accent Vector Ribbon */}
            <div className="absolute top-0 right-0 left-0 h-1.5 bg-gradient-to-r from-emerald-500 via-emerald-600 to-teal-500" />

            {/* Subtle watermark leaf/compass in background */}
            <div className="absolute -bottom-8 -left-8 w-32 h-32 bg-emerald-300/15 rounded-full blur-xl pointer-events-none" />

            <div className="relative z-10">
              {/* Vector Icon Container */}
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-600 to-teal-600 text-white flex items-center justify-center mb-6 group-hover:scale-110 group-hover:rotate-3 transition-transform duration-300 shadow-md shadow-emerald-600/20">
                <Compass className="w-8 h-8 stroke-[2.2]" />
              </div>

              {/* Tag & Title */}
              <div className="flex items-center gap-2 mb-2">
                <span className="text-[11px] font-extrabold tracking-wider uppercase px-3 py-1 rounded-full bg-emerald-100/90 text-emerald-800 border border-emerald-300/80">
                  رؤيتنا المستقبلية
                </span>
              </div>
              <h3 className="text-xl sm:text-2xl font-black text-emerald-950 mb-3 group-hover:text-emerald-700 transition-colors">
                الرؤية
              </h3>

              {/* Description */}
              <p className="text-xs sm:text-[13px] text-emerald-900/85 leading-relaxed font-medium mb-6">
                أن نكون المرجع الطبي الأكثر ثقة وتميزاً في اليمن في تشخيص وعلاج أمراض الباطنة والكبد ومناظير الجهاز الهضمي التداخلية، من خلال مواكبة أحدث التطورات الطبية العالمية وتوفير بيئة استشفائية متطورة محورها سلامة وراحة المريض.
              </p>
            </div>

            {/* Vector Highlights */}
            <div className="pt-4 border-t border-emerald-200/70 flex items-center justify-between text-[11px] font-bold text-emerald-800 relative z-10">
              <span className="inline-flex items-center gap-1.5 text-emerald-700 font-extrabold">
                <Award className="w-4 h-4 text-emerald-600" />
                <span>ريادة طبية</span>
              </span>
              <span className="inline-flex items-center gap-1.5 text-emerald-800">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span>معايير دولية</span>
              </span>
            </div>
          </div>

          {/* 2. الرسالة (Mission) */}
          <div
            onClick={handleCardClick}
            className="group relative bg-gradient-to-br from-[#ECFDF5] via-[#EFFBF4] to-[#D1FAE5]/80 rounded-3xl p-6 sm:p-8 border border-emerald-200/90 shadow-[0_8px_28px_rgba(16,185,129,0.10)] hover:shadow-[0_16px_38px_rgba(16,185,129,0.20)] hover:border-emerald-500/80 transition-all duration-300 transform hover:-translate-y-1.5 cursor-pointer flex flex-col justify-between overflow-hidden"
          >
            {/* Top Accent Vector Ribbon */}
            <div className="absolute top-0 right-0 left-0 h-1.5 bg-gradient-to-r from-emerald-600 via-teal-500 to-emerald-500" />

            <div className="absolute -bottom-8 -left-8 w-32 h-32 bg-teal-300/15 rounded-full blur-xl pointer-events-none" />

            <div className="relative z-10">
              {/* Vector Icon Container */}
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-600 to-teal-700 text-white flex items-center justify-center mb-6 group-hover:scale-110 group-hover:-rotate-3 transition-transform duration-300 shadow-md shadow-emerald-600/20">
                <HeartHandshake className="w-8 h-8 stroke-[2.2]" />
              </div>

              {/* Tag & Title */}
              <div className="flex items-center gap-2 mb-2">
                <span className="text-[11px] font-extrabold tracking-wider uppercase px-3 py-1 rounded-full bg-emerald-100/90 text-emerald-800 border border-emerald-300/80">
                  رسالتنا الإنسانية
                </span>
              </div>
              <h3 className="text-xl sm:text-2xl font-black text-emerald-950 mb-3 group-hover:text-emerald-700 transition-colors">
                الرسالة
              </h3>

              {/* Description */}
              <p className="text-xs sm:text-[13px] text-emerald-900/85 leading-relaxed font-medium mb-6">
                تقديم رعاية طبية متكاملة وإنسانية قائمة على التشخيص الدقيق وحسن الاستماع للمريض، وتطبيق بروتوكولات علاجية مخصصة ومبنية على الدليل العلمي، مع استخدام أحدث تقنيات المناظير التشخيصية والعلاجية وفق أعلى معايير التعقيم والسلامة.
              </p>
            </div>

            {/* Vector Highlights */}
            <div className="pt-4 border-t border-emerald-200/70 flex items-center justify-between text-[11px] font-bold text-emerald-800 relative z-10">
              <span className="inline-flex items-center gap-1.5 text-emerald-700 font-extrabold">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>تشخيص دقيق</span>
              </span>
              <span className="inline-flex items-center gap-1.5 text-emerald-900">
                <HeartHandshake className="w-4 h-4 text-emerald-600" />
                <span>رعاية إنسانية</span>
              </span>
            </div>
          </div>

          {/* 3. الأهداف السامية (Objectives & Goals) */}
          <div
            onClick={handleCardClick}
            className="group relative bg-gradient-to-br from-[#F0FDF4] via-[#F4FCF7] to-[#DCFCE7]/70 rounded-3xl p-6 sm:p-8 border border-emerald-200/90 shadow-[0_8px_28px_rgba(16,185,129,0.10)] hover:shadow-[0_16px_38px_rgba(16,185,129,0.20)] hover:border-emerald-500/80 transition-all duration-300 transform hover:-translate-y-1.5 cursor-pointer flex flex-col justify-between overflow-hidden"
          >
            {/* Top Accent Vector Ribbon */}
            <div className="absolute top-0 right-0 left-0 h-1.5 bg-gradient-to-r from-teal-500 via-emerald-600 to-emerald-700" />

            <div className="absolute -bottom-8 -left-8 w-32 h-32 bg-emerald-300/15 rounded-full blur-xl pointer-events-none" />

            <div className="relative z-10">
              {/* Vector Icon Container */}
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-teal-700 to-emerald-600 text-white flex items-center justify-center mb-6 group-hover:scale-110 group-hover:rotate-3 transition-transform duration-300 shadow-md shadow-emerald-600/20">
                <Target className="w-8 h-8 stroke-[2.2]" />
              </div>

              {/* Tag & Title */}
              <div className="flex items-center gap-2 mb-2">
                <span className="text-[11px] font-extrabold tracking-wider uppercase px-3 py-1 rounded-full bg-emerald-100/90 text-emerald-800 border border-emerald-300/80">
                  غاياتنا الإستراتيجية
                </span>
              </div>
              <h3 className="text-xl sm:text-2xl font-black text-emerald-950 mb-3 group-hover:text-emerald-700 transition-colors">
                الأهداف
              </h3>

              {/* Objectives List */}
              <ul className="space-y-2.5 mb-4 text-right">
                <li className="flex items-start gap-2 text-xs text-emerald-950 font-semibold">
                  <div className="w-4 h-4 rounded-full bg-emerald-600 text-white flex items-center justify-center shrink-0 mt-0.5 shadow-2xs">
                    <CheckCircle2 className="w-3 h-3 stroke-[3]" />
                  </div>
                  <span>دقة التشخيص المبكر لأمراض الجهاز الهضمي والكبد وقرحات المعدة.</span>
                </li>
                <li className="flex items-start gap-2 text-xs text-emerald-950 font-semibold">
                  <div className="w-4 h-4 rounded-full bg-emerald-600 text-white flex items-center justify-center shrink-0 mt-0.5 shadow-2xs">
                    <CheckCircle2 className="w-3 h-3 stroke-[3]" />
                  </div>
                  <span>توفير أحدث تقنيات المناظير التشخيصية والعلاجية واستئصال اللحميات.</span>
                </li>
                <li className="flex items-start gap-2 text-xs text-emerald-950 font-semibold">
                  <div className="w-4 h-4 rounded-full bg-emerald-600 text-white flex items-center justify-center shrink-0 mt-0.5 shadow-2xs">
                    <CheckCircle2 className="w-3 h-3 stroke-[3]" />
                  </div>
                  <span>المتابعة المستمرة للمرضى ووضع برامج وقائية لحماية الجهاز الهضمي.</span>
                </li>
                <li className="flex items-start gap-2 text-xs text-emerald-950 font-semibold">
                  <div className="w-4 h-4 rounded-full bg-emerald-600 text-white flex items-center justify-center shrink-0 mt-0.5 shadow-2xs">
                    <CheckCircle2 className="w-3 h-3 stroke-[3]" />
                  </div>
                  <span>نشر التوعية الطبية الصحيحة والحد من مضاعفات أمراض الكبد والباطنة.</span>
                </li>
              </ul>
            </div>

            {/* Vector Highlights */}
            <div className="pt-4 border-t border-emerald-200/70 flex items-center justify-between text-[11px] font-bold text-emerald-800 relative z-10">
              <span className="inline-flex items-center gap-1.5 text-emerald-700 font-extrabold">
                <Target className="w-4 h-4 text-emerald-600" />
                <span>دقة متناهية</span>
              </span>
              <span className="inline-flex items-center gap-1.5 text-emerald-900">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span>متابعة مخلصة</span>
              </span>
            </div>
          </div>

        </div>

      </div>
    </section>
  );
};

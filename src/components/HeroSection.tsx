import React from 'react';
import { ShieldCheck, Clock, Users, Calendar, Send } from 'lucide-react';
import { useClinicData } from '../context/ClinicDataContext';

interface HeroSectionProps {
  onBookClick: () => void;
  onContactClick: () => void;
}

export const HeroSection: React.FC<HeroSectionProps> = ({ onBookClick, onContactClick }) => {
  const { doctor } = useClinicData();

  return (
    <section
      id="hero"
      className="relative bg-gradient-to-b from-[#f8fbfe] via-white to-[#f0f6fa] overflow-hidden pt-6 pb-16 lg:pt-10 lg:pb-24 border-b border-[#e2eaf0]"
      dir="rtl"
    >
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-center">
          
          {/* ================= RIGHT COLUMN (in RTL): Headline, Features & CTAs ================= */}
          <div className="lg:col-span-5 flex flex-col items-start text-right">
            
            {/* Top Tagline */}
            <span className="text-sm sm:text-base md:text-lg font-bold text-[#0c3653] tracking-wide mb-1">
              رعاية متخصصة ...
            </span>

            {/* Main Green Heading */}
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-[#2fa84f] leading-none mb-2">
              لحياة أفضل
            </h1>

            {/* Specialties Headings */}
            <h2 className="text-2xl sm:text-3xl md:text-[34px] font-black text-[#0c3653] leading-tight">
              أمراض الباطنة والكبد
            </h2>
            <h2 className="text-2xl sm:text-3xl md:text-[34px] font-black text-[#0c3653] leading-tight mb-4">
              ومناظير الجهاز الهضمي
            </h2>

            {/* Subtitle / Description */}
            <p className="text-xs sm:text-sm text-[#52748e] font-medium leading-relaxed mb-6 max-w-md">
              تشخيص دقيق، وعلاج فعال، ورعاية شاملة لصحة الجهاز الهضمي والكبد والباطنة
            </p>

            {/* 3 Circular Feature Icons in a Row */}
            <div className="grid grid-cols-3 gap-2 sm:gap-3 w-full max-w-md mb-7">
              {/* Feature 1: متابعة مستمرة */}
              <div className="flex flex-col items-center text-center p-2 rounded-xl bg-white/90 border border-slate-200/80 shadow-2xs">
                <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-full bg-[#f0f7ff] text-[#0872B9] flex items-center justify-center mb-1.5 border border-blue-100">
                  <Users className="w-5 h-5 text-[#0872B9]" />
                </div>
                <span className="text-[10px] sm:text-[11px] font-bold text-[#0c3653] leading-tight">
                  متابعة مستمرة ورعاية شاملة
                </span>
              </div>

              {/* Feature 2: تشخيص دقيق */}
              <div className="flex flex-col items-center text-center p-2 rounded-xl bg-white/90 border border-slate-200/80 shadow-2xs">
                <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-full bg-[#f0f9f3] text-[#2fa84f] flex items-center justify-center mb-1.5 border border-emerald-100">
                  <Clock className="w-5 h-5 text-[#2fa84f]" />
                </div>
                <span className="text-[10px] sm:text-[11px] font-bold text-[#0c3653] leading-tight">
                  تشخيص دقيق وعلاج فعال
                </span>
              </div>

              {/* Feature 3: رعاية طبية متخصصة */}
              <div className="flex flex-col items-center text-center p-2 rounded-xl bg-white/90 border border-slate-200/80 shadow-2xs">
                <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-full bg-[#f0f7ff] text-[#0872B9] flex items-center justify-center mb-1.5 border border-blue-100">
                  <ShieldCheck className="w-5 h-5 text-[#0872B9]" />
                </div>
                <span className="text-[10px] sm:text-[11px] font-bold text-[#0c3653] leading-tight">
                  رعاية طبية متخصصة
                </span>
              </div>
            </div>

            {/* CTA Buttons side-by-side */}
            <div className="flex items-center gap-3 w-full sm:w-auto">
              {/* Green Booking Button */}
              <button
                id="hero-book-btn"
                onClick={onBookClick}
                className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-2 bg-[#2fa84f] hover:bg-[#279144] text-white font-bold text-xs sm:text-sm px-6 py-2.5 rounded-lg shadow-sm hover:shadow transition-all cursor-pointer active:scale-98"
              >
                <Calendar className="w-4 h-4" />
                <span>احجز موعدك الآن</span>
              </button>

              {/* White with Navy/Blue Border Contact Button */}
              <button
                id="hero-contact-btn"
                onClick={onContactClick}
                className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-2 bg-white hover:bg-slate-50 text-[#0872B9] border border-[#0872B9] font-bold text-xs sm:text-sm px-5 py-2.5 rounded-lg transition-all cursor-pointer shadow-2xs active:scale-98"
              >
                <Send className="w-4 h-4 text-[#0872B9]" />
                <span>تواصل معنا</span>
              </button>
            </div>
          </div>

          {/* ================= CENTER COLUMN: Doctor Cutout Photo ================= */}
          <div className="lg:col-span-4 flex justify-center items-end relative pt-4 lg:pt-0">
            <div className="relative w-72 sm:w-80 md:w-88 max-w-full">
              {/* Soft medical aura background */}
              <div className="absolute inset-0 bg-gradient-to-t from-sky-200/40 via-emerald-100/30 to-transparent rounded-full blur-2xl -z-10 scale-95" />
              
              <div className="relative overflow-hidden">
                <img
                  src={doctor?.photo || "/images/dr-abdulbasit.jpg"}
                  alt="د. عبدالباسط عبده الحاج مقبل"
                  className="w-full h-auto object-contain drop-shadow-lg"
                  referrerPolicy="no-referrer"
                />
              </div>
            </div>
          </div>

          {/* ================= LEFT COLUMN (in RTL): 3D Digestive Graphic & Working Hours Card ================= */}
          <div className="lg:col-span-3 flex flex-col items-center lg:items-end justify-center gap-3">
            
            {/* 3D Digestive System & Endoscopy graphic */}
            <div className="w-full max-w-[260px] flex justify-center">
              <img
                src="/images/digestive_3d.jpg"
                alt="الجهاز الهضمي والمناظير"
                className="w-full h-auto max-h-52 object-contain drop-shadow-md rounded-2xl"
                referrerPolicy="no-referrer"
              />
            </div>

            {/* Clinic Working Hours Card */}
            <div className="w-full max-w-[260px] bg-[#08324f] text-white rounded-2xl p-4 sm:p-5 shadow-xl border border-[#0d476f] text-right">
              {/* Header */}
              <div className="flex items-center gap-2 pb-2.5 border-b border-white/15 mb-3">
                <div className="w-7 h-7 rounded-full bg-[#2fa84f]/20 border border-[#2fa84f]/40 flex items-center justify-center">
                  <Clock className="w-4 h-4 text-[#2fa84f]" />
                </div>
                <h3 className="font-bold text-sm text-white">
                  مواعيد العيادة
                </h3>
              </div>

              {/* Working Hours Rows */}
              <div className="space-y-2.5 text-xs">
                {/* Morning */}
                <div className="text-right">
                  <div className="flex items-center gap-1.5 text-slate-300 font-bold mb-1">
                    <span className="w-2 h-2 rounded-full bg-[#2fa84f]" />
                    <span>الفترة الصباحية:</span>
                  </div>
                  <div className="flex items-center justify-between text-white font-mono font-bold text-[12px] bg-white/10 px-2.5 py-1 rounded-md">
                    <span>8:00 - 2:00 م</span>
                    <Clock className="w-3.5 h-3.5 text-[#2fa84f]" />
                  </div>
                </div>

                {/* Evening */}
                <div className="text-right">
                  <div className="flex items-center gap-1.5 text-slate-300 font-bold mb-1">
                    <span className="w-2 h-2 rounded-full bg-[#2fa84f]" />
                    <span>الفترة المسائية:</span>
                  </div>
                  <div className="flex items-center justify-between text-white font-mono font-bold text-[12px] bg-white/10 px-2.5 py-1 rounded-md">
                    <span>4:30 - 9:00 م</span>
                    <Clock className="w-3.5 h-3.5 text-[#2fa84f]" />
                  </div>
                </div>
              </div>
            </div>

          </div>

        </div>
      </div>

      {/* Decorative bottom curved wave */}
      <div className="absolute bottom-0 inset-x-0 overflow-hidden leading-none pointer-events-none">
        <svg
          viewBox="0 0 1200 120"
          preserveAspectRatio="none"
          className="relative block w-full h-10 text-white fill-current"
        >
          <path d="M0,0 C150,90 350,-40 500,40 C650,120 900,20 1200,60 L1200,120 L0,120 Z" />
        </svg>
      </div>
    </section>
  );
};

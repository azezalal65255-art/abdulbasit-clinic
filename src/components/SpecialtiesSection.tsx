import React from 'react';
import { Stethoscope, ShieldAlert, Activity } from 'lucide-react';
import { Specialty } from '../types';
import { soundManager } from '../utils/soundEffects';

interface SpecialtiesSectionProps {
  onSelectSpecialty: (specialty: Specialty) => void;
}

export const SpecialtiesSection: React.FC<SpecialtiesSectionProps> = ({ onSelectSpecialty }) => {
  const specialties: (Specialty & { iconColor: string; buttonColor: string })[] = [
    {
      id: 'internal',
      title: 'أمراض الباطنة',
      description: 'تشخيص ومتابعة أمراض الباطنة المزمنة مثل السكري وضغط الدم والدهون والغدة الدرقية وفقر الدم وغيرها',
      iconName: 'internal',
      features: ['تشخيص الأمراض المزمنة', 'متابعة السكري والضغط', 'علاج فقر الدم والدهون'],
      iconColor: 'text-[#0872B9]',
      buttonColor: 'bg-[#0872B9] hover:bg-[#065b94]',
    },
    {
      id: 'digestive',
      title: 'أمراض الجهاز الهضمي',
      description: 'تشخيص وعلاج اضطرابات الجهاز الهضمي والمعدة والقولون، الإمساك والانتفاخ والتهابات المعدة والقرحة وغيرها',
      iconName: 'digestive',
      features: ['علاج القولون العصبي', 'علاج قرحة والتهابات المعدة', 'علاج اضطرابات الهضم والارتجاع'],
      iconColor: 'text-[#0872B9]',
      buttonColor: 'bg-[#0872B9] hover:bg-[#065b94]',
    },
    {
      id: 'liver',
      title: 'أمراض الكبد',
      description: 'تشخيص ومتابعة أمراض الكبد والتهاباته وارتفاع إنزيمات الكبد والكبد الدهني والتليف الكبدي وغيرها',
      iconName: 'liver',
      features: ['تشخيص وعلاج الكبد الدهني', 'متابعة ارتفاع إنزيمات الكبد', 'علاج التهابات الكبد والصفراء'],
      iconColor: 'text-[#2fa84f]',
      buttonColor: 'bg-[#2fa84f] hover:bg-[#279144]',
    },
  ];

  return (
    <section id="specialties" className="py-12 md:py-16 bg-white border-b border-[#e2eaf0]" dir="rtl">
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6">
        
        {/* Section Header */}
        <div className="text-center mb-10">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-black text-[#0c3653] mb-2">
            تخصصاتنا
          </h2>
          <div className="w-10 h-1 bg-[#0872B9] rounded-full mx-auto" />
        </div>

        {/* 3 Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
          {specialties.map((item) => (
            <div
              key={item.id}
              id={`card-specialty-${item.id}`}
              onClick={() => {
                soundManager.playClickChime();
                onSelectSpecialty(item);
              }}
              className="bg-white border border-slate-200/90 hover:border-[#0872B9]/60 rounded-2xl p-6 sm:p-8 flex flex-col justify-between items-center text-center shadow-xs hover:shadow-lg transition-all duration-300 group cursor-pointer active:scale-95 active:ring-2 active:ring-[#0872B9]/20"
            >
              <div className="flex flex-col items-center w-full">
                {/* Icon inside subtle circle with bounce & rotate */}
                <div className="w-16 h-16 rounded-full bg-slate-50 border border-slate-200 flex items-center justify-center mb-5 group-hover:scale-110 group-hover:rotate-6 group-active:scale-90 transition-all shadow-2xs">
                  {item.id === 'internal' && <Stethoscope className="w-8 h-8 text-[#0872B9]" />}
                  {item.id === 'digestive' && <ShieldAlert className="w-8 h-8 text-[#0872B9]" />}
                  {item.id === 'liver' && <Activity className="w-8 h-8 text-[#2fa84f]" />}
                </div>

                {/* Title */}
                <h3 className="text-xl sm:text-2xl font-black text-[#0c3653] mb-3 group-hover:text-[#0872B9] transition-colors">
                  {item.title}
                </h3>

                {/* Description */}
                <p className="text-xs sm:text-sm text-[#52748e] leading-relaxed mb-6 font-medium">
                  {item.description}
                </p>
              </div>

              {/* Action Button */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  soundManager.playClickChime();
                  onSelectSpecialty(item);
                }}
                className={`w-full py-2.5 px-4 rounded-lg ${item.buttonColor} text-white text-xs sm:text-sm font-bold shadow-xs hover:shadow transition-all cursor-pointer active:scale-95`}
              >
                اعرف المزيد
              </button>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
};

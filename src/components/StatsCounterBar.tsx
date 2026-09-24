import React from 'react';
import { Users, Award, Activity, CheckCircle2 } from 'lucide-react';

export const StatsCounterBar: React.FC = () => {
  // Exact 4 stats in reference-model-1.png (Right-to-Left order):
  const stats = [
    {
      id: 1,
      number: '+1000',
      label: 'حالة متابعة بشكل مستمر',
      icon: CheckCircle2,
    },
    {
      id: 2,
      number: '+3000',
      label: 'منظار هضمي تم إجراؤها بنجاح',
      icon: Activity,
    },
    {
      id: 3,
      number: '+15',
      label: 'سنوات خبرة في المجال الطبي',
      icon: Award,
    },
    {
      id: 4,
      number: '+5000',
      label: 'مريض تمت معالجتهم',
      icon: Users,
    },
  ];

  return (
    <div id="stats-counter" className="py-8 md:py-10 bg-[#08324f] text-white border-y border-[#0d476f]" dir="rtl">
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 sm:gap-8 items-center text-center">
          {stats.map((item) => {
            const IconComponent = item.icon;
            return (
              <div key={item.id} className="flex flex-col items-center justify-center">
                {/* Icon */}
                <div className="mb-2 text-[#2fa84f]">
                  <IconComponent className="w-6 h-6 sm:w-7 sm:h-7 mx-auto" />
                </div>

                {/* Big Number */}
                <span className="text-2xl sm:text-3xl md:text-4xl font-black text-white font-mono tracking-tight mb-1">
                  {item.number}
                </span>

                {/* Label */}
                <p className="text-xs sm:text-[13px] text-slate-200 font-medium leading-snug max-w-[160px]">
                  {item.label}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

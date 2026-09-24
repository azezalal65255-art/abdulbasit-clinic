import React from 'react';
import { Stethoscope, Activity, Eye, HeartHandshake } from 'lucide-react';
import { INFO_BAR_ITEMS } from '../data/clinicData';

export const InfoBar: React.FC = () => {
  const getIcon = (iconName: string) => {
    switch (iconName) {
      case 'Stethoscope':
        return <Stethoscope className="w-6 h-6 sm:w-7 sm:h-7 text-[#A5D56D]" />;
      case 'Activity':
        return <Activity className="w-6 h-6 sm:w-7 sm:h-7 text-[#A5D56D]" />;
      case 'Eye':
        return <Eye className="w-6 h-6 sm:w-7 sm:h-7 text-[#A5D56D]" />;
      case 'HeartHandshake':
        return <HeartHandshake className="w-6 h-6 sm:w-7 sm:h-7 text-[#A5D56D]" />;
      default:
        return <Stethoscope className="w-6 h-6 sm:w-7 sm:h-7 text-[#A5D56D]" />;
    }
  };

  return (
    <section id="info-bar" className="bg-[#064B82] text-white py-8 border-y border-[#0872B9]/30 relative z-10">
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-0">
          {INFO_BAR_ITEMS.map((item, idx) => (
            <div
              key={idx}
              className={`flex items-center justify-start lg:justify-center gap-4 px-4 ${
                idx < INFO_BAR_ITEMS.length - 1 ? 'lg:border-l lg:border-white/15' : ''
              }`}
            >
              <div className="w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center shrink-0 border border-white/20 shadow-xs">
                {getIcon(item.icon)}
              </div>
              <div>
                <div className="text-base sm:text-lg font-bold text-white leading-snug">
                  {item.title}
                </div>
                <div className="text-xs sm:text-sm text-[#A5D56D] font-medium leading-snug">
                  {item.subtitle}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

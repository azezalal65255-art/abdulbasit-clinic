import React from 'react';
import { MessageCircle } from 'lucide-react';
import { CLINIC_INFO } from '../data/clinicData';

export const FloatingWhatsApp: React.FC = () => {
  return (
    <div className="fixed bottom-20 sm:bottom-8 left-4 sm:left-6 z-40">
      <a
        id="floating-whatsapp-btn"
        href={CLINIC_INFO.social.whatsapp}
        target="_blank"
        rel="noreferrer"
        className="relative group flex items-center gap-2.5 bg-[#25D366] hover:bg-[#20ba59] text-white p-3.5 sm:px-4 sm:py-3 rounded-full shadow-lg hover:shadow-xl border border-white/20 transition-all duration-300 hover:scale-105 active:scale-95"
        aria-label="تواصل عبر واتساب لحجز موعد"
      >
        <MessageCircle className="w-6 h-6 text-white" />
        
        <span className="hidden sm:inline-block text-xs font-bold whitespace-nowrap pl-1">
          احجز عبر واتساب
        </span>

        {/* Pulse indicator */}
        <span className="absolute -top-1 -right-1 flex h-3.5 w-3.5">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-300 opacity-75" />
          <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-emerald-400" />
        </span>
      </a>
    </div>
  );
};

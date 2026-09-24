import React from 'react';
import { Phone, MessageCircle, Calendar, MapPin } from 'lucide-react';
import { CLINIC_INFO } from '../data/clinicData';

interface MobileBottomNavProps {
  onBookClick: () => void;
  onLocationClick: () => void;
}

export const MobileBottomNav: React.FC<MobileBottomNavProps> = ({
  onBookClick,
  onLocationClick,
}) => {
  return (
    <div
      id="mobile-bottom-nav"
      className="xl:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-[#E2EAF0] px-3 py-2 shadow-[0_-4px_16px_rgba(0,0,0,0.06)]"
    >
      <div className="grid grid-cols-4 gap-1.5 max-w-md mx-auto text-center">
        
        {/* 1. Phone Call */}
        <a
          href={`tel:${CLINIC_INFO.phones[0]}`}
          className="flex flex-col items-center justify-center py-1 rounded-xl text-[#064B82] hover:bg-[#F6FAFC] active:bg-slate-100 transition-colors"
        >
          <Phone className="w-5 h-5 text-[#0872B9] mb-1" />
          <span className="text-[10px] font-bold">اتصال</span>
        </a>

        {/* 2. WhatsApp */}
        <a
          href={CLINIC_INFO.social.whatsapp}
          target="_blank"
          rel="noreferrer"
          className="flex flex-col items-center justify-center py-1 rounded-xl text-[#25D366] hover:bg-[#F0FDF4] active:bg-emerald-100 transition-colors"
        >
          <MessageCircle className="w-5 h-5 mb-1" />
          <span className="text-[10px] font-bold text-[#17354F]">واتساب</span>
        </a>

        {/* 3. Booking CTA (Highlighted) */}
        <button
          onClick={onBookClick}
          className="flex flex-col items-center justify-center py-1 rounded-xl bg-[#55A630] text-white active:bg-[#2F8B3C] shadow-xs cursor-pointer"
        >
          <Calendar className="w-5 h-5 mb-1" />
          <span className="text-[10px] font-bold">حجز موعد</span>
        </button>

        {/* 4. Location */}
        <button
          onClick={onLocationClick}
          className="flex flex-col items-center justify-center py-1 rounded-xl text-[#064B82] hover:bg-[#F6FAFC] active:bg-slate-100 transition-colors cursor-pointer"
        >
          <MapPin className="w-5 h-5 text-[#0872B9] mb-1" />
          <span className="text-[10px] font-bold">الموقع</span>
        </button>

      </div>
    </div>
  );
};

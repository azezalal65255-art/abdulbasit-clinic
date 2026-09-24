import React from 'react';
import { MapPin, Phone, Mail, MessageCircle, Shield } from 'lucide-react';
import { useClinicData } from '../context/ClinicDataContext';

interface TopBarProps {
  onNavigateAdmin?: () => void;
}

export const TopBar: React.FC<TopBarProps> = ({ onNavigateAdmin }) => {
  const { contact } = useClinicData();

  const phoneText = '777560603 | 777554626';
  const emailText = contact?.email || 'baset.clinic@gmail.com';
  const addressText = 'مركز المأمون الطبي التشخيصي، صنعاء – شارع تعز – جولة تعز';
  const whatsappUrl = contact?.social?.whatsapp || 'https://wa.me/967777554626';

  return (
    <div
      id="top-bar"
      className="bg-[#08324f] text-white text-[11px] sm:text-xs h-9 md:h-10 flex items-center border-b border-[#0d476f] relative z-40"
    >
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 flex items-center justify-between">
        {/* Right side (RTL start): Address */}
        <div className="flex items-center gap-1.5 text-slate-100 font-medium">
          <MapPin className="w-3.5 h-3.5 text-[#2fa84f] shrink-0" />
          <span className="truncate">{addressText}</span>
        </div>

        {/* Left side (RTL end): Email, Phones & Social */}
        <div className="flex items-center gap-3 sm:gap-4 md:gap-5">
          {/* Email */}
          <a
            href={`mailto:${emailText}`}
            className="hidden lg:flex items-center gap-1.5 text-slate-200 hover:text-white transition-colors"
          >
            <Mail className="w-3.5 h-3.5 text-[#2fa84f]" />
            <span className="font-sans text-[11px]">{emailText}</span>
          </a>

          {/* Phones */}
          <a
            href="tel:777554626"
            className="flex items-center gap-1.5 text-slate-200 hover:text-white transition-colors dir-ltr font-mono text-[11px]"
          >
            <Phone className="w-3.5 h-3.5 text-[#2fa84f]" />
            <span>{phoneText}</span>
          </a>

          {/* WhatsApp & Call Icons in green circles */}
          <div className="flex items-center gap-1.5">
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noreferrer"
              className="w-6 h-6 rounded-full bg-[#2fa84f] hover:bg-[#279144] text-white flex items-center justify-center transition-transform hover:scale-105 shadow-xs"
              title="واتساب العيادة"
              aria-label="WhatsApp"
            >
              <MessageCircle className="w-3.5 h-3.5" />
            </a>
            <a
              href="tel:777554626"
              className="w-6 h-6 rounded-full bg-[#0d476f] hover:bg-[#115b8d] text-white flex items-center justify-center transition-transform hover:scale-105 shadow-xs"
              title="اتصال هاتفي"
              aria-label="Call"
            >
              <Phone className="w-3 h-3" />
            </a>
          </div>

          {/* Admin link discreetly */}
          <a
            href="/admin"
            onClick={(e) => {
              if (onNavigateAdmin) {
                e.preventDefault();
                onNavigateAdmin();
              }
            }}
            className="flex items-center gap-1 text-[10px] bg-white/10 hover:bg-white/20 text-slate-200 px-2 py-0.5 rounded transition-colors cursor-pointer mr-1"
            title="لوحة الإدارة"
          >
            <Shield className="w-3 h-3 text-[#2fa84f]" />
            <span className="hidden sm:inline">الإدارة</span>
          </a>
        </div>
      </div>
    </div>
  );
};

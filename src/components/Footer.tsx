import { PROTECTED_SUPABASE_CLINIC_LOGO, LOCAL_CLINIC_LOGO } from "../constants/clinicAssets";
import React from 'react';
import { MapPin, Phone, Mail, MessageCircle, Globe, Facebook, Shield } from 'lucide-react';
import { CLINIC_INFO } from '../data/clinicData';
import { useClinicData } from '../context/ClinicDataContext';

interface FooterProps {
  onNavigate: (sectionId: string) => void;
  onOpenPrivacy: () => void;
  onOpenTerms: () => void;
  onOpenCareers?: () => void;
}

export const Footer: React.FC<FooterProps> = ({ onNavigate, onOpenPrivacy, onOpenTerms, onOpenCareers }) => {
  const { settings, doctor, contact, pages = [] } = useClinicData();
  const logoUrl = settings?.logoUrl || PROTECTED_SUPABASE_CLINIC_LOGO;
  const doctorName = doctor?.name || CLINIC_INFO.doctorName;
  const phoneText = '777554626 – 777560603';
  const emailText = contact?.email || CLINIC_INFO.email;
  const addressText = contact?.address || CLINIC_INFO.address;
  const whatsappUrl = contact?.social?.whatsapp || 'https://wa.me/967777554626';
  const googleMapsUrl = contact?.googleMapsUrl || CLINIC_INFO.googleMapsUrl || 'https://maps.app.goo.gl/MCyvMKGM5Bn2ZGFy6';

  const footerCustomPages = pages.filter((p: any) => p.isActive && p.showInFooter);

  return (
    <footer id="contact" className="bg-[#08324f] text-white pt-12 pb-6 border-t border-[#0d476f]">
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6">
        
        {/* 3 Main Columns */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 pb-10 border-b border-white/10 text-right">
          
          {/* Column 1 (Right in RTL: موقع العيادة والخريطة) */}
          <div>
            <h3 className="text-base sm:text-lg font-bold text-white mb-4 pb-1 border-b border-white/15 inline-block">
              موقع العيادة
            </h3>
            
            {/* Map image with pin and link to google maps */}
            <a
              href={googleMapsUrl}
              target="_blank"
              rel="noreferrer"
              className="block rounded-xl overflow-hidden border border-white/20 shadow-md group relative hover:border-[#2fa84f] transition-colors"
            >
              <img
                src="/images/sanaa_map.jpg"
                alt="خريطة موقع عيادة الدكتور عبدالباسط في صنعاء شارع تعز"
                className="w-full h-36 sm:h-40 object-cover group-hover:scale-105 transition-transform duration-500"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 bg-black/20 group-hover:bg-transparent transition-colors flex items-center justify-center">
                <div className="bg-[#08324f]/90 backdrop-blur-xs text-white text-[11px] font-bold px-3 py-1.5 rounded-lg border border-white/20 flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-[#2fa84f]" />
                  <span>فتح في خرائط Google</span>
                </div>
              </div>
            </a>
          </div>

          {/* Column 2 (Center in RTL: روابط سريعة) */}
          <div>
            <h3 className="text-base sm:text-lg font-bold text-white mb-4 pb-1 border-b border-white/15 inline-block">
              روابط سريعة
            </h3>

            <div className="grid grid-cols-2 gap-4 text-xs sm:text-[13px] text-slate-200">
              {/* Sub-column A */}
              <ul className="space-y-2.5">
                <li>
                  <button
                    onClick={() => onNavigate('hero')}
                    className="hover:text-[#2fa84f] transition-colors cursor-pointer"
                  >
                    الرئيسية
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => onNavigate('about')}
                    className="hover:text-[#2fa84f] transition-colors cursor-pointer"
                  >
                    عن الدكتور
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => onNavigate('specialties')}
                    className="hover:text-[#2fa84f] transition-colors cursor-pointer"
                  >
                    التخصصات
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => onNavigate('endoscopy')}
                    className="hover:text-[#2fa84f] transition-colors cursor-pointer"
                  >
                    مناظير الجهاز الهضمي
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => onNavigate('medical-services')}
                    className="hover:text-[#2fa84f] transition-colors cursor-pointer"
                  >
                    الخدمات الطبية
                  </button>
                </li>
              </ul>

              {/* Sub-column B */}
              <ul className="space-y-2.5">
                <li>
                  <button
                    onClick={() => onNavigate('conditions')}
                    className="hover:text-[#2fa84f] transition-colors cursor-pointer"
                  >
                    الحالات المرضية
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => onNavigate('library-booking')}
                    className="hover:text-[#2fa84f] transition-colors cursor-pointer"
                  >
                    المكتبة الطبية
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => onNavigate('videos')}
                    className="hover:text-[#2fa84f] transition-colors cursor-pointer"
                  >
                    مكتبة الفيديو
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => onNavigate('scientific-activities')}
                    className="hover:text-[#2fa84f] transition-colors cursor-pointer"
                  >
                    المؤتمرات والأبحاث
                  </button>
                </li>
                {onOpenCareers && (
                  <li>
                    <button
                      onClick={onOpenCareers}
                      className="hover:text-[#2fa84f] transition-colors cursor-pointer"
                    >
                      الوظائف والتوظيف
                    </button>
                  </li>
                )}
                <li>
                  <button
                    onClick={() => onNavigate('faq')}
                    className="hover:text-[#2fa84f] transition-colors cursor-pointer"
                  >
                    الأسئلة الشائعة
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => onNavigate('booking')}
                    className="hover:text-[#2fa84f] transition-colors cursor-pointer"
                  >
                    حجز موعد
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => onNavigate('contact')}
                    className="hover:text-[#2fa84f] transition-colors cursor-pointer"
                  >
                    تواصل معنا
                  </button>
                </li>
                {footerCustomPages.map((page: any) => (
                  <li key={page.id}>
                    <a
                      href={`/page/${page.slug}`}
                      className="hover:text-[#2fa84f] transition-colors flex items-center gap-1"
                    >
                      <span>{page.title}</span>
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Column 3 (Left in RTL: تواصل معنا) */}
          <div className="space-y-3">
            <h3 className="text-base sm:text-lg font-bold text-white mb-4 pb-1 border-b border-white/15 inline-block">
              تواصل معنا
            </h3>

            {/* Phone */}
            <div className="flex items-center gap-2 text-xs sm:text-[13px] text-slate-200">
              <Phone className="w-4 h-4 text-[#2fa84f] shrink-0" />
              <span className="font-mono dir-ltr">{phoneText}</span>
            </div>

            {/* Email */}
            <div className="flex items-center gap-2 text-xs sm:text-[13px] text-slate-200">
              <Mail className="w-4 h-4 text-[#2fa84f] shrink-0" />
              <span className="font-sans">{emailText}</span>
            </div>

            {/* Address */}
            <div className="flex items-start gap-2 text-xs sm:text-[13px] text-slate-200">
              <MapPin className="w-4 h-4 text-[#2fa84f] shrink-0 mt-0.5" />
              <span>{addressText}</span>
            </div>

            {/* Social Icons Circles */}
            <div className="flex items-center gap-2.5 pt-2">
              <a
                href={googleMapsUrl}
                target="_blank"
                rel="noreferrer"
                className="w-7 h-7 rounded-full bg-white/15 hover:bg-[#2fa84f] text-white flex items-center justify-center transition-colors"
                aria-label="Google Maps"
              >
                <Globe className="w-3.5 h-3.5" />
              </a>
              <a
                href="https://facebook.com"
                target="_blank"
                rel="noreferrer"
                className="w-7 h-7 rounded-full bg-white/15 hover:bg-[#1877F2] text-white flex items-center justify-center transition-colors font-bold text-xs"
                aria-label="Facebook"
              >
                <Facebook className="w-3.5 h-3.5" />
              </a>
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noreferrer"
                className="w-7 h-7 rounded-full bg-white/15 hover:bg-[#2fa84f] text-white flex items-center justify-center transition-colors"
                aria-label="WhatsApp"
              >
                <MessageCircle className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>

        </div>

        {/* Bottom Logo & Copyright Area */}
        <div className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-400">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white p-1 shrink-0 flex items-center justify-center border border-white/20 shadow-xs overflow-hidden">
              <img
                src={logoUrl}
                onError={(e) => { (e.currentTarget as HTMLImageElement).src = LOCAL_CLINIC_LOGO; }}
                alt={doctorName}
                className="w-full h-full object-contain"
                referrerPolicy="no-referrer"
              />
            </div>
            <div className="text-right">
              <p className="font-bold text-white text-sm">{doctorName}</p>
              <p className="text-[11px] text-slate-300">استشاري أمراض الباطنة والجهاز الهضمي والكبد والمناظير</p>
            </div>
          </div>

          <div className="flex items-center gap-4 text-center sm:text-left text-slate-400">
            <p>
              جميع الحقوق محفوظة © {new Date().getFullYear()} عيادة الدكتور عبدالباسط عبده الحاج مقبل
            </p>
            <span className="text-white/20">|</span>
            <a
              href="/admin"
              className="text-xs text-[#2fa84f] hover:text-white font-medium transition-colors bg-white/5 hover:bg-white/10 px-2.5 py-1 rounded-md border border-white/10 flex items-center gap-1.5"
            >
              <Shield className="w-3.5 h-3.5" />
              <span>دخول لوحة التحكم</span>
            </a>
          </div>
        </div>

      </div>
    </footer>
  );
};

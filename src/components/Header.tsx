import React, { useState, useEffect } from 'react';
import { Menu, X, Calendar, Phone } from 'lucide-react';
import { CLINIC_INFO } from '../data/clinicData';
import { useClinicData } from '../context/ClinicDataContext';

interface HeaderProps {
  activeSection: string;
  onNavigate: (sectionId: string) => void;
}

export const Header: React.FC<HeaderProps> = ({ activeSection, onNavigate }) => {
  const { doctor, settings, contact, pages = [] } = useClinicData();
  const doctorName = doctor?.name || CLINIC_INFO.doctorName;
  const doctorTitle = doctor?.title || CLINIC_INFO.doctorTitle;
  const logoUrl = settings?.logoUrl || '/images/clinic-logo.jpg';
  const primaryPhone = contact?.phones?.[0] || '777554626';

  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Ordered navigation links matching reference-model-1.png exactly + dynamic header pages
  const headerCustomPages = pages
    .filter((p: any) => p.isActive && p.showInHeader)
    .map((p: any) => ({
      id: `page-${p.slug}`,
      slug: p.slug,
      label: p.title,
      isCustomPage: true,
    }));

  const navLinks = [
    { id: 'hero', label: 'الرئيسية' },
    { id: 'specialties', label: 'تخصصاتنا' },
    { id: 'medical-services', label: 'خدماتنا' },
    { id: 'conditions', label: 'الحالات المرضية' },
    { id: 'endoscopy', label: 'المناظير' },
    { id: 'about', label: 'عن الدكتور' },
    { id: 'library-booking', label: 'المكتبة الطبية' },
    ...headerCustomPages,
    { id: 'contact', label: 'تواصل معنا' },
  ];

  const handleLinkClick = (link: any) => {
    if (typeof link === 'string') {
      onNavigate(link);
    } else if (link.isCustomPage) {
      window.history.pushState({}, '', `/page/${link.slug}`);
      window.dispatchEvent(new PopStateEvent('popstate'));
    } else {
      onNavigate(link.id);
    }
    setMobileMenuOpen(false);
  };

  return (
    <header
      id="main-header"
      className={`sticky top-0 z-30 bg-white transition-all duration-300 ${
        isScrolled
          ? 'shadow-[0_4px_16px_rgba(6,75,130,0.06)] py-2 border-b border-[#e2eaf0]'
          : 'py-2.5 sm:py-3 border-b border-[#e2eaf0]'
      }`}
      dir="rtl"
    >
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 flex items-center justify-between">
        
        {/* Right side: Doctor & Clinic Identity */}
        <div
          onClick={() => handleLinkClick('hero')}
          className="flex items-center gap-3 cursor-pointer group shrink-0"
        >
          {/* Clinic Logo with 100% fidelity */}
          <div className="w-12 h-12 sm:w-14 sm:h-14 shrink-0 rounded-xl bg-white flex items-center justify-center p-1 border border-slate-200 shadow-2xs group-hover:border-[#2fa84f] transition-colors">
            <img
              src={logoUrl}
              alt={doctorName}
              className="w-full h-full object-contain"
              referrerPolicy="no-referrer"
            />
          </div>

          {/* Text Info */}
          <div className="flex flex-col text-right">
            <h1 className="text-sm sm:text-base md:text-lg font-black text-[#0c3653] group-hover:text-[#0872B9] transition-colors leading-tight">
              {doctorName}
            </h1>
            <p className="text-[10px] sm:text-xs text-[#52748e] font-medium leading-tight mt-0.5 max-w-[280px] sm:max-w-none">
              {doctorTitle}
            </p>
          </div>
        </div>

        {/* Center: Desktop Navigation Bar */}
        <nav className="hidden xl:flex items-center gap-1.5 lg:gap-3">
          {navLinks.map((link) => {
            const isActive = activeSection === link.id;
            return (
              <button
                key={link.id}
                onClick={() => handleLinkClick(link)}
                className={`text-xs lg:text-[13px] font-bold px-2.5 py-1.5 rounded-lg transition-all cursor-pointer ${
                  isActive
                    ? 'text-[#2fa84f] bg-[#f0f9f3]'
                    : 'text-[#0c3653] hover:text-[#0872B9] hover:bg-slate-50'
                }`}
              >
                {link.label}
              </button>
            );
          })}
        </nav>

        {/* Left side: Booking Button & Mobile Menu Toggle */}
        <div className="flex items-center gap-2.5">
          {/* Green "حجز موعد" button */}
          <button
            onClick={() => handleLinkClick('booking')}
            className="inline-flex items-center gap-1.5 px-4 sm:px-5 py-2 rounded-lg bg-[#2fa84f] hover:bg-[#279144] text-white text-xs sm:text-sm font-bold shadow-xs hover:shadow transition-all cursor-pointer active:scale-98"
          >
            <Calendar className="w-4 h-4" />
            <span>حجز موعد</span>
          </button>

          {/* Mobile hamburger menu toggle */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="القائمة الرئيسية"
            className="xl:hidden p-2 rounded-lg text-[#0c3653] hover:bg-slate-100 transition-colors cursor-pointer"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="xl:hidden bg-white border-b border-slate-200 px-4 py-4 shadow-lg animate-in slide-in-from-top-2 duration-200 text-right">
          <div className="flex flex-col space-y-1">
            {navLinks.map((link) => {
              const isActive = activeSection === link.id;
              return (
                <button
                  key={link.id}
                  onClick={() => handleLinkClick(link)}
                  className={`text-right text-sm font-bold px-3 py-2.5 rounded-xl transition-all cursor-pointer ${
                    isActive
                      ? 'text-[#2fa84f] bg-[#f0f9f3]'
                      : 'text-[#0c3653] hover:bg-slate-50'
                  }`}
                >
                  {link.label}
                </button>
              );
            })}
          </div>

          <div className="pt-4 mt-3 border-t border-slate-100 flex items-center justify-between">
            <a
              href={`tel:${primaryPhone}`}
              className="inline-flex items-center gap-2 text-xs font-bold text-[#0872B9]"
            >
              <Phone className="w-4 h-4" />
              <span>{primaryPhone}</span>
            </a>
            <span className="text-[11px] text-slate-400">صنعاء – شارع تعز</span>
          </div>
        </div>
      )}
    </header>
  );
};

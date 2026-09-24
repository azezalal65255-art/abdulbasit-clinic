/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useCallback } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ClinicDataProvider, useClinicData } from './context/ClinicDataContext';
import { TopBar } from './components/TopBar';
import { Header } from './components/Header';
import { HeroSection } from './components/HeroSection';
import { MedicalSlider } from './components/MedicalSlider';
import { SpecialtiesSection } from './components/SpecialtiesSection';
import { MedicalServicesSection } from './components/MedicalServicesSection';
import { ConditionsSection } from './components/ConditionsSection';
import { EndoscopySection } from './components/EndoscopySection';
import { AboutDoctorSection } from './components/AboutDoctorSection';
import { VisionMissionGoals } from './components/VisionMissionGoals';
import { ConditionDetailPage } from './components/ConditionDetailPage';
import { CustomPageView } from './components/CustomPageView';
import { StatsCounterBar } from './components/StatsCounterBar';
import { MedicalLibraryBookingSection } from './components/MedicalLibraryBookingSection';
import { FaqSection } from './components/FaqSection';
import { VideosSection } from './components/VideosSection';
import { ScientificActivitiesSection } from './components/ScientificActivitiesSection';
import { CareersModal } from './components/CareersModal';
import { Footer } from './components/Footer';
import { FloatingWhatsApp } from './components/FloatingWhatsApp';
import { MobileBottomNav } from './components/MobileBottomNav';
import { ArticleModal } from './components/ArticleModal';
import { ConditionModal } from './components/ConditionModal';
import { ProcedureModal } from './components/ProcedureModal';
import { PrivacyModal } from './components/PrivacyModal';
import { AdminLogin } from './components/admin/AdminLogin';
import { AdminLayout } from './components/admin/AdminLayout';
import { MedicalArticle, MedicalCondition, EndoscopyProcedure, Specialty } from './types';
import { ALL_CONDITIONS, DetailedCondition } from './data/conditionsData';
import { Loader2 } from 'lucide-react';

function ClinicAppRouter() {
  const { isAuthenticated, isLoading: isAuthLoading } = useAuth();
  const { pages = [] } = useClinicData();
  const [currentPath, setCurrentPath] = useState<string>(() => window.location.pathname || '/');

  // Navigation handler
  const navigateTo = useCallback((path: string) => {
    if (window.location.pathname !== path) {
      window.history.pushState({}, '', path);
    }
    setCurrentPath(path);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  // Listen to popstate (browser back / forward)
  useEffect(() => {
    const handlePopState = () => {
      setCurrentPath(window.location.pathname || '/');
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  // Intercept local links (e.g. href="/admin", href="/condition/...", href="/page/...", or href="/")
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      const target = (e.target as HTMLElement).closest('a');
      if (!target) return;
      const href = target.getAttribute('href');
      if (href && (href === '/' || href.startsWith('/admin') || href.startsWith('/condition/') || href.startsWith('/page/'))) {
        if (target.getAttribute('target') !== '_blank') {
          e.preventDefault();
          navigateTo(href);
        }
      }
    };
    document.addEventListener('click', handleClick);
    return () => document.removeEventListener('click', handleClick);
  }, [navigateTo]);

  // Public Site state
  const [activeSection, setActiveSection] = useState<string>('hero');
  const [selectedArticle, setSelectedArticle] = useState<MedicalArticle | null>(null);
  const [selectedCondition, setSelectedCondition] = useState<MedicalCondition | null>(null);
  const [selectedDetailedCondition, setSelectedDetailedCondition] = useState<DetailedCondition | null>(null);
  const [selectedProcedure, setSelectedProcedure] = useState<EndoscopyProcedure | null>(null);
  const [privacyModalType, setPrivacyModalType] = useState<'privacy' | 'terms' | null>(null);
  const [bookingPrefill, setBookingPrefill] = useState<{ visitType?: string; notes?: string } | null>(null);
  const [isCareersOpen, setIsCareersOpen] = useState(false);

  // Smooth scroll handler on public site
  const scrollToSection = (sectionId: string) => {
    setActiveSection(sectionId);
    let targetId = sectionId;
    if (sectionId === 'booking') {
      targetId = 'booking';
    }
    const performScroll = () => {
      const element =
        document.getElementById(targetId) ||
        (sectionId === 'booking' ? document.getElementById('library-booking') : null) ||
        document.getElementById(sectionId);
      if (element) {
        const yOffset = -70; // Header offset
        const y = element.getBoundingClientRect().top + window.pageYOffset + yOffset;
        window.scrollTo({ top: y, behavior: 'smooth' });
      }
    };
    performScroll();
    setTimeout(performScroll, 120);
  };

  // Track active section on scroll
  useEffect(() => {
    if (currentPath.startsWith('/admin') || currentPath.startsWith('/condition/')) return;

    const handleScroll = () => {
      const sections = [
        'hero',
        'specialties',
        'medical-services',
        'conditions',
        'endoscopy',
        'about',
        'library-booking',
        'faq',
        'contact',
      ];

      const scrollPosition = window.scrollY + 120;

      for (const sectionId of sections) {
        const element = document.getElementById(sectionId);
        if (element) {
          const top = element.offsetTop;
          const height = element.offsetHeight;
          if (scrollPosition >= top && scrollPosition < top + height) {
            setActiveSection(sectionId);
            break;
          }
        }
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [currentPath]);

  const handleSpecialtyClick = (specialty: Specialty) => {
    if (specialty.id === 'liver' || specialty.id === 'internal') {
      scrollToSection('conditions');
    } else if (specialty.id === 'digestive') {
      scrollToSection('endoscopy');
    } else {
      scrollToSection('about');
    }
  };

  // --- ROUTE 1: /admin/login ---
  if (currentPath === '/admin/login') {
    if (isAuthLoading) {
      return (
        <div className="min-h-screen bg-[#F4F8FB] flex items-center justify-center">
          <Loader2 className="w-8 h-8 text-[#0872B9] animate-spin" />
        </div>
      );
    }
    if (isAuthenticated) {
      navigateTo('/admin');
      return null;
    }
    return (
      <AdminLogin
        onBackToSite={() => navigateTo('/')}
        onLoginSuccess={() => navigateTo('/admin')}
      />
    );
  }

  // --- ROUTE 2: /admin or /admin/* ---
  if (currentPath.startsWith('/admin')) {
    if (isAuthLoading) {
      return (
        <div className="min-h-screen bg-[#F4F8FB] flex flex-col items-center justify-center gap-3" dir="rtl">
          <Loader2 className="w-8 h-8 text-[#0872B9] animate-spin" />
          <p className="text-sm font-semibold text-[#064B82]">جاري التحقق من صلاحيات الدخول...</p>
        </div>
      );
    }

    if (!isAuthenticated) {
      return (
        <AdminLogin
          onBackToSite={() => navigateTo('/')}
          onLoginSuccess={() => navigateTo('/admin')}
        />
      );
    }

    return <AdminLayout />;
  }

  // --- ROUTE 2: Dedicated Disease / Condition Sub-Page (/condition/:slug) ---
  if (currentPath.startsWith('/condition/')) {
    const slug = currentPath.replace(/^\/condition\//, '').replace(/\/$/, '').split('?')[0].split('#')[0];
    const currentCondition =
      ALL_CONDITIONS.find((c) => c.slug === slug || c.id === slug) ||
      selectedDetailedCondition ||
      ALL_CONDITIONS[0];

    return (
      <div className="min-h-screen flex flex-col bg-white text-[#17354F] font-sans antialiased selection:bg-[#2fa84f] selection:text-white pb-16 xl:pb-0">
        <TopBar onNavigateAdmin={() => navigateTo('/admin')} />
        <Header
          activeSection="conditions"
          onNavigate={(sec) => {
            navigateTo('/');
            setTimeout(() => scrollToSection(sec), 120);
          }}
        />
        <main className="flex-1">
          <ConditionDetailPage
            condition={currentCondition}
            onBack={() => {
              navigateTo('/');
              setTimeout(() => scrollToSection('conditions'), 120);
            }}
            onSelectCondition={(cond) => {
              setSelectedDetailedCondition(cond);
              navigateTo('/condition/' + cond.slug);
            }}
            onBookClick={(conditionName) => {
              setBookingPrefill({
                visitType: 'كشف واستشارة طبية',
                notes: `استشارة بخصوص: ${conditionName || currentCondition.name}`,
              });
              navigateTo('/');
              setTimeout(() => scrollToSection('booking'), 120);
            }}
          />
        </main>
        <Footer
          onNavigate={(sec) => {
            navigateTo('/');
            setTimeout(() => scrollToSection(sec), 120);
          }}
          onOpenPrivacy={() => setPrivacyModalType('privacy')}
          onOpenTerms={() => setPrivacyModalType('terms')}
        />
        <FloatingWhatsApp />
        <MobileBottomNav
          onBookClick={() => {
            navigateTo('/');
            setTimeout(() => scrollToSection('booking'), 120);
          }}
          onLocationClick={() => {
            navigateTo('/');
            setTimeout(() => scrollToSection('contact'), 120);
          }}
        />
      </div>
    );
  }

  // --- ROUTE 3: Custom CMS Pages (/page/:slug) ---
  if (currentPath.startsWith('/page/')) {
    const slug = currentPath.replace(/^\/page\//, '').replace(/\/$/, '').split('?')[0].split('#')[0];
    const currentPage = pages.find((p: any) => p.slug === slug || p.id === slug) || {
      id: 'default',
      title: 'صفحة طبية',
      slug,
      content: 'جاري تحميل محتوى الصفحة أو أن الصفحة المطلوبة غير متاحة حالياً.',
      excerpt: '',
    };

    return (
      <div className="min-h-screen flex flex-col bg-white text-[#17354F] font-sans antialiased selection:bg-[#2fa84f] selection:text-white pb-16 xl:pb-0">
        <TopBar onNavigateAdmin={() => navigateTo('/admin')} />
        <Header
          activeSection="pages"
          onNavigate={(sec) => {
            navigateTo('/');
            setTimeout(() => scrollToSection(sec), 120);
          }}
        />
        <main className="flex-1">
          <CustomPageView
            page={currentPage}
            onBack={() => navigateTo('/')}
            onBookClick={() => {
              setBookingPrefill({
                visitType: 'كشف واستشارة طبية',
                notes: `استشارة بخصوص: ${currentPage.title}`,
              });
              navigateTo('/');
              setTimeout(() => scrollToSection('booking'), 120);
            }}
          />
        </main>
        <Footer
          onNavigate={(sec) => {
            navigateTo('/');
            setTimeout(() => scrollToSection(sec), 120);
          }}
          onOpenPrivacy={() => setPrivacyModalType('privacy')}
          onOpenTerms={() => setPrivacyModalType('terms')}
        />
        <FloatingWhatsApp />
        <MobileBottomNav
          onBookClick={() => {
            navigateTo('/');
            setTimeout(() => scrollToSection('booking'), 120);
          }}
          onLocationClick={() => {
            navigateTo('/');
            setTimeout(() => scrollToSection('contact'), 120);
          }}
        />
      </div>
    );
  }

  // --- ROUTE 4: Public Website (/) ---
  return (
    <div className="min-h-screen flex flex-col bg-white text-[#17354F] font-sans antialiased selection:bg-[#2fa84f] selection:text-white pb-16 xl:pb-0">
      {/* 1. Top Bar */}
      <TopBar onNavigateAdmin={() => navigateTo('/admin')} />

      {/* 2. Sticky Header with 100% matching nav */}
      <Header
        activeSection={activeSection}
        onNavigate={scrollToSection}
      />

      {/* Main Content Sections - Matching reference-model-1.png exactly */}
      <main className="flex-1">
        {/* 1. Hero Section: ترحيب الزائر، هوية الدكتور، المواعيد والحجز السريع */}
        <HeroSection
          onBookClick={() => scrollToSection('booking')}
          onContactClick={() => scrollToSection('contact')}
        />

        {/* 2. تخصصاتنا (3 Cards: باطنة، هضم، كبد) */}
        <SpecialtiesSection
          onSelectSpecialty={handleSpecialtyClick}
        />

        {/* 3. خدماتنا الطبية (جميع الخدمات الطبية الـ 19 مصنفة مع محرك بحث ونوافذ تفصيلية) */}
        <MedicalServicesSection
          onServiceClick={(serviceName) => {
            setBookingPrefill({
              visitType: 'كشف واستشارة طبية',
              notes: `طلب حجز لخدمة: ${serviceName}`,
            });
            scrollToSection('booking');
          }}
          onSelectService={(service) => {
            setBookingPrefill({
              visitType: 'كشف واستشارة طبية',
              notes: `طلب حجز لخدمة: ${service.title}`,
            });
            scrollToSection('booking');
          }}
        />

        {/* 4. الحالات المرضية التي نعالجها (7 Cards + عرض جميع الحالات) */}
        <ConditionsSection
          onSelectCondition={(cond) => {
            setSelectedDetailedCondition(cond);
            navigateTo('/condition/' + cond.slug);
          }}
        />

        {/* 5. مناظير الجهاز الهضمي (سلايدر متحرك متطور + 4 بطاقات تفصيلية) */}
        <EndoscopySection
          onSelectProcedure={(proc) => setSelectedProcedure(proc)}
          onOpenBooking={() => scrollToSection('booking')}
        />

        {/* 6. عن الدكتور (الكارت الأخضر الناعم + مؤهلات الدكتور والمميزات) */}
        <AboutDoctorSection />

        {/* 6.1 الرؤية والرسالة والأهداف (مربعات أنيقة فكتورات) */}
        <VisionMissionGoals />

        {/* 7. عدادات الإنجازات والخبرة الطبية (شريط كحلي داكن: +1000, +3000, +15, +5000) */}
        <StatsCounterBar />

        {/* 8. المكتبة الطبية (4 مقالات) + احجز موعدك الآن (استمارة الحجز) */}
        <MedicalLibraryBookingSection
          onSelectArticle={(article) => setSelectedArticle(article)}
          prefill={bookingPrefill}
        />

        {/* 9. مكتبة الفيديو والتثقيف الطبي */}
        <VideosSection />

        {/* 10. المؤتمرات والأبحاث العلمية */}
        <ScientificActivitiesSection />

        {/* 11. الأسئلة الشائعة والأجوبة الطبية */}
        <FaqSection />
      </main>

      {/* Section 12: Footer (3 Columns: موقع العيادة + خريطة صنعاء, روابط سريعة, تواصل معنا) */}
      <Footer
        onNavigate={scrollToSection}
        onOpenPrivacy={() => setPrivacyModalType('privacy')}
        onOpenTerms={() => setPrivacyModalType('terms')}
        onOpenCareers={() => setIsCareersOpen(true)}
      />

      {/* Floating WhatsApp Quick Action Button */}
      <FloatingWhatsApp />

      {/* Mobile Bottom Navigation Bar */}
      <MobileBottomNav
        onBookClick={() => scrollToSection('booking')}
        onLocationClick={() => scrollToSection('contact')}
      />

      {/* Interactive Detail Modals */}
      <CareersModal
        isOpen={isCareersOpen}
        onClose={() => setIsCareersOpen(false)}
      />
      <ArticleModal
        article={selectedArticle}
        onClose={() => setSelectedArticle(null)}
        onBookClick={() => scrollToSection('booking')}
      />

      <ConditionModal
        condition={selectedCondition}
        onClose={() => setSelectedCondition(null)}
        onBookClick={() => scrollToSection('booking')}
        onViewFullPage={() => {
          if (!selectedCondition) return;
          const match = ALL_CONDITIONS.find(
            (c) => c.id === selectedCondition.id || c.name.includes(selectedCondition.name.slice(0, 8))
          ) || ALL_CONDITIONS[0];
          setSelectedDetailedCondition(match);
          navigateTo('/condition/' + match.slug);
        }}
      />

      <ProcedureModal
        procedure={selectedProcedure}
        onClose={() => setSelectedProcedure(null)}
        onBookClick={() => scrollToSection('booking')}
      />

      <PrivacyModal
        type={privacyModalType}
        onClose={() => setPrivacyModalType(null)}
      />
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <ClinicDataProvider>
        <ClinicAppRouter />
      </ClinicDataProvider>
    </AuthProvider>
  );
}

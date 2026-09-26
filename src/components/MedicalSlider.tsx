import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useClinicData } from '../context/ClinicDataContext';
import {
  Stethoscope,
  Activity,
  Eye,
  ChevronRight,
  ChevronLeft,
  Calendar,
  CheckCircle2,
  Shield,
  Clock,
  Sparkles,
  Pause,
  Play,
  ArrowLeft,
  Layers,
} from 'lucide-react';

interface MedicalSliderProps {
  onBookClick: () => void;
  onNavigateSection?: (sectionId: string) => void;
}

export type SlideCategory = 'all' | 'internal' | 'liver' | 'endoscopy';

export interface MedicalSlideItem {
  id: string;
  category: 'internal' | 'liver' | 'endoscopy';
  categoryLabel: string;
  categoryBadgeBg: string;
  title: string;
  highlightText: string;
  description: string;
  keyPoints: string[];
  image: string;
  statsLabel: string;
  statsValue: string;
  accentColor: string; // Tailwind color class
  ctaText: string;
}

export const MedicalSlider: React.FC<MedicalSliderProps> = ({
  onBookClick,
  onNavigateSection,
}) => {
  const slidesData: MedicalSlideItem[] = [
    {
      id: 'slide-internal',
      category: 'internal',
      categoryLabel: 'أمراض الباطنية العامة والمزمنة',
      categoryBadgeBg: 'bg-sky-50 text-[#0872B9] border-sky-200',
      title: 'رعاية باطنية متكاملة ومتابعة دقيقة للأمراض المزمنة',
      highlightText: 'تشخيص مبكر ووقاية مستدامة',
      description:
        'متابعة متخصصة وشاملة لمرضى السكري، ضغط الدم، اضطرابات الدهون والكوليسترول، ومشاكل الغدة الدرقية وفقر الدم بنهج طبي حديث يحمي أجهزة الجسم الحيوية.',
      keyPoints: [
        'تقييم شامل ومتابعة دقيقة لوظائف الأعضاء الحيوية',
        'موازنة السكري وضغط الدم وبروتوكولات علاجية متطورة',
        'تشخيص أسباب الإرهاق المزمن، نقص الفيتامينات واضطرابات الأيض',
      ],
      image: '/images/slider_internal_med_1788698696581.jpg',
      statsValue: 'رعاية تخصصية',
      statsLabel: 'في الطب الباطني',
      accentColor: '#0872B9',
      ctaText: 'حجز كشف واستشارة باطنية',
    },
    {
      id: 'slide-liver',
      category: 'liver',
      categoryLabel: 'أمراض الكبد المتخصصة',
      categoryBadgeBg: 'bg-emerald-50 text-[#2fa84f] border-emerald-200',
      title: 'تشخيص متقدم للكبد الدهني وعلاج ارتفاع إنزيمات الكبد',
      highlightText: 'حماية أنسجة الكبد وصحة التمثيل الغذائي',
      description:
        'برامج علاجية ووقائية متقدمة للحد من تراكم الدهون في الكبد (الكبد الدهني)، ومتابعة التهابات الكبد الفيروسية والمناعية والحد من مضاعفات التليف الكبدي.',
      keyPoints: [
        'فحص دقيق لوظائف وإنزيمات الكبد والدهون الثلاثية',
        'خطة متكاملة لتقليل دهون الكبد واستعادة نشاط الخلايا الكبدية',
        'متابعة دورية مستمرة لحالات التهاب الكبد المزمن وحمايته',
      ],
      image: '/images/slider_liver_care_1788698715188.jpg',
      statsValue: 'تشخيص دقيق',
      statsLabel: 'بأحدث أجهزة الفحص',
      accentColor: '#2fa84f',
      ctaText: 'حجز موعد فحص الكبد',
    },
    {
      id: 'slide-endoscopy-gastro',
      category: 'endoscopy',
      categoryLabel: 'مناظير الجهاز الهضمي المتطورة',
      categoryBadgeBg: 'bg-indigo-50 text-[#0c3653] border-indigo-200',
      title: 'مناظير المعدة والقولون عالية الدقة بمهدئ مريح',
      highlightText: 'رؤية مجهرية فائقة الوضوح مع مهدئ خفيف',
      description:
        'إجراء مناظير الجهاز الهضمي بأحدث تقنيات الفيديو الرقمية الدقيقة، للكشف المبكر عن قرحات المعدة، ارتجاع المريء، استئصال الزوائد اللحمية وأخذ الخزعات بأمان تام.',
      keyPoints: [
        'فحص مريح تحت مهدئ خفيف يقلل الانزعاج لأدنى حد',
        'استئصال الزوائد اللحمية بالقولون فورياً لتجنب التدخلات الجراحية',
        'تعقيم قياسي فائق الدقة وفق أعلى المعايير العالمية لسلامة المرضى',
      ],
      image: '/images/slider_endoscopy_1788698729763.jpg',
      statsValue: 'تقنية متطورة',
      statsLabel: 'مناظير تشخيصية وعلاجية',
      accentColor: '#08324f',
      ctaText: 'حجز موعد منظار هضمي',
    },
    {
      id: 'slide-h-pylori',
      category: 'internal',
      categoryLabel: 'أمراض الجهاز الهضمي والمعدة',
      categoryBadgeBg: 'bg-teal-50 text-[#0c5957] border-teal-200',
      title: 'علاج جرثومة المعدة والتهابات وقرحات الاثني عشر',
      highlightText: 'بروتوكول علاجي معتمد وفق التوصيات الطبية',
      description:
        'علاج بكتيريا الميكروب الحلزوني المسببة للحرقة والانتفاخ وقرحات المعدة، عبر خطة علاجية مخصصة ومتابعة مخبرية تأكيدية.',
      keyPoints: [
        'تشخيص فوري ودقيق لجرثومة المعدة والاختبارات التأكيدية',
        'بروتوكولات دوائية ثلاثية ورباعية حديثة وسهلة التحمل',
        'علاج الحموضة المستمرة وارتجاع المريء وصعوبة الهضم',
      ],
      image: '/images/h_pylori_2026_1790363517478.jpg',
      statsValue: 'بروتوكول معتمد',
      statsLabel: 'في علاج جرثومة المعدة',
      accentColor: '#0c5957',
      ctaText: 'حجز فحص الجهاز الهضمي',
    },
    {
      id: 'slide-colon-care',
      category: 'endoscopy',
      categoryLabel: 'مناظير القولون والوقاية المبكرة',
      categoryBadgeBg: 'bg-emerald-50 text-[#2fa84f] border-emerald-200',
      title: 'الفحص الاستقصائي والوقائي لصحة القولون والجهاز الهضمي',
      highlightText: 'راحة البال مع الاكتشاف المبكر',
      description:
        'برامج الفحص الدوري للقولون والمستقيم لتقييم اضطرابات القولون العصبي، نزيف الجهاز الهضمي، والإسهال أو الإمساك المزمن بأحدث التقنيات الطبية.',
      keyPoints: [
        'تعليمات تحضير مسبقة مبسطة تضمن راحة وسلامة المريض',
        'كشف زوائد القولون واستئصالها بأحدث أدوات التنظير الدقيقة',
        'فريق طبي وتمريضي متمرس يوفر الرعاية والمتابعة بعد الفحص',
      ],
      image: '/images/colonoscopy_2026_1790363483272.jpg',
      statsValue: 'أعلى معايير الأمان',
      statsLabel: 'بأرقى بروتوكولات التعقيم',
      accentColor: '#2fa84f',
      ctaText: 'استشارة فحص القولون',
    },
    {
      id: 'slide-endoscopy-advanced',
      category: 'endoscopy',
      categoryLabel: 'مناظير علاجية متقدمة وتدخلية',
      categoryBadgeBg: 'bg-amber-50 text-amber-800 border-amber-200',
      title: 'ربط دوالي المريء ومنظار القنوات المرارية (ERCP)',
      highlightText: 'تدخل دقيق يجنب العمليات الجراحية',
      description:
        'إجراءات منظارية علاجية دقيقة تشمل ربط وحقن دوالي المريء والمعدة لمرضى الكبد، واستخراج حصوات القنوات المرارية وتركيب الدعامات بدون جراحة.',
      keyPoints: [
        'ربط دوالي المريء بحلقات خاصة لمنع النزيف وتكراره لمرضى الكبد',
        'استخراج حصوات القنوات المرارية وتوسيع التضيقات بالمنظار دون شق جراحي',
        'رعاية فائقة ومراقبة علامات حيوية مستمرة لضمان أعلى مستويات الأمان',
      ],
      image: '/images/med_photo_sterile_tools_1790359485070.jpg',
      statsValue: 'أحدث التقنيات',
      statsLabel: 'مناظير علاجية تداخلية',
      accentColor: '#08324f',
      ctaText: 'استشارة المناظير المتقدمة',
    },
  ];

  const { sliders = [] } = useClinicData();

  // Map active custom slides from database if available
  const activeCustomSlides: MedicalSlideItem[] = (sliders || [])
    .filter((s: any) => s.isActive !== false)
    .map((s: any, idx: number) => ({
      id: s.id || `custom-${idx}`,
      category: 'internal' as const,
      categoryLabel: s.badgeText || 'خدمات العيادة المتخصصة',
      categoryBadgeBg: 'bg-emerald-50 text-[#2D6A4F] border-emerald-200',
      title: s.title,
      highlightText: s.badgeText || 'استشارات متخصصة ورعاية حديثة',
      description: s.subtitle || '',
      keyPoints: [
        'تشخيص دقيق وفق أحدث الإرشادات السريرية العالمية',
        'متابعة شاملة للحالة الصحية مع د. عبدالباسط مقبل',
        'رعاية متميزة مع توفير أحدث التقنيات وأجهزة الفحص',
      ],
      image: s.image || '/images/slider-internal.jpg',
      statsValue: 'رعاية فائقة',
      statsLabel: 'بإشراف استشاري أول',
      accentColor: '#2D6A4F',
      ctaText: s.buttonText || 'حجز موعد استشارة',
    }));

  const allSlides = activeCustomSlides.length > 0 ? activeCustomSlides : slidesData;

  const [activeCategory, setActiveCategory] = useState<SlideCategory>('all');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [progress, setProgress] = useState(0);

  // Filter slides according to category tab
  const filteredSlides = activeCategory === 'all'
    ? allSlides
    : allSlides.filter((s) => s.category === activeCategory || activeCustomSlides.length > 0);

  const SLIDE_DURATION = 6000; // 6 seconds per slide
  const PROGRESS_INTERVAL = 50; // update progress every 50ms

  // Reset index when changing category
  const handleCategoryChange = (category: SlideCategory) => {
    setActiveCategory(category);
    setCurrentIndex(0);
    setProgress(0);
  };

  const nextSlide = useCallback(() => {
    setCurrentIndex((prev) => (prev + 1) % filteredSlides.length);
    setProgress(0);
  }, [filteredSlides.length]);

  const prevSlide = useCallback(() => {
    setCurrentIndex((prev) => (prev - 1 + filteredSlides.length) % filteredSlides.length);
    setProgress(0);
  }, [filteredSlides.length]);

  // Autoplay and Progress timer
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (isPaused || filteredSlides.length <= 1) return;

    timerRef.current = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          nextSlide();
          return 0;
        }
        return prev + (PROGRESS_INTERVAL / SLIDE_DURATION) * 100;
      });
    }, PROGRESS_INTERVAL);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isPaused, filteredSlides.length, nextSlide]);

  // Touch Swipe Handling for Mobile
  const touchStartX = useRef<number | null>(null);
  const touchEndX = useRef<number | null>(null);

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.targetTouches[0].clientX;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    touchEndX.current = e.targetTouches[0].clientX;
  };

  const handleTouchEnd = () => {
    if (!touchStartX.current || !touchEndX.current) return;
    const distance = touchStartX.current - touchEndX.current;
    const minSwipeDistance = 50;

    // In RTL: swiping right means previous, swiping left means next
    if (distance > minSwipeDistance) {
      // Swiped left
      prevSlide();
    } else if (distance < -minSwipeDistance) {
      // Swiped right
      nextSlide();
    }

    touchStartX.current = null;
    touchEndX.current = null;
  };

  const currentSlide = filteredSlides[currentIndex] || filteredSlides[0];

  return (
    <section
      id="medical-slider-section"
      className="py-12 md:py-16 bg-[#f8fbfa] border-b border-[#e2eaf0] relative overflow-hidden"
    >
      {/* Background soft ambient accents */}
      <div className="absolute -top-24 right-10 w-96 h-96 bg-sky-100/50 rounded-full blur-3xl pointer-events-none -z-10" />
      <div className="absolute -bottom-24 left-10 w-96 h-96 bg-emerald-100/50 rounded-full blur-3xl pointer-events-none -z-10" />

      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6">
        
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
          <div className="text-right">
            <div className="inline-flex items-center gap-2 bg-white border border-[#2fa84f]/30 px-3.5 py-1 rounded-full text-xs font-bold text-[#2fa84f] mb-2 shadow-2xs">
              <Sparkles className="w-3.5 h-3.5 text-[#2fa84f]" />
              <span>جولة استعراضية متقدمة</span>
            </div>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-black text-[#0c3653] leading-tight">
              أمراض الباطنية والكبد ومناظير الجهاز الهضمي
            </h2>
            <p className="text-xs sm:text-sm text-[#52748e] font-semibold mt-1">
              تعرف على أحدث بروتوكولات التشخيص والعلاج والخدمات التنظيرية المتطورة بالعيادة
            </p>
          </div>

          {/* Category Filter Tabs */}
          <div className="flex items-center gap-1.5 p-1 bg-white border border-slate-200 rounded-xl shadow-2xs overflow-x-auto">
            <button
              onClick={() => handleCategoryChange('all')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                activeCategory === 'all'
                  ? 'bg-[#08324f] text-white shadow-xs'
                  : 'text-slate-600 hover:text-[#08324f] hover:bg-slate-50'
              }`}
            >
              جميع التخصصات ({slidesData.length})
            </button>
            <button
              onClick={() => handleCategoryChange('internal')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap cursor-pointer flex items-center gap-1.5 ${
                activeCategory === 'internal'
                  ? 'bg-[#0872B9] text-white shadow-xs'
                  : 'text-slate-600 hover:text-[#0872B9] hover:bg-slate-50'
              }`}
            >
              <Stethoscope className="w-3.5 h-3.5" />
              <span>أمراض الباطنية</span>
            </button>
            <button
              onClick={() => handleCategoryChange('liver')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap cursor-pointer flex items-center gap-1.5 ${
                activeCategory === 'liver'
                  ? 'bg-[#2fa84f] text-white shadow-xs'
                  : 'text-slate-600 hover:text-[#2fa84f] hover:bg-slate-50'
              }`}
            >
              <Activity className="w-3.5 h-3.5" />
              <span>أمراض الكبد</span>
            </button>
            <button
              onClick={() => handleCategoryChange('endoscopy')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap cursor-pointer flex items-center gap-1.5 ${
                activeCategory === 'endoscopy'
                  ? 'bg-[#0c3653] text-white shadow-xs'
                  : 'text-slate-600 hover:text-[#0c3653] hover:bg-slate-50'
              }`}
            >
              <Eye className="w-3.5 h-3.5" />
              <span>مناظير الجهاز الهضمي</span>
            </button>
          </div>
        </div>

        {/* ================= MAIN SLIDER CARD ================= */}
        <div
          className="relative bg-white rounded-3xl border border-[#d6e4ec] shadow-xl overflow-hidden group"
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        >
          {/* Animated Top Progress Bar */}
          <div className="w-full bg-slate-100 h-1.5 overflow-hidden">
            <div
              className="h-full bg-gradient-to-l from-[#2fa84f] to-[#0872B9] transition-all duration-75 ease-linear"
              style={{ width: `${progress}%` }}
            />
          </div>

          {/* Slide Content Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 p-6 sm:p-8 lg:p-10 items-center">
            
            {/* RIGHT COLUMN (in RTL): Medical Details, Bullets & CTAs (approx 60%) */}
            <div className="lg:col-span-7 flex flex-col items-start text-right">
              
              {/* Category Badge & Slide Counter */}
              <div className="flex items-center gap-3 mb-3 w-full justify-between sm:justify-start">
                <span
                  className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border ${currentSlide.categoryBadgeBg}`}
                >
                  {currentSlide.category === 'internal' && <Stethoscope className="w-3.5 h-3.5" />}
                  {currentSlide.category === 'liver' && <Activity className="w-3.5 h-3.5" />}
                  {currentSlide.category === 'endoscopy' && <Eye className="w-3.5 h-3.5" />}
                  <span>{currentSlide.categoryLabel}</span>
                </span>

                <div className="flex items-center gap-1 text-[11px] font-mono font-bold text-slate-500 bg-slate-100 px-2.5 py-0.5 rounded-md">
                  <span>{currentIndex + 1}</span>
                  <span>/</span>
                  <span>{filteredSlides.length}</span>
                </div>
              </div>

              {/* Slide Title */}
              <h3 className="text-xl sm:text-2xl lg:text-3xl font-black text-[#0c3653] leading-snug mb-2">
                {currentSlide.title}
              </h3>

              {/* Sub-headline Highlight */}
              <p className="text-xs sm:text-sm font-bold text-[#2fa84f] mb-3 flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 shrink-0" />
                <span>{currentSlide.highlightText}</span>
              </p>

              {/* Description */}
              <p className="text-xs sm:text-sm text-[#4b6375] leading-relaxed mb-5 font-medium">
                {currentSlide.description}
              </p>

              {/* Key Clinical Bullet Points */}
              <div className="space-y-2.5 w-full mb-6">
                {currentSlide.keyPoints.map((point, idx) => (
                  <div
                    key={idx}
                    className="flex items-start gap-2.5 bg-slate-50/90 border border-slate-200/80 rounded-xl p-2.5 text-right transition-colors hover:bg-emerald-50/40 hover:border-emerald-200"
                  >
                    <CheckCircle2 className="w-4 h-4 text-[#2fa84f] shrink-0 mt-0.5" />
                    <span className="text-xs sm:text-[13px] font-semibold text-[#0c3653] leading-snug">
                      {point}
                    </span>
                  </div>
                ))}
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
                <button
                  onClick={onBookClick}
                  className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-2 bg-[#2fa84f] hover:bg-[#279144] text-white text-xs sm:text-sm font-bold px-6 py-3 rounded-xl shadow-md hover:shadow-lg transition-all cursor-pointer active:scale-98"
                >
                  <Calendar className="w-4 h-4" />
                  <span>{currentSlide.ctaText}</span>
                </button>

                {onNavigateSection && (
                  <button
                    onClick={() => {
                      if (currentSlide.category === 'endoscopy') {
                        onNavigateSection('endoscopy');
                      } else if (currentSlide.category === 'liver' || currentSlide.category === 'internal') {
                        onNavigateSection('conditions');
                      } else {
                        onNavigateSection('specialties');
                      }
                    }}
                    className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-1.5 bg-white hover:bg-slate-50 text-[#0c3653] border border-slate-300 text-xs sm:text-sm font-bold px-5 py-3 rounded-xl transition-all cursor-pointer"
                  >
                    <span>تفاصيل أكثر</span>
                    <ArrowLeft className="w-3.5 h-3.5 text-[#0872B9]" />
                  </button>
                )}
              </div>

            </div>

            {/* LEFT COLUMN (in RTL): Visual Image & Stat Overlays (approx 40%) */}
            <div className="lg:col-span-5 relative flex items-center justify-center">
              <div className="relative w-full aspect-4/3 sm:aspect-16/10 rounded-2xl overflow-hidden border border-slate-200 shadow-md group-hover:shadow-lg transition-shadow bg-slate-100">
                <img
                  src={currentSlide.image}
                  alt={currentSlide.title}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-103"
                  referrerPolicy="no-referrer"
                />

                {/* Subtle dark gradient overlay for text readability */}
                <div className="absolute inset-0 bg-gradient-to-t from-[#08324f]/70 via-transparent to-transparent" />

                {/* Floating Bottom Stat Badge */}
                <div className="absolute bottom-4 right-4 left-4 bg-white/95 backdrop-blur-md rounded-xl p-3 border border-white/40 shadow-lg flex items-center justify-between text-right">
                  <div>
                    <span className="text-[10px] text-slate-500 font-bold block">
                      {currentSlide.statsLabel}
                    </span>
                    <span className="text-sm sm:text-base font-black text-[#0c3653]">
                      {currentSlide.statsValue}
                    </span>
                  </div>
                  <div className="w-9 h-9 rounded-full bg-[#f0f9f3] text-[#2fa84f] border border-emerald-200 flex items-center justify-center">
                    <Shield className="w-5 h-5 text-[#2fa84f]" />
                  </div>
                </div>
              </div>
            </div>

          </div>

          {/* ================= BOTTOM BAR CONTROLS ================= */}
          <div className="bg-slate-50 border-t border-slate-200/80 px-6 py-3 flex items-center justify-between">
            
            {/* Slide Navigation Buttons (RTL Order: Right is Next in RTL timeline) */}
            <div className="flex items-center gap-2">
              <button
                onClick={prevSlide}
                className="w-9 h-9 rounded-lg bg-white hover:bg-slate-100 border border-slate-200 text-[#0c3653] flex items-center justify-center transition-colors cursor-pointer shadow-2xs"
                title="الشريحة السابقة"
                aria-label="الشريحة السابقة"
              >
                <ChevronRight className="w-5 h-5" />
              </button>

              <button
                onClick={() => setIsPaused(!isPaused)}
                className="w-9 h-9 rounded-lg bg-white hover:bg-slate-100 border border-slate-200 text-[#0c3653] flex items-center justify-center transition-colors cursor-pointer shadow-2xs"
                title={isPaused ? 'تشغيل العرض التلقائي' : 'إيقاف مؤقت'}
                aria-label="تشغيل / إيقاف العرض"
              >
                {isPaused ? <Play className="w-4 h-4 text-[#2fa84f]" /> : <Pause className="w-4 h-4 text-slate-600" />}
              </button>

              <button
                onClick={nextSlide}
                className="w-9 h-9 rounded-lg bg-white hover:bg-slate-100 border border-slate-200 text-[#0c3653] flex items-center justify-center transition-colors cursor-pointer shadow-2xs"
                title="الشريحة التالية"
                aria-label="الشريحة التالية"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
            </div>

            {/* Dots / Indicators */}
            <div className="flex items-center gap-1.5">
              {filteredSlides.map((slide, idx) => (
                <button
                  key={slide.id}
                  onClick={() => {
                    setCurrentIndex(idx);
                    setProgress(0);
                  }}
                  className={`h-2.5 rounded-full transition-all cursor-pointer ${
                    idx === currentIndex
                      ? 'w-8 bg-[#2fa84f]'
                      : 'w-2.5 bg-slate-300 hover:bg-slate-400'
                  }`}
                  aria-label={`الانتقال إلى الشريحة ${idx + 1}`}
                  title={slide.title}
                />
              ))}
            </div>

            {/* Specialty Mini Switcher (Mobile/Desktop quick indicator) */}
            <div className="hidden sm:flex items-center gap-2 text-xs font-bold text-slate-500">
              <Clock className="w-3.5 h-3.5 text-[#2fa84f]" />
              <span>عرض متحرك مستمر</span>
            </div>

          </div>
        </div>

      </div>
    </section>
  );
};

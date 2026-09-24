import React, { useState, useEffect, useRef } from 'react';
import {
  ChevronRight,
  ChevronLeft,
  Play,
  Pause,
  ShieldCheck,
  Sparkles,
  CheckCircle2,
  Calendar,
  Activity,
  Maximize2,
  Flame,
  Layers,
} from 'lucide-react';
import { soundManager } from '../utils/soundEffects';

export interface EndoscopySlideItem {
  id: string;
  badge: string;
  badgeColor: string;
  title: string;
  subtitle: string;
  description: string;
  features: string[];
  image: string;
  statBadge: { number: string; label: string };
}

const ENDOSCOPY_SLIDES: EndoscopySlideItem[] = [
  {
    id: 'tower-hd',
    badge: 'تقنية تصوير فيديو فائقة الدقة HD 4K',
    badgeColor: 'from-blue-600 to-cyan-600',
    title: 'برج مناظير الجهاز الهضمي الرقمي المتقدم',
    subtitle: 'أحدث معالجات الفيديو الطبية لرؤية مجهرية لبطانة المعدة والقولون',
    description:
      'تم تجهيز وحدة المناظير ببرج مناظير رقمي متكامل ياباني الصنع، مزود بأحدث أنظمة الإضاءة الباردة والمستشعرات الرقمية عالية الحساسية التي تتيح للطبيب اكتشاف أدق التغيرات المخاطية والشعيرات الدموية بدقة استثنائية.',
    features: [
      'معالجة رقمية متطورة لتكبير الأنسجة دون فقدان الوضوح',
      'فحص مريح تحت مهدئ خفيف وآمن دون أي شعور بالألم',
      'شاشات طبية جراحية مخصصة لعرض حي فائق الدقة',
    ],
    image: '/images/conditions/slider_endoscopy_1788698729763.jpg',
    statBadge: { number: 'HD 4K', label: 'دقة استثنائية' },
  },
  {
    id: 'gastro-station',
    badge: 'فحص مريح وآمن للمعدة والمريء',
    badgeColor: 'from-emerald-600 to-teal-600',
    title: 'وحدة مناظير المريء والمعدة والاثني عشر',
    subtitle: 'تشخيص سريع ودقيق لأسباب الحرقة المزمنة، القرحة، وجرثومة المعدة',
    description:
      'نستخدم أنابيب مناظير حديثة فائقة المرونة والنعومة تقلل منعكس الغثيان وتضمن راحة تامة للمريض. يتم الفحص خلال دقائق معدودة مع إمكانية أخذ عينات مجهرية فورية وفحص الجرثومة الحلقية في نفس الجلسة.',
    features: [
      'فحص دقيق للارتجاع المريئي وقرحات المعدة والاثني عشر',
      'أخذ خزعات مجهرية فورية لتشخيص السيلياك وحساسية القمح',
      'تقرير فوري ملون مدعم بالصور الطبية التوضيحية',
    ],
    image: '/images/conditions/gastroscopy_procedure_1788698312313.jpg',
    statBadge: { number: '10-15', label: 'دقيقة فقط' },
  },
  {
    id: 'nbi-colon',
    badge: 'تقنية الضوء الضيق NBI واستئصال اللحميات',
    badgeColor: 'from-indigo-600 to-blue-700',
    title: 'منظار القولون المتقدم واستئصال الزوائد اللحمية',
    subtitle: 'الوقاية الأولى من أورام القولون عبر الكشف المبكر والاستئصال الفوري دون جراحة',
    description:
      'بفضل تقنية الضوء الضيق النطاق (Narrow Band Imaging - NBI)، يستطيع الاستشاري تمييز الأنماط الوعائية للأنسجة وتحديد طبيعة الزوائد واللحميات بدقة متناهية واستئصالها مباشرة بواسطة أدوات تداخلية متخصصة دون الحاجة لتدخل جراحي.',
    features: [
      'استئصال فوري للزوائد اللحمية (Polypectomy) في نفس الجلسة',
      'تشخيص وعلاج نزيف القولون والالتهابات التقرحية المزمنة',
      'فحص وقائي دوري معتمد دولياً لسلامة القولون والمستقيم',
    ],
    image: '/images/conditions/colonoscopy_procedure_1788637565115.jpg',
    statBadge: { number: 'NBI', label: 'كشف مجهري' },
  },
  {
    id: 'sterilization-unit',
    badge: 'أعلى معايير مكافحة العدوى والسلامة',
    badgeColor: 'from-teal-600 to-emerald-700',
    title: 'محطة التعقيم الآلي والمعايرة الطبية القياسية',
    subtitle: 'أجهزة غسيل وتعقيم آلية مغلقة بنظام الحماية الشاملة لكل مريض',
    description:
      'نولي سلامة المرضى الأولوية القصوى، حيث تخضع جميع المناظير والملحقات لدورات تنظيف وتطهير فائقة المستوى داخل غسالات آلية مبرمجة تستخدم محاليل معقمة معتمدة عالمياً، مع توثيق كيميائي لكل دورة تعقيم.',
    features: [
      'تعقيم آلي مغلق 100% يمنع أي احتمالية لانتقال العدوى',
      'ملحقات أحادية الاستخدام لكل مريض (Disposable)',
      'تخزين المناظير في دواليب ضغط إيجابي معقمة بجودة المشافي الكبرى',
    ],
    image: '/images/conditions/endoscopy_advanced_proc_1788699537152.jpg',
    statBadge: { number: '100%', label: 'أمان وتعقيم' },
  },
  {
    id: 'digestive-3d',
    badge: 'شرح طبي متكامل ومجسمات تفاعلية',
    badgeColor: 'from-amber-600 to-emerald-700',
    title: 'التشخيص المدعوم بالنماذج التشريحية ثلاثية الأبعاد',
    subtitle: 'توضيح نتائج المنظار وخطة العلاج للمريض بأسلوب مبسط ومطمئن',
    description:
      'نؤمن بحق المريض في فهم حالته الصحية بوضوح. نوفر شاشات تفاعلية ومجسمات ثلاثية الأبعاد للجهاز الهضمي والكبد لشرح موضع القرحة أو الالتهاب، وتفصيل التعليمات الغذائية والوقائية لضمان التعافي السريع.',
    features: [
      'توضيح وافٍ للمريض والمرافقين قبل وبعد المنظار',
      'نظام متابعة دقيق لنتائج الخزعات المجهرية والعينات',
      'إرشادات غذائية مخصصة لحماية بطانة الجهاز الهضمي',
    ],
    image: '/images/conditions/digestive_system_3d_1788698251854.jpg',
    statBadge: { number: '3D', label: 'رعاية شاملة' },
  },
];

interface EndoscopySliderProps {
  onOpenBooking?: () => void;
}

export const EndoscopySlider: React.FC<EndoscopySliderProps> = ({ onOpenBooking }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [progress, setProgress] = useState(0);
  const [isZoomed, setIsZoomed] = useState(false);
  const touchStartX = useRef<number | null>(null);

  const SLIDE_DURATION = 6500; // 6.5s per slide

  useEffect(() => {
    if (!isPlaying) return;

    const interval = 100; // update progress every 100ms
    const step = (interval / SLIDE_DURATION) * 100;

    const timer = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          setCurrentIndex((idx) => (idx + 1) % ENDOSCOPY_SLIDES.length);
          return 0;
        }
        return prev + step;
      });
    }, interval);

    return () => clearInterval(timer);
  }, [isPlaying, currentIndex]);

  const handleNext = () => {
    soundManager.playClickChime();
    setCurrentIndex((prev) => (prev + 1) % ENDOSCOPY_SLIDES.length);
    setProgress(0);
  };

  const handlePrev = () => {
    soundManager.playClickChime();
    setCurrentIndex((prev) => (prev - 1 + ENDOSCOPY_SLIDES.length) % ENDOSCOPY_SLIDES.length);
    setProgress(0);
  };

  const handleSelectSlide = (idx: number) => {
    soundManager.playClickChime();
    setCurrentIndex(idx);
    setProgress(0);
  };

  const togglePlay = () => {
    soundManager.playClickChime();
    setIsPlaying(!isPlaying);
  };

  // Touch Swipe for Mobile
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX.current === null) return;
    const touchEndX = e.changedTouches[0].clientX;
    const diff = touchStartX.current - touchEndX;

    // RTL: Swipe Left means next, Swipe Right means prev
    if (diff > 40) {
      handleNext();
    } else if (diff < -40) {
      handlePrev();
    }
    touchStartX.current = null;
  };

  const currentSlide = ENDOSCOPY_SLIDES[currentIndex];

  return (
    <div className="relative mb-12 sm:mb-16" dir="rtl">
      {/* Container with Modern Frame & Ambient Glow */}
      <div
        className="relative bg-gradient-to-b from-[#082238] via-[#0b2f4c] to-[#082238] rounded-3xl overflow-hidden shadow-[0_16px_40px_rgba(8,34,56,0.22)] border border-slate-700/60"
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        {/* Subtle Background Pattern */}
        <div className="absolute inset-0 opacity-20 pointer-events-none bg-[radial-gradient(#38bdf8_1px,transparent_1px)] [background-size:24px_24px]" />

        {/* Top Floating Control Bar */}
        <div className="relative z-20 px-4 sm:px-6 pt-4 sm:pt-6 pb-2 flex items-center justify-between gap-3 border-b border-white/10">
          <div className="flex items-center gap-2">
            <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
            <span className="text-xs sm:text-sm font-black text-white tracking-wide">
              سلايدات التجهيزات والتقنيات الطبية الحديثة للمناظير
            </span>
            <span className="hidden sm:inline-block text-[11px] text-cyan-300 bg-cyan-950/60 border border-cyan-800/80 px-2 py-0.5 rounded-full font-bold">
              تكنولوجيا بدون جراحة
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={togglePlay}
              className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
              title={isPlaying ? 'إيقاف مؤقت' : 'تشغيل العرض التلقائي'}
            >
              {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
            </button>
            <span className="text-xs font-mono font-bold text-slate-300">
              {currentIndex + 1} / {ENDOSCOPY_SLIDES.length}
            </span>
          </div>
        </div>

        {/* Main Interactive Slide Body */}
        <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 min-h-[460px] lg:min-h-[480px]">
          
          {/* Left Column: Visual Medical Imagery (Strictly equipment, screens, procedures - NO doctor faces) */}
          <div className="lg:col-span-6 relative overflow-hidden bg-slate-950 flex items-center justify-center order-1 lg:order-2">
            {/* Background Medical Glow */}
            <div className="absolute inset-0 bg-gradient-to-t from-[#082238] via-transparent to-transparent z-10 lg:hidden" />
            <div className="absolute inset-0 bg-gradient-to-r from-[#082238] via-transparent to-transparent z-10 hidden lg:block" />

            <img
              key={currentSlide.id}
              src={currentSlide.image}
              alt={currentSlide.title}
              className="w-full h-full object-cover min-h-[260px] max-h-[380px] lg:max-h-full transition-all duration-700 animate-in fade-in zoom-in-95"
              referrerPolicy="no-referrer"
            />

            {/* Floating High-Tech Stat Pill */}
            <div className="absolute top-4 left-4 z-20 bg-slate-900/85 backdrop-blur-md border border-cyan-500/30 px-3.5 py-2 rounded-2xl text-center shadow-lg">
              <span className="block text-base sm:text-lg font-black text-cyan-400 font-mono">
                {currentSlide.statBadge.number}
              </span>
              <span className="block text-[10px] font-bold text-slate-300">
                {currentSlide.statBadge.label}
              </span>
            </div>

            {/* Inspection Zoom Button */}
            <button
              type="button"
              onClick={() => setIsZoomed(true)}
              className="absolute bottom-4 left-4 z-20 p-2 rounded-xl bg-black/60 hover:bg-black/80 text-white backdrop-blur-xs border border-white/20 transition-all cursor-pointer"
              title="تكبير صورة التجهيزات"
            >
              <Maximize2 className="w-4 h-4" />
            </button>
          </div>

          {/* Right Column: Slide Information & Highlights */}
          <div className="lg:col-span-6 p-6 sm:p-8 lg:p-10 flex flex-col justify-between text-right order-2 lg:order-1 relative z-10">
            <div>
              {/* Badge */}
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold text-white bg-gradient-to-r mb-3 shadow-xs border border-white/15" style={{ background: undefined }}>
                <span className={`inline-block w-2 h-2 rounded-full bg-white animate-pulse`} />
                <span className="text-cyan-200">{currentSlide.badge}</span>
              </div>

              {/* Title & Subtitle */}
              <h3 className="text-xl sm:text-2xl lg:text-3xl font-black text-white mb-2 leading-tight">
                {currentSlide.title}
              </h3>
              <p className="text-xs sm:text-sm text-cyan-300 font-semibold mb-4 leading-relaxed">
                {currentSlide.subtitle}
              </p>

              {/* Description */}
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed mb-6 font-normal">
                {currentSlide.description}
              </p>

              {/* High-Impact Feature Checkpoints */}
              <div className="space-y-2.5 mb-6">
                {currentSlide.features.map((feat, i) => (
                  <div key={i} className="flex items-start gap-2.5 text-xs sm:text-sm text-slate-200">
                    <div className="w-4 h-4 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 flex items-center justify-center shrink-0 mt-0.5">
                      <CheckCircle2 className="w-3 h-3 stroke-[3]" />
                    </div>
                    <span className="font-medium">{feat}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Bottom Actions and Navigation Controls */}
            <div className="pt-4 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4">
              
              {/* Quick Booking CTA */}
              <div className="flex items-center gap-2 w-full sm:w-auto">
                <button
                  type="button"
                  onClick={() => {
                    soundManager.playClickChime();
                    if (onOpenBooking) {
                      onOpenBooking();
                    } else {
                      const el = document.getElementById('contact') || document.getElementById('booking');
                      if (el) el.scrollIntoView({ behavior: 'smooth' });
                    }
                  }}
                  className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 py-2.5 px-5 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white text-xs sm:text-sm font-extrabold rounded-xl shadow-md transition-all active:scale-98 cursor-pointer"
                >
                  <Calendar className="w-4 h-4" />
                  <span>حجز موعد للمنظار</span>
                </button>
              </div>

              {/* Navigation Arrows */}
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handlePrev}
                  className="p-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-all cursor-pointer active:scale-95 border border-white/10"
                  title="السابق"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={handleNext}
                  className="p-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-all cursor-pointer active:scale-95 border border-white/10"
                  title="التالي"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
              </div>

            </div>
          </div>

        </div>

        {/* Dynamic Progress Bar */}
        <div className="w-full h-1 bg-white/10 relative overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-cyan-400 via-emerald-400 to-teal-400 transition-all duration-100 ease-linear"
            style={{ width: `${progress}%` }}
          />
        </div>

        {/* Bottom Slide Selectors / Tabs */}
        <div className="bg-[#051726] px-4 sm:px-6 py-3 border-t border-white/5 flex items-center gap-2 overflow-x-auto custom-scrollbar">
          {ENDOSCOPY_SLIDES.map((slide, idx) => {
            const isActive = idx === currentIndex;
            return (
              <button
                key={slide.id}
                type="button"
                onClick={() => handleSelectSlide(idx)}
                className={`py-1.5 px-3 rounded-xl text-xs font-bold transition-all whitespace-nowrap flex items-center gap-1.5 cursor-pointer ${
                  isActive
                    ? 'bg-[#0872B9] text-white shadow-xs'
                    : 'bg-white/5 text-slate-400 hover:bg-white/10 hover:text-white'
                }`}
              >
                <span className="w-1.5 h-1.5 rounded-full bg-current" />
                <span>{slide.title.split(' ')[0]} {slide.title.split(' ')[1] || ''}</span>
              </button>
            );
          })}
        </div>

      </div>

      {/* Fullscreen Zoom Lightbox Modal */}
      {isZoomed && (
        <div
          onClick={() => setIsZoomed(false)}
          className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-200 cursor-pointer"
        >
          <div className="relative max-w-4xl max-h-[90vh] bg-slate-900 rounded-3xl overflow-hidden border border-white/20 shadow-2xl p-2" onClick={(e) => e.stopPropagation()}>
            <img
              src={currentSlide.image}
              alt={currentSlide.title}
              className="w-full h-auto max-h-[80vh] object-contain rounded-2xl"
              referrerPolicy="no-referrer"
            />
            <div className="p-4 text-center">
              <h4 className="text-white font-bold text-base mb-1">{currentSlide.title}</h4>
              <p className="text-slate-400 text-xs">{currentSlide.subtitle}</p>
            </div>
            <button
              type="button"
              onClick={() => setIsZoomed(false)}
              className="absolute top-4 right-4 p-2 rounded-full bg-white/20 hover:bg-white/40 text-white transition-colors cursor-pointer"
            >
              ✕
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

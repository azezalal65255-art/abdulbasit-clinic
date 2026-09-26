import { useClinicData } from "../context/ClinicDataContext";
import React, { useState, useEffect } from 'react';
import { 
  ArrowRight, 
  Calendar, 
  Phone, 
  AlertTriangle, 
  CheckCircle2, 
  Activity, 
  HelpCircle, 
  ChevronDown, 
  Share2, 
  Check, 
  Stethoscope, 
  ShieldCheck,
  Info
} from 'lucide-react';
import { DetailedCondition, ALL_CONDITIONS } from '../data/conditionsData';
import { soundManager } from '../utils/soundEffects';

interface ConditionDetailPageProps {
  condition: DetailedCondition;
  onBack: () => void;
  onSelectCondition: (cond: DetailedCondition) => void;
  onBookClick: (conditionName: string) => void;
}

export const ConditionDetailPage: React.FC<ConditionDetailPageProps> = ({
  condition,
  onBack,
  onSelectCondition,
  onBookClick,
}) => {
  const { conditions: dynamicConditions = [] } = useClinicData();
  const [copied, setCopied] = useState(false);

  // Dynamic override from Supabase database if edited
  const dbMatch = dynamicConditions.find(
    (dc: any) => dc.id === condition.id || dc.slug === condition.slug || (dc.name && condition.name.includes(dc.name.slice(0, 6)))
  );
  const activeCondition = dbMatch ? {
    ...condition,
    name: dbMatch.name || condition.name,
    shortDescription: dbMatch.description || condition.shortDescription,
    image: dbMatch.image || (dbMatch as any).imageUrl || condition.image,
  } : condition;
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);

  // Scroll to top and update page title when condition changes
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    const originalTitle = document.title;
    document.title = `${condition.name} | د. عبدالباسط عبدالحاج مقبل - استشاري الجهاز الهضمي والكبد`;
    const metaDesc = document.querySelector('meta[name="description"]');
    const prevDesc = metaDesc?.getAttribute('content') || '';
    if (metaDesc) {
      metaDesc.setAttribute('content', condition.shortDescription);
    }

    let metaKeywords = document.querySelector('meta[name="keywords"]');
    const createdKeywords = !metaKeywords;
    if (!metaKeywords && condition.keywords && condition.keywords.length > 0) {
      metaKeywords = document.createElement('meta');
      metaKeywords.setAttribute('name', 'keywords');
      document.head.appendChild(metaKeywords);
    }
    if (metaKeywords && condition.keywords && condition.keywords.length > 0) {
      metaKeywords.setAttribute('content', condition.keywords.join(', '));
    }

    return () => {
      document.title = originalTitle;
      if (metaDesc && prevDesc) {
        metaDesc.setAttribute('content', prevDesc);
      }
      if (createdKeywords && metaKeywords) {
        metaKeywords.remove();
      }
    };
  }, [condition.id, condition.name, condition.shortDescription, condition.keywords]);

  const handleShare = () => {
    soundManager.playClickChime();
    if (navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleFaqToggle = (index: number) => {
    soundManager.playClickChime();
    setOpenFaqIndex(openFaqIndex === index ? null : index);
  };

  // Find related conditions
  const relatedList = ALL_CONDITIONS.filter(
    (c) => c.id !== condition.id && (condition.relatedConditions?.includes(c.id) || c.category === condition.category)
  ).slice(0, 3);

  return (
    <article className="min-h-screen bg-[#F8FAFC] py-8 sm:py-12" dir="rtl">
      <div className="w-full max-w-6xl mx-auto px-4 sm:px-6">
        
        {/* Breadcrumbs & Navigation Bar */}
        <div className="flex flex-wrap items-center justify-between gap-3 mb-6 pb-4 border-b border-slate-200">
          <nav aria-label="مسار التصفح" className="flex items-center gap-2 text-xs sm:text-sm font-bold text-slate-500">
            <button
              onClick={() => {
                soundManager.playClickChime();
                onBack();
              }}
              className="hover:text-[#2fa84f] transition-colors cursor-pointer"
            >
              الرئيسية
            </button>
            <span className="text-slate-300">/</span>
            <button
              onClick={() => {
                soundManager.playClickChime();
                onBack();
              }}
              className="hover:text-[#2fa84f] transition-colors cursor-pointer"
            >
              الحالات المرضية
            </button>
            <span className="text-slate-300">/</span>
            <span className="text-[#0c3653] font-black">{condition.name}</span>
          </nav>

          <div className="flex items-center gap-2">
            <button
              onClick={handleShare}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white border border-slate-200 hover:border-[#2fa84f] text-slate-700 text-xs font-bold transition-all shadow-2xs hover:scale-102 active:scale-95 cursor-pointer"
              title="مشاركة رابط الحالة"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-[#2fa84f]" /> : <Share2 className="w-3.5 h-3.5 text-slate-500" />}
              <span>{copied ? 'تم النسخ!' : 'مشاركة'}</span>
            </button>

            <button
              onClick={() => {
                soundManager.playClickChime();
                onBack();
              }}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-[#0c3653] text-xs font-bold transition-all active:scale-95 cursor-pointer"
            >
              <ArrowRight className="w-4 h-4" />
              <span>العودة للقائمة</span>
            </button>
          </div>
        </div>

        {/* Hero Card with 100% Realistic Medical Image (Without Text) */}
        <div className="bg-white rounded-3xl overflow-hidden border border-slate-200/90 shadow-[0_8px_30px_rgba(12,54,83,0.06)] mb-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-0">
            
            {/* Right: Info & Description */}
            <div className="lg:col-span-7 p-6 sm:p-10 flex flex-col justify-between">
              <div>
                <div className="flex flex-wrap items-center gap-2 mb-4">
                  <span className="px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200/80 text-[#2fa84f] text-xs font-extrabold flex items-center gap-1.5">
                    <Activity className="w-3.5 h-3.5" />
                    <span>{condition.categoryName}</span>
                  </span>
                  <span className="px-3 py-1 rounded-full bg-blue-50 border border-blue-100 text-[#0872B9] text-xs font-bold">
                    دليل تشخيصي معتمد
                  </span>
                </div>

                <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-[#0c3653] leading-tight mb-4">
                  {condition.name}
                </h1>

                <p className="text-sm sm:text-base text-slate-600 font-medium leading-relaxed mb-6">
                  {condition.shortDescription}
                </p>

                <div className="bg-slate-50 border border-slate-100 rounded-2xl p-4 sm:p-5 mb-6">
                  <div className="flex items-center gap-2 mb-2 text-[#0c3653] font-bold text-xs sm:text-sm">
                    <Info className="w-4 h-4 text-[#0872B9]" />
                    <span>التعريف الطبي الشامل</span>
                  </div>
                  <p className="text-xs sm:text-sm text-slate-700 leading-relaxed font-normal">
                    {condition.definition}
                  </p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center gap-3 pt-4 border-t border-slate-100">
                <button
                  onClick={() => {
                    soundManager.playClickChime();
                    onBookClick(condition.name);
                  }}
                  className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-[#2fa84f] hover:bg-[#279144] text-white text-sm font-black shadow-sm hover:shadow-md transition-all active:scale-95 cursor-pointer"
                >
                  <Calendar className="w-4 h-4" />
                  <span>حجز استشارة لهذه الحالة</span>
                </button>

                <a
                  href="tel:777554626"
                  onClick={() => soundManager.playClickChime()}
                  className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-[#0c3653] text-sm font-bold transition-all active:scale-95 cursor-pointer"
                >
                  <Phone className="w-4 h-4 text-[#0872B9]" />
                  <span>استفسار هاتفي مباشر</span>
                </a>
              </div>
            </div>

            {/* Left: 100% Realistic Medical Image (Clean, No Text Overlays) */}
            <div className="lg:col-span-5 relative bg-slate-900 min-h-[280px] lg:min-h-full flex items-center justify-center overflow-hidden group">
              <img
                src={activeCondition.image}
                alt={activeCondition.name}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                referrerPolicy="no-referrer"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = '/images/gerd_2026_1790363403788.jpg';
                }}
              />
            </div>

          </div>
        </div>

        {/* Detailed Tabs & Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
          
          {/* Main 2 Columns: Medical Analysis */}
          <div className="lg:col-span-2 space-y-8">
            
            {/* 1. الأعراض والعلامات الشائعة */}
            <section className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200/90 shadow-2xs">
              <div className="flex items-center gap-3 mb-5 text-[#0c3653]">
                <div className="w-10 h-10 rounded-xl bg-emerald-50 text-[#2fa84f] flex items-center justify-center">
                  <Activity className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-lg sm:text-xl font-black">الأعراض والعلامات الشائعة</h2>
                  <p className="text-xs text-slate-500">أبرز الشكاوى التي يشعر بها مريض {condition.name}</p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {condition.commonSymptoms?.map((sym, idx) => (
                  <div
                    key={idx}
                    className="flex items-start gap-3 p-3.5 rounded-xl bg-slate-50/80 border border-slate-100 hover:border-emerald-200 transition-colors"
                  >
                    <div className="w-2 h-2 rounded-full bg-[#2fa84f] mt-1.5 shrink-0" />
                    <span className="text-xs sm:text-[13px] text-slate-700 font-bold leading-relaxed">{sym}</span>
                  </div>
                ))}
              </div>
            </section>

            {/* 2. الأسباب وعوامل الخطورة */}
            <section className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200/90 shadow-2xs">
              <div className="flex items-center gap-3 mb-5 text-[#0c3653]">
                <div className="w-10 h-10 rounded-xl bg-blue-50 text-[#0872B9] flex items-center justify-center">
                  <Stethoscope className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-lg sm:text-xl font-black">الأسباب وعوامل الخطورة</h2>
                  <p className="text-xs text-slate-500">العوامل المسببة والمحفزة لتطور الحالة</p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-xs font-bold text-[#0872B9] uppercase tracking-wider mb-3">الأسباب الرئيسية:</h3>
                  <ul className="space-y-2">
                    {condition.causes?.map((cause, idx) => (
                      <li key={idx} className="flex items-start gap-2 text-xs text-slate-700 font-medium">
                        <span className="text-[#0872B9] font-bold">•</span>
                        <span>{cause}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div>
                  <h3 className="text-xs font-bold text-amber-700 uppercase tracking-wider mb-3">عوامل الخطورة والمحفزات:</h3>
                  <ul className="space-y-2">
                    {condition.riskFactors?.map((risk, idx) => (
                      <li key={idx} className="flex items-start gap-2 text-xs text-slate-700 font-medium">
                        <span className="text-amber-500 font-bold">•</span>
                        <span>{risk}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </section>

            {/* 3. النهج التشخيصي ودور المناظير */}
            <section className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200/90 shadow-2xs">
              <div className="flex items-center gap-3 mb-5 text-[#0c3653]">
                <div className="w-10 h-10 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-lg sm:text-xl font-black">الفحوصات ودور مناظير الجهاز الهضمي</h2>
                  <p className="text-xs text-slate-500">بروتوكول التشخيص المعتمد وتحديد الحاجة للمنظار</p>
                </div>
              </div>

              <div className="space-y-4">
                <div className="p-4 rounded-xl bg-teal-50/50 border border-teal-100">
                  <h4 className="text-xs font-bold text-teal-900 mb-1">التقييم التشخيصي:</h4>
                  <p className="text-xs sm:text-[13px] text-teal-800 leading-relaxed font-normal">{condition.diagnosis}</p>
                </div>

                {condition.tests && condition.tests.length > 0 && (
                  <div>
                    <h4 className="text-xs font-bold text-slate-700 mb-2">الفحوصات والتحاليل الموصى بها:</h4>
                    <div className="flex flex-wrap gap-2">
                      {condition.tests.map((test, idx) => (
                        <span key={idx} className="px-3 py-1.5 rounded-lg bg-slate-100 text-slate-700 text-xs font-bold border border-slate-200">
                          ✓ {test}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {condition.needsEndoscopy && (
                  <div className="p-4 rounded-xl bg-amber-50/60 border border-amber-200 text-amber-900">
                    <div className="flex items-center gap-2 mb-1 font-bold text-xs">
                      <AlertTriangle className="w-4 h-4 text-amber-600" />
                      <span>هل تحتاج هذه الحالة إلى منظار هضمي؟</span>
                    </div>
                    <p className="text-xs text-amber-800 leading-relaxed font-medium">{condition.needsEndoscopy}</p>
                  </div>
                )}
              </div>
            </section>

            {/* 4. خطة العلاج المعتمدة للدكتور عبدالباسط */}
            <section className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200/90 shadow-2xs">
              <div className="flex items-center gap-3 mb-5 text-[#0c3653]">
                <div className="w-10 h-10 rounded-xl bg-emerald-50 text-[#2fa84f] flex items-center justify-center">
                  <CheckCircle2 className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-lg sm:text-xl font-black">استراتيجية العلاج والنهج السريري</h2>
                  <p className="text-xs text-slate-500">خطة علاجية مخصصة ومتابعة مستمرة للتحكم في الحالة</p>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 text-xs sm:text-sm text-slate-700 leading-relaxed font-medium">
                {condition.treatmentApproach}
              </div>

              {condition.generalTips && condition.generalTips.length > 0 && (
                <div className="mt-6">
                  <h3 className="text-xs font-bold text-[#2fa84f] uppercase tracking-wider mb-3">نصائح وإرشادات وقائية وغذائية:</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {condition.generalTips.map((tip, idx) => (
                      <div key={idx} className="flex items-start gap-2 p-2.5 rounded-lg bg-emerald-50/50 border border-emerald-100 text-emerald-950 text-xs font-medium">
                        <span className="text-[#2fa84f] font-bold">✓</span>
                        <span>{tip}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </section>

            {/* 5. الأسئلة الشائعة حول الحالة */}
            {condition.faqs && condition.faqs.length > 0 && (
              <section className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200/90 shadow-2xs">
                <div className="flex items-center gap-3 mb-5 text-[#0c3653]">
                  <div className="w-10 h-10 rounded-xl bg-blue-50 text-[#0872B9] flex items-center justify-center">
                    <HelpCircle className="w-5 h-5" />
                  </div>
                  <div>
                    <h2 className="text-lg sm:text-xl font-black">أسئلة شائعة حول {condition.name}</h2>
                    <p className="text-xs text-slate-500">إجابات استشارية دقيقة تهم المرضى ومرافقيهم</p>
                  </div>
                </div>

                <div className="space-y-3">
                  {condition.faqs.map((faq, idx) => {
                    const isOpen = openFaqIndex === idx;
                    return (
                      <div
                        key={idx}
                        className="rounded-xl border border-slate-200 overflow-hidden transition-colors"
                      >
                        <button
                          onClick={() => handleFaqToggle(idx)}
                          className="w-full text-right p-4 font-bold text-xs sm:text-sm text-[#0c3653] flex items-center justify-between gap-4 bg-slate-50 hover:bg-slate-100 transition-colors cursor-pointer"
                        >
                          <span>{faq.question}</span>
                          <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
                        </button>
                        {isOpen && (
                          <div className="p-4 text-xs sm:text-sm text-slate-600 bg-white leading-relaxed border-t border-slate-100 font-normal">
                            {faq.answer}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </section>
            )}

          </div>

          {/* Right Column: Warning Signs & Direct Booking Card */}
          <div className="space-y-6">
            
            {/* Alarm Signs Box */}
            <div className="bg-gradient-to-br from-rose-50 to-amber-50 rounded-2xl p-6 border border-rose-200/80 shadow-2xs">
              <div className="flex items-center gap-2.5 text-rose-900 font-bold text-sm mb-3">
                <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0" />
                <span>متى تزور الطبيب فوراً؟</span>
              </div>
              <p className="text-xs text-rose-800 leading-relaxed mb-4">
                تتطلب العلامات التالية مراجعة الطبيب الاستشاري دون أي تأخير لتفادي المضاعفات:
              </p>
              <ul className="space-y-2 text-xs text-rose-950 font-medium">
                {condition.whenToSeeDoctor?.map((alarm, idx) => (
                  <li key={idx} className="flex items-start gap-2 bg-white/70 p-2 rounded-lg border border-rose-100">
                    <span className="w-1.5 h-1.5 rounded-full bg-rose-500 mt-1.5 shrink-0" />
                    <span>{alarm}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Direct Consultation Booking Card */}
            <div className="bg-white rounded-2xl p-6 border border-[#2fa84f]/40 shadow-[0_4px_20px_rgba(47,168,79,0.08)] text-center">
              <div className="w-12 h-12 rounded-full bg-emerald-50 text-[#2fa84f] flex items-center justify-center mx-auto mb-3">
                <Calendar className="w-6 h-6" />
              </div>
              <h3 className="text-base font-black text-[#0c3653] mb-1">
                احجز موعدك مع الدكتور
              </h3>
              <p className="text-xs text-slate-500 font-medium mb-4">
                عيادة الدكتور عبدالباسط عبدالحاج مقبل – صنعاء، شارع تعز
              </p>
              <button
                onClick={() => {
                  soundManager.playClickChime();
                  onBookClick(condition.name);
                }}
                className="w-full py-3 rounded-xl bg-[#2fa84f] hover:bg-[#279144] text-white font-black text-xs sm:text-sm shadow-sm hover:shadow transition-all active:scale-95 cursor-pointer flex items-center justify-center gap-2 mb-3"
              >
                <Calendar className="w-4 h-4" />
                <span>حجز موعد كشف لهذه الحالة</span>
              </button>
              <a
                href="https://wa.me/967777554626"
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => soundManager.playClickChime()}
                className="w-full py-2.5 rounded-xl bg-[#25D366]/10 hover:bg-[#25D366]/20 text-[#128C7E] font-bold text-xs transition-all flex items-center justify-center gap-2"
              >
                <span>مراسلة العيادة عبر واتساب</span>
              </a>
            </div>

            {/* Related Conditions Cards */}
            {relatedList.length > 0 && (
              <div className="bg-white rounded-2xl p-6 border border-slate-200/90 shadow-2xs">
                <h3 className="text-xs font-extrabold text-[#0c3653] uppercase tracking-wider mb-4">
                  حالات طبية ذات صلة:
                </h3>
                <div className="space-y-3">
                  {relatedList.map((rel) => (
                    <div
                      key={rel.id}
                      onClick={() => {
                        soundManager.playClickChime();
                        onSelectCondition(rel);
                      }}
                      className="p-3 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-100 hover:border-[#0872B9]/30 transition-all cursor-pointer group flex items-center gap-3"
                    >
                      <div className="w-12 h-12 rounded-lg overflow-hidden shrink-0 bg-slate-200">
                        <img
                          src={rel.image}
                          alt={rel.name}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                          referrerPolicy="no-referrer"
                        />
                      </div>
                      <div className="flex-1 text-right">
                        <h4 className="text-xs font-bold text-[#0c3653] group-hover:text-[#0872B9] transition-colors line-clamp-1">
                          {rel.name}
                        </h4>
                        <p className="text-[10px] text-slate-500 line-clamp-1 mt-0.5">
                          {rel.shortDescription}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

          </div>

        </div>

      </div>
    </article>
  );
};

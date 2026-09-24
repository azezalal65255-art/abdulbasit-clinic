import React, { useEffect } from 'react';
import {
  FileText,
  Calendar,
  Share2,
  ArrowRight,
  Sparkles,
  CheckCircle2,
  Printer,
  ChevronLeft,
} from 'lucide-react';

interface CustomPageViewProps {
  page: {
    id: string;
    title: string;
    slug: string;
    content: string;
    excerpt?: string;
    coverImage?: string;
    metaTitle?: string;
    metaDescription?: string;
    keywords?: string[];
    updatedAt?: string;
    createdAt?: string;
  };
  onBack: () => void;
  onBookClick: () => void;
}

export const CustomPageView: React.FC<CustomPageViewProps> = ({
  page,
  onBack,
  onBookClick,
}) => {
  // SEO Meta Injection
  useEffect(() => {
    const originalTitle = document.title;
    if (page.metaTitle || page.title) {
      document.title = page.metaTitle || `${page.title} | عيادة د. عبدالباسط مقبل`;
    }

    let metaDesc = document.querySelector('meta[name="description"]');
    const prevDesc = metaDesc ? metaDesc.getAttribute('content') : null;
    if (page.metaDescription || page.excerpt) {
      if (!metaDesc) {
        metaDesc = document.createElement('meta');
        metaDesc.setAttribute('name', 'description');
        document.head.appendChild(metaDesc);
      }
      metaDesc.setAttribute('content', page.metaDescription || page.excerpt || '');
    }

    let metaKeywords = document.querySelector('meta[name="keywords"]');
    const prevKeywords = metaKeywords ? metaKeywords.getAttribute('content') : null;
    if (page.keywords && page.keywords.length > 0) {
      if (!metaKeywords) {
        metaKeywords = document.createElement('meta');
        metaKeywords.setAttribute('name', 'keywords');
        document.head.appendChild(metaKeywords);
      }
      metaKeywords.setAttribute('content', page.keywords.join(', '));
    }

    // Scroll to top
    window.scrollTo({ top: 0, behavior: 'smooth' });

    return () => {
      document.title = originalTitle;
      if (metaDesc && prevDesc !== null) metaDesc.setAttribute('content', prevDesc);
      if (metaKeywords && prevKeywords !== null) metaKeywords.setAttribute('content', prevKeywords);
    };
  }, [page]);

  const handleShare = () => {
    if (navigator.share) {
      navigator
        .share({
          title: page.title,
          text: page.excerpt || page.title,
          url: window.location.href,
        })
        .catch(() => {});
    } else {
      navigator.clipboard.writeText(window.location.href);
      alert('تم نسخ رابط الصفحة إلى الحافظة بنجاح');
    }
  };

  const handlePrint = () => {
    window.print();
  };

  // Convert markdown-like paragraphs to formatted elements
  const renderFormattedContent = (content: string) => {
    if (!content) return null;

    const lines = content.split('\n');
    return lines.map((line, idx) => {
      const trimmed = line.trim();
      if (!trimmed) {
        return <div key={idx} className="h-3" />;
      }

      // H2
      if (trimmed.startsWith('## ')) {
        return (
          <h2
            key={idx}
            className="text-lg md:text-xl font-bold text-[#064B82] mt-6 mb-3 flex items-center gap-2 border-r-4 border-[#2fa84f] pr-3"
          >
            {trimmed.replace('## ', '')}
          </h2>
        );
      }

      // H3
      if (trimmed.startsWith('### ')) {
        return (
          <h3
            key={idx}
            className="text-base font-bold text-[#17354F] mt-4 mb-2"
          >
            {trimmed.replace('### ', '')}
          </h3>
        );
      }

      // Bullet points
      if (trimmed.startsWith('* ') || trimmed.startsWith('- ')) {
        return (
          <div key={idx} className="flex items-start gap-2.5 my-1.5 text-sm text-[#334455] leading-relaxed">
            <span className="w-1.5 h-1.5 rounded-full bg-[#2fa84f] mt-2 shrink-0" />
            <span>{trimmed.replace(/^(\*|-)\s+/, '')}</span>
          </div>
        );
      }

      // Numbered lists
      if (/^\d+\.\s/.test(trimmed)) {
        const num = trimmed.match(/^(\d+)\.\s/)?.[1];
        const text = trimmed.replace(/^\d+\.\s+/, '');
        return (
          <div key={idx} className="flex items-start gap-3 my-2 text-sm text-[#334455] leading-relaxed">
            <span className="w-5 h-5 rounded-full bg-blue-50 text-[#064B82] font-bold text-xs flex items-center justify-center shrink-0 mt-0.5">
              {num}
            </span>
            <span>{text}</span>
          </div>
        );
      }

      // Regular paragraph
      return (
        <p key={idx} className="text-sm md:text-base text-[#334455] leading-relaxed my-2">
          {trimmed}
        </p>
      );
    });
  };

  return (
    <div className="bg-[#F8FAFC] min-h-[70vh] py-8 md:py-12" dir="rtl">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 space-y-6">
        
        {/* Navigation & Action Bar */}
        <div className="flex items-center justify-between gap-3">
          <button
            onClick={onBack}
            className="inline-flex items-center gap-2 text-xs md:text-sm font-bold text-[#064B82] bg-white border border-[#E2EAF0] px-3.5 py-2 rounded-xl hover:bg-blue-50 shadow-2xs transition-colors cursor-pointer"
          >
            <ArrowRight className="w-4 h-4" />
            العودة للرئيسية
          </button>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="p-2 bg-white border border-[#E2EAF0] rounded-xl text-gray-600 hover:text-[#064B82] hover:bg-blue-50 shadow-2xs transition-colors cursor-pointer"
              title="طباعة الصفحة"
            >
              <Printer className="w-4 h-4" />
            </button>
            <button
              onClick={handleShare}
              className="inline-flex items-center gap-1.5 text-xs font-bold text-gray-700 bg-white border border-[#E2EAF0] px-3 py-2 rounded-xl hover:bg-gray-50 shadow-2xs transition-colors cursor-pointer"
            >
              <Share2 className="w-3.5 h-3.5" />
              مشاركة
            </button>
          </div>
        </div>

        {/* Main Article/Page Card */}
        <article className="bg-white rounded-3xl border border-[#E2EAF0] shadow-sm overflow-hidden">
          {/* Cover Banner */}
          {page.coverImage && (
            <div className="relative w-full h-56 sm:h-72 md:h-80 bg-slate-900 overflow-hidden">
              <img
                src={page.coverImage}
                alt={page.title}
                className="w-full h-full object-cover opacity-90"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-950/30 to-transparent" />
              <div className="absolute bottom-6 right-6 left-6 text-white">
                <span className="inline-block bg-[#2fa84f] text-white text-xs font-bold px-3 py-1 rounded-full mb-2 shadow-xs">
                  دليل وإرشادات المريض
                </span>
                <h1 className="text-xl sm:text-2xl md:text-3xl font-bold leading-snug">
                  {page.title}
                </h1>
              </div>
            </div>
          )}

          <div className="p-6 sm:p-8 md:p-10 space-y-6">
            {!page.coverImage && (
              <div>
                <span className="inline-block bg-blue-50 text-[#064B82] text-xs font-bold px-3 py-1 rounded-full mb-3 border border-blue-100">
                  دليل وإرشادات المريض
                </span>
                <h1 className="text-2xl sm:text-3xl font-bold text-[#064B82] leading-snug">
                  {page.title}
                </h1>
              </div>
            )}

            {/* Excerpt Lead */}
            {page.excerpt && (
              <div className="p-4 rounded-2xl bg-blue-50/50 border-r-4 border-[#064B82] text-sm md:text-base text-[#17354F] font-medium leading-relaxed">
                {page.excerpt}
              </div>
            )}

            {/* Dynamic Rendered Content */}
            <div className="prose max-w-none text-[#17354F] border-t border-[#F0F4F8] pt-6">
              {renderFormattedContent(page.content)}
            </div>

            {/* Booking & Consultation CTA inside the page */}
            <div className="mt-8 p-6 rounded-2xl bg-gradient-to-l from-[#064B82] to-[#0B70B7] text-white flex flex-col sm:flex-row items-center justify-between gap-4 shadow-sm">
              <div className="space-y-1 text-center sm:text-right">
                <h3 className="text-base font-bold">هل لديك استفسار أو تحتاج فحص طبي؟</h3>
                <p className="text-xs text-blue-100">
                  احجز موعد كشف أو استشارة مع الدكتور عبدالباسط مقبل مباشرة
                </p>
              </div>
              <button
                onClick={onBookClick}
                className="py-2.5 px-6 rounded-xl bg-[#2fa84f] hover:bg-[#289244] text-white text-xs font-bold shadow-md transition-transform hover:scale-105 shrink-0 cursor-pointer"
              >
                احجز موعدك الآن
              </button>
            </div>
          </div>
        </article>

      </div>
    </div>
  );
};

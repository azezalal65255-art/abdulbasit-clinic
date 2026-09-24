import React, { useEffect } from 'react';
import { X, Clock, Calendar, Share2, MessageCircle } from 'lucide-react';
import { MedicalArticle } from '../types';
import { CLINIC_INFO } from '../data/clinicData';

interface ArticleModalProps {
  article: MedicalArticle | null;
  onClose: () => void;
  onBookClick: () => void;
}

export const ArticleModal: React.FC<ArticleModalProps> = ({
  article,
  onClose,
  onBookClick,
}) => {
  useEffect(() => {
    if (!article) return;
    const originalTitle = document.title;
    if (article.metaTitle || article.title) {
      document.title = article.metaTitle || `${article.title} | د. عبدالباسط مقبل`;
    }

    const metaDesc = document.querySelector('meta[name="description"]');
    const prevDesc = metaDesc?.getAttribute('content') || '';
    if (metaDesc && (article.metaDescription || article.excerpt)) {
      metaDesc.setAttribute('content', article.metaDescription || article.excerpt);
    }

    let metaKeywords = document.querySelector('meta[name="keywords"]');
    const createdKeywords = !metaKeywords;
    if (!metaKeywords && article.keywords && article.keywords.length > 0) {
      metaKeywords = document.createElement('meta');
      metaKeywords.setAttribute('name', 'keywords');
      document.head.appendChild(metaKeywords);
    }
    if (metaKeywords && article.keywords && article.keywords.length > 0) {
      metaKeywords.setAttribute('content', article.keywords.join(', '));
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
  }, [article]);

  if (!article) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div
        className="relative bg-white w-full max-w-3xl max-h-[90vh] rounded-2xl overflow-y-auto shadow-2xl border border-[#BED8EA] text-right"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 left-4 z-20 w-10 h-10 rounded-xl bg-white/90 hover:bg-[#E2EAF0] text-[#17354F] flex items-center justify-center shadow-xs border border-[#BED8EA] transition-colors cursor-pointer"
          aria-label="إغلاق"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Hero image of article */}
        <div className="relative aspect-16/9 w-full overflow-hidden bg-slate-100">
          <img
            src={article.image}
            alt={article.title}
            className="w-full h-full object-cover"
            referrerPolicy="no-referrer"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/30 to-transparent" />
          
          <div className="absolute bottom-6 right-6 left-6 text-white">
            <span className="inline-block bg-[#55A630] text-white text-xs font-bold px-3 py-1 rounded-full mb-2">
              {article.category}
            </span>
            <h2 className="text-xl sm:text-2xl md:text-3xl font-bold leading-snug">
              {article.title}
            </h2>
            <div className="flex items-center gap-4 text-xs text-slate-200 mt-2">
              <span className="flex items-center gap-1">
                <Clock className="w-3.5 h-3.5" />
                {article.readTime}
              </span>
              <span>•</span>
              <span>عيادة د. عبدالباسط عبده الحاج مقبل</span>
            </div>
          </div>
        </div>

        {/* Article Body */}
        <div className="p-6 sm:p-8">
          <div className="prose prose-slate max-w-none text-[#17354F] leading-relaxed text-sm sm:text-base space-y-4 whitespace-pre-line">
            {article.content}
          </div>

          {/* Article Category Tags */}
          {article.tags && article.tags.length > 0 && (
            <div className="mt-6 pt-5 border-t border-[#E2EAF0] flex flex-wrap items-center gap-1.5">
              <span className="text-xs font-semibold text-slate-500">التصنيف:</span>
              {article.tags.map((t, i) => (
                <span
                  key={`tag-${i}`}
                  className="inline-flex items-center bg-slate-100 text-slate-700 text-xs font-medium px-2.5 py-1 rounded-lg"
                >
                  {t}
                </span>
              ))}
            </div>
          )}

          {/* Doctor Advisory Box */}
          <div className="mt-8 bg-[#F0F7FC] border border-[#BED8EA] rounded-2xl p-5 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="text-right">
              <h4 className="text-sm sm:text-base font-bold text-[#064B82]">
                هل تعاني من أعراض مشابهة؟
              </h4>
              <p className="text-xs text-[#64748B] mt-0.5">
                ينصح د. عبدالباسط مقبل بإجراء فحص سريري وتقييم تخصصي لوضع خطة علاجية مناسبة.
              </p>
            </div>
            
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <button
                onClick={() => {
                  onClose();
                  onBookClick();
                }}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-[#55A630] hover:bg-[#489228] text-white text-xs sm:text-sm font-bold px-5 py-2.5 rounded-xl shadow-xs transition-all cursor-pointer active:scale-[0.99]"
              >
                <Calendar className="w-4 h-4" />
                <span>حجز استشارة</span>
              </button>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

import React from 'react';
import { BookOpen, Clock, ChevronLeft, ArrowLeft } from 'lucide-react';
import { MEDICAL_ARTICLES } from '../data/clinicData';
import { useClinicData } from '../context/ClinicDataContext';
import { MedicalArticle } from '../types';

interface MedicalLibraryProps {
  onSelectArticle: (article: MedicalArticle) => void;
}

export const MedicalLibrary: React.FC<MedicalLibraryProps> = ({ onSelectArticle }) => {
  const { articles: contextArticles } = useClinicData();
  const articles = contextArticles?.length ? contextArticles : MEDICAL_ARTICLES;

  return (
    <section id="library" className="py-16 md:py-20 bg-white border-b border-[#E2EAF0]">
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6">
        
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-12">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#F0F7FC] border border-[#BED8EA] text-[#064B82] text-xs font-bold mb-3">
            <span>توعية طبية موثوقة</span>
          </div>
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-black text-[#064B82] mb-2">
            المكتبة الطبية
          </h2>
          <div className="geometric-divider">
            <span className="geometric-divider-center" />
          </div>
          <p className="text-sm sm:text-base text-[#4B6375]">
            مقالات وإرشادات صحية موجهة مبنية على أسس طبية سليمة لتعزيز وعيك بصحة جهازك الهضمي والكبد
          </p>
        </div>

        {/* 3 Articles Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
          {articles.map((article) => (
            <div
              key={article.id}
              id={`article-card-${article.id}`}
              className="geometric-card overflow-hidden flex flex-col justify-between group"
            >
              <div>
                {/* Article Image */}
                <div className="relative aspect-16/10 w-full overflow-hidden bg-slate-100">
                  <img
                    src={article.image}
                    alt={article.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute top-3 right-3 bg-white/95 backdrop-blur-xs px-2.5 py-1 rounded-lg text-[11px] font-bold text-[#064B82] border border-[#BED8EA] shadow-2xs">
                    {article.category}
                  </div>
                </div>

                {/* Article Body */}
                <div className="p-5 sm:p-6">
                  <div className="flex items-center gap-2 text-xs text-[#64748B] mb-2.5">
                    <Clock className="w-3.5 h-3.5 text-[#55A630]" />
                    <span>وقت القراءة: {article.readTime}</span>
                  </div>

                  <h3 className="text-base sm:text-lg font-bold text-[#064B82] group-hover:text-[#0872B9] transition-colors mb-2.5 leading-snug">
                    {article.title}
                  </h3>

                  <p className="text-xs sm:text-sm text-[#4B6375] leading-relaxed line-clamp-3">
                    {article.excerpt}
                  </p>
                </div>
              </div>

              {/* Action Link Button */}
              <div className="p-5 sm:p-6 pt-0">
                <button
                  id={`read-article-${article.id}`}
                  onClick={() => onSelectArticle(article)}
                  className="w-full inline-flex items-center justify-between py-2.5 px-4 rounded-xl text-xs sm:text-sm font-bold text-[#0872B9] bg-[#F6FAFC] border border-[#E2EAF0] group-hover:bg-[#0872B9] group-hover:text-white group-hover:border-[#0872B9] transition-all cursor-pointer active:scale-[0.99]"
                >
                  <span>اقرأ المزيد</span>
                  <ChevronLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Link: "عرض جميع المقالات" */}
        {articles.length > 0 && (
          <div className="mt-10 text-center">
            <button
              onClick={() => onSelectArticle(articles[0])}
              className="inline-flex items-center gap-2 text-sm font-bold text-[#0872B9] hover:text-[#064B82] py-2.5 px-5 rounded-xl border border-transparent hover:border-[#BED8EA] hover:bg-[#F0F7FC] transition-all cursor-pointer"
            >
              <span>عرض جميع المقالات الطبية</span>
              <ArrowLeft className="w-4 h-4" />
            </button>
          </div>
        )}

      </div>
    </section>
  );
};

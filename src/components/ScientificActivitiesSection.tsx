import React, { useState } from 'react';
import { useClinicData } from '../context/ClinicDataContext';
import { Award, GraduationCap, Calendar, MapPin, Building, ExternalLink, FileText, BookOpen } from 'lucide-react';

export const ScientificActivitiesSection: React.FC = () => {
  const { conferences = [], research = [] } = useClinicData();
  const [activeTab, setActiveTab] = useState<'conferences' | 'research'>('conferences');

  const activeConferences = (conferences || []).filter((c: any) => c.isActive !== false);
  const activeResearch = (research || []).filter((r: any) => r.isActive !== false);

  if (activeConferences.length === 0 && activeResearch.length === 0) {
    return null;
  }

  return (
    <section id="scientific-activities" className="py-14 bg-white border-b border-[#e2eaf0]" dir="rtl">
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6">
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-8">
          <span className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full text-xs font-bold bg-[#0c3653]/10 text-[#0c3653] border border-[#0c3653]/20 mb-2">
            <GraduationCap className="w-4 h-4 text-[#2fa84f]" />
            التميز العلمي والأكاديمي
          </span>
          <h2 className="text-2xl sm:text-3xl font-black text-[#0c3653] tracking-tight">
            المؤتمرات والأبحاث العلمية
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 mt-2 leading-relaxed">
            مشاركات د. عبدالباسط عبده الحاج مقبل في المؤتمرات الطبية الإقليمية والدولية والأبحاث المحكّمة
          </p>
        </div>

        {/* Tabs */}
        <div className="flex justify-center mb-8">
          <div className="bg-slate-100 p-1 rounded-xl flex items-center gap-1 border border-slate-200">
            <button
              onClick={() => setActiveTab('conferences')}
              className={`flex items-center gap-2 px-5 py-2 rounded-lg text-xs sm:text-sm font-bold transition-all cursor-pointer ${
                activeTab === 'conferences'
                  ? 'bg-white text-[#0c3653] shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Award className="w-4 h-4 text-[#2fa84f]" />
              المؤتمرات والمشاركات ({activeConferences.length})
            </button>
            <button
              onClick={() => setActiveTab('research')}
              className={`flex items-center gap-2 px-5 py-2 rounded-lg text-xs sm:text-sm font-bold transition-all cursor-pointer ${
                activeTab === 'research'
                  ? 'bg-white text-[#0c3653] shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <BookOpen className="w-4 h-4 text-[#0872B9]" />
              الأبحاث والأوراق العلمية ({activeResearch.length})
            </button>
          </div>
        </div>

        {/* Tab Content: Conferences */}
        {activeTab === 'conferences' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {activeConferences.map((conf: any) => (
              <div
                key={conf.id}
                className="bg-white rounded-2xl overflow-hidden border border-slate-200 shadow-2xs hover:shadow-md transition-shadow flex flex-col justify-between"
              >
                <div>
                  {conf.image ? (
                    <div className="h-44 bg-slate-100 overflow-hidden relative">
                      <img
                        src={conf.image}
                        alt={conf.title}
                        className="w-full h-full object-cover"
                        referrerPolicy="no-referrer"
                      />
                      <span className="absolute top-2.5 right-2.5 bg-[#0c3653]/90 backdrop-blur-xs text-white text-[11px] font-bold px-2.5 py-0.5 rounded-full">
                        {conf.year || conf.date}
                      </span>
                    </div>
                  ) : (
                    <div className="h-24 bg-gradient-to-l from-slate-100 to-sky-50 flex items-center justify-between p-4 border-b border-slate-100">
                      <Award className="w-8 h-8 text-[#2fa84f]" />
                      <span className="bg-[#0c3653] text-white text-[11px] font-bold px-2.5 py-0.5 rounded-full">
                        {conf.year || conf.date}
                      </span>
                    </div>
                  )}

                  <div className="p-5">
                    {conf.role && (
                      <span className="inline-block text-[11px] font-bold text-[#2fa84f] bg-[#2fa84f]/10 px-2 py-0.5 rounded mb-2">
                        {conf.role}
                      </span>
                    )}
                    <h3 className="font-bold text-[#0c3653] text-sm sm:text-base leading-snug">
                      {conf.title}
                    </h3>

                    <div className="mt-3 space-y-1 text-xs text-slate-500">
                      {conf.organizer && (
                        <div className="flex items-center gap-1.5">
                          <Building className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                          <span>{conf.organizer}</span>
                        </div>
                      )}
                      {conf.location && (
                        <div className="flex items-center gap-1.5">
                          <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                          <span>{conf.location}</span>
                        </div>
                      )}
                      {conf.date && (
                        <div className="flex items-center gap-1.5">
                          <Calendar className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                          <span>{conf.date}</span>
                        </div>
                      )}
                    </div>

                    {conf.description && (
                      <p className="text-xs text-slate-600 mt-3 line-clamp-3 leading-relaxed">
                        {conf.description}
                      </p>
                    )}
                  </div>
                </div>

                <div className="p-4 pt-0 border-t border-slate-50 mt-2">
                  <span className="text-[11px] font-medium text-slate-400 flex items-center gap-1">
                    <Award className="w-3.5 h-3.5 text-[#2fa84f]" />
                    مشاركة طبية معتمدة
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Tab Content: Research */}
        {activeTab === 'research' && (
          <div className="space-y-4 max-w-4xl mx-auto">
            {activeResearch.map((paper: any) => (
              <div
                key={paper.id}
                className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-200 shadow-2xs hover:shadow-md transition-shadow flex flex-col sm:flex-row sm:items-start justify-between gap-4"
              >
                <div className="space-y-2 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-[11px] font-bold text-[#0872B9] bg-sky-50 px-2.5 py-0.5 rounded-full border border-sky-200">
                      {paper.category || 'بحث علمي'}
                    </span>
                    <span className="text-xs text-slate-500 flex items-center gap-1">
                      <Calendar className="w-3 h-3 text-slate-400" />
                      {paper.year}
                    </span>
                  </div>

                  <h3 className="font-bold text-[#0c3653] text-base leading-snug">
                    {paper.title}
                  </h3>

                  <div className="text-xs text-slate-600 flex flex-wrap items-center gap-3">
                    <span className="font-semibold text-slate-700">{paper.journal}</span>
                    {paper.authors && (
                      <span className="text-slate-500">| المؤلفون: {paper.authors}</span>
                    )}
                  </div>

                  {paper.abstract && (
                    <p className="text-xs text-slate-600 leading-relaxed bg-slate-50 p-3 rounded-xl border border-slate-100 mt-2">
                      <span className="font-bold text-slate-700 block mb-0.5">الملخص:</span>
                      {paper.abstract}
                    </p>
                  )}

                  <div className="flex flex-wrap items-center gap-4 pt-2">
                    {paper.url && (
                      <a
                        href={paper.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 text-xs font-bold text-[#0872B9] hover:underline"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                        رابط البحث
                      </a>
                    )}
                    {paper.pdfUrl && (
                      <a
                        href={paper.pdfUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 text-xs font-bold text-rose-600 hover:underline"
                      >
                        <FileText className="w-3.5 h-3.5" />
                        تحميل البحث (PDF)
                      </a>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
};

import React, { useState } from 'react';
import { useClinicData } from '../context/ClinicDataContext';
import { Play, Video, Clock, X, ExternalLink, Sparkles } from 'lucide-react';

export const VideosSection: React.FC = () => {
  const { videos = [] } = useClinicData();
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [activeVideo, setActiveVideo] = useState<any | null>(null);

  const activeVideos = (videos || []).filter((v: any) => v.isActive !== false);

  const categories = [
    { id: 'all', label: 'جميع الفيديوهات' },
    { id: 'مناظير الجهاز الهضمي', label: 'مناظير الجهاز الهضمي' },
    { id: 'أمراض الكبد', label: 'أمراض الكبد' },
    { id: 'جرثومة المعدة والحموضة', label: 'المعدة والحموضة' },
    { id: 'توعية طبية', label: 'توعية طبية' },
  ];

  const filteredVideos =
    selectedCategory === 'all'
      ? activeVideos
      : activeVideos.filter(
          (v: any) =>
            v.category?.toLowerCase() === selectedCategory.toLowerCase() ||
            v.category?.includes(selectedCategory)
        );

  // Helper to extract YouTube embed URL
  const getEmbedUrl = (url: string) => {
    if (!url) return '';
    if (url.includes('youtube.com/embed/')) return url;
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
    const match = url.match(regExp);
    if (match && match[2].length === 11) {
      return `https://www.youtube.com/embed/${match[2]}?autoplay=1&rel=0`;
    }
    return url;
  };

  if (activeVideos.length === 0) {
    return null;
  }

  return (
    <section id="videos" className="py-14 bg-slate-50 border-b border-[#e2eaf0]" dir="rtl">
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6">
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-8">
          <span className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full text-xs font-bold bg-[#2fa84f]/10 text-[#2fa84f] border border-[#2fa84f]/20 mb-2">
            <Video className="w-3.5 h-3.5" />
            التوعية المرئية
          </span>
          <h2 className="text-2xl sm:text-3xl font-black text-[#0c3653] tracking-tight">
            مكتبة الفيديو والتثقيف الطبي
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 mt-2 leading-relaxed">
            فيديوهات علمية وتوعوية موجزة يقدمها د. عبدالباسط عبده الحاج مقبل لشرح إجراءات المناظير وأمراض الكبد والجهاز الهضمي
          </p>
        </div>

        {/* Category Filters */}
        <div className="flex flex-wrap items-center justify-center gap-2 mb-8">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                selectedCategory === cat.id
                  ? 'bg-[#0c3653] text-white shadow-sm'
                  : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Video Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredVideos.map((video: any) => (
            <div
              key={video.id}
              onClick={() => setActiveVideo(video)}
              className="bg-white rounded-2xl overflow-hidden border border-slate-200 shadow-2xs hover:shadow-md transition-all group cursor-pointer flex flex-col justify-between"
            >
              <div>
                {/* Thumbnail Container */}
                <div className="aspect-video w-full relative bg-slate-900 overflow-hidden">
                  <img
                    src={video.thumbnail || '/images/hero-doctor.png'}
                    alt={video.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 opacity-90 group-hover:opacity-100"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute inset-0 bg-black/30 group-hover:bg-black/10 transition-colors flex items-center justify-center">
                    <div className="w-12 h-12 rounded-full bg-[#2fa84f] text-white flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                      <Play className="w-5 h-5 fill-white translate-x-0.5" />
                    </div>
                  </div>

                  {/* Duration badge */}
                  {video.duration && (
                    <span className="absolute bottom-2.5 left-2.5 bg-black/80 text-white text-[11px] font-mono font-medium px-2 py-0.5 rounded">
                      {video.duration}
                    </span>
                  )}

                  {/* Category badge */}
                  {video.category && (
                    <span className="absolute top-2.5 right-2.5 bg-[#0c3653]/90 backdrop-blur-xs text-white text-[10px] font-bold px-2.5 py-0.5 rounded-full">
                      {video.category}
                    </span>
                  )}
                </div>

                {/* Content */}
                <div className="p-4">
                  <h3 className="font-bold text-[#0c3653] text-sm leading-snug group-hover:text-[#0872B9] transition-colors line-clamp-2">
                    {video.title}
                  </h3>
                  {video.description && (
                    <p className="text-xs text-slate-500 mt-2 line-clamp-2 leading-relaxed">
                      {video.description}
                    </p>
                  )}
                </div>
              </div>

              <div className="p-4 pt-0 flex items-center justify-between text-[11px] text-slate-400 border-t border-slate-50">
                <span className="flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5" />
                  شاهد الآن
                </span>
                <span className="font-semibold text-[#0872B9] group-hover:underline">
                  تشغيل الفيديو ←
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Video Modal Player */}
      {activeVideo && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
          onClick={() => setActiveVideo(null)}
        >
          <div
            className="bg-black rounded-2xl w-full max-w-3xl overflow-hidden shadow-2xl relative border border-white/10"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-4 bg-slate-900 flex items-center justify-between border-b border-white/10">
              <h3 className="font-bold text-white text-sm sm:text-base line-clamp-1">
                {activeVideo.title}
              </h3>
              <button
                onClick={() => setActiveVideo(null)}
                className="text-white/70 hover:text-white p-1 rounded-lg hover:bg-white/10"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="aspect-video w-full bg-black">
              {activeVideo.videoUrl?.includes('youtube.com') ||
              activeVideo.videoUrl?.includes('youtu.be') ? (
                <iframe
                  src={getEmbedUrl(activeVideo.videoUrl)}
                  title={activeVideo.title}
                  className="w-full h-full border-0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              ) : (
                <video
                  src={activeVideo.videoUrl}
                  controls
                  autoPlay
                  className="w-full h-full object-contain"
                >
                  متصفحك لا يدعم تشغيل الفيديو المباشر.
                </video>
              )}
            </div>

            {activeVideo.description && (
              <div className="p-4 bg-slate-900 text-xs text-slate-300 leading-relaxed">
                {activeVideo.description}
              </div>
            )}
          </div>
        </div>
      )}
    </section>
  );
};

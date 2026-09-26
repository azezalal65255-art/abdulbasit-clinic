import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { ImageUploadField } from './ImageUploadField';
import {
  Video,
  Plus,
  Edit,
  Trash2,
  X,
  RefreshCw,
  Clock,
  ExternalLink,
  ChevronUp,
  ChevronDown,
  Play,
  CheckCircle2,
  AlertCircle,
  Eye,
  EyeOff,
  Save,
  FileVideo,
  Image as ImageIcon,
} from 'lucide-react';

interface VideosViewProps {
  showToast: (type: 'success' | 'error' | 'info', text: string) => void;
}

export const VideosView: React.FC<VideosViewProps> = ({ showToast }) => {
  const [videos, setVideos] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<any | null>(null);

  // Expanded fields supporting 3 ways to add video & custom cover images
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    videoType: 'youtube', // 'youtube' | 'external' | 'upload'
    youtubeUrl: '',
    externalUrl: '',
    uploadedUrl: '',
    duration: '05:00',
    thumbnailUrl: '',
    targetPage: 'homepage', // 'homepage' | 'awareness' | 'all'
    order: 1,
    isActive: true,
  });

  const fetchVideos = async () => {
    setIsLoading(true);
    try {
      const data = await api.getVideos();
      setVideos(data || []);
    } catch (err: any) {
      showToast('error', err.message || 'فشل تحميل الفيديوهات');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchVideos();
  }, []);

  const openNewModal = () => {
    setSelectedItem(null);
    setFormData({
      title: '',
      description: '',
      videoType: 'youtube',
      youtubeUrl: '',
      externalUrl: '',
      uploadedUrl: '',
      duration: '05:00',
      thumbnailUrl: '',
      targetPage: 'homepage',
      order: videos.length + 1,
      isActive: true,
    });
    setIsModalOpen(true);
  };

  const openEditModal = (item: any) => {
    setSelectedItem(item);
    setFormData({
      title: item.title || '',
      description: item.description || '',
      videoType: item.videoType || (item.youtubeUrl ? 'youtube' : 'external'),
      youtubeUrl: item.youtubeUrl || '',
      externalUrl: item.externalUrl || '',
      uploadedUrl: item.uploadedUrl || '',
      duration: item.duration || '05:00',
      thumbnailUrl: item.thumbnailUrl || '',
      targetPage: item.targetPage || 'homepage',
      order: item.order || 1,
      isActive: item.isActive !== false,
    });
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim()) {
      showToast('error', 'عنوان الفيديو مطلوب');
      return;
    }

    // Determine final video url depending on selected type
    let finalUrl = '';
    if (formData.videoType === 'youtube') {
      if (!formData.youtubeUrl.trim()) {
        showToast('error', 'رابط يوتيوب مطلوب');
        return;
      }
      finalUrl = formData.youtubeUrl;
    } else if (formData.videoType === 'external') {
      if (!formData.externalUrl.trim()) {
        showToast('error', 'رابط الفيديو الخارجي مطلوب');
        return;
      }
      finalUrl = formData.externalUrl;
    } else {
      if (!formData.uploadedUrl.trim()) {
        showToast('error', 'يرجى رفع ملف الفيديو أولاً');
        return;
      }
      finalUrl = formData.uploadedUrl;
    }

    try {
      const payload = {
        ...formData,
        youtubeUrl: formData.videoType === 'youtube' ? finalUrl : '',
        externalUrl: formData.videoType === 'external' ? finalUrl : '',
        uploadedUrl: formData.videoType === 'upload' ? finalUrl : '',
        // If custom thumbnail is not set, use a YouTube fallback if available
        thumbnailUrl: formData.thumbnailUrl || (formData.videoType === 'youtube' ? `https://img.youtube.com/vi/${getYouTubeId(formData.youtubeUrl)}/hqdefault.jpg` : '/images/real_endoscopy_suite_1790357440526.jpg'),
      };

      if (selectedItem) {
        await api.updateVideo(selectedItem.id, payload);
        showToast('success', 'تم تحديث بيانات الفيديو وصورة الغلاف بنجاح 100%');
      } else {
        await api.createVideo(payload);
        showToast('success', 'تم حفظ ونشر الفيديو الطبي الجديد بنجاح 100%');
      }
      setIsModalOpen(false);
      fetchVideos();
    } catch (err: any) {
      showToast('error', err.message || 'فشل حفظ الفيديو');
    }
  };

  const handleDelete = async (id: string, title: string) => {
    if (!window.confirm(`هل أنت متأكد من حذف الفيديو: "${title}" نهائيًا؟ لن يتم التراجع بعد التأكيد.`)) return;

    try {
      await api.deleteVideo(id);
      showToast('success', 'تم حذف العنصر بنجاح من قاعدة البيانات');
      fetchVideos();
    } catch (err: any) {
      showToast('error', err.message || 'فشل حذف الفيديو');
    }
  };

  const handleToggleStatus = async (item: any) => {
    try {
      await api.updateVideo(item.id, { isActive: !item.isActive });
      showToast('success', item.isActive ? 'تم إخفاء الفيديو مؤقتاً بنجاح' : 'تم عرض وتفعيل الفيديو الطبي بنجاح');
      fetchVideos();
    } catch (err: any) {
      showToast('error', err.message || 'فشل تحديث الحالة');
    }
  };

  const handleMove = async (index: number, direction: 'up' | 'down') => {
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= videos.length) return;

    const newOrder = [...videos];
    const [moved] = newOrder.splice(index, 1);
    newOrder.splice(targetIndex, 0, moved);

    setVideos(newOrder);

    try {
      await api.reorderVideos(newOrder.map((v) => v.id));
      showToast('success', 'تمت إعادة ترتيب قائمة الفيديوهات بنجاح وتحديثها في قاعدة البيانات');
    } catch (err: any) {
      showToast('error', err.message || 'فشل حفظ الترتيب الجديد');
      fetchVideos();
    }
  };

  const getYouTubeId = (url: string) => {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
    const match = url.match(regExp);
    return match && match[2].length === 11 ? match[2] : '';
  };

  return (
    <div className="space-y-5 text-right animate-in fade-in duration-300" dir="rtl">
      {/* Top Banner */}
      <div className="bg-white rounded-2xl p-4 shadow-xs border border-[#E2EAF0] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-sm font-black text-[#064B82] flex items-center gap-2">
            <Video className="w-5 h-5 text-[#064B82]" />
            مكتبة الفيديوهات والتوعية الطبية المرئية
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            إضافة وإدارة مقاطع الفيديو الطبية الإرشادية لمرضى الجهاز الهضمي، الكبد والمناظير وتخصيص صور غلاف مميزة
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={fetchVideos}
            className="p-2 text-slate-500 hover:bg-slate-50 border border-slate-200 rounded-xl transition cursor-pointer"
            title="تحديث القائمة"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
          <button
            onClick={openNewModal}
            className="flex items-center gap-1.5 px-4 py-2 bg-[#064B82] hover:bg-[#0B70B7] text-white rounded-xl text-xs font-bold shadow-xs transition cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            إضافة فيديو طبي جديد
          </button>
        </div>
      </div>

      {/* Videos List / Grid */}
      {isLoading ? (
        <div className="flex justify-center items-center py-20">
          <RefreshCw className="w-8 h-8 text-[#064B82] animate-spin" />
        </div>
      ) : videos.length === 0 ? (
        <div className="bg-white rounded-2xl p-12 text-center border border-[#E2EAF0] shadow-xs">
          <Video className="w-16 h-16 text-slate-300 mx-auto mb-4" />
          <h3 className="text-sm font-bold text-slate-700">لا توجد مقاطع فيديو توعوية بعد</h3>
          <p className="text-slate-500 text-xs mt-1">
            شارك مرضى العيادة والزوار بأحدث النصائح والمقاطع الطبية التوعوية من قناتك الرسمية.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {videos.map((vid, idx) => {
            const ytId = getYouTubeId(vid.youtubeUrl || '');
            const coverImage = vid.thumbnailUrl || (ytId ? `https://img.youtube.com/vi/${ytId}/hqdefault.jpg` : '/images/real_endoscopy_suite_1790357440526.jpg');

            return (
              <div
                key={vid.id}
                className={`bg-white rounded-2xl border overflow-hidden flex flex-col justify-between shadow-xs transition-all ${
                  !vid.isActive ? 'border-amber-200 bg-amber-50/10' : 'border-[#E2EAF0] hover:border-[#0B70B7]/30'
                }`}
              >
                {/* Video Banner Cover */}
                <div className="aspect-video bg-slate-950 relative overflow-hidden flex items-center justify-center group">
                  <img
                    src={coverImage}
                    alt={vid.title}
                    className="w-full h-full object-cover transition-transform group-hover:scale-105"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                    <div className="w-11 h-11 rounded-full bg-white/90 text-[#064B82] flex items-center justify-center shadow-lg transform group-hover:scale-110 transition-transform">
                      <Play className="w-5 h-5 fill-current ml-0.5" />
                    </div>
                  </div>

                  <span className="absolute top-2 right-2 bg-black/60 text-white text-[9px] font-bold px-2 py-0.5 rounded backdrop-blur-xs flex items-center gap-1">
                    {vid.videoType === 'upload' ? 'رفع ملف مباشر' : vid.videoType === 'external' ? 'رابط خارجي' : 'يوتيوب'}
                  </span>

                  {vid.duration && (
                    <span className="absolute bottom-2 left-2 bg-black/70 text-white text-[10px] font-mono px-2 py-0.5 rounded">
                      {vid.duration}
                    </span>
                  )}
                </div>

                <div className="p-4 flex-1 flex flex-col justify-between">
                  <div>
                    <h3 className="text-xs font-black text-[#17354F] line-clamp-1">{vid.title}</h3>
                    <p className="text-[11px] text-gray-500 mt-1 line-clamp-2 h-8 leading-relaxed">
                      {vid.description || 'لا يوجد وصف مضاف لهذا المقطع الطبي'}
                    </p>
                  </div>

                  {/* Actions / Order buttons */}
                  <div className="mt-4 pt-3 border-t border-[#E2EAF0] flex items-center justify-between">
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleMove(idx, 'up')}
                        disabled={idx === 0}
                        className="p-1 rounded bg-slate-100 hover:bg-slate-200 text-gray-700 cursor-pointer disabled:opacity-30"
                        title="تحريك لأعلى"
                      >
                        <ChevronUp className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleMove(idx, 'down')}
                        disabled={idx === videos.length - 1}
                        className="p-1 rounded bg-slate-100 hover:bg-slate-200 text-gray-700 cursor-pointer disabled:opacity-30"
                        title="تحريك لأسفل"
                      >
                        <ChevronDown className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleToggleStatus(vid)}
                        className={`p-1.5 rounded-lg text-xs font-bold cursor-pointer ${
                          vid.isActive ? 'bg-amber-50 hover:bg-amber-100 text-amber-700' : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-800'
                        }`}
                        title={vid.isActive ? 'إخفاء الفيديو من الموقع' : 'عرض وتفعيل الفيديو'}
                      >
                        {vid.isActive ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                      </button>

                      <button
                        onClick={() => openEditModal(vid)}
                        className="p-1.5 rounded-lg bg-blue-50 hover:bg-blue-100 text-[#064B82] cursor-pointer"
                        title="تعديل الفيديو والغلاف"
                      >
                        <Edit className="w-3.5 h-3.5" />
                      </button>

                      <button
                        onClick={() => handleDelete(vid.id, vid.title)}
                        className="p-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-600 cursor-pointer"
                        title="حذف نهائي"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Add / Edit Video Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl border border-[#E2EAF0] max-w-lg w-full p-5 space-y-4 animate-in fade-in zoom-in-95 text-right">
            <div className="flex items-center justify-between border-b border-[#E2EAF0] pb-3">
              <h3 className="text-sm font-bold text-[#064B82]">
                {selectedItem ? 'تعديل بيانات الفيديو وصورة الغلاف' : 'إضافة فيديو طبي جديد'}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="p-1 text-gray-400 hover:text-gray-600 cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-[#17354F] mb-1">عنوان الفيديو الطبي *</label>
                  <input
                    type="text"
                    required
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder="مثال: أهمية الكشف المبكر عن جرثومة المعدة"
                    className="w-full py-2 px-3 bg-[#F8FAFC] border border-[#E2EAF0] rounded-xl text-xs"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#17354F] mb-1">المدة (مثال 05:40)</label>
                  <input
                    type="text"
                    value={formData.duration}
                    onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                    placeholder="05:40"
                    className="w-full py-2 px-3 bg-[#F8FAFC] border border-[#E2EAF0] rounded-xl text-xs font-mono"
                    dir="ltr"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#17354F] mb-1">طريقة إضافة الفيديو *</label>
                <div className="grid grid-cols-3 gap-2 p-1 bg-slate-100 rounded-xl text-[11px] font-bold">
                  {[
                    { id: 'youtube', label: 'رابط يوتيوب' },
                    { id: 'external', label: 'رابط خارجي ميديا' },
                    { id: 'upload', label: 'رفع فيديو مباشر' },
                  ].map((opt) => (
                    <button
                      key={opt.id}
                      type="button"
                      onClick={() => setFormData({ ...formData, videoType: opt.id })}
                      className={`py-1.5 px-2 rounded-lg text-center transition-all cursor-pointer ${
                        formData.videoType === opt.id ? 'bg-white text-[#064B82] shadow-xs' : 'text-gray-500'
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>

              {formData.videoType === 'youtube' && (
                <div>
                  <label className="block text-xs font-bold text-[#17354F] mb-1">رابط YouTube الرسمي للعيادة *</label>
                  <input
                    type="url"
                    required
                    value={formData.youtubeUrl}
                    onChange={(e) => setFormData({ ...formData, youtubeUrl: e.target.value })}
                    placeholder="https://www.youtube.com/watch?v=..."
                    className="w-full py-2 px-3 bg-[#F8FAFC] border border-[#E2EAF0] rounded-xl text-xs font-mono"
                    dir="ltr"
                  />
                </div>
              )}

              {formData.videoType === 'external' && (
                <div>
                  <label className="block text-xs font-bold text-[#17354F] mb-1">رابط ملف الفيديو الخارجي (URL) *</label>
                  <input
                    type="url"
                    required
                    value={formData.externalUrl}
                    onChange={(e) => setFormData({ ...formData, externalUrl: e.target.value })}
                    placeholder="https://example.com/videos/physician-advice.mp4"
                    className="w-full py-2 px-3 bg-[#F8FAFC] border border-[#E2EAF0] rounded-xl text-xs font-mono"
                    dir="ltr"
                  />
                </div>
              )}

              {formData.videoType === 'upload' && (
                <div>
                  <label className="block text-xs font-bold text-[#17354F] mb-1">مسار ملف الفيديو المرفوع *</label>
                  <input
                    type="text"
                    value={formData.uploadedUrl}
                    onChange={(e) => setFormData({ ...formData, uploadedUrl: e.target.value })}
                    placeholder="https://... رابط ملف الفيديو"
                    className="w-full py-2 px-3 bg-[#F8FAFC] border border-[#E2EAF0] rounded-xl text-xs font-mono"
                    dir="ltr"
                  />
                  <p className="text-[10px] text-gray-400 mt-1">تضمين المسار الآمن للمقطع أو رفعه عبر مكتبة التخزين الدائم</p>
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-[#17354F] mb-1">تخصيص صورة الغلاف / غلاف الفيديو (Thumbnail)</label>
                <ImageUploadField
                  label="صورة غلاف مخصصة للفيديو"
                  sublabel="ارفع صورة مخصصة تظهر كغلاف للمقطع قبل التشغيل بدلاً من غلاف يوتيوب الافتراضي"
                  value={formData.thumbnailUrl}
                  onChange={(url) => setFormData({ ...formData, thumbnailUrl: url })}
                  category="videos"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#17354F] mb-1">صفحة عرض المقطع</label>
                <select
                  value={formData.targetPage}
                  onChange={(e) => setFormData({ ...formData, targetPage: e.target.value })}
                  className="w-full py-2 px-3 bg-[#F8FAFC] border border-[#E2EAF0] rounded-xl text-xs"
                >
                  <option value="homepage">الصفحة الرئيسية فقط</option>
                  <option value="awareness">مكتبة التوعية والفيديوهات</option>
                  <option value="all">كلا الصفحتين معاً</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#17354F] mb-1">وصف مختصر للفيديو</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="موجز بسيط يوضح الفائدة الطبية من المقطع"
                  className="w-full py-2 px-3 bg-[#F8FAFC] border border-[#E2EAF0] rounded-xl text-xs h-16 resize-none"
                />
              </div>

              <div className="pt-3 border-t border-[#E2EAF0] flex justify-end gap-2 text-xs font-bold">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="py-2 px-4 rounded-xl text-gray-600 hover:bg-gray-100 cursor-pointer"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="py-2 px-5 bg-[#064B82] hover:bg-[#0B70B7] text-white rounded-xl shadow-xs cursor-pointer flex items-center gap-1.5"
                >
                  <Save className="w-4 h-4" />
                  حفظ وتفعيل الفيديو
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

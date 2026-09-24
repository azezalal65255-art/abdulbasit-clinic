import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { uploadOriginalImage } from '../services/uploadService';
import {
  Image as ImageIcon,
  Upload,
  Search,
  Check,
  X,
  RefreshCw,
  FolderOpen,
} from 'lucide-react';

interface ImagePickerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectImage: (imageUrl: string, imageTitle?: string) => void;
  currentImageUrl?: string;
  title?: string;
}

export const ImagePickerModal: React.FC<ImagePickerModalProps> = ({
  isOpen,
  onClose,
  onSelectImage,
  currentImageUrl,
  title = 'اختيار صورة من المكتبة أو رفع صورة جديدة',
}) => {
  const [mediaList, setMediaList] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [activeTab, setActiveTab] = useState<'library' | 'upload'>('library');

  // New image upload states
  const [newImageTitle, setNewImageTitle] = useState('');
  const [newImageUrl, setNewImageUrl] = useState('');
  const [newImageCategory, setNewImageCategory] = useState('عام');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [previewUrl, setPreviewUrl] = useState('');

  const fetchMedia = async () => {
    try {
      setIsLoading(true);
      const list = await api.getMedia();
      setMediaList(list || []);
    } catch (err) {
      console.error('Failed to load media:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchMedia();
      setPreviewUrl(currentImageUrl || '');
    }
  }, [isOpen, currentImageUrl]);

  if (!isOpen) return null;

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('يرجى اختيار ملف صورة صالح (JPG, PNG, WebP)');
      return;
    }

    if (file.size > 15 * 1024 * 1024) {
      alert('حجم الصورة كبير جداً، يرجى اختيار ملف أقل من 15 ميغابايت');
      return;
    }

    setSelectedFile(file);
    // Instant local preview from original file
    const localUrl = URL.createObjectURL(file);
    setPreviewUrl(localUrl);
    setNewImageUrl(localUrl);

    if (!newImageTitle) {
      setNewImageTitle(file.name.replace(/\.[^/.]+$/, ''));
    }
  };

  const handleSaveAndSelect = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newImageTitle.trim()) {
      alert('يرجى تحديد عنوان للصورة');
      return;
    }

    if (!selectedFile && !newImageUrl) {
      alert('يرجى اختيار ملف صورة من جهازك أو إدخال رابط صالح');
      return;
    }

    try {
      setIsSubmitting(true);
      let targetUrl = newImageUrl;

      // Upload original file directly without any alteration or AI model
      if (selectedFile) {
        targetUrl = await uploadOriginalImage(selectedFile);
      }

      const res = await api.uploadMedia({
        title: newImageTitle.trim(),
        url: targetUrl,
        category: newImageCategory,
      });

      const finalUrl = res.item?.url || targetUrl;
      onSelectImage(finalUrl, newImageTitle);
      onClose();
    } catch (err: any) {
      alert(err.message || 'تعذر رفع الصورة. يرجى المحاولة مرة أخرى.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredMedia = mediaList.filter((m) => {
    const matchesSearch =
      (m.title || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (m.name || '').toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory =
      selectedCategory === 'all' || m.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="fixed inset-0 z-[100] bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5" dir="rtl">
      <div className="bg-white rounded-2xl shadow-2xl border border-[#E2EAF0] max-w-3xl w-full flex flex-col max-h-[90vh] overflow-hidden animate-in fade-in zoom-in-95">
        
        {/* Header */}
        <div className="p-4 border-b border-[#E2EAF0] flex items-center justify-between bg-gradient-to-l from-slate-50 to-white">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-blue-50 text-[#064B82] flex items-center justify-center font-bold">
              <ImageIcon className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-[#064B82]">{title}</h3>
              <p className="text-[11px] text-[#667788]">
                اختر صورة من وسائط العيادة أو ارفع صورة جديدة مباشرة
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center gap-2 px-4 pt-3 border-b border-[#E2EAF0] bg-gray-50/50">
          <button
            type="button"
            onClick={() => setActiveTab('library')}
            className={`pb-2 px-3 text-xs font-bold border-b-2 flex items-center gap-1.5 transition-colors cursor-pointer ${
              activeTab === 'library'
                ? 'border-[#064B82] text-[#064B82]'
                : 'border-transparent text-gray-500 hover:text-gray-800'
            }`}
          >
            <FolderOpen className="w-3.5 h-3.5" />
            تصفح مكتبة الوسائط ({mediaList.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('upload')}
            className={`pb-2 px-3 text-xs font-bold border-b-2 flex items-center gap-1.5 transition-colors cursor-pointer ${
              activeTab === 'upload'
                ? 'border-[#064B82] text-[#064B82]'
                : 'border-transparent text-gray-500 hover:text-gray-800'
            }`}
          >
            <Upload className="w-3.5 h-3.5" />
            رفع صورة جديدة
          </button>
        </div>

        {/* Tab 1: Library */}
        {activeTab === 'library' && (
          <div className="p-4 flex-1 overflow-y-auto flex flex-col space-y-3">
            {/* Search and filter bar */}
            <div className="flex flex-col sm:flex-row gap-2">
              <div className="relative flex-1">
                <Search className="w-3.5 h-3.5 text-gray-400 absolute right-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="ابحث باسم الصورة..."
                  className="w-full py-1.5 pr-8 pl-3 bg-[#F8FAFC] border border-[#E2EAF0] rounded-xl text-xs"
                />
              </div>
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
                {['all', 'عيادة', 'طبيب', 'أجهزة', 'مقالات', 'عام'].map((cat) => (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setSelectedCategory(cat)}
                    className={`py-1 px-2.5 rounded-lg font-medium whitespace-nowrap text-[11px] transition-colors cursor-pointer ${
                      selectedCategory === cat
                        ? 'bg-[#064B82] text-white'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    {cat === 'all' ? 'الكل' : cat}
                  </button>
                ))}
              </div>
            </div>

            {/* Grid */}
            {isLoading ? (
              <div className="py-12 text-center text-gray-400 flex flex-col items-center justify-center">
                <RefreshCw className="w-6 h-6 animate-spin text-[#064B82] mb-2" />
                <span className="text-xs">جاري تحميل الصور...</span>
              </div>
            ) : filteredMedia.length === 0 ? (
              <div className="py-12 text-center bg-gray-50 rounded-xl border border-dashed border-gray-200">
                <ImageIcon className="w-8 h-8 mx-auto text-gray-300 mb-1" />
                <p className="text-xs text-gray-500 font-medium">لا توجد صور مطابقة</p>
                <button
                  type="button"
                  onClick={() => setActiveTab('upload')}
                  className="mt-2 text-xs text-[#064B82] font-bold hover:underline"
                >
                  اضغط هنا لرفع صورة جديدة
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                {filteredMedia.map((m) => {
                  const isSelected = (m.url || '') === currentImageUrl;
                  return (
                    <div
                      key={m.id}
                      onClick={() => {
                        onSelectImage(m.url, m.title);
                        onClose();
                      }}
                      className={`group relative rounded-xl border overflow-hidden cursor-pointer transition-all hover:shadow-md ${
                        isSelected
                          ? 'border-[#2fa84f] ring-2 ring-[#2fa84f]/40'
                          : 'border-[#E2EAF0] hover:border-[#064B82]'
                      }`}
                    >
                      <div className="aspect-video bg-gray-100 relative overflow-hidden">
                        <img
                          src={m.url}
                          alt={m.title}
                          className="w-full h-full object-cover transition-transform group-hover:scale-105"
                          referrerPolicy="no-referrer"
                        />
                        {isSelected && (
                          <div className="absolute top-1.5 left-1.5 bg-[#2fa84f] text-white p-1 rounded-full shadow-xs">
                            <Check className="w-3 h-3 stroke-[3]" />
                          </div>
                        )}
                        <span className="absolute bottom-1 right-1 bg-black/60 text-white text-[9px] px-1.5 py-0.5 rounded">
                          {m.category || 'صورة'}
                        </span>
                      </div>
                      <div className="p-2 bg-white">
                        <p className="text-[11px] font-bold text-[#17354F] truncate" title={m.title}>
                          {m.title}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* Tab 2: Upload */}
        {activeTab === 'upload' && (
          <form onSubmit={handleSaveAndSelect} className="p-4 space-y-4 flex-1 overflow-y-auto">
            <div>
              <label className="block text-xs font-bold text-[#17354F] mb-1">
                عنوان أو وصف الصورة *
              </label>
              <input
                type="text"
                required
                value={newImageTitle}
                onChange={(e) => setNewImageTitle(e.target.value)}
                placeholder="مثال: صورة دكتور عبدالباسط في عيادة المناظير"
                className="w-full py-2 px-3 bg-[#F8FAFC] border border-[#E2EAF0] rounded-xl text-xs"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-[#17354F] mb-1">
                رفع ملف الصورة من جهازك (مباشر) *
              </label>
              <div className="border-2 border-dashed border-slate-300 hover:border-[#064B82] rounded-2xl p-6 text-center bg-slate-50 transition-colors">
                <Upload className="w-8 h-8 text-[#064B82] mx-auto mb-2" />
                <p className="text-xs font-bold text-[#17354F]">اضغط لاختيار صورة من جهازك أو اسحبها هنا</p>
                <p className="text-[11px] text-gray-500 mt-1">PNG, JPG, WebP بحجم أقصى 10 ميغابايت</p>
                <label className="mt-3 inline-flex items-center gap-2 py-2 px-4 bg-[#064B82] hover:bg-[#0B70B7] text-white text-xs font-bold rounded-xl cursor-pointer shadow-xs transition-all">
                  <Upload className="w-3.5 h-3.5" />
                  <span>تصفح ملفات جهازك</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                </label>
              </div>
            </div>

            {previewUrl && (
              <div>
                <span className="block text-[11px] font-bold text-gray-600 mb-1">معاينة الصورة:</span>
                <div className="aspect-video max-h-48 rounded-xl bg-gray-100 overflow-hidden border border-[#E2EAF0] flex items-center justify-center">
                  <img
                    src={previewUrl}
                    alt="معاينة"
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                </div>
              </div>
            )}

            <div className="pt-3 border-t border-[#E2EAF0] flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={onClose}
                className="py-2 px-4 rounded-xl text-xs font-semibold text-gray-600 hover:bg-gray-100"
              >
                إلغاء
              </button>
              <button
                type="submit"
                disabled={isSubmitting || !newImageUrl}
                className="py-2 px-5 rounded-xl bg-[#064B82] hover:bg-[#0B70B7] text-white text-xs font-bold disabled:opacity-50 flex items-center gap-1.5 cursor-pointer"
              >
                {isSubmitting ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    جاري الحفظ...
                  </>
                ) : (
                  <>
                    <Check className="w-3.5 h-3.5" />
                    حفظ واختيار هذه الصورة
                  </>
                )}
              </button>
            </div>
          </form>
        )}

      </div>
    </div>
  );
};

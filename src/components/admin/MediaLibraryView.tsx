import React, { useState, useEffect, useRef } from 'react';
import { api } from '../../services/api';
import { uploadOriginalImage } from '../../services/uploadService';
import { useClinicData } from '../../context/ClinicDataContext';
import {
  Image as ImageIcon,
  Plus,
  Trash2,
  Copy,
  Check,
  Upload,
  RefreshCw,
  X,
  ExternalLink,
  ShieldCheck,
  AlertTriangle,
  ArrowLeftRight,
  Video,
  Search,
  RotateCcw,
  Eye,
  Edit2,
  Info,
  CheckCircle2,
  HardDrive,
  FileCheck,
} from 'lucide-react';

interface MediaLibraryViewProps {
  showToast: (type: 'success' | 'error' | 'info', text: string) => void;
}

const FALLBACK_SVG =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='600' height='400' viewBox='0 0 600 400'%3E%3Crect width='600' height='400' fill='%23F4F9FD'/%3E%3Crect x='20' y='20' width='560' height='360' rx='16' fill='%23FFFFFF' stroke='%23BED8EA' stroke-width='2'/%3E%3Ccircle cx='300' cy='170' r='48' fill='%23E2EAF0'/%3E%3Cpath d='M285 170h30M300 155v30' stroke='%23064B82' stroke-width='5' stroke-linecap='round'/%3E%3Ctext x='300' y='250' text-anchor='middle' font-family='sans-serif' font-size='16' font-weight='bold' fill='%23064B82'%3E%D8%B9%D9%8A%D8%A7%D8%AF%D8%A9 %D8%AF. %D8%B9%D8%A8%D8%AF%D8%A7%D9%84%D8%A8%D8%A7%D8%B3%D8%B7 %D9%85%D9%82%D8%A8%D9%84%3C/text%3E%3Ctext x='300' y='275' text-anchor='middle' font-family='sans-serif' font-size='12' fill='%23667788'%3E%D8%B5%D9%88%D8%B1%D8%A9 %D8%B7%D8%A8%D9%8A%D8%A9 %D9%85%D8%B9%D8%AA%D9%85%D8%AF%D8%A9%3C/text%3E%3C/svg%3E";

export const MediaLibraryView: React.FC<MediaLibraryViewProps> = ({ showToast }) => {
  const { refreshContent } = useClinicData();
  const [mediaList, setMediaList] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isReconciling, setIsReconciling] = useState(false);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Filters & Search
  const [activeTab, setActiveTab] = useState<'all' | 'image' | 'video' | 'trash'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');

  // Preview Modal
  const [previewItem, setPreviewItem] = useState<any | null>(null);

  // Edit Metadata Modal
  const [editItem, setEditItem] = useState<any | null>(null);
  const [editForm, setEditForm] = useState({ title: '', category: '', altText: '' });

  // In-use delete warning modal state
  const [deleteModal, setDeleteModal] = useState<{
    isOpen: boolean;
    item: any | null;
    usages: string[];
  }>({
    isOpen: false,
    item: null,
    usages: [],
  });

  // Replace modal / file upload trigger
  const replaceFileInputRef = useRef<HTMLInputElement | null>(null);
  const [replacingMediaId, setReplacingMediaId] = useState<string | null>(null);
  const [isReplacing, setIsReplacing] = useState(false);

  const [newImage, setNewImage] = useState({
    title: '',
    url: '',
    category: 'عيادة',
    isVideo: false,
    youtubeUrl: '',
    duration: '',
  });

  const fetchMedia = async () => {
    setIsLoading(true);
    try {
      const list = await api.getMedia({
        status: activeTab === 'trash' ? 'trash' : 'active',
        type: activeTab === 'image' ? 'image' : activeTab === 'video' ? 'video' : 'all',
        category: categoryFilter,
        search: searchQuery,
      });
      setMediaList(list || []);
    } catch (err: any) {
      showToast('error', err.message || 'فشل تحميل مكتبة الوسائط');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchMedia();
  }, [activeTab, categoryFilter]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchMedia();
  };

  const handleReconcile = async () => {
    setIsReconciling(true);
    try {
      const res = await api.reconcileSystem();
      showToast(
        'success',
        `تمت مطابقة الوسائط بالتخزين الدائم: تم فحص ${res.report.totalPhysicalFiles} ملف واكتشاف ${res.report.orphanedFilesDiscovered} ملف جديد!`
      );
      fetchMedia();
    } catch (err: any) {
      showToast('error', err.message || 'تعذر استكمال فحص ومطابقة الوسائط');
    } finally {
      setIsReconciling(false);
    }
  };

  const handleCopy = (id: string, url: string) => {
    navigator.clipboard.writeText(url);
    setCopiedId(id);
    showToast('info', 'تم نسخ رابط الصورة الدائم إلى الحافظة');
    setTimeout(() => setCopiedId(null), 2500);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      showToast('error', 'يرجى اختيار ملف صورة صالح (JPG, PNG, WebP)');
      return;
    }

    if (file.size > 20 * 1024 * 1024) {
      showToast('error', 'حجم الصورة كبير جداً، يرجى اختيار صورة أقل من 20 ميغابايت');
      return;
    }

    setSelectedFile(file);
    const localUrl = URL.createObjectURL(file);
    setNewImage((prev) => ({
      ...prev,
      title: prev.title || file.name.replace(/\.[^/.]+$/, ''),
      url: localUrl,
    }));
  };

  const handleSaveImage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newImage.isVideo && !newImage.url && !selectedFile) {
      showToast('error', 'يرجى اختيار صورة من جهازك أولاً');
      return;
    }
    if (newImage.isVideo && !newImage.youtubeUrl) {
      showToast('error', 'يرجى إدخال رابط الفيديو');
      return;
    }
    if (!newImage.title.trim()) {
      showToast('error', 'يرجى إدخال اسم أو وصف للملف');
      return;
    }

    try {
      setIsSubmitting(true);
      let targetUrl = newImage.url;

      if (selectedFile) {
        targetUrl = await uploadOriginalImage(selectedFile);
      } else if (newImage.isVideo) {
        targetUrl = newImage.youtubeUrl;
      }

      await api.uploadMedia({
        title: newImage.title.trim(),
        name: newImage.title.trim(),
        url: targetUrl,
        category: newImage.category,
        isVideo: newImage.isVideo,
        youtubeUrl: newImage.isVideo ? newImage.youtubeUrl : undefined,
        duration: newImage.duration || undefined,
      });

      showToast('success', 'تم حفظ الملف في التخزين الدائم بنجاح 100%');
      setIsUploadModalOpen(false);
      setSelectedFile(null);
      setNewImage({ title: '', url: '', category: 'عيادة', isVideo: false, youtubeUrl: '', duration: '' });
      await fetchMedia();
      await refreshContent();
    } catch (err: any) {
      showToast('error', err.message || 'تعذر رفع الملف. يرجى المحاولة مرة أخرى.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Move to Trash (Soft Delete)
  const handleTrashRequest = async (item: any) => {
    if (item.usages && item.usages.length > 0) {
      setDeleteModal({
        isOpen: true,
        item,
        usages: item.usages,
      });
      return;
    }

    try {
      await api.trashMedia(item.id);
      showToast('info', 'تم نقل الملف إلى سلة المحذوفات (يمكن استعادته في أي وقت)');
      fetchMedia();
    } catch (err: any) {
      showToast('error', err.message || 'فشل نقل الملف إلى سلة المحذوفات');
    }
  };

  // Restore from Trash
  const handleRestore = async (id: string) => {
    try {
      await api.restoreMedia(id);
      showToast('success', 'تم استرجاع الملف بنجاح إلى مكتبة الوسائط');
      fetchMedia();
    } catch (err: any) {
      showToast('error', err.message || 'فشل استرجاع الملف');
    }
  };

  // Permanent Delete
  const handlePermanentDelete = async (id: string, force: boolean) => {
    try {
      await api.deleteMedia(id, force, true);
      showToast('info', 'تم حذف الملف نهائياً من المكتبة والقرص التخزيني');
      setDeleteModal({ isOpen: false, item: null, usages: [] });
      fetchMedia();
    } catch (err: any) {
      showToast('error', err.message || 'فشل حذف الملف نهائياً');
    }
  };

  // Empty Trash
  const handleEmptyTrash = async () => {
    if (!window.confirm('هل أنت متأكد من تفريغ سلة المحذوفات بالكامل؟ سيتم حذف جميع الملفات الموجودة فيها نهائياً من القرص.')) return;
    try {
      const res = await api.emptyMediaTrash();
      showToast('info', res.message || 'تم إفراغ سلة المحذوفات بنجاح');
      fetchMedia();
    } catch (err: any) {
      showToast('error', err.message || 'فشل تفريغ سلة المحذوفات');
    }
  };

  // Edit Metadata Modal Handlers
  const openEditModal = (item: any) => {
    setEditItem(item);
    setEditForm({
      title: item.title || item.name || '',
      category: item.category || 'عيادة',
      altText: item.altText || '',
    });
  };

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editItem) return;
    try {
      await api.updateMedia(editItem.id, editForm);
      showToast('success', 'تم تحديث بيانات الملف بنجاح');
      setEditItem(null);
      fetchMedia();
    } catch (err: any) {
      showToast('error', err.message || 'فشل تحديث البيانات');
    }
  };

  // Trigger replace image file selection
  const triggerReplace = (id: string) => {
    setReplacingMediaId(id);
    if (replaceFileInputRef.current) {
      replaceFileInputRef.current.value = '';
      replaceFileInputRef.current.click();
    }
  };

  const handleReplaceFileSelected = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !replacingMediaId) return;

    if (!file.type.startsWith('image/')) {
      showToast('error', 'يرجى اختيار ملف صورة صالح (JPG, PNG, WebP)');
      return;
    }

    try {
      setIsReplacing(true);
      showToast('info', 'جاري استبدال الصورة وتحديث كافة مواضع استخدامها...');

      const formData = new FormData();
      formData.append('file', file);

      const res = await api.replaceMedia(replacingMediaId, formData);
      showToast(
        'success',
        `تم استبدال الصورة وتحديث ${res.updatedCount || 1} مواضع في الموقع بنجاح 100%!`
      );
      await fetchMedia();
      await refreshContent();
    } catch (err: any) {
      showToast('error', err.message || 'فشل استبدال الصورة');
    } finally {
      setIsReplacing(false);
      setReplacingMediaId(null);
    }
  };

  return (
    <div className="space-y-5">
      {/* Hidden File Input for Replace Action */}
      <input
        type="file"
        ref={replaceFileInputRef}
        onChange={handleReplaceFileSelected}
        accept="image/*"
        className="hidden"
      />

      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-[#E2EAF0] shadow-sm">
        <div>
          <h2 className="text-sm font-bold text-[#064B82]">مكتبة الصور والوسائط المركزية (Persistent Media)</h2>
          <p className="text-xs text-[#667788] mt-0.5">
            تخزين دائم معزول لصور العيادة والأجهزة والمقالات، مع إدارة متكاملة للحذف المرن واستبدال الملفات
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={handleReconcile}
            disabled={isReconciling}
            className="inline-flex items-center gap-1.5 py-2 px-3 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-xs font-bold rounded-xl border border-emerald-200 shadow-xs transition-colors cursor-pointer"
            title="فحص ومطابقة جميع ملفات التخزين الفعلي مع قاعدة البيانات"
          >
            <ShieldCheck className={`w-3.5 h-3.5 ${isReconciling ? 'animate-spin' : ''}`} />
            {isReconciling ? 'جاري الفحص...' : 'فحص ومطابقة الوسائط'}
          </button>

          {activeTab === 'trash' && mediaList.length > 0 && (
            <button
              onClick={handleEmptyTrash}
              className="inline-flex items-center gap-1.5 py-2 px-3 bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-bold rounded-xl border border-rose-200 shadow-xs transition-colors cursor-pointer"
            >
              <Trash2 className="w-3.5 h-3.5" />
              إفراغ سلة المحذوفات
            </button>
          )}

          <button
            onClick={() => setIsUploadModalOpen(true)}
            className="inline-flex items-center gap-1.5 py-2 px-4 bg-[#064B82] hover:bg-[#0B70B7] text-white text-xs font-bold rounded-xl shadow-xs transition-colors cursor-pointer"
          >
            <Upload className="w-3.5 h-3.5" />
            رفع وسائط جديدة
          </button>
        </div>
      </div>

      {/* Filter Tabs & Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-[#E2EAF0] shadow-sm space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          {/* Tabs */}
          <div className="flex items-center gap-1 bg-[#F1F5F9] p-1 rounded-xl text-xs font-medium">
            <button
              onClick={() => setActiveTab('all')}
              className={`py-1.5 px-3 rounded-lg transition-all cursor-pointer ${
                activeTab === 'all'
                  ? 'bg-white text-[#064B82] font-bold shadow-xs'
                  : 'text-[#667788] hover:text-[#17354F]'
              }`}
            >
              جميع الوسائط
            </button>
            <button
              onClick={() => setActiveTab('image')}
              className={`py-1.5 px-3 rounded-lg transition-all cursor-pointer ${
                activeTab === 'image'
                  ? 'bg-white text-[#064B82] font-bold shadow-xs'
                  : 'text-[#667788] hover:text-[#17354F]'
              }`}
            >
              الصور فقط
            </button>
            <button
              onClick={() => setActiveTab('video')}
              className={`py-1.5 px-3 rounded-lg transition-all cursor-pointer ${
                activeTab === 'video'
                  ? 'bg-white text-emerald-700 font-bold shadow-xs'
                  : 'text-[#667788] hover:text-[#17354F]'
              }`}
            >
              الفيديوهات الطبية
            </button>
            <button
              onClick={() => setActiveTab('trash')}
              className={`py-1.5 px-3 rounded-lg transition-all cursor-pointer ${
                activeTab === 'trash'
                  ? 'bg-white text-rose-700 font-bold shadow-xs'
                  : 'text-[#667788] hover:text-[#17354F]'
              }`}
            >
              سلة المحذوفات
            </button>
          </div>

          {/* Search & Category */}
          <form onSubmit={handleSearchSubmit} className="flex items-center gap-2 flex-1 max-w-md">
            <div className="relative flex-1">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="ابحث في أسماء وعناوين الملفات..."
                className="w-full py-1.5 pl-8 pr-3 bg-[#F8FAFC] border border-[#E2EAF0] rounded-xl text-xs focus:ring-2 focus:ring-[#0B70B7]"
              />
              <Search className="w-3.5 h-3.5 text-gray-400 absolute left-2.5 top-2.5" />
            </div>
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="py-1.5 px-2.5 bg-[#F8FAFC] border border-[#E2EAF0] rounded-xl text-xs text-[#17354F]"
            >
              <option value="all">كافة الأقسام</option>
              <option value="عيادة">مرافق العيادة</option>
              <option value="طبيب">الطبيب</option>
              <option value="أجهزة">أجهزة ومناظير</option>
              <option value="مقالات">صور المقالات</option>
              <option value="فيديوهات طبية">فيديوهات طبية</option>
              <option value="عام">أخرى</option>
            </select>
          </form>
        </div>
      </div>

      {/* Media Grid */}
      {isLoading ? (
        <div className="p-12 text-center text-[#667788]">
          <RefreshCw className="w-6 h-6 animate-spin mx-auto text-[#064B82] mb-2" />
          جاري تحميل الوسائط من التخزين الدائم...
        </div>
      ) : mediaList.length === 0 ? (
        <div className="bg-white rounded-2xl border border-[#E2EAF0] p-12 text-center text-[#667788]">
          <ImageIcon className="w-8 h-8 mx-auto text-[#064B82] mb-3 opacity-60" />
          <p className="font-bold text-sm text-[#17354F]">لا توجد وسائط في هذا القسم</p>
          <p className="text-xs mt-1">يمكنك رفع صور أو فيديوهات جديدة للعيادة في أي وقت</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {mediaList.map((m) => {
            const displayTitle = m.title || m.name || (m.isVideo ? 'فيديو طبي' : 'صورة طبية');
            const displayDate = m.createdAt || m.uploadedAt || new Date().toISOString();
            const isInUse = Boolean(m.inUse || (m.usages && m.usages.length > 0));

            return (
              <div
                key={m.id}
                className={`bg-white rounded-2xl border transition-all shadow-sm overflow-hidden flex flex-col justify-between group ${
                  m.status === 'trash'
                    ? 'border-rose-200 bg-rose-50/10'
                    : 'border-[#E2EAF0] hover:border-[#0B70B7]/40'
                }`}
              >
                <div
                  onClick={() => setPreviewItem(m)}
                  className="aspect-video bg-slate-100 relative overflow-hidden flex items-center justify-center cursor-pointer"
                >
                  {m.isVideo ? (
                    <div className="w-full h-full bg-slate-800 flex flex-col items-center justify-center text-white relative">
                      <Video className="w-8 h-8 text-emerald-400 mb-1" />
                      <span className="text-[10px] font-bold">فيديو يوتيوب</span>
                      {m.videoDuration && (
                        <span className="absolute bottom-1 left-1 bg-black/70 px-1.5 py-0.5 rounded text-[9px] font-mono">
                          {m.videoDuration}
                        </span>
                      )}
                    </div>
                  ) : (
                    <img
                      src={m.url}
                      alt={displayTitle}
                      className="w-full h-full object-cover transition-transform group-hover:scale-105"
                      referrerPolicy="no-referrer"
                      onError={(e) => {
                        (e.currentTarget as HTMLImageElement).src = FALLBACK_SVG;
                      }}
                    />
                  )}

                  {/* Top Badges */}
                  <div className="absolute top-2 right-2 flex flex-wrap items-center gap-1">
                    <span className="bg-black/60 text-white text-[9px] font-bold px-2 py-0.5 rounded backdrop-blur-xs">
                      {m.category || 'عيادة'}
                    </span>
                    {isInUse && (
                      <span
                        className="bg-blue-600/90 text-white text-[9px] font-bold px-1.5 py-0.5 rounded backdrop-blur-xs"
                        title={`مستخدمة في ${m.usages?.length || 1} موضع`}
                      >
                        نشطة بالموقع
                      </span>
                    )}
                  </div>

                  {/* Persistent indicator */}
                  <div className="absolute bottom-1.5 right-1.5">
                    <span className="bg-emerald-600/90 text-white text-[8px] font-semibold px-1 py-0.5 rounded backdrop-blur-xs flex items-center gap-0.5">
                      <CheckCircle2 className="w-2.5 h-2.5" />
                      دائم
                    </span>
                  </div>
                </div>

                <div className="p-3">
                  <h4 className="text-xs font-bold text-[#17354F] truncate" title={displayTitle}>
                    {displayTitle}
                  </h4>
                  <div className="flex items-center justify-between text-[10px] text-gray-400 mt-1">
                    <span>{new Date(displayDate).toLocaleDateString('ar-YE')}</span>
                    {m.fileSize && <span>{m.fileSize}</span>}
                  </div>

                  <div className="mt-2.5 pt-2 border-t border-[#E2EAF0] flex items-center justify-between gap-1">
                    {activeTab === 'trash' ? (
                      <>
                        <button
                          onClick={() => handleRestore(m.id)}
                          className="py-1 px-2 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-700 text-[11px] font-bold flex items-center gap-1 cursor-pointer"
                        >
                          <RotateCcw className="w-3 h-3" />
                          استعادة
                        </button>
                        <button
                          onClick={() => handlePermanentDelete(m.id, true)}
                          className="p-1 rounded-lg text-rose-600 hover:bg-rose-50 text-[11px] font-bold cursor-pointer"
                          title="حذف نهائي من القرص"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </>
                    ) : (
                      <>
                        {/* Copy Link Button */}
                        <button
                          onClick={() => handleCopy(m.id, m.url)}
                          className="p-1.5 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs flex items-center gap-1 cursor-pointer transition-colors"
                          title="نسخ رابط الملف المباشر"
                        >
                          {copiedId === m.id ? (
                            <Check className="w-3 h-3 text-emerald-600" />
                          ) : (
                            <Copy className="w-3 h-3" />
                          )}
                          <span className="text-[10px]">{copiedId === m.id ? 'تم' : 'نسخ'}</span>
                        </button>

                        {/* Replace Image Button (only for images) */}
                        {!m.isVideo && (
                          <button
                            onClick={() => triggerReplace(m.id)}
                            disabled={isReplacing && replacingMediaId === m.id}
                            className="p-1.5 rounded-lg bg-blue-50 hover:bg-blue-100 text-[#064B82] text-xs flex items-center gap-1 cursor-pointer transition-colors"
                            title="استبدال هذه الصورة بملف جديد وتحديث كافة المواضع"
                          >
                            <ArrowLeftRight className="w-3 h-3" />
                            <span className="text-[10px]">استبدال</span>
                          </button>
                        )}

                        {/* Edit metadata */}
                        <button
                          onClick={() => openEditModal(m)}
                          className="p-1.5 rounded-lg text-gray-600 hover:bg-gray-100 cursor-pointer"
                          title="تعديل العنوان والتصنيف"
                        >
                          <Edit2 className="w-3 h-3" />
                        </button>

                        {/* Delete / Move to Trash Button */}
                        <button
                          onClick={() => handleTrashRequest(m)}
                          className="p-1.5 rounded-lg text-rose-600 hover:bg-rose-50 cursor-pointer transition-colors"
                          title="نقل إلى سلة المحذوفات"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Preview Modal */}
      {previewItem && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl border border-[#E2EAF0] max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col animate-in fade-in zoom-in-95">
            <div className="p-4 border-b border-[#E2EAF0] flex items-center justify-between">
              <h3 className="text-sm font-bold text-[#064B82] truncate">
                {previewItem.title || previewItem.name}
              </h3>
              <button onClick={() => setPreviewItem(null)} className="p-1 text-gray-400 hover:text-gray-600 cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-4 overflow-y-auto space-y-4 text-right">
              <div className="rounded-xl overflow-hidden bg-slate-900 flex items-center justify-center max-h-80">
                {previewItem.isVideo ? (
                  <iframe
                    src={previewItem.url.replace('watch?v=', 'embed/')}
                    title={previewItem.title}
                    className="w-full aspect-video"
                    allowFullScreen
                  />
                ) : (
                  <img
                    src={previewItem.url}
                    alt={previewItem.title}
                    className="max-h-80 object-contain mx-auto"
                    referrerPolicy="no-referrer"
                    onError={(e) => {
                      (e.currentTarget as HTMLImageElement).src = FALLBACK_SVG;
                    }}
                  />
                )}
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs bg-[#F8FAFC] p-3 rounded-xl border border-[#E2EAF0]">
                <div>
                  <span className="text-[#667788] block">المعرّف الثابت:</span>
                  <code className="font-mono text-[11px] text-[#064B82]">{previewItem.id}</code>
                </div>
                <div>
                  <span className="text-[#667788] block">التصنيف:</span>
                  <span className="font-bold text-[#17354F]">{previewItem.category || 'عيادة'}</span>
                </div>
                <div>
                  <span className="text-[#667788] block">مسار التخزين الدائم:</span>
                  <code className="font-mono text-[11px] text-slate-700">{previewItem.storage_path || previewItem.url}</code>
                </div>
                <div>
                  <span className="text-[#667788] block">الحجم / النوع:</span>
                  <span className="font-bold text-[#17354F]">{previewItem.fileSize || '350 KB'} ({previewItem.fileType || 'image/jpeg'})</span>
                </div>
              </div>

              {previewItem.usages && previewItem.usages.length > 0 && (
                <div className="bg-blue-50/70 border border-blue-200 p-3 rounded-xl text-xs space-y-1">
                  <div className="font-bold text-[#064B82] flex items-center gap-1">
                    <Info className="w-3.5 h-3.5" />
                    مواضع استخدام هذا الملف في الموقع:
                  </div>
                  <ul className="list-disc list-inside text-slate-700 pr-2 space-y-0.5">
                    {previewItem.usages.map((u: string, idx: number) => (
                      <li key={idx}>{u}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            <div className="p-3 border-t border-[#E2EAF0] bg-slate-50 flex items-center justify-between">
              <button
                onClick={() => handleCopy(previewItem.id, previewItem.url)}
                className="py-1.5 px-3 bg-[#064B82] text-white text-xs font-bold rounded-xl flex items-center gap-1 cursor-pointer"
              >
                <Copy className="w-3.5 h-3.5" />
                نسخ الرابط المباشر
              </button>
              <button
                onClick={() => setPreviewItem(null)}
                className="py-1.5 px-3 bg-white border border-[#E2EAF0] text-gray-700 text-xs font-semibold rounded-xl cursor-pointer"
              >
                إغلاق
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Metadata Modal */}
      {editItem && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl border border-[#E2EAF0] max-w-md w-full p-5 space-y-4 animate-in fade-in zoom-in-95 text-right">
            <div className="flex items-center justify-between border-b border-[#E2EAF0] pb-3">
              <h3 className="text-sm font-bold text-[#064B82]">تعديل بيانات الملف</h3>
              <button onClick={() => setEditItem(null)} className="p-1 text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-[#17354F] mb-1">اسم أو وصف الملف *</label>
                <input
                  type="text"
                  required
                  value={editForm.title}
                  onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
                  className="w-full py-2 px-3 bg-[#F8FAFC] border border-[#E2EAF0] rounded-xl text-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#17354F] mb-1">التصنيف</label>
                <select
                  value={editForm.category}
                  onChange={(e) => setEditForm({ ...editForm, category: e.target.value })}
                  className="w-full py-2 px-3 bg-[#F8FAFC] border border-[#E2EAF0] rounded-xl text-xs"
                >
                  <option value="عيادة">مرافق العيادة</option>
                  <option value="طبيب">الطبيب</option>
                  <option value="أجهزة">أجهزة ومناظير</option>
                  <option value="مقالات">صور المقالات</option>
                  <option value="فيديوهات طبية">فيديوهات طبية</option>
                  <option value="عام">أخرى</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#17354F] mb-1">النص البديل (Alt Text) لمحركات البحث</label>
                <input
                  type="text"
                  value={editForm.altText}
                  onChange={(e) => setEditForm({ ...editForm, altText: e.target.value })}
                  className="w-full py-2 px-3 bg-[#F8FAFC] border border-[#E2EAF0] rounded-xl text-xs"
                />
              </div>

              <div className="pt-3 border-t border-[#E2EAF0] flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setEditItem(null)}
                  className="py-2 px-4 rounded-xl text-xs font-semibold text-gray-600 hover:bg-gray-100 cursor-pointer"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="py-2 px-4 rounded-xl bg-[#064B82] hover:bg-[#0B70B7] text-white text-xs font-bold cursor-pointer"
                >
                  حفظ التعديلات
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* In-Use Deletion Warning Modal */}
      {deleteModal.isOpen && deleteModal.item && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl border border-rose-200 max-w-md w-full p-5 space-y-4 animate-in fade-in zoom-in-95 text-right">
            <div className="flex items-center gap-3 border-b border-[#E2EAF0] pb-3 text-rose-600">
              <AlertTriangle className="w-6 h-6 flex-shrink-0" />
              <div>
                <h3 className="text-sm font-bold text-[#17354F]">تحذير: الملف قيد الاستخدام</h3>
                <p className="text-xs text-rose-600">هذا الملف مستخدم حالياً في صفحات أو مقالات حية</p>
              </div>
            </div>

            <div className="space-y-2 text-xs text-[#17354F]">
              <p>يستخدم ملف <strong>"{deleteModal.item.title || deleteModal.item.name}"</strong> في المواضع التالية:</p>
              <div className="bg-rose-50/70 border border-rose-100 rounded-xl p-3 max-h-36 overflow-y-auto space-y-1 text-slate-700">
                {deleteModal.usages.map((u, idx) => (
                  <div key={idx} className="flex items-center gap-1.5 text-[11px]">
                    <span className="w-1.5 h-1.5 rounded-full bg-rose-500"></span>
                    <span>{u}</span>
                  </div>
                ))}
              </div>
              <p className="text-[11px] text-gray-500">
                إذا قمت بحذفه، يمكنك استخدام خيار "استبدال" بدلاً من الحذف لتحديثه بملف جديد في كل المواضع بضغطة زر.
              </p>
            </div>

            <div className="pt-3 border-t border-[#E2EAF0] flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setDeleteModal({ isOpen: false, item: null, usages: [] })}
                className="py-2 px-4 rounded-xl text-xs font-semibold text-gray-600 hover:bg-gray-100 cursor-pointer"
              >
                إلغاء
              </button>
              <button
                type="button"
                onClick={() => handlePermanentDelete(deleteModal.item.id, true)}
                className="py-2 px-4 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold cursor-pointer"
              >
                تأكيد الحذف الإجباري
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Upload Modal */}
      {isUploadModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl border border-[#E2EAF0] max-w-md w-full p-5 space-y-4 animate-in fade-in zoom-in-95 text-right">
            <div className="flex items-center justify-between border-b border-[#E2EAF0] pb-3">
              <h3 className="text-sm font-bold text-[#064B82]">إضافة وسائط جديدة إلى المكتبة</h3>
              <button onClick={() => setIsUploadModalOpen(false)} className="p-1 text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex items-center gap-2 p-1 bg-slate-100 rounded-xl text-xs">
              <button
                type="button"
                onClick={() => setNewImage({ ...newImage, isVideo: false })}
                className={`flex-1 py-1.5 rounded-lg font-bold transition-colors cursor-pointer ${
                  !newImage.isVideo ? 'bg-white text-[#064B82] shadow-xs' : 'text-gray-600'
                }`}
              >
                صورة طبية
              </button>
              <button
                type="button"
                onClick={() => setNewImage({ ...newImage, isVideo: true, category: 'فيديوهات طبية' })}
                className={`flex-1 py-1.5 rounded-lg font-bold transition-colors cursor-pointer ${
                  newImage.isVideo ? 'bg-white text-emerald-700 shadow-xs' : 'text-gray-600'
                }`}
              >
                فيديو يوتيوب
              </button>
            </div>

            <form onSubmit={handleSaveImage} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-[#17354F] mb-1">عنوان أو وصف الملف *</label>
                <input
                  type="text"
                  required
                  value={newImage.title}
                  onChange={(e) => setNewImage({ ...newImage, title: e.target.value })}
                  placeholder={newImage.isVideo ? "مثال: إرشادات منظار القولون والتحضير السليم" : "مثال: وحدة مناظير الجهاز الهضمي المتقدمة"}
                  className="w-full py-2 px-3 bg-[#F8FAFC] border border-[#E2EAF0] rounded-xl text-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#17354F] mb-1">التصنيف</label>
                <select
                  value={newImage.category}
                  onChange={(e) => setNewImage({ ...newImage, category: e.target.value })}
                  className="w-full py-2 px-3 bg-[#F8FAFC] border border-[#E2EAF0] rounded-xl text-xs"
                >
                  <option value="عيادة">مرافق العيادة</option>
                  <option value="طبيب">الطبيب</option>
                  <option value="أجهزة">أجهزة ومناظير</option>
                  <option value="مقالات">صور المقالات</option>
                  <option value="فيديوهات طبية">فيديوهات طبية</option>
                  <option value="عام">أخرى</option>
                </select>
              </div>

              {newImage.isVideo ? (
                <>
                  <div>
                    <label className="block text-xs font-bold text-[#17354F] mb-1">رابط فيديو YouTube *</label>
                    <input
                      type="url"
                      required
                      value={newImage.youtubeUrl}
                      onChange={(e) => setNewImage({ ...newImage, youtubeUrl: e.target.value })}
                      placeholder="https://www.youtube.com/watch?v=..."
                      className="w-full py-2 px-3 bg-[#F8FAFC] border border-[#E2EAF0] rounded-xl text-xs font-mono"
                      dir="ltr"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-[#17354F] mb-1">المدة التقديرية (اختياري)</label>
                    <input
                      type="text"
                      value={newImage.duration}
                      onChange={(e) => setNewImage({ ...newImage, duration: e.target.value })}
                      placeholder="04:30"
                      className="w-full py-2 px-3 bg-[#F8FAFC] border border-[#E2EAF0] rounded-xl text-xs"
                    />
                  </div>
                </>
              ) : (
                <div>
                  <label className="block text-xs font-bold text-[#17354F] mb-1.5">رفع ملف الصورة من جهازك *</label>
                  {!newImage.url ? (
                    <label className="border-2 border-dashed border-blue-200 hover:border-[#064B82] bg-blue-50/50 hover:bg-blue-50/80 rounded-2xl p-6 text-center cursor-pointer transition-all flex flex-col items-center justify-center block">
                      <div className="w-12 h-12 rounded-xl bg-white text-[#064B82] shadow-xs flex items-center justify-center mb-2">
                        <Upload className="w-6 h-6" />
                      </div>
                      <span className="text-xs font-bold text-[#064B82]">اضغط لاختيار صورة من جهازك</span>
                      <span className="text-[10px] text-gray-500 mt-1">يدعم أسماء الملفات العربية والإنجليزية (PNG, JPG, WebP)</span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleFileUpload}
                        className="hidden"
                      />
                    </label>
                  ) : (
                    <div className="relative rounded-2xl border border-[#E2EAF0] overflow-hidden bg-slate-100 aspect-video flex items-center justify-center">
                      <img
                        src={newImage.url}
                        alt="Preview"
                        className="w-full h-full object-cover"
                        referrerPolicy="no-referrer"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedFile(null);
                          setNewImage((prev) => ({ ...prev, url: '' }));
                        }}
                        className="absolute top-2 left-2 p-1.5 bg-black/60 hover:bg-black/80 text-white rounded-lg transition-colors cursor-pointer"
                        title="إلغاء الصورة واختيار غيرها"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                </div>
              )}

              <div className="pt-3 border-t border-[#E2EAF0] flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsUploadModalOpen(false)}
                  className="py-2 px-4 rounded-xl text-xs font-semibold text-gray-600 hover:bg-gray-100 cursor-pointer"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="py-2 px-4 rounded-xl bg-[#064B82] hover:bg-[#0B70B7] text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-xs disabled:opacity-50"
                >
                  {isSubmitting && <RefreshCw className="w-3.5 h-3.5 animate-spin" />}
                  {isSubmitting ? 'جاري الحفظ بالتخزين الدائم...' : 'حفظ ونشر الوسائط'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

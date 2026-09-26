import { PROTECTED_SUPABASE_CLINIC_LOGO } from "../../constants/clinicAssets";
import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { ImageUploadField } from './ImageUploadField';
import {
  FileText,
  Plus,
  Edit,
  Trash2,
  Eye,
  EyeOff,
  ExternalLink,
  Search,
  CheckCircle2,
  XCircle,
  RefreshCw,
  Image as ImageIcon,
  Check,
  X,
  Sparkles,
  Link,
  Calendar,
  Layers,
  ArrowUpDown,
  BookOpen,
  Info,
} from 'lucide-react';

interface PagesManagerViewProps {
  showToast: (type: 'success' | 'error' | 'info', text: string) => void;
}

export const PagesManagerView: React.FC<PagesManagerViewProps> = ({ showToast }) => {
  const [pages, setPages] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPage, setEditingPage] = useState<any | null>(null);

  // Form State
  const [formData, setFormData] = useState({
    title: '',
    slug: '',
    content: '',
    excerpt: '',
    coverImage: '',
    metaTitle: '',
    metaDescription: '',
    keywordsText: '',
    showInHeader: false,
    showInFooter: true,
    order: 1,
    isActive: true,
  });

  const fetchPages = async () => {
    try {
      setIsLoading(true);
      const data = await api.getPages();
      setPages(data || []);
    } catch (err: any) {
      showToast('error', err.message || 'فشل تحميل الصفحات');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPages();
  }, []);

  const openCreateModal = () => {
    setEditingPage(null);
    setFormData({
      title: '',
      slug: '',
      content: '',
      excerpt: '',
      coverImage: PROTECTED_SUPABASE_CLINIC_LOGO,
      metaTitle: '',
      metaDescription: '',
      keywordsText: '',
      showInHeader: false,
      showInFooter: true,
      order: pages.length + 1,
      isActive: true,
    });
    setIsModalOpen(true);
  };

  const openEditModal = (page: any) => {
    setEditingPage(page);
    setFormData({
      title: page.title || '',
      slug: page.slug || '',
      content: page.content || '',
      excerpt: page.excerpt || '',
      coverImage: page.coverImage || '',
      metaTitle: page.metaTitle || '',
      metaDescription: page.metaDescription || '',
      keywordsText: Array.isArray(page.keywords) ? page.keywords.join(', ') : '',
      showInHeader: Boolean(page.showInHeader),
      showInFooter: page.showInFooter !== undefined ? Boolean(page.showInFooter) : true,
      order: page.order || 1,
      isActive: Boolean(page.isActive),
    });
    setIsModalOpen(true);
  };

  const handleTitleChange = (val: string) => {
    setFormData((prev) => {
      // Auto-generate slug if it was empty or matching old title
      const shouldAutoSlug = !editingPage && (!prev.slug || prev.slug === generateSlug(prev.title));
      return {
        ...prev,
        title: val,
        slug: shouldAutoSlug ? generateSlug(val) : prev.slug,
        metaTitle: prev.metaTitle || `${val} | عيادة د. عبدالباسط مقبل`,
      };
    });
  };

  const generateSlug = (text: string) => {
    return text
      .trim()
      .toLowerCase()
      .replace(/[^a-zA-Z0-9\u0600-\u06FF]+/g, '-')
      .replace(/^-+|-+$/g, '');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title || !formData.slug) {
      showToast('error', 'يرجى إدخال عنوان الصفحة والرابط المخصص');
      return;
    }

    const payload = {
      ...formData,
      keywords: formData.keywordsText
        .split(',')
        .map((k) => k.trim())
        .filter(Boolean),
    };

    try {
      if (editingPage) {
        await api.updatePage(editingPage.id, payload);
        showToast('success', 'تم تحديث الصفحة بنجاح');
      } else {
        await api.createPage(payload);
        showToast('success', 'تم إنشاء الصفحة الجديدة بنجاح');
      }
      setIsModalOpen(false);
      fetchPages();
    } catch (err: any) {
      showToast('error', err.message || 'فشل حفظ الصفحة');
    }
  };

  const handleDelete = async (id: string, title: string) => {
    if (!window.confirm(`هل أنت متأكد من حذف الصفحة: "${title}"؟`)) return;
    try {
      await api.deletePage(id);
      showToast('info', 'تم نقل الصفحة إلى سلة المحذوفات');
      fetchPages();
    } catch (err: any) {
      showToast('error', err.message || 'فشل حذف الصفحة');
    }
  };

  const handleToggleActive = async (page: any) => {
    try {
      await api.updatePage(page.id, { isActive: !page.isActive });
      showToast('success', page.isActive ? 'تم إخفاء الصفحة' : 'تم تفعيل الصفحة');
      fetchPages();
    } catch (err: any) {
      showToast('error', 'فشل تغيير حالة الصفحة');
    }
  };

  const filteredPages = pages.filter((p) =>
    (p.title || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
    (p.slug || '').toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Top Header Card */}
      <div className="bg-white p-5 rounded-2xl border border-[#E2EAF0] shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-blue-50 text-[#064B82]">
              <FileText className="w-5 h-5" />
            </span>
            <h2 className="text-base font-bold text-[#064B82]">إدارة الصفحات المخصصة والثابتة (CMS)</h2>
          </div>
          <p className="text-xs text-[#667788] mt-1">
            أنشئ وعدّل صفحات إضافية لموقع العيادة (مثل: تعليمات المنظار، حقوق المريض، اتفاقيات الخدمة) برابط مخصص وصور وSEO تلقائي
          </p>
        </div>

        <button
          onClick={openCreateModal}
          className="inline-flex items-center gap-2 py-2.5 px-5 bg-[#064B82] hover:bg-[#0B70B7] text-white text-xs font-bold rounded-xl shadow-xs transition-colors cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          إضافة صفحة جديدة
        </button>
      </div>

      {/* Search & Filter Bar */}
      <div className="flex items-center justify-between gap-3 bg-white p-3 rounded-xl border border-[#E2EAF0] shadow-xs">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-gray-400 absolute right-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="ابحث في عناوين الصفحات أو الروابط..."
            className="w-full py-2 pr-9 pl-3 bg-[#F8FAFC] border border-[#E2EAF0] rounded-xl text-xs"
          />
        </div>

        <div className="text-xs text-gray-500 font-medium">
          إجمالي الصفحات: <span className="font-bold text-[#064B82]">{pages.length}</span>
        </div>
      </div>

      {/* Pages List */}
      {isLoading ? (
        <div className="p-16 text-center text-gray-400 bg-white rounded-2xl border border-[#E2EAF0]">
          <RefreshCw className="w-6 h-6 animate-spin mx-auto text-[#064B82] mb-2" />
          جاري تحميل قائمة الصفحات...
        </div>
      ) : filteredPages.length === 0 ? (
        <div className="p-12 text-center bg-white rounded-2xl border border-dashed border-[#E2EAF0] space-y-3">
          <FileText className="w-10 h-10 mx-auto text-gray-300" />
          <h3 className="text-sm font-bold text-gray-700">لا توجد صفحات منشأة حاليًا</h3>
          <p className="text-xs text-gray-500 max-w-sm mx-auto">
            يمكنك بسهولة إضافة صفحات جديدة لتزويد المرضى بالتعليمات والإرشادات الطبية أو معلومات إضافية عن العيادة.
          </p>
          <button
            onClick={openCreateModal}
            className="inline-flex items-center gap-1.5 py-2 px-4 bg-[#064B82] text-white text-xs font-bold rounded-xl"
          >
            <Plus className="w-3.5 h-3.5" />
            إنشاء أول صفحة الآن
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredPages.map((page) => (
            <div
              key={page.id}
              className="bg-white rounded-2xl border border-[#E2EAF0] shadow-xs hover:shadow-sm transition-all p-5 flex flex-col justify-between space-y-4"
            >
              <div className="space-y-3">
                {/* Header */}
                <div className="flex items-start justify-between gap-2">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <h3 className="text-sm font-bold text-[#17354F]">{page.title}</h3>
                      {page.isActive ? (
                        <span className="inline-flex items-center gap-1 text-[10px] bg-emerald-50 text-emerald-700 font-bold px-2 py-0.5 rounded-full border border-emerald-200">
                          <CheckCircle2 className="w-3 h-3" /> نشطة
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[10px] bg-gray-100 text-gray-600 font-bold px-2 py-0.5 rounded-full border border-gray-200">
                          <XCircle className="w-3 h-3" /> معطلة
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-1 text-xs text-[#064B82] font-mono" dir="ltr">
                      <Link className="w-3 h-3 text-gray-400" />
                      <span>/page/{page.slug}</span>
                    </div>
                  </div>

                  {page.coverImage && (
                    <div className="w-14 h-14 rounded-xl bg-gray-100 overflow-hidden border border-[#E2EAF0] shrink-0">
                      <img
                        src={page.coverImage}
                        alt={page.title}
                        className="w-full h-full object-cover"
                        referrerPolicy="no-referrer"
                      />
                    </div>
                  )}
                </div>

                {/* Excerpt */}
                {page.excerpt && (
                  <p className="text-xs text-[#667788] line-clamp-2 leading-relaxed">
                    {page.excerpt}
                  </p>
                )}

                {/* Badges / Placements */}
                <div className="flex flex-wrap items-center gap-1.5 pt-1">
                  {page.showInHeader && (
                    <span className="text-[10px] bg-blue-50 text-[#064B82] font-bold px-2 py-0.5 rounded-md border border-blue-100">
                      تظهر في القائمة العلوية
                    </span>
                  )}
                  {page.showInFooter && (
                    <span className="text-[10px] bg-purple-50 text-purple-700 font-bold px-2 py-0.5 rounded-md border border-purple-100">
                      تظهر في ذيل الموقع (Footer)
                    </span>
                  )}
                  {page.keywords && page.keywords.length > 0 && (
                    <span className="text-[10px] bg-amber-50 text-amber-800 font-bold px-2 py-0.5 rounded-md border border-amber-200">
                      {page.keywords.length} كلمات دلالية SEO
                    </span>
                  )}
                </div>
              </div>

              {/* Actions */}
              <div className="pt-3 border-t border-[#E2EAF0] flex items-center justify-between gap-2">
                <a
                  href={`/page/${page.slug}`}
                  target="_blank"
                  rel="noreferrer"
                  className="text-xs text-gray-600 hover:text-[#064B82] flex items-center gap-1 font-medium"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  معاينة الصفحة
                </a>

                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => handleToggleActive(page)}
                    className="p-1.5 rounded-lg text-gray-500 hover:bg-gray-100 cursor-pointer"
                    title={page.isActive ? 'إخفاء الصفحة' : 'تفعيل الصفحة'}
                  >
                    {page.isActive ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4 text-gray-400" />}
                  </button>
                  <button
                    onClick={() => openEditModal(page)}
                    className="p-1.5 rounded-lg text-blue-600 hover:bg-blue-50 cursor-pointer"
                    title="تعديل الصفحة"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(page.id, page.title)}
                    className="p-1.5 rounded-lg text-rose-600 hover:bg-rose-50 cursor-pointer"
                    title="حذف الصفحة"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create / Edit Page Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5 text-right" dir="rtl">
          <div className="bg-white rounded-2xl shadow-2xl border border-[#E2EAF0] max-w-3xl w-full flex flex-col max-h-[92vh] overflow-hidden animate-in fade-in zoom-in-95">
            {/* Modal Header */}
            <div className="p-4 border-b border-[#E2EAF0] flex items-center justify-between bg-gradient-to-l from-slate-50 to-white">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-blue-50 text-[#064B82] flex items-center justify-center font-bold">
                  <FileText className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-[#064B82]">
                    {editingPage ? 'تعديل الصفحة' : 'إنشاء صفحة جديدة'}
                  </h3>
                  <p className="text-[11px] text-gray-500">
                    أدخل محتوى الصفحة وتنسيقها وإعدادات الـ SEO والصور المصاحبة
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <form onSubmit={handleSubmit} className="p-5 space-y-4 overflow-y-auto flex-1 text-xs">
              {/* Title & Slug */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-[#17354F] mb-1">
                    عنوان الصفحة *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.title}
                    onChange={(e) => handleTitleChange(e.target.value)}
                    placeholder="مثال: تعليمات تحضير منظار المعدة"
                    className="w-full py-2 px-3 bg-[#F8FAFC] border border-[#E2EAF0] rounded-xl font-medium"
                  />
                </div>

                <div>
                  <label className="block font-bold text-[#17354F] mb-1">
                    الرابط المخصص (Slug) *
                  </label>
                  <div className="flex items-center bg-[#F8FAFC] border border-[#E2EAF0] rounded-xl overflow-hidden" dir="ltr">
                    <span className="px-2 text-gray-400 bg-gray-100 border-r border-[#E2EAF0] text-[11px] py-2">
                      /page/
                    </span>
                    <input
                      type="text"
                      required
                      value={formData.slug}
                      onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                      placeholder="endoscopy-prep"
                      className="w-full py-2 px-2 bg-transparent text-xs outline-hidden"
                    />
                  </div>
                </div>
              </div>

              {/* Cover Image with Direct Upload */}
              <div>
                <ImageUploadField
                  label="صورة الغلاف / البانر للصفحة"
                  sublabel="رفع مباشر من جهازك أو اختيار من وسائط العيادة"
                  value={formData.coverImage}
                  onChange={(url) => setFormData({ ...formData, coverImage: url })}
                  onRemove={() => setFormData({ ...formData, coverImage: '' })}
                  category="عام"
                  aspectRatio="wide"
                />
              </div>

              {/* Excerpt */}
              <div>
                <label className="block font-bold text-[#17354F] mb-1">
                  نبذة ملخصة (مقدمة الصفحة)
                </label>
                <textarea
                  rows={2}
                  value={formData.excerpt}
                  onChange={(e) => setFormData({ ...formData, excerpt: e.target.value })}
                  placeholder="موجز سريع يظهر في بداية الصفحة وبطاقات المشاركة..."
                  className="w-full py-2 px-3 bg-[#F8FAFC] border border-[#E2EAF0] rounded-xl"
                />
              </div>

              {/* Main Content (Markdown/Text) */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="font-bold text-[#17354F]">
                    المحتوى الرئيسي للصفحة (يدعم التنسيق والعناوين والنقاط) *
                  </label>
                  <span className="text-[10px] text-gray-400">
                    يمكن استخدام Markdown (# للعناوين، * للنقاط)
                  </span>
                </div>
                <textarea
                  rows={9}
                  required
                  value={formData.content}
                  onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                  placeholder={`اكتب محتوى الصفحة هنا... مثال:
## تعليمات هامة للمريض
1. الحضور قبل الموعد بنصف ساعة
2. إحضار كافة الفحوصات والتحاليل السابقة`}
                  className="w-full py-2.5 px-3 bg-[#F8FAFC] border border-[#E2EAF0] rounded-xl font-mono text-xs leading-relaxed"
                />
              </div>

              {/* SEO Section */}
              <div className="bg-blue-50/40 p-3.5 rounded-xl border border-blue-100 space-y-3">
                <div className="flex items-center gap-1.5 font-bold text-[#064B82]">
                  <Sparkles className="w-3.5 h-3.5" />
                  تهيئة الصفحة لمحركات البحث (SEO & Meta Tags)
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-gray-700 mb-1">
                      عنوان محرك البحث (Meta Title)
                    </label>
                    <input
                      type="text"
                      value={formData.metaTitle}
                      onChange={(e) => setFormData({ ...formData, metaTitle: e.target.value })}
                      placeholder="عنوان يظهر في جوجل..."
                      className="w-full py-1.5 px-3 bg-white border border-[#E2EAF0] rounded-lg text-xs"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-gray-700 mb-1">
                      الكلمات الافتتاحية والمفتاحية (SEO Keywords)
                    </label>
                    <input
                      type="text"
                      value={formData.keywordsText}
                      onChange={(e) => setFormData({ ...formData, keywordsText: e.target.value })}
                      placeholder="افصل بينها بفواصل: منظار معدة، تحضير، صنعاء"
                      className="w-full py-1.5 px-3 bg-white border border-[#E2EAF0] rounded-lg text-xs"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-gray-700 mb-1">
                    وصف محرك البحث (Meta Description)
                  </label>
                  <input
                    type="text"
                    value={formData.metaDescription}
                    onChange={(e) => setFormData({ ...formData, metaDescription: e.target.value })}
                    placeholder="وصف مختصر ومغري للظهور في نتائج بحث جوجل..."
                    className="w-full py-1.5 px-3 bg-white border border-[#E2EAF0] rounded-lg text-xs"
                  />
                </div>
              </div>

              {/* Placement & Visibility Options */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
                <label className="flex items-center gap-2 p-2.5 rounded-xl border border-[#E2EAF0] bg-gray-50 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.showInHeader}
                    onChange={(e) => setFormData({ ...formData, showInHeader: e.target.checked })}
                    className="rounded text-[#064B82] focus:ring-[#064B82]"
                  />
                  <span className="text-xs font-semibold text-gray-700">إظهار بالقائمة العلوية</span>
                </label>

                <label className="flex items-center gap-2 p-2.5 rounded-xl border border-[#E2EAF0] bg-gray-50 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.showInFooter}
                    onChange={(e) => setFormData({ ...formData, showInFooter: e.target.checked })}
                    className="rounded text-[#064B82] focus:ring-[#064B82]"
                  />
                  <span className="text-xs font-semibold text-gray-700">إظهار في أسفل الموقع (Footer)</span>
                </label>

                <label className="flex items-center gap-2 p-2.5 rounded-xl border border-[#E2EAF0] bg-gray-50 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.isActive}
                    onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                    className="rounded text-[#064B82] focus:ring-[#064B82]"
                  />
                  <span className="text-xs font-semibold text-gray-700">تفعيل ونشر الصفحة</span>
                </label>
              </div>

              {/* Submit Buttons */}
              <div className="pt-4 border-t border-[#E2EAF0] flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="py-2 px-4 rounded-xl text-xs font-semibold text-gray-600 hover:bg-gray-100"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="py-2 px-6 rounded-xl bg-[#064B82] hover:bg-[#0B70B7] text-white text-xs font-bold cursor-pointer shadow-xs"
                >
                  {editingPage ? 'حفظ التعديلات' : 'نشر الصفحة الآن'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
